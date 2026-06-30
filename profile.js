/* profile.js — progress view + profile edit */

function showProgress() {
  const profile = storage.getProfile();
  const sections = ALL_METRICS.map(m => {
    const history = getMetricHistory(m.id, m.drillId, m.dayKey);
    if (!history.length) return `<div class="metric-card">
      <div class="metric-card-header">
        <span class="metric-name">${m.drillName}</span>
        <span class="metric-day">${m.dayKey.charAt(0).toUpperCase()+m.dayKey.slice(1)}</span>
      </div>
      <p class="metric-empty">No data yet — log your first session.</p>
    </div>`;
    const latest = history[history.length - 1];
    const best   = m.lowerBetter
      ? Math.min(...history.map(h => h.value))
      : Math.max(...history.map(h => h.value));
    const arrow  = history.length > 1
      ? (m.lowerBetter
          ? (latest.value < history[history.length-2].value ? '▼' : '▲')
          : (latest.value > history[history.length-2].value ? '▲' : '▼'))
      : '';
    const trendCls = arrow === '▲' ? (m.lowerBetter ? 'trend-down' : 'trend-up')
                   : arrow === '▼' ? (m.lowerBetter ? 'trend-up'  : 'trend-down') : '';
    return `<div class="metric-card">
      <div class="metric-card-header">
        <span class="metric-name">${m.drillName}</span>
        <span class="metric-day">${m.dayKey.charAt(0).toUpperCase()+m.dayKey.slice(1)}</span>
      </div>
      <div class="metric-stat-row">
        <div class="metric-stat">
          <span class="stat-label">Latest</span>
          <span class="stat-value">${latest.value} <span class="stat-unit">${m.unit}</span>
            ${arrow ? `<span class="trend-arrow ${trendCls}">${arrow}</span>` : ''}
          </span>
        </div>
        <div class="metric-stat">
          <span class="stat-label">Best</span>
          <span class="stat-value">${best} <span class="stat-unit">${m.unit}</span></span>
        </div>
        <div class="metric-stat">
          <span class="stat-label">Sessions</span>
          <span class="stat-value">${history.length}</span>
        </div>
      </div>
      ${sparklineHTML(history, m.lowerBetter)}
    </div>`;
  }).join('');

  const streak = calculateStreak();
  document.getElementById('main').innerHTML = `
    <div class="progress-view">
      <div class="progress-top">
        <h2 class="progress-title">PROGRESS</h2>
        ${profile ? `<p class="progress-name">${profile.name}</p>` : ''}
        ${streak > 0 ? `<div class="streak-badge"><span class="streak-num">${streak}</span><span class="streak-label">day streak</span></div>` : ''}
      </div>
      ${sections || '<p class="metric-empty">No sessions logged yet. Start training!</p>'}
    </div>`;
}

function sparklineHTML(history, lowerBetter) {
  if (history.length < 2) return '';
  const vals   = history.map(h => h.value);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const range  = maxVal - minVal || 1;
  const W = 120, H = 36, pad = 4;
  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - minVal) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lastPt = pts.split(' ').pop().split(',');
  const dotCls = lowerBetter ? 'sparkline-dot-lower' : 'sparkline-dot-higher';
  return `<svg class="sparkline" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="3" class="${dotCls}"/>
  </svg>`;
}

function showProfileEdit() {
  const profile = storage.getProfile() || {};
  const focusSaved = profile.focusAreas || [];
  const chips = FOCUS_AREAS.map(fa => {
    const checked = focusSaved.includes(fa.id);
    return `<label class="chip${checked?' is-checked':''}"><input type="checkbox" name="focus" value="${fa.id}"${checked?' checked':''}><span>${fa.label}</span></label>`;
  }).join('');
  document.getElementById('main').innerHTML = `
    <div class="profile-edit-view">
      <div class="session-header">
        <button class="back-btn" id="pe-back">← Back</button>
        <span class="session-date">Edit Profile</span>
      </div>
      <form id="pe-form" class="onboarding-form" style="padding:0 0 2rem;">
        <div>
          <label for="pe-name">Name</label>
          <input id="pe-name" type="text" value="${esc(profile.name||'')}" required>
        </div>
        <div>
          <label for="pe-age">Age</label>
          <input id="pe-age" type="number" value="${esc(profile.age||'')}" min="10" max="25" required>
        </div>
        <div>
          <label for="pe-pos">Position(s)</label>
          <input id="pe-pos" type="text" value="${esc(profile.position||'')}">
        </div>
        <div>
          <label for="pe-style">Playing style <span class="label-hint">(optional)</span></label>
          <textarea id="pe-style" rows="2">${esc(profile.style||'')}</textarea>
        </div>
        <div>
          <label for="pe-goal">Goal</label>
          <textarea id="pe-goal" rows="2">${esc(profile.goal||'')}</textarea>
        </div>
        <div>
          <label>What do you want to improve most? <span class="label-hint">(pick up to 5)</span></label>
          <div class="chips-grid" id="pe-focus">${chips}</div>
        </div>
        <div class="session-actions" style="margin-top:1.5rem;">
          <button type="button" class="btn btn-secondary" id="pe-back2">Cancel</button>
          <button type="submit" class="btn btn-primary">Save</button>
        </div>
      </form>
    </div>`;

  document.getElementById('pe-back').addEventListener('click', goHome);
  document.getElementById('pe-back2').addEventListener('click', goHome);

  document.getElementById('pe-focus').addEventListener('change', () => {
    document.querySelectorAll('#pe-focus .chip').forEach(chip => {
      chip.classList.toggle('is-checked', chip.querySelector('input').checked);
    });
    const checked = document.querySelectorAll('#pe-focus input:checked');
    document.querySelectorAll('#pe-focus input:not(:checked)').forEach(cb => {
      cb.disabled = checked.length >= 5;
    });
  });

  document.getElementById('pe-form').addEventListener('submit', e => {
    e.preventDefault();
    const focusAreas = [...document.querySelectorAll('#pe-focus input:checked')].map(cb => cb.value);
    storage.setProfile({
      ...profile,
      name:       document.getElementById('pe-name').value.trim(),
      age:        parseInt(document.getElementById('pe-age').value),
      position:   document.getElementById('pe-pos').value.trim(),
      style:      document.getElementById('pe-style').value.trim(),
      goal:       document.getElementById('pe-goal').value.trim(),
      focusAreas,
    });
    goHome();
  });
}

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
