import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backend = process.env.BACKEND_URL || 'http://localhost:5000';
    const target = backend + '/api/ai/schedule';
    const r = await fetch(target, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: req.method === 'POST' ? JSON.stringify(req.body || {}) : undefined,
    });
    const body = await r.json();
    res.status(r.status).json(body);
  } catch (e) {
    res.status(500).json({ error: 'proxy error' });
  }
}



