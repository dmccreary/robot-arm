// Fuse and E-Stop Power Path - p5.js MicroSim
// CANVAS_HEIGHT: 562
// Learning objective (Understand, infer): infer whether a robot arm keeps running, loses power through its
// E-stop, or loses power because its fuse blows, in six situations, with at least 5 of 6 correct on the first
// attempt. Evidence: the choice committed before the circuit runs. Explore mode is exploration, not evidence.
// The circuit is the schematic from Chapter 3 (protected-power-path.svg), drawn by circuit-lib.js. Current dots are
// conventional current and move faster when the current is larger. No current flows when the E-stop contact is
// open or the fuse is blown, so every dot stops.
// Model: the fuse blows 0.6 s after the current first exceeds its rating (a teaching simplification; a real fuse
// takes longer at small overloads and far less at a short circuit).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const FUSE_RATINGS = [5, 10, 15];                // amperes
const FUSE_DEFAULT = 10;
const LOAD_MIN = 0, LOAD_MAX = 20, LOAD_STEP = 1, LOAD_DEFAULT = 4;     // amperes
const SHORT_AMPS = 40;                            // a short circuit would draw about this much
const BLOW_DELAY_MS = 600;

// six situations in fixed order; choices: 0 = arm runs, 1 = fuse blows, 2 = arm stops with the fuse intact
const CHOICES = ['Arm runs', 'Fuse blows', 'Arm stops, fuse intact'];
const SITUATIONS = [
  { fuse: 10, load: 4, estop: false, short: false, correct: 0,
    why: '4 A is below the 10 A rating, so the fuse holds and the arm runs.' },
  { fuse: 10, load: 4, estop: true, short: false, correct: 2,
    why: 'Pressing the E-stop opens the contact, so no current flows and the arm loses power. The fuse is untouched.' },
  { fuse: 5, load: 8, estop: false, short: false, correct: 1,
    why: '8 A is above the 5 A rating, so the fuse blows and breaks the circuit.' },
  { fuse: 10, load: 10, estop: false, short: false, correct: 0,
    why: 'A fuse carries its rated current and blows only above it, so 10 A on a 10 A fuse holds.' },
  { fuse: 15, load: 0, estop: false, short: true, correct: 1,
    why: 'A short circuit draws about 40 A, far above 15 A, so the fuse blows and the wires are protected.' },
  { fuse: 10, load: 12, estop: true, short: false, correct: 2,
    why: 'With the E-stop open no current flows, even though the arm would draw 12 A, so the 10 A fuse stays intact.' }
];
const MASTERY = 5;
const LETTERS = ['a', 'b', 'c'];

// controls
let modeSelect, nextBtn, choiceBtns = [], estopBtn, replaceBtn, fuseSelect, shortBox, loadSlider;

// circuit state
let estopPressed = false, fuseBlown = false, overSince = null, running = true;
let fuseRating = FUSE_DEFAULT, loadAmps = LOAD_DEFAULT, shorted = false;
let flowPhase = 0;

// quiz state
let mode = 'predict';         // 'predict' or 'explore'
let phase = 'ask';            // 'ask', 'feedback' or 'done'
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Predict', 'predict');
  modeSelect.option('Explore (after the six situations)', 'explore');
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

  estopBtn = createButton('Press E-stop');
  estopBtn.mouseClicked(() => { estopPressed = !estopPressed; refreshControls(); });
  replaceBtn = createButton('Replace fuse');
  replaceBtn.mouseClicked(replaceFuse);
  fuseSelect = createSelect();
  FUSE_RATINGS.forEach(r => fuseSelect.option(r + ' A', String(r)));
  fuseSelect.selected(String(FUSE_DEFAULT));
  fuseSelect.changed(() => { fuseRating = parseInt(fuseSelect.value(), 10); replaceFuse(); });
  shortBox = createCheckbox('Short circuit (about 40 A)', false);
  shortBox.changed(() => { shorted = shortBox.checked(); });
  loadSlider = createSlider(LOAD_MIN, LOAD_MAX, LOAD_DEFAULT, LOAD_STEP);
  loadSlider.input(() => { loadAmps = loadSlider.value(); });

  layoutControls();
  loadSituation();
  refreshControls();
  describe('A 12 volt supply feeds a robot arm motor board through a fuse and a normally closed E-stop switch. ' +
    'Orange dots show current. The learner predicts whether the arm runs, the fuse blows, or the E-stop stops the arm.');
}

// the current that really flows right now
function actualAmps() {
  if (!running || estopPressed || fuseBlown) return 0;
  return shorted ? SHORT_AMPS : loadAmps;
}

// the current the arm would draw if the circuit were closed (shown while waiting for the prediction)
function demandAmps() { return shorted ? SHORT_AMPS : loadAmps; }

function stepFuse() {
  const I = actualAmps();
  if (!fuseBlown && I > fuseRating) {
    if (overSince === null) overSince = millis();
    else if (millis() - overSince > BLOW_DELAY_MS) { fuseBlown = true; overSince = null; }
  } else {
    overSince = null;
  }
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Fuse and E-Stop Power Path', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  stepFuse();
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
  const Lx = sx + (narrow ? 62 : 66), Rx = sx + sw - (narrow ? 60 : 86);
  const T = sy + 22, B = sy + sh - 22, M = (T + B) / 2;
  const supplyR = 24;
  const fuseA = [Lx + 24, T], fuseB = [Lx + 24 + (Rx - Lx) * 0.30, T];
  const swA = [fuseB[0] + 20, T], swB = [swA[0] + (Rx - Lx) * 0.28, T];
  const bw = narrow ? 98 : 124, bh = narrow ? 96 : 80, bx = Rx - bw / 2, by = M - bh / 2;

  // wires
  C.wire([[Lx, T], [fuseA[0], T]]);
  C.wire([[fuseB[0], T], [swA[0], T]]);
  C.wire([[swB[0], T], [Rx, T], [Rx, by]]);
  C.wire([[Rx, by + bh], [Rx, B], [Lx, B], [Lx, M + supplyR]]);
  C.wire([[Lx, T], [Lx, M - supplyR]]);
  C.ground(Lx, B);

  C.fuse(fuseA, fuseB, fuseBlown);
  C.switchNC(swA, swB, !estopPressed);
  C.box(bx, by, bw, bh, 'Arm motor\nboard');
  C.supply(Lx, M, supplyR);

  // current
  const I = actualAmps();
  const loop = C.makePath([[Lx, T], [Rx, T], [Rx, B], [Lx, B]], true);
  flowPhase = C.advance(flowPhase, I);
  if (I > 0) {
    C.drawFlow(loop, flowPhase, 30, C.COL.flow,
      [{ x: Lx, y: M, r: supplyR + 6 }, { x: Rx, y: M, r: Math.max(bw, bh) / 2 }, { x: (fuseA[0] + fuseB[0]) / 2, y: T, r: (fuseB[0] - fuseA[0]) / 2 },
       { x: (swA[0] + swB[0]) / 2, y: T, r: (swB[0] - swA[0]) / 2 + 4 }], 10);
  }

  // labels
  txt('V1', Lx - 48, M - 14, 'black', CENTER, CENTER, 16, true);
  txt('12 V', Lx - 48, M + 8, 'black', CENTER, CENTER, 16, false);
  const fmid = (fuseA[0] + fuseB[0]) / 2, smid = (swA[0] + swB[0]) / 2;
  txt(narrow ? 'F1 ' + fuseRating + ' A' : 'F1  ' + fuseRating + ' A', fmid, T - 28, fuseBlown ? C.COL.warn : 'black', CENTER, CENTER, 16, true);
  if (!narrow || fuseBlown) txt(fuseBlown ? 'blown' : 'fuse', fmid, T + 28, fuseBlown ? C.COL.warn : C.COL.dim, CENTER, CENTER, 16, false);
  txt(narrow ? 'S1' : 'S1  E-stop', smid, T - 28, 'black', CENTER, CENTER, 16, true);
  const swText = narrow ? (estopPressed ? 'open' : 'closed') : (estopPressed ? 'pressed: contact open' : 'released: contact closed');
  txt(swText, smid, T + 28, estopPressed ? C.COL.warn : C.COL.dim, CENTER, CENTER, 16, false);
  const shown = running ? I : 0;
  txt('I = ' + fmt(shown) + ' A', Rx, B + 24, running && I > 0 ? C.COL.flow : C.COL.dim, CENTER, CENTER, 16, true);
}

function fmt(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function statusText() {
  if (fuseBlown) return { s: 'Arm stopped: the fuse blew. Replace the fuse (after fixing the cause).', c: 'firebrick' };
  if (estopPressed) return { s: 'Arm stopped: the E-stop opened the circuit. The fuse is intact.', c: 'firebrick' };
  if (!running) return { s: 'Waiting for your prediction.', c: 'dimgray' };
  if (overSince !== null) return { s: 'Current is above the fuse rating: the fuse is heating up...', c: 'darkorange' };
  if (demandAmps() === 0) return { s: 'Powered, drawing no current.', c: 'darkgreen' };
  return { s: 'Arm running at ' + fmt(actualAmps()) + ' A.', c: 'darkgreen' };
}

function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 276, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };

  if (mode === 'explore') {
    line('Explore: change the fuse, the load and the E-stop, and watch the dots.', 'black', 16, true, narrow ? 48 : 26);
    const st = statusText();
    line(st.s, st.c, 16, true, narrow ? 48 : 26);
    if (narrow) return;
    line('The fuse blows when the current stays above its rating. The E-stop opens the circuit, so no current flows.', 'black', 16, false, 48);
    line('Changing the fuse rating fits a new fuse.', 'dimgray', 16, false);
    return;
  }

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + SITUATIONS.length, 'black', 18, true, 28);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + SITUATIONS.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 28);
    line('Explore mode is unlocked. Use the mode menu to try any fuse, load and E-stop setting.', 'black', 16, false, 48);
    return;
  }

  const s = SITUATIONS[idx];
  line('Situation ' + (idx + 1) + ' of ' + SITUATIONS.length + '   Correct: ' + correctCount + ' of ' + SITUATIONS.length, 'black', 16, true);
  const what = s.short ? 'A wire shorts the motor board (about 40 A).' : 'The arm draws ' + s.load + ' A.';
  if (!(narrow && phase !== 'ask')) line('Fuse: ' + s.fuse + ' A.  ' + what + '  E-stop: ' + (s.estop ? 'pressed.' : 'released.'), 'black', 16, false, narrow ? 48 : 26);
  if (phase === 'ask') {
    line('What happens when power is applied?', 'black', 18, true, narrow ? 48 : 28);
    if (!narrow) line('Choose, then watch the circuit.', 'dimgray', 16, false);
  } else {
    const right = CHOICES[s.correct], ok = picked === s.correct;
    const msg = ok ? 'Correct: ' + right + '. ' + s.why : 'Not quite. The result is: ' + right + '. ' + s.why;
    line(msg, ok ? 'darkgreen' : 'firebrick', 16, false, narrow ? 116 : 48);
    if (!narrow) { const st = statusText(); line(st.s, st.c, 16, true, 26); }
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 43, ROW3 = 78;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 260);
  nextBtn.position(canvasWidth - (narrow ? 130 : 150), drawHeight + ROW1);
  // choices: one row on wide screens, two rows on narrow ones
  if (narrow) {
    choiceBtns[0].position(10, drawHeight + ROW2);
    choiceBtns[1].position(110, drawHeight + ROW2);
    choiceBtns[2].position(10, drawHeight + ROW3);
  } else {
    choiceBtns[0].position(10, drawHeight + ROW2);
    choiceBtns[1].position(130, drawHeight + ROW2);
    choiceBtns[2].position(250, drawHeight + ROW2);
  }
  estopBtn.position(modeSelect.x + (narrow ? 210 : 270), drawHeight + ROW1);
  replaceBtn.position(canvasWidth - (narrow ? 118 : 130), drawHeight + ROW1);
  fuseSelect.position(narrow ? 70 : 90, drawHeight + ROW2);
  fuseSelect.size(80);
  shortBox.position(narrow ? 165 : 200, drawHeight + ROW2);
  const labelW = narrow ? 108 : 150;
  loadSlider.position(labelW + 6, drawHeight + ROW3);
  loadSlider.size(max(60, canvasWidth - labelW - 28));
}

function drawControlLabels() {
  if (mode !== 'explore') return;
  txt('Fuse:', 10, drawHeight + ROW2 + 11, 'black');
  txt((narrow ? 'Load: ' : 'Arm load: ') + loadSlider.value() + ' A', 10, drawHeight + ROW3 + 11, 'black');
}

function loadSituation() {
  const s = SITUATIONS[Math.min(idx, SITUATIONS.length - 1)];
  fuseRating = s.fuse; loadAmps = s.load; shorted = s.short; estopPressed = s.estop;
  fuseBlown = false; overSince = null; running = false;
}

function replaceFuse() { fuseBlown = false; overSince = null; }

function setMode(m) {
  mode = m;
  if (m === 'explore') {
    running = true; fuseBlown = false; overSince = null; estopPressed = false;
    fuseRating = parseInt(fuseSelect.value(), 10); loadAmps = loadSlider.value(); shorted = shortBox.checked();
  } else {
    loadSituation();
  }
  refreshControls();
}

function refreshControls() {
  const ex = mode === 'explore';
  [estopBtn, replaceBtn, fuseSelect, shortBox, loadSlider].forEach(c => (ex ? c.show() : c.hide()));
  choiceBtns.forEach(b => (ex || phase === 'done' ? b.hide() : b.show()));
  if (ex) nextBtn.hide(); else nextBtn.show();
  estopBtn.html(estopPressed ? 'Release E-stop' : 'Press E-stop');
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
  running = true;                 // only now does the circuit run
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
