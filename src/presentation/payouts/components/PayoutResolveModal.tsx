import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Hash,
  Link as LinkIcon,
  Loader2,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import type {
  AdminPayoutItem,
  AdminResolvePayoutPayload,
} from '../../../core/payouts/interfaces/payout.interface';

interface PayoutResolveModalProps {
  payout: AdminPayoutItem | null;
  mode: 'completed' | 'failed' | 'paid' | 'rejected' | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: AdminResolvePayoutPayload) => Promise<void>;
  isLoading: boolean;
}

const COMMON_REJECTION_REASONS = [
  'El CBU/CVU no coincide con el CUIT/DNI del titular informado',
  'Cuenta bancaria bloqueada o rechazada por la entidad receptora',
  'Datos de transferencia incorrectos o alias bancario inexistente',
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Reset local state al abrir o cambiar de modo
  React.useEffect(() => {
    if (isOpen) {
      setTransferReference('');
      setReceiptUrl('');
      setRejectionReason('');
      setErrorMessage(null);
      setCopiedKey(null);
      setFileName(null);
    }
  }, [isOpen, mode]);

  if (!isOpen || !payout || !mode) return null;

  const isCompletedMode = mode === 'completed' || mode === 'paid';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de peso máximo (ej. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('El comprobante no debe superar los 5MB');
      return;
    }

    setFileName(file.name);
    // Leemos el archivo a Data URL como comprobante en base64
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isCompletedMode) {
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
      if (
        trimmedUrl &&
        !trimmedUrl.startsWith('data:') &&
        !/^https?:\/\/.+/i.test(trimmedUrl)
      ) {
        setErrorMessage('La URL del comprobante debe ser un link válido (http:// o https://)');
        return;
      }

      await onConfirm({
        status: 'completed',
        transfer_reference: trimmedRef,
        ...(trimmedUrl ? { receipt_url: trimmedUrl } : {}),
      });
    } else {
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
        status: 'failed',
        rejection_reason: trimmedReason,
      });
    }
  };

  // Cálculos de montos
  const grossAmount = parseFloat(String(payout.amount)) || 0;
  const feeAmount = payout.fee_amount !== undefined && payout.fee_amount !== null
    ? parseFloat(String(payout.fee_amount)) || 0
    : (payout.type === 'immediate' ? 500 : 0);
  const netAmount = payout.net_amount !== undefined && payout.net_amount !== null
    ? parseFloat(String(payout.net_amount)) || 0
    : grossAmount - feeAmount;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: payout.currency || 'ARS',
      minimumFractionDigits: 2,
    }).format(val);

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
                isCompletedMode
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isCompletedMode ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {isCompletedMode ? 'Marcar como Transferido / Completado' : 'Rechazar Solicitud de Retiro'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {payout.account_holder_name || 'Conductor'} • {payout.type === 'weekly' ? 'Retiro Semanal' : 'Retiro Inmediato'}
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

        {/* Resumen Destacado de Montos a Transferir */}
        <div className="p-4 bg-gray-50/80 dark:bg-white/[0.02] border-b border-gray-100 dark:border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Monto Neto a Transferir (Manual)
              </span>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-white font-mono mt-0.5 text-emerald-600 dark:text-emerald-400">
                {formatMoney(netAmount)}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:items-end gap-0.5">
              <span>Bruto pedido: <b className="text-gray-800 dark:text-gray-200 font-mono">{formatMoney(grossAmount)}</b></span>
              <span>Comisión retenida: <b className="text-gray-800 dark:text-gray-200 font-mono">{formatMoney(feeAmount)}</b></span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800/40 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Datos bancarios con copiado rápido */}
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-dark-border text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Titular y DNI:</span>
              <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                <span>{payout.account_holder_name || 'Conductor'} ({payout.account_holder_document || '-'})</span>
                {payout.account_holder_document && (
                  <button
                    type="button"
                    onClick={() => handleCopy(payout.account_holder_document!, 'dni')}
                    className="p-1 text-gray-400 hover:text-champagne-gold transition-colors"
                    title="Copiar DNI/CUIT"
                  >
                    {copiedKey === 'dni' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">CBU / CVU:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-gray-800 dark:text-gray-200">
                <span>{payout.destination_cbu_cvu || '-'}</span>
                {payout.destination_cbu_cvu && (
                  <button
                    type="button"
                    onClick={() => handleCopy(payout.destination_cbu_cvu!, 'cbu')}
                    className="p-1 text-gray-400 hover:text-champagne-gold transition-colors"
                    title="Copiar CBU/CVU"
                  >
                    {copiedKey === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {payout.destination_alias && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Alias Bancario:</span>
                <div className="flex items-center gap-1.5 font-mono text-gray-800 dark:text-gray-200">
                  <span>{payout.destination_alias}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(payout.destination_alias!, 'alias')}
                    className="p-1 text-gray-400 hover:text-champagne-gold transition-colors"
                    title="Copiar Alias"
                  >
                    {copiedKey === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {isCompletedMode ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Número de Comprobante / Referencia Bancaria{' '}
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
                  Identificador emitido por la banca empresa al realizar la transferencia manual.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Comprobante Bancario Adjunto <span className="text-gray-400 font-normal">(Opcional)</span>
                </label>

                {/* Subir archivo o pegar URL */}
                <div className="space-y-2">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="Pegar link: https://storage.transferblack.com/receipts/proof.pdf"
                      value={receiptUrl.startsWith('data:') ? '' : receiptUrl}
                      onChange={(e) => {
                        setReceiptUrl(e.target.value);
                        setFileName(null);
                      }}
                      maxLength={1000}
                      className="w-full pl-9 pr-4 py-2 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-champagne-gold/50 focus:border-champagne-gold transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-dark-border rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <UploadCloud className="w-4 h-4 text-gray-400" />
                      <span>{fileName ? `Archivo: ${fileName}` : 'O subir archivo desde tu equipo'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {receiptUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptUrl('');
                          setFileName(null);
                        }}
                        className="px-2 py-2 text-xs text-red-500 hover:text-red-700 transition-colors"
                        title="Quitar comprobante"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  {receiptUrl && (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Comprobante listo para registrar.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Alerta de devolución de saldo al chofer */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Reintegro automático de saldo</span>
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  Al rechazar esta solicitud, los <b>{formatMoney(grossAmount)}</b> retenidos serán reintegrados de inmediato a la billetera virtual del conductor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Motivo Obligatorio del Rechazo <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detalla con claridad por qué se rechaza la solicitud para que el conductor pueda solucionarlo..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={500}
                  className="w-full p-3 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                  <span>Este motivo será notificado al chofer en su aplicación.</span>
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
                isCompletedMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
              } disabled:opacity-50`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isCompletedMode ? 'Confirmar Transferencia Realizada' : 'Confirmar Rechazo'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
