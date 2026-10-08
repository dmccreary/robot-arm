// Singularity Spotter - p5.js MicroSim
// CANVAS_HEIGHT: 625
// Learning objective (Understand, classify): classify eight elbow angles of a two-link arm as safe, near a
// singularity, or singular, from the value of sin(theta2), with at least 7 of 8 correct on the first attempt.
// Evidence: the class committed for each angle. Explore mode is exploration, not evidence.
// Model: determinant = l1 l2 |sin(theta2)| with l1 = 0.116 m and l2 = 0.135 m. The condition number and the
// joint speeds come from the two-link Jacobian at theta1 = 20 degrees. Teaching thresholds: singular below 0.02,
// near a singularity below 0.3. The arm is a schematic drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 85;           // 2 rows x 35 + 10 = 80, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Singularity Spotter';
const DESCRIPTION = 'A two-link robot arm whose elbow angle can be changed, above a bar with three zones for the ' +
  'size of the sine of the elbow angle: singular, near a singularity and safe. In Explore mode a slider sets ' +
  'the elbow angle and the panel shows the determinant, the condition number and the joint speeds needed. ' +
  'In the quiz the learner classifies eight elbow angles.';
const QUIZ_LABEL = 'Eight angles';
const NOUN = 'angle';
const MASTERY = 7;
const WRONG_LEAD = 'This angle is: ';
const ASK_HINT = 'Work out |sin θ2| and find its zone on the bar. The sign of the angle does not matter.';
const CHOICES = ['Safe', 'Near a singularity', 'Singular'];

const L1 = 0.116, L2 = 0.135;     // metres: the SO-101's upper arm and forearm
const THETA1 = 20;                // degrees: the shoulder stays here
const SINGULAR_BELOW = 0.02;      // teaching thresholds on |sin(theta2)|
const NEAR_BELOW = 0.3;
const TIP_SPEED = 0.1;            // metres per second, along x
const ZONE_FILL = ['#00695C', '#FFA000', '#B71C1C'];     // safe, near, singular
const ZONE_TEXT = ['#00695C', '#9A5B00', '#B71C1C'];     // the same three, dark enough to read as text

// the eight elbow angles, in the chapter's fixed order (degrees). answer is an index into CHOICES.
const ITEMS = [
  { t2: 90, answer: 0, why: 'The determinant is at its largest, so the arm moves freely in every direction.' },
  { t2: 0, answer: 2, why: 'The arm is straight and the determinant is zero.' },
  { t2: 10, answer: 1, why: '|sin θ2| is below 0.3, so joint speeds are already very large.' },
  { t2: 45, answer: 0, why: '|sin θ2| is well above 0.3.' },
  { t2: 180, answer: 2, why: 'The arm is folded back on itself and the determinant is zero.' },
  { t2: -5, answer: 1, why: 'The sign does not matter, and |sin θ2| is below 0.3.' },
  { t2: 170, answer: 1, why: 'The arm is almost folded back, and |sin θ2| is below 0.3.' },
  { t2: 20, answer: 0, why: '|sin θ2| is above 0.3, so the pose is acceptable.' }
];

let t2Slider;

function absSin(t2) {
  const s = Math.abs(Math.sin(t2 * Math.PI / 180));
  return s < 1e-9 ? 0 : s;        // sin(180 degrees) is not exactly zero in floating point
}

// the class of an elbow angle: an index into CHOICES
function classOf(t2) {
  const s = absSin(t2);
  if (s < SINGULAR_BELOW) return 2;
  if (s < NEAR_BELOW) return 1;
  return 0;
}

// the Jacobian of the two-link arm at theta1 = 20 degrees, and what follows from it
function jacobianFacts(t2) {
  const a = THETA1 * Math.PI / 180, b = (THETA1 + t2) * Math.PI / 180;
  const j11 = -L1 * Math.sin(a) - L2 * Math.sin(b), j12 = -L2 * Math.sin(b);
  const j21 = L1 * Math.cos(a) + L2 * Math.cos(b), j22 = L2 * Math.cos(b);
  const s = absSin(t2);
  const det = L1 * L2 * s;
  // singular values of a 2 by 2 matrix: the largest and smallest stretch
  const q = j11 * j11 + j12 * j12 + j21 * j21 + j22 * j22;
  const root = Math.sqrt(Math.max(0, q * q - 4 * det * det));
  const big = Math.sqrt((q + root) / 2), small = Math.sqrt(Math.max(0, (q - root) / 2));
  const facts = { absSin: s, det: det, cond: s === 0 ? Infinity : big / small, speeds: null };
  if (classOf(t2) !== 2) {
    // solve J qdot = (TIP_SPEED, 0) and change radians per second to degrees per second
    const d = j11 * j22 - j12 * j21;
    facts.speeds = [Math.abs(j22 * TIP_SPEED / d) * 180 / Math.PI, Math.abs(-j21 * TIP_SPEED / d) * 180 / Math.PI];
  }
  return facts;
}

function promptText(it) {
  return 'The elbow angle is θ2 = ' + it.t2 + '°. Which class is this pose? Use |sin θ2|.';
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
// Explore control
// ---------------------------------------------------------------------------
function createExploreControls() {
  t2Slider = createSlider(-180, 180, 90, 1);
  t2Slider.attribute('aria-label', 'Elbow angle theta 2 in degrees');
}

function showExploreControls(show) {
  if (show) t2Slider.show(); else t2Slider.hide();
}

function layoutExploreControls() {
  const labelW = 110;
  t2Slider.position(labelW, drawHeight + ROW1 + ROW_H);
  t2Slider.size(max(60, canvasWidth - labelW - 25));
}

function drawExploreLabels() {
  txt('θ2: ' + t2Slider.value() + '°', 10, drawHeight + ROW1 + ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function fmtCond(c) {
  if (!isFinite(c)) return 'infinite';
  return c >= 100 ? String(Math.round(c)) : c.toFixed(1);
}

function drawExplore() {
  const sp = splitRegions(0.5, 300);
  const t2 = t2Slider.value();
  const f = jacobianFacts(t2);
  const k = classOf(t2);
  drawPicture(sp.pic, t2, f.absSin, true);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  y = para('Elbow angle θ2 = ' + t2 + '°', x, y, w, 'black', 16, true);
  y = para('|sin θ2| = ' + f.absSin.toFixed(3), x, y + 2, w);
  y = para((narrow ? 'Determinant = ' : 'Determinant = l1 × l2 × |sin θ2| = ') + f.det.toFixed(4), x, y + 2, w);
  y = para('Condition number = ' + fmtCond(f.cond), x, y + 2, w);
  y = para('Joint speeds for a tip speed of 0.1 m/s along x:', x, y + 6, w);
  y = para(f.speeds ? 'shoulder ' + Math.round(f.speeds[0]).toLocaleString('en-US') + '°/s, elbow ' +
    Math.round(f.speeds[1]).toLocaleString('en-US') + '°/s' : 'undefined: no joint speeds can do it', x, y, w, 'black', 16, true);
  y = para(CHOICES[k], x, y + 6, w, ZONE_TEXT[k], 18, true);
  if (!narrow) {
    y = para('Move the slider toward 0° or 180° and watch the joint speeds climb as the arm straightens or folds.', x, y + 6, w, 'dimgray');
    y = para('The 0.02 and 0.3 limits are teaching thresholds chosen for this MicroSim.', x, y + 6, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.5, 300);
  if (phase === 'done') {
    drawPicture(sp.pic, 90, null, false);
  } else {
    // the marker on the bar is the answer, so it appears only after the learner has committed
    const it = ITEMS[idx];
    drawPicture(sp.pic, it.t2, phase === 'feedback' ? absSin(it.t2) : null, phase === 'feedback');
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The picture: the arm above the zone bar. marked is |sin(theta2)| or null.
// ---------------------------------------------------------------------------
function drawPicture(r, t2, marked, showSpeed) {
  const barH = 100, capH = 24;
  const a = { x: r.x, y: r.y, w: r.w, h: r.h - barH - capH };
  // the forearm swings round the elbow, so the view is centred near the elbow and not on the shoulder
  const scale = Math.min(a.w, a.h) / 32;
  const view = { ox: a.x + a.w / 2 - 10.6 * scale, oy: a.y + a.h / 2 + 4 * scale, scale: scale, rect: a };
  const S = p => RobotArm.toScreen(view, p);

  const arm = RobotArm.presets.twoLink(L1 * 100, L2 * 100, { shoulder: THETA1, elbow: t2 });
  arm.jointRadius = 1.2;
  arm.links.forEach(l => { l.thickness = 2.0; });
  const ps = RobotArm.pose(arm);
  const elbow = ps.joints[1], tip = ps.tip;

  // the dashed line continues the upper arm: theta2 is measured from it
  const e = S(elbow);
  const far = S({ x: elbow.x + 7 * Math.cos(radians(THETA1)), y: elbow.y + 7 * Math.sin(radians(THETA1)) });
  stroke('#B71C1C'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
  line(e.x, e.y, far.x, far.y);
  drawingContext.setLineDash([]);
  RobotArm.draw(arm, view, {});
  if (Math.abs(t2) >= 4) RobotArm.drawAngleArc(view, elbow, THETA1, THETA1 + t2, 24);
  const mid = radians(THETA1 + (Math.abs(t2) >= 4 ? t2 / 2 : 90));
  tag('θ2 = ' + t2 + '°', constrain(e.x + 62 * Math.cos(mid), a.x + 48, a.x + a.w - 48),
    constrain(e.y - 46 * Math.sin(mid), a.y + 14, a.y + a.h - 14), '#B71C1C');

  if (showSpeed) {
    // the tip is asked to move along x at 0.1 m/s
    const t = S(tip), len = 3 * view.scale;
    stroke('black'); strokeWeight(2.5);
    line(t.x, t.y, t.x + len, t.y);
    line(t.x + len, t.y, t.x + len - 8, t.y - 5);
    line(t.x + len, t.y, t.x + len - 8, t.y + 5);
    const lx = constrain(t.x + len / 2, a.x + 32, a.x + a.w - 32);
    const gap = 0.8 * view.scale + 13;          // clear of the round tip
    txt('0.1 m/s', lx, t.y + (tip.y >= elbow.y ? -gap : gap), 'black', CENTER, CENTER);
  }

  drawZoneBar({ x: r.x + 12, y: a.y + a.h, w: r.w - 24, h: barH }, marked);
  txt('Schematic. The shoulder stays at 20°.', r.x + 8, r.y + r.h - 12, 'dimgray', LEFT, CENTER);
}

// three labelled zones for |sin(theta2)|, and a marker when a value is given
function drawZoneBar(b, marked) {
  const zones = [
    { name: 'Singular', range: 'below 0.02', lo: 0, hi: SINGULAR_BELOW, color: ZONE_FILL[2] },
    { name: 'Near', range: '0.02 to 0.3', lo: SINGULAR_BELOW, hi: NEAR_BELOW, color: ZONE_FILL[1] },
    { name: 'Safe', range: '0.3 to 1', lo: NEAR_BELOW, hi: 1, color: ZONE_FILL[0] }
  ];
  const zw = b.w / 3, top = b.y + 50, zh = 46;
  txt('|sin θ2| zones (teaching thresholds)', b.x, b.y + 10, 'black', LEFT, CENTER);
  zones.forEach((z, i) => {
    const zx = b.x + i * zw;
    const here = marked !== null && marked >= z.lo && (marked < z.hi || i === 2);
    fill(z.color); stroke(here ? 'black' : 'white'); strokeWeight(here ? 3 : 1);
    rect(zx + 2, top, zw - 4, zh, 6);
    const ink = i === 1 ? 'black' : 'white';
    txt(z.name, zx + zw / 2, top + 13, ink, CENTER, CENTER, 16, true);
    txt(z.range, zx + zw / 2, top + 33, ink, CENTER, CENTER);
    if (here) {
      // the marker sits inside its zone, in proportion to where the value lies between the zone's limits
      const mx = zx + 8 + (zw - 16) * (marked - z.lo) / (z.hi - z.lo);
      fill('black'); noStroke();
      triangle(mx - 7, top - 10, mx + 7, top - 10, mx, top - 1);
      const label = '|sin θ2| = ' + marked.toFixed(3);
      textSize(16);
      const half = textWidth(label) / 2;
      txt(label, constrain(mx, b.x + half, b.x + b.w - half), top - 20, 'black', CENTER, CENTER, 16, true);
    }
  });
}

// a short label on a white plate, centred on (x, y)
function tag(str, x, y, col) {
  textSize(16);
  const w = textWidth(str) + 10;
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}
