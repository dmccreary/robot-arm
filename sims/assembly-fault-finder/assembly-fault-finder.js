// Assembly Fault Finder - p5.js MicroSim
// CANVAS_HEIGHT: 582
// Learning objective (Analyze, differentiate): differentiate six causes of SO-ARM101 faults from eight written
// symptoms, with at least 7 of 8 correct on the first attempt. Evidence: the cause committed for each symptom.
// Reading the cause list in Explore mode is exploration, not evidence.
// The causes and first checks follow the Chapter 8 section "When Something Goes Wrong". Symptoms 5 and 7 draw on
// the STS3215 data sheet's 70 degree C protection and a LeRobot maintainer's comment on a burnt-out gripper, and
// symptom 8 on a user's report in LeRobot issue 3394. The others are illustrative and were written for this sim.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 122;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const CAUSES = [
  { name: 'Power: missing or wrong voltage',
    looks: 'No servo answers, or the servos will not turn on.',
    check: 'Measure the supply with a multimeter. A reading of 0 V, or one far from the label, tells you at once.' },
  { name: 'Duplicate or wrong ID',
    looks: 'Two servos answer at once, or a joint does not answer to its number.',
    check: 'Connect one servo alone and scan the bus. Every new servo starts with ID 1.' },
  { name: 'Loose cable or connector',
    looks: 'Errors that come and go when a joint moves or a cable is touched.',
    check: 'Move the cable gently while you watch for errors, then swap it for another one.' },
  { name: 'Loose horn or gear',
    looks: 'Play, a click, or a joint that trembles around its goal.',
    check: 'With the torque off, rock the part by hand and see where the movement is.' },
  { name: 'Overload or heat',
    looks: 'A hot servo, or a joint that suddenly goes limp.',
    check: 'Read the servo temperature and let it cool. Then find what loaded the joint.' },
  { name: 'Calibration out of date',
    looks: 'The leader and the follower disagree by a few degrees in the same pose.',
    check: 'Find and fix the mechanical cause, such as a slipped horn, then calibrate again.' }
];
const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

// eight symptoms in fixed order; cause is an index into CAUSES
const SYMPTOMS = [
  { text: 'The setup command cannot find the motor at any baud rate, and a multimeter reads 0 V at the board\'s power input.', cause: 0,
    why: 'With no supply voltage the servo cannot answer anything.' },
  { text: 'With all six new servos connected the replies are garbled, but each servo works alone.', cause: 1,
    why: 'New servos all have ID 1, so they answer at the same time and corrupt each other.' },
  { text: '"No status packet" errors appear only when the elbow bends and disappear when the arm is straight.', cause: 2,
    why: 'A fault that depends on the pose points to a conductor or plug that moves.' },
  { text: 'A joint trembles around its goal, and the horn can be wiggled a little on its shaft by hand.', cause: 3,
    why: 'Play at the horn means the controller fights slop, which shows as jitter.' },
  { text: 'After 20 minutes of holding a load, a joint goes limp and the servo reads 70 °C.', cause: 4,
    why: 'A servo turns its torque off above 70 °C, so it goes limp when it overheats.' },
  { text: 'Since a horn was removed and put back, the elbow of the follower is 4 degrees off from the leader.', cause: 5,
    why: 'A re-fitted horn changes the angle at the same raw reading, so the arm must be calibrated again.' },
  { text: 'The follower\'s gripper is hot and stiff after the leader\'s trigger was closed fully while the gripper held an object.', cause: 4,
    why: 'Pushing a gripper against an object keeps the current high, which heats the motor.' },
  { text: 'A "12 V" adapter reads about 16 V on the multimeter, and the servos will not turn on.', cause: 0,
    why: 'A supply far above the label puts the servos into protection.' }
];
const MASTERY = 7;

// controls
let modeSelect, actionBtn, choiceBtns = [];

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let shown = 0;                 // the cause that is open in Explore mode
let idx = 0, picked = -1, correctCount = 0;
let results = [];              // true or false for each symptom answered so far

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore the six causes', 'explore');
  modeSelect.option('Eight symptoms', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next');
  actionBtn.mouseClicked(onAction);

  for (let i = 0; i < CAUSES.length; i++) {
    const b = createButton(LETTERS[i]);
    b.mouseClicked(() => onLetter(i));
    choiceBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A list of six causes of robot arm faults, lettered a to f: power, duplicate or wrong ID, loose cable ' +
    'or connector, loose horn or gear, overload or heat, and calibration out of date. In Explore mode a letter ' +
    'button opens a cause to show what it looks like and what to check first. In the eight symptoms you read a ' +
    'symptom and choose the most likely cause by its letter.');
}

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Assembly Fault Finder', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;
  if (mode === 'explore') y = drawExplore(tx, y, tw, bottom);
  else if (phase === 'done') y = drawDone(tx, y, tw);
  else y = drawSymptom(tx, y, tw);
  if (y > bottom) layoutNotes.push('panel overflow by ' + Math.round(y - bottom) + ' px');
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore: the six causes, one of them open
// ---------------------------------------------------------------------------
function drawExplore(tx, y, tw, bottom) {
  y = para(narrow ? 'Six causes. Press a letter to open one.' : 'The six causes. Press a letter below to open one and read what to check first.', tx, y, tw, 'black', 16, true);
  y += 4;
  for (let i = 0; i < CAUSES.length; i++) {
    const c = CAUSES[i], open = i === shown;
    if (open) {
      const bodyH = para('Looks like: ' + c.looks, 0, 0, tw - 24, 'black', 16, false, true) + para('First check: ' + c.check, 0, 0, tw - 24, 'black', 16, false, true) + 6;
      fill('lightyellow'); stroke('goldenrod'); strokeWeight(1);
      rect(tx - 4, y - 1, tw + 8, 26 + bodyH + 4, 6);
    }
    txt(LETTERS[i] + ') ' + c.name, tx, y + 12, open ? 'navy' : 'black', LEFT, CENTER, 16, open);
    y += 26;
    if (open) {
      y = para('Looks like: ' + c.looks, tx + 20, y, tw - 24, 'black', 16, false);
      y = para('First check: ' + c.check, tx + 20, y + 4, tw - 24, 'black', 16, false);
      y += 8;
    }
  }
  const tip = 'When you know all six, choose Eight symptoms and answer: What is the most likely cause?';
  if (y + 6 + para(tip, tx, 0, tw, 'dimgray', 16, false, true) <= bottom) y = para(tip, tx, y + 6, tw, 'dimgray', 16, false);
  return y;
}

// ---------------------------------------------------------------------------
// The eight symptoms
// ---------------------------------------------------------------------------
function drawSymptom(tx, y, tw) {
  const s = SYMPTOMS[idx];
  y = para('Symptom ' + (idx + 1) + ' of ' + SYMPTOMS.length + ' (illustrative)', tx, y, tw, 'black', 16, true);
  y = para(s.text, tx, y + 4, tw, 'black', narrow ? 16 : 18, false);
  y = para('What is the most likely cause?', tx, y + 8, tw, 'navy', 16, true);
  y += 4;
  for (let i = 0; i < CAUSES.length; i++) {
    const isRight = phase === 'feedback' && i === s.cause, isWrongPick = phase === 'feedback' && i === picked && i !== s.cause;
    if (isRight || isWrongPick) {
      fill(isRight ? 'honeydew' : 'mistyrose'); stroke(isRight ? 'seagreen' : 'firebrick'); strokeWeight(2);
      rect(tx - 4, y - 1, tw + 8, 24, 5);
    }
    txt(LETTERS[i] + ') ' + CAUSES[i].name, tx, y + 12, 'black', LEFT, CENTER, 16, isRight);
    y += 26;
  }
  if (phase === 'feedback') {
    const right = picked === s.cause, name = CAUSES[s.cause].name;
    y = para((right ? 'Correct: ' + name + '. ' : 'Not quite. The likely cause is ' + name + '. ') + s.why, tx, y + 6, tw,
      right ? 'darkgreen' : 'firebrick', 16, false);
  }
  return y;
}

function drawDone(tx, y, tw) {
  const ok = correctCount >= MASTERY;
  y = para('Correct: ' + correctCount + ' of ' + SYMPTOMS.length, tx, y, tw, 'black', 18, true);
  y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + SYMPTOMS.length + '.'
    : 'Mastery is ' + MASTERY + ' of ' + SYMPTOMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
  const missed = [];
  results.forEach((r, i) => { const n = CAUSES[SYMPTOMS[i].cause].name; if (!r && !missed.includes(n)) missed.push(n); });
  if (!missed.length) y = para('You missed no causes.', tx, y + 10, tw, 'black', 16, false);
  else {
    y = para('Causes you missed:', tx, y + 10, tw, 'black', 16, true);
    for (const n of missed) y = para('• ' + n, tx + 8, y + 2, tw - 8, 'black', 16, false);
  }
  y = para('Each symptom carries one clue: when the fault appears, or what a measurement read. Look for the clue, not the general topic.', tx, y + 10, tw, 'black', 16, false);
  y = para('Switch to Explore to read the first check for each cause again.', tx, y + 8, tw, 'dimgray', 16, false);
  return y;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 190 : 210, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const gap = 8, bw = min(90, (canvasWidth - 20 - gap * 5) / 6);
  choiceBtns.forEach((b, i) => { b.position(10 + i * (bw + gap), drawHeight + ROW2); b.size(bw, 30); });
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt('Press a letter to open that cause.', 10, drawHeight + ROW3 + 14, 'dimgray', LEFT, CENTER, 16, false);
  } else if (phase !== 'done') {
    txt('Correct: ' + correctCount + ' of ' + SYMPTOMS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask') txt('Choose a letter.', canvasWidth - 10, drawHeight + ROW3 + 14, 'dimgray', RIGHT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'quiz') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; results = []; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  choiceBtns.forEach((b, i) => {
    b.style('background-color', '');
    if (explore) {
      b.show(); b.removeAttribute('disabled');
      if (i === shown) b.style('background-color', 'khaki');
      return;
    }
    if (phase === 'done') { b.hide(); return; }
    b.show();
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (i === SYMPTOMS[idx].cause) b.style('background-color', 'lightgreen');
    else if (i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === SYMPTOMS.length - 1 ? 'See score' : 'Next');
}

function onLetter(i) {
  if (mode === 'explore') { shown = i; refreshControls(); return; }
  if (phase !== 'ask') return;
  picked = i;
  const right = i === SYMPTOMS[idx].cause;
  if (right) correctCount++;
  results.push(right);
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < SYMPTOMS.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; picked = -1; correctCount = 0; results = []; phase = 'ask';
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
