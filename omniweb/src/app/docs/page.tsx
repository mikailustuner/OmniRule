'use client';

import { motion } from 'framer-motion';
import { 
  Terminal, 
  Copy, 
  Check, 
  BookOpen, 
  Settings, 
  Rocket, 
  ArrowRight
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
      <aside className="w-64 border-r border-white/5 hidden lg:block sticky top-0 h-screen p-8">
        <Link href="/" className="flex items-center gap-2 mb-12">
          <Terminal className="w-6 h-6" />
          <span className="font-bold text-lg">OmniRule</span>
        </Link>
        <nav className="space-y-8">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Getting Started</h4>
            <div className="space-y-3">
              <DocLink active>Introduction</DocLink>
              <DocLink>Installation</DocLink>
              <DocLink>Quick Start</DocLink>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Architecture</h4>
            <div className="space-y-3">
              <DocLink>Agent Fleet</DocLink>
              <DocLink>Orchestration</DocLink>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-20 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-blue-500 mb-4 font-medium">
            <BookOpen className="w-4 h-4" />
            <span>Documentation</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">Introduction</h1>
          <p className="text-xl text-gray-400 leading-relaxed mb-12">
            OmniRule is an autonomous Agentic OS designed for AI coding fleets.
          </p>

          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Rocket className="w-6 h-6 text-green-500" />
              One-Line Installer
            </h2>
            <div className="relative bg-zinc-900 border border-white/10 rounded-xl p-6 font-mono text-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <button onClick={copyToClipboard} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <code className="text-blue-400">
                <span className="text-gray-500">$</span> {installCmd}
              </code>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-500" />
              Step-by-Step Installation
            </h2>
            <div className="space-y-12">
              <Step num="01" title="Clone the Repository" code="git clone https://github.com/mikailustuner/OmniRule.git" />
              <Step num="02" title="Install Dependencies" code="npm install" />
              <Step num="03" title="Initialize Fleet" code="./install.sh --opencode" />
            </div>
          </section>

          <div className="border-t border-white/5 pt-12">
            <Link href="/" className="flex items-center gap-2 text-white font-medium">
              Back to Home <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function DocLink({ children, active = false }: { children: string, active?: boolean }) {
  return (
    <button className={`block text-sm ${active ? 'text-white font-semibold' : 'text-gray-500 hover:text-white'}`}>
      {children}
    </button>
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
