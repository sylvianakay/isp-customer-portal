import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Flat output (no subfolders): drag-and-drop zip uploads to static hosts can drop
  // files inside folders, so every built file sits next to index.html.
  build: { assetsDir: '' },
});
