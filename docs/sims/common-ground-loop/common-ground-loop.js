// Common Ground Loop - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Understand, infer): infer what a motor driver's signal input reads when a controller
// on one supply sends it a signal and the two supplies' grounds are, or are not, joined, in five situations, with
// at least 4 of 5 correct on the first attempt. Evidence: the choice committed before the circuit runs.
// Explore mode is exploration, not evidence.
// The circuit is the schematic from Chapter 3 (common-ground.svg), drawn by circuit-lib.js. Current dots are
// conventional current. The two supplies each power their own box. The signal current is tiny in real life, so
// its dot speed is not to scale. A signal needs a complete loop: out on the signal wire and back on the ground.
// Model: ground joined -> the input reads the controller's output (HIGH or LOW). Ground not joined -> the input
// is floating and its reading is unpredictable, so the sim shows it flickering between HIGH and LOW.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const CHOICES = ['Reads HIGH', 'Reads LOW', 'Unpredictable'];
const LETTERS = ['a', 'b', 'c'];
// five situations in fixed order. correct: 0 = reads HIGH, 1 = reads LOW, 2 = unpredictable
const SITUATIONS = [
  { ground: true, high: true, correct: 0,
    why: 'The ground wire completes the loop, so the driver sees the controller’s HIGH.' },
  { ground: true, high: false, correct: 1,
    why: 'The grounds are joined, so both boxes measure from the same 0 V and the LOW is read as LOW.' },
  { ground: false, high: true, correct: 2,
    why: 'With no ground wire the signal has no return path, so the input floats and its reading is unpredictable.' },
  { ground: false, high: false, correct: 2,
    why: 'A LOW needs the shared ground as much as a HIGH does. Without it the input still floats.' },
  { ground: true, high: true, correct: 0,
    note: 'The +5 V and +12 V supplies are not joined to each other.',
    why: 'Only the grounds need joining. The two positive rails stay separate, and the signal is read correctly.' }
];
const MASTERY = 4;

// controls
let modeSelect, nextBtn, choiceBtns = [], groundBox, outBtn;

// circuit state
let groundOn = true, outHigh = true, running = true;
let flowPhase = 0;
let noisy = false, noiseUntil = 0;           // flicker of a floating input

// quiz state
let mode = 'predict';
let phase = 'ask';
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Predict', 'predict');
  modeSelect.option('Explore (after the five situations)', 'explore');
  modeSelect.selected('predict');
  modeSelect.changed(() => setMode(modeSelect.value()));
  modeSelect.elt.options[1].disabled = true;

  nextBtn = createButton('Next situation');
  nextBtn.mouseClicked(onNext);
  for (let i = 0; i < 3; i++) {
    const b = createButton(LETTERS[i] + ') ' + CHOICES[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  groundBox = createCheckbox('Ground wire connected', true);
  groundBox.changed(() => { groundOn = groundBox.checked(); });
  outBtn = createButton('Controller output: HIGH');
  outBtn.mouseClicked(() => { outHigh = !outHigh; refreshControls(); });

  layoutControls();
  loadSituation();
  refreshControls();
  describe('A 5 volt controller and a 12 volt motor driver, each with its own supply, joined by one signal wire. ' +
    'A ground wire along the bottom can be connected or removed. Orange dots show current; the signal current only ' +
    'flows when the ground wire completes the loop.');
}

// what the driver's input reads: 'HIGH', 'LOW', or 'noise' for a floating input
function inputReading() {
  if (!running) return '?';
  if (!groundOn) {
    if (millis() > noiseUntil) { noisy = random() < 0.5; noiseUntil = millis() + 140; }
    return noisy ? 'HIGH' : 'LOW';
  }
  return outHigh ? 'HIGH' : 'LOW';
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Common Ground Loop', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  drawCircuit();
  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit
// ---------------------------------------------------------------------------
function drawCircuit() {
  const C = Circuit;
  const sx = 24, sy = 58, sw = canvasWidth - 48, sh = 196;
  const T = sy + 22, B = sy + sh - 22, M = (T + B) / 2 - 4;
  const v2x = sx + (narrow ? 20 : 26), v1x = sx + sw - (narrow ? 20 : 26);
  const cx = sx + sw * (narrow ? 0.31 : 0.28), dx = sx + sw * (narrow ? 0.69 : 0.72);
  const bw = narrow ? 100 : 118, bh = 96;
  const supplyR = narrow ? 18 : 22;
  const midx = (cx + dx) / 2, gap = 22;

  // supplies and their top wires
  C.wire([[v2x, T], [cx, T], [cx, M - bh / 2]]);
  C.wire([[v1x, T], [dx, T], [dx, M - bh / 2]]);
  C.wire([[v2x, T], [v2x, M - supplyR]]); C.wire([[v2x, M + supplyR], [v2x, B]]);
  C.wire([[v1x, T], [v1x, M - supplyR]]); C.wire([[v1x, M + supplyR], [v1x, B]]);

  // ground wire along the bottom: continuous, or with a gap in the middle
  C.wire([[cx, M + bh / 2], [cx, B]]);
  C.wire([[dx, M + bh / 2], [dx, B]]);
  if (groundOn) {
    C.wire([[v2x, B], [v1x, B]]);
    C.node(cx, B); C.node(dx, B); C.node(midx, B);
    C.ground(midx, B);
  } else {
    C.wire([[v2x, B], [midx - gap, B]]);
    C.wire([[midx + gap, B], [v1x, B]]);
    C.node(cx, B); C.node(dx, B);
    C.ground(cx, B); C.ground(dx, B);
    if (narrow) txt('no ground wire', midx, B + 44, C.COL.warn, CENTER, CENTER, 16, true);
    else txt('no ground wire here', midx, B - 18, C.COL.warn, CENTER, CENTER, 16, true);
  }

  // signal wire from the controller's OUT pin to the driver's IN pin
  C.wire([[cx + bw / 2, M], [dx - bw / 2, M]]);
  if (!narrow) txt('signal', midx, M - 20, 'black', CENTER, CENTER, 16, false);

  // boxes and supplies
  const reading = inputReading();
  C.box(cx - bw / 2, M - bh / 2, bw, bh, 'Controller\n' + (outHigh ? 'OUT: HIGH' : 'OUT: LOW'));
  C.box(dx - bw / 2, M - bh / 2, bw, bh, 'Motor driver\nIN reads:\n' + reading,
    { color: !groundOn && running ? C.COL.warn : C.COL.wire });
  C.supply(v2x, M, supplyR);
  C.supply(v1x, M, supplyR);

  // each supply's own loop (always flows while the circuit runs), and the signal loop (only with a ground wire)
  if (running) {
    flowPhase = C.advance(flowPhase, 2);
    const loop2 = C.makePath([[v2x, T], [cx, T], [cx, B], [v2x, B]], true);
    const loop1 = C.makePath([[v1x, T], [dx, T], [dx, B], [v1x, B]], true);
    C.drawFlow(loop2, flowPhase, 30, C.COL.flow, [{ x: v2x, y: M, r: supplyR + 6 }, { x: cx, y: M, r: bh / 2 + 4 }], 9);
    C.drawFlow(loop1, flowPhase, 30, C.COL.flow, [{ x: v1x, y: M, r: supplyR + 6 }, { x: dx, y: M, r: bh / 2 + 4 }], 9);
    if (groundOn && outHigh) {
      const sig = C.makePath([[cx + bw / 2, M], [dx - bw / 2, M]], false);
      const back = C.makePath([[dx, B], [cx, B]], false);
      C.drawFlow(sig, flowPhase, 24, C.COL.flow, null, 9);
      C.drawFlow(back, flowPhase, 24, C.COL.flow, null, 9);
    }
  }

  txt('V2  5 V', v2x, B + 30, 'black', CENTER, CENTER, 16, true);
  txt('V1  12 V', v1x, B + 30, 'black', CENTER, CENTER, 16, true);
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 292, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };

  if (mode === 'explore') {
    line('Explore: connect or remove the ground wire and flip the controller output.', 'black', 16, true, narrow ? 48 : 26);
    line(groundOn ? 'Ground joined: the signal loop is complete, so the driver reads ' + (outHigh ? 'HIGH.' : 'LOW.')
      : 'Ground not joined: no return path, so the input floats and flickers.', groundOn ? 'darkgreen' : 'firebrick', 16, true, narrow ? 70 : 26);
    if (!narrow) line('Signal dots appear only when the output is HIGH and the ground wire is connected (speed not to scale).', 'dimgray', 16, false, 26);
    return;
  }

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + SITUATIONS.length, 'black', 18, true, 28);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + SITUATIONS.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 28);
    line('Explore mode is unlocked: use the mode menu to connect or remove the ground wire yourself.', 'black', 16, false, 48);
    return;
  }

  const s = SITUATIONS[idx];
  line('Situation ' + (idx + 1) + ' of ' + SITUATIONS.length + '   Correct: ' + correctCount + ' of ' + SITUATIONS.length, 'black', 16, true);
  if (!(narrow && phase !== 'ask')) line('Ground wire ' + (s.ground ? 'connected' : 'NOT connected') + '. The controller outputs ' + (s.high ? 'HIGH' : 'LOW') + '. ' + (s.note || ''),
    'black', 16, false, narrow ? 70 : 48);
  if (phase === 'ask') {
    line('What does the motor driver’s input read?', 'black', 18, true, narrow ? 48 : 28);
  } else {
    const right = CHOICES[s.correct], ok = picked === s.correct;
    line(ok ? 'Correct: ' + right + '. ' + s.why : 'Not quite. The result is: ' + right + '. ' + s.why, ok ? 'darkgreen' : 'firebrick', 16, false, narrow ? 116 : 48);
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 43, ROW3 = 78;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 280);
  nextBtn.position(canvasWidth - (narrow ? 130 : 150), drawHeight + ROW1);
  if (narrow) {
    choiceBtns[0].position(10, drawHeight + ROW2);
    choiceBtns[1].position(130, drawHeight + ROW2);
    choiceBtns[2].position(10, drawHeight + ROW3);
  } else {
    choiceBtns[0].position(10, drawHeight + ROW2);
    choiceBtns[1].position(130, drawHeight + ROW2);
    choiceBtns[2].position(250, drawHeight + ROW2);
  }
  groundBox.position(10, drawHeight + ROW2);
  outBtn.position(10, drawHeight + ROW3);
}

function drawControlLabels() {}

function loadSituation() {
  const s = SITUATIONS[Math.min(idx, SITUATIONS.length - 1)];
  groundOn = s.ground; outHigh = s.high; running = false;
}

function setMode(m) {
  mode = m;
  if (m === 'explore') { running = true; groundOn = groundBox.checked(); outHigh = true; }
  else { loadSituation(); }
  refreshControls();
}

function refreshControls() {
  const ex = mode === 'explore';
  [groundBox, outBtn].forEach(c => (ex ? c.show() : c.hide()));
  choiceBtns.forEach(b => (ex || phase === 'done' ? b.hide() : b.show()));
  if (ex) nextBtn.hide(); else nextBtn.show();
  outBtn.html('Controller output: ' + (outHigh ? 'HIGH' : 'LOW') + ' (press to flip)');
  if (!ex) {
    choiceBtns.forEach(b => (phase === 'ask' ? b.removeAttribute('disabled') : b.attribute('disabled', '')));
    if (phase === 'ask') nextBtn.attribute('disabled', ''); else nextBtn.removeAttribute('disabled');
    nextBtn.html(phase === 'done' ? 'Try again' : (idx === SITUATIONS.length - 1 ? 'See score' : 'Next situation'));
  }
  modeSelect.elt.options[1].disabled = !(phase === 'done' || ex);
}

function onChoice(i) {
  if (mode !== 'predict' || phase !== 'ask') return;
  picked = i;
  if (i === SITUATIONS[idx].correct) correctCount++;
  running = true;                 // the circuit runs only after the learner commits
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'predict') return;
  if (phase === 'feedback') {
    if (idx < SITUATIONS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
    picked = -1;
  } else if (phase === 'done') {
    idx = 0; phase = 'ask'; correctCount = 0; picked = -1;
  }
  loadSituation();
  refreshControls();
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
