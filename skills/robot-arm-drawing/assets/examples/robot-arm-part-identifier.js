// Robot Arm Part Identifier - p5.js MicroSim
// CANVAS_HEIGHT: 520
// Learning objective (Remember, identify): identify the seven named parts of a robot arm on a
// schematic, given each part's name, with at least 6 of 7 correct on the first attempt.
// Evidence: quiz-mode clicks. Explore-mode clicks are exploration, not evidence.
// The arm is drawn by robot-arm-lib.js (skills/robot-arm-drawing).
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 50;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let margin = 25;
let defaultTextSize = 16;
let narrow = false;

// room on each side of the arm for name tags, which only show when the learner may see them
const TAG_COL_W = 108;

let arm;
let modeSelect;
let nextBtn;

// The seven parts, in order from the table to the tool. Text is from the chapter sections
// "Joints and Links" and "Naming the Parts".
const PARTS = [
  { id: 'base', name: 'Base', kind: 'Fixed part',
    text: 'The fixed part that clamps to the table and holds the first motor. Every other part moves relative to it.' },
  { id: 'shoulder', name: 'Shoulder', kind: 'Joint group',
    text: 'The joints at the base end of the arm. They turn the whole arm left and right and raise and lower it.' },
  { id: 'upper_arm', name: 'Upper arm', kind: 'Link',
    text: 'The rigid link between the shoulder and the elbow.' },
  { id: 'elbow', name: 'Elbow', kind: 'Joint',
    text: 'The joint in the middle of the arm that bends the upper arm toward the forearm.' },
  { id: 'forearm', name: 'Forearm', kind: 'Link',
    text: 'The rigid link between the elbow and the wrist.' },
  { id: 'wrist', name: 'Wrist', kind: 'Joint group',
    text: 'The joints at the tool end of the arm. They tilt and twist the hand.' },
  { id: 'end_effector', name: 'End effector', kind: 'Tool',
    text: 'The tool at the end of the chain. A gripper is the most common one. It is the part that touches the world.' }
];
const PART_BY_ID = {};
PARTS.forEach(p => { PART_BY_ID[p.id] = p; });

// quiz-mode order is fixed
const QUIZ_ORDER = ['elbow', 'base', 'wrist', 'upper_arm', 'end_effector', 'shoulder', 'forearm'];
const MASTERY = 6;

// state
let mode = 'explore';          // 'explore' or 'quiz'
let selectedId = null;         // explore mode: the part last clicked
let quizIndex = 0;             // which of the seven names is being asked
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let lastClickId = null;        // quiz mode: what the learner clicked
let lastCorrect = false;
let correctCount = 0;
let hint = '';                 // shown when a click lands on empty space

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  arm = RobotArm.presets.sixAxisSchematic();

  // all controls are created before layoutControls() positions them
  modeSelect = createSelect();
  modeSelect.option('Explore: click a part to learn it', 'explore');
  modeSelect.option('Quiz: click the part I name', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  nextBtn = createButton('Next name');
  nextBtn.mouseClicked(onNext); // 'click' also fires for Enter and Space, so keyboard users can press it

  layoutControls();
  setMode('explore');
  describe(RobotArm.describeArm(arm) + ' In explore mode each part reveals its name and job when clicked. ' +
    'In quiz mode the learner is given seven names, one at a time, and clicks the matching part.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Robot Arm Part Identifier', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const armRect = armRegion();
  const view = currentView();

  // what is highlighted: the clicked part in explore mode, the asked part once an answer is in
  let highlight = null;
  if (mode === 'explore') highlight = selectedId;
  else if (phase === 'feedback') highlight = QUIZ_ORDER[quizIndex];
  RobotArm.draw(arm, view, { highlight: highlight });

  // names are visible when exploring and on the final review, never while a quiz question is open
  if (mode === 'explore' || phase === 'done') {
    RobotArm.drawCallouts(arm, view, PARTS.map(p => ({ id: p.id, text: p.name })),
      { side: 'auto', xLeft: armRect.x + TAG_COL_W - 4, xRight: armRect.x + armRect.w - TAG_COL_W + 4, size: 16 });
  }
  txt('Schematic side view, not to scale', armRect.x + 8, armRect.y + 10, 'dimgray', LEFT, CENTER, 16);

  drawInfoPanel();
  drawControlLabels();
  updateCursor(view);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function armRegion() {
  const top = 40;
  if (narrow) return { x: 0, y: top, w: canvasWidth, h: 255 };
  return { x: 0, y: top, w: Math.floor(canvasWidth * 0.62), h: drawHeight - top };
}

function panelRegion() {
  const a = armRegion();
  if (narrow) return { x: 8, y: a.y + a.h + 6, w: canvasWidth - 16, h: drawHeight - (a.y + a.h) - 14 };
  return { x: a.w + 10, y: a.y + 6, w: canvasWidth - a.w - 20, h: drawHeight - a.y - 20 };
}

// ---------------------------------------------------------------------------
// Info panel: the prompt, the description or the feedback
// ---------------------------------------------------------------------------
function drawInfoPanel() {
  const r = panelRegion();
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(r.x, r.y, r.w, r.h, 10);
  const x = r.x + 10, w = r.w - 20;
  let y = r.y + 10;

  if (mode === 'explore') {
    if (!selectedId) {
      txt('Click a part to learn its name and job.', x, y, 'black', LEFT, TOP, 16, false, w, 100);
    } else {
      const p = PART_BY_ID[selectedId];
      txt(p.name + '  (' + p.kind + ')', x, y, 'black', LEFT, TOP, 18, true, w, 28);
      txt(p.text, x, y + 30, 'black', LEFT, TOP, 16, false, w, r.h - 50);
    }
    return;
  }

  // quiz mode
  txt('Correct: ' + correctCount + ' of ' + PARTS.length, x, y, 'black', LEFT, TOP, 16, true, w, 22);
  y += 26;
  if (phase === 'ask') {
    const asked = PART_BY_ID[QUIZ_ORDER[quizIndex]];
    txt('Name ' + (quizIndex + 1) + ' of ' + PARTS.length, x, y, 'dimgray', LEFT, TOP, 16, false, w, 22);
    txt('Click the ' + asked.name.toLowerCase() + '.', x, y + 24, 'black', LEFT, TOP, 20, true, w, 30);
    if (hint) txt(hint, x, y + 60, 'firebrick', LEFT, TOP, 16, false, w, 44);
  } else if (phase === 'feedback') {
    const asked = PART_BY_ID[QUIZ_ORDER[quizIndex]];
    let msg;
    if (lastCorrect) {
      msg = 'Correct: ' + asked.name.toLowerCase() + '. ' + asked.text;
    } else {
      msg = 'Not quite. You clicked the ' + PART_BY_ID[lastClickId].name.toLowerCase() + '. The ' +
        asked.name.toLowerCase() + ' is highlighted: ' + asked.text;
    }
    // the message opens with "Correct:" or "Not quite." so the verdict is in the words, not only the color
    txt(msg, x, y, lastCorrect ? 'darkgreen' : 'firebrick', LEFT, TOP, 16, false, w, r.h - 50);
  } else {
    const ok = correctCount >= MASTERY;
    txt(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + PARTS.length + '. Try again.', x, y,
      ok ? 'darkgreen' : 'firebrick', LEFT, TOP, 18, true, w, 26);
    txt('Joints: ' + joinNames('Joint') + '. Links: ' + joinNames('Link') + '. Fixed part: Base. Tool: End effector.',
      x, y + 30, 'black', LEFT, TOP, 16, false, w, r.h - 70);
  }
}

// names of the parts whose kind starts with a word, so the final screen groups joints and links
function joinNames(word) {
  return PARTS.filter(p => p.kind.indexOf(word) === 0).map(p => p.name + (p.kind.indexOf('group') > 0 ? ' (group)' : '')).join(', ');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  modeSelect.position(10, drawHeight + 12);
  modeSelect.size(Math.min(290, canvasWidth - 130));
  nextBtn.position(canvasWidth - 110, drawHeight + 12);
}

function drawControlLabels() {
  // no extra labels: the select and the button carry their own text
}

function setMode(m) {
  mode = m;
  selectedId = null;
  hint = '';
  if (m === 'quiz') resetQuiz();
  refreshNextButton();
}

function resetQuiz() {
  quizIndex = 0; phase = 'ask'; correctCount = 0; lastClickId = null; hint = '';
}

function onNext() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (quizIndex < PARTS.length - 1) { quizIndex++; phase = 'ask'; } else { phase = 'done'; }
    hint = '';
  } else if (phase === 'done') {
    resetQuiz();
  }
  refreshNextButton();
}

// the button is active only when pressing it means something
function refreshNextButton() {
  if (mode !== 'quiz') { nextBtn.html('Next name'); nextBtn.attribute('disabled', ''); return; }
  if (phase === 'ask') { nextBtn.html('Next name'); nextBtn.attribute('disabled', ''); return; }
  nextBtn.removeAttribute('disabled');
  nextBtn.html(phase === 'done' ? 'Try again' : (quizIndex === PARTS.length - 1 ? 'See score' : 'Next name'));
}

// ---------------------------------------------------------------------------
// Clicking the arm
// ---------------------------------------------------------------------------
// the arm fills the space between the two tag columns; 'pose' mode fits the bounding box of the drawn pose
function currentView() {
  const a = armRegion();
  return RobotArm.fitView({ x: a.x + TAG_COL_W, y: a.y + 24, w: a.w - 2 * TAG_COL_W, h: a.h - 30 }, arm, { pad: 8, mode: 'pose' });
}

function insideArmRegion(x, y) {
  const a = armRegion();
  return x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h;
}

function mousePressed() {
  if (!insideArmRegion(mouseX, mouseY)) return;
  const id = RobotArm.hitTest(arm, currentView(), mouseX, mouseY);
  if (mode === 'explore') {
    selectedId = id; // clicking empty space clears the selection
    return;
  }
  if (phase !== 'ask') return;
  if (!id) { hint = 'Click on a part of the arm.'; return; } // empty space is not an answer
  hint = '';
  lastClickId = id;
  lastCorrect = (id === QUIZ_ORDER[quizIndex]);
  if (lastCorrect) correctCount++;
  phase = 'feedback';
  refreshNextButton();
}

function updateCursor(view) {
  const live = (mode === 'explore') || (mode === 'quiz' && phase === 'ask');
  const over = live && insideArmRegion(mouseX, mouseY) && RobotArm.hitTest(arm, view, mouseX, mouseY);
  cursor(over ? 'pointer' : 'default');
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
