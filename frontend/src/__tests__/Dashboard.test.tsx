import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../features/dashboard/Dashboard';
import api from '../services/api';

// Mock Recharts to avoid SVG rendering dimension exceptions in jsdom environment
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
}));

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'pytest@candidate.com', full_name: 'Pytest Candidate' },
  }),
}));

// Mock API service layer
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Dashboard Component Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders stat panels and resume details successfully', async () => {
    // Setup Mock API responses
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/users/resume') {
        return Promise.resolve({
          data: {
            filename: "resume.pdf",
            skills: ["Python", "FastAPI"],
            projects: ["AI Simulator"],
            education: ["BS Computer Science"],
            experience: ["Software Engineer at Google"],
            technologies: ["React", "PostgreSQL"],
            certifications: ["AWS Cloud Practitioner"]
          }
        });
      }
      return Promise.reject(new Error("Not found"));
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Verify Metric Panel elements render
    expect(screen.getByText(/completed interviews/i)).toBeInTheDocument();
    expect(screen.getByText(/average score/i)).toBeInTheDocument();
    expect(screen.getByText(/practice time/i)).toBeInTheDocument();

    // Verify Resume Tab headers are visible
    expect(screen.getByText(/resume overview/i)).toBeInTheDocument();
    expect(screen.getByText(/upload resume/i)).toBeInTheDocument();

    // Wait for async resume details to load and display in technologies tab
    await waitFor(() => {
      expect(screen.getByText("resume.pdf")).toBeInTheDocument();
      expect(screen.getByText("Python")).toBeInTheDocument();
      expect(screen.getByText("FastAPI")).toBeInTheDocument();
    });
  });
});
