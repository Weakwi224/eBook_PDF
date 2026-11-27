import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function singleFileOutputPlugin(): Plugin {
  return {
    name: 'single-file-index-html',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url !== '/' && url !== '/index.html') {
          next();
          return;
        }
        try {
          const templatePath = path.resolve(__dirname, 'app.html');
          const rawHtml = fs.readFileSync(templatePath, 'utf-8');
          const transformed = await server.transformIndexHtml(req.url || '/', rawHtml);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(transformed);
        } catch (err) {
          next(err);
        }
      });
    },
    closeBundle(error?: Error) {
      if (error) return;
      const distDir = path.resolve(__dirname, 'dist');
      const distAppHtml = path.resolve(distDir, 'app.html');
      const distIndexHtml = path.resolve(distDir, 'index.html');
      const rootIndexHtml = path.resolve(__dirname, 'index.html');

      if (!fs.existsSync(distAppHtml)) return;

      let html = fs.readFileSync(distAppHtml, 'utf-8');
      const filesToDelete: string[] = [distAppHtml];

      // Inline all stylesheet <link> tags pointing to built local assets
      html = html.replace(
        /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](?:\.\/|\/)?(assets\/[^"']+\.css)["'][^>]*>/gi,
        (match, relPath: string) => {
          const cssPath = path.resolve(distDir, relPath);
          if (!fs.existsSync(cssPath)) return match;
          const cssText = fs.readFileSync(cssPath, 'utf-8');
          filesToDelete.push(cssPath);
          return `<style>${cssText}</style>`;
        }
      );

      // Inline all module <script> tags pointing to built local assets
      html = html.replace(
        /<script\b[^>]*src=["'](?:\.\/|\/)?(assets\/[^"']+\.js)["'][^>]*>\s*<\/script>/gi,
        (match, relPath: string) => {
          const jsPath = path.resolve(distDir, relPath);
          if (!fs.existsSync(jsPath)) return match;
          const jsText = fs.readFileSync(jsPath, 'utf-8').replace(/<\/script/gi, '<\\/script');
          filesToDelete.push(jsPath);
          return `<script type="module">${jsText}</script>`;
        }
      );

      // Remove modulepreload hints for inlined assets
      html = html.replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*>\s*/gi, '');

      fs.writeFileSync(distIndexHtml, html, 'utf-8');
      fs.writeFileSync(rootIndexHtml, html, 'utf-8');

      for (const filePath of filesToDelete) {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      singleFileOutputPlugin(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, 'app.html'),
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
