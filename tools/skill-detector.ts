#!/usr/bin/env tsx
/**
 * OmniRule Skill Detector
 * Detects required skills from project files, deps, and structure.
 * Usage: npm run tool:skills [--json] [--min-confidence=0.7]
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SkillMatch {
  name: string;
  confidence: number;
  reason: string;
}

interface Indicator {
  files?: string[];
  deps?: string[];
  dirs?: string[];
  patterns?: string[];  // glob-style substrings in any file path
}

// ─── Full 63-skill indicator map ─────────────────────────────────────────────

const INDICATORS: Record<string, Indicator> = {
  'tax-calculator': { patterns: ['tax calculator'] },
  'portfolio-tracker': { patterns: ['portfolio tracker'] },
  'expense-analyzer': { patterns: ['expense analyzer'] },
  'invoice-generator': { patterns: ['invoice generator'] },
  'payroll-processor': { patterns: ['payroll processor'] },
  'financial-forecaster': { patterns: ['financial forecaster'] },
  'crypto-analyzer': { patterns: ['crypto analyzer'] },
  'budget-planner': { patterns: ['budget planner'] },
  'risk-assessor': { patterns: ['risk assessor'] },
  'receipt-scanner': { patterns: ['receipt scanner'] },
  'copywriting-frameworks': { patterns: ['copywriting frameworks'] },
  'social-media-manager': { patterns: ['social media manager'] },
  'seo-keyword-researcher': { patterns: ['seo keyword researcher'] },
  'newsletter-curator': { patterns: ['newsletter curator'] },
  'ad-campaign-generator': { patterns: ['ad campaign generator'] },
  'brand-voice-analyzer': { patterns: ['brand voice analyzer'] },
  'market-researcher': { patterns: ['market researcher'] },
  'competitor-price-tracker': { patterns: ['competitor price tracker'] },
  'email-sequence-builder': { patterns: ['email sequence builder'] },
  'pr-release-writer': { patterns: ['pr release writer'] },
  'resume-screener': { patterns: ['resume screener'] },
  'interview-prep': { patterns: ['interview prep'] },
  'onboarding-planner': { patterns: ['onboarding planner'] },
  'employee-engagement-analyzer': { patterns: ['employee engagement analyzer'] },
  'job-description-writer': { patterns: ['job description writer'] },
  'performance-review-generator': { patterns: ['performance review generator'] },
  'compensation-analyzer': { patterns: ['compensation analyzer'] },
  'culture-fit-assessor': { patterns: ['culture fit assessor'] },
  'training-module-creator': { patterns: ['training module creator'] },
  'hr-policy-drafter': { patterns: ['hr policy drafter'] },
  'contract-analyzer': { patterns: ['contract analyzer'] },
  'legal-researcher': { patterns: ['legal researcher'] },
  'gdpr-auditor': { patterns: ['gdpr auditor'] },
  'nda-drafter': { patterns: ['nda drafter'] },
  'compliance-checker': { patterns: ['compliance checker'] },
  'ip-trademark-search': { patterns: ['ip trademark search'] },
  'terms-of-service-generator': { patterns: ['terms of service generator'] },
  'privacy-policy-generator': { patterns: ['privacy policy generator'] },
  'lawsuit-summarizer': { patterns: ['lawsuit summarizer'] },
  'legal-translation': { patterns: ['legal translation'] },
  'meeting-summarizer': { patterns: ['meeting summarizer'] },
  'gantt-creator': { patterns: ['gantt creator'] },
  'okr-tracker': { patterns: ['okr tracker'] },
  'process-mapper': { patterns: ['process mapper'] },
  'risk-register-builder': { patterns: ['risk register builder'] },
  'sprint-planner': { patterns: ['sprint planner'] },
  'capacity-planner': { patterns: ['capacity planner'] },
  'vendor-evaluator': { patterns: ['vendor evaluator'] },
  'supply-chain-analyzer': { patterns: ['supply chain analyzer'] },
  'workflow-optimizer': { patterns: ['workflow optimizer'] },
  'literature-reviewer': { patterns: ['literature reviewer'] },
  'citation-formatter': { patterns: ['citation formatter'] },
  'lesson-planner': { patterns: ['lesson planner'] },
  'quiz-generator': { patterns: ['quiz generator'] },
  'essay-grader': { patterns: ['essay grader'] },
  'study-guide-creator': { patterns: ['study guide creator'] },
  'language-tutor': { patterns: ['language tutor'] },
  'flashcard-maker': { patterns: ['flashcard maker'] },
  'syllabus-designer': { patterns: ['syllabus designer'] },
  'thesis-structurer': { patterns: ['thesis structurer'] },
  'travel-planner': { patterns: ['travel planner'] },
  'recipe-generator': { patterns: ['recipe generator'] },
  'workout-planner': { patterns: ['workout planner'] },
  'habit-tracker': { patterns: ['habit tracker'] },
  'event-planner': { patterns: ['event planner'] },
  'gift-recommender': { patterns: ['gift recommender'] },
  'movie-book-recommender': { patterns: ['movie book recommender'] },
  'language-translator': { patterns: ['language translator'] },
  'interior-design-ideator': { patterns: ['interior design ideator'] },
  'mindfulness-coach': { patterns: ['mindfulness coach'] },
  'cold-email-writer': { patterns: ['cold email writer'] },
  'pitch-deck-creator': { patterns: ['pitch deck creator'] },
  'lead-scorer': { patterns: ['lead scorer'] },
  'objection-handler': { patterns: ['objection handler'] },
  'sales-script-generator': { patterns: ['sales script generator'] },
  'crm-data-cleaner': { patterns: ['crm data cleaner'] },
  'sales-forecaster': { patterns: ['sales forecaster'] },
  'proposal-writer': { patterns: ['proposal writer'] },
  'negotiation-simulator': { patterns: ['negotiation simulator'] },
  'customer-profile-builder': { patterns: ['customer profile builder'] },
  'ticket-categorizer': { patterns: ['ticket categorizer'] },
  'faq-generator': { patterns: ['faq generator'] },
  'refund-processor': { patterns: ['refund processor'] },
  'churn-predictor': { patterns: ['churn predictor'] },
  'satisfaction-survey-creator': { patterns: ['satisfaction survey creator'] },
  'apology-email-writer': { patterns: ['apology email writer'] },
  'live-chat-responder': { patterns: ['live chat responder'] },
  'knowledge-base-writer': { patterns: ['knowledge base writer'] },
  'support-metrics-analyzer': { patterns: ['support metrics analyzer'] },
  'feedback-sentiment-analyzer': { patterns: ['feedback sentiment analyzer'] },
  'story-plot-generator': { patterns: ['story plot generator'] },
  'podcast-script-writer': { patterns: ['podcast script writer'] },
  'joke-writer': { patterns: ['joke writer'] },
  'speech-writer': { patterns: ['speech writer'] },
  'real-estate-listing-writer': { patterns: ['real estate listing writer'] },
  'property-valuation-estimator': { patterns: ['property valuation estimator'] },
  'nutrition-analyzer': { patterns: ['nutrition analyzer'] },
  'diy-project-planner': { patterns: ['diy project planner'] },
  'meditation-script-writer': { patterns: ['meditation script writer'] },
  'resume-builder': { patterns: ['resume builder'] },

  // ── Frontend frameworks
  'claude-canvas-ui-designer': { dirs: ['template/'], patterns: ['design-canvas'] },
  'nextjs-routing':     { dirs: ['app/'], files: ['middleware.ts'], deps: ['next'] },
  'react-expert':       { deps: ['react','react-dom'], patterns: ['.tsx','.jsx'] },
  'typescript-expert':  { files: ['tsconfig.json'], deps: ['typescript'] },
  'nodejs-expert':      { files: ['server.ts','server.js'], deps: ['express','fastify','hono','koa'] },

  // ── Styling
  'tailwind-expert':    { files: ['tailwind.config.js','tailwind.config.ts','tailwind.config.mjs'], deps: ['tailwindcss'] },
  'css-architecture':   { patterns: ['.css','.scss','.sass','.less'], deps: ['sass','less'] },
  'css-variables':      { files: ['globals.css','variables.css','theme.css'], dirs: ['tokens/'] },
  'responsive-design':  { files: ['tailwind.config.js','tailwind.config.ts'] },
  'responsive-images':  { deps: ['sharp'], patterns: ['next/image'] },
  'animations-patterns':{ deps: ['framer-motion','motion','@react-spring/web','@motionone/dom'] },

  // ── State & forms
  'state-management':   { deps: ['zustand','jotai','@reduxjs/toolkit','recoil','valtio','mobx','redux'] },
  'forms-patterns':     { deps: ['react-hook-form','formik','yup','zod','@hookform/resolvers'] },

  // ── Data & backend
  'prisma-expert':      { files: ['schema.prisma'], dirs: ['prisma/'], deps: ['@prisma/client','prisma'] },
  'postgres-patterns':  { deps: ['pg','postgres','@neondatabase/serverless','drizzle-orm','kysely'], patterns: ['.sql'] },
  'mongodb-patterns':   { deps: ['mongoose','mongodb'] },
  'redis-patterns':     { deps: ['ioredis','redis','@upstash/redis'] },
  'caching-patterns':   { deps: ['ioredis','redis','@upstash/redis','lru-cache','node-cache'] },
  'message-queues':     { deps: ['bull','bullmq','kafkajs','amqplib','nats'], dirs: ['queues/','workers/'] },
  'event-driven-patterns': { deps: ['kafkajs','amqplib','bullmq','nats','eventemitter3'] },
  'search-patterns':    { deps: ['algoliasearch','@meilisearch/meilisearch-js','typesense','@elastic/elasticsearch'] },

  // ── API
  'api-backend':        { dirs: ['api/','routes/','controllers/'], deps: ['express','fastify','hono','koa','trpc'] },
  'api-design':         { files: ['openapi.yml','openapi.json','swagger.yml','swagger.json'], patterns: ['.graphql','.gql'] },
  'graphql-patterns':   { deps: ['graphql','@apollo/client','@apollo/server','urql','type-graphql'], patterns: ['.graphql','.gql'] },

  // ── Auth & security
  'authentication-patterns': { dirs: ['auth/'], files: ['auth.ts','auth.config.ts'], deps: ['next-auth','lucia','@auth/core','passport','jsonwebtoken','jose','better-auth'] },
  'security-review':    { files: ['.env.example'], deps: ['helmet','cors','csurf','express-rate-limit','rate-limiter-flexible'] },

  // ── Testing
  'testing-patterns':   { deps: ['jest','vitest','playwright','@testing-library/react','cypress','@playwright/test'], patterns: ['.test.ts','.spec.ts','.test.tsx','.spec.tsx'], dirs: ['__tests__/','e2e/'] },
  'debugging-strategies': { patterns: ['.test.ts','.spec.ts'], dirs: ['__tests__/'] },

  // ── DevOps & infra
  'docker-patterns':    { files: ['Dockerfile','docker-compose.yml','docker-compose.yaml','.dockerignore'] },
  'ci-cd-patterns':     { dirs: ['.github/workflows/','.circleci/'], files: ['.gitlab-ci.yml','Jenkinsfile'] },
  'kubernetes-basics':  { dirs: ['k8s/','kubernetes/','helm/'], files: ['Chart.yaml'] },
  'terraform-basics':   { dirs: ['terraform/','.terraform/'], patterns: ['.tf'] },
  'monitoring-patterns':{ deps: ['@sentry/nextjs','@sentry/node','@opentelemetry/api','datadog-metrics'] },
  'logging-patterns':   { deps: ['pino','winston','bunyan','@axiomhq/js','@logtail/node'] },

  // ── Architecture
  'clean-architecture': { dirs: ['domain/','usecases/','application/','infrastructure/'] },
  'hexagonal-architecture': { dirs: ['ports/','adapters/'] },
  'ddd-patterns':       { dirs: ['domain/','aggregates/','entities/','repositories/','valueobjects/'] },
  'microservices-patterns': { dirs: ['services/','microservices/','gateway/'] },
  'monolith-to-microservices': { dirs: ['services/','legacy/','strangler/'] },

  // ── Real-time & web
  'real-time-patterns': { deps: ['socket.io','ws','pusher-js','@ably/ably-js','@supabase/realtime-js'] },
  'websocket-patterns': { deps: ['socket.io','ws'], dirs: ['ws/','websocket/','socket/'] },
  'pwa-patterns':       { files: ['manifest.json','manifest.webmanifest','service-worker.js','sw.js'] },
  'web-components':     { patterns: ['custom-element','shadow-dom','customElements.define'] },
  'web-performance':    { deps: ['web-vitals','@vercel/analytics','@vercel/speed-insights'] },
  'browser-apis':       { files: ['sw.js','service-worker.js'], patterns: ['navigator.','window.'] },
  'edge-computing':     { files: ['middleware.ts','_middleware.ts'], deps: ['@vercel/edge','@cloudflare/workers-types'] },

  // ── Specialised
  'bundle-optimization':{ files: ['webpack.config.js','webpack.config.ts','vite.config.ts','rollup.config.js'], deps: ['webpack','vite','rollup','@vitejs/plugin-react'] },
  'internationalization':{ dirs: ['messages/','locales/','i18n/'], deps: ['next-intl','i18next','react-i18next','@formatjs/intl'] },
  'data-visualization': { deps: ['recharts','d3','chart.js','@nivo/core','visx','victory','plotly.js'] },
  'email-patterns':     { dirs: ['emails/'], deps: ['resend','nodemailer','@sendgrid/mail','postmark','react-email'] },
  'file-handling':      { deps: ['multer','formidable','sharp','jimp','fs-extra'], dirs: ['uploads/','storage/'] },
  'cron-jobs':          { deps: ['node-cron','cron','@nestjs/schedule'], dirs: ['cron/','jobs/','tasks/'] },
  'mobile-patterns':    { deps: ['react-native','expo','@react-native-community/cli'], dirs: ['android/','ios/'] },
  'web3-patterns':      { deps: ['ethers','viem','wagmi','web3','@solana/web3.js'], dirs: ['contracts/'] },
  'bond-analyzer':      { dirs: ['bonds/', 'finance/', 'analysis/'], patterns: ['bond', 'tahvil', 'tbliste', 'yield'] },
  'video-audio-patterns':{ deps: ['react-player','video.js','hls.js','plyr','mux-player-react'] },
  'component-design-patterns': { dirs: ['components/','ui/','design-system/'] },
  'html-semantic':      { patterns: ['.html','.htm'] },
  'accessibility-basics':{ deps: ['@radix-ui/react-','@headlessui/react','@reach/'], patterns: ['aria-','role='] },
  'git-workflow':       { files: ['.lefthook.yml','.husky','CONTRIBUTING.md','CODEOWNERS'] },
  'documentation-patterns': { dirs: ['docs/'], files: ['README.md','CONTRIBUTING.md','ARCHITECTURE.md'] },
  'code-review-patterns': { files: ['CODEOWNERS','.github/pull_request_template.md'], dirs: ['.github/'] },
  'technical-debt':     { files: ['TODO.md','TECH_DEBT.md','FIXME'] },

  // ── Always available (meta)
  'blueprint':          { files: ['package.json'] },

  // ── Professional Documents
  'professional-report-design': { dirs: ['reports/', 'documents/'], deps: ['playwright', 'puppeteer', 'pdfkit'] },
  'professional-pptx-design':  { dirs: ['presentation/', 'slides/', 'deck/'], deps: ['pptxgenjs'] },

  // ── AI/ML
  'llm-integration':    { dirs: ['ai/', 'llm/', 'models/'], deps: ['openai', 'anthropic', 'langchain', 'llama-index'] },

  // ── Swift/Apple Platforms
  'swiftui-patterns':   { files: ['Package.swift'], dirs: ['ios/', 'macos/', 'swift/', 'apple/'], deps: ['swift'] },
  'watchos-patterns':   { dirs: ['watchos/', 'watch/', 'applewatch/'], deps: ['watchkit'] },
  'apple-design-guidelines': { dirs: ['ios/design/', 'apple/design/'], deps: ['accessibility'] },

  // ── Next.js 16 (Web default)
  'nextjs-expert':      { files: ['next.config.js','next.config.ts'], deps: ['next'], patterns: ['app/', 'next/'] },
  'vector-db-patterns': { dirs: ['vector/', 'embeddings/', 'rag/'], deps: ['pinecone', 'chroma', 'weaviate', 'milvus', 'pgvector', 'qdrant'] },
  'prompt-engineering': { dirs: ['prompts/', 'templates/'], deps: ['langchain', 'guidance', 'instructor'] },
  'mlops-patterns':     { dirs: ['ml/', 'training/'], deps: ['mlflow', 'kubeflow', 'Weights-Biases', 'tensorboard'] },

  // ── Cloud Platforms
  'aws-patterns':       { dirs: ['aws/'], files: ['serverless.yml', 'sam.yaml'], deps: ['aws-sdk', 'serverless', 'cdk'] },
  'gcp-patterns':       { dirs: ['gcp/'], files: ['cloudbuild.yaml'], deps: ['@google-cloud', 'gcp'] },
  'azure-patterns':     { dirs: ['azure/'], files: ['bicep', 'azuredeploy'], deps: ['azure', '@azure'] },

  // ── Blockchain
  'solidity-patterns': { files: ['.sol'], dirs: ['contracts/', 'smart-contracts/'], deps: ['hardhat', 'foundry', 'waffle'] },
  'smart-contract-testing': { dirs: ['test/'], deps: ['foundry', 'hardhat', 'forge'], files: ['.t.sol'] },
  'defi-patterns':      { dirs: ['defi/', 'protocols/'], deps: ['uniswap-sdk', 'aave-v3', 'compound-js'] },

  // ── Data Engineering
  'etl-patterns':      { dirs: ['etl/', 'pipeline/'], deps: ['airflow', 'dbt', 'prefect', 'dagster'] },
  'data-pipeline-patterns': { dirs: ['pipeline/', 'transform/'], deps: ['pandas', 'dask', 'spark'] },
  'streaming-patterns': { dirs: ['streaming/', 'kafka/', 'flink/'], deps: ['kafka', 'kinesis', 'pubsub', 'flink'] },

  // ── Security (Advanced)
  'network-security':   { dirs: ['network/', 'security/'], deps: ['aws-security', 'gcp-security'] },
  'cryptography-patterns': { dirs: ['crypto/', 'encryption/'], deps: ['node-forge', 'crypto-js', 'jsrsasign'] },
  'compliance-gdpr':    { dirs: ['compliance/', 'audit/'], files: ['gdpr.yaml', 'soc2.yaml'] },

  // ── Platform Engineering
  'internal-platforms': { dirs: ['platform/', 'internal/'], deps: ['backstage', 'port'] },
  'developer-experience': { dirs: ['dx/', 'scripts/'], deps: ['clack', 'chalk'] },
  'chaos-engineering':  { dirs: ['chaos/', 'resilience/'], deps: ['chaos-mesh', 'litmus', 'gremlin'] },

  // ── NEW: REST & API
  'rest-api-patterns': { files: ['openapi.yml', 'openapi.json'], dirs: ['api/', 'rest/', 'endpoints/'], deps: ['express', 'fastify', 'hono', 'koa'] },
  'hono-patterns':     { files: ['hono.config.ts', 'hono.config.js'], dirs: ['src/hono/'], deps: ['hono'] },

  // ── NEW: Database
  'sql-optimization':  { dirs: ['queries/', 'migrations/'], patterns: ['EXPLAIN', 'index', 'JOIN'] },

  // ── NEW: Frontend Static
  'astro-patterns':    { files: ['astro.config.mjs', 'astro.config.ts'], dirs: ['src/pages/', 'src/layouts/', 'src/components/'], deps: ['astro'] },

  // ── NEW: Webhooks
  'webhook-handling':  { dirs: ['webhooks/', 'hooks/', 'events/'], deps: ['stripe', 'webhook'] },

  // ── NEW: Serverless
  'serverless-patterns': { files: ['serverless.yml', 'serverless.yaml', 'sam-template.yaml'], dirs: ['functions/', 'lambda/', 'handlers/'], deps: ['serverless', '@aws-sdk'] },

  // ── NEW: Mobile
  'flutter-patterns':  { files: ['pubspec.yaml', 'main.dart'], dirs: ['lib/', 'flutter/'], deps: ['flutter'] },

  // ── NEW: gRPC
  'grpc-patterns':    { files: ['.proto'], dirs: ['protos/', 'grpc/'], deps: ['grpc', '@grpc', 'protobuf'] },

  // ── NEW: Observability
  'observability-patterns': { files: ['otel.config.ts', 'prometheus.yml'], dirs: ['monitoring/', 'telemetry/'], deps: ['@opentelemetry', 'prom-client', 'datadog'] },

  // ── NEW: Incident Response
  'incident-response': { dirs: ['runbooks/', 'incidents/'], files: ['incident.md', 'runbook.md'] },

  // ── NEW: Frontend Frameworks
  'svelte-expert':      { files: ['svelte.config.js', 'svelte.config.ts'], dirs: ['src/routes/', 'src/lib/'], deps: ['svelte', '@sveltejs/kit'] },
  'storybook-patterns': { files: ['.storybook/main.ts', '.storybook/preview.ts'], dirs: ['stories/'], deps: ['@storybook/svelte'] },

  // ── NEW: Platform Engineering
  'feature-flags':     { files: ['feature-flags.json', 'flags.config.js'], dirs: ['flags/'], deps: ['launchdarkly', 'unleash-client'] },
  'error-tracking':    { files: ['sentry.config.ts', 'bugsnag.config.js'], dirs: ['monitoring/', 'error-tracking/'], deps: ['@sentry/svelte', '@bugsnag/js'] },
  'a-b-testing':        { files: ['ab-test.config.json', 'experiments.json'], dirs: ['experiments/', 'tests/'], deps: ['statsig', 'optimizely'] },

  // ── NEW: Real-time Communication
  'web-rtc-patterns':  { files: ['webrtc.config.ts'], dirs: ['webrtc/', 'signaling/', 'p2p/'], deps: ['simple-peer', 'peerjs'] },

  // ── NEW: Supabase
  'supabase-patterns': { dirs: ['supabase/'], deps: ['@supabase/supabase-js', '@supabase/ssr', '@supabase/auth-helpers-nextjs'] },

  // ── NEW: tRPC
  'trpc-patterns':     { dirs: ['server/trpc/', 'trpc/'], deps: ['@trpc/server', '@trpc/client', '@trpc/react-query', '@trpc/next'] },

  // ── NEW: Drizzle ORM
  'drizzle-orm':       { files: ['drizzle.config.ts', 'drizzle.config.js'], dirs: ['drizzle/', 'db/schema/'], deps: ['drizzle-orm', 'drizzle-kit'] },

  // ── NEW: Stripe
  'stripe-integration': { deps: ['stripe', '@stripe/stripe-js', '@stripe/react-stripe-js'], dirs: ['payments/', 'billing/'] },

  // ── NEW: Clerk
  'clerk-auth':        { deps: ['@clerk/nextjs', '@clerk/clerk-sdk-node', '@clerk/backend'], dirs: ['auth/'] },

  // ── NEW: Turborepo
  'turborepo-patterns': { files: ['turbo.json'], dirs: ['packages/', 'apps/'], deps: ['turbo'] },

  // ── NEW: Bun
  'bun-patterns':      { files: ['bun.lockb', 'bunfig.toml'], patterns: ['bun:sqlite', 'Bun.serve', 'bun:test'] },

  // ── NEW: Remix
  'remix-expert':      { files: ['remix.config.js', 'remix.config.ts'], deps: ['@remix-run/node', '@remix-run/react', '@remix-run/serve'] },

  // ── NEW: Nuxt
  'nuxt-expert':       { files: ['nuxt.config.ts', 'nuxt.config.js'], dirs: ['pages/', 'composables/'], deps: ['nuxt', '@nuxt/kit'] },

  // ── NEW: Expo Router
  'expo-router':       { files: ['app.json', 'expo-env.d.ts'], dirs: ['app/(tabs)/'], deps: ['expo-router'] },
};

// ─── Detection logic ──────────────────────────────────────────────────────────

export async function detectProjectSkills(root: string): Promise<SkillMatch[]> {
  const matches: SkillMatch[] = [];

  // Collect all relative file paths
  let allFiles: string[] = [];
  try {
    allFiles = (fs.readdirSync(root, { recursive: true }) as string[])
      .filter(f => !f.includes('node_modules') && !f.includes('.next') && !f.includes('.git'));
  } catch { /* ignore */ }

  const filePathStr = allFiles.join('\n');

  // Deps from package.json
  let deps: string[] = [];
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    } catch { /* ignore */ }
  }

  // Build a content corpus for pattern matching: file paths + README + package.json description/scripts
  // This ensures business skills (tax-calculator, budget-planner, etc.) get properly detected
  // when they appear in project descriptions, READMEs, or script names.
  let contentCorpus = filePathStr.toLowerCase();
  const contentFiles = ['README.md', 'package.json', 'AGENTS.md', 'CLAUDE.md'];
  for (const cf of contentFiles) {
    const cfPath = path.join(root, cf);
    if (fs.existsSync(cfPath)) {
      try {
        contentCorpus += '\n' + fs.readFileSync(cfPath, 'utf-8').toLowerCase();
      } catch { /* ignore */ }
    }
  }

  for (const [skill, ind] of Object.entries(INDICATORS)) {
    let confidence = 0;
    const reasons: string[] = [];

    // File match
    if (ind.files?.some(f => allFiles.some(af => af.endsWith(f) || af.includes(f)))) {
      confidence = Math.max(confidence, 1.0);
      reasons.push('config file');
    }
    // Dir match
    if (ind.dirs?.some(d => filePathStr.includes(d))) {
      confidence = Math.max(confidence, 0.95);
      reasons.push('directory');
    }
    // Dep match
    if (ind.deps?.some(d => deps.some(dep => dep.startsWith(d)))) {
      confidence = Math.max(confidence, 0.9);
      reasons.push('dependency');
    }
    // Pattern match: search content corpus (file paths + README + package.json)
    if (ind.patterns?.some(p => contentCorpus.includes(p.toLowerCase()))) {
      confidence = Math.max(confidence, 0.8);
      reasons.push('content match');
    }

    if (confidence > 0) {
      matches.push({ name: skill, confidence, reason: reasons.join(', ') });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

const isMain = process.argv[1]?.endsWith('skill-detector.ts') || process.argv[1]?.endsWith('skill-detector.js');

if (isMain) {
  const args = process.argv.slice(2);
  const asJson    = args.includes('--json');
  const minConf   = parseFloat(args.find(a => a.startsWith('--min-confidence='))?.split('=')[1] ?? '0.0');
  const root      = args.find(a => !a.startsWith('--')) ?? process.cwd();

  detectProjectSkills(root).then(matches => {
    const filtered = matches.filter(m => m.confidence >= minConf);

    if (asJson) {
      console.log(JSON.stringify(filtered, null, 2));
      process.exit(0);
    }

    const c = {
      bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
      cyan:  (s: string) => `\x1b[36m${s}\x1b[0m`,
      green: (s: string) => `\x1b[32m${s}\x1b[0m`,
      dim:   (s: string) => `\x1b[2m${s}\x1b[0m`,
      yellow:(s: string) => `\x1b[33m${s}\x1b[0m`,
    };

    console.log(`\n${c.bold('OmniRule Skill Detector')} ${c.dim(`[${root}]`)}\n`);

    if (filtered.length === 0) {
      console.log('  No skills detected. Is this a supported project?');
      process.exit(0);
    }

    const byConf = (conf: number) =>
      conf >= 1.0 ? c.green('●') : conf >= 0.9 ? c.cyan('●') : c.yellow('●');

    filtered.forEach(m => {
      const bar = byConf(m.confidence);
      const conf = `${(m.confidence * 100).toFixed(0)}%`;
      console.log(`  ${bar} ${c.bold(m.name.padEnd(34))} ${c.dim(conf.padStart(4))}  ${c.dim(m.reason)}`);
    });

    console.log(`\n${c.dim(`${filtered.length} skills detected`)}\n`);
    console.log(`${c.dim('Loaded skills:')}`);
    console.log(`  ${filtered.map(m => m.name).join(', ')}\n`);
  });
}
