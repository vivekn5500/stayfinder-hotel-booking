import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { formatDateIso } from '../utils/formatters';

export default function SearchBar({ initialLocation = '', initialCheckIn = '', initialCheckOut = '', initialGuests = 1, compact = false }) {
  const navigate = useNavigate();

  const today = formatDateIso(new Date());
  const defaultCheckIn = initialCheckIn || formatDateIso(new Date(Date.now() + 86400000 * 2));
  const defaultCheckOut = initialCheckOut || formatDateIso(new Date(Date.now() + 86400000 * 5));

  const [location, setLocation] = useState(initialLocation);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(initialGuests);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests.toString());

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: compact ? '0.75rem 1rem' : '1.25rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
        gap: '1rem',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1080px',
        margin: '0 auto',
      }}
    >
      {/* Destination Field */}
      <div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <MapPin size={13} color="var(--color-brass-dark)" /> Destination
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="Where will you journey? (e.g. Goa, Jaipur)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ border: 'none', padding: '0.4rem 0', fontWeight: 500 }}
        />
      </div>

      {/* Check-In Field */}
      <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '1rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} color="var(--color-brass-dark)" /> Check-in Date
        </label>
        <input
          type="date"
          className="form-input"
          min={today}
          value={checkIn}
          onChange={(e) => {
            setCheckIn(e.target.value);
            if (e.target.value >= checkOut) {
              const nextDay = new Date(new Date(e.target.value).getTime() + 86400000);
              setCheckOut(formatDateIso(nextDay));
            }
          }}
          style={{ border: 'none', padding: '0.4rem 0', fontWeight: 500 }}
        />
      </div>

      {/* Check-Out Field */}
      <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '1rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} color="var(--color-brass-dark)" /> Check-out Date
        </label>
        <input
          type="date"
          className="form-input"
          min={checkIn || today}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          style={{ border: 'none', padding: '0.4rem 0', fontWeight: 500 }}
        />
      </div>

      {/* Guests Field */}
      <div style={{ borderLeft: '1px solid var(--color-border-subtle)', paddingLeft: '1rem' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={13} color="var(--color-brass-dark)" /> Guests
        </label>
        <select
          className="form-select"
          value={guests}
          onChange={(e) => setGuests(parseInt(e.target.value, 10))}
          style={{ border: 'none', padding: '0.4rem 0', fontWeight: 500, backgroundColor: 'transparent' }}
        >
          <option value={1}>1 Guest</option>
          <option value={2}>2 Guests</option>
          <option value={3}>3 Guests</option>
          <option value={4}>4+ Guests</option>
        </select>
      </div>

      {/* Submit Button */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          type="submit"
          className="btn btn-terracotta"
          style={{
            padding: compact ? '0.75rem 1.25rem' : '0.9rem 1.75rem',
            whiteSpace: 'nowrap',
            width: '100%'
          }}
        >
          <Search size={18} />
          <span>Find Stay</span>
        </button>
      </div>
    </form>
  );
}
