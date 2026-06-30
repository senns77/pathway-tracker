/* data.js — program data, block constants, utility functions */

const BLOCK_START = new Date('2026-07-13T00:00:00');
const BLOCK_END   = new Date('2026-08-31T23:59:59');

const PHASES = [
  { weeks: [1, 2], name: 'BASE',  desc: "Build technique and work capacity. Moderate loads, learn movements, don't chase numbers yet." },
  { weeks: [3, 4, 5], name: 'BUILD', desc: 'Push intensity — heavier loads (good form first), max-effort sprints, higher volume on touches.' },
  { weeks: [6], name: 'PEAK',  desc: 'Highest intensity of the block. Max-effort everything.' },
  { weeks: [7], name: 'TAPER', desc: "Cut volume ~40%. Keep intensity, drop sets. Walk into pre-season fresh, not fried." },
];

const TRAINING_DAYS = ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'];
const JS_TO_DAY = { 1: 'monday', 2: 'tuesday', 3: 'wednesday', 5: 'friday', 6: 'saturday' };

const PROGRAM = {
  monday: {
    title: 'MAX SPEED + AGILITY',
    subtitle: 'Priority day — do this first while freshest',
    drills: [
      {
        id: 'mon-warmup',
        name: 'Dynamic Warm-up',
        prescription: '5 min',
        metric: null,
        howTo: 'High knees x20m, butt kicks x20m, walking leg swings x10 each leg, lateral lunges x10 each side, ankle bounces x20. Keep it moving, no static stretching yet.',
      },
      {
        id: 'mon-ladder',
        name: 'Agility Ladder',
        prescription: '4 patterns × 2 each',
        metric: { id: 'agility-ladder-best', label: 'Best pass (sec)', unit: 'sec', lowerBetter: true },
        howTo: 'Run each pattern through the ladder — in-in-out-out, lateral two-foot shuffle, the "icky shuffle" (one foot in, one foot out, alternating). Stay on the balls of the feet, arms drive like sprinting, eyes up not down at the ladder.',
      },
      {
        id: 'mon-resisted',
        name: 'Resisted Sprint Starts',
        prescription: '4 reps × 10m',
        metric: null,
        howTo: 'From a 3-point stance, drive out low for the first 3-5 steps before standing up to full sprint posture. If using a band, a parent holds it at the waist with light resistance, releasing after the first 2 steps.',
      },
      {
        id: 'mon-flying',
        name: 'Flying 10m Sprint',
        prescription: '× 6, full recovery 90s+ between',
        metric: { id: 'flying-10m-best', label: 'Best time (sec)', unit: 'sec', lowerBetter: true },
        howTo: 'Build up to top speed over ~15-20m of run-in, then time only the 10m "flying" zone at max velocity — this measures top speed, not acceleration. Full recovery (90s+) between reps so each one is genuinely max effort.',
      },
      {
        id: 'mon-cooldown',
        name: 'Cooldown Jog + Stretch',
        prescription: '5 min',
        metric: null,
        howTo: 'Easy jog, then static holds (30s each) on hamstrings, hip flexors, calves.',
      },
    ],
  },

  tuesday: {
    title: 'STRENGTH',
    subtitle: 'Unilateral + bodyweight — hamstring focus',
    drills: [
      {
        id: 'tue-warmup',
        name: 'Warm-up: Squats + Band Walks',
        prescription: '5 min',
        metric: null,
        howTo: '2 sets of 10 bodyweight squats, then lateral band walks (band above knees) 10 steps each direction.',
      },
      {
        id: 'tue-lunges',
        name: 'Single-Leg Walking Lunges (DB)',
        prescription: '3 sets × 8 each leg',
        metric: null,
        howTo: "Hold light dumbbells at the sides, step forward into a lunge, back knee taps lightly, drive through the front heel to the next step. Keep the torso upright, don't lean forward.",
      },
      {
        id: 'tue-lunge-jump',
        name: 'Rear-Foot-Elevated Lunge Jump',
        prescription: '3 sets × 6 each leg',
        metric: null,
        howTo: 'Rear foot up on a bench or step, front foot planted. Drop into a lunge, then explode upward off the front leg, land soft. This is the power-builder — focus on the explosive concentric, not the load.',
      },
      {
        id: 'tue-rdl',
        name: 'Single-Leg RDL (Light DB)',
        prescription: '3 sets × 8 each leg',
        metric: null,
        howTo: 'Stand on one leg, hinge forward at the hips while the free leg extends straight back for balance, keep a slight bend in the standing knee, reach the dumbbell toward the floor, then return to standing by squeezing the glute. Keep it light — this is a balance and hamstring-length exercise, not a max-effort lift.',
      },
      {
        id: 'tue-hamcurls',
        name: 'Band Hamstring Curls',
        prescription: '3 sets × 12, slow 2-3 sec eccentric',
        metric: null,
        howTo: 'Anchor the band low (around a stable post or have a parent hold it), loop around the ankle, lying face-down or standing, curl the heel toward the glute against resistance, then control the release for 2-3 seconds. The slow eccentric is the whole point.',
      },
      {
        id: 'tue-glute',
        name: 'Single-Leg Glute Bridge (Band)',
        prescription: '3 sets × 10 each leg',
        metric: null,
        howTo: 'Lying on the back, band across the hips, one foot planted, other leg extended. Drive through the planted heel to lift the hips, squeeze the glute at the top, lower with control.',
      },
      {
        id: 'tue-pushups',
        name: 'Push-ups',
        prescription: '3 sets to near-failure',
        metric: { id: 'pushups-best', label: 'Best set (reps)', unit: 'reps', lowerBetter: false },
        howTo: 'Hands slightly wider than shoulders, full range chest-to-floor, body in a straight line. Log the best of the 3 sets.',
      },
      {
        id: 'tue-pullups',
        name: 'Pull-ups (Assisted Band if Needed)',
        prescription: '3 sets to near-failure',
        metric: { id: 'pullups-best', label: 'Best set (reps)', unit: 'reps', lowerBetter: false },
        howTo: 'Full hang to chin-over-bar. Use a resistance band looped over the bar for assistance if needed.',
      },
      {
        id: 'tue-plank',
        name: 'Plank + Side Plank',
        prescription: '3 sets × 30s each',
        metric: { id: 'plank-best', label: 'Best hold (sec)', unit: 'sec', lowerBetter: false },
        howTo: 'Straight line head to heel, no sagging or piking hips. Side plank: stack feet, hips lifted, body in a straight line.',
      },
    ],
  },

  wednesday: {
    title: 'TOUCHES + BALL MASTERY',
    subtitle: 'Technical volume — off-season means more reps',
    drills: [
      {
        id: 'wed-toetaps',
        name: 'Toe Taps',
        prescription: '30s × 5',
        metric: { id: 'toetaps-best', label: 'Best 30s count', unit: 'touches', lowerBetter: false },
        howTo: 'Ball stationary, alternate tapping the top of the ball with the sole of each foot as fast as possible while staying balanced. Light, quick contact.',
      },
      {
        id: 'wed-weakfoot',
        name: 'Weak-Foot Only Cone Course',
        prescription: '30s × 5',
        metric: { id: 'weakfoot-best', label: 'Best round completions', unit: 'reps', lowerBetter: false },
        howTo: 'Set up 4-5 cones in a line or zigzag. Dribble through using ONLY the weaker foot — both inside and outside of that foot.',
      },
      {
        id: 'wed-juggles',
        name: 'Max Juggles',
        prescription: '3 attempts',
        metric: { id: 'juggles-best', label: 'Best attempt (touches)', unit: 'touches', lowerBetter: false },
        howTo: 'Keep the ball off the ground using feet, thighs, chest — any legal surface. Count consecutive touches before it hits the ground.',
      },
      {
        id: 'wed-1v1',
        name: '1v1 Moves vs Cone',
        prescription: '12 reps, full speed',
        metric: null,
        howTo: 'Treat a cone as a defender. Approach at speed, execute a move (cut inside, Cruyff turn, step-over) to "beat" the cone, accelerate away after.',
      },
    ],
  },

  friday: {
    title: 'EXPLOSIVE + POSITION-SPECIFIC',
    subtitle: 'Power + winger skills',
    drills: [
      {
        id: 'fri-broad',
        name: 'Broad Jumps',
        prescription: '6 reps',
        metric: { id: 'broad-jump-best', label: 'Best jump (cm)', unit: 'cm', lowerBetter: false },
        howTo: 'From a standing start, swing the arms back then explosively jump forward for max distance, land soft on both feet without falling forward. Measure heel-to-takeoff-line distance.',
      },
      {
        id: 'fri-bounds',
        name: 'Single-Leg Bounds',
        prescription: '6 reps each side',
        metric: null,
        howTo: 'Push off one leg for horizontal distance, land on the same leg, immediately rebound into the next jump. Focus on distance and a soft, controlled landing, not speed.',
      },
      {
        id: 'fri-cutshoot',
        name: 'Cut Inside + Shoot/Cross',
        prescription: '10 reps',
        metric: { id: 'cut-shoot-success', label: 'Successes (out of 10)', unit: '/10', lowerBetter: false },
        howTo: "Start wide, receive a ball (rolled or self-passed), take a touch to cut inside at speed past a cone \"defender,\" then either shoot or deliver a cross depending on which drill variant is set up that day.",
      },
      {
        id: 'fri-weave',
        name: 'Outside-Foot Cone Weave at Speed',
        prescription: '30s × 3',
        metric: null,
        howTo: "Weave through cones using only the outside of the foot to change direction — the signature winger's touch for cutting away from a defender at full speed.",
      },
    ],
  },

  saturday: {
    title: 'SPEED-TOUCHES COMBO',
    subtitle: 'Technical quality under fatigue — match realism',
    drills: [
      {
        id: 'sat-sprints',
        name: 'Repeated Sprints',
        prescription: '8 × 10m, 20s rest',
        metric: null,
        howTo: 'Sprint 10m at max effort, walk back to the start within the 20s rest window, repeat. This is the conditioning for the day — short, sharp, and football-realistic rather than steady-state running.',
      },
      {
        id: 'sat-sprintfinish',
        name: 'Sprint 10m + First-Touch Finish',
        prescription: '6 reps',
        metric: { id: 'sprint-finish-success', label: 'Successes (out of 6)', unit: '/6', lowerBetter: false },
        howTo: 'Sprint to a target zone, receive a rolled or thrown ball, take one controlling touch to set up the shot, then finish in one more touch.',
      },
      {
        id: 'sat-touchesfatigue',
        name: 'Touches Under Fatigue',
        prescription: '30s immediately after sprints',
        metric: { id: 'touches-fatigue-count', label: 'Touches in 30s', unit: 'touches/30s', lowerBetter: false },
        howTo: 'Immediately after the sprint set above, go straight into 30 seconds of ball mastery (toe taps or similar) while still breathing hard — the point is testing whether the touch holds up tired.',
      },
      {
        id: 'sat-cutback',
        name: 'Cutback Finishing',
        prescription: '10 reps',
        metric: { id: 'cutback-success', label: 'Goals/finishes (out of 10)', unit: '/10', lowerBetter: false },
        howTo: 'Make a checking run away from the "defender" cone, then cut back toward goal and finish first-time off the cutback pass.',
      },
      {
        id: 'sat-cooldown',
        name: 'Cooldown Stretch',
        prescription: '5 min',
        metric: null,
        howTo: 'Static holds 30s each — hip flexors, hamstrings, quads, calves.',
      },
    ],
  },
};

/* Flat list of all trackable metrics across all days */
const ALL_METRICS = Object.entries(PROGRAM).flatMap(([dayKey, day]) =>
  day.drills.filter(d => d.metric).map(d => ({
    ...d.metric,
    drillId: d.id,
    drillName: d.name,
    dayKey,
  }))
);

/* --- Utility functions --- */

function getCurrentWeekInfo(today = new Date()) {
  if (today < BLOCK_START || today > BLOCK_END) return null;
  const week = Math.min(Math.floor((today - BLOCK_START) / (7 * 86400000)) + 1, 7);
  const phase = PHASES.find(p => p.weeks.includes(week));
  return { week, phase };
}

function getTodayTrainingDay() {
  return JS_TO_DAY[new Date().getDay()] || null;
}

/* Returns the date (this Mon-Sat week) for a given training day name */
function getWeekDate(dayName) {
  const offsetFromMon = { monday: 0, tuesday: 1, wednesday: 2, friday: 4, saturday: 5 };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jsDay = today.getDay();
  const daysSinceMonday = jsDay === 0 ? 6 : jsDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);
  const result = new Date(monday);
  result.setDate(monday.getDate() + offsetFromMon[dayName]);
  return result;
}

/* Count consecutive training days completed, going back from today */
function calculateStreak() {
  const trainSet = new Set([1, 2, 3, 5, 6]);
  let streak = 0;
  const check = new Date();
  check.setHours(0, 0, 0, 0);
  for (let i = 0; i < 120; i++) {
    if (trainSet.has(check.getDay())) {
      const dateStr = check.toISOString().split('T')[0];
      const s = storage.getSession(dateStr);
      if (s && s.completed) {
        streak++;
      } else if (check < new Date(new Date().setHours(0,0,0,0))) {
        break; // missed a past scheduled day
      }
    }
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

/* Derive metric history from saved sessions (avoids dual-write) */
function getMetricHistory(metricId, drillId, dayKey) {
  return storage.listSessionDates()
    .map(d => storage.getSession(d))
    .filter(s => s && s.day === dayKey && s.drills && s.drills[drillId])
    .filter(s => s.drills[drillId].metric != null && s.drills[drillId].metric !== '')
    .map(s => ({ date: s.date, value: parseFloat(s.drills[drillId].metric) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
