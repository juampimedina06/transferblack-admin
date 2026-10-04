import { useState } from 'react';
import { Repeat, Plus, Filter, CheckCircle, Clock } from 'lucide-react';
import { useRecurringTrips } from './hooks/useRecurringTrips';
import { RecurringTripsTable } from './components/RecurringTripsTable';
import { CreateRecurringTripModal } from './components/CreateRecurringTripModal';
import { RecurringTripDetailDrawer } from './components/RecurringTripDetailDrawer';
import {
  type RecurringSchedule,
  type RecurringTripStatus,
} from '../../core/recurringTrips/recurringTrip.interface';
import { Button } from '../components/common';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

export default function RecurringTripsScreen() {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<RecurringTripStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RecurringSchedule | null>(null);

  const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;
  const { data, isLoading, isError, refetch } = useRecurringTrips({
    page,
    limit: 15,
    status: statusFilter,
  });

  const schedules = data?.data || [];
  const pagination = data?.pagination;

  // Calculos para KPIs superiores
  const activeCount = schedules.filter((s) => s.status === 'active').length;
  const pausedCount = schedules.filter((s) => s.status === 'paused').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-champagne-gold/15 text-champagne-gold">
              <Repeat className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Traslados Recurrentes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestión de abonos semanales y mensuales de viajes periódicos con cobro anticipado.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nuevo Abono
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Abonos Activos
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={activeCount} />
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Abonos Pausados
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={pausedCount} />
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Total Registrados
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={pagination?.total || schedules.length} />
            </p>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-dark-surface p-3 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400 mr-1" />
          <span className="text-xs font-semibold text-gray-500 mr-2">Estado:</span>
          {(
            [
              { value: 'all', label: 'Todos' },
              { value: 'active', label: 'Activos' },
              { value: 'paused', label: 'Pausados' },
              { value: 'cancelled', label: 'Cancelados' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedStatus === tab.value
                  ? 'bg-champagne-gold text-obsidian font-bold shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <RecurringTripsTable
        schedules={schedules}
        pagination={pagination}
        isLoading={isLoading}
        isError={isError}
        onPageChange={setPage}
        onSelectSchedule={(sched) => setSelectedSchedule(sched)}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <CreateRecurringTripModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            void refetch();
          }}
        />
      )}

      {/* Detail Drawer */}
      <RecurringTripDetailDrawer
        scheduleId={selectedSchedule?.id || null}
        onClose={() => setSelectedSchedule(null)}
      />
    </div>
  );
}
