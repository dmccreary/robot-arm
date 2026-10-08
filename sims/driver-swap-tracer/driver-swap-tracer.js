// Driver Swap Tracer - p5.js MicroSim
// CANVAS_HEIGHT: 642
// Learning objective (Understand, interpret): interpret what a call on the Arm interface does underneath for each
// of three drivers, in six calls, by choosing the correct low-level action, with at least 5 of 6 correct on the
// first attempt. Evidence: the action committed for each call. Reading the layers in Explore mode is exploration,
// not evidence.
// The calls and values are from the Chapter 10 sections "Reading and Writing Positions" and "Inheritance for
// Drivers" and from its lab. The shoulder pan calibration (742 to 3242, middle 1992) is the illustrative one of
// the Chapter 8 lab. Rules: the limit check happens in the base class, before any driver method, and
// raw = round(1992 + degrees x 11.375) for that shoulder pan.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 520;
let controlHeight = 122;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const STEPS_PER_DEGREE = 4095 / 360, PAN_MIDDLE = (742 + 3242) / 2;     // 11.375 and 1992

// Explore: the same call, move_to with shoulder_pan = 10.0, traced through three drivers
const TOP_LAYERS = [
  { name: 'Your program', text: 'arm.move_to(pose), with shoulder_pan = 10.0', col: 'lightyellow' },
  { name: 'Arm interface: the same for every driver', text: 'Checks that the arm is connected and that 10.0 is inside the limits, −110 to 110. Then it calls the driver.', col: 'honeydew' }
];
const DRIVERS = [
  { name: 'FakeArm',
    driver: 'Keeps the value 10.0 as it is. There is nothing to convert.',
    bus: 'None. It stores the values in a dictionary and records the write.',
    hardware: 'None. Nothing moves, but a test can look at the record.' },
  { name: 'FeetechArm',
    driver: 'Converts 10 degrees to raw steps: 1992 + 10 × 11.375 = 2105.75, so 2106.',
    bus: 'write_register writes Goal_Position to servo 1 with raw 2106.',
    hardware: 'Servo 1 turns to step 2106.' },
  { name: 'DamiaoArm',
    driver: 'Converts 10 degrees to radians: 10 × π / 180 = 0.1745. It calls this joint joint1.',
    bus: 'pack_mit builds an MIT frame for CAN ID 0x01 with a position of about 0.175 rad.',
    hardware: 'Motor 1 turns to about 0.175 rad.' }
];
const LOWER_LAYERS = [
  { key: 'driver', name: 'Driver', col: 'lightcyan' },
  { key: 'bus', name: 'Bus functions', col: 'lavender' },
  { key: 'hardware', name: 'Hardware', col: 'gainsboro' }
];

const ACTIONS = [
  'Stores the values in a dictionary and records the write',
  'Writes Goal_Position to servo 1 with raw 2106',
  'Sends an MIT frame to CAN ID 0x01 with a position of about 0.175 rad',
  'Reads Present_Position from servo 1 and converts raw 2047 to degrees',
  'Sends an enable frame to CAN ID 0x01 and decodes the position in the reply',
  'Raises JointLimitError and sends nothing'
];
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

// six calls in fixed order; action is an index into ACTIONS
const CALLS = [
  { driver: 'FakeArm', call: 'arm.move_to(pose), with shoulder_pan = 10.0', action: 0,
    why: 'The fake arm has no hardware, so it keeps the values and a log of the writes.' },
  { driver: 'FeetechArm', call: 'arm.move_to(pose), with shoulder_pan = 10.0', action: 1,
    why: '1992 + 10 × 11.375 = 2105.75, which rounds to 2106.' },
  { driver: 'DamiaoArm', call: 'arm.move_to(pose), with joint1 = 10.0', action: 2,
    why: '10 degrees is 0.1745 radians, packed into the 16-bit position field.' },
  { driver: 'FeetechArm', call: 'arm.read_pose()', action: 3,
    why: 'The driver reads the raw steps and converts them: (2047 − 1992) / 11.375 = 4.84 degrees.' },
  { driver: 'DamiaoArm', call: 'arm.read_pose()', action: 4,
    why: 'Every reply carries a position, so the driver asks with an enable frame and decodes it.' },
  { driver: 'FeetechArm', call: 'arm.move_to(pose), with shoulder_pan = 140.0 (the limit is 110)', action: 5,
    why: 'The base class checks the limits first, so no driver code runs.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, driverSelect, choiceBtns = [];

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let shown = 1;                 // the driver picked in Explore mode
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore the layers', 'explore');
  modeSelect.option('Six calls', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next');
  actionBtn.mouseClicked(onAction);

  driverSelect = createSelect();
  DRIVERS.forEach((d, i) => driverSelect.option('Driver: ' + d.name, String(i)));
  driverSelect.selected(String(shown));
  driverSelect.changed(() => { shown = int(driverSelect.value()); });

  for (let i = 0; i < ACTIONS.length; i++) {
    const b = createButton(LETTERS[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A stack of layers from a program at the top to the hardware at the bottom. One call, move_to with ' +
    'shoulder_pan equal to 10 degrees, passes through the Arm interface and then through one of three drivers: ' +
    'FakeArm, FeetechArm or DamiaoArm. Each driver does something different underneath. In the six calls you ' +
    'choose the low-level action that a call produces.');
}

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Driver Swap Tracer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawLayers(); else drawQuiz();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore: the layers
// ---------------------------------------------------------------------------
// One layer box. With dry set it only measures. Returns the height of the box.
function layerBox(name, body, x, y, w, col, strong, dry) {
  const tw = w - 16;
  const h = 6 + para(name, 0, 0, tw, 'black', 16, true, true) + para(body, 0, 0, tw, 'black', 16, false, true) + 6;
  if (dry) return h;
  fill(col); stroke(strong ? 'navy' : 'gray'); strokeWeight(strong ? 3 : 1);
  rect(x, y, w, h, 8);
  const y2 = para(name, x + 8, y + 6, tw, 'black', 16, true);
  para(body, x + 8, y2, tw, 'black', 16, false);
  return h;
}

function arrowDown(x, y) {
  stroke('dimgray'); strokeWeight(2);
  line(x, y, x, y + 10); line(x, y + 10, x - 4, y + 5); line(x, y + 10, x + 4, y + 5);
}

function drawLayers() {
  const x0 = 8, W = canvasWidth - 16, gap = 12;
  let y = 42;
  txt('Trace the call through each driver.', canvasWidth / 2, y + 10, 'navy', CENTER, CENTER, 16, true);
  y += 26;
  for (const L of TOP_LAYERS) {
    y += layerBox(L.name, L.text, x0, y, W, L.col, false);
    arrowDown(canvasWidth / 2, y + 1);
    y += gap;
  }
  // the lower layers: three columns side by side on a wide screen, the chosen driver alone on a narrow one
  const cols = narrow ? [shown] : [0, 1, 2];
  const cgap = 8, cw = (W - cgap * (cols.length - 1)) / cols.length;
  LOWER_LAYERS.forEach((L, li) => {
    const label = d => L.key === 'driver' ? 'Driver: ' + DRIVERS[d].name : L.name;
    const h = Math.max(...cols.map(d => layerBox(label(d), DRIVERS[d][L.key], 0, 0, cw, L.col, false, true)));
    cols.forEach((d, ci) => {
      const x = x0 + ci * (cw + cgap);
      const tw = cw - 16, strong = !narrow && d === shown;
      fill(L.col); stroke(strong ? 'navy' : 'gray'); strokeWeight(strong ? 3 : 1);
      rect(x, y, cw, h, 8);
      const y2 = para(label(d), x + 8, y + 6, tw, 'black', 16, true);
      para(DRIVERS[d][L.key], x + 8, y2, tw, 'black', 16, false);
      if (li < LOWER_LAYERS.length - 1) arrowDown(x + cw / 2, y + h + 1);
    });
    y += h + gap;
  });
  y -= gap;
  const tip = narrow ? 'Choose another driver below. Which layers change?' : 'The top two layers never change. Only the driver and what lies under it are different.';
  if (y + 8 + para(tip, 0, 0, W, 'dimgray', 16, false, true) <= drawHeight - 6) y = para(tip, x0 + 2, y + 8, W - 4, 'dimgray', 16, false);
  if (y > drawHeight - 4) layoutNotes.push('layers overflow by ' + Math.round(y - (drawHeight - 4)) + ' px');
}

// ---------------------------------------------------------------------------
// The six calls
// ---------------------------------------------------------------------------
function drawQuiz() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + CALLS.length, tx, y, tw, 'black', 18, true);
    y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + CALLS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + CALLS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para('The same call does different work on each arm, because each driver translates it into its own units and messages.', tx, y + 10, tw, 'black', 16, false);
    y = para('The limit check is done once, in the base class, before any driver runs.', tx, y + 6, tw, 'black', 16, false);
    y = para('Switch to Explore to trace the call through each driver again.', tx, y + 10, tw, 'dimgray', 16, false);
  } else {
    const c = CALLS[idx];
    y = para('Call ' + (idx + 1) + ' of ' + CALLS.length, tx, y, tw, 'black', 16, true);
    // the call card
    const cardH = 8 + para('Driver: ' + c.driver, 0, 0, tw - 16, 'black', 16, true, true) + para(c.call, 0, 0, tw - 16, 'black', 16, false, true) + 6;
    fill('lightyellow'); stroke('goldenrod'); strokeWeight(1);
    rect(tx, y + 4, tw, cardH, 8);
    let cy = para('Driver: ' + c.driver, tx + 8, y + 10, tw - 16, 'black', 16, true);
    para(c.call, tx + 8, cy, tw - 16, 'black', 16, false);
    y += 4 + cardH;
    if (c.driver === 'FeetechArm') y = para('Shoulder pan calibration (illustrative): 742 to 3242, so the middle is 1992.', tx, y + 6, tw, 'dimgray', 16, false);

    const listHeight = () => ACTIONS.reduce((s, a, i) => s + para(LETTERS[i] + ') ' + a, 0, 0, tw, 'black', 16, false, true) + 6, 0);
    const drawList = () => {
      for (let i = 0; i < ACTIONS.length; i++) {
        const str = LETTERS[i] + ') ' + ACTIONS[i];
        const isRight = phase === 'feedback' && i === c.action, isWrongPick = phase === 'feedback' && i === picked && i !== c.action;
        const lh = para(str, 0, 0, tw, 'black', 16, false, true);
        if (isRight || isWrongPick) {
          fill(isRight ? 'honeydew' : 'mistyrose'); stroke(isRight ? 'seagreen' : 'firebrick'); strokeWeight(2);
          rect(tx - 4, y - 2, tw + 8, lh + 3, 5);
        }
        y = para(str, tx, y, tw, 'black', 16, isRight) + 6;
      }
    };
    if (phase === 'ask') {
      y = para('What does this call do underneath?', tx, y + 8, tw, 'navy', 16, true) + 4;
      drawList();
    } else {
      const right = picked === c.action, a = ACTIONS[c.action];
      const msg = right ? 'Correct: ' + a + '. ' + c.why
        : 'Not quite. Underneath, this call ' + a.charAt(0).toLowerCase() + a.slice(1) + '. ' + c.why;
      // the list of actions stays on screen when there is room for it under the feedback
      const need = 10 + listHeight() + 6 + para(msg, 0, 0, tw, 'black', 16, false, true);
      if (y + need <= bottom) { y += 10; drawList(); }
      y = para(msg, tx, y + 6, tw, right ? 'darkgreen' : 'firebrick', 16, false);
    }
  }
  if (y > bottom) layoutNotes.push('quiz panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 170 : 190, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  driverSelect.position(10, drawHeight + ROW2);
  driverSelect.size(narrow ? 200 : 220, 28);
  const gap = 8, bw = min(90, (canvasWidth - 20 - gap * 5) / 6);
  choiceBtns.forEach((b, i) => { b.position(10 + i * (bw + gap), drawHeight + ROW2); b.size(bw, 30); });
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt(narrow ? 'Pick a driver to see its layers.' : 'Pick a driver to outline its column.', 10, drawHeight + ROW3 + 14, 'dimgray', LEFT, CENTER, 16, false);
  } else if (phase !== 'done') {
    txt('Correct: ' + correctCount + ' of ' + CALLS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask') txt('Choose a letter.', canvasWidth - 10, drawHeight + ROW3 + 14, 'dimgray', RIGHT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'quiz') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  if (explore) driverSelect.show(); else driverSelect.hide();
  const showChoices = !explore && phase !== 'done';
  choiceBtns.forEach((b, i) => {
    if (showChoices) b.show(); else b.hide();
    b.style('background-color', '');
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (showChoices && i === CALLS[idx].action) b.style('background-color', 'lightgreen');
    else if (showChoices && i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === CALLS.length - 1 ? 'See score' : 'Next');
}

function onChoice(i) {
  if (mode !== 'quiz' || phase !== 'ask') return;
  picked = i;
  if (i === CALLS[idx].action) correctCount++;
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < CALLS.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; picked = -1; correctCount = 0; phase = 'ask';
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
