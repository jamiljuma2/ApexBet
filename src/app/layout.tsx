import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
});
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ApexBet - Sports Betting',
  description: 'Premier sportsbook and online betting. Football, basketball, tennis, jackpots.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans min-h-screen flex flex-col`}>
        <Providers>{children}</Providers>
        <footer className="w-full py-4 text-center text-xs text-gray-400 bg-transparent mt-auto">
          &copy; {new Date().getFullYear()} ApexBet. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
