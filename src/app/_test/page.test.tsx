import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Home from '../page';

describe('Home Page (Root)', () => {
  it('should render without crashing', () => {
    const { container } = render(<Home />);
    expect(container).toBeDefined();
    // The home page is currently empty <main>
    expect(container.querySelector('main')).toBeInTheDocument();
  });
});
