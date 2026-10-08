// Quaternion Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 520
// Learning objective (Apply, calculate): calculate quaternion components, turn angles and SLERP angles from
// given rotations, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first
// attempt. Evidence: the number committed with Check. Explore mode is exploration, not evidence.
// Model: q = (w, x, y, z) = (cos(angle / 2), sin(angle / 2) x axis). angle = 2 arccos(w).
// w = sqrt(1 - x^2 - y^2 - z^2) for a unit quaternion. SLERP at fraction t from no turn to a turn of A degrees
// is a turn of t x A degrees. The angle between two rotations with dot product d is 2 arccos(d).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 435;
let controlHeight = 85;           // 2 rows x 35 + 10 = 80, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Quaternion Calculator';
const DESCRIPTION = 'Four boxes show the w, x, y and z of a unit quaternion. One dial shows a turn about a chosen ' +
  'axis, and a quarter circle shows half of that angle, with its cosine as w and its sine as the axis part. ' +
  'In Explore mode a menu sets the axis and a slider sets the angle. In the six problems the learner types a ' +
  'quaternion component or an angle.';
const QUIZ_LABEL = 'Six problems';
const NOUN = 'problem';
const MASTERY = 5;
const WRONG_LEAD = 'The answer is ';
const ASK_HINT = 'Pick the formula that fits, work it out, then press Check.';
const EXAMPLE_NUMBER = '45.0';
const ANSWER_LABEL_W = 96;
const TOLERANCE = 0.1;

const FORMULAS = [
  'w = cos(angle / 2)',
  'x, y, z = sin(angle / 2) × axis',
  'angle = 2 × arccos(w)',
  'w = √(1 − x² − y² − z²)',
  'SLERP angle = t × whole angle',
  'angle between = 2 × arccos(dot)'
];
const COS_COLOR = '#1565C0', SIN_COLOR = '#6A1B9A';

// the six problems, in the chapter's fixed order. key is the answer as the chapter prints it, and exact is
// the same answer worked out in full.
const ITEMS = [
  { text: 'What is w of the unit quaternion for a 60 degree turn about the x axis? (Answer as w × 100.)',
    unit: 'w', key: 86.6, exact: 100 * Math.cos(Math.PI / 6),
    why: 'w = cos(30 degrees) = 0.866, and 0.866 × 100 = 86.6.' },
  { text: 'A unit quaternion has w = 0.5. What angle does it turn?',
    unit: 'deg', key: 120.0, exact: 2 * Math.acos(0.5) * 180 / Math.PI,
    why: 'angle = 2 × arccos(0.5) = 2 × 60 = 120 degrees.' },
  { text: 'A unit quaternion has x = 0.6 and y = z = 0. What is w? (Answer as w × 100, positive w.)',
    unit: 'w', key: 80.0, exact: 100 * Math.sqrt(1 - 0.36),
    why: 'w = the square root of (1 - 0.36) = 0.8, and 0.8 × 100 = 80.0.' },
  { text: 'SLERP from no turn to a 120 degree turn about z, one quarter of the way. What angle has been turned?',
    unit: 'deg', key: 30.0, exact: 0.25 * 120,
    why: 'A quarter of 120 degrees is 30 degrees.' },
  { text: 'SLERP from no turn to a 150 degree turn about z, at t = 0.4. What angle has been turned?',
    unit: 'deg', key: 60.0, exact: 0.4 * 150,
    why: '0.4 × 150 = 60 degrees.' },
  { text: 'Two unit quaternions have a dot product of 0.5. What is the angle between the two rotations?',
    unit: 'deg', key: 120.0, exact: 2 * Math.acos(0.5) * 180 / Math.PI,
    why: 'The angle is 2 × arccos(0.5) = 120 degrees.' }
];

let axisSelect, angleSlider;

// the unit quaternion (w, x, y, z) for a turn of angleDeg about the x, y or z axis
function quaternion(axis, angleDeg) {
  const half = angleDeg / 2 * Math.PI / 180;         // the half angle, in radians
  const q = { w: Math.cos(half), x: 0, y: 0, z: 0 };
  q[axis] = Math.sin(half);
  return q;
}

// an answer counts when it is within the tolerance of the exact value or of the rounded key
function isRight(it, typed) {
  return Math.abs(typed - it.exact) <= TOLERANCE + 1e-9 || Math.abs(typed - it.key) <= TOLERANCE + 1e-9;
}

function answerText(it) { return it.key.toFixed(1) + (it.unit === 'w' ? ' for w × 100' : ' degrees'); }
function answerLabel(it) { return it.unit === 'w' ? 'w × 100 =' : 'Angle (°) ='; }
function promptText(it) { return it.text; }

// ---------------------------------------------------------------------------
// Answer controls: a box to type a number in, and a Check button that commits it
// ---------------------------------------------------------------------------
let answerInput, checkBtn;
let inputNote = '';            // shown when the box does not hold a number

function createAnswerControls() {
  answerInput = createInput('');
  answerInput.attribute('inputmode', 'decimal');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter') onCheck(); });
  checkBtn = createButton('Check');
  checkBtn.mouseClicked(onCheck);
}

// returns the number that was typed, or null when the text is not a number
function parseNumber(s) {
  const t = String(s).trim().replace(',', '.').replace('−', '-');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return parseFloat(t);
}

function onCheck() {
  if (mode !== 'quiz' || phase !== 'ask') return;
  const v = parseNumber(answerInput.value());
  if (v === null) { inputNote = 'Type a number first, for example ' + EXAMPLE_NUMBER + '.'; return; }
  inputNote = '';
  onCommit(v);
}

function askNote() { return inputNote || (narrow ? '' : ASK_HINT); }
function feedbackExtra() { return lastRight ? '' : ' You typed ' + lastAnswer + '.'; }
function resetAnswerControls() { answerInput.value(''); inputNote = ''; }

function showAnswerControls(show) {
  [answerInput, checkBtn].forEach(c => (show ? c.show() : c.hide()));
}

function enableAnswerControls(on) {
  [answerInput, checkBtn].forEach(c => setEnabled(c, on));
}

function layoutAnswerControls() {
  const y = drawHeight + ROW1 + ROW_H;
  answerInput.position(ANSWER_LABEL_W + 10, y);
  answerInput.size(90);
  checkBtn.position(ANSWER_LABEL_W + 118, y);
}

// the label to the left of the answer box says what to type and in which unit
function drawAnswerLabels() {
  if (phase === 'done') return;
  txt(answerLabel(ITEMS[idx]), 10, drawHeight + ROW1 + ROW_H + 12, 'black');
}

// ===========================================================================
// Quiz engine: fixed order, one attempt per item, feedback after every commit
// ===========================================================================
let modeSelect, nextBtn;
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // in the quiz: 'ask', 'feedback' or 'done'
let idx = 0;                   // which item is shown
let correctCount = 0;
let lastRight = false;
let lastAnswer = null;
let missed = [];               // item numbers answered wrongly
let textOverflow = false;      // true when a text block runs past its panel (read by the layout test)

const ROW1 = 8, ROW_H = 35;    // control rows start 8 px below the drawing and are 35 px apart

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // every control is created here, before layoutControls() positions any of them
  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option(QUIZ_LABEL, 'quiz');
  modeSelect.selected('explore');
  modeSelect.attribute('aria-label', 'Mode');
  modeSelect.changed(() => setMode(modeSelect.value()));
  nextBtn = createButton('Next');
  nextBtn.mouseClicked(onNext);
  createAnswerControls();
  createExploreControls();

  setMode('explore');
  describe(DESCRIPTION);
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);
  txt(TITLE, canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  textOverflow = false;
  if (mode === 'explore') drawExplore(); else drawQuiz();
  if (mode === 'explore') drawExploreLabels(); else drawAnswerLabels();
}

function setMode(m) {
  mode = m;
  refreshControls();
}

// the learner commits one answer for the item that is shown
function onCommit(answer) {
  if (mode !== 'quiz' || phase !== 'ask') return;
  lastAnswer = answer;
  lastRight = isRight(ITEMS[idx], answer);
  if (lastRight) correctCount++; else missed.push(idx + 1);
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; missed = []; phase = 'ask';
  }
  resetAnswerControls();
  refreshControls();
}

function refreshControls() {
  const quiz = mode === 'quiz';
  showExploreControls(!quiz);
  showAnswerControls(quiz && phase !== 'done');
  enableAnswerControls(phase === 'ask');
  if (quiz) nextBtn.show(); else nextBtn.hide();
  setEnabled(nextBtn, phase !== 'ask');
  nextBtn.html(phase === 'done' ? 'Try again' : (idx === ITEMS.length - 1 ? 'See score' : 'Next ' + NOUN));
  layoutControls();
}

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 150 : 180);
  nextBtn.position(canvasWidth - widthOf(nextBtn) - 10, drawHeight + ROW1);
  layoutAnswerControls();
  layoutExploreControls();
}

// the width of a control, measured at the left edge so that the edge of the page cannot squeeze it
function widthOf(el) {
  el.position(0, drawHeight + ROW1);
  return el.elt.offsetWidth || 90;
}

function setEnabled(el, on) {
  if (on) el.removeAttribute('disabled'); else el.attribute('disabled', '');
}

function feedbackText(it) {
  const lead = lastRight ? 'Correct: ' + answerText(it) + '. ' : 'Not quite. ' + WRONG_LEAD + answerText(it) + '. ';
  return lead + it.why;
}

// The quiz text: the count, the question, and then a hint or the feedback. r is the panel rectangle.
function drawQuizPanel(r) {
  panelBox(r);
  const x = r.x + 10, w = r.w - 20, n = ITEMS.length;
  let y = r.y + 8;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + n, x, y, w, 'black', 18, true);
    y = para(ok ? 'Mastery reached.' : 'Mastery is ' + MASTERY + ' of ' + n + '. Press Try again.', x, y + 4, w,
      ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para(missed.length ? 'Missed: ' + NOUN + ' ' + missed.join(', ') + '.' : 'Nothing missed.', x, y + 4, w);
    y = para('Switch to Explore to keep experimenting.', x, y + 4, w);
    fits(y, r);
    return;
  }
  const it = ITEMS[idx];
  const head = NOUN.charAt(0).toUpperCase() + NOUN.slice(1) + ' ' + (idx + 1) + ' of ' + n;
  y = para(head + '     Correct: ' + correctCount + ' of ' + n, x, y, w, 'black', 16, true);
  y = para(promptText(it), x, y + 4, w);
  if (phase === 'ask') {
    const note = askNote();
    if (note) y = para(note, x, y + 4, w, 'dimgray');
  } else {
    y = para(feedbackText(it) + feedbackExtra(), x, y + 4, w, lastRight ? 'darkgreen' : 'firebrick');
  }
  fits(y, r);
}

// ---------------------------------------------------------------------------
// Text helpers and resize
// ---------------------------------------------------------------------------
function panelBox(r) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(r.x, r.y, r.w, r.h, 10);
}

function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  text(str, x, y);
  textStyle(NORMAL);
}

// splits a string into lines no wider than maxW pixels
function wrapLines(str, maxW, size, bold) {
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const out = [];
  String(str).split('\n').forEach(part => {
    let line = '';
    part.split(' ').forEach(word => {
      const trial = line ? line + ' ' + word : word;
      if (line && textWidth(trial) > maxW) { out.push(line); line = word; } else { line = trial; }
    });
    out.push(line);
  });
  textStyle(NORMAL);
  return out;
}

// draws a wrapped paragraph with its top at y and returns the y just below it
function para(str, x, y, w, col, size, bold) {
  size = size || defaultTextSize;
  const lineHeight = Math.round(size * 1.3);
  wrapLines(str, w, size, bold).forEach(ln => { txt(ln, x, y, col, LEFT, TOP, size, bold); y += lineHeight; });
  return y;
}

// records a text block that ran past the bottom of its panel
function fits(y, r) {
  if (y > r.y + r.h - 2) textOverflow = true;
}

// the drawing is split into a picture and a text panel: side by side when wide, stacked when narrow
function splitRegions(pictureFraction, narrowPictureHeight) {
  const top = 40, bottom = drawHeight - 8;
  if (narrow) {
    const py = top + narrowPictureHeight + 4;
    return { pic: { x: 0, y: top, w: canvasWidth, h: narrowPictureHeight },
             panel: { x: 8, y: py, w: canvasWidth - 16, h: bottom - py } };
  }
  const pw = Math.floor(canvasWidth * pictureFraction);
  return { pic: { x: 0, y: top, w: pw, h: drawHeight - top },
           panel: { x: pw + 8, y: top + 4, w: canvasWidth - pw - 16, h: bottom - top - 4 } };
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

// ---------------------------------------------------------------------------
// Explore controls
// ---------------------------------------------------------------------------
function createExploreControls() {
  axisSelect = createSelect();
  ['x', 'y', 'z'].forEach(a => axisSelect.option(a));
  axisSelect.selected('z');
  axisSelect.attribute('aria-label', 'Axis of the turn');
  angleSlider = createSlider(0, 180, 90, 5);
  angleSlider.attribute('aria-label', 'Angle of the turn in degrees');
}

function showExploreControls(show) {
  [axisSelect, angleSlider].forEach(c => (show ? c.show() : c.hide()));
}

function layoutExploreControls() {
  const y = drawHeight + ROW1 + ROW_H;
  axisSelect.position(52, y);
  axisSelect.size(52);
  angleSlider.position(222, y);
  angleSlider.size(max(60, canvasWidth - 222 - 25));
}

function drawExploreLabels() {
  const y = drawHeight + ROW1 + ROW_H + 11;
  txt('Axis:', 10, y);
  txt('Angle: ' + angleSlider.value() + '°', 122, y);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function f4(v) { return Math.abs(v) < 0.00005 ? '0' : v.toFixed(4); }

function drawExplore() {
  const sp = splitRegions(0.55, 204);
  const axis = axisSelect.value(), angle = angleSlider.value();
  const q = quaternion(axis, angle);
  drawQuaternionPicture(sp.pic, axis, angle, q);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  y = para('q = (w, x, y, z) = (' + [q.w, q.x, q.y, q.z].map(f4).join(', ') + ')', x, y, w, 'black', 16, true);
  y = para('w = cos(' + angle + '° / 2) = cos ' + angle / 2 + '° = ' + f4(q.w), x, y + 4, w, COS_COLOR);
  y = para(axis + ' = sin(' + angle + '° / 2) = sin ' + angle / 2 + '° = ' + f4(q[axis]), x, y + 2, w, SIN_COLOR);
  y = para('Back again: angle = 2 × arccos(w) = ' + angle + '°', x, y + 2, w);
  if (!narrow) {
    y = para('The length is always 1: w² + x² + y² + z² = 1.', x, y + 2, w);
    y = para('The quaternion uses half of the angle. No turn gives w = 1, and a half turn of 180° gives w = 0.', x, y + 8, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.45, 166);
  const c = narrow ? { x: 8, y: sp.pic.y + 4, w: canvasWidth - 16, h: sp.pic.h - 4 }
    : { x: 8, y: sp.pic.y + 4, w: sp.pic.w - 8, h: drawHeight - 8 - sp.pic.y - 4 };
  fill('#FFFDE7'); stroke('#BDBDBD'); strokeWeight(1);
  rect(c.x, c.y, c.w, c.h, 10);
  let y = para('Formulas for a unit quaternion', c.x + 12, c.y + 8, c.w - 24, 'black', 16, true) + 2;
  FORMULAS.forEach(f => { y = para(f, c.x + 12, y, c.w - 24) + (narrow ? 0 : 6); });
  fits(y, c);
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The picture: the four numbers, the turn, and the half angle with its cosine and sine
// ---------------------------------------------------------------------------
function drawQuaternionPicture(r, axis, angle, q) {
  // four boxes: w, x, y, z
  const bx = r.x + 10, bw = (r.w - 20 - 3 * 6) / 4, bh = 50, by = r.y + (narrow ? 2 : 14);
  ['w', 'x', 'y', 'z'].forEach((name, i) => {
    const used = name === 'w' || name === axis;
    fill('white'); stroke(name === 'w' ? COS_COLOR : (used ? SIN_COLOR : '#9E9E9E')); strokeWeight(used ? 3 : 1);
    rect(bx + i * (bw + 6), by, bw, bh, 6);
    txt(name, bx + i * (bw + 6) + bw / 2, by + 14, 'black', CENTER, CENTER, 16, true);
    txt(f4(q[name]), bx + i * (bw + 6) + bw / 2, by + 35, 'black', CENTER, CENTER);
  });

  const top = by + bh + (narrow ? 8 : 30);
  const R = narrow ? 52 : 82;
  const a = radians(angle), half = radians(angle / 2);

  // left: the whole turn, seen along the axis
  const c1 = { x: r.x + r.w * 0.25, y: top + R + 4 };
  fill('white'); stroke('#616161'); strokeWeight(1.5);
  circle(c1.x, c1.y, 2 * R);
  stroke('#9E9E9E'); drawingContext.setLineDash([4, 4]);
  line(c1.x, c1.y, c1.x + R, c1.y);
  drawingContext.setLineDash([]);
  if (angle > 0) {
    noFill(); stroke('#B71C1C'); strokeWeight(2);
    arc(c1.x, c1.y, R * 0.8, R * 0.8, -a, 0);
  }
  arrow(c1.x, c1.y, c1.x + R * Math.cos(a), c1.y - R * Math.sin(a), '#B71C1C');
  txt('turn of ' + angle + '° about ' + axis, c1.x, c1.y + R + 16, 'black', CENTER, CENTER);

  // right: the half angle in a quarter circle of radius 1; its cosine is w and its sine is the axis part
  const o = { x: r.x + r.w * 0.56, y: top + 2 * R + 4 };
  const Q = 2 * R;
  fill('white'); stroke('#616161'); strokeWeight(1.5);
  arc(o.x, o.y, 2 * Q, 2 * Q, -HALF_PI, 0, PIE);
  const p = { x: o.x + Q * Math.cos(half), y: o.y - Q * Math.sin(half) };
  stroke('#616161'); strokeWeight(2);
  line(o.x, o.y, p.x, p.y);
  stroke(COS_COLOR); strokeWeight(5);
  line(o.x, o.y, p.x, o.y);
  stroke(SIN_COLOR);
  line(p.x, o.y, p.x, p.y);
  fill('#212121'); noStroke();
  circle(p.x, p.y, 9);
  txt('half angle ' + angle / 2 + '°', o.x + Q / 2, o.y + 16, 'black', CENTER, CENTER);
  if (!narrow) {
    txt('w = cos, along the bottom', o.x, o.y + 40, COS_COLOR, LEFT, CENTER);
    txt(axis + ' = sin, straight up', o.x, o.y + 62, SIN_COLOR, LEFT, CENTER);
  }
}

function arrow(x1, y1, x2, y2, col) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  stroke(col); strokeWeight(3);
  line(x1, y1, x2, y2);
  line(x2, y2, x2 - 10 * Math.cos(ang - 0.4), y2 - 10 * Math.sin(ang - 0.4));
  line(x2, y2, x2 - 10 * Math.cos(ang + 0.4), y2 - 10 * Math.sin(ang + 0.4));
}
