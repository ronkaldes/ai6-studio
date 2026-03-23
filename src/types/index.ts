// src/types/index.ts

// ── Trend Radar ──────────────────────────────────────────────

export type SignalSource = 'github' | 'reddit' | 'producthunt' | 'arxiv' | 'hn' | 'manual';

export type SignalCategory =
  | 'ai'
  | 'developer_tools'
  | 'consumer'
  | 'hardware'
  | 'data'
  | 'saas'
  | 'other';

export type PipelineStatus = 'new' | 'reviewed' | 'promoted' | 'archived';

export interface OpportunityCard {
  problem: string;
  why_now: string;
  studio_angle: string;
  sprint_hypothesis: string;
  kill_risks: [string, string, string]; // always exactly 3
}

export interface TrendSignal {
  id: string;
  source: SignalSource;
  title: string;
  url: string | null;
  velocitySignal: string | null;      // e.g. "↑ 2.3k stars this week"
  opportunityScore: number;            // 0–10
  category: SignalCategory | null;
  aiSummary: string | null;
  opportunityCard: OpportunityCard | null;
  pipelineStatus: PipelineStatus;
  runId: string | null;
  createdAt: string;
  updatedAt: string;
  ideaId: string | null;
}

export interface ScanResult {
  run_id: string;
  signals_found: number;
  signals_above_threshold: number;
  scan_duration_ms: number;
  signals: TrendSignal[];
}

// ── Idea Pipeline ────────────────────────────────────────────

export type IdeaStage =
  | 'signal'
  | 'refining'
  | 'validating'
  | 'decision_gate'
  | 'active_sprint'
  | 'graduated';

export type BoardVerdict = 'go' | 'conditional' | 'pivot' | 'kill';

export interface VentureScoreBreakdown {
  desirability: number;        // 1–5
  strategic_fit: number;       // 1–5
  market_size: number;         // 1–5
  technical_feasibility: number; // 1–5
  revenue_path: number;        // 1–5
  distribution_leverage: number; // 1–5
  why_now: number;             // 1–5
  total: number;               // 0–100 computed
}

export interface OpportunityMemo {
  problem: string;
  target_customer: string;
  solution: string;
  moat: string;
  why_now: string;
  market_size: string;
  risks: string[];
  validation_plan: ValidationPlan[];
}

export interface ValidationPlan {
  assumption: string;
  experiment: string;
  success_metric: string;
  timeline_days: number;
}

export interface AgentScore {
  dimension: string;
  scores: Record<string, number>;
  rationale: string;
  confidence?: 'low' | 'medium' | 'high';
  extra?: Record<string, unknown>;  // agent-specific fields
}

export interface AssumptionItem {
  id: string;
  text: string;
  importance: number;   // 0–1 for 2×2 Y position
  evidence: number;     // 0–1 for 2×2 X position
  quadrant?: 'test_first' | 'validate' | 'monitor' | 'deprioritize';
}

export type ExperimentMethod =
  | 'interview'
  | 'smoke_test'
  | 'landing_page'
  | 'concierge'
  | 'wizard_of_oz'
  | 'pre_sale';

export type ExperimentStatus = 'not_started' | 'running' | 'complete' | 'inconclusive';

export interface ExperimentCard {
  id: string;
  assumption: string;
  hypothesis: string;
  method: ExperimentMethod;
  success_metric: string;
  timeline_days: number;
  status: ExperimentStatus;
  result?: string;
}

export interface Idea {
  id: string;
  title: string;
  stage: IdeaStage;
  ventureScore: number | null;
  scoreBreakdown: VentureScoreBreakdown | null;
  opportunityMemo: OpportunityMemo | null;
  dvfScores: AgentScore[] | null;
  assumptionMap: AssumptionItem[] | null;
  experiments: ExperimentCard[] | null;
  sourceSignalId: string | null;
  assigneeId: string | null;
  submittedBy: string | null;
  daysInStage: number;
  boardDecision: BoardVerdict | null;
  boardRationale: string | null;
  boardVotes: BoardVote[] | null;
  createdAt: string;
  updatedAt: string;
}

// ── Advisory Board ───────────────────────────────────────────

export interface BoardVote {
  member_name: string;
  member_email: string;
  verdict: BoardVerdict;
  rationale: string;
  voted_at: string;
}

export interface BoardSession {
  id: string;
  ideaId: string;
  sessionDate: string;
  attendees: string[];
  decision: BoardVerdict;
  votes: BoardVote[];
  learnings: string | null;
  createdAt: string;
}

// ── Settings ─────────────────────────────────────────────────

export interface ProjectContext {
  id: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'lead' | 'member' | 'board';
  createdAt: string;
}
