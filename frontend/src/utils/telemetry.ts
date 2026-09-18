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

export const getClientTelemetry = (): TelemetryPayload => {
  try {
    const ua = navigator.userAgent;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const country = TIMEZONE_TO_COUNTRY[tz] || 'Bangladesh';

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
    if (ua.includes('Android')) {
      const m = ua.match(/Android ([\d.]+)/);
      platform = `Android ${m ? m[1] : ''}`.trim();
    } else if (ua.includes('iPhone')) {
      const m = ua.match(/OS ([\d_]+)/);
      platform = `iOS ${m ? m[1].replace(/_/g, '.') : ''}`.trim();
    } else if (ua.includes('iPad')) {
      platform = 'iPadOS';
    } else if (ua.includes('Windows NT 10.0')) {
      platform = 'Windows 10/11';
    } else if (ua.includes('Windows')) {
      platform = 'Windows';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
      platform = 'macOS';
    } else if (ua.includes('Linux')) {
      platform = 'Linux';
    }

    // Device Model / Name Detection
    let deviceName = 'Desktop PC';
    if (ua.includes('iPhone')) {
      deviceName = 'Apple iPhone';
    } else if (ua.includes('iPad')) {
      deviceName = 'Apple iPad';
    } else if (ua.includes('Macintosh')) {
      deviceName = 'Apple Mac / MacBook';
    } else {
      const androidModelMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;)]+)\)/i);
      if (androidModelMatch && androidModelMatch[1]) {
        const m = androidModelMatch[1].trim();
        if (!m.includes('K') && !m.includes('Version') && m.length > 2 && m.length < 40) {
          if (m.startsWith('SM-')) deviceName = `Samsung Galaxy (${m})`;
          else if (m.startsWith('Redmi') || m.startsWith('M2') || m.startsWith('22') || m.startsWith('23')) deviceName = `Xiaomi Redmi (${m})`;
          else if (m.startsWith('CPH') || m.startsWith('RMX')) deviceName = `Realme/Oppo (${m})`;
          else if (m.startsWith('Pixel')) deviceName = `Google ${m}`;
          else deviceName = m;
        } else {
          deviceName = 'Android Smartphone';
        }
      } else if (ua.includes('Mobile')) {
        deviceName = 'Mobile Device';
      } else if (ua.includes('Windows')) {
        deviceName = 'Windows PC Desktop';
      }
    }

    return {
      country,
      browser,
      platform,
      deviceName,
      timezone: tz,
      deviceInfo: deviceName,
    };
  } catch {
    return {
      country: 'Bangladesh',
      browser: 'Web Browser',
      platform: 'Web',
      deviceName: 'Desktop PC',
    };
  }
};
