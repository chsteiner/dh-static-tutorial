# Context: Environment-basierte Feature Flags Tutorial

## Was ist dieses Projekt?

Ein **Tutorial-Projekt**, das zeigt, wie man mit Environment-Variablen unterschiedliche Features für lokale Entwicklung vs. Production aktiviert – **ohne separate Git-Branches**.

## Zielgruppe

- Digital Humanities Forschende, die Static Sites bauen
- Studierende, die Prototyping mit verschiedenen Datensets lernen wollen
- Entwickler:innen, die das Pattern auf andere Frameworks übertragen wollen

## Lernziel

User sollen verstehen:
1. Wie Vite automatisch `.env.local` vs `.env.production` lädt
2. Wie `import.meta.env.VITE_*` zur Build-Zeit ersetzt wird
3. Wie man Features conditional rendert (`if (config.enableUpload)`)
4. Wie man das Pattern auf Next.js, React, Vanilla JS überträgt

## Das konkrete Beispiel

Eine Mini-Editions-App, die:
- **Lokal**: Upload-Feature zeigt, Daten aus `data/local/` lädt (Experimentier-Modus)
- **Production**: Upload-Feature versteckt, Daten aus `data/corpus/` lädt (kuratierter Corpus)

## Warum ist das wichtig?

In DH-Projekten gibt es oft:
- Rohe, experimentelle Daten (lokal)
- Kuratierte, versionierte Daten (GitHub Pages)

Mit diesem Pattern kann man **eine Codebase** für beide Modi nutzen.

## Tutorial-Philosophie

- **Bare Minimum**: Keine Over-Engineering, nur das Nötigste
- **Copy-Paste-Ready**: User können Dateien direkt übernehmen
- **Committed Examples**: `example-*` Dateien sind im Repo, User sieht sofort wie es funktioniert
- **Deutsche Sprache**: Zielgruppe ist deutschsprachiger DH-Raum

## Technologie-Stack

- **Vite** - Build-Tool mit automatischem .env-Loading
- **Vanilla JS** - Kein Framework, maximal zugänglich
- **GitHub Actions** - Automatisches Deployment zu GitHub Pages
- **TEI-XML** - Beispieldaten als historische Dokumente (Nibelungenlied)

## Nicht-Ziele

- ❌ Kein vollständiges Editions-Tool
- ❌ Keine komplexe State-Management-Lösung
- ❌ Kein Production-Ready Code für große Projekte
- ❌ Keine Security Features (Uploads sind Demo-only)

## Kontext im größeren Ecosystem

Dieses Tutorial ist Teil der **Digital Humanities Craft** Materialien und dient als Einstieg in moderne Entwicklungs-Patterns für Forschende.
