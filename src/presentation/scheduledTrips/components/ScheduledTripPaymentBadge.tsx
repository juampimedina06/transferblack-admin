import React from 'react';
import { Badge } from '../../components/common';
import type { ScheduledTripPayment } from '../../../core/scheduledTrips/scheduledTripPayments.api';

interface ScheduledTripPaymentBadgeProps {
  prepaidAt: string | null;
  payments?: ScheduledTripPayment[];
}

/**
 * El estado de cobro de un reservado no es un campo propio del viaje: se
 * deriva de `prepaid_at` (ya acreditado) y, si hay pagos cargados, de si
 * alguno quedo `requires_refund` (cobro duplicado, prioridad sobre "Pagado"
 * porque hay que reembolsar a mano).
 */
export const ScheduledTripPaymentBadge: React.FC<ScheduledTripPaymentBadgeProps> = ({ prepaidAt, payments }) => {
  const needsRefund = payments?.some((payment) => payment.status === 'requires_refund');

  if (needsRefund) {
    return <Badge variant="danger">Requiere reembolso</Badge>;
  }
  if (prepaidAt) {
    return <Badge variant="success">Pagado</Badge>;
  }
  return <Badge variant="warning">Pendiente</Badge>;
};
