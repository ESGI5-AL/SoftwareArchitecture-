import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../components/LoginForm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderForm = (overrides: {
  onSubmit?: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
} = {}) => {
  const props = {
    onSubmit: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
    ...overrides,
  };
  render(<LoginForm {...props} />);
  return props;
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LoginForm', () => {
  describe('Rendu', () => {
    it('affiche les champs email et mot de passe', () => {
      renderForm();
      expect(screen.getByLabelText(/adresse e-mail/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it('affiche le bouton de connexion', () => {
      renderForm();
      expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
    });

    it("n'affiche pas d'erreur par défaut", () => {
      renderForm();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Affichage des erreurs', () => {
    it("affiche le message d'erreur quand la prop error est fournie", () => {
      renderForm({ error: 'Identifiants invalides' });
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });

    it("n'affiche pas d'erreur quand error est null", () => {
      renderForm({ error: null });
      expect(screen.queryByText(/identifiants/i)).not.toBeInTheDocument();
    });
  });

  describe('État de chargement', () => {
    it('désactive le bouton quand isLoading est true', () => {
      renderForm({ isLoading: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('affiche le texte "Connexion..." pendant le chargement', () => {
      renderForm({ isLoading: true });
      expect(screen.getByText(/connexion\.\.\./i)).toBeInTheDocument();
    });

    it('active le bouton quand isLoading est false', () => {
      renderForm({ isLoading: false });
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  describe('Soumission du formulaire', () => {
    it('appelle onSubmit avec email et mot de passe saisis', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderForm({ onSubmit });

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'alice@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'password123');
      await user.click(screen.getByRole('button', { name: /se connecter/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledWith('alice@example.com', 'password123');
      });
    });

    it('appelle onSubmit à la soumission du formulaire (touche Entrée)', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      renderForm({ onSubmit });

      await user.type(screen.getByLabelText(/adresse e-mail/i), 'bob@example.com');
      await user.type(screen.getByLabelText(/mot de passe/i), 'secret{Enter}');

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith('bob@example.com', 'secret');
      });
    });
  });
});
