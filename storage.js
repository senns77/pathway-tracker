/* storage.js — all localStorage access lives here so a backend swap touches only this file */
const storage = (() => {
  function _get(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function _set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.error('storage error', e); return false; }
  }
  function _del(key) { try { localStorage.removeItem(key); } catch {} }
  function _keys(prefix) {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) out.push(k);
      }
    } catch {}
    return out;
  }

  return {
    get: _get,
    set: _set,
    remove: _del,
    listByPrefix: (prefix) => _keys(prefix),
    getProfile: () => _get('pt:profile'),
    setProfile: (p) => _set('pt:profile', p),
    getSession: (date) => _get(`pt:session:${date}`),
    setSession: (date, data) => _set(`pt:session:${date}`, data),
    listSessionDates: () => _keys('pt:session:').map(k => k.replace('pt:session:', '')).sort(),
  };
})();
