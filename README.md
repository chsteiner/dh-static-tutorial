# Environment-basierte Feature Flags für Static Sites

Zeigt wie man unterschiedliche Features für lokale Entwicklung vs. Production hat – ohne separate Git-Branches.

**Das Konzept:** Environment-Variablen schalten Features ein/aus.

## Ausprobieren

```bash
npm install

# Lokal: Upload-Feature AN, zeigt data/local/
npm run dev

# Production: Upload-Feature AUS, zeigt data/corpus/
npm run build && npm run preview
```

Der Unterschied ist sofort sichtbar: Verschiedene Daten, verschiedene Features.

## Wie der Umschaltmechanismus funktioniert

### Der Ablauf:

**1. Vite lädt automatisch die richtige .env Datei**

```bash
npm run dev      → Vite lädt .env.local       (VITE_ENABLE_UPLOAD=true)
npm run build    → Vite lädt .env.production  (VITE_ENABLE_UPLOAD=false)
```

Vite ersetzt beim Build `import.meta.env.VITE_*` mit den tatsächlichen Werten.

**2. Die Werte werden in config.js verfügbar gemacht** ([src/config.js](src/config.js))

```js
export const config = {
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',  // true oder false
  dataPath: import.meta.env.VITE_DATA_PATH                      // './data/local' oder './data/corpus'
}
```

**3. Der Code entscheidet basierend auf config** ([src/app.js](src/app.js))

```js
// Upload-Sektion nur anzeigen wenn enableUpload = true
if (config.enableUpload) {
  this.renderUploadSection()
}

// Manifest von unterschiedlichen Pfaden laden
await fetch(`${config.dataPath}/manifest.json`)
```

### Konkret:

**Lokale Entwicklung (`npm run dev`):**
- `.env.local` wird geladen
- `enableUpload = true` → Upload-Sektion wird gerendert
- `dataPath = './data/local'` → Lädt `data/local/manifest.json`

**Production Build (`npm run build`):**
- `.env.production` wird geladen
- `enableUpload = false` → Upload-Sektion wird NICHT gerendert
- `dataPath = './data/corpus'` → Lädt `data/corpus/manifest.json`

Die Werte werden **zur Build-Zeit fest eingebacken** - es gibt keine Runtime-Logik!

## GitHub Pages Deployment

```bash
gh repo create mein-projekt --public --source=. --push
```

Settings → Pages → Source: "GitHub Actions"

Fertig. Bei jedem Push wird automatisch deployed.

## Auf eigene Projekte übertragen

**Dateien kopieren:**
- `.env.local` / `.env.production` → Anpassen für deine Variablen
- `.github/workflows/deploy.yml` → Build-Command anpassen falls nötig
- `src/config.js` → Pattern übernehmen

**Andere Frameworks:**

**Next.js:**
- `NEXT_PUBLIC_*` statt `VITE_*`
- Rest identisch

**React (CRA):**
- `REACT_APP_*` statt `VITE_*`
- Rest identisch

**Vanilla JS (ohne Build-Tool):**
```html
<!-- index.html -->
<script>
  const config = {
    enableUpload: document.body.dataset.env === 'dev',
    dataPath: document.body.dataset.dataPath
  }
</script>
```
```bash
# Build-Script erstellt zwei Versionen:
# dev.html: <body data-env="dev" data-data-path="./data/local">
# prod.html: <body data-env="prod" data-data-path="./data/corpus">
```

**Wichtig:** Keine Secrets in Browser-Code! Environment-Variablen sind im Bundle sichtbar.
