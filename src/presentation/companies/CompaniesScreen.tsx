import { useDeferredValue, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Check, Copy, Inbox, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { extractApiErrorMessage } from '../../core/api/adminApi';
import {
  createCompany,
  createCompanyFormSchema,
  getCompanies,
  type Company,
  type CompanyFormValues,
} from '../../core/companies/company.api';
import { Badge, Button, Input } from '../components/common';
import { BillingStatusBadge } from './components/BillingStatusBadge';
import { Modal } from './components/Modal';

const defaults: CompanyFormValues = {
  legal_name: '',
  trade_name: '',
  tax_id_type: 'CUIT',
  tax_id: '',
  billing_email: '',
  phone_e164: '',
  address_text: '',
  monthly_spend_limit: '',
};

function CompanyForm({ onClose, onCreated }: { onClose: () => void; onCreated: (code: string) => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(createCompanyFormSchema),
    defaultValues: defaults,
  });
  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: (company) => {
      onCreated(company.join_code);
      void queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
  const input = (
    name: keyof CompanyFormValues,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <Input
      label={label}
      error={errors[name]?.message}
      aria-invalid={Boolean(errors[name])}
      {...register(name)}
      {...props}
    />
  );

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="grid gap-4 p-5 sm:grid-cols-2">
      {input('legal_name', 'Razón social', { autoFocus: true })}
      {input('trade_name', 'Nombre de fantasía (opcional)')}
      <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Tipo fiscal
        <select
          {...register('tax_id_type')}
          className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-champagne-gold focus:outline-none focus:ring-1 focus:ring-champagne-gold/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <option value="CUIT">CUIT</option>
          <option value="RUT">RUT</option>
        </select>
      </label>
      {input('tax_id', 'CUIT / RUT', { placeholder: 'Sin puntos ni guiones' })}
      {input('billing_email', 'Email de facturación (opcional)', {
        type: 'email',
      })}
      {input('phone_e164', 'Teléfono E.164 (opcional)', {
        type: 'tel',
        placeholder: '+5493511234567',
      })}
      <div className="sm:col-span-2">{input('address_text', 'Dirección (opcional)')}</div>
      {input('monthly_spend_limit', 'Tope mensual (opcional)', {
        inputMode: 'decimal',
        placeholder: 'Ej. 250000.00',
      })}
      {mutation.isError && (
        <p role="alert" className="self-end text-sm text-red-600">
          {extractApiErrorMessage(mutation.error, 'No se pudo crear la empresa.')}
        </p>
      )}
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 sm:col-span-2 dark:border-white/10">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="gold" isLoading={mutation.isPending} leftIcon={<Plus size={16} />}>
          Crear empresa
        </Button>
      </div>
    </form>
  );
}

export default function CompaniesScreen() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const deferredSearch = useDeferredValue(search.trim());
  const companies = useQuery({
    queryKey: ['companies', { page, search: deferredSearch, status }],
    queryFn: ({ signal }) => getCompanies({ page, search: deferredSearch, status }, signal),
  });
  const totalPages = companies.data ? Math.max(1, Math.ceil(companies.data.total / companies.data.limit)) : 1;

  const copyCode = async () => {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Empresas</h1>
          <p className="mt-1 text-sm text-gray-500">Administrá las cuentas corporativas y sus límites.</p>
        </div>
        <Button variant="gold" leftIcon={<Plus size={16} />} onClick={() => setShowCreate(true)}>
          Nueva empresa
        </Button>
      </header>
      <section aria-label="Filtros de empresas" className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar empresas</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por razón social, nombre o CUIT/RUT"
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-champagne-gold focus:outline-none focus:ring-2 focus:ring-champagne-gold/20 dark:border-dark-border dark:bg-dark-surface dark:text-white"
          />
        </label>
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-dark-border dark:bg-dark-surface dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="suspended">Suspendidas</option>
        </select>
      </section>
      {search.trim().length === 1 && (
        <p className="text-xs text-amber-700">Ingresá al menos 2 caracteres para buscar.</p>
      )}
      {companies.isError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-medium">No se pudieron cargar las empresas.</p>
          <Button className="mt-3" variant="dangerOutline" onClick={() => companies.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase tracking-wider text-gray-500 dark:border-dark-border dark:bg-dark-card">
                <tr>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Identificación</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Tope mensual</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Facturación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {companies.isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      {Array.from({ length: 6 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-4">
                          <div className="h-4 w-28 rounded bg-gray-200 dark:bg-white/10" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : companies.data?.companies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-gray-500">
                      <Inbox className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="font-medium text-gray-900 dark:text-white">No se encontraron empresas</p>
                      <p className="text-sm">Ajustá los filtros o creá una nueva empresa.</p>
                    </td>
                  </tr>
                ) : (
                  companies.data?.companies.map((company: Company) => (
                    <tr
                      key={company.id}
                      onClick={() => navigate(`/empresas/${company.id}`, { state: { company } })}
                      className="cursor-pointer text-[13px] text-gray-700 hover:bg-gray-50/50 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-900 dark:text-white">{company.legal_name}</p>
                        <p className="text-xs text-gray-500">{company.trade_name || 'Sin nombre de fantasía'}</p>
                      </td>
                      <td className="px-5 py-3">
                        {company.tax_id_type} {company.tax_id}
                      </td>
                      <td className="px-5 py-3">
                        <p>{company.billing_email || '-'}</p>
                        <p className="text-xs text-gray-500">{company.phone_e164 || '-'}</p>
                      </td>
                      <td className="px-5 py-3">
                        {company.monthly_spend_limit ? `$ ${company.monthly_spend_limit}` : 'Sin tope'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={company.status === 'active' ? 'success' : 'warning'}>
                          {company.status === 'active' ? 'Activa' : 'Suspendida'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <BillingStatusBadge status={company.billing_status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {companies.data && companies.data.total > companies.data.limit && (
            <footer className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-sm text-gray-500 dark:border-dark-border">
              <span>
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((value) => value - 1)}
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page === totalPages}
                  onClick={() => setPage((value) => value + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </footer>
          )}
        </div>
      )}
      {showCreate && (
        <Modal title="Nueva empresa" onClose={() => setShowCreate(false)}>
          <CompanyForm
            onClose={() => setShowCreate(false)}
            onCreated={(code) => {
              setShowCreate(false);
              setJoinCode(code);
            }}
          />
        </Modal>
      )}
      {joinCode && (
        <Modal title="Empresa creada" dismissible={false} onClose={() => undefined}>
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Building2 />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">Guardá el código de acceso ahora</p>
            <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              Se muestra una sola vez y no podrá recuperarse después de cerrar este mensaje.
            </p>
            <div className="my-5 flex items-center justify-between rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 p-4">
              <code className="text-lg font-bold tracking-wider text-gray-900 dark:text-white">{joinCode}</code>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={copyCode}
                leftIcon={copied ? <Check size={15} /> : <Copy size={15} />}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            {copyError && (
              <p role="alert" className="mb-4 text-sm text-red-600">
                No se pudo copiar. Seleccioná el código manualmente.
              </p>
            )}
            <Button
              type="button"
              onClick={() => {
                setJoinCode(null);
                setCopied(false);
                setCopyError(false);
              }}
            >
              Ya guardé el código
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
