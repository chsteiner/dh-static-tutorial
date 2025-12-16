# Design: Architekturentscheidungen

## Überblick

Dieses Projekt nutzt **Build-Time Feature Flags** über Vite's Environment-Variablen-System. Der Kern ist ein 3-Schritt-Mechanismus: `.env` → `config.js` → `app.js`.

## Architektur-Diagramm (konzeptuell)

```
Development:
  npm run dev → Vite lädt .env.local → VITE_ENABLE_UPLOAD=true
                                    → VITE_DATA_PATH=./data/local
  → import.meta.env wird ersetzt → config.js exportiert { enableUpload: true, dataPath: './data/local' }
  → app.js importiert config → if (config.enableUpload) { renderUpload() }
  → fetch(`${config.dataPath}/manifest.json`) → lädt data/local/manifest.json

Production:
  npm run build → Vite lädt .env.production → VITE_ENABLE_UPLOAD=false
                                            → VITE_DATA_PATH=./data/corpus
  → import.meta.env wird ersetzt → config.js exportiert { enableUpload: false, dataPath: './data/corpus' }
  → app.js importiert config → Upload-Code wird NICHT ausgeführt
  → fetch(`${config.dataPath}/manifest.json`) → lädt data/corpus/manifest.json
  → closeBundle Plugin kopiert data/corpus → dist/data/corpus
```

## Entscheidungen und Rationale

### D-1: Build-Time statt Runtime

**Entscheidung:** Feature-Flags werden zur Build-Zeit eingebacken, nicht zur Runtime per URL/Hostname entschieden.

**Rationale:**
- Security: Kein versehentliches Aktivieren von Dev-Features in Production
- Performance: Kein Runtime-Overhead
- Simplicity: Keine komplexe Logik nötig
- Didaktik: Klarer zu verstehen als Runtime-Switching

**Alternative erwogen:** Hostname-Detection (`if (location.hostname === 'localhost')`). Verworfen wegen Sicherheitsrisiko und weniger didaktischem Wert.

### D-2: Vite als Build-Tool

**Entscheidung:** Vite (nicht Webpack, Parcel, Rollup direkt)

**Rationale:**
- Automatisches `.env`-Loading ohne Konfiguration
- Verbreitet im modernen JS-Ecosystem
- Schnell (wichtig für Tutorial-Erfahrung)
- Einfache Plugin-API für `closeBundle` Hook

**Alternative erwogen:** Vanilla JS ohne Build-Tool. Verworfen, weil `.env`-Mechanismus das Kern-Lernziel ist.

### D-3: Keine separate `public/` Directory

**Entscheidung:** `publicDir: false` in `vite.config.js`, manuelles Kopieren per Plugin

**Rationale:**
- Kontrolle über was ins Deployment geht
- `data/local/` darf NIE deployed werden
- `data/corpus/` MUSS deployed werden
- Explizit besser als implizit (didaktisch)

**Code:**
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

### D-4: Config-Abstraktionsschicht

**Entscheidung:** Zentrale `src/config.js` statt direktes `import.meta.env` in jedem File

**Rationale:**
- Single Source of Truth
- Typ-Konversion an einer Stelle (`=== 'true'` → boolean)
- Einfacher zu testen (Mock-Config möglich)
- Leichter übertragbar auf andere Frameworks

**Code:**
```js
// src/config.js
export const config = {
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
  dataPath: import.meta.env.VITE_DATA_PATH || './data/corpus',  // Fallback
  isDev: import.meta.env.DEV,   // Vite built-in für Debug-Logging
  isProd: import.meta.env.PROD  // Vite built-in
}
```

**Zusätzliche Features:**
- `dataPath` hat Fallback auf `./data/corpus` (fail-safe falls Variable fehlt)
- `isDev`/`isProd` sind Vite built-ins, nützlich für conditional console.log()
- Debug-Ausgabe im Dev-Modus zeigt Config beim Start

### D-5: Manifest mit Fallback

**Entscheidung:** Erst `manifest.json` versuchen, dann `example-manifest.json` als Fallback

**Rationale:**
- Tutorial-Friendly: User kann sofort `npm run dev` starten
- Wenn User eigene Daten hat: `manifest.json` überschreibt Beispiel
- Keine leere App beim ersten Start
- Didaktisch: Zeigt Fallback-Pattern

**Code:**
```js
let response = await fetch(`${config.dataPath}/manifest.json`)
if (!response.ok) {
  response = await fetch(`${config.dataPath}/example-manifest.json`)
}
```

### D-6: Committed Examples in `data/local/`

**Entscheidung:** `example-*.xml` und `example-manifest.json` werden committed, trotz `.gitignore data/local/*`

**Rationale:**
- User sieht sofort Beispielstruktur
- Kein leerer `data/local/` Ordner beim Clone
- `!data/local/example-*` in `.gitignore` erlaubt Ausnahmen
- Best Practice für Tutorials: Provide working examples

**Alternative erwogen:** Alles in `data/local/` gitignoren, User muss manuell Beispiele kopieren. Verworfen wegen schlechterer UX.

### D-7: `.env.local` statt `.env.development`

**Entscheidung:** Dateiname `.env.local` (nicht `.env.development`)

**Rationale:**
- Vite-Konvention: `.env.local` hat höchste Priorität
- Wird automatisch bei `npm run dev` geladen
- Standard in vielen Projekten
- `.env.development` würde auch funktionieren, ist aber weniger idiomatisch

### D-8: Keine `.env.example` Nutzung (außer Dokumentation)

**Entscheidung:** `.env.example` existiert nur als Doku, wird NICHT von Vite geladen

**Rationale:**
- Standard-Practice: `.env.example` ist nur Template
- User soll verstehen: `.env.local` und `.env.production` sind die echten Files
- `.env.example` zeigt alle Optionen mit Kommentaren

### D-9: GitHub Actions mit beiden Branch-Namen

**Entscheidung:** Workflow triggert auf `main` UND `master`

**Rationale:**
- User könnten beides haben
- Tutorial soll sofort funktionieren
- Keine Frustration wegen Branch-Name

**Code:**
```yaml
on:
  push:
    branches: [main, master]
```

### D-10: Vanilla JS Class-based Architecture

**Entscheidung:** `class EditionApp` mit Methoden für jede Render-Phase

**Rationale:**
- Verständlicher als funktionaler Ansatz für Nicht-JS-Expert:innen
- Klare Struktur: `init() → loadManifest() → render*()`
- OOP-Konzepte aus anderen Sprachen übertragbar
- Kein komplexes State-Management nötig

**Alternative erwogen:** Funktionaler Ansatz mit Closures. Verworfen wegen Komplexität für Zielgruppe.

### D-11: Kein Router, Single-Page

**Entscheidung:** Alles auf einer Seite, kein Routing

**Rationale:**
- Tutorial-Fokus ist Environment-Flags, nicht Routing
- Weniger Komplexität
- Dokumenten-Anzeige per `innerHTML`-Replacement reicht

**Trade-off:** Keine Browser-History für Dokument-Navigation. Akzeptiert für didaktische Klarheit.

### D-12: TEI-XML als Beispieldaten

**Entscheidung:** Historische Dokumente (Nibelungenlied) in TEI-ähnlichem XML

**Rationale:**
- Authentisch für DH-Kontext
- Zeigt typischen Use-Case (Editionen)
- XML-Parsing ist simpel (`textContent` reicht)
- Kultureller Erkennungswert

## Pattern für Übertragung auf andere Frameworks

### Next.js
```js
// config.js
export const config = {
  enableUpload: process.env.NEXT_PUBLIC_ENABLE_UPLOAD === 'true',
  dataPath: process.env.NEXT_PUBLIC_DATA_PATH
}
```

### React (CRA)
```js
// config.js
export const config = {
  enableUpload: process.env.REACT_APP_ENABLE_UPLOAD === 'true',
  dataPath: process.env.REACT_APP_DATA_PATH
}
```

### Vanilla JS ohne Build-Tool
```html
<!-- Zwei HTML-Files mit unterschiedlichen Configs -->
<script>
  window.APP_CONFIG = { enableUpload: true, dataPath: './data/local' }
</script>
```

## Erweiterbarkeit

**Was User hinzufügen können:**
- Weitere Environment-Variablen (z.B. `VITE_API_URL`)
- Weitere Features mit `if (config.someFeature)`
- Mehr Datenquellen in `dataPath`

**Was NICHT erweitert werden sollte:**
- Runtime-Switching (würde Kernkonzept brechen)
- Komplexe State-Management-Libs (würde Fokus verwässern)

## Performance-Überlegungen

- Build-Time Flags → Zero Runtime-Overhead
- Tree-Shaking entfernt toten Code (Upload-Sektion in Production)
- Manifest-Loading lazy, kein preload
- Keine großen Dependencies (nur Vite im Dev)

## Security-Überlegungen

- **Keine Secrets in .env**: README warnt explizit
- Upload-Feature ist Demo-only, speichert nichts persistent
- GitHub Pages ist statisch, keine Server-Side Vulnerabilities
- CORS: Fetch von gleichem Origin, kein CORS-Issue
