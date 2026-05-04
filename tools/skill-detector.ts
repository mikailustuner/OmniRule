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
  // ── Frontend frameworks
  'nextjs-expert':      { files: ['next.config.js','next.config.ts','next.config.mjs'], deps: ['next'] },
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

  // All file contents for pattern matching (cheap: just filenames/paths)
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
  const depsStr = deps.join(' ');

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
    // Pattern match (extension or string in path list)
    if (ind.patterns?.some(p => filePathStr.includes(p))) {
      confidence = Math.max(confidence, 0.8);
      reasons.push('file pattern');
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
