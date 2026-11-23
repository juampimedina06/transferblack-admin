import { adminApi } from '../api/adminApi';

export interface SearchPersonHit {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
}

export interface GlobalSearchResult {
  trips: { id: string; public_code: string; status: string; created_at: string }[];
  drivers: SearchPersonHit[];
  passengers: SearchPersonHit[];
}

/** `GET /admin/search`: viajes por codigo y conductores/pasajeros por nombre, email o telefono. */
export const globalSearch = async (q: string, signal?: AbortSignal): Promise<GlobalSearchResult> => {
  const { data } = await adminApi.get<{ data: GlobalSearchResult }>('/admin/search', { params: { q }, signal });
  return data.data;
};
