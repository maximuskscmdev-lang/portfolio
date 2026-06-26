/**
 * vite-hero-editor-plugin.ts
 * ===========================
 *
 * PURPOSE:
 * A Vite dev-server plugin that exposes a POST endpoint at /api/save-hero-config.
 * When the in-browser chain editor saves changes, it POSTs the updated config JSON
 * to this endpoint, which writes it to public/hero-config.json on disk.
 *
 * This enables a live-edit workflow: drag anchor points in the browser, and the
 * changes are automatically persisted to the project's source files without
 * any manual copy-paste.
 *
 * FEATURES:
 * - Validates incoming JSON before writing (prevents corrupted config files)
 * - Only active during development (configureServer is not called in production builds)
 * - Uses the Vite server's root path to locate the correct output file
 *
 * RELATIONSHIP TO APP:
 * - Registered in vite.config.ts via the plugins array
 * - Works in tandem with HeroSection.tsx's editor mode, which calls fetch('/api/save-hero-config')
 * - The saved file (public/hero-config.json) is served statically and loaded by HeroSection on mount
 */

import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

export function heroEditorPlugin(): Plugin {
  return {
    name: 'hero-editor',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/save-hero-config' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              // Validate JSON structure before writing
              const parsed = JSON.parse(body);
              if (!parsed.fingerTips || !Array.isArray(parsed.fingerTips)) {
                throw new Error('Missing fingerTips array');
              }

              const configPath = path.join(
                server.config.root,
                'public',
                'hero-config.json',
              );
              const pretty = JSON.stringify(parsed, null, 2) + '\n';
              fs.writeFileSync(configPath, pretty, 'utf-8');

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, path: configPath }));

              console.log(
                '\x1b[35m[hero-editor]\x1b[0m Config saved →',
                configPath,
              );
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : 'Unknown error';
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: msg }));
            }
          });
        } else {
          next();
        }
      });
    },
  };
}
