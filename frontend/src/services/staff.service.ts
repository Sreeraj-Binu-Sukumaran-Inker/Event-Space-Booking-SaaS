import api from "./api";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: "STAFF";
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ResetStaffPasswordPayload {
  newPassword: string;
}

export const getStaff = async (): Promise<Staff[]> => {
  const res = await api.get("/staff");
  return res.data.data;
};

export const createStaff = async (data: CreateStaffPayload): Promise<Staff> => {
  const res = await api.post("/staff", data);
  return res.data.data;
};

export const updateStaff = async (
  id: string,
  data: UpdateStaffPayload
): Promise<Staff> => {
  const res = await api.patch(`/staff/${id}`, data);
  return res.data.data;
};

export const resetStaffPassword = async (
  id: string,
  data: ResetStaffPasswordPayload
): Promise<{ message: string }> => {
  const res = await api.patch(`/staff/${id}/password`, data);
  return res.data;
};

export const deleteStaff = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/staff/${id}`);
  return res.data;
};
