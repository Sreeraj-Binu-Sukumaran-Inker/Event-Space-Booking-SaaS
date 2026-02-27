export interface Tenant {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: "ACTIVE" | "SUSPENDED";
  domain: string;
  createdAt: string;
  updatedAt: string;
}