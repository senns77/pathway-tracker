/* bridge.js — bridge week data, rest/competition dates, focus areas, bonus drills */

const BRIDGE_WEEK = {
  '2026-06-30': {
    title: 'TECHNICAL / TOUCHES',
    subtitle: 'Staying sharp — lighter volume than off-season',
    drills: [
      { id: 'bw0630-toetaps', name: 'Toe Taps', prescription: '30s × 3', metric: null,
        howTo: 'Ball stationary, alternate tapping the top of the ball with the sole of each foot as fast as possible while staying balanced. Light, quick contact.' },
      { id: 'bw0630-weakfoot', name: 'Weak-Foot Only Cone Course', prescription: '30s × 3', metric: null,
        howTo: 'Set up 4-5 cones in a line or zigzag. Dribble through using ONLY the weaker foot — both inside and outside of that foot.' },
      { id: 'bw0630-juggles', name: 'Max Juggles', prescription: '2 attempts', metric: null,
        howTo: 'Keep the ball off the ground using feet, thighs, chest. Count consecutive touches before it hits the ground.' },
    ],
  },
  '2026-07-01': {
    title: 'SPEED / AGILITY',
    subtitle: 'Short and crisp — quality over quantity',
    drills: [
      { id: 'bw0701-ladder', name: 'Agility Ladder', prescription: '2 patterns × 2 each', metric: null,
        howTo: 'In-in-out-out and lateral two-foot shuffle only. Stay on the balls of the feet, eyes up.' },
      { id: 'bw0701-flying', name: 'Flying 10m Sprint', prescription: '× 4, full recovery', metric: null,
        howTo: 'Build up to top speed over ~15m, time only the 10m flying zone. Quality over quantity this week — 4 reps, not 6.' },
    ],
  },
  '2026-07-02': {
    title: 'POSITION-SPECIFIC FINISHING',
    subtitle: 'Game-realistic tempo',
    drills: [
      { id: 'bw0702-cutshoot', name: 'Cut Inside + Shoot/Cross', prescription: '8 reps', metric: null,
        howTo: 'Receive wide, beat a cone at speed, deliver a shot or cross. Game-realistic tempo.' },
      { id: 'bw0702-cutback', name: 'Cutback Finishing', prescription: '8 reps', metric: null,
        howTo: 'Checking run away from the cone "defender," cut back toward goal, finish first-time.' },
    ],
  },
  '2026-07-03': {
    title: 'LIGHT MOBILITY / BODYWEIGHT ONLY',
    subtitle: 'Recovery-adjacent — no new stimulus this close to competition',
    drills: [
      { id: 'bw0703-lunges', name: 'Bodyweight Single-Leg Lunges', prescription: '2 sets × 6 each leg, easy effort', metric: null,
        howTo: 'Step forward into a lunge, back knee taps lightly, return. No added weight this week.' },
      { id: 'bw0703-plank', name: 'Plank', prescription: '2 sets × 20s', metric: null,
        howTo: 'Straight line head to heel, no sagging hips.' },
      { id: 'bw0703-stretch', name: 'Full-Body Stretch', prescription: '10 min', metric: null,
        howTo: 'Static holds, 30s each: hamstrings, hip flexors, quads, calves, shoulders.' },
    ],
  },
  '2026-07-04': {
    title: 'SPEED SHARPENING + TECHNICAL',
    subtitle: 'Small-sided movement quality',
    drills: [
      { id: 'bw0704-starts', name: 'Sprint Starts', prescription: '3 reps × 10m', metric: null,
        howTo: 'From a 3-point stance, drive low for the first 3-5 steps before standing to full sprint posture.' },
      { id: 'bw0704-1v1', name: '1v1 Moves vs Cone', prescription: '8 reps', metric: null,
        howTo: 'Approach a cone "defender" at speed, execute a move (cut inside, Cruyff, step-over), accelerate away.' },
    ],
  },
  '2026-07-05': {
    title: 'EASY BALL MASTERY + MOBILITY',
    subtitle: 'Lowest load of the week — arrive at provincials fresh',
    drills: [
      { id: 'bw0705-toetaps', name: 'Toe Taps', prescription: '30s × 2, easy pace', metric: null,
        howTo: 'Same as June 30 — lower intensity, just keeping the feet alive.' },
      { id: 'bw0705-weave', name: 'Outside-Foot Cone Weave', prescription: '30s × 2, easy pace', metric: null,
        howTo: 'Weave through cones using only the outside of the foot.' },
      { id: 'bw0705-stretch', name: 'Light Stretch', prescription: '10 min', metric: null,
        howTo: 'Easy static holds — hip flexors, hamstrings, quads, calves.' },
    ],
  },
};

const REST_DAYS = new Set(['2026-07-06', '2026-07-07']);

/* ---- Focus areas ---- */
const FOCUS_AREAS = [
  { id: 'acceleration', label: 'Acceleration / first step' },
  { id: 'top-speed',   label: 'Top speed' },
  { id: 'weak-foot',   label: 'Weak foot' },
  { id: '1v1',         label: '1v1 moves / beating a defender' },
  { id: 'first-touch', label: 'First touch' },
  { id: 'finishing',   label: 'Finishing' },
  { id: 'strength',    label: 'Strength / durability' },
];

/* ---- Bonus drills library (sourced from published coaching methodology) ---- */
const BONUS_DRILLS = {
  'acceleration': [
    { name: 'Half-Kneeling Start', prescription: '4 reps each leg',
      howTo: 'One knee down, one knee up. Drive forward off the front leg into a sprint, focusing on a powerful, patient extension rather than popping straight up. Reflects coaching consensus that the first 3 steps decide most football duels.' },
    { name: 'Wall Drill', prescription: '10-15 sec',
      howTo: 'Hands on a wall, lean forward ~45°, drive knees up explosively one at a time, focusing on posture and ground force, not speed of the drill itself.' },
  ],
  'top-speed': null,
  'weak-foot': [
    { name: 'Coerver Weak-Foot Rondo', prescription: '50 touches',
      howTo: 'With a partner or against a wall, pass and receive using ONLY the weak foot for a full set (50 touches), both inside and outside of the foot.' },
  ],
  '1v1': [
    { name: 'Attack-the-Weak-Foot 1v1', prescription: '10 reps, vary the move',
      howTo: "Set up a 'defender' cone slightly favouring one side. Practice deliberately attacking that side at speed, varying the move used (cut inside, Matthews move — push the ball to the defender's standing foot, then push past on the outside) to become unpredictable, since predictability is what gets wingers shut down at higher levels." },
  ],
  'first-touch': [
    { name: 'Receive on the Half-Turn', prescription: '20 reps',
      howTo: 'Have a parent or wall pass the ball at varying speeds/angles; practice taking the first touch already turned toward goal rather than square-on — this is the touch that creates the half-second advantage wingers rely on.' },
  ],
  'finishing': [
    { name: 'Near-Post vs Far-Post Decision Drill', prescription: '10 reps, alternate targets',
      howTo: 'From a wide cutback or cross scenario, alternate finishing near-post and far-post on purpose, so the choice becomes instinctive rather than habitual — predictable finishing patterns get read by goalkeepers at higher levels.' },
  ],
  'strength': null,
};

/* ---- Date-mode helpers ---- */

/* Priority: bridge → rest → competition → block → outside */
function getDayMode(dateStr) {
  if (BRIDGE_WEEK[dateStr]) return 'bridge';
  if (REST_DAYS.has(dateStr)) return 'rest';
  if (dateStr >= '2026-07-08' && dateStr <= '2026-07-12') return 'competition';
  const d = new Date(dateStr + 'T12:00:00');
  if (d >= BLOCK_START && d <= BLOCK_END) return 'block';
  return 'outside';
}

/* Return first bonus drill matching any of the player's focusAreas */
function getBonusDrill(focusAreas) {
  if (!focusAreas || !focusAreas.length) return null;
  for (const fa of focusAreas) {
    const drills = BONUS_DRILLS[fa];
    if (drills && drills.length) return drills[0];
  }
  return null;
}
