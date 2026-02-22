import React from 'react';
import Icon from '../components/Icon';
import { MiniBarChart, RevenueChart, DonutChart } from '../components/Charts';
import CalendarView from '../components/CalendarView';
import { useDashboardViewModel } from '../viewmodels/DashboardViewModel';
import {
  getStatus, getService, getTime, getPrice,
  formatDate, getMonthlyRevenue, getRevenueByService, getCustomers
} from '../models/BookingModel';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'bookings',  label: 'Bookings',  icon: 'bookings'  },
  { id: 'calendar',  label: 'Calendar',  icon: 'calendar'  },
  { id: 'revenue',   label: 'Revenue',   icon: 'revenue'   },
  { id: 'customers', label: 'Customers', icon: 'customers' },
];

const DashboardView = ({ onLogout }) => {
  const {
    bookings, filtered, loading, stats, last7,
    page, setPage,
    filter, setFilter,
    search, setSearch,
    collapsed, toggleCollapsed,
    showNotif, toggleNotif,
    notifications,
    updateStatus,
  } = useDashboardViewModel();

  const monthlyRevenue   = getMonthlyRevenue(bookings);
  const revenueByService = getRevenueByService(bookings);
  const customers        = [...getCustomers(bookings)];

  return (
    <div className={`shell ${collapsed ? 'collapsed' : ''}`}>

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-logo"><Icon name="scissors" size={18}/></div>
          {!collapsed && <span className="sb-name">TrimTime</span>}
        </div>
        <nav className="sb-nav">
          {NAV_ITEMS.map(n => (
            <button key={n.id}
              className={`sb-item ${page === n.id ? 'sb-active' : ''}`}
              onClick={() => setPage(n.id)}>
              <Icon name={n.icon} size={17}/>
              {!collapsed && <span>{n.label}</span>}
              {!collapsed && n.id === 'bookings' && stats.pending > 0 && (
                <span className="sb-badge">{stats.pending}</span>
              )}
            </button>
          ))}
        </nav>
        <button className="sb-item sb-logout" onClick={onLogout}>
          <Icon name="logout" size={17}/>
          {!collapsed && <span>Logout</span>}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <header className="topbar">
          <div className="tb-left">
            <button className="icon-btn" onClick={toggleCollapsed}>
              <Icon name="menu" size={19}/>
            </button>
            <h2 className="tb-title">{NAV_ITEMS.find(n => n.id === page)?.label}</h2>
          </div>
          <div className="tb-right">
            <div className="notif-wrap">
              <button className="icon-btn notif-btn" onClick={toggleNotif}>
                <Icon name="bell" size={19}/>
                {notifications.length > 0 && (
                  <span className="notif-pip">{notifications.length}</span>
                )}
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

          {/* ── DASHBOARD PAGE ── */}
          {page === 'dashboard' && <>
            <div className="stats-grid">
              {[
                { label: 'Total Bookings', val: stats.total,                                       icon: 'bookings' },
                { label: 'Pending',        val: stats.pending,                                     icon: 'clock'    },
                { label: 'Completed',      val: stats.completed,                                   icon: 'check'    },
                { label: 'Total Revenue',  val: `₱${Math.round(stats.revenue).toLocaleString()}`, icon: 'revenue'  },
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
                <RevenueChart data={monthlyRevenue}/>
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
                      <td>{formatDate(b.date)}</td>
                      <td>{b.barberName}</td>
                      <td className="price-col">₱{Math.round(getPrice(b))}</td>
                      <td><span className={`badge b-${getStatus(b).toLowerCase()}`}>{getStatus(b)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {/* ── BOOKINGS PAGE ── */}
          {page === 'bookings' && (
            <div className="table-card">
              <div className="tc-head">
                <h3>All Bookings</h3>
                <div className="tc-controls">
                  <input className="search-box" placeholder="Search..."
                    value={search} onChange={e => setSearch(e.target.value)}/>
                  <div className="ftabs">
                    {[['all','All'],['PENDING','Pending'],['COMPLETED','Completed'],['CANCELLED','Cancelled']].map(([val, lbl]) => (
                      <button key={val}
                        className={`ftab ${filter === val ? 'ftab-on' : ''}`}
                        onClick={() => setFilter(val)}>
                        {lbl}
                        {val === 'PENDING' && stats.pending > 0 && (
                          <span className="ftab-count">{stats.pending}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {loading ? <div className="tbl-empty">Loading...</div> : (
                <table className="dtable">
                  <thead>
                    <tr><th>Booking ID</th><th>Service</th><th>Date</th><th>Time</th><th>Barber</th><th>Price</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan="8" className="tbl-empty">No bookings found</td></tr>
                      : filtered.map(b => (
                        <tr key={b.id}>
                          <td className="mono">#{b.id.slice(-8)}</td>
                          <td><strong>{getService(b)}</strong></td>
                          <td>{formatDate(b.date)}</td>
                          <td>{getTime(b)}</td>
                          <td>{b.barberName}</td>
                          <td className="price-col">₱{Math.round(getPrice(b))}</td>
                          <td><span className={`badge b-${getStatus(b).toLowerCase()}`}>{getStatus(b)}</span></td>
                          <td>
                            <div className="acts">
                              {getStatus(b) === 'PENDING' && <>
                                <button className="act complete" title="Complete"
                                  onClick={() => updateStatus(b.id, 'COMPLETED')}>
                                  <Icon name="check" size={13}/>
                                </button>
                                <button className="act cancel" title="Cancel"
                                  onClick={() => updateStatus(b.id, 'CANCELLED')}>
                                  <Icon name="x" size={13}/>
                                </button>
                              </>}
                              {getStatus(b) === 'CANCELLED' && (
                                <button className="act restore" title="Restore"
                                  onClick={() => updateStatus(b.id, 'PENDING')}>
                                  <Icon name="refresh" size={13}/>
                                </button>
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

          {/* ── CALENDAR PAGE ── */}
          {page === 'calendar' && (
            <div className="cal-layout">
              <div className="table-card">
                <div className="tc-head"><h3>Booking Calendar</h3></div>
                <CalendarView bookings={bookings}/>
              </div>
              <div className="table-card">
                <div className="tc-head"><h3>Upcoming Bookings</h3></div>
                <div className="upcoming">
                  {bookings
                    .filter(b => getStatus(b) === 'PENDING' && new Date(b.date) >= new Date())
                    .slice(0, 8)
                    .map(b => (
                      <div key={b.id} className="up-row">
                        <div className="up-date">
                          <span className="up-d">{new Date(b.date).getDate()}</span>
                          <span className="up-m">{new Date(b.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="up-info">
                          <div className="up-svc">{getService(b)}</div>
                          <div className="up-meta">{getTime(b)} · {b.barberName}</div>
                        </div>
                        <div className="price-col">₱{Math.round(getPrice(b))}</div>
                      </div>
                    ))
                  }
                  {bookings.filter(b => getStatus(b) === 'PENDING' && new Date(b.date) >= new Date()).length === 0 && (
                    <div className="tbl-empty">No upcoming bookings</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── REVENUE PAGE ── */}
          {page === 'revenue' && <>
            <div className="stats-grid">
              {[
                { label: 'Total Revenue',   val: `₱${Math.round(stats.revenue).toLocaleString()}` },
                { label: "Today's Revenue", val: `₱${Math.round(stats.todayRev)}` },
                { label: 'Avg per Booking', val: `₱${stats.avgPerBooking}` },
                { label: 'Completed Jobs',  val: stats.completed },
              ].map((s, i) => (
                <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="sc-label">{s.label}</div>
                  <div className="sc-val">{s.val}</div>
                </div>
              ))}
            </div>
            <div className="table-card">
              <div className="tc-head">
                <h3>Monthly Revenue</h3>
                <span className="tc-sub">Last 6 months</span>
              </div>
              <RevenueChart data={monthlyRevenue}/>
            </div>
            <div className="table-card">
              <div className="tc-head"><h3>Revenue by Service</h3></div>
              <table className="dtable">
                <thead><tr><th>Service</th><th>Jobs</th><th>Revenue</th><th>Avg Price</th></tr></thead>
                <tbody>
                  {revenueByService.map(s => (
                    <tr key={s.name}>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.jobs}</td>
                      <td className="price-col">₱{Math.round(s.revenue).toLocaleString()}</td>
                      <td>₱{s.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>}

          {/* ── CUSTOMERS PAGE ── */}
          {page === 'customers' && (
            <div className="table-card">
              <div className="tc-head">
                <h3>Customers</h3>
                <span className="tc-sub">{customers.length} registered</span>
              </div>
              <table className="dtable">
                <thead><tr><th>Customer</th><th>Bookings</th><th>Total Spent</th><th>Last Visit</th><th>Status</th></tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c.id}>
                      <td className="mono">{c.name}</td>
                      <td>{c.count}</td>
                      <td className="price-col">₱{Math.round(c.spent).toLocaleString()}</td>
                      <td>{c.last}</td>
                      <td><span className="badge b-completed">Active</span></td>
                    </tr>
                  ))}
                  {customers.length === 0 && (
                    <tr><td colSpan="5" className="tbl-empty">No customers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DashboardView;