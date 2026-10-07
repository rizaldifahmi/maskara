import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { AuthProvider } from './context/AuthContext';

/** Mock the fetch call made by httpClient in Login.tsx */
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

/** Render AppRoutes inside a MemoryRouter so route navigation works in jsdom */
function renderAt(routePath: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[routePath]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Route: /login (public, no token)', () => {
    it('renders the Login page when unauthenticated', async () => {
      renderAt('/login');
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      });
    });

    it('redirects unauthenticated users from /dashboard to /login', async () => {
      renderAt('/dashboard');
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });
    });

    it('redirects unknown routes to /login', async () => {
      renderAt('/nonexistent');
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Route: /dashboard (protected, with token)', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-jwt-token');
    });

    it('renders the Dashboard when authenticated', async () => {
      renderAt('/dashboard');
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /consultant report/i })).toBeInTheDocument();
        expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      });
    });

    it('redirects authenticated users away from /login', async () => {
      renderAt('/login');
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /consultant report/i })).toBeInTheDocument();
      });
    });
  });

  describe('Login form behavior', () => {
    it('calls fetch on form submit with credentials', async () => {
      // Simulate successful login response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ token: 'jwt-token-123' }),
      });

      renderAt('/login');

      const emailInput = await screen.findByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'correct-password' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(localStorage.getItem('auth_token')).toBe('jwt-token-123');
      });
    });

    it('shows an error message when login fails with 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      renderAt('/login');

      const emailInput = await screen.findByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitBtn = screen.getByRole('button', { name: /login/i });

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'bad' } });
      fireEvent.click(submitBtn);

      // http.ts navigates on 401 via window.location.href, which triggers an error in jsdom.
      // We check that the error message is displayed in the UI.
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  it('verifies that no registration link is present in the UI to enforce strict single secure user policy', async () => {
    renderAt('/login');
    const registerLinks = screen.queryAllByText(/register/i);
    const signUpLinks = screen.queryAllByText(/sign up/i);
    expect(registerLinks).toHaveLength(0);
    expect(signUpLinks).toHaveLength(0);
  });
});
