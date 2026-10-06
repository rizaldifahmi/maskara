import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the Vite and React logos', () => {
    render(<App />);
    expect(screen.getByAltText('Vite logo')).toBeInTheDocument();
    expect(screen.getByAltText('React logo')).toBeInTheDocument();
  });

  it('verifies that no registration link is present in the UI to enforce strict single secure user policy', () => {
    render(<App />);
    const registerLinks = screen.queryAllByText(/register/i);
    const signUpLinks = screen.queryAllByText(/sign up/i);
    expect(registerLinks).toHaveLength(0);
    expect(signUpLinks).toHaveLength(0);
  });
});
