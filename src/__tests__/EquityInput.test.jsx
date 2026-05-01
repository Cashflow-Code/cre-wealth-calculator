import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EquityInput from '../components/EquityInput.jsx';

describe('EquityInput', () => {
  it('renders label text for all three presets', () => {
    render(<EquityInput value={33} onChange={() => {}} />);
    ['knowledge', 'capital', 'systems'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('fires onChange(33) when knowledge preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={50} onChange={onChange} />);
    fireEvent.click(screen.getByText('knowledge').closest('button'));
    expect(onChange).toHaveBeenCalledWith(33);
  });

  it('fires onChange(50) when capital preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={33} onChange={onChange} />);
    fireEvent.click(screen.getByText('capital').closest('button'));
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('fires onChange(100) when systems preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={33} onChange={onChange} />);
    fireEvent.click(screen.getByText('systems').closest('button'));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('shows knowledge description when value is 33', () => {
    render(<EquityInput value={33} onChange={() => {}} />);
    expect(screen.getByText(/know-how/i)).toBeTruthy();
  });

  it('shows systems description when value is 100', () => {
    render(<EquityInput value={100} onChange={() => {}} />);
    expect(screen.getByText(/Full control/i)).toBeTruthy();
  });

  it('shows custom description for non-preset values', () => {
    render(<EquityInput value={35} onChange={() => {}} />);
    expect(screen.getByText(/Custom equity position/i)).toBeTruthy();
  });

  it('displays the current value as a percentage', () => {
    render(<EquityInput value={65} onChange={() => {}} />);
    expect(screen.getByText('65%')).toBeTruthy();
  });

  it('has a range input with min=1 and max=100', () => {
    render(<EquityInput value={33} onChange={() => {}} />);
    const range = screen.getAllByRole('slider').find(
      (el) => el.min === '1' && el.max === '100'
    );
    expect(range).toBeTruthy();
  });
});
