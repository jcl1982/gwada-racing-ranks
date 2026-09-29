import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Race, Driver } from "@/types/championship";
import { filterRacesByMoyenne } from "@/utils/vmrsMoyenne";
import { buildCategoryTableRows } from "@/utils/pdf/categoryStandingsTable";

vi.mock("@/hooks/useImageExport", () => ({ useImageExport: () => ({ exportToImage: vi.fn() }) }));
vi.mock("@/hooks/useWebPrint", () => ({ useWebPrint: () => ({ printWebPage: vi.fn(), printWithUnicodeSupport: vi.fn() }) }));
vi.mock("@/hooks/useExcelExport", () => ({ useExcelExport: () => ({ exportCategoryToExcel: vi.fn() }) }));
vi.mock("@/components/PrintButton", () => ({ default: () => null }));
vi.mock("@/components/Logo", () => ({ default: () => null }));

import StandingsTable from "@/components/StandingsTable";

// BORDEY court Borromée/La Canne en Haute, puis Bananier en Intermédiaire.
const bordey: Driver = { id: "d1", name: "BORDEY Steeve", driverRole: "pilote" };
const autre: Driver = { id: "d2", name: "AUTRE Pilote", driverRole: "pilote" };

const races: Race[] = [
  { id: "r1", name: "Borromée", date: "2026-02-01", type: "montagne", results: [
    { driverId: "d1", position: 1, points: 20, moyenne: "haute" },
    { driverId: "d2", position: 1, points: 15, moyenne: "intermediaire" },
  ] },
  { id: "r2", name: "La Canne", date: "2026-03-01", type: "montagne", results: [
    { driverId: "d1", position: 1, points: 22, moyenne: "haute" },
  ] },
  { id: "r3", name: "Bananier", date: "2026-04-01", type: "montagne", results: [
    { driverId: "d1", position: 2, points: 17, moyenne: "intermediaire" },
    { driverId: "d2", position: 1, points: 25, moyenne: "haute" },
    { driverId: "d2", position: 9, points: 99 }, // sans moyenne : jamais affiché
  ] },
];

const standingsHaute = [
  { driver: bordey, points: 42, position: 1 },
  { driver: autre, points: 25, position: 2 },
];
const standingsInter = [
  { driver: autre, points: 15, position: 1 },
  { driver: bordey, points: 17, position: 2 },
];

describe("filterRacesByMoyenne", () => {
  it("ne garde que les résultats de la moyenne demandée", () => {
    const haute = filterRacesByMoyenne(races, "haute");
    expect(haute.find(r => r.id === "r3")!.results).toEqual([
      { driverId: "d2", position: 1, points: 25, moyenne: "haute" },
    ]);
    const inter = filterRacesByMoyenne(races, "intermediaire");
    expect(inter.find(r => r.id === "r2")!.results).toHaveLength(0);
    expect(inter.flatMap(r => r.results).every(r => r.moyenne === "intermediaire")).toBe(true);
  });

  it("ne modifie pas les courses d'origine", () => {
    filterRacesByMoyenne(races, "haute");
    expect(races[2].results).toHaveLength(3);
  });
});

const rowOf = (name: string) => screen.getByText(name).closest("tr")!;

describe("StandingsTable VMRS - pilote changeant de moyenne", () => {
  it("Moyenne Haute : n'affiche pas les points Intermédiaire de Bananier", () => {
    render(<StandingsTable displayTitle="VMRS Montagne - Moyenne Haute" races={filterRacesByMoyenne(races, "haute")}
      type="montagne" standings={standingsHaute} onPrintPdf={() => {}} resultMoyenne="haute" />);
    const row = within(rowOf("BORDEY Steeve"));
    expect(row.getByText("20 pts")).toBeInTheDocument();
    expect(row.getByText("22 pts")).toBeInTheDocument();
    expect(row.queryByText("17 pts")).toBeNull();
    expect(within(rowOf("AUTRE Pilote")).queryByText("15 pts")).toBeNull();
    expect(screen.queryByText("99 pts")).toBeNull();
  });

  it("Moyenne Intermédiaire : n'affiche que Bananier pour BORDEY", () => {
    render(<StandingsTable displayTitle="VMRS Montagne - Moyenne Intermédiaire" races={filterRacesByMoyenne(races, "intermediaire")}
      type="montagne" standings={standingsInter} onPrintPdf={() => {}} resultMoyenne="intermediaire" />);
    const row = within(rowOf("BORDEY Steeve"));
    expect(row.getAllByText("17 pts")).toHaveLength(2); // cellule Bananier + total
    expect(row.queryByText("20 pts")).toBeNull();
    expect(row.queryByText("22 pts")).toBeNull();
    expect(screen.queryByText("La Canne")).toBeNull();
  });

  it("filtre aussi via resultMoyenne même si les courses ne sont pas pré-filtrées", () => {
    render(<StandingsTable displayTitle="VMRS" races={races} type="montagne"
      standings={standingsHaute} onPrintPdf={() => {}} resultMoyenne="haute" />);
    expect(within(rowOf("BORDEY Steeve")).queryByText("17 pts")).toBeNull();
  });
});

describe("Export PDF VMRS - pilote changeant de moyenne", () => {
  it("Moyenne Haute : lignes PDF sans points d'autres moyennes", () => {
    const rows = buildCategoryTableRows(standingsHaute, filterRacesByMoyenne(races, "haute"));
    expect(rows[0]).toEqual(["1", "BORDEY Steeve", "-", "20 pts (P1)", "22 pts (P1)", "-", "42", "—"]);
    expect(rows[1]).toEqual(["2", "AUTRE Pilote", "-", "-", "-", "25 pts (P1)", "25", "-17"]);
  });

  it("Moyenne Intermédiaire : lignes PDF sans points Haute", () => {
    const rows = buildCategoryTableRows(standingsInter, filterRacesByMoyenne(races, "intermediaire"));
    const bordeyRow = rows.find(r => r[1] === "BORDEY Steeve")!;
    expect(bordeyRow.slice(3, 6)).toEqual(["-", "-", "17 pts (P2)"]);
    expect(rows.flat().some(c => c.includes("99"))).toBe(false);
  });
});
