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

export interface Campaign {
  id: string;
  name: string;
  domainFocus: string | null;
  minScore: number;
  deadline: string | null;
  status: 'active' | 'closed';
  summary: string | null;
  createdAt: string;
  updatedAt: string;
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
  campaignId: string | null;
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

export interface SprintRetrospective {
  id: string;
  ideaId: string;
  hypothesisValidated: 'yes' | 'partially' | 'no';
  actualOutcome: string;
  ventureScoreAccuracy: number; // 1-5
  materializedKillRisks: string[];
  keyLearning: string | null;
  wouldBuildAgain: 'yes' | 'with_changes' | 'no';
  createdAt: string;
}

// ── BOI Innovation Tools ────────────────────────────────────

export interface FutureScenario {
  title: string;
  narrative: string;
  opportunities: string[];
  threats: string[];
  likelihood: number;
  timeframe: string;
  key_drivers: string[];
}

export interface FutureScenarioRunResult {
  year: number;
  industry: string;
  sector: string;
  scenarios: FutureScenario[];
}

export interface UserPersona {
  name: string;
  age: number;
  role: string;
  background: string;
  goals: string[];
  pain_points: string[];
  behaviors: string[];
  motivations: string[];
  tech_comfort: string;
  key_quote: string;
}

export interface HMWStatement {
  statement: string;
  category: 'desirability' | 'feasibility' | 'viability' | 'wild_card';
  innovation_potential: number;
  rationale: string;
}

export interface AIOpportunity {
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  category: string;
}

export interface RoadmapPhase {
  phase: string;
  initiatives: string[];
  expected_outcomes: string[];
}

export interface BusinessReinventionResult {
  company: string;
  industry: string;
  current_state_analysis: string;
  ai_opportunities: AIOpportunity[];
  transformation_roadmap: RoadmapPhase[];
  risk_assessment: string[];
  recommended_first_step: string;
}

export interface StrategyRecommendation {
  title: string;
  description: string;
  impact: number;
  timeline: string;
  category: string;
}

export interface PriorityItem {
  action: string;
  urgency: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  impact: 'low' | 'medium' | 'high';
}

export interface AIStrategyMatrixResult {
  product_assessment: string;
  competitive_position: string;
  strategic_quadrant: 'optimize' | 'differentiate' | 'transform' | 'disrupt';
  recommendations: StrategyRecommendation[];
  priority_matrix: PriorityItem[];
  competitive_advantages: string[];
  risks: string[];
}

export interface BlueprintPillar {
  name: string;
  description: string;
  key_technologies: string[];
  use_cases: string[];
}

export interface BlueprintPhase {
  name: string;
  objectives: string[];
  deliverables: string[];
  dependencies: string[];
}

export interface AIBlueprintResult {
  industry: string;
  current_adoption_level: string;
  executive_summary: string;
  transformation_pillars: BlueprintPillar[];
  implementation_phases: BlueprintPhase[];
  kpis: string[];
  investment_estimate: string;
  change_management_plan: string[];
}

export interface SimulationOutcome {
  metric: string;
  baseline: string;
  projected: string;
  confidence: number;
}

export interface RiskScenario {
  scenario: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface SimulationTimeline {
  quarter: string;
  milestones: string[];
  expected_roi: string;
}

export interface AISimulationResult {
  scenario: string;
  parameters: {
    budget: string;
    data_strategy: string;
    business_goal: string;
    integration_approach: string;
  };
  projected_outcomes: SimulationOutcome[];
  risk_scenarios: RiskScenario[];
  timeline: SimulationTimeline[];
  success_probability: number;
  key_assumptions: string[];
  recommended_adjustments: string[];
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
  // BOI tool outputs
  userPersonas: UserPersona[] | null;
  hmwStatements: HMWStatement[] | null;
  futureScenarios: FutureScenario[] | null;
  businessReinvention: BusinessReinventionResult | null;
  aiStrategyMatrix: AIStrategyMatrixResult | null;
  aiBlueprint: AIBlueprintResult | null;
  aiSimulation: AISimulationResult | null;
  sprintRetrospective?: SprintRetrospective | null;
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

// ── Analytics ───────────────────────────────────────────────

export interface StudioAnalytics {
  funnel: FunnelStage[];
  avgDaysPerStage: Record<string, number>;
  ventureScoreDistribution: { range: string; count: number }[];
  conversionRate: { total_signals: number; promoted: number; rate: number };
  sprintSuccessRate: { total_go: number; graduated: number; rate: number };
  scanHistory: { runId: string; date: string; count: number; avgScore: number }[];
  killRateByCategory: Record<string, number>;
}

export interface FunnelStage {
  stage: string;
  count: number;
  label: string;
}

// ── Duplicate Detection ────────────────────────────────────

export interface SimilarityMatch {
  ideaId: string;
  title: string;
  reason: string;
}

export interface SimilarityCheckResult {
  similar: boolean;
  matches: SimilarityMatch[];
}

// ── Comments & Voting ───────────────────────────────────────

export interface Comment {
  id: string;
  ideaId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface IdeaVote {
  id: string;
  ideaId: string;
  userName: string;
  vote: number;
  createdAt: string;
}
