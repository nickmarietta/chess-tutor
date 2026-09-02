function isEnabled(value: string | undefined): boolean {
  return value?.toLowerCase() !== "false";
}

/** Gates AI-tutor routes (e.g. /api/tutor). Not yet wired to a route — no AI route exists yet. */
export function isAiEnabled(): boolean {
  return isEnabled(process.env.AI_ENABLED);
}

/** Gates the batch analysis pipeline (lib/analysis/service.ts). */
export function isAnalysisEnabled(): boolean {
  return isEnabled(process.env.ANALYSIS_ENABLED);
}

/** Gates new game imports (app/api/games/route.ts POST). */
export function isImportsEnabled(): boolean {
  return isEnabled(process.env.IMPORTS_ENABLED);
}
