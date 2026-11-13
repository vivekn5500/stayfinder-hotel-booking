import React from 'react';
import { Bed, Users, Layers, Check, X, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function RoomCard({ room, nights = 0, onSelectRoom, isSelected = false }) {
  const isAvailable = room.available !== false;
  const totalPrice = nights > 0 ? Number(room.pricePerNight) * nights : null;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        border: isSelected ? '2px solid var(--color-forest)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        boxShadow: isSelected ? 'var(--shadow-hover)' : 'var(--shadow-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        opacity: isAvailable ? 1 : 0.65,
        transition: 'all var(--transition-normal)'
      }}
    >
      {/* Top Details */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--color-brass-dark)'
            }}>
              Room {room.roomNumber}
            </span>
            <h4 style={{
              fontSize: '1.25rem',
              color: 'var(--color-forest-dark)',
              fontFamily: 'var(--font-serif)',
              marginTop: '0.2rem'
            }}>
              {room.roomTypeName}
            </h4>
          </div>

          {/* Availability Badge */}
          {isAvailable ? (
            <span className="badge badge-success">
              <Check size={12} /> Available
            </span>
          ) : (
            <span className="badge badge-error">
              <X size={12} /> Booked
            </span>
          )}
        </div>

        {/* Room Specifications */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--color-muted)',
          margin: '1rem 0 1.25rem 0',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}>
          {room.floorNumber != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={14} />
              <span>Floor {room.floorNumber}</span>
            </div>
          )}
          {room.maxOccupancy != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={14} />
              <span>Up to {room.maxOccupancy} Guests</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} />
            <span>Pessimistic Row Lock Protected</span>
          </div>
        </div>
      </div>

      {/* Pricing and Action */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: '0.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>
            Rate per night
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--color-forest-dark)'
            }}>
              {formatCurrency(room.pricePerNight)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>/ night</span>
          </div>

          {totalPrice != null && nights > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', fontWeight: 600, display: 'block', marginTop: '0.15rem' }}>
              Total: {formatCurrency(totalPrice)} ({nights} {nights === 1 ? 'night' : 'nights'})
            </span>
          )}
        </div>

        <div>
          <button
            type="button"
            disabled={!isAvailable}
            onClick={() => onSelectRoom(room)}
            className={`btn ${isSelected ? 'btn-terracotta' : 'btn-primary'}`}
            style={{ padding: '0.65rem 1.2rem', fontSize: '0.85rem' }}
          >
            {isSelected ? 'Selected' : isAvailable ? 'Select Room' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
