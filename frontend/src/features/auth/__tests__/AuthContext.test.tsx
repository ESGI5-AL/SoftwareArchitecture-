import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '../AuthContext';
import { useContext } from 'react';

// ─── Mock authService ─────────────────────────────────────────────────────────

vi.mock('../authService', () => ({
  loginRequest: vi.fn(),
}));

import { loginRequest } from '../authService';
const mockLoginRequest = loginRequest as ReturnType<typeof vi.fn>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockLoginResponse = {
  token: 'jwt-token-123',
  user: { id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'employee' as const },
};

/** Composant consommateur pour exposer le contexte dans les tests */
function TestConsumer() {
  const ctx = useContext(AuthContext);
  if (!ctx) return <div>no context</div>;
  return (
    <div>
      <span data-testid="auth-status">{ctx.isAuthenticated ? 'authenticated' : 'guest'}</span>
      <span data-testid="user-name">{ctx.user?.name ?? 'none'}</span>
      <button onClick={() => ctx.login({ email: 'alice@example.com', password: 'pass' })}>
        login
      </button>
      <button onClick={ctx.logout}>logout</button>
    </div>
  );
}

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AuthProvider / AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('État initial', () => {
    it('est non authentifié si localStorage est vide', () => {
      renderWithProvider();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    });

    it('est authentifié si un token est déjà dans localStorage', () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify(mockLoginResponse.user));
      renderWithProvider();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    it('restaure le nom de l\'utilisateur depuis localStorage', () => {
      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify(mockLoginResponse.user));
      renderWithProvider();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Alice');
    });
  });

  describe('login()', () => {
    it('stocke le token et l\'utilisateur dans localStorage', async () => {
      const user = userEvent.setup();
      mockLoginRequest.mockResolvedValue(mockLoginResponse);
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('jwt-token-123');
        expect(JSON.parse(localStorage.getItem('user')!).email).toBe('alice@example.com');
      });
    });

    it('met à jour isAuthenticated à true après login', async () => {
      const user = userEvent.setup();
      mockLoginRequest.mockResolvedValue(mockLoginResponse);
      renderWithProvider();

      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
      });
    });
  });

  describe('logout()', () => {
    it('vide localStorage et passe isAuthenticated à false', async () => {
      const user = userEvent.setup();
      mockLoginRequest.mockResolvedValue(mockLoginResponse);
      renderWithProvider();

      // Login d'abord
      await user.click(screen.getByRole('button', { name: /login/i }));
      await waitFor(() =>
        expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
      );

      // Puis logout
      await user.click(screen.getByRole('button', { name: /logout/i }));

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    });
  });
});
