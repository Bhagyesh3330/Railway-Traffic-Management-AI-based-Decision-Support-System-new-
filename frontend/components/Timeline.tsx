import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, ReferenceDot } from 'recharts';

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
}

export default function Timeline() {
  const [data, setData] = useState({ trains: [], suggestions: [] });
  const [now, setNow] = useState(0);

  useEffect(() => {
    const qs = new URLSearchParams((typeof window !== 'undefined' && (window as any).__areaStation__) || {}).toString();
    fetch('/api/proxy/trains-with-suggestions' + (qs ? ('?' + qs) : ''))
      .then(r=>r.json())
      .then(setData)
      .catch(console.error);

    const upd = () => { const d = new Date(); setNow(d.getHours()*60 + d.getMinutes()); };
    upd();
    const iv = setInterval(upd, 1000);
    return ()=>clearInterval(iv);
  }, []);

  const trains = (data.trains || []).map(t => {
    const start = t.start;
    const end = t.end;
    const duration = Math.max(0, (end - start));
    const pos = Math.max(start, Math.min(now, end));
    return { name: t.name, start, end, duration, pos, status: (t.status || 'Proceed') };
  });

  const minX = Math.min(...trains.map(t=>t.start), now-60);
  const maxX = Math.max(...trains.map(t=>t.end), now+60);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div style={{ width: '100%', height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={trains} margin={{ left: 150 }}>
            <XAxis type="number" domain={[minX, maxX]} tickFormatter={formatTime} />
            <YAxis type="category" dataKey="name" width={150} />
            <Tooltip formatter={(v)=>`${v} min`} />
            <Bar dataKey="duration" barSize={18}>
              {trains.map((entry, index)=> {
                let color = '#16a34a';
                if (entry.status === 'HOLD') color = '#dc2626';
                if (entry.status === 'WARNING') color = '#eab308';
                return <Cell key={index} fill={color} />;
              })}
            </Bar>
            <ReferenceLine x={now} stroke="#2563eb" strokeDasharray="4 4" label={{ value: 'Now', position: 'top', fill:'#2563eb' }} />
            {trains.map((t, i)=> (
              <ReferenceDot key={`dot-${i}`} x={t.pos} y={t.name} r={5} fill={t.status==='HOLD'?'#2563eb':'#0ea5e9'} stroke="#fff" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
