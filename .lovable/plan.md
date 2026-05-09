
## Objectif

Conformément à l'**article 7.2** du règlement LSAG 2026, l'onglet **VMRS** doit présenter **6 classements distincts** :

- Moyenne **Haute** — Pilotes / Copilotes
- Moyenne **Intermédiaire** — Pilotes / Copilotes
- Moyenne **Basse** — Pilotes / Copilotes

La moyenne sera enregistrée **par résultat** (chaque pilote choisit sa moyenne dans chaque épreuve). L'affichage sera organisé en **3 sous-onglets** (Haute / Inter / Basse), chacun contenant le tableau Pilotes puis Copilotes.

## Étapes

### 1. Base de données
- Ajouter une colonne `moyenne` (`text`, valeurs `haute` / `intermediaire` / `basse`, défaut `haute`) sur la table `vmrs_results`.
- Migration de compatibilité : les résultats existants reçoivent la valeur `haute` par défaut.

### 2. Saisie manuelle (`VmrsManualEntry.tsx`)
- Ajouter une colonne **Moyenne** dans la grille (Select Haute / Intermédiaire / Basse) pour chaque ligne.
- Sauvegarder le champ lors de l'insertion.

### 3. Import Excel VMRS (`vmrsParser.ts` + `useVmrsImport.ts`)
- Détecter une colonne « Moyenne » dans le template (valeurs acceptées : Haute / Inter / Basse, insensible à la casse).
- Si absente, valeur par défaut `haute`.
- Mettre à jour le template téléchargeable (`VmrsTemplateDownload.tsx`).

### 4. Calcul des classements (`useVmrsStandings.ts`)
- Aggréger par `(driver_id, moyenne)` au lieu de `driver_id` seul.
- Exposer 6 listes : `pilotesHaute`, `pilotesInter`, `pilotesBasse`, `copilotesHaute`, `copilotesInter`, `copilotesBasse`.

### 5. Hook centralisé (`useStandingsCalculation.ts`)
- Étendre la sortie pour fournir les 6 nouveaux jeux + maintenir les anciennes clés `vmrsStandings` / `vmrsCopiloteStandings` (= union, par compatibilité).

### 6. Affichage (`RallyeMontagneTabs.tsx`)
Dans l'onglet VMRS, remplacer le bloc actuel par 3 sous-onglets :

```text
┌── Onglet VMRS ─────────────────────────┐
│  [ Haute ] [ Intermédiaire ] [ Basse ] │
│                                        │
│  Podium Pilotes                        │
│  Tableau Pilotes                       │
│  ─────────────                         │
│  Tableau Copilotes (si non vide)       │
└────────────────────────────────────────┘
```

Chaque sous-onglet ré-utilise `StandingsTable` + `PodiumSection` existants. Export PDF/Excel par moyenne.

### 7. ViewRenderer
- Propager les 6 nouvelles props vers `RallyeMontagneTabs`.

### 8. Types
- Étendre `VmrsStanding` avec `moyenne: 'haute' | 'intermediaire' | 'basse'`.

## Détails techniques

- Pas de bouleversement de l'existant : `vmrs_results` conserve sa structure, seul un champ s'ajoute.
- Les anciens onglets/exports continuent de fonctionner (fallback `haute`).
- Aucune modification des règles de points (art. 7.3) : le calcul reste participation + classement (0 si DNF) + bonus.
- Mémoire `features/vmrs-trophy` à mettre à jour après implémentation pour refléter les 6 classements.

## Hors périmètre

- Pas de migration automatique pour reclasser les résultats existants dans une autre moyenne — l'admin pourra ré-éditer chaque course pour ajuster.
- Pas de changement sur les autres onglets (Rallye, Montagne, R2…).
