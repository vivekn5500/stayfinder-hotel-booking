import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { formatDateIso, formatDate, calculateNights } from '../utils/formatters';

export default function AvailabilityCalendar({
  checkIn,
  checkOut,
  onDateRangeSelect,
  availableRoomsCount = null,
  totalRoomsCount = null,
  isLoading = false
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    return checkIn ? new Date(checkIn + 'T00:00:00') : new Date();
  });

  const [hoverDate, setHoverDate] = useState(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const todayStr = formatDateIso(new Date());

  const handleDayClick = (dayStr) => {
    if (dayStr < todayStr) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Starting new selection
      onDateRangeSelect(dayStr, '');
    } else if (checkIn && !checkOut) {
      if (dayStr <= checkIn) {
        // Reset check-in if clicked date is before or same as check-in
        onDateRangeSelect(dayStr, '');
      } else {
        // Complete the range
        onDateRangeSelect(checkIn, dayStr);
      }
    }
  };

  const isDaySelected = (dayStr) => {
    if (dayStr === checkIn) return 'check-in';
    if (dayStr === checkOut) return 'check-out';
    if (checkIn && checkOut && dayStr > checkIn && dayStr < checkOut) return 'in-range';
    if (checkIn && !checkOut && hoverDate && dayStr > checkIn && dayStr <= hoverDate) return 'hover-range';
    return false;
  };

  const calendarDays = [];
  // Empty padding for days before the 1st of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push(dayStr);
  }

  const nights = calculateNights(checkIn, checkOut);

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '1.75rem',
      boxShadow: 'var(--shadow-card)',
      maxWidth: '520px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CalendarIcon size={18} color="var(--color-brass-dark)" />
          <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-forest-dark)' }}>
            Smart Stay Calendar
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={prevMonth}
            className="btn btn-subtle"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, minWidth: '130px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="btn btn-subtle"
            style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        textAlign: 'center',
        marginBottom: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-muted)',
        textTransform: 'uppercase'
      }}>
        {daysOfWeek.map((day) => (
          <div key={day} style={{ padding: '0.25rem 0' }}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '4px',
        textAlign: 'center'
      }}>
        {calendarDays.map((dayStr, idx) => {
          if (!dayStr) {
            return <div key={`empty-${idx}`} style={{ height: '42px' }} />;
          }

          const dayNum = parseInt(dayStr.split('-')[2], 10);
          const isPast = dayStr < todayStr;
          const selectionType = isDaySelected(dayStr);

          let bg = 'transparent';
          let textColor = isPast ? '#C5CBC8' : 'var(--color-charcoal)';
          let fontWeight = 'normal';
          let borderRadius = 'var(--radius-sm)';

          if (selectionType === 'check-in' || selectionType === 'check-out') {
            bg = 'var(--color-forest)';
            textColor = 'var(--color-white)';
            fontWeight = 'bold';
          } else if (selectionType === 'in-range' || selectionType === 'hover-range') {
            bg = 'var(--color-forest-soft)';
            textColor = 'var(--color-forest-dark)';
          }

          return (
            <button
              key={dayStr}
              type="button"
              disabled={isPast}
              onClick={() => handleDayClick(dayStr)}
              onMouseEnter={() => setHoverDate(dayStr)}
              onMouseLeave={() => setHoverDate(null)}
              style={{
                height: '42px',
                width: '100%',
                border: selectionType === 'check-in' || selectionType === 'check-out' ? '1px solid var(--color-brass)' : 'none',
                backgroundColor: bg,
                color: textColor,
                fontWeight: fontWeight,
                borderRadius: borderRadius,
                fontSize: '0.875rem',
                cursor: isPast ? 'not-allowed' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              <span>{dayNum}</span>
              {selectionType === 'check-in' && (
                <span style={{ fontSize: '0.55rem', lineHeight: 1, textTransform: 'uppercase', color: 'var(--color-brass-light)' }}>
                  In
                </span>
              )}
              {selectionType === 'check-out' && (
                <span style={{ fontSize: '0.55rem', lineHeight: 1, textTransform: 'uppercase', color: 'var(--color-brass-light)' }}>
                  Out
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Date Range Summary & Dynamic Availability */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--color-border-subtle)',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.75rem' }}>Selected Stay</span>
            <span style={{ fontWeight: 600, color: 'var(--color-forest-dark)' }}>
              {checkIn ? formatDate(checkIn) : 'Choose check-in'} → {checkOut ? formatDate(checkOut) : 'Choose check-out'}
            </span>
          </div>
          {nights > 0 && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--color-muted)', display: 'block', fontSize: '0.75rem' }}>Duration</span>
              <span style={{ fontWeight: 700, color: 'var(--color-terracotta)' }}>
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>
          )}
        </div>

        {/* Real-time backend status feedback */}
        {checkIn && checkOut && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isLoading
              ? 'var(--color-ivory)'
              : availableRoomsCount > 0
              ? 'var(--color-success-bg)'
              : 'var(--color-error-bg)',
            color: isLoading
              ? 'var(--color-charcoal)'
              : availableRoomsCount > 0
              ? 'var(--color-success)'
              : 'var(--color-error)'
          }}>
            {isLoading ? (
              <span style={{ fontSize: '0.8rem' }}>Querying live physical room inventory...</span>
            ) : availableRoomsCount != null && availableRoomsCount > 0 ? (
              <>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                  {availableRoomsCount === totalRoomsCount
                    ? `Full Availability: All ${availableRoomsCount} physical rooms available`
                    : `Partial Availability: ${availableRoomsCount} of ${totalRoomsCount} rooms available`}
                </span>
              </>
            ) : (
              <>
                <XCircle size={16} />
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                  Sold Out for these dates. Please adjust your stay window.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
