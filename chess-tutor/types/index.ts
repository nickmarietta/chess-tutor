export type GameSource = "pgn_paste" | "chess_com";

export type UserColor = "white" | "black";

export type ParsedPosition = {
  ply: number;
  fen: string;
  moveSan: string | null;
};

export type ParsedGameMetadata = {
  whitePlayer: string | null;
  blackPlayer: string | null;
  result: string | null;
  playedAt: string | null;
  positions: ParsedPosition[];
};

export type Game = {
  id: string;
  user_id: string | null;
  source: GameSource;
  source_game_id: string | null;
  white_player: string | null;
  black_player: string | null;
  player_username: string | null;
  user_color: UserColor | null;
  analysis_status: "pending" | "analyzing" | "completed" | "failed";
  analysis_error: string | null;
  analysis_completed_at: string | null;
  result: string | null;
  played_at: string | null;
  raw_pgn: string;
  created_at: string;
};

export type Position = {
  id: string;
  game_id: string;
  ply: number;
  fen: string;
  move_san: string | null;
  created_at: string;
};

export type ChessComArchiveGame = {
  url: string;
  pgn: string | null;
  time_control: string | null;
  end_time: number | null;
  rated: boolean;
  white: { username: string; rating?: number; result?: string };
  black: { username: string; rating?: number; result?: string };
};

export type {
  ArrowType,
  BoardAnnotations,
  BoardArrow,
  BoardHighlight,
  HighlightType,
} from "./annotations";
export type {
  AnalysisStatus,
  CandidateMove,
  EngineLineMove,
  MistakeSeverity,
  MistakeTag,
  MoveAnalysis,
  UserMistakeStat,
} from "./analysis";
