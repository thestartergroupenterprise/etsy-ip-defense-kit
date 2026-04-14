/**
 * COMPONENT 2: Client-side UTM Capture Component
 * Updated: 2026-04-14 04:12 EDT
 * 
 * This component runs on page load to capture UTM parameters from the URL
 * and save them to localStorage for persistence through Stripe checkout.
 */

'use client';

import { useEffect } from 'react';
import { captureUTMAttribution } from '@/lib/attribution-capture';

export function UTMCaptureClient() {
  useEffect(() => {
    // Capture UTM parameters on page load
    captureUTMAttribution();
  }, []);

  // This component renders nothing — it's purely for side effects
  return null;
}
