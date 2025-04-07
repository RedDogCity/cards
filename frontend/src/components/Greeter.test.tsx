import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Provides custom matchers
import Greeter from './Greeter';

describe('Greeter Component', () => {
  it('renders the default name if localStorage is empty', () => {
    // Clear localStorage
    localStorage.clear();

    // Render the component
    render(<Greeter />);

    // Assert the default name is displayed
    expect(screen.getByText(/Welcome To AniLert!: Guest/i)).toBeInTheDocument();
  });

  it('renders the user name from localStorage', () => {
    // Mock localStorage data
    const mockUserData = { name: 'John Doe' };
    localStorage.setItem('user_data', JSON.stringify(mockUserData));

    // Render the component
    render(<Greeter />);

    // Assert the name from localStorage is displayed
    expect(screen.getByText(/Welcome To AniLert!: John Doe/i)).toBeInTheDocument();
  });
});