/**
 * COMPONENT 3: Attribution API Endpoint
 * Updated: 2026-04-14 04:40 EDT (Upstash Redis)
 * 
 * POST /api/attribution
 * Receives attribution data from thank you pages
 * Validates request origin to prevent cross-site POST attacks
 * Appends entries to Upstash Redis "email-attribution" list
 * Never overwrites existing entries
 */

import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Initialize Upstash Redis client from environment variables
const redis = Redis.fromEnv();

// Allowed origins for attribution requests
const ALLOWED_ORIGINS = [
  'https://sellerdefensekit.com',
  'https://www.sellerdefensekit.com',
  'https://etsy-ip-landing.vercel.app',
  'http://localhost:3000', // for local testing
];

export interface AttributionLogRequest {
  session_id: string;
  utm_campaign: string;
  utm_content: string;
  utm_source: string;
  utm_medium: string;
  referrer: string;
  thank_you_referrer: string;
  product: string;
  amount: number;
  timestamp: string;
  stale?: boolean; // Optional flag indicating localStorage data was >30 days old
  age_days?: number; // Optional age in days of the captured attribution data
}

export interface AttributionLogEntry extends AttributionLogRequest {
  logged_at: string;
  id: string;
  // stale and age_days pass through from request if present
}

export async function POST(request: NextRequest) {
  try {
    // Validate request origin using origin or referer header
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');

    const requestOrigin = origin || referer?.split('/').slice(0, 3).join('/');

    if (!requestOrigin) {
      console.warn('[Attribution API] Request missing origin/referer header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if origin is in allowed list
    const isAllowedOrigin = ALLOWED_ORIGINS.some((allowedOrigin) =>
      requestOrigin.startsWith(allowedOrigin)
    );

    if (!isAllowedOrigin) {
      console.warn(
        '[Attribution API] Request from unauthorized origin',
        { requestOrigin, allowedOrigins: ALLOWED_ORIGINS }
      );
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const data: AttributionLogRequest = await request.json();

    // Validate required fields
    if (!data.session_id || !data.product || typeof data.amount !== 'number') {
      console.warn('[Attribution API] Missing required fields', data);
      return NextResponse.json(
        { error: 'Missing required fields: session_id, product, amount' },
        { status: 400 }
      );
    }

    // Create log entry with metadata
    // Pass through optional stale/age_days fields if present in request
    const entry: AttributionLogEntry = {
      ...data,
      logged_at: new Date().toISOString(),
      id: `${data.session_id}-${Date.now()}`,
      ...(data.stale !== undefined && { stale: data.stale }),
      ...(data.age_days !== undefined && { age_days: data.age_days }),
    };

    // Append to Redis list using lpush (prepend to list)
    // lpush adds to the head of the list; entries are stored as JSON strings
    try {
      const result = await redis.lpush('email-attribution', JSON.stringify(entry));
      
      console.log(`[Attribution API] Entry logged. List size: ${result}`, {
        id: entry.id,
        product: entry.product,
        utm_campaign: entry.utm_campaign,
        amount: entry.amount,
        stale: entry.stale || false,
        age_days: entry.age_days || 0,
      });

      return NextResponse.json(
        {
          success: true,
          id: entry.id,
          message: 'Attribution logged successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('[Attribution API] Error writing to Redis:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Attribution API] Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
