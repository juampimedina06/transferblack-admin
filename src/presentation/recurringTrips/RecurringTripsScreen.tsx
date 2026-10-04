import { useState } from 'react';
import { Repeat, Plus, CheckCircle, Clock } from 'lucide-react';
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

  // Cálculos para KPIs superiores
  const activeCount = schedules.filter((s) => s.status === 'active').length;
  const pausedCount = schedules.filter((s) => s.status === 'paused').length;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Traslados recurrentes
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Abonos semanales y mensuales de viajes periódicos con cobro anticipado.
          </p>
        </div>

        <Button
          type="button"
          variant="gold"
          size="sm"
          leftIcon={<Plus size={15} />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Nuevo abono
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Abonos Activos
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={activeCount} />
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Abonos Pausados
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={pausedCount} />
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm dark:border-dark-border dark:bg-dark-surface flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-champagne-gold/15 text-champagne-gold flex items-center justify-center shrink-0">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Total Registrados
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              <AnimatedNumber value={pagination?.total || schedules.length} />
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-dark-border dark:bg-dark-surface sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mr-1.5">
            Estado:
          </span>
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
              type="button"
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === tab.value
                  ? 'bg-champagne-gold text-obsidian shadow-sm font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-dark-card dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white border border-gray-200/60 dark:border-dark-border'
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
