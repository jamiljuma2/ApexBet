'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apex-dark to-apex-card">
      <header className="border-b border-apex-muted/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-apex-primary">
            ApexBet
          </Link>
          <nav className="flex gap-4">
            <Link href="/auth/login" className="text-apex-primary hover:underline">
              Login
            </Link>
            <Link href="/auth/register" className="btn-primary">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to <span className="text-apex-primary">ApexBet</span>
        </motion.h1>
        <motion.p
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Premier sportsbook. Football, Basketball, Tennis, Live betting & Jackpots.
        </motion.p>
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/sports"
            className="btn-primary text-lg px-6 py-3 rounded-xl"
          >
            View Sports
          </Link>
          <Link
            href="/jackpots"
            className="bg-apex-muted hover:bg-apex-primary/20 text-white border border-apex-primary px-6 py-3 rounded-xl text-lg"
          >
            Jackpots
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
