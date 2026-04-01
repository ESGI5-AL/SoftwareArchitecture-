import { FiZap } from "react-icons/fi";
import { ROWS, SPOTS_PER_ROW, SLOT_TO_API } from "../constants";
import type { Reservation, ParkingSpot } from "../types";
import type { SlotType } from "../hooks/useReservations";

interface Props {
  selectedSpot: string | null;
  selectedDates: string[];
  slot: SlotType;
  spots: ParkingSpot[];
  reservations: Reservation[];
  onSpotSelect: (id: string) => void;
}

export function ParkingGrid({ selectedSpot, selectedDates, slot, spots, reservations, onSpotSelect }: Props) {
  return (
    <div
      className={`mb-12 transition-all duration-500 ${
        selectedDates.length === 0 ? "opacity-30 pointer-events-none" : ""
      }`}
    >
      <div className="flex justify-between mb-8">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">
          3. Choisir votre place disponible
        </label>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-amber-500">
            <FiZap /> Electrique
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-2 h-2 rounded bg-indigo-600"></div> Sélectionnée
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-8">
        <div className="w-full flex items-center justify-start gap-3 text-slate-300 font-black text-xs mb-2 pl-4">
          <div className="bg-slate-200 p-1.5 rounded-lg text-white">↓</div>
          <span>ENTRÉE</span>
        </div>

        <div className="w-full space-y-4 max-w-2xl mx-auto">
          {ROWS.map((row) => (
            <div key={row} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-4 sm:w-6 text-[10px] sm:text-sm font-black text-slate-300 text-center">
                  {row}
                </span>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {Array.from({ length: SPOTS_PER_ROW }, (_, i) => {
                    const id = `${row}${(i + 1).toString().padStart(2, "0")}`;
                    const isElectric = row === "A" || row === "F";
                    const isSelected = selectedSpot === id;
                    const spotUuid = spots.find((s) => s.spotNumber === id)?.id;
                    const isTaken =
                      !!spotUuid &&
                      reservations.some(
                        (r) =>
                          r.spotId === spotUuid &&
                          r.slot === SLOT_TO_API[slot] &&
                          selectedDates.includes(r.date)
                      );

                    return (
                      <button
                        key={id}
                        onClick={() => onSpotSelect(id)}
                        disabled={isTaken}
                        className={`group relative h-9 w-9 sm:h-12 sm:w-12 flex items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all duration-300 active:scale-90 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : isTaken
                            ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                            : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/30"
                        }`}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-tighter">{id}</span>
                        {isElectric && (
                          <FiZap
                            className={`absolute top-0.5 right-0.5 text-[7px] sm:text-[8px] ${
                              isSelected ? "text-indigo-200" : isTaken ? "text-slate-200" : "text-amber-400"
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="w-4 sm:w-6 text-[10px] sm:text-sm font-black text-slate-300 text-center">
                  {row}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center justify-end gap-3 text-slate-300 font-black text-xs mt-2 pr-4">
          <span>SORTIE</span>
          <div className="bg-slate-200 p-1.5 rounded-lg text-white">↓</div>
        </div>
      </div>
    </div>
  );
}
