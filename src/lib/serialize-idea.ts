// Parses all JSON String fields on a Prisma Idea record into typed objects.
// Used by /api/ideas and /api/ideas/[id] to avoid duplicating 12+ JSON.parse calls.

type PrismaIdea = Record<string, unknown>;

const JSON_FIELDS = [
  'opportunityMemo',
  'dvfScores',
  'assumptionMap',
  'experiments',
  'boardVotes',
  'userPersonas',
  'hmwStatements',
  'futureScenarios',
  'businessReinvention',
  'aiStrategyMatrix',
  'aiBlueprint',
  'aiSimulation',
] as const;

export function serializeIdea(idea: PrismaIdea) {
  const result = { ...idea };
  for (const field of JSON_FIELDS) {
    const val = result[field];
    try {
      result[field] = typeof val === 'string' ? JSON.parse(val) : val ?? null;
    } catch {
      result[field] = null;
    }
  }
  return result;
}
