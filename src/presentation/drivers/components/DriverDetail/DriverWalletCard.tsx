import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  HandCoins,
  Loader2,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, CardTitle } from '../../../components/common';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';
import { useDriverWallet } from '../../hooks/useDriverWallet';
import { SettleDebtModal } from './SettleDebtModal';

interface DriverWalletCardProps {
  driverId: string;
  driverName: string;
}

const ENTRY_TYPE_LABELS: Record<string, string> = {
  trip_earning: 'Ganancia de viaje',
  trip_commission_debt: 'Comisión viaje efectivo',
  debt_settlement: 'Pago de deuda',
  payout: 'Retiro acreditado',
  manual_adjustment: 'Ajuste manual',
  trip_refund: 'Reembolso de viaje',
  trip_chargeback: 'Contracargo',
};

const formatCurrency = (amount: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

export const DriverWalletCard: React.FC<DriverWalletCardProps> = ({ driverId, driverName }) => {
  const { walletQuery, settleDebtMutation } = useDriverWallet(driverId);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (walletQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billetera y saldo</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-2 py-4 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-champagne-gold" />
          <span>Cargando billetera del conductor...</span>
        </div>
      </Card>
    );
  }

  if (walletQuery.isError || !walletQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billetera y saldo</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between gap-2 text-xs text-red-600 dark:text-red-400">
          <span>No pudimos cargar el estado de la billetera.</span>
          <button
            type="button"
            onClick={() => walletQuery.refetch()}
            className="font-semibold underline cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </Card>
    );
  }

  const { wallet, transactions } = walletQuery.data;
  const balance = Number(wallet.balance);
  const debtLimit = Number(wallet.debt_limit);
  const debtAmount = balance < 0 ? Math.abs(balance) : 0;
  const debtUsagePercent =
    debtLimit > 0 ? Math.min(100, Math.round((debtAmount / debtLimit) * 100)) : 0;
  const isBlockedByDebt = !wallet.can_accept_trips || wallet.is_cash_restricted;

  const handleOpenSettleModal = () => {
    settleDebtMutation.reset();
    setSuccessMessage(null);
    setIsSettleModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-champagne-gold shrink-0" />
            <CardTitle>Billetera y saldo</CardTitle>
          </div>
          {isBlockedByDebt ? (
            <Badge variant="danger" dot>
              Límite alcanzado
            </Badge>
          ) : debtAmount > 0 ? (
            <Badge variant="warning" dot>
              Con deuda
            </Badge>
          ) : (
            <Badge variant="success" dot>
              Al día
            </Badge>
          )}
        </CardHeader>

        <div className="flex flex-col gap-3.5">
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-lg px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Balance Summary */}
          <div className="bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40">
              Saldo actual ({wallet.currency})
            </p>
            <p
              className={`text-2xl font-bold mt-0.5 ${
                balance < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {balance < 0 ? '-$' : '$'}
              <AnimatedNumber value={Math.abs(balance)} decimals={2} />
            </p>

            {/* Debt progress bar */}
            {debtLimit > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mb-1">
                  <span>Deuda acumulada</span>
                  <span>
                    <strong className="text-gray-800 dark:text-white">
                      {formatCurrency(debtAmount, wallet.currency)}
                    </strong>{' '}
                    / {formatCurrency(debtLimit, wallet.currency)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isBlockedByDebt || debtUsagePercent >= 100
                        ? 'bg-red-500'
                        : debtUsagePercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${debtUsagePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Debt restriction warning */}
          {isBlockedByDebt && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-[11.5px] text-red-800 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>
                El conductor alcanzó el tope de cuenta negativa y tiene restringidos viajes en efectivo. Al registrar el pago se rehabilita automáticamente.
              </span>
            </div>
          )}

          {/* Settle Debt CTA */}
          {debtAmount > 0 ? (
            <Button
              variant="primary"
              fullWidth
              leftIcon={<HandCoins className="w-4 h-4" />}
              onClick={handleOpenSettleModal}
            >
              Registrar pago de deuda
            </Button>
          ) : (
            <p className="text-[11.5px] text-gray-500 dark:text-gray-400 text-center py-1">
              Sin deuda pendiente con la agencia.
            </p>
          )}

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/40 mb-2">
                Últimos movimientos
              </p>
              <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                {transactions.slice(0, 5).map((tx) => {
                  const txAmount = Number(tx.amount);
                  const isPositive = txAmount >= 0;
                  const label = ENTRY_TYPE_LABELS[tx.entry_type] || tx.entry_type;

                  return (
                    <div key={tx.id} className="py-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {isPositive ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                            {label}
                          </p>
                          <p className="text-[10.5px] text-gray-400 dark:text-white/40 truncate">
                            {format(new Date(tx.created_at), 'dd/MM HH:mm', { locale: es })}
                            {tx.notes ? ` · ${tx.notes}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {formatCurrency(Math.abs(txAmount), tx.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        driverName={driverName}
        debtAmount={debtAmount}
        currency={wallet.currency}
        isSubmitting={settleDebtMutation.isPending}
        serverError={settleDebtMutation.error}
        onSubmit={(payload, idempotencyKey) => {
          settleDebtMutation.mutate(
            { payload, idempotencyKey },
            {
              onSuccess: () => {
                setIsSettleModalOpen(false);
                setSuccessMessage(
                  `Pago de ${formatCurrency(Number(payload.amount), wallet.currency)} registrado con éxito.`,
                );
              },
            },
          );
        }}
      />
    </>
  );
};
