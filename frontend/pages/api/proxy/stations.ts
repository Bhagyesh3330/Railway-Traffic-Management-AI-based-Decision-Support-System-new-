import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backend = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = new URL(backend + '/api/ai/stations');
    if (req.method === 'GET') {
      if (req.query.area) url.searchParams.set('area', String(req.query.area));
      const r = await fetch(url.toString());
      const body = await r.json();
      return res.status(r.status).json(body);
    }
    const r = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {}),
    });
    const body = await r.json();
    return res.status(r.status).json(body);
  } catch (e) {
    return res.status(500).json({ error: 'proxy error' });
  }
}


