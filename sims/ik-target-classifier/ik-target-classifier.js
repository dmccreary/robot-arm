// IK Target Classifier - p5.js MicroSim
// CANVAS_HEIGHT: 660
// Learning objective (Analyze, differentiate): differentiate eight targets for a two-link arm (l1 = 0.116 m,
// l2 = 0.135 m) as having two solutions, one solution, or being unreachable too far or too close, with at
// least 7 of 8 correct on the first attempt. Evidence: the class committed for each target. Explore mode is
// exploration, not evidence.
// Model: r = sqrt(x^2 + z^2). Too far: r > l1 + l2. Too close: r < |l1 - l2|. One solution: r on either limit
// (within 0.0005 m). Otherwise two solutions, with cos(theta2) = (r^2 - l1^2 - l2^2) / (2 l1 l2).
// The arm is a schematic drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'IK Target Classifier';
const DESCRIPTION = 'A flat two-link robot arm with its shoulder at the origin of a grid, x forward and z up, ' +
  'and a target point. In Explore mode the learner moves the target and sees the ring of reachable positions ' +
  'and the elbow-up and elbow-down arms that reach it. In the quiz the learner classifies eight targets as ' +
  'two solutions, one solution, too far or too close.';
const QUIZ_LABEL = 'Eight targets';
const NOUN = 'target';
const MASTERY = 7;
const WRONG_LEAD = 'This target is: ';
const ASK_HINT = 'Work out r, the distance from the shoulder, and compare it with the nearest and the farthest the arm can reach.';
const CHOICES = ['Two solutions', 'One solution', 'Too far to reach', 'Too close to reach'];

const L1 = 0.116, L2 = 0.135;     // metres: the SO-101's upper arm and forearm
const R_OUT = L1 + L2;            // 0.251 m, the arm straight
const R_IN = Math.abs(L1 - L2);   // 0.019 m, the arm folded back
const BAND = 0.0005;              // a target this close to a limit counts as on it
const EXTENT = 32;                // the plot shows 32 cm each way from the shoulder (the arm is drawn in cm)
const REST = { t1: 150, t2: -60 };

// the eight targets, in the chapter's fixed order (metres). answer is an index into CHOICES.
const ITEMS = [
  { x: 0.150, z: 0.100, answer: 0, why: 'r is between 0.019 and 0.251, so the elbow can be up or down.' },
  { x: 0.251, z: 0.000, answer: 1, why: 'r equals l1 + l2, so the arm is straight and there is one pose.' },
  { x: 0.300, z: 0.100, answer: 2, why: 'r is more than l1 + l2 = 0.251 m.' },
  { x: 0.010, z: 0.010, answer: 3, why: 'r is less than l2 - l1 = 0.019 m, so the folded arm cannot get that close.' },
  { x: 0.019, z: 0.000, answer: 1, why: 'r equals l2 - l1, so the arm is folded back and there is one pose.' },
  { x: 0.000, z: 0.200, answer: 0, why: 'r is inside the ring, so there are two poses.' },
  { x: 0.200, z: 0.200, answer: 2, why: 'r is more than 0.251 m.' },
  { x: 0.050, z: 0.050, answer: 0, why: 'r is inside the ring, so there are two poses.' }
];

let xSlider, zSlider;

// which of the four classes a distance r (metres) belongs to: an index into CHOICES
function classify(r) {
  if (r > R_OUT + BAND) return 2;
  if (r < R_IN - BAND) return 3;
  if (Math.abs(r - R_OUT) <= BAND || Math.abs(r - R_IN) <= BAND) return 1;
  return 0;
}

// the poses that reach a target, or the nearest pose when nothing reaches it; angles in degrees
function solve(x, z) {
  const r = Math.hypot(x, z);
  const kind = classify(r);
  const toward = Math.atan2(z, x);
  const deg = a => a * 180 / Math.PI;
  let poses;
  if (kind === 2) {
    poses = [{ t1: deg(toward), t2: 0 }];                  // stretched straight at the target
  } else if (kind === 3) {
    poses = [{ t1: deg(toward) + 180, t2: 180 }];          // folded back on itself
  } else {
    const c = constrain((r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
    const bends = kind === 1 ? [Math.acos(c)] : [Math.acos(c), -Math.acos(c)];
    poses = bends.map(b => ({ t2: deg(b), t1: deg(toward - Math.atan2(L2 * Math.sin(b), L1 + L2 * Math.cos(b))) }));
  }
  return { r: r, kind: kind, poses: poses };
}

function promptText(it) {
  return 'The target is at (' + it.x.toFixed(3) + ', ' + it.z.toFixed(3) + ') m. The links are l1 = 0.116 m and ' +
    'l2 = 0.135 m. How many ways can the tip reach it?';
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
// Explore controls: two sliders, and the target can also be dragged or tapped into place
// ---------------------------------------------------------------------------
function createExploreControls() {
  xSlider = createSlider(-0.30, 0.30, 0.150, 0.005);
  xSlider.attribute('aria-label', 'Target x in metres');
  zSlider = createSlider(-0.30, 0.30, 0.100, 0.005);
  zSlider.attribute('aria-label', 'Target z in metres');
}

function showExploreControls(show) {
  [xSlider, zSlider].forEach(s => (show ? s.show() : s.hide()));
}

function layoutExploreControls() {
  const labelW = 118;
  const w = max(60, canvasWidth - labelW - 25);
  xSlider.position(labelW, drawHeight + ROW1 + ROW_H); xSlider.size(w);
  zSlider.position(labelW, drawHeight + ROW1 + 2 * ROW_H); zSlider.size(w);
}

function drawExploreLabels() {
  txt('x: ' + xSlider.value().toFixed(3) + ' m', 10, drawHeight + ROW1 + ROW_H + 11);
  txt('z: ' + zSlider.value().toFixed(3) + ' m', 10, drawHeight + ROW1 + 2 * ROW_H + 11);
}

function plotView(r) {
  // the bottom strip of the picture is kept free for the caption
  return RobotArm.fixedView({ x: r.x, y: r.y, w: r.w, h: r.h - 24 }, EXTENT, { pad: 6 });
}

function mousePressed() { moveTarget(); }
function mouseDragged() { moveTarget(); }

function moveTarget() {
  if (mode !== 'explore') return;
  const r = splitRegions(0.55, 296).pic;
  if (mouseX < r.x || mouseX > r.x + r.w || mouseY < r.y || mouseY > r.y + r.h - 24) return;
  const v = plotView(r);
  const snap = cm => constrain(Math.round(cm / 0.5) * 0.5, -30, 30) / 100;   // steps of 0.005 m
  xSlider.value(snap((mouseX - v.ox) / v.scale));
  zSlider.value(snap((v.oy - mouseY) / v.scale));
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.55, 296);
  const x = xSlider.value(), z = zSlider.value();
  const s = solve(x, z);
  drawPlot(sp.pic, { x: x, z: z }, s, true);
  const inPlot = mouseX > sp.pic.x && mouseX < sp.pic.x + sp.pic.w && mouseY > sp.pic.y && mouseY < sp.pic.y + sp.pic.h - 24;
  cursor(inPlot ? 'crosshair' : 'default');

  const r = sp.panel;
  panelBox(r);
  const px = r.x + 10, w = r.w - 20;
  const sgn = v => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(1) + '°';
  let y = r.y + 8;
  y = para('Target (' + x.toFixed(3) + ', ' + z.toFixed(3) + ') m', px, y, w, 'black', 16, true);
  y = para('r = √(x² + z²) = ' + s.r.toFixed(3) + ' m', px, y + 2, w);
  y = para('The tip can reach from l2 − l1 = 0.019 m to l1 + l2 = 0.251 m.', px, y + 2, w);
  y = para(CHOICES[s.kind], px, y + 6, w, s.kind < 2 ? 'darkgreen' : 'firebrick', 18, true);
  if (s.kind === 0) {
    s.poses.forEach(p => { y = para('θ2 = ' + sgn(p.t2) + ' with θ1 = ' + sgn(p.t1), px, y + 2, w); });
    if (!narrow) y = para('The elbow can be on either side of the line from the shoulder to the target: elbow up or elbow down.', px, y + 6, w);
  } else if (s.kind === 1) {
    y = para(s.r > 0.1 ? 'r is l1 + l2, so the arm is straight. There is only one pose.'
      : 'r is l2 − l1, so the arm is folded back. There is only one pose.', px, y + 2, w);
  } else if (s.kind === 2) {
    y = para('r is more than 0.251 m. The arm is drawn fully stretched and it still falls short.', px, y + 2, w);
  } else {
    y = para('r is less than 0.019 m. The arm is drawn folded back and its tip is still too far out.', px, y + 2, w);
  }
  if (!narrow) y = para('Drag the target or use the sliders. Watch the arm straighten at the outer circle and fold at the inner one.', px, y + 6, w, 'dimgray');
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.55, 296);
  cursor('default');
  if (phase === 'done') {
    drawPlot(sp.pic, null, null, true);
  } else {
    // the ring and the arms give the answer away, so they appear only after the learner has committed
    const it = ITEMS[idx];
    drawPlot(sp.pic, it, solve(it.x, it.z), phase === 'feedback');
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The plot: grid, ring, arms and target. target is in metres; s is its solve() result.
// ---------------------------------------------------------------------------
function makeArm(pose) {
  const arm = RobotArm.presets.twoLink(L1 * 100, L2 * 100, { shoulder: pose.t1, elbow: pose.t2 });
  arm.jointRadius = 1.0;                         // slim parts, so the small inner circle stays visible
  arm.links.forEach(l => { l.thickness = 1.8; });
  arm.base.width = 6;
  return arm;
}

function drawPlot(r, target, s, reveal) {
  const view = plotView(r);
  const S = p => RobotArm.toScreen(view, p);
  const o = S({ x: 0, y: 0 });

  RobotArm.drawGrid(view, 5, 30);
  if (reveal) RobotArm.drawRing(view, { x: 0, y: 0 }, R_IN * 100, R_OUT * 100);
  RobotArm.drawAxes(view, { x: 0, y: 0 }, 30.5, 'x', 'z');
  [-0.3, -0.2, -0.1, 0.1, 0.2, 0.3].forEach(v => {
    txt(String(v), o.x + v * 100 * view.scale, o.y + 13, 'dimgray', CENTER, CENTER);
    txt(String(v), o.x - 8, o.y - v * 100 * view.scale, 'dimgray', RIGHT, CENTER);
  });

  const poses = (reveal && s) ? s.poses : [REST];
  poses.slice().reverse().forEach((p, i) => {
    // the second pose is drawn paler, underneath the first
    RobotArm.draw(makeArm(p), view, { alpha: (poses.length === 2 && i === 0) ? 120 : 255 });
  });
  if (reveal) {
    // the edge of the inner circle is redrawn on top, because the shoulder joint covers most of it
    noFill(); stroke('#3F51B5'); strokeWeight(1.5);
    circle(o.x, o.y, 2 * R_IN * 100 * view.scale);
  }
  if (!target) {
    caption(r);
    return;
  }

  const t = { x: target.x * 100, y: target.z * 100 };
  const zoomed = s.r < 0.05;      // near the shoulder the main plot is too small, so a zoom box is added
  if (reveal && !zoomed) RobotArm.drawDimension(view, { x: 0, y: 0 }, t, 'r = ' + s.r.toFixed(3) + ' m', 16);
  RobotArm.drawTarget(view, t);
  const c = S(t);
  textSize(16);
  const label = '(' + target.x.toFixed(3) + ', ' + target.z.toFixed(3) + ')';
  const half = textWidth(label) / 2 + 6;
  tag(label, constrain(c.x, r.x + half + 2, r.x + r.w - half - 2), c.y - 26 < r.y + 12 ? c.y + 26 : c.y - 26, '#B71C1C');

  if (reveal && s.kind === 0) {
    // name each pose by its elbow bend, beside its elbow
    s.poses.forEach(p => {
      const e = RobotArm.pose(makeArm(p)).joints[1];
      const es = S(e), mid = S({ x: t.x / 2, y: t.y / 2 });
      const d = Math.hypot(es.x - mid.x, es.y - mid.y) || 1;
      const text = (narrow ? '' : 'θ2 = ') + (p.t2 < 0 ? '−' : '+') + Math.abs(p.t2).toFixed(1) + '°';
      const hw = textWidth(text) / 2 + 6;
      tag(text, constrain(es.x + (es.x - mid.x) / d * (hw + 8), r.x + hw + 2, r.x + r.w - hw - 2),
        es.y + (es.y - mid.y) / d * 24, 'black');
    });
  }
  if (zoomed) drawZoom(r, t, s, reveal);
  caption(r);
}

function caption(r) {
  txt('Schematic. x is forward and z is up, in metres.', r.x + 8, r.y + r.h - 12, 'dimgray', LEFT, CENTER);
}

// a magnified view of the 4 cm around the shoulder, for targets that are too small to see on the main plot
function drawZoom(r, t, s, reveal) {
  const size = narrow ? 96 : 120;
  const box = { x: r.x + r.w - size - 6, y: r.y + r.h - 24 - size - 4, w: size, h: size };
  const v = RobotArm.fixedView(box, 4, { pad: 0 });
  const Z = p => RobotArm.toScreen(v, p);
  const o = Z({ x: 0, y: 0 });
  fill('white'); stroke(90); strokeWeight(1.5);
  rect(box.x, box.y, box.w, box.h, 6);
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(box.x + 1, box.y + 1, box.w - 2, box.h - 2);
  drawingContext.clip();
  if (reveal) {
    noStroke(); fill('rgba(63,81,181,0.18)');
    rect(box.x, box.y, box.w, box.h);
    fill('white'); stroke('#3F51B5'); strokeWeight(1.5);
    circle(o.x, o.y, 2 * R_IN * 100 * v.scale);
    // the tip of each drawn arm
    s.poses.forEach(p => {
      const tip = Z(RobotArm.pose(makeArm(p)).tip);
      fill('#00897B'); stroke('#004D40'); strokeWeight(1.5);
      circle(tip.x, tip.y, 10);
    });
  }
  noStroke(); fill('#3F51B5');
  circle(o.x, o.y, 6);
  const c = Z(t);
  stroke('#B71C1C'); strokeWeight(2.5); noFill();
  line(c.x - 9, c.y, c.x + 9, c.y); line(c.x, c.y - 9, c.x, c.y + 9);
  drawingContext.restore();
  txt('zoom', box.x + 5, box.y + 4, 'dimgray', LEFT, TOP);
  if (reveal) txt('r = ' + s.r.toFixed(3) + ' m', box.x + box.w / 2, box.y + box.h - 3, 'black', CENTER, BOTTOM);
}

// a short label on a white plate, centred on (x, y)
function tag(str, x, y, col) {
  textSize(16);
  const w = textWidth(str) + 10;
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}
