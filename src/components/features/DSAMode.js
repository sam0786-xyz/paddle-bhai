'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Plus, Sparkles, Loader2, CheckCircle2, Target, Trophy, MessageSquare, X, ChevronDown, ChevronRight, ExternalLink, Lock, Unlock } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useGemini } from '@/hooks/useGemini';
import { PROMPTS } from '@/lib/prompts';
import { STRIVER_SHEET, getSheetProgress } from '@/lib/dsaSheet';
import { DSA_TOPICS, DIFFICULTIES } from '@/lib/utils';

export default function DSAMode() {
  const { dsaProblems, addDSAProblem, addXP } = useTasks();
  const { generate, loading, error: apiError } = useGemini();

  const [activeTab, setActiveTab] = useState('challenge');
  const [expandedStep, setExpandedStep] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newProblem, setNewProblem] = useState({
    title: '', topic: 'Arrays', difficulty: 'easy', status: 'solved', notes: '', timeTaken: ''
  });

  // Build set of solved title strings (lowercase) for fast lookup
  const solvedSet = useMemo(() => new Set(dsaProblems.map(p => p.title.toLowerCase())), [dsaProblems]);
  const sheetProgress = useMemo(() => getSheetProgress(dsaProblems.map(p => p.title)), [dsaProblems]);

  // Determine current step: first step that is NOT 100%
  const currentStepIndex = useMemo(() => {
    const idx = sheetProgress.findIndex(s => s.percent < 100);
    return idx >= 0 ? idx : sheetProgress.length - 1;
  }, [sheetProgress]);

  const totalProblems = sheetProgress.reduce((a, s) => a + s.total, 0);
  const totalSolved = sheetProgress.reduce((a, s) => a + s.done, 0);
  const overallPercent = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!newProblem.title.trim()) return;
    addDSAProblem(newProblem);
    const xpReward = newProblem.difficulty === 'hard' ? 50 : newProblem.difficulty === 'medium' ? 30 : 15;
    addXP(xpReward);
    setNewProblem({ title: '', topic: 'Arrays', difficulty: 'easy', status: 'solved', notes: '', timeTaken: '' });
    setShowAdd(false);
  };

  const markProblemSolved = (problem, stepTitle, topicName) => {
    addDSAProblem({ title: problem.title, topic: topicName, difficulty: problem.difficulty, status: 'solved' });
    const xpReward = problem.difficulty === 'hard' ? 50 : problem.difficulty === 'medium' ? 30 : 15;
    addXP(xpReward);
  };

  const getDailyChallenge = async () => {
    try {
      const weakTopics = DSA_TOPICS.filter(t => dsaProblems.filter(p => p.topic === t).length < 3).slice(0, 5);
      const level = dsaProblems.length < 20 ? 'beginner' : dsaProblems.length < 50 ? 'intermediate' : 'advanced';
      const prompt = PROMPTS.DSA_DAILY_CHALLENGE(dsaProblems, weakTopics, level);
      const data = await generate(prompt, true);
      if (data) setDailyChallenge(data);
    } catch(err) { console.error(err); }
  };

  const toggleStep = (stepNum) => {
    setExpandedStep(prev => prev === stepNum ? null : stepNum);
    setExpandedTopic(null);
  };

  const toggleTopic = (key) => {
    setExpandedTopic(prev => prev === key ? null : key);
  };

  return (
    <div className="dsa-mode">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 tab-switcher bg-tertiary p-1 rounded-full w-fit">
          {['challenge', 'roadmap', 'log'].map(tab => (
            <button 
              key={tab}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${activeTab === tab ? 'bg-primary text-black' : 'text-muted'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'challenge' ? 'AI Coach' : tab === 'roadmap' ? 'Roadmap' : 'Problem Log'}
            </button>
          ))}
        </div>
        
        {activeTab === 'log' && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add 
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ====== STRIVER SHEET TAB ====== */}
        {activeTab === 'roadmap' && (
          <motion.div key="sheet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Overall Progress Bar */}
            <div className="card mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2"><Code2 size={20}/> Striver A2Z DSA Sheet</h2>
                <span className="mono-text text-sm font-bold text-accent-xp">{totalSolved}/{totalProblems} ({overallPercent}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${overallPercent}%` }}></div>
              </div>
              <p className="text-xs text-muted mt-2">Use this as a reference roadmap. Your AI Coach will adapt problems to your level.</p>
            </div>

            {/* Steps Accordion */}
            <div className="flex-col gap-3">
              {STRIVER_SHEET.map((step, si) => {
                const progress = sheetProgress[si];
                const isCurrentStep = si === currentStepIndex;
                const isLocked = false;
                const isExpanded = expandedStep === step.step;

                return (
                  <div key={step.step} className={`card step-card ${isCurrentStep ? 'step-current' : ''}`}>
                    <button 
                      className="step-header flex justify-between items-center w-full text-left"
                      onClick={() => !isLocked && toggleStep(step.step)}
                      disabled={isLocked}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`step-badge ${progress.percent === 100 ? 'step-done' : isCurrentStep ? 'step-active' : ''}`}>
                          {progress.percent === 100 ? <CheckCircle2 size={16}/> : isLocked ? <Lock size={14}/> : step.step}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{step.title}</div>
                          <div className="text-xs text-muted">{progress.done}/{progress.total} problems</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="step-progress-mini">
                          <div className="step-progress-mini-fill" style={{ width: `${progress.percent}%` }}></div>
                        </div>
                        <span className="mono-text text-xs font-bold" style={{ color: progress.percent === 100 ? '#10B981' : 'var(--text-muted)' }}>{progress.percent}%</span>
                        {!isLocked && (isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>)}
                      </div>
                    </button>

                    {/* Expanded Topics */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex-col gap-2 mt-4 pl-8">
                            {step.topics.map((topic, ti) => {
                              const topicKey = `${step.step}-${ti}`;
                              const topicSolved = topic.problems.filter(p => solvedSet.has(p.title.toLowerCase())).length;
                              const isTopicExpanded = expandedTopic === topicKey;

                              return (
                                <div key={topicKey} className="topic-card">
                                  <button 
                                    className="flex justify-between items-center w-full text-left py-2"
                                    onClick={() => toggleTopic(topicKey)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isTopicExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                      <span className="text-sm font-medium">{topic.name}</span>
                                    </div>
                                    <span className="text-xs text-muted mono-text">{topicSolved}/{topic.problems.length}</span>
                                  </button>

                                  <AnimatePresence>
                                    {isTopicExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="flex-col gap-1 mt-2 mb-2">
                                          {topic.problems.map((problem, pi) => {
                                            const isSolved = solvedSet.has(problem.title.toLowerCase());
                                            return (
                                              <div key={pi} className={`problem-row flex justify-between items-center ${isSolved ? 'problem-solved' : ''}`}>
                                                <div className="flex items-center gap-2 flex-1">
                                                  <button
                                                    className={`problem-check ${isSolved ? 'checked' : ''}`}
                                                    onClick={() => !isSolved && markProblemSolved(problem, step.title, topic.name)}
                                                    disabled={isSolved}
                                                  >
                                                    {isSolved && <CheckCircle2 size={14}/>}
                                                  </button>
                                                  <span className={`text-sm ${isSolved ? 'line-through text-muted' : ''}`}>{problem.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <span className={`difficulty-tag difficulty-${problem.difficulty}`}>{problem.difficulty}</span>
                                                  {problem.link && (
                                                    <a href={problem.link} target="_blank" rel="noopener noreferrer" className="link-icon">
                                                      <ExternalLink size={12}/>
                                                    </a>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ====== AI COACH TAB ====== */}
        {activeTab === 'challenge' && (
          <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium flex items-center gap-2"><Sparkles size={18}/> AI Coach</h2>
              <button className="btn btn-secondary" onClick={getDailyChallenge} disabled={loading}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Get Next Problem'}
              </button>
            </div>

            <div className="mb-4 p-3 bg-tertiary rounded-md text-xs text-muted">
              <p>Your AI coach analyzes your solved problems and identifies weak patterns. It adapts to your learning pace and suggests the next problem you should tackle.</p>
            </div>

            {apiError && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem', color: '#f87171' }}>
                <strong>⚠ Error:</strong> {apiError.includes('quota') || apiError.includes('429') ? 'API quota exceeded. Wait a minute and try again, or update your API key in .env' : apiError}
              </div>
            )}

            {!dailyChallenge ? (
              <div className="empty-state text-center text-muted py-10">
                <Target className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click &quot;Get Next Problem&quot; to receive a personalized challenge targeting your weakest areas.</p>
              </div>
            ) : (
              <div>
                 <h3 className="text-xl font-bold mb-2">{dailyChallenge.title}</h3>
                 <div className="flex gap-2 mb-4 flex-wrap">
                    <span className="bg-tertiary text-xs px-2 py-1 rounded-full">{dailyChallenge.topic}</span>
                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold difficulty-tag difficulty-${dailyChallenge.difficulty}`}>{dailyChallenge.difficulty}</span>
                    {dailyChallenge.estimatedTime && <span className="bg-tertiary text-xs px-2 py-1 rounded-full mono-text">{dailyChallenge.estimatedTime}m</span>}
                    {dailyChallenge.leetcodeLink && (
                      <a href={dailyChallenge.leetcodeLink} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded-full flex items-center gap-1" style={{ background: 'rgba(6,182,212,0.12)', color: 'var(--accent-cyan)' }}>
                        <ExternalLink size={10}/> LeetCode
                      </a>
                    )}
                 </div>

                 {/* Why this problem - the adaptive reasoning */}
                 {dailyChallenge.whyThisProblem && (
                   <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                     <span className="font-bold text-accent-purple">Why this problem? </span>
                     <span className="text-muted">{dailyChallenge.whyThisProblem}</span>
                   </div>
                 )}

                 <p className="text-sm text-secondary mb-4">{dailyChallenge.description}</p>

                 {dailyChallenge.hints && dailyChallenge.hints.length > 0 && (
                   <details className="mb-4">
                     <summary className="text-xs font-bold text-accent-purple cursor-pointer">Show Hints</summary>
                     <ul className="mt-2 flex-col gap-1">
                       {dailyChallenge.hints.map((h, i) => (
                         <li key={i} className="text-xs text-muted pl-4">• {h}</li>
                       ))}
                     </ul>
                   </details>
                 )}

                 {dailyChallenge.approach && (
                   <details className="mb-4">
                     <summary className="text-xs font-bold text-accent-cyan cursor-pointer">Approach (No Spoilers)</summary>
                     <p className="text-xs text-muted mt-2 pl-4">{dailyChallenge.approach}</p>
                   </details>
                 )}
                 
                 <button className="btn btn-primary bg-green-500 border-0 text-black mt-4" onClick={() => {
                   addDSAProblem({ title: dailyChallenge.title, topic: dailyChallenge.topic, difficulty: dailyChallenge.difficulty, status: 'solved' });
                   addXP(100);
                   setDailyChallenge(null);
                 }}>
                   <CheckCircle2 size={16} /> Mark Solved (+100 XP)
                 </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ====== PROBLEM LOG TAB ====== */}
        {activeTab === 'log' && (
          <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="col-span-full mb-4">
               <div className="grid grid-cols-4 gap-4">
                  <div className="card text-center p-4">
                     <Code2 size={20} className="mx-auto mb-2 text-primary" />
                     <div className="mono-text text-2xl font-bold">{dsaProblems.length}</div>
                     <div className="text-xs text-muted">Solved</div>
                  </div>
                  <div className="card text-center p-4">
                     <Target size={20} className="mx-auto mb-2 text-green-400" />
                     <div className="mono-text text-2xl font-bold">{dsaProblems.filter(p => p.difficulty === 'easy').length}</div>
                     <div className="text-xs text-muted">Easy</div>
                  </div>
                  <div className="card text-center p-4">
                     <Trophy size={20} className="mx-auto mb-2 text-yellow-400" />
                     <div className="mono-text text-2xl font-bold">{dsaProblems.filter(p => p.difficulty === 'medium').length}</div>
                     <div className="text-xs text-muted">Medium</div>
                  </div>
                  <div className="card text-center p-4">
                     <Sparkles size={20} className="mx-auto mb-2 text-red-500" />
                     <div className="mono-text text-2xl font-bold">{dsaProblems.filter(p => p.difficulty === 'hard').length}</div>
                     <div className="text-xs text-muted">Hard</div>
                  </div>
               </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2"><Code2 size={18}/> Problem Log</h2>
              {dsaProblems.length === 0 ? (
                <div className="empty-state text-center text-muted py-10">
                  <Code2 className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start tracking your DSA journey.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-primary/20 text-muted text-xs">
                        <th className="py-2">Problem</th>
                        <th className="py-2">Topic</th>
                        <th className="py-2">Diff</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsaProblems.slice().reverse().map((p, i) => (
                        <tr key={p.id || i} className="border-b border-primary/10">
                          <td className="py-3">
                            <span className="font-medium text-sm">{p.title}</span>
                          </td>
                          <td className="py-3 text-xs"><span className="bg-tertiary px-2 py-1 rounded-sm">{p.topic}</span></td>
                          <td className="py-3 text-xs uppercase font-bold" style={{
                            color: p.difficulty === 'easy' ? '#10B981' : p.difficulty === 'medium' ? '#FBBF24' : '#EF4444'
                          }}>
                            {p.difficulty}
                          </td>
                          <td className="py-3 text-xs text-muted">{new Date(p.solvedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Problem Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)}>
            <motion.div className="modal bg-[#0A0A0A] border border-white/10 p-6 rounded-lg max-w-md w-full relative" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-muted hover:text-white" onClick={() => setShowAdd(false)}><X size={18}/></button>
              <h2 className="text-lg font-bold mb-4">Add Problem</h2>
              <form onSubmit={handleAddProblem} className="flex flex-col gap-4">
                <div className="input-group">
                  <label className="text-xs text-secondary">Title</label>
                  <input className="input" autoFocus required value={newProblem.title} onChange={e => setNewProblem({ ...newProblem, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="input-group">
                     <label className="text-xs text-secondary">Topic</label>
                     <select className="input" value={newProblem.topic} onChange={e => setNewProblem({ ...newProblem, topic: e.target.value })}>
                       {DSA_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                   <div className="input-group">
                     <label className="text-xs text-secondary">Difficulty</label>
                     <select className="input" value={newProblem.difficulty} onChange={e => setNewProblem({ ...newProblem, difficulty: e.target.value })}>
                       {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                     </select>
                   </div>
                </div>
                <div className="input-group">
                  <label className="text-xs text-secondary">Time Taken (min)</label>
                  <input className="input" type="number" value={newProblem.timeTaken} onChange={e => setNewProblem({ ...newProblem, timeTaken: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary w-full mt-2">Log Problem</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .bg-tertiary { background: var(--bg-tertiary); }
        .text-muted { color: var(--text-muted); }
        .text-secondary { color: var(--text-secondary); }
        .bg-primary { background: var(--primary); }
        .text-black { color: var(--primary-inverse); }
        .text-primary { color: var(--primary); }
        .text-green-400 { color: #4ade80; }
        .text-yellow-400 { color: #facc15; }
        .text-red-500 { color: #ef4444; }
        .text-accent-xp { color: var(--accent-xp); }
        .text-accent-purple { color: var(--accent-purple); }
        .text-accent-cyan { color: var(--accent-cyan); }
        .rounded-full { border-radius: 9999px; }
        .rounded-md { border-radius: var(--radius-md); }
        .w-fit { width: fit-content; }
        .w-full { width: 100%; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
        .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
        .p-1 { padding: 0.25rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .gap-1 { gap: 0.25rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .pl-4 { padding-left: 1rem; }
        .pl-8 { padding-left: 2rem; }
        .flex-1 { flex: 1 1 0%; }
        .flex-col { display: flex; flex-direction: column; }
        .flex { display: flex; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .col-span-full { grid-column: 1 / -1; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .font-medium { font-weight: 500; }
        .font-bold { font-weight: 700; }
        .font-mono { font-family: var(--font-mono); }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .max-w-2xl { max-width: 42rem; }
        .max-w-md { max-width: 28rem; }
        .overflow-auto { overflow: auto; }
        .overflow-hidden { overflow: hidden; }
        .opacity-50 { opacity: 0.5; }
        .border-b { border-bottom-width: 1px; }
        .border-primary\\/10 { border-color: rgba(255,255,255,0.1); }
        .border-primary\\/20 { border-color: rgba(255,255,255,0.2); }
        .border { border-width: 1px; }
        .bg-green-500 { background: var(--accent-xp); }
        .border-0 { border-width: 0; }
        .absolute { position: absolute; }
        .relative { position: relative; }
        .top-4 { top: 1rem; }
        .right-4 { right: 1rem; }
        .line-through { text-decoration: line-through; }
        
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8);
          z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        /* ---- Progress Bar ---- */
        .progress-bar-bg {
          width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%; background: linear-gradient(90deg, var(--accent-xp), var(--accent-cyan)); border-radius: 999px; transition: width 0.5s ease;
        }

        /* ---- Step Card ---- */
        .step-card { transition: all 0.2s ease; margin-bottom: 8px; }
        .step-current { border-color: var(--accent-cyan) !important; box-shadow: 0 0 12px rgba(6,182,212,0.1); }
        .step-locked { opacity: 0.4; pointer-events: none; }
        .step-header { cursor: pointer; background: none; border: none; color: inherit; padding: 4px 0; width: 100%; }
        .step-badge {
          width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 0.75rem; font-weight: 700; background: var(--bg-tertiary); color: var(--text-muted); flex-shrink: 0;
        }
        .step-badge.step-done { background: var(--accent-xp); color: #000; }
        .step-badge.step-active { background: var(--accent-cyan); color: #000; }
        .step-progress-mini {
          width: 60px; height: 4px; background: var(--bg-tertiary); border-radius: 999px; overflow: hidden;
        }
        .step-progress-mini-fill {
          height: 100%; background: var(--accent-xp); border-radius: 999px; transition: width 0.3s ease;
        }

        /* ---- Topic Card ---- */
        .topic-card {
          background: var(--bg-tertiary); border-radius: 8px; padding: 8px 14px; border: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 6px;
        }
        .topic-card button { background: none; border: none; color: inherit; cursor: pointer; width: 100%; }

        /* ---- Problem Row ---- */
        .problem-row {
          padding: 6px 8px; border-radius: var(--radius-sm, 4px); transition: background 0.15s;
        }
        .problem-row:hover { background: rgba(255,255,255,0.03); }
        .problem-solved { opacity: 0.5; }
        .problem-check {
          width: 20px; height: 20px; border-radius: 4px; border: 2px solid rgba(255,255,255,0.2);
          background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; color: var(--accent-xp);
        }
        .problem-check.checked {
          background: var(--accent-xp); border-color: var(--accent-xp); color: #000;
        }
        .problem-check:hover:not(.checked) { border-color: var(--accent-xp); }

        /* ---- Difficulty Tags ---- */
        .difficulty-tag {
          font-size: 0.6rem; padding: 2px 6px; border-radius: 999px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .difficulty-easy { background: rgba(16,185,129,0.15); color: #10B981; }
        .difficulty-medium { background: rgba(251,191,36,0.15); color: #FBBF24; }
        .difficulty-hard { background: rgba(239,68,68,0.15); color: #EF4444; }

        /* ---- Link Icon ---- */
        .link-icon {
          color: var(--text-muted); transition: color 0.15s; padding: 2px;
        }
        .link-icon:hover { color: var(--accent-cyan); }
      `}</style>
    </div>
  );
}
