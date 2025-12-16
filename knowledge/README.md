# Knowledge Base (Promptotyping Documents)

Diese Dokumente folgen der **Promptotyping-Methode** und dienen als externes Arbeitsgedächtnis für LLM-Agenten.

## Zweck

Wenn du dieses Projekt mit einem LLM-Agenten (Claude, ChatGPT, etc.) weiterentwickeln willst, **kopiere diese Dokumente in den Chat-Kontext**. Der Agent versteht dann sofort:
- Die Architektur und Designentscheidungen
- Die Datenlogik und Feature-Flags
- Die Anforderungen und Constraints
- Warum Dinge so gebaut wurden, wie sie sind

## Dokumente

- `context.md` - Was ist dieses Projekt? Wofür ist es da?
- `requirements.md` - Funktionale und technische Anforderungen
- `design.md` - Architekturentscheidungen und Patterns
- `data.md` - Datenstruktur und Manifest-Logik
- `promptotyping-journal.md` - Prozessdokumentation aller Entscheidungen

## Verwendung

**Beispiel-Prompt:**
```
Ich möchte Feature X hinzufügen. Lies bitte zuerst:
- knowledge/context.md
- knowledge/design.md
- knowledge/requirements.md

Dann erkläre mir, wie ich Feature X am besten integriere.
```

Der Agent hat dann den vollen Kontext und schlägt Lösungen vor, die zum bestehenden Design passen.

## Mehr zu Promptotyping

Diese Methode stammt aus der Digital Humanities Forschung und nutzt strukturierte Markdown-Dokumente als "externes Gedächtnis" für LLMs. Mehr dazu in der wissenschaftlichen Literatur (siehe `promptotyping-journal.md`).
