import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorMessage({
  title = 'Unable to Load Content',
  message = 'An unexpected error occurred while communicating with the StayFinder service.',
  onRetry = null,
}) {
  return (
    <div style={{
      maxWidth: '640px',
      margin: '2.5rem auto',
      padding: '2rem',
      backgroundColor: 'var(--color-white)',
      border: '1px solid var(--color-error)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-subtle)',
      textAlign: 'center'
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
        margin: '0 auto 1.25rem'
      }}>
        <AlertCircle size={26} />
      </div>

      <h3 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.4rem',
        color: 'var(--color-forest-dark)',
        marginBottom: '0.5rem'
      }}>
        {title}
      </h3>

      <p style={{
        color: 'var(--color-charcoal-soft)',
        fontSize: '0.925rem',
        lineHeight: 1.6,
        marginBottom: onRetry ? '1.5rem' : 0
      }}>
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-outline"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.5rem',
            fontSize: '0.875rem'
          }}
        >
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
