import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, CalendarCheck, Search, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      backgroundColor: 'var(--color-ivory-light)',
      borderBottom: '1px solid var(--color-border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'rgba(250, 248, 245, 0.95)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '76px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: 'var(--color-forest)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-brass)'
          }}>
            <Compass size={22} strokeWidth={1.8} />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--color-forest-dark)',
              display: 'block',
              lineHeight: 1
            }}>
              STAYFINDER
            </span>
            <span style={{
              fontSize: '0.625rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--color-brass-dark)',
              fontWeight: 600,
              display: 'block',
              marginTop: '2px'
            }}>
              Curated Sanctuaries
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to="/hotels"
            style={{
              fontSize: '0.875rem',
              fontWeight: isActive('/hotels') ? 700 : 500,
              color: isActive('/hotels') ? 'var(--color-forest)' : 'var(--color-charcoal-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Search size={16} />
            Explore Sanctuaries
          </Link>
          <Link
            to="/reservations"
            style={{
              fontSize: '0.875rem',
              fontWeight: isActive('/reservations') ? 700 : 500,
              color: isActive('/reservations') ? 'var(--color-forest)' : 'var(--color-charcoal-soft)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <CalendarCheck size={16} />
            My Reservations
          </Link>
        </nav>

        {/* Action Button */}
        <div>
          <Link to="/hotels" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            Book a Stay
          </Link>
        </div>
      </div>
    </header>
  );
}
