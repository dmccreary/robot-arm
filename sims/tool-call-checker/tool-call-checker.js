// Tool Call Checker - p5.js MicroSim
// CANVAS_HEIGHT: 598
// Learning objective (Analyze, examine): examine eight tool calls against the schema of the arm's move_to_pose
// tool and identify the first problem with each, or that it is valid, with at least 7 of 8 correct on the first
// attempt. Evidence: the outcome committed with Check for each call. Explore mode is exploration, not evidence.
// The schema and the order of the checks are those of the lab's validator in Chapter 15. The eight calls are in
// a fixed order, and the outcome of a call is the first check that fails.
// MicroSim template version 2026.03

let drawHeight = 510;
let controlHeight = 88;

const TITLE = 'Tool Call Checker';
const PROMPT = 'What is wrong with this call?';
const NOUN = 'Call';                      // used in "Call 3 of 8" and "Next call"
const QUIZ_LABEL = 'Eight calls';         // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose an outcome…';
const WRONG_LEAD = 'Not quite. This call is: ';
const HINT = 'Choose an outcome in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the schema and the checks again.';
const MASTERY = 7;
const DESCRIPTION = 'A quiz about checking tool calls. Explore mode shows the schema of the move_to_pose tool, ' +
  'with the allowed range of x, y, z and speed_dps, and the six checks in order. The quiz shows eight tool calls ' +
  'one at a time, with the schema below each one. A menu chooses the outcome, a Check button commits it, and the ' +
  'feedback names the correct outcome and gives the reason.';

// the seven outcomes
const OPTIONS = ['Valid', 'Not valid JSON', 'Unknown tool', 'Missing parameter', 'Unknown parameter', 'Wrong type',
  'Out of range'];

// the schema of move_to_pose (Chapter 15): every value is a number, and x, y and z are required
const SCHEMA = [
  { name: 'x', range: '0.10 to 0.28 m', short: '0.10 to 0.28 m', need: 'required' },
  { name: 'y', range: '−0.15 to 0.15 m', short: '−0.15 to 0.15 m', need: 'required' },
  { name: 'z', range: '0.02 to 0.07 m', short: '0.02 to 0.07 m', need: 'required' },
  { name: 'speed_dps', range: '5 to 60 degrees per second', short: '5 to 60 deg/s', need: 'optional' }
];
const TOOL_NAMES = 'get_status, move_to_pose, open_gripper, close_gripper, go_home, stop';

// the checks, in the order in which they are made, and the outcome when each one fails
const CHECKS = [
  { text: 'The text is valid JSON.', fail: 'Not valid JSON' },
  { text: 'The tool exists.', fail: 'Unknown tool' },
  { text: 'Every required parameter is present.', fail: 'Missing parameter' },
  { text: 'Every parameter is known.', fail: 'Unknown parameter' },
  { text: 'Every value is a number.', fail: 'Wrong type' },
  { text: 'Every value is inside its range.', fail: 'Out of range' }
];

// the eight calls, in fixed order: tool name, the arguments as the model sent them, outcome and reason
const ITEMS = [
  { tool: 'move_to_pose', args: '{"x": 0.2, "y": 0.1, "z": 0.05}',
    answer: 'Valid', why: 'Every parameter is present, a number and inside its range.' },
  { tool: 'move_to_pose', args: '{"x": 0.2, "y": 0.1}',
    answer: 'Missing parameter', why: 'z is required and is not there.' },
  { tool: 'move_to_pose', args: '{"x": "0.2", "y": 0.1, "z": 0.05}',
    answer: 'Wrong type', why: 'x is the text "0.2" and not a number.' },
  { tool: 'move_to_pose', args: '{"x": 0.35, "y": 0.1, "z": 0.05}',
    answer: 'Out of range', why: 'x = 0.35 is above the maximum of 0.28.' },
  { tool: 'wave_hello', args: '{}',
    answer: 'Unknown tool', why: 'There is no tool with that name.' },
  { tool: 'move_to_pose', args: '{"x": 0.2, "y": 0.1, "z": 0.05, "speed": 30}',
    answer: 'Unknown parameter', why: 'The parameter is called speed_dps, and speed is not a parameter of the tool.' },
  { tool: 'move_to_pose', args: '{x: 0.2}',
    answer: 'Not valid JSON', why: 'The names are not in double quotes, so the text cannot be parsed.' },
  { tool: 'move_to_pose', args: '{"x": 0.2, "y": 0.1, "z": 0.01, "speed_dps": 30}',
    answer: 'Out of range', why: 'z = 0.01 is below the minimum of 0.02.' }
];

// ---------------------------------------------------------------------------
// Explore: the schema and the order of the checks
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16;
  let y = top;
  y += drawSchema(x, y, w) + 8;

  const foot = 'The outcome is the first check that fails. If no check fails, the call is valid.';
  const h = 36 + CHECKS.length * 24 + 4 + paraHeight(foot, w - 28, 16) + 8;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('The checks, in this order', x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  if (!narrow) txt('If the check fails', x + w - 14, y + 10, 'dimgray', RIGHT, TOP, 16, true);
  CHECKS.forEach((c, i) => {
    const cy = y + 36 + i * 24 + 12;
    txt((i + 1) + '. ' + c.text, x + 14, cy, 'black', LEFT, CENTER, 16, false);
    if (!narrow) txt(c.fail, x + w - 14, cy, 'firebrick', RIGHT, CENTER, 16, false);
  });
  para(foot, x + 14, y + 36 + CHECKS.length * 24 + 4, w - 28, 'black', 16);
  y += h;
  if (y + 30 <= drawHeight - 4) {
    y = para('Press Start to check eight calls. Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.', x + 4, y + 8, w - 8,
      'dimgray', 16);
  }
  return y;
}

function toolsLine() { return 'The arm’s tools: ' + TOOL_NAMES + '.'; }

function schemaHeight(w) {
  return 36 + SCHEMA.length * 24 + 4 + paraHeight(toolsLine(), w - 28, 16) + 8;
}

// the schema of move_to_pose as a small table; returns its height
function drawSchema(x, y, w) {
  const h = schemaHeight(w);
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(narrow ? 'move_to_pose (each value is a number)' : 'The schema of move_to_pose (each value must be a number)',
    x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  SCHEMA.forEach((p, i) => {
    const cy = y + 36 + i * 24 + 12;
    txt(p.name, x + 14, cy, 'midnightblue', LEFT, CENTER, 16, true);
    txt(narrow ? p.short : p.range, x + (narrow ? 110 : 150), cy, 'black', LEFT, CENTER, 16, false);
    txt(p.need, x + w - 14, cy, p.need === 'required' ? 'black' : 'dimgray', RIGHT, CENTER, 16, false);
  });
  para(toolsLine(), x + 14, y + 36 + SCHEMA.length * 24 + 4, w - 28, 'black', 16);
  return h;
}

// ---------------------------------------------------------------------------
// One call: the tool name and the arguments
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  const size = narrow ? 16 : 18, lh = lineHeight(size), labelW = narrow ? 94 : 112;
  const argW = w - 28 - labelW;
  const h = lh + paraHeight(it.args, argW, size) + 22;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('Tool:', x + 14, y + 12, 'dimgray', LEFT, TOP, size, false);
  txt(it.tool, x + 14 + labelW, y + 12, 'midnightblue', LEFT, TOP, size, true);
  txt('Arguments:', x + 14, y + 12 + lh, 'dimgray', LEFT, TOP, size, false);
  para(it.args, x + 14 + labelW, y + 12 + lh, argW, 'midnightblue', size, true);
  return y + h;
}

// the schema stays in view under every call, at the bottom of the drawing area
function drawReference(yAbove) {
  const x = 8, w = canvasWidth - 16, h = schemaHeight(w);
  drawSchema(x, drawHeight - 6 - h, w);
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
