// RRT Step Tracer - p5.js MicroSim
// CANVAS_HEIGHT: 675
// Learning objective (Apply, execute): execute one step of the RRT algorithm by hand, finding the distance to
// the nearest node and the coordinates of the new node, to within 0.1 of the unit shown, in six problems, with
// at least 5 of 6 correct on the first attempt. Evidence: the number committed with Check. Explore mode is not
// evidence.
// Model: distance = sqrt(dx^2 + dy^2) from each tree node to the random point. The nearest node is the one with
// the smallest distance. The new node is nearest + step x (dx, dy) / distance when the distance is larger than
// the step, and the random point itself otherwise. The plane is the configuration space in units of 10 degrees.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 520;
let controlHeight = 155;          // 4 rows x 35 + 10 = 150, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'RRT Step Tracer';
const DESCRIPTION = 'A square grid of the configuration space of a two-joint arm, from 0 to 10 grid units of 10 ' +
  'degrees on each axis. Dots joined by lines are the nodes of a tree, a cross marks a random point, and one ' +
  'RRT step is drawn: a ring on the nearest node, a dashed line to the random point, and the new node one step ' +
  'along it. In the six problems the learner types a distance or a coordinate of the new node.';
const QUIZ_LABEL = 'Six problems';
const NOUN = 'problem';
const MASTERY = 5;
const WRONG_LEAD = 'The answer is ';
const ASK_HINT = 'Find the nearest node, then the distance, then take one step. Press Check when you have the number.';
const EXAMPLE_NUMBER = '2.5';
const ANSWER_LABEL_W = 86;
const TOLERANCE = 0.1;
const GRID = 10;                  // the plane runs from 0 to 10 grid units on both axes
const NODE_COLOR = '#3F51B5', NEW_COLOR = '#00897B', POINT_COLOR = '#B71C1C';

// One RRT step without obstacles: the nearest node, its distance from the random point, and the new node.
function rrtStep(nodes, point, step) {
  let nearest = 0, dist = Infinity;
  nodes.forEach((n, i) => {
    const d = Math.hypot(point.x - n.x, point.y - n.y);
    if (d < dist) { dist = d; nearest = i; }
  });
  const from = nodes[nearest];
  // steer a fixed step toward the point, unless the point is nearer than one step
  const node = dist > step
    ? { x: from.x + step * (point.x - from.x) / dist, y: from.y + step * (point.y - from.y) / dist }
    : { x: point.x, y: point.y };
  return { nearest: nearest, dist: dist, node: node };
}

function exactAnswer(nodes, point, step, ask) {
  const s = rrtStep(nodes, point, step);
  return ask === 'dist' ? s.dist : s.node[ask];
}

// the six problems, in the chapter's fixed order. key is the answer as the chapter prints it, and exact is
// the same answer worked out in full by rrtStep().
const ITEMS = [
  { nodes: [{ x: 0, y: 0 }], point: { x: 3, y: 4 }, step: 1, ask: 'x', key: 0.6,
    text: 'The tree has one node at (0, 0). The random point is (3, 4) and the step is 1. What is the x of the new node?',
    why: 'The distance is 5, so the new node is (0, 0) + 1 × (3, 4) / 5 = (0.6, 0.8).' },
  { nodes: [{ x: 0, y: 0 }], point: { x: 3, y: 4 }, step: 1, ask: 'y', key: 0.8,
    text: 'The same step: one node at (0, 0), the random point (3, 4) and a step of 1. What is the y of the new node?',
    why: 'The y part of (0.6, 0.8) is 0.8.' },
  { nodes: [{ x: 0, y: 0 }, { x: 4, y: 0 }], point: { x: 6, y: 3 }, step: 1, ask: 'dist', key: 3.6,
    text: 'The tree has nodes at (0, 0) and (4, 0). The random point is (6, 3). How far is the nearest node from the random point?',
    why: '(4, 0) is nearest: the distance is the square root of (4 + 9) = 3.6.' },
  { nodes: [{ x: 0, y: 0 }, { x: 4, y: 0 }], point: { x: 6, y: 3 }, step: 1, ask: 'x', key: 4.6,
    text: 'The same tree and point: nodes at (0, 0) and (4, 0), the random point (6, 3), and a step of 1. What is the x of the new node?',
    why: 'The new node is (4, 0) + 1 × (2, 3) / 3.606 = (4.555, 0.832), so x is 4.6.' },
  { nodes: [{ x: 2, y: 2 }], point: { x: 2.3, y: 2.4 }, step: 1, ask: 'x', key: 2.3,
    text: 'The tree has one node at (2, 2). The random point is (2.3, 2.4) and the step is 1. What is the x of the new node?',
    why: 'The point is only 0.5 away, nearer than a step, so the new node is the random point itself.' },
  { nodes: [{ x: 0, y: 0 }, { x: 5, y: 5 }], point: { x: 6, y: 8 }, step: 2, ask: 'y', key: 6.9,
    text: 'The tree has nodes at (0, 0) and (5, 5). The random point is (6, 8) and the step is 2. What is the y of the new node?',
    why: '(5, 5) is nearest, at a distance of 3.162. The new node is (5, 5) + 2 × (1, 3) / 3.162 = (5.632, 6.897), so y is 6.9.' }
];
ITEMS.forEach(it => { it.exact = exactAnswer(it.nodes, it.point, it.step, it.ask); });

let stepSlider, xSlider, ySlider, addBtn, resetBtn;
let tree = [{ x: 0, y: 0, parent: -1 }];      // Explore mode: the tree that the learner grows

// an answer counts when it is within the tolerance of the exact value or of the rounded key
function isRight(it, typed) {
  return Math.abs(typed - it.exact) <= TOLERANCE + 1e-9 || Math.abs(typed - it.key) <= TOLERANCE + 1e-9;
}

function answerText(it) { return it.key.toFixed(1) + ' grid units'; }
function answerLabel(it) { return it.ask === 'dist' ? 'Distance =' : it.ask + ' ='; }
function promptText(it) { return it.text; }

// ---------------------------------------------------------------------------
// Answer controls: a box to type a number in, and a Check button that commits it
// ---------------------------------------------------------------------------
let answerInput, checkBtn;
let inputNote = '';            // shown when the box does not hold a number

function createAnswerControls() {
  answerInput = createInput('');
  answerInput.attribute('inputmode', 'decimal');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter') onCheck(); });
  checkBtn = createButton('Check');
  checkBtn.mouseClicked(onCheck);
}

// returns the number that was typed, or null when the text is not a number
function parseNumber(s) {
  const t = String(s).trim().replace(',', '.').replace('−', '-');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return parseFloat(t);
}

function onCheck() {
  if (mode !== 'quiz' || phase !== 'ask') return;
  const v = parseNumber(answerInput.value());
  if (v === null) { inputNote = 'Type a number first, for example ' + EXAMPLE_NUMBER + '.'; return; }
  inputNote = '';
  onCommit(v);
}

function askNote() { return inputNote || (narrow ? '' : ASK_HINT); }
function feedbackExtra() { return lastRight ? '' : ' You typed ' + lastAnswer + '.'; }
function resetAnswerControls() { answerInput.value(''); inputNote = ''; }

function showAnswerControls(show) {
  [answerInput, checkBtn].forEach(c => (show ? c.show() : c.hide()));
}

function enableAnswerControls(on) {
  [answerInput, checkBtn].forEach(c => setEnabled(c, on));
}

function layoutAnswerControls() {
  const y = drawHeight + ROW1 + ROW_H;
  answerInput.position(ANSWER_LABEL_W + 10, y);
  answerInput.size(90);
  checkBtn.position(ANSWER_LABEL_W + 118, y);
}

// the label to the left of the answer box says what to type and in which unit
function drawAnswerLabels() {
  if (phase === 'done') return;
  txt(answerLabel(ITEMS[idx]), 10, drawHeight + ROW1 + ROW_H + 12, 'black');
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
// Explore controls: three sliders, and two buttons that grow or reset the tree
// ---------------------------------------------------------------------------
function createExploreControls() {
  stepSlider = createSlider(0.5, 3.0, 1.0, 0.5);
  stepSlider.attribute('aria-label', 'Step size in grid units');
  xSlider = createSlider(0, GRID, 3.0, 0.1);
  xSlider.attribute('aria-label', 'Random point x');
  ySlider = createSlider(0, GRID, 4.0, 0.1);
  ySlider.attribute('aria-label', 'Random point y');
  addBtn = createButton('Add node');
  addBtn.mouseClicked(addNode);
  resetBtn = createButton('Reset');
  resetBtn.mouseClicked(() => { tree = [{ x: 0, y: 0, parent: -1 }]; });
}

function showExploreControls(show) {
  [stepSlider, xSlider, ySlider, addBtn, resetBtn].forEach(c => (show ? c.show() : c.hide()));
}

function layoutExploreControls() {
  const labelW = 118;
  const w = max(60, canvasWidth - labelW - 25);
  [stepSlider, xSlider, ySlider].forEach((s, i) => {
    s.position(labelW, drawHeight + ROW1 + (i + 1) * ROW_H);
    s.size(w);
  });
  // the two buttons sit at the right of the first row, where the quiz has its Next button
  const rw = widthOf(resetBtn), aw = widthOf(addBtn);
  resetBtn.position(canvasWidth - rw - 10, drawHeight + ROW1);
  addBtn.position(canvasWidth - rw - aw - 18, drawHeight + ROW1);
}

function drawExploreLabels() {
  txt('Step: ' + stepSlider.value().toFixed(1), 10, drawHeight + ROW1 + ROW_H + 11);
  txt('Point x: ' + xSlider.value().toFixed(1), 10, drawHeight + ROW1 + 2 * ROW_H + 11);
  txt('Point y: ' + ySlider.value().toFixed(1), 10, drawHeight + ROW1 + 3 * ROW_H + 11);
}

// the new node joins the tree, with the nearest node as its parent
function addNode() {
  const s = rrtStep(tree, { x: xSlider.value(), y: ySlider.value() }, stepSlider.value());
  if (s.dist < 1e-9 || tree.length >= 60) return;      // the point is already a node, or the tree is full
  tree.push({ x: s.node.x, y: s.node.y, parent: s.nearest });
}

function plotBox(r) {
  const size = Math.min(r.w - 56, r.h - 54);
  return { x: narrow ? r.x + (r.w - size) / 2 + 14 : r.x + 42, y: r.y + 10, size: size };
}

function mousePressed() { movePoint(); }
function mouseDragged() { movePoint(); }

// a tap or a drag on the grid moves the random point there
function movePoint() {
  if (mode !== 'explore') return;
  const b = plotBox(splitRegions(0.55, 250).pic);
  if (mouseX < b.x - 6 || mouseX > b.x + b.size + 6 || mouseY < b.y - 6 || mouseY > b.y + b.size + 6) return;
  const snap = v => constrain(Math.round(v * 10) / 10, 0, GRID);
  xSlider.value(snap((mouseX - b.x) / b.size * GRID));
  ySlider.value(snap((b.y + b.size - mouseY) / b.size * GRID));
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function pt(p, d) { return '(' + p.x.toFixed(d) + ', ' + p.y.toFixed(d) + ')'; }

function drawExplore() {
  const sp = splitRegions(0.55, 250);
  const point = { x: xSlider.value(), y: ySlider.value() }, step = stepSlider.value();
  const s = rrtStep(tree, point, step);
  drawPlane(sp.pic, tree, point, s, true);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const from = tree[s.nearest];
  let y = r.y + 8;
  y = para('New node: ' + pt(s.node, 2), x, y, w, 'black', 18, true);
  y = para('Nearest of ' + tree.length + (tree.length === 1 ? ' node: ' : ' nodes: ') + pt(from, 2), x, y + 4, w);
  y = para('Distance = √(' + (point.x - from.x).toFixed(2) + '² + ' + (point.y - from.y).toFixed(2) + '²) = ' + s.dist.toFixed(2), x, y + 2, w);
  y = para(s.dist > step ? 'New node = nearest + ' + step.toFixed(1) + ' × (dx, dy) / distance'
    : 'The point is nearer than one step, so the new node is the random point itself.', x, y + 2, w);
  if (!narrow) {
    y = para('Press Add node to grow the tree, then move the random point: drag it, or use the sliders.', x, y + 8, w, 'dimgray');
    y = para('The step starts from the nearest node, which is not always the newest one, and it goes toward the random point.', x, y + 6, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.55, 250);
  if (phase === 'done') {
    drawPlane(sp.pic, [{ x: 0, y: 0, parent: -1 }], null, null, false);
  } else {
    // the ring, the dashed line and the new node are the working, so they appear only after the commit
    const it = ITEMS[idx];
    drawPlane(sp.pic, it.nodes, it.point, rrtStep(it.nodes, it.point, it.step), phase === 'feedback');
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The plane: grid, tree, random point and, when reveal is true, the step
// ---------------------------------------------------------------------------
function drawPlane(r, nodes, point, s, reveal) {
  const b = plotBox(r);
  const k = b.size / GRID;
  const P = p => ({ x: b.x + p.x * k, y: b.y + b.size - p.y * k });

  fill('white'); stroke('#757575'); strokeWeight(1);
  rect(b.x, b.y, b.size, b.size);
  for (let i = 0; i <= GRID; i++) {
    stroke('rgba(0,0,0,0.10)'); strokeWeight(1);
    line(b.x + i * k, b.y, b.x + i * k, b.y + b.size);
    line(b.x, b.y + i * k, b.x + b.size, b.y + i * k);
    if (i % 2 === 0) {
      txt(String(i), b.x + i * k, b.y + b.size + 13, 'dimgray', CENTER, CENTER);
      txt(String(i), b.x - 8, b.y + b.size - i * k, 'dimgray', RIGHT, CENTER);
    }
  }
  txt('θ1 (1 grid unit = 10°)', b.x + b.size / 2, b.y + b.size + 34, 'black', CENTER, CENTER);
  txt('θ2', b.x - 26, b.y + b.size / 2, 'black', CENTER, CENTER);

  // the tree: a line from each node to its parent, then the nodes on top
  stroke(NODE_COLOR); strokeWeight(2);
  nodes.forEach(n => {
    if (n.parent !== undefined && n.parent >= 0) { const a = P(n), c = P(nodes[n.parent]); line(a.x, a.y, c.x, c.y); }
  });
  if (reveal && s) {
    const a = P(nodes[s.nearest]), c = P(point), n = P(s.node);
    stroke('#616161'); strokeWeight(1.5); drawingContext.setLineDash([5, 4]);
    line(a.x, a.y, c.x, c.y);
    drawingContext.setLineDash([]);
    stroke(NEW_COLOR); strokeWeight(4);
    line(a.x, a.y, n.x, n.y);
    noFill(); stroke('#FFC107'); strokeWeight(4);
    circle(a.x, a.y, 22);
  }
  nodes.forEach(n => {
    const a = P(n);
    fill(NODE_COLOR); stroke('white'); strokeWeight(1.5);
    circle(a.x, a.y, 12);
  });
  if (!point) return;

  const c = P(point);
  stroke(POINT_COLOR); strokeWeight(3); noFill();
  line(c.x - 8, c.y - 8, c.x + 8, c.y + 8); line(c.x - 8, c.y + 8, c.x + 8, c.y - 8);
  if (reveal && s) {
    const a = P(nodes[s.nearest]), n = P(s.node);
    fill(NEW_COLOR); stroke('white'); strokeWeight(1.5);
    circle(n.x, n.y, 14);
    // the two labels sit on opposite sides of the dashed line, so they do not cover it
    const len = Math.hypot(c.x - a.x, c.y - a.y) || 1;
    const nx = -(c.y - a.y) / len, ny = (c.x - a.x) / len;
    const dText = 'd = ' + s.dist.toFixed(2), nText = pt(s.node, 2);
    textSize(16);
    const dHalf = textWidth(dText) / 2 + 17, nHalf = textWidth(nText) / 2 + 17;
    label(dText, (a.x + c.x) / 2 - nx * dHalf, (a.y + c.y) / 2 - ny * 24, 'black', r);
    label(nText, n.x + nx * nHalf, n.y + ny * 24, '#00695C', r);
  }
}

// a short label on a white plate, centred on (x, y) and kept inside the picture r
function label(str, x, y, col, r) {
  textSize(16);
  const w = textWidth(str) + 10;
  x = constrain(x, r.x + w / 2 + 2, r.x + r.w - w / 2 - 2);
  y = constrain(y, r.y + 13, r.y + r.h - 13);
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}
