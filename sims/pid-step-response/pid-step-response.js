// PID Step Response - p5.js MicroSim
// CANVAS_HEIGHT: 635
// Learning objective (Understand, infer): infer which gain change fixes a given step response (raise Kp, add Kd,
// add Ki, lower Ki, or no change) in five scenarios, with at least 4 of 5 correct on the first attempt.
// Evidence: the change chosen and committed with Check for each scenario. Moving the sliders in Explore mode is
// exploration, not evidence.
// Model: the toy joint of the Chapter 5 lab (armlab/joint.py). Unit inertia, friction 4, goal 90 degrees, time step
// 0.01 s for 8 seconds. Each step: error = goal - angle; sum += error * dt; torque = Kp * error + Ki * sum - Kd * speed;
// speed += (torque - 4 * speed - gravity) * dt; angle += speed * dt. The units are made up (illustrative).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 480;
let controlHeight = 155;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the model
const GOAL = 90, FRICTION = 4, DT = 0.01, STEPS = 800;       // 8 seconds
const BAND = 0.02;                                           // settled means within 2 percent of the goal
const GRAVITY_ON = 200;
const Y_MAX = 150;                                           // top of the plot, degrees

// adjustable quantities (the spec's Content table)
const KP_MIN = 0, KP_MAX = 100, KP_STEP = 5, KP_DEFAULT = 40;
const KI_MIN = 0, KI_MAX = 300, KI_STEP = 10, KI_DEFAULT = 0;
const KD_MIN = 0, KD_MAX = 30, KD_STEP = 1, KD_DEFAULT = 0;

const CHANGES = ['Raise Kp', 'Add Kd', 'Add Ki', 'Lower Ki', 'No change'];

// the five scenarios, in fixed order. best is the answer key.
const SCENARIOS = [
  { kp: 5, ki: 0, kd: 0, gravity: 0, best: 'Raise Kp', why: 'The response is correct but sluggish, and a higher Kp pushes harder.' },
  { kp: 40, ki: 0, kd: 0, gravity: 0, best: 'Add Kd', why: 'The joint arrives with speed and overshoots, and Kd brakes it.' },
  { kp: 40, ki: 0, kd: 10, gravity: 200, best: 'Add Ki', why: 'Gravity leaves a steady error of 5 degrees, which the integral term removes.' },
  { kp: 40, ki: 200, kd: 10, gravity: 200, best: 'Lower Ki', why: 'The integral has wound up and overshoots, so a smaller Ki is gentler.' },
  { kp: 40, ki: 0, kd: 10, gravity: 0, best: 'No change', why: 'Fast, no overshoot and no steady error. Leave it alone.' }
];
const MASTERY = 4;

const COL_BEFORE = '#8a8a8a', COL_AFTER = '#1f6fb5', COL_YOURS = '#c0392b';

// controls
let modeSelect, actionBtn, kpSlider, kiSlider, kdSlider, gravityBox, changeBtns = [];

// state
let mode = 'explore';          // 'explore' or 'scenarios'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, chosen = -1;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Five scenarios', 'scenarios');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  kpSlider = createSlider(KP_MIN, KP_MAX, KP_DEFAULT, KP_STEP);
  kiSlider = createSlider(KI_MIN, KI_MAX, KI_DEFAULT, KI_STEP);
  kdSlider = createSlider(KD_MIN, KD_MAX, KD_DEFAULT, KD_STEP);
  gravityBox = createCheckbox(' Gravity (200)', false);

  CHANGES.forEach((name, i) => {
    const b = createButton(name);
    b.mouseClicked(() => choose(i));
    changeBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A plot of a joint angle against time as the joint moves from 0 toward a goal of 90 degrees. A green band ' +
    'marks 2 percent around the goal. Sliders set the gains Kp, Ki and Kd, and a checkbox adds gravity. The overshoot, ' +
    'the settling time and the final angle are shown. A second mode shows five responses and asks which gain change fixes each.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
// Returns the joint angle at every time step, starting from rest at 0 degrees.
function simulate(g) {
  let angle = 0, speed = 0, errorSum = 0;
  const history = [];
  for (let i = 0; i < STEPS; i++) {
    const error = GOAL - angle;
    errorSum += error * DT;
    const torque = g.kp * error + g.ki * errorSum - g.kd * speed;
    speed += (torque - FRICTION * speed - g.gravity) * DT;
    angle += speed * DT;
    history.push(angle);
  }
  return history;
}

// Overshoot in percent, settling time in seconds (null means never) and the final angle.
function measure(history) {
  const overshoot = Math.max(0, (Math.max(...history) - GOAL) / GOAL * 100);
  let settle = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (Math.abs(history[i] - GOAL) > BAND * GOAL) { settle = (i === history.length - 1) ? null : (i + 1) * DT; break; }
  }
  const dev = (a, b) => Math.max(...history.slice(a, b).map(v => Math.abs(v - GOAL)));
  const tail = history.slice(600, 800);
  const swings = Math.max(...tail) > GOAL && Math.min(...tail) < GOAL;       // still crossing the goal
  const growing = settle === null && swings && dev(600, 800) > dev(400, 600) * 1.02 && dev(600, 800) > 20;
  return { overshoot, settle, final: history[history.length - 1], growing };
}

function metricsText(m) {
  const final = Math.abs(m.final) < 0.05 ? 0 : m.final;
  return 'Overshoot ' + m.overshoot.toFixed(1) + '%, ' + (m.settle === null ? 'never settles' : 'settles in ' + m.settle.toFixed(2) + ' s') +
    ', final angle ' + final.toFixed(1);
}

function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

function gainsText(g) { return 'Kp ' + g.kp + ', Ki ' + g.ki + ', Kd ' + g.kd + ', gravity ' + g.gravity; }

// What each of the five changes does to a set of gains.
function applyChange(g, change) {
  const out = { kp: g.kp, ki: g.ki, kd: g.kd, gravity: g.gravity };
  if (change === 'Raise Kp') out.kp = g.kp < 40 ? 40 : g.kp * 2;
  if (change === 'Add Kd') out.kd = g.kd + 10;
  if (change === 'Add Ki') out.ki = g.ki + 100;
  if (change === 'Lower Ki') out.ki = g.ki / 4;
  return out;
}

function changeText(before, after) {
  const parts = [];
  if (after.kp !== before.kp) parts.push('Kp ' + before.kp + ' to ' + after.kp);
  if (after.ki !== before.ki) parts.push('Ki ' + before.ki + ' to ' + after.ki);
  if (after.kd !== before.kd) parts.push('Kd ' + before.kd + ' to ' + after.kd);
  return parts.length ? parts.join(', ') : 'nothing changes';
}

function exploreGains() {
  return { kp: kpSlider.value(), ki: kiSlider.value(), kd: kdSlider.value(), gravity: gravityBox.checked() ? GRAVITY_ON : 0 };
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('PID Step Response', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawScenarios();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const g = exploreGains(), h = simulate(g), m = measure(h);
  txt(narrow ? 'A toy joint moves from 0 to 90 degrees' : 'A toy joint moves from 0 to a goal of 90 degrees', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true, canvasWidth - 16);
  const bottom = drawPlot([{ history: h, col: COL_AFTER, weight: 3 }], null);
  const line = panel(bottom, drawHeight - bottom - 8);
  line(m.growing ? 'Unstable: the swings keep growing and never settle.' : metricsText(m), m.growing ? 'firebrick' : 'black', 16, true);
  let advice;
  if (m.growing) advice = 'Too much Ki with too little braking makes each swing bigger than the last. Lower Ki or add Kd.';
  else if (m.final < GOAL * (1 - BAND) && m.settle === null) {
    advice = g.kp === 0 && g.ki === 0 ? (g.gravity ? 'Gravity pulls the joint down and nothing pushes back. Raise Kp.' : 'Nothing pushes the joint toward the goal. Raise Kp.')
      : 'The joint stops ' + (GOAL - m.final).toFixed(1) + ' degrees short. Gravity leaves a gap that only Ki can close.';
  } else if (m.overshoot > 2) advice = 'It overshoots. Kd brakes the joint as it speeds up, and too much Ki adds overshoot.';
  else if (m.settle !== null && m.settle > 1.5) advice = 'No overshoot, but it is slow. A higher Kp pushes harder.';
  else advice = 'Fast and calm: no overshoot and no steady error.';
  line(advice, 'black', 16, false);
  line('Made-up units (illustrative). The green band is 2 percent around the goal.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Five scenarios
// ---------------------------------------------------------------------------
function drawScenarios() {
  const score = 'Correct: ' + correctCount + ' of ' + SCENARIOS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 210);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + SCENARIOS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + SCENARIOS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: P pushes toward the goal, D brakes the push, and I keeps pushing until the last bit of error is gone.', 'black', 16, false);
    return;
  }
  const s = SCENARIOS[idx], before = simulate(s);
  txt('Scenario ' + (idx + 1) + ' of ' + SCENARIOS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  if (phase === 'ask') {
    const bottom = drawPlot([{ history: before, col: COL_AFTER, weight: 3 }], null);
    const line = panel(bottom, drawHeight - bottom - 8);
    line(gainsText(s), 'black', 16, true);
    line(metricsText(measure(before)), 'black', 16, false);
    line('Which change would fix this response? Choose one, then press Check. You get one try for each scenario.', 'dimgray', 16, false);
    return;
  }
  const best = applyChange(s, s.best), after = simulate(best);
  const curves = [{ history: before, col: COL_BEFORE, weight: 2 }];
  const legend = [['before', COL_BEFORE]];
  let yours = null;
  if (!lastRight) {
    yours = applyChange(s, CHANGES[chosen]);
    curves.push({ history: simulate(yours), col: COL_YOURS, weight: 2 });
    legend.push(['your change', COL_YOURS]);
  }
  curves.push({ history: after, col: COL_AFTER, weight: 3 });
  legend.push([s.best === 'No change' ? 'no change' : 'best change', COL_AFTER]);
  const bottom = drawPlot(curves, legend);
  const line = panel(bottom, drawHeight - bottom - 8);
  const msg = lastRight ? 'Correct: ' + s.best + '. ' + s.why : 'Not quite. The best change is ' + s.best + '. ' + s.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true);
  line(s.best + ' (' + changeText(s, best) + '): ' + lower(metricsText(measure(after))) + '.', COL_AFTER, 16, false);
  if (yours) line(CHANGES[chosen] + ' (' + changeText(s, yours) + '): ' + lower(metricsText(measure(simulate(yours)))) + '.', COL_YOURS, 16, false);
}

// ---------------------------------------------------------------------------
// The plot of angle against time. Returns the y where the text below it can start.
// ---------------------------------------------------------------------------
function drawPlot(curves, legend) {
  const px = 44, pw = canvasWidth - px - 16, py = 84, ph = narrow ? 150 : 180;
  const toX = (i) => px + (i + 1) / STEPS * pw;
  const toY = (deg) => py + ph - deg / Y_MAX * ph;

  if (!(legend && narrow)) txt('Angle (degrees)', 8, py - 12, 'black', LEFT, CENTER, 16, false);
  fill('white'); stroke(120); strokeWeight(1);
  rect(px, py, pw, ph);
  // the 2 percent band and the goal line
  fill(46, 139, 87, 70); noStroke();
  rect(px, toY(GOAL * (1 + BAND)), pw, toY(GOAL * (1 - BAND)) - toY(GOAL * (1 + BAND)));
  stroke(46, 139, 87); strokeWeight(1);
  line(px, toY(GOAL), px + pw, toY(GOAL));
  // grid and tick labels
  for (const deg of [0, 45, 90, 135]) {
    stroke(225); strokeWeight(1);
    if (deg !== GOAL && deg !== 0) line(px, toY(deg), px + pw, toY(deg));
    txt(String(deg), px - 6, toY(deg), deg === GOAL ? 'darkgreen' : 'black', RIGHT, CENTER, 16, deg === GOAL);
  }
  for (let t = 0; t <= 8; t += 2) {
    const x = px + t / 8 * pw;
    stroke(225); strokeWeight(1);
    if (t > 0 && t < 8) line(x, py, x, py + ph);
    txt(String(t), x, py + ph + 12, 'black', CENTER, CENTER, 16, false);
  }
  txt('Time (seconds)', px + pw / 2, py + ph + 32, 'black', CENTER, CENTER, 16, false);

  // the curves, clipped to the plot
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(px, py, pw, ph);
  drawingContext.clip();
  for (const c of curves) {
    noFill(); stroke(c.col); strokeWeight(c.weight);
    beginShape();
    vertex(px, toY(0));
    for (let i = 0; i < STEPS; i += 2) vertex(toX(i), toY(constrain(c.history[i], -50, Y_MAX + 50)));
    endShape();
  }
  drawingContext.restore();
  noFill(); stroke(120); strokeWeight(1);
  rect(px, py, pw, ph);

  if (legend) {
    // the legend sits above the plot, right-aligned
    let x = px + pw;
    for (let k = legend.length - 1; k >= 0; k--) {
      textSize(16); textStyle(NORMAL);
      const w = textWidth(legend[k][0]);
      txt(legend[k][0], x, py - 12, 'black', RIGHT, CENTER, 16, false);
      stroke(legend[k][1]); strokeWeight(3);
      line(x - w - 24, py - 12, x - w - 6, py - 12);
      x -= w + 36;
    }
  }
  return py + ph + 48;
}

// ---------------------------------------------------------------------------
// Text layout
// ---------------------------------------------------------------------------
// Draws a rounded panel and returns a function that writes one word-wrapped paragraph into it.
function panel(top, h) {
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  return (s, col, size, bold) => { y += para(s, x + 10, y, w - 20, col, size || 16, bold) + 5; };
}

// Draws word-wrapped text and returns its height, so that nothing overflows on a narrow screen.
function para(s, x, y, w, col, size, bold) {
  textSize(size); textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let cur = '';
  for (const word of String(s).split(' ')) {
    const t = cur ? cur + ' ' + word : word;
    if (cur && textWidth(t) > w) { lines.push(cur); cur = word; } else cur = t;
  }
  lines.push(cur);
  const lead = Math.round(size * 1.3);
  noStroke(); fill(col || 'black'); textAlign(LEFT, TOP);
  lines.forEach((ln, i) => text(ln, x, y + i * lead));
  textStyle(NORMAL);
  return lines.length * lead;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW_STEP = 36;
const LABEL_W = 80;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  gravityBox.position(narrow ? 156 : 200, drawHeight + ROW1 + 2);
  const sliderW = Math.max(60, canvasWidth - LABEL_W - 20);
  [kpSlider, kiSlider, kdSlider].forEach((s, i) => { s.position(LABEL_W, drawHeight + ROW2 + i * ROW_STEP); s.size(sliderW); });
  const perRow = narrow ? 3 : 5, gap = 8;
  const w = (canvasWidth - 20 - gap * (perRow - 1)) / perRow;
  changeBtns.forEach((b, i) => {
    b.position(10 + (i % perRow) * (w + gap), drawHeight + ROW2 + 2 + Math.floor(i / perRow) * 40);
    b.size(w, 32);
  });
}

function drawControlLabels() {
  if (mode !== 'explore') return;
  txt('Kp: ' + kpSlider.value(), 10, drawHeight + ROW2 + 11, 'black');
  txt('Ki: ' + kiSlider.value(), 10, drawHeight + ROW2 + ROW_STEP + 11, 'black');
  txt('Kd: ' + kdSlider.value(), 10, drawHeight + ROW2 + 2 * ROW_STEP + 11, 'black');
}

function choose(i) {
  if (mode !== 'scenarios' || phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  if (m === 'scenarios') startScenarios();
  refreshControls();
}

function startScenarios() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const explore = mode === 'explore';
  for (const c of [kpSlider, kiSlider, kdSlider, gravityBox]) { if (explore) c.show(); else c.hide(); }
  const quiz = !explore && phase !== 'done';
  changeBtns.forEach((b, i) => {
    if (!quiz) { b.hide(); return; }
    b.show();
    let bg = '', weight = 'normal';
    if (phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (CHANGES[i] === SCENARIOS[idx].best) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === SCENARIOS.length - 1 ? 'See score' : 'Next scenario');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'scenarios') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = CHANGES[chosen] === SCENARIOS[idx].best;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < SCENARIOS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startScenarios();
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
function txt(str, x, y, col, hAlign, vAlign, size, bold, w) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  if (w && textWidth(str) > w) textSize((size || defaultTextSize) * w / textWidth(str));
  text(str, x, y);
  textStyle(NORMAL);
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
