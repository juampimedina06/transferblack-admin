export const TAX_ID_TYPES = ['CUIT', 'RUT'] as const;

export type TaxIdType = (typeof TAX_ID_TYPES)[number];

/**
 * Deja el identificador fiscal en su forma canonica (solo digitos, y la `K`
 * final del RUT chileno) para validar el digito verificador. Asi
 * `30-71234567-8` y `30712345678` se validan igual.
 *
 * Debe reflejar exactamente `normalizeTaxId`/`isValidTaxId` del backend
 * (backend `src/modules/corporate/services/tax-id.ts`): si se desalinean, un
 * CUIT/RUT que el formulario deja pasar puede rebotar igual al confirmar, o
 * al reves.
 */
export function normalizeTaxId(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function isValidTaxId(type: TaxIdType, rawValue: string): boolean {
  const value = normalizeTaxId(rawValue);
  return type === 'CUIT' ? isValidCuit(value) : isValidRut(value);
}

/** CUIT/CUIL argentino: 11 digitos, el ultimo es el verificador por modulo 11. */
function isValidCuit(value: string): boolean {
  if (!/^\d{11}$/.test(value)) {
    return false;
  }

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const digits = value.split('').map(Number);

  const sum = weights.reduce((total, weight, index) => total + weight * (digits[index] ?? 0), 0);
  const remainder = 11 - (sum % 11);

  const checkDigit = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;

  return checkDigit === digits[10];
}

/**
 * RUT chileno: 7 u 8 digitos mas el verificador, que puede ser `K`. Modulo 11
 * con multiplicadores 2..7 ciclicos, de derecha a izquierda.
 */
function isValidRut(value: string): boolean {
  if (!/^\d{7,8}[0-9K]$/.test(value)) {
    return false;
  }

  const body = value.slice(0, -1);
  const providedCheckDigit = value.slice(-1);

  let sum = 0;
  let multiplier = 2;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);

  return expected === providedCheckDigit;
}
