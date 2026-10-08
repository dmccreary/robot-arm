// H-Bridge Current Paths - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Understand, infer): infer what a DC motor does for six combinations of H-bridge switch settings
// (forward, reverse, coasts, brakes, short circuit), with at least 5 of 6 correct on the first attempt. Evidence: the
// outcome committed before the circuit runs. Explore mode is exploration, not evidence.
// The circuit is the schematic from Chapter 5 (h-bridge.svg), drawn by circuit-lib.js. Current dots are conventional
// current and move faster when the current is larger.
// Model: S1 top left, S2 top right, S3 bottom left, S4 bottom right. A leg with both of its switches closed is a short
// circuit. Otherwise S1+S4 drives the motor forward (left to right), S2+S3 drives it in reverse, S3+S4 or S1+S2
// (with the other two open) brakes it, and anything else leaves it coasting.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const MOTOR_A = 3, BRAKE_A = 1.5, SHORT_A = 40;       // illustrative currents for the dot speed
const OUTCOMES = ['Forward', 'Reverse', 'Coasts to a stop', 'Brakes', 'Short circuit'];
const LETTERS = ['a', 'b', 'c', 'd', 'e'];

// six combinations in fixed order; sw = [S1, S2, S3, S4], true = closed; correct is an index into OUTCOMES
const COMBOS = [
  { sw: [true, false, false, true], correct: 0,
    why: 'The path is supply, S1, motor from left to right, S4, ground.' },
  { sw: [false, true, true, false], correct: 1,
    why: 'The path is supply, S2, motor from right to left, S3, ground.' },
  { sw: [false, false, false, false], correct: 2,
    why: 'No path to the supply or ground, so no current is driven, and the motor spins down on its own.' },
  { sw: [true, false, true, false], correct: 4,
    why: 'S1 and S3 are in the same leg and connect the supply straight to ground, bypassing the motor.' },
  { sw: [false, false, true, true], correct: 3,
    why: 'Both motor terminals connect to ground, so the motor’s own back-EMF drives current round the closed loop and slows it quickly. No current comes from the supply.' },
  { sw: [false, true, false, true], correct: 4,
    why: 'S2 and S4 are in the same leg and connect the supply straight to ground.' }
];
const MASTERY = 5;

// what a switch setting does (the Rules in the chapter's specification)
function outcomeOf(sw) {
  const [s1, s2, s3, s4] = sw;
  if ((s1 && s3) || (s2 && s4)) return 4;
  if (s1 && s4 && !s2 && !s3) return 0;
  if (s2 && s3 && !s1 && !s4) return 1;
  if ((s3 && s4 && !s1 && !s2) || (s1 && s2 && !s3 && !s4)) return 3;
  return 2;
}

// controls
let modeSelect, nextBtn, choiceBtns = [], swBoxes = [];

// state
let mode = 'predict';          // 'predict' or 'explore'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, picked = -1, correctCount = 0;
let sw = [true, false, false, true];
let running = false;
let flowPhase = 0, spin = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Predict', 'predict');
  modeSelect.option('Explore (after the six combinations)', 'explore');
  modeSelect.selected('predict');
  modeSelect.changed(() => setMode(modeSelect.value()));
  modeSelect.elt.options[1].disabled = true;

  nextBtn = createButton('Next combination');
  nextBtn.mouseClicked(onNext);
  for (let i = 0; i < OUTCOMES.length; i++) {
    const b = createButton(LETTERS[i] + ') ' + OUTCOMES[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }
  for (let i = 0; i < 4; i++) {
    const c = createCheckbox('S' + (i + 1) + ' closed', sw[i]);
    c.changed(() => { sw[i] = c.checked(); });
    swBoxes.push(c);
  }

  layoutControls();
  loadCombo();
  refreshControls();
  describe('An H-bridge with four switches and a motor in the middle. Orange dots show current flowing along the ' +
    'closed path from the supply to ground. The learner predicts whether the motor runs forward, runs in reverse, ' +
    'coasts, brakes, or whether the switches make a short circuit.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('H-Bridge Current Paths', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  drawCircuit();
  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit
// ---------------------------------------------------------------------------
function drawCircuit() {
  const C = Circuit;
  const sx = 24, sy = 56, sw_ = canvasWidth - 48, sh = 206;
  const cx = sx + sw_ / 2;
  const half = Math.min(150, sw_ / 2 - 60);
  const Lx = cx - half, Rx = cx + half;
  const T = sy + 22, B = sy + sh - 18, M = (T + B) / 2;
  const motorR = 28;

  // rails and the supply and ground marks
  C.wire([[Lx, T], [Rx, T]]);
  C.wire([[Lx, B], [Rx, B]]);
  txt('+V', cx, T - 16, 'black', CENTER, CENTER, 16, true);
  C.ground(cx, B);

  // legs: upper switch, node, lower switch
  const swTop = T + 18, swMid1 = M - 16, swMid2 = M + 16, swBot = B - 18;
  C.wire([[Lx, T], [Lx, swTop]]); C.wire([[Rx, T], [Rx, swTop]]);
  C.wire([[Lx, swMid1], [Lx, swMid2]]); C.wire([[Rx, swMid1], [Rx, swMid2]]);
  C.wire([[Lx, swBot], [Lx, B]]); C.wire([[Rx, swBot], [Rx, B]]);
  C.switchNC([Lx, swTop], [Lx, swMid1], sw[0]);      // S1
  C.switchNC([Rx, swTop], [Rx, swMid1], sw[1]);      // S2
  C.switchNC([Lx, swMid2], [Lx, swBot], sw[2]);      // S3
  C.switchNC([Rx, swMid2], [Rx, swBot], sw[3]);      // S4
  C.node(Lx, M); C.node(Rx, M);

  // the motor, the crossbar of the H
  C.wire([[Lx, M], [cx - motorR, M]]);
  C.wire([[cx + motorR, M], [Rx, M]]);
  const outcome = outcomeOf(sw);
  stroke(C.COL.wire); strokeWeight(3); fill(C.COL.part); circle(cx, M, 2 * motorR);
  noStroke(); fill(C.COL.wire); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(20); text('M', cx, M); textStyle(NORMAL);

  // current paths
  let amps = 0;
  const flows = [];
  if (running) {
    if (outcome === 4) {
      amps = SHORT_A;
      if (sw[0] && sw[2]) flows.push(C.makePath([[Lx, T], [Lx, B]], false));
      if (sw[1] && sw[3]) flows.push(C.makePath([[Rx, T], [Rx, B]], false));
    } else if (outcome === 0) {
      amps = MOTOR_A; flows.push(C.makePath([[Lx, T], [Lx, M], [Rx, M], [Rx, B]], false));
    } else if (outcome === 1) {
      amps = MOTOR_A; flows.push(C.makePath([[Rx, T], [Rx, M], [Lx, M], [Lx, B]], false));
    } else if (outcome === 3) {
      amps = BRAKE_A;
      if (sw[2] && sw[3]) flows.push(C.makePath([[Lx, M], [Lx, B], [Rx, B], [Rx, M]], true));
      else flows.push(C.makePath([[Rx, M], [Rx, T], [Lx, T], [Lx, M]], true));
    }
  }
  flowPhase = C.advance(flowPhase, amps);
  const zones = [{ x: cx, y: M, r: motorR + 5 }];
  [[Lx, swTop, swMid1], [Rx, swTop, swMid1], [Lx, swMid2, swBot], [Rx, swMid2, swBot]].forEach(s => {
    zones.push({ x: s[0], y: (s[1] + s[2]) / 2, r: (s[2] - s[1]) / 2 });
  });
  // a short circuit shows its dots over the switches too, so the whole path is visible
  flows.forEach(p => C.drawFlow(p, flowPhase, 26, outcome === 4 ? C.COL.warn : C.COL.flow, outcome === 4 ? [] : zones, 9));

  // a spoke in the motor that turns while it runs
  if (running && (outcome === 0 || outcome === 1)) spin += (outcome === 0 ? 1 : -1) * 0.12;
  stroke(C.COL.wire); strokeWeight(3);
  line(cx, M, cx + 18 * Math.cos(spin), M + 18 * Math.sin(spin));

  // labels
  txt('S1', Lx - 26, (swTop + swMid1) / 2, 'black', CENTER, CENTER, 16, true);
  txt('S2', Rx + 26, (swTop + swMid1) / 2, 'black', CENTER, CENTER, 16, true);
  txt('S3', Lx - 26, (swMid2 + swBot) / 2, 'black', CENTER, CENTER, 16, true);
  txt('S4', Rx + 26, (swMid2 + swBot) / 2, 'black', CENTER, CENTER, 16, true);
  if (running) {
    const label = outcome === 4 ? 'short circuit: the fuse would blow' : OUTCOMES[outcome];
    txt(label, cx, M + 46, outcome === 4 ? C.COL.warn : 'black', CENTER, CENTER, 16, true);
  }
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function swText(a) {
  return a.map((v, i) => 'S' + (i + 1) + (v ? ' closed' : ' open')).join(', ');
}

function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 274, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };

  if (mode === 'explore') {
    line('Explore: toggle the four switches and watch the current dots.', 'black', 16, true, narrow ? 48 : 26);
    const o = outcomeOf(sw);
    line(o === 4 ? 'Short circuit: a leg with both switches closed connects the supply to ground.' : 'Result: ' + OUTCOMES[o] + '.',
      o === 4 ? 'firebrick' : 'darkgreen', 16, true, narrow ? 48 : 26);
    if (!narrow) line('Forward means current through the motor from left to right.', 'dimgray', 16, false, 26);
    return;
  }
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + COMBOS.length, 'black', 18, true, 28);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + COMBOS.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 28);
    line('Explore mode is unlocked: set the four switches yourself.', 'black', 16, false, 48);
    return;
  }
  const c = COMBOS[idx];
  line('Combination ' + (idx + 1) + ' of ' + COMBOS.length + '   Correct: ' + correctCount + ' of ' + COMBOS.length, 'black', 16, true);
  if (!(narrow && phase === 'feedback')) line(swText(c.sw) + '.', 'black', 16, false, narrow ? 48 : 26);
  if (phase === 'ask') {
    line('What does the motor do?', 'black', 18, true, narrow ? 48 : 28);
  } else {
    const right = OUTCOMES[c.correct], ok = picked === c.correct;
    line(ok ? 'Correct: ' + right + '. ' + c.why : 'Not quite. The result is: ' + right + '. ' + c.why,
      ok ? 'darkgreen' : 'firebrick', 16, false, narrow ? 140 : 70);
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 43, ROW3 = 78;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 280);
  nextBtn.position(canvasWidth - (narrow ? 140 : 160), drawHeight + ROW1);
  const rowA = [10, narrow ? 100 : 120, narrow ? 200 : 250];
  choiceBtns.forEach((b, i) => {
    if (i < 3) b.position(rowA[i], drawHeight + ROW2);
    else b.position(i === 3 ? 10 : (narrow ? 100 : 120), drawHeight + ROW3);
  });
  swBoxes[0].position(10, drawHeight + ROW2);
  swBoxes[1].position(narrow ? 130 : 160, drawHeight + ROW2);
  swBoxes[2].position(10, drawHeight + ROW3);
  swBoxes[3].position(narrow ? 130 : 160, drawHeight + ROW3);
}

function drawControlLabels() {}

function loadCombo() {
  sw = COMBOS[Math.min(idx, COMBOS.length - 1)].sw.slice();
  running = false;
}

function setMode(m) {
  mode = m;
  if (m === 'explore') {
    running = true;
    swBoxes.forEach((c, i) => c.checked(sw[i]));
  } else {
    loadCombo();
  }
  refreshControls();
}

function refreshControls() {
  const ex = mode === 'explore';
  swBoxes.forEach(c => (ex ? c.show() : c.hide()));
  choiceBtns.forEach(b => (ex || phase === 'done' ? b.hide() : b.show()));
  if (ex) nextBtn.hide(); else nextBtn.show();
  if (!ex) {
    choiceBtns.forEach(b => (phase === 'ask' ? b.removeAttribute('disabled') : b.attribute('disabled', '')));
    if (phase === 'ask') nextBtn.attribute('disabled', ''); else nextBtn.removeAttribute('disabled');
    nextBtn.html(phase === 'done' ? 'Try again' : (idx === COMBOS.length - 1 ? 'See score' : 'Next combination'));
  }
  modeSelect.elt.options[1].disabled = !(phase === 'done' || ex);
}

function onChoice(i) {
  if (mode !== 'predict' || phase !== 'ask') return;
  picked = i;
  if (i === COMBOS[idx].correct) correctCount++;
  running = true;                 // the circuit runs only after the learner commits
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'predict') return;
  if (phase === 'feedback') {
    if (idx < COMBOS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
    picked = -1;
  } else if (phase === 'done') {
    idx = 0; phase = 'ask'; correctCount = 0; picked = -1;
  }
  loadCombo();
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
