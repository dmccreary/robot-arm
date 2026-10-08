// Transform Chain Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 660
// Learning objective (Apply, calculate): calculate the tip position of a flat two-link arm from its joint
// angles using the forward kinematics equations, to within 0.001 m, in six problems, with at least 5 of 6
// correct on the first attempt. Evidence: the number committed with Check. Explore mode is not evidence.
// Model: x = l1 cos(theta1) + l2 cos(theta1 + theta2) and z = l1 sin(theta1) + l2 sin(theta1 + theta2),
// with l1 = l2 = 0.10 m. Angles are changed from degrees to radians before the sine and cosine are taken.
// The arm is a schematic drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Transform Chain Calculator';
const DESCRIPTION = 'A flat two-link robot arm drawn on a grid, with x forward and z up. Two dashed triangles ' +
  'show how far forward and how far up each link goes, and they add up to the position of the tip. In Explore ' +
  'mode two sliders set the joint angles. In the six problems the learner types one coordinate of the tip.';
const QUIZ_LABEL = 'Six problems';
const NOUN = 'problem';
const MASTERY = 5;
const WRONG_LEAD = 'The answer is ';
const ASK_HINT = 'Use the formula, type the number in metres, then press Check.';
const EXAMPLE_NUMBER = '0.125';
const ANSWER_LABEL_W = 66;

const LINK = 0.10;                // both links, in metres
const TOLERANCE = 0.001;          // metres
const EXTENT = 22;                // the plot shows 22 cm each way from the shoulder (the arm is drawn in cm)
const COLOR1 = '#1565C0';         // the first link's triangle
const COLOR2 = '#6A1B9A';         // the second link's triangle

// the six problems, in the chapter's fixed order. key is the answer rounded to a millimetre.
const ITEMS = [
  { t1: 0, t2: 0, ask: 'x', key: 0.200, why: 'Both links point forward: 0.1 + 0.1 = 0.200 m.' },
  { t1: 90, t2: 0, ask: 'z', key: 0.200, why: 'Both links point up: 0.1 + 0.1 = 0.200 m.' },
  { t1: 0, t2: 90, ask: 'z', key: 0.100,
    why: 'The first link is flat and the second points up: z = 0.1 sin 90 = 0.100 m.' },
  { t1: 45, t2: -90, ask: 'x', key: 0.141,
    why: 'The second link points at -45 degrees: x = 0.1 cos 45 + 0.1 cos(-45) = 0.141 m.' },
  { t1: 30, t2: 60, ask: 'x', key: 0.087, why: 'x = 0.1 cos 30 + 0.1 cos 90 = 0.0866 m.' },
  { t1: 60, t2: -60, ask: 'z', key: 0.087, why: 'z = 0.1 sin 60 + 0.1 sin 0 = 0.0866 m.' }
];

let t1Slider, t2Slider;

// forward kinematics of the flat two-link arm: angles in degrees, lengths in metres
function forward(t1, t2) {
  const a1 = t1 * Math.PI / 180;            // sine and cosine need radians
  const a12 = (t1 + t2) * Math.PI / 180;    // the second link points at theta1 + theta2
  const k = { x1: LINK * Math.cos(a1), z1: LINK * Math.sin(a1), x2: LINK * Math.cos(a12), z2: LINK * Math.sin(a12) };
  k.x = k.x1 + k.x2;
  k.z = k.z1 + k.z2;
  return k;
}

// an answer counts when it is within the tolerance of the exact value or of the rounded key
function isRight(it, typed) {
  const exact = forward(it.t1, it.t2)[it.ask];
  return Math.abs(typed - exact) <= TOLERANCE + 1e-9 || Math.abs(typed - it.key) <= TOLERANCE + 1e-9;
}

function answerText(it) { return it.key.toFixed(3) + ' m'; }
function answerLabel(it) { return it.ask + ' (m) ='; }

function promptText(it) {
  const what = it.ask === 'x' ? 'x, how far forward the tip is' : 'z, how high the tip is';
  return 'θ1 = ' + it.t1 + '° and θ2 = ' + it.t2 + '°. Both links are 0.10 m long. What is ' + what + ', in metres?';
}

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
  t1Slider = createSlider(-90, 180, 30, 5);
  t1Slider.attribute('aria-label', 'theta 1 in degrees');
  t2Slider = createSlider(-150, 150, 60, 5);
  t2Slider.attribute('aria-label', 'theta 2 in degrees');
}

function showExploreControls(show) {
  [t1Slider, t2Slider].forEach(s => (show ? s.show() : s.hide()));
}

function layoutExploreControls() {
  const labelW = 96;
  const w = max(60, canvasWidth - labelW - 25);
  t1Slider.position(labelW, drawHeight + ROW1 + ROW_H); t1Slider.size(w);
  t2Slider.position(labelW, drawHeight + ROW1 + 2 * ROW_H); t2Slider.size(w);
}

function drawExploreLabels() {
  txt('θ1: ' + t1Slider.value() + '°', 10, drawHeight + ROW1 + ROW_H + 11);
  txt('θ2: ' + t2Slider.value() + '°', 10, drawHeight + ROW1 + 2 * ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.55, 296);
  const t1 = t1Slider.value(), t2 = t2Slider.value();
  drawArmPlot(sp.pic, t1, t2, true);
  drawExplorePanel(sp.panel, t1, t2);
}

function drawQuiz() {
  const sp = splitRegions(0.55, 296);
  if (phase === 'done') {
    drawArmPlot(sp.pic, 30, 60, false);
  } else {
    // the tip's coordinates are the answer, so they appear only after the learner has committed
    drawArmPlot(sp.pic, ITEMS[idx].t1, ITEMS[idx].t2, phase === 'feedback');
  }
  drawQuizPanel(sp.panel);
}

function f3(v) { return (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3); }

// "30° + 60°" or "45° − 90°"
function sumText(a, b) { return a + '° ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + '°'; }

function drawExplorePanel(r, t1, t2) {
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const k = forward(t1, t2);
  let y = r.y + 8;
  y = para('Tip: x = ' + f3(k.x) + ' m, z = ' + f3(k.z) + ' m', x, y, w, 'black', 16, true);
  if (!narrow) y = para('x = l1 cos θ1 + l2 cos(θ1 + θ2)', x, y + 6, w, 'dimgray');
  y = para('x = 0.10 cos ' + t1 + '° + 0.10 cos ' + (t1 + t2) + '°\n   = ' + f3(k.x1) + ' + ' + f3(k.x2) + ' = ' +
    f3(k.x) + ' m', x, y + 2, w);
  if (!narrow) y = para('z = l1 sin θ1 + l2 sin(θ1 + θ2)', x, y + 6, w, 'dimgray');
  y = para('z = 0.10 sin ' + t1 + '° + 0.10 sin ' + (t1 + t2) + '°\n   = ' + f3(k.z1) + ' + ' + f3(k.z2) + ' = ' +
    f3(k.z) + ' m', x, y + 2, w);
  y = para('The second link points at θ1 + θ2 = ' + sumText(t1, t2) + ' = ' + (t1 + t2) + '°, not at θ2 alone.',
    x, y + 6, w);
  if (!narrow) {
    y = para('Change θ1 and the whole arm turns. Change θ2 and only the second link turns.', x, y + 6, w);
    y = para('The dashed triangles show how far forward and how far up each link goes. Their sides add up ' +
      'to x and z.', x, y + 6, w, 'dimgray');
  }
  fits(y, r);
}

// ---------------------------------------------------------------------------
// The arm on its grid
// ---------------------------------------------------------------------------
function drawArmPlot(r, t1, t2, showTip) {
  // the bottom strip of the picture is kept free for the caption
  const view = RobotArm.fixedView({ x: r.x, y: r.y, w: r.w, h: r.h - 24 }, EXTENT, { pad: 6 });
  const S = p => RobotArm.toScreen(view, p);
  const k = forward(t1, t2);
  const elbow = { x: k.x1 * 100, y: k.z1 * 100 };       // the picture is in centimetres
  const tip = { x: k.x * 100, y: k.z * 100 };
  const o = S({ x: 0, y: 0 });

  RobotArm.drawGrid(view, 5, 20);
  RobotArm.drawAxes(view, { x: 0, y: 0 }, 21.5, ' ', ' ');
  [-0.2, -0.1, 0.1, 0.2].forEach(v => {
    txt(String(v), o.x + v * 100 * view.scale, o.y + 13, 'dimgray', CENTER, CENTER);
    txt(String(v), o.x - 8, o.y - v * 100 * view.scale, 'dimgray', RIGHT, CENTER);
  });
  txt('x forward (m)', o.x + 21.5 * view.scale, o.y + 26, 'black', RIGHT, TOP);
  txt('z up (m)', o.x + 18, o.y - 21.5 * view.scale, 'black', LEFT, TOP);

  const arm = RobotArm.presets.twoLink(LINK * 100, LINK * 100, { shoulder: t1, elbow: t2 });
  RobotArm.draw(arm, view, {});

  // each link is a vector: its dashed triangle shows how far forward and how far up it goes
  triangle3(S({ x: 0, y: 0 }), S({ x: elbow.x, y: 0 }), S(elbow), COLOR1);
  triangle3(S(elbow), S({ x: tip.x, y: elbow.y }), S(tip), COLOR2);

  // theta1 is measured from the x axis, and theta2 from the line of the first link
  if (Math.abs(t1) >= 5) {
    RobotArm.drawAngleArc(view, { x: 0, y: 0 }, 0, t1, 26);
    tag('θ1', o.x + 46 * Math.cos(radians(t1 / 2)), o.y - 46 * Math.sin(radians(t1 / 2)), '#B71C1C');
  }
  if (Math.abs(t2) >= 5) {
    const far = S({ x: elbow.x * 1.45, y: elbow.y * 1.45 });
    const e = S(elbow);
    stroke('#B71C1C'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
    line(e.x, e.y, far.x, far.y);
    drawingContext.setLineDash([]);
    RobotArm.drawAngleArc(view, elbow, t1, t1 + t2, 22);
    tag('θ2', e.x + 42 * Math.cos(radians(t1 + t2 / 2)), e.y - 42 * Math.sin(radians(t1 + t2 / 2)), '#B71C1C');
  }

  if (showTip) {
    // the label sits beyond the tip, on the line of the second link, so that it never covers the arm
    const t = S(tip);
    const label = '(' + f3(k.x) + ', ' + f3(k.z) + ')';
    textSize(16);
    const half = textWidth(label) / 2 + 6;
    const lx = constrain(t.x + (half + 12) * Math.cos(radians(t1 + t2)), r.x + half + 2, r.x + r.w - half - 2);
    const ly = constrain(t.y - 30 * Math.sin(radians(t1 + t2)), r.y + 12, r.y + r.h - 36);
    tag(label, lx, ly, 'black');
  }
  const note = 'Schematic. 0° = forward, + = counter-clockwise.';
  const lines = wrapLines(note, r.w - 16, 16, false);
  para(note, r.x + 8, r.y + r.h - lines.length * 21 - 2, r.w - 16, 'dimgray');
}

// a short label on a white plate, centred on (x, y)
function tag(str, x, y, col) {
  textSize(16);
  const w = textWidth(str) + 10;
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}

// the forward and up sides of a link's triangle, dashed, from a to the corner c to b
function triangle3(a, c, b, col) {
  stroke(col); strokeWeight(2); noFill();
  drawingContext.setLineDash([6, 5]);
  line(a.x, a.y, c.x, c.y);
  line(c.x, c.y, b.x, b.y);
  drawingContext.setLineDash([]);
}
