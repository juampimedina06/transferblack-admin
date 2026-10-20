import React, { useState } from 'react';
import { X, Zap, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { useRunWeeklyBatch } from '../hooks/useRunWeeklyBatch';
import { extractApiErrorMessage } from '../../../core/api/adminApi';

interface RunWeeklyBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessMessage: (msg: string) => void;
}

export const RunWeeklyBatchModal: React.FC<RunWeeklyBatchModalProps> = ({
  isOpen,
  onClose,
  onSuccessMessage,
}) => {
  const [force, setForce] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runBatchMutation = useRunWeeklyBatch();

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setErrorMessage(null);
    try {
      const res = await runBatchMutation.mutateAsync({ force });
      const processedCount = res.data?.processed ?? 0;
      const successText = res.message || `Lote semanal ejecutado exitosamente. Se procesaron ${processedCount} retiros.`;
      onSuccessMessage(successText);
      onClose();
    } catch (err) {
      const msg = extractApiErrorMessage(
        err,
        'Ocurrió un error al forzar la ejecución del lote semanal.'
      );
      setErrorMessage(msg);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Ejecutar Lote Semanal
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Disparo manual para liquidaciones acumuladas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={runBatchMutation.isPending}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aviso de Auditoría Bancaria</p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Esta acción forzará la corrida del lote programado para todos los conductores con retiros semanales pendientes. Los retiros semanales no devengan comisión bancaria ($0 fee).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-dark-border rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Tipo de retiro alcanzado:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                Semanal Automático
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Comisión aplicada:
              </span>
              <span className="font-mono text-gray-900 dark:text-white font-bold">
                $ 0,00 (Gratis)
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 dark:border-dark-border">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Forzar ejecución inmediata:
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={force}
                  onChange={(e) => setForce(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-champagne-gold"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>La corrida quedará registrada con tu usuario administrador.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            disabled={runBatchMutation.isPending}
            className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={runBatchMutation.isPending}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-champagne-gold text-obsidian hover:bg-champagne-gold/90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {runBatchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ejecutando lote...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Confirmar y Ejecutar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
