// UART Frame Timeline - p5.js MicroSim
// CANVAS_HEIGHT: 620
// Learning objective (Apply, calculate): calculate the time to send a given number of bytes at a given baud rate
// using 8N1 framing, to within 1 percent, in five problems, with at least 4 of 5 correct on the first attempt.
// Evidence: the time typed and committed with Check in each problem. Explore mode is exploration, not evidence.
// Model: time (s) = bytes x 10 / baud. Each byte is one start bit, eight data bits and one stop bit (8N1).
// The times are time on the wire only. USB and software delays are not included.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the eight STS3215 baud rates from the chapter's table (codes 0 to 7)
const BAUDS = [1000000, 500000, 250000, 128000, 115200, 57600, 38400, 19200];
const REF_BAUD = 1000000;

// the three example packets from the chapter
const PACKETS = [
  { name: 'Ping request', bytes: ['FF', 'FF', '01', '02', '01', 'FB'] },
  { name: 'Position-read request', bytes: ['FF', 'FF', '01', '04', '02', '38', '02', 'BE'] },
  { name: 'Position-read reply', bytes: ['FF', 'FF', '01', '04', '00', '18', '05', 'DD'] }
];

// the five problems, in fixed order. The correct value is computed from bytes x 10 / baud.
const PROBLEMS = [
  { text: 'Send one ping request', bytes: 6, baud: 1000000, unit: 'µs', answer: '60 µs',
    why: '6 × 10 / 1,000,000 = 60 µs.' },
  { text: 'One position read, request plus reply', bytes: 16, baud: 1000000, unit: 'µs', answer: '160 µs',
    why: '16 × 10 / 1,000,000 = 160 µs.' },
  { text: 'The same position read', bytes: 16, baud: 115200, unit: 'ms', answer: '1.39 ms',
    why: '16 × 10 / 115,200 = 1.389 ms.' },
  { text: 'Read all six servos’ positions, one at a time', bytes: 96, baud: 1000000, unit: 'µs', answer: '960 µs',
    why: '6 reads × 16 bytes = 96 bytes; 96 × 10 / 1,000,000 = 960 µs.' },
  { text: 'The same six reads', bytes: 96, baud: 57600, unit: 'ms', answer: '16.67 ms',
    why: '96 × 10 / 57,600 = 16.667 ms.' }
];
const MASTERY = 4;
const TOLERANCE = 0.01;          // an answer within 1 percent is correct
const ANSWER_MIN = 0, ANSWER_MAX = 1000;

const COL_START = '#e07b00', COL_DATA = '#a9cdee', COL_STOP = '#2e8b57';

// controls
let modeSelect, actionBtn, baudSelect, packetSelect, answerInput;

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
  modeSelect.option('Problems', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  baudSelect = createSelect();
  for (const b of BAUDS) baudSelect.option(commas(b), String(b));
  baudSelect.selected(String(REF_BAUD));

  packetSelect = createSelect();
  PACKETS.forEach((p, i) => packetSelect.option(p.name + ' (' + p.bytes.length + ' bytes)', String(i)));
  packetSelect.selected('0');

  answerInput = createInput('', 'number');
  answerInput.attribute('min', String(ANSWER_MIN));
  answerInput.attribute('max', String(ANSWER_MAX));
  answerInput.attribute('step', '0.01');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.elt.addEventListener('keydown', (e) => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('A time line of serial bytes. Each byte is drawn as ten bits: an orange start bit, eight blue data bits ' +
    'and a green stop bit. Menus choose the baud rate and the packet, and the total time to send the packet is ' +
    'written beneath. A Problems mode asks five timing questions.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function seconds(numBytes, baud) { return numBytes * 10 / baud; }
function inUnit(s, unit) { return unit === 'ms' ? s * 1e3 : s * 1e6; }
function commas(n) { return n.toLocaleString('en-US'); }
function fmtUs(us) { return us.toLocaleString('en-US', { maximumFractionDigits: 1 }); }
function fmtMs(ms) { return ms.toLocaleString('en-US', { maximumFractionDigits: 2 }); }
function fmtMain(s) { return s * 1e6 < 1000 ? fmtUs(s * 1e6) + ' µs' : fmtMs(s * 1e3) + ' ms'; }
function fmtBoth(s) {
  return s * 1e6 < 1000 ? fmtUs(s * 1e6) + ' µs (' + fmtMs(s * 1e3) + ' ms)'
    : fmtMs(s * 1e3) + ' ms (' + fmtUs(s * 1e6) + ' µs)';
}
function exploreBaud() { return Number(baudSelect.value()); }
function explorePacket() { return PACKETS[Number(packetSelect.value())]; }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('UART Frame Timeline', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawProblems();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const p = explorePacket(), baud = exploreBaud(), n = p.bytes.length;
  const t = seconds(n, baud), tRef = seconds(n, REF_BAUD);
  txt(p.name + ': ' + n + ' bytes at ' + commas(baud) + ' baud', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const bottom = drawFrames(n, p.bytes, 66);
  drawLegend(bottom + 8);
  txt('Total: ' + n * 10 + ' bits = ' + fmtBoth(t), canvasWidth / 2, bottom + 36, 'black', CENTER, TOP, narrow ? 16 : 18, true);

  // the same packet at the fastest rate and at the chosen rate, on one time scale
  const x = 20, w = canvasWidth - 40, y = bottom + 66;
  const scale = w / Math.max(t, tRef);
  txt('At 1,000,000 baud: ' + fmtMain(tRef), x, y, 'black', LEFT, TOP, 16, false);
  fill('gray'); noStroke(); rect(x, y + 22, Math.max(3, tRef * scale), 10);
  txt('At ' + commas(baud) + ' baud: ' + fmtMain(t), x, y + 38, 'black', LEFT, TOP, 16, false);
  fill('steelblue'); noStroke(); rect(x, y + 60, Math.max(3, t * scale), 10);

  // info panel
  const top = y + 80, h = drawHeight - top - 8;
  const line = panel(top, h);
  line('Time = bytes × 10 / baud = ' + n + ' × 10 / ' + commas(baud) + ' = ' + fmtMain(t), 'black', 16, true, narrow ? 44 : 24);
  line('One bit lasts ' + fmtMs(1e6 / baud) + ' µs. A slower baud rate makes every bit longer, but a byte is always 10 bits.',
    'black', 16, false, narrow ? 64 : 24);
  if (!narrow) line('The start bit pulls the line low to wake the receiver. The stop bit returns it to rest.', 'black', 16, false, 24);
  line('Wire time only. USB and software delays are extra.', 'dimgray', 16, false, narrow ? 44 : 24);
}

// ---------------------------------------------------------------------------
// Problems mode
// ---------------------------------------------------------------------------
function drawProblems() {
  const score = 'Correct: ' + correctCount + ' of ' + PROBLEMS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 190);
    line(score, 'black', 20, true, 34);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, narrow ? 52 : 30);
    line('Remember: every byte is 10 bits on the wire, so time = bytes × 10 / baud.', 'black', 16, false, 48);
    line('Switch to Explore to try other baud rates.', 'dimgray', 16, false, 24);
    return;
  }
  const q = PROBLEMS[idx];
  txt('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const bottom = drawFrames(q.bytes, null, 66);
  drawLegend(bottom + 8);
  const shown = phase === 'feedback' ? q.answer : '? ' + q.unit;
  txt('Total: ' + q.bytes * 10 + ' bits = ' + shown, canvasWidth / 2, bottom + 36, 'black', CENTER, TOP, narrow ? 16 : 18, true);

  const top = bottom + 66, h = drawHeight - top - 8;
  const line = panel(top, h);
  line(q.text + ': ' + q.bytes + ' bytes at ' + commas(q.baud) + ' baud. How long does it take, in ' + q.unit + '?',
    'black', 16, true, narrow ? 66 : 46);
  if (phase === 'feedback') {
    const msg = lastRight ? 'Correct: ' + q.answer + '. ' + q.why
      : 'Not quite. Each byte is 10 bits, so the time is ' + q.answer + '. ' + q.why;
    line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, false, narrow ? 110 : 66);
  } else {
    line('Type the time and press Check. You get one try for each problem.', 'dimgray', 16, false, narrow ? 44 : 24);
    if (!narrow) line('Wire time only. USB and software delays are extra.', 'dimgray', 16, false, 24);
  }
}

// ---------------------------------------------------------------------------
// The frames: every byte is a start bit, eight data bits and a stop bit
// ---------------------------------------------------------------------------
// Draws n frames starting at y and returns the y of the bottom edge.
function drawFrames(n, labels, y) {
  const x = 20, w = canvasWidth - 40;
  let perRow;
  if (n <= 8) perRow = narrow ? Math.ceil(n / 2) : n;
  else if (n <= 16) perRow = narrow ? 8 : 16;
  else perRow = 16;
  const rows = Math.ceil(n / perRow);
  const gap = perRow <= 8 ? 6 : (narrow ? 2 : 4);
  const fw = (w - gap * (perRow - 1)) / perRow;
  const bw = fw / 10;
  const labelH = labels ? 20 : 0;
  const cellH = rows <= 2 ? (narrow ? 34 : 60) : (narrow ? 18 : 22);
  const pitch = labelH + cellH + (rows <= 2 ? 10 : 6);
  for (let i = 0; i < n; i++) {
    const fx = x + (i % perRow) * (fw + gap);
    const fy = y + Math.floor(i / perRow) * pitch + labelH;
    if (labels) txt(labels[i], fx + fw / 2, fy - 3, 'black', CENTER, BOTTOM, 16, false);
    noStroke();
    fill(COL_DATA); rect(fx, fy, fw, cellH);
    fill(COL_START); rect(fx, fy, bw, cellH);
    fill(COL_STOP); rect(fx + fw - bw, fy, bw, cellH);
    if (bw >= 6) {                      // room to show the ten separate bits
      stroke(90); strokeWeight(1);
      for (let b = 1; b < 10; b++) line(fx + b * bw, fy, fx + b * bw, fy + cellH);
    }
    noFill(); stroke(40); strokeWeight(1);
    rect(fx, fy, fw, cellH);
  }
  return y + rows * pitch - (rows <= 2 ? 10 : 6);
}

function drawLegend(y) {
  const items = [[COL_START, '1 start bit'], [COL_DATA, '8 data bits'], [COL_STOP, '1 stop bit']];
  const itemW = narrow ? 112 : 140;
  let x = canvasWidth / 2 - (itemW * 3) / 2;
  for (const [col, label] of items) {
    fill(col); stroke(40); strokeWeight(1);
    rect(x, y + 2, 14, 14);
    txt(label, x + 19, y + 10, 'black', LEFT, CENTER, 16, false);
    x += itemW;
  }
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
const ROW1 = 8, ROW2 = 46, ROW3 = 84;
const LABEL_W = 96;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  baudSelect.position(LABEL_W, drawHeight + ROW2);
  baudSelect.size(130);
  packetSelect.position(LABEL_W, drawHeight + ROW3);
  packetSelect.size(Math.min(260, canvasWidth - LABEL_W - 10));
  answerInput.position(170, drawHeight + ROW2);
  answerInput.size(90);
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt('Baud rate:', 10, drawHeight + ROW2 + 11, 'black');
    txt('Packet:', 10, drawHeight + ROW3 + 11, 'black');
    return;
  }
  if (phase === 'done') return;
  txt('Your answer (' + PROBLEMS[idx].unit + '):', 10, drawHeight + ROW2 + 11, 'black');
  if (notice) txt(notice, 10, drawHeight + ROW3 + 11, 'firebrick');
}

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
  if (mode === 'explore') {
    actionBtn.hide(); answerInput.hide();
    baudSelect.show(); packetSelect.show();
    return;
  }
  baudSelect.hide(); packetSelect.hide();
  actionBtn.show();
  if (phase === 'done') { actionBtn.html('Try again'); answerInput.hide(); return; }
  answerInput.show();
  if (phase === 'ask') {
    actionBtn.html('Check');
    answerInput.removeAttribute('disabled');
  } else {
    actionBtn.html(idx === PROBLEMS.length - 1 ? 'See score' : 'Next problem');
    answerInput.attribute('disabled', '');
  }
}

function onAction() {
  if (mode !== 'problems') return;
  if (phase === 'ask') {
    const raw = String(answerInput.value()).trim();
    const typed = Number(raw);
    if (raw === '' || !Number.isFinite(typed) || typed < ANSWER_MIN || typed > ANSWER_MAX) {
      notice = 'Type a number from ' + ANSWER_MIN + ' to ' + ANSWER_MAX + ' first.';
      return;
    }
    notice = '';
    const q = PROBLEMS[idx];
    const correct = inUnit(seconds(q.bytes, q.baud), q.unit);
    lastRight = Math.abs(typed - correct) / correct <= TOLERANCE + 1e-9;
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
