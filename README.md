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
│   └── drivers/           # Interfaces y acciones de gestión de conductores
│
├── presentation/          # Capa de interfaz de usuario y estado visual
│   ├── auth/store/        # Store de autenticación (Zustand con persistencia)
│   ├── components/        # Layout principal (Header, Sidebar, PrivateLayout) y comunes
│   ├── dashboard/         # Componentes y hooks de métricas (KPIs, gráficos, skeletons)
│   ├── drivers/           # Vistas, tablas, badges y hooks del módulo de conductores
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
- **🚗 Directorio de Conductores**:
  - Listado estructurado con paginación, filtros y búsqueda.
  - Badges de estado visual con código de colores (Activo, Pendiente, Suspendido, Inactivo).
  - Consulta y sincronización eficiente mediante TanStack Query.
- **🎨 Sistema de UI y Temas**:
  - Modo oscuro y modo claro conmutables y recordados en el navegador.
  - Barra lateral colapsable con accesos rápidos y estado del servicio en vivo.

## 🛠 Instalación y Uso

1. **Clonar e instalar dependencias:**
   ```bash
   cd admin-web
   npm install
   ```

2. **Variables de entorno:**
<<<<<<< HEAD
   Crear un archivo `.env` en la raíz de `admin-web` basándose en `.env.example`:
=======
   Crear un archivo `.env` en la raíz de `admin-web` a partir de `.env.example`:
>>>>>>> origin/main
   ```env
   VITE_API_URL=https://transfer-black-api.onrender.com/api/v1
   VITE_MAP_TILES_URL=
   ```
   `VITE_API_URL` ya debe incluir el prefijo de version (`/api/v1`); todos los clientes HTTP del
   panel arman sus rutas relativas a esa base. `VITE_MAP_TILES_URL` es opcional y solo la usa el
   mapa de la pagina publica de seguimiento (ver mas abajo).

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor iniciará habitualmente en `http://localhost:5173`.

4. **Verificación de tipos y Build para Producción:**
   ```bash
   npm run build
   ```
## 🔐 Autenticación

El panel está restringido al equipo de operaciones. El ingreso requiere credenciales con el rol de `admin`.
- Al iniciar sesión, se validan los campos localmente con Zod.
- Se hace un POST a `/auth/login` y, si es exitoso, el token se guarda en el `localStorage`.
- El componente `ProtectedRoute` bloquea el acceso si no hay sesión o si el usuario no tiene el rol de administrador. Las rutas privadas son inaccesibles manualmente o mediante el historial si el usuario no cumple los requisitos.

## 📍 Página pública de seguimiento (`/track`)

Cuando alguien pide un viaje para un tercero sin cuenta (invitado), el backend le manda por email o
WhatsApp un link con la forma `https://<dominio-del-panel>/track?token=<tracking_token>`. Esa ruta:

- Vive **fuera** de `ProtectedRoute`, igual que `/login`: un navegador sin sesión de admin debe poder
  verla, y no toca `useAuthStore` ni `authStorage` en ningún momento.
- Consume `GET /rides/track/{token}` con `publicApi` (`src/core/api/publicApi.ts`), un cliente Axios
  separado de `adminApi` que no agrega el `Authorization` del panel ni desloguea ante un 401 (ese
  interceptor asume una sesión de admin que un invitado nunca tiene).
- Sondea el viaje cada 5 segundos mientras está activo, y deja de hacerlo al llegar a un estado
  terminal (`completed`/`cancelled`) o si el token ya no existe (`404`).

Para que el link funcione:

1. El backend debe tener `TRIP_TRACKING_URL=https://<dominio-del-panel>/track` apuntando al origen
   donde se despliega este panel.
2. Ese mismo origen tiene que estar en `CORS_ALLOWED_ORIGINS` del backend, o el navegador del
   invitado va a bloquear la llamada a `GET /rides/track/{token}`.
3. El hosting que sirva el panel necesita una regla de *rewrite* de SPA (`/* → /index.html`), porque
   `/track?token=...` se abre como entrada directa (desde el link, no navegando dentro de la app) y
   sin esa regla el servidor devuelve un 404 antes de que React Router la resuelva. Este repo no trae
   ese archivo de configuración porque depende de dónde se despliegue (Vercel, Netlify, Render
   static, etc.); hay que agregarlo en el hosting elegido.
5. **Linter:**
   ```bash
   npm run lint
   ```