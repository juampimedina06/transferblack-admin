import React from 'react';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { format, isBefore } from 'date-fns';
import { 
  AlertTriangle, 
  Check, 
  X, 
  Loader2, 
  Eye, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  FileText, 
  Car, 
  FileBadge 
} from 'lucide-react';
import { getImageUrl } from '../../../../core/drivers/utils/getImageUrl';
import { Button, Badge } from '../../../components/common';

const DOCUMENT_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  dni: { label: 'DNI (Frente y Dorso)', icon: CreditCard },
  license_d1: { label: 'Licencia Nacional (Clase D1)', icon: FileBadge },
  driver_license: { label: 'Licencia Nacional de Conducir', icon: FileBadge },
  insurance_policy: { label: 'Póliza de Seguro Vigente', icon: ShieldCheck },
  criminal_record_national: { label: 'Antecedentes Penales (Nacional)', icon: FileText },
  criminal_record_provincial: { label: 'Antecedentes Penales (Provincial)', icon: FileText },
  sex_offenses_registry: { label: 'Registro de Ofensores Sexuales', icon: ShieldCheck },
  vehicle_title: { label: 'Título de Propiedad Automotor', icon: Car },
  itv: { label: 'Inspección Técnica (ITV / RTO)', icon: Car },
};

interface DocumentCardProps {
  id: string;
  type?: string;
  name?: string;
  documentType?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  filePath: string;
  issuedAt?: string;
  expiresAt?: string;
  isUpdating?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  type,
  name,
  documentType,
  status,
  rejectionReason,
  filePath,
  issuedAt,
  expiresAt,
  isUpdating = false,
  onApprove,
  onReject,
}) => {
  const imageUrl = getImageUrl(filePath);
  const rawType = (type || name || documentType || '').toLowerCase();
  const meta = DOCUMENT_META[rawType];
  const IconComponent = meta?.icon || FileText;
  const displayTitle = meta?.label || rawType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Documento';

  const isExpired = expiresAt ? isBefore(new Date(expiresAt), new Date()) : false;

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-300 flex flex-col justify-between gap-3.5 shadow-2xs hover:shadow-md ${
        isExpired
          ? 'bg-red-50/20 dark:bg-red-950/10 border-red-200/90 dark:border-red-900/30 hover:border-red-300'
          : status === 'rejected'
          ? 'bg-white dark:bg-dark-surface border-red-200/60 dark:border-red-900/20 hover:border-red-300/80'
          : status === 'approved'
          ? 'bg-white dark:bg-dark-surface border-gray-200/80 dark:border-dark-border hover:border-emerald-300/60 dark:hover:border-emerald-500/30'
          : 'bg-white dark:bg-dark-surface border-gray-200/80 dark:border-dark-border hover:border-champagne-gold/50 dark:hover:border-champagne-gold/40'
      }`}
    >
      {/* Loading Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/70 dark:bg-obsidian/75 backdrop-blur-[1px] flex flex-col items-center justify-center z-20 rounded-xl transition-opacity">
          <Loader2 className="w-6 h-6 animate-spin text-champagne-gold" />
          <span className="text-[11px] font-medium text-gray-600 dark:text-white/70 mt-1.5">Actualizando...</span>
        </div>
      )}

      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
            status === 'approved'
              ? 'bg-emerald-50 border-emerald-200/80 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400'
              : status === 'rejected'
              ? 'bg-red-50 border-red-200/80 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400'
              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-white/5 dark:border-white/10 dark:text-champagne-gold'
          }`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-[13px] font-semibold text-gray-900 dark:text-white truncate" title={displayTitle}>
              {displayTitle}
            </h4>
            <span className="text-[11px] text-gray-400 dark:text-white/40 block -mt-0.5 capitalize">
              {rawType.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {status === 'approved' && (
            <Badge variant="success" size="md">
              <Check className="w-3 h-3 stroke-[2.5]" /> Aprobado
            </Badge>
          )}
          {status === 'rejected' && (
            <Badge variant="danger" size="md">
              <X className="w-3 h-3 stroke-[2.5]" /> Rechazado
            </Badge>
          )}
          {status === 'pending' && (
            <Badge variant={rejectionReason ? 'purple' : 'warning'} size="md" dot>
              {rejectionReason ? 'Re-subido' : 'Pendiente'}
            </Badge>
          )}
        </div>
      </div>

      {/* Body: Thumbnail & Date Info */}
      <div className="flex items-center gap-3.5 bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-lg p-2.5">
        {/* Thumbnail Preview */}
        <div className="w-20 h-14 bg-gray-100 dark:bg-obsidian rounded-md border border-gray-200 dark:border-white/10 overflow-hidden shrink-0 relative group/thumb">
          {imageUrl ? (
            <div className="w-full h-full relative cursor-pointer">
              <Zoom>
                <img
                  src={imageUrl}
                  alt={displayTitle}
                  className="w-20 h-14 object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                />
              </Zoom>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Eye className="w-4 h-4 text-white drop-shadow-md" />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30">
              <FileText className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Dates Details */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          {issuedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/60">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Emitido: <strong className="font-medium text-gray-700 dark:text-white/80">{format(new Date(issuedAt), 'dd/MM/yyyy')}</strong></span>
            </div>
          )}

          {expiresAt ? (
            <div className={`flex items-center gap-1.5 text-[11px] ${
              isExpired 
                ? 'text-red-600 dark:text-red-400 font-semibold' 
                : 'text-gray-500 dark:text-white/60'
            }`}>
              {isExpired ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              )}
              <span>
                {isExpired ? 'Vencido el: ' : 'Vence: '}
                <strong className={isExpired ? 'underline' : 'font-medium text-gray-700 dark:text-white/80'}>
                  {format(new Date(expiresAt), 'dd/MM/yyyy')}
                </strong>
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-gray-400 dark:text-white/40 italic">
              Sin fecha de vencimiento declarada
            </span>
          )}
        </div>
      </div>

      {/* Notice for re-uploaded / previously rejected doc */}
      {status === 'pending' && rejectionReason && (
        <div className="bg-purple-50/80 dark:bg-purple-500/10 border-l-2 border-purple-500 rounded-r-md px-3 py-2 text-[12px] text-purple-800 dark:text-purple-300">
          <span className="font-semibold text-purple-900 dark:text-purple-200">Documento corregido y re-enviado:</span>
          <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80 mt-0.5">
            Observación previa: "{rejectionReason}"
          </p>
        </div>
      )}

      {/* Rejection Reason Notice (if rejected) */}
      {status === 'rejected' && rejectionReason && (
        <div className="bg-red-50/80 dark:bg-red-500/10 border-l-2 border-red-500 rounded-r-md px-3 py-2 text-[12px] text-red-700 dark:text-red-300">
          <span className="font-semibold text-red-800 dark:text-red-200">Motivo del rechazo: </span>
          {rejectionReason}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-1 flex items-center justify-between gap-2 border-t border-gray-100 dark:border-white/5">
        {status === 'pending' ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="successOutline"
              size="sm"
              fullWidth
              disabled={isUpdating}
              onClick={() => onApprove(id)}
              leftIcon={<Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            >
              Aprobar
            </Button>
            <Button
              variant="dangerOutline"
              size="sm"
              fullWidth
              disabled={isUpdating}
              onClick={() => onReject(id)}
              leftIcon={<X className="w-3.5 h-3.5 stroke-[2.5]" />}
            >
              Rechazar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-gray-400 dark:text-white/40">
              Evaluado
            </span>
            <div className="flex items-center gap-2">
              {status === 'approved' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onReject(id)}
                  className="text-[11px] text-gray-500 hover:text-red-600 dark:text-white/50 dark:hover:text-red-400 py-1 px-2"
                >
                  Cambiar a Rechazar
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onApprove(id)}
                  className="text-[11px] text-gray-500 hover:text-emerald-600 dark:text-white/50 dark:hover:text-emerald-400 py-1 px-2"
                >
                  Cambiar a Aprobar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
