export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json({
      status: 'ok',
      version: '3.0.0',
      platform: 'Vercel Serverless',
      runtime: 'Node.js / TypeScript',
      search: 'Google Fact Check + Live News',
      reasoner: 'Gemini RAG'
    });
  }
  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'ok',
    version: '3.0.0',
    platform: 'Vercel Serverless',
    runtime: 'Node.js / TypeScript'
  }));
}
