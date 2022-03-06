import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useData, useUserState }from './firebase';
import App from './App';


const mockSchedule = {
  "title": "CS Courses for 1850-1851",
  "courses": { }
};

jest.mock('./firebase');

beforeEach(() => {
  useData.mockReturnValue([mockSchedule, false, null]);
  useUserState.mockReturnValue([null]);
});

it('shows the schedule year', () => {
  render(<App />);
  const title = screen.queryByText(/1850-1851/i);
  expect(title).toBeInTheDocument();
});

it('shows Sign In if not logged in', () => {
  render(<App />);
  const button = screen.queryByText(/Sign In/i);
  expect(button).toBeInTheDocument();
});

it('asks for data once with a schedule path', () => {
  render(<App />);
  expect(useData).toHaveBeenCalledTimes(1);
  expect(useData).toHaveBeenCalledWith('/schedule', expect.any(Function));
});

it('shows Sign Out if logged in', () => {
  useUserState.mockReturnValue([{ displayName: 'Joe' }]);
  render(<App />);
  const button = screen.queryByText(/Sign Out/i);
  expect(button).toBeInTheDocument();
});