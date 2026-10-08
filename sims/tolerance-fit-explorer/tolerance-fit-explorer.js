// Tolerance Fit Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 650
// Learning objective (Understand, infer): infer whether a printed hole is too tight, snug, a good sliding fit or
// loose from its designed size, the printer's size error and the size of the part that goes into it, in six
// cases, with at least 5 of 6 correct on the first attempt. Evidence: the outcome committed for each case before
// it is shown. Explore mode is exploration, not evidence.
// Rules: printed hole = designed hole + printer error. Clearance = printed hole - mating part (to 0.01 mm).
// Clearance < 0 is too tight, 0 to under 0.10 is snug, 0.10 to 0.30 is a good sliding fit, above 0.30 is loose.
// All sizes are held as whole hundredths of a millimetre so the arithmetic is exact.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

// adjustable quantities (the chapter's Content table), in millimetres
const SIZE_MIN = 2.5, SIZE_MAX = 26.0, SIZE_STEP = 0.05;
const HOLE_DEFAULT = 25.0, PART_DEFAULT = 24.7;
const ERR_MIN = -0.40, ERR_MAX = 0.40, ERR_STEP = 0.05, ERR_DEFAULT = -0.10;

const OUTCOMES = ['Too tight', 'Snug', 'Good sliding fit', 'Loose'];
const OUTCOME_COLORS = ['lightcoral', 'khaki', 'lightgreen', 'lightsalmon'];
const OUTCOME_NOTES = [
  'The hole is smaller than the part, so the part will not go in.',
  'A press fit. The part needs force, and may not go in at all.',
  'The part slides in and does not rattle.',
  'More than 0.30 mm of room, so the part rattles.'
];
const PICTURE_NOTES = ['will not go in', 'press fit', 'slides in', 'rattles'];

// six cases in fixed order: sizes in hundredths of a millimetre. Hole sizes and printer errors are illustrative.
const CASES = [
  { text: 'STS3215 body width into a pocket designed with no extra room', hole: 2470, err: -15, part: 2470, outcome: 0,
    why: 'The pocket prints 24.55 mm, so the clearance is −0.15 mm and the servo will not go in.' },
  { text: 'STS3215 body width into a pocket designed with 0.3 mm of room', hole: 2500, err: -10, part: 2470, outcome: 2,
    why: 'The pocket prints 24.90 mm, so the clearance is +0.20 mm.' },
  { text: 'M3 screw shaft into a hole designed at 3.2 mm', hole: 320, err: -25, part: 300, outcome: 0,
    why: 'The hole prints 2.95 mm, so the clearance is −0.05 mm and the screw will not enter.' },
  { text: 'M3 screw shaft into a hole designed at 3.4 mm', hole: 340, err: -20, part: 300, outcome: 2,
    why: 'The hole prints 3.20 mm, so the clearance is +0.20 mm.' },
  { text: 'M3 screw shaft into a hole designed at 3.8 mm', hole: 380, err: -10, part: 300, outcome: 3,
    why: 'The hole prints 3.70 mm, so the clearance is +0.70 mm and the screw rattles.' },
  { text: 'Servo output spline of 5.9 mm into a hole designed at 6.0 mm', hole: 600, err: -10, part: 590, outcome: 1,
    why: 'The hole prints 5.90 mm, so the clearance is 0.00 mm, a press fit.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, holeSlider, errSlider, partSlider, choiceBtns = [];

// state
let mode = 'explore';          // 'explore' or 'cases'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six cases', 'cases');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next case');
  actionBtn.mouseClicked(onAction);

  holeSlider = createSlider(SIZE_MIN, SIZE_MAX, HOLE_DEFAULT, SIZE_STEP);
  errSlider = createSlider(ERR_MIN, ERR_MAX, ERR_DEFAULT, ERR_STEP);
  partSlider = createSlider(SIZE_MIN, SIZE_MAX, PART_DEFAULT, SIZE_STEP);

  for (let i = 0; i < OUTCOMES.length; i++) {
    const b = createButton(OUTCOMES[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A cross-section of a printed part with a pocket and a mating part above it. Three numbers set the ' +
    'designed hole size, the printer size error and the mating part size. A bar shows four zones of clearance: ' +
    'too tight, snug, good sliding fit and loose. In the six cases you choose the outcome before it is shown.');
}

// ---------------------------------------------------------------------------
// The clearance rule
// ---------------------------------------------------------------------------
function hundredths(mm) { return Math.round(mm * 100); }

// the three numbers now on screen, in hundredths of a millimetre
function current() {
  if (mode === 'cases' && phase !== 'done') return CASES[idx];
  return { hole: hundredths(holeSlider.value()), err: hundredths(errSlider.value()), part: hundredths(partSlider.value()) };
}
function printedHole(q) { return q.hole + q.err; }
function clearance(q) { return printedHole(q) - q.part; }
function outcomeOf(c) { return c < 0 ? 0 : c < 10 ? 1 : c <= 30 ? 2 : 3; }

function mm(h) { return (h < 0 ? '−' : '') + (Math.abs(h) / 100).toFixed(2); }
function signed(h) { return (h > 0 ? '+' : h < 0 ? '−' : '') + (Math.abs(h) / 100).toFixed(2); }

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Tolerance Fit Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const q = current();
  const reveal = !(mode === 'cases' && phase === 'ask');     // the outcome is hidden until the learner commits
  drawNumbers(q);
  drawPicture(q, reveal);
  drawZoneBar(q, reveal);
  drawInfoPanel(q);
  drawControlLabels(q);
}

// ---------------------------------------------------------------------------
// The three given numbers
// ---------------------------------------------------------------------------
function drawNumbers(q) {
  const labels = ['Designed hole', 'Printer error', 'Mating part'];
  const values = [mm(q.hole) + ' mm', signed(q.err) + ' mm', mm(q.part) + ' mm'];
  const x0 = 8, gap = 6, w = (canvasWidth - 16 - 2 * gap) / 3, top = 40, h = 50;
  for (let i = 0; i < 3; i++) {
    const x = x0 + i * (w + gap);
    fill('white'); stroke('silver'); strokeWeight(1);
    rect(x, top, w, h, 8);
    txt(labels[i], x + w / 2, top + 5, 'black', CENTER, TOP, 16, false);
    txt(values[i], x + w / 2, top + 26, 'navy', CENTER, TOP, 18, true);
  }
  const note = mode === 'cases'
    ? (narrow ? 'Illustrative sizes. Gap not to scale.' : 'Illustrative sizes. The gap in the picture is not drawn to scale.')
    : (narrow ? 'The gap is not drawn to scale.' : 'The gap in the picture is not drawn to scale.');
  txt(note, canvasWidth / 2, top + h + 4, 'dimgray', CENTER, TOP, 16, false);
}

// ---------------------------------------------------------------------------
// Picture: a cross-section of the printed pocket and the mating part
// ---------------------------------------------------------------------------
function drawPicture(q, reveal) {
  const cx = canvasWidth / 2, top = 118;
  const pocketW = 140, blockW = min(280, canvasWidth - 60), blockTop = top + 52, blockH = 66, depth = 40, partH = 46;
  const c = clearance(q), out = outcomeOf(c);

  // the printed part, cut through its pocket
  fill('lightsteelblue'); stroke('steelblue'); strokeWeight(2);
  beginShape();
  vertex(cx - blockW / 2, blockTop); vertex(cx - pocketW / 2, blockTop); vertex(cx - pocketW / 2, blockTop + depth);
  vertex(cx + pocketW / 2, blockTop + depth); vertex(cx + pocketW / 2, blockTop); vertex(cx + blockW / 2, blockTop);
  vertex(cx + blockW / 2, blockTop + blockH); vertex(cx - blockW / 2, blockTop + blockH);
  endShape(CLOSE);
  txt(reveal ? 'hole prints ' + mm(printedHole(q)) + ' mm' : 'hole prints ? mm', cx, blockTop + depth + 13, 'black', CENTER, CENTER, 16, false);

  // the mating part
  stroke('black'); strokeWeight(2); fill('slategray');
  if (!reveal) {
    // before the learner commits, the part waits above the pocket and nothing about the fit is shown
    rect(cx - pocketW / 2, top + 2, pocketW, partH - 6, 4);
    txt('part ' + mm(q.part) + ' mm', cx, top + 2 + (partH - 6) / 2, 'white', CENTER, CENTER, 16, true);
    txt('?', cx, blockTop + depth / 2, 'navy', CENTER, CENTER, 28, true);
    txt('Will it fit?', cx, blockTop + blockH + 5, 'navy', CENTER, TOP, 16, true);
    return;
  }
  if (out === 0) {
    // too tight: the part is wider than the pocket and rests on top of it
    const over = constrain(-c * 0.6, 8, 26);
    rect(cx - (pocketW + over) / 2, blockTop - partH, pocketW + over, partH, 4);
    stroke('firebrick'); strokeWeight(4);
    for (const s of [-1, 1]) {
      const ex = cx + s * pocketW / 2;
      line(ex - 7, blockTop - 7, ex + 7, blockTop + 7); line(ex - 7, blockTop + 7, ex + 7, blockTop - 7);
    }
  } else {
    // the part sits in the pocket; the gap is exaggerated so it can be seen
    const gapPx = out === 3 ? min(18 + (c - 30) * 0.4, 48) : c * 0.6;
    push();
    translate(cx + (out === 3 ? gapPx / 2 - 3 : 0), blockTop + depth - partH / 2 - 1);
    if (out === 3) rotate(radians(5));
    rect(-(pocketW - gapPx) / 2, -partH / 2, pocketW - gapPx, partH, 4);
    pop();
  }
  const py = out === 0 ? blockTop - partH / 2 : blockTop + depth - partH / 2 - 1;
  txt('part ' + mm(q.part) + ' mm', cx, py, 'white', CENTER, CENTER, 16, true);
  txt(PICTURE_NOTES[out], cx, blockTop + blockH + 5, 'black', CENTER, TOP, 16, true);
}

// ---------------------------------------------------------------------------
// The four clearance zones, with a marker for the clearance now
// ---------------------------------------------------------------------------
function drawZoneBar(q, reveal) {
  const x0 = 16, w = canvasWidth - 32, top = 274, h = 26;
  textSize(16); textStyle(NORMAL);
  const want = OUTCOMES.map(s => textWidth(s) + 14);
  const total = want.reduce((a, b) => a + b, 0);
  const segW = want.map(v => v * w / total);
  const c = clearance(q), out = outcomeOf(c);
  let x = x0;
  const starts = [];
  for (let i = 0; i < 4; i++) {
    starts.push(x);
    const lit = reveal && i === out;
    fill(OUTCOME_COLORS[i]); stroke(lit ? 'black' : 'gray'); strokeWeight(lit ? 3 : 1);
    rect(x, top, segW[i], h);
    txt(OUTCOMES[i], x + segW[i] / 2, top + h / 2, 'black', CENTER, CENTER, 16, lit);
    x += segW[i];
  }
  // the clearance value at each boundary
  const ticks = ['0', '0.10', '0.30'];
  for (let i = 0; i < 3; i++) txt(ticks[i], starts[i + 1], top + h + 3, 'black', CENTER, TOP, 16, false);
  txt(narrow ? 'mm' : 'clearance (mm)', x0 + w, top + h + 3, 'dimgray', RIGHT, TOP, 16, false);

  if (!reveal) return;
  // marker: the position inside a zone runs from that zone's lower limit to its upper limit
  const lo = [-40, 0, 10, 30], hi = [0, 10, 30, 80];
  const t = constrain((c - lo[out]) / (hi[out] - lo[out]), 0, 1);
  const mx = starts[out] + (0.1 + 0.8 * t) * segW[out];
  fill('black'); noStroke();
  triangle(mx - 8, top - 12, mx + 8, top - 12, mx, top - 1);
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function drawInfoPanel(q) {
  const x = 8, w = canvasWidth - 16, top = 326, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  const c = clearance(q), out = outcomeOf(c);

  if (mode === 'cases' && phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + CASES.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + CASES.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + CASES.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para('Switch to Explore to change the numbers yourself.', tx, y + 4, tw, 'black', 16, false);
  } else if (mode === 'cases') {
    const k = CASES[idx];
    y = para('Case ' + (idx + 1) + ' of ' + CASES.length + '     Correct: ' + correctCount + ' of ' + CASES.length, tx, y, tw, 'black', 16, true);
    if (phase === 'ask') {
      y = para(k.text + '.', tx, y + 2, tw, 'black', 16, false);
      y = para('Work out the clearance, then choose an outcome below.', tx, y + 4, tw, 'dimgray', 16, false);
    } else {
      if (!narrow) y = para(k.text + '.', tx, y + 2, tw, 'black', 16, false);
      const right = picked === k.outcome;
      const msg = right ? 'Correct: ' + OUTCOMES[k.outcome] + '. ' + k.why
        : 'Not quite. This case is ' + OUTCOMES[k.outcome] + '. ' + k.why;
      y = para(msg, tx, y + 4, tw, right ? 'darkgreen' : 'firebrick', 16, false);
    }
  } else {
    const p = printedHole(q);
    y = para((narrow ? 'Printed hole = ' : 'Printed hole = designed + error = ') + mm(q.hole) + ' + (' + signed(q.err) + ') = ' + mm(p) + ' mm',
      tx, y, tw, 'black', 16, true);
    y = para((narrow ? 'Clearance = ' : 'Clearance = printed hole − part = ') + mm(p) + ' − ' + mm(q.part) + ' = ' + signed(c) + ' mm',
      tx, y + 2, tw, 'black', 16, true);
    y = para('Outcome: ' + OUTCOMES[out], tx, y + 4, tw, 'navy', 18, true);
    y = para(OUTCOME_NOTES[out], tx, y + 2, tw, 'black', 16, false);
  }
  if (y > top + h - 2) layoutNotes.push('info panel overflow by ' + Math.round(y - (top + h - 2)) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const labelW = narrow ? 140 : 215;
  const sliderW = max(60, canvasWidth - labelW - 28);
  [holeSlider, errSlider, partSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + [ROW2, ROW3, ROW4][i]);
    s.size(sliderW);
  });
  const cols = narrow ? 2 : 4, gap = 8, bw = (canvasWidth - 20 - gap * (cols - 1)) / cols;
  choiceBtns.forEach((b, i) => {
    b.position(10 + (i % cols) * (bw + gap), drawHeight + (i < cols ? ROW2 : ROW3));
    b.size(bw, 30);
  });
}

function drawControlLabels(q) {
  if (mode === 'explore') {
    txt((narrow ? 'Hole: ' : 'Designed hole: ') + mm(q.hole) + ' mm', 10, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'Error: ' : 'Printer error: ') + signed(q.err) + ' mm', 10, drawHeight + ROW3 + 11, 'black');
    txt((narrow ? 'Part: ' : 'Mating part: ') + mm(q.part) + ' mm', 10, drawHeight + ROW4 + 11, 'black');
  } else if (phase === 'ask') {
    txt('Which outcome?', narrow ? 150 : 180, drawHeight + ROW1 + 14, 'black', LEFT, CENTER, 16, true);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'cases') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [holeSlider, errSlider, partSlider].forEach(s => explore ? s.show() : s.hide());
  const showChoices = !explore && phase !== 'done';
  choiceBtns.forEach((b, i) => {
    if (showChoices) b.show(); else b.hide();
    b.style('background-color', '');
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (showChoices && i === CASES[idx].outcome) b.style('background-color', 'lightgreen');
    else if (showChoices && i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === CASES.length - 1 ? 'See score' : 'Next case');
}

function onChoice(i) {
  if (mode !== 'cases' || phase !== 'ask') return;
  picked = i;
  if (i === CASES[idx].outcome) correctCount++;
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'cases') return;
  if (phase === 'feedback') {
    if (idx < CASES.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; picked = -1; correctCount = 0; phase = 'ask';
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
// One line of text. Notes a layout problem when the line would be cut off by the canvas edge.
function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const w = textWidth(str);
  const left = hAlign === CENTER ? x - w / 2 : hAlign === RIGHT ? x - w : x;
  if (left < 1 || left + w > canvasWidth - 1) layoutNotes.push('clipped: ' + str);
  text(str, x, y);
  textStyle(NORMAL);
}

// A word-wrapped paragraph that starts at (x, y) and is w wide. Returns the y just below its last line.
function para(str, x, y, w, col, size, bold) {
  size = size || defaultTextSize;
  const lineH = Math.round(size * 1.32);
  noStroke();
  fill(col || 'black');
  textAlign(LEFT, TOP);
  textSize(size);
  textStyle(bold ? BOLD : NORMAL);
  let row = '';
  for (const word of String(str).split(' ')) {
    const trial = row ? row + ' ' + word : word;
    if (row && textWidth(trial) > w) { text(row, x, y); y += lineH; row = word; } else row = trial;
  }
  if (row) { text(row, x, y); y += lineH; }
  textStyle(NORMAL);
  return y;
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
