// Actuator Type Matcher - p5.js MicroSim
// CANVAS_HEIGHT: 540
// Learning objective (Understand, classify): classify eight descriptions of an actuator as a hobby servo, a serial
// bus servo or a brushless CAN actuator, with at least 7 of 8 correct on the first attempt.
// Evidence: the family chosen and committed with Check for each description. Reading the comparison table in
// Explore mode is exploration, not evidence.
// The table is the three-family comparison from Chapter 5. The $13.89 price is from the SO-ARM100 bill of materials
// and the 24 V and 48 V supplies are from the reBot-DevArm repository.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 440;
let controlHeight = 100;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const FAMILIES = ['Hobby servo', 'Serial bus servo', 'Brushless CAN actuator'];

// the chapter's comparison table: one value for each family, in the order of FAMILIES
const ROWS = [
  { key: 'example', label: 'Example', cells: ['MG995', 'STS3215 (SO-ARM101)', 'Damiao DM4310 or RobStride RS00 (reBot-DevArm)'] },
  { key: 'command', label: 'How you command it', cells: ['A pulse width on one signal wire', 'Packets on a shared serial bus', 'Frames on a CAN bus'] },
  { key: 'feedback', label: 'What it reports back', cells: ['Nothing your program can read', 'Position, speed, load, current, voltage, temperature', 'Position, speed, torque, temperatures'] },
  { key: 'voltage', label: 'Supply voltage', cells: ['About 5 to 6 V', '5 to 12 V', '24 V or 48 V'] },
  { key: 'cost', label: 'Cost of one', cells: ['Not used in either arm', '$13.89', '$120 to $210'] }
];

// the eight descriptions, in fixed order. family is the answer key; row is the matching row of the table.
const ITEMS = [
  { text: 'Its command is a pulse of 1.5 ms sent every 20 ms.', family: 'Hobby servo', row: 'command',
    why: 'The command is a pulse width, which is the PWM signal of a hobby servo.' },
  { text: 'Each motor on the three-wire daisy chain has an ID, and the program can read its position, load and temperature.',
    family: 'Serial bus servo', row: 'feedback', why: 'A shared digital bus with IDs and readable registers is a serial bus servo.' },
  { text: 'It accepts MIT-mode frames with a position, a speed, Kp, Kd and a feed-forward torque.', family: 'Brushless CAN actuator', row: 'command',
    why: 'MIT mode is the Damiao actuators’ control mode over CAN.' },
  { text: 'Your program has no way to read how far it has turned.', family: 'Hobby servo', row: 'feedback',
    why: 'The potentiometer feedback stays inside the case.' },
  { text: 'It is listed at $13.89 each in the SO-ARM100 bill of materials.', family: 'Serial bus servo', row: 'cost',
    why: 'That is the STS3215 price.' },
  { text: 'It runs from a 24 V or 48 V supply.', family: 'Brushless CAN actuator', row: 'voltage',
    why: 'The reBot-DevArm’s actuators run at 24 V (B601-DM) or 48 V (B601-RS).' },
  { text: 'It has a 12-bit magnetic encoder and a 1/345 gearbox.', family: 'Serial bus servo', row: 'example',
    why: 'Those are the STS3215’s encoder and the follower’s gear ratio.' },
  { text: 'It is a low-cost servo with one signal wire and no ID, and the MG995 is an example.', family: 'Hobby servo', row: 'command',
    why: 'One signal wire per servo and no address are properties of a hobby servo.' }
];
const MASTERY = 7;

const COL_PICK = '#ffe49a', COL_RIGHT = '#bfe5c7', COL_WRONG = '#f5b7b1';

// controls
let modeSelect, actionBtn, familyBtns = [];

// state
let mode = 'explore';          // 'explore' or 'items'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false;
let chosen = -1;               // index into FAMILIES: the answer picked, or the column shown in Explore

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Eight descriptions', 'items');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  FAMILIES.forEach((name, i) => {
    const b = createButton(name);
    b.mouseClicked(() => choose(i));
    familyBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A comparison table of three families of actuator: hobby servo, serial bus servo and brushless CAN ' +
    'actuator, with their example, command method, feedback, supply voltage and cost. A second mode shows eight ' +
    'short descriptions and three buttons to choose the family that each one fits.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Actuator Type Matcher', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawItems();
}

// ---------------------------------------------------------------------------
// Explore mode: the comparison table (one family at a time on a narrow screen)
// ---------------------------------------------------------------------------
function drawExplore() {
  txt('Read the table, then try the descriptions.', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  if (narrow) drawFamilyCard(chosen < 0 ? 0 : chosen, 68); else drawTable(68, chosen);
}

// The full table: a label column and one column for each family. highlight is a family index or -1.
function drawTable(top, highlight) {
  const x = 8, w = canvasWidth - 16, labelW = 150, colW = (w - labelW) / 3, pad = 8;
  // measure the rows
  const heights = ROWS.map(r => Math.max(...r.cells.map(c => wrap(c, colW - 2 * pad, 16, false).length), wrap(r.label, labelW - 2 * pad, 16, true).length) * 21 + 10);
  const headH = Math.max(...FAMILIES.map(f => wrap(f, colW - 2 * pad, 16, true).length)) * 21 + 10;
  const total = headH + heights.reduce((a, b) => a + b, 0);
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, total, 8);
  if (highlight >= 0) { fill(COL_PICK); noStroke(); rect(x + labelW + highlight * colW, top + 1, colW, total - 2); }
  FAMILIES.forEach((f, i) => para(f, x + labelW + i * colW + pad, top + 6, colW - 2 * pad, 'black', 16, true));
  let y = top + headH;
  ROWS.forEach((r, k) => {
    stroke(210); strokeWeight(1); line(x, y, x + w, y);
    para(r.label, x + pad, y + 5, labelW - 2 * pad, 'black', 16, true);
    r.cells.forEach((c, i) => para(c, x + labelW + i * colW + pad, y + 5, colW - 2 * pad, 'black', 16, false));
    y += heights[k];
  });
  stroke(210); strokeWeight(1);
  for (let i = 0; i < 3; i++) line(x + labelW + i * colW, top, x + labelW + i * colW, top + total);
  noFill(); stroke(200); rect(x, top, w, total, 8);
  if (highlight < 0) txt('Press a family button to highlight its column.', canvasWidth / 2, top + total + 16, 'dimgray', CENTER, CENTER, 16, false);
}

// One family's column as a card, for narrow screens.
function drawFamilyCard(f, top) {
  const line = panel(top, drawHeight - top - 8);
  line(FAMILIES[f], 'black', 18, true);
  for (const r of ROWS) line(r.label + ': ' + r.cells[f], 'black', 16, false);
  line('Press a family button to see the other two.', 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Eight descriptions
// ---------------------------------------------------------------------------
function drawItems() {
  const score = 'Correct: ' + correctCount + ' of ' + ITEMS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 200);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + ITEMS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + ITEMS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Ask four questions of any actuator: how is it commanded, what does it report, what voltage does it need, and what does it cost?', 'black', 16, false);
    return;
  }
  const it = ITEMS[idx];
  txt('Description ' + (idx + 1) + ' of ' + ITEMS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const x = 8, w = canvasWidth - 16, top = 68;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, drawHeight - top - 8, 10);
  let y = top + 10;
  y += para(it.text, x + 12, y, w - 24, 'black', 18, true) + 10;
  if (phase === 'ask') {
    para('Which family is it? Choose one, then press Check. You get one try for each description.', x + 12, y, w - 24, 'dimgray', 16, false);
    return;
  }
  const lower = it.family.charAt(0).toLowerCase() + it.family.slice(1);
  const msg = lastRight ? 'Correct: ' + it.family + '. ' + it.why : 'Not quite. This is a ' + lower + '. ' + it.why;
  y += para(msg, x + 12, y, w - 24, lastRight ? 'darkgreen' : 'firebrick', 16, true) + 12;

  // the matching row of the comparison table
  const row = ROWS.find(r => r.key === it.row), right = FAMILIES.indexOf(it.family);
  stroke(210); strokeWeight(1); line(x + 12, y - 5, x + w - 12, y - 5);
  y += para('From the table: ' + row.label.charAt(0).toLowerCase() + row.label.slice(1), x + 12, y, w - 24, 'black', 16, true) + 4;
  row.cells.forEach((c, i) => {
    const s = FAMILIES[i] + ': ' + c;
    const h = wrap(s, w - 40, 16, i === right).length * 21;
    if (i === right) { fill(COL_RIGHT); noStroke(); rect(x + 12, y - 2, w - 24, h + 4, 5); }
    y += para(s, x + 20, y, w - 40, 'black', 16, i === right) + 6;
  });
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
const ROW1 = 8, ROW_BTN = 48, BTN_H = 42;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 160 : 180);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const gap = 8, w = (canvasWidth - 20 - gap * 2) / 3;
  familyBtns.forEach((b, i) => { b.position(10 + i * (w + gap), drawHeight + ROW_BTN); b.size(w, BTN_H); });
}

function choose(i) {
  if (mode === 'explore') { chosen = (chosen === i && !narrow ? -1 : i); refreshControls(); return; }
  if (phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  chosen = -1;
  if (m === 'items') startItems();
  refreshControls();
}

function startItems() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const show = mode === 'explore' || phase !== 'done';
  const shown = mode === 'explore' && narrow && chosen < 0 ? 0 : chosen;
  familyBtns.forEach((b, i) => {
    if (!show) { b.hide(); return; }
    b.show();
    let bg = '', weight = 'normal';
    if (mode === 'explore' || phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === shown) { bg = COL_PICK; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (FAMILIES[i] === ITEMS[idx].family) { bg = COL_RIGHT; weight = 'bold'; } else if (i === chosen) { bg = COL_WRONG; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (mode === 'explore') { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === ITEMS.length - 1 ? 'See score' : 'Next');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'items') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = FAMILIES[chosen] === ITEMS[idx].family;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startItems();
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
  refreshControls();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  narrow = canvasWidth < 640;
}
