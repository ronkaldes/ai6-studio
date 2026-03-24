import { readFileSync } from 'fs'
import { join } from 'path'

export interface SkillMeta {
  name: string
  description: string
  version: string
  tools: string[]
  output_format: string
  trigger: string
}

interface LoadedSkill {
  meta: SkillMeta
  prompt: string
}

const cache = new Map<string, LoadedSkill>()

/**
 * Loads a SKILL.md file from the skills/ directory.
 * @param skillPath - e.g. 'trend-scanner' loads skills/trend-scanner/SKILL.md
 *                    e.g. 'validator/market-analyst' loads skills/validator/market-analyst.md
 */
export function loadSkill(skillPath: string): LoadedSkill {
  if (cache.has(skillPath)) return cache.get(skillPath)!

  const isSubSkill = skillPath.includes('/')
  const filePath = isSubSkill
    ? join(process.cwd(), 'skills', `${skillPath}.md`)
    : join(process.cwd(), 'skills', skillPath, 'SKILL.md')

  const raw = readFileSync(filePath, 'utf-8')
  const { meta, body } = parseFrontmatter(raw)

  const skill = { meta, prompt: body }
  if (process.env.NODE_ENV === 'production') {
    cache.set(skillPath, skill)
  }
  return skill
}

/**
 * Loads a skill and appends Studio Context to the prompt.
 */
export function assemblePrompt(skillPath: string, context: string): string {
  const { prompt } = loadSkill(skillPath)
  return `${prompt}\n\n---\n\n## Current Studio Context\n\n${context}`
}

function parseFrontmatter(raw: string): { meta: SkillMeta; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return {
      meta: { name: '', description: '', version: '1.0', tools: [], output_format: 'json', trigger: 'manual' },
      body: raw.trim(),
    }
  }

  const yamlBlock = match[1]
  const body = match[2].trim()

  // Simple YAML parser (no library needed for flat key-value)
  const meta: Record<string, string | string[]> = {}
  for (const line of yamlBlock.split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/)
    if (kv) {
      const [, key, val] = kv
      if (val.startsWith('[') && val.endsWith(']')) {
        meta[key] = val.slice(1, -1).split(',').map(s => s.trim())
      } else {
        meta[key] = val.trim()
      }
    }
  }

  return {
    meta: {
      name: (meta.name as string) || '',
      description: (meta.description as string) || '',
      version: (meta.version as string) || '1.0',
      tools: (meta.tools as string[]) || [],
      output_format: (meta.output_format as string) || 'json',
      trigger: (meta.trigger as string) || 'manual',
    },
    body,
  }
}
