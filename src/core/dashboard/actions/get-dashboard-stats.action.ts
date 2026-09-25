import { adminApi } from '../../api/adminApi';
import { DashboardStatsSchema, type DashboardStats, type DashboardStatsParams } from '../interfaces/dashboard-stats.interface';

export const getDashboardStatsAction = async (params: DashboardStatsParams): Promise<DashboardStats> => {
  const queryParams: Record<string, string> = {
    periodo: params.periodo,
  };
  if (params.fecha) {
    queryParams.fecha = params.fecha;
  }

  const { data } = await adminApi.get('/admin/dashboard/stats', { params: queryParams });
  
  // Validamos que la data del backend cumpla el contrato
  const result = DashboardStatsSchema.safeParse(data);
  if (!result.success) {
    console.error('Error validando el contrato de /dashboard/stats:', result.error);
    throw new Error('Formato de datos inválido desde el servidor');
  }
  
  return result.data;
};
