import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Login page by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('verifies that no registration link is present in the UI to enforce strict single secure user policy', () => {
    render(<App />);
    const registerLinks = screen.queryAllByText(/register/i);
    const signUpLinks = screen.queryAllByText(/sign up/i);
    expect(registerLinks).toHaveLength(0);
    expect(signUpLinks).toHaveLength(0);
  });
});
