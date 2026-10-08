// Evaluation Metrics Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 610
// Learning objective (Apply, calculate): calculate success rates, violation rates, mean results, ranges and
// changed-call rates from the results of agent tests, to within 0.1 of the unit shown, in six problems, with at
// least 5 of 6 correct on the first attempt. Evidence: the number committed with Check for each problem.
// Explore mode (changing the trials, successes and violations) is exploration, not evidence.
// Model: rate (percent) = 100 x count / trials; mean = sum / count; range = largest - smallest (Chapter 17).
// MicroSim template version 2026.03

let drawHeight = 450;
let controlHeight = 160;

const TITLE = 'Evaluation Metrics Calculator';
const NOUN = 'Problem';                   // used in "Problem 3 of 6" and "Next problem"
const QUIZ_LABEL = 'Six problems';        // the name of the quiz mode in the mode menu
const HINT = 'Type a number, then press Check. An answer within 0.1 of the correct value counts.';
const AGAIN_HINT = 'Switch to Explore to change the numbers and watch the two rates.';
const MASTERY = 5;
const DESCRIPTION = 'A calculator for the results of agent tests. In Explore mode three sliders set the number of ' +
  'trials, successes and violations, and two bars show the success rate and the violation rate with the working. ' +
  'The quiz gives six problems about rates, a mean and a range. A box takes the answer as a number, a Check ' +
  'button commits it, and the feedback shows the correct value and the working.';

// adjustable quantities of Explore mode (the chapter's Content table)
const T_MIN = 1, T_MAX = 200, T_DEFAULT = 40;        // trials
const S_MIN = 0, S_MAX = 200, S_DEFAULT = 26;        // successes
const V_MIN = 0, V_MAX = 200, V_DEFAULT = 0;         // violations

const FORMULAS = [
  'rate (percent) = 100 × count / trials',
  'mean = sum of the values / number of values',
  'range = largest value − smallest value'
];

// the six problems, in fixed order: the problem, the unit asked, the correct value and the working
const ITEMS = [
  { text: 'An agent finishes the task in 43 of 50 trials. What is the success rate?',
    unit: 'percent', answer: 86.0, why: '100 × 43 / 50 = 86.0 percent.' },
  { text: 'In the same 50 trials, 2 trials broke a safety rule. What is the violation rate?',
    unit: 'percent', answer: 4.0, why: '100 × 2 / 50 = 4.0 percent, and a safe design needs 0.' },
  { text: 'With a misbehaving model, 26 of 40 trials finish. What is the success rate?',
    unit: 'percent', answer: 65.0, why: '100 × 26 / 40 = 65.0 percent.' },
  { text: 'Five repeats of a move end with the tip at x = 220, 221, 219, 222 and 218 mm. What is the mean?',
    unit: 'mm', answer: 220.0, why: '(220 + 221 + 219 + 222 + 218) / 5 = 220.0 mm.' },
  { text: 'For the same five repeats (220, 221, 219, 222 and 218 mm), what is the range?',
    unit: 'mm', answer: 4.0, why: 'The largest is 222 and the smallest is 218, so the range is 4.0 mm.' },
  { text: 'A replay of 120 logged calls through a new safety layer refuses 9 that were allowed before. What percent of the calls changed?',
    unit: 'percent', answer: 7.5, why: '100 × 9 / 120 = 7.5 percent.' }
];

function promptFor(it) { return 'Answer in ' + it.unit + '.'; }

// ---------------------------------------------------------------------------
// Explore: trials, successes and violations, and the two rates
// ---------------------------------------------------------------------------
let tSlider, sSlider, vSlider;
const SLIDER_ROWS = [50, 86, 122];

function createExploreControls() {
  tSlider = createSlider(T_MIN, T_MAX, T_DEFAULT, 1);
  sSlider = createSlider(S_MIN, S_MAX, S_DEFAULT, 1);
  vSlider = createSlider(V_MIN, V_MAX, V_DEFAULT, 1);
}

function layoutExploreControls() {
  const labelW = 132, sliderW = max(60, canvasWidth - labelW - 28);
  [tSlider, sSlider, vSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + SLIDER_ROWS[i]);
    s.size(sliderW);
  });
}

function showExploreControls(on) {
  for (const s of [tSlider, sSlider, vSlider]) { if (on) s.show(); else s.hide(); }
}

function drawExploreLabels() {
  txt('Trials: ' + tSlider.value(), 10, drawHeight + SLIDER_ROWS[0] + 11, 'black');
  txt('Successes: ' + sSlider.value(), 10, drawHeight + SLIDER_ROWS[1] + 11, 'black');
  txt('Violations: ' + vSlider.value(), 10, drawHeight + SLIDER_ROWS[2] + 11, 'black');
}

function drawExplore(top) {
  const x = 8, w = canvasWidth - 16;
  // a count cannot be larger than the number of trials
  const T = tSlider.value();
  if (sSlider.value() > T) sSlider.value(T);
  if (vSlider.value() > T) vSlider.value(T);
  const S = sSlider.value(), V = vSlider.value();
  const sRate = 100 * S / T, vRate = 100 * V / T;
  const of = narrow ? ' of ' + T + ' = ' : ' of ' + T + ' trials = ';
  let y = top;

  // the two rates as bars
  panel(x, y, w, 128, 'white', 'silver', 1);
  drawBar('Success rate', S + of + sRate.toFixed(1) + ' percent', sRate, 'seagreen', x + 14, y + 10, w - 28);
  drawBar('Violation rate', V + of + vRate.toFixed(1) + ' percent', vRate, 'firebrick', x + 14, y + 68, w - 28);
  y += 128 + 8;

  // the working, the safety note and the other two formulas
  // (a narrow screen puts the numbers on a line of their own)
  const sWork = '= 100 × ' + S + ' / ' + T + ' = ' + sRate.toFixed(1) + ' percent';
  const vWork = '= 100 × ' + V + ' / ' + T + ' = ' + vRate.toFixed(1) + ' percent';
  const sRule = 'success rate = 100 × successes / trials', vRule = 'violation rate = 100 × violations / trials';
  const lines = narrow ? [sRule, '      ' + sWork, vRule, '      ' + vWork] : [sRule + ' ' + sWork, vRule + ' ' + vWork];
  const note = V === 0
    ? 'No trial broke a safety rule. A safe design needs a violation rate of 0, whatever the success rate is.'
    : 'A safety rule was broken in ' + V + (V === 1 ? ' trial' : ' trials') + '. A high success rate does not make this agent safe.';
  const tw = w - 28;
  let h = 20 + 12;
  for (const ln of lines.concat(FORMULAS.slice(1))) h += paraHeight(ln, tw, 16);
  h += paraHeight(note, tw, 16, true);
  panel(x, y, w, h, 'white', 'silver', 1);
  let ty = y + 10;
  for (const ln of lines) ty = para(ln, x + 14, ty, tw, 'black', 16);
  ty = para(note, x + 14, ty + 6, tw, V === 0 ? 'darkgreen' : 'firebrick', 16, true) + 6;
  for (const ln of FORMULAS.slice(1)) ty = para(ln, x + 14, ty, tw, 'black', 16);
  y += h;

  // one dot for each trial, on a screen that has room for it
  const caption = 'One dot for each trial: green finished the task, gray did not, and a red ring broke a safety rule.';
  const cols = Math.floor(tw / 14), rows = Math.ceil(T / cols);
  const capH = paraHeight(caption, tw, 16), gh = 10 + capH + 4 + rows * 14 + 10;
  if (!narrow && y + 8 + gh <= drawHeight - 6) {
    y += 8;
    panel(x, y, w, gh, 'white', 'silver', 1);
    para(caption, x + 14, y + 10, tw, 'black', 16);
    for (let i = 0; i < T; i++) {
      const cx = x + 21 + (i % cols) * 14, cy = y + 10 + capH + 4 + 7 + Math.floor(i / cols) * 14;
      const broke = i >= T - V;          // the violations are drawn on the last trials
      stroke(broke ? 'firebrick' : 'gray'); strokeWeight(broke ? 2 : 0.5);
      fill(i < S ? 'seagreen' : 'gainsboro');
      circle(cx, cy, broke ? 9 : 10);
    }
    y += gh;
  }
  return y;
}

// a labeled bar that is filled to the given percent
function drawBar(label, value, percent, col, x, y, w) {
  txt(label, x, y, 'black', LEFT, TOP, 16, true);
  txt(value, x + w, y, 'black', RIGHT, TOP, 16, false);
  stroke('silver'); strokeWeight(1); fill('whitesmoke');
  rect(x, y + 26, w, 18, 4);
  if (percent > 0) {
    noStroke(); fill(col);
    rect(x, y + 26, max(4, w * percent / 100), 18, 4);
  }
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
