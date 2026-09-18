export interface ClientTelemetry {
  ipAddress?: string;
  country?: string;
  browser?: string;
  platform?: string;
  deviceName?: string;
  userAgent?: string;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  BD: 'Bangladesh',
  US: 'United States',
  IN: 'India',
  PK: 'Pakistan',
  NG: 'Nigeria',
  PH: 'Philippines',
  GB: 'United Kingdom',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  BR: 'Brazil',
  ID: 'Indonesia',
  VN: 'Vietnam',
  TR: 'Turkey',
  EG: 'Egypt',
  MY: 'Malaysia',
  AE: 'United Arab Emirates',
  SA: 'Saudi Arabia',
  RU: 'Russia',
  NP: 'Nepal',
  LK: 'Sri Lanka',
  KE: 'Kenya',
  GH: 'Ghana',
  ZA: 'South Africa',
  AU: 'Australia',
  SG: 'Singapore',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  JP: 'Japan',
  KR: 'South Korea',
  TH: 'Thailand',
};

const TIMEZONE_COUNTRY_MAP: Record<string, string> = {
  'Asia/Dhaka': 'Bangladesh',
  'Asia/Kolkata': 'India',
  'Asia/Calcutta': 'India',
  'Asia/Karachi': 'Pakistan',
  'Asia/Kathmandu': 'Nepal',
  'Asia/Colombo': 'Sri Lanka',
  'Asia/Dubai': 'United Arab Emirates',
  'Asia/Riyadh': 'Saudi Arabia',
  'Asia/Manila': 'Philippines',
  'Asia/Jakarta': 'Indonesia',
  'Asia/Bangkok': 'Thailand',
  'Asia/Kuala_Lumpur': 'Malaysia',
  'Asia/Singapore': 'Singapore',
  'Asia/Tokyo': 'Japan',
  'Asia/Seoul': 'South Korea',
  'Asia/Ho_Chi_Minh': 'Vietnam',
  'Africa/Lagos': 'Nigeria',
  'Africa/Cairo': 'Egypt',
  'Africa/Nairobi': 'Kenya',
  'Africa/Accra': 'Ghana',
  'Africa/Johannesburg': 'South Africa',
  'America/New_York': 'United States',
  'America/Chicago': 'United States',
  'America/Denver': 'United States',
  'America/Los_Angeles': 'United States',
  'America/Toronto': 'Canada',
  'America/Vancouver': 'Canada',
  'America/Sao_Paulo': 'Brazil',
  'Europe/London': 'United Kingdom',
  'Europe/Berlin': 'Germany',
  'Europe/Paris': 'France',
  'Europe/Madrid': 'Spain',
  'Europe/Rome': 'Italy',
  'Europe/Amsterdam': 'Netherlands',
  'Europe/Moscow': 'Russia',
  'Europe/Istanbul': 'Turkey',
  'Australia/Sydney': 'Australia',
  'Australia/Melbourne': 'Australia',
};

export const parseBrowserFromUserAgent = (ua: string): string => {
  if (!ua || ua === 'Unknown Client') return 'Unknown Browser';
  if (ua.includes('Edg/')) {
    const match = ua.match(/Edg\/([\d.]+)/);
    return `Edge ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('OPR/') || ua.includes('Opera')) {
    const match = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
    return `Opera ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('SamsungBrowser/')) {
    const match = ua.match(/SamsungBrowser\/([\d.]+)/);
    return `Samsung Internet ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('UCBrowser/')) {
    const match = ua.match(/UCBrowser\/([\d.]+)/);
    return `UC Browser ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('Chrome/')) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    return `Chrome ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('Firefox/')) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    return `Firefox ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    const match = ua.match(/Version\/([\d.]+)/);
    return `Safari ${match ? match[1].split('.')[0] : ''}`.trim();
  }
  return 'Web Browser';
};

export const parsePlatformFromUserAgent = (ua: string, secPlatform?: string): string => {
  if (secPlatform && secPlatform.trim() && secPlatform !== 'Unknown') {
    return secPlatform.replace(/['"]/g, '');
  }
  if (!ua || ua === 'Unknown Client') return 'Unknown Platform';
  if (ua.includes('Android')) {
    const match = ua.match(/Android ([\d.]+)/);
    return `Android ${match ? match[1] : ''}`.trim();
  }
  if (ua.includes('iPhone')) {
    const match = ua.match(/OS ([\d_]+)/);
    return `iOS ${match ? match[1].replace(/_/g, '.') : ''}`.trim();
  }
  if (ua.includes('iPad')) {
    return 'iPadOS';
  }
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
  if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (ua.includes('Windows NT 6.1')) return 'Windows 7';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return 'macOS';
  if (ua.includes('CrOS')) return 'ChromeOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
};

export const parseDeviceModelFromUserAgent = (ua: string, secModel?: string): string => {
  if (secModel && secModel.trim() && secModel !== 'Unknown') {
    return secModel.replace(/['"]/g, '');
  }
  if (!ua || ua === 'Unknown Client') return 'Unknown Device';

  if (ua.includes('iPhone')) {
    return 'Apple iPhone';
  }
  if (ua.includes('iPad')) {
    return 'Apple iPad';
  }
  if (ua.includes('Macintosh')) {
    return 'Apple Mac / MacBook';
  }

  // Common Android model patterns e.g. "Build/SP1A.210812.016; SM-S908B)" or "(Linux; Android 14; Pixel 8 Pro)"
  const androidModelMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)\)/i);
  if (androidModelMatch && androidModelMatch[1]) {
    const model = androidModelMatch[1].trim();
    if (!model.includes('K') && !model.includes('Version') && model.length > 2 && model.length < 40) {
      if (model.startsWith('SM-')) return `Samsung Galaxy (${model})`;
      if (model.startsWith('Redmi') || model.startsWith('M2') || model.startsWith('22') || model.startsWith('23')) return `Xiaomi Redmi (${model})`;
      if (model.startsWith('CPH') || model.startsWith('RMX')) return `Realme/Oppo (${model})`;
      if (model.startsWith('Pixel')) return `Google ${model}`;
      return model;
    }
  }

  if (ua.includes('Android')) return 'Android Smartphone';
  if (ua.includes('Windows')) return 'Windows PC Desktop';
  if (ua.includes('Linux')) return 'Linux Workstation';
  return 'Desktop Device';
};

export const resolveCountryFromRequest = (req: any, clientCountry?: string, clientTimezone?: string): string => {
  const cfCountry = req.headers['cf-ipcountry'] as string;
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    const mapped = COUNTRY_CODE_MAP[cfCountry.toUpperCase()];
    if (mapped) return mapped;
    return cfCountry.toUpperCase();
  }

  const vercelCountry = (req.headers['x-vercel-ip-country'] || req.headers['x-country-code']) as string;
  if (vercelCountry && vercelCountry.length === 2) {
    const mapped = COUNTRY_CODE_MAP[vercelCountry.toUpperCase()];
    if (mapped) return mapped;
    return vercelCountry.toUpperCase();
  }

  if (clientCountry && clientCountry.trim() && clientCountry !== 'Unknown') {
    return clientCountry.trim();
  }

  if (clientTimezone && TIMEZONE_COUNTRY_MAP[clientTimezone]) {
    return TIMEZONE_COUNTRY_MAP[clientTimezone];
  }

  const rawIp =
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';
  
  if (rawIp.includes('127.0.0.1') || rawIp.includes('::1') || rawIp.startsWith('192.168.') || rawIp.startsWith('10.')) {
    return 'Bangladesh'; // Platform primary development region fallback
  }

  return 'Bangladesh';
};

export const extractFullClientTelemetry = (req: any, clientData: any = {}): ClientTelemetry => {
  const rawIp =
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  let ipAddress = rawIp.replace(/^::ffff:/, '').trim() || '127.0.0.1';
  if (ipAddress === '::1') {
    ipAddress = '127.0.0.1';
  }

  const userAgent = (req.headers['user-agent'] as string) || clientData.userAgent || 'Unknown Client';
  const secPlatform = (req.headers['sec-ch-ua-platform'] ? String(req.headers['sec-ch-ua-platform']) : undefined);
  const secModel = (req.headers['sec-ch-ua-model'] ? String(req.headers['sec-ch-ua-model']) : undefined);

  const country = resolveCountryFromRequest(req, clientData.country, clientData.timezone);
  const browser = clientData.browser || parseBrowserFromUserAgent(userAgent);
  const platform = clientData.platform || parsePlatformFromUserAgent(userAgent, secPlatform);
  const deviceName = clientData.deviceName || parseDeviceModelFromUserAgent(userAgent, secModel);

  return {
    ipAddress,
    country,
    browser,
    platform,
    deviceName,
    userAgent,
  };
};
