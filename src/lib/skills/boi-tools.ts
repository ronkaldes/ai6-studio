import { loadSkill } from '@/lib/skill-loader'

/**
 * Extracts a specific tool section from the boi-tools SKILL.md.
 * Sections are delimited by ## headers matching the tool name.
 * @param toolName - e.g. 'futureScenarios', 'personas', 'hmw'
 */
export function getBoiToolPrompt(toolName: string): string {
  const { prompt } = loadSkill('boi-tools')
  return extractSection(prompt, toolName)
}

function extractSection(body: string, sectionName: string): string {
  const pattern = new RegExp(`^## ${sectionName}\\s*\\n`, 'm')
  const match = pattern.exec(body)
  if (!match) {
    throw new Error(`BOI tool section "${sectionName}" not found in SKILL.md`)
  }

  const start = match.index + match[0].length
  // Find the next ## header or end of string
  const nextHeader = body.indexOf('\n## ', start)
  const end = nextHeader === -1 ? body.length : nextHeader

  return body.slice(start, end).trim()
}
