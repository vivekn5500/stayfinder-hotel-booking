import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, Star, Phone, Mail, Wifi, Waves, Coffee, Sparkles, Utensils,
  ShieldCheck, ArrowLeft, Calendar, Bed, Users, CheckCircle, Info
} from 'lucide-react';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { hotelApi } from '../api/hotelApi';
import { getHotelImages } from '../utils/hotelImages';
import { formatDateIso, formatCurrency, calculateNights } from '../utils/formatters';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const hotelId = parseInt(id, 10);
  const images = getHotelImages(hotelId);

  // Read or initialize dates
  const today = formatDateIso(new Date());
  const defaultCheckIn = searchParams.get('checkIn') || formatDateIso(new Date(Date.now() + 86400000 * 2));
  const defaultCheckOut = searchParams.get('checkOut') || formatDateIso(new Date(Date.now() + 86400000 * 5));
  const defaultGuests = parseInt(searchParams.get('guests') || '1', 10);

  const [hotel, setHotel] = useState(null);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [isLoadingHotel, setIsLoadingHotel] = useState(true);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [error, setError] = useState(null);

  // Fetch hotel details once
  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  // Fetch room availability whenever dates or guests change
  useEffect(() => {
    if (checkIn && checkOut && checkOut > checkIn) {
      fetchAvailability();
    }
  }, [hotelId, checkIn, checkOut, guests]);

  const fetchHotelDetails = async () => {
    setIsLoadingHotel(true);
    setError(null);
    try {
      const response = await hotelApi.getHotelById(hotelId);
      const data = response && response.data !== undefined ? response.data : response;
      setHotel(data);
    } catch (err) {
      console.error('Failed to load hotel:', err);
      const errorMsg = err.data?.message || err.message || 'Hotel sanctuary not found or unavailable.';
      setError(errorMsg);
    } finally {
      setIsLoadingHotel(false);
    }
  };

  const fetchAvailability = async () => {
    setIsLoadingRooms(true);
    try {
      const response = await hotelApi.getHotelAvailability(hotelId, checkIn, checkOut, guests);
      const data = response && response.data !== undefined ? response.data : response;
      const roomList = Array.isArray(data) ? data : [];
      setRooms(roomList);
      // If previously selected room is no longer available, deselect it
      if (selectedRoom) {
        const stillAvail = roomList.find(r => r.roomId === selectedRoom.roomId && r.available);
        if (!stillAvail) setSelectedRoom(null);
      }
    } catch (err) {
      console.error('Failed to load room availability:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleDateRangeSelect = (newIn, newOut) => {
    setCheckIn(newIn);
    setCheckOut(newOut);
    setSelectedRoom(null);

    const nextParams = new URLSearchParams(searchParams);
    if (newIn) nextParams.set('checkIn', newIn);
    if (newOut) nextParams.set('checkOut', newOut);
    setSearchParams(nextParams);
  };

  const handleSelectRoom = (room) => {
    if (!room.available) return;
    setSelectedRoom(room);
  };

  const handleProceedToBooking = () => {
    if (!selectedRoom || !checkIn || !checkOut) return;
    const query = new URLSearchParams({
      hotelId: hotelId.toString(),
      roomId: selectedRoom.roomId.toString(),
      roomNumber: selectedRoom.roomNumber,
      roomTypeName: selectedRoom.roomTypeName,
      pricePerNight: selectedRoom.pricePerNight.toString(),
      checkIn,
      checkOut,
      guests: guests.toString()
    });
    navigate(`/booking?${query.toString()}`);
  };

  const nights = calculateNights(checkIn, checkOut);
  const availableRoomsCount = rooms.filter(r => r.available).length;

  if (isLoadingHotel) {
    return <LoadingSpinner message="Opening sanctuary doors..." />;
  }

  if (error || !hotel) {
    return (
      <div className="container" style={{ padding: '4rem 1rem' }}>
        <ErrorMessage
          title="Sanctuary Not Found"
          message={error || 'The requested hotel sanctuary does not exist.'}
          onRetry={fetchHotelDetails}
        />
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/hotels" className="btn btn-outline">
            Return to All Sanctuaries
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-ivory-light)', paddingBottom: '6rem' }}>
      {/* Back Link Breadcrumb */}
      <div style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-border-subtle)', padding: '0.85rem 0' }}>
        <div className="container">
          <Link
            to="/hotels"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-charcoal-soft)',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={15} /> Back to all Sanctuaries
          </Link>
        </div>
      </div>

      {/* Editorial Hero Gallery */}
      <section style={{ backgroundColor: 'var(--color-ivory)', borderBottom: '1px solid var(--color-border)', padding: '2.5rem 0 3.5rem 0' }}>
        <div className="container">
          {/* Header Info */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-brass">{images.tag}</span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--color-forest-dark)'
                }}>
                  <Star size={15} fill="var(--color-brass)" stroke="var(--color-brass)" />
                  <span>{hotel.starRating ? Number(hotel.starRating).toFixed(1) : '5.0'} Star Heritage</span>
                </div>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
                color: 'var(--color-forest-dark)',
                marginBottom: '0.5rem',
                lineHeight: 1.15
              }}>
                {hotel.name}
              </h1>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1.25rem',
                color: 'var(--color-charcoal-soft)',
                fontSize: '0.875rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={15} color="var(--color-terracotta)" />
                  {hotel.address || hotel.location}
                </span>
                {(hotel.phone || hotel.contactPhone) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} color="var(--color-brass-dark)" />
                    {hotel.phone || hotel.contactPhone}
                  </span>
                )}
                {(hotel.email || hotel.contactEmail) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} color="var(--color-brass-dark)" />
                    {hotel.email || hotel.contactEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Starting Price Header Card */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-border)',
              padding: '1.25rem 1.75rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'right'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sanctuary Rates From
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', justifyContent: 'flex-end' }}>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: 'var(--color-forest-dark)'
                }}>
                  {formatCurrency(hotel.startingPrice || hotel.roomTypes?.[0]?.basePrice)}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>/ night</span>
              </div>
            </div>
          </div>

          {/* Gallery Grid: 1 large hero + 2 side images */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1rem',
            height: '460px',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
              <img
                src={images.hero}
                alt={hotel.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '1rem', height: '100%' }}>
              <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                <img
                  src={images.gallery[0]}
                  alt="Gallery 1"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                <img
                  src={images.gallery[1]}
                  alt="Gallery 2"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="container" style={{ marginTop: '3.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '3rem',
          alignItems: 'start'
        }}>
          {/* Left Column: Description, Amenities, Room Types, Physical Rooms */}
          <div>
            {/* About */}
            <div style={{
              backgroundColor: 'var(--color-white)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                color: 'var(--color-forest-dark)',
                marginBottom: '1rem'
              }}>
                About the Sanctuary
              </h2>
              <p style={{
                color: 'var(--color-charcoal-soft)',
                fontSize: '1rem',
                lineHeight: 1.8,
                marginBottom: '2rem'
              }}>
                {hotel.description}
              </p>

              {/* Amenities List */}
              <h3 style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-forest-dark)',
                marginBottom: '1rem'
              }}>
                Distinctive Amenities & Offerings
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.85rem'
              }}>
                {hotel.amenities && hotel.amenities.map((amenity, idx) => {
                  const amenityName = typeof amenity === 'object' && amenity !== null ? amenity.name : amenity;
                  const amenityKey = typeof amenity === 'object' && amenity?.id != null ? amenity.id : idx;
                  const amenityDesc = typeof amenity === 'object' && amenity?.description ? amenity.description : undefined;

                  return (
                    <div
                      key={amenityKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--color-ivory)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        color: 'var(--color-forest-dark)',
                        fontWeight: 500
                      }}
                      title={amenityDesc}
                    >
                      <Sparkles size={14} color="var(--color-brass-dark)" />
                      <span>{amenityName}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Room Types Overview */}
            {hotel.roomTypes && hotel.roomTypes.length > 0 && (
              <div style={{
                backgroundColor: 'var(--color-white)',
                padding: '2.5rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                marginBottom: '2.5rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h2 style={{
                  fontSize: '1.75rem',
                  color: 'var(--color-forest-dark)',
                  marginBottom: '1.5rem'
                }}>
                  Suite Categories
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {hotel.roomTypes.map((rt) => (
                    <div
                      key={rt.id}
                      style={{
                        padding: '1.5rem',
                        border: '1px solid var(--color-border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        backgroundColor: 'var(--color-ivory-light)'
                      }}
                    >
                      <div style={{ maxWidth: '420px' }}>
                        <h4 style={{ fontSize: '1.25rem', color: 'var(--color-forest-dark)', marginBottom: '0.35rem' }}>
                          {rt.name}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-charcoal-soft)', marginBottom: '0.75rem' }}>
                          {rt.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Users size={14} /> Max {rt.maxOccupancy} Guests
                          </span>
                          {rt.bedType && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Bed size={14} /> {rt.bedType}
                            </span>
                          )}
                          {rt.roomSizeSqm && (
                            <span>• {rt.roomSizeSqm} m²</span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block' }}>Base Rate</span>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-forest-dark)' }}>
                          {formatCurrency(rt.basePrice)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>per night</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Physical Rooms Section */}
            <div id="physical-rooms-section" style={{
              backgroundColor: 'var(--color-white)',
              padding: '2.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: 'var(--color-forest-dark)', margin: 0 }}>
                    Physical Suites Available
                  </h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-soft)', marginTop: '0.25rem', display: 'block' }}>
                    Select a verified physical room key for {checkIn} to {checkOut} ({nights} {nights === 1 ? 'night' : 'nights'}).
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label htmlFor="guests-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-charcoal)' }}>
                    Guests:
                  </label>
                  <select
                    id="guests-select"
                    className="form-select"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                    style={{ padding: '0.4rem 0.8rem', width: 'auto' }}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4+ Guests</option>
                  </select>
                </div>
              </div>

              {isLoadingRooms ? (
                <LoadingSpinner message="Checking real-time physical room availability & row locks..." />
              ) : rooms.length === 0 ? (
                <div style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <Info size={32} color="var(--color-brass-dark)" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: 'var(--color-charcoal)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    No physical rooms matching your guest occupancy ({guests} {guests === 1 ? 'guest' : 'guests'}).
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
                    Try reducing the requested guest count or adjusting your stay dates.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.roomId}
                      room={room}
                      nights={nights}
                      onSelectRoom={handleSelectRoom}
                      isSelected={selectedRoom?.roomId === room.roomId}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Availability Calendar & Booking Action Panel */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <AvailabilityCalendar
              checkIn={checkIn}
              checkOut={checkOut}
              onDateRangeSelect={handleDateRangeSelect}
              availableRoomsCount={availableRoomsCount}
              totalRoomsCount={rooms.length}
              isLoading={isLoadingRooms}
            />

            {/* Selected Room Booking Action Card */}
            {selectedRoom && (
              <div style={{
                backgroundColor: 'var(--color-white)',
                border: '2px solid var(--color-forest)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem',
                marginTop: '1.5rem',
                boxShadow: 'var(--shadow-hover)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>
                  <CheckCircle size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ready for Reservation
                  </span>
                </div>

                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-forest-dark)', marginBottom: '0.25rem' }}>
                  Room {selectedRoom.roomNumber} – {selectedRoom.roomTypeName}
                </h4>

                <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-soft)', marginBottom: '1.25rem' }}>
                  {nights} {nights === 1 ? 'Night' : 'Nights'} ({checkIn} → {checkOut})
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--color-ivory)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)' }}>Total Stay Price:</span>
                  <span style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--color-terracotta)'
                  }}>
                    {formatCurrency(Number(selectedRoom.pricePerNight) * nights)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBooking}
                  className="btn btn-terracotta"
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
                >
                  Proceed to Secure Guest Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
