/**
 * TruthGuard AI - Express & Vite Development Server
 * Lead Architect: Yunis Al-Afeef <shoeabvv@gmail.com>
 */

import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import verifyHandler from './api/verify.js';
import healthHandler from './api/health.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.all('/api/health', (req, res) => {
    return healthHandler(req, res);
  });

  app.all('/api/verify', (req, res) => {
    return verifyHandler(req, res);
  });

  // Dynamic SVG Verification Badge
  app.get('/api/badge/:verdict/:score', (req, res) => {
    const { verdict, score } = req.params;
    let color = '#10b981';
    let label = 'VERIFIED';
    if (verdict === 'false') {
      color = '#f43f5e';
      label = 'FALSE';
    } else if (verdict === 'misleading') {
      color = '#f59e0b';
      label = 'MISLEADING';
    } else if (verdict === 'unverified') {
      color = '#64748b';
      label = 'UNVERIFIED';
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="28">
      <linearGradient id="b" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="a">
        <rect width="160" height="28" rx="4" fill="#fff"/>
      </mask>
      <g mask="url(#a)">
        <path fill="#0f172a" d="M0 0h85v28H0z"/>
        <path fill="${color}" d="M85 0h75v28H85z"/>
        <path fill="url(#b)" d="M0 0h160v28H0z"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="11">
        <text x="42.5" y="18" fill="#94a3b8">TruthGuard</text>
        <text x="122.5" y="18" font-weight="bold">${label} ${score}%</text>
      </g>
    </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthGuard AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
