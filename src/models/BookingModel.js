import { collection, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export function listenAllBookings(callback, onError) {
  const q = query(collection(db, 'bookings'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(data);
  }, onError);
}

export async function updateBookingStatus(id, status) {
  await updateDoc(doc(db, 'bookings', id), { status: status.toUpperCase() });
}

export const getStatus  = (b) => (b.status || '').toUpperCase();
export const getService = (b) => b.haircutName || b.service || '—';
export const getTime    = (b) => b.timeSlot || b.time || '—';
export const getPrice   = (b) => {
  const price = b.haircutPrice ?? b.price ?? 0;
  return typeof price === 'string' ? parseFloat(price) || 0 : Number(price) || 0;
};

export function formatDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export function computeStats(bookings) {
  const completed = bookings.filter(b => getStatus(b) === 'COMPLETED');
  const revenue   = completed.reduce((s, b) => s + getPrice(b), 0);
  const today     = new Date();
  const todayRev  = completed
    .filter(b => new Date(b.date).toDateString() === today.toDateString())
    .reduce((s, b) => s + getPrice(b), 0);
  return {
    total:        bookings.length,
    pending:      bookings.filter(b => getStatus(b) === 'PENDING').length,
    completed:    completed.length,
    cancelled:    bookings.filter(b => getStatus(b) === 'CANCELLED').length,
    revenue,
    todayRev,
    avgPerBooking: completed.length > 0 ? Math.round(revenue / completed.length) : 0,
  };
}

export function getLast7Days(bookings) {
  return Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return bookings.filter(b => new Date(b.date).toDateString() === d.toDateString()).length;
  });
}

export function getMonthlyRevenue(bookings) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  return Array(6).fill(0).map((_, i) => {
    const offset = 5 - i;
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const m = d.getMonth(), y = d.getFullYear();
    const rev = bookings
      .filter(b => {
        const bd = new Date(b.date);
        return bd.getMonth() === m && bd.getFullYear() === y && getStatus(b) === 'COMPLETED';
      })
      .reduce((s, b) => s + getPrice(b), 0);
    return { label: MONTHS[m], revenue: rev };
  });
}

export function getRevenueByService(bookings) {
  const names = [...new Set(bookings.map(b => getService(b)))].filter(Boolean);
  return names.map(name => {
    const svc = bookings.filter(b => getService(b) === name && getStatus(b) === 'COMPLETED');
    const rev = svc.reduce((s, b) => s + getPrice(b), 0);
    return { name, jobs: svc.length, revenue: rev, avg: svc.length > 0 ? Math.round(rev / svc.length) : 0 };
  });
}

export function getCustomers(bookings) {
  return [...new Map(bookings.map(b => [b.userId, {
    id:    b.userId || '—',
    name:  b.userName || b.userId?.slice(0, 12) || '—',
    count: bookings.filter(x => x.userId === b.userId).length,
    spent: bookings.filter(x => x.userId === b.userId && getStatus(x) === 'COMPLETED')
                   .reduce((s, x) => s + getPrice(x), 0),
    last:  formatDate(Math.max(...bookings.filter(x => x.userId === b.userId)
                   .map(x => x.timestamp || x.createdAt || 0))),
  }])).values()];
}

export function buildNotifications(bookings) {
  return bookings.filter(b => getStatus(b) === 'PENDING').slice(0, 5).map(b => ({
    id:  b.id,
    msg: `New booking: ${getService(b)}`,
    sub: b.barberName,
    time: b.createdAt
      ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  }));
}