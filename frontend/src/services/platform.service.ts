import api from "./api";

export interface CreateTenantPayload {
  name: string;
  planId: string;
  adminId?: string; // made optional as modal doesn't send it, might be appended later
  email?: string;
  phone?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}


export interface BackendTenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  plan?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantsResponse {
  success: boolean;
  data: BackendTenant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getTenants = async () => {
  const response = await api.get<TenantsResponse>(
    "/platform/tenants?page=1&limit=100"
  );

  return response.data;
};

export const getTenantById = async (id: string) => {
  const response = await api.get(`/platform/tenants/${id}`);
  return response.data.data; // because backend sends { success, data }
};

export const createTenant = async (data: CreateTenantPayload) => {
  const response = await api.post("/platform/tenants", data);
  return response.data.data;
};

export const updateTenant = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    planId?: string;
    status?: "ACTIVE" | "SUSPENDED";
  }
) => {
  const response = await api.put(`/platform/tenants/${id}`, data);
  return response.data.data;
};

export const toggleTenantStatus = async (id: string) => {
  const response = await api.patch(`/platform/tenants/${id}/status`);
  return response.data.data;
};

// Change Password of tenan admin by Super Admin
export const changeTenantAdminPassword = async (
  id: string,
  data: { newPassword: string; confirmPassword: string }
) => {
  const response = await api.patch(`/platform/tenants/${id}/password`, data);
  return response.data;
};

