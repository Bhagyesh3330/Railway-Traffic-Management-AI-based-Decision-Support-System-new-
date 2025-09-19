import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backend = process.env.BACKEND_URL || 'http://localhost:5000';
    const r = await fetch(backend + '/api/ai/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });
    const body = await r.json();
    res.status(200).json(body);
  } catch (e) {
    res.status(500).json({ error: 'proxy error' });
  }
}



