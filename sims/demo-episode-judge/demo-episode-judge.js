// Demo Episode Judge - p5.js MicroSim
// CANVAS_HEIGHT: 515
// Learning objective (Evaluate, judge): judge eight described demonstration episodes as worth keeping or
// needing to be re-recorded, using the data-collection guidance of the chapter, with at least 7 of 8 correct
// on the first attempt. Evidence: the verdict committed for each episode. Reading the guidance in Explore
// mode is exploration, not evidence.
// Rule: an episode that breaks any of the five guidance rules is "Re-record"; one that breaks none is "Keep".
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 430;
let controlHeight = 85;           // 2 rows x 35 + 10 = 80, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Demo Episode Judge';
const DESCRIPTION = 'A checklist of five rules for recording demonstration episodes for imitation learning, each ' +
  'with the reason for it. In the quiz a card describes one recorded episode and the learner decides whether ' +
  'to keep it or to record it again.';
const QUIZ_LABEL = 'Eight episodes';
const NOUN = 'episode';
const MASTERY = 7;
const WRONG_LEAD = 'The verdict is: ';
const ASK_HINT = 'Check the episode against the five rules. If it breaks one, it must be recorded again.';
const CHOICES = ['Keep', 'Re-record'];

// the data-collection guidance of the chapter (shown in Explore mode)
const RULES = [
  { name: 'Cameras fixed', rule: 'Keep the cameras fixed.',
    why: 'If a camera moves, the same pixels mean different places.' },
  { name: 'Object visible', rule: 'Keep the object visible in the camera.',
    why: 'A policy cannot learn from what it cannot see.' },
  { name: 'Same grasp', rule: 'Grasp the same way every time.',
    why: 'A policy copies what it is shown, and that includes an inconsistent grasp.' },
  { name: 'Planned locations', rule: 'Use a few planned locations, with about 10 episodes for each.',
    why: 'Planned changes in where the object sits are the right kind of variety. Add more variation slowly, and only after the policy is reliable.' },
  { name: 'Re-record mistakes', rule: 'Cancel and re-record an episode that goes wrong.',
    why: 'While LeRobot records, the left arrow key cancels the episode and records it again.' }
];

// the eight episodes, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { text: 'The block is visible in the front camera throughout, and the grasp matches the other episodes.', answer: 0,
    why: 'It follows every guidance rule.' },
  { text: 'The leader arm and the operator’s hand cover the block in the camera for half of the episode.', answer: 1,
    why: 'The object must be visible in the camera, and a policy cannot learn from what it cannot see.' },
  { text: 'The camera was knocked halfway through and now shows a different part of the table.', answer: 1,
    why: 'The cameras must stay fixed, or the same pixels mean different places.' },
  { text: 'The operator grasped the block from the side in this episode and from above in the other 49.', answer: 1,
    why: 'The grasp should be consistent, and a policy will copy the inconsistency.' },
  { text: 'The block is in a different spot from the previous episode, one of the five planned locations.', answer: 0,
    why: 'Planned variation in the object’s location is the right kind of variety.' },
  { text: 'The operator dropped the block and pressed the left arrow to cancel.', answer: 1,
    why: 'The left arrow cancels the episode and records it again, which is the right response to a failed attempt.' },
  { text: 'A first-day dataset where every episode uses a new location, a new grasp style and a new camera angle.', answer: 1,
    why: 'Variation should be added slowly and only after the policy is reliable, so plan fewer changes.' },
  { text: 'The block is clearly visible, and the operator completes the task in one smooth motion within the time limit.', answer: 0,
    why: 'It is a clean, consistent demonstration.' }
];

let ruleSelect;

function promptText(it) {
  return 'Would you keep this episode?';
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
// Explore control: which rule to read the reason for
// ---------------------------------------------------------------------------
function createExploreControls() {
  ruleSelect = createSelect();
  RULES.forEach((r, i) => ruleSelect.option((i + 1) + '. ' + r.name, String(i)));
  ruleSelect.selected('0');
  ruleSelect.attribute('aria-label', 'Rule to explain');
}

function showExploreControls(show) {
  if (show) ruleSelect.show(); else ruleSelect.hide();
}

function layoutExploreControls() {
  ruleSelect.position(108, drawHeight + ROW1 + ROW_H);
  ruleSelect.size(190);
}

function drawExploreLabels() {
  txt('Explain rule:', 10, drawHeight + ROW1 + ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const r = { x: 8, y: 44, w: canvasWidth - 16, h: drawHeight - 52 };
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const chosen = Number(ruleSelect.value());
  let y = r.y + 8;
  y = para('Five rules for recording demonstration episodes', x, y, w, 'black', 16, true) + 4;
  RULES.forEach((g, i) => {
    const top = y;
    y = para((i + 1) + '. ' + g.rule, x + 10, y, w - 10, 'black', 16, i === chosen);
    // a narrow canvas shows the reason for the chosen rule only
    if (i === chosen || !narrow) y = para(g.why, x + 28, y, w - 28, i === chosen ? '#0D47A1' : 'dimgray');
    if (i === chosen) {
      fill('#FFC107'); stroke('#212121'); strokeWeight(1);
      rect(x - 3, top, 7, y - top - 3, 2);
    }
    y += narrow ? 4 : 6;
  });
  if (!narrow) {
    y = para('An episode that breaks any of these rules should be recorded again. One that breaks none is worth keeping.',
      x, y + 4, w);
  }
  fits(y, r);
}

function drawQuiz() {
  const card = { x: 8, y: 44, w: canvasWidth - 16, h: narrow ? 128 : 84 };
  fill('#FFFDE7'); stroke('#BDBDBD'); strokeWeight(1);
  rect(card.x, card.y, card.w, card.h, 10);
  const text = phase === 'done' ? 'All eight episodes have been judged.' : ITEMS[idx].text;
  const y = para(text, card.x + 14, card.y + 12, card.w - 28, 'black', 18);
  fits(y, card);
  drawQuizPanel({ x: 8, y: card.y + card.h + 4, w: canvasWidth - 16, h: drawHeight - 8 - (card.y + card.h + 4) });
}
