import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

/**
 * Helper to add a timeout to any promise.
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs = 30000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Specifically for Supabase queries that return PostgrestResponse.
 */
export async function fetchWithTimeout<T>(
  query: Promise<PostgrestResponse<T>>,
  timeoutMs = 30000
): Promise<PostgrestResponse<T>> {
  return withTimeout(query, timeoutMs);
}

/**
 * Specifically for Supabase single-row queries.
 */
export async function fetchSingleWithTimeout<T>(
  query: Promise<PostgrestSingleResponse<T>>,
  timeoutMs = 30000
): Promise<PostgrestSingleResponse<T>> {
  return withTimeout(query, timeoutMs);
}
