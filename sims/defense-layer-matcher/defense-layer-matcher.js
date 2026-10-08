// Defense Layer Matcher - p5.js MicroSim
// CANVAS_HEIGHT: 648
// Learning objective (Analyze, attribute): attribute each of eight agent requests to the one safety layer that
// refuses it first, among six layers, with at least 7 of 8 correct on the first attempt.
// Evidence: the layer committed with Check for each request. Explore mode is exploration, not evidence.
// The layers, their order and their limits are those of the SafetyLayer in the lab of Chapter 17. The eight
// requests are in a fixed order, and each one is refused by exactly one layer first.
// MicroSim template version 2026.03

let drawHeight = 560;
let controlHeight = 88;

const TITLE = 'Defense Layer Matcher';
const PROMPT = 'Which layer refuses this request first?';
const NOUN = 'Request';                   // used in "Request 3 of 8" and "Next request"
const QUIZ_LABEL = 'Eight requests';      // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose a layer…';
const WRONG_LEAD = 'Not quite. This request is refused by: ';
const HINT = 'Any value that is not mentioned is inside every limit. Choose a layer in the menu below, then press Check.';
const AGAIN_HINT = 'Switch to Explore to read the six layers and their limits again.';
const MASTERY = 7;
const DESCRIPTION = 'A quiz about layers of safety. Explore mode lists six safety layers in the order in which a ' +
  'request meets them: role, rate limit, schema, workspace, confirmation and stop state, each with its rule and ' +
  'its limits. The quiz shows eight requests one at a time, with the limits below each one. A menu chooses the ' +
  'layer that refuses the request first, a Check button commits it, and the feedback names the layer and gives ' +
  'the reason.';

// the six layers, in the order in which a request meets them (short is a tighter wording for a narrow screen)
const LAYERS = [
  { name: 'Role', rule: 'A reader may only look and stop. An operator may use all six tools of the arm.' },
  { name: 'Rate limit', rule: 'Only a few calls are allowed in one second. The rest are refused.' },
  { name: 'Schema', rule: 'The tool must exist, and every value must be inside the schema’s range: x 0.10 to 0.28 m, ' +
    'y −0.15 to 0.15 m, z 0.02 to 0.07 m, speed 5 to 60 degrees per second.',
    short: 'The tool must exist, and every value must fit the schema: x 0.10 to 0.28, y −0.15 to 0.15, z 0.02 to 0.07 m, speed 5 to 60 deg/s.' },
  { name: 'Workspace', rule: 'Where the arm may go today: x 0.12 to 0.26 m, y −0.12 to 0.12 m, z 0.02 to 0.07 m.',
    short: 'Today’s limits: x 0.12 to 0.26, y −0.12 to 0.12, z 0.02 to 0.07 m.' },
  { name: 'Confirmation', rule: 'A person must approve a move faster than 40 degrees per second or lower than z = 0.03 m.',
    short: 'A person must approve a move faster than 40 deg/s or lower than z = 0.03 m.' },
  { name: 'Stop state', rule: 'In the tool itself: a stopped arm refuses everything but a status report.' }
];
const OPTIONS = LAYERS.map(l => l.name);

// the limits, shown under every request (a shorter wording is used on a narrow screen)
const LIMITS = [
  'Order of the layers: role, rate limit, schema, workspace, confirmation, stop state.',
  'Schema: x 0.10 to 0.28 m, y −0.15 to 0.15 m, z 0.02 to 0.07 m, speed 5 to 60 degrees per second.',
  'Today’s workspace: x 0.12 to 0.26 m, y −0.12 to 0.12 m, z 0.02 to 0.07 m.',
  'Confirmation: a move faster than 40 degrees per second, or lower than z = 0.03 m.'
];
const LIMITS_SHORT = [
  'Order: role, rate limit, schema, workspace, confirmation, stop state.',
  'Schema: x 0.10 to 0.28, y −0.15 to 0.15, z 0.02 to 0.07 m, speed 5 to 60 deg/s.',
  'Workspace: x 0.12 to 0.26, y −0.12 to 0.12, z 0.02 to 0.07 m.',
  'Confirmation: faster than 40 deg/s, or z below 0.03 m.'
];

// the eight requests, in fixed order: the request, the layer that refuses it first, and the reason
const ITEMS = [
  { text: 'An agent running as a reader is told by a web page to open the gripper.',
    answer: 'Role', why: 'The reader role may only look and stop.' },
  { text: 'An operator agent asks for move_to_pose with z = 0.5.',
    answer: 'Schema', why: 'z = 0.5 is outside the schema’s range of 0.02 to 0.07 m.' },
  { text: 'An operator agent asks for move_to_pose with x = 0.27.',
    answer: 'Workspace', why: 'The schema allows x up to 0.28, and today’s workspace stops at 0.26.' },
  { text: 'An operator agent asks for move_to_pose with speed 60 degrees per second.',
    answer: 'Confirmation', why: 'A speed above 40 degrees per second is risky and needs a person.' },
  { text: 'An operator agent calls get_status 100 times in one second.',
    answer: 'Rate limit', why: 'Calls beyond the limit in a second are refused.' },
  { text: 'An operator agent asks for go_home after the arm was stopped.',
    answer: 'Stop state', why: 'A stopped arm refuses everything but a status report.' },
  { text: 'An operator agent calls a tool named run_python.',
    answer: 'Schema', why: 'There is no such tool, and an unknown tool fails the tool list and schema check.' },
  { text: 'An operator agent asks for move_to_pose with z = 0.025.',
    answer: 'Confirmation', why: 'A z below 0.03 m is a low move and needs a person.' }
];

// ---------------------------------------------------------------------------
// Explore: the six layers in order
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16, gap = narrow ? 3 : 10, ruleW = w - 28 - 26;
  let y = top;
  let h = 36 + 8;
  const ruleOf = l => (narrow && l.short) || l.rule;
  for (const l of LAYERS) h += 22 + paraHeight(ruleOf(l), ruleW, 16) + gap;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(narrow ? 'Six layers, in this order' : 'A request meets six layers, in this order. The first one that objects refuses it.',
    x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  let ry = y + 36;
  LAYERS.forEach((l, i) => {
    txt((i + 1) + '.', x + 14, ry, 'midnightblue', LEFT, TOP, 16, true);
    txt(l.name, x + 40, ry, 'midnightblue', LEFT, TOP, 16, true);
    ry = para(ruleOf(l), x + 40, ry + 22, ruleW, 'black', 16) + gap;
  });
  y += h;
  if (y + 30 <= drawHeight - 4) {
    y = para('Press Start to match eight requests to their layers. Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.',
      x + 4, y + 8, w - 8, 'dimgray', 16);
  }
  return y;
}

// one request
function drawItem(it, x, y, w) {
  return textPanel(it.text, x, y, w, narrow ? 16 : 18);
}

// the order and the limits stay in view under every request, at the bottom of the drawing area
function drawReference(yAbove) {
  const x = 8, w = canvasWidth - 16, lines = narrow ? LIMITS_SHORT : LIMITS;
  let h = 16 - 3;
  for (const ln of lines) h += paraHeight(ln, w - 28, 16) + 3;
  let y = drawHeight - 6 - h;
  panel(x, y, w, h, 'white', 'silver', 1);
  y += 9;
  for (const ln of lines) y = para(ln, x + 14, y, w - 28, 'black', 16) + 3;
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
