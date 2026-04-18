/* ========================================
   Local Storage Helper with JSON serialization
   ======================================== */

const PREFIX = 'padhlebhai_';

export const storage = {
  get(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.startsWith(PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
};

export default storage;
