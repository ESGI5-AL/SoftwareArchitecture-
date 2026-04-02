import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAYS } from "../constants";

interface Props {
  selectedDates: string[];
  viewDate: Date;
  getDaysInMonth: (date: Date) => (Date | null)[];
  changeMonth: (offset: number) => void;
  onDateSelect: (date: string) => void;
}

export function Calendar({ selectedDates, viewDate, getDaysInMonth, changeMonth, onDateSelect }: Props) {
  return (
    <div className="mb-12 border-b border-border pb-8">
      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 block">
        2. Sélectionner les dates ({selectedDates.length}/5)
      </label>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center gap-1 bg-secondary p-1 rounded-2xl border border-border mb-6 w-fit mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(-1)}
            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-card active:scale-95"
          >
            <ChevronLeft size={20} />
          </Button>
          <span className="text-sm font-black text-foreground px-4 min-w-35 text-center capitalize">
            {viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => changeMonth(1)}
            className="rounded-xl text-muted-foreground hover:text-primary hover:bg-card active:scale-95"
          >
            <ChevronRight size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              className="text-[10px] font-black text-muted-foreground/50 text-center uppercase tracking-tighter"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(viewDate).map((dateObj, idx) => {
            if (!dateObj) return <div key={`empty-${idx}`} />;

            const pad = (n: number) => String(n).padStart(2, "0");
            const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
            const isSelected = selectedDates.includes(dateStr);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
            const isToday = dateStr === todayStr;

            return (
              <button
                key={dateStr}
                onClick={() => onDateSelect(dateStr)}
                disabled={isWeekend || isPast}
                className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/10"
                    : isWeekend || isPast
                    ? "bg-muted border-transparent text-muted-foreground/30 cursor-not-allowed"
                    : isToday
                    ? "bg-card border-primary/30 text-primary ring-4 ring-primary/10"
                    : "bg-card border-border text-foreground hover:border-primary/30 hover:bg-accent/30"
                }`}
              >
                {dateObj.getDate()}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
