// Plan Checker - p5.js MicroSim
// CANVAS_HEIGHT: 628
// Learning objective (Analyze, examine): examine eight pick-and-place plans written as lists of tool calls and
// name the problem with each, or say that the plan is valid, with at least 7 of 8 correct on the first attempt.
// Evidence: the outcome committed with Check for each plan. Explore mode is exploration, not evidence.
// The ten-step plan, the tools and the ranges are those of Chapters 15 and 16. The eight plans are in a fixed
// order, and each plan has at most one fault.
// MicroSim template version 2026.03

let drawHeight = 540;
let controlHeight = 88;

const TITLE = 'Plan Checker';
const PROMPT = 'What is wrong with this plan, if anything?';
const NOUN = 'Plan';                      // used in "Plan 3 of 8" and "Next plan"
const QUIZ_LABEL = 'Eight plans';         // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose an outcome…';
const WRONG_LEAD = 'Not quite. This plan is: ';
const HINT = 'Choose an outcome in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the model plan and the five checks again.';
const MASTERY = 7;
const DESCRIPTION = 'A quiz about checking a plan before the arm moves. Explore mode lists the ten-step pick-and-place ' +
  'plan of the chapter and the five checks. The quiz shows eight plans one at a time, each as a numbered list of ' +
  'steps. A menu chooses the outcome, a Check button commits it, and the feedback names the correct outcome and ' +
  'gives the reason.';

// the six outcomes
const OPTIONS = ['Valid plan', 'Missing status check', 'Gripper closed on approach', 'Value out of range',
  'No grasp check before lifting', 'Uses a tool that does not exist'];

const RANGES = 'Ranges of move_to_pose: x from 0.10 to 0.28 m, and z from 0.02 to 0.07 m.';
const RANGES_SHORT = 'Ranges: x 0.10 to 0.28 m, z 0.02 to 0.07 m.';     // for a narrow screen
function rangesText() { return narrow ? RANGES_SHORT : RANGES; }

// the ten-step plan of Chapter 16 for "put the red block in the bin"
const MODEL_PLAN = [
  { step: 'get_status', why: 'Look before moving' },
  { step: 'open_gripper', why: 'Open before approaching' },
  { step: 'move above the block', why: 'Approach from above' },
  { step: 'move down to the block', why: 'The fingers surround it' },
  { step: 'close_gripper', why: 'Grasp, and read holding_something' },
  { step: 'move above the block', why: 'Lift' },
  { step: 'move above the bin', why: 'Carry' },
  { step: 'move down into the bin', why: 'Lower' },
  { step: 'open_gripper', why: 'Release' },
  { step: 'go_home', why: 'Clear of the table' }
];

// the five checks, in the order in which they are made, and the outcome when each one fails
const CHECKS = [
  { text: 'Every tool exists.', fail: 'Uses a tool that does not exist' },
  { text: 'Every value is inside its range.', fail: 'Value out of range' },
  { text: 'The first step is get_status.', fail: 'Missing status check' },
  { text: 'The gripper is opened before the first move down.', fail: 'Gripper closed on approach' },
  { text: 'After close_gripper, holding_something is checked before any lift.', fail: 'No grasp check before lifting' }
];

// steps that the plans share. A "move" step is a call of the move_to_pose tool.
const ST = 'get_status', OP = 'open_gripper', CL = 'close_gripper', CK = 'check holding_something';
const DN = 'move down to the block', UP = 'move up', HOME = 'go_home';
function above(value) { return 'move above the block, with ' + value; }

// the eight plans, in fixed order: the steps, the correct outcome and the reason
const ITEMS = [
  { steps: [ST, OP, above('z = 0.07'), DN, CL, CK, UP, HOME],
    answer: 'Valid plan', why: 'Every rule is met and the order is safe.' },
  { steps: [OP, above('x = 0.22'), DN, CL, CK, UP],
    answer: 'Missing status check',
    why: 'The first step should be get_status, so that the plan starts from what the arm really reports.' },
  { steps: [ST, above('z = 0.07'), DN, CL, CK, UP],
    answer: 'Gripper closed on approach',
    why: 'The gripper was never opened, so the fingers would hit the block on the way down.' },
  { steps: [ST, OP, above('z = 0.01'), DN, CL, CK],
    answer: 'Value out of range', why: 'z = 0.01 is below the minimum of 0.02 m.' },
  { steps: [ST, OP, above('x = 0.22'), DN, CL, UP],
    answer: 'No grasp check before lifting', why: 'The plan lifts without reading whether the gripper holds something.' },
  { steps: [ST, OP, above('z = 0.07'), 'wave_hello', DN],
    answer: 'Uses a tool that does not exist', why: 'There is no tool called wave_hello.' },
  { steps: [ST, OP, above('x = 0.22'), DN, CL, CK, 'move above the bin', OP, HOME],
    answer: 'Valid plan', why: 'The grasp is checked and the order is safe.' },
  { steps: [ST, OP, above('x = 0.40'), DN, CL, CK],
    answer: 'Value out of range', why: 'x = 0.40 is above the maximum of 0.28 m.' }
];

// ---------------------------------------------------------------------------
// Explore: the model plan and the five checks
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16, rowH = 22;
  let y = top;

  // the model plan; a wide screen has room for the reason for each step
  let h = 36 + MODEL_PLAN.length * rowH + 8;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(narrow ? 'The model plan (move = move_to_pose)' : 'The model plan: put the red block in the bin (a move step calls move_to_pose)',
    x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  MODEL_PLAN.forEach((s, i) => {
    const cy = y + 36 + i * rowH + rowH / 2;
    txt((i + 1) + '.', x + 14, cy, 'black', LEFT, CENTER, 16, false);
    txt(s.step, x + 44, cy, 'midnightblue', LEFT, CENTER, 16, true);
    if (!narrow) txt(s.why, x + 290, cy, 'black', LEFT, CENTER, 16, false);
  });
  y += h + 8;

  // the checks
  textSize(16); textStyle(NORMAL);
  const failW = narrow ? 0 : max(CHECKS.map(c => textWidth(c.fail))) + 24;
  const checkW = w - 28 - failW;
  const hs = CHECKS.map((c, i) => paraHeight((i + 1) + '. ' + c.text, checkW, 16));
  h = 36 + hs.reduce((a, b) => a + b, 0) + 4 + paraHeight(rangesText(), w - 28, 16) + 8;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('The five checks, in this order', x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  if (!narrow) txt('If the check fails', x + w - 14, y + 10, 'dimgray', RIGHT, TOP, 16, true);
  let cy = y + 36;
  CHECKS.forEach((c, i) => {
    para((i + 1) + '. ' + c.text, x + 14, cy, checkW, 'black', 16);
    if (!narrow) txt(c.fail, x + w - 14, cy, 'firebrick', RIGHT, TOP, 16, false);
    cy += hs[i];
  });
  para(rangesText(), x + 14, cy + 4, w - 28, 'black', 16);
  y += h;
  if (y + 30 <= drawHeight - 4) {
    y = para('Press Start to check eight plans. Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.', x + 4, y + 8, w - 8,
      'dimgray', 16);
  }
  return y;
}

// ---------------------------------------------------------------------------
// One plan: a numbered list of steps
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  const rowH = narrow ? 22 : 24;
  const h = it.steps.length * rowH + 20;
  panel(x, y, w, h, 'white', 'silver', 1);
  it.steps.forEach((s, i) => {
    const cy = y + 10 + i * rowH + rowH / 2;
    txt((i + 1) + '.', x + 14, cy, 'black', LEFT, CENTER, 16, false);
    txt(s, x + 40, cy, 'midnightblue', LEFT, CENTER, 16, true);
  });
  return y + h;
}

// the ranges stay in view under every plan, at the bottom of the drawing area
function drawReference(yAbove) {
  const x = 8, w = canvasWidth - 16;
  const h = paraHeight(rangesText(), w - 28, 16) + 16;
  panel(x, drawHeight - 6 - h, w, h, 'white', 'silver', 1);
  para(rangesText(), x + 14, drawHeight - 6 - h + 9, w - 28, 'black', 16);
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
let modeSelect, answerSelect, actionBtn;

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;
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

  answerSelect = createSelect();
  answerSelect.changed(refreshControls);

  actionBtn = createButton('Start');
  actionBtn.mouseClicked(onAction);

  for (const el of [modeSelect, answerSelect, actionBtn]) el.style('font-size', '16px');

  layoutControls();
  loadOptions();
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
  y = para(PROMPT, x + 4, y, w - 8, 'black', 18, true) + 6;

  if (phase === 'feedback') {
    const col = lastRight ? 'darkgreen' : 'firebrick';
    const head = (lastRight ? 'Correct: ' : WRONG_LEAD) + it.answer + '.';
    const fh = paraHeight(head, w - 28, 16, true) + paraHeight(it.why, w - 28, 16) + 22;
    panel(x, y, w, fh, lastRight ? 'honeydew' : 'mistyrose', col, 2);
    const fy = para(head, x + 14, y + 12, w - 28, col, 16, true);
    para(it.why, x + 14, fy, w - 28, 'black', 16);
    y += fh;
  } else {
    y = para(HINT, x + 4, y, w - 8, 'dimgray', 16);
  }
  const used = drawReference(y);     // the height of a reference panel at the bottom of the drawing area, or 0
  return used ? y + 8 + used : y;
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
function keyText(it) { return it.answer; }

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
const ROW1 = 8, ROW2 = 48, CTRL_H = 30;

function layoutControls() {
  const bw = narrow ? 150 : 170;
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(bw, CTRL_H);
  actionBtn.position(canvasWidth - bw - 10, drawHeight + ROW1);
  actionBtn.size(bw, CTRL_H);
  const labelW = narrow ? 0 : 112;
  answerSelect.position(10 + labelW, drawHeight + ROW2);
  answerSelect.size(min(canvasWidth - 20 - labelW, 520), CTRL_H);
}

function drawControlLabels() {
  if (mode === 'quiz' && phase !== 'done' && !narrow) {
    txt('Your answer:', 10, drawHeight + ROW2 + CTRL_H / 2, 'black', LEFT, CENTER, 16, false);
  }
}

// fill the answer menu with the choices
function loadOptions() {
  answerSelect.elt.options.length = 0;
  answerSelect.option(CHOOSE, 'none');
  for (const name of OPTIONS) answerSelect.option(name, name);
  answerSelect.selected('none');
}

function setMode(m) {
  mode = m;
  modeSelect.selected(m);
  if (m === 'quiz') startQuiz();
  refreshControls();
}

function startQuiz() {
  idx = 0; correctCount = 0; results = []; phase = 'ask';
  loadOptions();
}

function setEnabled(el, on) {
  if (on) el.removeAttribute('disabled'); else el.attribute('disabled', '');
}

function refreshControls() {
  if (mode === 'explore' || phase === 'done') {
    answerSelect.hide();
    actionBtn.html(mode === 'explore' ? 'Start' : 'Try again');
    setEnabled(actionBtn, true);
    return;
  }
  answerSelect.show();
  if (phase === 'ask') {
    actionBtn.html('Check');
    setEnabled(answerSelect, true);
    setEnabled(actionBtn, answerSelect.value() !== 'none');
  } else {
    actionBtn.html(idx === ITEMS.length - 1 ? 'See score' : 'Next ' + NOUN.toLowerCase());
    setEnabled(answerSelect, false);
    setEnabled(actionBtn, true);
  }
}

function onAction() {
  if (mode === 'explore') { setMode('quiz'); return; }
  if (phase === 'ask') {
    if (answerSelect.value() === 'none') return;
    lastRight = answerSelect.value() === ITEMS[idx].answer;
    results[idx] = lastRight;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; loadOptions(); } else { phase = 'done'; }
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
