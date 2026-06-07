# Graph Report - .  (2026-06-05)

## Corpus Check
- Corpus is ~12,784 words - fits in a single context window. You may not need a graph.

## Summary
- 340 nodes · 629 edges · 34 communities (15 shown, 19 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Game Analysis Pipeline|Game Analysis Pipeline]]
- [[_COMMUNITY_Game Review & Perspective|Game Review & Perspective]]
- [[_COMMUNITY_Position Analysis Engine|Position Analysis Engine]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_Chess.com API Integration|Chess.com API Integration]]
- [[_COMMUNITY_Engine Eval UI|Engine Eval UI]]
- [[_COMMUNITY_Analysis Line Engine|Analysis Line Engine]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_App Layout & Theming|App Layout & Theming]]
- [[_COMMUNITY_Board Rendering|Board Rendering]]
- [[_COMMUNITY_Game Browse & Home|Game Browse & Home]]
- [[_COMMUNITY_Chess Type Definitions|Chess Type Definitions]]
- [[_COMMUNITY_Live Engine Eval|Live Engine Eval]]
- [[_COMMUNITY_Domain Type Exports|Domain Type Exports]]
- [[_COMMUNITY_Static Brand Assets|Static Brand Assets]]
- [[_COMMUNITY_Agent Configuration Docs|Agent Configuration Docs]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_DB Schema Migrations|DB Schema Migrations]]
- [[_COMMUNITY_Games List API|Games List API]]
- [[_COMMUNITY_Eval Label Formatter|Eval Label Formatter]]
- [[_COMMUNITY_Student Move Detection|Student Move Detection]]
- [[_COMMUNITY_Parsed Game Type|Parsed Game Type]]
- [[_COMMUNITY_Game Metadata Type|Game Metadata Type]]
- [[_COMMUNITY_Parsed Position Type|Parsed Position Type]]
- [[_COMMUNITY_Claude Dev Instructions|Claude Dev Instructions]]
- [[_COMMUNITY_Project README|Project README]]
- [[_COMMUNITY_GameCard Component|GameCard Component]]
- [[_COMMUNITY_Load Archives Action|Load Archives Action]]
- [[_COMMUNITY_Load Games Action|Load Games Action]]
- [[_COMMUNITY_PGN Paste Handler|PGN Paste Handler]]
- [[_COMMUNITY_Chess.js Library Ref|Chess.js Library Ref]]
- [[_COMMUNITY_File Icon Asset|File Icon Asset]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `analyzePositionWithStockfish()` - 14 edges
3. `MoveAnalysis` - 14 edges
4. `GameReview()` - 13 edges
5. `createServerClient()` - 13 edges
6. `analyzePositions()` - 12 edges
7. `UserColor` - 12 edges
8. `EvalBar()` - 10 edges
9. `analyzeGameNow()` - 10 edges
10. `getGameById()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --semantically_similar_to--> `GET /api/chesscom/games`  [INFERRED] [semantically similar]
  chess-tutor/app/api/chesscom/archives/route.ts → /Users/nickmarietta/Dev/chess-tutor/chess-tutor/app/api/chesscom/games/route.ts
- `evalToWhiteWinningChances()` --semantically_similar_to--> `White-Perspective Eval Normalization Pattern`  [INFERRED] [semantically similar]
  chess-tutor/lib/chess/evalBar.ts → chess-tutor/lib/engine/normalizeScore.ts
- `ImportPage()` --references--> `POST()`  [INFERRED]
  chess-tutor/app/import/page.tsx → chess-tutor/app/api/games/route.ts
- `POST /api/eval Route Handler` --semantically_similar_to--> `EvalBar()`  [INFERRED] [semantically similar]
  chess-tutor/app/api/eval/route.ts → chess-tutor/components/board/EvalBar.tsx
- `GameReview()` --references--> `@supabase/supabase-js Library Dependency`  [INFERRED]
  chess-tutor/components/games/GameReview.tsx → chess-tutor/package.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Chess.com Import API Flow (archives → games → POST /api/games)** — archives_route_get, games_route_get_chesscom, games_route_post [INFERRED 0.85]
- **Game Review Board Rendering Pipeline** — games_gamereview_gamereview, board_chessboardwitheval_chessboardwitheval, board_analysisboard_analysisboard, board_evalbar_evalbar [INFERRED 0.90]
- **Theme Management System** — theme_themeprovider_themeprovider, theme_themeprovider_usetheme, theme_themetoggle_themetoggle [EXTRACTED 1.00]
- **Game Import and Analysis Flow** — api_games_post, concept_pgn_import, concept_game_analysis_pipeline, concept_stockfish_engine [INFERRED 0.85]
- **Full Game Analysis Pipeline: Stockfish -> Classify -> Persist -> Stats** — analysis_service_analyzefen, analysis_service_classifyseverity, analysis_service_classifymistake_tags, supabase_analysis_replacemoveanalyses, supabase_analysis_upsertusermistakestats [EXTRACTED 0.95]
- **Live Eval FEN Guard: BoardChessState -> normalizeFen -> FEN match check -> LiveEngineEval** — hooks_useliveengineeval, chess_boardstate_normalizefen, types_engineeval_liveengineeval, concept_stale_eval_guard [INFERRED 0.85]
- **Engine Score Normalization Chain: RawEngineScore -> normalizeScoreToWhite -> barValueFromNormalized** — engine_normalizescore_rawenginescore, engine_normalizescore_normalizescoretowhite, engine_normalizescore_barvalueformnormalized, engine_normalizescore_normalizedenginescore [EXTRACTED 0.95]

## Communities (34 total, 19 thin omitted)

### Community 0 - "Game Analysis Pipeline"
Cohesion: 0.09
Nodes (35): analyzeGameNow(), ensureGameAnalysis(), updateMistakeStats(), parsePgn(), parsePlayedAt(), normalize(), resolveUserColor(), UserColor (+27 more)

### Community 1 - "Game Review & Perspective"
Cohesion: 0.12
Nodes (31): GameReviewPage (Dynamic Route), isUsersMove Function, isUsersMove(), resolveReviewFocus(), ReviewFocus, AnalysisLineMoves(), ChessBoardWithEval(), MoveCell() (+23 more)

### Community 2 - "Position Analysis Engine"
Cohesion: 0.11
Nodes (33): analyzeFen(), analyzePositions(), classifyMistakeTags Function, classifyMistakeTags(), classifySeverity(), describePhase(), getImmediateThreats(), isCriticalMove() (+25 more)

### Community 3 - "Project Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, chess.js, next, react, react-chessboard, react-dom, @supabase/supabase-js, devDependencies (+16 more)

### Community 4 - "Chess.com API Integration"
Cohesion: 0.13
Nodes (15): GET(), GET(), extractGameIdFromUrl(), fetchArchives(), fetchMonthGames(), GET /api/chesscom/games, ChessComImport(), importGame (+7 more)

### Community 5 - "Engine Eval UI"
Cohesion: 0.18
Nodes (18): POST /api/eval Route Handler, POST /api/games Route Handler, ChessBoardWithEvalProps, EvalBar(), EvalBarProps, cpWinningChances(), evalToWhiteWinningChances(), formatEvalLabel() (+10 more)

### Community 6 - "Analysis Line Engine"
Cohesion: 0.18
Nodes (16): AnalysisLineMovesProps, AnalysisLine, AnalysisNode, applyMove(), buildAnalysisHistorySan(), createAnalysisLine(), displayPly(), formatAnalysisLabel() (+8 more)

### Community 7 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "App Layout & Theming"
Cohesion: 0.18
Nodes (13): geistMono, geistSans, metadata, RootLayout(), Dark/Light Theme System, Header(), nav, Theme (+5 more)

### Community 9 - "Board Rendering"
Cohesion: 0.21
Nodes (14): AnalysisBoard(), AnalysisBoardProps, annotationsToArrows(), annotationsToSquareStyles(), ARROW_COLORS, BoardAnnotationsProps, ChessboardArrow, HIGHLIGHT_STYLES (+6 more)

### Community 10 - "Game Browse & Home"
Cohesion: 0.22
Nodes (8): formatDate(), formatPlayers(), GameCard(), GameCardProps, GamesPage(), PageContainer(), PageContainerProps, @supabase/supabase-js Library Dependency

### Community 11 - "Chess Type Definitions"
Cohesion: 0.26
Nodes (10): GameSource, HelpMode, ParsedGame, ParsedGameMetadata, ParsedPosition, GameDetail, GameRow, GameWithPositionCount (+2 more)

### Community 12 - "Live Engine Eval"
Cohesion: 0.31
Nodes (8): BoardChessState, createBoardChessState(), normalizeFen(), Stale Eval Guard Pattern (FEN mismatch detection), displayableEval(), logEvalDebug(), useLiveEngineEval(), LiveEngineEval

### Community 13 - "Domain Type Exports"
Cohesion: 0.33
Nodes (6): GameSource, HelpMode, GameDetail, GameRow, PositionRow, ReflectionRow

### Community 14 - "Static Brand Assets"
Cohesion: 0.50
Nodes (4): Globe SVG Icon, Next.js Wordmark SVG, Vercel Triangle Logo SVG, Window UI Icon SVG

## Knowledge Gaps
- **109 isolated node(s):** `RouteContext`, `PageProps`, `geistSans`, `geistMono`, `metadata` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `EvalBar()` connect `Engine Eval UI` to `Game Review & Perspective`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `BoardAnnotations` connect `Board Rendering` to `Game Review & Perspective`, `Engine Eval UI`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `GameReview()` (e.g. with `Interactive Analysis Mode` and `@supabase/supabase-js Library Dependency`) actually correct?**
  _`GameReview()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RouteContext`, `PageProps`, `geistSans` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Game Analysis Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._
- **Should `Game Review & Perspective` be split into smaller, more focused modules?**
  _Cohesion score 0.11740890688259109 - nodes in this community are weakly interconnected._
- **Should `Position Analysis Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.10796221322537113 - nodes in this community are weakly interconnected._