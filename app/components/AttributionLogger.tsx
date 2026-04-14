/**
 * COMPONENT 3: Thank You Page Attribution Logger
 * Updated: 2026-04-14 04:12 EDT
 * 
 * This component runs on thank you pages to:
 * 1. Read utm_attribution from localStorage
 * 2. Check timestamp for staleness (2 hours)
 * 3. Read Stripe session_id from URL parameters
 * 4. Read document.referrer as secondary signal
 * 5. POST to /api/attribution
 * 6. Clear localStorage on success
 */

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAttributionForAPI, clearAttribution, getStoredAttribution, isAttributionStale } from '@/lib/attribution-capture';

interface AttributionLoggerProps {
  product: 'p1' | 'p2';
  amount: number;
}

export function AttributionLogger({ product, amount }: AttributionLoggerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get Stripe session_id from URL (Stripe appends this on redirect)
    const session_id = searchParams.get('session_id') || '';
    
    if (!session_id) {
      console.warn('[AttributionLogger] No session_id in URL, skipping attribution log');
      return;
    }

    // Get attribution data (handles stale data by returning organic defaults)
    const attribution = getAttributionForAPI();
    
    // Get stored attribution to check timestamp
    const stored = getStoredAttribution();
    const isStale = isAttributionStale(stored);

    // Secondary referrer signal from this page
    const thank_you_referrer = document.referrer || 'direct';

    // Build request payload
    const payload = {
      session_id,
      utm_campaign: attribution.utm_campaign,
      utm_content: attribution.utm_content,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      referrer: attribution.referrer,
      thank_you_referrer,
      product,
      amount,
      timestamp: new Date().toISOString(),
    };

    // Send to API
    // Note: No custom headers needed. Browser automatically includes origin/referer.
    // API validates request origin on the server side.
    fetch('/api/attribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'same-origin', // Include cookies if needed
    })
      .then(async (res) => {
        if (res.ok) {
          const result = await res.json();
          console.log('[AttributionLogger] Successfully logged attribution', result);
          
          // Clear localStorage after successful write
          clearAttribution();
        } else {
          console.warn('[AttributionLogger] API returned error status', res.status);
        }
      })
      .catch((error) => {
        // Log attribution attempt failure but continue
        // A purchase with unknown attribution is still a purchase
        console.error('[AttributionLogger] Error posting to API:', error);
      });

    // Log to console for debugging
    console.log('[AttributionLogger] Logging purchase attribution', {
      product,
      amount,
      utm_campaign: attribution.utm_campaign,
      was_stale: isStale,
      session_id: session_id.substring(0, 8) + '...', // truncate for privacy
    });
  }, [searchParams, product, amount]);

  // This component renders nothing — it's purely for side effects
  return null;
}
