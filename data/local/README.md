# 📁 data/local/

Dieser Ordner demonstriert **lokale Entwicklungsdaten** die NICHT auf GitHub Pages deployed werden.

## 🎯 Was ist hier?

- **`example-local.xml`** - Beispieldokument das zeigt, wie lokale Daten aussehen
- **`example-manifest.json`** - Template für dein eigenes Manifest
- **`README.md`** - Diese Datei

Diese `example-*` Dateien sind **Teil des Tutorials** und werden auf GitHub committet.

## 🧪 Eigene Experimente starten

1. **Kopiere das Example-Manifest:**
   ```bash
   cp data/local/example-manifest.json data/local/manifest.json
   ```

2. **Füge eigene XML-Dateien hinzu:**
   ```bash
   cp mein-dokument.xml data/local/
   ```

3. **Aktualisiere manifest.json:**
   ```json
   {
     "title": "Meine Test-Dokumente",
     "description": "Lokale Experimente",
     "documents": [
       {
         "id": "test",
         "title": "Mein Testdokument",
         "file": "mein-dokument.xml",
         "language": "de"
       }
     ]
   }
   ```

4. **Starte den Dev-Server:**
   ```bash
   npm run dev
   ```

## ⚠️ Was wird committet?

- ✅ `example-local.xml` - Tutorial-Beispiel
- ✅ `example-manifest.json` - Tutorial-Template
- ✅ `README.md` - Diese Anleitung
- ❌ `manifest.json` - Deine eigene Version (gitignored)
- ❌ `*.xml` (außer example-*) - Deine Experimente (gitignored)

Wenn du etwas auf GitHub Pages zeigen willst, verschiebe es nach `data/corpus/`!
