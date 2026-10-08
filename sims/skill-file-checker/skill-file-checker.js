// Skill File Checker - p5.js MicroSim
// CANVAS_HEIGHT: 638
// Learning objective (Evaluate, validate): validate eight skill-file headers against the rules of the OpenClaw
// skill format, naming the one rule that each breaks or saying that it is valid, with at least 7 of 8 correct on
// the first attempt. Evidence: the outcome committed with Check for each header. Explore mode is exploration.
// The five rules are those of Chapter 15, "Agent Skills and OpenClaw Skill Files". The eight headers are in a
// fixed order, and no header breaks more than one rule.
// MicroSim template version 2026.03

let drawHeight = 550;
let controlHeight = 88;

const TITLE = 'Skill File Checker';
const PROMPT = 'Does this header follow the rules?';
const NOUN = 'Header';                    // used in "Header 3 of 8" and "Next header"
const QUIZ_LABEL = 'Eight headers';       // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose an outcome…';
const WRONG_LEAD = 'Not quite. This header is: ';
const HINT = 'Choose an outcome in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the five rules again.';
const MASTERY = 7;
const DESCRIPTION = 'A quiz about the header of a skill file. Explore mode lists the five rules of the header, ' +
  'with a valid example. The quiz shows eight headers one at a time, each with the name of its folder and the ' +
  'number of characters in its description. A menu chooses whether the header is valid or which rule it breaks, ' +
  'a Check button commits the choice, and the feedback names the correct outcome and gives the reason.';

// the six outcomes
const OPTIONS = ['Valid', 'Invalid: bad name', 'Invalid: missing field', 'Invalid: name and folder differ',
  'Invalid: description too long', 'Invalid: unquoted colon'];

// the five rules, and the outcome when each one is broken
const RULES = [
  { text: 'Both name and description are required.', fail: 'Invalid: missing field' },
  { text: 'The name uses lowercase letters, digits and hyphens.', fail: 'Invalid: bad name' },
  { text: 'The name equals the folder’s name.', fail: 'Invalid: name and folder differ' },
  { text: 'The description is under 160 characters.', fail: 'Invalid: description too long' },
  { text: 'A value containing a colon and a space must be in quotes.', fail: 'Invalid: unquoted colon' }
];
const EXAMPLE = { folder: 'hello-world', name: 'hello-world', desc: 'A simple skill that prints a greeting.' };

// descriptions used in the headers. Their lengths are counted by the program and shown to the learner.
const SHORT = 'Move a desktop robot arm with safe, bounded commands.';                                   // 53 characters
const D109 = 'Move a desktop robot arm with safe, bounded commands for status, moves, the gripper, going home and stopping.';
const D175 = 'Move a desktop robot arm with safe, bounded commands for status, movement, the gripper, going home ' +
  'and stopping, and tell the user in plain words what happened after each one.';

// the eight headers, in fixed order: folder, name, description (null when the line is missing), an optional
// extra line, the correct outcome and the reason
const ITEMS = [
  { folder: 'robot-arm', name: 'robot-arm', desc: D109,
    answer: 'Valid', why: 'Every rule is met.' },
  { folder: 'Robot_Arm', name: 'Robot_Arm', desc: SHORT,
    answer: 'Invalid: bad name',
    why: 'The name has a capital letter and an underscore, and it must use lowercase letters, digits and hyphens.' },
  { folder: 'robot-arm', name: 'robot-arm', desc: null,
    answer: 'Invalid: missing field', why: 'The description is required.' },
  { folder: 'arm-skill', name: 'robot-arm', desc: SHORT,
    answer: 'Invalid: name and folder differ', why: 'The name should equal the folder’s name.' },
  { folder: 'robot-arm', name: 'robot-arm', desc: D175,
    answer: 'Invalid: description too long', why: 'The description must be under 160 characters.' },
  { folder: 'robot-arm', name: 'robot-arm', desc: 'Moves the arm: carefully',
    answer: 'Invalid: unquoted colon', why: 'A value with a colon and a space must be in quotes, or the YAML is invalid.' },
  { folder: 'robot-arm-2', name: 'robot-arm-2', desc: SHORT,
    answer: 'Valid', why: 'Digits and hyphens are allowed in a name.' },
  { folder: 'robot-arm', name: 'robot-arm', desc: SHORT, extra: 'user-invocable: true',
    answer: 'Valid', why: 'user-invocable is one of the optional fields of the format.' }
];

// the lines of a header, as they are in the file
function headerLines(it) {
  const lines = ['---', 'name: ' + it.name];
  if (it.desc !== null) lines.push('description: ' + it.desc);
  if (it.extra) lines.push(it.extra);
  lines.push('---');
  return lines;
}

// ---------------------------------------------------------------------------
// Explore: the five rules and a valid example
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16;
  let y = top;

  // the rules; a wide screen has room for the outcome when each rule is broken
  textSize(16); textStyle(NORMAL);
  const failW = narrow ? 0 : max(RULES.map(r => textWidth(r.fail))) + 24;
  const ruleW = w - 28 - failW;
  const hs = RULES.map((r, i) => paraHeight((i + 1) + '. ' + r.text, ruleW, 16) + 2);
  const h = 36 + hs.reduce((a, b) => a + b, 0) + 8;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('The five rules of a skill header', x + 14, y + 10, 'black', LEFT, TOP, 16, true);
  if (!narrow) txt('If the rule is broken', x + w - 14, y + 10, 'dimgray', RIGHT, TOP, 16, true);
  let ry = y + 36;
  RULES.forEach((r, i) => {
    para((i + 1) + '. ' + r.text, x + 14, ry, ruleW, 'black', 16);
    if (!narrow) txt(r.fail, x + w - 14, ry, 'firebrick', RIGHT, TOP, 16, false);
    ry += hs[i];
  });
  y += h + 8;

  // a valid example (the starter skill of the chapter)
  const ex = { folder: EXAMPLE.folder, name: EXAMPLE.name, desc: EXAMPLE.desc };
  y = drawHeaderPanel(ex, x, y, w, 'A valid example') + 8;
  y = para('A header that breaks none of the rules is valid. Press Start to check eight headers.', x + 4, y, w - 8,
    'dimgray', 16);
  return y;
}

// ---------------------------------------------------------------------------
// One header: the folder, the lines of the header and the length of the description
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  return drawHeaderPanel(it, x, y, w, 'Header of SKILL.md');
}

function drawHeaderPanel(it, x, y, w, caption) {
  const lines = headerLines(it), inner = w - 28 - 20;
  let blockH = 12;
  for (const ln of lines) blockH += paraHeight(ln, inner, 16);
  const note = it.desc === null ? '' : 'The description has ' + it.desc.length + ' characters.';
  const h = 10 + 26 + blockH + (note ? 28 : 6) + 6;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt('Folder:', x + 14, y + 10, 'dimgray', LEFT, TOP, 16, false);
  txt(it.folder, x + 74, y + 10, 'midnightblue', LEFT, TOP, 16, true);
  txt(caption, x + w - 14, y + 10, 'dimgray', RIGHT, TOP, 16, false);
  // the file block
  noStroke(); fill('whitesmoke');
  rect(x + 14, y + 36, w - 28, blockH, 6);
  let ly = y + 42;
  for (const ln of lines) ly = para(ln, x + 24, ly, inner, 'midnightblue', 16);
  if (note) txt(note, x + 14, y + 36 + blockH + 6, 'dimgray', LEFT, TOP, 16, false);
  return y + h;
}

// a reminder of the outcomes and their rules, on a wide screen only
function drawReference(yAbove) {
  const rows = [{ name: 'Valid', rule: 'The header breaks none of the five rules.' }]
    .concat(RULES.map(r => ({ name: r.fail, rule: r.text })));
  return drawRulesLegend(yAbove, rows);
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
