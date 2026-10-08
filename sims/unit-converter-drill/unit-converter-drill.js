// Unit Converter Drill - p5.js MicroSim
// CANVAS_HEIGHT: 620
// Learning objective (Apply, calculate): calculate conversions between raw servo steps, degrees, radians and
// percent for a calibrated joint, to within 0.1 degree, 0.001 radian, 1 step or 0.1 percent as asked, in six
// problems, with at least 5 of 6 correct on the first attempt. Evidence: the number committed with Check in each
// problem. Explore mode is exploration, not evidence.
// Rules (Chapter 10, "Unit Conversion"), with 4095 / 360 = 11.375 steps per degree:
//   middle  = (range_min + range_max) / 2
//   degrees = (raw - middle) x 360 / 4095
//   raw     = round(middle + degrees x 4095 / 360), kept inside range_min to range_max
//   percent = (raw - range_min) / (range_max - range_min) x 100
//   radians = degrees x pi / 180
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const STEPS_PER_DEGREE = 4095 / 360;      // 11.375
// adjustable quantities (the chapter's Content table), in raw steps
const RAW_MIN = 0, RAW_MAX = 4095;
const RANGE_MIN_DEFAULT = 742, RANGE_MAX_DEFAULT = 3242, RAW_DEFAULT = 1992;
// the four units a value can be set in: slider limits and step for each
const UNITS = {
  raw: { name: 'Raw steps', min: RAW_MIN, max: RAW_MAX, step: 1, digits: 0 },
  deg: { name: 'Degrees', min: -180, max: 180, step: 0.5, digits: 1 },
  rad: { name: 'Radians', min: -3.14, max: 3.14, step: 0.01, digits: 3 },
  pct: { name: 'Percent', min: 0, max: 100, step: 0.5, digits: 1 }
};
const UNIT_KEYS = ['raw', 'deg', 'rad', 'pct'];

// six problems in fixed order. The calibrations are the illustrative results of the Chapter 8 lab.
const PAN = 'Shoulder pan calibration (illustrative): range_min 742, range_max 3242.';
const PROBLEMS = [
  { text: 'The shoulder pan reads raw 3000. What is the angle?', given: PAN, unit: 'degrees', answer: 88.6, tol: 0.1, digits: 1,
    why: '(3000 − 1992) / 11.375 = 88.6 degrees.' },
  { text: 'The shoulder pan is commanded to 45 degrees. What raw value is sent?', given: PAN, unit: 'steps', answer: 2504, tol: 1, digits: 0,
    why: '1992 + 45 × 11.375 = 2503.9, which rounds to 2504.' },
  { text: 'The shoulder pan reads raw 1000. What is the angle?', given: PAN, unit: 'degrees', answer: -87.2, tol: 0.1, digits: 1,
    why: '(1000 − 1992) / 11.375 = −87.2 degrees.' },
  { text: 'A Damiao motor reports 0.5 radians. How many degrees is that?', given: '', unit: 'degrees', answer: 28.6, tol: 0.1, digits: 1,
    why: '0.5 × 180 / π = 28.65 degrees, which rounds to 28.6 or 28.7 within the tolerance.' },
  { text: 'A joint is commanded to 30 degrees. How many radians is that?', given: '', unit: 'radians', answer: 0.524, tol: 0.001, digits: 3,
    why: '30 × π / 180 = 0.5236 radians.' },
  { text: 'The gripper (range 1977 to 3397) reads raw 2500. What percent open is it?', given: 'The gripper calibration is illustrative.', unit: 'percent', answer: 36.8, tol: 0.1, digits: 1,
    why: '(2500 − 1977) / (3397 − 1977) × 100 = 36.8 percent.' }
];
const RULES = [
  'middle = (range_min + range_max) / 2',
  'degrees = (raw − middle) / 11.375',
  'raw = middle + degrees × 11.375',
  'percent = (raw − min) / (max − min) × 100',
  'radians = degrees × π / 180'
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, unitSelect, valSlider, minSlider, maxSlider, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let unit = 'raw';              // the unit the Explore value is set in
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

  unitSelect = createSelect();
  unitSelect.option('Set the value in raw steps', 'raw');
  unitSelect.option('Set the value in degrees', 'deg');
  unitSelect.option('Set the value in radians', 'rad');
  unitSelect.option('Set the value in percent', 'pct');
  unitSelect.selected('raw');
  unitSelect.changed(() => setUnit(unitSelect.value()));

  valSlider = createSlider(RAW_MIN, RAW_MAX, RAW_DEFAULT, 1);
  minSlider = createSlider(RAW_MIN, RAW_MAX, RANGE_MIN_DEFAULT, 1);
  maxSlider = createSlider(RAW_MIN, RAW_MAX, RANGE_MAX_DEFAULT, 1);

  answerInput = createInput('');
  answerInput.attribute('inputmode', 'decimal');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.input(refreshControls);
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A dial shows one servo joint with its calibrated range as a blue arc and an orange arm at the current ' +
    'angle. Four cards show the same position as raw steps, degrees, radians and percent. Sliders set the value ' +
    'and the two ends of the range. In the six problems you type a converted number and press Check.');
}

// ---------------------------------------------------------------------------
// The conversions
// ---------------------------------------------------------------------------
// v is a value in the given unit ('raw', 'deg', 'rad' or 'pct'); lo and hi are range_min and range_max.
function convert(u, v, lo, hi) {
  const mid = (lo + hi) / 2;
  const k = { mid: mid, lo: lo, hi: hi, held: false, asked: v, exactRaw: null };
  if (u === 'raw') { k.raw = v; k.deg = (v - mid) / STEPS_PER_DEGREE; }
  else if (u === 'pct') { k.exactRaw = lo + v / 100 * (hi - lo); k.raw = Math.round(k.exactRaw); k.deg = (k.raw - mid) / STEPS_PER_DEGREE; }
  else {
    k.askedDeg = u === 'deg' ? v : v * 180 / Math.PI;
    k.exactRaw = mid + k.askedDeg * STEPS_PER_DEGREE;
    k.raw = Math.round(k.exactRaw);
    if (k.raw < lo || k.raw > hi) { k.raw = Math.min(hi, Math.max(lo, k.raw)); k.held = true; }
    k.deg = k.held ? (k.raw - mid) / STEPS_PER_DEGREE : k.askedDeg;
  }
  k.rad = k.deg * Math.PI / 180;
  k.pct = u === 'pct' ? v : (k.raw - lo) / (hi - lo) * 100;
  k.outside = k.raw < lo || k.raw > hi;
  return k;
}
function current() { return convert(unit, valSlider.value(), minSlider.value(), maxSlider.value()); }
function rangeOk() { return maxSlider.value() > minSlider.value(); }

// numbers for display: a true minus sign, and no "-0.0"
function fx(v, d) {
  let s = Math.abs(v).toFixed(d);
  return (v < 0 && Number(s) !== 0 ? '−' : '') + s;
}
function tidy(v) { return Number.isInteger(v) ? String(v) : fx(v, 1); }
function paren(s) { return s.charAt(0) === '−' ? '(' + s + ')' : s; }

// what the learner typed, as a number (or null): accepts a comma for the decimal point and a typed minus sign
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

  txt('Unit Converter Drill', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') {
    const ok = rangeOk(), k = ok ? current() : null;
    drawDial(k);
    drawCards(k);
    drawWorking(k);
  } else drawProblem();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore: the joint, the four units and the working
// ---------------------------------------------------------------------------
function drawDial(k) {
  const cx = narrow ? 74 : 110, cy = 112, R = 48;
  const ang = d => -HALF_PI + radians(d);          // 0 degrees points up; positive angles turn clockwise
  noFill(); strokeCap(SQUARE);
  stroke('lightgray'); strokeWeight(12); circle(cx, cy, R * 2);
  if (k) {
    const dLo = (k.lo - k.mid) / STEPS_PER_DEGREE, dHi = (k.hi - k.mid) / STEPS_PER_DEGREE;
    stroke('steelblue'); arc(cx, cy, R * 2, R * 2, ang(dLo), ang(dHi));
  }
  strokeCap(ROUND);
  stroke('black'); strokeWeight(2);
  line(cx, cy - R - 9, cx, cy - R + 9);
  txt('0° = middle', cx, cy - R - 20, 'black', CENTER, CENTER, 16, false);
  txt('range in blue', cx, cy + R + 18, 'dimgray', CENTER, CENTER, 16, false);
  if (k) {
    const a = ang(k.deg);
    stroke(k.outside ? 'firebrick' : 'darkorange'); strokeWeight(7);
    line(cx, cy, cx + (R - 4) * cos(a), cy + (R - 4) * sin(a));
  }
  fill('dimgray'); noStroke(); circle(cx, cy, 16);
}

function drawCards(k) {
  const x0 = narrow ? 150 : 230, gap = 6, top = 46;
  const cols = narrow ? 2 : 4, w = (canvasWidth - x0 - 8 - gap * (cols - 1)) / cols, h = narrow ? 62 : 70;
  UNIT_KEYS.forEach((u, i) => {
    const x = x0 + (i % cols) * (w + gap), y = top + Math.floor(i / cols) * (h + gap) + (narrow ? 0 : 30);
    const set = u === unit;
    fill(set ? 'lightyellow' : 'white'); stroke(set ? 'goldenrod' : 'silver'); strokeWeight(set ? 3 : 1);
    rect(x, y, w, h, 8);
    txt(UNITS[u].name, x + w / 2, y + 6, 'black', CENTER, TOP, 16, false);
    let v = '?';
    if (k) v = u === 'raw' ? String(k.raw) : u === 'deg' ? fx(set ? k.asked : k.deg, 1) + '°' : u === 'rad' ? fx(set ? k.asked : k.rad, 3) : fx(k.pct, 1) + ' %';
    txt(v, x + w / 2, y + (narrow ? 30 : 34), 'navy', CENTER, TOP, narrow ? 18 : 20, true);
  });
  if (!narrow) txt('The same position in four units. The yellow card is the one you set.', x0, top + 10, 'dimgray', LEFT, CENTER, 16, false);
}

function drawWorking(k) {
  const x = 8, w = canvasWidth - 16, top = 186, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;
  if (!k) {
    y = para('range_max must be larger than range_min. Move one of the two range sliders.', tx, y, tw, 'firebrick', 16, true);
    return;
  }
  const S = '11.375', mid = tidy(k.mid);
  const line1 = 'middle = (' + k.lo + ' + ' + k.hi + ') / 2 = ' + mid;
  const degLine = 'degrees = (' + k.raw + ' − ' + mid + ') / ' + S + ' = ' + fx(k.deg, 1);
  const radLine = 'radians = ' + paren(fx(k.deg, 1)) + ' × π / 180 = ' + fx(k.rad, 3);
  const pctLine = 'percent = (' + k.raw + ' − ' + k.lo + ') / (' + k.hi + ' − ' + k.lo + ') × 100 = ' + fx(k.pct, 1);
  const lines = [line1];
  if (unit === 'raw') lines.push(degLine, radLine, pctLine);
  else if (unit === 'pct') {
    lines.push('raw = ' + k.lo + ' + ' + fx(k.asked, 1) + ' / 100 × (' + k.hi + ' − ' + k.lo + ') = ' + fx(k.exactRaw, 1) + ', rounded to ' + k.raw, degLine, radLine);
  } else {
    if (unit === 'rad') lines.push('degrees = ' + paren(fx(k.asked, 2)) + ' × 180 / π = ' + fx(k.askedDeg, 1));
    lines.push('raw = ' + mid + ' + ' + paren(fx(k.askedDeg, 1)) + ' × ' + S + ' = ' + fx(k.exactRaw, 1) +
      (k.held ? ', outside the range' : ', rounded to ' + k.raw));
    if (unit === 'deg' && !k.held) lines.push(radLine);
    if (!k.held) lines.push(pctLine);
  }
  for (const s of lines) y = para(s, tx, y, tw, 'black', 16, true) + 5;
  let note, col = 'dimgray';
  if (k.held) { note = 'That target is beyond the range, so the conversion holds the joint at raw ' + k.raw + ', which is ' + fx(k.deg, 1) + ' degrees.'; col = 'firebrick'; }
  else if (k.outside) { note = 'Raw ' + k.raw + ' is outside the calibrated range, so a command would never send this joint there.'; col = 'firebrick'; }
  else note = 'The middle of the range is 0 degrees and 50 percent, whatever the range is. The calibration is illustrative.';
  if (y + 4 + para(note, tx, 0, tw, col, 16, false, true) <= bottom || col === 'firebrick') y = para(note, tx, y + 4, tw, col, 16, false);
  if (y > bottom) layoutNotes.push('working panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// The six problems
// ---------------------------------------------------------------------------
function drawProblem() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + PROBLEMS.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para('The rules you used:', tx, y + 10, tw, 'black', 16, true);
    for (const r of RULES) y = para(r, tx + 8, y + 2, tw - 8, 'black', 16, false);
    y = para('Switch to Explore to try your own numbers and ranges.', tx, y + 10, tw, 'dimgray', 16, false);
  } else {
    const p = PROBLEMS[idx];
    y = para('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + '     Correct: ' + correctCount + ' of ' + PROBLEMS.length, tx, y, tw, 'black', 16, true);
    y = para(p.text, tx, y + 6, tw, 'black', narrow ? 16 : 18, false);
    if (p.given) y = para(p.given, tx, y + 6, tw, 'dimgray', 16, false);
    if (phase === 'ask') {
      y = para('Answer in ' + p.unit + ', to within ' + p.tol + '. Type it below and press Check.', tx, y + 8, tw, 'navy', 16, true);
      y = para('Rules:', tx, y + 10, tw, 'black', 16, true);
      for (const r of RULES) y = para(r, tx + 8, y + 2, tw - 8, 'black', 16, false);
    } else {
      const val = fx(p.answer, p.digits) + ' ' + p.unit;
      y = para((lastRight ? 'Correct: ' + val + '. ' : 'Not quite. The answer is ' + val + '. ') + p.why, tx, y + 10, tw,
        lastRight ? 'darkgreen' : 'firebrick', 16, false);
      y = para('You typed ' + lastTyped + '.', tx, y + 6, tw, 'black', 16, false);
    }
  }
  if (y > bottom) layoutNotes.push('problem panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;

function layoutControls() {
  const mw = narrow ? 120 : 150;
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(mw, 28);
  unitSelect.position(18 + mw, drawHeight + ROW1);
  unitSelect.size(narrow ? canvasWidth - 28 - mw : 230, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const labelW = narrow ? 150 : 190;
  const sliderW = max(60, canvasWidth - labelW - 28);
  [valSlider, minSlider, maxSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + [ROW2, ROW3, ROW4][i]);
    s.size(sliderW);
  });
  answerInput.position(120, drawHeight + ROW2);
  answerInput.size(narrow ? 100 : 130, 22);
}

function drawControlLabels() {
  if (mode === 'explore') {
    const u = UNITS[unit];
    txt((unit === 'raw' ? (narrow ? 'Raw: ' : 'Raw value: ') : u.name + ': ') + fx(valSlider.value(), unit === 'rad' ? 2 : u.digits), 10, drawHeight + ROW2 + 11, 'black');
    txt('range_min: ' + minSlider.value(), 10, drawHeight + ROW3 + 11, 'black');
    txt('range_max: ' + maxSlider.value(), 10, drawHeight + ROW4 + 11, 'black');
  } else if (phase !== 'done') {
    txt('Your answer:', 10, drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, true);
    txt(PROBLEMS[idx].unit, (narrow ? 232 : 262), drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, false);
    if (phase === 'ask' && answerInput.value().trim() !== '' && parseAnswer(answerInput.value()) === null)
      txt('Type a number, such as 12.5', 10, drawHeight + ROW3 + 14, 'firebrick', LEFT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'problems') { idx = 0; phase = 'ask'; correctCount = 0; answerInput.value(''); }
  refreshControls();
}

// change the unit of the Explore value, keeping the joint where it is
function setUnit(u) {
  const k = rangeOk() ? current() : null;
  unit = u;
  const d = UNITS[u];
  valSlider.elt.min = d.min; valSlider.elt.max = d.max; valSlider.elt.step = d.step;
  let v = u === 'raw' ? RAW_DEFAULT : 0;
  if (k) v = u === 'raw' ? k.raw : u === 'deg' ? k.deg : u === 'rad' ? k.rad : k.pct;
  valSlider.value(constrain(Math.round(v / d.step) * d.step, d.min, d.max));
}

function refreshControls() {
  const explore = mode === 'explore';
  [unitSelect, valSlider, minSlider, maxSlider].forEach(c => explore ? c.show() : c.hide());
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
