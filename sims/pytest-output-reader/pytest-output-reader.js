// Pytest Output Reader - p5.js MicroSim
// CANVAS_HEIGHT: 640
// Learning objective (Analyze, attribute): attribute each of six pytest failure messages to its most likely
// cause, with at least 5 of 6 correct on the first attempt. Evidence: the cause committed for each message.
// Reading about the causes in Explore mode is exploration, not evidence.
// The six messages are real pytest output from the chapter's lab code, each with one bug put in on purpose.
// The six causes are long, so each one is a full-width button: two columns when wide, one column when narrow.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 375;             // narrow layout; layoutHeights() gives a wide canvas a taller drawing
let controlHeight = 265;          // narrow layout: the mode row and six rows of cause buttons
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Pytest Output Reader';
const DESCRIPTION = 'A dark console that shows one line of pytest failure output, above six buttons that each ' +
  'name a possible cause. In Explore mode pressing a cause shows what it means and how it is usually fixed. ' +
  'In the quiz the learner presses the most likely cause of each of six failure messages.';
const QUIZ_LABEL = 'Six messages';
const NOUN = 'message';
const MASTERY = 5;
const WRONG_LEAD = 'The likely cause is: ';
const ASK_HINT = 'Read the message as a clue. Press the cause that explains it best.';
const CHOICES = [
  'The code returns a different value than the test expects',
  'Decimals were compared with exact equality',
  'A fixture is missing or misspelled',
  'The test never created the state that it checks',
  'A check that should have refused did not refuse',
  'Python cannot find the library'
];

// what each cause means and the fix it usually needs (shown in Explore mode)
const CAUSE_NOTES = [
  { means: 'The assert compared two values and they were not equal. Either the code or the number in the test is wrong.',
    fix: 'Work out the right value by hand, then correct whichever one is wrong.' },
  { means: 'Decimal numbers are stored in binary, so 0.1 + 0.2 is not exactly 0.3.',
    fix: 'Compare with pytest.approx and not with ==.' },
  { means: 'The test asks for a fixture by name, and pytest has no fixture with that name.',
    fix: 'Check the spelling against the fixtures in conftest.py.' },
  { means: 'The test checks a value before doing the step that sets it, so it still sees the starting value.',
    fix: 'Do the set-up in the test first, such as moving the joint, and then assert.' },
  { means: 'The test expected an error, using pytest.raises, and the call went through without one.',
    fix: 'Put the missing check back into the code, such as the joint limit check.' },
  { means: 'The import failed before any test ran, because the project folder is not on Python’s search path.',
    fix: 'Run python -m pytest from the project folder.' }
];

// the six messages, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { text: 'assert 2504 == 2503, where 2504 = deg_to_raw(45, JointCalibration(...))', answer: 0,
    why: 'The function gave 2504 and the test said 2503, so one of them is wrong, and the arithmetic (1992 + 45 x 11.375 = 2503.9) says that 2504 is right.' },
  { text: 'assert (0.1 + 0.2) == 0.3', answer: 1,
    why: '0.1 + 0.2 is 0.30000000000000004 in binary arithmetic, so use pytest.approx.' },
  { text: 'fixture \'arm_connected\' not found', answer: 2,
    why: 'The test names a fixture that conftest.py does not define, and the fixture is called arm.' },
  { text: 'assert 0.0 == 10.0', answer: 3,
    why: 'The test read a joint that was never moved, so it still has its starting value of 0.0.' },
  { text: 'Failed: DID NOT RAISE JointLimitError', answer: 4,
    why: 'The call that should have been refused went through, so the limit check is missing.' },
  { text: 'ModuleNotFoundError: No module named \'armlab\'', answer: 5,
    why: 'The tests were run from a place where the project folder is not on the path, so use python -m pytest from the project folder.' }
];

let causeBtns = [];               // Explore mode: the same six causes, pressed to read about them
let picked = 0;                   // the cause that is explained in Explore mode

function promptText(it) {
  return 'What does this failure message point to?';
}

// a wide canvas needs only three rows of buttons, so its drawing is taller
function layoutHeights() {
  controlHeight = narrow ? 265 : 190;
  drawHeight = canvasHeight - controlHeight;
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
  layoutHeights();
}

// ---------------------------------------------------------------------------
// The cause buttons: a grid of equal buttons, used for the answers and for Explore
// ---------------------------------------------------------------------------
function gridPlace(btns) {
  const cols = narrow ? 1 : 2, gap = 8;
  const bw = (canvasWidth - 20 - (cols - 1) * gap) / cols;
  const bh = narrow ? 32 : 40;
  btns.forEach((b, i) => {
    b.size(bw, bh);
    b.style('font-size', narrow ? '13px' : '15px');
    b.position(10 + (i % cols) * (bw + gap), drawHeight + ROW1 + ROW_H + Math.floor(i / cols) * (bh + (narrow ? 4 : 6)));
  });
}

function layoutAnswerControls() { gridPlace(choiceBtns); }

function createExploreControls() {
  causeBtns = CHOICES.map((label, i) => {
    const b = createButton(label);
    b.mouseClicked(() => { picked = i; markPicked(); });
    return b;
  });
  markPicked();
}

// the cause that is being explained has a thick border and bold text
function markPicked() {
  causeBtns.forEach((b, i) => {
    b.style('font-weight', i === picked ? 'bold' : 'normal');
    b.style('border', i === picked ? '3px solid #1565C0' : '');
  });
}

function showExploreControls(show) {
  causeBtns.forEach(b => (show ? b.show() : b.hide()));
}

function layoutExploreControls() { gridPlace(causeBtns); }

function drawExploreLabels() {}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const r = { x: 8, y: 44, w: canvasWidth - 16, h: drawHeight - 52 };
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const note = CAUSE_NOTES[picked];
  let y = r.y + 8;
  y = para('Cause ' + (picked + 1) + ' of 6', x, y, w, 'dimgray');
  y = para(CHOICES[picked], x, y + 2, w, 'black', 18, true);
  y = para('What it means: ' + note.means, x, y + 8, w);
  y = para('Usual fix: ' + note.fix, x, y + 8, w, '#0D47A1');
  y = para(narrow ? 'Press each cause below to read about it.'
    : 'Press each cause below to read about it. Then choose Six messages. Each one asks: what does this failure message point to?',
    x, y + 10, w, 'dimgray');
  fits(y, r);
}

function drawQuiz() {
  const consoleH = narrow ? 112 : 96;
  const c = { x: 8, y: 44, w: canvasWidth - 16, h: consoleH };
  fill('#263238'); stroke('#102027'); strokeWeight(1);
  rect(c.x, c.y, c.w, c.h, 8);
  const tx = c.x + 12, tw = c.w - 24;
  let y = para('pytest output', tx, c.y + 8, tw, '#B0BEC5');
  if (phase === 'done') {
    y = para('6 messages read', tx, y + 2, tw, 'white');
  } else {
    // pytest starts each line of a failure report with a red E
    txt('E', tx, y + 2, '#FF8A80', LEFT, TOP, 16, true);
    y = para(ITEMS[idx].text, tx + 24, y + 2, tw - 24, 'white');
  }
  fits(y, c);
  drawQuizPanel({ x: 8, y: c.y + c.h + 4, w: canvasWidth - 16, h: drawHeight - 8 - (c.y + c.h + 4) });
}
