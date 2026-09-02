import { buildEngineBrief } from "./engineBrief";
import { buildBoardAnnotations } from "./boardAnnotations";
import { computeAnalysisHash } from "./analysisHash";
import { renderDeterministicExplanation } from "./explainRenderer";
import { getOllamaConfig, streamOllamaChat } from "./ollamaClient";
import { buildExplainPrompt } from "./prompt";
import { redactBriefForHelpMode } from "./redactBrief";
import { extractCompleteSentences, validateSentence } from "./sentenceValidator";
import {
  findCachedExplanation,
  saveCoachExplanation,
} from "@/lib/supabase/coachExplanations";
import type { HelpMode, MoveAnalysis } from "@/types";

type ExplainMoveDeps = Partial<{
  findCachedExplanation: typeof findCachedExplanation;
  saveCoachExplanation: typeof saveCoachExplanation;
  streamOllamaChat: typeof streamOllamaChat;
  getOllamaConfig: typeof getOllamaConfig;
}>;

/**
 * Streams a validated explain-move response for the given analysis and
 * help_mode. Order of operations:
 *
 * 1. Cache hit -> yield the cached response, no Ollama call.
 * 2. Otherwise, stream from Ollama, buffering into complete sentences and
 *    validating each one against the (help_mode-redacted) brief before it
 *    is ever yielded — nothing invalid is ever shown.
 * 3. On the first invalid sentence, stop generating. Sentences already
 *    yielded stay shown (each was independently validated true), but the
 *    response is not cached, since it isn't a clean, complete success.
 * 4. If nothing valid was produced at all (Ollama unreachable, or the very
 *    first sentence fails validation), fall back to the deterministic
 *    renderer. The fallback is never cached.
 * 5. A clean, fully-validated response is cached against `coach_explanations`.
 */
export async function* explainMove(
  analysis: MoveAnalysis,
  helpMode: HelpMode,
  deps: ExplainMoveDeps = {},
): AsyncGenerator<string> {
  const findCached = deps.findCachedExplanation ?? findCachedExplanation;
  const saveExplanation = deps.saveCoachExplanation ?? saveCoachExplanation;
  const streamChat = deps.streamOllamaChat ?? streamOllamaChat;
  const getConfig = deps.getOllamaConfig ?? getOllamaConfig;

  const brief = buildEngineBrief(analysis);
  const redacted = redactBriefForHelpMode(brief, helpMode);
  const analysisHash = computeAnalysisHash(analysis);

  const cached = await findCached({
    gameId: analysis.game_id,
    positionId: analysis.position_id,
    helpMode,
    analysisHash,
  });
  if (cached) {
    yield cached.coach_response;
    return;
  }

  const config = getConfig();
  const prompt = buildExplainPrompt(redacted);

  let buffer = "";
  let validatedText = "";
  let failed = false;

  try {
    for await (const delta of streamChat(prompt, config)) {
      buffer += delta;
      const { sentences, remainder } = extractCompleteSentences(buffer);
      buffer = remainder;

      for (const sentence of sentences) {
        if (!validateSentence(sentence, redacted)) {
          failed = true;
          break;
        }
        validatedText += (validatedText ? " " : "") + sentence;
        yield sentence;
      }
      if (failed) break;
    }

    const trailing = buffer.trim();
    if (!failed && /[.!?]$/.test(trailing)) {
      if (!validateSentence(trailing, redacted)) {
        failed = true;
      } else {
        validatedText += (validatedText ? " " : "") + trailing;
        yield trailing;
      }
    }
  } catch {
    failed = true;
  }

  if (!validatedText) {
    yield renderDeterministicExplanation(redacted);
    return;
  }

  if (failed) {
    // Partial success already shown to the caller — every yielded sentence
    // was independently valid. Not cached: this isn't a complete response.
    return;
  }

  await saveExplanation({
    gameId: analysis.game_id,
    positionId: analysis.position_id,
    helpMode,
    analysisHash,
    coachResponse: validatedText,
    boardAnnotations: buildBoardAnnotations(redacted),
    modelProvider: "ollama",
    modelName: config.model,
  });
}
