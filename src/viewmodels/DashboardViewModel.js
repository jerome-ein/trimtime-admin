import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import {
  listenAllBookings, updateBookingStatus,
  computeStats, getLast7Days, buildNotifications,
} from '../models/BookingModel';

export function useDashboardViewModel() {
  const [bookings, setBookings]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState('dashboard');
  const [filter, setFilter]               = useState('all');
  const [search, setSearch]               = useState('');
  const [collapsed, setCollapsed]         = useState(false);
  const [showNotif, setShowNotif]         = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const authUnsub = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      await user.getIdToken(true);
      const unsub = listenAllBookings(
        (data) => {
          setBookings(data);
          setNotifications(buildNotifications(data));
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

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
    } catch (e) {
      alert('Failed: ' + e.message);
    }
  };

  const toggleCollapsed = () => setCollapsed(c => !c);
  const toggleNotif     = () => setShowNotif(s => !s);
  const stats           = computeStats(bookings);
  const last7           = getLast7Days(bookings);

  const filtered = bookings
    .filter(b => filter === 'all' || (b.status || '').toUpperCase() === filter)
    .filter(b => {
      if (!search) return true;
      const svc    = (b.haircutName || b.service || '').toLowerCase();
      const barber = (b.barberName || '').toLowerCase();
      const id     = (b.id || '').toLowerCase();
      return svc.includes(search.toLowerCase()) ||
             barber.includes(search.toLowerCase()) ||
             id.includes(search.toLowerCase());
    });

  return {
    bookings, filtered, loading, stats, last7,
    page, setPage,
    filter, setFilter,
    search, setSearch,
    collapsed, toggleCollapsed,
    showNotif, toggleNotif,
    notifications,
    updateStatus,
  };
}