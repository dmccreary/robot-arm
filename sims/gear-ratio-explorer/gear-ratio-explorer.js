// Gear Ratio Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 660
// Learning objective (Apply, calculate): calculate the output speed or torque of a geared actuator, or the motor
// speed or torque behind it, from the gear ratio and efficiency, to within 2 percent, in five problems, with at
// least 4 of 5 correct on the first attempt.
// Evidence: the number typed and committed with Check in each problem. Explore mode is exploration, not evidence.
// Model: output speed = motor speed / N. Output torque = motor torque x N x (efficiency / 100).
// The gears turn in slow motion, and only while the pointer is over the sim. The Explore values are illustrative.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 190;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// adjustable quantities (the spec's Content table)
const N_MIN = 1, N_MAX = 400, N_STEP = 1, N_DEFAULT = 100;                      // gear ratio N : 1
const SPEED_MIN = 0, SPEED_MAX = 20000, SPEED_STEP = 100, SPEED_DEFAULT = 12000; // motor speed, rpm
const TORQUE_MIN = 0, TORQUE_MAX = 50, TORQUE_STEP = 1, TORQUE_DEFAULT = 10;     // motor torque, mN·m
const EFF_MIN = 20, EFF_MAX = 100, EFF_STEP = 5, EFF_DEFAULT = 60;               // efficiency, percent

// the five problems, in fixed order. correct is the spec's answer key in the unit asked.
// motor, box and output are the labels drawn on the picture, with "?" for the unknown.
const PROBLEMS = [
  { text: 'A motor turns at 12000 rpm through a 100 : 1 gearbox. What is the output speed?', unit: 'rpm', correct: 120,
    why: '12000 / 100 = 120 rpm.', motor: '12000 rpm', box: '100 : 1', eff: '', output: '? rpm' },
  { text: 'The STS3215’s output turns at 42 rpm through a 345 : 1 gearbox. How fast is the motor shaft?', unit: 'rpm', correct: 14490,
    why: '42 × 345 = 14490 rpm.', motor: '? rpm', box: '345 : 1', eff: '', output: '42 rpm' },
  { text: 'A motor makes 10 mN·m through a 100 : 1 gearbox at 60 percent efficiency. What is the output torque?', unit: 'N·m', correct: 0.6,
    why: '0.010 × 100 × 0.6 = 0.6 N·m.', motor: '10 mN·m', box: '100 : 1', eff: '60% efficient', output: '? N·m' },
  { text: 'An output needs 1.62 N·m through a 345 : 1 gearbox at 50 percent efficiency. What motor torque is needed?', unit: 'mN·m', correct: 9.39,
    why: '1.62 / (345 × 0.5) = 0.00939 N·m = 9.39 mN·m.', motor: '? mN·m', box: '345 : 1', eff: '50% efficient', output: '1.62 N·m' },
  { text: 'The same motor drives a 147 : 1 joint and a 345 : 1 joint. How many times faster is the 147 : 1 joint?', unit: 'times', correct: 2.35,
    why: '345 / 147 = 2.347 times faster, and it is that much weaker.', motor: 'same motor', box: '147 : 1', eff: 'or 345 : 1', output: '? times faster' }
];
const MASTERY = 4;
const TOLERANCE = 0.02;          // an answer within 2 percent is correct
const ANSWER_MIN = 0, ANSWER_MAX = 100000;

// controls
let modeSelect, actionBtn, nSlider, speedSlider, torqueSlider, effSlider, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, notice = '';
let motorTurns = 0, lastN = N_DEFAULT;
let pointerInside = false;
const canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // run the gears only while the pointer is over the sim (always on a touch screen)
  document.documentElement.addEventListener('mouseenter', () => { pointerInside = true; });
  document.documentElement.addEventListener('mouseleave', () => { pointerInside = false; });

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Problems', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  nSlider = createSlider(N_MIN, N_MAX, N_DEFAULT, N_STEP);
  speedSlider = createSlider(SPEED_MIN, SPEED_MAX, SPEED_DEFAULT, SPEED_STEP);
  torqueSlider = createSlider(TORQUE_MIN, TORQUE_MAX, TORQUE_DEFAULT, TORQUE_STEP);
  effSlider = createSlider(EFF_MIN, EFF_MAX, EFF_DEFAULT, EFF_STEP);

  answerInput = createInput('', 'number');
  answerInput.attribute('min', String(ANSWER_MIN));
  answerInput.attribute('max', String(ANSWER_MAX));
  answerInput.attribute('step', '0.01');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A small motor gear, a gearbox and a large output gear. The motor gear turns many times for each turn of ' +
    'the output gear. Sliders set the gear ratio, the motor speed, the motor torque and the efficiency, and the ' +
    'output speed and torque are shown. A Problems mode asks five gear calculations.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function outputSpeed(motorRpm, n) { return motorRpm / n; }                              // rpm
function outputTorque(motorMilliNm, n, effPercent) { return motorMilliNm / 1000 * n * effPercent / 100; }   // N·m
function fmt(x, digits) { return x.toLocaleString('en-US', { maximumFractionDigits: digits === undefined ? 2 : digits, useGrouping: false }); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Gear Ratio Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawProblems();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const n = nSlider.value(), rpm = speedSlider.value(), mNm = torqueSlider.value(), eff = effSlider.value();
  const outRpm = outputSpeed(rpm, n), outNm = outputTorque(mNm, n, eff);
  if (n !== lastN) { motorTurns = 0; lastN = n; }
  // slow motion: 12000 rpm is drawn as 1.5 turns per second
  if (pointerInside || !canHover) motorTurns += (rpm / 12000) * 1.5 * (deltaTime / 1000);

  const times = n + (n === 1 ? ' time' : ' times');
  txt(narrow ? 'Motor turns ' + times + ' per output turn' : 'The motor turns ' + times + ' for each turn of the output', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true, canvasWidth - 16);
  drawGearTrain(motorTurns, motorTurns / n,
    [fmt(rpm) + ' rpm', fmt(mNm) + ' mN·m'], [n + ' : 1', eff + '% efficient'], [fmt(outRpm) + ' rpm', fmt(outNm, 3) + ' N·m']);
  txt('Motor turns: ' + Math.floor(motorTurns) + '     Output turns: ' + fmt(motorTurns / n, 2) + (narrow ? '' : '     (slow motion)'),
    canvasWidth / 2, 250, 'dimgray', CENTER, TOP, 16, false);

  const line = panel(276, drawHeight - 284);
  if (narrow) {
    line('Speed: ' + fmt(rpm) + ' / ' + n + ' = ' + fmt(outRpm) + ' rpm', 'black', 16, true);
    line('Torque: ' + fmt(mNm / 1000, 3) + ' × ' + n + ' × ' + fmt(eff / 100) + ' = ' + fmt(outNm, 3) + ' N·m', 'black', 16, true);
  } else {
    line('Output speed = motor speed / N = ' + fmt(rpm) + ' / ' + n + ' = ' + fmt(outRpm) + ' rpm', 'black', 16, true);
    line('Output torque = motor torque × N × efficiency = ' + fmt(mNm / 1000, 3) + ' N·m × ' + n + ' × ' + fmt(eff / 100) + ' = ' + fmt(outNm, 3) + ' N·m', 'black', 16, true);
  }
  line('Raise N and the output gets slower and stronger by the same factor. Gears add no power: friction takes its share, and that is the efficiency.', 'black', 16, false);
  line('These values are illustrative.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Problems mode
// ---------------------------------------------------------------------------
function drawProblems() {
  const score = 'Correct: ' + correctCount + ' of ' + PROBLEMS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 210);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: speed goes down by N, and torque goes up by N times the efficiency. Check the unit before you type.', 'black', 16, false);
    return;
  }
  const q = PROBLEMS[idx], done = phase === 'feedback';
  const answer = fmt(q.correct) + ' ' + q.unit;
  txt('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const show = (s) => (done ? s.replace('? ' + q.unit, answer).replace('? times faster', answer + ' faster') : s);
  drawGearTrain(0, 0, [show(q.motor)], [q.box, q.eff], [show(q.output)]);

  const line = panel(246, drawHeight - 254);
  line(q.text, 'black', 16, true);
  if (!done) {
    line('Type your answer in ' + q.unit + ' and press Check. You get one try for each problem.', 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + answer + '. ' + q.why
    : 'Not quite. Speed goes down by N and torque goes up by N times the efficiency: ' + answer + '. ' + q.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, false);
}

// ---------------------------------------------------------------------------
// The picture: motor gear, gearbox, output gear
// ---------------------------------------------------------------------------
function drawGearTrain(motorAngleTurns, outputAngleTurns, motorLabels, boxLabels, outputLabels) {
  const cy = 146;
  const xm = narrow ? 58 : canvasWidth * 0.18, xo = canvasWidth - (narrow ? 70 : canvasWidth * 0.2);
  const xb = (xm + xo) / 2 - (narrow ? 6 : 0);
  const rm = narrow ? 22 : 26, ro = narrow ? 46 : 52, bw = narrow ? 122 : 150, bh = 64;

  // shafts
  stroke(90); strokeWeight(6);
  line(xm, cy, xb - bw / 2, cy);
  line(xb + bw / 2, cy, xo, cy);

  // gearbox
  fill('#e9ecef'); stroke(60); strokeWeight(2);
  rect(xb - bw / 2, cy - bh / 2, bw, bh, 8);
  txt(boxLabels[0], xb, cy - (boxLabels[1] ? 11 : 0), 'black', CENTER, CENTER, 18, true);
  if (boxLabels[1]) txt(boxLabels[1], xb, cy + 13, 'black', CENTER, CENTER, 16, false);

  drawGear(xm, cy, rm, 10, motorAngleTurns * TWO_PI, '#f4a259');
  drawGear(xo, cy, ro, 22, outputAngleTurns * TWO_PI, '#6c9bd1');

  txt('Motor', xm, cy - ro - 22, 'black', CENTER, CENTER, 16, true);
  txt('Gearbox', xb, cy - ro - 22, 'black', CENTER, CENTER, 16, true);
  txt('Output', xo, cy - ro - 22, 'black', CENTER, CENTER, 16, true);
  motorLabels.forEach((s, i) => txt(s, Math.max(xm, 8 + textWidthOf(s, 16) / 2), cy + ro + 16 + i * 21, 'black', CENTER, CENTER, 16, false));
  outputLabels.forEach((s, i) => txt(s, Math.min(xo, canvasWidth - 8 - textWidthOf(s, 16) / 2), cy + ro + 16 + i * 21, 'black', CENTER, CENTER, 16, false));
}

function textWidthOf(s, size) { textSize(size); textStyle(NORMAL); return textWidth(s); }

// A gear with square teeth and one marked spoke, so that its rotation can be seen.
function drawGear(cx, cy, r, teeth, angle, col) {
  push();
  translate(cx, cy); rotate(angle);
  fill(col); stroke(50); strokeWeight(1.5);
  const tw = (TWO_PI * r) / (teeth * 2.2);
  for (let i = 0; i < teeth; i++) {
    push(); rotate((TWO_PI * i) / teeth); rect(-tw / 2, -r - 6, tw, 9, 2); pop();
  }
  circle(0, 0, 2 * r);
  stroke(30); strokeWeight(4);
  line(0, 0, 0, -r + 3);
  fill(50); noStroke(); circle(0, 0, Math.max(8, r * 0.3));
  pop();
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
const LABEL_W = 190;

function sliders() { return [nSlider, speedSlider, torqueSlider, effSlider]; }

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const sliderW = Math.max(60, canvasWidth - LABEL_W - 20);
  sliders().forEach((s, i) => { s.position(LABEL_W, drawHeight + ROW2 + i * ROW_STEP); s.size(sliderW); });
  answerInput.position(190, drawHeight + ROW2);
  answerInput.size(100);
}

function drawControlLabels() {
  if (mode === 'explore') {
    const labels = ['Gear ratio N: ' + nSlider.value() + ' : 1', 'Motor speed: ' + speedSlider.value() + ' rpm',
      'Motor torque: ' + torqueSlider.value() + ' mN·m', 'Efficiency: ' + effSlider.value() + ' %'];
    labels.forEach((s, i) => txt(s, 10, drawHeight + ROW2 + i * ROW_STEP + 11, 'black'));
    return;
  }
  if (phase === 'done') return;
  txt('Your answer (' + PROBLEMS[idx].unit + '):', 10, drawHeight + ROW2 + 11, 'black');
  if (notice) txt(notice, 10, drawHeight + ROW2 + ROW_STEP + 11, 'firebrick');
}

function setMode(m) {
  mode = m;
  if (m === 'problems') startProblems();
  refreshControls();
}

function startProblems() {
  idx = 0; correctCount = 0; phase = 'ask'; notice = '';
  answerInput.value('');
}

function refreshControls() {
  const explore = mode === 'explore';
  for (const s of sliders()) { if (explore) s.show(); else s.hide(); }
  if (explore) { actionBtn.hide(); answerInput.hide(); return; }
  actionBtn.show();
  if (phase === 'done') { actionBtn.html('Try again'); answerInput.hide(); return; }
  answerInput.show();
  if (phase === 'ask') {
    actionBtn.html('Check');
    answerInput.removeAttribute('disabled');
  } else {
    actionBtn.html(idx === PROBLEMS.length - 1 ? 'See score' : 'Next problem');
    answerInput.attribute('disabled', '');
  }
}

function onAction() {
  if (mode !== 'problems') return;
  if (phase === 'ask') {
    const raw = String(answerInput.value()).trim();
    const typed = Number(raw);
    if (raw === '' || !Number.isFinite(typed) || typed < ANSWER_MIN || typed > ANSWER_MAX) {
      notice = 'Type a number from ' + ANSWER_MIN + ' to ' + ANSWER_MAX + ' first.';
      return;
    }
    notice = '';
    const correct = PROBLEMS[idx].correct;
    lastRight = Math.abs(typed - correct) / correct <= TOLERANCE + 1e-9;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < PROBLEMS.length - 1) { idx++; phase = 'ask'; answerInput.value(''); } else { phase = 'done'; }
  } else if (phase === 'done') {
    startProblems();
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
