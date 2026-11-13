import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Compass, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, RotateCcw } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { hotelApi } from '../api/hotelApi';

export default function HotelSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const locationQuery = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1', 10);
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [hotels, setHotels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state if URL query params change
  useEffect(() => {
    setCurrentPage(pageParam);
  }, [pageParam]);

  useEffect(() => {
    fetchHotels();
  }, [locationQuery, currentPage]);

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (locationQuery.trim()) {
        response = await hotelApi.searchHotels(locationQuery.trim(), currentPage, 6);
      } else {
        response = await hotelApi.getAllHotels(currentPage, 6);
      }

      // Safely extract Spring Data Page data whether wrapped in response.data or unwrapped
      const pageData = response && response.data !== undefined ? response.data : response;
      const hotelList = Array.isArray(pageData) ? pageData : (pageData?.content || []);
      const total = typeof pageData?.totalElements === 'number' ? pageData.totalElements : hotelList.length;
      const pages = typeof pageData?.totalPages === 'number' ? pageData.totalPages : 1;
      const pageNum = typeof pageData?.number === 'number' ? pageData.number : currentPage;

      setHotels(hotelList);
      setTotalPages(pages);
      setTotalElements(total);
      setCurrentPage(pageNum);
    } catch (err) {
      console.error('Error fetching hotel catalog:', err);
      const errorMsg = err.data?.message || err.message || 'Failed to fetch hotels. Please check backend connection.';
      setError(errorMsg);
      setHotels([]);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', newPage.toString());
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <div style={{ backgroundColor: 'var(--color-ivory-light)', minHeight: '80vh', padding: '3rem 0 6rem 0' }}>
      <div className="container">
        {/* Top Header & Search Filter Bar */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-brass-dark)',
              display: 'block',
              marginBottom: '0.25rem'
            }}>
              Curated Portfolio
            </span>
            <h1 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: 'var(--color-forest-dark)',
              margin: 0
            }}>
              {locationQuery ? `Sanctuaries in "${locationQuery}"` : 'All Curated Sanctuaries'}
            </h1>
          </div>

          <SearchBar
            initialLocation={locationQuery}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
            initialGuests={guests}
            compact={true}
          />
        </div>

        {/* Results Bar */}
        {!isLoading && !error && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '2rem',
            fontSize: '0.875rem'
          }}>
            <div style={{ color: 'var(--color-charcoal-soft)' }}>
              Showing{' '}
              <strong style={{ color: 'var(--color-forest-dark)' }}>
                {hotels.length}
              </strong>{' '}
              of{' '}
              <strong style={{ color: 'var(--color-forest-dark)' }}>
                {totalElements}
              </strong>{' '}
              verified sanctuaries
              {locationQuery && (
                <span> for <em style={{ fontStyle: 'normal', color: 'var(--color-terracotta)', fontWeight: 600 }}>"{locationQuery}"</em></span>
              )}
            </div>

            {locationQuery && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-subtle"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={14} /> Clear Destination Filter
              </button>
            )}
          </div>
        )}

        {/* Content Section */}
        {isLoading ? (
          <LoadingSpinner message="Consulting live inventory and rates..." />
        ) : error ? (
          <ErrorMessage
            title="Unable to Load Stays"
            message={error}
            onRetry={fetchHotels}
          />
        ) : hotels.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '2rem auto'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-ivory)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brass-dark)',
              margin: '0 auto 1.5rem auto'
            }}>
              <Compass size={28} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--color-forest-dark)',
              marginBottom: '0.75rem'
            }}>
              No Sanctuaries Found in This Region
            </h3>
            <p style={{
              color: 'var(--color-charcoal-soft)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}>
              We couldn't locate active sanctuaries matching "{locationQuery}". Our curated collection currently features properties across Goa, Jaipur, Mumbai, Manali and Alleppey.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-primary"
            >
              Explore All 5 Sanctuaries
            </button>
          </div>
        ) : (
          <>
            {/* Hotel Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '2rem',
              marginBottom: '3.5rem'
            }}>
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  guests={guests}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '3rem'
              }}>
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePageChange(index)}
                      className={`btn ${currentPage === index ? 'btn-primary' : 'btn-subtle'}`}
                      style={{
                        minWidth: '38px',
                        height: '38px',
                        padding: 0,
                        fontSize: '0.85rem'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="btn btn-outline"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
