// Print Defect Diagnoser - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Analyze, distinguish): distinguish five common FDM print faults from eight written
// descriptions of failed prints, with at least 7 of 8 correct on the first attempt. Evidence: the fault committed
// for each description. Reading the fault cards in Explore mode is exploration, not evidence.
// The five faults, with what you see, the usual cause and the usual remedy, are the table in the Chapter 7
// section "Print Quality Inspection". The eight descriptions are illustrative and were written for this sim.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 122;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const FAULTS = [
  { name: 'Warping', see: 'Corners curl off the bed.',
    cause: 'Plastic cooling and shrinking, or a dirty or unlevel bed.',
    remedy: 'Clean and level the bed, check the bed temperature, remove draughts.' },
  { name: 'Stringing', see: 'Fine hairs of plastic between separate parts of the print.',
    cause: 'The nozzle is too hot, or the filament is wet.',
    remedy: 'Lower the nozzle temperature, dry the filament, turn on retraction.' },
  { name: 'Under-extrusion', see: 'Gaps or thin, weak walls.',
    cause: 'Too little plastic is pushed: a partly blocked nozzle, a tangled spool, or a worn extruder.',
    remedy: 'Clear the nozzle, free the spool, check the filament path.' },
  { name: 'Layer shift', see: 'The upper part is displaced sideways from the lower part.',
    cause: 'The nozzle hit something (a curled corner), or a belt or screw slipped.',
    remedy: 'Remove what was hit, check that the belts are tight.' },
  { name: 'Poor first layer', see: 'The first lines do not stick, or are squashed unevenly.',
    cause: 'The bed is not level, or the nozzle is too far from or too close to it.',
    remedy: 'Level the bed, set the first-layer height, clean the bed.' }
];

// eight descriptions in fixed order; fault is an index into FAULTS
const ITEMS = [
  { text: 'The corners of a large flat part have lifted off the bed and the part rocks when touched.', fault: 0,
    why: 'Corners that lift as the plastic cools and shrinks are warping.' },
  { text: 'Thin hairs of plastic stretch between two posts that were meant to be separate.', fault: 1,
    why: 'Hairs between separate features come from plastic oozing while the nozzle travels.' },
  { text: 'The walls have visible gaps between the lines and the part snaps easily.', fault: 2,
    why: 'Gaps and thin walls mean too little plastic was pushed.' },
  { text: 'The top half of a tall part sits 3 mm to one side of the bottom half, and every layer above one height is displaced the same way.', fault: 3,
    why: 'A sudden sideways displacement that continues up the part is a layer shift.' },
  { text: 'The first layer came off the bed as loose strands, and the lines were squashed flat on one side of the bed and barely touching on the other.', fault: 4,
    why: 'An uneven first layer across the bed points to a bed that is not level.' },
  { text: 'A long thin part was flat for the first hour, and by the end its ends bowed upward and the lower layers had split apart.', fault: 0,
    why: 'Bowing and split layers appear as the cooling part shrinks and pulls itself up.' },
  { text: 'Halfway through the print the extruder started clicking, and the later layers have holes and look thin.', fault: 2,
    why: 'A clicking extruder means the filament is not feeding, so the later layers got too little plastic.' },
  { text: 'After the nozzle struck a curled-up corner, every later layer is displaced about 3 mm along one axis.', fault: 3,
    why: 'A hit on the nozzle moved the print relative to the machine, so the layers above are shifted.' }
];
const MASTERY = 7;

// controls
let modeSelect, actionBtn, faultBtns = [];

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let shown = 0;                 // the fault card on screen in Explore mode
let idx = 0, picked = -1, correctCount = 0;
let results = [];              // true or false for each description answered so far

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore the five faults', 'explore');
  modeSelect.option('Eight descriptions', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next');
  actionBtn.mouseClicked(onAction);

  for (let i = 0; i < FAULTS.length; i++) {
    const b = createButton(FAULTS[i].name);
    b.mouseClicked(() => onFault(i));
    faultBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('Five buttons name five 3D print faults: warping, stringing, under-extrusion, layer shift and poor ' +
    'first layer. In Explore mode a card shows a small picture of the chosen fault with what you see, the usual ' +
    'cause and the usual remedy. In the eight descriptions you read a failed print and choose which fault it is.');
}

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Print Defect Diagnoser', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  // picture box: beside the card on a wide screen, above it on a narrow one
  const pw = 230, ph = narrow ? 110 : 150;
  const px = narrow ? (canvasWidth - pw) / 2 : 12, py = narrow ? 40 : 46;
  fill('white'); stroke('silver'); strokeWeight(1);
  rect(px, py, pw, ph, 10);
  const pictured = mode === 'explore' ? shown : (phase === 'feedback' ? ITEMS[idx].fault : -1);
  if (pictured >= 0) drawFault(pictured, px, py, pw, ph);
  else if (phase === 'done') drawDots(px + 15, py + ph / 2 - 14, pw - 30);
  else txt('?', px + pw / 2, py + ph / 2, 'navy', CENTER, CENTER, 64, true);

  if (!narrow) {
    // the left column under the picture
    const lx = px + 4, lw = pw - 8;
    if (mode === 'explore') {
      let y = para('Pick a fault below to read about it.', lx, py + ph + 12, lw, 'black', 16, false);
      para('A good inspection goes: look, feel, measure, then test-fit.', lx, y + 8, lw, 'dimgray', 16, false);
    } else {
      txt('Your answers so far', lx, py + ph + 22, 'black', LEFT, CENTER, 16, true);
      drawDots(lx + 4, py + ph + 44, lw - 8);
    }
  }
  drawCard(narrow ? 8 : px + pw + 10, narrow ? py + ph + 6 : 46);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The card: a fault in Explore mode, a description in the quiz
// ---------------------------------------------------------------------------
function drawCard(x, top) {
  const w = canvasWidth - x - 8, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;

  if (mode === 'explore') {
    const f = FAULTS[shown];
    y = para(f.name, tx, y, tw, 'navy', 20, true);
    y = para('What you see: ' + f.see, tx, y + 4, tw, 'black', 16, false);
    y = para('Usual cause: ' + f.cause, tx, y + 6, tw, 'black', 16, false);
    y = para('Usual remedy: ' + f.remedy, tx, y + 6, tw, 'black', 16, false);
    y = para('When you know all five, choose Eight descriptions and answer: Which fault is this?', tx, y + 10, tw, 'dimgray', 16, false);
  } else if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + ITEMS.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + ITEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + ITEMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    const missed = [];
    results.forEach((r, i) => { const n = FAULTS[ITEMS[i].fault].name; if (!r && !missed.includes(n)) missed.push(n); });
    y = para(missed.length ? 'Faults you missed: ' + missed.join(', ') + '.' : 'You missed no faults.', tx, y + 6, tw, 'black', 16, false);
    y = para('Switch to Explore to read the cause and the remedy of each fault again.', tx, y + 6, tw, 'black', 16, false);
  } else {
    const it = ITEMS[idx];
    y = para('Description ' + (idx + 1) + ' of ' + ITEMS.length + (narrow ? '   ' : '     ') + 'Correct: ' + correctCount + ' of ' + ITEMS.length,
      tx, y, tw, 'black', 16, true);
    if (!narrow) y = para('A failed print (illustrative):', tx, y + 4, tw, 'dimgray', 16, false);
    y = para(it.text, tx, y + 4, tw, 'black', narrow ? 16 : 18, false);
    if (phase === 'ask') {
      y = para('Which fault is this? Choose one below.', tx, y + 10, tw, 'navy', 16, true);
      if (narrow) y = para('The descriptions are illustrative.', tx, y + 4, tw, 'dimgray', 16, false);
    } else {
      const right = picked === it.fault;
      const name = FAULTS[it.fault].name;
      y = para((right ? 'Correct: ' + name + '. ' : 'Not quite. This is ' + name + '. ') + it.why, tx, y + 10, tw,
        right ? 'darkgreen' : 'firebrick', 16, false);
    }
  }
  if (y > top + h - 2) layoutNotes.push('card overflow by ' + Math.round(y - (top + h - 2)) + ' px');
}

// eight numbered dots: a tick for a correct answer, a cross for a wrong one, plain for not yet answered
function drawDots(x, y, w) {
  const step = w / 4, r = 12;
  for (let i = 0; i < ITEMS.length; i++) {
    const cx = x + step * (i % 4) + step / 2, cy = y + (i < 4 ? 0 : 34);
    const done = i < results.length;
    fill(!done ? 'white' : results[i] ? 'mediumseagreen' : 'lightcoral'); stroke('gray'); strokeWeight(1);
    circle(cx, cy, r * 2);
    if (!done) { txt(String(i + 1), cx, cy + 1, 'black', CENTER, CENTER, 16, false); continue; }
    stroke('white'); strokeWeight(3); noFill();
    if (results[i]) { line(cx - 6, cy, cx - 2, cy + 5); line(cx - 2, cy + 5, cx + 6, cy - 5); }
    else { line(cx - 5, cy - 5, cx + 5, cy + 5); line(cx - 5, cy + 5, cx + 5, cy - 5); }
  }
}

// ---------------------------------------------------------------------------
// Small pictures of the five faults (side views of a part on the printer bed)
// ---------------------------------------------------------------------------
function drawFault(i, x, y, w, h) {
  const cx = x + w / 2, bedY = y + h - 20;
  // the bed
  if (i !== 4) { fill('dimgray'); noStroke(); rect(x + 14, bedY, w - 28, 8, 2); }
  if (i === 0) {
    // warping: the ends of a flat part curl up off the bed
    fill('orange'); stroke('chocolate'); strokeWeight(2);
    beginShape();
    vertex(cx - 86, bedY - 30); vertex(cx - 50, bedY - 20); vertex(cx + 50, bedY - 20); vertex(cx + 86, bedY - 30);
    vertex(cx + 86, bedY - 12); vertex(cx + 50, bedY); vertex(cx - 50, bedY); vertex(cx - 86, bedY - 12);
    endShape(CLOSE);
    stroke('firebrick'); strokeWeight(3);
    for (const s of [-1, 1]) { const ax = cx + s * 78; line(ax, bedY - 36, ax, bedY - 54); line(ax, bedY - 54, ax - 5, bedY - 47); line(ax, bedY - 54, ax + 5, bedY - 47); }
  } else if (i === 1) {
    // stringing: thin hairs between two posts
    stroke('chocolate'); strokeWeight(1.5); noFill();
    for (let k = 0; k < 5; k++) { const yy = bedY - 14 - k * 12; bezier(cx - 40, yy, cx - 12, yy + 7, cx + 12, yy + 7, cx + 40, yy - 3); }
    fill('orange'); strokeWeight(2);
    rect(cx - 66, bedY - 72, 26, 72); rect(cx + 40, bedY - 72, 26, 72);
  } else if (i === 2) {
    // under-extrusion: the lines of a wall have gaps in them
    stroke('orange'); strokeWeight(6); strokeCap(SQUARE);
    const gaps = [[], [[20, 44]], [], [[70, 104], [128, 140]], [[10, 30]], [[52, 96]], [[118, 150]]];
    for (let k = 0; k < 7; k++) {
      const yy = bedY - 6 - k * 10; let sx = 0;
      for (const g of gaps[k]) { line(cx - 80 + sx, yy, cx - 80 + g[0], yy); sx = g[1]; }
      line(cx - 80 + sx, yy, cx + 80, yy);
    }
    strokeCap(ROUND);
  } else if (i === 3) {
    // layer shift: every layer above one height is displaced the same way
    fill('orange'); stroke('chocolate'); strokeWeight(2);
    rect(cx - 44, bedY - 40, 70, 40); rect(cx - 22, bedY - 80, 70, 40);
    stroke('firebrick'); strokeWeight(3);
    const ay = bedY - 92; line(cx - 44, ay, cx - 22, ay); line(cx - 22, ay, cx - 29, ay - 5); line(cx - 22, ay, cx - 29, ay + 5);
  } else {
    // poor first layer: a bed that is not level squashes the lines on one side and misses them on the other
    stroke('dimgray'); strokeWeight(8); line(x + 16, bedY - 10, x + w - 16, bedY + 4);
    noStroke(); fill('orange');
    for (let k = 0; k < 4; k++) rect(x + 26 + k * 24, bedY - 19 + k * 1.4, 20, 5, 2);          // squashed flat
    for (let k = 0; k < 4; k++) circle(x + w - 112 + k * 24, bedY - 22 - k * 2, 11);             // barely touching
    stroke('chocolate'); strokeWeight(2); noFill();
    bezier(x + w - 40, bedY - 28, x + w - 20, bedY - 60, x + w - 60, bedY - 62, x + w - 34, bedY - 44);  // a loose strand
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 180 : 200, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const cols = narrow ? 3 : 5, gap = 8, bw = (canvasWidth - 20 - gap * (cols - 1)) / cols;
  faultBtns.forEach((b, i) => {
    b.position(10 + (i % cols) * (bw + gap), drawHeight + (i < cols ? ROW2 : ROW3));
    b.size(bw, 30);
  });
}

function drawControlLabels() {
  if (narrow) return;
  if (mode === 'explore') txt('Pick a fault:', 224, drawHeight + ROW1 + 14, 'black', LEFT, CENTER, 16, true);
  else if (phase === 'ask') txt('Which fault is this?', 224, drawHeight + ROW1 + 14, 'black', LEFT, CENTER, 16, true);
}

function setMode(m) {
  mode = m;
  if (m === 'quiz') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; results = []; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  faultBtns.forEach((b, i) => {
    b.style('background-color', '');
    if (explore) {
      b.show(); b.removeAttribute('disabled');
      if (i === shown) b.style('background-color', 'lightskyblue');
      return;
    }
    if (phase === 'done') { b.hide(); return; }
    b.show();
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (i === ITEMS[idx].fault) b.style('background-color', 'lightgreen');
    else if (i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === ITEMS.length - 1 ? 'See score' : 'Next');
}

function onFault(i) {
  if (mode === 'explore') { shown = i; refreshControls(); return; }
  if (phase !== 'ask') return;
  picked = i;
  const right = i === ITEMS[idx].fault;
  if (right) correctCount++;
  results.push(right);
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; picked = -1; correctCount = 0; results = []; phase = 'ask';
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
