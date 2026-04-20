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
  const [customApiKey, setCustomApiKey] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('padhleBhai_customApiKey') || '';
    return '';
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [mcqQuiz, setMcqQuiz] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [checklist, setChecklist] = useState({}); // { dayIndex-blockIndex: true/false }
  const [activeTab, setActiveTab] = useState('planner');
  const [genStatus, setGenStatus] = useState(''); // Status message during generation

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
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to parse PDF: ${errText}`);
      }
      
      const data = await res.json();
      addProjectContext({ name: file.name, text: data.text, size: file.size });
      addXP(10);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUploadLoading(false);
      e.target.value = null;
    }
  };

  const handleGenerate = async () => {
    if (loading) return;
    
    try {
      setGenStatus('Analyzing Syllabus PDF...');
      
      // Limit context size to avoid token limit errors (max 10k chars recommended for focused context)
      const MAX_CONTEXT_CHARS = 10000;
      let totalChars = 0;
      const filteredContext = projectContexts
        .map(c => {
          const charsLeft = MAX_CONTEXT_CHARS - totalChars;
          if (charsLeft <= 0) return '';
          const snippet = c.text.substring(0, charsLeft);
          totalChars += snippet.length;
          return snippet;
        })
        .filter(t => t.length > 0);

      const knowledgeContext = filteredContext.length > 0 
        ? `Use this syllabus context strictly (Priority subjects: PR, DL, CV, BCI, Wireless, ARP):\n${filteredContext.join('\n---\n')}\n\n`
        : '';
      
      setGenStatus('Structuring Plan & Priorities...');
      const allExamDates = examDates ? examDates + '\n' + examContextStr : examContextStr;
      const rawPrompt = PROMPTS.GENERATE_STUDY_PLAN(syllabus, allExamDates, 'flexible', 'daily');
      const finalPrompt = knowledgeContext + rawPrompt;

      setGenStatus('Generating Roadmap (may take 20s)...');
      const data = await generate(finalPrompt, true, customApiKey);
      
      if (!data || typeof data !== 'object') {
        throw new Error('AI returned an invalid plan format. Please try again or check your API key.');
      }

      if (!data.dailyPlans || data.dailyPlans.length === 0) {
        throw new Error('The AI failed to create specific daily blocks. Try simplifying your guidance notes.');
      }

      setGenStatus('Finalizing...');
      setGeneratedPlan(data);
      setChecklist({}); 
      addXP(50);
      setGenStatus('');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Generation failed. Please wait a minute and try again.');
      setGenStatus('');
    }
  };

  const generateMCQ = async () => {
    try {
      const context = projectContexts.length > 0 
        ? projectContexts.map(c => c.text).join('\n---\n')
        : '';
      const prompt = PROMPTS.GENERATE_MCQ_QUIZ(context, 'General AI/ML & CSE', 5);
      const data = await generate(prompt, true, customApiKey);
      if (data) {
        setMcqQuiz(data);
        setMcqAnswers({});
        setMcqSubmitted(false);
      }
    } catch (err) { console.error(err); }
  };

  const toggleCheckItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
    addXP(5); // Reward 5 XP for each sub-task
  };

  // Count completed checklist items (Nested version)
  const allGeneratedTasks = generatedPlan?.dailyPlans?.flatMap((day, dIdx) => 
    day.blocks?.flatMap((block, bIdx) => 
      block.toDoList?.map((task, tIdx) => ({
        key: `${dIdx}-${bIdx}-${tIdx}`,
        ...task
      })) || []
    ) || []
  ) || [];

  const totalTasks = allGeneratedTasks.length;
  const completedTasksCount = allGeneratedTasks.filter(t => checklist[t.key]).length;
  const checklistPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  const transferTasks = () => {
    if (!generatedPlan?.dailyPlans) return;
    generatedPlan.dailyPlans.forEach((day, dIdx) => {
      day.blocks?.forEach((b, bIdx) => {
        b.toDoList?.forEach((task, tIdx) => {
          addTask({ 
             title: task.taskName || b.topic, 
             domain: b.activityType?.toLowerCase() || 'general',
             description: `${day.date} [${b.time}]: ${task.what} | How: ${task.how} | Source: ${task.where}`,
             duration: Math.ceil(b.duration / (b.toDoList.length || 1)) || 30
          });
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
                 <label className="text-xs text-secondary mb-1 flex justify-between">
                    <span>Custom Gemini API Key (Bypass Quota)</span>
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline hover:text-white" title="Get a free Gemini API key">Get Key</a>
                 </label>
                 <input 
                   type="password" 
                   className="input text-sm font-mono" 
                   placeholder="AIzaSy..." 
                   value={customApiKey} 
                   onChange={e => {
                     setCustomApiKey(e.target.value);
                     localStorage.setItem('padhleBhai_customApiKey', e.target.value);
                   }} 
                 />
               </div>
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
             <div className="flex gap-2 bg-tertiary p-1 rounded-full w-fit mx-auto mb-8">
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
                <div className="flex-col gap-2">
                  <button className="btn btn-primary w-full shadow-glow py-4 mt-2" onClick={handleGenerate} disabled={loading || (!syllabus && projectContexts.length === 0)}>
                    {loading ? <Loader2 size={16} className="animate-spin"/> : <Sparkles size={16}/>} 
                    {loading ? 'AI is Thinking...' : 'Generate Master Plan'}
                  </button>
                  {genStatus && (
                    <div className="text-[10px] text-center text-accent-cyan flex justify-center items-center gap-1 mt-1">
                       <Loader2 size={10} className="animate-spin" /> {genStatus}
                    </div>
                  )}
                </div>
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

                {/* Subject Syllabus Progress (New Feature) */}
                {generatedPlan.subjectSyllabusCompletion && generatedPlan.subjectSyllabusCompletion.length > 0 && (
                  <div className="mb-4 p-4 bg-tertiary rounded-lg border border-primary/10">
                    <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2"><BookOpen size={14}/> Subject Syllabus Completion</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedPlan.subjectSyllabusCompletion.map((subj, idx) => (
                        <div key={idx} className="flex-col gap-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-muted">{subj.subject}</span>
                            <span className="mono-text">{subj.completionPercentage}%</span>
                          </div>
                          <div className="checklist-bar-bg" style={{ height: '6px' }}>
                            <div className="checklist-bar-fill" style={{ width: `${subj.completionPercentage}%`, background: 'var(--accent-cyan)' }}></div>
                          </div>
                          <div className="text-[10px] text-muted text-right">{subj.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                  {generatedPlan.dailyPlans?.map((day, dIdx) => (
                    <div key={dIdx} className="bg-tertiary p-5 rounded-2xl border border-primary/10 hover-active relative overflow-hidden mb-4">
                      <div className="flex justify-between items-center mb-4 border-b border-primary/5 pb-2">
                         <h4 className="font-bold text-lg text-primary">{day.date}</h4>
                         <span className="text-[10px] uppercase tracking-widest text-muted">{day.placementNotes}</span>
                      </div>
                      
                      {/* Context Memo */}
                      <div className="grid grid-cols-2 gap-2 mb-6">
                         <div className="p-2 bg-black/20 rounded-lg border border-primary/5">
                            <span className="text-[9px] uppercase text-accent-purple font-bold block mb-1">Academic</span>
                            <p className="text-[11px] text-muted line-clamp-2">{day.academicNotes}</p>
                         </div>
                         <div className="p-2 bg-black/20 rounded-lg border border-primary/5">
                            <span className="text-[9px] uppercase text-accent-cyan font-bold block mb-1">Strategy</span>
                            <p className="text-[11px] text-muted line-clamp-2">{day.adaptationTip}</p>
                         </div>
                      </div>

                      {/* Subject Blocks */}
                      <div className="flex flex-col gap-6">
                        {day.blocks?.map((b, bIdx) => (
                          <div key={bIdx} className="flex-col gap-3">
                            <div className="flex items-center gap-2 mb-1">
                               <div className="w-1 h-4 bg-accent-orange rounded-full"></div>
                               <h5 className="font-bold text-sm text-accent-orange uppercase tracking-tight">{b.topic}</h5>
                               <span className="text-[10px] mono-text text-muted bg-white/5 px-2 py-0.5 rounded-full">{b.time}</span>
                            </div>

                            {/* Detailed Tasks */}
                            <div className="flex flex-col gap-3 ml-3">
                              {b.toDoList?.map((task, tIdx) => {
                                const key = `${dIdx}-${bIdx}-${tIdx}`;
                                const isChecked = checklist[key];
                                return (
                                  <div key={tIdx} className={`task-card p-3 rounded-xl border border-primary/5 transition-all ${isChecked ? 'task-checked' : 'bg-primary/5'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-col">
                                        <div className={`text-sm font-bold ${isChecked ? 'line-through text-muted' : 'text-primary'}`}>{task.taskName}</div>
                                        <div className="text-[11px] text-accent-cyan font-medium mt-0.5">Focus: {task.what}</div>
                                      </div>
                                      <button 
                                        className={`task-check-btn ${isChecked ? 'task-check-done' : ''}`}
                                        onClick={() => toggleCheckItem(key)}
                                      >
                                        <CheckCircle2 size={16}/>
                                      </button>
                                    </div>
                                    
                                    {!isChecked && (
                                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-2 mt-2 pt-2 border-t border-primary/5">
                                        <div className="text-[11px] text-muted">
                                          <span className="font-bold text-accent-purple">How:</span> {task.how}
                                        </div>
                                        {task.where && (
                                          <div className="text-[11px] text-muted flex items-center gap-1 flex-wrap">
                                            <span className="font-bold text-accent-xp">Source:</span> 
                                            {task.where.includes('http') ? (
                                              <a href={task.where} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline">{task.where}</a>
                                            ) : (
                                              <span>{task.where}</span>
                                            )}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
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
        
        .shadow-glow { box-shadow: 0 0 20px rgba(6,182,212,0.15); }
        .shadow-glow:hover { box-shadow: 0 0 30px rgba(6,182,212,0.25); }
        .card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--space-lg); }
        
        /* ---- Checklist Progress ---- */
        .checklist-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 999px; overflow: hidden; }
        .checklist-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent-xp), var(--accent-cyan)); border-radius: 999px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }

        /* ---- Task Cards ---- */
        .task-card { position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.05); }
        .task-card:hover:not(.task-checked) { border-color: rgba(6,182,212,0.3); transform: translateX(4px); background: rgba(255,255,255,0.03); }
        .task-checked { opacity: 0.5; border-color: var(--accent-xp); background: rgba(16,185,129,0.02) !important; }
        
        .task-check-btn {
          width: 32px; height: 32px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1);
          background: transparent; color: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; cursor: pointer; flex-shrink: 0;
        }
        .task-check-btn:hover { border-color: var(--accent-cyan); color: var(--accent-cyan); }
        .task-check-done { background: var(--accent-xp); border-color: var(--accent-xp); color: #000; box-shadow: 0 0 15px rgba(16,185,129,0.3); }
        
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 4px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .hover-active:hover { border-color: var(--accent-cyan); }

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
      `}</style>
      </div>
    </div>
  );
}
