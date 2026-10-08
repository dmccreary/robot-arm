// Status Packet Decoder - p5.js MicroSim
// CANVAS_HEIGHT: 560
// Learning objective (Understand, classify): classify six reply packets as a valid reading, a bad checksum, a
// servo-reported error or not a packet, with at least 5 of 6 correct on the first attempt.
// Evidence: the class chosen and committed with Check for each reply. Clicking bytes to see field names is not evidence.
// Rules (Feetech serial protocol): a reply is a valid reading when it starts with FF FF, its length byte equals the
// byte count minus 4, its checksum matches and its error byte is 0. The checks run in that order and the first
// one that fails decides the class. Checksum = (~(sum from the ID to the last data byte)) & 0xFF.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const CLASSES = ['Valid reading', 'Bad checksum', 'Servo reports an error', 'Not a packet'];

// the six replies, in fixed order. cls is the spec's answer key; classify() must agree with it.
const REPLIES = [
  { bytes: [0xFF, 0xFF, 0x01, 0x04, 0x00, 0x18, 0x05, 0xDD], asked: 'Position of servo 1', cls: 'Valid reading',
    why: 'Header, length and checksum are right and the error is 0. Data 18 05 = 1304 steps = 114.6 degrees.' },
  { bytes: [0xFF, 0xFF, 0x02, 0x03, 0x00, 0x49, 0xB1], asked: 'Voltage of servo 2', cls: 'Valid reading',
    why: 'The data byte 0x49 = 73, which is 7.3 V in units of 0.1 V.' },
  { bytes: [0xFF, 0xFF, 0x03, 0x03, 0x00, 0x1F, 0xDA], asked: 'Temperature of servo 3', cls: 'Valid reading',
    why: 'The data byte 0x1F = 31, which is 31 degrees Celsius.' },
  { bytes: [0xFF, 0xFF, 0x01, 0x04, 0x00, 0x18, 0x05, 0xDC], asked: 'Position of servo 1', cls: 'Bad checksum',
    why: 'The checksum should be DD but is DC, so a bit was damaged in transit.' },
  { bytes: [0xFF, 0xFF, 0x01, 0x02, 0x20, 0xDC], asked: 'Ping of servo 1', cls: 'Servo reports an error',
    why: 'The checksum is right, but the error byte is 0x20, not 0.' },
  { bytes: [0xFE, 0xFF, 0x01, 0x02, 0x00, 0xFC], asked: 'Ping of servo 1', cls: 'Not a packet',
    why: 'The first header byte is FE, not FF.' }
];
const MASTERY = 5;

// field colours
const COL_BOX = '#f4f4f4', COL_SELECT = '#1f6fb5', COL_BAD = '#c0392b', COL_GOOD = '#1e7d3c';

// controls
let modeSelect, actionBtn, classBtns = [];

// state
let mode = 'explore';          // 'explore' or 'replies'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;
let chosen = -1;               // index into CLASSES, or -1
let selected = -1;             // index of the clicked byte, or -1
let boxes = [];                // hit boxes of the bytes drawn this frame

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six replies', 'replies');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  CLASSES.forEach((name, i) => {
    const b = createButton(name);
    b.mouseClicked(() => choose(i));
    classBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A servo reply packet drawn as a row of hex bytes. Click a byte to see which field it belongs to. ' +
    'A second mode shows six replies and four buttons to classify each one as a valid reading, a bad checksum, ' +
    'a servo-reported error or not a packet.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function hex2(n) { return n.toString(16).toUpperCase().padStart(2, '0'); }
function expectedChecksum(b) { return (~b.slice(2, b.length - 1).reduce((a, x) => a + x, 0)) & 0xFF; }

// Which field is byte i of an n-byte reply?
function fieldOf(i, n) {
  if (i < 2) return 'header';
  if (i === 2) return 'id';
  if (i === 3) return 'length';
  if (i === 4) return 'error';
  if (i === n - 1) return 'checksum';
  return 'data';
}

// The four checks in order. Returns [{ text, pass }] and stops at the first failure (later ones have pass null).
function runChecks(b) {
  const n = b.length, want = expectedChecksum(b);
  const all = [
    { ok: b[0] === 0xFF && b[1] === 0xFF, good: 'Header: FF FF.', bad: 'Header: ' + hex2(b[0]) + ' ' + hex2(b[1]) + ', not FF FF.', field: 'header', none: 'Header' },
    { ok: b[3] === n - 4, good: 'Length: ' + hex2(b[3]) + ' = ' + n + ' bytes − 4.', bad: 'Length: ' + hex2(b[3]) + ', but ' + n + ' bytes − 4 = ' + (n - 4) + '.', field: 'length', none: 'Length' },
    { ok: b[n - 1] === want, good: 'Checksum: ' + hex2(b[n - 1]) + ' matches.', bad: 'Checksum: ' + hex2(b[n - 1]) + ', but it should be ' + hex2(want) + '.', field: 'checksum', none: 'Checksum' },
    { ok: b[4] === 0, good: 'Error byte: 00.', bad: 'Error byte: ' + hex2(b[4]) + ', not 0.', field: 'error', none: 'Error byte' }
  ];
  const out = [];
  let failed = false;
  for (const c of all) {
    if (failed) { out.push({ text: c.none + ': not checked.', pass: null, field: c.field }); continue; }
    out.push({ text: c.ok ? c.good + ' OK' : c.bad + ' FAILS', pass: c.ok, field: c.field });
    if (!c.ok) failed = true;
  }
  return out;
}

// The class that the rules give. The answer key in REPLIES must agree with this.
function classify(b) {
  const checks = runChecks(b);
  if (checks[0].pass === false || checks[1].pass === false) return 'Not a packet';
  if (checks[2].pass === false) return 'Bad checksum';
  if (checks[3].pass === false) return 'Servo reports an error';
  return 'Valid reading';
}

// The field that decided the class: the first failed check, or the data bytes of a valid reading.
function decidingField(b) {
  const failed = runChecks(b).find(c => c.pass === false);
  return failed ? failed.field : 'data';
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Status Packet Decoder', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  boxes = [];
  if (mode === 'explore') drawExplore(); else drawReplies();
  updateCursor();
}

// ---------------------------------------------------------------------------
// Explore mode: reply 1 with clickable bytes
// ---------------------------------------------------------------------------
function drawExplore() {
  const r = REPLIES[0];
  txt('Sample reply: ' + r.asked.toLowerCase(), canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  drawBytes(r.bytes, 74, null);
  const line = panel(128, drawHeight - 136);
  if (selected < 0) {
    line('Click a byte to see which field it is.', 'black', 18, true);
  } else {
    const info = exploreInfo(r.bytes, fieldOf(selected, r.bytes.length));
    line(info[0], COL_SELECT, 18, true);
    line(info[1], 'black', 16, false);
  }
  drawCheckList(line);
}

// Field name and meaning for the sample reply, with the values worked out.
function exploreInfo(b, f) {
  const n = b.length, data = b.slice(5, n - 1), value = data.reduce((a, x, i) => a + (x << (8 * i)), 0);
  const sum = b.slice(2, n - 1).reduce((a, x) => a + x, 0);
  if (f === 'header') return ['Header: FF FF', 'Every packet starts with these two bytes. They say that a message starts here.'];
  if (f === 'id') return ['ID: ' + hex2(b[2]), 'Servo ' + b[2] + ' is answering.'];
  if (f === 'length') return ['Length: ' + hex2(b[3]), 'The number of data bytes plus 2. Here that is ' + data.length + ' + 2 = ' + b[3] + '. It also equals all ' + n + ' bytes minus 4.'];
  if (f === 'error') return ['Error byte: ' + hex2(b[4]), '0 means the servo is operating normally. Any other value reports a fault.'];
  if (f === 'data') return ['Data: ' + data.map(hex2).join(' '), 'Low byte first, so the value is 0x' + hex2(data[1]) + hex2(data[0]) + ' = ' + value + ' steps. ' + value + ' / 4096 × 360 is about ' + (value / 4096 * 360).toFixed(1) + ' degrees.'];
  return ['Checksum: ' + hex2(b[n - 1]), 'Add from the ID to the last data byte: 0x' + hex2(sum & 0xFF) + '. Flip every bit: 0x' + hex2(expectedChecksum(b)) + '. It matches, so the reply was not damaged.'];
}

// Field name and the rule to check, without giving the answer away.
function askInfo(f) {
  if (f === 'header') return ['Header', 'Both header bytes must be FF.'];
  if (f === 'id') return ['ID', 'The servo that is answering.'];
  if (f === 'length') return ['Length', 'It must equal the number of bytes in the reply minus 4.'];
  if (f === 'error') return ['Error byte', '0 means the servo reports no fault.'];
  if (f === 'data') return ['Data', 'The value that was asked for, low byte first.'];
  return ['Checksum', 'Add from the ID to the last data byte, keep the low byte and flip every bit. It must match.'];
}

function drawCheckList(line) {
  line('A valid reading passes four checks, in this order:', 'black', 16, true);
  line('1. Header: the first two bytes are FF FF.', 'black', 16, false);
  line('2. Length: the byte count minus 4.', 'black', 16, false);
  line('3. Checksum: it matches your own.', 'black', 16, false);
  line('4. Error byte: it is 0.', 'black', 16, false);
  line('The first check that fails decides the class.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Six replies
// ---------------------------------------------------------------------------
function drawReplies() {
  const score = 'Correct: ' + correctCount + ' of ' + REPLIES.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 200);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + REPLIES.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + REPLIES.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, narrow ? 52 : 30);
    line('Remember the order: header, length, checksum, error byte. A reply that looks like data can still fail.', 'black', 16, false);
    return;
  }
  const r = REPLIES[idx];
  txt('Reply ' + (idx + 1) + ' of ' + REPLIES.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  txt('Question asked: ' + r.asked, canvasWidth / 2, 64, 'black', CENTER, TOP, 16, false);
  drawBytes(r.bytes, 90, phase === 'feedback' ? decidingField(r.bytes) : null);
  const line = panel(144, drawHeight - 152);
  if (phase === 'feedback') {
    const msg = lastRight ? 'Correct: ' + r.cls + '. ' + r.why : 'Not quite. This is ' + r.cls + '. ' + r.why;
    line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true);
    let k = 1;
    for (const c of runChecks(r.bytes)) {
      line(k++ + '. ' + c.text, c.pass === null ? 'gray' : (c.pass ? 'darkgreen' : 'firebrick'), 16, false);
    }
    return;
  }
  if (selected >= 0) {
    const info = askInfo(fieldOf(selected, r.bytes.length));
    line(info[0] + ': ' + hex2(r.bytes[selected]), COL_SELECT, 18, true);
    line(info[1], 'black', 16, false);
  } else {
    line('Which class is this reply? Choose one, then press Check.', 'black', 16, true);
    line('Click a byte to see its field. You get one try for each reply.', 'dimgray', 16, false);
  }
  drawCheckList(line);
}

// ---------------------------------------------------------------------------
// Shared drawing
// ---------------------------------------------------------------------------
// The reply as a row of byte boxes. mark names the field to outline after a commit.
function drawBytes(b, y, mark) {
  const n = b.length, gap = 4;
  const bw = Math.min(64, (canvasWidth - 20 - gap * (n - 1)) / n), bh = 42;
  let x = (canvasWidth - (n * bw + (n - 1) * gap)) / 2;
  const selField = selected >= 0 ? fieldOf(selected, n) : null;
  for (let i = 0; i < n; i++) {
    const f = fieldOf(i, n);
    const isSel = selField === f, isMark = mark === f;
    const markCol = mark === 'data' ? COL_GOOD : COL_BAD;
    fill(isMark ? (mark === 'data' ? '#d8f0dd' : '#f9d6d2') : (isSel ? '#d6e8f8' : COL_BOX));
    stroke(isMark ? markCol : (isSel ? COL_SELECT : 60)); strokeWeight(isMark || isSel ? 3 : 1);
    rect(x, y, bw, bh, 5);
    txt(hex2(b[i]), x + bw / 2, y + bh / 2, 'black', CENTER, CENTER, narrow ? 18 : 20, true);
    boxes.push({ x, y, w: bw, h: bh, i });
    x += bw + gap;
  }
}

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
// Interaction
// ---------------------------------------------------------------------------
function boxAt(px, py) { return boxes.find(b => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h); }

function mousePressed() {
  if (mode === 'replies' && phase !== 'ask') return;
  const hit = boxAt(mouseX, mouseY);
  if (hit) selected = (selected === hit.i ? -1 : hit.i);
}

function updateCursor() {
  const clickable = !(mode === 'replies' && phase !== 'ask');
  cursor(clickable && boxAt(mouseX, mouseY) ? HAND : ARROW);
}

function choose(i) {
  if (mode !== 'replies' || phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const perRow = narrow ? 2 : 4, gap = 8;
  const w = (canvasWidth - 20 - gap * (perRow - 1)) / perRow;
  classBtns.forEach((b, i) => {
    b.position(10 + (i % perRow) * (w + gap), drawHeight + (i < perRow ? ROW2 : ROW3));
    b.size(w, 30);
  });
}

function setMode(m) {
  mode = m;
  selected = -1;
  if (m === 'replies') startReplies();
  refreshControls();
}

function startReplies() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; selected = -1; }

function refreshControls() {
  const quiz = mode === 'replies' && phase !== 'done';
  classBtns.forEach((b, i) => {
    if (!quiz) { b.hide(); return; }
    b.show();
    const right = CLASSES[i] === REPLIES[idx].cls;
    let bg = '', weight = 'normal';
    if (phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (right) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (mode === 'explore') { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === REPLIES.length - 1 ? 'See score' : 'Next reply');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'replies') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = CLASSES[chosen] === REPLIES[idx].cls;
    if (lastRight) correctCount++;
    selected = -1;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < REPLIES.length - 1) { idx++; phase = 'ask'; chosen = -1; selected = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startReplies();
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
