import apiClient from "./apiClient";

export async function getDashboard() {
  const res = await apiClient.get("/dashboard");
  return res.data;
}
