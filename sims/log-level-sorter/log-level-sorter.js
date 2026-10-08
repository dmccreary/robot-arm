// Log Level Sorter - p5.js MicroSim
// CANVAS_HEIGHT: 625
// Learning objective (Understand, classify): classify eight log messages from an arm program into the five
// log levels DEBUG, INFO, WARNING, ERROR and CRITICAL, with at least 7 of 8 correct on the first attempt.
// Evidence: the level committed for each message. Explore mode is exploration, not evidence.
// Rule: the levels are ordered DEBUG (10) < INFO (20) < WARNING (30) < ERROR (40) < CRITICAL (50), and a
// message is shown when its level is at or above the minimum level that was set.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 505;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Log Level Sorter';
const DESCRIPTION = 'A dark console that lists eight log messages from a robot arm program, each with its level. ' +
  'In Explore mode a menu sets the minimum level and only the messages at or above it stay on the console. ' +
  'In the quiz one message is shown without its level and the learner chooses DEBUG, INFO, WARNING, ERROR or CRITICAL.';
const QUIZ_LABEL = 'Eight messages';
const NOUN = 'message';
const MASTERY = 7;
const WRONG_LEAD = 'This message is ';
const ASK_HINT = 'Ask yourself: is this a routine detail, a normal event, a surprise that was handled, a failure, or a stop?';
const CHOICES = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

const LEVEL_NUMBERS = [10, 20, 30, 40, 50];
const LEVEL_USES = ['detail for finding a fault', 'normal events worth knowing',
  'something unexpected that the program handled', 'an operation failed',
  'the program cannot go on, or safety is at risk'];
const LEVEL_INK = ['#B0BEC5', '#81D4FA', '#FFD54F', '#FFAB91', '#FFFFFF'];   // on the dark console

// the eight messages, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { text: 'Loop tick 1042 started', answer: 0, why: 'A routine detail that is only useful when hunting a fault.' },
  { text: 'Arm connected on /dev/ttyACM0', answer: 1, why: 'A normal event worth recording.' },
  { text: 'Joint elbow_flex temperature is 62 C, above the 60 C warning level', answer: 2,
    why: 'Unexpected, but nothing has failed yet, and a person should know.' },
  { text: 'Failed to read servo 3 after 2 retries', answer: 3,
    why: 'An operation failed, even though the program continues.' },
  { text: 'Emergency stop pressed: torque disabled', answer: 4,
    why: 'The program cannot go on and safety is involved.' },
  { text: 'Calibration file loaded: my_follower.json', answer: 1, why: 'A normal event worth recording.' },
  { text: 'Packet checksum failed on servo 2: retrying (attempt 1 of 2)', answer: 2,
    why: 'Something unexpected that the program is handling.' },
  { text: 'Sent goal position 2106 to servo 1', answer: 0, why: 'A routine detail of one command.' }
];

let minSelect;

function promptText(it) {
  return 'Which log level fits this message from an arm program?';
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

// the buttons flow from left to right and wrap onto a new row when the canvas is narrow
function layoutAnswerControls() {
  let x = 10, row = 1;
  choiceBtns.forEach(b => {
    const w = widthOf(b);
    if (x > 10 && x + w > canvasWidth - 10) { x = 10; row++; }
    b.position(x, drawHeight + ROW1 + row * ROW_H);
    x += w + 8;
  });
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
}

// ---------------------------------------------------------------------------
// Explore control: the minimum level
// ---------------------------------------------------------------------------
function createExploreControls() {
  minSelect = createSelect();
  CHOICES.forEach((name, i) => minSelect.option(name + ' (' + LEVEL_NUMBERS[i] + ')', String(i)));
  minSelect.selected('0');
  minSelect.attribute('aria-label', 'Minimum level');
}

function showExploreControls(show) {
  if (show) minSelect.show(); else minSelect.hide();
}

function layoutExploreControls() {
  minSelect.position(128, drawHeight + ROW1 + ROW_H);
  minSelect.size(150);
}

function drawExploreLabels() {
  txt('Minimum level:', 10, drawHeight + ROW1 + ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.6, 344);
  const minLevel = Number(minSelect.value());
  const shown = ITEMS.filter(it => it.answer >= minLevel);
  const hiddenCounts = CHOICES.map((name, i) => ITEMS.filter(it => it.answer === i && i < minLevel).length);
  const hidden = ITEMS.length - shown.length;

  const c = consoleBox(sp.pic);
  let y = c.y;
  shown.forEach(it => { y = logLine(it.answer, it.text, c.x, y, c.w) + 8; });
  if (hidden) y = para('(' + hidden + ' lower-level messages are hidden)', c.x, y, c.w, '#B0BEC5');
  fits(y, c);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  y = r.y + 8;
  y = para('Minimum level: ' + CHOICES[minLevel] + ' (' + LEVEL_NUMBERS[minLevel] + ')', x, y, w, 'black', 16, true);
  y = para(shown.length + ' of ' + ITEMS.length + ' messages are shown.', x, y + 2, w);
  const parts = [];
  hiddenCounts.forEach((n, i) => { if (n) parts.push(n + ' ' + CHOICES[i]); });
  y = para(parts.length ? 'Hidden: ' + parts.join(', ') + '.' : 'Nothing is hidden.', x, y + 2, w);
  if (!narrow) {
    y = para('The five levels', x, y + 8, w, 'black', 16, true);
    CHOICES.forEach((name, i) => {
      y = para(name + ' (' + LEVEL_NUMBERS[i] + '): ' + LEVEL_USES[i], x, y + 2, w);
    });
    y = para('Python’s root logger starts at WARNING, so DEBUG and INFO stay hidden until you lower the level.',
      x, y + 8, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.6, 120);
  const c = consoleBox(sp.pic);
  if (phase === 'done') {
    para('All eight messages have been sorted.', c.x, c.y, c.w, '#B0BEC5');
  } else {
    // the level is the answer, so it is shown only after the learner has committed
    const it = ITEMS[idx];
    const y = logLine(phase === 'feedback' ? it.answer : null, it.text, c.x, c.y, c.w);
    fits(y, c);
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The console
// ---------------------------------------------------------------------------
// draws the dark console in region r and returns the rectangle its text may use
function consoleBox(r) {
  const b = { x: r.x + 8, y: r.y + 4, w: r.w - (narrow ? 16 : 8), h: (narrow ? r.h : drawHeight - 8 - r.y) - 4 };
  fill('#263238'); stroke('#102027'); strokeWeight(1);
  rect(b.x, b.y, b.w, b.h, 8);
  return { x: b.x + 12, y: b.y + 10, w: b.w - 24, h: b.h - 14 };
}

// draws "LEVEL message" with the level in its colour and the text wrapped inside w; returns the y below it.
// level is an index into CHOICES, or null to hide the level.
function logLine(level, message, x, y, w) {
  const word = level === null ? '?????' : CHOICES[level];
  textSize(16); textStyle(BOLD);
  const indent = textWidth(word) + 10;
  textStyle(NORMAL);
  // wrapped by hand, because the first line is shorter: the level word comes first
  const lines = [];
  let line = '';
  message.split(' ').forEach(wd => {
    const trial = line ? line + ' ' + wd : wd;
    const room = w - (lines.length === 0 ? indent : 0);
    if (line && textWidth(trial) > room) { lines.push(line); line = wd; } else { line = trial; }
  });
  lines.push(line);
  if (level === 4) {
    // CRITICAL also gets a filled plate, so it stands out without relying on the colour of the letters
    fill('#C62828'); noStroke();
    rect(x - 4, y - 2, indent - 2, 22, 3);
  }
  txt(word, x, y, level === null ? '#B0BEC5' : LEVEL_INK[level], LEFT, TOP, 16, true);
  lines.forEach((ln, i) => { txt(ln, x + (i === 0 ? indent : 0), y, 'white', LEFT, TOP); y += 21; });
  return y;
}
