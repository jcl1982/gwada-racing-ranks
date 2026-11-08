import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import RaceCard from '@/components/points/RaceCard';
import AccelerationStandings from '@/components/AccelerationStandings';
import { Driver, Race } from '@/types/championship';

vi.mock('@/hooks/useUserRole', () => ({ useUserRole: () => ({ isAdmin: true }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/useUrlTab', () => ({ useUrlTab: () => ['general', vi.fn()] }));
const { tableSpy } = vi.hoisted(() => ({ tableSpy: vi.fn() }));
vi.mock('@/components/StandingsTable', () => ({ default: (props: unknown) => { tableSpy(props); return null; } }));
vi.mock('@/components/CategoryHeader', () => ({ default: () => null }));
vi.mock('@/components/RaceCalendar', () => ({ default: () => null }));
vi.mock('@/components/PodiumSection', () => ({ default: () => null }));
vi.mock('@/components/DeleteStandingPointsButton', () => ({ default: () => null }));
vi.mock('@/components/points/KartingRaceResults', () => ({ default: () => null }));

const driver: Driver = { id: 'driver-1', name: 'Pilote test', driverRole: 'pilote' };
const race: Race = {
  id: 'race-1', name: 'Accélération', date: '2026-11-08', type: 'acceleration',
  results: [{ driverId: driver.id, position: 1, points: 10, category: 'ET Pro A' }],
};

describe('Demi-points Accélération', () => {
  it('transmet 10,5 pts à la sauvegarde sans les tronquer', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<RaceCard race={race} drivers={[driver]} onRaceUpdate={save} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    const pointsInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(pointsInput, { target: { value: '10.5' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Sauvegarder' }));
    });
    expect(save).toHaveBeenCalledWith('race-1', [expect.objectContaining({ driverId: 'driver-1', points: 10.5 })]);
  });

  it('additionne les demi-points dans le classement général', () => {
    render(<AccelerationStandings drivers={[driver]} championshipYear="2026" onRaceUpdate={vi.fn()}
      races={[
        { ...race, results: [{ ...race.results[0], points: 10.5 }] },
        { ...race, id: 'race-2', results: [{ ...race.results[0], points: 0.5 }] },
      ]} />);
    expect(tableSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      standings: [expect.objectContaining({ driver, points: 11, position: 1 })],
    }));
  });
});