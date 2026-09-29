import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverDetail } from './hooks/useDriverDetail';
import { DriverDetailSkeleton } from './components/DriverDetail/DriverDetailSkeleton';
import { DocumentCard } from './components/DriverDetail/DocumentCard';
import { RejectionModal } from './components/DriverDetail/RejectionModal';
import { ArrowLeft, Calendar, MapPin, AlertTriangle, Check, X, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { format, differenceInYears, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { extractApiErrorMessage } from '../../core/api/adminApi';
import { Button, Input, Badge, Card, CardHeader, CardTitle } from '../components/common';

export const DriverDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detailQuery, documentMutation, statusMutation, scheduleMutation, finalizeMeetingMutation } = useDriverDetail(id!);

  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectingApp, setRejectingApp] = useState(false);

  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('Oficina Transfer Black - Av. Colón 856, piso 4');

  if (detailQuery.isLoading) {
    return (
      <div className="w-full">
        <DriverDetailSkeleton />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Error al cargar el expediente</h2>
        <button onClick={() => navigate('/conductores')} className="mt-4 text-[#D4AF37] hover:underline">
          Volver a la lista
        </button>
      </div>
    );
  }

  const { driverProfile, personalData, vehicles, driverDocuments, vehicleDocuments, latestMeeting } = detailQuery.data;

  const allDocuments = [...driverDocuments, ...vehicleDocuments];
  const allDocsApproved = allDocuments.length > 0 && allDocuments.every(d => d.status === 'approved');
  const pendingDocsCount = allDocuments.filter(d => d.status !== 'approved').length;

  const handleApproveDocument = (docId: string) => {
    documentMutation.mutate({ docId, status: 'approved' });
  };

  const handleApproveApplication = () => {
    statusMutation.mutate({ status: 'approved' });
  };

  const handleScheduleMeeting = () => {
    if (!allDocsApproved) {
      alert(`Debés aprobar primero toda la documentación (${pendingDocsCount} pendiente${pendingDocsCount > 1 ? 's' : ''}) para poder agendar una reunión presencial.`);
      return;
    }
    if (!meetingDate || !meetingTime || !meetingLocation) {
      alert('Completá fecha, hora y lugar');
      return;
    }
    const scheduledAt = new Date(`${meetingDate}T${meetingTime}`).toISOString();
    scheduleMutation.mutate({ scheduledAt, location: meetingLocation });
  };

  const hasExpiredDocs = allDocuments.some(
    doc => doc.expiresAt && isBefore(new Date(doc.expiresAt), new Date())
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Back Button */}
      <button onClick={() => navigate('/conductores')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-white/70 dark:hover:text-white transition-colors w-max">
        <ArrowLeft size={16} /> Volver a conductores
      </button>

      {/* Banner Documentación 100% Aprobada */}
      {allDocsApproved && (
        <div className="bg-emerald-50/90 dark:bg-emerald-500/10 border border-emerald-200/90 dark:border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                ¡Documentación 100% Aprobada!
                <span className="text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verificado
                </span>
              </h3>
              <p className="text-[12px] text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                Todos los documentos personales y del vehículo están validados. El formulario de reunión presencial ha sido desbloqueado.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Habilitado para Reunión
          </span>
        </div>
      )}

      {hasExpiredDocs && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-[13px] font-medium text-red-800 dark:text-red-400">
            Atención: Hay documentos vencidos. Revisá las tarjetas resaltadas en rojo.
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* LEFT COLUMN - Data */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Header Profile */}
          <div className="bg-white dark:bg-obsidian border border-gray-200 dark:border-white/10 rounded-md p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm dark:shadow-none transition-colors">
            <div className="w-20 h-20 bg-[#F3E8C1] dark:bg-[#D4AF37] rounded-md flex items-center justify-center text-[#9A7D3A] dark:text-obsidian text-2xl font-bold uppercase shrink-0">
              {personalData?.fullName?.substring(0, 2) || ''}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl font-medium text-gray-900 dark:text-white">{personalData?.fullName || ''}</h1>
                <span className={`px-2 py-0.5 rounded-sm border text-[11px] font-medium ${driverProfile.approvalStatus === 'approved' ? 'bg-transparent border-green-200 text-green-700 dark:border-green-500/50 dark:text-green-400' :
                    driverProfile.approvalStatus === 'rejected' ? 'bg-transparent border-red-200 text-red-700 dark:border-red-500/50 dark:text-red-400' :
                      'bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-400'
                  }`}>
                  {driverProfile.approvalStatus === 'approved' ? 'Aprobado' : driverProfile.approvalStatus === 'rejected' ? 'Rechazado' : 'Pendiente de aprobación'}
                </span>
                {latestMeeting && (
                  <span className="px-2 py-0.5 rounded-sm border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-400 text-[11px] font-medium flex items-center gap-1">
                    Reunión {format(new Date(latestMeeting.scheduledAt), "dd/MM HH:mm")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mt-4">
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">DNI</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">{personalData.documentNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Fecha de nacimiento</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">
                    {personalData.birthDate ? `${format(new Date(personalData.birthDate), 'dd/MM/yyyy')} - ${differenceInYears(new Date(), new Date(personalData.birthDate))} años` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Teléfono</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">{personalData.phoneE164}</p>
                </div>
                {personalData.addressText && (
                  <div>
                    <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Domicilio</p>
                    <p className="text-gray-800 dark:text-white/90 text-[13px] leading-tight pr-4">{personalData.addressText}</p>
                  </div>
                )}
                {/* Simulated CUIL missing in API but shown in design */}
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Cuil</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">-</p>
                </div>
                {/* Simulated Category requested */}
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Postulación</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px] leading-tight">Essential y Comfort</p>
                </div>
                {personalData.email && (
                  <div>
                    <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Correo</p>
                    <p className="text-gray-800 dark:text-white/90 text-[13px]">{personalData.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documentación Personal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Documentación personal</CardTitle>
                <Badge variant="success">
                  {driverDocuments.filter(d => d.status === 'approved').length} de {driverDocuments.length} aprobados
                </Badge>
              </div>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {driverDocuments.map(doc => (
                <DocumentCard
                  key={doc.id}
                  {...doc}
                  onApprove={handleApproveDocument}
                  onReject={setRejectingDocId}
                  isUpdating={documentMutation.isPending && documentMutation.variables?.docId === doc.id}
                />
              ))}
            </div>
          </Card>

          {/* Vehículo Declarado */}
          {vehicles.map(vehicle => (
            <Card key={vehicle.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Vehículo declarado</CardTitle>
                  <Badge variant="success">
                    {vehicleDocuments.filter(d => d.status === 'approved').length} de {vehicleDocuments.length} aprobados
                  </Badge>
                </div>
                <Badge variant="default">Apto Comfort</Badge>
              </CardHeader>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-white/5">
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Patente</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px] font-medium">{vehicle.plate}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Marca</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Modelo</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px]">{vehicle.model} {vehicle.year}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Titularidad</p>
                  <p className="text-gray-800 dark:text-white/90 text-[13px] leading-tight">A nombre de la conductora</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicleDocuments.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    {...doc}
                    onApprove={handleApproveDocument}
                    onReject={setRejectingDocId}
                    isUpdating={documentMutation.isPending && documentMutation.variables?.docId === doc.id}
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* RIGHT COLUMN - Sidebar */}
        <div className="flex flex-col gap-6">

          {/* Panel de Decisión */}
          <div className="flex flex-col gap-2">

            {driverProfile.approvalStatus === 'pending' ? (
              <div className="flex flex-col gap-2.5">
                {/* Banner de Error Backend (si ocurre) */}
                {statusMutation.isError && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-[12px] text-red-700 dark:text-red-300 flex items-start gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 dark:text-red-200">Rechazado por el servidor:</p>
                      <p className="text-[11px] mt-0.5 text-red-700 dark:text-red-300">
                        {extractApiErrorMessage(statusMutation.error, 'No se cumplen las condiciones para aprobar.')}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Check className="w-4 h-4 stroke-[2.5]" />}
                  isLoading={statusMutation.isPending}
                  onClick={handleApproveApplication}
                >
                  Aprobar y habilitar
                </Button>
                <Button
                  variant="dangerOutline"
                  fullWidth
                  leftIcon={<X className="w-4 h-4 stroke-[2.5]" />}
                  disabled={statusMutation.isPending}
                  onClick={() => setRejectingApp(true)}
                >
                  Rechazar postulación
                </Button>

                {/* Requisitos para Habilitar (Abajo de los botones) */}
                <div className="mt-1 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="font-semibold text-[11px] tracking-wide uppercase">
                      Atención: requisitos para habilitar
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1 text-[11px] border-t border-amber-200/60 dark:border-amber-500/15">
                    <div className="flex items-center gap-2">
                      {driverDocuments.concat(vehicleDocuments).every(d => d.status === 'approved') ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className={driverDocuments.concat(vehicleDocuments).every(d => d.status === 'approved') ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-amber-900/90 dark:text-amber-300/90"}>
                        {driverDocuments.concat(vehicleDocuments).every(d => d.status === 'approved')
                          ? "Todos los documentos aprobados"
                          : `Faltan aprobar ${driverDocuments.concat(vehicleDocuments).filter(d => d.status !== 'approved').length} documento(s)`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {latestMeeting?.status === 'completed' ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                          <X className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <span className={latestMeeting?.status === 'completed' ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-amber-900/90 dark:text-amber-300/90"}>
                        {latestMeeting?.status === 'completed'
                          ? "Reunión presencial realizada"
                          : latestMeeting
                            ? `Reunión agendada (${latestMeeting.status}) - marcar como "Realizada"`
                            : "Agendar reunión presencial abajo y marcar como 'Realizada'"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3 rounded-md">
                  <p className="text-gray-800 dark:text-white/90 text-[12px]">
                    Estado actual: <strong className={`capitalize ${driverProfile.approvalStatus === 'approved' ? 'text-green-700' :
                        driverProfile.approvalStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'
                      }`}>{driverProfile.approvalStatus}</strong>
                  </p>
                  {driverProfile.rejectionReason && (
                    <p className="text-red-600 dark:text-red-400 text-[12px] mt-1 font-medium">Motivo: {driverProfile.rejectionReason}</p>
                  )}
                </div>

                {driverProfile.approvalStatus === 'approved' && (
                  <Button
                    variant="warningOutline"
                    fullWidth
                    isLoading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ status: 'suspended' })}
                    className="mt-1"
                  >
                    Suspender legajo
                  </Button>
                )}

                {driverProfile.approvalStatus === 'suspended' && (
                  <Button
                    variant="primary"
                    fullWidth
                    isLoading={statusMutation.isPending}
                    onClick={() => statusMutation.mutate({ status: 'approved' })}
                    className="mt-1"
                  >
                    Reactivar y habilitar
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Panel de Reunión */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Reunión propuesta</CardTitle>
                {latestMeeting ? (
                  <Badge
                    variant={
                      latestMeeting.status === 'completed'
                        ? 'success'
                        : latestMeeting.status === 'cancelled'
                        ? 'danger'
                        : latestMeeting.status === 'no_show'
                        ? 'warning'
                        : 'purple'
                    }
                  >
                    {latestMeeting.status === 'completed'
                      ? 'Realizada'
                      : latestMeeting.status === 'cancelled'
                      ? 'Cancelada'
                      : latestMeeting.status === 'no_show'
                      ? 'No se presentó'
                      : 'Agendada'}
                  </Badge>
                ) : allDocsApproved ? (
                  <Badge variant="success" dot>
                    <Sparkles className="w-3 h-3 mr-0.5 inline" /> Habilitada
                  </Badge>
                ) : (
                  <Badge variant="default">
                    <Lock className="w-3 h-3 mr-0.5 inline" /> Bloqueada
                  </Badge>
                )}
              </div>
            </CardHeader>

            {latestMeeting ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
                  <div>
                    <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Fecha y hora</p>
                    <p className="text-gray-800 dark:text-white/90 text-[13px] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-champagne-gold" />
                      {format(new Date(latestMeeting.scheduledAt), "dd/MM/yyyy • HH:mm'hs'", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Lugar</p>
                    <p className="text-gray-800 dark:text-white/90 text-[13px] leading-tight flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{latestMeeting.location}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 dark:text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-2">
                    Cerrar la reunión como
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={latestMeeting.status === 'completed' ? 'success' : 'secondary'}
                      size="sm"
                      disabled={finalizeMeetingMutation.isPending}
                      onClick={() => finalizeMeetingMutation.mutate({ meetingId: latestMeeting.id, status: 'completed' })}
                      leftIcon={<Check className="w-3 h-3 stroke-[2.5]" />}
                    >
                      Realizada
                    </Button>
                    <Button
                      variant={latestMeeting.status === 'no_show' ? 'warning' : 'secondary'}
                      size="sm"
                      disabled={finalizeMeetingMutation.isPending}
                      onClick={() => finalizeMeetingMutation.mutate({ meetingId: latestMeeting.id, status: 'no_show' })}
                      leftIcon={<AlertTriangle className="w-3 h-3" />}
                    >
                      No asistió
                    </Button>
                    <Button
                      variant={latestMeeting.status === 'cancelled' ? 'danger' : 'secondary'}
                      size="sm"
                      disabled={finalizeMeetingMutation.isPending}
                      onClick={() => finalizeMeetingMutation.mutate({ meetingId: latestMeeting.id, status: 'cancelled' })}
                      leftIcon={<X className="w-3 h-3 stroke-[2.5]" />}
                    >
                      Cancelada
                    </Button>
                  </div>
                </div>
              </div>
            ) : !allDocsApproved ? (
              /* Estado Bloqueado cuando faltan documentos por aprobar */
              <div className="bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-md p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 dark:text-white/40 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium text-gray-800 dark:text-white">
                    Formulario bloqueado
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-white/50 mt-1 leading-relaxed">
                    Debés aprobar primero los <strong>{pendingDocsCount} documento(s)</strong> pendientes para poder coordinar la fecha y lugar de la reunión.
                  </p>
                </div>
              </div>
            ) : (
              /* Formulario Activo y Desbloqueado */
              <div className="flex flex-col gap-4 animate-in fade-in">
                <div className="bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40 rounded-md p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-medium">
                    Documentación completa. Coordiná la fecha y lugar:
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Fecha"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                  <Input
                    label="Hora"
                    type="time"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>

                <Input
                  label="Lugar"
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  rightIcon={<MapPin className="w-3.5 h-3.5" />}
                />

                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  isLoading={scheduleMutation.isPending}
                  onClick={handleScheduleMeeting}
                >
                  Agendar reunión presencial
                </Button>
              </div>
            )}
          </Card>

        </div>
      </div>

      <RejectionModal
        isOpen={!!rejectingDocId}
        onClose={() => setRejectingDocId(null)}
        title="Rechazar Documento"
        onSubmit={(reason) => {
          if (rejectingDocId) documentMutation.mutate({ docId: rejectingDocId, status: 'rejected', reason });
          setRejectingDocId(null);
        }}
      />

      <RejectionModal
        isOpen={rejectingApp}
        onClose={() => setRejectingApp(false)}
        title="Rechazar Postulación (Legajo Completo)"
        onSubmit={(reason) => {
          statusMutation.mutate({ status: 'rejected', reason });
          setRejectingApp(false);
        }}
      />
    </div>
  );
};

export default DriverDetailScreen;
