import React from 'react';
import {
  RotateCcw,
  Save,
  CreditCard,
  ArrowUpRight,
} from 'lucide-react';
import {
  DEFAULT_ADMIN_DEPOSIT_METHODS,
  DEFAULT_ADMIN_WITHDRAW_METHODS,
  getPaymentLogo,
} from './adminTypes';
import { DepositMethod, WithdrawMethod } from '../../types';

interface AdminPaymentMethodsTabProps {
  depositMethodsConfig: DepositMethod[];
  setDepositMethodsConfig: React.Dispatch<React.SetStateAction<DepositMethod[]>>;
  depositMethodsSaving: boolean;
  handleSaveDepositMethods: () => void;

  withdrawMethodsConfig: WithdrawMethod[];
  setWithdrawMethodsConfig: React.Dispatch<React.SetStateAction<WithdrawMethod[]>>;
  withdrawMethodsSaving: boolean;
  handleSaveWithdrawMethods: () => void;
}

export const AdminPaymentMethodsTab: React.FC<AdminPaymentMethodsTabProps> = ({
  depositMethodsConfig,
  setDepositMethodsConfig,
  depositMethodsSaving,
  handleSaveDepositMethods,
  withdrawMethodsConfig,
  setWithdrawMethodsConfig,
  withdrawMethodsSaving,
  handleSaveWithdrawMethods,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* =========================================================================
          Card 1: Deposit Payment Methods & Receiver Account Configuration
          ========================================================================= */}
      <div
        className="glass-card"
        style={{
          padding: '24px 28px',
          borderRadius: 20,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Deposit Payment Methods & Receiver Account Numbers
                </h2>
                <span
                  className="badge-pill"
                  style={{
                    background: '#f0fdf4',
                    color: '#059669',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    fontWeight: 800,
                  }}
                >
                  MANUAL DEPOSIT CONFIG
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Set and update the numbers, wallet addresses, and instructions for all deposit gateways. Changes appear live to advertisers.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setDepositMethodsConfig(DEFAULT_ADMIN_DEPOSIT_METHODS)}
              className="btn btn-ghost"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              disabled={depositMethodsSaving}
              onClick={handleSaveDepositMethods}
              className="btn btn-neon glow-neon"
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Save size={15} />
              {depositMethodsSaving ? 'Saving...' : 'Save Deposit Methods'}
            </button>
          </div>
        </div>

        {/* Methods Grid / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {depositMethodsConfig.map((m, idx) => {
            const logo = getPaymentLogo(m.id);
            const isCrypto = m.id === 'crypto';
            const isFaucetPayManual = m.id === 'faucetpay';
            const isEnabled = m.enabled !== false;

            return (
              <div
                key={m.id}
                style={{
                  padding: '18px 22px',
                  background: isEnabled ? '#ffffff' : '#f8fafc',
                  borderRadius: 14,
                  border: isEnabled ? (isCrypto ? '1.5px solid #10b981' : '1px solid #cbd5e1') : '1px dashed #cbd5e1',
                  opacity: isEnabled ? 1 : 0.65,
                  transition: 'all 0.18s ease',
                  boxShadow: isEnabled && isCrypto ? '0 4px 16px rgba(16, 185, 129, 0.08)' : 'none',
                }}
              >
                {/* Method Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 5,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <img src={logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.02rem' }}>
                          {m.name}
                        </span>
                        {isCrypto && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            ⚡ ONLY AUTOMATIC GATEWAY (FaucetPay Merchant API)
                          </span>
                        )}
                        {isFaucetPayManual && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#eff6ff',
                              color: '#2563eb',
                              border: '1px solid #bfdbfe',
                            }}
                          >
                            MANUAL FAUCETPAY TRANSFER
                          </span>
                        )}
                        {!isCrypto && !isFaucetPayManual && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            MANUAL GATEWAY
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        {isCrypto
                          ? 'Automated instant checkout via FaucetPay. Users pay with BTC, ETH, USDT, LTC, DOGE, TRX, SOL.'
                          : isFaucetPayManual
                            ? 'Advertisers manually transfer to your FaucetPay account and enter TrxID for admin review.'
                            : `Manual deposit gateway with transaction ID verification.`}
                      </p>
                    </div>
                  </div>

                  {/* Modern ON / OFF Switch Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: isEnabled ? '#15803d' : '#64748b',
                          display: 'block',
                          lineHeight: 1.1,
                        }}
                      >
                        {isEnabled ? '● ACTIVE (ON)' : '○ DISABLED (OFF)'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: isEnabled ? '#16a34a' : '#94a3b8' }}>
                        {isEnabled ? 'Visible to advertisers' : 'Hidden from advertisers'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...depositMethodsConfig];
                        updated[idx] = { ...m, enabled: !isEnabled };
                        setDepositMethodsConfig(updated);
                      }}
                      title={isEnabled ? `Turn OFF ${m.name}` : `Turn ON ${m.name}`}
                      style={{
                        width: 50,
                        height: 28,
                        borderRadius: 14,
                        background: isEnabled ? '#10b981' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 3,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.2s ease',
                        outline: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          transform: isEnabled ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Inputs: Receiver Account, Account Type, Min Deposit, Instructions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {/* Account Number / Wallet Address */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      {isCrypto
                        ? 'AUTOMATED CHECKOUT REFERENCE (Backend .env Active):'
                        : isFaucetPayManual
                          ? 'YOUR FAUCETPAY RECEIVER EMAIL / USERNAME:'
                          : 'ADMIN RECEIVER ACCOUNT NUMBER / WALLET ADDRESS:'}
                    </label>
                    <input
                      type="text"
                      value={m.accountNumber || ''}
                      onChange={(e) => {
                        const updated = [...depositMethodsConfig];
                        updated[idx] = { ...m, accountNumber: e.target.value };
                        setDepositMethodsConfig(updated);
                      }}
                      placeholder={
                        isCrypto
                          ? 'Automated FaucetPay Merchant (credentials set in backend .env)'
                          : isFaucetPayManual
                            ? 'e.g. admin@ytcash.pro or your FaucetPay username'
                            : 'e.g. 017XXXXXXXX or 0x0000000000000000000000000000000000000000'
                      }
                      className="input-field font-mono"
                      style={{ padding: '8px 12px', fontSize: '0.88rem', fontWeight: 600 }}
                    />
                    {isCrypto && (
                      <span style={{ fontSize: '0.73rem', color: '#059669', display: 'block', marginTop: 3 }}>
                        ✓ Automated FaucetPay Merchant API handles user payments directly with instant balance credit.
                      </span>
                    )}
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      ACCOUNT TYPE / NETWORK:
                    </label>
                    <input
                      type="text"
                      value={m.accountType || ''}
                      onChange={(e) => {
                        const updated = [...depositMethodsConfig];
                        updated[idx] = { ...m, accountType: e.target.value };
                        setDepositMethodsConfig(updated);
                      }}
                      placeholder="e.g. Personal MFS, Automated Gateway, WMZ Purse"
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.86rem' }}
                    />
                  </div>

                  {/* Min Deposit USD */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      MIN DEPOSIT ($ USD):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={m.minDepositUsd || 5.0}
                      onChange={(e) => {
                        const updated = [...depositMethodsConfig];
                        updated[idx] = { ...m, minDepositUsd: parseFloat(e.target.value) || 5.0 };
                        setDepositMethodsConfig(updated);
                      }}
                      className="input-field font-mono"
                      style={{ padding: '8px 12px', fontSize: '0.86rem', fontWeight: 700 }}
                    />
                  </div>

                  {/* Instructions Note */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      PAYMENT INSTRUCTIONS FOR ADVERTISERS:
                    </label>
                    <textarea
                      rows={2}
                      value={m.instructions || ''}
                      onChange={(e) => {
                        const updated = [...depositMethodsConfig];
                        updated[idx] = { ...m, instructions: e.target.value };
                        setDepositMethodsConfig(updated);
                      }}
                      placeholder="e.g. Send Money (Personal) to this number. Copy the TrxID and enter below."
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.84rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          Card 2: Withdrawal Methods & Minimum Payout Limits
          ========================================================================= */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          marginBottom: 30,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              }}
            >
              <ArrowUpRight size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 className="font-display" style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
                  Withdrawal Methods & Minimum Payout Limits
                </h2>
                <span
                  className="badge-pill"
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    fontWeight: 800,
                  }}
                >
                  MIN WITHDRAW ENGINE
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '3px 0 0' }}>
                Set custom minimum withdrawal amounts ($ USD), account types, and instructions for each individual payout method. Live limits apply to all viewer cashouts.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setWithdrawMethodsConfig(DEFAULT_ADMIN_WITHDRAW_METHODS)}
              className="btn btn-ghost"
              style={{
                padding: '8px 14px',
                fontSize: '0.82rem',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              type="button"
              disabled={withdrawMethodsSaving}
              onClick={handleSaveWithdrawMethods}
              className="btn btn-neon glow-neon"
              style={{
                padding: '9px 18px',
                fontSize: '0.86rem',
                fontWeight: 700,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <Save size={15} />
              {withdrawMethodsSaving ? 'Saving...' : 'Save Withdrawal Methods'}
            </button>
          </div>
        </div>

        {/* Methods Grid / List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {withdrawMethodsConfig.map((m, idx) => {
            const logo = getPaymentLogo(m.id);
            return (
              <div
                key={m.id}
                style={{
                  padding: '16px 20px',
                  background: m.enabled !== false ? '#ffffff' : '#f8fafc',
                  borderRadius: 14,
                  border: m.enabled !== false ? '1px solid #cbd5e1' : '1px dashed #cbd5e1',
                  opacity: m.enabled !== false ? 1 : 0.7,
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Method Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 4,
                      }}
                    >
                      <img src={logo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.96rem' }}>
                        {m.name}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: 8 }}>
                        ({m.id})
                      </span>
                    </div>
                  </div>

                  {/* Modern ON / OFF Switch Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: m.enabled !== false ? '#15803d' : '#64748b',
                          display: 'block',
                          lineHeight: 1.1,
                        }}
                      >
                        {m.enabled !== false ? '● ACTIVE (ON)' : '○ DISABLED (OFF)'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: m.enabled !== false ? '#16a34a' : '#94a3b8' }}>
                        {m.enabled !== false ? 'Enabled for viewers' : 'Disabled for viewers'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...withdrawMethodsConfig];
                        updated[idx] = { ...m, enabled: m.enabled === false ? true : false };
                        setWithdrawMethodsConfig(updated);
                      }}
                      title={m.enabled !== false ? `Turn OFF ${m.name}` : `Turn ON ${m.name}`}
                      style={{
                        width: 50,
                        height: 28,
                        borderRadius: 14,
                        background: m.enabled !== false ? '#0284c7' : '#cbd5e1',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 3,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'background 0.2s ease',
                        outline: 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
                          transform: m.enabled !== false ? 'translateX(22px)' : 'translateX(0px)',
                          transition: 'transform 0.2s ease',
                        }}
                      />
                    </button>
                  </div>
                </div>

                {/* Inputs: Min Withdraw USD, Method Name, Account Type, Instructions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {/* Min Withdraw USD */}
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #0284c7' }}>
                    <label className="font-mono" style={{ fontSize: '0.78rem', color: '#0369a1', display: 'block', marginBottom: 4, fontWeight: 800 }}>
                      ★ MINIMUM WITHDRAWAL AMOUNT ($ USD):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.01"
                      value={m.minWithdrawUsd !== undefined ? m.minWithdrawUsd : 5.0}
                      onChange={(e) => {
                        const updated = [...withdrawMethodsConfig];
                        updated[idx] = { ...m, minWithdrawUsd: parseFloat(e.target.value) || 0.1 };
                        setWithdrawMethodsConfig(updated);
                      }}
                      className="input-field font-mono"
                      style={{ padding: '8px 12px', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', background: '#ffffff' }}
                    />
                  </div>

                  {/* Method Display Name */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      DISPLAY NAME:
                    </label>
                    <input
                      type="text"
                      value={m.name || ''}
                      onChange={(e) => {
                        const updated = [...withdrawMethodsConfig];
                        updated[idx] = { ...m, name: e.target.value };
                        setWithdrawMethodsConfig(updated);
                      }}
                      placeholder="e.g. bKash Personal"
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.86rem' }}
                    />
                  </div>

                  {/* Account Type / Network */}
                  <div>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      ACCOUNT TYPE / REQUIREMENT:
                    </label>
                    <input
                      type="text"
                      value={m.accountType || ''}
                      onChange={(e) => {
                        const updated = [...withdrawMethodsConfig];
                        updated[idx] = { ...m, accountType: e.target.value };
                        setWithdrawMethodsConfig(updated);
                      }}
                      placeholder="e.g. Personal / Agent, BEP-20 (BNB Smart Chain)"
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.86rem' }}
                    />
                  </div>

                  {/* Instructions Note */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="font-mono" style={{ fontSize: '0.76rem', color: '#475569', display: 'block', marginBottom: 4, fontWeight: 700 }}>
                      PAYOUT INSTRUCTIONS / NOTE FOR VIEWERS:
                    </label>
                    <textarea
                      rows={2}
                      value={m.instructions || ''}
                      onChange={(e) => {
                        const updated = [...withdrawMethodsConfig];
                        updated[idx] = { ...m, instructions: e.target.value };
                        setWithdrawMethodsConfig(updated);
                      }}
                      placeholder="e.g. Withdrawals will be sent to your verified personal account."
                      className="input-field"
                      style={{ padding: '8px 12px', fontSize: '0.84rem', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
