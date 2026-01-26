/**
 * Opik Server Initialization
 *
 * This module provides a simple initialization function for API routes
 * to log Opik configuration status.
 *
 * @module lib/opik/server
 */

/**
 * Initialize Opik in a server/API route context
 *
 * This function checks if Opik is properly configured and logs the status.
 * It should be called at the beginning of API routes that use Opik tracing.
 *
 * @example
 * ```typescript
 * import { initOpikServer } from "@/lib/opik";
 *
 * export async function POST(request: Request) {
 *   initOpikServer(); // Logs Opik configuration status
 *   // ... rest of your API route
 * }
 * ```
 *
 * @returns void
 */
export function initOpikServer(): void {
  // Only run in server context
  if (typeof window !== "undefined") {
    return;
  }

  // Log Opik configuration status
  if (process.env.OPIK_API_KEY && process.env.OPIK_WORKSPACE_NAME) {
    console.log("✅ Opik configured for this route");
  }
}
