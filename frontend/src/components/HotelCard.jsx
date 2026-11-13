import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { getHotelImages } from '../utils/hotelImages';

export default function HotelCard({ hotel, checkIn = '', checkOut = '', guests = 1 }) {
  const images = getHotelImages(hotel.id);

  // Preserve search parameters into details page
  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.set('checkIn', checkIn);
  if (checkOut) queryParams.set('checkOut', checkOut);
  if (guests) queryParams.set('guests', guests.toString());
  const detailsUrl = `/hotels/${hotel.id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return (
    <article
      style={{
        backgroundColor: 'var(--color-white)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all var(--transition-normal)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card)';
      }}
    >
      {/* Image Container with Editorial Badge */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        <img
          src={images.hero}
          alt={hotel.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <span className="badge badge-brass" style={{ backdropFilter: 'blur(8px)', background: 'rgba(245, 239, 228, 0.92)' }}>
            {images.tag}
          </span>
        </div>

        {/* Star Rating Overlay */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(26, 56, 43, 0.88)',
          color: 'var(--color-brass)',
          padding: '0.3rem 0.6rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          backdropFilter: 'blur(4px)'
        }}>
          <Star size={13} fill="var(--color-brass)" stroke="var(--color-brass)" />
          <span>{hotel.starRating ? Number(hotel.starRating).toFixed(1) : '5.0'}</span>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Location Subtitle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.8rem',
          color: 'var(--color-brass-dark)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem'
        }}>
          <MapPin size={13} />
          <span>{hotel.location}</span>
        </div>

        {/* Hotel Title */}
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '0.75rem',
          color: 'var(--color-forest-dark)',
          lineHeight: 1.2
        }}>
          <Link to={detailsUrl} style={{ color: 'inherit' }}>
            {hotel.name}
          </Link>
        </h3>

        {/* Description Excerpt */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--color-charcoal-soft)',
          marginBottom: '1.25rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {hotel.description}
        </p>

        {/* Amenities Highlights */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
            {hotel.amenities.slice(0, 3).map((amenity, idx) => {
              const amenityName = typeof amenity === 'object' && amenity !== null ? amenity.name : amenity;
              const amenityKey = typeof amenity === 'object' && amenity?.id != null ? amenity.id : idx;
              return (
                <span key={amenityKey} className="badge badge-forest" style={{ fontSize: '0.7rem' }}>
                  {amenityName}
                </span>
              );
            })}
            {hotel.amenities.length > 3 && (
              <span className="badge" style={{ fontSize: '0.7rem', color: 'var(--color-muted)', backgroundColor: 'var(--color-ivory)' }}>
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price & Action Button Footer */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Starting From
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--color-forest-dark)'
              }}>
                {formatCurrency(hotel.startingPrice)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>/ night</span>
            </div>
          </div>

          <Link
            to={detailsUrl}
            className="btn btn-outline"
            style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }}
          >
            <span>View Rooms</span>
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
