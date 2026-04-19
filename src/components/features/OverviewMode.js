'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Flame, Play, Pause, RotateCcw, Calendar, TrendingUp, Zap, Clock, Brain, X, MapPin, ChevronDown, Trash2, Pencil } from 'lucide-react';
import { useTasks } from '@/context/TaskContext';
import { formatTime } from '@/lib/utils';

export default function OverviewMode() {
  const { todaysTasks, addTask, toggleTask, deleteTask, clearAllTasks, activityDates, exams, addExam, updateExam, deleteExam, addStudySession, recordActivity, xp, level, studySessions, dsaProblems, tasks } = useTasks();
  
  // States
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const defaultExamForm = { type: 'exam', subject: '', date: new Date().toISOString().split('T')[0], timeFrom: '13:30', timeTo: '16:30', room: '', notes: '' };
  const [examForm, setExamForm] = useState(defaultExamForm);
  
  // Pomodoro States
  const [workTime] = useState(50);
  const [timeLeft, setTimeLeft] = useState(50 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  // Stats
  const totalStudyMinutes = studySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalTasksCompleted = tasks.filter(t => t.completed).length;

  const todayStr = new Date().toISOString().split('T')[0];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      title: newTaskTitle,
      domain: 'general',
      difficulty: 'medium',
      dueDate: todayStr
    });
    setNewTaskTitle('');
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!examForm.subject.trim() || !examForm.date) return;
    const payload = {
      subject: examForm.subject.trim(),
      date: examForm.date,
      time: `${examForm.timeFrom} - ${examForm.timeTo}`,
      room: examForm.room.trim() || null,
      notes: examForm.notes.trim() || null,
      type: examForm.type,
      tags: [examForm.type === 'exam' ? 'ETE' : examForm.type === 'practical' ? 'Practical' : 'Important'],
    };
    if (editingExamId) {
      updateExam(editingExamId, payload);
      setEditingExamId(null);
    } else {
      addExam(payload);
    }
    setExamForm(defaultExamForm);
    setShowExamForm(false);
  };

  const startEditExam = (exam) => {
    const timeParts = (exam.time || '13:30 - 16:30').split('-').map(s => s.trim());
    setExamForm({
      type: exam.type || 'exam',
      subject: exam.subject || '',
      date: exam.date ? exam.date.split('T')[0] : todayStr,
      timeFrom: timeParts[0] || '13:30',
      timeTo: timeParts[1] || '16:30',
      room: exam.room || '',
      notes: exam.notes || '',
    });
    setEditingExamId(exam.id);
    setShowExamForm(true);
  };

  const cancelExamForm = () => {
    setShowExamForm(false);
    setEditingExamId(null);
    setExamForm(defaultExamForm);
  };

  // Timer Logic
  const handleComplete = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(workTime * 60);
    // Rewards
    addStudySession({ duration: workTime, type: 'pomodoro' });
    recordActivity();
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }, [workTime, addStudySession, recordActivity]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, handleComplete]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(workTime * 60);
    clearInterval(intervalRef.current);
  };

  const progress = ((workTime * 60 - timeLeft) / (workTime * 60)) * 100;
  
  // Sorted Exams
  const upcommingExams = [...exams]
    .filter(e => new Date(e.date) >= new Date(todayStr))
    .sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      // Same date — sort by start time
      const timeA = (a.time || '').split('-')[0].trim();
      const timeB = (b.time || '').split('-')[0].trim();
      return timeA.localeCompare(timeB);
    });

  return (
    <div className="overview-container">
      
      {/* Stats Header Row */}
      <div className="grid stats-grid mb-6">
         <div className="card stat-card p-4 flex items-center gap-4">
            <div className="stat-icon-bg bg-primary text-black"><Zap size={20}/></div>
            <div>
               <div className="text-secondary text-xs uppercase tracking-wider">Experience</div>
               <div className="mono-text text-xl font-bold">{xp} XP</div>
            </div>
         </div>
         <div className="card stat-card p-4 flex items-center gap-4">
            <div className="stat-icon-bg bg-purple-500 text-black"><Clock size={20}/></div>
            <div>
               <div className="text-secondary text-xs uppercase tracking-wider">Deep Work</div>
               <div className="mono-text text-xl font-bold">{Math.round(totalStudyMinutes / 60 * 10) / 10} h</div>
            </div>
         </div>
         <div className="card stat-card p-4 flex items-center gap-4">
            <div className="stat-icon-bg bg-cyan-500 text-black"><Brain size={20}/></div>
            <div>
               <div className="text-secondary text-xs uppercase tracking-wider">Wins</div>
               <div className="mono-text text-xl font-bold">{totalTasksCompleted + dsaProblems.length}</div>
            </div>
         </div>
      </div>

      <div className="grid layout-grid">
        
        {/* Left Column: Pomodoro & Exams */}
        <div className="flex-col gap-6">
          {/* Compact Pomodoro */}
          <section className="card flex-col items-center p-6 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
            <h3 className="w-full text-left font-medium text-lg mb-4 flex justify-between items-center">
              Focus Drive <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">+2 XP/min</span>
            </h3>
            
            <div className="timer-circle relative mb-6">
              <svg viewBox="0 0 120 120" className="w-48 h-48 transform -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="var(--accent-xp)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={(2 * Math.PI * 54) - (progress / 100) * (2 * Math.PI * 54)}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="mono-text text-4xl font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn btn-ghost" onClick={resetTimer}><RotateCcw size={18}/></button>
              <button className={`btn w-16 h-16 rounded-full flex items-center justify-center ${isRunning ? 'bg-bg-tertiary text-primary auto-shadow' : 'bg-primary text-black hover-shadow'}`} onClick={toggleTimer}>
                {isRunning ? <Pause size={24}/> : <Play size={24} className="ml-1"/>}
              </button>
              <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>
          </section>

          {/* Exam Timeline */}
          <section className="card mt-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-medium text-lg flex items-center gap-2"><Calendar size={18}/> Exam Timeline</h3>
              <button
                className="exam-add-toggle"
                onClick={() => showExamForm ? cancelExamForm() : setShowExamForm(true)}
              >
                {showExamForm ? <X size={16}/> : <Plus size={16}/>}
                {showExamForm ? 'Cancel' : 'Add Event'}
              </button>
            </div>

            {/* Rich Add Exam Form */}
            <AnimatePresence>
              {showExamForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <form onSubmit={handleAddExam} className="exam-form">
                    {/* Event Type Selector */}
                    <div className="exam-type-row">
                      {['exam', 'practical', 'important'].map(t => (
                        <button
                          key={t}
                          type="button"
                          className={`exam-type-btn ${examForm.type === t ? 'exam-type-active' : ''}`}
                          onClick={() => setExamForm(f => ({ ...f, type: t }))}
                        >
                          {t === 'exam' ? '📝 Exam' : t === 'practical' ? '🔬 Practical' : '📌 Important'}
                        </button>
                      ))}
                    </div>

                    {/* Title */}
                    <div className="exam-field">
                      <label className="exam-label">Title</label>
                      <input
                        type="text"
                        className="input py-2 text-sm"
                        placeholder={examForm.type === 'exam' ? 'e.g., Pattern Recognition ETE' : examForm.type === 'practical' ? 'e.g., DL Lab Practical' : 'e.g., Project Submission'}
                        value={examForm.subject}
                        onChange={e => setExamForm(f => ({ ...f, subject: e.target.value }))}
                        autoFocus
                      />
                    </div>

                    {/* Date */}
                    <div className="exam-field">
                      <label className="exam-label">Date</label>
                      <input
                        type="date"
                        className="input py-2 text-sm"
                        value={examForm.date}
                        onChange={e => setExamForm(f => ({ ...f, date: e.target.value }))}
                      />
                    </div>

                    {/* Time Range */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="exam-field">
                        <label className="exam-label">From</label>
                        <input
                          type="time"
                          className="input py-2 text-sm"
                          value={examForm.timeFrom}
                          onChange={e => setExamForm(f => ({ ...f, timeFrom: e.target.value }))}
                        />
                      </div>
                      <div className="exam-field">
                        <label className="exam-label">To</label>
                        <input
                          type="time"
                          className="input py-2 text-sm"
                          value={examForm.timeTo}
                          onChange={e => setExamForm(f => ({ ...f, timeTo: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Room */}
                    <div className="exam-field">
                      <label className="exam-label">Room / Location</label>
                      <input
                        type="text"
                        className="input py-2 text-sm"
                        placeholder="e.g., Room 204, Block 3"
                        value={examForm.room}
                        onChange={e => setExamForm(f => ({ ...f, room: e.target.value }))}
                      />
                    </div>

                    {/* Notes */}
                    <div className="exam-field">
                      <label className="exam-label">Notes</label>
                      <textarea
                        className="input py-2 text-sm"
                        placeholder="Any notes..."
                        rows={2}
                        value={examForm.notes}
                        onChange={e => setExamForm(f => ({ ...f, notes: e.target.value }))}
                        style={{ resize: 'vertical', minHeight: '48px' }}
                      />
                    </div>

                    {/* Submit */}
                    <button type="submit" className="exam-submit-btn">
                      {editingExamId ? <Pencil size={16}/> : <Plus size={16}/>}
                      {editingExamId ? 'Update' : 'Add'} {examForm.type === 'exam' ? 'Exam' : examForm.type === 'practical' ? 'Practical' : 'Event'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {(() => {
              if (upcommingExams.length === 0) {
                return <p className="text-xs text-muted text-center py-4 bg-tertiary rounded-md">No upcoming exams.</p>;
              }

              const withDays = upcommingExams.map(e => ({
                ...e,
                daysLeft: Math.ceil((new Date(e.date) - new Date(todayStr)) / (1000 * 60 * 60 * 24))
              })).filter(e => e.daysLeft >= 0).sort((a, b) => a.daysLeft - b.daysLeft);

              if (withDays.length === 0) {
                return <p className="text-xs text-muted text-center py-4 bg-tertiary rounded-md">All exams completed!</p>;
              }

              const nearest = withDays[0];
              const rest = withDays.slice(1);
              const nearestDate = new Date(nearest.date);
              const typeEmoji = (t) => t === 'practical' ? '🔬' : t === 'important' ? '📌' : '📝';
              const typeLabel = (t) => t === 'practical' ? 'PRACTICAL' : t === 'important' ? 'IMPORTANT' : 'EXAM';

              return (
                <div className="flex-col gap-3">
                  {/* === HERO: Closest Event === */}
                  <div className="nearest-exam-hero">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="nearest-label">{typeEmoji(nearest.type)} NEXT {typeLabel(nearest.type)}</div>
                      {nearest.id && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => startEditExam(nearest)} className="exam-edit-btn" title="Edit">
                            <Pencil size={14}/>
                          </button>
                          <button onClick={() => deleteExam(nearest.id)} className="exam-delete-btn" title="Remove">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg" style={{ color: 'var(--accent-orange)' }}>
                        <span className="animate-pulse mr-1">🔥</span>
                        {nearest.subject}
                      </h4>
                      <div className="nearest-countdown">
                        <span className="nearest-days">{nearest.daysLeft}</span>
                        <span className="nearest-unit">{nearest.daysLeft === 1 ? 'day' : 'days'} left</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm items-center font-mono" style={{ color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <Calendar size={14} />
                        <span>{nearestDate.toLocaleString('default', { weekday: 'short' })}, {nearestDate.toLocaleString('default', { month: 'short' })} {nearestDate.getDate()}</span>
                      </div>
                      <div className="flex items-center" style={{ gap: '6px' }}>
                        <Clock size={14} />
                        <span>{nearest.time || '13:30 - 16:30'}</span>
                      </div>
                      {nearest.room && (
                        <div className="flex items-center" style={{ gap: '6px' }}>
                          <MapPin size={14} />
                          <span>{nearest.room}</span>
                        </div>
                      )}
                    </div>
                    {nearest.notes && (
                      <div className="text-xs mt-2 p-2 rounded-md italic" style={{ color: 'var(--text-muted)', background: 'rgba(249,115,22,0.08)' }}>
                        {nearest.notes}
                      </div>
                    )}
                    <div className="nearest-urgency-bar mt-3">
                      <div className="nearest-urgency-fill" style={{ width: `${Math.max(5, 100 - nearest.daysLeft * 3)}%` }}></div>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {nearest.daysLeft <= 3 ? '⚡ Critical — start revising now!' : nearest.daysLeft <= 7 ? '⏰ Approaching — plan your revision' : '📋 Plan ahead for this one'}
                    </div>
                  </div>

                  {/* === REST OF EVENTS === */}
                  {rest.map((e, i) => {
                    const displayDate = new Date(e.date);
                    const monthStr = displayDate.toLocaleString('default', { month: 'short' });
                    const dayStr = displayDate.getDate();
                    const weekday = displayDate.toLocaleString('default', { weekday: 'short' });

                    return (
                      <div key={e.id || i} className="exam-rest-card">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span className="exam-type-indicator" data-type={e.type || 'exam'}>{typeEmoji(e.type)}</span>
                             <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{e.subject}</span>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <span className="exam-days-badge" style={{
                               background: e.daysLeft <= 7 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                               color: e.daysLeft <= 7 ? '#F97316' : 'var(--text-muted)'
                             }}>
                               {e.daysLeft}d left
                             </span>
                             {e.id && (
                               <div style={{ display: 'flex', gap: '4px' }}>
                                 <button onClick={() => startEditExam(e)} className="exam-edit-btn" title="Edit">
                                   <Pencil size={12}/>
                                 </button>
                                 <button onClick={() => deleteExam(e.id)} className="exam-delete-btn" title="Remove">
                                   <Trash2 size={12}/>
                                 </button>
                               </div>
                             )}
                           </div>
                         </div>
                         <div style={{ display: 'flex', gap: '14px', color: 'var(--text-muted)', fontSize: '0.75rem', alignItems: 'center', fontFamily: 'var(--font-mono)', marginTop: '6px', flexWrap: 'wrap' }}>
                           <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Calendar size={12}/><span>{weekday}, {monthStr} {dayStr}</span></div>
                           <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Clock size={12}/><span>{e.time || '13:30 - 16:30'}</span></div>
                           {e.room && (
                             <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><MapPin size={12}/><span>{e.room}</span></div>
                           )}
                         </div>
                         {e.notes && (
                           <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: '6px', fontStyle: 'italic', marginTop: '6px' }}>{e.notes}</div>
                         )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </section>
        </div>

        {/* Right Column: Quests */}
        <section className="card card-quest flex-col h-full">
          <header className="mb-4 flex justify-between items-center border-b border-primary/10 pb-4">
            <div>
              <h3 className="font-medium text-lg">Daily Quests</h3>
              <p className="text-secondary text-xs mt-1">Complete tasks for +20 XP</p>
            </div>
            <div className="flex items-center gap-3">
               {todaysTasks.length > 0 && (
                 <button className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors uppercase font-bold tracking-tighter" onClick={clearAllTasks}>
                   Clear All
                 </button>
               )}
               <div className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold font-mono">
                 <Flame size={14} /> {activityDates.length} D
               </div>
            </div>
          </header>

          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input type="text" className="input flex-1 py-2" placeholder="Add a new objective..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
            <button type="submit" className="btn btn-secondary px-3"><Plus size={16} /></button>
          </form>

          <div className="flex-col gap-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {todaysTasks.length === 0 ? (
              <div className="text-center text-muted text-sm py-10 bg-tertiary rounded-md">Mission accepted. No active quests.</div>
            ) : (
              todaysTasks.map((task, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={task.id} 
                  className={`flex items-center gap-3 p-3 rounded-md border border-transparent transition-all ${task.completed ? 'opacity-50 line-through bg-black' : 'bg-tertiary hover-active'}`}
                >
                  <label className="cursor-pointer flex">
                    <input type="checkbox" className="hidden" checked={task.completed} onChange={() => toggleTask(task.id)} />
                    <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${task.completed ? 'bg-green-400 border-green-400 text-black' : 'border-active'}`}>
                      {task.completed && <Check size={14} />}
                    </div>
                  </label>
                  <span className="flex-1 text-sm font-medium">{task.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-green-400">+20 XP</span>
                    <button className="task-delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

      </div>

      <style jsx>{`
        .overview-container { display: flex; flex-direction: column; }
        .grid { display: grid; }
        .layout-grid {
          grid-template-columns: 3fr 4fr;
          gap: var(--space-lg);
        }
        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
        }
        @media (max-width: 900px) {
          .layout-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr; }
        }
        
        .flex-col { display: flex; flex-direction: column; }
        .h-full { height: 100%; }
        .bg-purple-500 { background-color: var(--accent-purple); }
        .bg-cyan-500 { background-color: var(--accent-cyan); }
        .text-green-400 { color: var(--accent-xp); }
        .text-orange-400 { color: var(--accent-orange); }
        .bg-green-500\\/10 { background-color: rgba(0,255,136,0.1); }
        .bg-orange-500\\/10 { background-color: rgba(249,115,22,0.1); }
        .stat-icon-bg {
          width: 44px; height: 44px; border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
        }
        .text-black { color: #000; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
        .font-mono { font-family: var(--font-mono); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border-active); border-radius: 4px; }
        .hover-active { transition: background 150ms var(--ease-out), transform 150ms var(--ease-out); }
        .hover-active:hover { background: var(--bg-glass-hover); }
        .hover-active:active { transform: scale(0.98); }
        .hover-shadow:hover { box-shadow: 0 0 20px var(--primary-glow); }
        .auto-shadow { box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        
        /* standard classes assumed globally */
        .card { background: var(--bg-secondary); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: var(--space-lg); }
        .mb-6 { margin-bottom: 24px; } .mb-4 { margin-bottom: 16px; } .mt-6 { margin-top: 24px; }
        .p-4 { padding: 16px; } .p-6 { padding: 24px; } .px-3 { padding-left: 12px; padding-right: 12px; } .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .gap-1 { gap: 4px; } .gap-2 { gap: 8px; } .gap-3 { gap: 12px; } .gap-4 { gap: 16px; } .gap-6 { gap: 24px; }
        .text-xs { font-size: 0.75rem; } .text-sm { font-size: 0.875rem; } .text-lg { font-size: 1.125rem; } .text-xl { font-size: 1.25rem; } .text-4xl { font-size: 2.25rem; line-height: 1; }
        .font-bold { font-weight: 700; } .font-medium { font-weight: 500; }
        .text-secondary { color: var(--text-secondary); } .text-muted { color: var(--text-muted); }
        .flex { display: flex; } .items-center { align-items: center; } .justify-between { justify-content: space-between; } .justify-center { justify-content: center; }
        .w-full { width: 100%; } .flex-1 { flex: 1 1 0%; }
        .relative { position: relative; } .absolute { position: absolute; } .inset-0 { top:0; left:0; right:0; bottom:0;}
        .w-48 { width: 12rem; } .h-48 { height: 12rem; }
        .w-16 { width: 4rem; } .h-16 { height: 4rem; } .w-10 { width: 2.5rem; }
        .rounded-full { border-radius: 9999px; } .rounded-md { border-radius: var(--radius-md); }
        .bg-primary { background: var(--primary); } .bg-tertiary { background: var(--bg-tertiary); }
        .input { background: var(--bg-tertiary); border: 1px solid var(--border-primary); color: var(--text-primary); outline: none; border-radius: var(--radius-md); padding: 8px 12px; transition: border-color 150ms; }
        .input:focus { border-color: var(--primary); }
        .hidden { display: none; }
        .border { border-width: 1px; }
        
        /* ---- Nearest Exam Hero ---- */
        .nearest-exam-hero {
          padding: 20px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02));
          border: 1.5px solid rgba(249,115,22,0.35);
          box-shadow: 0 0 20px rgba(249,115,22,0.08);
          position: relative;
        }
        .nearest-label {
          font-size: 0.6rem; font-weight: 800; letter-spacing: 0.15em;
          color: var(--accent-orange); margin-bottom: 8px; text-transform: uppercase;
        }
        .nearest-countdown {
          display: flex; flex-direction: column; align-items: flex-end;
        }
        .nearest-days {
          font-size: 2rem; font-weight: 900; line-height: 1;
          font-family: var(--font-mono); color: var(--accent-orange);
        }
        .nearest-unit {
          font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .nearest-urgency-bar {
          width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;
        }
        .nearest-urgency-fill {
          height: 100%; border-radius: 999px; transition: width 0.5s ease;
          background: linear-gradient(90deg, var(--accent-orange), #EF4444);
        }
        @keyframes pulse { 50% { opacity: 0.6; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
        
        /* ---- Exam Rest Cards ---- */
        .exam-rest-card {
          padding: 14px 16px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.07);
          background: var(--bg-secondary);
          transition: background 150ms, border-color 150ms;
        }
        .exam-rest-card:hover {
          background: var(--bg-glass-hover, rgba(255,255,255,0.04));
          border-color: rgba(255,255,255,0.12);
        }
        .exam-days-badge {
          font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono);
          padding: 3px 10px; border-radius: 999px; letter-spacing: 0.02em;
        }

        /* ---- Exam Add Toggle ---- */
        .exam-add-toggle {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 600;
          padding: 6px 14px; border-radius: 999px;
          background: rgba(0,255,136,0.1); color: var(--accent-xp);
          border: 1px solid rgba(0,255,136,0.2);
          cursor: pointer; transition: all 0.15s;
        }
        .exam-add-toggle:hover {
          background: rgba(0,255,136,0.18); border-color: rgba(0,255,136,0.35);
        }

        /* ---- Rich Exam Form ---- */
        .exam-form {
          display: flex; flex-direction: column; gap: 14px;
          padding: 20px; margin-bottom: 20px;
          background: var(--bg-tertiary);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
        }
        .exam-type-row {
          display: flex; gap: 8px;
        }
        .exam-type-btn {
          flex: 1; padding: 10px 8px; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted); transition: all 0.15s; text-align: center;
        }
        .exam-type-btn:hover {
          background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.15);
        }
        .exam-type-btn.exam-type-active {
          background: rgba(0,255,136,0.08); border-color: var(--accent-xp);
          color: var(--accent-xp);
        }
        .exam-field {
          display: flex; flex-direction: column; gap: 4px;
        }
        .exam-label {
          font-size: 0.7rem; font-weight: 600; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .exam-submit-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 12px;
          font-size: 0.9rem; font-weight: 700;
          border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, var(--accent-xp), #06B6D4);
          color: #000; transition: all 0.2s;
        }
        .exam-submit-btn:hover {
          opacity: 0.9; transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0,255,136,0.2);
        }
        .exam-submit-btn:active {
          transform: translateY(0); opacity: 1;
        }

        /* ---- Delete Button ---- */
        .exam-delete-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          background: transparent; border: 1px solid transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.15s;
          flex-shrink: 0;
        }
        .exam-delete-btn:hover {
          background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2);
          color: #EF4444;
        }
        .exam-edit-btn {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          background: transparent; border: 1px solid transparent;
          color: var(--text-muted); cursor: pointer; transition: all 0.15s;
          flex-shrink: 0;
        }
        .exam-edit-btn:hover {
          background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.2);
          color: #06B6D4;
        }

        .task-delete-btn {
          opacity: 0;
          color: var(--text-muted);
          transition: all 0.2s;
          cursor: pointer;
          background: transparent;
          border: none;
        }
        .hover-active:hover .task-delete-btn { opacity: 0.5; }
        .task-delete-btn:hover { color: #EF4444 !important; opacity: 1 !important; transform: scale(1.1); }
      `}</style>
    </div>
  );
}
