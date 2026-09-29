import { useEffect } from 'react';
import { adminApi } from '../../core/api/adminApi';

export const useServerHealth = () => {
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await adminApi.get('').catch(err => {
          if (err.response) return err.response;
          throw err;
        });
        console.log(` Conexión con el servidor backend exitosa! (${import.meta.env.VITE_API_URL})`);
      } catch {
        console.error(` Error crítico: No se pudo conectar al servidor backend en: ${import.meta.env.VITE_API_URL}`);
      }
    };

    checkConnection();
  }, []);
};
