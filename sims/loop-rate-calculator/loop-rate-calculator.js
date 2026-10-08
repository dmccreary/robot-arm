// Loop Rate Calculator - p5.js MicroSim
// CANVAS_HEIGHT: 602
// Learning objective (Apply, calculate): calculate the period of a control loop and the rate that a naive loop and
// a scheduled loop actually achieve, for six loops, to within 0.1 of the unit shown, with at least 5 of 6 correct
// on the first attempt. Evidence: the number committed with Check in each problem. Explore mode is exploration,
// not evidence.
// Rules (Chapter 11, "The Control Loop" and "Control Rate, Timing Jitter, and Latency"):
//   period (ms)         = 1000 / target rate (Hz)
//   naive rate (Hz)     = 1000 / (work + period)      the loop does its work, then sleeps one whole period
//   scheduled rate (Hz) = the target rate when work <= period, otherwise 1000 / work
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 480;
let controlHeight = 122;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;
let layoutNotes = [];          // filled by txt() and the panels when text does not fit (read by the tests)

// adjustable quantities (the chapter's Content table)
const RATE_MIN = 10, RATE_MAX = 200, RATE_STEP = 10, RATE_DEFAULT = 50;      // hertz
const WORK_MIN = 0, WORK_MAX = 50, WORK_STEP = 1, WORK_DEFAULT = 8;          // milliseconds

// six problems in fixed order (illustrative numbers). ask says which result is wanted.
const PROBLEMS = [
  { text: 'What is the period of a 50 Hz loop?', rate: 50, work: 0, ask: 'period', unit: 'ms', answer: 20.0,
    why: '1000 / 50 = 20 ms.' },
  { text: 'What is the period of a 60 Hz loop?', rate: 60, work: 0, ask: 'period', unit: 'ms', answer: 16.7,
    why: '1000 / 60 = 16.67 ms.' },
  { text: 'A naive loop targets 50 Hz and its work takes 5 ms. What rate does it achieve?', rate: 50, work: 5, ask: 'naive', unit: 'Hz', answer: 40.0,
    why: 'Each cycle is 5 + 20 = 25 ms, and 1000 / 25 = 40 Hz.' },
  { text: 'A scheduled loop targets 50 Hz and its work takes 5 ms. What rate does it achieve?', rate: 50, work: 5, ask: 'scheduled', unit: 'Hz', answer: 50.0,
    why: 'The work fits inside the 20 ms period, so the loop keeps the target rate.' },
  { text: 'A scheduled loop targets 50 Hz and its work takes 25 ms. What rate does it achieve?', rate: 50, work: 25, ask: 'scheduled', unit: 'Hz', answer: 40.0,
    why: 'The work is longer than the period, so each cycle is 25 ms and 1000 / 25 = 40 Hz.' },
  { text: 'A naive loop targets 100 Hz and its work takes 4 ms. What rate does it achieve?', rate: 100, work: 4, ask: 'naive', unit: 'Hz', answer: 71.4,
    why: 'The period is 10 ms, each cycle is 4 + 10 = 14 ms, and 1000 / 14 = 71.4 Hz.' }
];
const TOLERANCE = 0.1;
const MASTERY = 5;

// controls
let modeSelect, actionBtn, rateSlider, workSlider, answerInput;

// state
let mode = 'explore';          // 'explore' or 'problems'
let phase = 'ask';             // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0, lastRight = false, lastTyped = '';

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option('Six problems', 'problems');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  rateSlider = createSlider(RATE_MIN, RATE_MAX, RATE_DEFAULT, RATE_STEP);
  workSlider = createSlider(WORK_MIN, WORK_MAX, WORK_DEFAULT, WORK_STEP);

  answerInput = createInput('');
  answerInput.attribute('inputmode', 'decimal');
  answerInput.attribute('aria-label', 'Your answer');
  answerInput.input(refreshControls);
  answerInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter' && phase === 'ask') onAction(); });

  layoutControls();
  setMode('explore');
  describe('Three cards show the period of a control loop and the rates that a naive loop and a scheduled loop ' +
    'achieve. Two bars show a few cycles of each loop: orange for the work and blue for the waiting, with a mark ' +
    'at every moment when a cycle is due. Sliders set the target rate and the work per cycle. In the six ' +
    'problems you type a period or a rate and press Check.');
}

// ---------------------------------------------------------------------------
// The loop arithmetic
// ---------------------------------------------------------------------------
function loopRates(rate, work) {
  const period = 1000 / rate;
  return { rate: rate, work: work, period: period, fits: work <= period,
    naive: 1000 / (work + period), scheduled: work <= period ? rate : 1000 / work };
}
function tidy(x) { return Number.isInteger(x) ? String(x) : x.toFixed(1); }

// what the learner typed, as a number (or null): accepts a comma for the decimal point
function parseAnswer(s) {
  const t = String(s).trim().replace(',', '.').replace('−', '-');
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
  return Number(t);
}
function isCorrect(p, typed) { return Math.abs(typed - p.answer) <= TOLERANCE + 1e-9; }

function draw() {
  updateCanvasSize();
  layoutNotes = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Loop Rate Calculator', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  if (mode === 'explore') {
    const k = loopRates(rateSlider.value(), workSlider.value());
    drawCards(k, '');
    drawTimelines(k);
    drawWorking(k);
  } else if (phase === 'done') {
    drawDone();
  } else {
    const p = PROBLEMS[idx];
    if (phase === 'ask') drawRules();
    else { const k = loopRates(p.rate, p.work); drawCards(k, p.ask); drawTimelines(k); }
    drawProblem(p);
  }
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The three results
// ---------------------------------------------------------------------------
function drawCards(k, lit) {
  const items = [['period', 'Period', k.period.toFixed(1) + ' ms'], ['naive', 'Naive loop', k.naive.toFixed(1) + ' Hz'],
    ['scheduled', narrow ? 'Scheduled' : 'Scheduled loop', k.scheduled.toFixed(1) + ' Hz']];
  const x0 = 8, gap = 6, w = (canvasWidth - 16 - 2 * gap) / 3, top = 40, h = 52;
  items.forEach((it, i) => {
    const x = x0 + i * (w + gap), on = it[0] === lit;
    fill(on ? 'lightyellow' : 'white'); stroke(on ? 'goldenrod' : 'silver'); strokeWeight(on ? 3 : 1);
    rect(x, top, w, h, 8);
    txt(it[1], x + w / 2, top + 5, 'black', CENTER, TOP, 16, false);
    txt(it[2], x + w / 2, top + 27, 'navy', CENTER, TOP, 18, true);
  });
}

// ---------------------------------------------------------------------------
// A few cycles of each loop, drawn against the schedule
// ---------------------------------------------------------------------------
function drawTimelines(k) {
  const L = 16, R = canvasWidth - 16, barH = 24;
  const win = Math.max(4 * k.period, 2.2 * (k.work + k.period));       // milliseconds shown
  const X = t => L + (R - L) * Math.min(t, win) / win;
  const rows = [
    { y: 124, label: 'Naive loop: work, then sleep one whole period', cycle: k.work + k.period, wait: k.period },
    { y: 186, label: narrow ? 'Scheduled loop: work, then wait for the tick' : 'Scheduled loop: work, then wait only until the next tick',
      cycle: k.fits ? k.period : k.work, wait: k.fits ? k.period - k.work : 0 }
  ];
  for (const r of rows) {
    txt(r.label, L, r.y - 14, 'black', LEFT, CENTER, 16, false);
    for (let t = 0; t < win - 1e-9; t += r.cycle) {
      stroke('dimgray'); strokeWeight(1);
      if (k.work > 0) { fill('darkorange'); rect(X(t), r.y, X(t + k.work) - X(t), barH); }
      if (r.wait > 0) { fill('lightskyblue'); rect(X(t + k.work), r.y, X(t + k.work + r.wait) - X(t + k.work), barH); }
    }
  }
  // the schedule: a mark at every moment when a cycle is due
  const ticks = Math.floor(win / k.period + 1e-9);
  stroke('black'); strokeWeight(ticks > 14 ? 1 : 2);
  for (let i = 0; i <= ticks; i++) {
    const x = X(i * k.period);
    for (const r of rows) for (let y = r.y - 3; y < r.y + barH + 3; y += 8) line(x, y, x, min(y + 4, r.y + barH + 3));
  }
  txt('0', L, 224, 'black', LEFT, CENTER, 16, false);
  txt(tidy(Math.round(win * 10) / 10) + ' ms', R, 224, 'black', RIGHT, CENTER, 16, false);
  // legend
  const ly = 248;
  fill('darkorange'); stroke('dimgray'); strokeWeight(1); rect(L, ly - 8, 16, 16);
  txt('work', L + 22, ly, 'black', LEFT, CENTER, 16, false);
  fill('lightskyblue'); stroke('dimgray'); rect(L + 70, ly - 8, 16, 16);
  txt('waiting', L + 92, ly, 'black', LEFT, CENTER, 16, false);
  stroke('black'); strokeWeight(2);
  for (let y = ly - 8; y < ly + 8; y += 8) line(L + 166, y, L + 166, y + 4);
  txt(narrow ? 'due every ' + tidy(Math.round(k.period * 10) / 10) + ' ms' : 'a cycle is due every ' + tidy(Math.round(k.period * 10) / 10) + ' ms',
    L + 174, ly, 'black', LEFT, CENTER, 16, false);
}

// the rules, shown in place of the bars while a problem is waiting for its answer
function drawRules() {
  const x = 8, w = canvasWidth - 16, top = 42, h = 220;
  fill('lightyellow'); stroke('goldenrod'); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  y = para('Rules, with times in milliseconds:', tx, y, tw, 'black', 16, true);
  y = para('period = 1000 / target rate', tx, y + 4, tw, 'black', 16, false);
  y = para('Naive loop: each cycle is the work plus one period, so rate = 1000 / (work + period)', tx, y + 6, tw, 'black', 16, false);
  y = para('Scheduled loop: the target rate when the work fits inside the period, and 1000 / work when it does not', tx, y + 6, tw, 'black', 16, false);
  if (y > top + h - 2) layoutNotes.push('rules overflow by ' + Math.round(y - (top + h - 2)) + ' px');
}

// ---------------------------------------------------------------------------
// Panels under the bars
// ---------------------------------------------------------------------------
function panel() {
  const x = 8, w = canvasWidth - 16, top = 268, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  return { tx: x + 10, tw: w - 20, y: top + 8, bottom: top + h - 2 };
}

function drawWorking(k) {
  const P = panel(), tx = P.tx, tw = P.tw;
  let y = P.y;
  const p = tidy(Math.round(k.period * 100) / 100), cyc = tidy(Math.round((k.work + k.period) * 100) / 100);
  y = para('Period = 1000 / ' + k.rate + ' = ' + k.period.toFixed(1) + ' ms', tx, y, tw, 'black', 16, true);
  y = para('Naive: each cycle is ' + k.work + ' + ' + p + ' = ' + cyc + ' ms, so 1000 / ' + cyc + ' = ' + k.naive.toFixed(1) + ' Hz', tx, y + 4, tw, 'black', 16, true);
  y = para(k.fits ? 'Scheduled: the work fits inside the period (' + k.work + ' ≤ ' + p + '), so it keeps ' + k.scheduled.toFixed(1) + ' Hz'
    : 'Scheduled: the work is longer than the period (' + k.work + ' > ' + p + '), so each cycle is ' + k.work + ' ms and 1000 / ' + k.work + ' = ' + k.scheduled.toFixed(1) + ' Hz',
    tx, y + 4, tw, 'black', 16, true);
  const note = k.work === 0 ? 'With no work at all, both loops run at the target rate.'
    : k.fits ? 'The naive loop is below its target as soon as there is any work. The scheduled loop is not.'
    : 'No loop can keep a rate when the work does not fit in the period. Lower the rate, or do less work.';
  if (y + 6 + para(note, tx, 0, tw, 'dimgray', 16, false, true) <= P.bottom) y = para(note, tx, y + 6, tw, 'dimgray', 16, false);
  if (y > P.bottom) layoutNotes.push('working panel overflow by ' + Math.round(y - P.bottom) + ' px');
}

function drawProblem(p) {
  const P = panel(), tx = P.tx, tw = P.tw;
  let y = P.y;
  y = para('Problem ' + (idx + 1) + ' of ' + PROBLEMS.length + ' (illustrative numbers)', tx, y, tw, 'black', 16, true);
  y = para(p.text, tx, y + 4, tw, 'black', narrow ? 16 : 18, false);
  if (phase === 'ask') {
    y = para('Answer in ' + p.unit + ', to within ' + TOLERANCE + '. Type it below and press Check.', tx, y + 8, tw, 'navy', 16, true);
  } else {
    const val = p.answer.toFixed(1) + ' ' + p.unit;
    y = para((lastRight ? 'Correct: ' + val + '. ' : 'Not quite. The answer is ' + val + '. ') + p.why, tx, y + 8, tw,
      lastRight ? 'darkgreen' : 'firebrick', 16, false);
    y = para('You typed ' + lastTyped + '.', tx, y + 4, tw, 'black', 16, false);
  }
  if (y > P.bottom) layoutNotes.push('problem panel overflow by ' + Math.round(y - P.bottom) + ' px');
}

function drawDone() {
  const x = 8, w = canvasWidth - 16, top = 42, h = drawHeight - top - 8;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, h, 10);
  const tx = x + 10, tw = w - 20;
  let y = top + 8;
  const ok = correctCount >= MASTERY;
  y = para('Correct: ' + correctCount + ' of ' + PROBLEMS.length, tx, y, tw, 'black', 18, true);
  y = para(ok ? 'Mastery reached. You needed ' + MASTERY + ' of ' + PROBLEMS.length + '.'
    : 'Mastery is ' + MASTERY + ' of ' + PROBLEMS.length + '. Press Try again.', tx, y + 4, tw, ok ? 'darkgreen' : 'firebrick', 18, true);
  y = para('A naive loop does its work and then sleeps a whole period, so it always runs slower than its target.', tx, y + 10, tw, 'black', 16, false);
  y = para('A scheduled loop sleeps only for the time that is left, so it keeps its target while the work fits inside the period.', tx, y + 6, tw, 'black', 16, false);
  y = para('A faster target is not always better. The work must fit inside the period.', tx, y + 6, tw, 'black', 16, false);
  y = para('Switch to Explore to try your own rate and work time.', tx, y + 10, tw, 'dimgray', 16, false);
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 46, ROW3 = 84;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 130 : 160, 28);
  const aw = narrow ? 110 : 130;
  actionBtn.position(canvasWidth - aw - 10, drawHeight + ROW1);
  actionBtn.size(aw, 28);
  const labelW = narrow ? 150 : 200;
  const sliderW = max(60, canvasWidth - labelW - 28);
  [rateSlider, workSlider].forEach((s, i) => {
    s.position(labelW + 6, drawHeight + [ROW2, ROW3][i]);
    s.size(sliderW);
  });
  answerInput.position(120, drawHeight + ROW2);
  answerInput.size(narrow ? 100 : 130, 22);
}

function drawControlLabels() {
  if (mode === 'explore') {
    txt((narrow ? 'Target: ' : 'Target rate: ') + rateSlider.value() + ' Hz', 10, drawHeight + ROW2 + 11, 'black');
    txt((narrow ? 'Work: ' : 'Work per cycle: ') + workSlider.value() + ' ms', 10, drawHeight + ROW3 + 11, 'black');
  } else if (phase !== 'done') {
    txt('Your answer:', 10, drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, true);
    txt(PROBLEMS[idx].unit, (narrow ? 232 : 262), drawHeight + ROW2 + 14, 'black', LEFT, CENTER, 16, false);
    txt('Correct: ' + correctCount + ' of ' + PROBLEMS.length, 10, drawHeight + ROW3 + 14, 'black', LEFT, CENTER, 16, true);
    if (phase === 'ask' && answerInput.value().trim() !== '' && parseAnswer(answerInput.value()) === null)
      txt('Type a number', canvasWidth - 10, drawHeight + ROW3 + 14, 'firebrick', RIGHT, CENTER, 16, false);
  }
}

function setMode(m) {
  mode = m;
  if (m === 'problems') { idx = 0; phase = 'ask'; correctCount = 0; answerInput.value(''); }
  refreshControls();
}

function refreshControls() {
  const explore = mode === 'explore';
  [rateSlider, workSlider].forEach(c => explore ? c.show() : c.hide());
  if (!explore && phase !== 'done') answerInput.show(); else answerInput.hide();
  if (phase === 'ask') answerInput.removeAttribute('disabled'); else answerInput.attribute('disabled', '');
  if (explore) { actionBtn.hide(); return; }
  actionBtn.show();
  actionBtn.html(phase === 'ask' ? 'Check' : phase === 'done' ? 'Try again' : idx === PROBLEMS.length - 1 ? 'See score' : 'Next problem');
  if (phase === 'ask' && parseAnswer(answerInput.value()) === null) actionBtn.attribute('disabled', ''); else actionBtn.removeAttribute('disabled');
}

function onAction() {
  if (mode !== 'problems') return;
  if (phase === 'ask') {
    const typed = parseAnswer(answerInput.value());
    if (typed === null) return;                       // not a number yet: the attempt is not used up
    lastTyped = answerInput.value().trim();
    lastRight = isCorrect(PROBLEMS[idx], typed);
    if (lastRight) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < PROBLEMS.length - 1) { idx++; phase = 'ask'; answerInput.value(''); } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; phase = 'ask'; answerInput.value('');
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
