import React, { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const CalendarView = ({ bookings }) => {
  const [cur, setCur] = useState(new Date());
  const y = cur.getFullYear(), m = cur.getMonth();
  const firstDay    = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today       = new Date();

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
          const day  = i + 1;
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
};

export default CalendarView;