import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api';

interface ExchangeRateContextType {
  usdToBdt: number;
  loading: boolean;
  refreshRate: () => Promise<void>;
  updateRate: (newRate: number) => Promise<{ success: boolean; message?: string; error?: string }>;
  formatBdt: (usd: number) => string;
}

const ExchangeRateContext = createContext<ExchangeRateContextType>({
  usdToBdt: 122,
  loading: false,
  refreshRate: async () => {},
  updateRate: async () => ({ success: false }),
  formatBdt: (usd) => `৳${Math.round(usd * 122).toLocaleString()} BDT`,
});

export const ExchangeRateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usdToBdt, setUsdToBdt] = useState<number>(122);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRate = useCallback(async () => {
    try {
      const res = await apiRequest<{ usdToBdt: number }>('/public/exchange-rate');
      if (res.success && res.data?.usdToBdt) {
        setUsdToBdt(res.data.usdToBdt);
      }
    } catch {
      // Fallback stays at 122
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const updateRate = async (newRate: number) => {
    setLoading(true);
    try {
      const res = await apiRequest<{ usdToBdt: number }>('/admin/settings/exchange-rate', {
        method: 'POST',
        body: JSON.stringify({ usdToBdt: newRate }),
      });

      if (res.success && res.data?.usdToBdt) {
        setUsdToBdt(res.data.usdToBdt);
        return { success: true, message: `Dollar rate updated to 1 USD = ${res.data.usdToBdt} BDT!` };
      }
      return { success: false, error: res.error || 'Failed to update rate' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const formatBdt = (usd: number): string => {
    const total = Math.round(usd * usdToBdt);
    return `৳${total.toLocaleString()} BDT`;
  };

  return (
    <ExchangeRateContext.Provider
      value={{
        usdToBdt,
        loading,
        refreshRate: fetchRate,
        updateRate,
        formatBdt,
      }}
    >
      {children}
    </ExchangeRateContext.Provider>
  );
};

export const useExchangeRate = () => useContext(ExchangeRateContext);
