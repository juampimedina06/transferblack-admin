import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Building2,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import type { AdminPayoutItem } from '../../../core/payouts/interfaces/payout.interface';
import { PayoutBadge } from './PayoutBadge';

interface PayoutDetailModalProps {
  payout: AdminPayoutItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (payout: AdminPayoutItem) => void;
  onPay: (payout: AdminPayoutItem) => void;
  onReject: (payout: AdminPayoutItem) => void;
  isResolving?: boolean;
}

export const PayoutDetailModal: React.FC<PayoutDetailModalProps> = ({
  payout,
  isOpen,
  onClose,
  onApprove,
  onPay,
  onReject,
  isResolving = false,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !payout) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: payout.currency || 'ARS',
    minimumFractionDigits: 2,
  }).format(parseFloat(payout.amount) || 0);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const isPending = payout.status === 'requested';
  const isApproved = payout.status === 'approved';
  const isActionable = isPending || isApproved;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-champagne-gold/10 text-champagne-gold border border-champagne-gold/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Detalle de Solicitud de Retiro
                </h2>
                <PayoutBadge status={payout.status} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                ID: {payout.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Card Destacada: Monto */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-champagne-gold/10 via-transparent to-amber-500/5 dark:from-champagne-gold/15 dark:to-transparent border border-champagne-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-champagne-gold">
                Monto Exacto a Transferir
              </span>
              <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {formattedAmount}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/conductores/${payout.driver_id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-200 hover:text-champagne-gold hover:border-champagne-gold transition-colors shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Ver Conductor</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
              </Link>
            </div>
          </div>

          {/* Datos Bancarios Congelados */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Datos bancarios de destino (Congelados por la solicitud)
              </h3>
            </div>

            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-dark-border rounded-xl divide-y divide-gray-200/60 dark:divide-dark-border overflow-hidden">
              {/* Titular */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Titular de la Cuenta
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                  {payout.account_holder_name || 'Sin titular informado'}
                </span>
              </div>

              {/* DNI / CUIT */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  CUIT / DNI Titular
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {payout.account_holder_document || '-'}
                  </span>
                  {payout.account_holder_document && (
                    <button
                      onClick={() => handleCopy(payout.account_holder_document!, 'document')}
                      className="p-1 text-gray-400 hover:text-champagne-gold transition-colors"
                      title="Copiar CUIT/DNI"
                    >
                      {copiedField === 'document' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* CBU / CVU */}
              <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {payout.payment_method || 'CBU / CVU'} (22 dígitos)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white font-mono tracking-wider break-all">
                    {payout.destination_cbu_cvu || '-'}
                  </span>
                  {payout.destination_cbu_cvu && (
                    <button
                      onClick={() => handleCopy(payout.destination_cbu_cvu!, 'cbu')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-champagne-gold hover:text-champagne-gold transition-colors shadow-sm"
                      title="Copiar clave completa"
                    >
                      {copiedField === 'cbu' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar CBU</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Alias */}
              <div className="px-4 py-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Alias Bancario
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                    {payout.destination_alias || '-'}
                  </span>
                  {payout.destination_alias && (
                    <button
                      onClick={() => handleCopy(payout.destination_alias!, 'alias')}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-champagne-gold hover:text-champagne-gold transition-colors shadow-sm"
                      title="Copiar Alias"
                    >
                      {copiedField === 'alias' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar Alias</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Información de Tiempos y Resolución */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Trazabilidad
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-white/[0.02]">
                <span className="text-gray-500 dark:text-gray-400 block mb-1">
                  Fecha de Solicitud
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(payout.requested_at)}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-white/[0.02]">
                <span className="text-gray-500 dark:text-gray-400 block mb-1">
                  Fecha de Resolución
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(payout.resolved_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Datos si está pagado */}
          {payout.status === 'paid' && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Check className="w-4 h-4" />
                Información del Pago Realizado
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block">
                    Nº de Comprobante / Referencia:
                  </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                    {payout.transfer_reference || '-'}
                  </span>
                </div>
                {payout.receipt_url && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block">
                      Comprobante Adjunto:
                    </span>
                    <a
                      href={payout.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-champagne-gold hover:underline mt-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Abrir archivo / recibo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datos si está rechazado */}
          {payout.status === 'rejected' && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Motivo del Rechazo
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-dark-surface p-3 rounded-lg border border-red-200 dark:border-red-900/30 font-medium">
                {payout.rejection_reason || 'Sin motivo detallado'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            Cerrar
          </button>

          {isActionable && (
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={() => onReject(payout)}
                disabled={isResolving}
                className="px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg transition-colors disabled:opacity-50"
              >
                Rechazar
              </button>

              {isPending && (
                <button
                  type="button"
                  onClick={() => onApprove(payout)}
                  disabled={isResolving}
                  className="px-3.5 py-2 text-sm font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-800/40 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>Poner En Gestión</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onPay(payout)}
                disabled={isResolving}
                className="px-4 py-2 text-sm font-bold text-obsidian bg-champagne-gold hover:bg-champagne-gold/90 rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Marcar como Pagado</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
