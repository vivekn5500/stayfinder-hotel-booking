import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Award, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-forest-dark)',
      color: 'var(--color-ivory-light)',
      padding: '5rem 0 3rem 0',
      marginTop: 'auto',
      borderTop: '1px solid rgba(197, 165, 114, 0.2)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3.5rem',
          marginBottom: '4rem'
        }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(197, 165, 114, 0.15)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-brass)'
              }}>
                <Compass size={20} />
              </div>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--color-ivory)'
              }}>
                STAYFINDER
              </span>
            </div>
            <p style={{ color: 'rgba(250, 248, 245, 0.7)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Handcrafted hotel sanctuaries and architectural escapes across India's most evocative landscapes. From Goan coastal shores to royal Rajasthani havelis.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-brass)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <ShieldCheck size={16} /> Verified Stays
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <Award size={16} /> Best Rate Guarantee
              </span>
            </div>
          </div>

          {/* Curated Destinations */}
          <div>
            <h4 style={{
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem'
            }}>
              Curated Destinations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/hotels/search?location=Goa" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Goa – Coastal Beach Resorts</Link></li>
              <li><Link to="/hotels/search?location=Jaipur" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Jaipur – Royal Heritage Havelis</Link></li>
              <li><Link to="/hotels/search?location=Mumbai" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Mumbai – Skyline Executive Stays</Link></li>
              <li><Link to="/hotels/search?location=Manali" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Manali – Alpine Mountain Lodges</Link></li>
              <li><Link to="/hotels/search?location=Alleppey" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Alleppey – Backwater Houseboat Sanctuaries</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 style={{
              color: 'var(--color-ivory)',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem'
            }}>
              Guest Services
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li><Link to="/reservations" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Manage & Cancel Reservation</Link></li>
              <li><Link to="/hotels" style={{ color: 'rgba(250, 248, 245, 0.7)' }}>Smart Stay Calendar & Availability</Link></li>
              <li><a href="http://localhost:8080/swagger-ui/index.html" target="_blank" rel="noreferrer" style={{ color: 'var(--color-brass)' }}>Swagger API Documentation ↗</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(250, 248, 245, 0.1)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'rgba(250, 248, 245, 0.5)'
        }}>
          <div>
            © {new Date().getFullYear()} StayFinder Platform. Engineered for thoughtful travel.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Pessimistic-Lock Verified</span>
            <span>MySQL 8.4 Backed</span>
            <span>RESTful Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
