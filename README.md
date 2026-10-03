# Transfer Black - Web Admin Panel

Consola de operaciones web centralizada para la flota de **Transfer Black** en Córdoba, Argentina. Esta plataforma permite la supervisión operativa en tiempo real, auditoría y aprobación de conductores, gestión de cuentas corporativas, resolución de retiros bancarios de billeteras, métricas de negocio y seguimiento público de viajes.

---

## 🚀 Tecnologías y Stack

El frontend está desarrollado bajo estándares modernos de rendimiento, tipado estricto y diseño responsive:

- **Framework**: [React 19](https://react.dev/) sobre [Vite 8](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (configuración estricta)
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/) con soporte nativo de modo oscuro (`class`) y paleta de diseño Transfer Black (`obsidian`, `champagne-gold`, `charcoal`, `platinum`)
- **Mapeo en Vivo**: [Leaflet](https://leafletjs.com/) + [React Leaflet v5](https://react-leaflet.js.org/)
- **Tablas de Datos**: [TanStack Table v8](https://tanstack.com/table/latest) con paginación, ordenamiento y renderizado optimizado
- **Estado Asíncrono de Servidor**: [TanStack Query v5](https://tanstack.com/query/latest) con revalidación en segundo plano, cache distribuido y polling
- **Estado Global de Cliente**: [Zustand](https://github.com/pmndrs/zustand) con persistencia en `localStorage` (sesión y preferencias de interfaz)
- **Ruteo**: [React Router DOM v7](https://reactrouter.com/)
- **Formularios y Validaciones**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Visualización de Datos**: [Recharts v3](https://recharts.org/)
- **Animaciones Numéricas**: [React CountUp](https://github.com/glennreyes/react-countup)
- **Tiempo Real y WebSockets**: [Socket.IO Client](https://socket.io/) v4
- **Inspección de Medios**: [React Medium Image Zoom](https://github.com/rpearce/react-medium-image-zoom)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Fechas**: [date-fns v4](https://date-fns.org/)

---

## 📂 Arquitectura del Proyecto

El código está estructurado bajo **Clean Architecture**, desacoplando completamente la lógica de negocio y consumo de servicios (capa `core`) de los componentes visuales y estado de interfaz (capa `presentation`):

```text
admin-web/
├── public/                       # Assets estáticos y logos
├── src/
│   ├── core/                     # Capa de Dominio y Datos (Agnóstica de UI)
│   │   ├── api/                  # Clientes Axios e interceptores
│   │   │   ├── adminApi.ts       # Cliente autenticado (Bearer JWT, timeout, logout ante 401)
│   │   │   └── publicApi.ts      # Cliente público no autenticado para tracking
│   │   ├── auth/                 # Contratos de autenticación y servicios de login
│   │   ├── companies/            # Entidades, schemas Zod y API de empresas corporativas
│   │   ├── dashboard/            # Métricas, KPIs y estadísticas de actividad
│   │   ├── drivers/              # Expedientes, auditoría documental y coordinación de entrevistas
│   │   │   ├── actions/          # getDrivers, getDriverDetail, updateDocument, finalizeMeeting, etc.
│   │   │   ├── interfaces/       # Modelos tipados de conductores, vehículos y legajos
│   │   │   └── utils/            # Resolutores de URLs de medios y formateadores
│   │   ├── payouts/              # Gestión de retiros bancarios de conductores
│   │   │   ├── actions/          # getPayouts, getPayoutById, resolvePayout
│   │   │   └── interfaces/       # Contratos de solicitudes, filtros y resolución
│   │   ├── trips/                # Gestión e historial de viajes de la flota
│   │   │   ├── actions/          # getTrips, getTripDetail, getTripStatusHistory
│   │   │   └── interfaces/       # Contratos de viajes, filtros, auditoría y eventos
│   │   ├── map/                  # Dominio de telemetría y despacho en vivo
│   │   │   ├── actions/          # getFleetLocations, assignDriver, expandRadius, getActiveTrips, getLiveMapKpi
│   │   │   └── interfaces/       # Modelos GeoJSON, propiedades de conductor y DTOs de despacho
│   │   └── tracking/             # Seguimiento público de viajes en vivo
│   │       ├── actions/          # getTripTracking
│   │       └── interfaces/       # Modelos de telemetría, estados de viaje y ruta
│   │
│   ├── presentation/             # Capa de Interfaz de Usuario y Presentación
│   │   ├── auth/                 # Formulario de inicio de sesión y storage de tokens
│   │   │   ├── components/       # OtpInput (código 6 dígitos con paste), PasswordRequirements
│   │   │   └── store/            # authStorage, useAuthStore
│   │   ├── companies/            # Gestión integral de empresas corporativas
│   │   │   ├── components/       # Balance, centros de costo, empleados, cierres y recargas
│   │   │   ├── CompaniesScreen.tsx
│   │   │   └── CompanyDetailScreen.tsx
│   │   ├── components/           # Componentes reutilizables y estructura
│   │   │   ├── common/           # Button, Input, Textarea, Badge, Card, AnimatedNumber
│   │   │   ├── layout/           # PrivateLayout, Sidebar colapsable con badges, Header
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/            # Gráficos y métricas del panel de control
│   │   │   └── components/       # ActivityChart (Recharts), KpiCard, DashboardSkeleton
│   │   ├── drivers/              # Expediente y auditoría de conductores
│   │   │   ├── components/       # DriversTable, DocumentCard con visor, RejectionModal
│   │   │   ├── DriversScreen.tsx
│   │   │   └── DriverDetailScreen.tsx
│   │   ├── map/                  # Consola de operaciones de mapa en vivo (/mapa)
│   │   │   ├── components/       # LiveMapKpiBar, LiveMapCanvas, ActiveTripsPanel, ManualAssignModal
│   │   │   ├── hooks/            # useLiveMap, useLiveMapSocket, useManualAssign, useExpandRadius
│   │   │   └── LiveMapScreen.tsx # Pantalla principal de despacho y telemetría
│   │   ├── payouts/              # Finanzas y resolución de retiros bancarios
│   │   │   ├── components/       # PayoutsTable, PayoutDetailModal, PayoutResolveModal, PayoutsKPIs
│   │   │   ├── hooks/            # usePayouts, usePayoutDetail, useResolvePayout
│   │   │   └── PayoutsScreen.tsx
│   │   ├── trips/                # Gestión e historial de viajes de la flota (/viajes)
│   │   │   ├── components/       # TripsToolbar, TripsTable, TripsBadge, TripDetailDrawer
│   │   │   ├── hooks/            # useTrips, useTripDetail, useTripStatusHistory
│   │   │   └── TripsScreen.tsx
│   │   ├── tracking/             # Pantalla pública de seguimiento (/track)
│   │   │   └── components/       # TripTrackingMap (Leaflet), DriverCard, TripStatusTimeline
│   │   ├── screens/              # Páginas principales (Login, ForgotPasswordScreen, Dashboard, TrackTrip)
│   │   ├── providers/            # TanStack QueryClientProvider
│   │   └── store/                # Stores de UI (useUIStore para Sidebar y tema)
│   ├── App.tsx                   # Declaración de rutas y ruteo protegido
│   └── main.tsx                  # Bootstrap de la aplicación React
```

---

## ✨ Módulos del Sistema

### 1. 🔐 Autenticación y Recuperación de Credenciales
- **Inicio de Sesión**:
  - Formulario de ingreso con validaciones en tiempo real con Zod y React Hook Form.
  - Gestión segura de tokens JWT persistidos en almacenamiento local (`authStorage`).
  - Interceptor centralizado en `adminApi` que detecta expiración de sesión (401) y ejecuta cierre de sesión automático sin bucles.
  - Barrera de seguridad con `ProtectedRoute` que restringe el acceso exclusivamente a usuarios con rol `admin`.
- **Recuperación de Contraseña (`/recuperar-password`)**:
  - Flujo guiado en 3 pasos con diseño institucional Transfer Black split-screen.
  - **Paso 1 (Solicitud)**: Ingreso de correo corporativo para recibir PIN numérico vía `POST /auth/forgot-password` (con respuesta genérica para evitar enumeración de cuentas).
  - **Paso 2 (Verificación de PIN)**: Entrada de código OTP de 6 dígitos numéricos mediante `<OtpInput />` con soporte nativo de pegado rápido (paste), auto-foco secuencial y botón de reenvío con temporizador de enfriamiento (*cooldown* de 60s) vía `POST /auth/reset-password/verify`.
  - **Paso 3 (Nueva Clave)**: Ingreso y confirmación de nueva clave con alternancia de visibilidad (icono de ojo) y checklist interactivo de requisitos de seguridad en tiempo real (`<PasswordRequirements />`: 8+ caracteres, mayúscula, minúscula y número) vía `POST /auth/reset-password`.
  - Limpieza preventiva de sesiones obsoletas en cliente al ingresar y redirección automática al Login tras el reseteo exitoso.

### 2. 📊 Dashboard Operativo (`/dashboard`)
- Indicadores de rendimiento del negocio: Viajes Totales, Facturación Bruta, Comisión de Plataforma y Tasa de Cancelaciones.
- Conteo fluido y animado mediante `<AnimatedNumber />`.
- Selector dinámico de período: **Día**, **Mes** y **Año**.
- Gráfico interactivo de actividad horaria y cancelaciones (`ActivityChart`) implementado con Recharts.
- Transiciones visuales suaves con esqueletos de carga (`DashboardSkeleton`).

### 3. 🚗 Gestión y Expediente de Conductores (`/conductores`)
- **Directorio Principal**: Tabla paginada con buscador por nombre, email o documento, orden cronológico y filtros reactivos por estado (`pending`, `approved`, `rejected`, `suspended`).
- **Expediente Integral (`/conductores/:id`)**:
  - Datos personales, de contacto, licencia y antecedentes penales.
  - Ficha técnica del vehículo asignado: marca, modelo, año, patente y categoría.
- **Auditoría Documental Interactiva**:
  - Inspección de fotos de documentación (DNI, licencia, cédula verde/azul, seguro, RTO) con zoom interactivo (`react-medium-image-zoom`).
  - Detección automática de fechas de vencimiento con alertas visuales de documentos próximos a caducar.
  - Aprobación individual o rechazo con modal explicativo obligatorio (`RejectionModal`).
  - Mutaciones optimistas con rollback automático ante errores de red.
- **Coordinación y Cierre de Entrevistas**:
  - Agendamiento de entrevista presencial con bloqueo automático si existen documentos pendientes de validar.
  - Registro del resultado: `completed`, `no_show` o `cancelled` con notas del operador.
  - Resolución final del legajo: activación operativa o rechazo formal.

### 4. 💵 Finanzas: Retiros y Billeteras (`/retiros`)
- **Cola de Transferencias**: Visualización organizada por pestañas: `Pendientes` (con badge contador en Sidebar), `En gestión`, `Pagadas`, `Rechazadas` y `Todas`.
- **Métricas Financieras en Tiempo Real**: Tarjetas KPI que calculan el monto acumulado en cola de pago y el volumen de solicitudes pendientes.
- **Datos Bancarios Congelados**: Exhibición de los datos de destino congelados al momento de solicitar el retiro (Titular, CUIT/DNI, Alias y CBU/CVU de 22 dígitos).
- **Copiado en 1 Clic**: Acciones directas para copiar CBU/CVU o Alias al portapapeles con confirmación visual (`"Copiado"`), eliminando errores manuales en Home Banking.
- **Ciclo de Resolución Bancaria**:
  - *En gestión (`approved`)*: Coloca la solicitud en proceso para coordinar la transferencia bancaria y evitar duplicación entre administradores.
  - *Marcar como Pagado (`paid`)*: Modal de confirmación que exige el ingreso del código de referencia bancaria (`transfer_reference`) y permite adjuntar la URL del comprobante (`receipt_url`).
  - *Rechazar Retiro (`rejected`)*: Modal con campo de motivo obligatorio (`rejection_reason`), contador de caracteres y sugerencias rápidas autocompletables con un solo clic.

### 5. 🏢 Gestión de Empresas Corporativas (`/empresas`)
- **Listado y Alta de Empresas**: Creación con razón social, CUIT, email de facturación, dirección y código de vinculación (`join_code`).
- **Ficha Integral de Cuenta Corporativa (`/empresas/:companyId`)**:
  - **Balance y Recargas**: Control de saldo prepago/postpago, modal de recarga (`TopUpModal`) con referencia y tabla de depósitos.
  - **Límites de Consumo**: Edición interactiva del tope mensual de gastos de la empresa.
  - **Centros de Costo**: Creación y asignación de centros de costo para segmentar los gastos de la empresa.
  - **Nómina de Miembros**: Directorio de colaboradores vinculados, edición de límites individuales, centros de costos asignados y estados de cuenta.
  - **Cierres de Período y Facturación**: Emisión de cierres de cuenta corriente, estados de facturación mensual y desglose de consumos.

### 6. 📍 Seguimiento Público de Viajes (`/track?token=...`)
- **Acceso para Invitados**: Pantalla pública optimizada para terceros que no requieren inicio de sesión, accesible vía enlaces distribuidos por WhatsApp o email.
- **Cliente HTTP Autónomo (`publicApi`)**: Consume `GET /rides/track/{token}` sin adjuntar credenciales ni disparar cierres de sesión del panel.
- **Mapa en Vivo**: Representación cartográfica interactiva con Leaflet mostrando la ubicación del móvil, punto de partida, punto de destino y trazado de ruta.
- **Línea de Tiempo**: Estados secuenciales del viaje (`requested`, `driver_assigned`, `driver_arrived`, `in_progress`, `completed`).
- **Ficha del Conductor**: Visualización del nombre del conductor, calificación, modelo de vehículo y patente.
- **Sondeo Inteligente**: Polling automático cada 5 segundos mientras el viaje permanezca activo, deteniéndose ante estados terminales.

### 7. 🗺 Mapa en Vivo y Despacho Operativo (`/mapa`)
- **Monitoreo de Flota en Tiempo Real**: Visualización interactiva sobre mapa cartográfico oscuro (CARTO Dark Matter) sin restricciones ni bloqueos de servidores voluntarios.
- **Marcadores Vehiculares por Estado**:
  - 🟢 **Verde brillante**: Conductor en línea y disponible para recibir viajes.
  - 🟡 **Ámbar / Dorado brillante**: Conductor ocupado en viaje activo.
  - ⚪ / ⚫ **Gris neutro**: Conductor desconectado.
  - Al presionar cada vehículo se despliega un popup detallado con datos del conductor, calificación promedio, total de viajes, vehículo, patente, viaje en curso y hora de última señal de telemetría.
- **Sincronización WebSocket (Socket.IO)**:
  - Autenticación mediante token Bearer JWT de administrador.
  - Escucha reactiva de eventos `driver.location.updated` para animación fluida de posiciones en mapa.
  - Escucha de `dashboard.metrics.updated` y ciclo de vida de viajes (`trip.searching`, `trip.assigned`, `trip.in_progress`, etc.) para actualización instantánea sin recarga manual.
  - Reconexión resiliente con re-sincronización automática de estado vía endpoints REST (`/admin/locations`, `/admin/rides`, `/admin/dashboard`).
- **Barra Superior de Métricas KPI**:
  - Contadores animados (`<AnimatedNumber />`) de conductores en línea, conductores en viaje, viajes en curso, buscando conductor y desconectados.
  - Filtro instantáneo de la flota al tocar cada métrica.
  - Alerta visual en viajes en búsqueda con tiempo de espera superior a 3 minutos.
- **Panel Lateral de Operaciones y Despacho Manual**:
  - Tarjetas de viajes activos con indicación de origen, destino, pasajero, chofer y tiempos transcurridos.
  - **Asignación Manual**: Modal de selección de choferes en línea con buscador reactivo por nombre, teléfono o patente, disparando `POST /api/v1/admin/trips/:tripId/assign-driver` con control de concurrencia y validación pesimista.
  - **Ampliación de Radio**: Disparo de nueva ronda de búsqueda geoespacial PostGIS incremental (`POST /api/v1/admin/trips/:tripId/expand-radius`), descartando conductores previamente consultados.

---

## 🛠 Instalación y Puesta en Marcha

### Prerrequisitos
- [Node.js](https://nodejs.org/) v18+ (recomendado v20+)
- Gestor de paquetes `npm`

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone https://github.com/juampimedina06/transferblack-admin.git
cd transferblack-admin
npm install
```

### 2. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto a partir de `.env.example`:
```env
VITE_API_URL=https://transfer-black-api.onrender.com/api/v1
VITE_MAP_TILES_URL=
```
> **Nota técnica:** `VITE_API_URL` debe incluir la base de versión `/api/v1`. `VITE_MAP_TILES_URL` es opcional para proveedores de cartografía personalizados en Leaflet.

### 3. Ejecutar en modo desarrollo:
```bash
npm run dev
```
La aplicación iniciará habitualmente en `http://localhost:5173`.

### 4. Compilación para Producción:
```bash
npm run build
```
Ejecuta la validación exhaustiva de tipos de TypeScript (`tsc -b`) y empaqueta la versión optimizada en el directorio `dist/`.

### 5. Análisis de Calidad de Código:
```bash
npm run lint
```

---

## 🎨 Guía de Estilo y Filosofía UX/UI

- **Diseño sin Fricción**: Cada acción crítica (copiar CBU, aprobar documentos, pasar a gestión) está optimizada para ejecutarse en la menor cantidad de pasos posibles y con confirmación inmediata.
- **Animación y Dinamismo**: Los números contables y KPIs se incrementan suavemente mediante animación para reflejar actualización continua.
- **Soporte Dark & Light Mode**: Toda la aplicación soporta alternancia de temas mediante clases semánticas de Tailwind, garantizando contraste accesible y legibilidad.
- **Manejo Defensivo de Datos**: Todos los campos opcionales o provenientes de bases de datos externas admiten valores nulos (`null`) mostrando fallbacks limpios sin interrupciones de renderizado.