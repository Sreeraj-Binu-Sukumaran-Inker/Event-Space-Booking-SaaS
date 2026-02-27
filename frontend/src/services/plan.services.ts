import api from "./api";

export interface Plan {
  id: string;
  name: string;
  price: number;
  tenantLimit: number;
  eventSpaceLimit: number;
  staffLimit: number;
  features: string[];
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  subscriberCount: number;
  
}

export type CreatePlanPayload = Omit<Plan, "id" | "createdAt" | "subscriberCount"> ;

export type PlanListItem = Pick<
  Plan,
  "id" | "name" | "price" | "tenantLimit" | "eventSpaceLimit" | "staffLimit" | "status"
>;

export type PlanDetails = Omit<Plan, "createdAt">;

export const getPlans = async (): Promise<Plan[]> => {
  const res = await api.get("/plans");
  return res.data;
};

export const createPlan = async (data: CreatePlanPayload): Promise<Plan> => {
  const res = await api.post("/plans", data);
  return res.data;
};

export const updatePlan = async (
  id: string,
  data: Partial<CreatePlanPayload>
): Promise<Plan> => {
  const res = await api.patch(`/plans/${id}`, data);
  return res.data;
};

export const deletePlan = async (id: string): Promise<{ message: string }> => {
  const res = await api.delete(`/plans/${id}`);
  return res.data;
};