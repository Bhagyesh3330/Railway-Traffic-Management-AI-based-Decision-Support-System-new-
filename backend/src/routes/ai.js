const express = require('express');
const router = express.Router();
// simple in-memory store for prototyping schedules added from dashboard
let customTrains = [];
const pool = require('../db');

// Assign priority based on type
function priorityValue(type) {
  if (!type) return 0;
  switch (type.toLowerCase()) {
    case 'express': return 3;
    case 'local': return 2;
    case 'freight': return 1;
    default: return 0;
  }
}

// Helper: convert TIME string 'HH:MM' to minutes
function toMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

router.get('/suggestions', async (req, res) => {
  try {
    let trains = [];
    const area = (req.query.area || '').toString().toLowerCase();
    const station = (req.query.station || '').toString().toLowerCase();
    if (customTrains.length > 0) {
      trains = customTrains.map(t => ({ ...t, delay: t.delay || 0 }));
    } else {
      // Join trains with schedules (and optionally stations) to compute times from DB
      let sql = `
        SELECT t.id, t.name, t.type, t.priority,
               MIN(s.departure_time) AS first_departure,
               MAX(s.arrival_time) AS last_arrival
        FROM trains t
        LEFT JOIN schedules s ON t.id = s.train_id
        LEFT JOIN stations st ON s.station_id = st.id
      `;
      const where = [];
      const params = [];
      if (area) { where.push(`LOWER(st.area) = $${where.length+1}`); params.push(area); }
      if (station) { where.push(`LOWER(st.name) = $${where.length+1}`); params.push(station); }
      if (where.length) sql += ` WHERE ` + where.join(' AND ');
      sql += ` GROUP BY t.id, t.name, t.type, t.priority ORDER BY t.id`;
      const result = await pool.query(sql, params);
      const trainsMap = {};
      result.rows.forEach(row => {
        if (!trainsMap[row.id]) {
          trainsMap[row.id] = {
            id: row.id,
            name: row.name,
            type: row.type,
            start: toMinutes(row.first_departure),
            end: toMinutes(row.last_arrival),
            delay: 0
          };
        }
      });
      trains = Object.values(trainsMap);
    }

    // Detect overlaps and generate suggestions
    const suggestions = trains.map((a, i) => {
      let status = 'PROCEED';
      let reason = 'No conflicts detected';
      for (let j = 0; j < trains.length; j++) {
        if (i === j) continue;
        const b = trains[j];
        if (a.start < b.end && b.start < a.end) {
          if (priorityValue(a.type) < priorityValue(b.type)) {
            status = 'HOLD';
            reason = `${a.name} yields to higher-priority ${b.type} (${b.name})`;
          } else if (priorityValue(a.type) === priorityValue(b.type)) {
            status = (a.delay > b.delay) ? 'HOLD' : 'PROCEED';
            reason = 'Equal priority; resolving by higher accumulated delay';
          } else {
            status = 'PROCEED';
            reason = `${a.name} has precedence over ${b.name}`;
          }
        }
      }
      return { train: a.name, status, reason };
    });

    return res.json({ trains, suggestions });
  } catch (err) {
    console.error('AI suggestions DB error, falling back to mock:', err?.message || err);
    // Fallback mock data to keep app functional without DB
    const trains = customTrains.length > 0 ? customTrains : [
      { name: 'Rajdhani Express', type: 'Express', start: toMinutes('08:10'), end: toMinutes('18:00'), delay: 10 },
      { name: 'Local Mumbai', type: 'Local', start: toMinutes('09:05'), end: toMinutes('19:00'), delay: 5 },
      { name: 'Freight 101', type: 'Freight', start: toMinutes('10:15'), end: toMinutes('12:00'), delay: 0 },
    ];
    const suggestions = trains.map((a, i) => {
      let status = 'PROCEED';
      let reason = 'No conflicts detected';
      for (let j = 0; j < trains.length; j++) {
        if (i === j) continue;
        const b = trains[j];
        if (a.start < b.end && b.start < a.end) {
          if (priorityValue(a.type) < priorityValue(b.type)) { status = 'HOLD'; reason = `${a.name} yields to higher-priority ${b.type} (${b.name})`; }
          else if (priorityValue(a.type) === priorityValue(b.type)) { status = (a.delay > b.delay) ? 'HOLD' : 'PROCEED'; reason = 'Equal priority; resolving by higher accumulated delay'; }
          else { status = 'PROCEED'; reason = `${a.name} has precedence over ${b.name}`; }
        }
      }
      return { train: a.name, status, reason };
    });
    return res.json({ trains, suggestions, fallback: true });
  }
});

module.exports = router;
// Network routes and stations for major corridors with simple area filtering
router.get('/routes', (req, res) => {
  const area = (req.query.area || '').toString().toLowerCase();
  const network = [
    {
      id: 'mumbai-local',
      name: 'Mumbai Suburban (Western Line)',
      area: 'mumbai central',
      stations: ['Churchgate','Marine Lines','Charni Road','Grant Road','Mumbai Central','Dadar','Bandra','Andheri','Borivali','Vasai Road','Virar']
    },
    {
      id: 'mumbai-central',
      name: 'Mumbai Central — Ahmedabad (WR)',
      area: 'mumbai central',
      stations: ['Mumbai Central','Borivali','Vapi','Surat','Bharuch','Vadodara','Anand','Nadiad','Ahmedabad']
    },
    {
      id: 'delhi-kolkata',
      name: 'New Delhi — Kolkata (Howrah) Main Line',
      area: 'new delhi',
      stations: ['New Delhi','Kanpur Central','Prayagraj (Allahabad)','Pt. Deen Dayal Upadhyaya (Mughalsarai)','Gaya','Asansol','Durgapur','Howrah (Kolkata)']
    },
    {
      id: 'kolkata-suburban',
      name: 'Kolkata Suburban (Howrah — Bardhaman)',
      area: 'kolkata',
      stations: ['Howrah','Liluah','Bally','Serampore','Chandannagar','Chinsurah','Bandel','Baidyabati','Uttarpara','Bardhaman']
    }
  ];

  const routes = area ? network.filter(r => r.area === area) : network;
  res.json({ routes });
});

// STATIONS CRUD (minimal)
router.get('/stations', async (req, res) => {
  try {
    const area = (req.query.area || '').toString().toLowerCase();
    let sql = 'SELECT id, name, code, area, is_junction, num_tracks FROM stations';
    const params = [];
    if (area) { sql += ' WHERE LOWER(area) = $1'; params.push(area); }
    sql += ' ORDER BY name';
    const r = await pool.query(sql, params);
    res.json({ stations: r.rows });
  } catch (e) {
    console.error('stations list error', e);
    res.status(500).json({ error: 'stations error' });
  }
});

router.post('/stations', async (req, res) => {
  try {
    const { name, code, area, is_junction, num_tracks } = req.body || {};
    if (!name || !code) return res.status(400).json({ error: 'name and code required' });
    const r = await pool.query(
      `INSERT INTO stations(name, code, area, is_junction, num_tracks)
       VALUES($1,$2,$3,COALESCE($4,false),COALESCE($5,2))
       ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name, area=EXCLUDED.area, is_junction=EXCLUDED.is_junction, num_tracks=EXCLUDED.num_tracks
       RETURNING id, name, code, area, is_junction, num_tracks`,
      [name, code, area || null, is_junction === true, num_tracks || 2]
    );
    res.json({ station: r.rows[0] });
  } catch (e) {
    console.error('stations upsert error', e);
    res.status(500).json({ error: 'stations upsert error' });
  }
});

// TRAINS minimal upsert by name
router.post('/trains', async (req, res) => {
  try {
    const { name, type, priority } = req.body || {};
    if (!name || !type) return res.status(400).json({ error: 'name and type required' });
    const r = await pool.query(
      `INSERT INTO trains(name, type, priority) VALUES($1,$2,COALESCE($3,2))
       ON CONFLICT DO NOTHING RETURNING id` , [name, type, priority || 2]
    );
    let id;
    if (r.rows[0]) id = r.rows[0].id; else {
      const q = await pool.query('SELECT id FROM trains WHERE name=$1 LIMIT 1', [name]);
      id = q.rows[0]?.id;
    }
    res.json({ id, name });
  } catch (e) {
    console.error('train upsert error', e);
    res.status(500).json({ error: 'train upsert error' });
  }
});

// SCHEDULE create
router.post('/schedules', async (req, res) => {
  try {
    const { train_id, station_code, station_id, arrival_time, departure_time } = req.body || {};
    if (!train_id) return res.status(400).json({ error: 'train_id required' });
    let stId = station_id;
    if (!stId && station_code) {
      const s = await pool.query('SELECT id FROM stations WHERE code=$1 LIMIT 1', [station_code]);
      stId = s.rows[0]?.id || null;
    }
    const r = await pool.query(
      `INSERT INTO schedules(train_id, station_id, arrival_time, departure_time)
       VALUES($1,$2,$3,$4)
       RETURNING id`,
      [train_id, stId, arrival_time || null, departure_time || null]
    );
    res.json({ id: r.rows[0].id });
  } catch (e) {
    console.error('schedule insert error', e);
    res.status(500).json({ error: 'schedule insert error' });
  }
});
// POST /api/ai/schedule -> add a train schedule (in-memory prototype)
router.post('/schedule', (req, res) => {
  const { name, type, start, end, delay } = req.body || {};
  if (!name || !type || typeof start !== 'number' || typeof end !== 'number') {
    return res.status(400).json({ error: 'name, type, start, end are required' });
  }
  const entry = { name, type, start, end, delay: delay || 0 };
  customTrains = customTrains.filter(t => t.name !== name).concat([entry]);
  return res.json({ ok: true, train: entry, count: customTrains.length });
});

// DELETE /api/ai/schedule -> clear all custom schedules
router.delete('/schedule', (req, res) => {
  customTrains = [];
  res.json({ ok: true });
});
// Additional AI/Optimization endpoints
// POST /api/ai/analysis -> compute conflicts, precedence, delay metrics for given set of trains
router.post('/analysis', async (req, res) => {
  try {
    const inputTrains = req.body?.trains || [];
    const trains = inputTrains.length ? inputTrains : [
      { name: 'Rajdhani Express', type: 'Express', start: toMinutes('08:10'), end: toMinutes('18:00'), delay: 10 },
      { name: 'Local Mumbai', type: 'Local', start: toMinutes('09:05'), end: toMinutes('19:00'), delay: 5 },
      { name: 'Freight 101', type: 'Freight', start: toMinutes('10:15'), end: toMinutes('12:00'), delay: 0 },
    ];

    // Conflict detection
    const conflicts = [];
    for (let i = 0; i < trains.length; i++) {
      for (let j = i + 1; j < trains.length; j++) {
        const a = trains[i];
        const b = trains[j];
        const overlap = (a.start < b.end && b.start < a.end);
        if (overlap) {
          const priorityFor = priorityValue(a.type) >= priorityValue(b.type) ? a.name : b.name;
          const yieldBy = priorityFor === a.name ? b.name : a.name;
          conflicts.push({ a: a.name, b: b.name, overlap: true, priorityFor, yieldBy });
        }
      }
    }

    // Precedence ranking by type, then earliest start
    const precedence = [...trains]
      .map(t => ({ ...t, p: priorityValue(t.type) }))
      .sort((x, y) => y.p - x.p || x.start - y.start)
      .map((t, i) => ({ rank: i + 1, name: t.name, type: t.type }));

    // Delay metric: simple sum of delays
    const totalDelay = trains.reduce((sum, t) => sum + (t.delay || 0), 0);

    res.json({ trains, conflicts, precedence, metrics: { totalDelay } });
  } catch (err) {
    console.error('analysis error', err);
    res.status(500).json({ error: 'analysis error' });
  }
});

// POST /api/ai/what-if -> simulate changed timings/types and return new conflicts and metrics
router.post('/what-if', async (req, res) => {
  try {
    const changes = req.body?.changes || [];
    const base = [
      { name: 'Rajdhani Express', type: 'Express', start: toMinutes('08:10'), end: toMinutes('18:00'), delay: 10 },
      { name: 'Local Mumbai', type: 'Local', start: toMinutes('09:05'), end: toMinutes('19:00'), delay: 5 },
      { name: 'Freight 101', type: 'Freight', start: toMinutes('10:15'), end: toMinutes('12:00'), delay: 0 },
    ];
    const trains = base.map(t => {
      const override = changes.find(c => c.name === t.name);
      return override ? { ...t, ...override } : t;
    });

    // Reuse conflict and metrics logic
    const conflicts = [];
    for (let i = 0; i < trains.length; i++) {
      for (let j = i + 1; j < trains.length; j++) {
        const a = trains[i];
        const b = trains[j];
        const overlap = (a.start < b.end && b.start < a.end);
        if (overlap) {
          const priorityFor = priorityValue(a.type) >= priorityValue(b.type) ? a.name : b.name;
          const yieldBy = priorityFor === a.name ? b.name : a.name;
          conflicts.push({ a: a.name, b: b.name, overlap: true, priorityFor, yieldBy });
        }
      }
    }
    const totalDelay = trains.reduce((sum, t) => sum + (t.delay || 0), 0);
    res.json({ trains, conflicts, metrics: { totalDelay } });
  } catch (err) {
    console.error('what-if error', err);
    res.status(500).json({ error: 'what-if error' });
  }
});
