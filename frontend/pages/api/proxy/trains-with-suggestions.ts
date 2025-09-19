import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backend = process.env.BACKEND_URL || 'http://localhost:5000';
    const url = new URL(backend + '/api/ai/suggestions');
    if (req.query.area) url.searchParams.set('area', String(req.query.area));
    if (req.query.station) url.searchParams.set('station', String(req.query.station));
    const r = await fetch(url.toString());
    const body = await r.json();
    res.status(200).json(body);
  } catch (e) {
    res.status(500).json({ error: 'proxy error' });
  }
}
