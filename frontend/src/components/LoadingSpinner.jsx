import React from 'react';
import { Compass } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading StayFinder sanctuaries...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1rem',
      textAlign: 'center',
      minHeight: '260px'
    }}>
      <div style={{
        position: 'relative',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid rgba(197, 165, 114, 0.2)',
          borderTopColor: 'var(--color-brass-dark)',
          animation: 'spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
        }} />
        <Compass size={24} color="var(--color-forest)" style={{ opacity: 0.85 }} />
      </div>
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.15rem',
        color: 'var(--color-forest-dark)',
        letterSpacing: '0.02em',
        margin: 0
      }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
