import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Wraps a promise in a timeout.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
  // Check if we're on localhost and it's a Supabase Edge Function call
  // We want to skip timeouts for local edge functions as they can be very slow to boot
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  // If we're local, we might want to be more generous with timeouts
  const effectiveTimeout = isLocalhost ? Math.max(timeoutMs, 60000) : timeoutMs;

  let timeoutHandle: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Operation timed out after ${effectiveTimeout}ms`));
    }, effectiveTimeout);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

/**
 * Specifically for Supabase queries that return PostgrestResponse.
 */
export async function fetchWithTimeout<T>(
  query: Promise<PostgrestResponse<T>>,
  timeoutMs = DEFAULT_TIMEOUT
): Promise<PostgrestResponse<T>> {
  return withTimeout(query, timeoutMs);
}

/**
 * Specifically for Supabase single-row queries.
 */
export async function fetchSingleWithTimeout<T>(
  query: Promise<PostgrestSingleResponse<T>>,
  timeoutMs = DEFAULT_TIMEOUT
): Promise<PostgrestSingleResponse<T>> {
  return withTimeout(query, timeoutMs);
}
