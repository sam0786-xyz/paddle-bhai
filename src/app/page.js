'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Target, Focus, BrainCircuit, LineChart, Settings, BookOpen } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';

import { Suspense } from 'react';
import OverviewMode from '@/components/features/OverviewMode';
import StudyMode from '@/components/features/StudyMode';
import DSAMode from '@/components/features/DSAMode';

const TABS = [
  { id: 'overview', label: 'Command Hub', icon: Target },
  { id: 'study', label: 'Study AI', icon: BrainCircuit },
  { id: 'dsa', label: 'Algorithms', icon: BookOpen },
];

function StudyHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const currentTab = searchParams.get('tab') || 'overview';
  const { xp, level } = useTasks();

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const xpProgress = ((xp || 0) / (level * 100)) * 100;

  return (
    <div className="study-hub-container">
      {/* Top Gamification Header */}
      <header className="hub-header fade-in-up">
        <div className="container header-inner">
          <div className="brand">
            <span className="brand-logo">Δ</span>
            <h1>padhle</h1>
          </div>
          
          <div className="gamification-status">
            <div className="level-badge">LVL {level}</div>
            <div className="xp-container">
              <div className="xp-bar-container">
                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }} />
              </div>
              <span className="mono-text text-xs text-muted mt-1">{xp} / {level * 100} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="hub-main container">
        <div className="mode-content">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {currentTab === 'overview' && <OverviewMode />}
              {currentTab === 'study' && <StudyMode />}
              {currentTab === 'dsa' && <DSAMode />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Dynamic Dock */}
      <div className="floating-dock-wrapper">
        <nav className="floating-dock glass-panel fade-in-up" aria-label="Main Navigation">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`dock-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="dock-label">{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="dock-indicator"
                    className="dock-indicator"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <style jsx>{`
        .study-hub-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding-bottom: 120px; /* Space for dock */
        }
        .header-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--border-primary);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }
        .brand h1 {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .gamification-status {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .level-badge {
          font-family: var(--font-mono);
          background: var(--primary);
          color: var(--primary-inverse);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .xp-container {
          min-width: 120px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .text-xs { font-size: 0.75rem; }
        .text-muted { color: var(--text-muted); }
        .mt-1 { margin-top: 4px; }
        
        .hub-main {
          flex: 1;
          padding-top: var(--space-xl);
        }
        
        .floating-dock-wrapper {
          position: fixed;
          bottom: var(--space-xl);
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 100;
          pointer-events: none;
        }
        .floating-dock {
          pointer-events: auto;
          display: flex;
          gap: 4px;
          padding: 8px;
          border-radius: var(--radius-full);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .dock-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 20px;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          transition: color 150ms var(--ease-out), transform 150ms var(--ease-out);
        }
        .dock-btn:hover {
          color: var(--text-primary);
        }
        .dock-btn:active {
          transform: scale(0.92);
        }
        .dock-btn.active {
          color: var(--primary-inverse);
        }
        .dock-label {
          font-size: 0.65rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          z-index: 2;
        }
        .dock-btn svg {
          z-index: 2;
        }
        .dock-indicator {
          position: absolute;
          inset: 0;
          background: var(--primary);
          border-radius: var(--radius-full);
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export default function StudyHub() {
  return (
    <Suspense fallback={<div className="container mt-20 text-muted">Initialize Hub...</div>}>
      <StudyHubContent />
    </Suspense>
  );
}
