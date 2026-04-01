import type { SlotType } from "../hooks/useReservations";

interface Props {
  slot: SlotType;
  onChange: (slot: SlotType) => void;
}

const LABELS: Record<SlotType, string> = {
  morning: "Matin",
  afternoon: "Après-midi",
  day: "Journée",
};

export function SlotSelector({ slot, onChange }: Props) {
  return (
    <div className="mb-12 border-b border-slate-50 pb-8">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 block text-left">
        1. Moment de la journée
      </label>
      <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl gap-2 w-full max-w-sm mx-auto">
        {(["morning", "afternoon", "day"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`py-3 rounded-xl text-sm font-bold transition-all ${
              slot === s
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
