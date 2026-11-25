import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` serves the player at http://localhost:5173 (and opens it in your browser).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  preview: { port: 4173 },
});
