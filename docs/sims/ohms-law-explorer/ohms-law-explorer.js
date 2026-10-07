// Ohm's Law Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Apply, calculate): calculate the resistor or supply voltage that gives a target current or
// power in a simple loop, in five challenges, with at least 4 of 5 correct on the first attempt. Evidence: the
// setting committed with Check in each challenge. Explore mode is exploration, not evidence.
// The circuit is the schematic from Chapter 3 (ohms-law-circuit.svg), drawn by circuit-lib.js. Current dots are
// conventional current: they leave the + terminal, and their speed is proportional to the current.
// Model: I = V / R and P = V * I = V^2 / R. The load is an ideal resistor and the meters are ideal.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// adjustable quantities (the chapter's Content table)
const V_MIN = 0, V_MAX = 24, V_STEP = 1, V_DEFAULT = 12;      // volts
const R_MIN = 1, R_MAX = 24, R_STEP = 1, R_DEFAULT = 6;       // ohms

// the five challenges, in fixed order. lock says which slider is fixed; start is where the sliders begin.
const CHALLENGES = [
  { text: 'The supply is fixed at 12 V. Set R so that the current is 3 A.', lock: 'V', start: { V: 12, R: 6 },
    target: { kind: 'I', value: 3 }, answer: 'R = 4 Ω', why: 'R = V / I = 12 / 3 = 4 Ω.' },
  { text: 'The supply is fixed at 12 V. Set R so that the current is 1 A.', lock: 'V', start: { V: 12, R: 6 },
    target: { kind: 'I', value: 1 }, answer: 'R = 12 Ω', why: 'R = V / I = 12 / 1 = 12 Ω.' },
  { text: 'The supply is fixed at 24 V. Set R so that the current is 4 A.', lock: 'V', start: { V: 24, R: 12 },
    target: { kind: 'I', value: 4 }, answer: 'R = 6 Ω', why: 'R = V / I = 24 / 4 = 6 Ω.' },
  { text: 'The resistor is fixed at 8 Ω. Set the supply voltage so that the current is 2 A.', lock: 'R', start: { V: 12, R: 8 },
    target: { kind: 'I', value: 2 }, answer: 'V = 16 V', why: 'V = I × R = 2 × 8 = 16 V.' },
  { text: 'The supply is fixed at 12 V. Set R so that the resistor dissipates 12 W.', lock: 'V', start: { V: 12, R: 6 },
    target: { kind: 'P', value: 12 }, answer: 'R = 12 Ω', why: 'P = V² / R, so R = V² / P = 144 / 12 = 12 Ω.' }
];
const MASTERY = 4;

// controls
let modeSelect, actionBtn, vSlider, rSlider;

// state
let mode = 'explore';          // 'explore' or 'challenges'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, lastI = 0;
let flowPhase = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Challenges', 'challenges');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  vSlider = createSlider(V_MIN, V_MAX, V_DEFAULT, V_STEP);
  rSlider = createSlider(R_MIN, R_MAX, R_DEFAULT, R_STEP);

  layoutControls();
  setMode('explore');
  describe('A schematic of a supply, an ammeter, a resistor and a voltmeter in a loop. Orange dots show conventional ' +
    'current flowing around the loop; they move faster when the current is larger. Sliders set the supply voltage ' +
    'and the resistance, and the readouts show the current and the power.');
}

function volts() { return vSlider.value(); }
function ohms() { return rSlider.value(); }
function amps() { return volts() / ohms(); }
function watts() { return volts() * amps(); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Ohm’s Law Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
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
  const Lx = sx + 66, Rx = sx + sw * 0.60, Vx = sx + sw - 34;
  const T = sy + 22, B = sy + sh - 22, M = (T + B) / 2;
  const supplyR = 24, meterR = 22;
  const Ax = Lx + (Rx - Lx) * 0.50;

  // wires
  C.wire([[Lx, T], [Ax - meterR, T]]);
  C.wire([[Ax + meterR, T], [Vx, T], [Vx, M - meterR]]);
  C.wire([[Vx, M + meterR], [Vx, B], [Lx, B]]);
  C.wire([[Lx, M + supplyR], [Lx, B]]);
  C.wire([[Lx, T], [Lx, M - supplyR]]);
  C.resistor([Rx, T], [Rx, B], { lw: 3 });

  // current: dots on the loop; the ideal voltmeter branch carries none
  const I = amps();
  const loop = C.makePath([[Lx, T], [Rx, T], [Rx, B], [Lx, B]], true);
  flowPhase = C.advance(flowPhase, I);
  C.drawFlow(loop, flowPhase, 30, C.COL.flow,
    [{ x: Lx, y: M, r: supplyR + 6 }, { x: Ax, y: T, r: meterR + 6 }], 10);

  C.node(Rx, T); C.node(Rx, B);
  C.supply(Lx, M, supplyR);
  C.meter(Ax, T, meterR, 'A');
  C.meter(Vx, M, meterR, 'V');

  // labels and readings (always at least 16 px)
  txt('V1', Lx - 48, M - 14, 'black', CENTER, CENTER, 16, true);
  txt(volts() + ' V', Lx - 48, M + 8, 'black', CENTER, CENTER, 16, false);
  txt('R1', Rx + 34, M - 14, 'black', CENTER, CENTER, 16, true);
  txt(ohms() + ' Ω', Rx + 34, M + 8, 'black', CENTER, CENTER, 16, false);
  txt('I = ' + fmt(I) + ' A', Ax, T - 38, C.COL.flow, CENTER, CENTER, 16, true);
  txt('V = ' + volts() + ' V', (Rx + Vx) / 2, T - 38, 'black', CENTER, CENTER, 16, true);
  txt(narrow ? 'ideal voltmeter: no dots' : 'no dots flow through an ideal voltmeter', Vx + 26, B + 10, C.COL.dim, RIGHT, TOP, 16, false);
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function fmt(x) {
  const r = Math.round(x * 100) / 100;
  return (Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
}

function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 276, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };

  const V = volts(), R = ohms(), I = amps(), P = watts();
  if (mode === 'challenges' && phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + CHALLENGES.length, 'black', 18, true, 28);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + CHALLENGES.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 28);
    line('Switch to Explore to keep experimenting with the sliders.', 'black', 16, false, 44);
    return;
  }
  if (mode === 'challenges') {
    const c = CHALLENGES[idx];
    line('Challenge ' + (idx + 1) + ' of ' + CHALLENGES.length + '   Correct: ' + correctCount + ' of ' + CHALLENGES.length, 'black', 16, true);
    if (!(narrow && phase === 'feedback')) line(c.text, 'black', 16, false, narrow ? 48 : 26);
    if (!(narrow && phase === 'feedback')) line('Now: I = V / R = ' + V + ' / ' + R + ' = ' + fmt(I) + ' A     P = V × I = ' + fmt(P) + ' W', 'dimgray', 16, false, narrow ? 48 : 26);
    if (phase === 'feedback') {
      const msg = lastRight ? 'Correct: ' + c.answer + '. ' + c.why
        : 'Not quite. The answer is ' + c.answer + '. ' + c.why + ' Your setting gave ' +
          (c.target.kind === 'I' ? fmt(lastI) + ' A.' : fmt(lastI) + ' W.');
      line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, false, narrow ? 116 : 48);
    } else if (!narrow) {
      line('Move the free slider, then press Check to commit your setting.', 'dimgray', 16, false, 26);
    }
    return;
  }
  // explore
  line('I = V / R = ' + V + ' V / ' + R + ' Ω = ' + fmt(I) + ' A', 'black', 18, true, 28);
  line('P = V × I = ' + V + ' × ' + fmt(I) + ' = ' + fmt(P) + ' W', 'black', 18, true, 28);
  line('Double V and the current doubles. Double R and the current halves. Watch the dot speed follow the ammeter.', 'black', 16, false, narrow ? 70 : 48);
  if (!narrow) line('A real motor is not a fixed resistor: its current changes with load (Chapter 5).', 'dimgray', 16, false, 26);
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const labelW = narrow ? 120 : 128;
  const sliderW = max(60, canvasWidth - labelW - 28);
  vSlider.position(labelW + 6, drawHeight + ROW2); vSlider.size(sliderW);
  rSlider.position(labelW + 6, drawHeight + ROW3); rSlider.size(sliderW);
}

function drawControlLabels() {
  txt('Supply V: ' + volts() + ' V', 10, drawHeight + ROW2 + 11, 'black');
  txt('Load R: ' + ohms() + ' Ω', 10, drawHeight + ROW3 + 11, 'black');
  if (mode === 'challenges' && phase === 'ask') {
    const c = CHALLENGES[idx];
    txt(c.lock === 'V' ? 'V is fixed' : 'R is fixed', narrow ? 150 : 180, drawHeight + ROW1 + 12, 'dimgray');
  }
}

function setMode(m) {
  mode = m;
  if (m === 'challenges') { idx = 0; phase = 'ask'; correctCount = 0; applyStart(); }
  refreshControls();
}

function applyStart() {
  const c = CHALLENGES[idx];
  vSlider.value(c.start.V); rSlider.value(c.start.R);
}

function refreshControls() {
  if (mode === 'explore') {
    actionBtn.hide();
    vSlider.removeAttribute('disabled'); rSlider.removeAttribute('disabled');
    return;
  }
  actionBtn.show();
  if (phase === 'done') {
    actionBtn.html('Try again');
    vSlider.attribute('disabled', ''); rSlider.attribute('disabled', '');
    return;
  }
  const c = CHALLENGES[idx];
  if (phase === 'ask') {
    actionBtn.html('Check');
    if (c.lock === 'V') { vSlider.attribute('disabled', ''); rSlider.removeAttribute('disabled'); }
    else { rSlider.attribute('disabled', ''); vSlider.removeAttribute('disabled'); }
  } else {
    actionBtn.html(idx === CHALLENGES.length - 1 ? 'See score' : 'Next challenge');
    vSlider.attribute('disabled', ''); rSlider.attribute('disabled', '');
  }
}

function onAction() {
  if (mode !== 'challenges') return;
  if (phase === 'ask') {
    const c = CHALLENGES[idx];
    lastI = c.target.kind === 'I' ? amps() : watts();
    lastRight = Math.abs(lastI - c.target.value) < 0.001;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < CHALLENGES.length - 1) { idx++; phase = 'ask'; applyStart(); } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; phase = 'ask'; applyStart();
  }
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
