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
   Crear un archivo `.env` en la raíz de `admin-web` basándose en la configuración de desarrollo/producción:
   ```env
   VITE_API_URL=
   ```

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
