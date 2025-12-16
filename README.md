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

## Wie es funktioniert

**1. Environment-Variablen definieren**

```
.env.local       → VITE_ENABLE_UPLOAD=true,  VITE_DATA_PATH=./data/local
.env.production  → VITE_ENABLE_UPLOAD=false, VITE_DATA_PATH=./data/corpus
```

**2. In Code verwenden** ([src/config.js](src/config.js))

```js
export const config = {
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
  dataPath: import.meta.env.VITE_DATA_PATH
}
```

**3. Features toggeln** ([src/app.js](src/app.js))

```js
if (config.enableUpload) {
  this.renderUploadSection()  // Nur lokal
}
```

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
- Next.js: `NEXT_PUBLIC_*` statt `VITE_*`
- React (CRA): `REACT_APP_*` statt `VITE_*`
- Workflow: Build-Command + Output-Dir anpassen

**Wichtig:** Keine Secrets in Browser-Code! Environment-Variablen sind im Bundle sichtbar.
