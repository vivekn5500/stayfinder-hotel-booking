import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Shield, ArrowRight, MapPin, CheckCircle, Bed, Award } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { hotelApi } from '../api/hotelApi';

export default function HomePage() {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedHotels();
  }, []);

  const fetchFeaturedHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await hotelApi.getAllHotels(0, 6);
      const pageData = response && response.data !== undefined ? response.data : response;
      const hotelList = Array.isArray(pageData) ? pageData : (pageData?.content || []);
      setHotels(hotelList);
    } catch (err) {
      console.error('Failed to load featured hotels:', err);
      const errorMsg = err.data?.message || err.message || 'Unable to retrieve featured sanctuaries. Please verify backend connection.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const destinations = [
    {
      name: 'Goa',
      tagline: 'Coastal Havens & Azure Shores',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      description: 'Private oceanfront suites nestled between sway of palms and serene Arabian sea waves.'
    },
    {
      name: 'Jaipur',
      tagline: 'Royal Havelis & Courtyard Palaces',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      description: 'Grand Rajput architecture, intricate jharokhas, and timeless royal hospitality.'
    },
    {
      name: 'Mumbai',
      tagline: 'Metropolitan Luxury & Skyline Vistas',
      image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
      description: 'Sophisticated coastal sanctuary in the heart of the bustling financial capital.'
    },
    {
      name: 'Manali',
      tagline: 'Pine-Fringed Himalayan Retreats',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
      description: 'Cedar wood cabins overlooking snowcapped Himalayan peaks and pristine pine forests.'
    },
    {
      name: 'Alleppey',
      tagline: 'Backwater Houseboats & Lagoons',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      description: 'Slow living along emerald canals and palm-fringed Kerala waterways.'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 0 7rem 0',
        backgroundColor: 'var(--color-ivory)',
        borderBottom: '1px solid var(--color-border-subtle)',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative background watermarks */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197, 165, 114, 0.08) 0%, rgba(250, 248, 245, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-white)',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <Sparkles size={14} color="var(--color-brass-dark)" />
              <span style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                color: 'var(--color-forest-dark)'
              }}>
                Curated Indian Sanctuaries
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              lineHeight: 1.15,
              color: 'var(--color-forest-dark)',
              marginBottom: '1.5rem',
              fontWeight: 700
            }}>
              Sanctuaries of Stillness, Heritage & Refinement.
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'var(--color-charcoal-soft)',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto'
            }}>
              Discover handpicked architectural escapes across India's most evocative landscapes. Guaranteed physical room allocation backed by database-level concurrency protection.
            </p>
          </div>

          {/* Floating Search Bar */}
          <div style={{ transform: 'translateY(1.5rem)' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Stays Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-ivory-light)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            <div>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-brass-dark)',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Handcrafted Portfolio
              </span>
              <h2 style={{
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                color: 'var(--color-forest-dark)'
              }}>
                Featured Sanctuaries
              </h2>
            </div>
            <Link
              to="/hotels"
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <span>Explore All Stays</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Curating verified stays across India..." />
          ) : error ? (
            <ErrorMessage
              title="Unable to load stays"
              message={error}
              onRetry={fetchFeaturedHotels}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '2rem'
            }}>
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Destinations Showcase */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: 'var(--color-forest-dark)',
        color: 'var(--color-ivory-light)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--color-brass)',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Inspiring Enclaves
            </span>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--color-ivory)',
              marginBottom: '1rem'
            }}>
              Journey by Destination
            </h2>
            <p style={{ color: 'rgba(250, 248, 245, 0.75)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Whether you seek the tranquil backwaters of Kerala or the snowclad peaks of Himachal, our stays offer singular hospitality.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem'
          }}>
            {destinations.map((dest) => (
              <Link
                key={dest.name}
                to={`/hotels/search?location=${encodeURIComponent(dest.name)}`}
                style={{
                  position: 'relative',
                  height: '340px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'all var(--transition-normal)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                    filter: 'brightness(0.75)'
                  }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(17, 38, 29, 0.95) 0%, rgba(17, 38, 29, 0.2) 60%, transparent 100%)'
                }} />

                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-brass)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    <MapPin size={12} />
                    <span>Explore Enclave</span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    color: 'var(--color-white)',
                    marginBottom: '0.35rem'
                  }}>
                    {dest.name}
                  </h3>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'rgba(250, 248, 245, 0.8)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {dest.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* The StayFinder Philosophy / Pillars */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-ivory)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem auto' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-brass-dark)',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              Engineering Integrity
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', color: 'var(--color-forest-dark)' }}>
              The StayFinder Standard
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem'
          }}>
            <div style={{
              backgroundColor: 'var(--color-white)',
              padding: '2.5rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-forest-soft)',
                color: 'var(--color-forest-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Bed size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
                Physical Room Allocation
              </h3>
              <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Unlike generic booking engines that deal in abstract categories, StayFinder reserves actual physical inventory (e.g. Room 101, Villa 302) with strict half-open date interval validation.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-white)',
              padding: '2.5rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(197, 165, 114, 0.15)',
                color: 'var(--color-brass-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
                Pessimistic Concurrency
              </h3>
              <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Our database backend acquires row-level locks on room allocation during transaction processing, eliminating race conditions and double-booking risks under heavy traffic.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--color-white)',
              padding: '2.5rem 2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-subtle)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(194, 103, 71, 0.12)',
                color: 'var(--color-terracotta)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
                Zero Hidden Surprises
              </h3>
              <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Every reservation generates a deterministic reference code (`SF-YYYYMM-XXXXXX`), calculates prices through high-precision backend arithmetic, and permits hassle-free cancellation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation Management Callout */}
      <section style={{
        padding: '5rem 0',
        backgroundColor: 'var(--color-white)',
        borderTop: '1px solid var(--color-border-subtle)'
      }}>
        <div className="container">
          <div style={{
            backgroundColor: 'var(--color-ivory)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            padding: '3.5rem 2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem'
          }}>
            <div style={{ maxWidth: '580px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-terracotta)',
                display: 'block',
                marginBottom: '0.5rem'
              }}>
                Instant Management
              </span>
              <h3 style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                color: 'var(--color-forest-dark)',
                marginBottom: '0.75rem'
              }}>
                Already have a reservation?
              </h3>
              <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Retrieve your stay details, view assigned room specifics, print booking confirmations, or cancel your booking instantly using your reference code or guest email.
              </p>
            </div>
            <div>
              <Link
                to="/reservations"
                className="btn btn-primary"
                style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}
              >
                Look Up My Booking
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
