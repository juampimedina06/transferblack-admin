import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LegalLayout, LegalSection } from './components/LegalLayout';
import { LEGAL_ENTITY } from './constants/legalEntity';

/**
 * Página pública de Términos y Condiciones para Conductores (`/terminos-conductores`).
 * Refleja el Contrato de Intermediación Tecnológica y Deslinde de Responsabilidad
 * utilizado en Transfer Black Conductor.
 */
export default function DriverTermsScreen() {
  useEffect(() => {
    document.title = 'Términos y Condiciones — Conductores · Transfer Black';
  }, []);

  return (
    <LegalLayout
      title="Términos y Condiciones — Conductores"
      updatedAt={LEGAL_ENTITY.effectiveDate}
    >
      <LegalSection title="1. Naturaleza del Servicio e Intermediación Tecnológica">
        <p>
          Transfer Black, operado por <strong>{LEGAL_ENTITY.businessName}</strong>, CUIT{' '}
          <strong>{LEGAL_ENTITY.taxId}</strong>, con domicilio en{' '}
          <strong>{LEGAL_ENTITY.address}</strong>, República Argentina, es una plataforma
          tecnológica de intermediación digital que conecta a conductores independientes con
          usuarios pasajeros que solicitan servicios de traslado.
        </p>
        <p>
          Al registrarte o conectarte en <strong>Transfer Black Conductor</strong>, reconocés y
          aceptás que no existe relación laboral, de empleo ni de subordinación jurídica entre vos
          y Transfer Black, actuando en todo momento de manera autónoma, con vehículo propio o
          autorizado y asumiendo tu propio riesgo empresario.
        </p>
      </LegalSection>

      <LegalSection title="2. Registro, Verificación y Documentación Obligatoria">
        <p>
          Para operar en la Plataforma debés ser mayor de 18 años, crear una cuenta con datos
          veraces, verificar tu correo electrónico y aprobar el proceso de validación documental.
          Te comprometés a mantener siempre vigente y actualizada:
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Licencia Nacional de Conducir profesional habilitante vigente.</li>
          <li>DNI, Cédula Verde o Azul y habilitación municipal/provincial aplicable.</li>
          <li>
            Póliza de seguro automotor vigente con cobertura para terceros y personas
            transportadas, con constancia de pago al día.
          </li>
          <li>Certificado de Inspección Técnica Vehicular (ITV/VTV) vigente.</li>
          <li>
            Vehículo en óptimas condiciones de seguridad, higiene y confort, cumpliendo la Ley
            Nacional de Tránsito N° 24.449 y normativas locales vigentes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Deslinde de Responsabilidad ante Siniestros Viales">
        <p>
          Asumís en forma personal, exclusiva e indelegable la responsabilidad civil,
          contravencional y penal derivada del uso, tenencia y conducción del vehículo asignado a
          los viajes. Transfer Black no responderá por daños patrimoniales, lesiones, incapacidad
          o muerte resultantes de siniestros viales ocurridos antes, durante o después de un viaje.
        </p>
      </LegalSection>

      <LegalSection title="4. Seguridad, Hechos Delictivos y Límites de Responsabilidad">
        <p>
          Transfer Black provee herramientas tecnológicas asistenciales y preventivas
          (geolocalización GPS, seguimiento de viaje, botón SOS con enlace a servicios públicos
          como el 911 y reporte de incidentes). No obstante, la Plataforma no asume responsabilidad
          patrimonial ni indemnizatoria frente a hechos delictivos cometidos por terceros o
          pasajeros (robos, hurtos, agresiones o daños materiales al vehículo), ni ante supuestos
          de caso fortuito o fuerza mayor.
        </p>
      </LegalSection>

      <LegalSection title="5. Transparencia de Tarifas, Comisiones y Liquidaciones">
        <p>
          Al finalizar cada trayecto, la aplicación muestra el desglose completo del viaje: tarifa
          total abonada por el pasajero, comisión retenida por Transfer Black en concepto de
          intermediación tecnológica y ganancia neta correspondiente al conductor. Las
          liquidaciones y retiros se efectivizan según el calendario y medios habilitados en la
          sección de ganancias de la aplicación.
        </p>
      </LegalSection>

      <LegalSection title="6. Política de Cancelaciones y Conducta">
        <p>
          No serás penalizado cuando canceles un viaje por motivos justificados comprobables: (a)
          transcurridos más de 5 minutos de cortesía en el punto de retiro sin que el pasajero se
          presente; (b) si la cantidad de pasajeros o equipaje excede la capacidad reglamentaria
          del vehículo; o (c) ante situaciones de riesgo para tu seguridad. Cancelaciones
          injustificadas reiteradas pueden activar pausas preventivas de despacho o suspensión de
          cuenta.
        </p>
      </LegalSection>

      <LegalSection title="7. Privacidad y Eliminación de Cuenta">
        <p>
          El tratamiento de tus datos personales se rige por nuestra{' '}
          <Link to="/privacidad-conductores" className="text-champagne-gold underline">
            Política de Privacidad para Conductores
          </Link>
          . Podés solicitar la baja definitiva de tu cuenta desde la app (siempre que no tengas
          viajes activos, reservas pendientes, deudas o retiros en curso) o siguiendo los pasos en{' '}
          <Link to="/eliminar-cuenta" className="text-champagne-gold underline">
            Eliminación de cuenta
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="8. Modificaciones, Ley Aplicable y Jurisdicción">
        <p>
          Transfer Black puede actualizar estos Términos para reflejar cambios operativos o
          legales, publicando la nueva versión en esta página y solicitando aceptación cuando
          corresponda. Estos Términos se rigen por las leyes de la República Argentina,
          sometiéndose las partes a los tribunales ordinarios competentes de{' '}
          <strong>{LEGAL_ENTITY.jurisdiction}</strong>.
        </p>
      </LegalSection>

      <LegalSection title="9. Contacto">
        <p>
          Ante cualquier consulta legal u operativa sobre estos Términos, escribinos a{' '}
          <strong>{LEGAL_ENTITY.contactEmail}</strong>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
