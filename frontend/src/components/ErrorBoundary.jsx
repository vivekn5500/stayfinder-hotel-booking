import React from 'react';
import { Compass, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('StayFinder Error Boundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1rem',
          backgroundColor: 'var(--color-ivory-light)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            padding: '2.5rem',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <Compass size={28} />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--color-forest-dark)',
              marginBottom: '0.75rem'
            }}>
              Unable to Display Sanctuary View
            </h2>

            <p style={{
              color: 'var(--color-charcoal-soft)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              marginBottom: '1.75rem'
            }}>
              {this.state.error?.message || 'A presentation error occurred while rendering the hotel view.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={15} />
                <span>Reload Page</span>
              </button>
              <a href="/hotels" className="btn btn-outline">
                All Sanctuaries
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
