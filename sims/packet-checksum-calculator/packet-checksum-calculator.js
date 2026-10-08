// Packet Checksum Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 650
// Learning objective (Apply, calculate): calculate the checksum byte of six instruction packets from their ID,
// instruction and parameters, with at least 5 of 6 correct on the first attempt.
// Evidence: the two hex digits typed and committed with Check for each packet. Explore mode is not evidence.
// Rules (Feetech serial protocol): Length = parameter bytes + 2.
// Checksum = (~(sum of the bytes from the ID to the last parameter)) & 0xFF. The two FF header bytes are not added.
// This sim is a calculator. It sends nothing to any device.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// instruction codes and the STS3215 registers from the chapter's tables
const INS = { PING: 0x01, READ: 0x02, WRITE: 0x03 };
const REGS = [
  { name: 'ID', addr: 5, size: 1, writable: true, def: 1 },
  { name: 'Baud_Rate', addr: 6, size: 1, writable: true, def: 0 },
  { name: 'Torque_Enable', addr: 40, size: 1, writable: true, def: 0 },
  { name: 'Goal_Position', addr: 42, size: 2, writable: true, def: 2048 },
  { name: 'Present_Position', addr: 56, size: 2, writable: false, def: 0 },
  { name: 'Present_Voltage', addr: 62, size: 1, writable: false, def: 0 },
  { name: 'Present_Temperature', addr: 63, size: 1, writable: false, def: 0 }
];
function regByName(name) { return REGS.find(r => r.name === name); }

// the six packets, in fixed order. The checksum is computed by buildPacket(); expect is the spec's answer key.
const PROBLEMS = [
  { label: 'PING servo 1', id: 1, ins: 'PING', expect: 'FB', why: '~0x04 = 0xFB.' },
  { label: 'PING servo 2', id: 2, ins: 'PING', expect: 'FA', why: '~0x05 = 0xFA.' },
  { label: 'READ servo 1, Present_Position (address 56, 2 bytes)', id: 1, ins: 'READ', reg: 'Present_Position',
    expect: 'BE', why: '~0x41 = 0xBE.' },
  { label: 'READ servo 3, Present_Temperature (address 63, 1 byte)', id: 3, ins: 'READ', reg: 'Present_Temperature',
    expect: 'B6', why: '~0x49 = 0xB6.' },
  { label: 'WRITE servo 1, Goal_Position = 2048 (bytes 00 08, little-endian)', id: 1, ins: 'WRITE', reg: 'Goal_Position',
    value: 2048, expect: 'C4', why: '~0x3B = 0xC4.' },
  { label: 'WRITE servo 2, Torque_Enable = 0', id: 2, ins: 'WRITE', reg: 'Torque_Enable', value: 0,
    expect: 'CE', why: '~0x31 = 0xCE.' }
];
const MASTERY = 5;

const COL_HEADER = '#dcdcdc', COL_SUM = '#ffe49a', COL_CHK = '#bfe5c7';

// controls
let modeSelect, actionBtn, idSelect, insSelect, regSelect, valueInput, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, notice = '';

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six packets', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  idSelect = createSelect();
  for (let i = 1; i <= 6; i++) idSelect.option(String(i));
  idSelect.selected('1');

  insSelect = createSelect();
  for (const name of Object.keys(INS)) insSelect.option(name);
  insSelect.selected('PING');
  insSelect.changed(onExploreChange);

  regSelect = createSelect();
  for (const r of REGS) regSelect.option(r.name + ' (' + r.addr + ')', r.name);
  regSelect.selected('Goal_Position');
  regSelect.changed(onExploreChange);

  valueInput = createInput('2048', 'number');
  valueInput.attribute('min', '0');
  valueInput.attribute('step', '1');
  valueInput.attribute('aria-label', 'Value to write');

  answerInput = createInput('', 'text');
  answerInput.attribute('maxlength', '2');
  answerInput.attribute('aria-label', 'Checksum as two hex digits');
  answerInput.elt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A serial packet drawn as a row of hex bytes. The two header bytes are gray, the bytes that are added up ' +
    'are yellow and the checksum is green. A panel shows the sum, its low byte and the flipped bits step by step. ' +
    'Menus build your own packet, and a second mode asks for the checksum of six packets.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function hex2(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
function hexN(n) { return '0x' + n.toString(16).toUpperCase().padStart(2, '0'); }
function bits(n) { const b = n.toString(2).padStart(8, '0'); return b.slice(0, 4) + ' ' + b.slice(4); }

function buildPacket(id, ins, reg, value) {
  let params = [];
  if (ins === 'READ') params = [reg.addr, reg.size];
  if (ins === 'WRITE') params = [reg.addr].concat(reg.size === 2 ? [value & 0xFF, (value >> 8) & 0xFF] : [value & 0xFF]);
  const len = params.length + 2;
  const body = [id, len, INS[ins]].concat(params);
  const sum = body.reduce((a, b) => a + b, 0);
  const low = sum & 0xFF;
  const chk = (~sum) & 0xFF;
  return { id, ins, reg, value, params, len, body, sum, low, chk, bytes: [0xFF, 0xFF].concat(body, [chk]) };
}

function problemPacket(q) { return buildPacket(q.id, q.ins, q.reg ? regByName(q.reg) : null, q.value || 0); }

function valueMax(reg) { return reg.size === 2 ? 4095 : 255; }

function explorePacket() {
  const reg = regByName(regSelect.value());
  const raw = Math.floor(Number(valueInput.value()));
  const value = Number.isFinite(raw) ? Math.min(valueMax(reg), Math.max(0, raw)) : 0;
  return buildPacket(Number(idSelect.value()), insSelect.value(), reg, value);
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Packet Checksum Calculator', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawProblems();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const p = explorePacket();
  txt('Build a packet and watch the checksum', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawBytes(p, true, 68);
  drawLegend(118);
  const top = drawFields(p, 146);
  const line = panel(top, drawHeight - top - 8);
  drawWorking(p, line);
  line('This is a calculator. It sends nothing to any device.', 'dimgray', 16, false, narrow ? 44 : 24);
}

// ---------------------------------------------------------------------------
// Six packets
// ---------------------------------------------------------------------------
function drawProblems() {
  const score = 'Correct: ' + correctCount + ' of ' + PROBLEMS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 200);
    line(score, 'black', 20, true, 34);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, narrow ? 52 : 30);
    line('Remember: start adding at the ID, keep the low byte, then flip every bit.', 'black', 16, false, 48);
    line('Switch to Explore to build packets of your own.', 'dimgray', 16, false, narrow ? 44 : 24);
    return;
  }
  const q = PROBLEMS[idx], p = problemPacket(q);
  const done = phase === 'feedback';
  txt('Packet ' + (idx + 1) + ' of ' + PROBLEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawBytes(p, done, 68);
  drawLegend(118);
  const top = drawFields(p, 146);
  const line = panel(top, drawHeight - top - 8);
  if (!done) {
    line(q.label, 'black', 16, true, narrow ? (q.label.length > 36 ? 48 : 28) : 28);
    line('What is the checksum byte? Type two hex digits and press Check. You get one try for each packet.',
      'black', 16, false, narrow ? 66 : 28);
    line('Hint: the two FF header bytes are not part of the sum.', 'dimgray', 16, false, narrow ? 44 : 24);
    return;
  }
  const msg = lastRight ? 'Correct: ' + hex2(p.chk) + '. ' + q.why
    : 'Not quite. The sum is ' + p.sum + ' (' + hexN(p.sum) + '), and its bitwise NOT is ' + hex2(p.chk) + '. ' + q.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true, narrow && !lastRight ? 66 : (narrow ? 44 : 28));
  drawWorking(p, line);
}

// ---------------------------------------------------------------------------
// Shared drawing
// ---------------------------------------------------------------------------
// The packet as a row of byte boxes. showChk false draws the checksum as "??".
function drawBytes(p, showChk, y) {
  const n = p.bytes.length, gap = 4;
  const bw = Math.min(64, (canvasWidth - 20 - gap * (n - 1)) / n), bh = 42;
  let x = (canvasWidth - (n * bw + (n - 1) * gap)) / 2;
  for (let i = 0; i < n; i++) {
    const isHeader = i < 2, isChk = i === n - 1;
    fill(isHeader ? COL_HEADER : (isChk ? (showChk ? COL_CHK : 'white') : COL_SUM));
    stroke(60); strokeWeight(isChk ? 2 : 1);
    rect(x, y, bw, bh, 5);
    txt(isChk && !showChk ? '??' : hex2(p.bytes[i]), x + bw / 2, y + bh / 2, 'black', CENTER, CENTER, narrow ? 18 : 20, true);
    x += bw + gap;
  }
}

function drawLegend(y) {
  const items = [[COL_HEADER, 'header: not added', narrow ? 160 : 180], [COL_SUM, 'added up', narrow ? 102 : 120],
    [COL_CHK, 'checksum', 90]];
  let x = (canvasWidth - items.reduce((a, it) => a + it[2], 0)) / 2;
  for (const [col, label, w] of items) {
    fill(col); stroke(60); strokeWeight(1);
    rect(x, y + 2, 14, 14);
    txt(label, x + 19, y + 10, 'black', LEFT, CENTER, 16, false);
    x += w;
  }
}

// The meaning of each field. Returns the y below the block.
function drawFields(p, y) {
  const x = 18, w = canvasWidth - 36;
  const np = p.params.length;
  txt('ID: ' + hex2(p.id) + '      Instruction: ' + hex2(INS[p.ins]) + ' = ' + p.ins, x, y, 'black', LEFT, TOP, 16, false);
  txt('Length: ' + hex2(p.len) + ' = ' + np + ' parameter byte' + (np === 1 ? '' : 's') + ' + 2', x, y + 24, 'black', LEFT, TOP, 16, false);
  let s = 'Parameters: none';
  if (p.ins === 'READ') {
    s = 'Parameters: ' + hex2(p.reg.addr) + ' = address ' + p.reg.addr + ', ' + hex2(p.reg.size) + ' = read ' +
      p.reg.size + ' byte' + (p.reg.size === 1 ? '' : 's');
  } else if (p.ins === 'WRITE') {
    s = 'Parameters: ' + hex2(p.reg.addr) + ' = address ' + p.reg.addr + ', ' + p.params.slice(1).map(hex2).join(' ') +
      ' = ' + p.value + (p.reg.size === 2 ? ', low byte first' : '');
  }
  const h = narrow ? 44 : 24;
  txt(s, x, y + 48, 'black', LEFT, TOP, 16, false, w, h);
  return y + 48 + h + 6;
}

// The checksum worked out in three steps.
function drawWorking(p, line) {
  line('1. Add from the ID to the last parameter:', 'black', 16, false, 24);
  line('    ' + p.body.map(hex2).join(' + ') + ' = ' + hexN(p.sum) + ' (' + p.sum + ')', 'black', 16, false, 24);
  line('2. Keep the low byte: ' + hexN(p.low) + ' = ' + bits(p.low), 'black', 16, false, 24);
  line('3. Flip every bit: ' + bits(p.chk) + ' = ' + hexN(p.chk), 'black', 16, false, 24);
  line('Checksum = ' + hex2(p.chk), 'darkgreen', 18, true, 26);
  line('Shortcut: 255 − ' + p.low + ' = ' + p.chk + ' = ' + hexN(p.chk), 'dimgray', 16, false, 24);
}

// Draws a rounded panel and returns a function that writes one wrapped line of text into it.
function panel(top, h) {
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  return (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 24); y += (hh || 24); };
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84, ROW4 = 122;
const LABEL_W = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  idSelect.position(LABEL_W, drawHeight + ROW2); idSelect.size(50);
  insSelect.position(238, drawHeight + ROW2); insSelect.size(90);
  regSelect.position(LABEL_W, drawHeight + ROW3); regSelect.size(220);
  valueInput.position(LABEL_W, drawHeight + ROW4); valueInput.size(80);
  answerInput.position(196, drawHeight + ROW2); answerInput.size(50);
}

function drawControlLabels() {
  if (mode === 'explore') {
    const ins = insSelect.value(), reg = regByName(regSelect.value());
    txt('Servo ID:', 10, drawHeight + ROW2 + 11, 'black');
    txt('Instruction:', 148, drawHeight + ROW2 + 11, 'black');
    txt('Register:', 10, drawHeight + ROW3 + 11, ins === 'PING' ? 'gray' : 'black');
    txt('Value:', 10, drawHeight + ROW4 + 11, ins === 'WRITE' ? 'black' : 'gray');
    const note = ins === 'WRITE' ? '0 to ' + valueMax(reg) : (ins === 'PING' ? 'PING has no parameters' : 'READ sends no value');
    txt(note, LABEL_W + 96, drawHeight + ROW4 + 11, 'dimgray');
    return;
  }
  if (phase === 'done') return;
  txt('Checksum (2 hex digits):', 10, drawHeight + ROW2 + 11, 'black');
  if (notice) txt(notice, 10, drawHeight + ROW3 + 11, 'firebrick');
}

// Keep the Explore controls consistent with the chosen instruction.
function onExploreChange() {
  const ins = insSelect.value();
  for (const o of regSelect.elt.options) o.disabled = (ins === 'WRITE' && !regByName(o.value).writable);
  if (ins === 'WRITE' && !regByName(regSelect.value()).writable) regSelect.selected('Goal_Position');
  const reg = regByName(regSelect.value());
  valueInput.value(String(reg.def));
  valueInput.attribute('max', String(valueMax(reg)));
  setEnabled(regSelect, ins !== 'PING');
  setEnabled(valueInput, ins === 'WRITE');
}

function setEnabled(ctrl, on) { if (on) ctrl.removeAttribute('disabled'); else ctrl.attribute('disabled', ''); }

function setMode(m) {
  mode = m;
  if (m === 'problems') startProblems();
  refreshControls();
}

function startProblems() {
  idx = 0; correctCount = 0; phase = 'ask'; notice = '';
  answerInput.value('');
}

function refreshControls() {
  const explore = mode === 'explore';
  for (const c of [idSelect, insSelect, regSelect, valueInput]) { if (explore) c.show(); else c.hide(); }
  if (explore) { actionBtn.hide(); answerInput.hide(); onExploreChange(); return; }
  actionBtn.show();
  if (phase === 'done') { actionBtn.html('Try again'); answerInput.hide(); return; }
  answerInput.show();
  if (phase === 'ask') {
    actionBtn.html('Check');
    answerInput.removeAttribute('disabled');
  } else {
    actionBtn.html(idx === PROBLEMS.length - 1 ? 'See score' : 'Next packet');
    answerInput.attribute('disabled', '');
  }
}

function onAction() {
  if (mode !== 'problems') return;
  if (phase === 'ask') {
    const typed = String(answerInput.value()).trim();
    if (!/^[0-9a-fA-F]{2}$/.test(typed)) {
      notice = 'Type exactly two hex digits (0-9, A-F).';
      return;
    }
    notice = '';
    lastRight = typed.toUpperCase() === hex2(problemPacket(PROBLEMS[idx]).chk);
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < PROBLEMS.length - 1) { idx++; phase = 'ask'; answerInput.value(''); } else { phase = 'done'; }
  } else if (phase === 'done') {
    startProblems();
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
