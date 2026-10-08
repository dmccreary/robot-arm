// Polynomial Order Chooser - p5.js MicroSim
// CANVAS_HEIGHT: 595
// Learning objective (Analyze, differentiate): differentiate eight trajectory requirements as needing a cubic,
// a quintic or a cubic spline, with at least 7 of 8 correct on the first attempt. Evidence: the kind committed
// for each requirement. Reading the comparison in Explore mode is exploration, not evidence.
// Rule: count the conditions. Four (position and speed at both ends) mean a cubic, six (acceleration as well)
// mean a quintic, and several via points mean a cubic spline.
// The example curves are a rest-to-rest move from 0 to 1 in 2 s, and a clamped cubic spline through the
// chapter's via points 0.0, 0.5, 0.4 and 1.0 at 0, 1, 2 and 3 s.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 510;
let controlHeight = 85;           // 2 rows x 35 + 10 = 80, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Polynomial Order Chooser';
const DESCRIPTION = 'Two small graphs show the position and the acceleration of an example move against time, ' +
  'for a cubic, a quintic or a cubic spline, beside a list of what each kind can control. In the quiz a card ' +
  'states one trajectory requirement and the learner chooses the kind of trajectory it needs.';
const QUIZ_LABEL = 'Eight requirements';
const NOUN = 'requirement';
const MASTERY = 7;
const WRONG_LEAD = 'This needs a: ';
const ASK_HINT = 'Count the conditions that the move must meet, and look for via points.';
const CHOICES = ['Cubic', 'Quintic', 'Cubic spline'];

// what each kind controls (shown in Explore mode). The brief forms are for a narrow canvas.
const KINDS = [
  { does: '4 conditions: the position and the speed at both ends. One move.',
    note: 'Its acceleration jumps at the start and at the end.',
    brief: '4 conditions: position and speed at both ends.', briefNote: 'Its acceleration jumps at the ends.' },
  { does: '6 conditions: the position, the speed and the acceleration at both ends. One move.',
    note: 'Its acceleration can start and end at zero, so the force builds up gently.',
    brief: '6 conditions: position, speed and acceleration at both ends.',
    briefNote: 'Its acceleration can start and end at zero.' },
  { does: 'Several via points, joined so that the speed and the acceleration stay continuous.',
    note: 'It is a chain of cubics, one between each pair of via points.',
    brief: 'Several via points, joined smoothly.',
    briefNote: 'A chain of cubics. Speed and acceleration stay continuous.' }
];
const VIA = [0.0, 0.5, 0.4, 1.0];   // the chapter's via points, one second apart

// the eight requirements, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { text: 'Move one joint from 0 to 1 radian in 2 seconds, starting and ending at rest.', answer: 0,
    why: 'Position and speed at both ends are four conditions, and a cubic has four coefficients.' },
  { text: 'The same move, but the acceleration must also be zero at both ends.', answer: 1,
    why: 'Six conditions need six coefficients.' },
  { text: 'The move starts while the joint is already turning at 0.5 radians per second, and ends at rest.', answer: 0,
    why: 'The start speed is one of the four conditions of a cubic.' },
  { text: 'The move must continue exactly from the end acceleration of the previous move.', answer: 1,
    why: 'Matching an acceleration is a fifth and sixth condition.' },
  { text: 'The joint must pass through four via points at set times, with a continuous speed and acceleration.', answer: 2,
    why: 'Several via points joined smoothly are what a spline is for.' },
  { text: 'A rest-to-rest move where the force must build up gently, with no jump in acceleration at the start.', answer: 1,
    why: 'Zero acceleration at the ends is what the quintic can control.' },
  { text: 'A quick rest-to-rest move where only the position and the speed at the ends matter.', answer: 0,
    why: 'Four conditions are enough, and a cubic is the simpler choice.' },
  { text: 'A path that passes through six via points and ends at rest.', answer: 2,
    why: 'A chain of cubics avoids the swings of a high-degree polynomial through many points.' }
];

let kindSelect;
let splineM = null;               // the spline's accelerations at its via points

function promptText(it) {
  return 'Which kind of trajectory does this need?';
}

// ---------------------------------------------------------------------------
// Answer controls: one button for each choice. Pressing a button commits it.
// ---------------------------------------------------------------------------
let choiceBtns = [];

function createAnswerControls() {
  choiceBtns = CHOICES.map((label, i) => {
    const b = createButton(label);
    b.mouseClicked(() => onCommit(i));
    return b;
  });
}

function isRight(it, answer) { return answer === it.answer; }
function answerText(it) { return CHOICES[it.answer]; }
function askNote() { return narrow ? '' : ASK_HINT; }
function feedbackExtra() { return ''; }
function resetAnswerControls() {}
function drawAnswerLabels() {}

function showAnswerControls(show) {
  choiceBtns.forEach(b => (show ? b.show() : b.hide()));
}

function enableAnswerControls(on) {
  choiceBtns.forEach(b => setEnabled(b, on));
}

// the buttons flow from left to right and wrap onto a new row when the canvas is narrow
function layoutAnswerControls() {
  let x = 10, row = 1;
  choiceBtns.forEach(b => {
    const w = widthOf(b);
    if (x > 10 && x + w > canvasWidth - 10) { x = 10; row++; }
    b.position(x, drawHeight + ROW1 + row * ROW_H);
    x += w + 8;
  });
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
// The three example trajectories: each returns { pos, acc } at time t in seconds
// ---------------------------------------------------------------------------
// accelerations at the points of a clamped cubic spline (zero speed at both ends, points 1 s apart)
function splineAccelerations(ys) {
  const n = ys.length, diag = [], rhs = [];
  for (let i = 0; i < n; i++) {
    if (i === 0) { diag.push(2); rhs.push(6 * (ys[1] - ys[0])); }
    else if (i === n - 1) { diag.push(2); rhs.push(-6 * (ys[n - 1] - ys[n - 2])); }
    else { diag.push(4); rhs.push(6 * (ys[i + 1] - 2 * ys[i] + ys[i - 1])); }
  }
  // every off-diagonal entry is 1, so the system is solved by elimination down and substitution back up
  for (let i = 1; i < n; i++) { const f = 1 / diag[i - 1]; diag[i] -= f; rhs[i] -= f * rhs[i - 1]; }
  const m = new Array(n);
  m[n - 1] = rhs[n - 1] / diag[n - 1];
  for (let i = n - 2; i >= 0; i--) m[i] = (rhs[i] - m[i + 1]) / diag[i];
  return m;
}

function example(kind, t) {
  if (kind === 2) {
    const i = Math.min(VIA.length - 2, Math.floor(t)), u = t - i, m = splineM;
    return { pos: m[i] * Math.pow(1 - u, 3) / 6 + m[i + 1] * Math.pow(u, 3) / 6 +
                  (VIA[i] - m[i] / 6) * (1 - u) + (VIA[i + 1] - m[i + 1] / 6) * u,
             acc: m[i] * (1 - u) + m[i + 1] * u };
  }
  const T = 2, s = t / T;         // a move from 0 to 1 in 2 seconds, from rest to rest
  if (kind === 0) return { pos: 3 * s * s - 2 * s * s * s, acc: (6 - 12 * s) / (T * T) };
  return { pos: 10 * Math.pow(s, 3) - 15 * Math.pow(s, 4) + 6 * Math.pow(s, 5),
           acc: (60 * s - 180 * s * s + 120 * s * s * s) / (T * T) };
}

// ---------------------------------------------------------------------------
// Explore control: which kind to draw
// ---------------------------------------------------------------------------
function createExploreControls() {
  splineM = splineAccelerations(VIA);
  kindSelect = createSelect();
  CHOICES.forEach((name, i) => kindSelect.option(name, String(i)));
  kindSelect.selected('0');
  kindSelect.attribute('aria-label', 'Kind of trajectory to draw');
}

function showExploreControls(show) {
  if (show) kindSelect.show(); else kindSelect.hide();
}

function layoutExploreControls() {
  kindSelect.position(64, drawHeight + ROW1 + ROW_H);
  kindSelect.size(140);
}

function drawExploreLabels() {
  txt('Draw:', 10, drawHeight + ROW1 + ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.55, 184);
  const kind = Number(kindSelect.value());
  drawGraphs(sp.pic, kind);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  y = para('How many conditions must be met?', x, y, w, 'black', 16, true) + 4;
  CHOICES.forEach((name, i) => {
    const top = y;
    y = para(name, x + 10, y, w - 10, 'black', 16, true);
    y = para(narrow ? KINDS[i].brief : KINDS[i].does, x + 10, y, w - 10);
    // a narrow canvas shows the extra note for the chosen kind only
    if (i === kind || !narrow) {
      y = para(narrow ? KINDS[i].briefNote : KINDS[i].note, x + 10, y, w - 10, i === kind ? '#0D47A1' : 'dimgray');
    }
    if (i === kind) {
      fill('#FFC107'); stroke('#212121'); strokeWeight(1);
      rect(x - 3, top, 7, y - top - 3, 2);
    }
    y += narrow ? 4 : 8;
  });
  fits(y, r);
}

function drawQuiz() {
  const card = { x: 8, y: 44, w: canvasWidth - 16, h: narrow ? 128 : 84 };
  fill('#FFFDE7'); stroke('#BDBDBD'); strokeWeight(1);
  rect(card.x, card.y, card.w, card.h, 10);
  const text = phase === 'done' ? 'All eight requirements have been sorted.' : ITEMS[idx].text;
  const y = para(text, card.x + 14, card.y + 12, card.w - 28, 'black', 18);
  fits(y, card);
  drawQuizPanel({ x: 8, y: card.y + card.h + 4, w: canvasWidth - 16, h: drawHeight - 8 - (card.y + card.h + 4) });
}

// ---------------------------------------------------------------------------
// The graphs: position and acceleration of the example move against time
// ---------------------------------------------------------------------------
function drawGraphs(r, kind) {
  const T = kind === 2 ? 3 : 2;
  const pad = 10, gap = 12;
  let boxes;
  if (narrow) {
    const bw = (r.w - 2 * pad - gap) / 2;
    boxes = [{ x: r.x + pad, y: r.y + 26, w: bw, h: r.h - 54 }, { x: r.x + pad + bw + gap, y: r.y + 26, w: bw, h: r.h - 54 }];
  } else {
    const bh = (r.h - 110) / 2;
    boxes = [{ x: r.x + pad, y: r.y + 30, w: r.w - 2 * pad, h: bh }, { x: r.x + pad, y: r.y + 30 + bh + 34, w: r.w - 2 * pad, h: bh }];
  }
  // the largest acceleration sets the height of the acceleration graph
  let peak = 0;
  for (let i = 0; i <= 60; i++) peak = Math.max(peak, Math.abs(example(kind, T * i / 60).acc));

  [['Position', 'pos', -0.12, 1.12, '#F57C00'], ['Acceleration', 'acc', -peak * 1.2, peak * 1.2, '#3F51B5']].forEach((g, n) => {
    const b = boxes[n];
    fill('white'); stroke('#9E9E9E'); strokeWeight(1);
    rect(b.x, b.y, b.w, b.h, 4);
    txt(g[0], b.x, b.y - 13, 'black', LEFT, CENTER, 16, true);
    const X = t => b.x + 8 + (t + 0.12 * T) / (1.24 * T) * (b.w - 16);     // a little time is shown before and after
    const Y = v => b.y + b.h - (v - g[2]) / (g[3] - g[2]) * b.h;
    stroke('#BDBDBD'); strokeWeight(1);
    line(b.x, Y(0), b.x + b.w, Y(0));
    // before the move and after it the joint is at rest, so a jump in acceleration shows as a vertical line
    const end = example(kind, T);
    noFill(); stroke(g[4]); strokeWeight(3);
    beginShape();
    vertex(X(-0.12 * T), Y(0));
    vertex(X(0), Y(0));
    for (let i = 0; i <= 60; i++) vertex(X(T * i / 60), Y(example(kind, T * i / 60)[g[1]]));
    vertex(X(T), Y(g[1] === 'pos' ? end.pos : 0));
    vertex(X(1.12 * T), Y(g[1] === 'pos' ? end.pos : 0));
    endShape();
    // the ends of the move, and the via points of the spline
    const marks = kind === 2 ? [0, 1, 2, 3] : [0, T];
    fill('#212121'); noStroke();
    marks.forEach(t => circle(X(t), Y(example(kind, t)[g[1]]), 9));
  });
  const last = boxes[1];
  const note = kind === 2 ? 'Dots: the four via points. Time runs from left to right.'
    : 'Dots: the two ends of the move. Time runs from left to right.';
  txt(narrow ? 'Dots: ' + (kind === 2 ? 'the via points.' : 'the ends of the move.') : note,
    r.x + pad, last.y + last.h + 15, 'dimgray', LEFT, CENTER);
}
