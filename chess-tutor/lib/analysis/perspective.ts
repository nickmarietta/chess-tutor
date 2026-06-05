import type { MoveAnalysis, UserColor } from "@/types";

export type ReviewFocus = {
  selectedAnalysis: MoveAnalysis;
  focusAnalysis: MoveAnalysis;
  isUserMove: boolean;
  isOpponentMove: boolean;
  usesReplyContext: boolean;
};

export function isUsersMove(
  analysis: MoveAnalysis,
  userColor: UserColor | null,
): boolean {
  if (!userColor) return true;
  return analysis.side_to_move === userColor;
}

export function resolveReviewFocus(
  selectedAnalysis: MoveAnalysis | null,
  analyses: MoveAnalysis[],
  userColor: UserColor | null,
): ReviewFocus | null {
  if (!selectedAnalysis) return null;

  const isUserMoveForSelection = isUsersMove(selectedAnalysis, userColor);
  if (isUserMoveForSelection) {
    return {
      selectedAnalysis,
      focusAnalysis: selectedAnalysis,
      isUserMove: true,
      isOpponentMove: false,
      usesReplyContext: false,
    };
  }

  const replyAnalysis =
    analyses.find(
      (analysis) =>
        analysis.ply === selectedAnalysis.ply + 1 &&
        (userColor ? analysis.side_to_move === userColor : true),
    ) ?? selectedAnalysis;

  return {
    selectedAnalysis,
    focusAnalysis: replyAnalysis,
    isUserMove: false,
    isOpponentMove: true,
    usesReplyContext: replyAnalysis.position_id !== selectedAnalysis.position_id,
  };
}
