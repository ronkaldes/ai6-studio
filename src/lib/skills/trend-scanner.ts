import { loadSkill } from '@/lib/skill-loader'

export function getTrendScanPrompt(): string {
  return loadSkill('trend-scanner').prompt
}
