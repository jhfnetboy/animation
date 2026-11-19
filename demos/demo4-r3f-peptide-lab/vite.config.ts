import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'rename-entry-to-index',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist');
        const srcHtml = path.join(outDir, 'app.html');
        const dstHtml = path.join(outDir, 'index.html');
        if (fs.existsSync(srcHtml)) {
          fs.renameSync(srcHtml, dstHtml);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'app.html'),
    },
  },
});
