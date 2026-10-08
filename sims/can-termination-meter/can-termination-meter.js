// CAN Termination Meter - p5.js MicroSim
// CANVAS_HEIGHT: 670
// Learning objective (Understand, infer): infer the state of a CAN bus's termination from the resistance a meter
// reads between CAN_H and CAN_L, in six readings, with at least 5 of 6 correct on the first attempt.
// Evidence: the diagnosis chosen and committed with Check for each reading. Switching terminators on and off in
// Explore mode is exploration, not evidence.
// Model: every terminator is 120 ohms, and n of them across the same two wires are in parallel, so R = 120 / n.
// A broken wire cuts the meter off from the bus (open reading). A short between CAN_H and CAN_L reads near 0.
// The schematic symbols are drawn by circuit-lib.js. No current is animated: the power is off.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 484;
let controlHeight = 186;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TERMINATOR = 120;        // ohms
const SHORT_OHMS = 0.3;        // illustrative reading for a short circuit
const DIAGNOSES = ['Healthy: two terminators', 'One terminator missing', 'No terminators or a broken wire',
  'Extra terminator', 'Short circuit'];

// the six readings, in fixed order. ohms is Infinity for an open reading. show is one bus that gives the reading.
const READINGS = [
  { ohms: 60, label: '60 Ω', dx: 'Healthy: two terminators', why: 'Two 120 Ω resistors in parallel give 60 Ω.',
    show: { a: true, m: false, b: true, fault: 'none' } },
  { ohms: 120, label: '120 Ω', dx: 'One terminator missing', why: 'One 120 Ω resistor alone reads 120 Ω.',
    show: { a: true, m: false, b: false, fault: 'none' } },
  { ohms: Infinity, label: 'Open (over 1 MΩ)', dx: 'No terminators or a broken wire',
    why: 'With no resistor connected, the meter sees an open circuit.', show: { a: false, m: false, b: false, fault: 'none' } },
  { ohms: 40, label: '40 Ω', dx: 'Extra terminator', why: 'Three 120 Ω resistors in parallel give 120 / 3 = 40 Ω.',
    show: { a: true, m: true, b: true, fault: 'none' } },
  { ohms: 0.3, label: '0.3 Ω', dx: 'Short circuit', why: 'A reading near 0 Ω means CAN_H touches CAN_L.',
    show: { a: true, m: false, b: true, fault: 'short' } },
  { ohms: 62, label: '62 Ω', dx: 'Healthy: two terminators',
    why: 'The meter and resistors have tolerances, so 62 Ω is within the healthy band.', show: { a: true, m: false, b: true, fault: 'none' } }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, boxA, boxM, boxB, faultSelect, dxBtns = [];

// state
let mode = 'explore';          // 'explore' or 'readings'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, chosen = -1;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six readings', 'readings');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  boxA = createCheckbox(' End A terminator', true);
  boxM = createCheckbox(' Middle terminator', false);
  boxB = createCheckbox(' End B terminator', true);

  faultSelect = createSelect();
  faultSelect.option('No fault', 'none');
  faultSelect.option('Broken wire', 'broken');
  faultSelect.option('Short circuit', 'short');
  faultSelect.selected('none');

  DIAGNOSES.forEach((name, i) => {
    const b = createButton(name);
    b.mouseClicked(() => choose(i));
    dxBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A schematic of a CAN bus: two wires, CAN_H and CAN_L, with a resistance meter at one end, two motors ' +
    'and three places for a 120 ohm terminator. Checkboxes switch each terminator on or off and a menu adds a ' +
    'broken wire or a short. The meter shows the resistance. A second mode asks for a diagnosis of six readings.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
// The resistance between CAN_H and CAN_L for a bus state. Infinity means open.
function busOhms(s) {
  if (s.fault === 'broken') return Infinity;
  if (s.fault === 'short') return SHORT_OHMS;
  const n = countOn(s);
  return n === 0 ? Infinity : TERMINATOR / n;
}
function countOn(s) { return (s.a ? 1 : 0) + (s.m ? 1 : 0) + (s.b ? 1 : 0); }

// The diagnosis bands from the chapter's table of readings.
function diagnose(ohms) {
  if (ohms > 1e6) return 'No terminators or a broken wire';
  if (ohms < 5) return 'Short circuit';
  if (ohms >= 54 && ohms <= 66) return 'Healthy: two terminators';
  if (ohms >= 108 && ohms <= 132) return 'One terminator missing';
  if (ohms >= 36 && ohms <= 44) return 'Extra terminator';
  return 'Outside every band';
}

function ohmsLabel(ohms) {
  if (ohms > 1e6) return 'Open (over 1 MΩ)';
  return (Math.round(ohms * 10) / 10) + ' Ω';
}

function exploreState() { return { a: boxA.checked(), m: boxM.checked(), b: boxB.checked(), fault: faultSelect.value() }; }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('CAN Termination Meter', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawReadings();
  if (mode === 'explore') txt('Fault:', 10, drawHeight + ROW4 + 11, 'black');
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const s = exploreState(), ohms = busOhms(s), n = countOn(s);
  txt(narrow ? 'The power is off for this test.' : 'Power off. The meter reads from CAN_H to CAN_L.', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawBus(s, false);
  drawMeterReading(ohmsLabel(ohms));

  let rule, state, col = 'black';
  if (s.fault === 'broken') {
    rule = 'Broken wire at the red X';
    state = 'Open reading: the break cuts the meter off from the bus, so no resistor is connected.'; col = 'firebrick';
  } else if (s.fault === 'short') {
    rule = 'A short has almost no resistance';
    state = 'Short circuit: CAN_H touches CAN_L. The short hides every terminator.'; col = 'firebrick';
  } else if (n === 0) {
    rule = 'No resistor joins the two wires';
    state = 'No terminators: the meter sees an open circuit.'; col = 'firebrick';
  } else {
    rule = n + (n === 1 ? ' terminator: ' : ' terminators in parallel: ') + '120 / ' + n + ' = ' + ohmsLabel(ohms);
    if (n === 1) { state = 'One terminator is missing.'; col = 'firebrick'; }
    if (n === 3) { state = 'Extra terminator: three is one too many, and it loads the bus.'; col = 'firebrick'; }
    if (n === 2) {
      if (s.m) { state = 'The meter reads 60 Ω, but one terminator is in the middle and one end has none. The meter counts terminators. It cannot see where they are.'; col = 'firebrick'; }
      else { state = 'Healthy: one terminator at each end.'; col = 'darkgreen'; }
    }
  }
  txt(rule, canvasWidth / 2, 276, 'black', CENTER, TOP, 16, false);
  const line = panel(304, drawHeight - 312);
  line(state, col, 16, true);
  line('Only the two ends get a terminator, however many motors are in between. Always measure with the power off.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Six readings
// ---------------------------------------------------------------------------
function drawReadings() {
  const score = 'Correct: ' + correctCount + ' of ' + READINGS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 200);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + READINGS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + READINGS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: 60 Ω is healthy, 120 Ω is one missing, 40 Ω is one too many, open is none, and near 0 Ω is a short.', 'black', 16, false);
    return;
  }
  const r = READINGS[idx];
  txt('Reading ' + (idx + 1) + ' of ' + READINGS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawBus(r.show, phase === 'ask');
  drawMeterReading(r.label);
  txt(phase === 'ask' ? 'The terminators are hidden. Power is off.' : 'One bus that gives this reading is shown.',
    canvasWidth / 2, 276, 'black', CENTER, TOP, 16, false);
  const line = panel(304, drawHeight - 312);
  if (phase === 'ask') {
    line('What does a reading of ' + r.label + ' tell you about the bus? Choose a diagnosis, then press Check.', 'black', 16, true);
    line('Each terminator is 120 Ω. You get one try for each reading.', 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + r.dx + '. ' + r.why : 'Not quite. A reading of ' + r.label + ' means ' + r.dx + '. ' + r.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true);
}

// ---------------------------------------------------------------------------
// The bus schematic
// ---------------------------------------------------------------------------
function busGeom() {
  const xl = 16, span = canvasWidth - 32;
  return { H: 108, L: 186, xMeter: xl + 22, xBreak: xl + span * 0.135, xA: xl + span * 0.22, xM1: xl + span * 0.36,
    xMid: xl + span * 0.5, xM2: xl + span * 0.64, xShort: xl + span * 0.77, xB: xl + span - 22 };
}

// s is the bus state. hidden draws the three terminator places as question marks.
function drawBus(s, hidden) {
  const C = Circuit, g = busGeom(), mid = (g.H + g.L) / 2;
  const broken = !hidden && s.fault === 'broken', shorted = !hidden && s.fault === 'short';

  // the two bus wires, with a gap in CAN_H when the wire is broken
  if (broken) {
    C.wire([[g.xMeter, g.H], [g.xBreak - 9, g.H]]);
    C.wire([[g.xBreak + 9, g.H], [g.xB, g.H]]);
    C.wire([[g.xBreak - 6, g.H - 8], [g.xBreak + 6, g.H + 8]], 3, C.COL.warn);
    C.wire([[g.xBreak - 6, g.H + 8], [g.xBreak + 6, g.H - 8]], 3, C.COL.warn);
  } else {
    C.wire([[g.xMeter, g.H], [g.xB, g.H]]);
  }
  C.wire([[g.xMeter, g.L], [g.xB, g.L]]);

  // the meter at the left end
  C.wire([[g.xMeter, g.H], [g.xMeter, mid - 18]]);
  C.wire([[g.xMeter, mid + 18], [g.xMeter, g.L]]);
  C.meter(g.xMeter, mid, 18, 'Ω');

  // two motors
  for (const x of [g.xM1, g.xM2]) {
    C.wire([[x, g.H], [x, mid - 15]]);
    C.wire([[x, mid + 15], [x, g.L]]);
    C.box(x - 17, mid - 15, 34, 30, 'M');
    C.node(x, g.H); C.node(x, g.L);
  }

  // the three places for a terminator
  const places = [[g.xA, s.a, 'End A'], [g.xMid, s.m, 'Middle'], [g.xB, s.b, 'End B']];
  for (const [x, on, name] of places) {
    if (hidden) {
      stroke(C.COL.dim); strokeWeight(2); fill('white');
      rect(x - 13, mid - 20, 26, 40, 4);
      txt('?', x, mid, 'black', CENTER, CENTER, 20, true);
    } else if (on) {
      C.resistor([x, g.H], [x, g.L], { lw: 3, amp: 9 });
      C.node(x, g.H); C.node(x, g.L);
      txt('120 Ω', Math.min(x, canvasWidth - 30), g.H - 16, 'black', CENTER, CENTER, 16, false);
    } else {
      stroke(C.COL.dim); strokeWeight(2); noFill();
      drawingContext.setLineDash([5, 5]);
      rect(x - 11, mid - 20, 22, 40, 4);
      drawingContext.setLineDash([]);
      txt('empty', Math.min(x, canvasWidth - 30), g.H - 16, C.COL.dim, CENTER, CENTER, 16, false);
    }
    txt(name, Math.min(x, canvasWidth - 30), g.L + 16, 'black', CENTER, CENTER, 16, false);
  }

  // a short between the two wires
  if (shorted) {
    C.wire([[g.xShort, g.H], [g.xShort, g.L]], 4, C.COL.warn);
    C.node(g.xShort, g.H); C.node(g.xShort, g.L);
    txt('short', g.xShort, g.L + 16, C.COL.warn, CENTER, CENTER, 16, true);
  }

  txt('CAN_H', 8, g.H - 34, 'black', LEFT, CENTER, 16, true);
  txt('CAN_L', 8, g.L + 36, 'black', LEFT, CENTER, 16, true);
}

// The meter's display.
function drawMeterReading(label) {
  const w = Math.min(300, canvasWidth - 150), x = canvasWidth / 2 - w / 2 + 50, y = 230, h = 40;
  txt('Meter reads', x - 10, y + h / 2, 'black', RIGHT, CENTER, 16, false);
  fill('#dbe6d3'); stroke(60); strokeWeight(2);
  rect(x, y, w, h, 6);
  txt(label, x + w / 2, y + h / 2 + 1, '#16301c', CENTER, CENTER, label.length > 8 ? 18 : 24, true);
}

// ---------------------------------------------------------------------------
// Text layout
// ---------------------------------------------------------------------------
// Draws a rounded panel and returns a function that writes one word-wrapped paragraph into it.
function panel(top, h) {
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  return (s, col, size, bold) => { y += para(s, x + 10, y, w - 20, col, size || 16, bold) + 5; };
}

// Draws word-wrapped text and returns its height, so that nothing overflows on a narrow screen.
function para(s, x, y, w, col, size, bold) {
  textSize(size); textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let cur = '';
  for (const word of String(s).split(' ')) {
    const t = cur ? cur + ' ' + word : word;
    if (cur && textWidth(t) > w) { lines.push(cur); cur = word; } else cur = t;
  }
  lines.push(cur);
  const lead = Math.round(size * 1.3);
  noStroke(); fill(col || 'black'); textAlign(LEFT, TOP);
  lines.forEach((ln, i) => text(ln, x, y + i * lead));
  textStyle(NORMAL);
  return lines.length * lead;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;
const BTN_TOP = 46, BTN_STEP = 46, BTN_H = 40;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const col2 = narrow ? canvasWidth / 2 + 4 : 220;
  boxA.position(10, drawHeight + ROW2 + 2);
  boxB.position(col2, drawHeight + ROW2 + 2);
  boxM.position(10, drawHeight + ROW3 + 2);
  faultSelect.position(64, drawHeight + ROW4);
  faultSelect.size(150);
  const perRow = narrow ? 2 : 3, gap = 8;
  const w = (canvasWidth - 20 - gap * (perRow - 1)) / perRow;
  dxBtns.forEach((b, i) => {
    b.position(10 + (i % perRow) * (w + gap), drawHeight + BTN_TOP + Math.floor(i / perRow) * BTN_STEP);
    b.size(w, BTN_H);
  });
}

function choose(i) {
  if (mode !== 'readings' || phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  if (m === 'readings') startReadings();
  refreshControls();
}

function startReadings() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const explore = mode === 'explore';
  for (const c of [boxA, boxM, boxB, faultSelect]) { if (explore) c.show(); else c.hide(); }
  const quiz = !explore && phase !== 'done';
  dxBtns.forEach((b, i) => {
    if (!quiz) { b.hide(); return; }
    b.show();
    let bg = '', weight = 'normal';
    if (phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (DIAGNOSES[i] === READINGS[idx].dx) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === READINGS.length - 1 ? 'See score' : 'Next reading');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'readings') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = DIAGNOSES[chosen] === READINGS[idx].dx;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < READINGS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startReadings();
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  text(str, x, y);
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
