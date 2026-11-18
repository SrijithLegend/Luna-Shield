import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CostPage from '../src/pages/CostPage';
import EvidencePage from '../src/pages/EvidencePage';
import MaterialsPage from '../src/pages/MaterialsPage';
import { Protocol } from '../src/pages/ValidationPage';
import { InfoPanel } from '../src/components/data-panels/InfoPanel';
import { ArchitectureDiagram } from '../src/components/data-panels/Architecture';
import { useStore, initial } from '../src/state/store';

describe('cost page', () => {
  it('shows the funding mismatch prominently', () => {
    render(<CostPage />);
    expect(screen.getByRole('alert').textContent).toContain('exceeds the proposed ask');
    expect(screen.getByRole('alert').textContent).toContain('₹78 lakh');
  });
  it('does not claim under ₹5,000 by default, and flags overrun', () => {
    render(<CostPage />);
    expect(screen.getByRole('status').textContent).toContain('NOT VERIFIED');
    const coupon = screen.getByLabelText(/Entered value for 100 × 100/);
    fireEvent.change(coupon, { target: { value: '6000' } });
    expect(screen.getByRole('status').textContent).toContain('OVER ₹5,000');
  });
});

describe('evidence & materials', () => {
  it('tags NASA claims and lists prohibited claims', () => {
    render(<EvidencePage />);
    expect(screen.getAllByText('NASA DEMONSTRATED').length).toBeGreaterThan(1);
    expect(screen.getByText(/LunaShield is flight-ready/)).toBeTruthy();
  });
  it('materials page shows evidence badges', () => {
    render(<MaterialsPage />);
    expect(screen.getAllByText('Published EDS candidate').length).toBeGreaterThan(0);
  });
});

describe('configuration switching + selection', () => {
  it('switching config changes selectable data and clears selection', () => {
    useStore.setState({ ...initial });
    useStore.getState().select('electrodes');
    const { container, rerender } = render(<InfoPanel />);
    expect(container.textContent).toContain('Copper electrode pattern');
    useStore.getState().setConfig('demonstrator');
    expect(useStore.getState().selected).toBeNull();
    useStore.getState().select('hv');
    rerender(<InfoPanel />);
    expect(container.textContent).toContain('UNVERIFIED CANDIDATE');
  });
  it('architecture differs per config; arduino disclaimer present', () => {
    const { container, rerender } = render(<ArchitectureDiagram cfg="professional" />);
    expect(container.textContent).toContain('Spacecraft low-voltage bus');
    rerender(<ArchitectureDiagram cfg="demonstrator" />);
    expect(container.textContent).toContain('Arduino Uno');
  });
  it('applyMode exploded / reset work', () => {
    useStore.setState({ ...initial });
    useStore.getState().applyMode('exploded');
    expect(useStore.getState().explode).toBe(1);
    const k = useStore.getState().resetKey;
    useStore.getState().reset();
    expect(useStore.getState().resetKey).toBe(k + 1);
    useStore.getState().set({ playing: false });
    expect(useStore.getState().playing).toBe(false);
  });
});

describe('protocol', () => {
  it('lists 10 steps unticked', () => {
    render(<Protocol />);
    expect(screen.getAllByRole('checkbox').length).toBe(10);
  });
});
