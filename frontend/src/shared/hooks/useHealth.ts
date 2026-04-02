import { useState } from "react";
import { checkHealth } from "../services/healthService";

interface HealthResponse {
  message: string;
  status: "success" | "error";
}

export function useHealth() {
  const [response, setResponse] = useState<HealthResponse | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const testBackend = async () => {
    setIsTesting(true);
    setResponse(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const message = await checkHealth();
      setResponse({ message, status: "success" });
    } catch {
      setResponse({
        message: "Le serveur distant ne répond pas. Vérifiez votre configuration réseau.",
        status: "error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return { response, isTesting, testBackend };
}
