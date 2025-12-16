# data/local/

Lokale Entwicklungsdaten. Wird NICHT auf GitHub Pages deployed.

## Eigene Daten hinzufügen

```bash
# Manifest kopieren
cp data/local/example-manifest.json data/local/manifest.json

# Deine Dateien hinzufügen
cp mein-dokument.xml data/local/

# manifest.json editieren, dann:
npm run dev
```

## Was wird committet?

- `example-*` Dateien → Ja (Tutorial)
- Deine eigenen Dateien → Nein (gitignored)

Für Production: Verschiebe nach `data/corpus/`
