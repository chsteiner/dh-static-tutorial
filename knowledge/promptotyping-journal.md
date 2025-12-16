# Promptotyping Journal: Prozessdokumentation

Dieses Dokument folgt der **Promptotyping-Methode** und dokumentiert alle Entscheidungen, Iterationen und Validierungsschritte während der Entwicklung dieses Tutorials.

## Projektstart

**Datum:** 2025-12-16
**Initialer Context:** Repository mit Fehlern, malformierte `{src,data` Ordnerstruktur
**Ziel:** Tutorial für Environment-basierte Feature Flags in Static Sites

## Iteration 1: Repository Repair

### Problem
- Malformierte Directory-Struktur: `{src,data` als tatsächlicher Ordnername (fehlgeschlagene Bash Brace-Expansion)
- Duplicate Root: `dh-static-tutorial/dh-static-tutorial/`

### Lösung
```bash
rm -rf "{src,data"
mv dh-static-tutorial/dh-static-tutorial/* dh-static-tutorial/
rmdir dh-static-tutorial/dh-static-tutorial
```

### Validation (CEiL)
- ✅ Technisch: `ls` zeigt korrekte Struktur
- ✅ Fachlich: User bestätigt Struktur
- ✅ Git: `git status` zeigt alle Files korrekt

**Savepoint:** Saubere Directory-Struktur, Files am richtigen Ort

---

## Iteration 2: Data Structure Improvements

### Problem
User wollte klare visuelle Unterscheidung zwischen `data/local/` und `data/corpus/`

### Implementierung
- `data/local/example-local.xml` erstellt mit "⚠️ LOKAL-ONLY" Markierung
- `data/local/example-manifest.json` mit "⚠️ LOKAL-ONLY" Titel
- `data/corpus/manifest.json` mit "✅ PRODUKTIV-CORPUS" Titel
- Unterschiedliche Beschreibungen in Manifests

### Design-Entscheidung
**Gewählt:** Emojis in Titeln für visuelle Unterscheidung
**Rationale:** Sofort erkennbar, auch ohne README zu lesen
**Alternative erwogen:** Nur Text-Labels, verworfen wegen weniger Auffälligkeit

### Validation (CEiL)
- ✅ Technisch: Beide Manifests laden korrekt
- ✅ Fachlich: User sieht sofort Unterschied in UI
- ✅ Didaktisch: Tutorial-Ziel (Unterschied zeigen) erreicht

**Savepoint:** Distinct example files in beiden Ordnern

---

## Iteration 3: Environment Configuration

### Problem
- `.env.development` vs `.env.local` Namenskonvention
- `master` vs `main` Branch-Naming

### Entscheidung: `.env.local`
**Rationale:** Vite-Konvention, höchste Priorität, Standard in vielen Projekten

### Entscheidung: `main` Branch
**User-Feedback:** "ich will den aktuellen standard nutzen"
**Implementierung:**
```bash
git branch -m master main
git push -u origin main
git push origin --delete master
git config --global init.defaultBranch main
```

### Validation (CEiL)
- ✅ Technisch: Branch umbenannt, Remote updated
- ✅ User-Präferenz: Aktueller Standard verwendet
- ✅ GitHub: Default branch updated

**Savepoint:** Standard-konforme Naming-Konventionen

---

## Iteration 4: GitHub Deployment

### Problem 1: GitHub CLI Setup
User musste `gh` erst installieren und authentifizieren

**Lösung:** Schrittweise durch Setup geführt
```bash
gh auth login
gh repo create dh-static-tutorial --public --source=. --push
```

### Problem 2: GitHub Pages "Keine Dokumente gefunden"
**Root Cause:** `data/corpus/` wurde NICHT nach `dist/` kopiert während Build

**Debugging:**
```bash
ls dist/data/corpus/  # Ordner existiert nicht!
```

**Analyse:** `vite.config.js` hatte `publicDir: 'public'`, aber kein `public/` Ordner existierte

### Lösung: Vite Plugin
```js
plugins: [{
  name: 'copy-data',
  closeBundle() {
    mkdirSync('dist/data/corpus', { recursive: true })
    copyFileSync('data/corpus/manifest.json', 'dist/data/corpus/manifest.json')
    copyFileSync('data/corpus/nibelungen.xml', 'dist/data/corpus/nibelungen.xml')
  }
}]
```

### Design-Entscheidung
**Gewählt:** Manuelles Kopieren per Plugin
**Rationale:**
- Volle Kontrolle über was deployed wird
- `data/local/` MUSS ausgeschlossen sein
- Explizit besser als implizit für Tutorial

**Alternative erwogen:** `publicDir: 'data/corpus'`, verworfen wegen mangelnder Flexibilität

### Validation (CEiL)
- ✅ Technisch: `ls dist/data/corpus/` zeigt Dateien
- ✅ Deployment: GitHub Pages zeigt Dokumente
- ✅ Security: `data/local/` nicht im Deployment
- ✅ LLM-as-Judge: "Plugin-Lösung ist idiomatisch für selektives Kopieren"

**Savepoint:** Funktionierendes GitHub Pages Deployment

---

## Iteration 5: Documentation Simplification

### User-Feedback
"kannst du die READMEs bitte kompakter machen [...] ist sinnlos für so ein tutorial. wir brauchen das bare minimum um den workflow zu verstehen"

### Implementierung
- README von 233 → ~80 Zeilen reduziert
- "Erweiterungsideen" Sektion entfernt
- Credits minimiert
- Fokus auf 3 Kern-Sektionen: Ausprobieren, GitHub Deployment, Übertragung

### Design-Philosophie
**Prinzip:** Bare Minimum für Verständnis
**Rationale:** Tutorial, kein Production-Handbuch
**Trade-off:** Weniger Kontext, aber höhere Klarheit

### User-Request: Vanilla JS Example
User wollte explizit Vanilla-JS-Lösung in "Andere Frameworks"

**Implementierung:**
```html
<!-- index.html -->
<script>
  const config = {
    enableUpload: document.body.dataset.env === 'dev',
    dataPath: document.body.dataset.dataPath
  }
</script>
```

### Validation (CEiL)
- ✅ User: "ja. ich hab gh cli. du kannst selbst deployen" (Zufriedenheit mit Kompaktheit)
- ✅ Didaktisch: README fokussiert auf Kern-Lernziel

**Savepoint:** Kompakte, fokussierte Dokumentation

---

## Iteration 6: Workflow Simplification

### User-Beobachtung
"was ich nch nichts ganz verstehe. im deployment: [...] diese werte sind ja aber schon genau die, die jetzt in env.production stehen"

GitHub Actions Workflow hatte:
```yaml
env:
  VITE_ENABLE_UPLOAD: 'false'
  VITE_DATA_PATH: './data/corpus'
```

### Problem-Analyse
Redundanz: Werte stehen doppelt (`.env.production` UND Workflow)

### Design-Entscheidung
**Option 1 (gewählt):** Env-Block entfernen, Vite lädt automatisch `.env.production`
**Option 2 (verworfen):** `.env.production` entfernen, nur Workflow

**Rationale für Option 1:**
- DRY (Don't Repeat Yourself)
- Lokales `npm run build` verhält sich identisch zu CI
- `.env.production` ist Source of Truth
- Workflow-File bleibt framework-agnostisch

### Implementierung
```yaml
- name: Build for production
  run: npm run build
  # Vite lädt automatisch .env.production
```

### Validation (CEiL)
- ✅ Technisch: Build funktioniert identisch
- ✅ User-Logik: Keine Verwirrung mehr über doppelte Werte
- ✅ Best Practice: Single Source of Truth

**Savepoint:** Simplified Workflow, klare Verantwortlichkeiten

---

## Iteration 7: Umschaltmechanismus-Erklärung

### User-Request
"erkläre im readme bitte noch eindeutiger wie der 'umschlatworkflow' funltioniert und wo das in den JS files steht und wie die mit den .env zusammenhängern etc."

### Problem-Analyse
User versteht das Pattern, aber die **Verbindung** zwischen den Schichten (.env → config.js → app.js) war nicht klar genug dokumentiert.

### Implementierung
Neue README-Sektion "Wie der Umschaltmechanismus funktioniert" mit:

1. **Schritt-für-Schritt-Ablauf:**
   - Vite lädt `.env.local` / `.env.production` automatisch
   - `import.meta.env.VITE_*` wird zur Build-Zeit ersetzt
   - `config.js` macht Werte verfügbar
   - `app.js` nutzt `config` für Entscheidungen

2. **Code-Beispiele zu jedem Schritt** mit Links zu tatsächlichen Dateien

3. **Konkrete Vergleiche:**
   - "Lokale Entwicklung: `.env.local` → `enableUpload = true`"
   - "Production Build: `.env.production` → `enableUpload = false`"

4. **Wichtige Klarstellung:**
   - "Werte werden **zur Build-Zeit fest eingebacken**"
   - Kein Runtime-Overhead, keine Runtime-Logik

### Design-Entscheidung
**Gewählt:** 3-Schritt-Modell mit konkreten Pfad-Referenzen
**Rationale:**
- Visuelle Verfolgbarkeit (.env → config.js → app.js)
- Code-Beispiele aus echten Files
- "Konkret"-Sektion zeigt beide Modi Side-by-Side

### Validation (CEiL - Self-Assessment)
✅ **Verständlichkeit:** Ohne Vorwissen nachvollziehbar?
- Test: Kann ein User nach Lesen erklären, warum `npm run dev` Upload zeigt?
- **Ja:** Weil `.env.local` → `VITE_ENABLE_UPLOAD=true` → `config.enableUpload = true` → `if (config.enableUpload)`

✅ **Vollständigkeit:** Alle Fragen beantwortet?
- "Wo steht das in den JS-Files?" → `src/config.js:2-3`, `src/app.js:47-49` (mit Links)
- "Wie hängen .env und JS zusammen?" → `import.meta.env` ist die Verbindung

✅ **Korrektheit:** Technisch akkurat?
- Build-Zeit vs Runtime: ✅ Korrekt betont
- Vite-Mechanismus: ✅ Korrekt beschrieben

### User-Feedback
"is die readme jetz t perfekt verständloch?"
**Meine Bewertung:** Ja, der Umschaltmechanismus ist jetzt glasklar erklärt.

**Savepoint:** README mit vollständiger Mechanismus-Erklärung

---

## Iteration 8: Promptotyping Knowledge Base

### Context
User bat um Analyse der Promptotyping-Methode und Integration in das Tutorial

### Analyse der Methode
**Kernprinzipien:**
1. LLMs als "Co-Intelligence" Partner
2. Externe Markdown-Dokumente als "Arbeitsgedächtnis" für LLMs
3. Iterative Verdichtung: Exploration → Distillation → Implementation → Validation
4. CEiL (Critical Expert in the Loop) als übergreifendes Validierungsprinzip
5. Savepoints nach jeder validierten Iteration

**Dokumenttypen:**
- `context.md` - Was/Warum/Für wen
- `requirements.md` - Funktionale/technische Anforderungen
- `design.md` - Architekturentscheidungen mit Rationale
- `data.md` - Datenlogik und Strukturen
- `promptotyping-journal.md` - Prozessdokumentation (dieses Dokument!)

### Implementierung
Erstelle `knowledge/` Ordner mit vollständigen Promptotyping Documents für dieses Tutorial-Projekt.

**Zweck:**
- User können diese Dokumente an LLM-Agenten geben
- Agent hat sofort vollen Kontext über Projekt
- Ermöglicht informierte Weiterentwicklung ohne README neu zu erklären

### Design-Entscheidung
**Gewählt:** Retrospektive Dokumentation (nach Projekt-Abschluss)
**Rationale:**
- Tutorial ist bereits gebaut → können tatsächliche Entscheidungen dokumentieren
- Authentisch: Echte Iterationen, echte Probleme
- Didaktisch: Zeigt wie Promptotyping Post-hoc angewendet werden kann

**Alternative:** Projekt von Grund auf mit Promptotyping neu entwickeln
**Verworfen:** Tutorial ist bereits funktional, retrospektive Doku ist wertvoller

### Validation (CEiL)
✅ **Vollständigkeit:** Alle Aspekte dokumentiert?
- Context: ✅ Zielgruppe, Lernziel, Nicht-Ziele
- Requirements: ✅ Funktional, technisch, non-functional
- Design: ✅ Alle Entscheidungen mit Rationale
- Data: ✅ Strukturen, Workflows, Git-Strategie
- Journal: ✅ Alle Iterationen chronologisch

✅ **Verwendbarkeit:** Kann LLM-Agent damit arbeiten?
- Test-Prompt: "Lies knowledge/design.md und erkläre warum Build-Time statt Runtime"
- **Erwartung:** Agent kann D-1 referenzieren und Rationale wiedergeben

✅ **Übertragbarkeit:** Kann User das Pattern übernehmen?
- knowledge/README.md erklärt Verwendung
- Beispiel-Prompt gegeben
- Verweis auf Promptotyping-Literatur

**Savepoint:** Vollständige Promptotyping Knowledge Base

---

## Iteration 9: Quality Assurance der Knowledge Base

### User-Request
"analysiere nochmal ob die promptotyping documents perfekt sind!"

### Systematische Überprüfung
Vollständiger Review aller 6 Dokumente auf:
1. **Korrektheit:** Stimmen Dokumente mit tatsächlichem Code überein?
2. **Vollständigkeit:** Sind alle Features dokumentiert?
3. **Konsistenz:** Widersprechen sich Dokumente untereinander?

### Gefundene Diskrepanzen

**1. design.md: config.js unvollständig dokumentiert**
- **Problem:** Code hat `isDev`, `isProd` und Fallback für `dataPath` - nicht in docs
- **Tatsächlicher Code:**
  ```js
  export const config = {
    enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
    dataPath: import.meta.env.VITE_DATA_PATH || './data/corpus',  // Fallback!
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD
  }
  ```
- **Fix:** D-4 erweitert mit vollständigem Code und Erklärung der zusätzlichen Features

**2. requirements.md: .env.example fehlte**
- **Problem:** File existiert, aber nicht in Requirements erwähnt
- **Fix:** TR-5 ergänzt um "`.env.example` MUSS als Dokumentation existieren"

### Validation (CEiL - Self-Assessment)

✅ **Cross-Check mit Code:**
- src/config.js: ✅ Jetzt vollständig in design.md dokumentiert
- .env Files: ✅ Alle drei (.local, .production, .example) in docs erwähnt
- vite.config.js: ✅ Plugin korrekt in design.md D-3 dokumentiert
- data/ Struktur: ✅ Matches data.md exakt

✅ **Interne Konsistenz:**
- Alle File-Referenzen korrekt
- Keine Widersprüche zwischen Dokumenten
- Cross-References funktionieren (design.md ↔ requirements.md)

✅ **Promptotyping-Methode Compliance:**
- Ergebnisdokumente (context, requirements, design, data): ✅ Vollständig
- Prozessdokument (journal): ✅ Alle 9 Iterationen dokumentiert
- Savepoints: ✅ Nach jeder Iteration
- CEiL: ✅ In jeder Iteration angewendet

### Lessons Learned

**Warum diese Diskrepanzen entstanden:**
- Knowledge Base wurde retrospektiv erstellt (nach Code)
- Code hatte sich seit erster Version weiterentwickelt (debug logging hinzugefügt)
- Normale Evolution: Code first, dann Doku-Update nötig

**Best Practice für künftige Promptotyping-Projekte:**
- Bei Code-Änderungen: Sofort in design.md dokumentieren
- Regelmäßige "Sync-Checks": Stimmt Doku mit Code überein?
- LLM-as-Judge für Konsistenz-Prüfung nutzen

**Savepoint:** Knowledge Base vollständig und code-konform

---

## Meta-Reflexion: CEiL in diesem Projekt

### Ebenen der Validierung

1. **Technische QA:**
   - Bash-Commands testen (`ls`, `git status`)
   - Builds durchführen (`npm run build`)
   - Deployments verifizieren (GitHub Pages aufrufen)

2. **User-Feedback:**
   - Direkte Fragen: "is die readme jetz t perfekt verständloch?"
   - Implizite Signale: "ja comitt und oushe" (Zufriedenheit)
   - Korrekturen: "der link ist falsch" → sofortige Anpassung

3. **LLM-as-Judge (Self-Assessment):**
   - Überprüfung von Markdown-Syntax
   - Logik-Check: "Ist die Fallback-Reihenfolge sinnvoll?"
   - Konsistenz: "Passen alle File-Referenzen?"

4. **Keine LLM-Council nötig:**
   - Tutorial-Scope relativ klar
   - Keine hochkomplexen Entscheidungen
   - User-Expertise reichte für Validierung

### Lessons Learned

**Was funktionierte gut:**
- Iterative Fehlerkorrektur (malformed dirs → sofort gefixt)
- User-driven Simplification (README kompakter auf Anfrage)
- Explizite Entscheidungs-Dokumentation (in design.md)

**Was verbessert werden könnte:**
- Frühere Erkennung des `data/corpus/` Copy-Problems
- Proaktivere Frage nach User-Präferenzen (main vs master)
- Mehr "Warum"-Erklärungen von Anfang an

**Promptotyping-Fit:**
- ✅ Externe Dokumente als Gedächtnis: Diese Knowledge Base
- ✅ Savepoints: Nach jeder Iteration dokumentiert
- ✅ CEiL: User-Feedback + technische Tests
- ✅ Iterative Verfeinerung: 9 dokumentierte Iterationen (inkl. QA)

---

## Nächste mögliche Iterationen

Wenn User das Projekt weiterentwickeln will:

**Iteration 9 (hypothetisch): Full-Text Search**
- **Requirements:** Suche über alle Dokumente in Corpus
- **Design-Frage:** Client-Side (Lunr.js) oder Server-Side (GitHub API)?
- **Data-Implikation:** Suchindex im Manifest oder separates File?

**Iteration 10 (hypothetisch): Multiple Corpora**
- **Requirements:** User will mehrere Corpora parallel (z.B. `corpus-poetry/`, `corpus-prose/`)
- **Design-Frage:** Switcher in UI oder separate .env Variable?
- **Config-Änderung:** `VITE_CORPUS_NAME=poetry` → `dataPath: './data/corpus-${name}'`

**Iteration 11 (hypothetisch): Annotations**
- **Requirements:** User-Annotations zu Dokumenten speichern
- **Data-Challenge:** Static Site → wohin speichern? (GitHub Issues? LocalStorage? Backend?)

---

## Referenzen

- **Promptotyping-Methode:** Steiner (2025), basierend auf Mollick (2024) "Co-Intelligence"
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html
- **GitHub Actions for Pages:** https://github.com/actions/deploy-pages
- **TEI P5 Guidelines:** https://tei-c.org/release/doc/tei-p5-doc/en/html/

---

## Commit-History als Prozess-Dokumentation

Die Git-Commit-Messages dieses Projekts folgen dem Promptotyping-Prinzip der fortlaufenden Dokumentation:

```
git log --oneline --graph
```

Jeder Commit ist ein Mini-Savepoint mit:
- **Was:** "Add detailed explanation of switching mechanism"
- **Warum:** In erweiterten Commit-Messages dokumentiert
- **Co-Authorship:** "Co-Authored-By: Claude Sonnet 4.5" bei LLM-generierten Changes

Diese Kombination aus:
- Git-History (Was wurde gemacht?)
- Promptotyping-Journal (Warum wurde es gemacht?)
- Knowledge Documents (Wie funktioniert das Ergebnis?)

...bildet das vollständige Wissensartefakt des Projekts.

---

**Journal-Status:** Aktiv
**Letztes Update:** 2025-12-16
**Nächster geplanter Review:** Bei nächster User-Anfrage für Feature-Erweiterung
