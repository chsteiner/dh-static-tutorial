# Requirements: Environment-basierte Feature Flags Tutorial

## Funktionale Anforderungen

### FR-1: Environment-basiertes Feature-Toggling
- Das System MUSS in zwei Modi laufen können: Development und Production
- Der Modus MUSS zur Build-Zeit festgelegt werden (nicht zur Runtime)
- Der Wechsel MUSS über npm-Scripts erfolgen (`npm run dev` vs `npm run build`)

### FR-2: Upload-Feature (Development-only)
- Im Development-Modus MUSS eine Upload-Sektion sichtbar sein
- Im Production-Build MUSS die Upload-Sektion komplett fehlen (nicht nur versteckt)
- Das Upload-Feature dient nur als Demo – funktionale Implementierung ist optional

### FR-3: Unterschiedliche Datenquellen
- Development MUSS Daten aus `data/local/` laden
- Production MUSS Daten aus `data/corpus/` laden
- Die App MUSS mit `manifest.json` arbeiten, aber auf `example-manifest.json` zurückfallen

### FR-4: Dokumentenliste
- Die App MUSS Dokumente aus einem Manifest laden und anzeigen
- Jedes Dokument MUSS Title, Sprache und Dateinamen zeigen
- Beim Klick MUSS der XML-Inhalt angezeigt werden
- Wenn keine Dokumente vorhanden: MUSS passende Meldung zeigen (unterschiedlich je Modus)

### FR-5: Visuelles Mode-Feedback
- Der aktuelle Modus (Dev/Prod) MUSS sichtbar sein
- Die Datenquelle MUSS angezeigt werden (`data/local` vs `data/corpus`)
- Der Manifest-Titel MUSS unterscheiden können (z.B. "⚠️ LOKAL-ONLY" vs "✅ PRODUKTIV-CORPUS")

## Technische Anforderungen

### TR-1: Vite als Build-Tool
- MUSS Vite verwenden für automatisches .env-Loading
- MUSS `.env.local` für Development laden
- MUSS `.env.production` für Production-Build laden
- Environment-Variablen MÜSSEN mit `VITE_` Prefix beginnen

### TR-2: Vanilla JavaScript
- KEIN Framework-Dependency (React, Vue, etc.)
- Maximale Zugänglichkeit für Nicht-JS-Expert:innen
- ES6-Module verwenden (`import`/`export`)

### TR-3: Datenstruktur
- XML-Dateien im TEI-ähnlichen Format
- `manifest.json` als Index mit Metadaten
- Klare Trennung: `data/corpus/` (committed) vs `data/local/` (gitignored, außer `example-*`)

### TR-4: GitHub Pages Deployment
- MUSS per GitHub Actions automatisch deployen
- Workflow MUSS bei Push auf `main`/`master` triggern
- MUSS nur `data/corpus/` ins Deployment kopieren (NICHT `data/local/`)
- MUSS `dist/` Ordner als Artifact hochladen

### TR-5: Tutorial-Struktur
- `example-*` Dateien MÜSSEN committed sein (für Lernende)
- User-eigene Dateien in `data/local/` MÜSSEN gitignored sein
- README MUSS kompakt sein (max. 80 Zeilen)
- Inline-Comments MÜSSEN auf Deutsch sein
- `.env.example` MUSS als Dokumentation existieren (Standard-Practice)

### TR-6: Copy-to-dist Plugin
- Vite-Plugin MUSS `data/corpus/*` nach `dist/data/corpus/` kopieren
- MUSS im `closeBundle()` Hook laufen
- MUSS alle Dateien des kuratierten Corpus kopieren

## Non-Functional Requirements

### NFR-1: Lernbarkeit
- Ein Neuling MUSS den Umschaltmechanismus in 5 Minuten verstehen
- README MUSS den 3-Schritt-Ablauf (.env → config.js → app.js) zeigen
- Jede Designentscheidung MUSS dokumentiert sein

### NFR-2: Übertragbarkeit
- Pattern MUSS auf Next.js, React (CRA) und Vanilla JS übertragbar sein
- README MUSS für jedes Framework Beispiele zeigen
- Keine Vite-spezifischen Features außer `.env`-Loading

### NFR-3: Minimalismus
- Kein Over-Engineering
- Keine Features, die nicht zum Tutorial beitragen
- Keine externen Dependencies außer Vite

### NFR-4: Sicherheit (Awareness)
- README MUSS warnen: "Keine Secrets in Browser-Code!"
- Upload-Feature MUSS als "Demo-only" gekennzeichnet sein

## Constraints

### C-1: Keine Runtime-Logik für Environment-Switching
- Der Modus darf NICHT zur Runtime per URL-Parameter, Hostname o.ä. gewechselt werden
- Build-Time ist explizit gewollt (Sicherheit, Performance)

### C-2: Deutsche Sprache
- Alle Texte, Comments, README auf Deutsch
- Variablennamen auf Englisch (Code-Konvention)

### C-3: Git-Struktur
- Branch: `main` (nicht `master`)
- Commits MÜSSEN aussagekräftige Messages haben
- Co-Authored-By: Claude MUSS in Commit-Messages stehen (wenn von LLM generiert)

## Acceptance Criteria

Das Tutorial ist erfolgreich, wenn:
1. Ein User `npm install && npm run dev` ausführen kann und sofort den Unterschied sieht
2. Nach `gh repo create` und Push läuft GitHub Pages automatisch
3. Ein User das Pattern auf ein eigenes Projekt übertragen kann
4. Der Umschaltmechanismus eindeutig nachvollziehbar ist
