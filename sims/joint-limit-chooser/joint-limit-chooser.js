// Joint Limit Chooser - p5.js MicroSim
// CANVAS_HEIGHT: 636
// Learning objective (Evaluate, recommend): recommend the torque limit for each of five joint tasks, choosing the
// smallest option that is at least 1.5 times the torque the task needs, with at least 4 of 5 correct on the first attempt.
// Evidence: the option chosen and committed with Check for each task. Moving the sliders in Explore mode is
// exploration, not evidence.
// Rule (a teaching rule of thumb, not a standard): the correct limit is the smallest option with
// option >= 1.5 x needed. Torque needs and limits are percentages of the joint's maximum torque. Values are illustrative.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 516;
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const MARGIN = 1.5;            // the rule's safety margin

// adjustable quantities (the spec's Rules)
const LIMIT_MIN = 0, LIMIT_MAX = 100, LIMIT_STEP = 5, LIMIT_DEFAULT = 50;     // torque limit, percent
const NEED_MIN = 10, NEED_MAX = 90, NEED_STEP = 10, NEED_DEFAULT = 30;        // torque needed, percent

// the five tasks, in fixed order. The answer key is computed by bestOption(), which applies the rule.
const TASKS = [
  { text: 'The gripper holds a 50 g block.', need: 15, options: [20, 30, 100],
    why: '1.5 × 15 = 22.5, so 20 is too low. 30 is the smallest that is enough, and 100 is more than the task needs.' },
  { text: 'The shoulder-lift joint holds the arm up with a 0.3 kg load at reach.', need: 60, options: [80, 90, 100],
    why: '1.5 × 60 = 90, so 80 is too low. 90 is the smallest that is enough, and 100 would be no limit at all.' },
  { text: 'The wrist roll turns a light camera.', need: 10, options: [10, 20, 50],
    why: '1.5 × 10 = 15, so 10 is too low and 20 is the smallest that is enough.' },
  { text: 'The gripper closes near students during a demo.', need: 20, options: [25, 40, 100],
    why: '1.5 × 20 = 30, so 25 is too low, and 100 is a needless risk near people.' },
  { text: 'A first test of an untested program, small and slow.', need: 30, options: [30, 50, 100],
    why: '1.5 × 30 = 45, so 30 is too low, and a test should not use 100 percent.' }
];
const MASTERY = 4;

const COL_STALL = '#f5b7b1', COL_TIGHT = '#ffe49a', COL_OK = '#bfe5c7', COL_LIMIT = '#1f6fb5';

// controls
let modeSelect, actionBtn, limitSlider, needSlider, optionBtns = [];

// state
let mode = 'explore';          // 'explore' or 'tasks'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, chosen = -1;

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Five tasks', 'tasks');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  limitSlider = createSlider(LIMIT_MIN, LIMIT_MAX, LIMIT_DEFAULT, LIMIT_STEP);
  needSlider = createSlider(NEED_MIN, NEED_MAX, NEED_DEFAULT, NEED_STEP);

  for (let i = 0; i < 3; i++) {
    const b = createButton('');
    b.mouseClicked(() => choose(i));
    optionBtns.push(b);
  }

  layoutControls();
  setMode('explore');
  describe('A joint dial and a torque gauge from 0 to 100 percent. The gauge marks the torque a task needs, the ' +
    'point 1.5 times higher, and the torque limit. Sliders set the limit and the need, and the joint holds with ' +
    'margin, holds with little margin, or stalls. A second mode gives five tasks with three torque limits to choose from.');
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
// 'stall' when the limit is below the need, 'tight' when it is below 1.5 times the need, otherwise 'ok'.
function jointState(limit, need) {
  if (limit < need) return 'stall';
  return limit >= MARGIN * need ? 'ok' : 'tight';
}

// The rule: the smallest option that is at least 1.5 times the need.
function bestOption(task) { return Math.min(...task.options.filter(o => o >= MARGIN * task.need)); }

function ratio(limit, need) { return String(Math.round(limit / need * 100) / 100); }

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Joint Limit Chooser', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') drawExplore(); else drawTasks();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Explore mode
// ---------------------------------------------------------------------------
function drawExplore() {
  const limit = limitSlider.value(), need = needSlider.value(), state = jointState(limit, need);
  const enough = MARGIN * need;
  txt('This task needs ' + need + (narrow ? ' percent torque' : ' percent of the joint’s maximum torque'), canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true, canvasWidth - 16);

  // the joint and its status
  const cx = narrow ? 66 : 110, cy = 136, r = 42;
  drawJoint(cx, cy, r, state, limit, need);
  const sx = cx + r + (narrow ? 26 : 50);
  const headline = { ok: 'Holds with margin', tight: 'Holds, with little margin', stall: 'Stalls' }[state];
  const col = { ok: 'darkgreen', tight: '#8a5a00', stall: 'firebrick' }[state];
  txt(headline, sx, cy - 30, col, LEFT, CENTER, 18, true);
  txt('Limit: ' + limit + ' percent', sx, cy - 4, 'black', LEFT, CENTER, 16, false);
  txt('Need: ' + need + ' percent', sx, cy + 18, 'black', LEFT, CENTER, 16, false);
  txt('Limit ÷ need = ' + ratio(limit, need), sx, cy + 40, 'black', LEFT, CENTER, 16, false);

  drawGauge(214, need, true, [{ value: limit, label: 'limit ' + limit, col: COL_LIMIT, bold: true }]);

  // the cost of a high limit
  const bx = 20, bw = canvasWidth - 40, by = 318;
  txt('Push and heat if something goes wrong', bx, by - 12, 'black', LEFT, CENTER, 16, false);
  fill('white'); stroke(120); strokeWeight(1); rect(bx, by, bw, 12);
  fill(192, 57, 43, 60 + limit * 1.6); noStroke(); rect(bx, by, bw * limit / 100, 12);
  noFill(); stroke(120); rect(bx, by, bw, 12);

  const line = panel(340, drawHeight - 348);
  let msg;
  if (state === 'stall') msg = 'The limit is below the torque the task needs, so the joint stalls. A stalled joint draws its largest current and heats up.';
  else if (enough > 100) msg = 'The joint can do the task, but 1.5 × ' + need + ' = ' + enough + ' percent is more than this joint has. It is too weak for this task with margin.';
  else if (state === 'tight') msg = 'The joint can do the task, but a small extra load would stall it. The rule asks for at least 1.5 × ' + need + ' = ' + enough + ' percent.';
  else if (limit - LIMIT_STEP >= enough) msg = 'The joint holds with margin. A lower limit would still do the task. The extra only raises the push and the heat in a fault.';
  else msg = 'The joint holds with margin: ' + limit + ' percent is at least 1.5 × ' + need + ' = ' + enough + ' percent, and no lower setting is.';
  line(msg, 'black', 16, false);
  line('Rule of thumb: the smallest limit that is at least 1.5 times the need. Illustrative values.', 'dimgray', 16, false);
}

// A joint dial: the pointer must reach the goal mark at the top.
function drawJoint(cx, cy, r, state, limit, need) {
  const col = { ok: '#2e8b57', tight: '#d99a00', stall: '#c0392b' }[state];
  fill('white'); stroke(60); strokeWeight(2);
  circle(cx, cy, 2 * r);
  // the goal mark
  stroke('#2e8b57'); strokeWeight(4);
  line(cx, cy - r - 8, cx, cy - r + 8);
  txt('goal', cx, cy - r - 18, 'darkgreen', CENTER, CENTER, 16, false);
  // the pointer rises from the right (rest) toward the goal at the top
  const deg = state === 'stall' ? 90 * limit / need : 90;
  const c = Math.cos(radians(deg)), s = Math.sin(radians(deg));
  stroke(col); strokeWeight(6);
  line(cx, cy, cx + (r - 8) * c, cy - (r - 8) * s);
  if (state === 'tight') {                       // strain marks beside the pointer
    noFill(); stroke(col); strokeWeight(2);
    arc(cx, cy, r * 1.2, r * 1.2, radians(-108), radians(-98));
    arc(cx, cy, r * 1.2, r * 1.2, radians(-82), radians(-72));
  }
  fill(50); noStroke(); circle(cx, cy, 14);
}

// ---------------------------------------------------------------------------
// Five tasks
// ---------------------------------------------------------------------------
function drawTasks() {
  const score = 'Correct: ' + correctCount + ' of ' + TASKS.length;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    const line = panel(60, 210);
    line(score, 'black', 20, true);
    line(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + TASKS.length + '.'
      : 'Mastery is ' + MASTERY + ' of ' + TASKS.length + '. Press Try again.', ok ? 'darkgreen' : 'firebrick', 18, true);
    line('Remember: a limit that is too low stalls the joint, and a limit that is too high makes every mistake harder and hotter.', 'black', 16, false);
    return;
  }
  const t = TASKS[idx], best = bestOption(t), done = phase === 'feedback';
  txt('Task ' + (idx + 1) + ' of ' + TASKS.length + '     ' + score, canvasWidth / 2, 42, 'black', CENTER, TOP, 16, true);
  let y = 70;
  y += para(t.text, 16, y, canvasWidth - 32, 'black', 18, true) + 4;
  y += para('Torque needed: ' + t.need + ' percent of the joint’s maximum.', 16, y, canvasWidth - 32, 'black', 16, false);
  const markers = t.options.map((o, i) => {
    let col = 'black';
    if (done) col = o === best ? 'darkgreen' : (i === chosen ? 'firebrick' : 'black');
    else if (i === chosen) col = COL_LIMIT;
    return { value: o, label: String(o), col, bold: done ? o === best : i === chosen };
  });
  const bottom = drawGauge(y + 34, t.need, done, markers);

  const line = panel(bottom, drawHeight - bottom - 8);
  if (!done) {
    line('Which torque limit do you recommend? Choose one, then press Check. You get one try for each task.', 'black', 16, false);
    line('Rule of thumb: the smallest limit that is at least 1.5 times the need. Illustrative values.', 'dimgray', 16, false);
    return;
  }
  const msg = lastRight ? 'Correct: ' + best + ' percent. ' + t.why : 'Not quite. The best choice is ' + best + ' percent. ' + t.why;
  line(msg, lastRight ? 'darkgreen' : 'firebrick', 16, true);
  for (const o of t.options) {
    const st = jointState(o, t.need);
    const verdict = o === best ? 'the smallest that is enough' : (st === 'ok' ? 'more than needed' : 'too low');
    line(o + ' percent: ' + ratio(o, t.need) + ' × the need, ' + verdict, o === best ? 'darkgreen' : 'black', 16, o === best);
  }
}

// ---------------------------------------------------------------------------
// The torque gauge, 0 to 100 percent. Returns the y below it.
// ---------------------------------------------------------------------------
// zones colours the stall, little-margin and enough ranges. markers are drawn above the bar.
function drawGauge(y, need, zones, markers) {
  const x = 20, w = canvasWidth - 40, h = 28, enough = MARGIN * need;
  const toX = (v) => x + w * Math.min(v, 100) / 100;
  const clampX = (px, s, bold) => { textSize(16); textStyle(bold ? BOLD : NORMAL); const half = textWidth(s) / 2; textStyle(NORMAL); return constrain(px, x + half - 12, x + w - half + 12); };

  if (zones) {
    noStroke();
    fill(COL_STALL); rect(x, y, toX(need) - x, h);
    fill(COL_TIGHT); rect(toX(need), y, toX(enough) - toX(need), h);
    fill(COL_OK); rect(toX(enough), y, x + w - toX(enough), h);
    const names = [['stalls', x, toX(need)], ['little margin', toX(need), toX(enough)], ['enough', toX(enough), x + w]];
    for (const [name, a, b] of names) {
      textSize(16); textStyle(NORMAL);
      const half = textWidth(name) / 2 + 5, mid = (a + b) / 2;
      const crossed = markers.some(m => Math.abs(toX(m.value) - mid) < half);     // a marker would cut through the word
      if (b - a > 2 * half && !crossed) txt(name, mid, y + h / 2, 'black', CENTER, CENTER, 16, false);
    }
  } else {
    fill('#e9ecef'); noStroke(); rect(x, y, w, h);
  }
  noFill(); stroke(90); strokeWeight(1); rect(x, y, w, h);

  // markers above the bar
  for (const m of markers) {
    stroke(m.col); strokeWeight(m.bold ? 4 : 2);
    line(toX(m.value), y - 6, toX(m.value), y + h);
    txt(m.label, clampX(toX(m.value), m.label, m.bold), y - 17, m.col, CENTER, CENTER, 16, m.bold);
  }
  // the need, and the rule's 1.5 times point, below the bar
  stroke(30); strokeWeight(3); line(toX(need), y, toX(need), y + h + 6);
  const needLabel = 'needs ' + need;
  txt(needLabel, clampX(toX(need), needLabel, false), y + h + 17, 'black', CENTER, CENTER, 16, false);
  let bottom = y + h + 30;
  if (zones) {
    const s = enough > 100 ? '1.5 × ' + need + ' = ' + enough + ': off the scale' : '1.5 × ' + need + ' = ' + enough;
    if (enough <= 100) { stroke('#2e8b57'); strokeWeight(3); line(toX(enough), y - 4, toX(enough), y + h + 4); }
    txt(s, clampX(toX(enough), s, false), y + h + 38, 'darkgreen', CENTER, CENTER, 16, false);
    bottom = y + h + 52;
  }
  textSize(16); textStyle(NORMAL);
  const needX = clampX(toX(need), needLabel, false), needHalf = textWidth(needLabel) / 2;
  if (needX - needHalf > x + 12) txt('0', x, y + h + 17, 'gray', CENTER, CENTER, 16, false);
  if (needX + needHalf < x + w - 22) txt('100', x + w, y + h + 17, 'gray', CENTER, CENTER, 16, false);
  return bottom;
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

// Draws word-wrapped text and returns its height, so that nothing overflows on a narrow screen.
function para(s, x, y, w, col, size, bold) {
  textSize(size); textStyle(bold ? BOLD : NORMAL);
  const lines = [];
  let cur = '';
  for (const word of String(s).split(' ')) {
    const t = cur ? cur + ' ' + word : word;
    if (cur && textWidth(t) > w) { lines.push(cur); cur = word; } else cur = t;
  }
  lines.push(cur);
  const lead = Math.round(size * 1.3);
  noStroke(); fill(col || 'black'); textAlign(LEFT, TOP);
  lines.forEach((ln, i) => text(ln, x, y + i * lead));
  textStyle(NORMAL);
  return lines.length * lead;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;
const LABEL_W = 190;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160);
  actionBtn.position(canvasWidth - (narrow ? 120 : 140), drawHeight + ROW1);
  const sliderW = Math.max(60, canvasWidth - LABEL_W - 20);
  limitSlider.position(LABEL_W, drawHeight + ROW2); limitSlider.size(sliderW);
  needSlider.position(LABEL_W, drawHeight + ROW3); needSlider.size(sliderW);
  const gap = 8, w = (canvasWidth - 20 - gap * 2) / 3;
  optionBtns.forEach((b, i) => { b.position(10 + i * (w + gap), drawHeight + ROW2 + 6); b.size(w, 36); });
}

function drawControlLabels() {
  if (mode !== 'explore') return;
  txt('Torque limit: ' + limitSlider.value() + ' %', 10, drawHeight + ROW2 + 11, 'black');
  txt('Torque needed: ' + needSlider.value() + ' %', 10, drawHeight + ROW3 + 11, 'black');
}

function choose(i) {
  if (mode !== 'tasks' || phase !== 'ask') return;
  chosen = i;
  refreshControls();
}

function setMode(m) {
  mode = m;
  if (m === 'tasks') startTasks();
  refreshControls();
}

function startTasks() { idx = 0; correctCount = 0; phase = 'ask'; chosen = -1; }

function refreshControls() {
  const explore = mode === 'explore';
  for (const c of [limitSlider, needSlider]) { if (explore) c.show(); else c.hide(); }
  const quiz = !explore && phase !== 'done';
  optionBtns.forEach((b, i) => {
    if (!quiz) { b.hide(); return; }
    const t = TASKS[idx];
    b.show();
    b.html(t.options[i] + ' percent');
    let bg = '', weight = 'normal';
    if (phase === 'ask') {
      b.removeAttribute('disabled');
      if (i === chosen) { bg = '#ffe49a'; weight = 'bold'; }
    } else {
      b.attribute('disabled', '');
      if (t.options[i] === bestOption(t)) { bg = '#bfe5c7'; weight = 'bold'; } else if (i === chosen) { bg = '#f5b7b1'; }
    }
    b.style('background-color', bg);
    b.style('font-weight', weight);
    b.style('color', 'black');
  });
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  if (phase === 'done') actionBtn.html('Try again');
  else if (phase === 'ask') actionBtn.html('Check');
  else actionBtn.html(idx === TASKS.length - 1 ? 'See score' : 'Next task');
  if (phase === 'ask' && chosen < 0) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'tasks') return;
  if (phase === 'ask') {
    if (chosen < 0) return;
    lastRight = TASKS[idx].options[chosen] === bestOption(TASKS[idx]);
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < TASKS.length - 1) { idx++; phase = 'ask'; chosen = -1; } else { phase = 'done'; }
  } else if (phase === 'done') {
    startTasks();
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
