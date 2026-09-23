import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  DollarSign,
  Lock,
  ArrowLeft,
  ExternalLink,
  Users,
  Eye,
  Scale,
  Ban,
  HelpCircle,
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'overview', label: '1. Platform Overview', icon: FileText },
    { id: 'awareness', label: '2. Platform Awareness & Rules', icon: AlertTriangle },
    { id: 'viewers', label: '3. Viewer Terms & Earning Policy', icon: Smartphone },
    { id: 'campaigners', label: '4. Campaigner & View Promotion', icon: Eye },
    { id: 'financial', label: '5. Deposits & Withdrawals', icon: DollarSign },
    { id: 'security', label: '6. Anti-Fraud & Single-Device Lock', icon: ShieldCheck },
    { id: 'disclaimer', label: '7. YouTube & Third-Party Disclaimer', icon: Scale },
    { id: 'banpolicy', label: '8. Suspicious Activity & User Ban Policy', icon: Ban },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        padding: '36px 16px 80px',
        fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {/* Back Link */}
        <div style={{ marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#0284c7',
              textDecoration: 'none',
              background: '#ffffff',
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: 24,
            padding: '36px 32px',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.35)',
              padding: '4px 12px',
              borderRadius: 9999,
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}
          >
            <Scale size={13} /> Legal Agreement & Guidelines
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: '0 0 10px 0',
              color: '#ffffff',
            }}
          >
            Terms of Service & Platform Awareness
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '0.95rem',
              maxWidth: 680,
              lineHeight: 1.6,
              margin: '0 0 16px 0',
            }}
          >
            Welcome to <strong style={{ color: '#38bdf8' }}>ytCash</strong>. These terms govern your rights and obligations when using the ytCash Web Platform and the companion Android mobile application. Please read them thoroughly to ensure transparent, compliant, and safe usage.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: '0.78rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
            }}
          >
            <span>• Last Updated: <strong style={{ color: '#f8fafc' }}>September 2026</strong></span>
            <span>• Applicable Domain: <strong style={{ color: '#38bdf8' }}>ytcash.pro</strong></span>
            <span>• Compliance: <strong style={{ color: '#f8fafc' }}>Global Fair Exchange Standards</strong></span>
          </div>
        </div>

        {/* Quick Awareness Callout Pill */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.84rem', color: '#78350f', lineHeight: 1.55 }}>
            <strong style={{ color: '#92400e', display: 'block', fontSize: '0.88rem', marginBottom: 2 }}>
              Critical Awareness Notice: Strict Single-Device & Genuine Human Playback Policy
            </strong>
            ytCash enforces an automated anti-cheat engine. Each user account is permitted on <strong>only ONE physical Android device</strong> at a time. The use of emulators, virtual spaces, auto-clickers, multi-instance cloners, or automated headless scripts is strictly prohibited and results in immediate automated account suspension and loss of accumulated balances.
          </div>
        </div>

        {/* Table of Contents Quick Nav */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 8,
            marginBottom: 28,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {sections.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '7px 14px',
                borderRadius: 9999,
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.color = '#0284c7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <sec.icon size={13} color="#0284c7" />
              <span>{sec.label}</span>
            </a>
          ))}
        </div>

        {/* Layout: Sidebar Nav + Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 32 }}>
          {/* Main Document Body */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Section 1: Overview */}
            <div
              id="overview"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  1. Platform Overview & Acceptance
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  <strong>ytCash</strong> operates as a bidirectional YouTube engagement exchange connecting digital content creators seeking authentic audience engagement with real worldwide viewers who receive micro-incentives for dedicating verified watch retention.
                </p>
                <p>
                  By creating an account, depositing campaign funds, or installing and logging into the ytCash companion mobile application, you explicitly confirm that you are at least 18 years of age (or have reached the legal age of majority in your jurisdiction) and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </div>

            {/* Section 2: Platform Awareness & Rules */}
            <div
              id="awareness"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  2. Platform Awareness & Integrity Guidelines
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <p>
                  To protect content creators' channels and maintain algorithmic safety, ytCash is engineered around authentic human behavior:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <CheckCircle2 size={16} color="#059669" /> Native App Playback
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      All video playback takes place strictly inside the official YouTube application on physical Android smartphones. No web scraping or headless players are used.
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <CheckCircle2 size={16} color="#059669" /> Real Watch Retention
                    </strong>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Watch timers only decrement while the video is actively streaming, unmuted, and not playing an interstitial advertisement.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Viewer Terms */}
            <div
              id="viewers"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#dcfce7',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Smartphone size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  3. Viewer Terms & Earning Policies
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  As a viewer on ytCash, you agree to:
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Maintain only <strong>one user account</strong> per person and per household.</li>
                  <li>Execute watch tasks solely on certified physical Android hardware with active Google Play Services.</li>
                  <li>Grant the required system overlay and accessibility permissions exclusively used for playback state detection.</li>
                  <li>Accept that rewards are credited dynamically upon server-side cryptographic verification of watch duration.</li>
                </ul>

                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 12,
                    padding: '12px 16px',
                    color: '#991b1b',
                    fontSize: '0.82rem',
                    marginTop: 6,
                  }}
                >
                  <strong>Zero-Tolerance Evasion:</strong> Any attempt to modify client code, simulate touch inputs, run Android emulators (Bluestacks, LDPlayer, Nox), or use datacenter proxy networks will result in an immediate permanent ban without notice.
                </div>
              </div>
            </div>

            {/* Section 4: Campaigners */}
            <div
              id="campaigners"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Eye size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  4. Campaigner & Content Promotion Terms
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  Content creators using ytCash to promote YouTube videos agree to the following standards:
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Submitted videos must be public, embedding-permitted, and free of geo-blocks or age-restrictions that would prevent playback.</li>
                  <li>Content must strictly comply with YouTube Community Guidelines. Content depicting violence, hate speech, scams, phishing, or illegal acts is strictly forbidden and deleted immediately without refund.</li>
                  <li>Campaigns run until the requested view budget is exhausted. Campaigners can pause, resume, or adjust campaign pacing at any time via the Creator Studio.</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Financial */}
            <div
              id="financial"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DollarSign size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  5. Deposits, Withdrawals & Wallet Policy
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  <strong>Withdrawals:</strong> Viewers can request withdrawals once their available earnings reach the minimum threshold of <strong>$0.20 USD</strong>.
                </p>
                <p>
                  Payouts are supported across domestic mobile financial services (<strong>bKash, Nagad</strong>) and international rails (<strong>Payeer, FaucetPay, WebMoney, Crypto USDT BEP-20</strong>). Withdrawal requests are audited by automated anti-cheat checks and processed rapidly.
                </p>
                <p>
                  <strong>Deposits:</strong> Campaign deposits are credited after transaction verification (TrxID / blockchain confirmation). Deposited creator funds are earmarked for YouTube advertising and cannot be withdrawn as cash.
                </p>
              </div>
            </div>

            {/* Section 6: Anti-Fraud & Single Device */}
            <div
              id="security"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fee2e2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  6. Anti-Fraud & Single-Device Security Lock
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  To maintain fair rewards and authentic traffic for advertisers, our system binds each viewer account to a single mobile hardware identifier:
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Logging in on a second mobile phone will prompt a device session conflict. Transferring sessions to a new phone automatically invalidates the prior phone's session.</li>
                  <li>Our backend maintains high-frequency heartbeat telemetry (every 20s). Accounts that attempt concurrent multi-phone watch streams will have their tasks locked.</li>
                  <li>All communication between the Android app and central servers is encrypted using 256-bit TLS/SSL endpoints.</li>
                </ul>
              </div>
            </div>

            {/* Section 7: Third-Party Disclaimer */}
            <div
              id="disclaimer"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#f1f5f9',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Scale size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  7. YouTube & Third-Party Trademark Disclaimer
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p>
                  <strong>ytCash</strong> is an independent service provided for content creator promotion and peer view-exchange. ytCash is <strong>not endorsed by, affiliated with, sponsored by, or associated with YouTube, LLC, Google LLC, or Alphabet Inc.</strong>
                </p>
                <p>
                  "YouTube" and the YouTube logo are registered trademarks of Google LLC. All other trademarks, service marks, and company names are the property of their respective owners.
                </p>
                <p>
                  Users must at all times comply with the third-party platforms they interact with, including the{' '}
                  <a
                    href="https://www.youtube.com/t/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    YouTube Terms of Service
                  </a>{' '}
                  and Google Privacy Policy.
                </p>
              </div>
            </div>

            {/* Section 8: Suspicious Activity & User Ban Policy */}
            <div
              id="banpolicy"
              style={{
                background: '#ffffff',
                border: '1.5px solid #fecaca',
                borderRadius: 20,
                padding: '28px 26px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ban size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#991b1b' }}>
                  8. Suspicious Activity & User Ban Policy
                </h2>
              </div>

              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: 12,
                    padding: '16px 18px',
                    fontSize: '0.90rem',
                    color: '#991b1b',
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  The ytCash team reserves the right to suspend or permanently ban any user without prior notice if the user is found to be engaging in suspicious, fraudulent, abusive, or otherwise prohibited activities. The team may take such action whenever it reasonably believes that a user’s activity may compromise the platform’s security, integrity, or fair use.
                </div>

                <p>
                  Activities that trigger automatic security flags, immediate suspension, or permanent account forfeiture include, but are not limited to:
                </p>
                <ul style={{ margin: '0 0 0 20px', padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Simulating automated playback via headless scrapers, auto-clickers, macros, or bot scripts.</li>
                  <li>Running ytCash on virtual Android instances, rooted emulators, or multi-space application cloners.</li>
                  <li>Operating multiple cloned accounts on a single physical mobile device or coordinating fake referral rings.</li>
                  <li>Submitting fabricated, duplicate, or falsified transaction receipts during deposit and withdrawal processing.</li>
                  <li>Attempting to tamper with watch verification countdown timers or manipulating server-authoritative tokens.</li>
                </ul>

                <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4 }}>
                  Any account suspended or terminated under this policy shall immediately forfeit all accumulated reward balances, pending cashouts, and platform privileges. Administrative decisions made under this policy are final.
                </p>
              </div>
            </div>

            {/* Contact & Support Section */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #bae6fd',
                borderRadius: 20,
                padding: '24px 26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0369a1', margin: '0 0 4px 0' }}>
                  Need Assistance or Have Policy Inquiries?
                </h3>
                <p style={{ color: '#0284c7', fontSize: '0.85rem', margin: 0 }}>
                  Our compliance and support team is available 24/7 on Telegram.
                </p>
              </div>

              <a
                href="https://t.me/ytcash_support"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  padding: '10px 18px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                }}
              >
                <span>Contact Telegram Support</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
