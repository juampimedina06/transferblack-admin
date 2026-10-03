import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  length?: number;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  length = 6,
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Array de dígitos a partir del string value
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    // Foco en el primer input vacío al montar o renderizar
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex;
    if (inputsRef.current[targetIndex] && !disabled) {
      inputsRef.current[targetIndex]?.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const rawVal = e.target.value;
    // Tomamos sólo dígitos numéricos
    const numericChar = rawVal.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = numericChar;
    const newValue = newDigits.join('');
    onChange(newValue);

    if (numericChar && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Si la casilla actual está vacía, retroceder y borrar la anterior
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputsRef.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    const cleanNumbers = pastedData.replace(/\D/g, '').slice(0, length);

    if (!cleanNumbers) return;

    onChange(cleanNumbers);

    // Mover foco al siguiente input disponible o al último
    const nextIndex = Math.min(cleanNumbers.length, length - 1);
    inputsRef.current[nextIndex]?.focus();

    if (cleanNumbers.length === length && onComplete) {
      onComplete(cleanNumbers);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full max-w-sm mx-auto">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-xl border bg-white dark:bg-dark-surface transition-all duration-200 shadow-sm focus:outline-none ${
            digit
              ? 'border-champagne-gold text-gray-900 dark:text-white bg-champagne-gold/5'
              : 'border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300'
          } focus:ring-2 focus:ring-champagne-gold/40 focus:border-champagne-gold disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};
