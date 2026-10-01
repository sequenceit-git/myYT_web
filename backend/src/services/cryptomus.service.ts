import crypto from 'crypto';
import { config } from '../config/index.js';

const CRYPTOMUS_API = 'https://api.cryptomus.com/v1';

/** Invoice statuses that mean funds actually arrived. Everything else fails closed. */
export const CRYPTOMUS_PAID_STATUSES = new Set(['paid', 'paid_over']);

export interface CryptomusInvoice {
  uuid: string;
  order_id: string;
  amount: string;
  url: string;
  payment_status?: string;
  status?: string;
  currency?: string;
  network?: string | null;
  payment_amount_usd?: string | number | null;
}

interface CryptomusEnvelope<T> {
  state: number;
  result?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

const getMerchantUuid = () => (config.cryptomusMerchantUuid || '').trim();
const getPaymentApiKey = () => (config.cryptomusPaymentApiKey || '').trim();

export const isCryptomusConfigured = (): boolean =>
  Boolean(getMerchantUuid() && getPaymentApiKey());

/**
 * Cryptomus sign: MD5(base64(JSON body) + API key).
 * PHP json_encode escapes slashes; match that so the signature verifies.
 * Never log apiKey or the raw sign input.
 */
const signBody = (json: string, apiKey: string): string => {
  const b64 = Buffer.from(json).toString('base64');
  return crypto.createHash('md5').update(b64 + apiKey).digest('hex');
};

const toPhpJson = (payload: unknown): string =>
  JSON.stringify(payload).replace(/\//g, '\\/');

const cryptomusRequest = async <T>(
  path: string,
  payload: Record<string, unknown>
): Promise<T> => {
  const merchant = getMerchantUuid();
  const apiKey = getPaymentApiKey();
  if (!merchant || !apiKey) {
    throw new Error('Cryptomus is not configured. Set CRYPTOMUS_MERCHANT_UUID and CRYPTOMUS_PAYMENT_API_KEY.');
  }

  const json = toPhpJson(payload);
  const sign = signBody(json, apiKey);

  const res = await fetch(`${CRYPTOMUS_API}${path}`, {
    method: 'POST',
    headers: {
      merchant,
      sign,
      'Content-Type': 'application/json',
    },
    body: json,
  });

  const data = (await res.json()) as CryptomusEnvelope<T>;
  if (!res.ok || data.state !== 0 || !data.result) {
    const detail =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join('; ') : '') ||
      `Cryptomus HTTP ${res.status}`;
    throw new Error(detail);
  }
  return data.result;
};

export const createCryptomusInvoice = async (params: {
  amountUsd: number;
  orderId: string;
  urlCallback: string;
  urlReturn: string;
  urlSuccess: string;
}): Promise<CryptomusInvoice> => {
  return cryptomusRequest<CryptomusInvoice>('/payment', {
    amount: params.amountUsd.toFixed(2),
    currency: 'USD',
    order_id: params.orderId,
    url_callback: params.urlCallback,
    url_return: params.urlReturn,
    url_success: params.urlSuccess,
    lifetime: 3600,
    is_payment_multiple: true,
    additional_data: params.orderId,
  });
};

export const getCryptomusPaymentInfo = async (orderId: string): Promise<CryptomusInvoice> => {
  return cryptomusRequest<CryptomusInvoice>('/payment/info', { order_id: orderId });
};

/**
 * Verify webhook HMAC-equivalent sign using the PAYMENT API key only.
 * Fail closed: any mismatch or missing key is treated as forged.
 */
export const verifyCryptomusWebhook = (body: Record<string, any>): boolean => {
  const apiKey = getPaymentApiKey();
  const received = typeof body?.sign === 'string' ? body.sign : '';
  if (!apiKey || !received) return false;

  const { sign: _ignored, ...rest } = body;
  const json = toPhpJson(rest);
  const expected = signBody(json, apiKey);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
};

export const invoiceStatus = (invoice: CryptomusInvoice): string =>
  String(invoice.payment_status || invoice.status || '').toLowerCase();
