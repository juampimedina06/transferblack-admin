import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { authStorage } from '../../auth/store/authStorage';
import type { LiveMapMetrics, DriverLocationProperties } from '../../../core/map/interfaces/live-map.interface';

interface UseLiveMapSocketOptions {
  onDriverLocationUpdated?: (data: {
    driverId: string;
    latitude: number;
    longitude: number;
    availabilityStatus?: 'online' | 'in_trip' | 'offline';
    properties?: Partial<DriverLocationProperties>;
  }) => void;
  onMetricsUpdated?: (data: Partial<LiveMapMetrics>) => void;
  onTripStatusUpdated?: (tripData: unknown) => void;
  onReconnect?: () => void;
}

export const useLiveMapSocket = ({
  onDriverLocationUpdated,
  onMetricsUpdated,
  onTripStatusUpdated,
  onReconnect,
}: UseLiveMapSocketOptions = {}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (!token) return;

    // Obtener la URL base del socket a partir de VITE_API_URL o window.location
    const apiUrl = import.meta.env.VITE_API_URL || 'https://transfer-black-api.onrender.com/api/v1';
    const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');

    const socket = io(baseUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Unirse al canal operativo si es necesario (el backend normalmente añade a 'admin' por token)
      socket.emit('join:admin');
    });

    socket.on('reconnect', () => {
      if (onReconnect) {
        onReconnect();
      }
    });

    // Eventos en tiempo real
    socket.on('driver.location.updated', (data) => {
      if (onDriverLocationUpdated) {
        onDriverLocationUpdated(data);
      }
    });

    socket.on('dashboard.metrics.updated', (data) => {
      if (onMetricsUpdated) {
        onMetricsUpdated(data);
      }
    });

    // Eventos de estado de viajes
    const tripEvents = [
      'trip.searching',
      'trip.assigned',
      'trip.driver_arriving',
      'trip.driver_arrived',
      'trip.in_progress',
      'trip.completed',
      'trip.cancelled',
      'trip:status_changed',
    ];

    tripEvents.forEach((eventName) => {
      socket.on(eventName, (data) => {
        if (onTripStatusUpdated) {
          onTripStatusUpdated(data);
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
  };
};
