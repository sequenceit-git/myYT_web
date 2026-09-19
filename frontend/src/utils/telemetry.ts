export interface TelemetryPayload {
  country?: string;
  browser?: string;
  platform?: string;
  deviceName?: string;
  timezone?: string;
  deviceInfo?: string;
}

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
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

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'hong kong': 'HK',
  'bangladesh': 'BD',
  'united states': 'US',
  'usa': 'US',
  'india': 'IN',
  'pakistan': 'PK',
  'nigeria': 'NG',
  'philippines': 'PH',
  'united kingdom': 'GB',
  'uk': 'GB',
  'canada': 'CA',
  'germany': 'DE',
  'france': 'FR',
  'brazil': 'BR',
  'indonesia': 'ID',
  'vietnam': 'VN',
  'turkey': 'TR',
  'egypt': 'EG',
  'malaysia': 'MY',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'saudi arabia': 'SA',
  'russia': 'RU',
  'nepal': 'NP',
  'sri lanka': 'LK',
  'kenya': 'KE',
  'ghana': 'GH',
  'south africa': 'ZA',
  'australia': 'AU',
  'singapore': 'SG',
  'italy': 'IT',
  'spain': 'ES',
  'netherlands': 'NL',
  'japan': 'JP',
  'south korea': 'KR',
  'thailand': 'TH',
  'china': 'CN',
  'taiwan': 'TW',
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
  const code = COUNTRY_NAME_TO_CODE[cleanName];
  if (code) {
    try {
      return String.fromCodePoint(...code.split('').map((c) => 127397 + c.charCodeAt(0)));
    } catch {}
  }
  return '📍';
};

let cachedClientModel = '';
let cachedPlatformVersion = '';

// Immediately query modern Client Hints (Chromium Android & Desktop) and check URL parameters
if (typeof window !== 'undefined') {
  try {
    const savedModel = localStorage.getItem('myyt_device_model');
    if (savedModel) cachedClientModel = savedModel;

    const savedVersion = localStorage.getItem('myyt_platform_version');
    if (savedVersion) cachedPlatformVersion = savedVersion;

    const params = new URLSearchParams(window.location.search);
    const queryModel = params.get('deviceModel');
    if (queryModel && queryModel.trim()) {
      localStorage.setItem('myyt_device_model', queryModel.trim());
      cachedClientModel = queryModel.trim();
    }

    // Modern User-Agent Client Hints API to extract true hardware device model & OS version
    const uaData = (navigator as any).userAgentData;
    if (uaData && typeof uaData.getHighEntropyValues === 'function') {
      uaData
        .getHighEntropyValues(['model', 'platform', 'platformVersion'])
        .then((hints: any) => {
          if (hints?.model && hints.model.trim()) {
            cachedClientModel = hints.model.trim();
            localStorage.setItem('myyt_device_model', hints.model.trim());
          }
          if (hints?.platformVersion && hints.platformVersion.trim()) {
            cachedPlatformVersion = hints.platformVersion.trim();
            localStorage.setItem('myyt_platform_version', hints.platformVersion.trim());
          }
        })
        .catch(() => {});
    }
  } catch {}
}

export const formatDeviceModel = (rawModel: string): string => {
  if (!rawModel || !rawModel.trim() || rawModel === 'Unknown' || rawModel === 'Desktop Device' || rawModel === 'K') {
    return '';
  }
  const clean = rawModel.replace(/['"]/g, '').trim();

  // If already contains brand name
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

export const getClientTelemetry = (): TelemetryPayload => {
  try {
    const ua = navigator.userAgent;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // Check stored hardware model from Client Hints or App redirect
    const storedHardwareModel =
      typeof window !== 'undefined'
        ? localStorage.getItem('myyt_device_model') || cachedClientModel
        : cachedClientModel;

    // Browser Detection
    let browser = 'Web Browser';
    if (ua.includes('Edg/')) {
      const m = ua.match(/Edg\/([\d.]+)/);
      browser = `Edge ${m ? m[1].split('.')[0] : ''}`.trim();
    } else if (ua.includes('OPR/') || ua.includes('Opera')) {
      const m = ua.match(/(?:OPR|Opera)\/([\d.]+)/);
      browser = `Opera ${m ? m[1].split('.')[0] : ''}`.trim();
    } else if (ua.includes('SamsungBrowser/')) {
      const m = ua.match(/SamsungBrowser\/([\d.]+)/);
      browser = `Samsung Internet ${m ? m[1].split('.')[0] : ''}`.trim();
    } else if (ua.includes('Chrome/')) {
      const m = ua.match(/Chrome\/([\d.]+)/);
      browser = `Chrome ${m ? m[1].split('.')[0] : ''}`.trim();
    } else if (ua.includes('Firefox/')) {
      const m = ua.match(/Firefox\/([\d.]+)/);
      browser = `Firefox ${m ? m[1].split('.')[0] : ''}`.trim();
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      const m = ua.match(/Version\/([\d.]+)/);
      browser = `Safari ${m ? m[1].split('.')[0] : ''}`.trim();
    }

    // Platform / OS Detection
    let platform = 'Unknown OS';
    const storedPlatformVersion =
      typeof window !== 'undefined'
        ? localStorage.getItem('myyt_platform_version') || cachedPlatformVersion
        : cachedPlatformVersion;

    if (ua.includes('Android')) {
      let androidVer = '';
      if (storedPlatformVersion && storedPlatformVersion.trim()) {
        const major = storedPlatformVersion.split('.')[0].replace(/['"]/g, '');
        if (major && !isNaN(Number(major)) && Number(major) > 0) {
          androidVer = major;
        }
      }
      if (!androidVer) {
        const m = ua.match(/Android ([\d.]+)/);
        androidVer = m ? m[1] : '';
      }
      platform = androidVer ? `Android ${androidVer}` : 'Android';
    } else if (ua.includes('iPhone')) {
      const m = ua.match(/OS ([\d_]+)/);
      platform = `iOS ${m ? m[1].replace(/_/g, '.') : ''}`.trim();
    } else if (ua.includes('iPad')) {
      platform = 'iPadOS';
    } else if (ua.includes('Windows')) {
      if (storedPlatformVersion) {
        const major = parseInt(storedPlatformVersion.split('.')[0].replace(/['"]/g, ''), 10);
        if (major >= 13) {
          platform = 'Windows 11';
        } else if (major >= 1) {
          platform = 'Windows 10';
        } else {
          platform = 'Windows';
        }
      } else if (ua.includes('Windows NT 10.0')) {
        platform = 'Windows 10/11';
      } else {
        platform = 'Windows';
      }
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
      platform = 'macOS';
    } else if (ua.includes('Linux')) {
      platform = 'Linux';
    }

    // Device Model / Name Detection
    let deviceName = 'Desktop PC';

    if (storedHardwareModel && storedHardwareModel !== 'K' && storedHardwareModel !== 'Unknown') {
      const formatted = formatDeviceModel(storedHardwareModel);
      deviceName = formatted || storedHardwareModel;
    } else if (ua.includes('iPhone')) {
      const m = ua.match(/OS ([\d_]+)/);
      deviceName = `Apple iPhone${m ? ` (iOS ${m[1].replace(/_/g, '.')})` : ''}`;
    } else if (ua.includes('iPad')) {
      deviceName = 'Apple iPad';
    } else if (ua.includes('Macintosh')) {
      deviceName = 'Apple Mac / MacBook';
    } else {
      const androidModelMatch =
        ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)\)/i);
      if (androidModelMatch && androidModelMatch[1]) {
        const m = androidModelMatch[1].trim();
        if (!m.includes('K') && !m.includes('Version') && m.length > 2 && m.length < 40) {
          const formatted = formatDeviceModel(m);
          deviceName = formatted || m;
        } else {
          deviceName = 'Android Smartphone';
        }
      } else if (ua.includes('Windows')) {
        deviceName = 'Windows 10/11 PC Desktop';
      } else if (ua.includes('Linux')) {
        deviceName = 'Linux Workstation';
      }
    }

    return {
      browser,
      platform,
      deviceName,
      timezone: tz,
      deviceInfo: deviceName,
    };
  } catch {
    return {
      browser: 'Web Browser',
      platform: 'Web',
      deviceName: 'Desktop PC',
    };
  }
};
