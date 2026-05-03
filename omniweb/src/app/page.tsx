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
  Copy
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
            <a href="#" className="hover:text-white transition-colors">Agents</a>
            <Link href="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <a href="#" className="hover:text-white transition-colors">Ecosystem</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-400 mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            V2.0.0 Now Stable
          </motion.div>
          
          <motion.h1 
            {...fadeInUp}
            className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] text-gradient"
          >
            Engineering <br /> 
            Organism for Agents
          </motion.h1>
          
          <motion.p 
            {...fadeInUp}
            transition={{ delay: 0.1, ...fadeInUp.transition }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 tracking-tight leading-relaxed"
          >
            The world's first autonomous orchestration layer designed for AI coding fleets. 
            Build, ship, and scale with zero-waste engineering.
          </motion.p>

          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.2, ...fadeInUp.transition }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16"
          >
            <button className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform">
              Initialize Mission <ChevronRight className="w-5 h-5" />
            </button>
            <Link href="/docs" className="w-full md:w-auto border border-white/10 bg-white/5 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center">
              Read the Docs
            </Link>
          </motion.div>

          {/* One-Line Installer UI */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-xl mx-auto mb-20 p-1 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10"
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-[14px] px-6 py-4 flex items-center justify-between font-mono text-sm">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">$</span>
                <span className="text-blue-400">curl -fsSL omnirule.ai/install.sh | bash -s -- --opencode</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-white/10 rounded-full" />
                <Copy className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
          </motion.div>

          {/* GIF Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-4 overflow-hidden shadow-2xl"
          >
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
                alt="Code Visualization"
                className="w-full h-full object-cover opacity-40 blur-sm group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="z-20 text-center">
                <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-4 mx-auto glass cursor-pointer hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white fill-white" />
                </div>
                <p className="text-gray-400 font-medium">Click to visualize OmniRule in action</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-10 rounded-[32px] border border-white/5 bg-white/[0.02] md:col-span-2">
              <Shield className="w-8 h-8 mb-6 text-white" />
              <h3 className="text-2xl font-bold mb-3">Military Grade Security</h3>
              <p className="text-gray-500 leading-relaxed">Zero-trust enforcement and real-time threat modeling for every line of code.</p>
            </div>
            <div className="p-10 rounded-[32px] border border-white/5 bg-white/[0.02]">
              <Zap className="w-8 h-8 mb-6 text-white" />
              <h3 className="text-2xl font-bold mb-3">Instant Orchestration</h3>
              <p className="text-gray-500 leading-relaxed">Deploy agent fleets in milliseconds.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="text-white w-5 h-5" />
            <span className="font-bold tracking-tight">OmniRule</span>
          </div>
          <p className="text-sm text-gray-600">© 2026 OmniRule. AI for a better code.</p>
        </div>
      </footer>
    </main>
  );
}
