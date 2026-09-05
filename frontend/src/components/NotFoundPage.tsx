import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Home, PlaySquare, Sparkles, ArrowLeft, ShieldAlert, Compass } from 'lucide-react';
import { User } from '../types';

interface NotFoundPageProps {
  user?: User | null;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient neon orbs */}
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(255,255,255,0) 70%)',
          top: '15%',
          left: '10%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(255,255,255,0) 70%)',
          bottom: '15%',
          right: '10%',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card"
        style={{
          maxWidth: 640,
          width: '100%',
          padding: '48px 36px',
          borderRadius: 24,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          border: '1.5px solid rgba(14, 165, 233, 0.25)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Futuristic 404 Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 9999,
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            color: 'var(--primary-neon)',
            fontSize: '0.82rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          <ShieldAlert size={16} />
          Error 404 • Lost in Cyberspace
        </div>

        {/* Large 404 Graphic */}
        <div
          className="font-display"
          style={{
            fontSize: 'clamp(4.5rem, 12vw, 7rem)',
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: '-0.03em',
            margin: '0 0 10px',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 6px 18px rgba(14, 165, 233, 0.25))',
          }}
        >
          404
        </div>

        {/* Heading */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.85rem)',
            color: '#0f172a',
            margin: '0 0 12px',
            fontWeight: 800,
          }}
        >
          Page Not Found
        </h1>

        {/* Descriptive Body */}
        <p
          style={{
            color: '#64748b',
            fontSize: '0.96rem',
            lineHeight: 1.6,
            maxWidth: 480,
            margin: '0 auto 32px',
          }}
        >
          The link you followed might be broken, expired, or the page may have been moved to another coordinate in our ecosystem.
        </p>

        {/* Primary CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-neon glow-neon"
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Home size={17} /> Return Home
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            style={{
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        {/* Quick Portal Shortcuts */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '0.74rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#94a3b8',
              fontWeight: 700,
            }}
          >
            Popular Destinations
          </span>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <Link
              to="/simulator"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <PlaySquare size={15} color="var(--primary-neon)" /> Watch & Earn
            </Link>

            <Link
              to="/buy-views"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={15} color="#10b981" /> Buy YouTube Views
            </Link>

            {user && (
              <Link
                to={user.role === 'campaigner' ? '/creator' : '/viewer'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Compass size={15} color="#6366f1" /> My Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
