/**
 * App-Konfiguration basierend auf Environment-Variablen
 * 
 * VITE_ENABLE_UPLOAD: Upload-Funktion aktivieren
 * VITE_DATA_PATH: Pfad zu den Daten
 */

export const config = {
  // Upload nur wenn explizit aktiviert
  enableUpload: import.meta.env.VITE_ENABLE_UPLOAD === 'true',
  
  // Datenpfad (default: kuratierter Corpus)
  dataPath: import.meta.env.VITE_DATA_PATH || './data/corpus',
  
  // Hilfreiche Flags
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}

// Debug-Ausgabe im Dev-Modus
if (config.isDev) {
  console.log('🔧 App Config:', config)
}
