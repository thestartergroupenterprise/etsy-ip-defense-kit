/**
 * COMPONENT 2: localStorage UTM Capture on Landing Pages
 * Updated: 2026-04-14 04:12 EDT
 * 
 * This module captures UTM parameters from the URL on page load and saves them
 * to localStorage for persistence through Stripe checkout redirects to thank you page.
 * 
 * Key: "utm_attribution"
 * Value: JSON object with utm_source, utm_medium, utm_campaign, utm_content, referrer, timestamp
 */

export interface UTMAttribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  referrer: string;
  timestamp: string; // ISO string
}

/**
 * Capture UTM parameters from URL and save to localStorage
 * Runs on page load for both landing pages and product pages
 */
export function captureUTMAttribution(): void {
  if (typeof window === 'undefined') {
    // Running on server, skip
    return;
  }

  try {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    
    const utm_source = urlParams.get('utm_source') || null;
    const utm_medium = urlParams.get('utm_medium') || null;
    const utm_campaign = urlParams.get('utm_campaign') || null;
    const utm_content = urlParams.get('utm_content') || null;
    
    const referrer = document.referrer || 'direct';
    const timestamp = new Date().toISOString();
    
    // If UTM parameters are present, save them
    if (utm_source || utm_medium || utm_campaign || utm_content) {
      const attribution: UTMAttribution = {
        utm_source: utm_source || 'unknown',
        utm_medium: utm_medium || 'unknown',
        utm_campaign: utm_campaign || 'unknown',
        utm_content: utm_content || 'unknown',
        referrer,
        timestamp,
      };
      
      localStorage.setItem('utm_attribution', JSON.stringify(attribution));
      console.log('[Attribution] UTM parameters captured and saved to localStorage', attribution);
    } else {
      // No UTM parameters in URL — save referrer only with organic/direct defaults
      const attribution: UTMAttribution = {
        utm_source: 'organic',
        utm_medium: 'referral',
        utm_campaign: 'organic',
        utm_content: 'direct',
        referrer,
        timestamp,
      };
      
      localStorage.setItem('utm_attribution', JSON.stringify(attribution));
      console.log('[Attribution] No UTMs in URL, saved organic attribution with referrer', attribution);
    }
  } catch (error) {
    console.error('[Attribution] Error capturing UTM parameters:', error);
  }
}

/**
 * Get stored UTM attribution from localStorage
 * Returns null if not found or error occurs
 */
export function getStoredAttribution(): UTMAttribution | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem('utm_attribution');
    if (!stored) {
      return null;
    }
    
    const attribution = JSON.parse(stored) as UTMAttribution;
    return attribution;
  } catch (error) {
    console.error('[Attribution] Error reading from localStorage:', error);
    return null;
  }
}

/**
 * Clear utm_attribution from localStorage
 * Called after successful attribution logging to API
 */
export function clearAttribution(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('utm_attribution');
    console.log('[Attribution] localStorage cleared');
  } catch (error) {
    console.error('[Attribution] Error clearing localStorage:', error);
  }
}

/**
 * Check if stored attribution is stale (older than 2 hours)
 * Returns true if stale, false if fresh or null
 */
export function isAttributionStale(attribution: UTMAttribution | null): boolean {
  if (!attribution) {
    return true;
  }

  try {
    const storedTime = new Date(attribution.timestamp).getTime();
    const now = new Date().getTime();
    const twoHoursMs = 2 * 60 * 60 * 1000;
    
    return (now - storedTime) > twoHoursMs;
  } catch (error) {
    console.error('[Attribution] Error checking staleness:', error);
    return true;
  }
}

/**
 * Get attribution for API call (handles stale data)
 * If attribution is stale, returns organic/direct defaults
 */
export function getAttributionForAPI(): Omit<UTMAttribution, 'timestamp'> {
  const stored = getStoredAttribution();
  
  if (isAttributionStale(stored)) {
    // Stale — return organic defaults
    return {
      utm_source: 'organic',
      utm_medium: 'referral',
      utm_campaign: 'organic',
      utm_content: 'direct',
      referrer: 'unknown',
    };
  }

  if (!stored) {
    // Not found — return organic defaults
    return {
      utm_source: 'organic',
      utm_medium: 'referral',
      utm_campaign: 'organic',
      utm_content: 'direct',
      referrer: 'unknown',
    };
  }

  // Fresh attribution — return as-is
  return {
    utm_source: stored.utm_source,
    utm_medium: stored.utm_medium,
    utm_campaign: stored.utm_campaign,
    utm_content: stored.utm_content,
    referrer: stored.referrer,
  };
}
