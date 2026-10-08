// Startup Order Sequencer - p5.js MicroSim
// CANVAS_HEIGHT: 598
// Learning objective (Analyze, organize): organize the four startup steps and the three shutdown steps of the
// chapter into their correct order, choosing the next step in each of eight rounds, with at least 7 of 8 correct
// on the first attempt. Evidence: the step committed with Check in each round. Explore mode is exploration.
// The steps are those of the startup and shutdown functions in the lab of Chapter 18. The eight rounds are in a
// fixed order, and each round offers three choices.
// MicroSim template version 2026.03

let drawHeight = 510;
let controlHeight = 88;

const TITLE = 'Startup Order Sequencer';
const PROMPT = 'What comes next?';
const NOUN = 'Round';                     // used in "Round 3 of 8" and "Next round"
const QUIZ_LABEL = 'Eight rounds';        // the name of the quiz mode in the mode menu
const CHOOSE = 'Choose the next step…';
const WRONG_LEAD = 'Not quite. The next step is: ';
const HINT = 'Choose the next step in the menu below, then press Check. You get one try.';
const AGAIN_HINT = 'Switch to Explore to read the seven steps in order again.';
const MASTERY = 7;
const OPTIONS = [];                       // every round has its own three choices
const DESCRIPTION = 'A quiz about the order of the startup and shutdown steps of a robot arm. Explore mode lists ' +
  'four startup steps and three shutdown steps in order, with the reason for each. Each of the eight rounds of ' +
  'the quiz shows the steps that are already done and three choices. A menu chooses the next step, a Check ' +
  'button commits it, and the feedback names the correct step and gives the reason.';

// the steps of the two procedures (Chapter 18), with the reason for the place of each one
const S1 = 'Check that the supply covers the motors';
const S2 = 'Check that every servo answers, is cool and is in range';
const S3 = 'A person confirms the table is clear and the E-stop is in reach';
const S4 = 'A person clears the stop';
const S5 = 'Check that the gripper holds nothing';
const S6 = 'Go to the home pose';
const S7 = 'Cut torque';
const S8 = 'Leave the arm stopped until a person clears it';
const STARTUP = [
  { step: S1, why: 'Nothing else is safe until power is known to be right.' },
  { step: S2, why: 'The servos are checked before any stop is cleared.' },
  { step: S3, why: 'A person must look before the arm may move.' },
  { step: S4 + ', and the arm goes to its home pose', why: 'The arm can move only after a person clears the stop.' }
];
const SHUTDOWN = [
  { step: S5, why: 'Torque is never cut while the gripper holds something.' },
  { step: S6, why: 'The arm is parked before torque is cut.' },
  { step: S7, why: 'Torque is cut last, with the arm parked.' }
];
const AFTER = 'After shutdown the arm stays stopped until a person clears the stop. No agent can clear it.';

// shorter menu labels for the longest choices, used on a narrow screen
const MENU_SHORT = {
  [S2]: 'Check every servo: answers, cool, in range',
  [S3]: 'Person: table clear, E-stop in reach',
  [S8]: 'Leave it stopped for a person to clear'
};

// the eight rounds, in fixed order: the procedure, the steps done so far, the three choices, the next step and
// the reason
const ITEMS = [
  { stage: 'Startup', done: [], options: ['Clear the stop', S1, S6],
    answer: S1, why: 'Nothing else is safe until power is known to be right.' },
  { stage: 'Startup', done: ['Power checked'], options: [S2, 'Clear the stop', S7],
    answer: S2, why: 'The servos are checked before any stop is cleared.' },
  { stage: 'Startup', done: ['Power checked', 'Servos checked'], options: [S6, S7, S3],
    answer: S3, why: 'A person must look before the arm may move.' },
  { stage: 'Startup', done: ['Power checked', 'Servos checked', 'Table and E-stop confirmed by a person'],
    options: [S7, S4, 'Take the object from the gripper'],
    answer: S4, why: 'The arm can move only after a person clears the stop.' },
  { stage: 'Shutdown', done: ['Startup is done, and the arm has been working. Now it is time to shut down.'],
    options: [S7, 'Clear the stop', S5],
    answer: S5, why: 'Torque is never cut while the gripper holds something.' },
  { stage: 'Shutdown', done: ['Gripper empty'], options: [S6, S7, 'Check the servos'],
    answer: S6, why: 'The arm is parked before torque is cut.' },
  { stage: 'Shutdown', done: ['Gripper empty', 'Arm at the home pose'], options: ['Check the power supply', S7, 'Clear the stop'],
    answer: S7, why: 'Torque is cut last, with the arm parked.' },
  { stage: 'Shutdown', done: ['Gripper empty', 'Arm at the home pose', 'Torque cut'],
    options: ['Let the agent clear the stop', 'Move the arm to test it', S8],
    answer: S8, why: 'A stop stays in force until a person clears it.' }
];

// ---------------------------------------------------------------------------
// Explore: the seven steps in order (a wide screen has room for the reason under each step)
// ---------------------------------------------------------------------------
function drawExplore(top) {
  const x = 8, w = canvasWidth - 16, tw = w - 28 - 26;
  const groups = [
    { title: 'Startup: before the arm may move', col: 'royalblue', steps: STARTUP, first: 1 },
    { title: 'Shutdown: when the work is finished', col: 'purple', steps: SHUTDOWN, first: 5 }
  ];
  const stepH = s => paraHeight(s.step + '.', tw, 16, true) + (narrow ? 0 : paraHeight(s.why, tw, 16)) + (narrow ? 2 : 6);
  let h = 10 + 8;
  for (const g of groups) { h += 28; for (const s of g.steps) h += stepH(s); }
  h += 6 + paraHeight(AFTER, w - 28, 16);
  let y = top;
  panel(x, y, w, h, 'white', 'silver', 1);
  let ry = y + 10;
  for (const g of groups) {
    txt(g.title, x + 14, ry + 2, g.col, LEFT, TOP, 16, true);
    ry += 28;
    g.steps.forEach((s, i) => {
      txt((g.first + i) + '.', x + 14, ry, 'black', LEFT, TOP, 16, true);
      let ny = para(s.step + '.', x + 40, ry, tw, 'black', 16, true);
      if (!narrow) ny = para(s.why, x + 40, ny, tw, 'black', 16);
      ry = ny + (narrow ? 2 : 6);
    });
  }
  para(AFTER, x + 14, ry + 6, w - 28, 'black', 16);
  y += h;
  if (y + 30 <= drawHeight - 4) {
    y = para('Press Start to choose the next step in eight rounds. Mastery is ' + MASTERY + ' of ' + ITEMS.length + '.',
      x + 4, y + 8, w - 8, 'dimgray', 16);
  }
  return y;
}

// ---------------------------------------------------------------------------
// One round: the steps done so far, then the three choices
// ---------------------------------------------------------------------------
function drawItem(it, x, y, w) {
  const tw = w - 28 - 28;
  const lines = it.done.length ? it.done : ['Nothing is done yet. The arm is stopped.'];
  let h = 10 + 26 + 8;
  for (const ln of lines) h += paraHeight(ln, tw, 16) + 2;
  panel(x, y, w, h, 'white', 'silver', 1);
  txt(it.stage + ': done so far', x + 14, y + 10, it.stage === 'Startup' ? 'royalblue' : 'purple', LEFT, TOP, 16, true);
  let ly = y + 36;
  for (const ln of lines) {
    if (it.done.length) drawMark(x + 23, ly + 11, true);
    ly = para(ln, x + (it.done.length ? 42 : 14), ly, tw, 'black', 16) + 2;
  }
  return y + h;
}

// the three choices of the round. After a commit the correct one is marked, and so is a wrong choice.
function drawChoices(it, x, y, w) {
  const tw = w - 28 - 28;
  let h = 16;
  for (const o of it.options) h += paraHeight(o, tw, 16) + 4;
  panel(x, y, w, h, 'white', 'silver', 1);
  let ly = y + 10;
  for (const o of it.options) {
    const right = o === it.answer, chosen = answerSelect.value() === o;
    if (phase === 'feedback' && (right || chosen)) {
      drawMark(x + 23, ly + 11, right);
    } else {
      noStroke(); fill('gray');
      circle(x + 23, ly + 11, 7);
    }
    const col = phase === 'feedback' && right ? 'darkgreen' : 'black';
    ly = para(o, x + 42, ly, tw, col, 16, phase === 'feedback' && right) + 4;
  }
  return y + h;
}

function drawReference(yAbove) { return 0; }

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
  y = drawChoices(it, x, y, w) + 8;

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

// fill the answer menu with the choices for the current item
function loadOptions() {
  answerSelect.elt.options.length = 0;
  answerSelect.option(CHOOSE, 'none');
  for (const name of (ITEMS[idx].options || OPTIONS)) answerSelect.option(menuLabel(name), name);
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
