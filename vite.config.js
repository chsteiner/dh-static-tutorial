import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  // Für GitHub Pages: Base-URL anpassen
  // Bei eigenem Repo-Namen: base: '/repo-name/'
  base: './',

  // Kein publicDir - wir kopieren data/ manuell
  publicDir: false,

  build: {
    outDir: 'dist'
  },

  // Copy data/ to dist/ after build
  plugins: [{
    name: 'copy-data',
    closeBundle() {
      // Copy data/corpus to dist/data/corpus
      mkdirSync('dist/data/corpus', { recursive: true })
      copyFileSync('data/corpus/manifest.json', 'dist/data/corpus/manifest.json')
      copyFileSync('data/corpus/nibelungen.xml', 'dist/data/corpus/nibelungen.xml')
    }
  }]
})
