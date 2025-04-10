import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup.html' // 👉 Vite construira popup.html à la racine de dist
      }
    },
    emptyOutDir: true
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/manifest.json', dest: '.' },
        { src: 'src/background.js', dest: '.' },
        { src: 'src/content.js', dest: '.' },
        { src: 'icons', dest: '.' }
      ]
    })
  ],
  publicDir: false
});
