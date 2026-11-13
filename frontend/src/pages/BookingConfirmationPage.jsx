import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, Calendar, MapPin, Bed, User, Mail, Phone, Printer, ArrowRight, ShieldCheck, Compass
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { bookingApi } from '../api/bookingApi';
import { formatCurrency, formatDate, calculateNights } from '../utils/formatters';

export default function BookingConfirmationPage() {
  const { reference } = useParams();
  const location = useLocation();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [isLoading, setIsLoading] = useState(!booking);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!booking && reference) {
      fetchBooking();
    }
  }, [reference]);

  const fetchBooking = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await bookingApi.getBookingByReference(reference);
      setBooking(response.data);
    } catch (err) {
      console.error('Failed to retrieve reservation:', err);
      setError('Could not locate reservation with reference code ' + reference);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your confirmed reservation voucher..." />;
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <ErrorMessage
          title="Reservation Not Found"
          message={error || 'Unable to retrieve your booking confirmation.'}
          onRetry={fetchBooking}
        />
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link to="/reservations" className="btn btn-outline">Look Up Another Booking</Link>
          <Link to="/hotels" className="btn btn-primary">Return to Sanctuaries</Link>
        </div>
      </div>
    );
  }

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);

  return (
    <div style={{ backgroundColor: 'var(--color-ivory-light)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Celebration Header Card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '3rem 2.5rem',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'var(--color-brass-dark)',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            Sanctuary Confirmed
          </span>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            color: 'var(--color-forest-dark)',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Your Journey Awaits, {booking.guestName}.
          </h1>

          <p style={{
            color: 'var(--color-charcoal-soft)',
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            A confirmation voucher has been recorded. Your physical room key has been reserved in our system.
          </p>

          {/* Reference Badge Box */}
          <div style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-ivory)',
            border: '2px dashed var(--color-brass)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 2.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Booking Reference Code
            </span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '1.65rem',
              fontWeight: 700,
              color: 'var(--color-forest-dark)',
              letterSpacing: '0.08em'
            }}>
              {booking.bookingReference}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' : 'badge-error'}`} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Status: {booking.status}
            </span>
          </div>
        </div>

        {/* Detailed Reservation Voucher Card */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.35rem',
            fontFamily: 'var(--font-serif)',
            color: 'var(--color-forest-dark)',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--color-border-subtle)'
          }}>
            Reservation Particulars
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Sanctuary Information */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brass-dark)', display: 'block', marginBottom: '0.35rem' }}>
                Sanctuary & Suite
              </span>
              <h4 style={{ fontSize: '1.15rem', color: 'var(--color-forest-dark)', margin: '0 0 0.35rem 0' }}>
                {booking.hotelName}
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-soft)', margin: '0 0 0.5rem 0' }}>
                Room {booking.roomNumber} ({booking.roomTypeName})
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                <MapPin size={13} />
                <span>{booking.hotelLocation}</span>
              </div>
            </div>

            {/* Stay Dates */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brass-dark)', display: 'block', marginBottom: '0.35rem' }}>
                Stay Schedule
              </span>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <strong style={{ color: 'var(--color-forest-dark)' }}>Check-in:</strong> {formatDate(booking.checkInDate)}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                <strong style={{ color: 'var(--color-forest-dark)' }}>Check-out:</strong> {formatDate(booking.checkOutDate)}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-terracotta)', fontWeight: 600 }}>
                {nights} {nights === 1 ? 'Night' : 'Nights'}
              </span>
            </div>

            {/* Guest Contact */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brass-dark)', display: 'block', marginBottom: '0.35rem' }}>
                Primary Guest
              </span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
                {booking.guestName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-soft)', marginBottom: '0.2rem' }}>
                {booking.guestEmail}
              </div>
              {booking.guestPhone && (
                <div style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                  {booking.guestPhone}
                </div>
              )}
            </div>

            {/* Financial Details */}
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-brass-dark)', display: 'block', marginBottom: '0.35rem' }}>
                Booking Total
              </span>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--color-terracotta)'
              }}>
                {formatCurrency(booking.totalAmount != null ? booking.totalAmount : booking.totalPrice)}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                Taxes and service fees included
              </span>
            </div>
          </div>

          {/* Guarantee Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--color-ivory)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.825rem',
            color: 'var(--color-forest-dark)'
          }}>
            <ShieldCheck size={18} color="var(--color-forest)" />
            <span>
              Verified by StayFinder Concurrency Engine. Your reservation is guaranteed under reference <strong>{booking.bookingReference}</strong>.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Printer size={16} />
            <span>Print Reservation Voucher</span>
          </button>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/reservations" className="btn btn-subtle">
              Manage Reservations
            </Link>
            <Link to="/hotels" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Explore More Stays</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
