import { useEffect, useState } from "react";
import api from "../../../shared/api/client";
import type { Reservation, ParkingSpot } from "../types";
import { SLOT_TO_API } from "../constants";

export type SlotType = "morning" | "afternoon" | "day";

export function useReservations() {
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [slot, setSlot] = useState<SlotType>("day");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReservations = async () => {
    try {
      const { data } = await api.get<Reservation[]>("/reservations");
      setReservations(data);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };

  useEffect(() => {
    api
      .get<ParkingSpot[]>("/parking-spots/all")
      .then(({ data }) => setSpots(data))
      .catch((err) => console.error("Erreur chargement places :", err));
    fetchReservations();
  }, []);

  const isSlotReserved = (date: string, uiSlot: SlotType): boolean => {
    if (!selectedSpot) return false;
    const spotUuid = spots.find((s) => s.spotNumber === selectedSpot)?.id;
    if (!spotUuid) return false;
    return reservations.some(
      (r) => r.date === date && r.slot === SLOT_TO_API[uiSlot] && r.spotId === spotUuid
    );
  };

  const handleSpotSelect = (id: string) => {
    setSelectedSpot((prev) => (prev === id ? null : id));
  };

  const handleDateSelect = (date: string) => {
    const d = new Date(date);
    if (d.getDay() === 0 || d.getDay() === 6) return;
    if (isSlotReserved(date, slot)) return;

    setSelectedDates((prev) => {
      if (prev.includes(date)) return prev.filter((d) => d !== date);
      if (prev.length >= 5) {
        setMessage({ text: "Max 5 jours par réservation.", type: "error" });
        setTimeout(() => setMessage(null), 3000);
        return prev;
      }
      return [...prev, date];
    });
  };

  const handleSubmit = async () => {
    if (!selectedSpot || selectedDates.length === 0) {
      setMessage({ text: "Veuillez sélectionner une place et au moins une date.", type: "error" });
      return;
    }

    const spotUuid = spots.find((s) => s.spotNumber === selectedSpot)?.id;
    if (!spotUuid) {
      setMessage({ text: "Place introuvable, veuillez réessayer.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedDates.map((date) =>
          api.post("/reservations", { date, slot: SLOT_TO_API[slot], spotId: spotUuid })
        )
      );
      setMessage({ text: "Réservations effectuées !", type: "success" });
      fetchReservations();
      setSelectedDates([]);
      setSelectedSpot(null);
    } catch {
      setMessage({ text: " Erreur de connexion.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const changeSlot = (newSlot: SlotType) => {
    setSlot(newSlot);
    setSelectedDates([]);
    setSelectedSpot(null);
  };

  return {
    selectedSpot,
    selectedDates,
    slot,
    reservations,
    spots,
    message,
    isSubmitting,
    isSlotReserved,
    handleSpotSelect,
    handleDateSelect,
    handleSubmit,
    changeSlot,
  };
}
