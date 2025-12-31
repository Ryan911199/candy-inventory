// Configuration - hardcode the ProjectHub endpoint and API key for liability tracker
const PROJECTHUB_ENDPOINT = 'https://hub.firefetch.org';
const PROJECTHUB_API_KEY = 'ph_d8c93b9b816eaa3f2cc542ed0bb22f37'; // Liability Tracker project key

export interface BugReportFormData {
  name: string;
  description: string;
  severity: 'minor' | 'major' | 'critical' | 'service_unusable';
}

export interface ClientInfo {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  screenResolution: string;
  userAgent: string;
}

// Map severity to ProjectHub priority
const SEVERITY_TO_PRIORITY: Record<string, string> = {
  minor: 'low',
  major: 'medium',
  critical: 'high',
  service_unusable: 'critical',
};

export async function submitBug(
  formData: BugReportFormData,
  clientInfo: ClientInfo,
  projectName: string = 'Liability Tracker'
): Promise<string> {
  // Generate title from first 100 chars of description
  const title = formData.description.length > 100
    ? formData.description.substring(0, 100) + '...'
    : formData.description;

  // Prepare metadata
  const metadata = {
    severity: formData.severity,
    projectName,
    clientInfo: {
      browser: clientInfo.browser,
      browserVersion: clientInfo.browserVersion,
      os: clientInfo.os,
      osVersion: clientInfo.osVersion,
      device: clientInfo.device,
      screenResolution: clientInfo.screenResolution,
    },
  };

  // Submit to ProjectHub intake API
  const response = await fetch(`${PROJECTHUB_ENDPOINT}/api/intake/bugs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Project-Key': PROJECTHUB_API_KEY,
      'X-Source-App': 'liability-tracker',
    },
    body: JSON.stringify({
      title,
      description: formData.description,
      priority: SEVERITY_TO_PRIORITY[formData.severity],
      submitterName: formData.name,
      metadata,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Failed to submit bug report');
  }

  return result.bugId || 'unknown';
}
