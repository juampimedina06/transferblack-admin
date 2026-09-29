import axios from 'axios';

/**
 * Cliente HTTP para endpoints publicos, sin sesion de operaciones. Lo usa la
 * pagina de seguimiento de viaje (`/track`), que abre un invitado desde un
 * link de WhatsApp o email sin haber iniciado sesion en el panel.
 *
 * A diferencia de `adminApi`, no interpone el token del panel ni cierra la
 * sesion de admin ante un 401: ese interceptor asume una sesion que un
 * invitado nunca tiene, y aplicarlo aca lo desloguearia sin motivo.
 */
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Render "duerme" el backend sin trafico; la primera respuesta puede
  // tardar cerca de un minuto y este link se abre de forma esporadica.
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
