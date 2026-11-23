import { adminApi } from '../api/adminApi';

export interface ServiceTypePricing {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  base_fare: string;
  daytime_fraction_fare: string;
  nighttime_fraction_fare: string;
  distance_fraction_meters: number;
  fare_multiplier: string;
  platform_fee_percent: string;
  minimum_fare: string;
  currency: string;
}

export interface PricingSettings {
  default_minimum_fare: string;
  service_types: ServiceTypePricing[];
}

export type ServiceTypePricingChanges = Partial<
  Pick<
    ServiceTypePricing,
    | 'base_fare'
    | 'daytime_fraction_fare'
    | 'nighttime_fraction_fare'
    | 'distance_fraction_meters'
    | 'fare_multiplier'
    | 'platform_fee_percent'
    | 'minimum_fare'
    | 'is_active'
  >
>;

export const getPricingSettings = async (): Promise<PricingSettings> => {
  const { data } = await adminApi.get<{ data: PricingSettings }>('/admin/settings/pricing');
  return data.data;
};

export const updateServiceTypePricing = async (id: string, changes: ServiceTypePricingChanges): Promise<ServiceTypePricing> => {
  const { data } = await adminApi.patch<{ data: ServiceTypePricing }>(`/admin/settings/service-types/${id}`, changes);
  return data.data;
};
