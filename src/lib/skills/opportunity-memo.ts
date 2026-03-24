import { loadSkill } from '@/lib/skill-loader'

export function getOpportunityMemoPrompt(): string {
  return loadSkill('opportunity-memo').prompt
}
