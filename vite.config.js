import { defineConfig } from 'vite'

export default defineConfig({
  // Für GitHub Pages: Base-URL anpassen
  // Bei eigenem Repo-Namen: base: '/repo-name/'
  base: './',
  
  // Data-Ordner als static assets
  publicDir: 'public',
  
  build: {
    outDir: 'dist'
  }
})
