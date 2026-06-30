/* app.js — views, state, DOM */
(function () {
  let editingDate = null;
  let editingDay  = null;

  /* ---- Bootstrap ---- */
  function init() {
    if (!storage.getProfile()) renderOnboarding();
    else renderApp();
  }

  /* ---- Onboarding ---- */
  function renderOnboarding() {
    document.getElementById('app').innerHTML = `
      <div class="onboarding">
        <div class="onboarding-inner">
          <div class="logo-mark">PT</div>
          <h1 class="onboarding-title">PATHWAY TRACKER</h1>
          <p class="onboarding-sub">Off-season block · July 12 – Aug 31, 2026</p>
          <form id="ob-form" class="onboarding-form">
            <div>
              <label for="ob-name">Your name</label>
              <input id="ob-name" type="text" placeholder="First name" autocomplete="given-name" required>
            </div>
            <div>
              <label for="ob-age">Age</label>
              <input id="ob-age" type="number" placeholder="15" min="10" max="25" required>
            </div>
            <div>
              <label for="ob-pos">Position(s)</label>
              <input id="ob-pos" type="text" placeholder="e.g. RW / LW / CAM" required>
            </div>
            <div>
              <label for="ob-style">Playing style <span class="label-hint">(1-2 sentences)</span></label>
              <textarea id="ob-style" placeholder="e.g. Direct, attack the line, cut inside on the right" rows="2"></textarea>
            </div>
            <div>
              <label for="ob-goal">Goal</label>
              <textarea id="ob-goal" placeholder="e.g. Sign a pro academy contract by 17" rows="2" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Start Training</button>
          </form>
        </div>
      </div>`;
    document.getElementById('ob-form').addEventListener('submit', e => {
      e.preventDefault();
      storage.setProfile({
        name:     document.getElementById('ob-name').value.trim(),
        age:      parseInt(document.getElementById('ob-age').value),
        position: document.getElementById('ob-pos').value.trim(),
        style:    document.getElementById('ob-style').value.trim(),
        goal:     document.getElementById('ob-goal').value.trim(),
        createdAt: new Date().toISOString(),
      });
      renderApp();
    });
  }

  /* ---- App shell ---- */
  function renderApp() {
    document.getElementById('app').innerHTML = `
      <div class="app-shell">
        <header class="app-header">
          <span class="header-logo">PT</span>
          <nav class="header-nav">
            <button class="nav-btn active" data-view="home">TODAY</button>
            <button class="nav-btn" data-view="progress">PROGRESS</button>
          </nav>
        </header>
        <main id="main" class="main-content"></main>
        <footer class="app-footer">
          <button class="footer-link" id="edit-profile-btn">Edit profile</button>
        </footer>
      </div>`;
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.dataset.view === 'home' ? showHome() : showProgress();
      });
    });
    document.getElementById('edit-profile-btn').addEventListener('click', showProfileEdit);
    showHome();
  }

  /* ---- Home ---- */
  function showHome() {
    const today      = new Date();
    const todayDay   = getTodayTrainingDay();
    const weekInfo   = getCurrentWeekInfo(today);
    const streak     = calculateStreak();
    const profile    = storage.getProfile();
    const firstName  = profile ? profile.name : '';

    const phaseBanner = weekInfo ? `
      <div class="phase-banner">
        <span class="phase-week">WEEK ${weekInfo.week} OF 7</span>
        <span class="phase-name">${weekInfo.phase.name}</span>
        <span class="phase-desc">${weekInfo.phase.desc}</span>
      </div>` : '';

    const streakBadge = streak > 0 ? `
      <div class="streak-badge">
        <span class="streak-num">${streak}</span>
        <span class="streak-label">day streak</span>
      </div>` : '';

    const dayCards = TRAINING_DAYS.map(day => {
      const date     = getWeekDate(day);
      const dateStr  = date.toISOString().split('T')[0];
      const session  = storage.getSession(dateStr);
      const isToday  = day === todayDay;
      const prog     = PROGRAM[day];
      return `
        <div class="day-card${isToday ? ' today' : ''}${session && session.completed ? ' completed' : ''}">
          <div class="day-card-header">
            <span class="day-name">${day.toUpperCase()}</span>
            ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
            ${session && session.completed ? '<span class="done-badge">DONE</span>' : ''}
          </div>
          <div class="day-title">${prog.title}</div>
          <div class="day-subtitle">${prog.subtitle}</div>
          <div class="day-card-footer">
            <span class="drill-count">${prog.drills.length} drills</span>
            <button class="btn btn-card open-session" data-day="${day}" data-date="${dateStr}">
              ${session && session.completed ? 'Review' : 'Open Session'}
            </button>
          </div>
        </div>`;
    }).join('');

    document.getElementById('main').innerHTML = `
      <div class="home-view">
        <div class="home-top">
          <h2 class="welcome-name">Hey ${firstName}</h2>
          ${streakBadge}
        </div>
        ${phaseBanner}
        ${renderTouchline(weekInfo ? weekInfo.week : null)}
        <section class="days-section">
          <h3 class="section-label">THIS WEEK</h3>
          <div class="days-list">${dayCards}</div>
        </section>
      </div>`;

    document.querySelectorAll('.open-session').forEach(btn => {
      btn.addEventListener('click', () => openSession(btn.dataset.day, btn.dataset.date));
    });
  }

  function renderTouchline(currentWeek) {
    const phaseAt = { 1: 'BASE', 3: 'BUILD', 6: 'PEAK', 7: 'TAPER' };
    const markers = [1,2,3,4,5,6,7].map(w => {
      const dotCls = 'touchline-dot' + (currentWeek && w < currentWeek ? ' past' : '') + (currentWeek && w === currentWeek ? ' current' : '');
      const lblCls = 'touchline-label' + (currentWeek && w === currentWeek ? ' current' : '');
      return `<div class="touchline-marker">
        <div class="${dotCls}"></div>
        <div class="${lblCls}">W${w}</div>
        <div class="touchline-phase-label">${phaseAt[w] || ''}</div>
      </div>`;
    }).join('');
    return `<div class="touchline-wrap" aria-label="7-week block progress">
      <div class="touchline-track">
        <div class="touchline-line"></div>
        <div class="touchline-markers">${markers}</div>
      </div>
    </div>`;
  }

  /* ---- Session ---- */
  function openSession(day, dateStr) {
    editingDate = dateStr;
    editingDay  = day;
    const saved = storage.getSession(dateStr);
    const data  = saved || { date: dateStr, day, soreness: null, sleep: null, drills: {}, rpe: null, nutrition: '', completed: false };
    if (!data.drills) data.drills = {};
    renderSession(day, dateStr, data);
  }

  function renderSession(day, dateStr, data) {
    const prog    = PROGRAM[day];
    const dateObj = new Date(dateStr + 'T12:00:00');
    const dateDisp = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const warnHTML = data.soreness >= 4 ? sorenessWarningHTML() : '';

    document.getElementById('main').innerHTML = `
      <div class="session-view">
        <div class="session-header">
          <button class="back-btn" id="back-btn">← Back</button>
          <span class="session-date">${dateDisp}</span>
        </div>
        <h2 class="session-title">${prog.title}</h2>
        <p class="session-subtitle">${prog.subtitle}</p>
        ${warnHTML}
        <section class="pre-session card">
          <h3 class="card-label">PRE-SESSION CHECK</h3>
          <div class="form-group">
            <label>Soreness today</label>
            <div class="scale-btns" id="soreness-group">
              ${[1,2,3,4,5].map(n => `<button type="button" class="scale-btn${data.soreness===n?' active':''}" data-val="${n}" aria-label="Soreness ${n}${n===1?' (fresh)':n===5?' (wrecked)':''}">${n}</button>`).join('')}
            </div>
            <div class="scale-hint"><span>1 Fresh</span><span>5 Wrecked</span></div>
          </div>
          <div class="form-group">
            <label>Sleep quality</label>
            <div class="sleep-btns" id="sleep-group">
              ${['good','ok','poor'].map(s=>`<button type="button" class="sleep-btn${data.sleep===s?' active':''}" data-val="${s}">${s[0].toUpperCase()+s.slice(1)}</button>`).join('')}
            </div>
          </div>
        </section>
        <section class="drills-section">
          <h3 class="section-label">DRILLS</h3>
          ${prog.drills.map(d => drillCardHTML(d, data.drills[d.id] || {})).join('')}
        </section>
        <section class="post-session card">
          <h3 class="card-label">POST-SESSION</h3>
          <div class="form-group">
            <label>Session RPE <span class="label-hint">(1 easy – 10 maximal)</span></label>
            <div class="scale-btns" id="rpe-group">
              ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" class="scale-btn rpe-btn${data.rpe===n?' active':''}" data-val="${n}">${n}</button>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="nutrition-log">Nutrition today</label>
            <textarea id="nutrition-log" class="nutrition-textarea" rows="3"
              placeholder="What did you eat? Meals, timing, pre/post session…">${data.nutrition||''}</textarea>
          </div>
        </section>
        <div class="session-actions">
          <button class="btn btn-secondary btn-save" id="btn-save">Save progress</button>
          <button class="btn btn-primary btn-complete" id="btn-complete">
            ${data.completed ? 'Saved complete' : 'Save + Mark Complete'}
          </button>
        </div>
      </div>`;

    bindSessionEvents(data);
  }

  function sorenessWarningHTML() {
    return `<div class="soreness-warning" role="alert">
      <strong>HIGH SORENESS — SCALE BACK TODAY</strong>
      <p>Half the reps. No max-effort sprints. Technical work only. Listen to your body.</p>
    </div>`;
  }

  function drillCardHTML(drill, dd) {
    const done = dd.done || false;
    const val  = (dd.metric != null && dd.metric !== '') ? dd.metric : '';
    const metricRow = drill.metric ? `
      <div class="metric-row">
        <label class="metric-label" for="m-${drill.id}">${drill.metric.label}</label>
        <input type="number" id="m-${drill.id}" class="metric-input" value="${val}" placeholder="—" step="0.01" aria-label="${drill.metric.label}">
        <span class="metric-unit">${drill.metric.unit}</span>
      </div>` : '';
    return `<div class="drill-card${done?' drill-done':''}" data-drill-id="${drill.id}">
      <div class="drill-top">
        <label class="drill-check-label">
          <input type="checkbox" class="drill-checkbox"${done?' checked':''} aria-label="Done: ${drill.name}">
          <span class="drill-check-box"></span>
          <span class="drill-name">${drill.name}</span>
        </label>
        <span class="drill-prescription">${drill.prescription}</span>
      </div>
      ${metricRow}
      <div class="drill-bottom">
        <button type="button" class="howto-toggle" aria-expanded="false">How to ▼</button>
        <div class="howto-content">
          <p class="howto-text">${drill.howTo}</p>
        </div>
        <textarea class="drill-notes" rows="2" placeholder="Notes…" aria-label="Notes for ${drill.name}">${dd.notes||''}</textarea>
      </div>
    </div>`;
  }

  function bindSessionEvents(data) {
    const main = document.getElementById('main');

    document.getElementById('back-btn').addEventListener('click', () => {
      showHome();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-view="home"]').classList.add('active');
    });

    /* Soreness */
    document.getElementById('soreness-group').querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('soreness-group').querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        data.soreness = parseInt(btn.dataset.val);
        const existing = main.querySelector('.soreness-warning');
        if (data.soreness >= 4 && !existing) {
          main.querySelector('.pre-session').insertAdjacentHTML('beforebegin', sorenessWarningHTML());
        } else if (data.soreness < 4 && existing) {
          existing.remove();
        }
      });
    });

    /* Sleep */
    document.getElementById('sleep-group').querySelectorAll('.sleep-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('sleep-group').querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        data.sleep = btn.dataset.val;
      });
    });

    /* RPE */
    document.getElementById('rpe-group').querySelectorAll('.scale-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('rpe-group').querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        data.rpe = parseInt(btn.dataset.val);
      });
    });

    /* Drill cards */
    main.querySelectorAll('.drill-card').forEach(card => {
      const id = card.dataset.drillId;
      if (!data.drills[id]) data.drills[id] = {};

      card.querySelector('.drill-checkbox').addEventListener('change', e => {
        data.drills[id].done = e.target.checked;
        card.classList.toggle('drill-done', e.target.checked);
      });
      const mi = card.querySelector('.metric-input');
      if (mi) mi.addEventListener('input', () => { data.drills[id].metric = mi.value !== '' ? parseFloat(mi.value) : null; });
      const ni = card.querySelector('.drill-notes');
      if (ni) ni.addEventListener('input', () => { data.drills[id].notes = ni.value; });

      const toggle = card.querySelector('.howto-toggle');
      const content = card.querySelector('.howto-content');
      toggle.addEventListener('click', () => {
        const open = content.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
        toggle.textContent = open ? 'How to ▲' : 'How to ▼';
      });
    });

    /* Nutrition */
    document.getElementById('nutrition-log').addEventListener('input', e => { data.nutrition = e.target.value; });

    /* Save */
    document.getElementById('btn-save').addEventListener('click', () => doSave(data, false));
    document.getElementById('btn-complete').addEventListener('click', () => doSave(data, true));
  }

  function doSave(data, markComplete) {
    if (markComplete) data.completed = true;
    storage.setSession(editingDate, data);
    const actions = document.querySelector('.session-actions');
    const msg = document.createElement('div');
    msg.className = 'save-feedback';
    msg.textContent = markComplete ? 'Session saved and marked complete!' : 'Progress saved.';
    actions.appendChild(msg);
    setTimeout(() => msg && msg.remove(), 2200);
    if (markComplete) {
      setTimeout(() => {
        showHome();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-view="home"]').classList.add('active');
      }, 900);
    }
  }

  /* ---- Progress ---- */
  function showProgress() {
    const cardsHTML = ALL_METRICS.map(m => {
      const history = getMetricHistory(m.id, m.drillId, m.dayKey);
      if (!history.length) return `
        <div class="progress-metric card">
          <div class="metric-header">
            <span class="metric-name">${m.drillName}</span>
            <span class="metric-unit-tag">${m.unit}</span>
          </div>
          <p class="no-entries">No entries yet</p>
        </div>`;
      const last12 = history.slice(-12);
      const latest = last12[last12.length - 1].value;
      let trend = 'flat';
      if (last12.length >= 2) {
        const diff = latest - last12[last12.length - 2].value;
        if (Math.abs(diff / (last12[last12.length - 2].value || 1)) > 0.02)
          trend = (m.lowerBetter ? diff < 0 : diff > 0) ? 'improving' : 'slipping';
      }
      const trendIcon  = { improving: '↑', flat: '→', slipping: '↓' }[trend];
      const trendClass = { improving: 'trend-up', flat: 'trend-flat', slipping: 'trend-down' }[trend];
      return `
        <div class="progress-metric card">
          <div class="metric-header">
            <span class="metric-name">${m.drillName}</span>
            <span class="metric-unit-tag">${m.unit}</span>
          </div>
          <div class="metric-summary">
            <span class="metric-latest">${latest}</span>
            <span class="metric-trend ${trendClass}">${trendIcon} ${trend}</span>
          </div>
          ${sparklineHTML(last12.map(e => e.value))}
          <div class="metric-history-count">${history.length} session${history.length !== 1 ? 's' : ''} logged</div>
        </div>`;
    }).join('');

    document.getElementById('main').innerHTML = `
      <div class="progress-view">
        <h2 class="section-title">PROGRESS</h2>
        <div class="metrics-grid">${cardsHTML}</div>
      </div>`;
  }

  function sparklineHTML(values) {
    if (values.length < 2) return '<div style="color:rgba(26,43,32,.3);text-align:center;padding:.5rem;">—</div>';
    const W = 200, H = 40, P = 4;
    const min = Math.min(...values), max = Math.max(...values);
    const rng = max - min || 1;
    const pts = values.map((v, i) => {
      const x = P + (i / (values.length - 1)) * (W - P * 2);
      const y = H - P - ((v - min) / rng) * (H - P * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const [lx, ly] = pts.split(' ').pop().split(',');
    return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <polyline points="${pts}" fill="none" stroke="var(--pitch)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${lx}" cy="${ly}" r="3.5" fill="var(--pitch)"/>
    </svg>`;
  }

  /* ---- Profile Edit ---- */
  function showProfileEdit() {
    const p = storage.getProfile() || {};
    document.getElementById('main').innerHTML = `
      <div class="profile-edit">
        <button class="back-btn" id="pe-back">← Back</button>
        <h2 class="section-title" style="margin-top:.75rem;">EDIT PROFILE</h2>
        <form id="pe-form">
          <div class="form-group"><label for="pe-name">Name</label>
            <input id="pe-name" type="text" value="${escHtml(p.name||'')}" required></div>
          <div class="form-group"><label for="pe-age">Age</label>
            <input id="pe-age" type="number" value="${p.age||''}" min="10" max="25"></div>
          <div class="form-group"><label for="pe-pos">Position(s)</label>
            <input id="pe-pos" type="text" value="${escHtml(p.position||'')}"></div>
          <div class="form-group"><label for="pe-style">Playing style</label>
            <textarea id="pe-style" rows="2">${escHtml(p.style||'')}</textarea></div>
          <div class="form-group"><label for="pe-goal">Goal</label>
            <textarea id="pe-goal" rows="2">${escHtml(p.goal||'')}</textarea></div>
          <button type="submit" class="btn btn-primary">Save Profile</button>
        </form>
      </div>`;
    document.getElementById('pe-back').addEventListener('click', () => {
      showHome();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-view="home"]').classList.add('active');
    });
    document.getElementById('pe-form').addEventListener('submit', e => {
      e.preventDefault();
      storage.setProfile({
        ...p,
        name:     document.getElementById('pe-name').value.trim(),
        age:      parseInt(document.getElementById('pe-age').value),
        position: document.getElementById('pe-pos').value.trim(),
        style:    document.getElementById('pe-style').value.trim(),
        goal:     document.getElementById('pe-goal').value.trim(),
      });
      showHome();
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelector('[data-view="home"]').classList.add('active');
    });
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  init();
})();
