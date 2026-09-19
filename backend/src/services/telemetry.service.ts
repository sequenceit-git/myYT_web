import geoip from 'geoip-lite';

export interface ClientTelemetry {
  ipAddress?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  browser?: string;
  platform?: string;
  deviceName?: string;
  userAgent?: string;
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  HK: 'Hong Kong',
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
  CN: 'China',
  TW: 'Taiwan',
};

export const getCountryFlag = (countryName?: string, countryCode?: string): string => {
  if (countryCode && countryCode.length === 2) {
    const code = countryCode.toUpperCase();
    if (code === 'XX' || code === 'LO') return '🏠';
    try {
      return String.fromCodePoint(...code.split('').map((c) => 127397 + c.charCodeAt(0)));
    } catch {}
  }
  if (!countryName) return '🌐';
  if (countryName.toLowerCase() === 'localhost' || countryName.toLowerCase().includes('local')) {
    return '🏠';
  }
  const cleanName = countryName.toLowerCase().trim();
  const foundCode = Object.keys(COUNTRY_CODE_MAP).find(
    (k) => COUNTRY_CODE_MAP[k].toLowerCase() === cleanName
  );
  if (foundCode) {
    try {
      return String.fromCodePoint(...foundCode.split('').map((c) => 127397 + c.charCodeAt(0)));
    } catch {}
  }
  return '📍';
};

const getCountryNameFromCode = (code: string): string => {
  if (!code) return '';
  const upper = code.toUpperCase();
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    const name = regionNames.of(upper);
    if (name) return name;
  } catch {}
  return COUNTRY_CODE_MAP[upper] || upper;
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

export const formatDeviceModel = (rawModel: string): string => {
  if (!rawModel || !rawModel.trim() || rawModel === 'Unknown' || rawModel === 'Desktop Device' || rawModel === 'K') {
    return '';
  }
  const clean = rawModel.replace(/['"]/g, '').trim();

  // If already contains full brand name
  if (
    clean.startsWith('Samsung') ||
    clean.startsWith('Google') ||
    clean.startsWith('Apple') ||
    clean.startsWith('Xiaomi') ||
    clean.startsWith('OnePlus') ||
    clean.startsWith('Realme') ||
    clean.startsWith('Vivo') ||
    clean.startsWith('Oppo') ||
    clean.startsWith('Tecno') ||
    clean.startsWith('Infinix') ||
    clean.startsWith('Motorola') ||
    clean.startsWith('Huawei') ||
    clean.startsWith('Honor')
  ) {
    return clean;
  }

  // Samsung Galaxy model codes (SM-...)
  if (clean.startsWith('SM-')) {
    return `Samsung Galaxy (${clean})`;
  }

  // Google Pixel
  if (clean.startsWith('Pixel')) {
    return `Google ${clean}`;
  }

  // Xiaomi / Redmi / Poco model numbers
  if (
    clean.startsWith('Redmi') ||
    clean.startsWith('POCO') ||
    clean.startsWith('Mi ') ||
    /^(21|22|23|24)\d{2}/.test(clean) ||
    clean.startsWith('M2')
  ) {
    return `Xiaomi Redmi (${clean})`;
  }

  // Realme / Oppo / OnePlus
  if (clean.startsWith('CPH') || clean.startsWith('PG') || clean.startsWith('PJC')) {
    return `OPPO / OnePlus (${clean})`;
  }
  if (clean.startsWith('RMX')) {
    return `Realme (${clean})`;
  }

  // Vivo / iQOO
  if (clean.startsWith('V2') || clean.startsWith('I2') || clean.startsWith('vivo')) {
    return `Vivo (${clean})`;
  }

  // Tecno & Infinix
  if (clean.startsWith('TECNO') || clean.startsWith('CK') || clean.startsWith('LH') || clean.startsWith('KJ')) {
    return `Tecno (${clean})`;
  }
  if (clean.startsWith('Infinix') || clean.startsWith('X6') || clean.startsWith('X5')) {
    return `Infinix (${clean})`;
  }

  // Motorola
  if (clean.startsWith('moto') || clean.startsWith('XT')) {
    return `Motorola (${clean})`;
  }

  return clean;
};

export const parseDeviceModelFromUserAgent = (ua: string, secModel?: string): string => {
  if (secModel && secModel.trim() && secModel !== 'Unknown') {
    const formatted = formatDeviceModel(secModel);
    if (formatted) return formatted;
  }
  if (!ua || ua === 'Unknown Client') return 'Unknown Device';

  if (ua.includes('iPhone')) {
    const match = ua.match(/OS ([\d_]+)/);
    return `Apple iPhone${match ? ` (iOS ${match[1].replace(/_/g, '.')})` : ''}`;
  }
  if (ua.includes('iPad')) {
    return 'Apple iPad';
  }
  if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
    return 'Apple Mac / MacBook';
  }

  // Common Android model patterns in User-Agent e.g. "(Linux; Android 14; Pixel 8 Pro)" or "Build/..."
  const androidModelMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)\)/i);
  if (androidModelMatch && androidModelMatch[1]) {
    const raw = androidModelMatch[1].trim();
    if (!raw.includes('K') && !raw.includes('Version') && raw.length > 2 && raw.length < 40) {
      const formatted = formatDeviceModel(raw);
      if (formatted) return formatted;
      return raw;
    }
  }

  if (ua.includes('Android')) return 'Android Smartphone';
  if (ua.includes('Windows NT 10.0')) return 'Windows 10/11 PC Desktop';
  if (ua.includes('Windows')) return 'Windows PC Desktop';
  if (ua.includes('Linux')) return 'Linux Workstation';
  return 'Desktop Device';
};

interface IpGeoResult {
  country: string;
  countryCode: string;
  city?: string;
}

const ipGeoCache = new Map<string, IpGeoResult>();

export const resolveCountryAndCodeFromIp = async (
  ipAddress: string,
  req?: any
): Promise<IpGeoResult> => {
  // 1. Cloudflare edge header (determined by Cloudflare at edge directly from visitor IP)
  const cfCountry = req?.headers?.['cf-ipcountry'] as string;
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    const code = cfCountry.toUpperCase();
    return {
      country: getCountryNameFromCode(code),
      countryCode: code,
    };
  }

  // 2. Vercel / reverse proxy edge header
  const vercelCountry = (req?.headers?.['x-vercel-ip-country'] || req?.headers?.['x-country-code']) as string;
  if (vercelCountry && vercelCountry.length === 2) {
    const code = vercelCountry.toUpperCase();
    return {
      country: getCountryNameFromCode(code),
      countryCode: code,
    };
  }

  // 3. Localhost / Local Development Network
  if (
    !ipAddress ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.') ||
    ipAddress.startsWith('172.16.')
  ) {
    return { country: 'Localhost', countryCode: 'LO' };
  }

  // 4. In-memory cache hit
  if (ipGeoCache.has(ipAddress)) {
    return ipGeoCache.get(ipAddress)!;
  }

  // 5. Query live ip-api.com (accurately identifies Hong Kong, multi-cloud, Zenlayer, VPNs)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,city`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.country) {
        const result: IpGeoResult = {
          country: data.country,
          countryCode: (data.countryCode || '').toUpperCase(),
          city: data.city || '',
        };
        ipGeoCache.set(ipAddress, result);
        return result;
      }
    }
  } catch {
    // If external fetch fails, proceed to offline geoip-lite fallback
  }

  // 6. Offline fallback via geoip-lite
  try {
    const geo = geoip.lookup(ipAddress);
    if (geo && geo.country) {
      const code = geo.country.toUpperCase();
      const result: IpGeoResult = {
        country: getCountryNameFromCode(code),
        countryCode: code,
        city: geo.city || '',
      };
      ipGeoCache.set(ipAddress, result);
      return result;
    }
  } catch {}

  return { country: 'Unknown', countryCode: '' };
};

export const resolveCountryFromRequest = (req: any, clientCountry?: string, clientTimezone?: string): string => {
  // 1. Cloudflare edge header (determined by Cloudflare at edge directly from visitor IP)
  const cfCountry = req?.headers?.['cf-ipcountry'] as string;
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    return getCountryNameFromCode(cfCountry);
  }

  // 2. Vercel / reverse proxy edge header
  const vercelCountry = (req?.headers?.['x-vercel-ip-country'] || req?.headers?.['x-country-code']) as string;
  if (vercelCountry && vercelCountry.length === 2) {
    return getCountryNameFromCode(vercelCountry);
  }

  // 3. Extract the actual connecting IP address
  const rawIp =
    (req?.headers?.['cf-connecting-ip'] as string) ||
    (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req?.headers?.['x-real-ip'] as string) ||
    req?.socket?.remoteAddress ||
    req?.ip ||
    '';
  const ipAddress = rawIp.replace(/^::ffff:/, '').trim();

  if (ipGeoCache.has(ipAddress)) {
    return ipGeoCache.get(ipAddress)!.country;
  }

  // 4. IP-based lookup using geoip-lite (Priority: True IP Geolocation)
  if (
    ipAddress &&
    ipAddress !== '127.0.0.1' &&
    ipAddress !== '::1' &&
    !ipAddress.startsWith('192.168.') &&
    !ipAddress.startsWith('10.') &&
    !ipAddress.startsWith('172.16.')
  ) {
    try {
      const geo = geoip.lookup(ipAddress);
      if (geo && geo.country) {
        return getCountryNameFromCode(geo.country);
      }
    } catch {}
  }

  // 5. Localhost / Local Development Network fallback
  if (
    !ipAddress ||
    ipAddress === '127.0.0.1' ||
    ipAddress === '::1' ||
    ipAddress.startsWith('192.168.') ||
    ipAddress.startsWith('10.')
  ) {
    if (clientTimezone && TIMEZONE_COUNTRY_MAP[clientTimezone]) {
      return TIMEZONE_COUNTRY_MAP[clientTimezone];
    }
    return 'Bangladesh';
  }

  // 6. Secondary fallback if IP is unmapped in GeoIP database
  if (clientCountry && clientCountry.trim() && clientCountry !== 'Unknown') {
    return clientCountry.trim();
  }

  if (clientTimezone && TIMEZONE_COUNTRY_MAP[clientTimezone]) {
    return TIMEZONE_COUNTRY_MAP[clientTimezone];
  }

  return 'Unknown';
};

export const extractFullClientTelemetry = async (req: any, clientData: any = {}): Promise<ClientTelemetry> => {
  const rawIp =
    (req.headers?.['cf-connecting-ip'] as string) ||
    (req.headers?.['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    (req.headers?.['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1';
  let ipAddress = rawIp.replace(/^::ffff:/, '').trim() || '127.0.0.1';
  if (ipAddress === '::1') {
    ipAddress = '127.0.0.1';
  }

  const userAgent = (req.headers?.['user-agent'] as string) || clientData.userAgent || 'Unknown Client';
  const secPlatform = req.headers?.['sec-ch-ua-platform'] ? String(req.headers['sec-ch-ua-platform']) : undefined;
  const secModel = req.headers?.['sec-ch-ua-model'] ? String(req.headers['sec-ch-ua-model']) : undefined;
  const secPlatformVersion = req.headers?.['sec-ch-ua-platform-version']
    ? String(req.headers['sec-ch-ua-platform-version']).replace(/['"]/g, '').trim()
    : undefined;

  // Real-time IP-based location resolution (Hong Kong, Bangladesh, etc.)
  const geo = await resolveCountryAndCodeFromIp(ipAddress, req);
  let country = geo.country;
  let countryCode = geo.countryCode;

  if (country === 'Localhost' && clientData.timezone && TIMEZONE_COUNTRY_MAP[clientData.timezone]) {
    country = TIMEZONE_COUNTRY_MAP[clientData.timezone];
    countryCode = Object.keys(COUNTRY_CODE_MAP).find((k) => COUNTRY_CODE_MAP[k] === country) || 'BD';
  }

  const browser = clientData.browser || parseBrowserFromUserAgent(userAgent);
  let platform = clientData.platform;
  if (!platform || platform === 'Android 10' || platform === 'Android') {
    if (secPlatformVersion) {
      const major = secPlatformVersion.split('.')[0];
      if (major && !isNaN(Number(major)) && Number(major) > 0) {
        platform = `Android ${major}`;
      }
    }
  }
  if (!platform) {
    platform = parsePlatformFromUserAgent(userAgent, secPlatform);
  }
  const clientDevice = clientData.deviceName || clientData.deviceInfo;
  let deviceName = '';
  if (
    clientDevice &&
    clientDevice !== 'Desktop PC' &&
    clientDevice !== 'Desktop Device' &&
    clientDevice !== 'Android Smartphone' &&
    clientDevice !== 'Mobile Device'
  ) {
    deviceName = formatDeviceModel(clientDevice);
  }
  if (!deviceName) {
    deviceName = parseDeviceModelFromUserAgent(userAgent, secModel);
  }

  return {
    ipAddress,
    country,
    countryCode,
    city: geo.city,
    browser,
    platform,
    deviceName,
    userAgent,
  };
};
