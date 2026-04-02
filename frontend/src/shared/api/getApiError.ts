import axios from "axios";

export function getApiError(error: unknown, fallback = "Une erreur est survenue."): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data?.error && typeof data.error === "string") return data.error;
    if (data?.message && typeof data.message === "string") return data.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
