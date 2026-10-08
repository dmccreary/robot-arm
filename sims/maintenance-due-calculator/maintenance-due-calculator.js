// Maintenance Due Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 660
// Learning objective (Apply, calculate): calculate the hours left before a maintenance task is due, the percent
// of its interval used, and the weeks until it is due, to within 0.1 of the unit shown, in six problems, with at
// least 5 of 6 correct on the first attempt. Evidence: the number committed with Check for each problem.
// Explore mode (moving the sliders) is exploration, not evidence.
// Model (Chapter 18): hours since = hours now - last done; hours left = interval - hours since (below zero when
// overdue); percent used = 100 x hours since / interval; weeks = hours left / hours per week. A task is "soon"
// at 80 percent used and "due" at 100 percent.
// MicroSim template version 2026.03

let drawHeight = 500;
let controlHeight = 160;

const TITLE = 'Maintenance Due Calculator';
const NOUN = 'Problem';                   // used in "Problem 3 of 6" and "Next problem"
const QUIZ_LABEL = 'Six problems';        // the name of the quiz mode in the mode menu
const HINT = 'Type a number, then press Check. An answer within 0.1 of the correct value counts.';
const AGAIN_HINT = 'Switch to Explore to move the sliders and watch the task become due.';
const MASTERY = 5;
const DESCRIPTION = 'A calculator for a maintenance schedule that counts hours of use. In Explore mode three ' +
  'sliders set the hours of use now, the hours at which a task was last done and its interval. A bar shows how ' +
  'much of the interval is used, with the working and the state: ok, soon or due. The quiz gives six problems ' +
  'about hours left, percent used and weeks until due. A box takes the answer as a number, a Check button ' +
  'commits it, and the feedback shows the correct value and the working.';

// adjustable quantities of Explore mode (the chapter's Content table)
const NOW_MIN = 0, NOW_MAX = 200, NOW_DEFAULT = 42;            // hours of use now
const LAST_MIN = 0, LAST_MAX = 200, LAST_DEFAULT = 30;         // hours at which the task was last done
const INT_MIN = 10, INT_MAX = 100, INT_STEP = 5, INT_DEFAULT = 10;   // interval, hours
const SOON = 0.8;                                              // a task is "soon" at 80 percent of its interval

// the chapter's example schedule: task and interval in hours of use. They are not a manufacturer's figures.
const TASKS = [
  ['Check screws and connectors', 10], ['Inspect cables', 10], ['Check calibration drift', 25],
  ['Inspect printed parts', 25], ['Check servo play', 50], ['Full recalibration', 100]
];
const NOT_MAKER = 'These intervals are examples and not a manufacturer’s figures.';

const FORMULAS = [
  'hours since = hours now − last done',
  'hours left = interval − hours since',
  'percent used = 100 × hours since / interval',
  'weeks until due = hours left / hours per week'
];

// the six problems, in fixed order: the problem, the unit asked, the correct value and the working
const ITEMS = [
  { text: 'Inspect cables (every 10 h) was last done at 34 h, and the arm is now at 41 h. How many hours are left before it is due?',
    unit: 'hours', answer: 3.0, why: 'Hours since = 41 − 34 = 7, and 10 − 7 = 3.0 hours left.' },
  { text: 'Check calibration drift (every 25 h) was last done at 10 h, and the arm is now at 38 h. How many hours are left? (Use a negative number if it is overdue.)',
    unit: 'hours', answer: -3.0, why: 'Hours since = 28, and 25 − 28 = −3.0, so it is 3 hours overdue.' },
  { text: 'Check servo play (every 50 h) was last done at 0 h, and the arm is now at 42 h. What percent of the interval is used?',
    unit: 'percent', answer: 84.0,
    why: '100 × 42 / 50 = 84.0 percent, which is past the 80 percent mark, so it is “soon”.' },
  { text: 'Full recalibration (every 100 h) was last done at 60 h, and the arm is now at 130 h. How many hours are left?',
    unit: 'hours', answer: 30.0, why: 'Hours since = 70, and 100 − 70 = 30.0 hours left.' },
  { text: 'A class uses an arm for 6 hours a week, and “Check screws and connectors” (every 10 h) was just done. In how many weeks is it due?',
    unit: 'weeks', answer: 1.7, why: '10 / 6 = 1.67, which rounds to 1.7 weeks.' },
  { text: 'Inspect printed parts (every 25 h) was last done 9.5 hours ago. What percent of the interval is used?',
    unit: 'percent', answer: 38.0, why: '100 × 9.5 / 25 = 38.0 percent.' }
];

function promptFor(it) { return 'Answer in ' + it.unit + '.'; }

// ---------------------------------------------------------------------------
// Explore: hours now, last done and the interval, and the state of the task
// ---------------------------------------------------------------------------
let nowSlider, lastSlider, intSlider;
const SLIDER_ROWS = [50, 86, 122];
const STATE_FILL = { ok: 'seagreen', soon: 'orange', due: 'firebrick' };
const STATE_TEXT = { ok: 'darkgreen', soon: 'sienna', due: 'firebrick' };

function createExploreControls() {
  nowSlider = createSlider(NOW_MIN, NOW_MAX, NOW_DEFAULT, 1);
  lastSlider = createSlider(LAST_MIN, LAST_MAX, LAST_DEFAULT, 1);
  intSlider = createSlider(INT_MIN, INT_MAX, INT_DEFAULT, INT_STEP);
}

function layoutExploreControls() {
  const labelW = 150, sliderW = max(60, canvasWidth - labelW - 28);
  [nowSlider, lastSlider, intSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + SLIDER_ROWS[i]);
    s.size(sliderW);
  });
}

function showExploreControls(on) {
  for (const s of [nowSlider, lastSlider, intSlider]) { if (on) s.show(); else s.hide(); }
}

function drawExploreLabels() {
  txt('Hours now: ' + nowSlider.value() + ' h', 10, drawHeight + SLIDER_ROWS[0] + 11, 'black');
  txt('Last done at: ' + lastSlider.value() + ' h', 10, drawHeight + SLIDER_ROWS[1] + 11, 'black');
  txt('Interval: ' + intSlider.value() + ' h', 10, drawHeight + SLIDER_ROWS[2] + 11, 'black');
}

function minus(n) { return String(n).replace('-', '−'); }

function drawExplore(top) {
  const x = 8, w = canvasWidth - 16, tw = w - 28;
  // a task cannot have been done in the future
  const now = nowSlider.value();
  if (lastSlider.value() > now) lastSlider.value(now);
  const last = lastSlider.value(), interval = intSlider.value();
  const since = now - last, left = interval - since, pct = 100 * since / interval;
  const state = since >= interval ? 'due' : (since >= SOON * interval ? 'soon' : 'ok');
  let y = top;

  // how much of the interval is used, as a bar from "last done" to "due"
  const says = {
    ok: 'State: ok. Less than 80 percent of the interval is used.',
    soon: 'State: soon. The line on the bar marks 80 percent. Plan the task.',
    due: 'State: due. The whole interval is used, so do the task now.' + (left < 0 ? ' It is ' + (-left) + ' h overdue.' : '')
  }[state];
  let h = 10 + 26 + 18 + 28 + paraHeight(says, tw, 16, true) + 10;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('Interval used', x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  txt(pct.toFixed(1) + ' percent', x + w - 14, y + 10, STATE_TEXT[state], RIGHT, TOP, 16, true);
  const by = y + 36;
  stroke('silver'); strokeWeight(1); fill('whitesmoke');
  rect(x + 14, by, tw, 18, 4);
  if (pct > 0) {
    noStroke(); fill(STATE_FILL[state]);
    rect(x + 14, by, max(4, tw * min(pct, 100) / 100), 18, 4);
  }
  stroke('black'); strokeWeight(1.5);
  line(x + 14 + SOON * tw, by - 3, x + 14 + SOON * tw, by + 21);
  txt('last done at ' + last + ' h', x + 14, by + 24, 'black', LEFT, TOP, 16, false);
  txt('due at ' + (last + interval) + ' h', x + w - 14, by + 24, 'black', RIGHT, TOP, 16, false);
  para(says, x + 14, by + 18 + 28, tw, STATE_TEXT[state], 16, true);
  y += h + 8;

  // the working (a narrow screen puts the numbers on a line of their own)
  const work = [
    [FORMULAS[0], '= ' + now + ' − ' + last + ' = ' + since + ' h'],
    [FORMULAS[1], '= ' + interval + ' − ' + since + ' = ' + minus(left) + ' h'],
    [FORMULAS[2], '= 100 × ' + since + ' / ' + interval + ' = ' + pct.toFixed(1) + ' percent']
  ];
  const lines = [];
  for (const [rule, numbers] of work) { if (narrow) lines.push(rule, '      ' + numbers); else lines.push(rule + ' ' + numbers); }
  if (!narrow) lines.push(FORMULAS[3]);
  h = 20;
  for (const ln of lines) h += paraHeight(ln, tw, 16);
  panel(x, y, w, h, 'white', 'silver', 1);
  let ty = y + 10;
  for (const ln of lines) ty = para(ln, x + 14, ty, tw, 'black', 16);
  y += h + 8;

  // the example schedule: a small table on a wide screen, one sentence on a narrow one
  if (narrow) {
    // the tasks grouped by interval, for example "Every 10 h: check screws and connectors, inspect cables."
    const groups = {};
    for (const [name, hours] of TASKS) (groups[hours] = groups[hours] || []).push(name.toLowerCase());
    const sentence = Object.keys(groups).map(hours => 'Every ' + hours + ' h: ' + groups[hours].join(', ') + '.').join(' ') +
      ' ' + NOT_MAKER;
    h = paraHeight(sentence, tw, 16) + 20;
    panel(x, y, w, h, 'white', 'silver', 1);
    para(sentence, x + 14, y + 10, tw, 'black', 16);
  } else {
    const rows = Math.ceil(TASKS.length / 2), cw = tw / 2;
    h = 36 + rows * 24 + 4 + 22 + 10;
    panel(x, y, w, h, 'white', 'silver', 1);
    txt('The example schedule, in hours of use', x + 14, y + 10, 'black', LEFT, TOP, 16, true);
    TASKS.forEach((t, i) => {
      const cx = x + 14 + Math.floor(i / rows) * cw, cy = y + 36 + (i % rows) * 24 + 12;
      txt(t[0], cx, cy, 'black', LEFT, CENTER, 16, false);
      txt('every ' + t[1] + ' h', cx + cw - 30, cy, 'midnightblue', RIGHT, CENTER, 16, true);
    });
    txt(NOT_MAKER, x + 14, y + 36 + rows * 24 + 4, 'dimgray', LEFT, TOP, 16, false);
  }
  return y + h;
}

// ---------------------------------------------------------------------------
// One problem, and the formulas under it
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  return textPanel(it.text, x, y, w, narrow ? 16 : 18);
}

function drawReference(yAbove) {
  const x = 8, w = canvasWidth - 16;
  let h = 16;
  for (const ln of FORMULAS) h += paraHeight(ln, w - 28, 16);
  let y = drawHeight - 6 - h;
  panel(x, y, w, h, 'white', 'silver', 1);
  y += 9;
  for (const ln of FORMULAS) y = para(ln, x + 14, y, w - 28, 'black', 16);
  return h;
}

// ---------------------------------------------------------------------------
// Setup and the draw loop
// ---------------------------------------------------------------------------
let containerWidth;
let canvasWidth = 400;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// controls
let modeSelect, answerInput, actionBtn;

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;
const TOLERANCE = 0.1;         // an answer this close to the correct value counts as correct
let results = [];              // true or false for each committed answer
let layoutOverflow = 0;        // pixels of content that do not fit in the drawing area (0 when the layout fits)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option(QUIZ_LABEL, 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  answerInput = createInput('');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.style('box-sizing', 'border-box');
  answerInput.input(refreshControls);
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter') onAction(); });

  actionBtn = createButton('Start');
  actionBtn.mouseClicked(onAction);

  for (const el of [modeSelect, answerInput, actionBtn]) el.style('font-size', '16px');
  createExploreControls();

  layoutControls();
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
  const top = narrow ? 38 : 46;
  const yEnd = mode === 'explore' ? drawExplore(top) : (phase === 'done' ? drawDone(top) : drawQuiz(top));
  layoutOverflow = max(0, Math.ceil(yEnd - (drawHeight - 4)));
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The question screen: one item at a time
// ---------------------------------------------------------------------------
function drawQuiz(top) {
  const x = 8, w = canvasWidth - 16, n = ITEMS.length, it = ITEMS[idx];
  let y = top;
  txt(NOUN + ' ' + (idx + 1) + ' of ' + n, x + 4, y + 10, 'black', LEFT, CENTER, 16, true);
  txt('Correct: ' + correctCount + ' of ' + n, x + w - 4, y + 10, 'black', RIGHT, CENTER, 16, true);
  if (!narrow) drawDots(canvasWidth / 2, y + 10);
  y += 28;

  y = drawItem(it, x, y, w) + 12;
  y = para(promptFor(it), x + 4, y, w - 8, 'black', 18, true) + 6;

  if (phase === 'feedback') {
    const col = lastRight ? 'darkgreen' : 'firebrick';
    const head = (lastRight ? 'Correct: ' : 'Not quite. The answer is ') + answerText(it) + '.';
    const fh = paraHeight(head, w - 28, 16, true) + paraHeight(it.why, w - 28, 16) + 22;
    panel(x, y, w, fh, lastRight ? 'honeydew' : 'mistyrose', col, 2);
    const fy = para(head, x + 14, y + 12, w - 28, col, 16, true);
    para(it.why, x + 14, fy, w - 28, 'black', 16);
    y += fh;
  }
  const used = drawReference(y);     // the height of a reference panel at the bottom of the drawing area, or 0
  return used ? y + 8 + used : y;
}

// a white panel that holds one wrapped paragraph; returns the y just below the panel
function textPanel(str, x, y, w, size) {
  const h = paraHeight(str, w - 28, size) + 22;
  panel(x, y, w, h, 'white', 'silver', 1);
  para(str, x + 14, y + 12, w - 28, 'black', size);
  return y + h;
}

// one dot for each item: green when it was correct, red when it was not, white when it is still to come
function drawDots(cx, cy) {
  const n = ITEMS.length, step = 18;
  for (let i = 0; i < n; i++) {
    const done = i < results.length;
    stroke(i === idx ? 'black' : 'gray'); strokeWeight(i === idx ? 2 : 1);
    fill(done ? (results[i] ? 'seagreen' : 'firebrick') : 'white');
    circle(cx + (i - (n - 1) / 2) * step, cy, 11);
  }
}

// ---------------------------------------------------------------------------
// The score screen
// ---------------------------------------------------------------------------
function drawDone(top) {
  const x = 8, w = canvasWidth - 16, n = ITEMS.length, ok = correctCount >= MASTERY;
  let y = top;
  txt('Correct: ' + correctCount + ' of ' + n, canvasWidth / 2, y, 'black', CENTER, TOP, 20, true);
  y += 30;
  txt(ok ? 'Mastery reached. Well done!' : 'Mastery is ' + MASTERY + ' of ' + n + '. Try again.', canvasWidth / 2, y,
    ok ? 'darkgreen' : 'firebrick', CENTER, TOP, 18, true);
  y += 34;

  // the answer key, with a mark for each item. A wide screen has room for the reason beside each answer.
  textSize(16); textStyle(BOLD);
  const nameW = max(ITEMS.map((it, i) => textWidth((i + 1) + '. ' + keyText(it)))) + 40;
  textStyle(NORMAL);
  const whyW = w - 12 - nameW - 14;
  const withWhy = !narrow && whyW >= 240;
  const lineW = w - 24 - 26;
  const heights = ITEMS.map((it, i) => withWhy ? max(26, paraHeight(it.why, whyW, 16) + 4)
    : paraHeight((i + 1) + '. ' + keyText(it), lineW, 16) + 4);
  const h = heights.reduce((a, b) => a + b, 0) + 18;
  panel(x, y, w, h, 'white', 'silver', 1);
  let cy = y + 10;
  for (let i = 0; i < n; i++) {
    const cx = x + 12;
    drawMark(cx + 9, cy + 11, results[i]);
    para((i + 1) + '. ' + keyText(ITEMS[i]), cx + 26, cy + 1, withWhy ? nameW : lineW, 'black', 16, withWhy);
    if (withWhy) para(ITEMS[i].why, cx + nameW, cy + 1, whyW, 'black', 16);
    cy += heights[i];
  }
  y += h + 10;
  y = para(AGAIN_HINT, x + 4, y, w - 8, 'dimgray', 16);
  return y;
}

// the text of one line of the answer key
function keyText(it) { return answerText(it); }

// the correct value of a problem with one decimal place and its unit, for example "86.0 percent"
function answerText(it) { return it.answer.toFixed(1).replace('-', '−') + ' ' + it.unit; }

// a green disc with a check mark, or a red disc with a cross
function drawMark(cx, cy, ok) {
  noStroke(); fill(ok ? 'seagreen' : 'firebrick');
  circle(cx, cy, 18);
  stroke('white'); strokeWeight(2.5); noFill();
  if (ok) { line(cx - 4, cy, cx - 1, cy + 4); line(cx - 1, cy + 4, cx + 5, cy - 4); }
  else { line(cx - 4, cy - 4, cx + 4, cy + 4); line(cx - 4, cy + 4, cx + 4, cy - 4); }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 48, CTRL_H = 30, ANSWER_X = 118, ANSWER_W = 110;

function layoutControls() {
  const bw = narrow ? 150 : 170;
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(bw, CTRL_H);
  actionBtn.position(canvasWidth - bw - 10, drawHeight + ROW1);
  actionBtn.size(bw, CTRL_H);
  answerInput.position(ANSWER_X, drawHeight + ROW2);
  answerInput.size(ANSWER_W, CTRL_H);
  layoutExploreControls();
}

function drawControlLabels() {
  if (mode === 'explore') { drawExploreLabels(); return; }
  if (phase === 'done') return;
  const cy = drawHeight + ROW2 + CTRL_H / 2;
  txt('Your answer:', 10, cy, 'black', LEFT, CENTER, 16, false);
  txt(ITEMS[idx].unit, ANSWER_X + ANSWER_W + 10, cy, 'black', LEFT, CENTER, 16, true);
  para(HINT, 10, drawHeight + ROW2 + CTRL_H + 10, canvasWidth - 20, 'dimgray', 16);
}

function setMode(m) {
  mode = m;
  modeSelect.selected(m);
  if (m === 'quiz') startQuiz();
  refreshControls();
}

function startQuiz() {
  idx = 0; correctCount = 0; results = []; phase = 'ask';
  answerInput.value('');
}

function setEnabled(el, on) {
  if (on) el.removeAttribute('disabled'); else el.attribute('disabled', '');
}

// the number in the answer box, or null when the box does not hold a number
function typedValue() {
  const s = String(answerInput.value()).trim().replace(',', '.').replace('−', '-');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)/.test(s)) return null;
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

function refreshControls() {
  showExploreControls(mode === 'explore');
  if (mode === 'explore' || phase === 'done') {
    answerInput.hide();
    actionBtn.html(mode === 'explore' ? 'Start' : 'Try again');
    setEnabled(actionBtn, true);
    return;
  }
  answerInput.show();
  if (phase === 'ask') {
    actionBtn.html('Check');
    setEnabled(answerInput, true);
    setEnabled(actionBtn, typedValue() !== null);
  } else {
    actionBtn.html(idx === ITEMS.length - 1 ? 'See score' : 'Next ' + NOUN.toLowerCase());
    setEnabled(answerInput, false);
    setEnabled(actionBtn, true);
  }
}

function onAction() {
  if (mode === 'explore') { setMode('quiz'); return; }
  if (phase === 'ask') {
    const v = typedValue();
    if (v === null) return;
    lastRight = Math.abs(v - ITEMS[idx].answer) <= TOLERANCE + 1e-9;   // the small extra absorbs rounding in the subtraction
    results[idx] = lastRight;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; answerInput.value(''); } else { phase = 'done'; }
  } else {
    startQuiz();
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

// split a string into lines that are no wider than maxW
function wrapLines(str, maxW, size, bold) {
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let current = '';
  for (const word of String(str).split(' ')) {
    const trial = current ? current + ' ' + word : word;
    if (current && textWidth(trial) > maxW) { lines.push(current); current = word; } else { current = trial; }
  }
  lines.push(current);
  textStyle(NORMAL);
  return lines;
}

function lineHeight(size) { return Math.round((size || defaultTextSize) * 1.35); }

function paraHeight(str, maxW, size, bold) {
  return wrapLines(str, maxW, size, bold).length * lineHeight(size);
}

// draw wrapped text with its top-left corner at (x, y), and return the y just below the last line
function para(str, x, y, maxW, col, size, bold) {
  for (const ln of wrapLines(str, maxW, size, bold)) {
    txt(ln, x, y, col, LEFT, TOP, size, bold);
    y += lineHeight(size);
  }
  return y;
}

function panel(x, y, w, h, fillCol, strokeCol, weight) {
  fill(fillCol); stroke(strokeCol); strokeWeight(weight || 1);
  rect(x, y, w, h, 10);
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
