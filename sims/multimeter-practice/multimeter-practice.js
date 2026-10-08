// Multimeter Practice - p5.js MicroSim
// CANVAS_HEIGHT: 640
// Learning objective (Apply, use): use a virtual multimeter by choosing the correct mode, power state and
// connection for six measuring tasks from this book's circuits, with at least 5 of 6 tasks fully correct on the
// first attempt. Evidence: the three settings committed with Check in each task. A task counts only when all
// three are right. Explore mode is exploration, not evidence.
// Meter model (a teaching simplification, with illustrative readings):
//   current mode across the points of a powered circuit  -> "Short circuit: the fuse would blow"
//   resistance or continuity with the power on            -> "Reading is not valid"
//   any mode except current, connected in series          -> no useful reading
//   AC voltage on these DC circuits                       -> no useful reading
//   otherwise the meter shows the circuit's voltage, resistance, beep or current.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 480;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const MODES = ['DC voltage', 'AC voltage', 'Resistance', 'Continuity', 'DC current'];
const VDC = 0, VAC = 1, RES = 2, CONT = 3, CUR = 4;
const POWER_ON = 'Power on', POWER_OFF = 'Power off';
const ACROSS = 'Across the points', SERIES = 'In series (open the wire)';
const BEEP_LIMIT = 30;         // ohms: the meter beeps below this

// Six circuits. volts: between the two points with the power on. ohms: between them with the power off
// (null = nothing useful, Infinity = open). amps: through the meter when it is in series with the power on.
// part: something in the top wire that the probes go across ('wire' or 'fuse'); otherwise they go across the two wires.
const CIRCUITS = [
  { name: '5 V supply plug', left: '5 V supply', right: 'plug', top: '+', bottom: '−', part: null,
    volts: 5.0, ohms: null, amps: 0,
    voltNote: 'The probes are across + and − of the plug, so the meter shows the supply voltage.',
    ampNote: 'Nothing is plugged in, so no current flows.' },
  { name: 'One wire of a servo cable', left: 'controller', right: 'servo', top: '', bottom: '', part: 'wire', partLabel: 'one wire',
    volts: 0, ohms: 0.2, amps: 0.3,
    voltNote: 'A good wire has almost no voltage from one end to the other.' },
  { name: 'CAN bus terminators', left: '120 Ω', right: '120 Ω', top: 'CAN_H', bottom: 'CAN_L', part: null,
    volts: 0.1, ohms: 60, amps: 0,
    voltNote: 'The voltage between CAN_H and CAN_L changes with the data, so this reading tells you little.',
    ampNote: 'The current in a data wire is too small to read this way.' },
  { name: 'A fuse', left: 'supply', right: 'arm', top: '', bottom: '', part: 'fuse', partLabel: 'fuse',
    volts: 0, ohms: 0.1, amps: 0.8,
    voltNote: 'A good fuse has almost no voltage across it.' },
  { name: 'Red and black supply wires', left: 'supply', right: 'arm', top: 'red wire (+)', bottom: 'black wire (−)', part: null,
    volts: 5.0, ohms: Infinity, amps: 0.8,
    voltNote: 'Red is + and black is −, so the meter shows the supply voltage.' },
  { name: 'Arm supply wire', left: '5 V supply', right: 'arm', top: '+', bottom: '−', part: null,
    volts: 5.0, ohms: null, amps: 0.8,
    voltNote: 'The probes are across + and −, so the meter shows the supply voltage, not the current.' }
];

// six tasks in fixed order
const TASKS = [
  { text: 'Check that the 5 V arm supply gives about 5 V at its plug.', circuit: 0, mode: VDC, on: true, series: false,
    expect: 'about 5 V', why: 'Voltage is a difference between two points, so the probes go across them with the supply running.' },
  { text: 'Check that one wire of a servo cable has no break.', circuit: 1, mode: CONT, on: false, series: false,
    expect: 'a beep', why: 'Continuity needs the power off and the probes at the two ends of the wire.' },
  { text: 'Check the CAN bus terminators of the reBot-DevArm bus.', circuit: 2, mode: RES, on: false, series: false,
    expect: 'about 60 Ω', why: 'Resistance is measured with the power off, across CAN_H and CAN_L, and two 120 Ω terminators in parallel give 60 Ω.' },
  { text: 'Check whether a fuse is blown.', circuit: 3, mode: CONT, on: false, series: false,
    expect: 'a beep if the fuse is good', why: 'A good fuse is a connection, so it beeps, and an open fuse is silent.' },
  { text: 'Check whether the red and black supply wires touch each other.', circuit: 4, mode: CONT, on: false, series: false,
    expect: 'silence if they are apart', why: 'Continuity between the two supply wires means they touch, which is a short.' },
  { text: 'Find out how much current the arm draws from its supply.', circuit: 5, mode: CUR, on: true, series: true,
    expect: 'a current in amperes', why: 'Current flows through the wire, so the wire is opened and the meter is put in the gap.' }
];
const MASTERY = 5;

// controls
let viewSelect, actionBtn, circuitSelect, meterSelect, powerSelect, connSelect;

// state
let view = 'explore';          // 'explore' or 'tasks'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  viewSelect = createSelect();
  viewSelect.option('Explore', 'explore');
  viewSelect.option('Six tasks', 'tasks');
  viewSelect.selected('explore');
  viewSelect.changed(() => setView(viewSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  circuitSelect = createSelect();
  CIRCUITS.forEach((c, i) => circuitSelect.option('Circuit: ' + c.name, String(i)));

  meterSelect = createSelect();
  meterSelect.option('Meter mode…', '');
  MODES.forEach((m, i) => meterSelect.option(m, String(i)));
  powerSelect = createSelect();
  powerSelect.option('Power…', '');
  powerSelect.option(POWER_ON, 'on');
  powerSelect.option(POWER_OFF, 'off');
  connSelect = createSelect();
  connSelect.option('Connection…', '');
  connSelect.option(ACROSS, 'across');
  connSelect.option(SERIES, 'series');
  [meterSelect, powerSelect, connSelect].forEach(s => s.changed(refreshControls));

  layoutControls();
  setView('explore');
  describe('A simple circuit with two wires between two boxes, and a multimeter under it with a red and a black ' +
    'probe. Menus set the meter mode, whether the circuit power is on, and whether the probes go across two ' +
    'points or in series in a gap in the wire. The meter display shows the reading or a warning.');
}

// ---------------------------------------------------------------------------
// The settings now on screen, and what the meter would read
// ---------------------------------------------------------------------------
// mode is 0 to 4 or -1 (not chosen); on and series are true, false or null (not chosen)
function setting() {
  const m = meterSelect.value(), p = powerSelect.value(), k = connSelect.value();
  return {
    circuit: view === 'tasks' ? TASKS[idx].circuit : int(circuitSelect.value()),
    mode: m === '' ? -1 : int(m),
    on: p === '' ? null : p === 'on',
    series: k === '' ? null : k === 'series'
  };
}
function complete(s) { return s.mode >= 0 && s.on !== null && s.series !== null; }

function reading(s) {
  const c = CIRCUITS[s.circuit];
  if (s.mode === CUR && !s.series && s.on) return { display: 'SHORT', warn: true, head: 'Short circuit: the fuse would blow',
    note: 'In current mode the meter is almost a wire. Across two points of a powered circuit it makes a short circuit.' };
  if ((s.mode === RES || s.mode === CONT) && s.on) return { display: 'not valid', warn: true, head: 'Reading is not valid',
    note: 'Turn the power off first. The meter sends its own small current through the part, and a powered circuit gives a wrong reading.' };
  if (s.series && s.mode !== CUR) return { display: '- - -', warn: true, head: 'No useful reading',
    note: 'Only current mode goes in series. In this mode, put the probes across the two points.' };
  if (s.mode === VAC) return { display: '- - -', warn: true, head: 'No useful reading',
    note: 'The circuits in this book are DC. AC voltage is the wrong mode for them.' };
  if (s.mode === VDC) {
    if (!s.on) return { display: '0.0 V', head: 'The meter reads 0.0 V', note: 'The power is off, so there is no voltage to measure.' };
    return { display: c.volts.toFixed(1) + ' V', head: 'The meter reads ' + c.volts.toFixed(1) + ' V', note: c.voltNote };
  }
  if (s.mode === RES || s.mode === CONT) {
    if (c.ohms === null) return { display: '- - -', warn: true, head: 'No useful reading',
      note: 'This mode tells you nothing useful about a supply and what it feeds.' };
    if (s.mode === RES) {
      if (c.ohms === Infinity) return { display: 'OL', head: 'The meter reads OL', note: 'OL means open: there is no connection between the two points.' };
      return { display: c.ohms + ' Ω', head: 'The meter reads ' + c.ohms + ' Ω', note: 'With the power off, the meter measures the resistance between its probes.' };
    }
    if (c.ohms <= BEEP_LIMIT) return { display: 'BEEP', head: 'The meter beeps', note: 'A beep means the two points are connected.' };
    return { display: 'silent', head: 'The meter is silent', note: c.ohms === Infinity ? 'No beep: the two points are not connected.'
      : 'No beep: ' + c.ohms + ' Ω is not a direct connection.' };
  }
  // DC current
  if (!s.series) return { display: '0.00 A', warn: true, head: 'No current with the power off',
    note: 'Do not switch the power on like this. Current mode across two points is a short circuit.' };
  if (!s.on) return { display: '0.00 A', head: 'The meter reads 0.00 A', note: 'The power is off, so no current flows.' };
  return { display: c.amps.toFixed(2) + ' A', head: 'The meter reads ' + c.amps.toFixed(2) + ' A',
    note: c.amps > 0 ? 'The meter is now part of the circuit, so the current flows through it.' : c.ampNote };
}

function settingText(t) {
  return MODES[t.mode] + ', ' + (t.on ? POWER_ON : POWER_OFF) + ', ' + (t.series ? SERIES : ACROSS);
}

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Multimeter Practice', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const s = setting();
  // in a task the reading stays hidden until the learner presses Check
  const r = (view === 'explore' || phase === 'feedback') && complete(s) ? reading(s) : null;
  if (!(view === 'tasks' && phase === 'done')) { drawCircuit(s); drawMeter(s, r); }
  drawInfoPanel(s, r);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The circuit and the probes
// ---------------------------------------------------------------------------
let probeRed = null, probeBlack = null;     // where the probe tips touch (set by drawCircuit, used by drawMeter)

function drawCircuit(s) {
  const c = CIRCUITS[s.circuit];
  const W = min(canvasWidth - 24, 600), x0 = (canvasWidth - W) / 2, x1 = x0 + W;
  const boxW = narrow ? 92 : 120, yT = 98, yB = 158;
  const xa = x0 + boxW, xb = x1 - boxW, span = xb - xa;
  const on = s.on === true;

  // status line
  const status = c.name + ': power ' + (s.on === null ? '?' : on ? 'ON' : 'OFF');
  textSize(16); textStyle(BOLD);
  const sw = textWidth(status);
  fill(on ? 'limegreen' : 'lightgray'); stroke('dimgray'); strokeWeight(1);
  circle(canvasWidth / 2 - sw / 2 - 12, 54, 14);
  txt(status, canvasWidth / 2 + 6, 54, on ? 'darkgreen' : 'black', CENTER, CENTER, 16, true);

  // the two wires; the top one has a gap when the meter is in series
  const gx = xa + span * 0.70, gw = 24;
  strokeWeight(4); stroke(on ? 'firebrick' : 'gray');
  if (s.series === true) { line(xa, yT, gx, yT); line(gx + gw, yT, xb, yT); } else line(xa, yT, xb, yT);
  stroke(on ? 'black' : 'gray');
  line(xa, yB, xb, yB);

  // the part in the top wire
  const px = xa + span * 0.30, half = 24;
  if (c.part === 'wire') { stroke('orange'); strokeWeight(9); line(px - half, yT, px + half, yT); }
  if (c.part === 'fuse') {
    fill('white'); stroke('black'); strokeWeight(2); rect(px - half, yT - 9, half * 2, 18, 5);
    line(px - half, yT, px + half, yT);
  }
  if (c.part) txt(c.partLabel, px, yT - 20, 'black', CENTER, CENTER, 16, false);
  if (c.top) txt(c.top, xa + 6, yT + 15, 'black', LEFT, CENTER, 16, false);
  if (c.bottom) txt(c.bottom, xa + 6, yB - 15, 'black', LEFT, CENTER, 16, false);

  // the two boxes at the ends
  for (const [bx, label] of [[x0, c.left], [x1 - boxW, c.right]]) {
    fill('white'); stroke('dimgray'); strokeWeight(2);
    rect(bx, yT - 18, boxW, yB - yT + 36, 8);
    txt(label, bx + boxW / 2, (yT + yB) / 2, 'black', CENTER, CENTER, 16, true);
  }

  // where the probes touch
  if (s.series === null) { probeRed = probeBlack = null; }
  else if (s.series) { probeRed = { x: gx, y: yT }; probeBlack = { x: gx + gw, y: yT }; }
  else if (c.part) { probeRed = { x: px - half, y: yT }; probeBlack = { x: px + half, y: yT }; }
  else { probeRed = { x: xa + span * 0.74, y: yT }; probeBlack = { x: xa + span * 0.90, y: yB }; }
}

// ---------------------------------------------------------------------------
// The meter
// ---------------------------------------------------------------------------
function drawMeter(s, r) {
  const cx = canvasWidth / 2, top = 198, w = 210, h = 92;
  const sockets = [{ x: cx - 72, col: 'red', tip: probeRed }, { x: cx + 72, col: 'black', tip: probeBlack }];
  // leads and probes
  noFill(); strokeWeight(3);
  for (const k of sockets) {
    stroke(k.col);
    if (k.tip) {
      bezier(k.x, top, k.x, top - 26, k.tip.x, k.tip.y + 30, k.tip.x, k.tip.y);
      fill(k.col); circle(k.tip.x, k.tip.y, 11); noFill();
    } else {
      line(k.x, top, k.x, top - 14);            // not connected yet
    }
  }
  // body and display
  fill('gold'); stroke(r && r.warn ? 'firebrick' : 'darkgoldenrod'); strokeWeight(r && r.warn ? 4 : 2);
  rect(cx - w / 2, top, w, h, 12);
  fill('honeydew'); stroke('dimgray'); strokeWeight(2);
  rect(cx - w / 2 + 12, top + 10, w - 24, 42, 6);
  txt(r ? r.display : '- - -', cx, top + 32, r && r.warn ? 'firebrick' : 'black', CENTER, CENTER, 26, true);
  txt('Mode: ' + (s.mode < 0 ? '?' : MODES[s.mode]), cx, top + 72, 'black', CENTER, CENTER, 16, true);
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function drawInfoPanel(s, r) {
  const done = view === 'tasks' && phase === 'done';
  const x = 8, w = canvasWidth - 16, top = done ? 46 : 300, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;

  if (done) {
    const ok = correctCount >= MASTERY;
    y = para('Fully correct: ' + correctCount + ' of ' + TASKS.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + TASKS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + TASKS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para('Every measurement needs three choices: the mode, whether the power is on, and how the meter connects.', tx, y + 10, tw, 'black', 16, false);
    y = para('Voltage: across two points, power on.', tx, y + 8, tw, 'black', 16, false);
    y = para('Resistance and continuity: across two points, power off.', tx, y + 4, tw, 'black', 16, false);
    y = para('Current: in series, in a gap in the wire, power on.', tx, y + 4, tw, 'black', 16, false);
    y = para('Switch to Explore to try any setting on any circuit.', tx, y + 10, tw, 'dimgray', 16, false);
  } else if (view === 'tasks') {
    const t = TASKS[idx];
    y = para('Task ' + (idx + 1) + ' of ' + TASKS.length + '     Correct: ' + correctCount + ' of ' + TASKS.length, tx, y, tw, 'black', 16, true);
    if (phase === 'ask') {
      y = para(t.text, tx, y + 2, tw, 'black', 16, false);
      y = para('Set the meter mode, the power and the connection, then press Check. The meter shows its reading after you check.',
        tx, y + 6, tw, 'dimgray', 16, false);
    } else {
      const msg = (lastRight ? 'Correct: ' + settingText(t) + '. ' : 'Not quite. This task needs ' + settingText(t) + '. ') + t.why;
      const col = lastRight ? 'darkgreen' : 'firebrick';
      // an honest note: resistance mode would also find a break, but the task asks for the quick test
      const usedOhms = !lastRight && t.mode === CONT && s.mode === RES && s.on === false && s.series === false;
      const extra = 'Expected reading: ' + t.expect + '.' + (lastRight ? ''
        : usedOhms ? ' Resistance mode would show this too, but continuity is the quick test: you just listen.'
        : ' The meter above shows what your settings would read.');
      // keep the task text only when everything fits
      const need = para(t.text, tx, 0, tw, 'black', 16, false, true) + para(msg, tx, 0, tw, col, 16, false, true) + para(extra, tx, 0, tw, 'black', 16, false, true) + 10;
      if (y + need <= bottom) y = para(t.text, tx, y + 2, tw, 'black', 16, false);
      y = para(msg, tx, y + 4, tw, col, 16, false);
      y = para(extra, tx, y + 4, tw, 'black', 16, false);
    }
  } else if (r) {
    y = para(r.head, tx, y, tw, r.warn ? 'firebrick' : 'navy', 18, true);
    y = para(r.note, tx, y + 4, tw, 'black', 16, false);
    const tip = 'Try each mode on each circuit, with the power on and off. The readings are illustrative.';
    if (y + 8 + para(tip, tx, 0, tw, 'dimgray', 16, false, true) <= bottom) y = para(tip, tx, y + 8, tw, 'dimgray', 16, false);
  }
  if (y > bottom) layoutNotes.push('info panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;

function layoutControls() {
  viewSelect.position(10, drawHeight + ROW1);
  viewSelect.size(narrow ? 130 : 160, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  circuitSelect.position(10, drawHeight + ROW2);
  circuitSelect.size(narrow ? canvasWidth - 20 : 320, 28);
  const mw = narrow ? 165 : 200, pw = narrow ? canvasWidth - 28 - mw : 160;
  meterSelect.position(10, drawHeight + ROW3); meterSelect.size(mw, 28);
  powerSelect.position(18 + mw, drawHeight + ROW3); powerSelect.size(pw, 28);
  if (narrow) connSelect.position(10, drawHeight + ROW4); else connSelect.position(26 + mw + pw, drawHeight + ROW3);
  connSelect.size(narrow ? 260 : 250, 28);
}

function drawControlLabels() {
  if (view === 'tasks' && phase === 'ask') {
    txt(narrow ? 'Set all three, then press Check.' : 'Set all three menus below, then press Check.', 10, drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, true);
  }
}

function setView(v) {
  view = v;
  if (v === 'tasks') { idx = 0; phase = 'ask'; correctCount = 0; clearChoices(); }
  else { circuitSelect.selected('0'); meterSelect.selected(String(VDC)); powerSelect.selected('on'); connSelect.selected('across'); }
  refreshControls();
}

function clearChoices() {
  meterSelect.selected(''); powerSelect.selected(''); connSelect.selected('');
}

function refreshControls() {
  const explore = view === 'explore', three = [meterSelect, powerSelect, connSelect];
  if (explore) circuitSelect.show(); else circuitSelect.hide();
  three.forEach(sel => {
    sel.elt.options[0].disabled = explore;          // the "choose" entry is only for tasks
    if (!explore && phase === 'done') sel.hide(); else sel.show();
    if (!explore && phase === 'feedback') sel.attribute('disabled', ''); else sel.removeAttribute('disabled');
  });
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'ask' ? 'Check' : phase === 'done' ? 'Try again' : idx === TASKS.length - 1 ? 'See score' : 'Next task');
  if (phase === 'ask' && !complete(setting())) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (view !== 'tasks') return;
  if (phase === 'ask') {
    const s = setting(), t = TASKS[idx];
    if (!complete(s)) return;
    lastRight = s.mode === t.mode && s.on === t.on && s.series === t.series;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < TASKS.length - 1) { idx++; phase = 'ask'; clearChoices(); } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; phase = 'ask'; clearChoices();
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
