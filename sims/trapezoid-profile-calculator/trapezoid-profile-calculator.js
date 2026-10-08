// Trapezoid Profile Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 640
// Learning objective (Apply, calculate): calculate the acceleration time, cruise time, total time and peak speed of
// a joint move under a trapezoidal velocity profile, for six problems, to within the tolerance shown, with at
// least 5 of 6 correct on the first attempt. Evidence: the number committed with Check in each problem. Explore
// mode is exploration, not evidence.
// Rules (Chapter 11, "Velocity Profiles and the Acceleration Limit"), for a distance D, a speed limit v and an
// acceleration limit a:
//   if D >= v^2 / a the profile is a trapezoid: t_accel = v / a, t_cruise = (D - v x t_accel) / v,
//                                               T = 2 x t_accel + t_cruise, peak speed = v
//   otherwise it is a triangle:                 t_accel = sqrt(D / a), t_cruise = 0, T = 2 x t_accel,
//                                               peak speed = a x t_accel
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 480;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

// adjustable quantities (the chapter's Content table)
const D_MIN = 5, D_MAX = 180, D_STEP = 5, D_DEFAULT = 90;             // degrees
const V_MIN = 10, V_MAX = 120, V_STEP = 10, V_DEFAULT = 60;           // degrees per second
const A_MIN = 20, A_MAX = 400, A_STEP = 20, A_DEFAULT = 120;          // degrees per second squared

// six problems in fixed order (illustrative values). ask says which result of the profile is wanted.
const PROBLEMS = [
  { text: 'D = 90 degrees, v = 60 deg/s, a = 120 deg/s². What is the total time?', D: 90, v: 60, a: 120, ask: 'T',
    unit: 'seconds', answer: 2.00, tol: 0.01, digits: 2,
    why: '90 ≥ 30, so it is a trapezoid: T = 90 / 60 + 60 / 120 = 2.00 s.' },
  { text: 'The same move (D = 90, v = 60, a = 120). How long is the speed-up?', D: 90, v: 60, a: 120, ask: 'ta',
    unit: 'seconds', answer: 0.50, tol: 0.01, digits: 2,
    why: 't_accel = 60 / 120 = 0.50 s.' },
  { text: 'The same move (D = 90, v = 60, a = 120). How long is the cruise?', D: 90, v: 60, a: 120, ask: 'tc',
    unit: 'seconds', answer: 1.00, tol: 0.01, digits: 2,
    why: 't_cruise = (90 − 60 × 0.5) / 60 = 1.00 s.' },
  { text: 'D = 20 degrees, v = 60 deg/s, a = 120 deg/s². What is the total time?', D: 20, v: 60, a: 120, ask: 'T',
    unit: 'seconds', answer: 0.82, tol: 0.01, digits: 2,
    why: '20 < 30, so it is a triangle: t_accel = √(20 / 120) = 0.408 s and T = 0.82 s.' },
  { text: 'The same move (D = 20, v = 60, a = 120). What is the peak speed?', D: 20, v: 60, a: 120, ask: 'peak',
    unit: 'deg/s', answer: 49.0, tol: 0.1, digits: 1,
    why: 'The peak is 120 × 0.408 = 49.0 deg/s, below the 60 deg/s limit.' },
  { text: 'D = 60 degrees, v = 30 deg/s, a = 60 deg/s². What is the total time?', D: 60, v: 30, a: 60, ask: 'T',
    unit: 'seconds', answer: 2.50, tol: 0.01, digits: 2,
    why: '60 ≥ 15, so it is a trapezoid: T = 60 / 30 + 30 / 60 = 2.50 s.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, dSlider, vSlider, aSlider, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, lastTyped = '';

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six problems', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  dSlider = createSlider(D_MIN, D_MAX, D_DEFAULT, D_STEP);
  vSlider = createSlider(V_MIN, V_MAX, V_DEFAULT, V_STEP);
  aSlider = createSlider(A_MIN, A_MAX, A_DEFAULT, A_STEP);

  answerInput = createInput('');
  answerInput.attribute('inputmode', 'decimal');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.input(refreshControls);
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A graph of the speed of one joint against time. The speed rises in a straight line, stays level at ' +
    'the speed limit, and falls in a straight line, which makes a trapezoid. A short move makes a triangle that ' +
    'never reaches the speed limit. Sliders set the distance, the speed limit and the acceleration limit. In the ' +
    'six problems you type a time or a peak speed and press Check.');
}

// ---------------------------------------------------------------------------
// The profile
// ---------------------------------------------------------------------------
function profile(D, v, a) {
  const limit = v * v / a;                          // the shortest distance that reaches the speed limit
  if (D >= limit) {
    const ta = v / a, tc = (D - v * ta) / v;
    return { D: D, v: v, a: a, limit: limit, trapezoid: true, ta: ta, tc: tc, T: 2 * ta + tc, peak: v };
  }
  const ta = Math.sqrt(D / a);
  return { D: D, v: v, a: a, limit: limit, trapezoid: false, ta: ta, tc: 0, T: 2 * ta, peak: a * ta };
}
function tidy(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }

// what the learner typed, as a number (or null): accepts a comma for the decimal point
function parseAnswer(s) {
  const t = String(s).trim().replace(',', '.').replace('−', '-');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}
function isCorrect(p, typed) { return Math.abs(typed - p.answer) <= p.tol + 1e-9; }

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Trapezoid Profile Calculator', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') {
    const k = profile(dSlider.value(), vSlider.value(), aSlider.value());
    drawGraph(k);
    drawWorking(k);
  } else if (phase === 'done') {
    drawDone();
  } else {
    const p = PROBLEMS[idx];
    if (phase === 'ask') drawRules(); else drawGraph(profile(p.D, p.v, p.a));
    drawProblem(p);
  }
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The graph of speed against time
// ---------------------------------------------------------------------------
const TIME_AXES = [[0.25, 0.05], [0.5, 0.1], [1, 0.25], [2, 0.5], [3, 1], [4, 1], [5, 1], [6, 2], [8, 2], [10, 2], [15, 5], [20, 5], [30, 10]];

function drawGraph(k) {
  const left = 46, right = canvasWidth - 14, top = 64, bottom = 222;
  const axis = TIME_AXES.find(t => t[0] >= k.T * 1.15) || TIME_AXES[TIME_AXES.length - 1];
  const tMax = axis[0], tStep = axis[1], sMax = 130;
  const X = t => left + (right - left) * t / tMax, Y = s => bottom - (bottom - top) * s / sMax;

  fill('white'); stroke('silver'); strokeWeight(1);
  rect(left, top, right - left, bottom - top);
  // grid and tick labels
  for (let s = 0; s <= 120; s += 30) {
    stroke('gainsboro'); strokeWeight(1); line(left, Y(s), right, Y(s));
    txt(String(s), left - 6, Y(s), 'black', RIGHT, CENTER, 16, false);
  }
  for (let i = 0; i * tStep <= tMax + 1e-9; i++) {
    const t = i * tStep;
    stroke('gainsboro'); strokeWeight(1); line(X(t), top, X(t), bottom);
    const last = (i + 1) * tStep > tMax + 1e-9;
    txt(String(Math.round(t * 100) / 100) + (last ? ' s' : ''), X(t), bottom + 4, 'black', i === 0 ? LEFT : last ? RIGHT : CENTER, TOP, 16, false);
  }
  txt('speed (deg/s) against time (s)', left - 38, top - 12, 'dimgray', LEFT, CENTER, 16, false);

  // the speed limit
  stroke('firebrick'); strokeWeight(2);
  for (let x = left; x < right; x += 12) line(x, Y(k.v), min(x + 7, right), Y(k.v));
  txt('speed limit ' + k.v, right - 4, Y(k.v) + (k.v > 100 ? 11 : -11), 'firebrick', RIGHT, CENTER, 16, false);

  // the profile
  fill(70, 130, 180, 70); stroke('navy'); strokeWeight(3);
  beginShape();
  vertex(X(0), Y(0)); vertex(X(k.ta), Y(k.peak)); vertex(X(k.ta + k.tc), Y(k.peak)); vertex(X(k.T), Y(0));
  endShape(CLOSE);
  // where the speed-up ends and the slow-down begins
  stroke('navy'); strokeWeight(1);
  for (const t of [k.ta, k.ta + k.tc]) for (let y = Y(k.peak); y < bottom; y += 8) line(X(t), y, X(t), min(y + 4, bottom));
  const mid = (X(0) + X(k.T)) / 2;
  txt(k.trapezoid ? 'trapezoid' : 'triangle', mid, (Y(k.peak) + bottom) / 2 + (k.trapezoid ? 0 : 14), 'navy', CENTER, CENTER, 16, true);
}

// the rules, shown in place of the graph while a problem is waiting for its answer
function drawRules() {
  const x = 8, w = canvasWidth - 16, top = 42, h = 204;
  fill('lightyellow'); stroke('goldenrod'); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  y = para('First test: is D ≥ v² / a ?', tx, y, tw, 'black', 16, true);
  y = para('Yes, a trapezoid:', tx, y + 4, tw, 'navy', 16, true);
  y = para('t_accel = v / a,  t_cruise = (D − v × t_accel) / v,  T = 2 × t_accel + t_cruise', tx + 8, y, tw - 8, 'black', 16, false);
  y = para('No, a triangle:', tx, y + 4, tw, 'navy', 16, true);
  y = para('t_accel = √(D / a),  T = 2 × t_accel,  peak speed = a × t_accel', tx + 8, y, tw - 8, 'black', 16, false);
  if (y > top + h - 2) layoutNotes.push('rules overflow by ' + Math.round(y - (top + h - 2)) + ' px');
}

// ---------------------------------------------------------------------------
// Panels under the graph
// ---------------------------------------------------------------------------
function panel() {
  const x = 8, w = canvasWidth - 16, top = 252, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  return { tx: x + 10, tw: w - 20, y: top + 8, bottom: top + h - 2 };
}

function drawWorking(k) {
  const P = panel(), tx = P.tx, tw = P.tw;
  let y = P.y;
  const lim = tidy(k.limit);
  if (k.trapezoid) {
    y = para('Test: D ≥ v² / a ?  ' + k.D + ' ≥ ' + k.v + '² / ' + k.a + ' = ' + lim + '. Yes: a trapezoid.', tx, y, tw, 'navy', 16, true);
    y = para('Speed-up = v / a = ' + k.v + ' / ' + k.a + ' = ' + k.ta.toFixed(2) + ' s', tx, y + 4, tw, 'black', 16, false);
    y = para('Cruise = (D − v × speed-up) / v = (' + k.D + ' − ' + tidy(k.v * k.ta) + ') / ' + k.v + ' = ' + k.tc.toFixed(2) + ' s', tx, y + 4, tw, 'black', 16, false);
    y = para('Slow-down = ' + k.ta.toFixed(2) + ' s, the same as the speed-up', tx, y + 4, tw, 'black', 16, false);
    y = para('Total time T = ' + k.T.toFixed(2) + ' s.   Peak speed = ' + k.v + ' deg/s', tx, y + 4, tw, 'black', 16, true);
  } else {
    y = para('Test: D ≥ v² / a ?  ' + k.D + ' < ' + k.v + '² / ' + k.a + ' = ' + lim + '. No: a triangle.', tx, y, tw, 'navy', 16, true);
    y = para('Speed-up = √(D / a) = √(' + k.D + ' / ' + k.a + ') = ' + k.ta.toFixed(3) + ' s', tx, y + 4, tw, 'black', 16, false);
    y = para('Cruise = 0 s. The speed limit is never reached.', tx, y + 4, tw, 'black', 16, false);
    y = para('Slow-down = ' + k.ta.toFixed(3) + ' s, the same as the speed-up', tx, y + 4, tw, 'black', 16, false);
    y = para('Total time T = ' + k.T.toFixed(2) + ' s.   Peak speed = ' + k.a + ' × ' + k.ta.toFixed(3) + ' = ' + k.peak.toFixed(1) + ' deg/s', tx, y + 4, tw, 'black', 16, true);
  }
  if (y > P.bottom) layoutNotes.push('working panel overflow by ' + Math.round(y - P.bottom) + ' px');
}

function drawProblem(p) {
  const P = panel(), tx = P.tx, tw = P.tw;
  let y = P.y;
  y = para('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + ' (illustrative values)', tx, y, tw, 'black', 16, true);
  y = para(p.text, tx, y + 4, tw, 'black', narrow ? 16 : 18, false);
  if (phase === 'ask') {
    y = para('Answer in ' + p.unit + ', to within ' + p.tol + '. Type it below and press Check.', tx, y + 8, tw, 'navy', 16, true);
  } else {
    const val = p.answer.toFixed(p.digits) + ' ' + p.unit;
    y = para((lastRight ? 'Correct: ' + val + '. ' : 'Not quite. The answer is ' + val + '. ') + p.why, tx, y + 8, tw,
      lastRight ? 'darkgreen' : 'firebrick', 16, false);
    y = para('You typed ' + lastTyped + '.', tx, y + 4, tw, 'black', 16, false);
  }
  if (y > P.bottom) layoutNotes.push('problem panel overflow by ' + Math.round(y - P.bottom) + ' px');
}

function drawDone() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  const ok = correctCount >= MASTERY;
  y = para('Correct: ' + correctCount + ' of ' + PROBLEMS.length, tx, y, tw, 'black', 18, true);
  y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
    : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
  y = para('Always test D ≥ v² / a first. It tells you whether the move reaches the speed limit.', tx, y + 10, tw, 'black', 16, false);
  y = para('The time is more than the distance divided by the speed limit, because the speed-up and the slow-down add time.', tx, y + 6, tw, 'black', 16, false);
  y = para('A higher acceleration limit shortens the ramps. It does not change the cruise speed.', tx, y + 6, tw, 'black', 16, false);
  y = para('Switch to Explore to see the graph for your own numbers.', tx, y + 10, tw, 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const labelW = narrow ? 156 : 250;
  const sliderW = max(60, canvasWidth - labelW - 28);
  [dSlider, vSlider, aSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + [ROW2, ROW3, ROW4][i]);
    s.size(sliderW);
  });
  answerInput.position(120, drawHeight + ROW2);
  answerInput.size(narrow ? 100 : 130, 22);
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt((narrow ? 'Distance: ' : 'Distance D: ') + dSlider.value() + '°', 10, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'Speed: ' : 'Speed limit v: ') + vSlider.value() + ' deg/s', 10, drawHeight + ROW3 + 11, 'black');
    txt((narrow ? 'Accel: ' : 'Acceleration limit a: ') + aSlider.value() + ' deg/s²', 10, drawHeight + ROW4 + 11, 'black');
  } else if (phase !== 'done') {
    txt('Your answer:', 10, drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, true);
    txt(PROBLEMS[idx].unit, (narrow ? 232 : 262), drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, false);
    txt('Correct: ' + correctCount + ' of ' + PROBLEMS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask' && answerInput.value().trim() !== '' && parseAnswer(answerInput.value()) === null)
      txt('Type a number, such as 1.25', 10, drawHeight + ROW4 + 14, 'firebrick', LEFT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'problems') { idx = 0; phase = 'ask'; correctCount = 0; answerInput.value(''); }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [dSlider, vSlider, aSlider].forEach(c => explore ? c.show() : c.hide());
  if (!explore && phase !== 'done') answerInput.show(); else answerInput.hide();
  if (phase === 'ask') answerInput.removeAttribute('disabled'); else answerInput.attribute('disabled', '');
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'ask' ? 'Check' : phase === 'done' ? 'Try again' : idx === PROBLEMS.length - 1 ? 'See score' : 'Next problem');
  if (phase === 'ask' && parseAnswer(answerInput.value()) === null) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'problems') return;
  if (phase === 'ask') {
    const typed = parseAnswer(answerInput.value());
    if (typed === null) return;                       // not a number yet: the attempt is not used up
    lastTyped = answerInput.value().trim();
    lastRight = isCorrect(PROBLEMS[idx], typed);
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < PROBLEMS.length - 1) { idx++; phase = 'ask'; answerInput.value(''); } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; phase = 'ask'; answerInput.value('');
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
// One line of text. Notes a layout problem when the line would be cut off by the canvas edge.
function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const w = textWidth(str);
  const left = hAlign === CENTER ? x - w / 2 : hAlign === RIGHT ? x - w : x;
  if (left < 1 || left + w > canvasWidth - 1) layoutNotes.push('clipped: ' + str);
  text(str, x, y);
  textStyle(NORMAL);
}

// A word-wrapped paragraph that starts at (x, y) and is w wide. Returns the y just below its last line.
// With dry set, nothing is drawn, so the result is the height the paragraph would need when y is 0.
function para(str, x, y, w, col, size, bold, dry) {
  size = size || defaultTextSize;
  const lineH = Math.round(size * 1.32);
  noStroke();
  fill(col || 'black');
  textAlign(LEFT, TOP);
  textSize(size);
  textStyle(bold ? BOLD : NORMAL);
  let row = '';
  for (const word of String(str).split(' ')) {
    const trial = row ? row + ' ' + word : word;
    if (row && textWidth(trial) > w) { if (!dry) text(row, x, y); y += lineH; row = word; } else row = trial;
  }
  if (row) { if (!dry) text(row, x, y); y += lineH; }
  textStyle(NORMAL);
  return y;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  narrow = canvasWidth < 640;
}
