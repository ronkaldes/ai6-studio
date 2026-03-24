import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Studio Data...');

  // 1. Create Campaigns
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Q1 AI Developer Infrastructure',
      domainFocus: 'LLM observability, autonomous coding agents, and vector databases',
      minScore: 7,
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }
  });

  // 2. Create Signals (Scanned runs)
  const run1 = crypto.randomUUID();
  const run2 = crypto.randomUUID();

  const signals = [
    {
      title: 'PydanticAI: Agent framework for strict validation',
      source: 'github',
      url: 'https://github.com/pydantic/pydantic-ai',
      opportunityScore: 9,
      category: 'ai',
      topicCluster: 'AI Agent Frameworks',
      aiSummary: 'A state-of-the-art framework for building reliable AI agents with strong type safety and validation.',
      pipelineStatus: 'promoted',
      campaignId: campaign.id,
      runId: run1,
      opportunityCard: JSON.stringify({
        problem: 'LLM outputs are non-deterministic and break production systems.',
        why_now: 'Mainstream adoption of agents requires industrial-grade reliability.',
        studio_angle: 'Build a dedicated observability layer for PydanticAI apps.',
        sprint_hypothesis: 'Developers will pay for visual debugging of validated agent flows.',
        kill_risks: ['Market oversaturation', 'Tooling complexity', 'Open source competition']
      })
    },
    {
      title: 'LangGraph Persistence Layer Enhancement',
      source: 'reddit',
      url: 'https://reddit.com/r/LangChain',
      opportunityScore: 7,
      category: 'ai',
      topicCluster: 'AI Agent Frameworks',
      aiSummary: 'New patterns for handling long-term memory in multi-agent workflows.',
      pipelineStatus: 'new',
      campaignId: campaign.id,
      runId: run1
    },
    {
      title: 'Firecrawl: Turn websites into LLM-ready markdown',
      source: 'hn',
      url: 'https://news.ycombinator.com/item?id=4321',
      opportunityScore: 8,
      category: 'developer_tools',
      topicCluster: 'Knowledge Retrieval',
      aiSummary: 'High-performance web scraping optimized for RAG and agentic observation.',
      pipelineStatus: 'promoted',
      campaignId: campaign.id,
      runId: run2
    },
    {
      title: 'Swell: Streamlined vector embedding pipeline',
      source: 'producthunt',
      opportunityScore: 6,
      category: 'data',
      topicCluster: 'Knowledge Retrieval',
      aiSummary: 'A no-code tool for synchronizing SaaS data into vector databases.',
      pipelineStatus: 'new',
      campaignId: campaign.id,
      runId: run2
    }
  ];

  for (const s of signals) {
    await prisma.trendSignal.create({ data: s });
  }

  // 3. Create Ideas (from promoted signals)
  const idea1 = await prisma.idea.create({
    data: {
      title: 'Agentic Observability Layer',
      stage: 'validating',
      ventureScore: 78,
      sourceSignalId: (await prisma.trendSignal.findFirst({ where: { title: { contains: 'PydanticAI' } } }))?.id,
      opportunityMemo: JSON.stringify({
        problem: 'Devs can\'t debug why agents fail in production.',
        target_customer: 'AI Engineering teams at Series A startups.',
        solution: 'A visual trace tool that highlights type-safety failures in agent loops.',
        moat: 'Proprietary dataset of failure modes for PydanticAI.',
        why_now: 'Agent frameworks are reaching maturity but tooling is lagging.',
        market_size: '$2B observability market disruption.',
        risks: ['LangSmith dominance', 'Framework lock-in'],
        validation_plan: [{ assumption: 'Devs value type safety over ease of use', importance: 0.9, evidence: 0.4 }]
      }),
      dvfScores: JSON.stringify([
        { dimension: 'market_analyst', desirability: 4, market_size: 4, rationale: 'High growth.' },
        { dimension: 'technical_architect', feasibility: 5, risk: 2, rationale: 'Clear path.' },
        { dimension: 'vc_evaluator', revenue_path: 4, viability: 4, rationale: 'Strong SaaS potential.' }
      ]),
      daysInStage: 5
    }
  });

  const idea2 = await prisma.idea.create({
    data: {
      title: 'RAG-Ready Scraping Engine',
      stage: 'decision_gate',
      ventureScore: 85,
      sourceSignalId: (await prisma.trendSignal.findFirst({ where: { title: { contains: 'Firecrawl' } } }))?.id,
      opportunityMemo: JSON.stringify({
        problem: 'Raw HTML is terrible for LLMs.',
        target_customer: 'RAG developers.',
        solution: 'Automated markdown extraction focused on semantic structure.',
        moat: 'Custom parsing algorithms for JS-heavy sites.',
        why_now: 'Every enterprise is building RAG on top of legacy data.',
        market_size: 'Vast data ETL market.',
        risks: ['Website anti-bot evolution', 'Cloud hosting costs'],
        validation_plan: []
      }),
      dvfScores: JSON.stringify([
        { dimension: 'market_analyst', desirability: 5, market_size: 5, rationale: 'Urgent need.' },
        { dimension: 'technical_architect', feasibility: 3, risk: 4, rationale: 'Complex proxy infra needed.' }
      ]),
      daysInStage: 2
    }
  });

  // 4. Create some Learnings (Past kills)
  await prisma.learning.create({
    data: {
      ideaId: 'mock-killed-1',
      ideaTitle: 'Low-Code Agent Builder',
      category: 'ai',
      killReason: 'Market is too crowded with well-funded incumbents (Zapier, Flowise).',
      keySentence: 'Generic visual automation tools struggle against established workflow giants.',
      tags: ['low-code', 'agents', 'workflow']
    }
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
