import { useEffect, useState } from 'react';
import Timeline from '../components/Timeline';

export default function Home() {
  const [analysis, setAnalysis] = useState<any>(null);
  const [area, setArea] = useState<string>('mumbai central');
  const [routes, setRoutes] = useState<any[]>([]);
  const [station, setStation] = useState<string>('');

  useEffect(() => {
    fetch('/api/proxy/trains-with-suggestions')
      .then((r) => r.json())
      .then((data) => setAnalysis(data))
      .catch(() => setAnalysis(null));
  }, []);

  useEffect(() => {
    const url = `/api/proxy/routes?area=${encodeURIComponent(area)}`;
    fetch(url)
      .then(r => r.json())
      .then(body => setRoutes(body.routes || []))
      .catch(()=> setRoutes([]));
  }, [area]);

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-700 via-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">IR</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Controller Dashboard</h1>
              <p className="text-white/90 mt-1 text-lg">Real-time timeline, recommendations, and what-if analysis</p>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-6">
        <div className="bg-white rounded-lg shadow-lg p-4 lg:col-span-3">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Controller Area</label>
              <select value={area} onChange={(e)=>setArea(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                <option value="mumbai central">Mumbai Central</option>
                <option value="new delhi">New Delhi</option>
                <option value="kolkata">Kolkata</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Station (optional)</label>
              <select value={station} onChange={(e)=>setStation(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                <option value="">All Stations</option>
                {routes.flatMap(r=>r.stations).map((s: string)=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Routes in Area</label>
              <div className="mt-1 text-sm text-gray-700">
                {(routes||[]).map(r => (
                  <div key={r.id} className="py-1">
                    <span className="font-semibold">{r.name}</span>
                    <div className="text-gray-600">{r.stations.join(' → ')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button onClick={()=>{
                (window as any).__areaStation__ = { area, station };
                fetch(`/api/proxy/trains-with-suggestions?area=${encodeURIComponent(area)}${station?`&station=${encodeURIComponent(station)}`:''}`)
                  .then(r=>r.json())
                  .then(setAnalysis)
                  .catch(()=>{});
              }} className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white">Apply Filter</button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🚂</span>
            </div>
            Train Timeline
          </h2>
          <Timeline />
        </div>
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">⚡</span>
            </div>
            AI Recommendations
          </h2>
          <ul className="space-y-3 text-sm">
            {(analysis?.suggestions || []).map((s: any, i: number) => (
              <li key={i} className={`p-3 rounded-lg border-l-4 ${s.status === 'HOLD' ? 'bg-blue-50 border-blue-400 text-blue-800' : s.status === 'WARNING' ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : 'bg-green-50 border-green-400 text-green-800'}`}>
                <div className="font-semibold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${s.status === 'HOLD' ? 'bg-blue-500' : s.status === 'WARNING' ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                  {s.train}: {s.status}
                </div>
                {s.reason ? <div className="text-gray-600 mt-1 text-xs">Why: {s.reason}</div> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="whatif" className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-cyan-500 p-4 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center">
              <span className="text-cyan-600 text-sm">🔬</span>
            </div>
            What-if Simulation
          </h2>
          <WhatIfForm />
        </div>
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-indigo-500 p-4 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-sm">📊</span>
            </div>
            Analysis Results
          </h2>
          <AnalysisPanel />
        </div>
      </section>

      <section className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-blue-500 p-4 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">🗓️</span>
            </div>
            Schedule Trains (Controller)
          </h2>
          <ScheduleForm onScheduled={()=>{
            fetch('/api/proxy/trains-with-suggestions').then(r=>r.json()).then(setAnalysis).catch(()=>{});
          }} />
        </div>
      </section>
    </div>
  );
}

function WhatIfForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function runWhatIf(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const changes = [
      { name: 'Local Mumbai', start: 9 * 60 + 30 },
    ];
    try {
      const r = await fetch('/api/proxy/what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
      const body = await r.json();
      setResult(body);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={runWhatIf} className="space-y-3">
        <div className="text-sm text-gray-600">Try moving Local Mumbai start to 09:30</div>
        <button disabled={loading} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition-colors shadow-md">
          {loading ? 'Running…' : 'Run Simulation'}
        </button>
      </form>
      {result ? (
        <div className="mt-4 text-sm">
          <div className="font-semibold">Conflicts:</div>
          <ul className="list-disc pl-5">
              {(result.conflicts || []).map((c: any, i: number) => (
                <li key={i}>{c.a} vs {c.b} — priority given to: {c.priorityFor}</li>
            ))}
          </ul>
          <div className="mt-2">Total delay: <span className="font-semibold">{result.metrics?.totalDelay ?? 0} min</span></div>
        </div>
      ) : null}
    </div>
  );
}

function AnalysisPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    try {
      const r = await fetch('/api/proxy/analysis', { method: 'POST' });
      const body = await r.json();
      setData(body);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={runAnalysis} disabled={loading} className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition-colors shadow-md">
        {loading ? 'Analyzing…' : 'Run Analysis'}
      </button>
      {data ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold">Precedence</div>
            <ul className="list-disc pl-5">
              {(data.precedence || []).map((p: any) => (
                <li key={p.name}>#{p.rank} — {p.name} ({p.type})</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold">Conflicts</div>
            <ul className="list-disc pl-5">
              {(data.conflicts || []).map((c: any, i: number) => (
                <li key={i}>{c.a} vs {c.b} — priority given to: {c.priorityFor}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScheduleForm({ onScheduled }: { onScheduled: ()=>void }) {
  const [name, setName] = useState('New Local');
  const [type, setType] = useState('Local');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('11:00');
  const [submitting, setSubmitting] = useState(false);

  function toMinutes(s: string) {
    const [h, m] = s.split(':').map(Number);
    return h*60 + m;
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/proxy/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, start: toMinutes(start), end: toMinutes(end) })
      });
      onScheduled();
    } finally {
      setSubmitting(false);
    }
  }

  async function clearAll() {
    setSubmitting(true);
    try {
      await fetch('/api/proxy/schedule', { method: 'DELETE' });
      onScheduled();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <div>
        <label className="block text-sm font-medium text-gray-700">Train Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select value={type} onChange={e=>setType(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
          <option>Express</option>
          <option>Local</option>
          <option>Freight</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Start</label>
        <input type="time" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">End</label>
        <input type="time" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
      </div>
      <div className="flex gap-3">
        <button disabled={submitting} className="ir-btn ir-btn-primary">{submitting ? 'Saving…' : 'Add / Update'}</button>
        <button type="button" disabled={submitting} onClick={clearAll} className="px-4 py-2 rounded border">Clear All</button>
      </div>
    </form>
  );
}
