import { useEffect, useState } from "react";
import api from "../../../shared/api/client";
import type { Reservation, ParkingSpot } from "../types";
import { SLOT_TO_API } from "../constants";
import { useAuth } from "../../auth/hooks/useAuth";

export type SlotType = "morning" | "afternoon" | "day";

export function useReservations() {
  const { user } = useAuth();
  const maxDays = user?.role === "manager" ? 30 : 5;

  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [slot, setSlot] = useState<SlotType>("day");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
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

  const fetchMyReservations = async () => {
    try {
      const { data } = await api.get<Reservation[]>("/reservations/my");
      setMyReservations(data);
    } catch (error) {
      console.error("Erreur chargement mes réservations :", error);
    }
  };

  useEffect(() => {
    api
      .get<ParkingSpot[]>("/parking-spots/all")
      .then(({ data }) => setSpots(data))
      .catch((err) => console.error("Erreur chargement places :", err));
    fetchReservations();
    fetchMyReservations();
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
      if (prev.length >= maxDays) {
        setMessage({ text: `Max ${maxDays} jours par réservation.`, type: "error" });
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
      fetchMyReservations();
      setSelectedDates([]);
      setSelectedSpot(null);
    } catch {
      setMessage({ text: "Erreur de connexion.", type: "error" });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCheckIn = async (reservationId: string) => {
    try {
      await api.patch(`/reservations/${reservationId}/check-in`);
      setMessage({ text: "Check-in effectué !", type: "success" });
      fetchMyReservations();
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setMessage({ text: "Erreur lors du check-in.", type: "error" });
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
    myReservations,
    spots,
    message,
    isSubmitting,
    maxDays,
    isSlotReserved,
    handleSpotSelect,
    handleDateSelect,
    handleSubmit,
    handleCheckIn,
    changeSlot,
  };
}
