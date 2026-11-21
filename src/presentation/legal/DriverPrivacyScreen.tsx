import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from './components/LegalLayout';
import { LEGAL_ENTITY } from './constants/legalEntity';

/**
 * Página pública de Política de Privacidad para Conductores (`/privacidad-conductores`).
 * Enlazada desde Transfer Black Conductor (registro, perfil, centro de seguridad)
 * y declarada en Google Play Console / App Store Connect.
 */
export default function DriverPrivacyScreen() {
  useEffect(() => {
    document.title = 'Política de Privacidad — Conductores · Transfer Black';
  }, []);

  return (
    <LegalLayout
      title="Política de Privacidad — Conductores"
      updatedAt={LEGAL_ENTITY.effectiveDate}
    >
      <LegalSection title="1. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de tus datos personales es{' '}
          <strong>{LEGAL_ENTITY.businessName}</strong>, CUIT{' '}
          <strong>{LEGAL_ENTITY.taxId}</strong>, con domicilio en{' '}
          <strong>{LEGAL_ENTITY.address}</strong>, República Argentina ("Transfer Black",
          "nosotros"). Esta Política describe qué datos recolectamos a través de la aplicación{' '}
          <strong>Transfer Black Conductor</strong>, para qué los usamos, cómo los protegemos y
          qué derechos tenés sobre ellos conforme a la Ley 25.326 de Protección de Datos
          Personales.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <p>Para operar como conductor habilitado en la Plataforma recolectamos:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Datos de identificación y contacto:</strong> nombre, apellido, correo
            electrónico, número de teléfono y foto de perfil.
          </li>
          <li>
            <strong>Documentación habilitante y del vehículo:</strong> fotografías o archivos de
            tu DNI, Licencia Nacional de Conducir profesional, Cédula Verde o Azul, Póliza de
            Seguro vigente, certificado ITV/VTV, habilitación municipal/provincial y fotos y datos
            del vehículo (marca, modelo, año, color, dominio/patente).
          </li>
          <li>
            <strong>Datos de ubicación en primer y segundo plano:</strong> recopilamos tu
            ubicación GPS precisa mientras estás conectado en servicio,{' '}
            <strong>incluso cuando la aplicación está cerrada o no está en uso</strong>, para
            asignarte viajes cercanos, calcular recorridos y tarifas, ofrecer navegación giro a
            giro, mostrar tu progreso al pasajero y activar herramientas de seguridad/SOS.
          </li>
          <li>
            <strong>Telemetría de viaje y seguridad:</strong> velocidad, rumbo, rutas recorridas,
            horarios de conexión, reportes de incidentes y alertas de emergencia (SOS).
          </li>
          <li>
            <strong>Datos financieros y liquidaciones:</strong> historial de viajes, tarifas,
            comisiones, ganancias netas y datos de cuenta bancaria o CBU/alias necesarios para
            acreditar retiros y liquidaciones.
          </li>
          <li>
            <strong>Comunicaciones y dispositivo:</strong> mensajes intercambiados en el chat con
            pasajeros durante viajes activos, tokens de notificaciones push y registros técnicos
            para diagnóstico de errores.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Finalidades del tratamiento">
        <p>Utilizamos tus datos exclusivamente para:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Verificar tu identidad, tu documentación legal y la habilitación de tu vehículo.</li>
          <li>Conectarte con solicitudes de viaje cercanas y habilitar la navegación giro a giro.</li>
          <li>Calcular distancias, tarifas, comisiones y liquidar tus ganancias.</li>
          <li>
            Brindar seguimiento en tiempo real al pasajero asignado y asistencia ante emergencias
            o incidentes en ruta.
          </li>
          <li>Enviarte alertas operativas, ofertas de viaje y avisos de vencimiento documental.</li>
          <li>Cumplir obligaciones legales, regulatorias, contables e impositivas.</li>
          <li>Prevenir fraudes, suplantación de identidad y usos indebidos de la Plataforma.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Ubicación en segundo plano y permisos del dispositivo">
        <p>
          Transfer Black Conductor solicita acceso a la ubicación{' '}
          <strong>"Todo el tiempo" (segundo plano)</strong> únicamente mientras te encontrás en
          línea o con un viaje activo. Si te desconectás de la app, el rastreo en segundo plano se
          detiene. También solicitamos acceso a la <strong>cámara</strong> y a la{' '}
          <strong>galería de fotos</strong> para cargar tu foto de perfil y tu documentación
          obligatoria, y permiso de <strong>notificaciones</strong> para avisarte de nuevos viajes.
          Podés revocar cualquiera de estos permisos en cualquier momento desde los ajustes de tu
          dispositivo, aunque hacerlo puede impedir operar en línea.
        </p>
      </LegalSection>

      <LegalSection title="5. Con quién compartimos tus datos">
        <p>No vendemos tus datos personales. Solo compartimos la información estrictamente necesaria con:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Pasajeros asignados:</strong> tu nombre, foto de perfil, calificación, datos
            del vehículo (modelo, color y patente) y tu ubicación en tiempo real durante el viaje.
          </li>
          <li>
            <strong>Google Maps Platform y Google Navigation SDK:</strong> coordenadas y rutas
            para mapas, geocodificación y navegación giro a giro.
          </li>
          <li>
            <strong>Servicios de infraestructura y almacenamiento seguro (AWS S3 y hosting):</strong>{' '}
            almacenamiento cifrado de documentos, imágenes y bases de datos.
          </li>
          <li>
            <strong>Firebase / Expo Push Notifications:</strong> entrega de notificaciones
            operativas y alertas de viaje.
          </li>
          <li>
            <strong>Autoridades públicas competentes:</strong> únicamente ante requerimiento legal
            o judicial válido, o en el marco de una emergencia reportada.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Plazo de conservación">
        <p>
          Conservamos tus datos y documentación mientras tu cuenta de conductor esté activa. Si
          eliminás tu cuenta, anonimizamos tus datos personales, revocamos tus sesiones y
          eliminamos tus credenciales de acceso, conservando únicamente los registros de viajes,
          liquidaciones y comprobantes exigidos por la normativa contable, fiscal y de transporte
          durante los plazos legales aplicables.
        </p>
      </LegalSection>

      <LegalSection title="7. Derechos ARCO y eliminación de cuenta">
        <p>
          Conforme a la Ley 25.326, tenés derecho a acceder, rectificar, actualizar y solicitar la
          supresión de tus datos personales escribiendo a{' '}
          <strong>{LEGAL_ENTITY.contactEmail}</strong>. También podés eliminar tu cuenta en
          cualquier momento desde la aplicación (<strong>Perfil → Eliminar cuenta</strong>) o
          consultando el procedimiento web en{' '}
          <Link to="/eliminar-cuenta" className="text-champagne-gold underline">
            Eliminación de cuenta y datos
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Seguridad y transferencias internacionales">
        <p>
          Implementamos cifrado en tránsito (HTTPS/TLS), almacenamiento seguro de tokens y control
          de acceso restringido para resguardar tu documentación y datos personales. Algunos
          proveedores tecnológicos (como Google Maps Platform, AWS o servicios de notificaciones)
          pueden procesar datos en servidores fuera de la República Argentina bajo estándares
          adecuados de seguridad y confidencialidad.
        </p>
      </LegalSection>

      <LegalSection title="9. Cambios a esta Política y contacto">
        <p>
          Podemos actualizar esta Política para reflejar cambios operativos o normativos. La
          versión vigente siempre estará publicada en esta página. Para consultas o reclamos
          escribinos a <strong>{LEGAL_ENTITY.contactEmail}</strong>. También podés dirigirte a la
          Agencia de Acceso a la Información Pública (AAIP), órgano de control de la Ley 25.326.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
