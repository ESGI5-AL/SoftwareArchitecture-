import api from "../api/client";

export async function checkHealth(): Promise<string> {
  const { data } = await api.get("/health");
  return data.status;
}
