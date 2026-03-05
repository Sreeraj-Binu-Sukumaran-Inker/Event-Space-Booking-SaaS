import api from "./api";

export interface TenantSettings {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  customDomain: string | null;
  activeLayout: string;
  plan: {
    id: string;
    name: string;
    availableLayouts: string[];
  } | null;
}

export const getMySettings = async (): Promise<TenantSettings> => {
  const res = await api.get("/tenant/settings");
  return res.data.data;
};

export const updateMySettings = async (data: Partial<TenantSettings>): Promise<TenantSettings> => {
  const res = await api.patch("/tenant/settings", data);
  return res.data.data;
};
