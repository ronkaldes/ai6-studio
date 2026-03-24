import { loadSkill } from '@/lib/skill-loader'

const AGENT_NAMES = [
  'market-analyst',
  'technical-architect',
  'vc-evaluator',
  'distribution-strategist',
  'customer-advocate',
  'red-team',
] as const

export type AgentName = (typeof AGENT_NAMES)[number]

/**
 * Returns the prompt for a specific validation agent.
 * @param agentName - e.g. 'market-analyst', 'red-team'
 */
export function getAgentPrompt(agentName: string): string {
  return loadSkill(`validator/${agentName}`).prompt
}

/**
 * Returns all agent names for iteration.
 */
export function getAgentNames(): readonly string[] {
  return AGENT_NAMES
}
