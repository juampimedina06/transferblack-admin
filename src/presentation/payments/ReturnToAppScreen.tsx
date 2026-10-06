import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import transferLogo from '../../assets/img/logo_transferblack_sinfodo.png';

/** Esquema de deep link de la app del pasajero (ver `app.json` -> `expo.scheme`). */
const APP_SCHEME = 'transferblack-passenger';
const APP_DEEP_LINK_HOST = 'payment-return';

/**
 * Unicos parametros que se reenvian al deep link. Cualquier otro parametro de
 * la URL (de Mercado Pago u otro origen) se ignora: nunca se reenvia la query
 * string completa sin filtrar.
 */
const FORWARDED_PARAM_KEYS = [
  'trip_id',
  'reference',
  'kind',
  'result',
  'status',
  'payment_id',
  'collection_status',
  'collection_id',
  'external_reference',
  'merchant_order_id',
] as const;

type PaymentOutcome = 'approved' | 'pending' | 'rejected' | 'unknown';

/**
 * Pagina puente HTTPS para volver a la app despues de un checkout de
 * Mercado Pago (`/volver-a-la-app`). Mercado Pago no puede abrir un esquema
 * `transferblack-passenger://` directamente como `back_url`, asi que
 * redirige a esta pagina, que intenta el deep link y, si no se abre sola,
 * ofrece un boton manual. No depende de sesion ni hace llamadas a la API.
 */
export default function ReturnToAppScreen() {
  const [searchParams] = useSearchParams();
  const attemptedRedirectRef = useRef(false);

  const forwardedParams = useMemo(() => buildForwardedParams(searchParams), [searchParams]);
  const deepLink = useMemo(
    () => `${APP_SCHEME}://${APP_DEEP_LINK_HOST}?${forwardedParams.toString()}`,
    [forwardedParams],
  );
  const outcome = useMemo(() => resolveOutcome(searchParams), [searchParams]);

  useEffect(() => {
    document.title = 'Volviendo a Transfer Black…';
  }, []);

  useEffect(() => {
    // Un solo intento automatico al cargar: si el usuario ya volvio a la app
    // (o la cerro), no queremos reabrir el deep link en cada re-render.
    if (attemptedRedirectRef.current) {
      return;
    }
    attemptedRedirectRef.current = true;
    window.location.href = deepLink;
  }, [deepLink]);

  const copy = OUTCOME_COPY[outcome];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-obsidian px-4 py-10 font-montserrat text-center">
      <img src={transferLogo} alt="Transfer Black" className="mb-8 h-8 w-auto" />

      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${copy.badgeClass}`}>
        <copy.Icon className="h-7 w-7" />
      </div>

      <h1 className="mb-2 text-xl font-bold text-white">Volviendo a Transfer Black…</h1>
      <p className="mb-1 max-w-sm text-sm text-gray-400">{copy.description}</p>

      <a
        href={deepLink}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-champagne-gold px-6 py-3 text-sm font-bold text-obsidian transition-colors hover:bg-champagne-gold/90"
      >
        Abrir la app
      </a>

      <p className="mt-6 max-w-sm text-xs text-gray-500">
        Si la app no se abre, volvé a ella manualmente; tu pago se procesa igual.
      </p>
    </div>
  );
}

const OUTCOME_COPY: Record<
  PaymentOutcome,
  { description: string; badgeClass: string; Icon: typeof CheckCircle2 }
> = {
  approved: {
    description: 'Tu pago fue aprobado.',
    badgeClass: 'bg-emerald-500/10 text-emerald-500',
    Icon: CheckCircle2,
  },
  pending: {
    description: 'Tu pago está pendiente de confirmación. Puede demorar unos minutos.',
    badgeClass: 'bg-amber-500/10 text-amber-500',
    Icon: Clock,
  },
  rejected: {
    description: 'Tu pago fue rechazado. Podés intentar de nuevo desde la app.',
    badgeClass: 'bg-red-500/10 text-red-500',
    Icon: XCircle,
  },
  unknown: {
    description: 'Estamos confirmando el resultado de tu pago.',
    badgeClass: 'bg-white/10 text-gray-400',
    Icon: HelpCircle,
  },
};

/** Arma la query string a reenviar, con solo las claves conocidas y ya URL-encodeadas. */
function buildForwardedParams(searchParams: URLSearchParams): URLSearchParams {
  const forwarded = new URLSearchParams();

  for (const key of FORWARDED_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) {
      forwarded.set(key, value);
    }
  }

  return forwarded;
}

/** Determina el resultado a mostrar a partir de `result`/`status`/`collection_status`. */
function resolveOutcome(searchParams: URLSearchParams): PaymentOutcome {
  const raw = (
    searchParams.get('result') ??
    searchParams.get('status') ??
    searchParams.get('collection_status') ??
    ''
  ).toLowerCase();

  if (raw === 'approved' || raw === 'success') {
    return 'approved';
  }
  if (raw === 'pending' || raw === 'in_process') {
    return 'pending';
  }
  if (raw === 'rejected' || raw === 'failure') {
    return 'rejected';
  }
  return 'unknown';
}
