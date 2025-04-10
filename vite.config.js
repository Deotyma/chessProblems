import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';


export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'src/popup.html'
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
        { src: 'src/popup.js', dest: 'src' },
        { src: 'icons', dest: '.' },
        { src: 'node_modules/chessground/assets/chessground.base.css', dest: 'assets' },
        { src: 'node_modules/chessground/assets/chessground.brown.css', dest: 'assets' },
        { src: 'node_modules/chessground/assets/chessground.cburnett.css', dest: 'assets' }
      ]
    }),
    cssInjectedByJsPlugin()
  ],
  publicDir: false
});
