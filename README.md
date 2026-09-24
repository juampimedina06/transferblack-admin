# Transfer Black - Web Admin Panel

Consola de operaciones web para la flota de Transfer Black en Córdoba. Este panel permite la aprobación de conductores, monitoreo de viajes en curso, liquidaciones y la gestión de cuentas corporativas.

## 🚀 Tecnologías

El frontend está construido con las siguientes herramientas modernas:

- **Framework**: [React 18](https://react.dev/) montado sobre [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Ruteo**: [React Router DOM v6](https://reactrouter.com/)
- **Formularios & Validación**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)

## 📂 Arquitectura

El proyecto sigue lineamientos de **Clean Architecture**, dividiendo las responsabilidades para mantener el código escalable y simétrico con la aplicación móvil (Conductor):

```text
src/
├── core/                  # Lógica de negocio independiente de la UI
│   ├── api/               # Configuración de Axios e interceptores (adminApi)
│   └── auth/              # Acciones e interfaces (DTOS) de autenticación
│
├── presentation/          # Capa de visualización (UI) y estado de la app
│   ├── auth/store/        # Store de Zustand y persistencia (localStorage)
│   ├── components/        # Componentes reutilizables y Guards (ProtectedRoute)
│   └── screens/           # Pantallas completas (Login, Dashboard, etc.)
```

## 🛠 Instalación y Uso

1. **Clonar e instalar dependencias:**
   ```bash
   cd admin-web
   npm install
   ```

2. **Variables de entorno:**
   Crear un archivo `.env` en la raíz de `admin-web` basándose en `.env.example`:
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
   El servidor iniciará generalmente en `http://localhost:5173`.

4. **Construir para Producción:**
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
