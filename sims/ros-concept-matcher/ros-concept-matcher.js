// ROS Concept Matcher - p5.js MicroSim
// CANVAS_HEIGHT: 595
// Learning objective (Remember, identify): identify the ROS 2 or robot-description term that matches each of
// eight short descriptions, with at least 7 of 8 correct on the first attempt. Evidence: the term committed
// for each description. Reading the term list in Explore mode is exploration, not evidence.
// The picture shows two nodes joined by one topic: arm_driver publishes sensor_msgs/JointState messages on
// /joint_states, and planner subscribes to them and reads the arm's URDF file. The node names are examples.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 475;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'ROS Concept Matcher';
const DESCRIPTION = 'A diagram of two ROS 2 nodes joined by one topic. The node arm_driver publishes JointState ' +
  'messages on the topic /joint_states and the node planner subscribes to it and reads a URDF file. Beside it ' +
  'are six terms with their meanings. In the quiz the learner matches eight descriptions to the six terms.';
const QUIZ_LABEL = 'Eight descriptions';
const NOUN = 'description';
const MASTERY = 7;
const WRONG_LEAD = 'This describes: ';
const ASK_HINT = 'Press the term that the description fits.';
const CHOICES = ['Node', 'Topic', 'Message', 'Publisher', 'Subscriber', 'URDF'];

// a one-line meaning of each term (shown in Explore mode)
const MEANINGS = [
  'a program that does one job',
  'a named channel between nodes',
  'the typed data sent on a topic',
  'a node that sends messages on a topic',
  'a node that receives messages from a topic',
  'the XML file that describes a robot’s links and joints'
];

// the eight descriptions, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { text: 'A program in the ROS 2 graph that does one logical job, like reading a camera.', answer: 0,
    why: 'A node is the unit of computation in ROS 2.' },
  { text: 'A named channel that nodes publish to and subscribe from.', answer: 1,
    why: 'A topic carries messages of one type between nodes.' },
  { text: 'The typed data sent on a topic, like sensor_msgs/JointState.', answer: 2,
    why: 'A message has a defined shape, with named fields.' },
  { text: 'A node that sends messages on a topic.', answer: 3,
    why: 'Publishers send, and they do not need to know who receives.' },
  { text: 'A node that receives messages from a topic.', answer: 4,
    why: 'Subscribers register a callback for the messages that arrive.' },
  { text: 'The XML file that describes an arm’s links and joints.', answer: 5,
    why: 'URDF stands for Unified Robot Description Format.' },
  { text: 'What the command ros2 topic list prints.', answer: 1,
    why: 'The command lists the topics that exist in the system.' },
  { text: 'What msg.data holds inside a subscriber’s callback.', answer: 2,
    why: 'The callback receives a message object, and data is one of its fields.' }
];

const NODE_FILL = '#3F51B5', TOPIC_FILL = '#00796B', GOLD = '#FFC107';

let showSelect;

function promptText(it) {
  return 'Which term does this describe?';
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
// Explore control: which term to point out in the picture
// ---------------------------------------------------------------------------
function createExploreControls() {
  showSelect = createSelect();
  CHOICES.forEach((name, i) => showSelect.option(name, String(i)));
  showSelect.selected('0');
  showSelect.attribute('aria-label', 'Term to show in the picture');
}

function showExploreControls(show) {
  if (show) showSelect.show(); else showSelect.hide();
}

function layoutExploreControls() {
  showSelect.position(170, drawHeight + ROW1 + ROW_H);
  showSelect.size(130);
}

function drawExploreLabels() {
  txt('Show in the picture:', 10, drawHeight + ROW1 + ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.55, 196);
  const hl = Number(showSelect.value());
  drawGraph(sp.pic, hl);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  if (!narrow) y = para('Six terms', x, y, w, 'black', 16, true) + 2;
  CHOICES.forEach((term, i) => {
    if (i === hl) {
      // a gold bar marks the term that is pointed out in the picture
      const h = termLine(term, MEANINGS[i], x + 8, y, w - 8, true);
      fill(GOLD); stroke('#212121'); strokeWeight(1);
      rect(x - 4, y - 1, 7, h - y - 2, 2);
    }
    y = termLine(term, MEANINGS[i], x + 8, y, w - 8, false) + (narrow ? 2 : 8);
  });
  if (!narrow) {
    y = para('ROS 2 is not an operating system. It is a set of libraries and conventions for building robot ' +
      'software from many small programs.', x, y + 4, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const card = { x: 8, y: 44, w: canvasWidth - 16, h: narrow ? 100 : 80 };
  fill('#FFFDE7'); stroke('#BDBDBD'); strokeWeight(1);
  rect(card.x, card.y, card.w, card.h, 10);
  const text = phase === 'done' ? 'All eight descriptions have been matched.' : '“' + ITEMS[idx].text + '”';
  const y = para(text, card.x + 14, card.y + 12, card.w - 28, 'black', 18);
  fits(y, card);
  drawQuizPanel({ x: 8, y: card.y + card.h + 4, w: canvasWidth - 16, h: drawHeight - 8 - (card.y + card.h + 4) });
}

// draws "Term: meaning" with the term in bold; with measureOnly it draws nothing. Returns the y below it.
function termLine(term, meaning, x, y, w, measureOnly) {
  textSize(16); textStyle(BOLD);
  const indent = textWidth(term + ':') + 6;
  textStyle(NORMAL);
  const lines = [];
  let line = '';
  meaning.split(' ').forEach(wd => {
    const trial = line ? line + ' ' + wd : wd;
    const room = w - (lines.length === 0 ? indent : 0);
    if (line && textWidth(trial) > room) { lines.push(line); line = wd; } else { line = trial; }
  });
  lines.push(line);
  if (!measureOnly) {
    txt(term + ':', x, y, 'black', LEFT, TOP, 16, true);
    lines.forEach((ln, i) => txt(ln, x + (i === 0 ? indent : 0), y + i * 21, 'black', LEFT, TOP));
  }
  return y + lines.length * 21;
}

// ---------------------------------------------------------------------------
// The picture: publisher node -> topic -> subscriber node, a message, and a URDF file.
// hl is the index of the term to point out (see CHOICES).
// ---------------------------------------------------------------------------
function drawGraph(r, hl) {
  const m = 10, gap = Math.max(16, r.w * 0.045);
  const bw = Math.min(130, (r.w - 2 * m - 2 * gap) * 0.31);      // node width
  const pw = r.w - 2 * m - 2 * gap - 2 * bw;                      // topic width
  const bh = 52, top = r.y + (narrow ? 30 : 60);
  const ax = r.x + m, px = ax + bw + gap, bx = px + pw + gap;
  const mid = top + bh / 2;
  const ring = on => { if (on) { stroke(GOLD); strokeWeight(5); } else { stroke('#212121'); strokeWeight(1.5); } };
  const role = (s, cx, on) => txt(s, cx, top - 13, 'black', CENTER, CENTER, 16, on);

  // the arrows carry small packets: the messages
  [[ax + bw, px], [px + pw, bx]].forEach(seg => {
    stroke('#212121'); strokeWeight(2);
    line(seg[0], mid, seg[1] - 2, mid);
    line(seg[1] - 2, mid, seg[1] - 9, mid - 5);
    line(seg[1] - 2, mid, seg[1] - 9, mid + 5);
  });

  // the two nodes
  [[ax, 'arm_driver', 3, 'publisher'], [bx, 'planner', 4, 'subscriber']].forEach(nd => {
    const on = hl === 0 || hl === nd[2];
    fill(NODE_FILL); ring(on);
    rect(nd[0], top, bw, bh, 8);
    txt(nd[1], nd[0] + bw / 2, top + 16, 'white', CENTER, CENTER, 16, true);
    txt('node', nd[0] + bw / 2, top + 37, 'white', CENTER, CENTER);
    role(nd[3], nd[0] + bw / 2, hl === nd[2]);
  });

  // the topic
  fill(TOPIC_FILL); ring(hl === 1);
  rect(px, top + 4, pw, bh - 8, (bh - 8) / 2);
  txt('/joint_states', px + pw / 2, mid, 'white', CENTER, CENTER, 16, true);
  role('topic', px + pw / 2, hl === 1);

  // one message, drawn large below the topic, joined to the arrow it travels on
  const mw = Math.min(170, pw + gap), mh = 66;
  const mx = px + pw / 2 - mw / 2 - gap / 2, my = top + bh + 34;
  stroke('#212121'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
  line(px - gap / 2, mid + 4, px - gap / 2, my);
  drawingContext.setLineDash([]);
  fill('white'); ring(hl === 2);
  rect(mx, my, mw, mh, 4);
  txt('JointState', mx + mw / 2, my + 13, 'black', CENTER, CENTER, 16, true);
  txt('name, position,', mx + mw / 2, my + 33, 'black', CENTER, CENTER);
  txt('velocity, effort', mx + mw / 2, my + 52, 'black', CENTER, CENTER);
  txt('message', mx + mw / 2, my - 12, 'black', CENTER, CENTER, 16, hl === 2);

  // the URDF file, read by the planner node
  const fw = Math.min(bw, 100), fx = bx + bw - fw, fy = my, fh = mh, fold = 14;
  stroke('#212121'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
  line(bx + bw / 2 + 20, top + bh, bx + bw / 2 + 20, fy);
  drawingContext.setLineDash([]);
  fill('#ECEFF1'); ring(hl === 5);
  beginShape();
  vertex(fx, fy); vertex(fx + fw - fold, fy); vertex(fx + fw, fy + fold); vertex(fx + fw, fy + fh); vertex(fx, fy + fh);
  endShape(CLOSE);
  stroke('#212121'); strokeWeight(1.5); noFill();
  line(fx + fw - fold, fy, fx + fw - fold, fy + fold);
  line(fx + fw - fold, fy + fold, fx + fw, fy + fold);
  txt('arm.urdf', fx + fw / 2, fy + 24, 'black', CENTER, CENTER, 16, true);
  txt('links, joints', fx + fw / 2, fy + 46, 'black', CENTER, CENTER);
  txt('URDF', fx + fw / 2 - 26, fy - 12, 'black', CENTER, CENTER, 16, hl === 5);

  if (!narrow) {
    para('The arrows show the way the messages travel. The names arm_driver, planner and arm.urdf are examples.',
      r.x + m, my + mh + 26, r.w - 2 * m, 'dimgray');
  }
}
