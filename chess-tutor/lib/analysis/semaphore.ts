declare global {
  var __analysisRunning: boolean | undefined;
}

/**
 * Try to acquire the global analysis lock.
 * Returns true if acquired, false if another analysis is already running.
 * Only one Stockfish analysis job should run at a time — the engine pool
 * has one instance and sequential position analysis is CPU-bound.
 */
export function tryAcquireAnalysis(): boolean {
  if (globalThis.__analysisRunning) return false;
  globalThis.__analysisRunning = true;
  return true;
}

export function releaseAnalysis(): void {
  globalThis.__analysisRunning = false;
}
