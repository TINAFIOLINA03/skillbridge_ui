import apiClient from "./apiClient";

export async function getLearningList() {
  const res = await apiClient.get("/learning");
  return res.data;
}

export async function getLearningById(id) {
  const res = await apiClient.get(`/learning/${id}`);
  return res.data;
}

export async function createLearning(title, category) {
  const res = await apiClient.post("/learning", { title, category });
  return res.data;
}

export async function updateLearning(id, title, category) {
  const res = await apiClient.put(`/learning/${id}`, { title, category });
  return res.data;
}

export async function deleteLearning(id) {
  await apiClient.delete(`/learning/${id}`);
}
