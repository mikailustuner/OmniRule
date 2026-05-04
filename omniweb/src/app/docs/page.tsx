'use client';

import { motion } from 'framer-motion';
import { 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  Settings, 
  Rocket, 
  ArrowRight,
  Shield,
  Cpu,
  Layers,
  Code2
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export default function DocsPage() {
  const [copied, setCopied] = useState(false);
  const installCmd = 'curl -fsSL https://omnirule.ai/install.sh | bash -s -- --opencode';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 hidden lg:block sticky top-0 h-screen p-8 overflow-y-auto">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <Terminal className="w-6 h-6" />
          <span className="font-bold text-lg">OmniRule</span>
        </Link>
        <nav className="space-y-8 pb-12">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Getting Started</h4>
            <div className="space-y-3">
              <DocLink href="#intro">Introduction</DocLink>
              <DocLink href="#install">Installation</DocLink>
              <DocLink href="#quickstart">Quick Start</DocLink>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Core Commands</h4>
            <div className="space-y-3">
              <DocLink href="#commands">Command Registry</DocLink>
              <DocLink href="#orchestrate">Orchestrate</DocLink>
              <DocLink href="#extract">Extract</DocLink>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Agent Roles</h4>
            <div className="space-y-3">
              <DocLink href="#agents">Specialists</DocLink>
              <DocLink href="#architect">Architect</DocLink>
              <DocLink href="#qa">QA Specialist</DocLink>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Introduction */}
          <section id="intro" className="mb-32 scroll-mt-20">
            <div className="flex items-center gap-2 text-blue-500 mb-4 font-medium text-sm">
              <BookOpen className="w-4 h-4" />
              <span>Operational Handbook</span>
            </div>
            <h1 className="text-6xl font-bold tracking-tighter mb-8 text-gradient">System <span className="text-blue-500">Architecture</span></h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-16">
              OmniRule is not a simple wrapper. It is a stateful orchestration layer that 
              manages context, enforces quality gates, and dispatches specialist agents 
              to solve complex engineering problems.
            </p>
          </section>

          {/* Installation */}
          <section id="install" className="mb-32 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Rocket className="w-8 h-8 text-green-500" />
              Installation
            </h2>
            <p className="text-gray-400 mb-8">Deploy the OmniRule fleet to your local environment in seconds.</p>
            <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-8 font-mono text-sm glow mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <code className="text-blue-400 block break-all">
                <span className="text-gray-500">$</span> {installCmd}
              </code>
            </div>

            <div className="space-y-12">
              <Step num="01" title="Clone the Repository" code="git clone https://github.com/mikailustuner/OmniRule.git" />
              <Step num="02" title="Install Dependencies" code="npm install" />
              <Step num="03" title="Initialize Fleet" code="./install.sh --opencode" />
            </div>
          </section>

          {/* Quick Start */}
          <section id="quickstart" className="mb-32 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-500" />
              Skill Detection
            </h2>
            <p className="text-gray-400 mb-8">
              OmniRule automatically detects your tech stack to load relevant skills. 
              Supported indicators include:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              {['next.config.js', 'tailwind.config.js', 'schema.prisma', 'tsconfig.json', 'Dockerfile', 'package.json'].map(file => (
                <div key={file} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-gray-500">
                  {file}
                </div>
              ))}
            </div>
          </section>

          {/* Commands */}
          <section id="commands" className="mb-32 scroll-mt-20">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Terminal className="w-8 h-8 text-blue-500" />
              Command Registry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CommandCard 
                title="/orchestrate" 
                desc="The primary entry point. Decomposes any high-level task and dispatches specialists." 
              />
              <CommandCard 
                title="/extract" 
                desc="Reverse-engineers any live URL into design tokens and logic maps." 
              />
              <CommandCard 
                title="/tdd" 
                desc="Enforces the Red-Green-Refactor loop. Writing tests before code is mandatory." 
              />
              <CommandCard 
                title="/security" 
                desc="Runs a deep audit of the codebase, checking for auth leaks and OWASP vulnerabilities." 
              />
            </div>
          </section>

          <div className="border-t border-white/5 pt-12">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold hover:gap-4 transition-all">
              Return to Control Center <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function CommandCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-colors">
      <div className="text-blue-500 font-mono text-sm mb-3">{title}</div>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function DocLink({ children, href }: { children: string, href: string }) {
  return (
    <a 
      href={href} 
      className="block text-sm text-gray-500 hover:text-white transition-colors py-1"
    >
      {children}
    </a>
  );
}

function Step({ num, title, code }: { num: string, title: string, code: string }) {
  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-0 text-3xl font-black text-white/5">{num}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 font-mono text-xs text-gray-400">
        {code}
      </div>
    </div>
  );
}
