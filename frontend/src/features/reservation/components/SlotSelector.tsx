import { Button } from "@/components/ui/button";
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
    <div className="mb-12 border-b border-border pb-8">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6 block text-left">
        1. Moment de la journée
      </label>
      <div className="grid grid-cols-3 p-1.5 bg-secondary rounded-2xl gap-2 w-full max-w-sm mx-auto">
        {(["morning", "afternoon", "day"] as const).map((s) => (
          <Button
            key={s}
            variant="ghost"
            onClick={() => onChange(s)}
            className={`py-3 rounded-xl text-sm font-bold transition-all ${
              slot === s
                ? "bg-card text-primary shadow-sm ring-1 ring-border hover:bg-card hover:text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            }`}
          >
            {LABELS[s]}
          </Button>
        ))}
      </div>
    </div>
  );
}
