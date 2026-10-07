// Wire Voltage-Drop Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Apply, solve): solve five wire-selection problems by choosing the thinnest wire gauge that keeps
// the voltage drop within 5% of a 12 V supply and the current within the wire's limit, with at least 4 of 5 correct
// on the first attempt. Evidence: the gauge committed with Check in each challenge. Explore mode is exploration, not evidence.
// The circuit is the schematic from Chapter 3 (wire-voltage-drop.svg), drawn by circuit-lib.js. Current dots are
// conventional current and move faster when the current is larger. Wires are drawn thicker for thicker gauges.
// Model: each wire has resistance 2 * length * (ohms per metre of that gauge); drop = I * R; P_wire = I^2 * R.
// The "arm" is a load that draws exactly the set current. Wire limits are conservative teaching values.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const SUPPLY_V = 12;                 // volts, fixed
const DROP_LIMIT_FRACTION = 0.05;    // the 5 percent rule from the chapter

// AWG gauges, thinnest last. d = bare copper diameter (mm), rpm = resistance (milliohm per metre),
// lim = conservative teaching limit for short bundled hobby wiring (amperes; illustrative).
const GAUGES = [
  { awg: 14, d: 1.628, rpm: 8.28, lim: 15 },
  { awg: 16, d: 1.291, rpm: 13.17, lim: 10 },
  { awg: 18, d: 1.024, rpm: 20.95, lim: 7 },
  { awg: 20, d: 0.812, rpm: 33.31, lim: 5 },
  { awg: 22, d: 0.644, rpm: 52.96, lim: 3 },
  { awg: 24, d: 0.511, rpm: 84.22, lim: 2 }
];

// quantities the learner can change
const L_MIN = 0.5, L_MAX = 5, L_STEP = 0.5, L_DEFAULT = 2;       // metres, one way
const I_MIN = 1, I_MAX = 8, I_STEP = 0.5, I_DEFAULT = 3;         // amperes
const AWG_DEFAULT = 22;

// five challenges in fixed order: current (A) and one-way length (m); the answer is computed by the rules
const CHALLENGES = [
  { I: 3, L: 2 }, { I: 1, L: 1 }, { I: 6, L: 1 }, { I: 4, L: 4 }, { I: 8, L: 3 }
];
const MASTERY = 4;

function gaugeByAwg(awg) { return GAUGES.find(g => g.awg === awg); }

// the electrical result for a gauge, one-way length (m) and current (A)
function evaluate(g, lengthM, amps) {
  const r = 2 * lengthM * g.rpm / 1000;            // ohms, lead plus return
  const drop = amps * r;                           // volts
  return { r: r, drop: drop, vload: SUPPLY_V - drop, pct: 100 * drop / SUPPLY_V, heat: amps * amps * r,
    dropOk: drop <= DROP_LIMIT_FRACTION * SUPPLY_V + 1e-9, currentOk: amps <= g.lim };
}

// the thinnest gauge (largest AWG number) that passes both rules
function bestGauge(lengthM, amps) {
  for (let i = GAUGES.length - 1; i >= 0; i--) {
    const e = evaluate(GAUGES[i], lengthM, amps);
    if (e.dropOk && e.currentOk) return GAUGES[i];
  }
  return GAUGES[0];
}

// controls
let modeSelect, awgSelect, actionBtn, lenSlider, curSlider;

// state
let mode = 'explore';
let phase = 'ask';
let idx = 0, correctCount = 0, picked = 0, lastRight = false;
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

  awgSelect = createSelect();
  GAUGES.forEach(g => awgSelect.option('AWG ' + g.awg, String(g.awg)));
  awgSelect.selected(String(AWG_DEFAULT));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  lenSlider = createSlider(L_MIN, L_MAX, L_DEFAULT, L_STEP);
  curSlider = createSlider(I_MIN, I_MAX, I_DEFAULT, I_STEP);

  layoutControls();
  setMode('explore');
  describe('A 12 volt supply feeds a robot arm load through two wires drawn as small resistors. Orange dots show ' +
    'current; thicker wire has less resistance and loses less voltage. The learner picks the wire gauge, the ' +
    'wire length and the load current, and reads the voltage that reaches the arm.');
}

function gauge() { return gaugeByAwg(parseInt(awgSelect.value(), 10)); }
function lengthM() { return lenSlider.value(); }
function amps() { return curSlider.value(); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Wire Voltage-Drop Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  drawCircuit();
  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit
// ---------------------------------------------------------------------------
function drawCircuit() {
  const C = Circuit;
  const g = gauge(), I = amps(), e = evaluate(g, lengthM(), I);
  const sx = 24, sy = 58, sw = canvasWidth - 48, sh = 190;
  const Lx = sx + 66, Rx = sx + sw * 0.60, Vx = sx + sw - 34;
  const T = sy + 22, B = sy + sh - 22, M = (T + B) / 2;
  const supplyR = 24, meterR = 22;

  // wire weight follows the real diameter of the chosen gauge; a wire past its limit turns red and glows
  const wlw = g.d * 3.4;
  const wcol = e.currentOk ? C.COL.wire : C.COL.warn;
  const glow = e.currentOk ? 0 : Math.min(1, (I - g.lim) / g.lim + 0.35);
  if (glow > 0) {
    drawingContext.save();
    C.wire([[Lx + 8, T], [Rx - 8, T]], wlw + 12, color(201, 42, 42, 90 * glow));
    C.wire([[Lx + 8, B], [Rx - 8, B]], wlw + 12, color(201, 42, 42, 90 * glow));
    drawingContext.restore();
  }

  // positive wire (top) and return wire (bottom), each drawn as its resistance
  C.wire([[Lx, T], [Lx + 20, T]], wlw, wcol);
  C.resistor([Lx + 20, T], [Rx - 20, T], { lw: wlw, color: wcol, amp: 9, zigs: 6, lead: 24 });
  C.wire([[Rx - 20, T], [Rx, T]], wlw, wcol);
  C.wire([[Rx, B], [Rx - 20, B]], wlw, wcol);
  C.resistor([Rx - 20, B], [Lx + 20, B], { lw: wlw, color: wcol, amp: 9, zigs: 6, lead: 24 });
  C.wire([[Lx + 20, B], [Lx, B]], wlw, wcol);

  // fixed parts drawn with normal weight
  C.wire([[Lx, T], [Lx, M - supplyR]]);
  C.wire([[Lx, M + supplyR], [Lx, B]]);
  C.resistor([Rx, T], [Rx, B], { lw: 3 });
  C.wire([[Rx, T], [Vx, T], [Vx, M - meterR]]);
  C.wire([[Vx, M + meterR], [Vx, B], [Rx, B]]);
  C.node(Rx, T); C.node(Rx, B);
  C.supply(Lx, M, supplyR);
  C.meter(Vx, M, meterR, 'V');

  const loop = C.makePath([[Lx, T], [Rx, T], [Rx, B], [Lx, B]], true);
  flowPhase = C.advance(flowPhase, I);
  C.drawFlow(loop, flowPhase, 30, C.COL.flow, [{ x: Lx, y: M, r: supplyR + 6 }], 10);

  // labels
  txt('V1', Lx - 48, M - 14, 'black', CENTER, CENTER, 16, true);
  txt(SUPPLY_V + ' V', Lx - 48, M + 8, 'black', CENTER, CENTER, 16, false);
  const wmid = (Lx + Rx) / 2;
  txt('Rw1 ' + fmt(e.r / 2, 3) + ' Ω', wmid, T - 24, wcol, CENTER, CENTER, 16, true);
  txt('Rw2 ' + fmt(e.r / 2, 3) + ' Ω', wmid, B + 26, wcol, CENTER, CENTER, 16, true);
  txt('Arm\n' + fmt(I) + ' A', Rx + 30, M, 'black', CENTER, CENTER, 16, true);
  txt('V = ' + fmt(e.vload, 2) + ' V', (Rx + Vx) / 2, T - 24, 'black', CENTER, CENTER, 16, true);
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function fmt(x, places) {
  const p = places === undefined ? 2 : places;
  const r = Math.round(x * Math.pow(10, p)) / Math.pow(10, p);
  return (Number.isInteger(r) ? String(r) : r.toFixed(p).replace(/0+$/, '').replace(/\.$/, ''));
}

function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 280, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };

  if (mode === 'challenges' && phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + CHALLENGES.length, 'black', 18, true, 28);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + CHALLENGES.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 28);
    line('Switch to Explore to try any gauge, length and current.', 'black', 16, false, 44);
    return;
  }

  const g = gauge(), e = evaluate(g, lengthM(), amps());
  if (mode === 'challenges') {
    const c = CHALLENGES[idx];
    line('Challenge ' + (idx + 1) + ' of ' + CHALLENGES.length + '   Correct: ' + correctCount + ' of ' + CHALLENGES.length, 'black', 16, true);
    if (!(narrow && phase === 'feedback')) line('The arm draws ' + c.I + ' A through wires ' + c.L + ' m long (each way). Pick the thinnest wire (largest AWG number) that keeps the drop at or below 0.6 V (5% of 12 V) and the current within its limit.',
      'black', 16, false, narrow ? 116 : 70);
    if (phase === 'feedback') {
      const best = bestGauge(c.L, c.I);
      const be = evaluate(best, c.L, c.I);
      const pe = evaluate(gaugeByAwg(picked), c.L, c.I);
      const why = 'AWG ' + best.awg + ' gives a drop of ' + fmt(be.drop, 2) + ' V (' + fmt(be.pct, 1) + '%) at ' + c.I + ' A, inside its ' + best.lim + ' A limit.';
      let msg;
      if (lastRight) msg = 'Correct: AWG ' + best.awg + '. ' + why;
      else if (!pe.dropOk) msg = 'Not quite. AWG ' + picked + ' drops ' + fmt(pe.drop, 2) + ' V (' + fmt(pe.pct, 1) + '%), more than 5%. The answer is AWG ' + best.awg + '. ' + why;
      else if (!pe.currentOk) msg = 'Not quite. AWG ' + picked + ' is rated for ' + gaugeByAwg(picked).lim + ' A and would carry ' + c.I + ' A. The answer is AWG ' + best.awg + '. ' + why;
      else msg = 'Not quite. AWG ' + picked + ' works but is thicker than needed. The thinnest that passes is AWG ' + best.awg + '. ' + why;
      line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, false, narrow ? 140 : 70);
    } else {
      line('Choose a gauge, then press Check to commit.', 'dimgray', 16, false, 26);
    }
    return;
  }

  line('Wire resistance ' + fmt(e.r, 3) + ' Ω (lead + return).  Drop = ' + fmt(amps(), 1) + ' A × ' + fmt(e.r, 3) + ' Ω = ' + fmt(e.drop, 2) + ' V',
    'black', 16, true, narrow ? 48 : 26);
  line('Voltage at the arm: ' + fmt(e.vload, 2) + ' V   Drop: ' + fmt(e.pct, 1) + '% of 12 V   Heat in the wire: ' + fmt(e.heat, 2) + ' W',
    'black', 16, false, narrow ? 48 : 26);
  line(e.dropOk ? 'Drop is inside the 5% rule.' : 'Too much drop: more than 5% is lost in the wire.', e.dropOk ? 'darkgreen' : 'firebrick', 16, true);
  line(e.currentOk ? 'Current is inside this wire’s ' + g.lim + ' A teaching limit.' : 'Over the ' + g.lim + ' A teaching limit: the wire would run hot (shown red).', e.currentOk ? 'darkgreen' : 'firebrick', 16, true, narrow ? 48 : 26);
  if (!narrow) line('Thicker wire (smaller AWG number) means less resistance.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 110 : 130);
  awgSelect.position(narrow ? 130 : 150, drawHeight + ROW1);
  awgSelect.size(narrow ? 90 : 100);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const labelW = narrow ? 118 : 170;
  const sliderW = max(60, canvasWidth - labelW - 28);
  lenSlider.position(labelW + 6, drawHeight + ROW2); lenSlider.size(sliderW);
  curSlider.position(labelW + 6, drawHeight + ROW3); curSlider.size(sliderW);
}

function drawControlLabels() {
  txt((narrow ? 'Length: ' : 'Length (one way): ') + fmt(lengthM(), 1) + ' m', 10, drawHeight + ROW2 + 11, 'black');
  txt((narrow ? 'Current: ' : 'Load current: ') + fmt(amps(), 1) + ' A', 10, drawHeight + ROW3 + 11, 'black');
}

function setMode(m) {
  mode = m;
  if (m === 'challenges') { idx = 0; phase = 'ask'; correctCount = 0; applyChallenge(); }
  refreshControls();
}

function applyChallenge() {
  const c = CHALLENGES[idx];
  lenSlider.value(c.L); curSlider.value(c.I);
  awgSelect.selected('22');
}

function refreshControls() {
  if (mode === 'explore') {
    actionBtn.hide();
    lenSlider.removeAttribute('disabled'); curSlider.removeAttribute('disabled'); awgSelect.removeAttribute('disabled');
    return;
  }
  actionBtn.show();
  lenSlider.attribute('disabled', ''); curSlider.attribute('disabled', '');
  if (phase === 'ask') { actionBtn.html('Check'); awgSelect.removeAttribute('disabled'); }
  else {
    awgSelect.attribute('disabled', '');
    actionBtn.html(phase === 'done' ? 'Try again' : (idx === CHALLENGES.length - 1 ? 'See score' : 'Next challenge'));
  }
}

function onAction() {
  if (mode !== 'challenges') return;
  if (phase === 'ask') {
    const c = CHALLENGES[idx];
    picked = parseInt(awgSelect.value(), 10);
    lastRight = picked === bestGauge(c.L, c.I).awg;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < CHALLENGES.length - 1) { idx++; phase = 'ask'; applyChallenge(); } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; phase = 'ask'; applyChallenge();
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
