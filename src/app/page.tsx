'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-apex-dark to-apex-card">
      <header className="border-b border-apex-muted/50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-bold text-apex-primary">
            ApexBet
          </Link>
          <nav className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto items-center">
            <Link href="/auth/login" className="text-apex-primary hover:underline w-full sm:w-auto text-center">
              Login
            </Link>
            <Link href="/auth/register" className="btn-primary w-full sm:w-auto text-center">
              Register
            </Link>
          </nav>
        </div>
      </header>
      <section className="container mx-auto px-2 sm:px-4 py-8 sm:py-16 text-center">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to <span className="text-apex-primary">ApexBet</span>
        </motion.h1>
        <motion.p
          className="text-base sm:text-xl text-gray-300 mb-8 max-w-xs sm:max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Premier sportsbook. Football, Basketball, Tennis, Live betting & Jackpots.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/sports"
            className="btn-primary text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 rounded-xl"
          >
            View Sports
          </Link>
          <Link
            href="/jackpots"
            className="bg-apex-muted hover:bg-apex-primary/20 text-white border border-apex-primary px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-base sm:text-lg"
          >
            Jackpots
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
