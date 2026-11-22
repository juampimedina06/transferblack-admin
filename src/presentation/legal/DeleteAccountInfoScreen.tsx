import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from './components/LegalLayout';
import { LEGAL_ENTITY } from './constants/legalEntity';

/**
 * Página pública de Eliminación de Cuenta y Datos (`/eliminar-cuenta`).
 * Requerida por Google Play (Data Deletion URL) y Apple App Store para que
 * pasajeros y conductores puedan solicitar la baja incluso sin la app instalada.
 */
export default function DeleteAccountInfoScreen() {
  useEffect(() => {
    document.title = 'Eliminación de Cuenta y Datos · Transfer Black';
  }, []);

  return (
    <LegalLayout title="Eliminación de Cuenta y Datos" updatedAt={LEGAL_ENTITY.effectiveDate}>
      <LegalSection title="1. Cómo eliminar tu cuenta desde la aplicación">
        <p>
          Tanto en <strong>Transfer Black Pasajero</strong> como en{' '}
          <strong>Transfer Black Conductor</strong> podés eliminar tu cuenta de manera inmediata:
        </p>
        <ol className="ml-4 list-decimal space-y-1">
          <li>Iniciá sesión en la aplicación móvil.</li>
          <li>
            Ingresá a la sección <strong>Perfil</strong> (o <strong>Mi cuenta</strong>).
          </li>
          <li>
            Tocá <strong>Eliminar cuenta</strong> al final de la pantalla.
          </li>
          <li>Ingresá tu contraseña actual para confirmar la baja definitiva.</li>
        </ol>
        <p>
          Por seguridad operativa, no es posible completar la eliminación mientras exista un viaje
          activo, una reserva próxima en curso, deudas o retiros pendientes de liquidación.
        </p>
      </LegalSection>

      <LegalSection title="2. Cómo solicitar la eliminación sin tener la app instalada">
        <p>
          Si ya desinstalaste la aplicación o no podés iniciar sesión, podés solicitar la
          eliminación de tu cuenta y datos personales enviando un correo electrónico a{' '}
          <strong>{LEGAL_ENTITY.contactEmail}</strong> con el asunto{' '}
          <strong>"Solicitud de eliminación de cuenta"</strong> desde el mismo email registrado en
          Transfer Black, indicando:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Nombre completo y correo electrónico asociado a la cuenta.</li>
          <li>Si corresponde a la app de Pasajero, Conductor o ambas.</li>
          <li>Número de teléfono registrado (para validar titularidad).</li>
        </ul>
        <p>
          Procesaremos tu solicitud y te confirmaremos la baja dentro de un plazo máximo de{' '}
          <strong>10 días hábiles</strong>.
        </p>
      </LegalSection>

      <LegalSection title="3. Qué datos se eliminan o anonimizan">
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Se eliminan o anonimizan de inmediato:</strong> tu nombre, correo electrónico,
            teléfono, foto de perfil, tokens de sesión y notificaciones push, y perfil operativo
            de conductor o pasajero.
          </li>
          <li>
            <strong>Se conservan únicamente por obligación legal:</strong> registros contables,
            fiscales y de viajes/pagos exigidos por la normativa tributaria y de transporte de la
            República Argentina, desvinculados de tus datos de contacto activos durante el plazo
            legal correspondiente.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Más información">
        <p>
          El responsable del tratamiento de tus datos personales es{' '}
          <strong>{LEGAL_ENTITY.businessName}</strong>, CUIT <strong>{LEGAL_ENTITY.taxId}</strong>.
        </p>
        <p>
          Podés consultar el detalle completo sobre cómo tratamos tus datos en nuestra{' '}
          <Link to="/privacidad-conductores" className="text-champagne-gold underline">
            Política de Privacidad para Conductores
          </Link>{' '}
          o en la{' '}
          <Link to="/privacidad" className="text-champagne-gold underline">
            Política de Privacidad para Pasajeros
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
