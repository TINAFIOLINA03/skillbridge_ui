import apiClient from "./apiClient";

export async function getOutcomes(learningId) {
  const res = await apiClient.get(`/learning/${learningId}/apply`);
  return res.data;
}

export async function createOutcome(learningId, description, type) {
  const res = await apiClient.post(`/learning/${learningId}/apply`, {
    description,
    type,
  });
  return res.data;
}

export async function deleteOutcome(learningId, outcomeId) {
  await apiClient.delete(`/learning/${learningId}/apply/${outcomeId}`);
}
