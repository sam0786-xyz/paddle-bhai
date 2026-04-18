import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/context/ThemeContext';
import { TaskProvider } from '@/context/TaskContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'PadhleBhai — Study Hub',
  description: 'AI-Powered Study Platform with Gamification',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className={`${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#030303" />
      </head>
      <body>
        <ThemeProvider>
          <TaskProvider>
            {/* The single page layout handles everything, no Sidebar here */}
            {children}
          </TaskProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
