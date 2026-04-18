/* ========================================
   Utility Functions
   ======================================== */

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date, options = {}) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...options
  });
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function daysUntil(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Burning the Midnight Oil';
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getStreakData(activityDates) {
  if (!activityDates || activityDates.length === 0) return { current: 0, best: 0, total: activityDates?.length || 0 };

  const sorted = [...activityDates].sort((a, b) => new Date(b) - new Date(a));
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let current = 0;
  let best = 0;
  let streak = 0;

  for (let i = 0; i < sorted.length; i++) {
    const date = new Date(sorted[i]).toDateString();
    const expectedDate = new Date(Date.now() - (i * 86400000)).toDateString();

    if (i === 0 && date !== today && date !== yesterday) {
      current = 0;
      break;
    }

    if (date === expectedDate || (i === 0 && date === yesterday)) {
      streak++;
    } else {
      if (i === 0 && date === yesterday) {
        streak++;
      } else {
        break;
      }
    }
  }
  current = streak;

  // Calculate best streak
  streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i]);
    const prev = new Date(sorted[i - 1]);
    const diff = (prev - curr) / 86400000;
    if (Math.abs(diff - 1) < 0.5) {
      streak++;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
  }
  best = Math.max(best, streak, current);

  return { current, best, total: activityDates.length };
}

export const DOMAINS = [
  { id: 'dsa', label: 'DSA', color: '#6C63FF' },
  { id: 'tech', label: 'Tech Skills', color: '#06B6D4' },
  { id: 'semester', label: '6th Semester', color: '#F59E0B' },
  { id: 'aptitude', label: 'Aptitude', color: '#EC4899' },
  { id: 'general', label: 'General', color: '#10B981' }
];

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', color: '#10B981' },
  { id: 'medium', label: 'Medium', color: '#F59E0B' },
  { id: 'hard', label: 'Hard', color: '#EF4444' }
];

export const DSA_TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Dynamic Programming', 'Greedy',
  'Binary Search', 'Sorting', 'Hashing', 'Recursion',
  'Backtracking', 'Bit Manipulation', 'Heap', 'Trie',
  'Sliding Window', 'Two Pointers', 'Math'
];
