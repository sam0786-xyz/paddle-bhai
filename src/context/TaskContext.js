'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateId } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

const TaskContext = createContext();

const MOCK_EXAMS = [
  // End Term Exams
  { id: '1', subject: 'Pattern Recognition ETE', date: '2026-04-29', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'] },
  { id: '2', subject: 'Deep Learning ETE', date: '2026-05-02', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'] },
  { id: '3', subject: 'BCI ETE', date: '2026-05-05', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'] },
  { id: '4', subject: 'Wireless Networks ETE', date: '2026-05-07', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'], notes: 'Only for Wireless Networking students' },
  { id: '5', subject: 'NLP ETE', date: '2026-05-07', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'], notes: 'Only for NLP students' },
  { id: '6', subject: 'CV ETE', date: '2026-05-11', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'] },
  { id: '7', subject: 'Recommender Systems ETE', date: '2026-05-15', time: '13:30 - 16:30', type: 'exam', tags: ['ETE'], notes: 'Only for Recommender students' },
  { id: '8', subject: 'ARP ETE', date: '2026-05-19', time: '13:30 - 15:30', type: 'exam', tags: ['ETE'], notes: 'Only Quant and Reasoning part will come' },
  // Practicals
  { id: 'p1', subject: 'Deep Learning Lab Practical', date: '2026-04-21', time: '09:00 - 12:00', type: 'practical', tags: ['Practical'] },
  { id: 'p2', subject: 'Pattern Recognition Lab Practical', date: '2026-04-22', time: '09:00 - 12:00', type: 'practical', tags: ['Practical'] },
  { id: 'p3', subject: 'BCI Lab Practical', date: '2026-04-23', time: '09:00 - 12:00', type: 'practical', tags: ['Practical'] },
  { id: 'p4', subject: 'NLP Lab Practical', date: '2026-04-24', time: '09:00 - 12:00', type: 'practical', tags: ['Practical'], notes: 'Only for NLP students' },
  { id: 'p5', subject: 'CV Lab Practical', date: '2026-04-25', time: '09:00 - 12:00', type: 'practical', tags: ['Practical'] },
];

const INITIAL_STATE = {
  tasks: [],
  exams: MOCK_EXAMS,
  studySessions: [],
  activityDates: [],
  dsaProblems: [],
  studyPlans: [],
  pdfAnalyses: [],
  projectContexts: [], // Store uploaded syllabus/pdfs as context
  xp: 0,
  level: 1,
};

export function TaskProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const skipNextSync = useRef(true);

  // Load from Supabase (with localStorage fallback)
  useEffect(() => {
    async function loadData() {
      let finalState = INITIAL_STATE;
      
      // Try localStorage first (instant)
      try {
        const local = localStorage.getItem('padhleBhai_state');
        if (local) finalState = JSON.parse(local);
      } catch {}

      // Then try Supabase (override if fresher)
      try {
        const { data } = await supabase.from('app_state').select('state_data, updated_at').eq('id', '00000000-0000-0000-0000-000000000000').single();
        
        if (data && data.state_data) {
          const supabaseTime = new Date(data.updated_at || Date.now()).getTime();
          const localTime = finalState._lastUpdated || 0;
          
          if (supabaseTime >= localTime || !finalState._lastUpdated) {
            finalState = data.state_data;
            finalState._lastUpdated = supabaseTime;
          }
        } else {
          // First time — seed Supabase
          const now = Date.now();
          finalState._lastUpdated = now;
          await supabase.from('app_state').upsert({ id: '00000000-0000-0000-0000-000000000000', state_data: finalState, updated_at: new Date(now).toISOString() });
        }
      } catch (err) {
        console.warn('Supabase load failed, using localStorage:', err.message);
      }

      // Ensure exams is at least an array, but don't force MOCK_EXAMS if user deleted them
      if (!finalState.exams) {
        finalState.exams = [];
      }
      
      setState(finalState);
      setLoaded(true);
      skipNextSync.current = true;
    }
    loadData();
  }, []);

  // Persist to both Supabase and localStorage on change
  useEffect(() => {
    if (loaded && !skipNextSync.current) {
      const now = Date.now();
      const stateToSave = { ...state, _lastUpdated: now };
      
      // Always save to localStorage (instant, reliable)
      try {
        localStorage.setItem('padhleBhai_state', JSON.stringify(stateToSave));
      } catch {}
      
      // Also sync to Supabase
      supabase.from('app_state').upsert({ 
        id: '00000000-0000-0000-0000-000000000000', 
        state_data: stateToSave, 
        updated_at: new Date(now).toISOString() 
      }).then(({error}) => { if (error) console.error("Supabase sync err:", error) });
    }
    if (loaded) skipNextSync.current = false;
  }, [state, loaded]);

  // --- Gamification Operations ---
  const addXP = useCallback((amount) => {
    setState(prev => {
      let newXp = (prev.xp || 0) + amount;
      let currentLevel = prev.level || 1;
      let levelUp = false;
      const xpNeeded = currentLevel * 100;
      
      if (newXp >= xpNeeded) {
        currentLevel += 1;
        newXp -= xpNeeded;
        levelUp = true;
      }
      
      return { ...prev, xp: newXp, level: currentLevel };
    });
  }, []);

  // --- Task Operations ---
  const addTask = useCallback((task) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: generateId(), createdAt: new Date().toISOString(), completed: false }]
    }));
  }, []);

  const updateTask = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  }, []);

  const clearAllTasks = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all tasks?')) {
      setState(prev => ({
        ...prev,
        tasks: []
      }));
    }
  }, []);

  const toggleTask = useCallback((id) => {
    setState(prev => {
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;
      
      const isCompleting = !task.completed;
      
      // Calculate new XP if completing
      let newXp = prev.xp || 0;
      let newLevel = prev.level || 1;
      if (isCompleting) {
        newXp += 20; // 20 XP per task
        while (newXp >= newLevel * 100) {
          newXp -= newLevel * 100;
          newLevel++;
        }
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        tasks: prev.tasks.map(t =>
          t.id === id ? { ...t, completed: isCompleting, completedAt: isCompleting ? new Date().toISOString() : null } : t
        )
      };
    });
  }, []);

  // --- Exam Operations ---
  const addExam = useCallback((exam) => {
    setState(prev => ({
      ...prev,
      exams: [...prev.exams, { ...exam, id: generateId(), createdAt: new Date().toISOString() }]
    }));
  }, []);

  const updateExam = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const deleteExam = useCallback((id) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id)
    }));
  }, []);

  // --- Study Session Operations ---
  const addStudySession = useCallback((session) => {
    const today = new Date().toISOString().split('T')[0];
    
    setState(prev => {
      // 2 XP per minute of study
      const xpGained = (session.duration || 0) * 2;
      let newXp = (prev.xp || 0) + xpGained;
      let newLevel = prev.level || 1;
      
      while (newXp >= newLevel * 100) {
        newXp -= newLevel * 100;
        newLevel++;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        studySessions: [...prev.studySessions, { ...session, id: generateId(), date: today }],
        activityDates: prev.activityDates.includes(today)
          ? prev.activityDates
          : [...prev.activityDates, today]
      };
    });
  }, []);

  // --- Record Activity ---
  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => ({
      ...prev,
      activityDates: prev.activityDates.includes(today)
        ? prev.activityDates
        : [...prev.activityDates, today]
    }));
  }, []);

  // --- DSA Problem Operations ---
  const addDSAProblem = useCallback((problem) => {
    setState(prev => ({
      ...prev,
      dsaProblems: [...prev.dsaProblems, { ...problem, id: generateId(), solvedAt: new Date().toISOString() }]
    }));
  }, []);

  const updateDSAProblem = useCallback((id, updates) => {
    setState(prev => ({
      ...prev,
      dsaProblems: prev.dsaProblems.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }, []);

  // --- Study Plans ---
  const addStudyPlan = useCallback((plan) => {
    setState(prev => ({
      ...prev,
      studyPlans: [...prev.studyPlans, { ...plan, id: generateId(), createdAt: new Date().toISOString() }]
    }));
  }, []);

  // --- PDF Analyses ---
  const addPDFAnalysis = useCallback((analysis) => {
    setState(prev => ({
      ...prev,
      pdfAnalyses: [...prev.pdfAnalyses, { ...analysis, id: generateId(), analyzedAt: new Date().toISOString() }]
    }));
  }, []);

  // --- Project Contexts ---
  const addProjectContext = useCallback((contextItem) => {
    setState(prev => ({
      ...prev,
      projectContexts: [...(prev.projectContexts || []), { ...contextItem, id: generateId(), createdAt: new Date().toISOString() }]
    }));
  }, []);

  const removeProjectContext = useCallback((id) => {
    setState(prev => ({
      ...prev,
      projectContexts: (prev.projectContexts || []).filter(c => c.id !== id)
    }));
  }, []);

  // --- Computed Values ---
  const todaysTasks = state.tasks.filter(t => {
    const created = new Date(t.createdAt).toDateString();
    const today = new Date().toDateString();
    return created === today || (!t.completed && t.dueDate === new Date().toISOString().split('T')[0]);
  });

  const todaysCompletedTasks = todaysTasks.filter(t => t.completed);

  const upcomingExams = state.exams
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const value = {
    ...state,
    loaded,
    addTask, updateTask, deleteTask, clearAllTasks, toggleTask,
    addExam, updateExam, deleteExam,
    addStudySession, recordActivity,
    addDSAProblem, updateDSAProblem,
    addStudyPlan, addPDFAnalysis,
    addProjectContext, removeProjectContext,
    addXP,
    todaysTasks, todaysCompletedTasks, upcomingExams,
    setState,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
}
