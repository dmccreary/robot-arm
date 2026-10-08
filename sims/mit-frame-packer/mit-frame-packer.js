// MIT Frame Packer - p5.js MicroSim
// CANVAS_HEIGHT: 670
// Learning objective (Apply, calculate): calculate the whole number that a value becomes when it is packed into an
// MIT-mode field of a Damiao motor, in six problems, with at least 5 of 6 correct on the first attempt.
// Evidence: the whole number typed and committed with Check in each problem. Explore mode is not evidence.
// Model (Chapter 9, "An MIT Frame in Eight Bytes"): integer = floor((x - x_min) * (2^n - 1) / (x_max - x_min)).
// Position has 16 bits; speed, Kp, Kd and torque have 12 bits each. A value outside its range is limited to the
// range first. The eight bytes are packed with shifts and masks as in the chapter's table.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 510;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// Seeed's default limits for the two models
const MODELS = {
  DM4310: { pmax: 12.5, vmax: 30, tmax: 10 },
  DM4340P: { pmax: 12.5, vmax: 8, tmax: 28 }
};

// the five fields of an MIT command, in packing order
const FIELDS = [
  { key: 'pos', name: 'Position', unit: 'rad', bits: 16, step: 0.1, def: 1.0, col: '#a9cdee', range: m => [-m.pmax, m.pmax] },
  { key: 'vel', name: 'Speed', unit: 'rad/s', bits: 12, step: 0.1, def: 0.0, col: '#ffd9a8', range: m => [-m.vmax, m.vmax] },
  { key: 'kp', name: 'Kp', unit: '', bits: 12, step: 1, def: 20, col: '#bfe5c7', range: () => [0, 500] },
  { key: 'kd', name: 'Kd', unit: '', bits: 12, step: 0.1, def: 1.0, col: '#dcc6f0', range: () => [0, 5] },
  { key: 'tau', name: 'Torque', unit: 'N·m', bits: 12, step: 0.1, def: 0.0, col: '#f5b7b1', range: m => [-m.tmax, m.tmax] }
];
function fieldByKey(k) { return FIELDS.find(f => f.key === k); }

// the six problems, in fixed order. expect is the spec's answer key; toInt() must agree with it.
const PROBLEMS = [
  { model: 'DM4310', field: 'pos', x: 0, expect: 32767, why: '12.5 × 65535 / 25 = 32767.5, and the fraction is dropped.' },
  { model: 'DM4310', field: 'kd', x: 1.0, expect: 819, why: '1.0 × 4095 / 5 = 819.' },
  { model: 'DM4310', field: 'kp', x: 20, expect: 163, why: '20 × 4095 / 500 = 163.8, and the fraction is dropped.' },
  { model: 'DM4340P', field: 'vel', x: 3, expect: 2815, why: '(3 + 8) × 4095 / 16 = 2815.3, and the fraction is dropped.' },
  { model: 'DM4340P', field: 'tau', x: -7, expect: 1535, why: '(-7 + 28) × 4095 / 56 = 1535.6, and the fraction is dropped.' },
  { model: 'DM4310', field: 'pos', x: 1.0, expect: 35388, why: '13.5 × 65535 / 25 = 35388.9, and the fraction is dropped.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, modelSelect, answerInput;
const valueInputs = {};        // one number input for each field

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, notice = '';
let focusKey = 'pos';          // the field whose working is shown in Explore mode

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

  modelSelect = createSelect();
  for (const name of Object.keys(MODELS)) modelSelect.option(name);
  modelSelect.selected('DM4310');
  modelSelect.changed(applyModel);

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  for (const f of FIELDS) {
    const inp = createInput(String(f.def), 'number');
    inp.attribute('step', String(f.step));
    inp.attribute('aria-label', f.name);
    inp.input(() => { focusKey = f.key; });
    inp.elt.addEventListener('focus', () => { focusKey = f.key; });
    valueInputs[f.key] = inp;
  }

  answerInput = createInput('', 'number');
  answerInput.attribute('min', '0');
  answerInput.attribute('step', '1');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  applyModel();
  setMode('explore');
  describe('A table of the five values of an MIT motor command: position, speed, Kp, Kd and torque, each with the ' +
    'whole number it is packed into and its hexadecimal form. Below it are the eight data bytes of the CAN frame, ' +
    'coloured by the value each one carries. A second mode asks for the whole number in six problems.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function maxInt(bits) { return Math.pow(2, bits) - 1; }
function limitTo(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

// The chapter's formula. The tiny number guards against floating-point error just below a whole number.
function toInt(x, lo, hi, bits) { return Math.floor((limitTo(x, lo, hi) - lo) * maxInt(bits) / (hi - lo) + 1e-9); }

// The value before the fraction is dropped, for showing the working.
function toExact(x, lo, hi, bits) { return (limitTo(x, lo, hi) - lo) * maxInt(bits) / (hi - lo); }

// Packs the five integers into eight bytes with shifts and masks.
function packBytes(p, v, kp, kd, t) {
  return [p >> 8, p & 0xFF, v >> 4, ((v & 0xF) << 4) | (kp >> 8), kp & 0xFF, kd >> 4, ((kd & 0xF) << 4) | (t >> 8), t & 0xFF];
}

function hexN(n, digits) { return n.toString(16).toUpperCase().padStart(digits, '0'); }
function num(x) { return String(Math.round(x * 10) / 10); }

// One row for each field of the Explore command: its value, range and integer.
function exploreRows() {
  const m = MODELS[modelSelect.value()];
  return FIELDS.map(f => {
    const [lo, hi] = f.range(m);
    const raw = Number(valueInputs[f.key].value());
    const typed = Number.isFinite(raw) ? raw : 0;
    const x = limitTo(typed, lo, hi);
    return { f, lo, hi, x, limited: x !== typed, int: toInt(x, lo, hi, f.bits), exact: toExact(x, lo, hi, f.bits) };
  });
}

function problemRow(q) {
  const f = fieldByKey(q.field), [lo, hi] = f.range(MODELS[q.model]);
  return { f, lo, hi, x: q.x, int: toInt(q.x, lo, hi, f.bits), exact: toExact(q.x, lo, hi, f.bits) };
}

// The working for one row, as text.
function working(r) {
  const shift = r.lo === 0 ? num(r.x) : '(' + num(r.x) + (r.lo < 0 ? ' + ' + num(-r.lo) : ' − ' + num(r.lo)) + ')';
  return shift + ' × ' + maxInt(r.f.bits) + ' / ' + num(r.hi - r.lo) + ' = ' + (Math.round(r.exact * 10) / 10);
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('MIT Frame Packer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawProblems();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const rows = exploreRows();
  txt(modelSelect.value() + ': five values in 8 bytes', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);

  // the table of fields
  const x = 8, w = canvasWidth - 16, top = 68, rowH = 26;
  const cols = narrow ? [28, 110, 196, 244, 310] : [34, 150, 260, 430, 520, 640].map(c => c * (w / 784));
  const heads = narrow ? ['Field', 'Value', 'Bits', 'Integer', 'Hex'] : ['Field', 'Value', 'Range', 'Bits', 'Integer', 'Hex'];
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, rowH * (rows.length + 1) + 6, 8);
  heads.forEach((h, i) => txt(h, x + cols[i], top + rowH / 2 + 2, 'black', LEFT, CENTER, 16, true));
  rows.forEach((r, k) => {
    const y = top + rowH * (k + 1) + rowH / 2 + 2;
    if (r.f.key === focusKey) { fill(255, 244, 200); noStroke(); rect(x + 1, y - rowH / 2, w - 2, rowH); }
    fill(r.f.col); stroke(60); strokeWeight(1); rect(x + 8, y - 7, 14, 14);
    const cells = [r.f.name, num(r.x) + (r.f.unit ? ' ' + r.f.unit : '')];
    if (!narrow) cells.push(num(r.lo) + ' to ' + num(r.hi));
    cells.push(String(r.f.bits), String(r.int), hexN(r.int, r.f.bits / 4));
    cells.forEach((c, i) => txt(c, x + cols[i], y, r.limited && i === 1 ? 'firebrick' : 'black', LEFT, CENTER, 16, i >= cells.length - 2));
  });

  // the eight bytes
  const ints = rows.map(r => r.int);
  const bytesTop = top + rowH * (rows.length + 1) + 34;
  txt('The 8 data bytes of the CAN frame', canvasWidth / 2, bytesTop - 14, 'black', CENTER, CENTER, 16, true);
  drawBytes(packBytes(...ints), bytesTop);

  // the working for the field that was changed last
  const r = rows.find(q => q.f.key === focusKey);
  const pTop = bytesTop + 72;
  const line = panel(pTop, drawHeight - pTop - 8);
  line(r.f.name + ': ' + working(r) + '. Drop the fraction: ' + r.int + ' = 0x' + hexN(r.int, r.f.bits / 4) + '.', 'black', 16, true);
  if (r.limited) line(r.f.name + ' is outside its range, so it is limited to ' + num(r.x) + ' first.', 'firebrick', 16, false);
  line('integer = floor((x − min) × (2^bits − 1) / (max − min)). The fraction is dropped, not rounded.', 'dimgray', 16, false);
  if (!(narrow && r.limited)) line('So a value of 0 in a plus-and-minus range lands just below the middle.', 'dimgray', 16, false);
}

// The eight bytes, coloured by the fields they carry. Bytes 3 and 6 are shared by two fields.
function drawBytes(bytes, y) {
  const n = 8, gap = 4, bw = Math.min(64, (canvasWidth - 20 - gap * (n - 1)) / n), bh = 38;
  let x = (canvasWidth - (n * bw + (n - 1) * gap)) / 2;
  const owner = [['pos'], ['pos'], ['vel'], ['vel', 'kp'], ['kp'], ['kd'], ['kd', 'tau'], ['tau']];
  for (let i = 0; i < n; i++) {
    noStroke();
    owner[i].forEach((k, j) => { fill(fieldByKey(k).col); rect(x + j * bw / owner[i].length, y, bw / owner[i].length, bh); });
    noFill(); stroke(60); strokeWeight(1); rect(x, y, bw, bh, 4);
    txt(hexN(bytes[i], 2), x + bw / 2, y + bh / 2, 'black', CENTER, CENTER, narrow ? 18 : 20, true);
    txt(String(i), x + bw / 2, y + bh + 11, 'dimgray', CENTER, CENTER, 16, false);
    x += bw + gap;
  }
}

// ---------------------------------------------------------------------------
// Six problems
// ---------------------------------------------------------------------------
function drawProblems() {
  const score = 'Correct: ' + correctCount + ' of ' + PROBLEMS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 210);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: subtract the bottom of the range, scale by 2^bits − 1, divide by the width of the range, and drop the fraction.', 'black', 16, false);
    return;
  }
  const q = PROBLEMS[idx], r = problemRow(q), done = phase === 'feedback';
  txt('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const line = panel(68, drawHeight - 76);
  line(q.model + ', ' + (r.f.key === 'kp' || r.f.key === 'kd' ? r.f.name + ' = ' + num(q.x) : r.f.name.toLowerCase() + ' ' + num(q.x) + ' ' + r.f.unit) +
    ' (range ' + num(r.lo) + ' to ' + num(r.hi) + ').', 'black', 18, true);
  line('This field has ' + r.f.bits + ' bits, so 2^bits − 1 = ' + maxInt(r.f.bits) + '.', 'black', 16, false);
  line('integer = floor((x − min) × (2^bits − 1) / (max − min))', 'black', 16, false);
  if (!done) {
    line('What whole number is packed into the frame? Type it and press Check. You get one try for each problem.', 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + r.int + '. ' + q.why : 'Not quite. The answer is ' + r.int + '. ' + q.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true);
  line('In hexadecimal that is 0x' + hexN(r.int, r.f.bits / 4) + '.', 'black', 16, false);
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
const ROW1 = 8, ROW2 = 46, ROW_STEP = 38;
const INPUT_W = 62;

// where each field's label and input sit: two columns
function slot(k) {
  const colX = k % 2 === 0 ? 10 : (narrow ? canvasWidth / 2 + 4 : 280);
  return { x: colX, y: drawHeight + ROW2 + Math.floor(k / 2) * ROW_STEP, inputX: colX + (narrow ? 106 : 130) };
}

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 120 : 160);
  modelSelect.position(narrow ? 138 : 180, drawHeight + ROW1);
  modelSelect.size(narrow ? 104 : 120);
  actionBtn.position(canvasWidth - (narrow ? 112 : 140), drawHeight + ROW1);
  FIELDS.forEach((f, k) => { const s = slot(k); valueInputs[f.key].position(s.inputX, s.y); valueInputs[f.key].size(INPUT_W); });
  answerInput.position(120, drawHeight + ROW2);
  answerInput.size(90);
}

function drawControlLabels() {
  if (mode === 'explore') {
    FIELDS.forEach((f, k) => {
      const s = slot(k);
      txt(f.name + (f.unit ? ' (' + f.unit + '):' : ':'), s.x, s.y + 11, 'black');
    });
    return;
  }
  if (phase === 'done') return;
  txt('Your answer:', 10, drawHeight + ROW2 + 11, 'black');
  if (notice) txt(notice, 10, drawHeight + ROW2 + ROW_STEP + 11, 'firebrick');
}

// Set the allowed range of each input for the chosen model.
function applyModel() {
  const m = MODELS[modelSelect.value()];
  for (const f of FIELDS) {
    const [lo, hi] = f.range(m);
    valueInputs[f.key].attribute('min', String(lo));
    valueInputs[f.key].attribute('max', String(hi));
  }
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
  for (const f of FIELDS) { if (explore) valueInputs[f.key].show(); else valueInputs[f.key].hide(); }
  if (explore) { modelSelect.show(); actionBtn.hide(); answerInput.hide(); return; }
  modelSelect.hide();
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
    const r = problemRow(PROBLEMS[idx]);
    const raw = String(answerInput.value()).trim();
    if (!/^\d+$/.test(raw) || Number(raw) > maxInt(r.f.bits)) {
      notice = 'Type a whole number from 0 to ' + maxInt(r.f.bits) + '.';
      return;
    }
    notice = '';
    lastRight = Number(raw) === r.int;
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
