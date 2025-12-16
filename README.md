# 📜 Mini Editions-App – Static Site Tutorial

Ein minimales Demo-Projekt das zeigt, wie man **Environment-basierte Feature-Flags** für DH Static Sites implementiert.

> **🎯 Lernziel:** Nach diesem Tutorial kannst du Feature-Flags in deinen eigenen Projekten nutzen, um unterschiedliche Funktionalität für lokale Entwicklung vs. Produktiv-Deployment zu haben – **ohne separate Git-Branches!**

## Das Problem

- **Lokal**: Upload/Bearbeitung von Dokumenten soll möglich sein
- **Produktiv (GitHub Pages)**: Nur ein kuratierter, fixer Datensatz

## Die Lösung

**Nicht:** Zwei Branches (führt zu Merge-Hölle)  
**Sondern:** Feature-Flags über Environment-Variablen

## Quick Start

```bash
# Dependencies installieren
npm install

# Lokal starten (mit Upload-Funktion)
npm run dev
# → Öffne http://localhost:5173
# → Du siehst das LOKALE Dokument aus data/local/

# Produktiv-Build testen (ohne Upload)
npm run build
npm run preview
# → Du siehst das PRODUKTIV Dokument aus data/corpus/
```

### 🎯 Der Unterschied wird sofort sichtbar!

Wenn du `npm run dev` startest, siehst du:
- **"⚠️ LOKAL-ONLY"** Dokumente aus `data/local/`
- Upload-Funktion ist aktiv

Wenn du `npm run build && npm run preview` startest, siehst du:
- **"✅ PRODUKTIV-CORPUS"** Dokumente aus `data/corpus/`
- Keine Upload-Funktion (wie auf GitHub Pages)

## Projektstruktur

```
├── src/
│   ├── app.js          # Haupt-App
│   ├── config.js       # Feature-Flags
│   └── style.css
├── data/
│   ├── corpus/         # ✅ Kuratiert, versioniert (wird auf GitHub Pages deployed)
│   │   ├── manifest.json
│   │   └── nibelungen.xml
│   └── local/          # ⚠️ Beispieldateien committet, User-Daten gitignored
│       ├── example-local.xml
│       ├── example-manifest.json
│       └── README.md
├── .env.local          # Lokale Entwicklung: Upload ON
├── .env.production     # Produktiv-Build: Upload OFF
├── .env.example        # Dokumentation (Best Practice)
└── .github/workflows/
    └── deploy.yml      # Automatisches Deployment
```

## Wie es funktioniert

### 1. Feature-Flag in `config.js`

```javascript
export const config = {
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
  dataPath: import.meta.env.VITE_DATA_PATH || './data/corpus',
}
```

### 2. Bedingte UI in `app.js`

```javascript
if (config.enableUpload) {
  this.renderUploadSection()
}
```

### 3. Environment-Dateien

| Datei | `ENABLE_UPLOAD` | `DATA_PATH` | Wann? |
|-------|-----------------|-------------|-------|
| `.env.local` | `true` | `./data/local` | `npm run dev` |
| `.env.production` | `false` | `./data/corpus` | `npm run build` |
| `.env.example` | - | - | Nur Dokumentation |

### 4. GitHub Actions Build

```yaml
env:
  VITE_ENABLE_UPLOAD: 'false'
  VITE_DATA_PATH: './data/corpus'
```

## 📤 Auf GitHub teilen & deployen

### Tutorial-Ansatz: Beispieldateien werden committed!

Dieses Projekt ist ein **Tutorial**, daher werden die Beispieldateien committet, damit User beim Klonen sofort den Unterschied zwischen `data/local/` und `data/corpus/` sehen:

**Was wird committet:**
- ✅ `data/local/example-local.xml` - Zeigt wie lokale Daten aussehen
- ✅ `data/local/example-manifest.json` - Template zum Kopieren
- ✅ `data/local/README.md` - Anleitung für User
- ✅ `.env.local` - Lokale Dev-Konfiguration (als Beispiel)
- ✅ `.env.production` - Produktiv-Konfiguration

**Was wird NICHT committet** (für User-Experimente):
- ❌ `data/local/manifest.json` (eigene Version)
- ❌ `data/local/*.xml` (außer example-*.xml)
- ❌ `.env.development` (eigene Overrides)

### GitHub Pages Deployment

1. Repository auf GitHub pushen
2. Settings → Pages → Source: **"GitHub Actions"**
3. Push auf `main` triggert automatisch den Build

Die App ist dann unter `https://<user>.github.io/<repo>/` erreichbar und zeigt:
- ✅ **Nur** Dokumente aus `data/corpus/`
- ✅ **Keine** Upload-Funktion
- ✅ **Keine** lokalen Experimental-Daten

### Was passiert mit data/local/?

| Wo? | Was ist sichtbar? | Warum? |
|-----|-------------------|--------|
| **Lokal (npm run dev)** | Example-Dokumente + deine Experimente | `.env.local` setzt `DATA_PATH=./data/local` |
| **GitHub Pages** | Nur `data/corpus/` | `.env.production` setzt `DATA_PATH=./data/corpus` |
| **GitHub Repository** | Nur `example-*` Dateien + README | `.gitignore` schließt User-Daten aus |

## Eigene Dokumente hinzufügen

### Zum kuratierten Corpus (produktiv)

1. XML-Datei in `data/corpus/` ablegen
2. `data/corpus/manifest.json` aktualisieren:

```json
{
  "documents": [
    { "id": "neu", "title": "Neues Dokument", "file": "neu.xml" }
  ]
}
```

3. Commit & Push → GitHub Actions baut neu

### Zum lokalen Testen

1. **Template kopieren:**
   ```bash
   cp data/local/example-manifest.json data/local/manifest.json
   ```

2. **Datei in `data/local/` kopieren:**
   ```bash
   cp mein-dokument.xml data/local/
   ```

3. **`manifest.json` aktualisieren** (siehe [data/local/README.md](data/local/README.md) für Details)

4. **Starten:**
   ```bash
   npm run dev
   ```

## 🔄 Auf eigene Projekte übertragen

Du willst dieses Setup für dein eigenes Projekt nutzen? Hier ist die Checkliste:

### 1. Dateien kopieren & anpassen

**Environment-Setup:**
```bash
# Kopiere diese Dateien in dein Projekt:
.env.local          # Anpassen: deine lokalen Werte
.env.production     # Anpassen: deine Produktiv-Werte
.env.example        # Dokumentation für dein Team
```

**Feature-Flag Logic:**
```javascript
// In deiner config.js oder ähnlich:
export const config = {
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
  dataPath: import.meta.env.VITE_DATA_PATH || './data/corpus',
  // Weitere Feature-Flags nach Bedarf...
}

// In deinem Code:
if (config.enableUpload) {
  // Feature nur lokal zeigen
}
```

**GitHub Actions:**
```bash
# Kopiere .github/workflows/deploy.yml
# Anpassen:
# - Environment-Variablen (VITE_* für Vite, REACT_APP_* für React, etc.)
# - Build-Command falls anders (z.B. "next build" für Next.js)
# - Output-Directory falls anders (z.B. "out" für Next.js statt "dist")
```

### 2. Für andere Frameworks

**Next.js:**
- Verwende `NEXT_PUBLIC_*` statt `VITE_*`
- `.env.local` und `.env.production` funktionieren analog
- Build-Command: `next build && next export` (für Static Export)

**Create React App:**
- Verwende `REACT_APP_*` statt `VITE_*`
- Rest funktioniert identisch

**Vanilla JS (ohne Build-Tool):**
- Nutze `<script>` Tags mit `data-*` Attributen
- Oder: Separate config.js für dev/prod

### 3. Wichtige Prinzipien

✅ **Niemals Secrets in Environment-Variablen im Browser-Code!**
   - `VITE_*` Variablen sind im Client-Bundle sichtbar
   - Nur nicht-sensitive Werte (API-URLs, Feature-Flags, etc.)

✅ **`.env.local` committen ist unüblich, aber hier OK**
   - Normalerweise: `.env.local` ist gitignored
   - Für Tutorials: Committen ist hilfreich
   - Für echte Projekte: `.env.example` reicht

✅ **GitHub Actions überschreibt .env-Dateien**
   - Workflow-Level `env:` hat höchste Priorität
   - Gut für Sicherheit und Kontrolle

## Erweiterungsideen

- [ ] XSLT-Transformation für schönere Anzeige
- [ ] Such-Funktion über Dokumente
- [ ] Annotationen / Kommentare
- [ ] Export als PDF

---

*Teil der Promptotyping Best Practices – [Digital Humanities Craft OG](https://github.com/digital-humanities-craft)*
