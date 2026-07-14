import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../features/auth/Login';

// 1. Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// 2. Mock useAuth custom hook
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

describe('Login Component Test Suite', () => {
  test('renders email and password inputs and submits successfully', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Assert headings and fields are loaded
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    // Simulate typing
    fireEvent.change(emailInput, { target: { value: 'pytest@candidate.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });

    expect(emailInput).toHaveValue('pytest@candidate.com');
    expect(passwordInput).toHaveValue('Password123!');

    // Simulate submission
    fireEvent.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith('pytest@candidate.com', 'Password123!');
  });
});
