import React, { useState } from 'react';
import {
  Search, CalendarCheck, Mail, Hash, AlertCircle, CheckCircle2, XCircle, Bed, MapPin, Printer, ShieldAlert
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { bookingApi } from '../api/bookingApi';
import { formatCurrency, formatDate, calculateNights } from '../utils/formatters';

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState('reference'); // 'reference' or 'email'

  // Input states
  const [referenceInput, setReferenceInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // Results states
  const [singleBooking, setSingleBooking] = useState(null);
  const [bookingList, setBookingList] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Cancellation Modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState(null);

  const handleSearchByReference = async (e) => {
    e.preventDefault();
    if (!referenceInput.trim()) return;

    setIsLoading(true);
    setSearchError(null);
    setSingleBooking(null);
    setBookingList([]);
    setCancelSuccessMsg(null);
    setHasSearched(true);

    try {
      const response = await bookingApi.getBookingByReference(referenceInput.trim());
      setSingleBooking(response.data);
    } catch (err) {
      console.error('Error looking up booking:', err);
      if (err.status === 404) {
        setSearchError(`No reservation found matching reference "${referenceInput.trim()}". Please verify the code.`);
      } else {
        setSearchError('Failed to retrieve reservation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchByEmail = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoading(true);
    setSearchError(null);
    setSingleBooking(null);
    setBookingList([]);
    setCancelSuccessMsg(null);
    setHasSearched(true);

    try {
      const response = await bookingApi.getBookingsByEmail(emailInput.trim());
      setBookingList(response.data || []);
      if (!response.data || response.data.length === 0) {
        setSearchError(`No reservations located under "${emailInput.trim()}".`);
      }
    } catch (err) {
      console.error('Error looking up bookings by email:', err);
      setSearchError('Failed to retrieve reservations for this email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    setIsCancelling(true);
    setCancelErrorMsg(null);

    try {
      const response = await bookingApi.cancelBooking(cancellingBooking.bookingReference);
      const updated = response.data;

      // Update state
      if (singleBooking && singleBooking.bookingReference === updated.bookingReference) {
        setSingleBooking(updated);
      }
      setBookingList(prev => prev.map(b => b.bookingReference === updated.bookingReference ? updated : b));

      setCancelSuccessMsg(`Reservation ${updated.bookingReference} has been successfully cancelled.`);
      setCancellingBooking(null);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      setCancelErrorMsg(err.data?.message || err.message || 'Failed to cancel reservation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderBookingCard = (b) => {
    const isCancelled = b.status === 'CANCELLED';
    const nights = calculateNights(b.checkInDate, b.checkOutDate);

    return (
      <div
        key={b.bookingReference}
        style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '1.5rem',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brass-dark)' }}>
              Reference
            </span>
            <h3 style={{
              fontFamily: 'monospace',
              fontSize: '1.4rem',
              color: 'var(--color-forest-dark)',
              margin: '0.2rem 0 0 0',
              fontWeight: 700
            }}>
              {b.bookingReference}
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className={`badge ${isCancelled ? 'badge-error' : 'badge-success'}`} style={{ padding: '0.35rem 0.85rem' }}>
              {b.status}
            </span>
          </div>
        </div>

        {/* Content Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Sanctuary
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
              {b.hotelName}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-soft)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <MapPin size={12} />
              <span>{b.hotelLocation}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Suite Details
            </span>
            <div style={{ fontWeight: 600, color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
              Room {b.roomNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-soft)', marginTop: '0.2rem' }}>
              {b.roomTypeName}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Stay Schedule
            </span>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
              {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-terracotta)', fontWeight: 600, marginTop: '0.2rem' }}>
              {nights} {nights === 1 ? 'Night' : 'Nights'}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
              Guest & Booking Total
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest-dark)', marginTop: '0.2rem' }}>
              {b.guestName}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-terracotta)', marginTop: '0.2rem' }}>
              {formatCurrency(b.totalAmount != null ? b.totalAmount : b.totalPrice)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-subtle)'
        }}>
          {!isCancelled && (
            <button
              type="button"
              onClick={() => setCancellingBooking(b)}
              className="btn btn-outline"
              style={{
                color: 'var(--color-error)',
                borderColor: 'var(--color-error)',
                fontSize: '0.85rem',
                padding: '0.5rem 1rem'
              }}
            >
              Cancel Reservation
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory-light)', minHeight: '85vh', padding: '3.5rem 0 6rem 0' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-forest-soft)',
            color: 'var(--color-forest-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
          }}>
            <CalendarCheck size={24} />
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            color: 'var(--color-forest-dark)',
            marginBottom: '0.5rem'
          }}>
            Manage Your Reservations
          </h1>
          <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto' }}>
            Look up confirmed bookings, review stay specifics, and manage reservation status securely.
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('reference');
              setSearchError(null);
              setCancelSuccessMsg(null);
            }}
            className={`btn ${activeTab === 'reference' ? 'btn-primary' : 'btn-subtle'}`}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Hash size={16} /> By Booking Reference
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setSearchError(null);
              setCancelSuccessMsg(null);
            }}
            className={`btn ${activeTab === 'email' ? 'btn-primary' : 'btn-subtle'}`}
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Mail size={16} /> By Guest Email
          </button>
        </div>

        {/* Search Input Box */}
        <div style={{
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '2.5rem'
        }}>
          {activeTab === 'reference' ? (
            <form onSubmit={handleSearchByReference} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label className="form-label" htmlFor="bookingRefInput">
                  Enter Booking Reference Code
                </label>
                <input
                  id="bookingRefInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. SF-202611-ABC123"
                  value={referenceInput}
                  onChange={(e) => setReferenceInput(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'monospace' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-terracotta"
                  style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Search size={16} />
                  <span>Look Up Booking</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSearchByEmail} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label className="form-label" htmlFor="guestEmailInput">
                  Enter Guest Email Address
                </label>
                <input
                  id="guestEmailInput"
                  type="email"
                  className="form-input"
                  placeholder="e.g. guest@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-terracotta"
                  style={{ padding: '0.75rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Search size={16} />
                  <span>Find Reservations</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Cancellation Success Feedback */}
        {cancelSuccessMsg && (
          <div style={{
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--color-success)'
          }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cancelSuccessMsg}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner message="Querying StayFinder reservations catalog..." />}

        {/* Search Error State */}
        {searchError && (
          <ErrorMessage
            title="Search Notice"
            message={searchError}
          />
        )}

        {/* Results Display */}
        {!isLoading && !searchError && hasSearched && (
          <div>
            {singleBooking && renderBookingCard(singleBooking)}

            {bookingList.length > 0 && (
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.4rem',
                  color: 'var(--color-forest-dark)',
                  marginBottom: '1rem'
                }}>
                  Found {bookingList.length} {bookingList.length === 1 ? 'Reservation' : 'Reservations'}
                </h3>
                {bookingList.map((b) => renderBookingCard(b))}
              </div>
            )}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancellingBooking && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 38, 29, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-hover)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <ShieldAlert size={26} />
              </div>

              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                color: 'var(--color-forest-dark)',
                textAlign: 'center',
                marginBottom: '0.75rem'
              }}>
                Cancel Reservation?
              </h3>

              <p style={{
                color: 'var(--color-charcoal-soft)',
                fontSize: '0.9rem',
                textAlign: 'center',
                lineHeight: 1.6,
                marginBottom: '1.5rem'
              }}>
                Are you sure you wish to cancel reservation <strong>{cancellingBooking.bookingReference}</strong> for <strong>{cancellingBooking.hotelName}</strong> (Room {cancellingBooking.roomNumber})? This will release the physical room lock back to the availability pool.
              </p>

              {cancelErrorMsg && (
                <div style={{
                  backgroundColor: 'var(--color-error-bg)',
                  color: 'var(--color-error)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {cancelErrorMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancellingBooking(null)}
                  className="btn btn-subtle"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    borderColor: 'var(--color-error)',
                    padding: '0.75rem 1.5rem'
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
