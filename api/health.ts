import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    status: 'ok',
    version: '3.0.0',
    platform: 'Vercel Serverless',
    runtime: 'Node.js / TypeScript',
    pythonDependency: false,
    model: 'Gemini 2.5 Flash + Live Multi-Source RAG'
  }));
}
