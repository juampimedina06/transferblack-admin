# Transfer Black - Web Admin Panel

Consola de operaciones web para la flota de Transfer Black en Córdoba. Este panel permite la supervisión operativa, aprobación y gestión de conductores, monitoreo de métricas en tiempo real, liquidaciones y administración general de la plataforma.

## 🚀 Tecnologías

El frontend está construido con las siguientes herramientas modernas:

- **Framework**: [React 19](https://react.dev/) montado sobre [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/) con soporte nativo de modo oscuro (`class`) y paleta personalizada (obsidian, champagne-gold)
- **Estado de Servidor**: [TanStack Query v5](https://tanstack.com/query/latest) para fetching asíncrono, cache y revalidación
- **Estado Global de Cliente**: [Zustand](https://github.com/pmndrs/zustand) (autenticación y configuración de UI)
- **Ruteo**: [React Router DOM v7](https://reactrouter.com/)
- **Formularios & Validación**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)

## 📂 Arquitectura

El proyecto sigue los principios de **Clean Architecture**, desacoplando la lógica de negocio de la capa de presentación y manteniendo simetría conceptual con los demás clientes de la plataforma:

```text
src/
├── core/                  # Lógica de negocio y acceso a datos (agnóstico de UI)
│   ├── api/               # Cliente Axios e interceptores centralizados (adminApi)
│   ├── auth/              # Interfaces y acciones de autenticación
│   ├── dashboard/         # Interfaces y acciones para métricas y KPIs
│   └── drivers/           # Interfaces y acciones de gestión y expediente de conductores
│       ├── actions/       # Acciones atómicas de API (listado, detalle, documentos, reuniones)
│       ├── interfaces/    # Contratos y tipos de datos de conductor, vehículos y legajos
│       └── utils/         # Helpers de formateo y resolución de URLs de medios
│
├── presentation/          # Capa de interfaz de usuario y estado visual
│   ├── auth/store/        # Store de autenticación (Zustand con persistencia)
│   ├── components/        # Layout principal y componentes base (Button, Input, Badge, Card, etc.)
│   ├── dashboard/         # Componentes y hooks de métricas (KPIs, gráficos, skeletons)
│   ├── drivers/           # Vistas, tablas, expediente, auditoría documental y modales
│   │   ├── components/    # Subcomponentes (DriverDetail, DocumentCard, RejectionModal, Skeletons)
│   │   └── hooks/         # Custom hooks de TanStack Query (useDrivers, useDriverDetail)
│   ├── hooks/             # Hooks globales de UI y monitoreo (useServerHealth)
│   ├── providers/         # Proveedores de contexto global (QueryProvider)
│   ├── screens/           # Páginas completas (Login, Dashboard, DriversScreen)
│   └── store/             # Store de interfaz de usuario (tema claro/oscuro, sidebar colapsable)
```

## ✨ Módulos y Funcionalidades

- **🔐 Autenticación & Autorización**:
  - Validación de credenciales en cliente con Zod.
  - Manejo de sesiones y tokens JWT persistidos en `localStorage`.
  - Enrutamiento protegido (`ProtectedRoute`) restringido al rol `admin`.
- **📊 Dashboard Operativo**:
  - Métricas clave en tiempo real: total de viajes, facturación bruta, comisión de plataforma y ratio de cancelaciones.
  - Indicadores con conteo animado fluido (`AnimatedNumber`).
  - Filtro dinámico por período (Hoy, Últimos 7 días, Últimos 30 días, Este mes).
  - Gráfico interactivo de actividad de viajes y cancelaciones (`ActivityChart`).
  - Skeletons de carga integrados para transiciones suaves.
- **🚗 Gestión y Expediente de Conductores**:
  - **Directorio Principal**: listado paginado, búsqueda por nombre/documento y filtrado reactivo por estado.
  - **Expediente Integral (`DriverDetailScreen`)**:
    - Ficha completa del postulante/conductor: datos personales, licencia, antecedentes, vehículo y fecha de postulación.
    - Skeletons de carga optimizados (`DriverDetailSkeleton`).
  - **Auditoría Documental Interactiva**:
    - Inspección visual de documentos de conductor y vehículo (`DocumentCard`) con preview y visor ampliado.
    - Aprobación inmediata y rechazo motivado mediante modal estructurado (`RejectionModal`).
    - Detección visual automática de documentación vencida o próxima a expirar.
    - Mutaciones optimistas con rollback automático en caso de falla de red.
  - **Coordinación y Cierre de Entrevistas**:
    - Agendamiento de reunión presencial con validación de requisitos previos (bloqueo si restan documentos pendientes).
    - Gestión del ciclo de vida de la entrevista: `completed`, `no_show` o `cancelled` con notas del administrador.
  - **Resolución de Legajo**:
    - Aprobación o rechazo definitivo del legajo del conductor con sincronización en tiempo real vía TanStack Query.
- **🎨 Sistema de Diseño y UI**:
  - Soporte completo de temas Claro y Oscuro con tokens Tailwind armonizados.
  - Biblioteca de componentes base accesibles y reutilizables (`Button`, `Input`, `Textarea`, `Badge`, `Card`, `AnimatedNumber`).
  - Monitoreo en vivo del estado del backend (`useServerHealth`).

## 🛠 Instalación y Uso

1. **Clonar e instalar dependencias:**
   ```bash
   cd admin-web
   npm install
   ```

2. **Variables de entorno:**
   Crear un archivo `.env` en la raíz de `admin-web` a partir de `.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor iniciará habitualmente en `http://localhost:5173`.

4. **Verificación de tipos y Build para Producción:**
   ```bash
   npm run build
   ```

5. **Linter:**
   ```bash
   npm run lint
   ```
