// Manipulability Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 610
// Learning objective (Apply, calculate): calculate the manipulability of a two-link arm from its link lengths
// and elbow bend, and compare two poses, to within 0.1 of the unit shown, in six problems, with at least 5 of 6
// correct on the first attempt. Evidence: the number committed with Check. Explore mode is not evidence.
// Model: w = l1 x l2 x |sin(bend)|. The ellipse is the set of tip speeds that joint speeds of length 1 produce:
// its half-widths are the singular values of the two-link Jacobian, and their ratio is the condition number.
// The arm is a schematic drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Manipulability Calculator';
const DESCRIPTION = 'A two-link robot arm with a shaded ellipse at its tip. The ellipse shows how fast the tip can ' +
  'move in each direction: round when the elbow is bent a right angle and flat when the arm is straight. In ' +
  'Explore mode two sliders set the elbow bend and the shoulder angle. In the six problems the learner types ' +
  'the manipulability, or a ratio of two manipulabilities.';
const QUIZ_LABEL = 'Six problems';
const NOUN = 'problem';
const MASTERY = 5;
const WRONG_LEAD = 'The answer is ';
const ASK_HINT = 'Use w = l1 × l2 × |sin(bend)|, then press Check.';
const EXAMPLE_NUMBER = '12.5';
const ANSWER_LABEL_W = 124;
const TOLERANCE = 0.1;

const L1 = 0.116, L2 = 0.135;     // metres: the SO-101's upper arm and forearm
const ELLIPSE_SCALE = 0.4;        // the ellipse is drawn at 0.4 of its true size so that it fits beside the arm

// manipulability of a two-link arm: lengths in metres, bend in degrees
function manipulability(l1, l2, bend) {
  return l1 * l2 * Math.abs(Math.sin(bend * Math.PI / 180));
}

// the six problems, in the chapter's fixed order. key is the answer as the chapter prints it, and exact is
// the same answer worked out in full. Problems 1 to 5 ask for w x 1000, and problem 6 for a ratio.
const ITEMS = [
  { text: 'Links of 0.116 m and 0.135 m, elbow bent 90 degrees. What is w? (Answer as w × 1000.)',
    l1: 0.116, l2: 0.135, bend: 90, unit: 'w', key: 15.7, exact: 1000 * manipulability(0.116, 0.135, 90),
    why: 'w = 0.116 × 0.135 × 1 = 0.01566, so 15.7 in units of 0.001.' },
  { text: 'The same arm, elbow bent 30 degrees. What is w? (Answer as w × 1000.)',
    l1: 0.116, l2: 0.135, bend: 30, unit: 'w', key: 7.8, exact: 1000 * manipulability(0.116, 0.135, 30),
    why: 'w = 0.01566 × 0.5 = 0.00783, so 7.8.' },
  { text: 'The same arm, elbow bent 10 degrees. What is w? (Answer as w × 1000.)',
    l1: 0.116, l2: 0.135, bend: 10, unit: 'w', key: 2.7, exact: 1000 * manipulability(0.116, 0.135, 10),
    why: 'w = 0.01566 × sin(10 degrees) = 0.01566 × 0.1736 = 0.00272, so 2.7.' },
  { text: 'The same arm, elbow bent 45 degrees. What is w? (Answer as w × 1000.)',
    l1: 0.116, l2: 0.135, bend: 45, unit: 'w', key: 11.1, exact: 1000 * manipulability(0.116, 0.135, 45),
    why: 'w = 0.01566 × 0.7071 = 0.01107, so 11.1.' },
  { text: 'Links of 0.2 m and 0.2 m, elbow bent 60 degrees. What is w? (Answer as w × 1000.)',
    l1: 0.2, l2: 0.2, bend: 60, unit: 'w', key: 34.6, exact: 1000 * manipulability(0.2, 0.2, 60),
    why: 'w = 0.2 × 0.2 × 0.866 = 0.03464, so 34.6.' },
  { text: 'How many times smaller is w with the elbow bent 5 degrees than with it bent 90 degrees?',
    l1: 0.116, l2: 0.135, bend: 5, unit: 'times', key: 11.5,
    exact: manipulability(0.116, 0.135, 90) / manipulability(0.116, 0.135, 5),
    why: 'w(90) / w(5) = 1 / sin(5 degrees) = 1 / 0.08716 = 11.5.' }
];

let bendSlider, shoulderSlider;

// the two-link Jacobian at a pose (degrees), its singular values and the direction of the larger one
function ellipseOf(l1, l2, shoulder, bend) {
  const a1 = shoulder * Math.PI / 180, a12 = (shoulder + bend) * Math.PI / 180;
  const j11 = -l1 * Math.sin(a1) - l2 * Math.sin(a12), j12 = -l2 * Math.sin(a12);
  const j21 = l1 * Math.cos(a1) + l2 * Math.cos(a12), j22 = l2 * Math.cos(a12);
  // J times its transpose is a symmetric 2 by 2 matrix: its eigenvalues are the squared singular values
  const a = j11 * j11 + j12 * j12, b = j11 * j21 + j12 * j22, d = j21 * j21 + j22 * j22;
  const mean = (a + d) / 2, spread = Math.sqrt((a - d) * (a - d) / 4 + b * b);
  const big = Math.sqrt(mean + spread), small = Math.sqrt(Math.max(0, mean - spread));
  return { big: big, small: small, angle: 0.5 * Math.atan2(2 * b, a - d),
           cond: small < 1e-9 ? Infinity : big / small };
}

// an answer counts when it is within the tolerance of the exact value or of the rounded key
function isRight(it, typed) {
  return Math.abs(typed - it.exact) <= TOLERANCE + 1e-9 || Math.abs(typed - it.key) <= TOLERANCE + 1e-9;
}

function answerText(it) { return it.key.toFixed(1) + (it.unit === 'w' ? ' for w × 1000' : ' times'); }
function answerLabel(it) { return it.unit === 'w' ? 'w × 1000 =' : 'Times smaller ='; }
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
  bendSlider = createSlider(0, 180, 90, 1);
  bendSlider.attribute('aria-label', 'Elbow bend in degrees');
  shoulderSlider = createSlider(0, 180, 30, 5);
  shoulderSlider.attribute('aria-label', 'Shoulder angle in degrees');
}

function showExploreControls(show) {
  [bendSlider, shoulderSlider].forEach(s => (show ? s.show() : s.hide()));
}

function layoutExploreControls() {
  const labelW = 150;
  const w = max(60, canvasWidth - labelW - 25);
  bendSlider.position(labelW, drawHeight + ROW1 + ROW_H); bendSlider.size(w);
  shoulderSlider.position(labelW, drawHeight + ROW1 + 2 * ROW_H); shoulderSlider.size(w);
}

function drawExploreLabels() {
  txt('Elbow bend: ' + bendSlider.value() + '°', 10, drawHeight + ROW1 + ROW_H + 11);
  txt('Shoulder: ' + shoulderSlider.value() + '°', 10, drawHeight + ROW1 + 2 * ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function fmtCond(c) {
  if (!isFinite(c) || c > 99999) return 'infinite';
  return c >= 100 ? String(Math.round(c)) : c.toFixed(1);
}

function drawExplore() {
  const sp = splitRegions(0.55, 244);
  const bend = bendSlider.value(), shoulder = shoulderSlider.value();
  drawArmPicture(sp.pic, L1, L2, shoulder, bend);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const m = manipulability(L1, L2, bend);
  const sine = Math.abs(Math.sin(bend * Math.PI / 180));
  let y = r.y + 8;
  y = para('w × 1000 = ' + (m * 1000).toFixed(1), x, y, w, 'black', 18, true);
  y = para('w = l1 × l2 × |sin(bend)|', x, y + 4, w, 'dimgray');
  y = para('w = 0.116 × 0.135 × ' + sine.toFixed(4) + ' = ' + m.toFixed(5), x, y + 2, w);
  y = para('Condition number = ' + fmtCond(ellipseOf(L1, L2, shoulder, bend).cond), x, y + 4, w);
  if (!narrow) {
    y = para('The ellipse shows how fast the tip can move in each direction. It is round when w is large and flat when w is zero.', x, y + 8, w);
    y = para('Move the shoulder slider: the ellipse turns, and w does not change. Straighten the elbow: the ellipse goes flat.', x, y + 8, w, 'dimgray');
  } else {
    y = para('The shoulder turns the ellipse. Only the bend changes w.', x, y + 4, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.55, 244);
  if (phase === 'done') {
    drawArmPicture(sp.pic, L1, L2, 30, 90);
  } else {
    const it = ITEMS[idx];
    drawArmPicture(sp.pic, it.l1, it.l2, 30, it.bend);
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The picture: the arm, its elbow bend, and the manipulability ellipse at the tip
// ---------------------------------------------------------------------------
function drawArmPicture(r, l1, l2, shoulder, bend) {
  const a = { x: r.x, y: r.y, w: r.w, h: r.h - 24 };
  // the view holds the arm in every pose the sliders allow; a longer arm is drawn at the same size on screen
  const scale = Math.min(a.w / 64, a.h / 54) * (L1 + L2) / (l1 + l2);
  const view = { ox: a.x + a.w / 2, oy: a.y + a.h * 0.68, scale: scale, rect: a };
  const S = p => RobotArm.toScreen(view, p);

  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(a.x + 1, a.y, a.w - 2, a.h);
  drawingContext.clip();

  const arm = RobotArm.presets.twoLink(l1 * 100, l2 * 100, { shoulder: shoulder, elbow: bend });
  const grow = (l1 + l2) / (L1 + L2);              // keeps the joints and links the same size on screen
  arm.jointRadius = 1.1 * grow;
  arm.links.forEach(l => { l.thickness = 2.0 * grow; });
  arm.base.width *= grow; arm.base.height *= grow; arm.effector.thickness *= grow;
  const ps = RobotArm.pose(arm);
  const elbow = ps.joints[1], tip = ps.tip;

  // the dashed line continues the upper arm: the bend is measured from it
  const e = S(elbow);
  const far = S({ x: elbow.x + 7 * grow * Math.cos(radians(shoulder)), y: elbow.y + 7 * grow * Math.sin(radians(shoulder)) });
  stroke('#B71C1C'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
  line(e.x, e.y, far.x, far.y);
  drawingContext.setLineDash([]);
  RobotArm.draw(arm, view, {});
  if (bend >= 4) RobotArm.drawAngleArc(view, elbow, shoulder, shoulder + bend, 22);

  // the ellipse, turned to the direction in which the tip moves fastest
  const el = ellipseOf(l1, l2, shoulder, bend);
  const t = S(tip);
  push();
  translate(t.x, t.y);
  rotate(-el.angle);                        // the screen's y axis points down
  fill('rgba(0,137,123,0.30)'); stroke('#004D40'); strokeWeight(2);
  const k = 100 * scale * ELLIPSE_SCALE;
  ellipse(0, 0, 2 * el.big * k, Math.max(2, 2 * el.small * k));
  pop();
  drawingContext.restore();

  const mid = radians(shoulder + bend / 2);
  tag('bend ' + bend + '°', constrain(e.x + 58 * Math.cos(mid), a.x + 44, a.x + a.w - 44),
    constrain(e.y - 44 * Math.sin(mid), a.y + 14, a.y + a.h - 14), '#B71C1C');
  txt('Schematic. The ellipse is not to scale.', r.x + 8, r.y + r.h - 12, 'dimgray', LEFT, CENTER);
}

// a short label on a white plate, centred on (x, y)
function tag(str, x, y, col) {
  textSize(16);
  const w = textWidth(str) + 10;
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}
