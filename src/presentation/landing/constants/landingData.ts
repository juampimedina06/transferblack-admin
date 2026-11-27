export interface WhatsAppLine {
  id: string;
  label: string;
  displayPhone: string;
  number: string;
}

export const WHATSAPP_LINES: readonly WhatsAppLine[] = [
  {
    id: 'line-1',
    label: 'Línea 1 · Central Operaciones',
    displayPhone: '351 926-0326',
    number: '5493519260326',
  },
  {
    id: 'line-2',
    label: 'Línea 2 · Reservas y Empresas',
    displayPhone: '351 590-1798',
    number: '5493515901798',
  },
] as const;

export const APP_DOWNLOAD_LINKS = {
  passengerAndroidUrl: 'https://play.google.com/store/apps',
  passengerIosUrl: 'https://apps.apple.com/ar',
  driverAndroidUrl: 'https://play.google.com/store/apps',
  driverIosUrl: 'https://apps.apple.com/ar',
  qrTargetUrl: 'https://transferblack.com.ar/#descargar-app',
} as const;

export interface PresetCorridor {
  id: string;
  label: string;
  origin: string;
  destination: string;
  km: number;
  minutes: number;
}

export const CORDOBA_PRESET_CORRIDORS: readonly PresetCorridor[] = [
  {
    id: 'aeropuerto',
    label: 'Centro → Aeropuerto Taravella',
    origin: 'Plaza San Martín, Centro',
    destination: 'Aeropuerto Ing. Ambrosio Taravella',
    km: 13.5,
    minutes: 26,
  },
  {
    id: 'ciudad-empresaria',
    label: 'Nueva Córdoba → Ciudad Empresaria',
    origin: 'Av. Hipólito Yrigoyen 300, Nueva Córdoba',
    destination: 'Ciudad Empresaria, Av. La Voz del Interior 7000',
    km: 12.2,
    minutes: 24,
  },
  {
    id: 'cerro',
    label: 'Cerro de las Rosas → Patio Olmos',
    origin: 'Av. Rafael Núñez 4200, Cerro de las Rosas',
    destination: 'Patio Olmos, Av. Vélez Sarsfield 361',
    km: 8.4,
    minutes: 18,
  },
  {
    id: 'terminal',
    label: 'Villa Belgrano → Terminal de Ómnibus',
    origin: 'Av. Gauss 5500, Villa Belgrano',
    destination: 'Terminal de Ómnibus T1/T2, Bv. Perón 380',
    km: 11.8,
    minutes: 23,
  },
] as const;

// Parámetros reales sembrados en service-types.seeder.ts (fracción 110 m, ficha diurna $150, nocturna $175)
export const TARIFF_REFERENCE = {
  distanceFractionMeters: 110,
  daytimeFractionFare: 150,
  nighttimeFractionFare: 175,
} as const;

export type SpecialServiceId = 'reservation' | 'tow' | 'bus' | 'freight';

export interface SpecialServiceOption {
  id: SpecialServiceId;
  name: string;
  shortDesc: string;
  tag: string;
}

export const SPECIAL_SERVICES: readonly SpecialServiceOption[] = [
  {
    id: 'reservation',
    name: 'Viaje Reservado',
    shortDesc: 'Traslado programado al aeropuerto, eventos o reuniones con chofer asignado.',
    tag: 'Reserva anticipada',
  },
  {
    id: 'tow',
    name: 'Grúa y Auxilio',
    shortDesc: 'Asistencia y traslado vehicular coordinado directamente con nuestra mesa operativa.',
    tag: 'Auxilio 24/7',
  },
  {
    id: 'bus',
    name: 'Colectivo y Grupos',
    shortDesc: 'Unidades para contingentes, eventos corporativos, congresos y traslados grupales.',
    tag: 'Contingentes',
  },
  {
    id: 'freight',
    name: 'Flete y Logística',
    shortDesc: 'Transporte seguro de cargas, equipamiento empresarial o mudanzas puntuales.',
    tag: 'Logística',
  },
] as const;

export interface SafetyRequirementItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  detail: string;
  isHighlight?: boolean;
}

export const SAFETY_SEVEN_POINTS: readonly SafetyRequirementItem[] = [
  {
    id: 'dni',
    number: '01',
    title: 'Identidad Validada (DNI)',
    subtitle: 'Frente y dorso verificados',
    detail: 'Contraste manual de identidad y domicilio real en Córdoba antes de habilitar el legajo.',
  },
  {
    id: 'license',
    number: '02',
    title: 'Licencia Profesional Clase D1',
    subtitle: 'Habilitación para transporte de pasajeros',
    detail: 'Solo conductores con categoría profesional vigente y control automático de fecha de vencimiento.',
  },
  {
    id: 'insurance',
    number: '03',
    title: 'Póliza de Seguro para Transportados',
    subtitle: 'Cobertura integral verificada',
    detail: 'Validación mensual de póliza activa con cobertura específica para pasajeros y terceros.',
  },
  {
    id: 'criminal-national',
    number: '04',
    title: 'Antecedentes Penales (Nacional y Provincial)',
    subtitle: 'Doble certificación oficial',
    detail: 'Exigimos tanto el certificado del Registro Nacional de Reincidencia como el de la Policía de Córdoba.',
  },
  {
    id: 'sex-offenses',
    number: '05',
    title: 'Registro de Ofensores Sexuales',
    subtitle: 'Certificado negativo obligatorio',
    detail: 'Verificación excluyente en el registro provincial para máxima tranquilidad de cada familia y empresa.',
  },
  {
    id: 'itv',
    number: '06',
    title: 'ITV / RTO y Título Automotor',
    subtitle: 'Inspección técnica al día',
    detail: 'Control mecánico aprobado y verificación de titularidad o autorización legal del vehículo.',
  },
  {
    id: 'in-person-meeting',
    number: '07',
    title: 'Entrevista Presencial Obligatoria',
    subtitle: 'En nuestra oficina de Córdoba',
    detail: 'Ningún conductor se activa solo por subir fotos: nuestro equipo entrevista en persona a cada postulante antes de aprobar su cuenta.',
    isHighlight: true,
  },
] as const;

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const LANDING_FAQS: readonly FaqItem[] = [
  {
    id: 'tarifa',
    question: '¿Cómo se calcula la tarifa y qué medios de pago aceptan?',
    answer:
      'Antes de confirmar tu viaje conocés la tarifa estimada según la distancia por fracciones de 110 metros y la franja horaria (tarifa diurna de 06:00 a 22:00 h y nocturna de 22:00 a 06:00 h). Podés abonar con Mercado Pago, en efectivo al conductor o con el saldo de tu empresa activando el Modo Empresa.',
  },
  {
    id: 'invitado',
    question: '¿Puedo pedir un auto para otra persona que no tiene la aplicación instalada?',
    answer:
      'Sí. Con la función de viaje para terceros ("Modo Invitado") solicitás el traslado desde tu cuenta, cargás el nombre del pasajero y le compartís un enlace público (/track) por WhatsApp para que siga el vehículo en vivo desde cualquier navegador.',
  },
  {
    id: 'empresas',
    question: '¿Cómo funciona Transfer Black Empresas y el PIN corporativo?',
    answer:
      'La empresa da de alta su cuenta corporativa con centros de costo, límites por colaborador y saldo prepago o cuenta corriente. Cada empleado ingresa por única vez su PIN corporativo en la app de pasajero y selecciona "Modo Empresa" al viajar, sin adelantar dinero ni juntar comprobantes en papel.',
  },
  {
    id: 'reembolso',
    question: '¿Qué pasa si pago con Mercado Pago y necesito cancelar el viaje?',
    answer:
      'Si cancelás dentro de los primeros 5 minutos desde la confirmación y antes de que el conductor llegue al punto de encuentro, el reembolso en Mercado Pago se procesa de forma 100 % automática. Para reservas programadas o casos posteriores, nuestro equipo de soporte gestiona el reclamo desde el panel.',
  },
  {
    id: 'conductores-comision',
    question: 'Soy conductor: ¿cómo veo mis ganancias y cuándo cobro?',
    answer:
      'Al finalizar cada viaje la aplicación muestra con total transparencia la tarifa abonada por el pasajero, la comisión exacta que retiene la empresa y tu ganancia neta. Contás con liquidación semanal automática sin costo o retiros inmediatos a tu CBU, CVU o Alias.',
  },
] as const;

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
