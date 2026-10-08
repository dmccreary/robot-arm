// Servo ID Setup Sequencer - p5.js MicroSim
// CANVAS_HEIGHT: 694
// Learning objective (Analyze, organize): organize the eight steps of setting one servo's ID into their correct
// order, with at least 7 of the 8 steps in their correct positions within three attempts. Evidence: the card
// order committed with Check. Reading the explanations in Explore mode is exploration, not evidence.
// The steps and their order are from the Chapter 8 section "Servo Preparation, Testing, and IDs", which follows
// the LeRobot SO-101 guide (the commands, the prompts and the order gripper to shoulder pan).
// Scoring: the score is the number of cards whose position equals their correct position.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 610;
let controlHeight = 84;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

// the eight steps, in their correct order
const STEPS = [
  { text: 'Find the board\'s serial port with lerobot-find-port.',
    why: 'The setup command needs the port name, so you find it first.' },
  { text: 'Connect the power supply and the USB cable to the control board, with the jumpers on channel B.',
    why: 'The board must be powered and linked to the computer before it can talk to a servo.' },
  { text: 'Run lerobot-setup-motors with the robot type and the port.',
    why: 'The command is what writes the IDs, and it begins by asking for the first motor.' },
  { text: 'When it names a motor, connect that one servo, and only that one, to the board.',
    why: 'All new servos have ID 1, so two on the bus would answer at once.' },
  { text: 'Press Enter.',
    why: 'The command only starts looking for the motor after you confirm that it is connected.' },
  { text: 'Read the confirmation line "motor id set to" with the number.',
    why: 'The line confirms that the ID was written, so you know that this servo is done.' },
  { text: 'Label the servo with its ID and put it aside.',
    why: 'An unlabeled servo cannot be told apart from the others later.' },
  { text: 'Repeat for the next motor, in the order the command asks: gripper, wrist roll, wrist flex, elbow flex, shoulder lift, shoulder pan.',
    why: 'The command works from joint 6 back to joint 1, so the order is part of the procedure.' }
];
const N = STEPS.length;
const MASTERY = 7, MAX_ATTEMPTS = 3;
const FIRST_SHUFFLE = [4, 7, 1, 5, 2, 0, 3, 6];      // no card starts in its correct position

// controls
let modeSelect, checkBtn, upBtn, downBtn;

// state
let mode = 'explore';          // 'explore' or 'exercise'
let phase = 'arrange';         // 'arrange' or 'review' (exercise only)
let order = [];                // order[slot] is the step shown in that slot
let selected = 0;              // the slot that is selected, or -1
let attempts = 0, lastScore = -1, mastered = false, tries = 0;
let checkedAt = {};            // step -> the slot it was in at the last Check
let cardRects = [];            // where each slot was drawn, for taps

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore the steps', 'explore');
  modeSelect.option('Exercise: put in order', 'exercise');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  checkBtn = createButton('Check');
  checkBtn.mouseClicked(onCheck);
  upBtn = createButton('Move up');
  upBtn.mouseClicked(() => moveSelected(-1));
  downBtn = createButton('Move down');
  downBtn.mouseClicked(() => moveSelected(1));

  layoutControls();
  setMode('explore');
  describe('Eight cards, each with one step of giving a servo its ID. In Explore mode the cards are in the correct ' +
    'order and tapping a card shows why it goes there. In the exercise the cards are shuffled: tap a card, move ' +
    'it up or down with the buttons, and press Check to see how many are in the right place.');
}

function sortedOrder() { return STEPS.map((s, i) => i); }
function score() { return order.filter((s, slot) => s === slot).length; }

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Servo ID Setup Sequencer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const listBottom = drawCards(42);
  drawInfoPanel(listBottom + 6);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The cards
// ---------------------------------------------------------------------------
function drawCards(top) {
  const size = narrow ? 14 : 16, lineH = narrow ? 18 : 21, pad = narrow ? 5 : 8, gap = 4;
  const x = 8, w = canvasWidth - 16, numW = 34, tx = x + numW, tw = w - numW - 8;
  let y = top;
  cardRects = [];
  for (let slot = 0; slot < N; slot++) {
    const step = order[slot];
    const lines = wrapLines(STEPS[step].text, tw, size, false);
    const h = lines.length * lineH + pad * 2;
    // a mark is shown only while the card is still in the slot where it was checked
    const marked = mode === 'exercise' && phase === 'arrange' && checkedAt[step] === slot;
    const right = marked && step === slot, wrong = marked && step !== slot;
    const sel = slot === selected;
    fill(right ? 'honeydew' : wrong ? 'mistyrose' : sel ? 'lightyellow' : 'white');
    stroke(sel ? 'navy' : wrong ? 'firebrick' : right ? 'seagreen' : 'silver'); strokeWeight(sel ? 3 : wrong || right ? 2 : 1);
    rect(x, y, w, h, 8);
    // the slot number, with a tick or a cross after a check
    const bx = x + numW / 2, by = y + h / 2;
    fill(right ? 'seagreen' : wrong ? 'firebrick' : 'lightsteelblue'); noStroke();
    circle(bx, by, 24);
    if (right || wrong) {
      stroke('white'); strokeWeight(3); noFill();
      if (right) { line(bx - 6, by, bx - 2, by + 5); line(bx - 2, by + 5, bx + 6, by - 5); }
      else { line(bx - 5, by - 5, bx + 5, by + 5); line(bx - 5, by + 5, bx + 5, by - 5); }
    } else {
      txt(String(slot + 1), bx, by + 1, 'black', CENTER, CENTER, 16, true);
    }
    noStroke(); fill('black'); textAlign(LEFT, TOP); textSize(size); textStyle(NORMAL);
    lines.forEach((ln, i) => text(ln, tx, y + pad + i * lineH + 1));
    cardRects.push({ y: y, h: h });
    y += h + gap;
  }
  return y - gap;
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function drawInfoPanel(top) {
  const x = 8, w = canvasWidth - 16, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20, bottom = top + h - 2;
  let y = top + 8;
  const whyLine = () => {
    if (selected < 0) return;
    y = para('Why step ' + (selected + 1) + ' goes here: ' + STEPS[order[selected]].why, tx, y + 4, tw, 'navy', 16, false);
  };

  if (mode === 'explore') {
    y = para(narrow ? 'The correct order. Tap a step to see why.' : 'This is the correct order. Tap a step to see why it goes there.', tx, y, tw, 'black', 16, true);
    whyLine();
    const tip = 'Then choose the exercise: put the steps in the order you would do them.';
    if (y + 4 + para(tip, tx, 0, tw, 'dimgray', 16, false, true) <= bottom) y = para(tip, tx, y + 4, tw, 'dimgray', 16, false);
  } else if (phase === 'review') {
    const head = lastScore + ' of ' + N + ' cards are in the right place. ' +
      (mastered ? 'Mastery reached.' : 'That was attempt ' + MAX_ATTEMPTS + ', so this exercise counts as missed.');
    y = para(head, tx, y, tw, mastered ? 'darkgreen' : 'firebrick', 16, true);
    y = para(narrow ? 'This is the correct order. Tap a step to see why.' : 'The cards now show the correct order. Tap a step to see why it goes there.', tx, y + 4, tw, 'black', 16, false);
    whyLine();
  } else if (attempts === 0) {
    y = para('Put the steps in the order you would do them.', tx, y, tw, 'black', 16, true);
    y = para('Tap a card, then press Move up or Move down. Press Check when you are ready. You have ' + MAX_ATTEMPTS + ' attempts.', tx, y + 4, tw, 'black', 16, false);
  } else {
    y = para(lastScore + ' of ' + N + ' cards are in the right place.', tx, y, tw, 'firebrick', 16, true);
    y = para('A cross marks a card in the wrong place. A mark goes away when its card moves. Rearrange the cards and check again.', tx, y + 4, tw, 'black', 16, false);
  }
  if (y > bottom) layoutNotes.push('info panel overflow by ' + Math.round(y - bottom) + ' px');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 190 : 220, 28);
  const aw = narrow ? 110 : 130;
  checkBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  checkBtn.size(aw, 28);
  const bw = narrow ? 100 : 120;
  upBtn.position(10, drawHeight + ROW2); upBtn.size(bw, 28);
  downBtn.position(18 + bw, drawHeight + ROW2); downBtn.size(bw, 28);
}

function drawControlLabels() {
  if (mode !== 'exercise' || phase !== 'arrange') return;
  txt('Attempt ' + min(attempts + 1, MAX_ATTEMPTS) + ' of ' + MAX_ATTEMPTS, canvasWidth - 10, drawHeight + ROW2 + 14, 'black', RIGHT, CENTER, 16, true);
}

function setMode(m) {
  mode = m;
  if (m === 'exercise') startExercise(); else { order = sortedOrder(); selected = 0; }
  refreshControls();
}

function startExercise() {
  phase = 'arrange'; attempts = 0; lastScore = -1; mastered = false; checkedAt = {}; selected = -1;
  if (tries === 0) order = FIRST_SHUFFLE.slice();
  else do { order = shuffle(sortedOrder()); } while (order.some((s, slot) => s === slot));
  tries++;
}

function refreshControls() {
  const arranging = mode === 'exercise' && phase === 'arrange';
  if (arranging) { upBtn.show(); downBtn.show(); } else { upBtn.hide(); downBtn.hide(); }
  if (mode === 'explore') { checkBtn.hide(); return; }
  checkBtn.show();
  checkBtn.html(arranging ? 'Check' : 'Try again');
  if (selected > 0) upBtn.removeAttribute('disabled'); else upBtn.attribute('disabled', '');
  if (selected >= 0 && selected < N - 1) downBtn.removeAttribute('disabled'); else downBtn.attribute('disabled', '');
}

function moveSelected(d) {
  if (mode !== 'exercise' || phase !== 'arrange' || selected < 0) return;
  const to = selected + d;
  if (to < 0 || to >= N) return;
  [order[selected], order[to]] = [order[to], order[selected]];
  selected = to;
  refreshControls();
}

function onCheck() {
  if (mode !== 'exercise') return;
  if (phase === 'review') { startExercise(); refreshControls(); return; }
  attempts++;
  lastScore = score();
  checkedAt = {};
  order.forEach((s, slot) => { checkedAt[s] = slot; });
  if (lastScore >= MASTERY || attempts >= MAX_ATTEMPTS) {
    mastered = lastScore >= MASTERY;
    phase = 'review'; order = sortedOrder(); selected = 0;
  }
  refreshControls();
}

// tapping a card selects it
function mousePressed() {
  if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY >= drawHeight) return;
  for (let slot = 0; slot < cardRects.length; slot++) {
    const r = cardRects[slot];
    if (mouseY >= r.y && mouseY <= r.y + r.h) { selected = slot; refreshControls(); return; }
  }
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

// Splits a string into the lines that fit in width w.
function wrapLines(str, w, size, bold) {
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let row = '';
  for (const word of String(str).split(' ')) {
    const trial = row ? row + ' ' + word : word;
    if (row && textWidth(trial) > w) { lines.push(row); row = word; } else row = trial;
  }
  if (row) lines.push(row);
  textStyle(NORMAL);
  return lines;
}

// A word-wrapped paragraph that starts at (x, y) and is w wide. Returns the y just below its last line.
// With dry set, nothing is drawn, so the result is the height the paragraph would need when y is 0.
function para(str, x, y, w, col, size, bold, dry) {
  size = size || defaultTextSize;
  const lineH = Math.round(size * 1.32);
  const lines = wrapLines(str, w, size, bold);
  if (!dry) {
    noStroke();
    fill(col || 'black');
    textAlign(LEFT, TOP);
    textSize(size);
    textStyle(bold ? BOLD : NORMAL);
    lines.forEach((ln, i) => text(ln, x, y + i * lineH));
    textStyle(NORMAL);
  }
  return y + lines.length * lineH;
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
