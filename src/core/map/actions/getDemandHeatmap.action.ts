import { adminApi } from '../../api/adminApi';

export interface DemandHeatmap {
  from: string;
  to: string;
  total: number;
  points: { lat: number; lng: number; weight: number }[];
}

/** Subidas de los viajes pedidos en los ultimos `days` dias (`GET /admin/demand-heatmap`). */
export const getDemandHeatmap = async (days = 30): Promise<DemandHeatmap> => {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const { data } = await adminApi.get<{ data: DemandHeatmap }>('/admin/demand-heatmap', {
    params: { from: from.toISOString(), to: to.toISOString() },
  });
  return data.data;
};
