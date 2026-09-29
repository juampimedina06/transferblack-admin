import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Tuneles de ngrok para probar /track desde un celular. El punto inicial
    // habilita cualquier subdominio (ngrok cambia la URL en cada sesion).
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
  },
});
