import apiClient from "./apiClient";

/**
 * Unified auth — POST /auth/login with mode "LOGIN" or "SIGNUP".
 * Stores JWT on success.
 */
export async function authenticate(email, password, mode = "LOGIN") {
  const response = await apiClient.post("/auth/login", { email, password, mode });
  const token = response.data.token;
  localStorage.setItem("token", token);
  return token;
}
