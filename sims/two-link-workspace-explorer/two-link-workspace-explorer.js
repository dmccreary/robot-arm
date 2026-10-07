// Two-Link Workspace Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 660
// Learning objective (Apply, solve): solve seven reachability problems for a flat two-link arm by
// deciding whether a target point lies inside the arm's workspace, with at least 6 of 7 correct on the
// first attempt. Evidence: the committed Reachable / Not reachable answers. Exploration mode is not evidence.
// The arm and workspace are drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the seven problems, in the chapter's fixed order (section "The Workspace"); L1 = 10 cm and L2 = 15 cm throughout
const PROBLEM_L1 = 10;
const PROBLEM_L2 = 15;
const PROBLEMS = [
  { x: 20, y: 10, lo: -180, hi: 180, reachable: true,
    why: 'r is between 5 and 25, and the elbow needs 54.3 degrees of bend, which is allowed.' },
  { x: 30, y: 0, lo: -180, hi: 180, reachable: false,
    why: 'r = 30 is greater than L1 + L2 = 25, so the target is beyond the reach.' },
  { x: 3, y: 2, lo: -180, hi: 180, reachable: false,
    why: 'r = 3.61 is less than L2 - L1 = 5, so the target is inside the hole where the arm cannot fold.' },
  { x: 25, y: 0, lo: -180, hi: 180, reachable: true,
    why: 'r equals L1 + L2 exactly, so the arm can just reach it fully stretched.' },
  { x: 7, y: 0, lo: -180, hi: 180, reachable: true,
    why: 'r = 7 is between 5 and 25, and the elbow needs 156.9 degrees of bend, which this limit allows.' },
  { x: 20, y: 10, lo: 0, hi: 90, reachable: true,
    why: 'The elbow needs plus or minus 54.3 degrees, and +54.3 degrees is inside the 0 to 90 limit.' },
  { x: 7, y: 0, lo: 0, hi: 90, reachable: false,
    why: 'The elbow needs plus or minus 156.9 degrees, and neither is inside the 0 to 90 limit, even though r = 7 is inside the ring.' }
];
const MASTERY = 6;

// the plot shows this many cm each way from the shoulder, so the picture keeps one scale
const PLOT_EXTENT_PROBLEMS = 32;   // the farthest target is 30 cm away
const PLOT_EXTENT_EXPLORE = 42;    // the longest arm the sliders allow reaches 40 cm

// controls
let modeSelect, reachBtn, notBtn, nextBtn;
let l1Slider, l2Slider, loSlider, hiSlider;

// state
let mode = 'problems';             // 'problems' or 'explore'
let phase = 'ask';                 // problems: 'ask', 'feedback' or 'done'
let problemIndex = 0;
let lastAnswer = null;             // true = the learner said Reachable
let lastCorrect = false;
let correctCount = 0;
let missed = [];                   // problem numbers answered wrongly
let testPoint = null;              // explore mode: the clicked point {x, y}

// the pose that is drawn eases toward its goal pose
let shown = { t1: 30, t2: 40 };
let goal = { t1: 30, t2: 40 };
const REST = { t1: 30, t2: 40 };

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // all controls are created before layoutControls() positions them
  modeSelect = createSelect();
  modeSelect.option('Problems', 'problems');
  modeSelect.option('Explore (after the problems)', 'explore');
  modeSelect.selected('problems');
  modeSelect.changed(() => setMode(modeSelect.value()));
  modeSelect.elt.options[1].disabled = true;     // unlocks after problem 7

  reachBtn = createButton('Reachable');
  reachBtn.mouseClicked(() => onVerdict(true));
  notBtn = createButton('Not reachable');
  notBtn.mouseClicked(() => onVerdict(false));
  nextBtn = createButton('Next problem');
  nextBtn.mouseClicked(onNext);

  l1Slider = createSlider(5, 20, PROBLEM_L1, 1);
  l2Slider = createSlider(5, 20, PROBLEM_L2, 1);
  loSlider = createSlider(-180, 0, -180, 15);
  hiSlider = createSlider(0, 180, 180, 15);
  [l1Slider, l2Slider, loSlider, hiSlider].forEach(s => s.input(onSliderChange));

  layoutControls();
  setMode('problems');
  describe('A flat two-link robot arm drawn from the side with its shoulder at the origin. A target point is ' +
    'marked on a grid. The learner decides whether the arm tip can reach it. After seven problems the learner ' +
    'can change the link lengths and elbow limits and watch the shaded reachable ring change.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Two-Link Workspace Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const p = currentParams();
  const view = currentView();

  // ease the drawn pose toward its goal; shoulder angles wrap, so take the short way round
  const d1 = ((goal.t1 - shown.t1 + 540) % 360) - 180;
  shown.t1 += d1 * 0.2;
  shown.t2 += (goal.t2 - shown.t2) * 0.2;

  RobotArm.drawGrid(view, 5, plotExtent());

  // the ring is a giveaway, so it appears only after the learner has committed, or in explore mode
  const reveal = mode === 'explore' || phase !== 'ask';
  if (reveal) {
    const ring = RobotArm.ringForElbowLimit(p.L1, p.L2, [p.lo, p.hi]);
    RobotArm.drawRing(view, { x: 0, y: 0 }, ring.rMin, ring.rMax);
  }
  RobotArm.drawAxes(view, { x: 0, y: 0 }, plotExtent() - 4, 'x (cm)', 'y (cm)');

  // the arm goes first so the distance label and the target marker stay readable on top of it
  const arm = RobotArm.presets.twoLink(p.L1, p.L2, { shoulder: shown.t1, elbow: shown.t2, elbowMin: p.lo, elbowMax: p.hi });
  RobotArm.draw(arm, view, {});
  const target = currentTarget();
  if (target) {
    RobotArm.drawDimension(view, { x: 0, y: 0 }, target, 'r = ' + (Math.hypot(target.x, target.y)).toFixed(2) + ' cm', 18);
    RobotArm.drawTarget(view, target, '(' + fmt(target.x) + ', ' + fmt(target.y) + ')');
  }

  drawInfoPanel(p, target);
  drawControlLabels();
  cursor(mode === 'explore' && insidePlot(mouseX, mouseY) ? 'crosshair' : 'default');
}

// ---------------------------------------------------------------------------
// Parameters and geometry
// ---------------------------------------------------------------------------
function currentParams() {
  if (mode === 'explore') {
    return { L1: l1Slider.value(), L2: l2Slider.value(), lo: loSlider.value(), hi: hiSlider.value() };
  }
  const pr = PROBLEMS[Math.min(problemIndex, PROBLEMS.length - 1)];
  return { L1: PROBLEM_L1, L2: PROBLEM_L2, lo: pr.lo, hi: pr.hi };
}

function currentTarget() {
  if (mode === 'explore') return testPoint;
  if (phase === 'done') return null;
  const pr = PROBLEMS[problemIndex];
  return { x: pr.x, y: pr.y };
}

function plotExtent() { return mode === 'explore' ? PLOT_EXTENT_EXPLORE : PLOT_EXTENT_PROBLEMS; }

function plotRegion() {
  const top = 40;
  if (narrow) return { x: 0, y: top, w: canvasWidth, h: 285 };
  return { x: 0, y: top, w: Math.floor(canvasWidth * 0.6), h: drawHeight - top };
}

function panelRegion() {
  const a = plotRegion();
  if (narrow) return { x: 8, y: a.y + a.h + 4, w: canvasWidth - 16, h: drawHeight - (a.y + a.h) - 10 };
  return { x: a.w + 8, y: a.y + 6, w: canvasWidth - a.w - 16, h: drawHeight - a.y - 16 };
}

function currentView() { return RobotArm.fixedView(plotRegion(), plotExtent(), { pad: 6 }); }

function insidePlot(x, y) {
  const a = plotRegion();
  return x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h;
}

function fmt(v) { return Number.isInteger(v) ? String(v) : v.toFixed(1); }

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function drawInfoPanel(p, target) {
  const r = panelRegion();
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(r.x, r.y, r.w, r.h, 10);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  const line = (s, col, size, bold, h) => { txt(s, x, y, col || 'black', LEFT, TOP, size || 16, bold, w, h || 22); y += (h || 22); };

  if (mode === 'explore') {
    line('Click the plane to test a point.', 'black', 16, true);
    line('L1 = ' + p.L1 + ' cm, L2 = ' + p.L2 + ' cm');
    line('Elbow limit: ' + p.lo + ' to ' + p.hi + ' degrees');
    const ring = RobotArm.ringForElbowLimit(p.L1, p.L2, [p.lo, p.hi]);
    line('Shaded ring: ' + ring.rMin.toFixed(1) + ' to ' + ring.rMax.toFixed(1) + ' cm from the shoulder');
    if (testPoint) {
      const res = RobotArm.ik2(p.L1, p.L2, testPoint.x, testPoint.y, [p.lo, p.hi]);
      line(res.reachable ? 'Reachable' : 'Not reachable', res.reachable ? 'darkgreen' : 'firebrick', 18, true, 26);
      line(exploreReason(p, res), 'black', 16, false, Math.max(44, r.h - (y - r.y) - 8));
    }
    return;
  }

  const pr = PROBLEMS[Math.min(problemIndex, PROBLEMS.length - 1)];
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + PROBLEMS.length, 'black', 16, true);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 26);
    line(missed.length ? 'Missed: problem ' + missed.join(', ') + '.' : 'No problems missed.', 'black', 16, false, 24);
    line('Explore mode is unlocked. Use the mode menu to change the links and the elbow limit.', 'black', 16, false, 70);
    return;
  }
  const ik = RobotArm.ik2(PROBLEM_L1, PROBLEM_L2, pr.x, pr.y, [pr.lo, pr.hi]);
  line('Problem ' + (problemIndex + 1) + ' of ' + PROBLEMS.length + '   Correct: ' + correctCount + ' of ' + PROBLEMS.length, 'black', 16, true);
  line('L1 = ' + PROBLEM_L1 + ' cm, L2 = ' + PROBLEM_L2 + ' cm');
  line('Elbow limit: ' + pr.lo + ' to ' + pr.hi + ' degrees');
  line('Target (' + pr.x + ', ' + pr.y + ') cm, r = ' + (ik.r).toFixed(2) + ' cm');
  if (phase === 'ask') {
    line('Can the tip reach this point?', 'black', 18, true, 26);
  } else {
    const verdict = pr.reachable ? 'Reachable' : 'Not reachable';
    const msg = lastCorrect ? 'Correct: ' + verdict + '. ' + pr.why
      : 'Not quite. This target is ' + verdict + '. ' + pr.why;
    line(msg, lastCorrect ? 'darkgreen' : 'firebrick', 16, false, Math.max(60, r.h - (y - r.y) - 8));
  }
}

// the reason shown in explore mode, built from the same two formulas as the chapter
function exploreReason(p, res) {
  const r2 = (res.r).toFixed(2);
  if (res.reason === 'beyond reach') return 'r = ' + r2 + ' is greater than L1 + L2 = ' + (p.L1 + p.L2) + '.';
  if (res.reason === 'inside the hole') return 'r = ' + r2 + ' is less than |L1 - L2| = ' + Math.abs(p.L1 - p.L2) + ', inside the hole.';
  const bend = (Math.abs(res.solutions[0].theta2)).toFixed(1);
  if (res.reachable) return 'The elbow needs plus or minus ' + bend + ' degrees, and one of those is inside the limit.';
  return 'The elbow needs plus or minus ' + bend + ' degrees, and neither is inside the limit.';
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 43, ROW3 = 78;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 190 : 230);
  nextBtn.position(canvasWidth - (narrow ? 118 : 130), drawHeight + ROW1);
  reachBtn.position(10, drawHeight + ROW2);
  notBtn.position(110, drawHeight + ROW2);
  const colW = canvasWidth / 2;
  const labelW = narrow ? 88 : 140;
  const sliderW = max(50, colW - labelW - 24);
  l1Slider.position(labelW + 10, drawHeight + ROW2); l1Slider.size(sliderW);
  l2Slider.position(labelW + 10, drawHeight + ROW3); l2Slider.size(sliderW);
  loSlider.position(colW + labelW + 6, drawHeight + ROW2); loSlider.size(sliderW);
  hiSlider.position(colW + labelW + 6, drawHeight + ROW3); hiSlider.size(sliderW);
}

function drawControlLabels() {
  if (mode !== 'explore') {
    const text = phase === 'ask' ? 'Work out r and the elbow bend, then commit.' : '';
    txt(text, 10, drawHeight + ROW3 + 11, 'dimgray', LEFT, CENTER, 16);
    return;
  }
  const colW = canvasWidth / 2;
  const pre = narrow ? '' : ' cm';
  txt('L1: ' + l1Slider.value() + pre, 10, drawHeight + ROW2 + 11, 'black');
  txt('L2: ' + l2Slider.value() + pre, 10, drawHeight + ROW3 + 11, 'black');
  txt((narrow ? 'Min: ' : 'Elbow min: ') + loSlider.value() + '°', colW + 6, drawHeight + ROW2 + 11, 'black');
  txt((narrow ? 'Max: ' : 'Elbow max: ') + hiSlider.value() + '°', colW + 6, drawHeight + ROW3 + 11, 'black');
}

function setMode(m) {
  mode = m;
  testPoint = null;
  goal = { t1: REST.t1, t2: REST.t2 };
  if (m === 'explore') {
    goal = { t1: REST.t1, t2: clampElbow(REST.t2) };
  } else if (phase === 'feedback') {
    goal = poseFor(PROBLEMS[problemIndex], PROBLEM_L1, PROBLEM_L2);
  }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [l1Slider, l2Slider, loSlider, hiSlider].forEach(s => (explore ? s.show() : s.hide()));
  [reachBtn, notBtn].forEach(b => (explore ? b.hide() : b.show()));
  if (explore) nextBtn.hide(); else nextBtn.show();
  if (!explore) {
    const ask = phase === 'ask';
    [reachBtn, notBtn].forEach(b => (ask ? b.removeAttribute('disabled') : b.attribute('disabled', '')));
    if (ask) nextBtn.attribute('disabled', ''); else nextBtn.removeAttribute('disabled');
    nextBtn.html(phase === 'done' ? 'Try again' : (problemIndex === PROBLEMS.length - 1 ? 'See score' : 'Next problem'));
  }
  modeSelect.elt.options[1].disabled = !(phase === 'done' || mode === 'explore');
}

function onSliderChange() {
  // keep the limits sensible: the lower bound never passes the upper bound (they cannot cross, by their ranges)
  if (testPoint) goal = poseForPoint(testPoint);
  else goal = { t1: REST.t1, t2: clampElbow(REST.t2) };
}

function clampElbow(t2) { return Math.min(hiSlider.value(), Math.max(loSlider.value(), t2)); }

// the arm pose that goes with a problem or a clicked point
function poseFor(pr, L1, L2) {
  const n = RobotArm.nearestPose2(L1, L2, pr.x, pr.y, [pr.lo, pr.hi]);
  return { t1: n.theta1, t2: n.theta2 };
}

function poseForPoint(pt) {
  const n = RobotArm.nearestPose2(l1Slider.value(), l2Slider.value(), pt.x, pt.y, [loSlider.value(), hiSlider.value()]);
  return { t1: n.theta1, t2: n.theta2 };
}

function onVerdict(saidReachable) {
  if (mode !== 'problems' || phase !== 'ask') return;
  const pr = PROBLEMS[problemIndex];
  lastAnswer = saidReachable;
  lastCorrect = (saidReachable === pr.reachable);
  if (lastCorrect) correctCount++; else missed.push(problemIndex + 1);
  goal = poseFor(pr, PROBLEM_L1, PROBLEM_L2);
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'problems') return;
  if (phase === 'feedback') {
    if (problemIndex < PROBLEMS.length - 1) { problemIndex++; phase = 'ask'; } else { phase = 'done'; }
    goal = { t1: REST.t1, t2: REST.t2 };
  } else if (phase === 'done') {
    problemIndex = 0; phase = 'ask'; correctCount = 0; missed = [];
    goal = { t1: REST.t1, t2: REST.t2 };
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Clicking the plane (explore mode)
// ---------------------------------------------------------------------------
function mousePressed() {
  if (mode !== 'explore' || !insidePlot(mouseX, mouseY)) return;
  const v = currentView();
  const x = Math.round(((mouseX - v.ox) / v.scale) * 10) / 10;
  const y = Math.round(((v.oy - mouseY) / v.scale) * 10) / 10;
  testPoint = { x: x, y: y };
  goal = poseForPoint(testPoint);
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
function txt(str, x, y, col, hAlign, vAlign, size, bold, w, h) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  if (w) text(str, x, y, w, h); else text(str, x, y);
  textStyle(NORMAL);
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
