import { createOpenAI } from "npm:@ai-sdk/openai@2";
import { streamText, Output, jsonSchema, type ModelMessage } from "npm:ai@5";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../_shared/run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id",
  "Access-Control-Expose-Headers": "x-lovable-aig-run-id",
};

const MODEL = "openai/gpt-6-astra";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, ...extra, "Content-Type": "application/json" },
  });

const num = { type: "number" };
const schema = jsonSchema({
  type: "object",
  additionalProperties: false,
  required: ["races", "warnings"],
  properties: {
    warnings: { type: "array", items: { type: "string" } },
    races: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["raceName", "raceDate", "results"],
        properties: {
          raceName: { type: "string" },
          raceDate: { type: ["string", "null"], description: "YYYY-MM-DD" },
          results: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "position", "driverName", "driverRole", "moyenne",
                "participationPoints", "classificationPoints", "bonusPoints", "totalPoints", "dnf",
              ],
              properties: {
                position: num,
                driverName: { type: "string" },
                driverRole: { type: "string", enum: ["pilote", "copilote"] },
                moyenne: { type: ["string", "null"], enum: ["haute", "intermediaire", "basse", null] },
                participationPoints: num,
                classificationPoints: num,
                bonusPoints: num,
                totalPoints: num,
                dnf: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
});

const instructions = `Tu extrais des résultats de courses automobiles (Trophée VMRS, régularité) depuis une feuille de résultats.
Pour chaque course trouvée, renvoie le nom, la date (YYYY-MM-DD ou null) et une ligne par concurrent :
- position (0 si inconnue), driverName au format "NOM Prénom" tel qu'écrit, driverRole ("copilote" seulement si explicitement indiqué),
- moyenne : "haute", "intermediaire" ou "basse" (null si absente). Un même concurrent peut avoir une moyenne différente selon la course.
- participationPoints, classificationPoints, bonusPoints (0 si absents), totalPoints tel qu'affiché (ou la somme), dnf (abandon).
N'invente aucune donnée. Signale dans warnings toute ligne illisible, ambiguë ou dont le total ne correspond pas à la somme.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  // Admin uniquement
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!userData?.user) return json({ error: "Connexion requise" }, 401);
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
  if (!isAdmin) return json({ error: "Accès réservé aux administrateurs" }, 403);

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "Lovable AI n'est pas configuré" }, 500);

  let body: { raceType?: string; fileName?: string; text?: string; file?: { data: string; mediaType: string } };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Requête invalide" }, 400);
  }
  if (!body.text && !body.file) return json({ error: "Aucun fichier fourni" }, 400);
  if ((body.text?.length ?? 0) > 400_000 || (body.file?.data.length ?? 0) > 14_000_000) {
    return json({ error: "Fichier trop volumineux (max ~10 Mo)" }, 400);
  }

  const content: any[] = [
    { type: "text", text: `Type d'épreuve : ${body.raceType === "rallye" ? "Rallye" : "Montagne"}. Fichier : ${body.fileName ?? "inconnu"}.` },
  ];
  if (body.text) content.push({ type: "text", text: body.text });
  if (body.file) {
    content.push(
      body.file.mediaType.startsWith("image/")
        ? { type: "image", image: body.file.data, mediaType: body.file.mediaType }
        : { type: "file", data: body.file.data, mediaType: body.file.mediaType, filename: body.fileName },
    );
  }
  const messages: ModelMessage[] = [{ role: "user", content }];

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  let streamError: any = null;
  try {
    const result = streamText({
      model: provider.responses(MODEL),
      system: instructions,
      messages,
      abortSignal: req.signal,
      experimental_output: Output.object({ schema }),
      onError: ({ error }) => { streamError = error; },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "medium",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const text = await result.text;
    if (streamError) throw streamError;
    if (!text.trim()) return json({ error: "L'IA n'a renvoyé aucun résultat pour ce fichier." }, 422);
    const runId = runIdFetch.getRunId();
    return json(JSON.parse(text), 200, runId ? { "X-Lovable-AIG-Run-ID": runId } : {});
  } catch (e: any) {
    const err = streamError ?? e;
    if (err?.name === "AbortError") return json({ error: "Annulé" }, 499);
    const status = err?.statusCode ?? 500;
    console.error("extract-vmrs-results error", status, err?.message);
    const msg =
      status === 402 ? "Crédits Lovable AI épuisés : rechargez dans Settings → Plans & credits." :
      status === 429 ? "Trop de requêtes, réessayez dans un instant." :
      status === 403 ? (err?.responseBody ?? "Accès Lovable AI refusé.") :
      status === 400 ? "Fichier non pris en charge ou trop volumineux." :
      "Erreur lors de l'extraction IA.";
    return json({ error: msg }, status);
  }
});
