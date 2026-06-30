/* app.js — shell, home, session views */
let editingDate = null;
let editingDay  = null;

function init() {
  if (!storage.getProfile()) renderOnboarding();
  else renderApp();
}

/* ---- Onboarding ---- */
function renderOnboarding() {
  const chips = FOCUS_AREAS.map(fa =>
    `<label class="chip"><input type="checkbox" name="focus" value="${fa.id}"><span>${fa.label}</span></label>`
  ).join('');
  document.getElementById('app').innerHTML = `
    <div class="onboarding">
      <div class="onboarding-inner">
        <div class="logo-mark">PT</div>
        <h1 class="onboarding-title">PATHWAY TRACKER</h1>
        <p class="onboarding-sub">Off-season block · July 13 – Aug 31, 2026</p>
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
            <label for="ob-style">How would you describe your playing style? <span class="label-hint">(optional)</span></label>
            <textarea id="ob-style" placeholder="e.g. pacey winger who likes to cut inside and shoot, or a CAM who looks to thread through balls" rows="2"></textarea>
          </div>
          <div>
            <label for="ob-goal">Goal</label>
            <textarea id="ob-goal" placeholder="e.g. Sign a pro academy contract by 17" rows="2" required></textarea>
          </div>
          <div>
            <label>What do you want to improve most? <span class="label-hint">(pick up to 5)</span></label>
            <div class="chips-grid" id="ob-focus">${chips}</div>
          </div>
          <button type="submit" class="btn btn-primary">Start Training</button>
        </form>
      </div>
    </div>`;

  document.getElementById('ob-focus').addEventListener('change', () => {
    const checked = document.querySelectorAll('#ob-focus input:checked');
    document.querySelectorAll('#ob-focus input').forEach(cb => {
      cb.closest('.chip').classList.toggle('is-checked', cb.checked);
    });
    document.querySelectorAll('#ob-focus input:not(:checked)').forEach(cb => {
      cb.disabled = checked.length >= 5;
    });
  });

  document.getElementById('ob-form').addEventListener('submit', e => {
    e.preventDefault();
    const focusAreas = [...document.querySelectorAll('#ob-focus input:checked')].map(cb => cb.value);
    storage.setProfile({
      name:       document.getElementById('ob-name').value.trim(),
      age:        parseInt(document.getElementById('ob-age').value),
      position:   document.getElementById('ob-pos').value.trim(),
      style:      document.getElementById('ob-style').value.trim(),
      goal:       document.getElementById('ob-goal').value.trim(),
      focusAreas,
      createdAt:  new Date().toISOString(),
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
  const today     = new Date();
  const todayStr  = today.toISOString().split('T')[0];
  const mode      = getDayMode(todayStr);
  const profile   = storage.getProfile();
  const firstName = profile ? profile.name : '';
  const streak    = calculateStreak();
  const streakBadge = streak > 0
    ? `<div class="streak-badge"><span class="streak-num">${streak}</span><span class="streak-label">day streak</span></div>` : '';

  if (mode === 'bridge' || mode === 'rest' || mode === 'competition') {
    showSpecialWeekHome(todayStr, firstName, streakBadge, profile);
    return;
  }

  const weekInfo    = getCurrentWeekInfo(today);
  const todayDay    = getTodayTrainingDay();
  const phaseBanner = weekInfo ? `
    <div class="phase-banner">
      <span class="phase-week">WEEK ${weekInfo.week} OF 7</span>
      <span class="phase-name">${weekInfo.phase.name}</span>
      <span class="phase-desc">${weekInfo.phase.desc}</span>
    </div>` : '';

  const dayCards = TRAINING_DAYS.map(day => {
    const date    = getWeekDate(day);
    const dateStr = date.toISOString().split('T')[0];
    const session = storage.getSession(dateStr);
    const isToday = day === todayDay;
    const prog    = PROGRAM[day];
    return `<div class="day-card${isToday?' today':''}${session&&session.completed?' completed':''}">
      <div class="day-card-header">
        <span class="day-name">${day.toUpperCase()}</span>
        ${isToday?'<span class="today-badge">TODAY</span>':''}
        ${session&&session.completed?'<span class="done-badge">DONE</span>':''}
      </div>
      <div class="day-title">${prog.title}</div>
      <div class="day-subtitle">${prog.subtitle}</div>
      <div class="day-card-footer">
        <span class="drill-count">${prog.drills.length} drills</span>
        <button class="btn btn-card open-session" data-day="${day}" data-date="${dateStr}">
          ${session&&session.completed?'Review':'Open Session'}
        </button>
      </div>
    </div>`;
  }).join('');

  const focusAreas = profile ? (profile.focusAreas || []) : [];
  const bonusDrill = (mode === 'block' && todayDay) ? getBonusDrill(focusAreas) : null;

  document.getElementById('main').innerHTML = `
    <div class="home-view">
      <div class="home-top"><h2 class="welcome-name">Hey ${firstName}</h2>${streakBadge}</div>
      ${phaseBanner}
      ${renderTouchline(weekInfo ? weekInfo.week : null)}
      <section class="days-section">
        <h3 class="section-label">THIS WEEK</h3>
        <div class="days-list">${dayCards}</div>
      </section>
      ${bonusDrill ? bonusDrillCardHTML(bonusDrill) : ''}
    </div>`;

  document.querySelectorAll('.open-session').forEach(btn =>
    btn.addEventListener('click', () => openSession(btn.dataset.day, btn.dataset.date)));
  bindHowToToggles(document.getElementById('main'));
}

function showSpecialWeekHome(todayStr, firstName, streakBadge, profile) {
  const bridgeCards = Object.entries(BRIDGE_WEEK).map(([dateStr, day]) => {
    const session   = storage.getSession(dateStr);
    const isToday   = dateStr === todayStr;
    const d         = new Date(dateStr + 'T12:00:00');
    const dateLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    return `<div class="day-card${isToday?' today':''}${session&&session.completed?' completed':''}">
      <div class="day-card-header">
        <span class="day-name">${dateLabel.toUpperCase()}</span>
        ${isToday?'<span class="today-badge">TODAY</span>':''}
        ${session&&session.completed?'<span class="done-badge">DONE</span>':''}
      </div>
      <div class="day-title">${day.title}</div>
      <div class="day-subtitle">${day.subtitle}</div>
      <div class="day-card-footer">
        <span class="drill-count">${day.drills.length} drills</span>
        <button class="btn btn-card open-bridge" data-date="${dateStr}">
          ${session&&session.completed?'Review':'Open Session'}
        </button>
      </div>
    </div>`;
  }).join('');

  const focusAreas = profile ? (profile.focusAreas || []) : [];
  const bonusDrill = BRIDGE_WEEK[todayStr] ? getBonusDrill(focusAreas) : null;

  document.getElementById('main').innerHTML = `
    <div class="home-view">
      <div class="home-top"><h2 class="welcome-name">Hey ${firstName}</h2>${streakBadge}</div>
      <div class="special-week-banner">
        <span class="special-week-label">PRE-PROVINCIALS PREP</span>
        <span class="special-week-dates">June 30 – July 5</span>
      </div>
      <section class="days-section">
        <h3 class="section-label">BRIDGE WEEK — LIGHTER LOAD</h3>
        <div class="days-list">${bridgeCards}</div>
      </section>
      ${bonusDrill ? bonusDrillCardHTML(bonusDrill) : ''}
      <div class="info-card rest-day-card">
        <div class="info-card-label">JULY 6 – 7</div>
        <div class="info-card-title">Recovery — No Training</div>
        <p class="info-card-body">Rest matters more than another session right now. Come to provincials fresh.</p>
      </div>
      <div class="info-card competition-card">
        <div class="info-card-label">JULY 8 – 12</div>
        <div class="info-card-title">Provincials — Focus on the Tournament</div>
        <p class="info-card-body">No scheduled training in the app. Play your game.</p>
      </div>
      <div class="info-card block-start-card">
        <div class="info-card-label">JULY 13</div>
        <div class="info-card-title">Off-Season Block Starts</div>
        <p class="info-card-body">7-week programme — BASE → BUILD → PEAK → TAPER. Block runs to Aug 31.</p>
      </div>
    </div>`;

  document.querySelectorAll('.open-bridge').forEach(btn =>
    btn.addEventListener('click', () => openBridgeSession(btn.dataset.date)));
  bindHowToToggles(document.getElementById('main'));
}

function renderTouchline(currentWeek) {
  const phaseAt = { 1: 'BASE', 3: 'BUILD', 6: 'PEAK', 7: 'TAPER' };
  const markers = [1,2,3,4,5,6,7].map(w => {
    const dotCls = 'touchline-dot'+(currentWeek&&w<currentWeek?' past':'')+(currentWeek&&w===currentWeek?' current':'');
    const lblCls = 'touchline-label'+(currentWeek&&w===currentWeek?' current':'');
    return `<div class="touchline-marker">
      <div class="${dotCls}"></div>
      <div class="${lblCls}">W${w}</div>
      <div class="touchline-phase-label">${phaseAt[w]||''}</div>
    </div>`;
  }).join('');
  return `<div class="touchline-wrap" aria-label="7-week block progress">
    <div class="touchline-track">
      <div class="touchline-line"></div>
      <div class="touchline-markers">${markers}</div>
    </div>
  </div>`;
}

/* ---- Normal session ---- */
function openSession(day, dateStr) {
  editingDate = dateStr;
  editingDay  = day;
  const saved = storage.getSession(dateStr);
  const data  = saved || { date: dateStr, day, soreness: null, sleep: null, drills: {}, rpe: null, nutrition: '', completed: false };
  if (!data.drills) data.drills = {};
  renderSession(day, dateStr, data);
}

function renderSession(day, dateStr, data) {
  const prog     = PROGRAM[day];
  const dateDisp = new Date(dateStr+'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
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
            ${[1,2,3,4,5].map(n=>`<button type="button" class="scale-btn${data.soreness===n?' active':''}" data-val="${n}" aria-label="Soreness ${n}${n===1?' (fresh)':n===5?' (wrecked)':''}">${n}</button>`).join('')}
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
        ${prog.drills.map(d => drillCardHTML(d, data.drills[d.id]||{})).join('')}
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
        <button class="btn btn-secondary" id="btn-save">Save progress</button>
        <button class="btn btn-primary" id="btn-complete">${data.completed?'Saved complete':'Save + Mark Complete'}</button>
      </div>
    </div>`;
  bindSessionEvents(data);
}

function bindSessionEvents(data) {
  const main = document.getElementById('main');
  document.getElementById('back-btn').addEventListener('click', goHome);
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
  document.getElementById('sleep-group').querySelectorAll('.sleep-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('sleep-group').querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      data.sleep = btn.dataset.val;
    });
  });
  document.getElementById('rpe-group').querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('rpe-group').querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      data.rpe = parseInt(btn.dataset.val);
    });
  });
  bindDrillCards(main, data);
  document.getElementById('nutrition-log').addEventListener('input', e => { data.nutrition = e.target.value; });
  document.getElementById('btn-save').addEventListener('click', () => doSave(data, false));
  document.getElementById('btn-complete').addEventListener('click', () => doSave(data, true));
}

/* ---- Bridge session (no soreness/RPE) ---- */
function openBridgeSession(dateStr) {
  editingDate = dateStr;
  editingDay  = 'bridge';
  const bridgeDay = BRIDGE_WEEK[dateStr];
  const saved     = storage.getSession(dateStr);
  const data      = saved || { date: dateStr, type: 'bridge', drills: {}, nutrition: '', completed: false };
  if (!data.drills) data.drills = {};
  const dateDisp  = new Date(dateStr+'T12:00:00').toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
  document.getElementById('main').innerHTML = `
    <div class="session-view">
      <div class="session-header">
        <button class="back-btn" id="back-btn">← Back</button>
        <span class="session-date">${dateDisp}</span>
      </div>
      <h2 class="session-title">${bridgeDay.title}</h2>
      <p class="session-subtitle">${bridgeDay.subtitle}</p>
      <section class="drills-section">
        <h3 class="section-label">DRILLS</h3>
        ${bridgeDay.drills.map(d => drillCardHTML(d, data.drills[d.id]||{})).join('')}
      </section>
      <div class="card" style="margin-bottom:1rem;">
        <h3 class="card-label">NUTRITION TODAY</h3>
        <div class="form-group" style="margin:0;">
          <textarea id="nutrition-log" class="nutrition-textarea" rows="3"
            placeholder="What did you eat? Meals, timing, pre/post session…">${data.nutrition||''}</textarea>
        </div>
      </div>
      <div class="session-actions">
        <button class="btn btn-secondary" id="btn-save">Save progress</button>
        <button class="btn btn-primary" id="btn-complete">${data.completed?'Saved complete':'Save + Mark Complete'}</button>
      </div>
    </div>`;
  document.getElementById('back-btn').addEventListener('click', goHome);
  bindDrillCards(document.getElementById('main'), data);
  document.getElementById('nutrition-log').addEventListener('input', e => { data.nutrition = e.target.value; });
  document.getElementById('btn-save').addEventListener('click', () => doSave(data, false));
  document.getElementById('btn-complete').addEventListener('click', () => doSave(data, true));
}

/* ---- Shared helpers ---- */
function sorenessWarningHTML() {
  return `<div class="soreness-warning" role="alert"><strong>HIGH SORENESS — SCALE BACK TODAY</strong><p>Half the reps. No max-effort sprints. Technical work only. Listen to your body.</p></div>`;
}

function drillCardHTML(drill, dd) {
  const done = dd.done || false;
  const val  = (dd.metric != null && dd.metric !== '') ? dd.metric : '';
  const metricRow = drill.metric ? `<div class="metric-row">
    <label class="metric-label" for="m-${drill.id}">${drill.metric.label}</label>
    <input type="number" id="m-${drill.id}" class="metric-input" value="${val}" placeholder="—" step="0.01">
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
      <div class="howto-content"><p class="howto-text">${drill.howTo}</p></div>
      <textarea class="drill-notes" rows="2" placeholder="Notes…">${dd.notes||''}</textarea>
    </div>
  </div>`;
}

function bonusDrillCardHTML(drill) {
  return `<div class="card bonus-drill-card">
    <div class="bonus-drill-label">RECOMMENDED EXTRA · FOR YOUR GOALS</div>
    <div class="drill-name" style="margin:.375rem 0 .15rem;">${drill.name}</div>
    <div class="drill-prescription">${drill.prescription}</div>
    <div class="drill-bottom" style="margin-top:.5rem;border-top:1px solid var(--chalk);padding-top:.5rem;">
      <button type="button" class="howto-toggle" aria-expanded="false">How to ▼</button>
      <div class="howto-content"><p class="howto-text">${drill.howTo}</p></div>
    </div>
    <p class="bonus-drill-note">Optional — extra reps on your priority, not required today.</p>
  </div>`;
}

function bindDrillCards(container, data) {
  container.querySelectorAll('.drill-card').forEach(card => {
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
  });
  bindHowToToggles(container);
}

function bindHowToToggles(container) {
  container.querySelectorAll('.howto-toggle').forEach(toggle => {
    const content = toggle.nextElementSibling;
    if (!content) return;
    toggle.addEventListener('click', () => {
      const open = content.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? 'How to ▲' : 'How to ▼';
    });
  });
}

function goHome() {
  showHome();
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-view="home"]').classList.add('active');
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
  if (markComplete) setTimeout(goHome, 900);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

init();
