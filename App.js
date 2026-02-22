import React, { useState, useEffect } from 'react';
import { signOut, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
import './App.css';

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo"><Icon name="scissors" size={28} /></div>
          <h1>TrimTime</h1>
          <p>Admin Dashboard</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@trimtime.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="login-note">Restricted to authorized administrators only</p>
      </div>
    </div>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    bookings:  <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    revenue:   <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
    customers: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
    calendar:  <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
    bell:      <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></>,
    logout:    <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    refresh:   <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></>,
    scissors:  <><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    menu:      <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div className="mini-chart">
      {data.map((v, i) => (
        <div key={i} className="mini-bar" style={{ height: `${(v / max) * 100}%`, opacity: i === data.length - 1 ? 1 : 0.35 }} />
      ))}
    </div>
  );
}

// ─── REVENUE BAR CHART ────────────────────────────────────────────────────────
function RevenueChart({ bookings }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  const data = Array(6).fill(0).map((_, i) => {
    const offset = 5 - i;
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const m = d.getMonth(), y = d.getFullYear();
    const rev = bookings.filter(b => {
      const bd = new Date(b.date);
      return bd.getMonth() === m && bd.getFullYear() === y && getStatus(b) === 'COMPLETED';
    }).reduce((s, b) => s + (b.haircutPrice || b.price || 0), 0);
    return { label: months[m], revenue: rev };
  });
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className="rev-chart">
      {data.map((d, i) => (
        <div key={i} className="rev-col">
          <span className="rev-val">{d.revenue > 0 ? `₱${d.revenue >= 1000 ? (d.revenue/1000).toFixed(1)+'k' : d.revenue}` : ''}</span>
          <div className="rev-bar-wrap">
            <div className="rev-bar" style={{ height: `${(d.revenue / max) * 100}%` }} />
          </div>
          <span className="rev-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────
function DonutChart({ pending, completed, cancelled }) {
  const total = pending + completed + cancelled || 1;
  const r = 38, circ = 2 * Math.PI * r;
  const slices = [
    { count: pending,   color: '#e8e0d4', label: 'Pending' },
    { count: completed, color: '#8a7f72', label: 'Completed' },
    { count: cancelled, color: '#4a4540', label: 'Cancelled' },
  ];
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#2e2a2a" strokeWidth="16"/>
        {slices.map((s, i) => {
          const pct = s.count / total;
          const dash = pct * circ;
          const el = (
            <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="16"
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

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
function CalendarView({ bookings }) {
  const [cur, setCur] = useState(new Date());
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const y = cur.getFullYear(), m = cur.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();

  const getDay = (day) => bookings.filter(b => {
    const d = new Date(b.date);
    return d.getDate() === day && d.getMonth() === m && d.getFullYear() === y;
  });

  return (
    <div className="calendar">
      <div className="cal-nav-row">
        <button className="cal-nav-btn" onClick={() => setCur(new Date(y, m - 1, 1))}>‹</button>
        <span className="cal-month">{MONTHS[m]} {y}</span>
        <button className="cal-nav-btn" onClick={() => setCur(new Date(y, m + 1, 1))}>›</button>
      </div>
      <div className="cal-days-head">
        {DAYS.map(d => <span key={d}>{d}</span>)}
      </div>
      <div className="cal-grid">
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="cal-empty"/>)}
        {Array(daysInMonth).fill(null).map((_, i) => {
          const day = i + 1;
          const dayB = getDay(day);
          const isToday = today.getDate() === day && today.getMonth() === m && today.getFullYear() === y;
          return (
            <div key={day} className={`cal-cell ${isToday ? 'cal-today' : ''} ${dayB.length > 0 ? 'cal-has' : ''}`}>
              <span>{day}</span>
              {dayB.length > 0 && <div className="cal-pip">{dayB.length}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── HELPER: normalize status to uppercase ────────────────────────────────────
const getStatus = (b) => (b.status || '').toUpperCase();

// ─── HELPER: get service name from either field ───────────────────────────────
const getService = (b) => b.haircutName || b.service || '—';
const getPrice   = (b) => b.haircutPrice ?? b.price ?? 0;
const getTime    = (b) => b.timeSlot || b.time || '—';

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const authUnsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      await user.getIdToken(true);
      const unsub = onSnapshot(
        query(collection(db, 'bookings')),
        (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setBookings(data);
          setNotifications(
            data.filter(b => getStatus(b) === 'PENDING').slice(0, 5).map(b => ({
              id: b.id,
              msg: `New booking: ${getService(b)}`,
              sub: b.barberName,
              time: b.createdAt
                ? new Date(typeof b.createdAt === 'number' ? b.createdAt : b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '',
            }))
          );
          setLoading(false);
        },
        (error) => {
          console.error('Firestore error:', error.code, error.message);
          if (error.code === 'permission-denied') {
            alert('Permission denied. Make sure you are logged in as admin.');
          }
          setLoading(false);
        }
      );
      return () => unsub();
    });
    return () => authUnsub();
  }, []);

  // ── KEY FIX: always write UPPERCASE status ──
  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: status.toUpperCase() });
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  const fmt = (val) => {
    if (!val) return '—';
    // Already formatted string like "Feb 18, 2026"
    if (typeof val === 'string' && isNaN(Date.parse(val)) === false) {
      return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (typeof val === 'string') return val;
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => getStatus(b) === 'PENDING').length,
    completed: bookings.filter(b => getStatus(b) === 'COMPLETED').length,
    cancelled: bookings.filter(b => getStatus(b) === 'CANCELLED').length,
    revenue:   bookings.filter(b => getStatus(b) === 'COMPLETED').reduce((s, b) => s + getPrice(b), 0),
    todayRev:  bookings.filter(b => {
                 const d = new Date(b.date), t = new Date();
                 return getStatus(b) === 'COMPLETED' && d.toDateString() === t.toDateString();
               }).reduce((s, b) => s + getPrice(b), 0),
  };

  const last7 = Array(7).fill(0).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return bookings.filter(b => new Date(b.date).toDateString() === d.toDateString()).length;
  });

  const filtered = bookings
    .filter(b => filter === 'all' || getStatus(b) === filter)
    .filter(b => !search ||
      getService(b).toLowerCase().includes(search.toLowerCase()) ||
      (b.barberName || '').toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toLowerCase().includes(search.toLowerCase())
    );

  const customers = [...new Map(bookings.map(b => [b.userId, {
    id: b.userId || '—',
    name: b.userName || b.userId?.slice(0, 12) || '—',
    count: bookings.filter(x => x.userId === b.userId).length,
    spent: bookings.filter(x => x.userId === b.userId && getStatus(x) === 'COMPLETED').reduce((s, x) => s + getPrice(x), 0),
    last: fmt(Math.max(...bookings.filter(x => x.userId === b.userId).map(x => x.timestamp || x.createdAt || 0))),
  }])).values()];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings',  label: 'Bookings',  icon: 'bookings',  badge: stats.pending },
    { id: 'calendar',  label: 'Calendar',  icon: 'calendar' },
    { id: 'revenue',   label: 'Revenue',   icon: 'revenue' },
    { id: 'customers', label: 'Customers', icon: 'customers' },
  ];

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo"><Icon name="scissors" size={18}/></div>
          {!collapsed && <span className="sb-name">TrimTime</span>}
        </div>
        <nav className="sb-nav">
          {navItems.map(n => (
            <button key={n.id} className={`sb-item ${page === n.id ? 'sb-active' : ''}`} onClick={() => setPage(n.id)}>
              <Icon name={n.icon} size={17}/>
              {!collapsed && <span>{n.label}</span>}
              {!collapsed && n.badge > 0 && <span className="sb-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <button className="sb-item sb-logout" onClick={onLogout}>
          <Icon name="logout" size={17}/>
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="tb-left">
            <button className="icon-btn" onClick={() => setCollapsed(!collapsed)}>
              <Icon name="menu" size={19}/>
            </button>
            <h2 className="tb-title">{navItems.find(n => n.id === page)?.label}</h2>
          </div>
          <div className="tb-right">
            <div className="notif-wrap">
              <button className="icon-btn notif-btn" onClick={() => setShowNotif(!showNotif)}>
                <Icon name="bell" size={19}/>
                {notifications.length > 0 && <span className="notif-pip">{notifications.length}</span>}
              </button>
              {showNotif && (
                <div className="notif-box">
                  <div className="notif-head">Notifications</div>
                  {notifications.length === 0
                    ? <div className="notif-nil">All caught up!</div>
                    : notifications.map(n => (
                      <div key={n.id} className="notif-row">
                        <div className="notif-msg">{n.msg}</div>
                        <div className="notif-sub">{n.sub} · {n.time}</div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <div className="admin-tag">Admin</div>
          </div>
        </header>

        <div className="content">

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && <>
            <div className="stats-grid">
              {[
                { label: 'Total Bookings', val: stats.total,                         icon: 'bookings' },
                { label: 'Pending',        val: stats.pending,                        icon: 'clock' },
                { label: 'Completed',      val: stats.completed,                      icon: 'check' },
                { label: 'Total Revenue',  val: `₱${stats.revenue.toLocaleString()}`, icon: 'revenue' },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="sc-top">
                    <span className="sc-label">{s.label}</span>
                    <span className="sc-icon"><Icon name={s.icon} size={15}/></span>
                  </div>
                  <div className="sc-val">{s.val}</div>
                  <MiniBarChart data={last7}/>
                </div>
              ))}
            </div>
            <div className="charts-row">
              <div className="chart-card wide-card">
                <div className="cc-head"><h3>Revenue — Last 6 Months</h3></div>
                <RevenueChart bookings={bookings}/>
              </div>
              <div className="chart-card">
                <div className="cc-head"><h3>Status Breakdown</h3></div>
                <DonutChart pending={stats.pending} completed={stats.completed} cancelled={stats.cancelled}/>
              </div>
            </div>
            <div className="table-card">
              <div className="tc-head">
                <h3>Recent Bookings</h3>
                <button className="link-btn" onClick={() => setPage('bookings')}>View all →</button>
              </div>
              <table className="dtable">
                <thead><tr><th>ID</th><th>Service</th><th>Date</th><th>Barber</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.slice(0, 6).map(b => (
                    <tr key={b.id}>
                      <td className="mono">#{b.id.slice(-6)}</td>
                      <td>{getService(b)}</td>
                      <td>{fmt(b.date)}</td>
                      <td>{b.barberName}</td>
                      <td className="price-col">₱{getPrice(b)}</td>
                      <td><span className={`badge b-${getStatus(b).toLowerCase()}`}>{getStatus(b)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {/* ── BOOKINGS ── */}
          {page === 'bookings' && (
            <div className="table-card">
              <div className="tc-head wrap-head">
                <h3>All Bookings</h3>
                <div className="tc-controls">
                  <input className="search-box" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}/>
                  <div className="ftabs">
                    {[['all','All'],['PENDING','Pending'],['COMPLETED','Completed'],['CANCELLED','Cancelled']].map(([val, lbl]) => (
                      <button key={val} className={`ftab ${filter === val ? 'ftab-on' : ''}`} onClick={() => setFilter(val)}>
                        {lbl}{val === 'PENDING' && stats.pending > 0 && <span className="ftab-count">{stats.pending}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {loading ? <div className="tbl-empty">Loading...</div> : (
                <table className="dtable">
                  <thead><tr><th>Booking ID</th><th>Service</th><th>Date</th><th>Time</th><th>Barber</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan="8" className="tbl-empty">No bookings found</td></tr>
                      : filtered.map(b => (
                        <tr key={b.id}>
                          <td className="mono">#{b.id.slice(-8)}</td>
                          <td><strong>{getService(b)}</strong></td>
                          <td>{fmt(b.date)}</td>
                          <td>{getTime(b)}</td>
                          <td>{b.barberName}</td>
                          <td className="price-col">₱{getPrice(b)}</td>
                          <td><span className={`badge b-${getStatus(b).toLowerCase()}`}>{getStatus(b)}</span></td>
                          <td>
                            <div className="acts">
                              {getStatus(b) === 'PENDING' && <>
                                <button className="act complete" title="Complete" onClick={() => updateStatus(b.id,'COMPLETED')}><Icon name="check" size={13}/></button>
                                <button className="act cancel"   title="Cancel"   onClick={() => updateStatus(b.id,'CANCELLED')}><Icon name="x"     size={13}/></button>
                              </>}
                              {getStatus(b) === 'CANCELLED' && (
                                <button className="act restore" title="Restore" onClick={() => updateStatus(b.id,'PENDING')}><Icon name="refresh" size={13}/></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── CALENDAR ── */}
          {page === 'calendar' && (
            <div className="cal-layout">
              <div className="table-card">
                <div className="tc-head"><h3>Booking Calendar</h3></div>
                <CalendarView bookings={bookings}/>
              </div>
              <div className="table-card">
                <div className="tc-head"><h3>Upcoming Bookings</h3></div>
                <div className="upcoming">
                  {bookings.filter(b => getStatus(b) === 'PENDING' && new Date(b.date) >= new Date()).slice(0,8).map(b => (
                    <div key={b.id} className="up-row">
                      <div className="up-date">
                        <span className="up-d">{new Date(b.date).getDate()}</span>
                        <span className="up-m">{new Date(b.date).toLocaleString('default',{month:'short'})}</span>
                      </div>
                      <div className="up-info">
                        <div className="up-svc">{getService(b)}</div>
                        <div className="up-meta">{getTime(b)} · {b.barberName}</div>
                      </div>
                      <div className="price-col">₱{getPrice(b)}</div>
                    </div>
                  ))}
                  {bookings.filter(b => getStatus(b) === 'PENDING' && new Date(b.date) >= new Date()).length === 0 && (
                    <div className="tbl-empty">No upcoming bookings</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── REVENUE ── */}
          {page === 'revenue' && <>
            <div className="stats-grid">
              {[
                { label: 'Total Revenue',   val: `₱${stats.revenue.toLocaleString()}` },
                { label: "Today's Revenue", val: `₱${stats.todayRev}` },
                { label: 'Avg per Booking', val: `₱${stats.completed > 0 ? Math.round(stats.revenue / stats.completed) : 0}` },
                { label: 'Completed Jobs',  val: stats.completed },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="sc-label">{s.label}</div>
                  <div className="sc-val">{s.val}</div>
                </div>
              ))}
            </div>
            <div className="table-card">
              <div className="tc-head"><h3>Monthly Revenue</h3><span className="tc-sub">Last 6 months</span></div>
              <RevenueChart bookings={bookings}/>
            </div>
            <div className="table-card">
              <div className="tc-head"><h3>Revenue by Service</h3></div>
              <table className="dtable">
                <thead><tr><th>Service</th><th>Jobs</th><th>Revenue</th><th>Avg Price</th></tr></thead>
                <tbody>
                  {[...new Set(bookings.map(b => getService(b)))].filter(Boolean).map(name => {
                    const svc = bookings.filter(b => getService(b) === name && getStatus(b) === 'COMPLETED');
                    const rev = svc.reduce((s, b) => s + getPrice(b), 0);
                    return (
                      <tr key={name}>
                        <td><strong>{name}</strong></td>
                        <td>{svc.length}</td>
                        <td className="price-col">₱{rev.toLocaleString()}</td>
                        <td>₱{svc.length > 0 ? Math.round(rev / svc.length) : 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>}

          {/* ── CUSTOMERS ── */}
          {page === 'customers' && (
            <div className="table-card">
              <div className="tc-head"><h3>Customers</h3><span className="tc-sub">{customers.length} registered</span></div>
              <table className="dtable">
                <thead><tr><th>Customer</th><th>Bookings</th><th>Total Spent</th><th>Last Visit</th><th>Status</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td className="mono">{c.name}</td>
                      <td>{c.count}</td>
                      <td className="price-col">₱{c.spent.toLocaleString()}</td>
                      <td>{c.last}</td>
                      <td><span className="badge b-completed">Active</span></td>
                    </tr>
                  ))}
                  {customers.length === 0 && <tr><td colSpan="5" className="tbl-empty">No customers yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);
  if (loading) return (
    <div className="splash">
      <Icon name="scissors" size={36}/>
      <div className="splash-spin"/>
    </div>
  );
  return user ? <Dashboard onLogout={() => signOut(auth)}/> : <Login/>;
}