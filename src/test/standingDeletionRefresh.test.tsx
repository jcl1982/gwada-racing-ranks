import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import ViewRenderer from '@/components/ViewRenderer';
import type { Race, RaceResult } from '@/types/championship';

const { capture } = vi.hoisted(() => ({ capture: vi.fn() }));
vi.mock('@/components/RallyeMontagneTabs', () => ({ default: (props: unknown) => { capture(props); return null; } }));
vi.mock('@/components/KartingStandings', () => ({ default: (props: unknown) => { capture(props); return null; } }));
vi.mock('@/components/AccelerationStandings', () => ({ default: (props: unknown) => { capture(props); return null; } }));
vi.mock('@/components/HomePage', () => ({ default: () => null }));
vi.mock('@/components/GeneralStandings', () => ({ default: () => null }));
vi.mock('@/components/CategoryStandings', () => ({ default: () => null }));
vi.mock('@/components/R2Standings', () => ({ default: () => null }));
vi.mock('@/components/ExcelImport', () => ({ default: () => null }));
vi.mock('@/components/VmrsImport', () => ({ default: () => null }));
vi.mock('@/components/VmrsManualEntry', () => ({ default: () => null }));
vi.mock('@/components/AdminPanel', () => ({ default: () => null }));
vi.mock('@/components/AdminHub', () => ({ default: () => null }));
vi.mock('@/components/RoleProtectedComponent', () => ({ default: () => null }));
vi.mock('@/components/AdminAccessDenied', () => ({ default: () => null }));
vi.mock('@/components/AdminBreadcrumb', () => ({ default: () => null }));
vi.mock('@/components/SeasonArchivesViewer', () => ({ default: () => null }));
vi.mock('@/components/ReglementPage', () => ({ default: () => null }));
vi.mock('@/components/PrivacyPage', () => ({ default: () => null }));
vi.mock('@/components/LegalPage', () => ({ default: () => null }));
vi.mock('@/components/CalendarPage', () => ({ default: () => null }));

const race: Race = { id: 'race-1', name: 'Course', date: '2026-11-08', type: 'montagne', results: [] };

function setup(currentView: 'general' | 'montagne' | 'rallye' | 'karting' | 'acceleration') {
  cleanup();
  const saveRace = vi.fn().mockResolvedValue(undefined);
  const refreshData = vi.fn().mockResolvedValue(undefined);
  render(<ViewRenderer
    currentView={currentView} standings={[]} championshipTitle="LSAG" championshipYear="2026"
    montagneRaces={[race]} rallyeRaces={[]} kartingRaces={[]} accelerationRaces={[]}
    races={[race]} drivers={[]} handleImport={vi.fn()} handleReset={vi.fn()}
    handleRacesChange={vi.fn()} handleDriversChange={vi.fn()} handleTitleChange={vi.fn()}
    saveDriver={vi.fn()} deleteDriver={vi.fn()} deleteAllDrivers={vi.fn()}
    saveRace={saveRace} deleteRace={vi.fn()} refreshData={refreshData} onViewChange={vi.fn()}
  />);
  const props = capture.mock.lastCall?.[0] as { onRaceUpdate: (id: string, results: RaceResult[]) => Promise<void> };
  return { update: props.onRaceUpdate, saveRace, refreshData };
}

describe('Actualisation après suppression des points', () => {
  it.each(['general', 'montagne', 'rallye', 'karting', 'acceleration'] as const)(
    '%s : le signal de suppression recharge sans sauvegarder une course', async (view) => {
      const { update, saveRace, refreshData } = setup(view);
      await expect(update('', [])).resolves.toBeUndefined();
      expect(refreshData).toHaveBeenCalledTimes(1);
      expect(saveRace).not.toHaveBeenCalled();
    },
  );

  it('conserve la sauvegarde des résultats avant actualisation', async () => {
    const { update, saveRace, refreshData } = setup('montagne');
    const results: RaceResult[] = [{ driverId: 'driver-1', position: 1, points: 10.5 }];
    await update(race.id, results);
    expect(saveRace).toHaveBeenCalledWith({ ...race, results });
    expect(refreshData).toHaveBeenCalledTimes(1);
    expect(saveRace.mock.invocationCallOrder[0]).toBeLessThan(refreshData.mock.invocationCallOrder[0]);
  });

  it('refuse toujours une véritable course inconnue', async () => {
    const { update, saveRace, refreshData } = setup('montagne');
    await expect(update('unknown-race', [])).rejects.toThrow('Course introuvable');
    expect(saveRace).not.toHaveBeenCalled();
    expect(refreshData).not.toHaveBeenCalled();
  });
});