import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, Calendar, Bed, Check, AlertCircle, Lock, User, Mail, Phone, Clock
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { bookingApi } from '../api/bookingApi';
import { hotelApi } from '../api/hotelApi';
import { formatCurrency, formatDate, calculateNights } from '../utils/formatters';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hotelId = searchParams.get('hotelId');
  const roomId = searchParams.get('roomId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests') || '1';

  const [hotel, setHotel] = useState(null);
  const [priceDetails, setPriceDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!hotelId || !roomId || !checkIn || !checkOut) {
      // Invalid booking parameters, redirect to hotels
      return;
    }
    loadData();
  }, [hotelId, roomId, checkIn, checkOut]);

  const loadData = async () => {
    setIsLoadingDetails(true);
    setFormError(null);
    try {
      const [hotelRes, priceRes] = await Promise.all([
        hotelApi.getHotelById(parseInt(hotelId, 10)),
        bookingApi.calculatePrice(parseInt(roomId, 10), checkIn, checkOut)
      ]);

      const hotelData = hotelRes && hotelRes.data !== undefined ? hotelRes.data : hotelRes;
      const priceData = priceRes && priceRes.data !== undefined ? priceRes.data : priceRes;

      setHotel(hotelData);
      setPriceDetails(priceData);

      if (priceData && priceData.available === false) {
        setFormError('This room is already reserved for the requested dates. Please choose another room.');
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
      const msg = err.data?.message || err.message || 'Unable to verify room pricing and availability. Please return to the hotel page.';
      setFormError(msg);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!guestName.trim()) {
      errors.guestName = 'Full name is required.';
    } else if (guestName.trim().length < 2) {
      errors.guestName = 'Name must be at least 2 characters.';
    }

    if (!guestEmail.trim()) {
      errors.guestEmail = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = 'Please provide a valid email address.';
    }

    if (!guestPhone.trim()) {
      errors.guestPhone = 'Phone number is required.';
    } else if (guestPhone.trim().length < 10) {
      errors.guestPhone = 'Please provide a valid phone number (minimum 10 digits).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);

    const bookingPayload = {
      roomId: parseInt(roomId, 10),
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
      guestPhone: guestPhone.trim(),
      checkInDate: checkIn,
      checkOutDate: checkOut
    };

    try {
      const response = await bookingApi.createBooking(bookingPayload);
      const createdBooking = response.data;
      navigate(`/booking/confirmed/${encodeURIComponent(createdBooking.bookingReference)}`, {
        state: { booking: createdBooking }
      });
    } catch (err) {
      console.error('Booking failed:', err);
      if (err.status === 409) {
        setFormError('Collision Alert: Another guest just finalized the reservation for this physical room. Please select a different room.');
      } else if (err.status === 400 && err.data?.message) {
        setFormError(err.data.message);
      } else {
        setFormError(err.message || 'Failed to complete booking. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hotelId || !roomId || !checkIn || !checkOut) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <ErrorMessage
          title="Incomplete Reservation Information"
          message="Please select a hotel sanctuary and physical suite first before proceeding to checkout."
        />
        <Link to="/hotels" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Explore Sanctuaries
        </Link>
      </div>
    );
  }

  if (isLoadingDetails) {
    return <LoadingSpinner message="Locking in your sanctuary rates..." />;
  }

  const nights = priceDetails?.numberOfNights || calculateNights(checkIn, checkOut);
  const totalAmount = priceDetails?.totalAmount != null
    ? priceDetails.totalAmount
    : priceDetails?.totalPrice != null
    ? priceDetails.totalPrice
    : null;

  return (
    <div style={{ backgroundColor: 'var(--color-ivory-light)', minHeight: '85vh', padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-subtle"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0' }}
          >
            <ArrowLeft size={16} /> Back to Sanctuary Details
          </button>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-brass-dark)',
            display: 'block',
            marginBottom: '0.25rem'
          }}>
            Secure Reservation
          </span>
          <h1 style={{
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            color: 'var(--color-forest-dark)',
            margin: 0
          }}>
            Guest & Stay Details
          </h1>
        </div>

        {/* Form Error Banner */}
        {formError && (
          <div style={{
            backgroundColor: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="var(--color-error)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ color: 'var(--color-error)', fontSize: '0.95rem', margin: '0 0 0.25rem 0' }}>
                  Reservation Notice
                </h4>
                <p style={{ color: 'var(--color-charcoal)', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  {formError}
                </p>
              </div>
            </div>
            <Link
              to={hotelId ? `/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : '/hotels'}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderColor: 'var(--color-error)', color: 'var(--color-error)' }}
            >
              Choose Another Room
            </Link>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Guest Information Form */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-forest-dark)' }}>
              <Lock size={18} color="var(--color-brass-dark)" />
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: 0 }}>
                Primary Guest Information
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="guestName">
                  Full Name (as per government photo ID) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="guestName"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vikramaditya Sharma"
                    value={guestName}
                    onChange={(e) => {
                      setGuestName(e.target.value);
                      if (fieldErrors.guestName) {
                        setFieldErrors({ ...fieldErrors, guestName: null });
                      }
                    }}
                    style={{ paddingLeft: '2.5rem', borderColor: fieldErrors.guestName ? 'var(--color-error)' : undefined }}
                    disabled={isSubmitting}
                  />
                  <User size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
                {fieldErrors.guestName && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {fieldErrors.guestName}
                  </span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="guestEmail">
                  Email Address (confirmation voucher sent here) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="guestEmail"
                    type="email"
                    className="form-input"
                    placeholder="e.g. vikram@example.com"
                    value={guestEmail}
                    onChange={(e) => {
                      setGuestEmail(e.target.value);
                      if (fieldErrors.guestEmail) {
                        setFieldErrors({ ...fieldErrors, guestEmail: null });
                      }
                    }}
                    style={{ paddingLeft: '2.5rem', borderColor: fieldErrors.guestEmail ? 'var(--color-error)' : undefined }}
                    disabled={isSubmitting}
                  />
                  <Mail size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
                {fieldErrors.guestEmail && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {fieldErrors.guestEmail}
                  </span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="guestPhone">
                  Mobile Contact Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="guestPhone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      if (fieldErrors.guestPhone) {
                        setFieldErrors({ ...fieldErrors, guestPhone: null });
                      }
                    }}
                    style={{ paddingLeft: '2.5rem', borderColor: fieldErrors.guestPhone ? 'var(--color-error)' : undefined }}
                    disabled={isSubmitting}
                  />
                  <Phone size={16} color="var(--color-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
                </div>
                {fieldErrors.guestPhone && (
                  <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {fieldErrors.guestPhone}
                  </span>
                )}
              </div>

              {/* Concurrency Guarantees Notice */}
              <div style={{
                backgroundColor: 'var(--color-ivory)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                margin: '2rem 0',
                fontSize: '0.825rem',
                color: 'var(--color-charcoal-soft)',
                lineHeight: 1.6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-forest-dark)', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <ShieldCheck size={16} color="var(--color-forest)" />
                  <span>StayFinder Double-Booking Prevention</span>
                </div>
                Your reservation executes a transactional row lock (`PESSIMISTIC_WRITE`) in our MySQL 8.4 database to guarantee this exact physical room will not be concurrently granted to any other traveler.
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !priceDetails ||
                  priceDetails.available === false ||
                  totalAmount == null ||
                  Boolean(formError)
                }
                className="btn btn-terracotta"
                style={{
                  width: '100%',
                  padding: '0.95rem',
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                  opacity: (!priceDetails || priceDetails.available === false || totalAmount == null || Boolean(formError)) ? 0.6 : 1,
                  cursor: (!priceDetails || priceDetails.available === false || totalAmount == null || Boolean(formError)) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting
                  ? 'Securing Physical Room...'
                  : !priceDetails || priceDetails.available === false
                  ? 'Room Unavailable for Selected Dates'
                  : totalAmount != null
                  ? `Confirm Sanctuary Reservation • ${formatCurrency(totalAmount)}`
                  : 'Calculation Pending...'}
              </button>
            </form>
          </div>

          {/* Right Column: Reservation Summary Card */}
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
            position: 'sticky',
            top: '100px'
          }}>
            <h3 style={{
              fontSize: '1.3rem',
              color: 'var(--color-forest-dark)',
              fontFamily: 'var(--font-serif)',
              marginBottom: '1.25rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--color-border-subtle)'
            }}>
              Stay Summary
            </h3>

            {/* Hotel & Room Title */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-brass-dark)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                {hotel?.location || 'Sanctuary'}
              </span>
              <h4 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', margin: '0.25rem 0 0.5rem 0' }}>
                {hotel?.name}
              </h4>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--color-forest-soft)',
                color: 'var(--color-forest-dark)',
                padding: '0.3rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                <Bed size={13} />
                <span>Room {priceDetails?.roomNumber || searchParams.get('roomNumber')} ({priceDetails?.roomTypeName || searchParams.get('roomTypeName')})</span>
              </div>
            </div>

            {/* Dates & Duration */}
            <div style={{
              backgroundColor: 'var(--color-ivory-light)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Check-in</span>
                <strong style={{ color: 'var(--color-forest-dark)' }}>{formatDate(checkIn)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-muted)' }}>Check-out</span>
                <strong style={{ color: 'var(--color-forest-dark)' }}>{formatDate(checkOut)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                <span style={{ color: 'var(--color-muted)' }}>Duration</span>
                <strong style={{ color: 'var(--color-terracotta)' }}>{nights} {nights === 1 ? 'Night' : 'Nights'}</strong>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-charcoal-soft)' }}>
                  {formatCurrency(priceDetails?.pricePerNight || searchParams.get('pricePerNight'))} × {nights} nights
                </span>
                <span>{totalAmount != null && priceDetails?.available !== false ? formatCurrency(totalAmount) : '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-charcoal-soft)' }}>Service & Heritage Care</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Included</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-charcoal-soft)' }}>Taxes & Municipal Fees</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Included</span>
              </div>
            </div>

            {/* Total Due */}
            <div style={{
              paddingTop: '1rem',
              borderTop: '2px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                Total Payable
              </span>
              <span style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: totalAmount != null && priceDetails?.available !== false ? 'var(--color-terracotta)' : 'var(--color-muted)'
              }}>
                {totalAmount != null && priceDetails?.available !== false ? formatCurrency(totalAmount) : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
