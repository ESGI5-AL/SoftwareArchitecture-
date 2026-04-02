import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservations } from '../hooks/useReservations';
import type { Reservation, ParkingSpot } from '../types';

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../shared/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../../../shared/api/getApiError', () => ({
  getApiError: (e: unknown) => (e instanceof Error ? e.message : 'Erreur inconnue'),
}));

import { useAuth } from '../../auth/hooks/useAuth';
import api from '../../../shared/api/client';

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockApi = api as { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };

const makeSpot = (spotNumber: string, id: string): ParkingSpot => ({
  id,
  spotNumber,
  hasCharger: spotNumber.startsWith('A') || spotNumber.startsWith('F'),
});

const makeReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'res-1',
  date: '2026-04-10',
  slot: 'AM',
  spotId: 'spot-uuid-b01',
  spotNumber: 'B01',
  status: 'pending',
  ...overrides,
});

describe('useReservations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { role: 'employee', id: 'u1', name: 'Alice', email: 'a@b.com' } });
    mockApi.get.mockResolvedValue({ data: [] });
    mockApi.post.mockResolvedValue({ data: {} });
    mockApi.patch.mockResolvedValue({ data: {} });
  });

  describe('maxDays selon le rôle', () => {
    it('retourne maxDays = 5 pour un employé', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'employee' } });
      const { result } = renderHook(() => useReservations());
      expect(result.current.maxDays).toBe(5);
    });

    it('retourne maxDays = 30 pour un manager', () => {
      mockUseAuth.mockReturnValue({ user: { role: 'manager' } });
      const { result } = renderHook(() => useReservations());
      expect(result.current.maxDays).toBe(30);
    });
  });

  describe('handleSpotSelect', () => {
    it('sélectionne une place', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleSpotSelect('A01'));
      expect(result.current.selectedSpot).toBe('A01');
    });

    it('désélectionne si on clique deux fois sur la même place', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleSpotSelect('A01'));
      act(() => result.current.handleSpotSelect('A01'));
      expect(result.current.selectedSpot).toBeNull();
    });
  });

  describe('handleDateSelect', () => {
    it('ignore les weekends (samedi)', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleDateSelect('2026-04-04')); // Samedi
      expect(result.current.selectedDates).toHaveLength(0);
    });

    it('ignore les weekends (dimanche)', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleDateSelect('2026-04-05')); // Dimanche
      expect(result.current.selectedDates).toHaveLength(0);
    });

    it('ajoute une date de semaine valide', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleDateSelect('2026-04-07')); // Lundi
      expect(result.current.selectedDates).toContain('2026-04-07');
    });

    it('désélectionne une date déjà sélectionnée', () => {
      const { result } = renderHook(() => useReservations());
      act(() => result.current.handleDateSelect('2026-04-07'));
      act(() => result.current.handleDateSelect('2026-04-07'));
      expect(result.current.selectedDates).toHaveLength(0);
    });

    it(`bloque la sélection quand maxDays est atteint (employee = 5)`, () => {
      mockUseAuth.mockReturnValue({ user: { role: 'employee' } });
      const { result } = renderHook(() => useReservations());

      const dates = ['2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-13'];
      act(() => dates.forEach((d) => result.current.handleDateSelect(d)));
      expect(result.current.selectedDates).toHaveLength(5);

      act(() => result.current.handleDateSelect('2026-04-14'));
      expect(result.current.selectedDates).toHaveLength(5);
      expect(result.current.message?.type).toBe('error');
    });
  });

  describe('changeSlot', () => {
    it('change le slot et réinitialise les sélections', () => {
      const { result } = renderHook(() => useReservations());

      act(() => {
        result.current.handleSpotSelect('B01');
        result.current.handleDateSelect('2026-04-07');
      });
      act(() => result.current.changeSlot('morning'));

      expect(result.current.slot).toBe('morning');
      expect(result.current.selectedDates).toHaveLength(0);
      expect(result.current.selectedSpot).toBeNull();
    });
  });

  describe('isSlotReserved', () => {
    it('retourne false si aucune place n\'est sélectionnée', () => {
      const { result } = renderHook(() => useReservations());
      expect(result.current.isSlotReserved('2026-04-07', 'day')).toBe(false);
    });

    it('retourne true si le créneau est déjà réservé pour la place sélectionnée', async () => {
      const spot = makeSpot('B01', 'spot-uuid-b01');
      const reservation = makeReservation({ date: '2026-04-07', slot: 'FULL', spotId: 'spot-uuid-b01' });

      mockApi.get.mockImplementation((url: string) => {
        if (url === '/parking-spots/all') return Promise.resolve({ data: [spot] });
        if (url === '/reservations') return Promise.resolve({ data: [reservation] });
        return Promise.resolve({ data: [] });
      });

      const { result } = renderHook(() => useReservations());

      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });

      act(() => result.current.handleSpotSelect('B01'));

      expect(result.current.isSlotReserved('2026-04-07', 'day')).toBe(true);
    });
  });

  describe('handleSubmit', () => {
    it("affiche une erreur si aucune place ou date n'est sélectionnée", async () => {
      const { result } = renderHook(() => useReservations());
      await act(async () => result.current.handleSubmit());
      expect(result.current.message?.type).toBe('error');
    });

    it('appelle api.post pour chaque date sélectionnée', async () => {
      const spot = makeSpot('B01', 'spot-uuid-b01');
      mockApi.get.mockImplementation((url: string) => {
        if (url === '/parking-spots/all') return Promise.resolve({ data: [spot] });
        return Promise.resolve({ data: [] });
      });

      const { result } = renderHook(() => useReservations());
      await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

      act(() => {
        result.current.handleSpotSelect('B01');
        result.current.handleDateSelect('2026-04-07');
        result.current.handleDateSelect('2026-04-08');
      });

      await act(async () => result.current.handleSubmit());

      expect(mockApi.post).toHaveBeenCalledTimes(2);
      expect(mockApi.post).toHaveBeenCalledWith('/reservations', expect.objectContaining({ spotId: 'spot-uuid-b01' }));
    });

    it('affiche un message de succès après une réservation réussie', async () => {
      const spot = makeSpot('B01', 'spot-uuid-b01');
      mockApi.get.mockImplementation((url: string) => {
        if (url === '/parking-spots/all') return Promise.resolve({ data: [spot] });
        return Promise.resolve({ data: [] });
      });

      const { result } = renderHook(() => useReservations());
      await act(async () => { await new Promise((r) => setTimeout(r, 0)); });

      act(() => {
        result.current.handleSpotSelect('B01');
        result.current.handleDateSelect('2026-04-07');
      });

      await act(async () => result.current.handleSubmit());

      expect(result.current.message?.type).toBe('success');
    });
  });
});
