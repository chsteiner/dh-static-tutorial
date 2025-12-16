# Data: Datenstruktur und Logik

## Übersicht

Das Projekt arbeitet mit **zwei getrennten Datenverzeichnissen**, die über Environment-Variablen umgeschaltet werden.

```
data/
├── corpus/           # Kuratierte, versionierte Daten (Production)
│   ├── manifest.json
│   └── nibelungen.xml
└── local/            # Experimentelle, lokale Daten (Development)
    ├── .gitkeep
    ├── README.md
    ├── example-local.xml        # Committed als Tutorial-Beispiel
    └── example-manifest.json    # Committed als Tutorial-Beispiel
```

## Manifest-Struktur

### Format: `manifest.json`

```json
{
  "title": "Corpus-Titel (sichtbar in der UI)",
  "description": "Beschreibung des Datensatzes",
  "documents": [
    {
      "id": "eindeutige-id",
      "title": "Dokument-Titel",
      "file": "dateiname.xml",
      "language": "Sprache (z.B. 'Mittelhochdeutsch')",
      "date": "Datum/Epoche (optional)"
    }
  ]
}
```

### Beispiel: `data/corpus/manifest.json`

```json
{
  "title": "✅ PRODUKTIV-CORPUS (GitHub Pages)",
  "description": "Kuratierte, versionierte Dokumente – werden auf GitHub Pages deployed",
  "documents": [
    {
      "id": "nibelungen-001",
      "title": "Das Nibelungenlied (Auszug)",
      "file": "nibelungen.xml",
      "language": "Mittelhochdeutsch",
      "date": "13. Jh."
    }
  ]
}
```

### Beispiel: `data/local/example-manifest.json`

```json
{
  "title": "⚠️ LOKAL-ONLY (nicht auf GitHub)",
  "description": "Experimentelle Dokumente – NUR in deiner lokalen Entwicklungsumgebung sichtbar",
  "documents": [
    {
      "id": "local-test-001",
      "title": "Lokales Test-Dokument",
      "file": "example-local.xml",
      "language": "Mittelhochdeutsch",
      "date": "Testdaten"
    }
  ]
}
```

## XML-Dokumente

### Format

TEI-ähnliches XML mit Basisstruktur:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>Dokument-Titel</title>
      </titleStmt>
      <sourceDesc>
        <p>Quellenbeschreibung</p>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <lg>
        <l>Vers 1</l>
        <l>Vers 2</l>
      </lg>
    </body>
  </text>
</TEI>
```

### Verarbeitung in der App

Die App macht **kein vollständiges TEI-Parsing**, sondern zeigt nur:
```js
const text = xmlDoc.querySelector('text')?.textContent || 'Kein Text gefunden'
```

Für echte Editionen würde man einen TEI-Renderer wie [CETEIcean](https://github.com/TEIC/CETEIcean) nutzen.

## Datenladelogik

### 1. Manifest-Loading mit Fallback

```js
async loadManifest() {
  // Versuche zuerst manifest.json (user-created)
  let response = await fetch(`${config.dataPath}/manifest.json`)

  // Fallback zu example-manifest.json (template)
  if (!response.ok) {
    response = await fetch(`${config.dataPath}/example-manifest.json`)
  }

  if (!response.ok) throw new Error('Kein Manifest gefunden')

  const manifest = await response.json()
  this.documents = manifest.documents || []
  this.manifestTitle = manifest.title || 'Dokumente'
  this.manifestDescription = manifest.description || ''
}
```

**Rationale:**
- Tutorial-Friendly: Funktioniert sofort beim ersten `npm run dev`
- User kann `manifest.json` erstellen → überschreibt Beispiel
- Keine leere Seite beim Start

### 2. Dokument-Loading

```js
async loadDocument(filename) {
  const response = await fetch(`${config.dataPath}/${filename}`)
  if (!response.ok) throw new Error('Dokument nicht gefunden')

  const xmlText = await response.text()
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

  return xmlDoc.querySelector('text')?.textContent || 'Kein Text gefunden'
}
```

**Fehlerbehandlung:**
- Netzwerkfehler → User-freundliche Meldung
- Parse-Fehler → Zeigt Fehler-Markup
- Leere Dokumente → "Kein Text gefunden"

## Daten-Deployment

### Development (`npm run dev`)

- Vite Dev-Server serviert `data/local/` direkt
- Keine Kopie nötig
- Hot-Reload bei Datei-Änderungen

### Production (`npm run build`)

- Vite-Plugin kopiert `data/corpus/` nach `dist/data/corpus/`
- `data/local/` wird NICHT kopiert (Security)
- GitHub Actions deployt nur `dist/` → nur Corpus ist öffentlich

**Code (vite.config.js):**
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

## Git-Strategie

### Was wird committed?

**Immer:**
- `data/corpus/*` - Kuratierter Corpus
- `data/local/example-*` - Tutorial-Beispiele
- `data/local/README.md` - Anleitung
- `data/local/.gitkeep` - Hält Ordner im Repo

**Nie:**
- `data/local/manifest.json` - User-eigenes Manifest
- `data/local/*.xml` (außer `example-*.xml`) - User-Experimente

**.gitignore:**
```
data/local/*
!data/local/.gitkeep
!data/local/README.md
!data/local/example-local.xml
!data/local/example-manifest.json
```

## Daten-Workflow für User

### Lokale Entwicklung

1. **Beispiel-Manifest kopieren:**
   ```bash
   cp data/local/example-manifest.json data/local/manifest.json
   ```

2. **Eigene Dokumente hinzufügen:**
   ```bash
   cp mein-dokument.xml data/local/
   ```

3. **Manifest editieren:**
   ```json
   {
     "documents": [
       { "id": "mein-1", "title": "Mein Dokument", "file": "mein-dokument.xml", ... }
     ]
   }
   ```

4. **Starten:**
   ```bash
   npm run dev
   ```

### Production-Deployment

Wenn Daten produktionsreif sind:

1. **Nach `data/corpus/` verschieben:**
   ```bash
   mv data/local/mein-dokument.xml data/corpus/
   ```

2. **`data/corpus/manifest.json` updaten:**
   ```json
   {
     "documents": [
       { "id": "nibelungen-001", ... },
       { "id": "mein-1", "title": "Mein Dokument", "file": "mein-dokument.xml", ... }
     ]
   }
   ```

3. **Vite-Plugin anpassen (wenn neue Dateien):**
   ```js
   copyFileSync('data/corpus/mein-dokument.xml', 'dist/data/corpus/mein-dokument.xml')
   ```

4. **Committen und pushen:**
   ```bash
   git add data/corpus/
   git commit -m "Add new document"
   git push
   ```

## Datenschema-Validierung

**Aktuell:** Keine Schema-Validierung implementiert.

**Für Production würde man hinzufügen:**
- JSON-Schema für `manifest.json`
- TEI-RelaxNG-Schema für `.xml`-Dateien
- Pre-commit Hook mit Validierung

**Beispiel JSON-Schema (nicht implementiert):**
```json
{
  "type": "object",
  "required": ["title", "documents"],
  "properties": {
    "title": { "type": "string" },
    "description": { "type": "string" },
    "documents": {
      "type": "array",
      "items": {
        "required": ["id", "title", "file"],
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" },
          "file": { "type": "string", "pattern": "\\.xml$" },
          "language": { "type": "string" },
          "date": { "type": "string" }
        }
      }
    }
  }
}
```

## Performance-Überlegungen

- **Lazy Loading:** Dokumente werden erst beim Klick geladen
- **Kein Preload:** Manifest wird einmal beim Start geladen
- **Caching:** Browser cached Dateien automatisch (keine explizite Cache-Strategie)
- **Größe:** XML-Dateien sollten < 1 MB sein für gute UX

## Erweiterungsmöglichkeiten

**Was User hinzufügen können:**
- Weitere Metadaten im Manifest (`author`, `edition`, `version`)
- Mehrere Corpora (z.B. `data/corpus-a/`, `data/corpus-b/`)
- Mehrsprachigkeit (`manifest-de.json`, `manifest-en.json`)
- Full-Text-Search über alle Dokumente

**Limitierungen der aktuellen Implementierung:**
- Keine Paginierung (bei 100+ Dokumenten wird UI langsam)
- Keine Suche
- Kein Versionierung der Dokumente
- Keine Annotationen/Kommentare
