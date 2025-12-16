import { config } from './config.js'

/**
 * Mini Editions-App Demo
 * Zeigt wie Feature-Flags für Upload funktionieren
 */

class EditionApp {
  constructor() {
    this.documents = []
    this.init()
  }

  async init() {
    this.renderHeader()
    await this.loadManifest()
    this.renderDocumentList()
    
    if (config.enableUpload) {
      this.renderUploadSection()
    }
  }

  renderHeader() {
    const header = document.getElementById('header')
    const modeLabel = config.enableUpload 
      ? '🔧 Entwicklungsmodus (Upload aktiv)' 
      : '📚 Publikationsmodus (nur Lesen)'
    
    header.innerHTML = `
      <h1>📜 Mini Editions-App</h1>
      <p class="mode-badge ${config.enableUpload ? 'dev' : 'prod'}">${modeLabel}</p>
      <p class="data-path">Datenquelle: <code>${config.dataPath}</code></p>
    `
  }

  async loadManifest() {
    try {
      // Versuche zuerst manifest.json (user-created), dann example-manifest.json (template)
      let response = await fetch(`${config.dataPath}/manifest.json`)

      if (!response.ok) {
        console.info('Kein manifest.json gefunden, versuche example-manifest.json...')
        response = await fetch(`${config.dataPath}/example-manifest.json`)
      }

      if (!response.ok) throw new Error('Kein Manifest gefunden')

      const manifest = await response.json()
      this.documents = manifest.documents || []
      this.manifestTitle = manifest.title || 'Dokumente'
      this.manifestDescription = manifest.description || ''
    } catch (error) {
      console.warn('Kein Manifest gefunden:', error.message)
      this.documents = []
      this.manifestTitle = 'Dokumente'
      this.manifestDescription = ''
    }
  }

  renderDocumentList() {
    const container = document.getElementById('documents')

    if (this.documents.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>📭 Keine Dokumente gefunden.</p>
          ${config.enableUpload
            ? '<p>Lade ein Dokument hoch oder kopiere Dateien nach <code>data/local/</code></p>'
            : '<p>Der kuratierte Corpus ist leer.</p>'}
        </div>
      `
      return
    }

    container.innerHTML = `
      <div class="corpus-header">
        <h2>${this.manifestTitle}</h2>
        ${this.manifestDescription ? `<p class="corpus-description">${this.manifestDescription}</p>` : ''}
        <p class="document-count">${this.documents.length} ${this.documents.length === 1 ? 'Dokument' : 'Dokumente'}</p>
      </div>
      <ul class="document-list">
        ${this.documents.map(doc => `
          <li>
            <button class="doc-button" data-file="${doc.file}">
              <strong>${doc.title}</strong>
              <span class="meta">${doc.language || ''} · ${doc.file}</span>
            </button>
          </li>
        `).join('')}
      </ul>
      <div id="viewer"></div>
    `

    // Event Listeners
    container.querySelectorAll('.doc-button').forEach(btn => {
      btn.addEventListener('click', () => this.loadDocument(btn.dataset.file))
    })
  }

  async loadDocument(filename) {
    const viewer = document.getElementById('viewer')
    viewer.innerHTML = '<p class="loading">Lade...</p>'

    try {
      const response = await fetch(`${config.dataPath}/${filename}`)
      if (!response.ok) throw new Error('Datei nicht gefunden')
      const content = await response.text()
      
      viewer.innerHTML = `
        <h3>📄 ${filename}</h3>
        <pre class="xml-content">${this.escapeHtml(content)}</pre>
      `
    } catch (error) {
      viewer.innerHTML = `<p class="error">❌ Fehler: ${error.message}</p>`
    }
  }

  renderUploadSection() {
    const container = document.getElementById('upload')
    container.innerHTML = `
      <h2>📤 Datei hochladen</h2>
      <p class="hint">Diese Funktion ist nur lokal verfügbar, nicht auf GitHub Pages.</p>
      <div class="upload-zone" id="dropzone">
        <input type="file" id="file-input" accept=".xml,.json" />
        <label for="file-input">
          XML oder JSON Datei auswählen<br>
          <small>(oder hierher ziehen)</small>
        </label>
      </div>
      <div id="upload-preview"></div>
    `

    const dropzone = document.getElementById('dropzone')
    const fileInput = document.getElementById('file-input')

    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropzone.classList.add('dragover')
    })

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover')
    })

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault()
      dropzone.classList.remove('dragover')
      const file = e.dataTransfer.files[0]
      if (file) this.handleFileUpload(file)
    })

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) this.handleFileUpload(file)
    })
  }

  handleFileUpload(file) {
    const preview = document.getElementById('upload-preview')
    const reader = new FileReader()

    reader.onload = (e) => {
      preview.innerHTML = `
        <h3>Vorschau: ${file.name}</h3>
        <pre class="xml-content">${this.escapeHtml(e.target.result)}</pre>
        <p class="hint">
          💡 In einer echten App würde die Datei jetzt nach 
          <code>${config.dataPath}/</code> gespeichert.
          <br>Bei Static Sites: Manuell in den Ordner kopieren und Manifest aktualisieren.
        </p>
      `
    }

    reader.readAsText(file)
  }

  escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// App starten
new EditionApp()
