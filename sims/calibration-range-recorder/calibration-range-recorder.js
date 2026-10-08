// Calibration Range Recorder - p5.js MicroSim
// CANVAS_HEIGHT: 600
// Learning objective (Understand, infer): infer the result of a calibration run from a description of what the
// builder did in each of its two steps, in six situations, with at least 5 of 6 correct on the first attempt.
// Evidence: the result committed for each situation before it is shown. Explore mode is exploration, not evidence.
// Rules (Chapter 8, "The Calibration Procedure"):
//   homing offset = reading at the middle pose - 2047
//   range_min = smallest raw position seen in the sweep - offset, range_max = largest raw position seen - offset
//   width in degrees = (range_max - range_min) x 360 / 4095
//   if the smallest and largest values are equal, calibration stops with an error
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

// adjustable quantities (the chapter's Content table), in raw steps
const RAW_MIN = 0, RAW_MAX = 4095, RAW_STEP = 1;
const MID_DEFAULT = 2105, END_A_DEFAULT = 800, END_B_DEFAULT = 3300;
const MIDPOINT = 2047;        // the middle of 0 to 4095: the value the middle pose reads after calibration

const RESULTS = [
  'The program stops with an error',
  'The recorded range is too narrow',
  'The existing file is offered for reuse',
  'The full range 0 to 4095 is recorded',
  'The readings are shifted by the slip'
];
const LETTERS = ['a', 'b', 'c', 'd', 'e'];

// six situations in fixed order (illustrative); result is an index into RESULTS
const SITUATIONS = [
  { text: 'In step 2 the builder never moves the elbow flex joint.', result: 0,
    why: 'A joint that did not move has equal smallest and largest values, and the program raises an error.' },
  { text: 'In step 2 the builder moves the shoulder lift only halfway to each end.', result: 1,
    why: 'The limits are the smallest and largest values seen, so a half sweep records a half range.' },
  { text: 'The builder runs the calibration for an arm that already has a file under the same id.', result: 2,
    why: 'The program asks whether to use the file or type c to calibrate again.' },
  { text: 'The builder does not sweep the wrist roll at all.', result: 3,
    why: 'The wrist roll can turn all the way round, so the program sets its range without a sweep.' },
  { text: 'After calibration, a horn on the shoulder pan slips by 40 steps.', result: 4,
    why: 'The file still holds the old offset, so the joint reads 40 steps (about 3.5 degrees) away from where the file expects it.' },
  { text: 'In step 2 the builder opens the gripper only a quarter of the way.', result: 1,
    why: 'Only the positions that were visited are recorded, so the open end of the range is far too low.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, midSlider, endASlider, endBSlider, choiceBtns = [];

// state
let mode = 'explore';          // 'explore' or 'situations'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six situations', 'situations');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next');
  actionBtn.mouseClicked(onAction);

  midSlider = createSlider(RAW_MIN, RAW_MAX, MID_DEFAULT, RAW_STEP);
  endASlider = createSlider(RAW_MIN, RAW_MAX, END_A_DEFAULT, RAW_STEP);
  endBSlider = createSlider(RAW_MIN, RAW_MAX, END_B_DEFAULT, RAW_STEP);

  for (let i = 0; i < RESULTS.length; i++) {
    const b = createButton(LETTERS[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A dial shows the raw positions of one servo joint from 0 to 4095. An orange arm marks the middle pose ' +
    'and a blue arc marks the sweep between two ends. Three sliders set these positions, and the panel shows the ' +
    'homing offset, the recorded range and its width in degrees. In the six situations you choose the result of ' +
    'a calibration run before it is shown.');
}

// ---------------------------------------------------------------------------
// The calibration arithmetic
// ---------------------------------------------------------------------------
function calibration(mid, endA, endB) {
  const offset = mid - MIDPOINT;
  const lo = Math.min(endA, endB), hi = Math.max(endA, endB);
  return { mid: mid, lo: lo, hi: hi, offset: offset, error: lo === hi,
    rangeMin: lo - offset, rangeMax: hi - offset, widthDeg: (hi - lo) * 360 / 4095, midReading: mid - offset };
}
function stepsToDegrees(s) { return s * 360 / 4095; }
function current() { return calibration(midSlider.value(), endASlider.value(), endBSlider.value()); }
// a number written so that "a - n" still reads correctly when n is negative
function sub(n) { return n < 0 ? '(−' + (-n) + ')' : String(n); }
function num(n) { return n < 0 ? '−' + (-n) : String(n); }

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Calibration Range Recorder', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') { const k = current(); drawDial(k); drawResults(k); }
  else drawSituation();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore: the joint as a dial of raw positions
// ---------------------------------------------------------------------------
function rawAngle(r) { return HALF_PI + r / 4096 * TWO_PI; }     // raw 0 points down, 2048 points up

function drawDial(k) {
  const cx = narrow ? 86 : 110, cy = 116, R = 50;
  noFill(); strokeCap(SQUARE);
  stroke('lightgray'); strokeWeight(12); circle(cx, cy, R * 2);
  if (!k.error) { stroke('steelblue'); arc(cx, cy, R * 2, R * 2, rawAngle(k.lo), rawAngle(k.hi)); }
  strokeCap(ROUND);
  // the 2047 mark at the top, and where 0 meets 4095 at the bottom
  stroke('black'); strokeWeight(2);
  line(cx, cy - R - 9, cx, cy - R + 9);
  line(cx, cy + R - 9, cx, cy + R + 9);
  txt('2047', cx, cy - R - 20, 'black', CENTER, CENTER, 16, false);
  txt('0 | 4095', cx, cy + R + 20, 'black', CENTER, CENTER, 16, false);
  // the arm at the middle pose
  const a = rawAngle(k.mid);
  stroke('darkorange'); strokeWeight(7);
  line(cx, cy, cx + (R - 4) * cos(a), cy + (R - 4) * sin(a));
  fill('dimgray'); noStroke(); circle(cx, cy, 16);

  // legend
  const lx = cx + R + (narrow ? 34 : 60), lw = canvasWidth - lx - 12;
  let y = 56;
  const item = (col, str) => {
    fill(col); noStroke(); rect(lx, y + 4, 14, 14, 3);
    y = para(str, lx + 22, y, lw - 22, 'black', 16, false) + 6;
  };
  item('darkorange', 'Middle pose: raw ' + k.mid);
  item('steelblue', 'Sweep: raw ' + k.lo + ' to ' + k.hi);
  item('black', '2047 is the middle of 0 to 4095');
  if (y > 190) layoutNotes.push('legend overflow by ' + Math.round(y - 190) + ' px');
}

function drawResults(k) {
  const x = 8, w = canvasWidth - 16, top = 194, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;
  y = para('Homing offset = ' + (narrow ? '' : 'middle − 2047 = ') + k.mid + ' − ' + MIDPOINT + ' = ' + num(k.offset), tx, y, tw, 'black', 16, true);
  if (k.error) {
    y = para('The two ends of the sweep are equal, so the joint did not move. Calibration stops with an error.', tx, y + 6, tw, 'firebrick', 16, true);
  } else {
    y = para('Recorded range = ' + k.lo + ' − ' + sub(k.offset) + ' to ' + k.hi + ' − ' + sub(k.offset) + ' = ' + num(k.rangeMin) + ' to ' + num(k.rangeMax),
      tx, y + 6, tw, 'black', 16, true);
    y = para('Width = (' + num(k.rangeMax) + ' − ' + sub(k.rangeMin) + ') × 360 / 4095 = ' + k.widthDeg.toFixed(1) + ' degrees', tx, y + 6, tw, 'black', 16, true);
  }
  y = para('Reading at the middle pose = ' + k.mid + ' − ' + sub(k.offset) + ' = ' + k.midReading, tx, y + 6, tw, 'black', 16, true);
  const tip = !k.error && (k.mid < k.lo || k.mid > k.hi) ? 'On a real arm the middle pose lies between the two ends of the sweep.'
    : !k.error && (k.rangeMin < 0 || k.rangeMax > 4095) ? 'A real servo reports only 0 to 4095, so the middle pose should be near the middle of the sweep.'
    : 'Move the middle pose: the offset changes. Move an end: only the range changes.';
  if (y + 8 + para(tip, tx, 0, tw, 'dimgray', 16, false, true) <= bottom) y = para(tip, tx, y + 8, tw, 'dimgray', 16, false);
  if (y > bottom) layoutNotes.push('results panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// The six situations
// ---------------------------------------------------------------------------
function drawSituation() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + SITUATIONS.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + SITUATIONS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + SITUATIONS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para('Step 1 stores one number for each joint: the homing offset, from the middle pose.', tx, y + 10, tw, 'black', 16, false);
    y = para('Step 2 stores two numbers for each joint: the smallest and the largest position you moved it to.', tx, y + 6, tw, 'black', 16, false);
    y = para('Switch to Explore to change the poses and watch these numbers.', tx, y + 10, tw, 'dimgray', 16, false);
  } else {
    const s = SITUATIONS[idx];
    y = para('Situation ' + (idx + 1) + ' of ' + SITUATIONS.length + ' (illustrative)', tx, y, tw, 'black', 16, true);
    y = para(s.text, tx, y + 4, tw, 'black', narrow ? 16 : 18, false);
    y = para('What is the result of the calibration run?', tx, y + 8, tw, 'navy', 16, true);
    y += 4;
    for (let i = 0; i < RESULTS.length; i++) {
      const isRight = phase === 'feedback' && i === s.result, isWrongPick = phase === 'feedback' && i === picked && i !== s.result;
      if (isRight || isWrongPick) {
        fill(isRight ? 'honeydew' : 'mistyrose'); stroke(isRight ? 'seagreen' : 'firebrick'); strokeWeight(2);
        rect(tx - 4, y - 1, tw + 8, 24, 5);
      }
      txt(LETTERS[i] + ') ' + RESULTS[i], tx, y + 12, 'black', LEFT, CENTER, 16, isRight);
      y += 26;
    }
    if (phase === 'feedback') {
      const right = picked === s.result, r = RESULTS[s.result];
      const msg = right ? 'Correct: ' + r + '. ' + s.why
        : 'Not quite. The result is: ' + r.charAt(0).toLowerCase() + r.slice(1) + '. ' + s.why;
      y = para(msg, tx, y + 6, tw, right ? 'darkgreen' : 'firebrick', 16, false);
    }
  }
  if (y > bottom) layoutNotes.push('situation panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 150 : 170, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const labelW = narrow ? 150 : 190;
  const sliderW = max(60, canvasWidth - labelW - 28);
  [midSlider, endASlider, endBSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + [ROW2, ROW3, ROW4][i]);
    s.size(sliderW);
  });
  const gap = 8, bw = min(90, (canvasWidth - 20 - gap * 4) / 5);
  choiceBtns.forEach((b, i) => { b.position(10 + i * (bw + gap), drawHeight + ROW2); b.size(bw, 30); });
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt((narrow ? 'Middle: ' : 'Middle pose: ') + midSlider.value(), 10, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'One end: ' : 'One sweep end: ') + endASlider.value(), 10, drawHeight + ROW3 + 11, 'black');
    txt((narrow ? 'Other end: ' : 'Other sweep end: ') + endBSlider.value(), 10, drawHeight + ROW4 + 11, 'black');
  } else if (phase !== 'done') {
    txt('Correct: ' + correctCount + ' of ' + SITUATIONS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask') txt('Choose a letter.', canvasWidth - 10, drawHeight + ROW3 + 14, 'dimgray', RIGHT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'situations') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [midSlider, endASlider, endBSlider].forEach(s => explore ? s.show() : s.hide());
  const showChoices = !explore && phase !== 'done';
  choiceBtns.forEach((b, i) => {
    if (showChoices) b.show(); else b.hide();
    b.style('background-color', '');
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (showChoices && i === SITUATIONS[idx].result) b.style('background-color', 'lightgreen');
    else if (showChoices && i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === SITUATIONS.length - 1 ? 'See score' : 'Next');
}

function onChoice(i) {
  if (mode !== 'situations' || phase !== 'ask') return;
  picked = i;
  if (i === SITUATIONS[idx].result) correctCount++;
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'situations') return;
  if (phase === 'feedback') {
    if (idx < SITUATIONS.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
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
// With dry set, nothing is drawn, so the result is the height the paragraph would need when y is 0.
function para(str, x, y, w, col, size, bold, dry) {
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
    if (row && textWidth(trial) > w) { if (!dry) text(row, x, y); y += lineH; row = word; } else row = trial;
  }
  if (row) { if (!dry) text(row, x, y); y += lineH; }
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
