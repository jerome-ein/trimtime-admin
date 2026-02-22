import React from 'react';

export function MiniBarChart({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="mini-bar"
          style={{ height: `${(v / max) * 100}%`, opacity: i === data.length - 1 ? 1 : 0.35 }}
        />
      ))}
    </div>
  );
}

export function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="rev-chart">
      {data.map((d, i) => (
        <div key={i} className="rev-col">
          <span className="rev-val">
            {d.revenue > 0
              ? `₱${d.revenue >= 1000 ? (d.revenue / 1000).toFixed(1) + 'k' : Math.round(d.revenue)}`
              : ''}
          </span>
          <div className="rev-bar-wrap">
            <div className="rev-bar" style={{ height: `${(d.revenue / max) * 100}%` }}/>
          </div>
          <span className="rev-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ pending, completed, cancelled }) {
  const total  = pending + completed + cancelled || 1;
  const r      = 38;
  const circ   = 2 * Math.PI * r;
  const slices = [
    { count: pending,   color: '#e8e0d4', label: 'Pending'   },
    { count: completed, color: '#8a7f72', label: 'Completed' },
    { count: cancelled, color: '#4a4540', label: 'Cancelled' },
  ];
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2e2a2a" strokeWidth="16"/>
        {slices.map((s, i) => {
          const pct  = s.count / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx="50" cy="50" r={r} fill="none"
              stroke={s.color} strokeWidth="16"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-(offset * circ)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'all 0.6s ease' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x="50" y="46" textAnchor="middle" fill="#e8e0d4" fontSize="15" fontWeight="700">{total}</text>
        <text x="50" y="58" textAnchor="middle" fill="#6b6560" fontSize="6.5">BOOKINGS</text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="legend-row">
            <span className="legend-dot" style={{ background: s.color }}/>
            <span className="legend-lbl">{s.label}</span>
            <span className="legend-num">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}