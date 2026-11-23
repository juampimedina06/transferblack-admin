import React from 'react';
import { Badge } from '../../components/common';
import type { PassengerAccountStatus } from '../../../core/passengers/interfaces/passenger.interface';

interface PassengerStatusBadgeProps {
  status: PassengerAccountStatus | string;
}

export const PassengerStatusBadge: React.FC<PassengerStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="success" dot>
          Activo
        </Badge>
      );
    case 'blocked':
      return (
        <Badge variant="danger" dot>
          Bloqueado
        </Badge>
      );
    case 'deleted':
      return (
        <Badge variant="default" dot>
          Eliminado
        </Badge>
      );
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};
