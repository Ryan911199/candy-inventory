import { useMemo } from 'react';
import type { ClientInfo } from '../lib/bugService';

function parseUserAgent(ua: string): Omit<ClientInfo, 'screenResolution' | 'userAgent'> {
  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let device = 'Desktop';

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  }

  // Detect OS
  if (ua.includes('Windows NT 10')) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Android')) {
    os = 'Android';
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || '';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  }

  // Detect device type
  if (ua.includes('Mobile') || (ua.includes('Android') && !ua.includes('Tablet'))) {
    device = 'Mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device = 'Tablet';
  }

  return { browser, browserVersion, os, osVersion, device };
}

export function useClientInfo(): ClientInfo {
  const clientInfo = useMemo<ClientInfo>(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        browser: 'Unknown',
        browserVersion: '',
        os: 'Unknown',
        osVersion: '',
        device: 'Desktop',
        screenResolution: '',
        userAgent: '',
      };
    }

    const ua = navigator.userAgent;
    const parsed = parseUserAgent(ua);
    
    return {
      ...parsed,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      userAgent: ua,
    };
  }, []);

  return clientInfo;
}
