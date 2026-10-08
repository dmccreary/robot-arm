// Bus Fault Finder - p5.js MicroSim
// CANVAS_HEIGHT: 620
// Learning objective (Analyze, differentiate): differentiate six causes of serial bus failure by choosing the most
// likely cause for each of eight symptom reports, with at least 6 of 8 correct on the first attempt.
// Evidence: the cause chosen and committed with Check for each report. Reading the cause list in Explore mode is
// exploration, not evidence.
// The reports are illustrative and were written from the chapter's table of communication errors. The garbage bytes
// in report 3 are invented and are labeled "illustrative".
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 160;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the six causes with their typical signs (from the chapter's table of communication errors)
const CAUSES = [
  { name: 'Wrong port', sign: 'The port will not open, or it is the wrong one.',
    looks: 'An error that the port does not exist, or silence on a port that belongs to another adapter.',
    fix: 'Run list_ports and use the port name it shows for this arm.' },
  { name: 'No motor power', sign: 'The port opens, but every ID is silent.',
    looks: 'A scan returns nothing and no bytes arrive at all. USB carries data only.',
    fix: 'Check the barrel-jack supply, its switch and its plug.' },
  { name: 'Baud rate mismatch', sign: 'Bytes arrive, but they are garbage.',
    looks: 'Bytes with no FF FF header, such as 00 FE 80 00 F8 (illustrative).',
    fix: 'Set the port to the motors’ baud rate, 1,000,000 by default.' },
  { name: 'Duplicate ID', sign: 'One ID gives mixed-up replies.',
    looks: 'A ping to one ID is sometimes good and sometimes fails its checksum, because two servos answer at once.',
    fix: 'Connect one motor at a time and give each its own ID.' },
  { name: 'Broken chain link', sign: 'The first IDs answer and the rest are silent.',
    looks: 'A scan finds IDs 1, 2 and 3 but never 4, 5 or 6.',
    fix: 'Reseat the cable just before the first silent motor.' },
  { name: 'Noise or missing ground', sign: 'Now and then a reply fails its checksum.',
    looks: 'Most reads are good, but some fail at random, on any ID.',
    fix: 'Shorten the cable, reseat the plugs and join the grounds.' }
];

// the eight reports, in fixed order. cause is the answer key.
const REPORTS = [
  { text: 'The program raises an error that the port /dev/ttyACM1 does not exist. list_ports shows only /dev/ttyACM0.',
    scan: 'not run, because the port did not open', bytes: 'none',
    cause: 'Wrong port', why: 'The port named in the program is not the one the computer sees.',
    clue: 'list_ports shows only /dev/ttyACM0.' },
  { text: 'The port opens and the adapter is listed by the computer. A scan of IDs 1 to 6 returns nothing, and the barrel-jack supply is switched off.',
    scan: 'IDs 1 to 6, no answers', bytes: 'none',
    cause: 'No motor power', why: 'USB carries data only, and the motors need their own supply.',
    clue: 'the barrel-jack supply is switched off.' },
  { text: 'A scan of IDs 1 to 6 returns nothing. The bytes received after each ping are 00 FE 80 00 F8, and the motors have power. The port is open at 115,200 baud.',
    scan: 'IDs 1 to 6, no valid replies', bytes: '00 FE 80 00 F8 (illustrative)',
    cause: 'Baud rate mismatch', why: 'The motors answer at 1,000,000 baud, so the reply is read as garbage.',
    clue: 'bytes arrive but are not a packet, and the port is at 115,200 baud.' },
  { text: 'A scan finds IDs 1, 2 and 3 only. IDs 4, 5 and 6 never answer, and a cable between motors 3 and 4 is half unplugged.',
    scan: 'IDs 1, 2 and 3 answer. IDs 4, 5 and 6 are silent', bytes: 'good replies from 1, 2 and 3',
    cause: 'Broken chain link', why: 'Everything after the break is silent, and everything before it answers.',
    clue: 'the silence starts at motor 4, just after the loose cable.' },
  { text: 'A ping to ID 2 sometimes gets a good reply and sometimes one that fails its checksum. Two motors are on the bus, and both are set to ID 2.',
    scan: 'only ID 2 answers', bytes: 'some replies good, some with a bad checksum',
    cause: 'Duplicate ID', why: 'Two servos answered together and their replies overlapped.',
    clue: 'both motors are set to ID 2.' },
  { text: 'Pings succeed, but about one read in five fails its checksum. The cable to the motors is long, and the controller and the motors run from different supplies whose grounds are not joined.',
    scan: 'every ID answers', bytes: 'about one read in five has a bad checksum',
    cause: 'Noise or missing ground', why: 'Poor grounding and long wires corrupt bits at random.',
    clue: 'a long cable, and grounds that are not joined.' },
  { text: 'A scan on /dev/ttyACM0 returns nothing although the arm is powered. The follower’s adapter is the second entry in list_ports, /dev/ttyACM1.',
    scan: 'IDs 1 to 6 on /dev/ttyACM0, no answers', bytes: 'none',
    cause: 'Wrong port', why: 'The script opened the other adapter’s port.',
    clue: 'the follower’s adapter is /dev/ttyACM1, not /dev/ttyACM0.' },
  { text: 'All six motors stay silent. The supply’s label reads 5 V, and the supply’s plug is in the wall, but its barrel jack is not in the board.',
    scan: 'IDs 1 to 6, no answers', bytes: 'none',
    cause: 'No motor power', why: 'The supply is not connected to the board, so the motors have no power.',
    clue: 'the barrel jack is not in the board.' }
];
const MASTERY = 6;

// controls
let modeSelect, actionBtn, causeBtns = [];

// state
let mode = 'explore';          // 'explore' or 'reports'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;
let chosen = -1;               // index into CAUSES: the answer picked, or the cause shown in Explore

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Eight reports', 'reports');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  CAUSES.forEach((c, i) => {
    const b = createButton(c.name);
    b.mouseClicked(() => choose(i));
    causeBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A troubleshooting exercise for a servo bus. Explore mode lists six causes of failure and their typical ' +
    'signs. A second mode shows eight symptom reports, each with a scan result and the bytes received, and six ' +
    'buttons to choose the most likely cause.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Bus Fault Finder', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawReports();
}

// ---------------------------------------------------------------------------
// Explore mode: the six causes and their typical signs
// ---------------------------------------------------------------------------
function drawExplore() {
  const x = 18, w = canvasWidth - 36;
  let y = 40;
  y += para('Read the evidence, then choose the most likely cause.', x, y, w, 'black', 16, true) + 8;
  const rowH = 27;
  CAUSES.forEach((c, i) => {
    if (i === chosen) { fill('#ffe49a'); stroke(190); strokeWeight(1); rect(10, y - 3, canvasWidth - 20, rowH - 1, 5); }
    txt(c.name, x, y, 'black', LEFT, TOP, 16, true);
    if (!narrow) txt(c.sign, x + 220, y, 'black', LEFT, TOP, 16, false);
    y += rowH;
  });
  const top = y + 6;
  const line = panel(top, drawHeight - top - 8);
  if (chosen < 0) {
    line('Press a cause button below to see what its evidence looks like and what to try first.', 'black', 16, false);
    line('Silence, garbage and a partial scan are three different clues. Each one points to a different part of the system.', 'dimgray', 16, false);
    return;
  }
  const c = CAUSES[chosen];
  line(c.name, 'black', 18, true);
  if (narrow) line('Typical sign: ' + c.sign, 'black', 16, false);
  line('The evidence looks like: ' + c.looks, 'black', 16, false);
  line('First thing to try: ' + c.fix, 'darkgreen', 16, false);
}

// ---------------------------------------------------------------------------
// Eight reports
// ---------------------------------------------------------------------------
function drawReports() {
  const score = 'Correct: ' + correctCount + ' of ' + REPORTS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 200);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + REPORTS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + REPORTS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Silence usually means the port, the power or the baud rate, not a broken motor. Let the bytes decide.', 'black', 16, false);
    return;
  }
  const r = REPORTS[idx];
  txt('Report ' + (idx + 1) + ' of ' + REPORTS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const x = 8, w = canvasWidth - 16, top = 68;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, drawHeight - top - 8, 10);
  let y = top + 8;
  y += para(r.text, x + 10, y, w - 20, 'black', 16, false) + 8;

  // the trace: scan result and raw bytes
  const tw = w - 40;
  const th = (wrap('Scan: ' + r.scan, tw, 16, false).length + wrap('Bytes received: ' + r.bytes, tw, 16, false).length) * 21 + 14;
  fill('#eef2f6'); stroke(185); strokeWeight(1);
  rect(x + 10, y, w - 20, th, 6);
  y += 6;
  y += para('Scan: ' + r.scan, x + 20, y, tw, '#1f3a5f', 16, false);
  y += para('Bytes received: ' + r.bytes, x + 20, y, tw, '#1f3a5f', 16, false) + 16;

  if (phase === 'ask') {
    para('Which cause is most likely? Choose one, then press Check. You get one try for each report.', x + 10, y, w - 20, 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + r.cause + '. ' + r.why : 'Not quite. The most likely cause is ' + r.cause + '. ' + r.why;
  y += para(msg, x + 10, y, w - 20, lastRight ? 'darkgreen' : 'firebrick', 16, true) + 6;
  para('The evidence that decides it: ' + r.clue, x + 10, y, w - 20, 'black', 16, false);
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

// Splits text into lines that fit in width w.
function wrap(s, w, size, bold) {
  textSize(size); textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let cur = '';
  for (const word of String(s).split(' ')) {
    const t = cur ? cur + ' ' + word : word;
    if (cur && textWidth(t) > w) { lines.push(cur); cur = word; } else cur = t;
  }
  lines.push(cur);
  textStyle(NORMAL);
  return lines;
}

// Draws word-wrapped text and returns its height, so that nothing overflows on a narrow screen.
function para(s, x, y, w, col, size, bold) {
  const lines = wrap(s, w, size, bold);
  const lead = Math.round(size * 1.3);
  noStroke(); fill(col || 'black'); textAlign(LEFT, TOP);
  textSize(size); textStyle(bold ? BOLD : NORMAL);
  lines.forEach((ln, i) => text(ln, x, y + i * lead));
  textStyle(NORMAL);
  return lines.length * lead;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW_BTN = 46, ROW_STEP = 38;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const perRow = narrow ? 2 : 3, gap = 8;
  const w = (canvasWidth - 20 - gap * (perRow - 1)) / perRow;
  causeBtns.forEach((b, i) => {
    b.position(10 + (i % perRow) * (w + gap), drawHeight + ROW_BTN + Math.floor(i / perRow) * ROW_STEP);
    b.size(w, 30);
  });
}

function choose(i) {
  if (mode === 'explore') { chosen = (chosen === i ? -1 : i); refreshControls(); return; }
  if (phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  chosen = -1;
  if (m === 'reports') startReports();
  refreshControls();
}

function startReports() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const show = mode === 'explore' || phase !== 'done';
  causeBtns.forEach((b, i) => {
    if (!show) { b.hide(); return; }
    b.show();
    let bg = '', weight = 'normal';
    if (mode === 'explore' || phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (CAUSES[i].name === REPORTS[idx].cause) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (mode === 'explore') { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === REPORTS.length - 1 ? 'See score' : 'Next report');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'reports') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = CAUSES[chosen].name === REPORTS[idx].cause;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < REPORTS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startReports();
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
