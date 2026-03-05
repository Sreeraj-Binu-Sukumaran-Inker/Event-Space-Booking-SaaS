import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const getTenantByDomain = async (domain: string) => {
  const response = await axios.get(`${API_URL}/public/tenant/domain/${domain}`);
  return response.data.data;
};
