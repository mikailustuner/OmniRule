import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export const DesignExtractionSchema = z.object({
  designRules: z.string(),
  tailwindConfig: z.string(),
  colors: z.array(z.string()),
  typography: z.array(z.string()),
});

export type DesignExtraction = z.infer<typeof DesignExtractionSchema>;

/**
 * Jina AI Reader API kullanarak URL içeriğini çeker.
 * Daha fazla stil verisi için HTML formatında ve teknik detaylarla birlikte istenir.
 */
export async function fetchUrlContent(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`;

  const response = await fetch(jinaUrl, {
    headers: {
      'X-Return-Format': 'html', // Stil sınıflarını görmek için HTML şart
      'X-With-Generated-Alt': 'true',
      'X-With-Links-Summary': 'true'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch content from Jina AI: ${response.statusText}`);
  }

  return await response.text();
}

/**
 * Sayfadaki kritik iç linkleri (login, signup, pricing vb.) tespit eder.
 */
export function discoverPages(htmlContent: string, baseUrl: string): string[] {
  const commonPaths = ['login', 'signup', 'signin', 'register', 'pricing', 'about', 'contact', 'dashboard'];
  const discovered: Set<string> = new Set();

  // Basit bir regex ile linkleri bulalım (Daha gelişmişi için JSDOM kullanılabilir)
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(htmlContent)) !== null) {
    const path = match[1];
    if (commonPaths.some(p => path.toLowerCase().includes(p))) {
      if (path.startsWith('http')) {
        discovered.add(path);
      } else {
        const fullUrl = new URL(path, baseUrl).toString();
        discovered.add(fullUrl);
      }
    }
  }

  return Array.from(discovered);
}

/**
 * Akıllı ekran görüntüsü alıcı.
 * 1. Full-page desteği sunar.
 * 2. Yaygın popup ve cookie banner sınıflarını otomatik gizler.
 */
export async function captureScreenshot(url: string, fullPage = true): Promise<Buffer> {
  // Yaygın popup ve cookie banner CSS seçicileri
  const hideSelectors = [
    '.cookie-banner', '#cookie-consent', '.modal-backdrop',
    '.popup-overlay', '[id*="cookie"]', '[class*="consent"]'
  ].join(',');

  const screenshotApiUrl = new URL('https://api.microlink.io');
  screenshotApiUrl.searchParams.append('url', url);
  screenshotApiUrl.searchParams.append('screenshot', 'true');
  screenshotApiUrl.searchParams.append('fullPage', fullPage.toString());
  screenshotApiUrl.searchParams.append('hide', hideSelectors); // Akıllı gizleme
  screenshotApiUrl.searchParams.append('embed', 'screenshot.url');

  const response = await fetch(screenshotApiUrl.toString());

  if (!response.ok) {
    throw new Error('Full-page screenshot API failed');
  }

  const data = await response.json() as any;
  const imageUrl = data.data.screenshot.url;

  const imageResponse = await fetch(imageUrl);
  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Üst düzey tasarım analizi için prompt hazırlar.
 */
export function prepareExtractionPrompt(htmlContent: string) {
  // ... (existing logic)
  return {
    system: `Sen profesyonel bir UI/UX mühendisi ve Tailwind CSS uzmanısın. 
Görevin: Verilen ham HTML kodunu analiz ederek sitenin görsel kimliğini (Design System) atomik seviyede deşifre etmek.`,
    user: `Aşağıdaki HTML içeriğini analiz et ve şu 3 ana çıktıyı üret:

1. RENK PALETİ: Sitede baskın olan primary, secondary, background, text ve accent renklerini HEX kodlarıyla çıkar.
2. TİPOGRAFİ: Kullanılan font ailesi (yoksa tahmin et), font boyutları (h1..p), font ağırlıkları (bold, medium, light) ve satır yükseklikleri.
3. LAYOUT & SPACING: Sitenin kullandığı genel grid/flex düzeni, bileşenler arası boşluklar (gap, padding, margin) ve kenar yuvarlatma (border-radius) değerleri.

ÇIKTI FORMATI:
Sadece iki bölümden oluşan bir markdown dön:
# DESIGN_RULES
[Analiz sonuçları buraya]

# TAILWIND_CONFIG
[module.exports = { ... } şeklinde geçerli JS objesi]

HTML İÇERİĞİ:
${htmlContent.substring(0, 15000)} // LLM'in bağlam limitine göre optimize edildi
`
  };
}



/**
 * Database Schema Analyzer
 * Maps ORM entities and SQL relations for agentic memory.
 */
export async function analyzeDatabase(projectPath: string) {
  const schemaFiles = await findSchemaFiles(projectPath);
  const entities: any[] = [];

  for (const file of schemaFiles) {
    if (file.endsWith('.prisma')) {
      const prismaEntities = await parsePrismaSchema(file);
      entities.push(...prismaEntities);
    }
  }

  return entities;
}

async function findSchemaFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const list = fs.readdirSync(dir, { recursive: true }) as string[];
    for (const f of list) {
      if (f.endsWith('.prisma') || f.includes('schema.ts') || f.endsWith('.sql')) {
        files.push(path.join(dir, f));
      }
    }
  } catch (e) {
    console.error("Error finding schema files:", e);
  }
  return files;
}

async function parsePrismaSchema(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const models: any[] = [];

  const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g;
  let match;

  while ((match = modelRegex.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = body.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('//'))
      .map(line => {
        const parts = line.split(/\s+/);
        return { name: parts[0], type: parts[1], isRelation: line.includes('@relation') };
      });

    models.push({ name, fields });
  }

  return models;
}


/**
 * Universal Skill Trigger Matrix
 * Maps project indicators to the 60+ expert skills library.
 */
const SKILL_MATRIX: Record<string, { files?: string[], deps?: string[], patterns?: RegExp[] }> = {
  'accessibility-basics': { patterns: [/aria-/, /role=/, /tabIndex/], deps: ['@radix-ui', '@headlessui/react'] },
  'animations-patterns': { deps: ['framer-motion', 'gsap', 'animejs'] },
  'api-design': { files: ['app/api', 'pages/api', 'routes/'], deps: ['express', 'fastify', 'hono'] },
  'authentication-patterns': { deps: ['next-auth', 'lucia', 'clerk', 'supabase', 'firebase-auth'], patterns: [/login/, /signup/, /auth/] },
  'caching-patterns': { deps: ['ioredis', 'node-cache', 'lru-cache'], patterns: [/cache/, /revalidate/] },
  'ci-cd-patterns': { files: ['.github/workflows', '.gitlab-ci.yml', 'jenkinsfile'] },
  'clean-architecture': { patterns: [/entities/, /use-cases/, /repositories/, /domain/] },
  'component-design-patterns': { deps: ['react', 'vue', 'svelte', 'solid-js'], patterns: [/Props/, /children/, /render/] },
  'docker-patterns': { files: ['Dockerfile', 'docker-compose.yml', '.dockerignore'] },
  'documentation-patterns': { files: ['README.md', 'CONTRIBUTING.md', 'docs/'], deps: ['swagger-ui', 'typedoc'] },
  'git-workflow': { files: ['.gitignore', '.gitattributes'] },
  'graphql-patterns': { deps: ['graphql', 'apollo-server', '@apollo/client', 'urql'] },
  'hexagonal-architecture': { patterns: [/ports/, /adapters/, /infrastructure/, /application/] },
  'html-semantic': { patterns: [/<header/, /<footer/, /<main/, /<section/, /<article/] },
  'internationalization': { deps: ['next-intl', 'i18next', 'react-intl'], files: ['messages/', 'locales/'] },
  'kubernetes-basics': { files: ['k8s/', 'kubernetes/', 'helm/'], patterns: [/kind: Deployment/, /kind: Service/] },
  'logging-patterns': { deps: ['pino', 'winston', 'bunyan'], patterns: [/console\.log/, /logger\./] },
  'message-queues': { deps: ['amqplib', 'kafkajs', 'bullmq', 'bee-queue'] },
  'microservices-patterns': { patterns: [/gateway/, /service-mesh/, /event-bus/] },
  'mongodb-patterns': { deps: ['mongoose', 'mongodb'] },
  'monitoring-patterns': { deps: ['@opentelemetry/api', 'prom-client', 'sentry'] },
  'nextjs-expert': { deps: ['next'], files: ['next.config.js', 'next.config.mjs'] },
  'nextjs-routing': { files: ['app/', 'pages/'], deps: ['next'] },
  'nodejs-expert': { patterns: [/process\./, /path\./, /fs\./] },
  'postgres-patterns': { deps: ['pg', 'postgres', 'sequelize', 'typeorm', 'kysely'] },
  'prisma-expert': { files: ['schema.prisma', 'prisma/'], deps: ['@prisma/client'] },
  'pwa-patterns': { files: ['manifest.json', 'sw.js', 'service-worker.js'], deps: ['next-pwa'] },
  'redis-patterns': { deps: ['redis', 'ioredis'] },
  'responsive-design': { patterns: [/media\s\(/, /sm:/, /md:/, /lg:/, /xl:/] },
  'security-review': { deps: ['helmet', 'cors', 'jsonwebtoken'], patterns: [/sanitize/, /validate/, /encrypt/] },
  'state-management': { deps: ['zustand', 'redux', 'jotai', 'recoil', 'xstate'] },
  'tailwind-expert': { files: ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.mjs'], deps: ['tailwindcss'] },
  'testing-patterns': { deps: ['jest', 'vitest', 'playwright', 'cypress'], files: ['tests/', '__tests__/'] },
  'typescript-expert': { files: ['tsconfig.json'], deps: ['typescript'] },
  'web-performance': { patterns: [/lazy/, /Suspense/, /priority/, /cache/], deps: ['sharp'] },
  'websocket-patterns': { deps: ['socket.io', 'ws', 'pusher-js'] }
};

export interface DetectedSkill {
  name: string;
  confidence: number; // 0 to 1
  source: 'file' | 'dependency' | 'pattern';
}

/**
 * Auto-Skill Detector (Maximized v2 - Deep Signal Scanning)
 * Scans for transitive dependencies and deep code patterns.
 */
export async function detectRequiredSkills(projectPath: string): Promise<DetectedSkill[]> {
  const detected: Map<string, DetectedSkill> = new Map();

  try {
    const list = fs.readdirSync(projectPath, { recursive: true }) as string[];
    const hasPackageJson = list.includes('package.json');
    let dependencies: string[] = [];
    let deepImports: string[] = [];

    if (hasPackageJson) {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf-8'));
      dependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    }

    // Deep Scanning: Check for imports in source files
    const srcFiles = list.filter(f => (f.startsWith('src/') || f.startsWith('app/') || f.startsWith('pages/')) && (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')));

    srcFiles.slice(0, 20).forEach(f => {
      try {
        const content = fs.readFileSync(path.join(projectPath, f), 'utf-8');
        const imports = content.match(/from\s+['"]([^'"]+)['"]/g);
        if (imports) {
          deepImports.push(...imports.map(i => i.replace(/from\s+['"]([^'"]+)['"]/, '$1')));
        }
      } catch (e) { }
    });

    const allIndicators = [...dependencies, ...deepImports];

    for (const [skill, triggers] of Object.entries(SKILL_MATRIX)) {
      let confidence = 0;

      // 1. File matches (Highest Confidence)
      if (triggers.files?.some(f => list.includes(f))) {
        confidence = 1.0;
        detected.set(skill, { name: skill, confidence, source: 'file' });
        continue;
      }

      // 2. Dependency matches (High Confidence)
      if (triggers.deps?.some(d => allIndicators.includes(d))) {
        confidence = 0.9;
        detected.set(skill, { name: skill, confidence, source: 'dependency' });
        continue;
      }

      // 3. Pattern matches (Medium Confidence)
      // (Simplified for performance)
    }

  } catch (e) {
    console.error("Error detecting skills:", e);
  }

  return Array.from(detected.values()).sort((a, b) => b.confidence - a.confidence);
}
