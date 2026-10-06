import { useEffect } from 'react';
import { LegalLayout, LegalSection } from './components/LegalLayout';

const UPDATED_AT = '[FECHA DE VIGENCIA]';

/**
 * Pagina publica de Terminos y Condiciones (`/terminos`). La referencia la
 * app en el registro y en Mi cuenta, y Mercado Pago/las tiendas pueden
 * enlazarla directamente: no requiere sesion.
 */
export default function TermsScreen() {
  useEffect(() => {
    document.title = 'Términos y Condiciones · Transfer Black';
  }, []);

  return (
    <LegalLayout title="Términos y Condiciones" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Objeto">
        <p>
          Estos Términos y Condiciones regulan el uso de la aplicación móvil y los servicios de
          Transfer Black (en adelante, "la Plataforma" o "el Servicio"), operados por{' '}
          <strong>[RAZÓN SOCIAL]</strong>, CUIT <strong>[CUIT]</strong>, con domicilio en{' '}
          <strong>[DOMICILIO]</strong>, República Argentina. Transfer Black conecta pasajeros con
          conductores habilitados para la prestación de servicios de remis y transfer dentro del
          área de cobertura de la ciudad de Córdoba y zonas aledañas.
        </p>
        <p>
          Al crear una cuenta o usar la Plataforma, aceptás estos Términos en su totalidad. Si no
          estás de acuerdo, no debés usar el Servicio.
        </p>
      </LegalSection>

      <LegalSection title="2. Registro y cuenta">
        <p>
          Para solicitar viajes necesitás crear una cuenta con tu nombre, email y teléfono, y
          verificar tu identidad mediante un código (PIN) enviado por email. Sos responsable de
          mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu
          cuenta. Debés tener al menos 18 años para registrarte.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso del servicio">
        <p>
          La Plataforma te permite cotizar un viaje, elegir un medio de pago, ser conectado con un
          conductor disponible y seguir el viaje en tiempo real hasta su finalización. Transfer
          Black actúa como intermediario tecnológico entre pasajeros y conductores: la prestación
          efectiva del traslado está a cargo del conductor asignado.
        </p>
        <p>
          La disponibilidad de conductores depende de la demanda y la zona; no garantizamos que
          siempre haya un conductor disponible de forma inmediata.
        </p>
      </LegalSection>

      <LegalSection title="4. Tarifas y medios de pago">
        <p>
          La tarifa de cada viaje se muestra antes de confirmarlo y puede pagarse con Mercado
          Pago, en efectivo al conductor, o, si tu cuenta corporativa lo habilita, con el saldo
          prepago de tu empresa. Los pagos con Mercado Pago son procesados por Mercado Pago S.A.;
          Transfer Black no almacena los datos de tu tarjeta.
        </p>
        <p>
          Cuando pagás con Mercado Pago, el viaje queda pendiente de confirmación hasta que el
          pago se acredita, lo que puede demorar algunos segundos.
        </p>
      </LegalSection>

      <LegalSection title="5. Cancelaciones y reembolsos">
        <p>
          Podés cancelar un viaje antes de que el conductor llegue al punto de encuentro. Si
          cancelás dentro de los primeros 5 minutos desde la confirmación y pagaste con Mercado
          Pago, el reembolso se procesa automáticamente. Pasado ese plazo, o si el conductor ya
          llegó al punto de encuentro, la cancelación puede estar sujeta a una penalidad y el
          reembolso se gestiona mediante un reclamo con nuestro equipo de soporte.
        </p>
        <p>
          Para los viajes reservados con pago anticipado, el reembolso por cancelación se
          gestiona mediante un reclamo con la agencia. Si no se encuentra un conductor disponible
          para tu viaje, la reserva se cancela automáticamente y el pago se reembolsa en su
          totalidad.
        </p>
      </LegalSection>

      <LegalSection title="6. Conducta del usuario">
        <p>
          Al usar la Plataforma te comprometés a brindar información veraz, tratar con respeto a
          los conductores y demás usuarios, y no usar el Servicio para fines ilícitos. Nos
          reservamos el derecho de suspender o eliminar cuentas que incumplan estos Términos o que
          generen abusos del Servicio (viajes fraudulentos, acoso, uso indebido del chat, entre
          otros).
        </p>
      </LegalSection>

      <LegalSection title="7. Responsabilidad">
        <p>
          Transfer Black pone a disposición la tecnología para conectar pasajeros y conductores,
          pero no es responsable por hechos ocurridos durante el traslado que estén fuera de su
          control directo, sin perjuicio de la normativa de defensa del consumidor aplicable. Los
          conductores que operan en la Plataforma cuentan con la habilitación y los seguros
          exigidos por la normativa vigente para la prestación del servicio de remis/transfer.
        </p>
      </LegalSection>

      <LegalSection title="8. Viajes para terceros">
        <p>
          Podés solicitar un viaje para que lo realice otra persona ("invitado") en tu nombre. En
          ese caso sos responsable de la veracidad de los datos del invitado que proporciones y
          de informarle las condiciones del viaje. El cobro del viaje se realiza siempre a tu
          cuenta, independientemente de quién lo utilice.
        </p>
      </LegalSection>

      <LegalSection title="9. Reservas de otros servicios por WhatsApp">
        <p>
          Algunos servicios adicionales (grúa, colectivo, flete y otros) se gestionan fuera de la
          Plataforma, a través de WhatsApp, y no forman parte del servicio de remis/transfer
          cotizado dentro de la aplicación. Esas solicitudes se coordinan y contratan
          directamente con el prestador correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="10. Eliminación de la cuenta">
        <p>
          Podés solicitar la eliminación de tu cuenta desde la aplicación, ingresando tu
          contraseña para confirmar la solicitud. No se puede eliminar una cuenta con un viaje
          activo o una reserva próxima en curso. Al eliminar tu cuenta, anonimizamos tus datos
          personales y revocamos tus sesiones y notificaciones; conservamos los registros de
          viajes y movimientos de pago que estamos obligados a mantener por normativa contable e
          impositiva.
        </p>
      </LegalSection>

      <LegalSection title="11. Modificaciones de estos Términos">
        <p>
          Podemos actualizar estos Términos para reflejar cambios en el Servicio o en la
          normativa aplicable. Publicaremos la versión vigente en esta misma página, indicando la
          fecha de la última actualización. El uso continuado de la Plataforma después de una
          modificación implica su aceptación.
        </p>
      </LegalSection>

      <LegalSection title="12. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes de la República Argentina. Para cualquier
          controversia derivada de su interpretación o cumplimiento, las partes se someten a los
          tribunales ordinarios competentes de la ciudad de Córdoba, sin perjuicio de las normas
          de protección al consumidor que resulten de aplicación.
        </p>
      </LegalSection>

      <LegalSection title="13. Contacto">
        <p>
          Si tenés consultas sobre estos Términos, podés escribirnos a{' '}
          <strong>[EMAIL DE CONTACTO]</strong>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
