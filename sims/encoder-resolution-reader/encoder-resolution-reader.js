// Encoder Resolution Reader - p5.js MicroSim
// CANVAS_HEIGHT: 590
// Learning objective (Apply, calculate): calculate the step size of an encoder, convert between encoder steps and
// degrees, and find a speed from two position readings, to within 1 percent, in five problems, with at least
// 4 of 5 correct on the first attempt.
// Evidence: the number typed and committed with Check in each problem. Explore mode is exploration, not evidence.
// Model: steps per turn = 2^bits. Step size = 360 / 2^bits. Step number = angle / 360 x 2^bits, rounded down.
// Angle = steps / 2^bits x 360. Speed = change in angle / time. The encoder is single-turn: 360 degrees reads as 0.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// adjustable quantities (the spec's Content table)
const BITS_MIN = 8, BITS_MAX = 16, BITS_STEP = 1, BITS_DEFAULT = 12;
const ANGLE_MIN = 0, ANGLE_MAX = 359.9, ANGLE_STEP = 0.1, ANGLE_DEFAULT = 90;      // degrees
const ZOOM_DEGREES = 3;        // the width of the magnified strip

// the five problems, in fixed order. correct is the spec's answer key in the unit asked.
// rows are the known and unknown quantities; pointers are shaft angles drawn on the dial (after: only once committed).
const PROBLEMS = [
  { text: 'How large is one step of a 12-bit encoder?', unit: 'degrees', correct: 0.0879, bits: 12,
    why: '360 / 4096 = 0.08789 degrees.', rows: [['Encoder', '12 bits'], ['Step size', '?']], pointers: [], after: [] },
  { text: 'How large is one step of a 16-bit encoder?', unit: 'degrees', correct: 0.00549, bits: 16,
    why: '360 / 65536 = 0.005493 degrees.', rows: [['Encoder', '16 bits'], ['Step size', '?']], pointers: [], after: [] },
  { text: 'A 12-bit encoder reads 3072. What is the angle?', unit: 'degrees', correct: 270, bits: 12,
    why: '3072 / 4096 × 360 = 270 degrees.', rows: [['Encoder', '12 bits'], ['Reading', '3072'], ['Angle', '?']], pointers: [], after: [270] },
  { text: 'What step number is 45 degrees on a 12-bit encoder?', unit: 'steps', correct: 512, bits: 12,
    why: '45 / 360 × 4096 = 512.', rows: [['Encoder', '12 bits'], ['Angle', '45 degrees'], ['Step number', '?']], pointers: [45], after: [45] },
  { text: 'A 12-bit encoder reads 1000 and then 1100, 0.05 s later. How fast is the joint turning?', unit: 'degrees per second', correct: 175.8, bits: 12,
    why: '100 steps is 100 / 4096 × 360 = 8.789 degrees, and 8.789 / 0.05 = 175.8 degrees per second.',
    rows: [['Encoder', '12 bits'], ['Readings', '1000, then 1100'], ['Time', '0.05 s'], ['Speed', '?']], pointers: [],
    after: [1000 / 4096 * 360, 1100 / 4096 * 360] }
];
const MASTERY = 4;
const TOLERANCE = 0.01;          // an answer within 1 percent is correct
const ANSWER_MIN = 0, ANSWER_MAX = 10000;

// controls
let modeSelect, actionBtn, bitsSlider, angleSlider, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, notice = '';

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Problems', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  bitsSlider = createSlider(BITS_MIN, BITS_MAX, BITS_DEFAULT, BITS_STEP);
  angleSlider = createSlider(ANGLE_MIN, ANGLE_MAX, ANGLE_DEFAULT, ANGLE_STEP);

  answerInput = createInput('', 'number');
  answerInput.attribute('min', String(ANSWER_MIN));
  answerInput.attribute('max', String(ANSWER_MAX));
  answerInput.attribute('step', '0.00001');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A dial that shows the angle of a shaft, with a pointer. Beside it are the number of encoder steps per ' +
    'turn, the size of one step, the step number and the angle the encoder reports. A strip below magnifies 3 ' +
    'degrees of the dial so that single steps can be seen. Sliders set the encoder bits and the shaft angle. ' +
    'A Problems mode asks five encoder calculations.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function stepsPerTurn(bits) { return Math.pow(2, bits); }
function stepSize(bits) { return 360 / stepsPerTurn(bits); }                      // degrees
function stepNumber(angle, bits) { return Math.floor(angle / 360 * stepsPerTurn(bits) + 1e-6) % stepsPerTurn(bits); }
function stepsToAngle(steps, bits) { return steps / stepsPerTurn(bits) * 360; }   // degrees
function sig(x, n) { return String(Number(x.toPrecision(n || 3))); }
function fmt(x, digits) { return x.toLocaleString('en-US', { maximumFractionDigits: digits === undefined ? 2 : digits, useGrouping: false }); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Encoder Resolution Reader', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawProblems();
  drawControlLabels();
}

function dialGeom() {
  const r = narrow ? 56 : 72;
  return { r, cx: narrow ? 82 : 130, cy: 88 + r, bottom: 88 + 2 * r + 14, rowsX: narrow ? 164 : 280 };
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const bits = bitsSlider.value(), angle = angleSlider.value();
  const n = stepsPerTurn(bits), size = stepSize(bits), step = stepNumber(angle, bits);
  const g = dialGeom();
  txt(bits + '-bit encoder: ' + n + ' steps per turn', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawDial(g, [angle]);
  drawRows(g, [['Shaft angle', fmt(angle, 1) + '°'], ['Steps per turn', String(n)], ['Step size', sig(size) + '°'],
    ['Step number', String(step)], ['Reported', fmt(step * size, 3) + '°']]);
  drawZoom(g.bottom + 8, angle, bits);

  const top = g.bottom + 100;
  const line = panel(top, drawHeight - top - 8);
  line('Step size = 360 / ' + n + '. Step number = angle / 360 × ' + n + ', rounded down.', 'black', 16, true);
  line('Add one bit and the step is half as big.', 'black', 16, false);
  line('The angle wraps: 360 degrees reads as step 0. A fine step does not make a joint accurate.', 'dimgray', 16, false);
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
    line('Remember: one turn is 2 to the power of the bit count. More bits give a smaller step.', 'black', 16, false);
    return;
  }
  const q = PROBLEMS[idx], done = phase === 'feedback', g = dialGeom();
  const answer = sig(q.correct, 4) + ' ' + q.unit;
  txt('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawDial(g, done ? q.after : q.pointers);
  drawRows(g, q.rows.map(r => [r[0], r[1] === '?' ? (done ? sig(q.correct, 4) : '?') : r[1]]));

  const top = g.bottom + 6;
  const line = panel(top, drawHeight - top - 8);
  line(q.text, 'black', 16, true);
  if (!done) {
    line('Type your answer in ' + q.unit + ' and press Check. You get one try for each problem.', 'dimgray', 16, false);
    return;
  }
  const n = stepsPerTurn(q.bits);
  const msg = lastRight ? 'Correct: ' + answer + '. ' + q.why
    : 'Not quite. One turn is 2^' + q.bits + ' = ' + n + ' steps, so ' + answer + '. ' + q.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, false);
}

// ---------------------------------------------------------------------------
// The dial, the readout rows and the magnified strip
// ---------------------------------------------------------------------------
// Angles are measured counterclockwise from the right, like a protractor.
function drawDial(g, pointers) {
  fill('white'); stroke(60); strokeWeight(2);
  circle(g.cx, g.cy, 2 * g.r);
  for (let a = 0; a < 360; a += 30) {
    const c = Math.cos(radians(a)), s = Math.sin(radians(a)), inner = a % 90 === 0 ? g.r - 12 : g.r - 7;
    stroke(90); strokeWeight(a % 90 === 0 ? 2 : 1);
    line(g.cx + inner * c, g.cy - inner * s, g.cx + g.r * c, g.cy - g.r * s);
  }
  txt('0°', g.cx + g.r + 5, g.cy, 'black', LEFT, CENTER, 16, false);
  txt('90°', g.cx, g.cy - g.r - 12, 'black', CENTER, CENTER, 16, false);
  if (!narrow) txt('180°', g.cx - g.r - 5, g.cy, 'black', RIGHT, CENTER, 16, false);
  txt('270°', g.cx, g.cy + g.r + 13, 'black', CENTER, CENTER, 16, false);
  pointers.forEach((a, i) => {
    const c = Math.cos(radians(a)), s = Math.sin(radians(a));
    stroke(i === 0 ? '#c0392b' : '#1f6fb5'); strokeWeight(4);
    line(g.cx, g.cy, g.cx + (g.r - 4) * c, g.cy - (g.r - 4) * s);
  });
  if (pointers.length === 0) txt('?', g.cx, g.cy - 22, 'gray', CENTER, CENTER, 24, true);
  fill(50); noStroke(); circle(g.cx, g.cy, 12);
}

function drawRows(g, rows) {
  const y0 = g.cy - (rows.length * 26) / 2 + 13;
  rows.forEach((r, i) => {
    const y = y0 + i * 26;
    txt(r[0] + ':', g.rowsX, y, 'black', LEFT, CENTER, 16, false);
    textSize(16); textStyle(NORMAL);
    txt(r[1], g.rowsX + textWidth(r[0] + ':') + 8, y, r[1] === '?' ? 'firebrick' : 'black', LEFT, CENTER, 16, true);
  });
}

// A strip that magnifies ZOOM_DEGREES of the dial around the pointer. Each box is one encoder step.
function drawZoom(y, angle, bits) {
  const x = 14, w = canvasWidth - 28, h = 40, size = stepSize(bits), step = stepNumber(angle, bits);
  const pxPerDeg = w / ZOOM_DEGREES, a0 = angle - ZOOM_DEGREES / 2;
  const toX = (a) => x + (a - a0) * pxPerDeg;
  txt('Zoom on ' + ZOOM_DEGREES + ' degrees. Each box is one step.', x, y, 'black', LEFT, TOP, 16, false);
  const top = y + 24;
  fill('white'); stroke(60); strokeWeight(1);
  rect(x, top, w, h);
  // the step that holds the pointer
  const cellL = Math.max(x, toX(step * size)), cellR = Math.min(x + w, toX((step + 1) * size));
  fill('#bfe5c7'); noStroke();
  rect(cellL, top + 1, Math.max(1, cellR - cellL), h - 2);
  // step boundaries
  const spacing = size * pxPerDeg;
  if (spacing >= 3) {
    stroke(90); strokeWeight(1);
    for (let k = Math.ceil(a0 / size); k * size <= a0 + ZOOM_DEGREES; k++) line(toX(k * size), top, toX(k * size), top + h);
  } else {
    fill(150, 150, 150, 110); noStroke();
    rect(x + 1, top + 1, w - 2, h - 2);
  }
  // the pointer
  stroke('#c0392b'); strokeWeight(3);
  line(x + w / 2, top - 4, x + w / 2, top + h + 4);
  noFill(); stroke(60); strokeWeight(1);
  rect(x, top, w, h);
  if (spacing >= 3) txt('step ' + step, constrain((cellL + cellR) / 2, x + 50, x + w - 50), top + h + 14, 'darkgreen', CENTER, CENTER, 16, true);
  else txt('step ' + step + ': too small to see at this zoom', x + w / 2, top + h + 14, 'darkgreen', CENTER, CENTER, 16, true);
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
const ROW1 = 8, ROW2 = 46, ROW3 = 84;
const LABEL_W = 170;

function answerLabel() { return 'Your answer (' + PROBLEMS[idx].unit + '):'; }

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const sliderW = Math.max(60, canvasWidth - LABEL_W - 20);
  bitsSlider.position(LABEL_W, drawHeight + ROW2); bitsSlider.size(sliderW);
  angleSlider.position(LABEL_W, drawHeight + ROW3); angleSlider.size(sliderW);
  textSize(16); textStyle(NORMAL);
  answerInput.position(Math.min(18 + textWidth(answerLabel()), canvasWidth - 100), drawHeight + ROW2);
  answerInput.size(84);
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt('Encoder bits: ' + bitsSlider.value(), 10, drawHeight + ROW2 + 11, 'black');
    txt('Shaft angle: ' + fmt(angleSlider.value(), 1) + '°', 10, drawHeight + ROW3 + 11, 'black');
    return;
  }
  if (phase === 'done') return;
  txt(answerLabel(), 10, drawHeight + ROW2 + 11, 'black');
  if (notice) txt(notice, 10, drawHeight + ROW3 + 11, 'firebrick');
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
  for (const s of [bitsSlider, angleSlider]) { if (explore) s.show(); else s.hide(); }
  if (explore) { actionBtn.hide(); answerInput.hide(); return; }
  actionBtn.show();
  if (phase === 'done') { actionBtn.html('Try again'); answerInput.hide(); return; }
  answerInput.show();
  layoutControls();
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
function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
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
