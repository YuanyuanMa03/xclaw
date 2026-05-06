/**
 * Langfuse integration — disabled in xclaw.
 * All functions are no-ops.
 */

export function isLangfuseEnabled(): boolean {
  return false
}

export function getLangfuseProcessor(): null {
  return null
}

export function initLangfuse(): boolean {
  return false
}

export async function shutdownLangfuse(): Promise<void> {
  // no-op
}
