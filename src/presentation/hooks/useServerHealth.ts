import { useEffect } from 'react';
import { adminApi } from '../../core/api/adminApi';

export const useServerHealth = () => {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // `/health` vive en la raiz del backend, fuera de `/api/v1`.
        const healthUrl = `${String(import.meta.env.VITE_API_URL ?? '').replace(/\/api\/v1\/?$/, '')}/health`;
        await adminApi.get(healthUrl);
        console.log(` Conexión con el servidor backend exitosa! (${import.meta.env.VITE_API_URL})`);
      } catch {
        console.error(` Error crítico: No se pudo conectar al servidor backend en: ${import.meta.env.VITE_API_URL}`);
      }
    };

    checkConnection();
  }, []);
};
