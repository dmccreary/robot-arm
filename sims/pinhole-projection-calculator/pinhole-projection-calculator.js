// Pinhole Projection Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 600
// Learning objective (Apply, calculate): calculate the pixel position of a point, or the sideways distance of
// a point from its pixel and depth, using the pinhole camera model with fx = fy = 500 and the principal point
// (320, 240), for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first
// attempt. Evidence: the number committed with Check. Explore mode is exploration, not evidence.
// Model: u = fx X / Z + cx and v = fy Y / Z + cy. The inverse is X = (u - cx) Z / fx.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 445;
let controlHeight = 155;          // 4 rows x 35 + 10 = 150, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'Pinhole Projection Calculator';
const DESCRIPTION = 'On the left, a camera picture 640 pixels wide and 480 high, with its centre marked and a dot ' +
  'at the pixel where a point lands. On the right, a view from above of the camera, its view axis and the point. ' +
  'In Explore mode three sliders set the X, Y and Z of the point. In the six problems the learner types a ' +
  'pixel coordinate or a distance.';
const QUIZ_LABEL = 'Six problems';
const NOUN = 'problem';
const MASTERY = 5;
const WRONG_LEAD = 'The answer is ';
const ASK_HINT = 'Use the pinhole formula, type the number, then press Check.';
const EXAMPLE_NUMBER = '350';
const ANSWER_LABEL_W = 104;

const F = 500;                    // focal length in pixels (fx = fy)
const CX = 320, CY = 240;         // the principal point: the centre of the picture
const IMG_W = 640, IMG_H = 480;

// the six problems, in the chapter's fixed order. tol is how close the typed answer must be.
const ITEMS = [
  { X: 0.10, Y: 0.00, Z: 0.50, ask: 'u', key: 420, tol: 1, why: 'u = 500 × 0.10 / 0.50 + 320 = 420.' },
  { X: 0.10, Y: 0.05, Z: 0.50, ask: 'v', key: 290, tol: 1, why: 'v = 500 × 0.05 / 0.50 + 240 = 290.' },
  { X: -0.05, Y: 0.00, Z: 0.25, ask: 'u', key: 220, tol: 1, why: 'u = 500 × (-0.05) / 0.25 + 320 = 220.' },
  { X: 0.00, Y: 0.06, Z: 0.30, ask: 'v', key: 340, tol: 1, why: 'v = 500 × 0.06 / 0.30 + 240 = 340.' },
  { X: 0.20, Y: 0.00, Z: 1.00, ask: 'u', key: 420, tol: 1,
    why: 'u = 500 × 0.20 / 1.00 + 320 = 420: a farther point has a smaller offset from the centre.' },
  { X: 0.20, Y: 0.00, Z: 0.50, ask: 'X', key: 0.200, tol: 0.001,
    why: 'X = (u - 320) × Z / 500 = 200 × 0.50 / 500 = 0.200 m.' }
];

let xSlider, ySlider, zSlider;

// the pinhole model: a point (X, Y, Z) in metres in the camera's frame lands on the pixel (u, v)
function project(X, Y, Z) {
  return { u: F * X / Z + CX, v: F * Y / Z + CY };
}

function isRight(it, typed) { return Math.abs(typed - it.key) <= it.tol + 1e-9; }
function answerText(it) { return it.ask === 'X' ? it.key.toFixed(3) + ' m' : it.key + ' pixels'; }
function answerLabel(it) { return it.ask === 'X' ? 'X (m) =' : it.ask + ' (pixels) ='; }

function promptText(it) {
  if (it.ask === 'X') {
    return 'A point is seen at u = ' + project(it.X, it.Y, it.Z).u + ' pixels. Its depth is Z = ' + it.Z.toFixed(2) +
      ' m. How far to the right of the view axis is it? Find X, in metres.';
  }
  return 'A point is at X = ' + it.X.toFixed(2) + ' m, Y = ' + it.Y.toFixed(2) + ' m, Z = ' + it.Z.toFixed(2) +
    ' m. At which pixel ' + (it.ask === 'u' ? 'column u' : 'row v') + ' does it land?';
}

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
// Explore controls
// ---------------------------------------------------------------------------
function createExploreControls() {
  xSlider = createSlider(-0.50, 0.50, 0.10, 0.01);
  xSlider.attribute('aria-label', 'X in metres, to the right of the view axis');
  ySlider = createSlider(-0.50, 0.50, 0.05, 0.01);
  ySlider.attribute('aria-label', 'Y in metres, below the view axis');
  zSlider = createSlider(0.10, 2.00, 0.50, 0.01);
  zSlider.attribute('aria-label', 'Z in metres, the depth along the view');
}

function showExploreControls(show) {
  [xSlider, ySlider, zSlider].forEach(s => (show ? s.show() : s.hide()));
}

function layoutExploreControls() {
  const labelW = narrow ? 150 : 200;
  const w = max(60, canvasWidth - labelW - 25);
  [xSlider, ySlider, zSlider].forEach((s, i) => {
    s.position(labelW, drawHeight + ROW1 + (i + 1) * ROW_H);
    s.size(w);
  });
}

function drawExploreLabels() {
  const names = narrow ? ['X right', 'Y down', 'Z depth'] : ['X (to the right)', 'Y (downward)', 'Z (depth)'];
  [xSlider, ySlider, zSlider].forEach((s, i) => {
    txt(names[i] + ': ' + s.value().toFixed(2) + ' m', 10, drawHeight + ROW1 + (i + 1) * ROW_H + 11);
  });
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function regions() {
  const bandH = narrow ? 186 : 216;
  return { band: { x: 0, y: 40, w: canvasWidth, h: bandH },
           panel: { x: 8, y: 40 + bandH + 4, w: canvasWidth - 16, h: drawHeight - 8 - (40 + bandH + 4) } };
}

function f2(v) { return (Math.abs(v) < 0.005 ? 0 : v).toFixed(2); }
function px(v) { return String(Math.round(v * 10) / 10); }

function drawExplore() {
  const rg = regions();
  const X = xSlider.value(), Y = ySlider.value(), Z = zSlider.value();
  const p = project(X, Y, Z);
  drawBand(rg.band, { X: X, Z: Z }, p, '(' + px(p.u) + ', ' + px(p.v) + ')');

  const r = rg.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 8;
  y = para('The point lands on pixel (u, v) = (' + px(p.u) + ', ' + px(p.v) + ')', x, y, w, 'black', 16, true);
  y = para('u = 500 × X / Z + 320 = 500 × ' + (X < 0 ? '(' + f2(X) + ')' : f2(X)) + ' / ' + f2(Z) + ' + 320 = ' + px(p.u), x, y + 4, w);
  y = para('v = 500 × Y / Z + 240 = 500 × ' + (Y < 0 ? '(' + f2(Y) + ')' : f2(Y)) + ' / ' + f2(Z) + ' + 240 = ' + px(p.v), x, y + 2, w);
  const inside = p.u >= 0 && p.u <= IMG_W && p.v >= 0 && p.v <= IMG_H;
  if (!inside) y = para('That pixel is outside the 640 by 480 picture, so the camera does not see the point.', x, y + 4, w, 'firebrick');
  if (!narrow) y = para('Double Z and the pixel moves halfway back toward the centre (320, 240): farther things look smaller.', x, y + 4, w, 'dimgray');
  fits(y, r);
}

function drawQuiz() {
  const rg = regions();
  if (phase === 'done') {
    drawBand(rg.band, null, null, '');
  } else {
    const it = ITEMS[idx];
    const p = project(it.X, it.Y, it.Z);
    const done = phase === 'feedback';
    if (it.ask === 'X') {
      // the pixel is given and the point is the answer, so the point appears only after the commit
      drawBand(rg.band, done ? it : null, p, 'u = ' + p.u);
    } else {
      // the point is given and the pixel is the answer
      drawBand(rg.band, it, done ? p : null, '(' + px(p.u) + ', ' + px(p.v) + ')');
    }
  }
  drawQuizPanel(rg.panel);
}

// ---------------------------------------------------------------------------
// The picture: the camera's image on the left, the view from above on the right.
// point is { X, Z } in metres or null. pixel is { u, v } or null.
// ---------------------------------------------------------------------------
function drawBand(b, point, pixel, pixelLabel) {
  const iw = narrow ? 168 : 224, ih = iw * IMG_H / IMG_W;
  const ix = 34, iy = b.y + 26;
  const k = iw / IMG_W;

  // the image: (0, 0) is its top left corner, u runs to the right and v runs down
  fill('white'); stroke('#212121'); strokeWeight(2);
  rect(ix, iy, iw, ih);
  txt('(0, 0)', ix - 4, iy - 12, 'black', LEFT, CENTER);
  txt('u →', ix + iw, iy - 12, 'black', RIGHT, CENTER);
  txt('v', ix - 16, iy + ih - 30, 'black', CENTER, CENTER);
  txt('↓', ix - 16, iy + ih - 12, 'black', CENTER, CENTER);
  txt(narrow ? 'centre (320, 240)' : 'f = 500, centre (320, 240)', ix, iy + ih + 13, 'dimgray', LEFT, CENTER);
  const cx = ix + CX * k, cy = iy + CY * k;
  stroke('#757575'); strokeWeight(1.5);
  line(cx - 9, cy, cx + 9, cy); line(cx, cy - 9, cx, cy + 9);
  if (pixel) {
    const inside = pixel.u >= 0 && pixel.u <= IMG_W && pixel.v >= 0 && pixel.v <= IMG_H;
    const dx = constrain(ix + pixel.u * k, ix, ix + iw), dy = constrain(iy + pixel.v * k, iy, iy + ih);
    // the dashed lines are the offset from the centre: sideways first, then down or up
    stroke('#B71C1C'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
    line(cx, cy, dx, cy); line(dx, cy, dx, dy);
    drawingContext.setLineDash([]);
    fill(inside ? '#B71C1C' : 'white'); stroke(inside ? 'white' : '#B71C1C'); strokeWeight(2);
    circle(dx, dy, 12);
    textSize(16);
    const text = inside ? pixelLabel : 'outside';
    const half = textWidth(text) / 2 + 6;
    tag(text, constrain(dx, ix + half, ix + iw - half), dy + 22 > iy + ih - 12 ? dy - 22 : dy + 22, '#B71C1C');
  }

  // the view from above: the camera looks up the page along Z, and X is to its right
  const tx = ix + iw + (narrow ? 38 : 60);
  const t = { x: tx, y: b.y + 6, w: Math.min(canvasWidth - tx - 12, 320), h: b.h - 30 };
  fill('white'); stroke('#9E9E9E'); strokeWeight(1);
  rect(t.x, t.y, t.w, t.h, 6);
  const camX = t.x + t.w / 2, camY = t.y + t.h - 16;
  const sx = (t.w / 2 - 8) / 0.5, sz = (camY - t.y - 8) / 2.0;      // pixels per metre, sideways and in depth
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(t.x + 1, t.y + 1, t.w - 2, t.h - 2);
  drawingContext.clip();
  // what the camera can see: u from 0 to 640 means X between -0.64 Z and +0.64 Z
  noStroke(); fill('rgba(63,81,181,0.12)');
  triangle(camX, camY, camX - 0.64 * 2.2 * sx, camY - 2.2 * sz, camX + 0.64 * 2.2 * sx, camY - 2.2 * sz);
  stroke('#757575'); strokeWeight(1.5); drawingContext.setLineDash([5, 4]);
  line(camX, camY, camX, t.y);
  drawingContext.setLineDash([]);
  if (point) {
    const qx = camX + point.X * sx, qy = camY - point.Z * sz;
    stroke('#F57C00'); strokeWeight(2);
    line(camX, camY, qx, qy);
    fill('#F57C00'); stroke('#7A3E00'); strokeWeight(2);
    circle(qx, qy, 13);
  }
  drawingContext.restore();
  fill('#37474F'); stroke('#212121'); strokeWeight(1.5);
  rect(camX - 13, camY - 4, 26, 14, 3);
  triangle(camX - 7, camY - 4, camX + 7, camY - 4, camX, camY - 13);
  txt('From above', t.x + 6, t.y + 12, 'dimgray', LEFT, CENTER);
  // a narrow box has no room for the 2 m mark beside its title
  (narrow ? [1] : [1, 2]).forEach(zm => txt(zm + ' m', camX + 6, camY - zm * sz + (zm === 2 ? 14 : 0), 'dimgray', LEFT, CENTER));
  txt('Z', narrow ? t.x + t.w - 14 : camX - 10, narrow ? t.y + 12 : t.y + 34, 'black', CENTER, CENTER, 16, true);
  txt('−0.5', t.x + 4, t.y + t.h + 12, 'dimgray', LEFT, CENTER);
  txt('X (m)', camX, t.y + t.h + 12, 'black', CENTER, CENTER);
  txt('0.5', t.x + t.w - 4, t.y + t.h + 12, 'dimgray', RIGHT, CENTER);
}

// a short label on a white plate, centred on (x, y)
function tag(str, x, y, col) {
  textSize(16);
  const w = textWidth(str) + 10;
  fill(255, 255, 255, 235); stroke(150); strokeWeight(1);
  rect(x - w / 2, y - 11, w, 22, 5);
  txt(str, x, y, col, CENTER, CENTER);
}
