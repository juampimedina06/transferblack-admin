import { useEffect } from 'react';
import { LegalLayout, LegalSection } from './components/LegalLayout';

const UPDATED_AT = '[FECHA DE VIGENCIA]';

/**
 * Pagina publica de Politica de Privacidad (`/privacidad`). Se referencia
 * desde el registro y Mi cuenta de la app, y desde las tiendas de apps.
 */
export default function PrivacyScreen() {
  useEffect(() => {
    document.title = 'Política de Privacidad · Transfer Black';
  }, []);

  return (
    <LegalLayout title="Política de Privacidad" updatedAt={UPDATED_AT}>
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es{' '}
          <strong>[RAZÓN SOCIAL]</strong>, CUIT <strong>[CUIT]</strong>, con domicilio en{' '}
          <strong>[DOMICILIO]</strong>, República Argentina ("Transfer Black", "nosotros"). Esta
          Política describe qué datos recolectamos a través de la aplicación del pasajero, para
          qué los usamos y qué derechos tenés sobre ellos, de acuerdo con la Ley 25.326 de
          Protección de Datos Personales.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <p>Recolectamos las siguientes categorías de datos:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Datos de identificación y contacto:</strong> nombre, email y número de
            teléfono, provistos al registrarte.
          </li>
          <li>
            <strong>Datos de ubicación:</strong> tu ubicación en primer plano (para armar el
            viaje y seguir al conductor) y en segundo plano durante un viaje activo (para que el
            conductor pueda encontrarte y para brindar soporte ante incidentes).
          </li>
          <li>
            <strong>Datos de pago:</strong> el resultado de tus pagos (aprobado, pendiente,
            rechazado) y el medio utilizado. Los datos de tu tarjeta son procesados directamente
            por Mercado Pago: nosotros no los almacenamos ni tenemos acceso a ellos.
          </li>
          <li>
            <strong>Datos del dispositivo y notificaciones:</strong> identificadores técnicos
            necesarios para enviarte notificaciones push sobre el estado de tus viajes.
          </li>
          <li>
            <strong>Datos del chat:</strong> los mensajes que intercambiás con el conductor
            durante un viaje, para coordinar el encuentro y resolver dudas puntuales.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalidades">
        <p>Usamos tus datos para:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Crear y gestionar tu cuenta, y verificar tu identidad.</li>
          <li>Conectarte con un conductor disponible y hacer seguimiento del viaje.</li>
          <li>Procesar pagos y emitir comprobantes.</li>
          <li>Enviarte notificaciones sobre el estado de tus viajes.</li>
          <li>Brindar soporte ante consultas, reclamos o incidentes.</li>
          <li>Cumplir obligaciones legales, contables e impositivas.</li>
          <li>Mejorar la Plataforma y prevenir fraudes o usos indebidos.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base legal y consentimiento">
        <p>
          Tratamos tus datos en base al consentimiento que nos das al registrarte y aceptar esta
          Política, y en base a la ejecución del contrato de servicio que se genera al solicitar
          un viaje. La ubicación en segundo plano se solicita con un permiso específico del
          sistema operativo, que podés revocar en cualquier momento desde la configuración de tu
          dispositivo; si lo hacés, algunas funciones del Servicio pueden dejar de funcionar
          correctamente.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién compartimos tus datos">
        <p>Compartimos tus datos únicamente en la medida necesaria para prestar el Servicio:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Conductores:</strong> tu nombre, ubicación y datos de contacto necesarios
            para realizar el viaje.
          </li>
          <li>
            <strong>Mercado Pago:</strong> los datos necesarios para procesar tus pagos.
          </li>
          <li>
            <strong>Google Maps Platform:</strong> para calcular direcciones, rutas y
            geolocalización.
          </li>
          <li>
            <strong>Firebase / servicios de notificaciones push:</strong> para enviarte avisos
            sobre tus viajes.
          </li>
          <li>
            <strong>Proveedor de email:</strong> para enviarte el código de verificación y otras
            comunicaciones transaccionales.
          </li>
          <li>
            <strong>Sentry:</strong> registro técnico de errores de la aplicación, para poder
            detectarlos y corregirlos.
          </li>
          <li>
            <strong>Proveedor de hosting:</strong> alojamiento de nuestra infraestructura y
            bases de datos.
          </li>
        </ul>
        <p>No vendemos tus datos personales a terceros.</p>
      </LegalSection>

      <LegalSection title="6. Plazo de conservación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si eliminás tu cuenta,
          anonimizamos tus datos personales y conservamos únicamente los registros de viajes y
          movimientos de pago que estamos obligados a mantener por normativa contable e
          impositiva, durante el plazo que esa normativa exige.
        </p>
      </LegalSection>

      <LegalSection title="7. Tus derechos (acceso, rectificación, actualización y supresión)">
        <p>
          De acuerdo con la Ley 25.326, tenés derecho a acceder a tus datos personales, a
          solicitar su rectificación o actualización si son incorrectos, y a solicitar su
          supresión cuando corresponda ("derechos ARCO"). Podés ejercer estos derechos
          escribiéndonos a <strong>[EMAIL DE CONTACTO]</strong>, acreditando tu identidad.
          Responderemos tu solicitud dentro de los plazos que establece la normativa vigente.
        </p>
      </LegalSection>

      <LegalSection title="8. Eliminación de tu cuenta desde la app">
        <p>
          Podés solicitar la eliminación de tu cuenta directamente desde la aplicación (sección
          Mi cuenta), confirmando con tu contraseña. No se puede eliminar una cuenta con un viaje
          activo o una reserva próxima pendiente. Al confirmar la eliminación, anonimizamos tus
          datos personales, revocamos tus sesiones y notificaciones push, y conservamos los
          registros contables que la normativa exige, sin datos que te identifiquen
          directamente.
        </p>
      </LegalSection>

      <LegalSection title="9. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra
          accesos no autorizados, pérdida o alteración, incluyendo el cifrado de las
          comunicaciones y el acceso restringido a la información personal dentro de nuestro
          equipo.
        </p>
      </LegalSection>

      <LegalSection title="10. Menores de edad">
        <p>
          El Servicio está destinado a personas mayores de 18 años. No recolectamos
          intencionalmente datos de menores de edad. Si tomamos conocimiento de que un menor
          creó una cuenta, la eliminaremos.
        </p>
      </LegalSection>

      <LegalSection title="11. Transferencias internacionales">
        <p>
          Algunos de los proveedores que mencionamos en la sección 5 (por ejemplo, Google Maps
          Platform, Firebase o Sentry) pueden procesar datos en servidores ubicados fuera de la
          Argentina. En esos casos, exigimos a esos proveedores niveles de protección adecuados
          para tus datos personales.
        </p>
      </LegalSection>

      <LegalSection title="12. Cambios a esta Política">
        <p>
          Podemos actualizar esta Política para reflejar cambios en el Servicio o en la
          normativa aplicable. Publicaremos la versión vigente en esta misma página, indicando la
          fecha de la última actualización.
        </p>
      </LegalSection>

      <LegalSection title="13. Contacto y autoridad de control">
        <p>
          Para consultas sobre esta Política o el tratamiento de tus datos, escribinos a{' '}
          <strong>[EMAIL DE CONTACTO]</strong>. También tenés derecho a presentar una denuncia
          ante la Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley
          25.326, si considerás que tus derechos no fueron respetados.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
