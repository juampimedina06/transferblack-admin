import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Hash, Link as LinkIcon, Loader2 } from 'lucide-react';
import type { AdminPayoutItem, AdminResolvePayoutPayload } from '../../../core/payouts/interfaces/payout.interface';

interface PayoutResolveModalProps {
  payout: AdminPayoutItem | null;
  mode: 'paid' | 'rejected' | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: AdminResolvePayoutPayload) => Promise<void>;
  isLoading: boolean;
}

const COMMON_REJECTION_REASONS = [
  'El CBU/CVU no coincide con el CUIT del titular informado',
  'Cuenta bancaria bloqueada o rechazada por la entidad receptora',
  'Datos de transferencia incorrectos o alias inexistente',
  'Solicitud duplicada o regularización administrativa requerida',
];

export const PayoutResolveModal: React.FC<PayoutResolveModalProps> = ({
  payout,
  mode,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}) => {
  const [transferReference, setTransferReference] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset local state al abrir o cambiar de modo
  React.useEffect(() => {
    if (isOpen) {
      setTransferReference('');
      setReceiptUrl('');
      setRejectionReason('');
      setErrorMessage(null);
    }
  }, [isOpen, mode]);

  if (!isOpen || !payout || !mode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'paid') {
      const trimmedRef = transferReference.trim();
      if (!trimmedRef) {
        setErrorMessage('El número de comprobante o referencia es obligatorio');
        return;
      }
      if (trimmedRef.length > 200) {
        setErrorMessage('La referencia no puede superar los 200 caracteres');
        return;
      }
      const trimmedUrl = receiptUrl.trim();
      if (trimmedUrl && !/^https?:\/\/.+/i.test(trimmedUrl)) {
        setErrorMessage('La URL del comprobante debe ser un link válido (iniciar con http:// o https://)');
        return;
      }

      await onConfirm({
        status: 'paid',
        transfer_reference: trimmedRef,
        ...(trimmedUrl ? { receipt_url: trimmedUrl } : {}),
      });
    } else if (mode === 'rejected') {
      const trimmedReason = rejectionReason.trim();
      if (!trimmedReason) {
        setErrorMessage('El motivo de rechazo es obligatorio para informarle al conductor');
        return;
      }
      if (trimmedReason.length > 500) {
        setErrorMessage('El motivo de rechazo no puede superar los 500 caracteres');
        return;
      }

      await onConfirm({
        status: 'rejected',
        rejection_reason: trimmedReason,
      });
    }
  };

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: payout.currency || 'ARS',
  }).format(parseFloat(payout.amount) || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                mode === 'paid'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {mode === 'paid' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {mode === 'paid' ? 'Confirmar Pago de Retiro' : 'Rechazar Solicitud de Retiro'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {payout.account_holder_name || 'Conductor'} • {formattedAmount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-lg">
              {errorMessage}
            </div>
          )}

          {mode === 'paid' ? (
            <>
              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-dark-border text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">CBU Destino:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {payout.destination_cbu_cvu || '-'}
                  </span>
                </div>
                {payout.destination_alias && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Alias:</span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      {payout.destination_alias}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Código de Operación / Comprobante de Transferencia{' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ej: TR-8912389 o 20261003-8821"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    maxLength={200}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all"
                  />
                </div>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 block">
                  Identificador emitido por tu banco al transferir.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Link / URL del comprobante adjunto{' '}
                  <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    placeholder="https://storage.transferblack.com/receipts/proof.pdf"
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    maxLength={1000}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Motivo del Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalla claramente por qué se rechaza para que el conductor pueda corregir el problema..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={500}
                  className="w-full p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                  <span>Este motivo será visible para el conductor.</span>
                  <span>{rejectionReason.length} / 500</span>
                </div>
              </div>

              {/* Sugerencias Rápidas de Motivos */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                  Motivos frecuentes (clic para autocompletar):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_REJECTION_REASONS.map((reason, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setRejectionReason(reason)}
                      className="px-2.5 py-1 text-xs rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors text-left"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-dark-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 ${
                mode === 'paid'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
              } disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {mode === 'paid' ? 'Confirmar Pago Realizado' : 'Rechazar Solicitud'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
