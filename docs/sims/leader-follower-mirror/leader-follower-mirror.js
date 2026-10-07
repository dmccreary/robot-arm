// Leader and Follower Mirror - p5.js MicroSim
// CANVAS_HEIGHT: 720
// Learning objective (Understand, infer): infer the follower arm's joint angle from the leader's angle, the
// follower's joint limits and its calibration error, in six scenarios, with at least 5 of 6 correct on the
// first attempt. Evidence: the committed choice in each scenario. Free mode is exploration, not evidence.
// The arms are drawn by robot-arm-lib.js (skills/robot-arm-drawing). A side view cannot show shoulder pan or
// wrist roll, so those joints and the gripper are shown on gauges beside the two arms.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 600;
let controlHeight = 120;          // 3 rows x 35 + 10 = 115, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// The follower's joint limits are the example limits from the chapter's arm.json (illustrative values).
const LIMITS = { pan: [-110, 110], elbow: [-97, 97], roll: [-160, 160], gripper: [0, 100] };
const JOINT_NAMES = { pan: 'Shoulder pan', elbow: 'Elbow flex', roll: 'Wrist roll', gripper: 'Gripper' };
const CAL_ERROR = 8;               // degrees, the only non-zero calibration error in the chapter

// the six scenarios, in the chapter's fixed order; choices are listed (a), (b), (c) and `correct` is the index
const SCENARIOS = [
  { joint: 'elbow', leader: 40, err: 0, choices: [20, 40, 97], correct: 1,
    why: 'The follower copies the leader\'s angle and 40 is inside the limits.' },
  { joint: 'pan', leader: -30, err: 0, choices: [-30, 30, 0], correct: 0,
    why: 'The follower copies the angle with its sign, so -30 stays -30.' },
  { joint: 'elbow', leader: 110, err: 0, choices: [110, 97, 0], correct: 1,
    why: '110 is above the follower\'s limit of 97, so the follower stops at 97.' },
  { joint: 'elbow', leader: 40, err: 8, choices: [32, 40, 48], correct: 2,
    why: 'The follower reaches the commanded 40 degrees plus its 8 degree calibration error.' },
  { joint: 'gripper', leader: 60, err: 0, choices: [60, 100, 0], correct: 0,
    why: 'The trigger position is copied as the gripper position, and 60 is inside the 0 to 100 limits.' },
  { joint: 'roll', leader: 150, err: 0, choices: [160, 150, 110], correct: 1,
    why: '150 is inside the limits of -160 to 160, so no limit applies. Do not apply a limit that is not reached.' }
];
const MASTERY = 5;
const LETTERS = ['a', 'b', 'c'];

// the copy rule from the chapter section "How the Pair Works": hold at the limit, then add the calibration error
function follow(joint, leaderAngle, err) {
  const lim = LIMITS[joint];
  const command = Math.min(lim[1], Math.max(lim[0], leaderAngle));
  return { command: command, physical: command + err, held: command !== leaderAngle };
}

// controls
let modeSelect, nextBtn, choiceBtns = [];
let panSlider, elbowSlider, rollSlider, errBox;

// state
let mode = 'scenarios';            // 'scenarios' or 'free'
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0;
let picked = -1;
let correctCount = 0;

// what the gauges and arms currently show; each eases toward its goal
const shown = { leader: { pan: 0, elbow: 0, roll: 0, gripper: 0 }, follower: { pan: 0, elbow: 0, roll: 0, gripper: 0 }, command: { pan: 0, elbow: 0, roll: 0, gripper: 0 } };
let goal = { leader: { pan: 0, elbow: 0, roll: 0, gripper: 0 }, follower: { pan: 0, elbow: 0, roll: 0, gripper: 0 }, command: { pan: 0, elbow: 0, roll: 0, gripper: 0 } };

let leaderArm, followerArm;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  leaderArm = RobotArm.presets.leaderSchematic();
  followerArm = RobotArm.presets.so101Schematic();

  // all controls are created before layoutControls() positions them
  modeSelect = createSelect();
  modeSelect.option('Scenarios', 'scenarios');
  modeSelect.option('Free mode (after the scenarios)', 'free');
  modeSelect.selected('scenarios');
  modeSelect.changed(() => setMode(modeSelect.value()));
  modeSelect.elt.options[1].disabled = true;     // unlocks after scenario 6

  nextBtn = createButton('Next scenario');
  nextBtn.mouseClicked(onNext);
  for (let i = 0; i < 3; i++) {
    const b = createButton('?');
    b.mouseClicked(() => onChoice(i));
    choiceBtns.push(b);
  }

  panSlider = createSlider(-180, 180, 0, 5);
  elbowSlider = createSlider(-180, 180, 0, 5);
  rollSlider = createSlider(-180, 180, 0, 5);
  [panSlider, elbowSlider, rollSlider].forEach(s => s.input(updateFreeGoal));
  errBox = createCheckbox('Calibration error +8°', false);
  errBox.changed(updateFreeGoal);

  layoutControls();
  setMode('scenarios');
  describe('A leader arm and a follower arm side by side, with gauges for the joint being tested. The learner ' +
    'predicts where the follower\'s joint ends up when it copies the leader, stops at its own joint limits, and ' +
    'adds any calibration error.');
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Leader and Follower Mirror', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  // ease every shown value toward its goal
  ['leader', 'follower', 'command'].forEach(who => Object.keys(shown[who]).forEach(j => {
    shown[who][j] += (goal[who][j] - shown[who][j]) * 0.18;
  }));

  const half = canvasWidth / 2;
  stroke(200); strokeWeight(1); line(half, 36, half, 350);
  drawSide('Leader arm', 0, half, leaderArm, 'leader');
  drawSide('Follower arm', half, half, followerArm, 'follower');

  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// One arm and its gauges
// ---------------------------------------------------------------------------
function activeJoints() {
  if (mode === 'free') return ['pan', 'elbow', 'roll'];
  return [SCENARIOS[Math.min(idx, SCENARIOS.length - 1)].joint];
}

function drawSide(title, x0, w, arm, who) {
  txt(title, x0 + w / 2, 44, 'black', CENTER, CENTER, 16, true);

  // the side view shows the elbow bend, and the follower's jaw opening
  const vals = shown[who];
  RobotArm.setAngle(arm, 'shoulder', 65);
  RobotArm.setAngle(arm, 'elbow', vals.elbow);
  RobotArm.setAngle(arm, 'wrist', 0);
  if (who === 'follower') arm.effector.opening = Math.max(0, vals.gripper) * 0.4;
  // size the picture for every elbow bend that can be shown, so the arm stays large and never changes scale
  const poses = [-120, 0, 120].map(e => ({ shoulder: 65, elbow: e, wrist: 0 }));
  const view = RobotArm.fitView({ x: x0 + 4, y: 58, w: w - 8, h: 168 }, arm, { pad: 8, mode: 'poses', poses: poses });
  RobotArm.draw(arm, view, {});

  // gauges for the joint(s) being tested
  const joints = activeJoints();
  const slot = (w - 8) / joints.length;
  joints.forEach((j, i) => {
    const cx = x0 + 4 + slot * i + slot / 2;
    const r = Math.max(18, Math.min(36, slot / 2 - 8));
    const cy = 232 + 26 + r;
    const isF = who === 'follower';
    const lim = LIMITS[j];
    const title = (joints.length > 1 ? JOINT_NAMES[j].split(' ').pop() : JOINT_NAMES[j]);
    const val = vals[j];
    if (j === 'gripper') {
      RobotArm.drawBar({ x: x0 + 14, y: 232 + 40, w: w - 28, h: 16, value: Math.min(100, Math.max(0, val)), min: 0, max: 100,
        limitMin: isF ? lim[0] : undefined, limitMax: isF ? lim[1] : undefined,
        markValue: undefined, title: JOINT_NAMES[j] + ' (0 to 100)', valueText: String(Math.round(val)),
        color: isF ? RobotArm.PALETTE.follower.joint : RobotArm.PALETTE.leader.joint });
      return;
    }
    const mark = (isF && mode === 'scenarios' && SCENARIOS[Math.min(idx, 5)].err !== 0) || (isF && mode === 'free' && errBox.checked())
      ? shown.command[j] : undefined;
    RobotArm.drawDial({ cx: cx, cy: cy, r: r, angle: val, zero: j === 'elbow' ? 'right' : 'up',
      min: isF ? lim[0] : undefined, max: isF ? lim[1] : undefined, markAngle: mark,
      title: title, valueText: Math.round(val) + '°',
      color: isF ? RobotArm.PALETTE.follower.joint : RobotArm.PALETTE.leader.joint });
  });
}

// ---------------------------------------------------------------------------
// Info panel
// ---------------------------------------------------------------------------
function fmtVal(joint, v) { return joint === 'gripper' ? String(v) : v + ' degrees'; }

function viewNote(joint) {
  if (joint === 'pan') return 'The shoulder pan gauge is a view from above: zero is straight ahead.';
  if (joint === 'elbow') return 'The side view and gauge show the elbow bend: zero is straight, positive bends up.';
  if (joint === 'roll') return 'The wrist roll gauge shows the twist of the hand: zero is the neutral twist.';
  return 'The gripper gauge runs from 0 to 100 gripper units.';
}

function drawInfoPanel() {
  const x = 8, w = canvasWidth - 16, top = 356, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  let y = top + 8;
  const line = (s, col, size, bold, hh) => { txt(s, x + 10, y, col || 'black', LEFT, TOP, size || 16, bold, w - 20, hh || 22); y += (hh || 22); };

  if (mode === 'free') {
    line('Free mode: move the leader and read the follower.', 'black', 16, true);
    ['pan', 'elbow', 'roll'].forEach(j => {
      const L = { pan: panSlider, elbow: elbowSlider, roll: rollSlider }[j].value();
      const f = follow(j, L, errBox.checked() ? CAL_ERROR : 0);
      const note = f.held ? ' (held at the limit)' : '';
      line(JOINT_NAMES[j] + ': leader ' + L + ', follower command ' + f.command + note + ', follower angle ' + f.physical + ' degrees.',
        'black', 16, false, narrow ? 44 : 22);
    });
    line('Follower limits: pan -110 to 110, elbow flex -97 to 97, wrist roll -160 to 160 degrees.', 'dimgray', 16, false, narrow ? 44 : 22);
    return;
  }

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    line('Correct: ' + correctCount + ' of ' + SCENARIOS.length, 'black', 16, true);
    line(ok ? 'Mastery reached' : 'Mastery is ' + MASTERY + ' of ' + SCENARIOS.length + '. Try again.', ok ? 'darkgreen' : 'firebrick', 18, true, 26);
    line('Free mode is unlocked. Use the mode menu to set the leader\'s shoulder pan, elbow flex and wrist roll, and switch the calibration error on or off.', 'black', 16, false, 90);
    return;
  }

  const s = SCENARIOS[idx];
  const lim = LIMITS[s.joint];
  line('Scenario ' + (idx + 1) + ' of ' + SCENARIOS.length + '   Correct: ' + correctCount + ' of ' + SCENARIOS.length, 'black', 16, true);
  const cond = s.err === 0 ? 'The follower is calibrated, with no error.' : 'The follower has a calibration error of +' + s.err + ' degrees.';
  line(JOINT_NAMES[s.joint] + '. The leader\'s angle is ' + fmtVal(s.joint, s.leader) + '. ' + cond +
    ' The follower\'s limits are ' + lim[0] + ' to ' + lim[1] + (s.joint === 'gripper' ? '.' : ' degrees.'), 'black', 16, false, narrow ? 70 : 66);
  if (phase === 'ask') {
    line('Where will the follower\'s joint end up?', 'black', 18, true, 26);
    line(viewNote(s.joint), 'dimgray', 16, false, 44);
  } else {
    const right = s.choices[s.correct];
    const ok = picked === s.correct;
    const msg = ok ? 'Correct: ' + fmtVal(s.joint, right) + '. ' + s.why
      : 'Not quite. The follower ends at ' + fmtVal(s.joint, right) + '. ' + s.why;
    line(msg, ok ? 'darkgreen' : 'firebrick', 16, false, narrow ? 92 : 66);
    line('Your choice: ' + LETTERS[picked] + ') ' + fmtVal(s.joint, s.choices[picked]) + '.   Result: ' + fmtVal(s.joint, right) + '.', 'black', 16, false, 44);
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 43, ROW3 = 78;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 250);
  nextBtn.position(canvasWidth - (narrow ? 118 : 135), drawHeight + ROW1);
  choiceBtns.forEach((b, i) => b.position(10 + i * (narrow ? 88 : 110), drawHeight + ROW2));
  const colW = canvasWidth / 2;
  const labelW = narrow ? 96 : 150;
  const sliderW = max(50, colW - labelW - 24);
  panSlider.position(labelW + 6, drawHeight + ROW2); panSlider.size(sliderW);
  elbowSlider.position(colW + labelW + 6, drawHeight + ROW2); elbowSlider.size(sliderW);
  rollSlider.position(labelW + 6, drawHeight + ROW3); rollSlider.size(sliderW);
  errBox.position(colW + 6, drawHeight + ROW3);
}

function drawControlLabels() {
  const colW = canvasWidth / 2;
  if (mode === 'free') {
    txt((narrow ? 'Pan: ' : 'Leader pan: ') + panSlider.value() + '°', 10, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'Elbow: ' : 'Leader elbow: ') + elbowSlider.value() + '°', colW + 6, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'Roll: ' : 'Leader roll: ') + rollSlider.value() + '°', 10, drawHeight + ROW3 + 11, 'black');
    return;
  }
  if (phase === 'ask') txt('Choose the follower\'s angle, then commit.', 10, drawHeight + ROW3 + 11, 'dimgray', LEFT, CENTER, 16);
}

function setMode(m) {
  mode = m;
  if (m === 'free') {
    updateFreeGoal();
  } else if (phase === 'ask') {
    resetGoalToZero();
  }
  refreshControls();
}

function refreshControls() {
  const free = mode === 'free';
  [panSlider, elbowSlider, rollSlider, errBox].forEach(c => (free ? c.show() : c.hide()));
  choiceBtns.forEach(b => (free ? b.hide() : b.show()));
  if (free) { nextBtn.hide(); } else { nextBtn.show(); }
  if (!free) {
    const s = SCENARIOS[Math.min(idx, SCENARIOS.length - 1)];
    choiceBtns.forEach((b, i) => {
      b.html(LETTERS[i] + ') ' + s.choices[i] + (s.joint === 'gripper' ? '' : '°'));
      if (phase === 'ask') b.removeAttribute('disabled'); else b.attribute('disabled', '');
    });
    if (phase === 'ask') nextBtn.attribute('disabled', ''); else nextBtn.removeAttribute('disabled');
    nextBtn.html(phase === 'done' ? 'Try again' : (idx === SCENARIOS.length - 1 ? 'See score' : 'Next scenario'));
    if (phase === 'done') choiceBtns.forEach(b => b.hide());
  }
  modeSelect.elt.options[1].disabled = !(phase === 'done' || free);
}

function resetGoalToZero() {
  ['leader', 'follower', 'command'].forEach(who => Object.keys(goal[who]).forEach(j => { goal[who][j] = 0; }));
}

function updateFreeGoal() {
  if (mode !== 'free') return;
  const err = errBox.checked() ? CAL_ERROR : 0;
  const L = { pan: panSlider.value(), elbow: elbowSlider.value(), roll: rollSlider.value() };
  Object.keys(L).forEach(j => {
    const f = follow(j, L[j], err);
    goal.leader[j] = L[j]; goal.command[j] = f.command; goal.follower[j] = f.physical;
  });
}

function onChoice(i) {
  if (mode !== 'scenarios' || phase !== 'ask') return;
  const s = SCENARIOS[idx];
  picked = i;
  if (i === s.correct) correctCount++;
  // only now do the arms move: the learner has committed before seeing the result
  const f = follow(s.joint, s.leader, s.err);
  resetGoalToZero();
  goal.leader[s.joint] = s.leader;
  goal.command[s.joint] = f.command;
  goal.follower[s.joint] = f.physical;
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'scenarios') return;
  if (phase === 'feedback') {
    if (idx < SCENARIOS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
    picked = -1;
    resetGoalToZero();
  } else if (phase === 'done') {
    idx = 0; phase = 'ask'; correctCount = 0; picked = -1;
    resetGoalToZero();
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
