import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

interface Props {
  message: { text: string; type: "success" | "error" } | null;
}

export function StatusMessage({ message }: Props) {
  if (!message) return null;
  return (
    <div
      className={`mt-6 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 ${
        message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"
      }`}
    >
      {message.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
      {message.text}
    </div>
  );
}
