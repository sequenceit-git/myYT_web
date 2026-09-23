import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Wallet,
  Smartphone,
  HelpCircle,
  Sparkles,
  Users,
} from 'lucide-react';

interface TelegramSupportWidgetProps {
  supportUsername?: string;
  channelUsername?: string;
  groupUsername?: string;
}

export const TelegramSupportWidget: React.FC<TelegramSupportWidgetProps> = ({
  supportUsername = 'ytcash_support',
  channelUsername = 'ytcash_official',
  groupUsername = 'ytcash_group',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [hasNewBadge, setHasNewBadge] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Open specific Telegram link
  const openTelegramChat = (prefillText?: string) => {
    let url = `https://t.me/${supportUsername}`;
    if (prefillText && prefillText.trim()) {
      url += `?text=${encodeURIComponent(prefillText.trim())}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    openTelegramChat(customMsg);
    setCustomMsg('');
  };

  const quickTopics = [
    {
      label: 'Deposit Issue',
      icon: CreditCard,
      prompt: 'Hi, I need help with verifying my deposit on ytCash.',
    },
    {
      label: 'Withdrawal Status',
      icon: Wallet,
      prompt: 'Hi, I have a question regarding my withdrawal request on ytCash.',
    },
    {
      label: 'Android App Help',
      icon: Smartphone,
      prompt: 'Hi, I need assistance setting up the ytCash Android mobile app and permissions.',
    },
    {
      label: 'Campaign Question',
      icon: Sparkles,
      prompt: 'Hi, I would like more information about running YouTube campaigns on ytCash.',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9990,
        fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* -------------------------------------------------------------
          TELEGRAM SUPPORT POPUP OVERLAY CARD
          ------------------------------------------------------------- */}
      {isOpen && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            bottom: 72,
            right: 0,
            width: 'min(370px, calc(100vw - 32px))',
            background: '#ffffff',
            borderRadius: 20,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(14, 165, 233, 0.18)',
            overflow: 'hidden',
            animation: 'ytCashPopIn 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)',
              padding: '18px 18px 16px',
              color: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              aria-label="Close Support"
            >
              <X size={15} />
            </button>

            {/* Support Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  flexShrink: 0,
                }}
              >
                {/* Official Telegram Plane Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.48-.42-1.42-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.24-3.55 3.93-1.63 4.74-1.92 5.28-1.93.12 0 .38.03.55.17.14.12.18.28.2.45-.02.07-.02.16-.04.27z"
                    fill="#0284c7"
                  />
                </svg>
              </div>

              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.2 }}>
                  ytCash Support
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.73rem',
                    color: '#bae6fd',
                    marginTop: 3,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                      display: 'inline-block',
                    }}
                  />
                  <span>Online • Instant Help via Telegram</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div style={{ padding: '16px 16px 14px', maxHeight: '68vh', overflowY: 'auto' }}>
            {/* Friendly Greeting Card */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '10px 12px',
                fontSize: '0.8rem',
                color: '#334155',
                lineHeight: 1.45,
                marginBottom: 14,
              }}
            >
              👋 Welcome! Need quick help with your deposit, payout, or the mobile app? Connect directly with our official support team.
            </div>

            {/* Quick Topic Chips */}
            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748b',
                  marginBottom: 8,
                }}
              >
                Frequent Assistance Topics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {quickTopics.map((topic, idx) => {
                  const IconComp = topic.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => openTelegramChat(topic.prompt)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        padding: '8px 10px',
                        borderRadius: 10,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#0284c7';
                        e.currentTarget.style.background = '#f0f9ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <IconComp size={13} color="#0284c7" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {topic.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button: Open Telegram Support */}
            <button
              onClick={() => openTelegramChat()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                transition: 'all 0.18s ease',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(2, 132, 199, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.35)';
              }}
            >
              <span>Chat with Support on Telegram</span>
              <ExternalLink size={15} />
            </button>

            {/* Community Telegram Group */}
            <button
              onClick={() => window.open(`https://t.me/${groupUsername}`, '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 11,
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(14, 165, 233, 0.22)',
                transition: 'all 0.15s ease',
                marginBottom: 8,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(14, 165, 233, 0.22)';
              }}
            >
              <Users size={15} />
              <span>Join Telegram Group (@{groupUsername})</span>
              <ExternalLink size={13} style={{ marginLeft: 'auto', opacity: 0.8 }} />
            </button>

            {/* Secondary Action: Community Channel */}
            <button
              onClick={() => window.open(`https://t.me/${channelUsername}`, '_blank', 'noopener,noreferrer')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #e2e8f0',
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: 14,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <span>Official Channel (@{channelUsername})</span>
              <ExternalLink size={12} style={{ opacity: 0.6 }} />
            </button>

            {/* Quick Message Input Box (Direct Send to TG) */}
            <form onSubmit={handleSendCustomMessage} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 12,
                  padding: '4px 6px 4px 12px',
                  gap: 8,
                  transition: 'border-color 0.2s',
                }}
              >
                <input
                  type="text"
                  placeholder="Type a message or issue..."
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.8rem',
                    color: '#0f172a',
                  }}
                />
                <button
                  type="submit"
                  disabled={!customMsg.trim()}
                  style={{
                    background: customMsg.trim() ? '#0284c7' : '#94a3b8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 9,
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: customMsg.trim() ? 'pointer' : 'default',
                    transition: 'background 0.2s',
                  }}
                  title="Send via Telegram"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>

            {/* Security Guarantee Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.7rem',
                color: '#64748b',
                justifyContent: 'center',
                paddingTop: 4,
              }}
            >
              <ShieldCheck size={13} color="#059669" />
              <span>Official Support. We never ask for passwords.</span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          FLOATING BOTTOM-RIGHT TRIGGER BUTTON
          ------------------------------------------------------------- */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNewBadge(false);
        }}
        aria-label="Open Telegram Support"
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(2, 132, 199, 0.55)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.45)';
        }}
      >
        {isOpen ? (
          <X size={24} color="#ffffff" strokeWidth={2.5} />
        ) : (
          <>
            {/* Telegram Official Logo */}
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.05-.49-.83-.27-1.48-.42-1.42-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.24-3.55 3.93-1.63 4.74-1.92 5.28-1.93.12 0 .38.03.55.17.14.12.18.28.2.45-.02.07-.02.16-.04.27z"
                fill="#ffffff"
              />
            </svg>

            {/* Pulsing Active Indicator Dot */}
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #ffffff',
                boxShadow: '0 0 6px #10b981',
              }}
            />

            {/* Notification Badge / "Support" Tooltip on cold load */}
            {hasNewBadge && (
              <span
                style={{
                  position: 'absolute',
                  right: 62,
                  background: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '4px 9px',
                  borderRadius: 8,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  pointerEvents: 'none',
                }}
              >
                <span>Live Support</span>
              </span>
            )}
          </>
        )}
      </button>

      {/* Embedded Animation Keyframe */}
      <style>{`
        @keyframes ytCashPopIn {
          0% {
            opacity: 0;
            transform: scale(0.92) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
