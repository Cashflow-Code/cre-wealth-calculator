import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EquityInput from '../components/EquityInput.jsx';

describe('EquityInput', () => {
  it('renders label text for all four presets', () => {
    render(<EquityInput value={25} onChange={() => {}} />);
    ['reputation', 'knowledge', 'capital', 'solo'].forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('fires onChange(10) when reputation preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={25} onChange={onChange} />);
    fireEvent.click(screen.getByText('reputation').closest('button'));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('fires onChange(25) when knowledge preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={10} onChange={onChange} />);
    fireEvent.click(screen.getByText('knowledge').closest('button'));
    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('fires onChange(50) when capital preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={25} onChange={onChange} />);
    fireEvent.click(screen.getByText('capital').closest('button'));
    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('fires onChange(100) when solo preset is clicked', () => {
    const onChange = vi.fn();
    render(<EquityInput value={25} onChange={onChange} />);
    fireEvent.click(screen.getByText('solo').closest('button'));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('shows knowledge description when value is 25', () => {
    render(<EquityInput value={25} onChange={() => {}} />);
    expect(screen.getByText(/knowledge leverage/i)).toBeTruthy();
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

  it('has a range input with min=5 and max=100', () => {
    render(<EquityInput value={25} onChange={() => {}} />);
    const range = screen.getAllByRole('slider').find(
      (el) => el.min === '5' && el.max === '100'
    );
    expect(range).toBeTruthy();
  });
});
