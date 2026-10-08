// With Block Predictor - p5.js MicroSim
// CANVAS_HEIGHT: 662
// Learning objective (Understand, infer): infer the outcome of six short programs that use a fake arm, by choosing
// what happens to the error and to the torque, with at least 5 of 6 correct on the first attempt. Evidence: the
// outcome committed for each program before it is run. Stepping through programs in Explore mode is exploration,
// not evidence.
// The programs and their outcomes are from the lab of Chapter 10 (the Arm class and its FakeArm). The rules:
//   an error raised inside a with block runs __exit__ (which disconnects) before it continues upward
//   __exit__ returns False, so a with block never hides an error
//   an error caught by an except block inside the with block does not leave the block
//   move_to checks the joint limits before any driver code is called
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 122;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

const OUTCOMES = [
  'The error continues upward and the torque is off',
  'The error continues upward and the torque is still on',
  'The error is caught and the torque is off',
  'The error continues upward and the torque was never on'
];
const LETTERS = ['a', 'b', 'c', 'd'];
const BAD_MOVE = 'arm.move_to(Pose({"shoulder_pan": 140.0}))';

// Six programs in fixed order (illustrative). code: [indent level, text]. events: what happens when it runs, in
// order. line is the code line the event belongs to (-1 for none), torque is set when the event changes it, and
// err is set when the event changes what is happening to the error.
const PROGRAMS = [
  { code: [[0, 'with arm:'], [1, BAD_MOVE]], outcome: 0,
    events: [
      { line: 0, text: '__enter__ calls connect(): torque ON', torque: true },
      { line: 1, text: 'Limit check: 140.0 is above 110' },
      { line: 1, text: 'JointLimitError is raised', err: 'JointLimitError raised' },
      { line: 0, text: '__exit__ calls disconnect(): torque OFF', torque: false },
      { line: -1, text: '__exit__ returns False: error continues', err: 'JointLimitError continues upward' }],
    why: 'The limit check raises JointLimitError, the with block exits through __exit__, which disconnects, and the error is not hidden.' },
  { code: [[0, 'arm.connect()'], [0, BAD_MOVE]], outcome: 1,
    events: [
      { line: 0, text: 'connect(): torque ON', torque: true },
      { line: 1, text: 'Limit check: 140.0 is above 110' },
      { line: 1, text: 'JointLimitError is raised', err: 'JointLimitError raised' },
      { line: -1, text: 'No with and no finally: no disconnect()' },
      { line: -1, text: 'Error continues upward, torque still ON', err: 'JointLimitError continues upward' }],
    why: 'Nothing runs disconnect, so the torque stays on after the error.' },
  { code: [[0, 'arm.connect()'], [0, 'try:'], [1, BAD_MOVE], [0, 'finally:'], [1, 'arm.disconnect()']], outcome: 0,
    events: [
      { line: 0, text: 'connect(): torque ON', torque: true },
      { line: 2, text: 'Limit check: 140.0 is above 110' },
      { line: 2, text: 'JointLimitError is raised', err: 'JointLimitError raised' },
      { line: 4, text: 'finally runs: disconnect(), torque OFF', torque: false },
      { line: -1, text: 'The error continues upward', err: 'JointLimitError continues upward' }],
    why: 'The finally block runs on the way out, so the torque is switched off and the error continues.' },
  { code: [[0, 'with arm:'], [1, 'try:'], [2, BAD_MOVE], [1, 'except JointLimitError:'], [2, 'print("limit")']], outcome: 2,
    events: [
      { line: 0, text: '__enter__ calls connect(): torque ON', torque: true },
      { line: 2, text: 'Limit check: 140.0 is above 110' },
      { line: 2, text: 'JointLimitError is raised', err: 'JointLimitError raised' },
      { line: 4, text: 'except catches it and prints limit', err: 'JointLimitError caught' },
      { line: 0, text: '__exit__ calls disconnect(): torque OFF', torque: false }],
    why: 'The except block handles the error, the program continues, and the with block still disconnects at its end.' },
  { code: [[0, 'arm = FakeArm(joints)'], [0, 'arm.read_pose()']], outcome: 3,
    events: [
      { line: 0, text: 'A new arm: not connected, torque off' },
      { line: 1, text: 'read_pose checks the connection first' },
      { line: 1, text: 'NotConnectedError: no driver code runs', err: 'NotConnectedError raised' },
      { line: -1, text: 'The error continues, torque was never on', err: 'NotConnectedError continues upward' }],
    why: 'NotConnectedError is raised before any driver code runs, and the torque was never switched on.' },
  { code: [[0, 'with FakeArm(joints, fail_after=0) as arm:'], [1, 'arm.move_to(Pose({"shoulder_pan": 10.0}))']], outcome: 0,
    events: [
      { line: 0, text: '__enter__ calls connect(): torque ON', torque: true },
      { line: 1, text: 'Limit check: 10.0 is inside the limits' },
      { line: 1, text: 'The first write fails: CommunicationError', err: 'CommunicationError raised' },
      { line: 0, text: '__exit__ calls disconnect(): torque OFF', torque: false },
      { line: -1, text: '__exit__ returns False: error continues', err: 'CommunicationError continues upward' }],
    why: 'The first write raises CommunicationError, and the with block disconnects on the way out.' }
];
const MASTERY = 5;
const MAX_CODE_LINES = 5;

// controls
let modeSelect, actionBtn, programSelect, stepBtn, resetBtn, choiceBtns = [];

// state
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // 'ask', 'feedback' or 'done' (quiz only)
let shown = 0, steps = 0;      // Explore: the program on screen and how many of its events have run
let idx = 0, picked = -1, correctCount = 0;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore: step through', 'explore');
  modeSelect.option('Six programs: predict', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Next');
  actionBtn.mouseClicked(onAction);

  programSelect = createSelect();
  PROGRAMS.forEach((p, i) => programSelect.option('Program ' + (i + 1), String(i)));
  programSelect.changed(() => { shown = int(programSelect.value()); steps = 0; refreshControls(); });
  stepBtn = createButton('Step');
  stepBtn.mouseClicked(() => { if (steps < PROGRAMS[shown].events.length) steps++; refreshControls(); });
  resetBtn = createButton('Reset');
  resetBtn.mouseClicked(() => { steps = 0; refreshControls(); });

  for (let i = 0; i < OUTCOMES.length; i++) {
    const b = createButton(LETTERS[i]);
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A short Python program that uses a fake robot arm, with a lamp that shows whether the torque is on ' +
    'and a line that shows what is happening to the error. In Explore mode the Step button runs the program one ' +
    'event at a time. In the six programs you choose the outcome before the program is run.');
}

// ---------------------------------------------------------------------------
// Running a program: the state after its first n events
// ---------------------------------------------------------------------------
function stateAfter(p, n) {
  const s = { torque: false, everOn: false, err: 'none', line: -1 };
  for (let i = 0; i < n && i < p.events.length; i++) {
    const e = p.events[i];
    if (e.torque !== undefined) { s.torque = e.torque; if (e.torque) s.everOn = true; }
    if (e.err) s.err = e.err;
    s.line = e.line;
  }
  return s;
}
// the outcome that the events of a program lead to (used to check the answer key)
function outcomeOf(p) {
  const s = stateAfter(p, p.events.length);
  if (s.err.indexOf('caught') >= 0) return 2;
  return !s.everOn ? 3 : s.torque ? 1 : 0;
}

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('With Block Predictor', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  if (mode === 'quiz' && phase === 'done') { drawDone(); drawControlLabels(); return; }
  const pi = mode === 'explore' ? shown : idx, p = PROGRAMS[pi];
  // how many events are visible: the steps taken in Explore, none before a prediction, all of them after it
  const n = mode === 'explore' ? steps : phase === 'ask' ? 0 : p.events.length;
  const hidden = mode === 'quiz' && phase === 'ask';
  const top = 42;
  const aw = narrow ? canvasWidth - 16 : Math.floor(canvasWidth / 2) - 12;
  const aBottom = drawProgram(p, pi, n, hidden, 8, top, aw);
  if (narrow) drawStory(p, n, 8, aBottom + 6, canvasWidth - 16, drawHeight - aBottom - 14);
  else drawStory(p, n, aw + 16, top, canvasWidth - aw - 24, drawHeight - top - 8);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Panel A: the program, the torque lamp and the error line
// ---------------------------------------------------------------------------
function drawProgram(p, pi, n, hidden, x, top, w) {
  const size = narrow ? 14 : 15, lineH = 22, indent = 18;
  const s = stateAfter(p, n);
  const headH = narrow ? 48 : 70;                  // the heading and the note above the code
  const h = 8 + headH + MAX_CODE_LINES * lineH + 14 + 54;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  y = para('Program ' + (pi + 1) + ' of ' + PROGRAMS.length + ' (illustrative)', tx, y, tw, 'black', 16, true);
  y = para(narrow ? 'arm is a fake arm. shoulder_pan: −110 to 110.' : 'arm is a fake arm. Its shoulder_pan can go from −110 to 110 degrees.',
    tx, y, tw, 'dimgray', narrow ? 14 : 15, false);
  if (y > top + 8 + headH) layoutNotes.push('program heading overflow');
  // the code
  const cy = top + 8 + headH;
  fill('ghostwhite'); stroke('lightgray'); strokeWeight(1);
  rect(tx - 4, cy, tw + 8, MAX_CODE_LINES * lineH + 8, 6);
  p.code.forEach((c, i) => {
    const ly = cy + 4 + i * lineH;
    if (n > 0 && i === s.line && mode === 'explore') { fill('khaki'); noStroke(); rect(tx - 2, ly, tw + 4, lineH, 4); }
    const lx = tx + 4 + c[0] * indent;
    textSize(size); textStyle(NORMAL);
    if (lx + textWidth(c[1]) > x + w - 8) layoutNotes.push('code line too wide: ' + c[1]);
    txt(c[1], lx, ly + lineH / 2 + 1, 'black', LEFT, CENTER, size, false);
  });
  // torque lamp and error line
  let sy = cy + MAX_CODE_LINES * lineH + 8 + 16;
  fill(hidden ? 'white' : s.torque ? 'limegreen' : 'lightgray'); stroke('dimgray'); strokeWeight(1);
  circle(tx + 8, sy, 16);
  const ended = n >= p.events.length;
  txt('Torque: ' + (hidden ? '?' : s.torque ? 'ON' : !s.everOn && ended ? 'OFF (it was never on)' : 'OFF'), tx + 24, sy, 'black', LEFT, CENTER, 16, true);
  sy += 24;
  const errCol = s.err === 'none' ? 'black' : s.err.indexOf('caught') >= 0 ? 'darkgreen' : 'firebrick';
  txt('Error: ' + (hidden ? '?' : s.err), tx, sy, hidden ? 'black' : errCol, LEFT, CENTER, 16, true);
  return top + h;
}

// ---------------------------------------------------------------------------
// Panel B: the question, the events and the feedback
// ---------------------------------------------------------------------------
function drawStory(p, n, x, top, w, h) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;
  const events = () => {
    for (let i = 0; i < n; i++) {
      const last = mode === 'explore' && i === n - 1;
      y = para((i + 1) + '. ' + p.events[i].text, tx, y, tw, 'black', 16, last) + 2;
    }
  };

  if (mode === 'explore') {
    if (n === 0) {
      y = para('What will happen to the error and to the torque?', tx, y, tw, 'navy', 16, true);
      y = para('Decide first. Then press Step to run the program one event at a time.', tx, y + 6, tw, 'black', 16, false);
    } else {
      y = para('What happens, in order:', tx, y, tw, 'black', 16, true) + 2;
      events();
      if (n === p.events.length) y = para('Outcome: ' + OUTCOMES[p.outcome] + '.', tx, y + 6, tw, 'navy', 16, true);
    }
  } else if (phase === 'ask') {
    y = para('What will happen to the error and to the torque?', tx, y, tw, 'navy', 16, true);
    y += 4;
    for (let i = 0; i < OUTCOMES.length; i++) y = para(LETTERS[i] + ') ' + OUTCOMES[i], tx, y, tw, 'black', 16, false) + 5;
  } else {
    const right = picked === p.outcome, o = OUTCOMES[p.outcome];
    const msg = (right ? 'Correct: ' + o + '. ' : 'Not quite. The outcome is: ' + o + '. ') + p.why;
    // the list of events is shown when there is room for it; the lamp and the error line always show the result
    let need = para(msg, tx, 0, tw, 'black', 16, false, true) + 6;
    for (let i = 0; i < n; i++) need += para((i + 1) + '. ' + p.events[i].text, tx, 0, tw, 'black', 16, false, true) + 2;
    if (y + need <= bottom) events();
    else y = para('The program has run. The torque and the error are shown above.', tx, y, tw, 'black', 16, false);
    y = para(msg, tx, y + 6, tw, right ? 'darkgreen' : 'firebrick', 16, false);
  }
  if (y > bottom) layoutNotes.push('story panel overflow by ' + Math.round(y - bottom) + ' px');
}

function drawDone() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  const ok = correctCount >= MASTERY;
  y = para('Correct: ' + correctCount + ' of ' + PROGRAMS.length, tx, y, tw, 'black', 18, true);
  y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROGRAMS.length + '.'
    : 'Mastery is ' + MASTERY + ' of ' + PROGRAMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
  y = para('A with block switches the torque off when an error is raised inside it, and then lets the error continue.', tx, y + 10, tw, 'black', 16, false);
  y = para('A try with a finally does the same, if you remember to write it.', tx, y + 6, tw, 'black', 16, false);
  y = para('With neither, a failure leaves the torque on.', tx, y + 6, tw, 'black', 16, false);
  y = para('Switch to Explore to step through any program again.', tx, y + 10, tw, 'dimgray', 16, false);
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
  programSelect.position(10, drawHeight + ROW2);
  programSelect.size(130, 28);
  const bw = narrow ? 96 : 110;
  stepBtn.position(148, drawHeight + ROW2); stepBtn.size(bw, 28);
  resetBtn.position(156 + bw, drawHeight + ROW2); resetBtn.size(bw, 28);
  const gap = 8, cw = min(90, (canvasWidth - 20 - gap * 3) / 4);
  choiceBtns.forEach((b, i) => { b.position(10 + i * (cw + gap), drawHeight + ROW2); b.size(cw, 30); });
}

function drawControlLabels() {
  if (mode === 'explore') {
    const total = PROGRAMS[shown].events.length;
    txt(steps === 0 ? 'Press Step to run the first event.' : 'Event ' + steps + ' of ' + total + (steps === total ? '. The program has ended.' : ''),
      10, drawHeight + ROW3 + 14, 'dimgray', LEFT, CENTER, 16, false);
  } else if (phase !== 'done') {
    txt('Correct: ' + correctCount + ' of ' + PROGRAMS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask') txt('Choose a letter.', canvasWidth - 10, drawHeight + ROW3 + 14, 'dimgray', RIGHT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'quiz') { idx = 0; phase = 'ask'; picked = -1; correctCount = 0; }
  else { steps = 0; }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [programSelect, stepBtn, resetBtn].forEach(c => explore ? c.show() : c.hide());
  if (steps >= PROGRAMS[shown].events.length) stepBtn.attribute('disabled', ''); else stepBtn.removeAttribute('disabled');
  if (steps === 0) resetBtn.attribute('disabled', ''); else resetBtn.removeAttribute('disabled');
  const showChoices = !explore && phase !== 'done';
  choiceBtns.forEach((b, i) => {
    if (showChoices) b.show(); else b.hide();
    b.style('background-color', '');
    if (phase === 'ask') { b.removeAttribute('disabled'); return; }
    b.attribute('disabled', '');
    if (showChoices && i === PROGRAMS[idx].outcome) b.style('background-color', 'lightgreen');
    else if (showChoices && i === picked) b.style('background-color', 'lightpink');
  });
  if (explore || phase === 'ask') { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'done' ? 'Try again' : idx === PROGRAMS.length - 1 ? 'See score' : 'Next');
}

function onChoice(i) {
  if (mode !== 'quiz' || phase !== 'ask') return;
  picked = i;
  if (i === PROGRAMS[idx].outcome) correctCount++;
  phase = 'feedback';
  refreshControls();
}

function onAction() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < PROGRAMS.length - 1) { idx++; picked = -1; phase = 'ask'; } else { phase = 'done'; }
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
