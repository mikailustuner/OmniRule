'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRight, 
  Terminal, 
  Shield, 
  Cpu, 
  Zap, 
  Layers, 
  Code2,
  ArrowUpRight,
  Copy,
  Rocket,
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] hero-gradient pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass px-6 py-3 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Terminal className="text-black w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">OmniRule</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#agents" className="hover:text-white transition-colors">Agents</a>
            <a href="#skills" className="hover:text-white transition-colors">Skills</a>
            <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
          </div>
          <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="absolute inset-0 grid-background opacity-20 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400 mb-8 glow"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            V2.1.0 Operational: Fleet Expanded
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 leading-[0.85] text-gradient"
          >
            Engineering <br /> 
            <span className="text-gradient-blue">Omnipresence</span>
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1, ...fadeInUp.transition }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 tracking-tight leading-relaxed"
          >
            Deploy high-fidelity agent fleets that think, code, and secure like senior engineers. 
            The mandatory orchestration layer for the AI-first era.
          </motion.p>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2, ...fadeInUp.transition }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 mb-24"
          >
            <button className="w-full md:w-auto bg-white text-black px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all glow active:scale-95">
              Deploy Fleet <ChevronRight className="w-5 h-5" />
            </button>
            <Link href="/docs" className="w-full md:w-auto border border-white/10 bg-white/5 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center backdrop-blur-md">
              View Specs
            </Link>
          </motion.div>

          {/* Installer UI */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-32 p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 via-white/20 to-blue-500/20 glow-blue"
          >
            <div className="bg-black/90 backdrop-blur-2xl rounded-[15px] px-8 py-5 flex items-center justify-between font-mono text-sm group">
              <div className="flex items-center gap-4 overflow-hidden">
                <span className="text-blue-500 select-none">❯</span>
                <span className="text-gray-300 truncate whitespace-nowrap">curl -fsSL omnirule.ai/install.sh | bash</span>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText('curl -fsSL omnirule.ai/install.sh | bash')}
                className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors pl-4 border-l border-white/10"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>      {/* Agent Fleet Section */}
      <section id="agents" className="py-32 px-6 relative border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                The Specialist <span className="text-blue-500">Fleet</span>
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                OmniRule doesn't just "chat". It dispatches precise engineering personas 
                coordinated by a Chief Orchestrator.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-blue-400">11 Agents</div>
              <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-purple-400">16 Skills</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                name: 'Orchestrator', 
                slug: 'chief', 
                icon: Cpu, 
                desc: 'Main entry point. Routes tasks to the right specialists.',
                color: 'from-blue-500/20 to-blue-400/0'
              },
              { 
                name: 'Architect', 
                slug: 'system', 
                icon: Layers, 
                desc: 'High-level system design and refactoring strategy.',
                color: 'from-purple-500/20 to-purple-400/0'
              },
              { 
                name: 'QA Specialist', 
                slug: 'tester', 
                icon: Shield, 
                desc: 'Red-Green-Refactor expert. Ensures 100% test coverage.',
                color: 'from-green-500/20 to-green-400/0'
              },
              { 
                name: 'Migrator', 
                slug: 'data', 
                icon: Zap, 
                desc: 'Handles schema evolution and safe data transitions.',
                color: 'from-orange-500/20 to-orange-400/0'
              }
            ].map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-[32px] border border-white/5 bg-gradient-to-br ${agent.color} hover:border-white/10 transition-all group cursor-default`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <agent.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">@{agent.slug}</div>
                <h3 className="text-2xl font-bold mb-3">{agent.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{agent.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="py-32 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-gradient">Capability <span className="text-blue-500">Showcase</span></h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">See how OmniRule handles complex engineering workflows autonomously.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.02] relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Full-Stack Scaffolding</h3>
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  "Build a SaaS boilerplate with Next.js, Prisma, and Stripe." 
                  The system dispatches the Architect to define the schema, then the Frontend Ops for components, 
                  and the Migrator for DB setup.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500 font-mono">/orchestrate</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500 font-mono">Agent: Architect</span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.02] relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold">Legacy Refactoring</h3>
                </div>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  "Migrate this legacy React component to TypeScript and Tailwind."
                  The QA Specialist writes tests first, then the Architect refactors, 
                  ensuring 0% regression.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500 font-mono">/refactor</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-500 font-mono">Agent: QA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-32 px-6 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Expert <span className="text-gradient-blue">Skills</span></h2>
              <p className="text-xl text-gray-500 max-w-xl">Pre-loaded knowledge modules that give agents professional context.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto">
              {['nextjs-expert', 'tailwind-expert', 'prisma-expert', 'typescript-expert', 'docker-patterns', 'security-review'].map(skill => (
                <div key={skill} className="px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-mono text-gray-400 hover:text-white hover:border-white/10 transition-colors cursor-default">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Terminal Simulation */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] overflow-hidden shadow-2xl">
            <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="text-xs font-mono text-gray-500">omnirule — bash — 80x24</div>
              <div className="w-12" />
            </div>
            <div className="p-8 font-mono text-sm leading-relaxed min-h-[400px]">
              <div className="flex gap-3 mb-4">
                <span className="text-blue-500">❯</span>
                <span className="text-white">/orchestrate "Build a premium dashboard with authentication"</span>
              </div>
              <div className="text-gray-500 mb-2">[ORCHESTRATOR] Task received: Dashboard + Auth</div>
              <div className="text-blue-400 mb-2">[DISPATCH] → architect (Strategic Planning)</div>
              <div className="text-purple-400 mb-2">[DISPATCH] → security-officer (Auth Pattern Audit)</div>
              <div className="text-gray-400 mb-4 italic">... loading clean-architecture skill ...</div>
              <div className="text-green-500 flex items-center gap-2">
                <span className="animate-pulse">●</span>
                <span>Architect is drafting system blueprint...</span>
              </div>
              <div className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <div className="text-blue-400 mb-2">Blueprint generated: dashboard-v1</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-gray-500">- Layout: App Shell</div>
                  <div className="text-gray-500">- State: Zustand</div>
                  <div className="text-gray-500">- Auth: NextAuth.js</div>
                  <div className="text-gray-500">- DB: PostgreSQL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center glow">
              <Terminal className="text-black w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tighter">OmniRule</span>
          </div>
          <div className="flex gap-12 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Github</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
          <p className="text-sm text-gray-600">© 2026 OmniRule Research. Built for the future of code.</p>
        </div>
      </footer>
    </main>
  );
}
