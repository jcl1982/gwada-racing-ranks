import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Trash2, AlertTriangle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { VmrsExcelData, VmrsMoyenne } from '@/utils/excel/vmrsParser';

type Row = VmrsExcelData['results'][number] & { moyenne: VmrsMoyenne | '' };
type ExtractedRace = { raceName: string; raceDate: string; results: Row[] };

const MAX_BYTES = 10 * 1024 * 1024;

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const sheetToText = async (file: File) => {
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  return wb.SheetNames.map((n) => `### Feuille: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`).join('\n\n');
};

interface Props {
  raceType: 'montagne' | 'rallye';
  onValidated: (data: VmrsExcelData[]) => void;
}

const VmrsAiExtractor = ({ raceType, onValidated }: Props) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [races, setRaces] = useState<ExtractedRace[] | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!file) return;
    if (file.size > MAX_BYTES) { setError('Fichier trop volumineux (max 10 Mo).'); return; }
    setLoading(true); setError(null); setRaces(null); setWarnings([]);
    try {
      const isSheet = /\.(xlsx|xls|csv|ods)$/i.test(file.name);
      const payload: Record<string, unknown> = { raceType, fileName: file.name };
      if (isSheet) payload.text = await sheetToText(file);
      else payload.file = { data: await toBase64(file), mediaType: file.type || 'application/pdf' };

      const { data, error: fnError } = await supabase.functions.invoke('extract-vmrs-results', { body: payload });
      if (fnError) {
        let msg = fnError.message;
        try { msg = (await (fnError as any).context?.json())?.error ?? msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      const today = new Date().toISOString().slice(0, 10);
      setRaces((data.races || []).map((r: any) => ({
        raceName: r.raceName || 'Course sans nom',
        raceDate: r.raceDate || today,
        results: (r.results || []).map((x: any) => ({ ...x, moyenne: x.moyenne ?? '' })),
      })));
      setWarnings(data.warnings || []);
      toast({ title: 'Extraction terminée', description: 'Vérifiez les données avant de valider.' });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'extraction");
    } finally {
      setLoading(false);
    }
  };

  const updateRace = (ri: number, patch: Partial<ExtractedRace>) =>
    setRaces((p) => p!.map((r, i) => (i === ri ? { ...r, ...patch } : r)));
  const updateRow = (ri: number, xi: number, patch: Partial<Row>) =>
    setRaces((p) => p!.map((r, i) => i !== ri ? r : { ...r, results: r.results.map((x, j) => (j === xi ? { ...x, ...patch } : x)) }));
  const removeRow = (ri: number, xi: number) =>
    setRaces((p) => p!.map((r, i) => i !== ri ? r : { ...r, results: r.results.filter((_, j) => j !== xi) }));

  const missingMoyenne = races?.some((r) => r.results.some((x) => !x.moyenne)) ?? false;

  const validate = () => {
    if (!races || missingMoyenne) return;
    onValidated(races.map((r) => ({
      raceName: r.raceName, raceDate: r.raceDate,
      results: r.results.map(({ totalPoints: _t, ...x }: any) => ({ ...x, moyenne: x.moyenne as VmrsMoyenne })),
    })));
    setRaces(null); setFile(null);
  };

  const numCell = (ri: number, xi: number, key: keyof Row, v: number) => (
    <Input type="number" className="h-8 w-16 text-right" value={v}
      onChange={(e) => updateRow(ri, xi, { [key]: Number(e.target.value) || 0 } as Partial<Row>)} />
  );

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-accent" />
          Extraction IA d'une feuille de résultats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Déposez une feuille de résultats {raceType === 'rallye' ? 'Rallye' : 'Montagne'} (PDF, photo, Excel ou CSV, dans n'importe quel format).
          Lovable AI extrait la course, la moyenne et les points de chaque concurrent. Rien n'est enregistré avant votre validation.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.ods"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button onClick={analyze} disabled={!file || loading}>
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? 'Analyse en cours…' : "Analyser avec l'IA"}
          </Button>
        </div>
        {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

        {warnings.length > 0 && (
          <div className="text-sm bg-accent/10 border border-accent/30 p-3 rounded-md space-y-1">
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="w-4 h-4" /> Points à vérifier</div>
            <ul className="list-disc list-inside">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
        )}

        {races?.length === 0 && <p className="text-sm text-muted-foreground">Aucun résultat détecté dans ce fichier.</p>}

        {races?.map((race, ri) => (
          <div key={ri} className="border rounded-lg p-3 space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input value={race.raceName} onChange={(e) => updateRace(ri, { raceName: e.target.value })} />
              <Input type="date" className="sm:w-44" value={race.raceDate} onChange={(e) => updateRace(ri, { raceDate: e.target.value })} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-1">Pos</th><th className="p-1">Nom</th><th className="p-1">Rôle</th><th className="p-1">Moyenne</th>
                    <th className="p-1 text-right">Part.</th><th className="p-1 text-right">Class.</th><th className="p-1 text-right">Bonus</th>
                    <th className="p-1 text-right">Total</th><th className="p-1 text-center">Abandon</th><th />
                  </tr>
                </thead>
                <tbody>
                  {race.results.map((x, xi) => {
                    const total = x.dnf ? x.participationPoints + x.bonusPoints : x.participationPoints + x.classificationPoints + x.bonusPoints;
                    const sheetTotal = (x as any).totalPoints;
                    const mismatch = typeof sheetTotal === 'number' && sheetTotal !== total;
                    return (
                      <tr key={xi} className="border-b last:border-0">
                        <td className="p-1">{numCell(ri, xi, 'position', x.position)}</td>
                        <td className="p-1"><Input className="h-8 min-w-[140px]" value={x.driverName} onChange={(e) => updateRow(ri, xi, { driverName: e.target.value })} /></td>
                        <td className="p-1">
                          <select className="h-8 rounded-md border bg-background px-1" value={x.driverRole}
                            onChange={(e) => updateRow(ri, xi, { driverRole: e.target.value as Row['driverRole'] })}>
                            <option value="pilote">Pilote</option><option value="copilote">Copilote</option>
                          </select>
                        </td>
                        <td className="p-1">
                          <select className={`h-8 rounded-md border bg-background px-1 ${!x.moyenne ? 'border-destructive' : ''}`} value={x.moyenne}
                            onChange={(e) => updateRow(ri, xi, { moyenne: e.target.value as Row['moyenne'] })}>
                            <option value="">— À choisir —</option>
                            <option value="haute">Haute</option><option value="intermediaire">Intermédiaire</option><option value="basse">Basse</option>
                          </select>
                        </td>
                        <td className="p-1 text-right">{numCell(ri, xi, 'participationPoints', x.participationPoints)}</td>
                        <td className="p-1 text-right">{numCell(ri, xi, 'classificationPoints', x.classificationPoints)}</td>
                        <td className="p-1 text-right">{numCell(ri, xi, 'bonusPoints', x.bonusPoints)}</td>
                        <td className={`p-1 text-right font-semibold ${mismatch ? 'text-destructive' : ''}`} title={mismatch ? `Total sur la feuille : ${sheetTotal}` : ''}>
                          {total}{mismatch && ' ⚠'}
                        </td>
                        <td className="p-1 text-center">
                          <input type="checkbox" checked={x.dnf} onChange={(e) => updateRow(ri, xi, { dnf: e.target.checked })} />
                        </td>
                        <td className="p-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeRow(ri, xi)} aria-label="Supprimer la ligne">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {races && races.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 justify-end items-end sm:items-center">
            {missingMoyenne && <span className="text-sm text-destructive">Choisissez une moyenne pour chaque ligne.</span>}
            <Button variant="outline" onClick={() => setRaces(null)}>Annuler</Button>
            <Button onClick={validate} disabled={missingMoyenne}>
              <Check className="w-4 h-4 mr-2" /> Valider et passer à l'import
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VmrsAiExtractor;
