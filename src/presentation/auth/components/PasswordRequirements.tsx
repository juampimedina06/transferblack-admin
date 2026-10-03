import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirementsProps {
  password: string;
  confirmPassword?: string;
  showMatchCheck?: boolean;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  confirmPassword,
  showMatchCheck = false,
}) => {
  const requirements = [
    {
      id: 'length',
      label: 'Mínimo 8 caracteres',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'Al menos una letra mayúscula (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Al menos una letra minúscula (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Al menos un número (0-9)',
      met: /[0-9]/.test(password),
    },
  ];

  const passwordsMatch =
    Boolean(confirmPassword) && password === confirmPassword;

  return (
    <div className="p-3.5 bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200 dark:border-dark-border rounded-xl space-y-2 text-xs">
      <span className="font-semibold text-gray-700 dark:text-gray-300 block">
        Requisitos de seguridad:
      </span>
      <ul className="space-y-1.5">
        {requirements.map((req) => (
          <li key={req.id} className="flex items-center gap-2">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                req.met
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-400'
              }`}
            >
              {req.met ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
              )}
            </span>
            <span
              className={`transition-colors ${
                req.met
                  ? 'text-gray-900 dark:text-gray-200 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {req.label}
            </span>
          </li>
        ))}

        {showMatchCheck && confirmPassword !== undefined && (
          <li className="flex items-center gap-2 pt-1 border-t border-gray-200/60 dark:border-dark-border/60">
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                passwordsMatch
                  ? 'bg-emerald-500 text-white'
                  : confirmPassword.length > 0
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-white/10 text-gray-400'
              }`}
            >
              {passwordsMatch ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : confirmPassword.length > 0 ? (
                <X className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
              )}
            </span>
            <span
              className={`transition-colors ${
                passwordsMatch
                  ? 'text-gray-900 dark:text-gray-200 font-medium'
                  : confirmPassword.length > 0
                  ? 'text-red-600 dark:text-red-400 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {passwordsMatch
                ? 'Las contraseñas coinciden'
                : confirmPassword.length > 0
                ? 'Las contraseñas no coinciden'
                : 'Confirmar coincidencia de contraseña'}
            </span>
          </li>
        )}
      </ul>
    </div>
  );
};
