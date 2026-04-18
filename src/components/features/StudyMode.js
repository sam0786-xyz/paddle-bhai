'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Plus, Loader2, Trash2, BookOpen, CheckCircle2, BrainCircuit, RotateCcw, Calendar, Target } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { useGemini } from '@/hooks/useGemini';
import { PROMPTS } from '@/lib/prompts';

export default function StudyMode() {
  const { projectContexts = [], addProjectContext, removeProjectContext, addTask, addXP, exams } = useTasks();
  const { generate, loading } = useGemini();
  const fileInputRef = useRef(null);

  const [uploadLoading, setUploadLoading] = useState(false);
  const [syllabus, setSyllabus] = useState('');
  const [examDates, setExamDates] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [mcqQuiz, setMcqQuiz] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [checklist, setChecklist] = useState({}); // { dayIndex-blockIndex: true/false }
  const [activeTab, setActiveTab] = useState('planner');

  // Build exam context string from state
  const examContextStr = exams
    ?.filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(e => {
      const d = new Date(e.date);
      return `${e.subject}: ${d.toLocaleDateString('en-GB')} ${e.time || ''}${e.notes ? ' (' + e.notes + ')' : ''}`;
    }).join('\n') || '';

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/pdf/parse', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to parse PDF');
      
      const data = await res.json();
      addProjectContext({ name: file.name, text: data.text, size: file.size });
      addXP(10);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
      e.target.value = null;
    }
  };

  const handleGenerate = async () => {
    try {
      const knowledgeContext = projectContexts.length > 0 
        ? `Use this strictly as background context:\n${projectContexts.map(c => c.text).join('\n---\n')}\n\n`
        : '';
      
      const allExamDates = examDates ? examDates + '\n' + examContextStr : examContextStr;
      const rawPrompt = PROMPTS.GENERATE_STUDY_PLAN(syllabus, allExamDates, 'flexible', 'daily');
      const finalPrompt = knowledgeContext + rawPrompt;

      const data = await generate(finalPrompt, true);
      if (data) {
        setGeneratedPlan(data);
        setChecklist({}); // Reset checklist for new plan
        addXP(50);
      }
    } catch (err) { console.error(err); }
  };

  const generateMCQ = async () => {
    try {
      const context = projectContexts.length > 0 
        ? projectContexts.map(c => c.text).join('\n---\n')
        : '';
      const prompt = PROMPTS.GENERATE_MCQ_QUIZ(context, 'General AI/ML & CSE', 5);
      const data = await generate(prompt, true);
      if (data) {
        setMcqQuiz(data);
        setMcqAnswers({});
        setMcqSubmitted(false);
      }
    } catch (err) { console.error(err); }
  };

  const toggleCheckItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Count completed checklist items
  const totalBlocks = generatedPlan?.dailyPlans?.reduce((sum, day) => sum + (day.blocks?.length || 0), 0) || 0;
  const completedBlocks = Object.values(checklist).filter(Boolean).length;
  const checklistPercent = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;

  const transferTasks = () => {
    if (!generatedPlan?.dailyPlans) return;
    generatedPlan.dailyPlans.forEach(day => {
      day.blocks?.forEach(b => {
        addTask({ 
           title: b.topic || b.activityType, 
           domain: b.activityType?.toLowerCase() || 'general',
           description: `${day.date} [${b.time}]: ${b.resources || ''}`,
           duration: b.duration || 60
        });
      });
    });
    setGeneratedPlan(null);
  };

  // MCQ scoring
  const handleMCQSubmit = () => {
    setMcqSubmitted(true);
    if (!mcqQuiz?.questions) return;
    const correct = mcqQuiz.questions.filter((q, i) => mcqAnswers[i] === q.answer).length;
    addXP(correct * 20);
  };

  return (
    <div className="study-ai-container">
      <div className="grid layout-grid">
        
        {/* Left Col: Knowledge Base */}
        <div className="flex-col gap-6">
          <section className="card flex-col h-full bg-secondary">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><BookOpen size={18}/> Knowledge Base</h2>
            <p className="text-sm text-secondary mb-6">Upload syllabus PDFs, class notes, or reference materials. AI will personalize generation based on this exact context.</p>
            
            <div className="flex-col gap-2 mb-6">
              {projectContexts.length === 0 ? (
                 <div className="text-center py-6 border border-dashed border-primary/20 rounded-md text-xs text-muted">No context attached.</div>
              ) : (
                projectContexts.map(ctx => (
                  <div key={ctx.id} className="flex justify-between items-center p-3 bg-tertiary rounded-md border border-primary/10">
                    <div className="flex items-center gap-2">
                       <FileText size={14} className="text-purple-400" />
                       <span className="text-sm font-medium truncate max-w-[200px]">{ctx.name}</span>
                    </div>
                    <button className="text-muted hover:text-red-400 transition-colors" onClick={() => removeProjectContext(ctx.id)}>
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))
              )}
            </div>

            <input type="file" accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button className="btn btn-secondary w-full border border-dashed border-primary/20" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}>
              {uploadLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {uploadLoading ? 'Parsing Document...' : 'Upload PDF'}
            </button>

            {/* Auto-detected exams */}
            {examContextStr && (
              <div className="mt-6 p-3 bg-tertiary rounded-md border border-primary/10">
                <h3 className="text-xs font-bold text-accent-orange mb-2 flex items-center gap-1"><Calendar size={12}/> Auto-detected Exams</h3>
                <div className="flex-col gap-1">
                  {exams?.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).map((e, i) => (
                    <div key={i} className="text-xs text-muted">{e.subject} — {new Date(e.date).toLocaleDateString('en-GB')}</div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Col: AI Engine */}
        <div className="flex-col gap-6">
          <section className="card flex-col">
             <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles size={18}/> Engine Configuration</h2>
             <div className="flex-col gap-4 mb-4">
               <div className="input-group">
                 <label className="text-xs text-secondary mb-1">Additional Guidance / Topics</label>
                 <textarea className="input text-sm" rows={3} placeholder="Tell the AI what to focus on..." value={syllabus} onChange={e=>setSyllabus(e.target.value)} />
               </div>
               <div className="input-group">
                 <label className="text-xs text-secondary mb-1">Timeline & Deadlines</label>
                 <input className="input text-sm" placeholder="e.g. Midterms next Monday..." value={examDates} onChange={e=>setExamDates(e.target.value)} />
               </div>
             </div>

             {/* Tabs */}
             <div className="flex gap-2 bg-tertiary p-1 rounded-full w-fit mx-auto mb-4">
               <button 
                 className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activeTab === 'planner' ? 'bg-primary text-black' : 'text-muted'}`}
                 onClick={() => setActiveTab('planner')}
               >
                 Master Planner
               </button>
               <button 
                 className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${activeTab === 'mcq' ? 'bg-primary text-black' : 'text-muted'}`}
                 onClick={() => setActiveTab('mcq')}
               >
                 MCQ Challenge
               </button>
             </div>

             {activeTab === 'planner' && (
               <button className="btn btn-primary w-full shadow-glow" onClick={handleGenerate} disabled={loading || (!syllabus && projectContexts.length === 0)}>
                 {loading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} Generate Master Plan
               </button>
             )}
             {activeTab === 'mcq' && (
               <button className="btn btn-secondary w-full" onClick={generateMCQ} disabled={loading}>
                 {loading ? <Loader2 size={16} className="animate-spin"/> : <BrainCircuit size={16}/>} Generate 5-Question Quiz
               </button>
             )}
          </section>

          <AnimatePresence>
            {/* ====== GENERATED PLAN ====== */}
            {activeTab === 'planner' && generatedPlan && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card flex-col border-accent-cyan/30"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-md text-cyan-400 shrink-0">{generatedPlan.planTitle || 'Your Master Schedule'}</h3>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary px-3 py-1 text-xs shrink-0" onClick={() => { setGeneratedPlan(null); setChecklist({}); }}>
                      <RotateCcw size={14}/> Reset
                    </button>
                    <button className="btn btn-primary bg-accent-cyan text-black border-0 px-3 py-1 text-xs shrink-0" onClick={transferTasks}>
                      <CheckCircle2 size={14}/> Transfer to Quests
                    </button>
                  </div>
                </div>

                {/* Adaptive Checklist Progress */}
                <div className="mb-4 p-3 bg-tertiary rounded-lg border border-primary/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-accent-xp flex items-center gap-1"><Target size={12}/> Adaptive Progress</span>
                    <span className="mono-text text-xs font-bold">{completedBlocks}/{totalBlocks} ({checklistPercent}%)</span>
                  </div>
                  <div className="checklist-bar-bg">
                    <div className="checklist-bar-fill" style={{ width: `${checklistPercent}%` }}></div>
                  </div>
                  <p className="text-xs text-muted mt-1">Check off blocks as you complete them. The AI adapts future plans based on your daily progress.</p>
                </div>
                
                <div className="flex-col gap-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  
                  {/* Daily Plans */}
                  {generatedPlan.dailyPlans?.map((day, i) => (
                    <div key={i} className="bg-tertiary p-4 rounded-xl border border-primary/10 hover-active">
                      <div className="flex justify-between items-center mb-3">
                         <h4 className="font-bold text-md text-primary">{day.date}</h4>
                      </div>
                      
                      {/* Guidance Tags */}
                      <div className="flex flex-col gap-2 mb-4 guidance-box p-3 rounded-lg border border-primary/5">
                         <div className="text-xs">
                           <span className="font-bold text-accent-purple">Academic Notes:</span> <span className="text-muted">{day.academicNotes}</span>
                         </div>
                         <div className="text-xs">
                           <span className="font-bold text-accent-cyan">Placement Goal:</span> <span className="text-muted">{day.placementNotes}</span>
                         </div>
                         {day.adaptationTip && (
                           <div className="adaptation-tip">
                             Tip: {day.adaptationTip}
                           </div>
                         )}
                      </div>

                      {/* Time Blocks as Checklist */}
                      <div className="flex flex-col gap-2">
                        {day.blocks?.map((b, bi) => {
                          const key = `${i}-${bi}`;
                          const isChecked = checklist[key];
                          return (
                            <div key={bi} className={`flex gap-3 items-center block-row p-2 rounded-md ${isChecked ? 'block-done' : ''}`}>
                              <button 
                                className={`block-check ${isChecked ? 'checked' : ''}`}
                                onClick={() => toggleCheckItem(key)}
                              >
                                {isChecked && <CheckCircle2 size={14}/>}
                              </button>
                              <div className="text-xs mono-text text-muted w-24 shrink-0">{b.time}</div>
                              <div className="w-1 h-8 rounded-full shrink-0" style={{ background: isChecked ? 'var(--accent-xp)' : 'var(--border-primary)' }}></div>
                              <div className="flex-col flex-1">
                                <div className={`text-sm font-medium ${isChecked ? 'line-through text-muted' : ''}`}>{b.topic}</div>
                                <div className="text-xs text-muted flex justify-between">
                                  <span>{b.activityType}</span>
                                  {b.duration && <span className="mono-text text-accent-orange">{b.duration}m</span>}
                                </div>
                                {b.resources && (
                                  <div className="text-xs mt-1 resource-tag">{b.resources}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Weekly Resources */}
                  {generatedPlan.weeklyResources && generatedPlan.weeklyResources.length > 0 && (
                    <div className="mt-4 border-t border-primary/10 pt-4">
                      <h4 className="font-bold text-md text-accent-cyan mb-4 flex gap-2 items-center"><Sparkles size={16}/> Consolidated Resources</h4>
                      {generatedPlan.weeklyResources.map((wk, wi) => (
                         <div key={wi} className="mb-4">
                           <h5 className="text-sm font-bold text-primary mb-2">{wk.week}</h5>
                           <div className="flex flex-col gap-2">
                             {wk.resources?.map((res, ri) => (
                               <a key={ri} href={res.link || '#'} target="_blank" rel="noopener noreferrer" className="resource-link text-xs bg-tertiary p-2 rounded border border-primary/10 flex justify-between">
                                 <span>{res.name} <span className="text-muted">({res.type})</span></span>
                                 <span className="text-accent-purple">{res.topic}</span>
                               </a>
                             ))}
                           </div>
                         </div>
                      ))}
                    </div>
                  )}

                </div>
              </motion.section>
            )}

            {/* ====== MCQ QUIZ ====== */}
            {activeTab === 'mcq' && mcqQuiz && (
              <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card border border-accent-cyan/20 p-6 col-span-full">
                <h3 className="text-xl font-bold mb-6 text-accent-cyan flex items-center gap-2">
                  <BrainCircuit size={24} /> {mcqQuiz.title || 'Knowledge Check'}
                </h3>

                {mcqSubmitted && (
                  <div className="mb-4 p-3 bg-tertiary rounded-lg text-center">
                    <span className="text-lg font-bold text-accent-xp">
                      Score: {mcqQuiz.questions?.filter((q, i) => mcqAnswers[i] === q.answer).length || 0}/{mcqQuiz.questions?.length || 0}
                    </span>
                    <span className="text-xs text-muted block mt-1">+{(mcqQuiz.questions?.filter((q, i) => mcqAnswers[i] === q.answer).length || 0) * 20} XP earned</span>
                  </div>
                )}
                
                <div className="flex-col gap-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  {mcqQuiz.questions?.map((q, i) => {
                    const chosen = mcqAnswers[i];
                    const isCorrect = chosen === q.answer;
                    return (
                      <div key={i} className="bg-tertiary p-5 rounded-xl border border-primary/10">
                         <h4 className="font-semibold text-sm text-primary mb-3">{i + 1}. {q.question}</h4>
                         <div className="flex flex-col gap-2 mb-3">
                           {q.options?.map((opt, oi) => {
                             let optClass = 'mcq-option';
                             if (mcqSubmitted) {
                               if (opt === q.answer) optClass += ' mcq-correct';
                               else if (opt === chosen && !isCorrect) optClass += ' mcq-wrong';
                             } else if (chosen === opt) {
                               optClass += ' mcq-selected';
                             }
                             return (
                               <button 
                                 key={oi} 
                                 className={optClass}
                                 onClick={() => !mcqSubmitted && setMcqAnswers(prev => ({ ...prev, [i]: opt }))}
                                 disabled={mcqSubmitted}
                               >
                                 <span className="mcq-letter">{String.fromCharCode(65 + oi)}</span>
                                 {opt}
                               </button>
                             );
                           })}
                         </div>
                         {mcqSubmitted && (
                           <div className={`p-3 rounded-md text-xs mt-2 ${isCorrect ? 'mcq-explain-correct' : 'mcq-explain-wrong'}`}>
                             <div className="font-bold mb-1">{isCorrect ? '✓ Correct!' : `✗ Correct Answer: ${q.answer}`}</div>
                             <div className="text-muted">{q.explanation}</div>
                           </div>
                         )}
                      </div>
                    );
                  })}
                </div>

                {!mcqSubmitted && mcqQuiz.questions && Object.keys(mcqAnswers).length === mcqQuiz.questions.length && (
                  <button className="btn btn-primary w-full mt-4" onClick={handleMCQSubmit}>
                    <CheckCircle2 size={16}/> Submit Answers
                  </button>
                )}
                {mcqSubmitted && (
                  <button className="btn btn-secondary w-full mt-4" onClick={generateMCQ} disabled={loading}>
                    <RotateCcw size={16}/> Try Another Quiz
                  </button>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style jsx>{`
        .layout-grid {
          display: grid; grid-template-columns: 1fr 2fr; gap: var(--space-lg);
        }
        @media (max-width: 900px) { .layout-grid { grid-template-columns: 1fr; } }
        .flex-col { display: flex; flex-direction: column; }
        .h-full { height: 100%; }
        .bg-secondary { background: var(--bg-secondary); }
        .bg-tertiary { background: var(--bg-tertiary); }
        .text-secondary { color: var(--text-secondary); }
        .text-muted { color: var(--text-muted); }
        .text-black { color: #000; }
        .text-purple-400 { color: var(--accent-purple); }
        .text-cyan-400 { color: var(--accent-cyan); }
        .text-primary { color: var(--primary); }
        .bg-accent-cyan { background-color: var(--accent-cyan); }
        .text-accent-orange { color: var(--accent-orange); }
        .text-accent-purple { color: var(--accent-purple); }
        .text-accent-cyan { color: var(--accent-cyan); }
        .text-accent-xp { color: var(--accent-xp); }
        .border-accent-cyan\\/30 { border-color: rgba(6,182,212,0.3); }
        .border-accent-cyan\\/20 { border-color: rgba(6,182,212,0.2); }
        .hover\\:text-red-400:hover { color: var(--accent-pink); }
        
        .shadow-glow { box-shadow: 0 0 20px rgba(255,255,255,0.1); }
        .shadow-glow:hover { box-shadow: 0 0 30px rgba(255,255,255,0.2); }
        
        .card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--space-lg); }
        .mb-6 { margin-bottom: 24px; } .mb-4 { margin-bottom: 16px; } .mb-3 { margin-bottom: 12px; } .mb-2 { margin-bottom: 8px; } .mb-1 { margin-bottom: 4px; }
        .mt-6 { margin-top: 24px; } .mt-4 { margin-top: 16px; } .mt-2 { margin-top: 8px; } .mt-1 { margin-top: 4px; }
        .p-3 { padding: 12px; } .p-5 { padding: 20px; } .p-6 { padding: 24px; }
        .px-3 { padding-left: 12px; padding-right: 12px; } .px-4 { padding-left: 16px; padding-right: 16px; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; } .py-1\\.5 { padding-top: 6px; padding-bottom: 6px; }
        .py-6 { padding-top: 24px; padding-bottom: 24px; }
        .gap-1 { gap: 4px; } .gap-2 { gap: 8px; } .gap-3 { gap: 12px; } .gap-4 { gap: 16px; } .gap-6 { gap: 24px; }
        .text-xs { font-size: 0.75rem; } .text-sm { font-size: 0.875rem; } .text-md { font-size: 1rem; } .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; }
        .font-bold { font-weight: 700; } .font-medium { font-weight: 500; } .font-semibold { font-weight: 600; } .mono-text, .font-mono { font-family: var(--font-mono); }
        .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .text-center { text-align: center; }
        .w-full { width: 100%; } .w-fit { width: fit-content; } .w-24 { width: 6rem; }
        .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .max-w-\\[200px\\] { max-width: 200px; }
        .rounded-md { border-radius: var(--radius-md); } .rounded-lg { border-radius: var(--radius-lg); } .rounded-xl { border-radius: 12px; } .rounded-full { border-radius: 9999px; }
        .border { border-width: 1px; } .border-0 { border-width: 0; }
        .border-dashed { border-style: dashed; } .border-primary\\/20 { border-color: rgba(255,255,255,0.2); } .border-primary\\/10 { border-color: rgba(255,255,255,0.1); } .border-primary\\/5 { border-color: rgba(255,255,255,0.05); }
        .hidden { display: none; }
        .transition-colors { transition: color 150ms ease; } .transition-all { transition: all 150ms ease; }
        .max-h-\\[600px\\] { max-height: 600px; } .overflow-y-auto { overflow-y: auto; } .pr-2 { padding-right: 8px; }
        .shrink-0 { flex-shrink: 0; } .flex-1 { flex: 1; } .mx-auto { margin-left: auto; margin-right: auto; }
        .line-through { text-decoration: line-through; }
        
        .input { background: var(--bg-tertiary); border: 1px solid var(--border-primary); color: var(--text-primary); outline: none; border-radius: var(--radius-md); padding: 8px 12px; transition: border-color 150ms; width: 100%; }
        .input:focus { border-color: var(--primary); }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 4px; }

        /* ---- Checklist Progress ---- */
        .checklist-bar-bg { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .checklist-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent-xp), var(--accent-cyan)); border-radius: 999px; transition: width 0.4s ease; }

        /* ---- Block Checklist ---- */
        .block-row { background: rgba(255,255,255,0.02); transition: all 0.15s; }
        .block-row:hover { background: rgba(255,255,255,0.04); }
        .block-done { opacity: 0.5; }
        .block-check {
          width: 20px; height: 20px; border-radius: 4px; border: 2px solid rgba(255,255,255,0.2);
          background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.15s; flex-shrink: 0; color: var(--accent-xp);
        }
        .block-check.checked { background: var(--accent-xp); border-color: var(--accent-xp); color: #000; }
        .block-check:hover:not(.checked) { border-color: var(--accent-xp); }

        .guidance-box { background: rgba(255,255,255,0.02); }
        .adaptation-tip { font-size: 0.65rem; font-style: italic; color: var(--accent-orange); background: rgba(249,115,22,0.08); padding: 4px 8px; border-radius: 4px; display: inline-block; width: fit-content; margin-top: 4px; }
        .resource-tag { color: var(--accent-cyan); background: rgba(6,182,212,0.08); padding: 2px 6px; border-radius: 4px; display: inline-block; width: fit-content; }
        .resource-link:hover { border-color: var(--accent-cyan) !important; }

        /* ---- MCQ ---- */
        .mcq-option {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; cursor: pointer; font-size: 0.875rem; color: var(--text-primary);
          transition: all 0.15s; text-align: left; width: 100%;
        }
        .mcq-option:hover:not(:disabled) { border-color: var(--accent-cyan); background: rgba(6,182,212,0.05); }
        .mcq-selected { border-color: var(--accent-cyan) !important; background: rgba(6,182,212,0.1) !important; }
        .mcq-correct { border-color: var(--accent-xp) !important; background: rgba(16,185,129,0.12) !important; }
        .mcq-wrong { border-color: #EF4444 !important; background: rgba(239,68,68,0.1) !important; }
        .mcq-letter {
          width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
        }
        .mcq-explain-correct { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); }
        .mcq-explain-wrong { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); }
      `}</style>
    </div>
  );
}
