import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EquityInput from '../components/EquityInput.jsx';

describe('EquityInput', () => {
  it('renders label text for all four presets', () => {
    render(<EquityInput value={33} onChange={() => {}} />);
    ['finder', 'partner', 'co-own', 'solo'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('fires onChange(3) when finder preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={33} onChange={onChange} />);
    fireEvent.click(screen.getByText('finder').closest('button'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('fires onChange(33) when partner preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={3} onChange={onChange} />);
    fireEvent.click(screen.getByText('partner').closest('button'));
    expect(onChange).toHaveBeenCalledWith(33);
  });

  it('fires onChange(50) when co-own preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={33} onChange={onChange} />);
    fireEvent.click(screen.getByText('co-own').closest('button'));
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('fires onChange(100) when solo preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={33} onChange={onChange} />);
    fireEvent.click(screen.getByText('solo').closest('button'));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('shows partner description when value is 33', () => {
    render(<EquityInput value={33} onChange={() => {}} />);
    expect(screen.getByText(/partner deals/i)).toBeTruthy();
  });

  it('shows solo description when value is 100', () => {
    render(<EquityInput value={100} onChange={() => {}} />);
    expect(screen.getByText(/Full ownership/i)).toBeTruthy();
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
