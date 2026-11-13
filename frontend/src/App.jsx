import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import HotelSearchPage from './pages/HotelSearchPage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import ReservationsPage from './pages/ReservationsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { Compass } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <div style={{
      padding: '8rem 1rem',
      textAlign: 'center',
      backgroundColor: 'var(--color-ivory-light)',
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
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
        marginBottom: '1.5rem'
      }}>
        <Compass size={28} />
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-forest-dark)', marginBottom: '0.75rem' }}>
        Sanctuary Page Not Found
      </h1>
      <p style={{ color: 'var(--color-charcoal-soft)', fontSize: '1rem', maxWidth: '480px', marginBottom: '2rem' }}>
        The path you sought does not exist or has been shifted in our directory.
      </p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: '1 0 auto' }}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/hotels" element={<HotelSearchPage />} />
              <Route path="/hotels/search" element={<HotelSearchPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/booking/confirmed/:reference" element={<BookingConfirmationPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
