// HTTP Status Reader - p5.js MicroSim
// CANVAS_HEIGHT: 548
// Learning objective (Understand, interpret): interpret eight HTTP status codes returned by the arm's tool server
// or a model provider by choosing what the client should do, with at least 7 of 8 correct on the first attempt.
// Evidence: the action committed with Check for each response. Explore mode is exploration, not evidence.
// The meanings of the codes are those of the status table in Chapter 16. The eight responses are in a fixed order.
// MicroSim template version 2026.03

let drawHeight = 460;
let controlHeight = 88;

const TITLE = 'HTTP Status Reader';
const PROMPT = 'What should the client do?';
const NOUN = 'Response';                  // used in "Response 3 of 8" and "Next response"
const QUIZ_LABEL = 'Eight responses';     // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose an action…';
const WRONG_LEAD = 'Not quite. The right action is: ';
const HINT = 'Choose an action in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the status table again.';
const MASTERY = 7;
// a shorter menu label for the longest action, used on a narrow screen
const MENU_SHORT = { 'Server problem: retry after a wait, then report': 'Server problem: wait, retry, report' };
const DESCRIPTION = 'A quiz about HTTP status codes. Explore mode lists nine status codes with their meanings, in ' +
  'three groups by first digit: 2 for success, 4 for a fault of the client and 5 for a fault of the server. The ' +
  'quiz shows eight responses one at a time. A menu chooses what the client should do, a Check button commits ' +
  'the choice, and the feedback names the right action and gives the reason.';

// the six actions
const OPTIONS = ['Use the answer', 'Fix the request', 'Fix the key or the permission', 'Fix the address or the name',
  'Slow down and retry later', 'Server problem: retry after a wait, then report'];

// the status table of Chapter 16, grouped by the first digit of the code
const GROUPS = [
  { head: '2xx: success', col: 'seagreen', rows: [
    { code: 200, text: 'It worked' }] },
  { head: '4xx: the client sent something wrong', col: 'sienna', rows: [
    { code: 400, text: 'The request was malformed or invalid' },
    { code: 401, text: 'The key is missing or wrong' },
    { code: 403, text: 'The key is fine but is not allowed to do this' },
    { code: 404, text: 'No such address or tool' },
    { code: 409, text: 'A conflict with the state of the thing (the arm is stopped)' },
    { code: 429, text: 'Too many requests' }] },
  { head: '5xx: the server had a problem', col: 'purple', rows: [
    { code: 500, text: 'The server failed' },
    { code: 529, text: 'The service is overloaded (a code that Anthropic uses)' }] }
];
const DIGIT_RULE = 'First digit: 2 means success, 4 means that the client sent something wrong, and 5 means that ' +
  'the server had a problem.';

// the eight responses, in fixed order: the code, where it came from, the right action and the reason
const ITEMS = [
  { code: 200, from: 'from POST /call/get_status',
    answer: 'Use the answer', why: 'The call worked.' },
  { code: 400, from: 'with the message "x = 0.35 is outside the allowed range 0.1 to 0.28"',
    answer: 'Fix the request', why: 'The request had an invalid value, and the message says how to correct it.' },
  { code: 401, from: 'from GET /tools',
    answer: 'Fix the key or the permission', why: 'The X-API-Key header is missing or wrong.' },
  { code: 403, from: 'from a model provider, with a valid key',
    answer: 'Fix the key or the permission', why: 'The key is valid but is not allowed to do this.' },
  { code: 404, from: 'from POST /call/wave_hello',
    answer: 'Fix the address or the name', why: 'There is no tool with that name.' },
  { code: 429, from: 'from a model provider',
    answer: 'Slow down and retry later', why: 'The client sent too many requests.' },
  { code: 500, from: 'from a model provider',
    answer: 'Server problem: retry after a wait, then report',
    why: 'The failure is on the server’s side, and a retry after a wait often works.' },
  { code: 529, from: 'from a model provider',
    answer: 'Slow down and retry later', why: 'The service is overloaded, so retry after a wait.' }
];
for (const it of ITEMS) it.key = it.code + ': ' + it.answer;     // the line of the answer key on the score screen

// ---------------------------------------------------------------------------
// Explore: the status table
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16, codeW = 52, textW = w - 28 - codeW;
  let y = top;
  // measure first, so that the panel can be drawn behind the rows
  let h = 36 + 8;
  for (const g of GROUPS) {
    h += 24;
    for (const r of g.rows) h += paraHeight(r.text, textW, 16);
    h += 4;
  }
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(narrow ? 'The first digit says whose problem it is' : 'The status table: the first digit says whose problem it is',
    x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  let ry = y + 36;
  for (const g of GROUPS) {
    txt(g.head, x + 14, ry + 12, g.col, LEFT, CENTER, 16, true);
    ry += 24;
    for (const r of g.rows) {
      txt(String(r.code), x + 14, ry, 'midnightblue', LEFT, TOP, 16, true);
      ry = para(r.text, x + 14 + codeW, ry, textW, 'black', 16);
    }
    ry += 4;
  }
  y += h;
  if (y + 30 <= drawHeight - 4) {
    y = para('Press Start to read eight responses. Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.', x + 4, y + 8,
      w - 8, 'dimgray', 16);
  }
  return y;
}

// ---------------------------------------------------------------------------
// One response: the status code and where it came from
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  const size = narrow ? 16 : 18, codeW = 84;
  const textH = paraHeight(it.from, w - 28 - codeW, size);
  const h = max(textH, 36) + 24;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(String(it.code), x + 14, y + h / 2, 'midnightblue', LEFT, CENTER, 30, true);
  para(it.from, x + 14 + codeW, y + (h - textH) / 2 + 1, w - 28 - codeW, 'black', size);
  return y + h;
}

// the rule of the first digit stays in view under every response, at the bottom of the drawing area
function drawReference(yAbove) {
  const x = 8, w = canvasWidth - 16;
  const h = paraHeight(DIGIT_RULE, w - 28, 16) + 16;
  panel(x, drawHeight - 6 - h, w, h, 'white', 'silver', 1);
  para(DIGIT_RULE, x + 14, drawHeight - 6 - h + 9, w - 28, 'black', 16);
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

// the text of one line of the answer key: the item's own short label when it has one, or else its answer
function keyText(it) { return it.key || it.answer; }

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
  for (const name of OPTIONS) answerSelect.option(menuLabel(name), name);
  answerSelect.selected('none');
}

// the words shown in the menu for a choice. A very long choice has a shorter label for a narrow screen in
// MENU_SHORT, so that the whole choice shows on a phone. The answer itself does not change.
function menuLabel(name) {
  return (narrow && MENU_SHORT[name]) || name;
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
  for (const o of answerSelect.elt.options) if (o.value !== 'none') o.textContent = menuLabel(o.value);
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  narrow = canvasWidth < 640;
}
