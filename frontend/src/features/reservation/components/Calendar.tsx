import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
    <div className="mb-12 border-b border-slate-50 pb-8">
      <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8 block">
        2. Sélectionner les dates ({selectedDates.length}/5)
      </label>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-100 mb-6 w-fit mx-auto">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
          >
            <FiChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-indigo-950 px-4 min-w-[140px] text-center capitalize">
            {viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-95"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              className="text-[10px] font-black text-slate-300 text-center uppercase tracking-tighter"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(viewDate).map((dateObj, idx) => {
            if (!dateObj) return <div key={`empty-${idx}`} />;

            const dateStr = dateObj.toISOString().split("T")[0];
            const isSelected = selectedDates.includes(dateStr);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <button
                key={dateStr}
                onClick={() => onDateSelect(dateStr)}
                disabled={isWeekend || isPast}
                className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 border-2 ${
                  isSelected
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                    : isWeekend || isPast
                    ? "bg-slate-50 border-transparent text-slate-200 cursor-not-allowed"
                    : isToday
                    ? "bg-white border-indigo-200 text-indigo-600 ring-4 ring-indigo-50/50"
                    : "bg-white border-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/30"
                }`}
              >
                {dateObj.getDate()}
                {isToday && !isSelected && (
                  <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
