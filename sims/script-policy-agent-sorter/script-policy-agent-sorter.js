// Script Policy Agent Sorter - p5.js MicroSim
// CANVAS_HEIGHT: 546
// Learning objective (Analyze, differentiate): differentiate eight situations as a script, a learned policy or an
// agent, with at least 7 of 8 correct on the first attempt. Evidence: the kind committed with Check for each
// situation. Explore mode (reading the three kinds) is exploration, not evidence.
// The three kinds follow Chapter 18, "Script vs Policy vs Agent". The eight situations are in a fixed order.
// MicroSim template version 2026.03

let drawHeight = 458;
let controlHeight = 88;

const TITLE = 'Script Policy Agent Sorter';
const PROMPT = 'Who decides the next move?';
const NOUN = 'Situation';                 // used in "Situation 3 of 8" and "Next situation"
const QUIZ_LABEL = 'Eight situations';    // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose a kind…';
const WRONG_LEAD = 'Not quite. The kind is: ';
const HINT = 'Choose a kind in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the three kinds again.';
const MASTERY = 7;
const DESCRIPTION = 'A sorting quiz about three ways of deciding what a robot arm does next. Explore mode lists ' +
  'the three kinds: a script, a learned policy and an agent, each with who decides the next move and what it is ' +
  'good for. The quiz shows eight situations one at a time. A menu chooses a kind, a Check button commits it, ' +
  'and the feedback names the correct kind and gives the reason.';

// the three kinds, who decides in each one (shown in Explore mode), and a one-line reminder for a wide screen
const KINDS = [
  { name: 'Script', col: 'royalblue',
    rule: 'Code that a person wrote decides every step. Good for fixed jobs, tests and demos.',
    short: 'Code that a person wrote decides every step.' },
  { name: 'Learned policy', col: 'seagreen',
    rule: 'A model trained on demonstrations turns what it sees into the next action. Good for skills that are hard to write down.',
    short: 'A model trained on demonstrations turns what it sees into the next action.' },
  { name: 'Agent', col: 'purple',
    rule: 'A language model chooses which tools to call, in a loop. Good for requests in plain language and plans that change.',
    short: 'A language model chooses which tools to call, in a loop.' }
];
const OPTIONS = KINDS.map(k => k.name);

// the eight situations, in fixed order: the situation, the correct kind and the reason
const ITEMS = [
  { text: 'Every morning the arm moves through the same five poses to warm up.',
    answer: 'Script', why: 'A person wrote the five poses, and nothing is decided at run time.' },
  { text: 'A model trained on fifty recorded demonstrations folds a towel.',
    answer: 'Learned policy', why: 'The knowledge came from demonstrations, and the model maps what it sees to actions.' },
  { text: 'A student types “put the red block in the left bin” and a language model picks the tools to call.',
    answer: 'Agent', why: 'A language model chooses tools in response to words.' },
  { text: 'The arm plays back a recorded motion exactly the same way every time.',
    answer: 'Script', why: 'Playback is fixed steps, and it decides nothing.' },
  { text: 'A network reads the camera picture and the joint angles and outputs the next joint targets at every tick.',
    answer: 'Learned policy', why: 'It maps observations to actions, and it was trained from demonstrations.' },
  { text: 'A language model reads a scene description, writes a plan, calls the move and gripper tools, and asks a person when a grasp fails twice.',
    answer: 'Agent', why: 'The model plans and chooses tools, and handles a failure.' },
  { text: 'A program finds blocks by hue, converts them to table coordinates, and runs a fixed pick-and-place for each.',
    answer: 'Script', why: 'A camera supplies facts, but code decides every step.' },
  { text: 'A person asks “is the gripper open?” and a language model calls the status tool and answers.',
    answer: 'Agent', why: 'The model chose a tool to answer a question in words.' }
];

// Explore: the three kinds
function drawExplore(top) {
  return drawCards(top, KINDS, 'Look at who decides, and not at the hardware. Press Start to sort eight situations. ' +
    'Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.');
}

// one situation
function drawItem(it, x, y, w) {
  return textPanel(it.text, x, y, w, narrow ? 16 : 18);
}

// a reminder of the three kinds, on a wide screen only
function drawReference(yAbove) {
  return drawRulesLegend(yAbove, KINDS.map(k => ({ name: k.name, rule: k.short, col: k.col })));
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

// an Explore screen made of cards: the prompt, then one card for each class with its name and its rule, then a
// hint. Returns the y just below the last thing drawn.
function drawCards(top, cards, hint) {
  const x = 8, w = canvasWidth - 16, gap = narrow ? 6 : 8;
  let y = top;
  for (const ln of wrapLines(PROMPT, w - 8, 18, true)) {
    txt(ln, canvasWidth / 2, y, 'black', CENTER, TOP, 18, true);
    y += lineHeight(18);
  }
  y += 8;
  for (const c of cards) {
    const h = (narrow ? 32 : 36) + paraHeight(c.rule, w - 34, 16) + (narrow ? 6 : 10);
    panel(x, y, w, h, 'white', 'silver', 1);
    noStroke(); fill(c.col);
    rect(x, y, 10, h, 10, 0, 0, 10);
    txt(c.name, x + 22, y + (narrow ? 7 : 10), c.col, LEFT, TOP, 18, true);
    para(c.rule, x + 22, y + (narrow ? 32 : 36), w - 34, 'black', 16);
    y += h + gap;
  }
  if (hint && y + 30 <= drawHeight - 4) y = para(hint, x + 4, y + 4, w - 8, 'dimgray', 16);
  return y;
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

// a reminder list (name and rule on one line each) at the bottom of the drawing area. It is drawn only when
// there is room for it, so a narrow screen leaves it out. After a commit the row of the correct answer is
// highlighted. Returns the height of the list, or 0 when it was left out.
function drawRulesLegend(yAbove, rows) {
  const x = 8, w = canvasWidth - 16, rowH = 24;
  const h = rows.length * rowH + 14, y = drawHeight - 6 - h;
  textSize(16); textStyle(BOLD);
  const nameW = max(rows.map(r => textWidth(r.name))) + 44;
  textStyle(NORMAL);
  const widest = max(rows.map(r => textWidth(r.rule)));
  if (narrow || y < yAbove + 12 || widest > w - nameW - 24) return 0;
  panel(x, y, w, h, 'white', 'silver', 1);
  rows.forEach((r, i) => {
    const cy = y + 7 + i * rowH + rowH / 2;
    if (phase === 'feedback' && r.name === ITEMS[idx].answer) {
      fill('honeydew'); stroke('seagreen'); strokeWeight(1.5);
      rect(x + 5, cy - rowH / 2 + 1, w - 10, rowH - 2, 6);
    }
    noStroke(); fill(r.col || 'gray');
    circle(x + 18, cy, 10);
    txt(r.name, x + 30, cy, r.col || 'black', LEFT, CENTER, 16, true);
    txt(r.rule, x + 12 + nameW, cy, 'black', LEFT, CENTER, 16, false);
  });
  return h;
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
