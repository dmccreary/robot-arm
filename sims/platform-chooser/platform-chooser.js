// Platform Chooser - p5.js MicroSim
// CANVAS_HEIGHT: 700
// Learning objective (Evaluate, recommend): recommend one of three robot arms (the SO-ARM101, the reBot B601-DM or the
// reBot B601-RS) for each of six project situations by applying the platform selection criteria, with at least
// 5 of 6 recommendations correct on the first attempt.
// Evidence: the arm chosen and committed with Check for each situation. Changing the weights in Explore mode is
// exploration, not evidence.
// Rules: a requirement in a situation is a filter that is applied first. In Explore mode the weighted total of an arm
// is the sum over five criteria of weight x score. The scores (1 worst, 5 best) are the author's judgment.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 200;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the three arms with the facts the learner may use (Chapter 9 and Chapters 5 and 6)
const ARMS = [
  { name: 'SO-ARM101', short: 'SO-ARM101', abbr: 'SO', col: '#f4a259',
    facts: 'payload about 0.5 kg; about $350 for a pair with printed parts; 5 V supply; LeRobot; lowest supervision need' },
  { name: 'reBot B601-DM', short: 'B601-DM', abbr: 'DM', col: '#6c9bd1',
    facts: 'payload 1.5 kg; $1,517.58 store bundle; 24 V supply; ROS 1 and 2, LeRobot, Pinocchio, Isaac Sim; higher supervision need' },
  { name: 'reBot B601-RS', short: 'B601-RS', abbr: 'RS', col: '#b39ddb',
    facts: 'payload 2.5 kg; motors $1,130 plus a $69.50 supply; 48 V supply; a Python SDK; highest supervision need' }
];

// the five criteria with the author's scores for each arm, in the order of ARMS (1 worst, 5 best)
const CRITERIA = [
  { name: 'Low cost', short: 'Low cost', scores: [5, 2, 1] },
  { name: 'Payload', short: 'Payload', scores: [1, 3, 5] },
  { name: 'Easy to learn', short: 'Easy to learn', scores: [5, 3, 2] },
  { name: 'Software support', short: 'Software support', scores: [4, 5, 3] },
  { name: 'Simple, low-voltage power', short: 'Low-voltage power', scores: [5, 3, 2] }
];
const WEIGHT_MIN = 0, WEIGHT_MAX = 5, WEIGHT_STEP = 1, WEIGHT_DEFAULT = 3;
const MAX_TOTAL = 125;         // five criteria, weight 5, score 5

// the six situations, in fixed order. arm is the answer key.
const SITUATIONS = [
  { text: 'A class of 12 students aged 12 to 14, working in pairs, has about $400 for each pair’s arms and wants to learn Python and teleoperation.',
    arm: 'SO-ARM101', why: 'It is the only arm that fits the budget, and its supervision demands suit the age.' },
  { text: 'A lab must lift a 1.2 kg part again and again and has a 24 V bench supply.',
    arm: 'reBot B601-DM', why: 'Its payload of 1.5 kg covers 1.2 kg, and 24 V is the supply it needs.' },
  { text: 'A project must hold a 2.0 kg object, has a 48 V supply and has an adult who can wire it.',
    arm: 'reBot B601-RS', why: 'Only the B601-RS has a payload (2.5 kg) above 2.0 kg.' },
  { text: 'A hobbyist with no experience of mains wiring wants to try imitation learning with a leader and follower, on a $400 budget.',
    arm: 'SO-ARM101', why: 'It has a built-in leader arm, a low-voltage supply, and fits the budget.' },
  { text: 'A university course needs ROS 2, Isaac Sim and Pinocchio support, a 1 kg payload, a 24 V supply, and staff who can do the mains wiring.',
    arm: 'reBot B601-DM', why: 'Its repository lists all three software tools, and 1.5 kg covers 1 kg.' },
  { text: 'A team has only a 5 V, 4 A supply and wants the cheapest build that can copy a leader arm.',
    arm: 'SO-ARM101', why: 'The other two arms need 24 V or 48 V supplies the team does not have.' }
];
const MASTERY = 5;

// controls
let modeSelect, actionBtn, weightSliders = [], armBtns = [];

// state
let mode = 'explore';          // 'explore' or 'situations'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, chosen = -1;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six situations', 'situations');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  for (let i = 0; i < CRITERIA.length; i++) weightSliders.push(createSlider(WEIGHT_MIN, WEIGHT_MAX, WEIGHT_DEFAULT, WEIGHT_STEP));

  ARMS.forEach((a, i) => {
    const b = createButton(a.name);
    b.mouseClicked(() => choose(i));
    armBtns.push(b);
  });

  layoutControls();
  setMode('explore');
  describe('A table that scores three robot arms on five criteria, with a weight for each criterion, and three bars ' +
    'that show the weighted totals in order. Sliders set the weights. A second mode describes six project ' +
    'situations and asks which of the three arms to recommend.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
function weights() { return weightSliders.map(s => s.value()); }

// Weighted total of each arm: the sum of weight x score.
function totals(w) { return ARMS.map((a, i) => CRITERIA.reduce((sum, c, k) => sum + w[k] * c.scores[i], 0)); }

// Arm indexes from the highest total to the lowest. A tie keeps the order SO-ARM101, B601-DM, B601-RS.
function ranking(t) { return [0, 1, 2].sort((a, b) => t[b] - t[a] || a - b); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Platform Chooser', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawSituations();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode: weights, scores and weighted totals
// ---------------------------------------------------------------------------
function drawExplore() {
  const w = weights(), t = totals(w), order = ranking(t);
  txt(narrow ? 'Scores are judgments: 1 worst, 5 best' : 'Scores are the author’s judgment: 1 worst, 5 best', canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true, canvasWidth - 16);

  // the score table
  const x = 8, tw = canvasWidth - 16, top = 68, rowH = 26;
  const colW = narrow ? 44 : 150, wX = x + tw - 3 * colW - (narrow ? 62 : 110);
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, tw, rowH * (CRITERIA.length + 1) + 6, 8);
  txt('Criterion', x + 10, top + rowH / 2 + 2, 'black', LEFT, CENTER, 16, true);
  txt('Weight', wX, top + rowH / 2 + 2, 'black', LEFT, CENTER, 16, true);
  ARMS.forEach((a, i) => {
    const cx = x + tw - (2.5 - i) * colW;
    fill(a.col); noStroke(); rect(cx - colW / 2 + 3, top + 4, colW - 6, rowH - 4, 5);
    txt(narrow ? a.abbr : a.name, cx, top + rowH / 2 + 2, 'black', CENTER, CENTER, 16, true);
  });
  CRITERIA.forEach((c, k) => {
    const y = top + rowH * (k + 1) + rowH / 2 + 3;
    txt(narrow ? c.short : c.name, x + 10, y, 'black', LEFT, CENTER, 16, false);
    txt('× ' + w[k], wX + 8, y, 'black', LEFT, CENTER, 16, true);
    c.scores.forEach((s, i) => {
      const cx = x + tw - (2.5 - i) * colW;
      txt(narrow ? String(s) : s + ' × ' + w[k] + ' = ' + s * w[k], cx, y, 'black', CENTER, CENTER, 16, false);
    });
  });

  // the weighted totals, highest first
  const barTop = top + rowH * (CRITERIA.length + 1) + 18;
  const labelW = narrow ? 96 : 130, bx = x + labelW + 6, bw = tw - labelW - 60;
  order.forEach((i, rank) => {
    const y = barTop + rank * 28;
    txt(narrow ? ARMS[i].short : ARMS[i].name, x + 6, y + 11, 'black', LEFT, CENTER, 16, rank === 0);
    fill('white'); stroke(190); strokeWeight(1); rect(bx, y, bw, 22);
    fill(ARMS[i].col); noStroke(); rect(bx, y, bw * t[i] / MAX_TOTAL, 22);
    noFill(); stroke(120); rect(bx, y, bw, 22);
    txt(String(t[i]), bx + bw + 8, y + 11, 'black', LEFT, CENTER, 16, true);
  });

  const pTop = barTop + 3 * 28 + 6;
  const line = panel(pTop, drawHeight - pTop - 8);
  const tie = t[order[0]] === t[order[1]];
  line(tie ? 'Tie at the top with ' + t[order[0]] + '. Ties are listed in the order SO-ARM101, B601-DM, B601-RS.'
    : 'Highest total: ' + ARMS[order[0]].name + ' with ' + t[order[0]] + '.', 'black', 16, true);
  line('Weights rank preferences. A requirement, such as a 2 kg payload, is a filter: remove any arm that fails it before you weigh the rest.', 'black', 16, false);
}

// ---------------------------------------------------------------------------
// Six situations
// ---------------------------------------------------------------------------
function drawSituations() {
  const score = 'Correct: ' + correctCount + ' of ' + SITUATIONS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 210);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + SITUATIONS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + SITUATIONS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: filter first, then weigh. The most capable arm is not the best choice when cost, supervision or power rules it out.', 'black', 16, false);
    return;
  }
  const s = SITUATIONS[idx], done = phase === 'feedback';
  txt('Situation ' + (idx + 1) + ' of ' + SITUATIONS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  const x = 8, w = canvasWidth - 16, top = 68;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, drawHeight - top - 8, 10);
  let y = top + 8;
  y += para(s.text, x + 10, y, w - 20, 'black', 16, true) + 8;
  ARMS.forEach((a, i) => {
    const right = done && a.name === s.arm;
    const h = wrap(a.name + ': ' + a.facts, w - 44, 16, false).length * 21;
    fill(right ? '#d8f0dd' : 'white'); stroke(right ? '#2e8b57' : 215); strokeWeight(right ? 2 : 1);
    rect(x + 8, y - 3, w - 16, h + 6, 5);
    fill(a.col); noStroke(); rect(x + 8, y - 3, 8, h + 6, 5, 0, 0, 5);
    y += para(a.name + ': ' + a.facts, x + 24, y, w - 44, 'black', 16, false) + 9;
  });
  y += 2;
  if (!done) {
    para('Which arm do you recommend? Apply the requirements as filters first. Choose one, then press Check.', x + 10, y, w - 20, 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + s.arm + '. ' + s.why : 'Not quite. The best fit is ' + s.arm + '. ' + s.why;
  para(msg, x + 10, y, w - 20, lastRight ? 'darkgreen' : 'firebrick', 16, true);
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
const ROW1 = 8, ROW2 = 46, ROW_STEP = 30;
const LABEL_W = 190;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 140 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const sliderW = Math.max(60, canvasWidth - LABEL_W - 20);
  weightSliders.forEach((s, k) => { s.position(LABEL_W, drawHeight + ROW2 + k * ROW_STEP); s.size(sliderW); });
  const gap = 8, w = (canvasWidth - 20 - gap * 2) / 3;
  armBtns.forEach((b, i) => { b.position(10 + i * (w + gap), drawHeight + ROW2 + 4); b.size(w, 40); });
}

function drawControlLabels() {
  if (mode !== 'explore') return;
  const w = weights();
  CRITERIA.forEach((c, k) => txt(c.short + ': ' + w[k], 10, drawHeight + ROW2 + k * ROW_STEP + 11, 'black'));
}

function choose(i) {
  if (mode !== 'situations' || phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  if (m === 'situations') startSituations();
  refreshControls();
}

function startSituations() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const explore = mode === 'explore';
  for (const s of weightSliders) { if (explore) s.show(); else s.hide(); }
  const quiz = !explore && phase !== 'done';
  armBtns.forEach((b, i) => {
    if (!quiz) { b.hide(); return; }
    b.show();
    let bg = '', weight = 'normal';
    if (phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (ARMS[i].name === SITUATIONS[idx].arm) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === SITUATIONS.length - 1 ? 'See score' : 'Next');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'situations') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = ARMS[chosen].name === SITUATIONS[idx].arm;
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < SITUATIONS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startSituations();
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Helpers and resize
// ---------------------------------------------------------------------------
function txt(str, x, y, col, hAlign, vAlign, size, bold, w) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  if (w && textWidth(str) > w) textSize((size || defaultTextSize) * w / textWidth(str));
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
