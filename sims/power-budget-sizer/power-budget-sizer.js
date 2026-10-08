// Power Budget Sizer - p5.js MicroSim
// CANVAS_HEIGHT: 522
// Learning objective (Apply, calculate): calculate the supply current needed for four arm setups by adding the
// motor currents and applying a 1.25 margin factor, to within 0.05 A, with at least 3 of 4 correct on the first
// attempt. Evidence: the number typed and committed with Check for each setup. Choosing a supply afterwards is a
// follow-up that gets feedback but is not scored.
// Rules: Total = the sum of the motor currents. Needed = Total x 1.25. A supply is adequate when its current
// rating is at or above Needed. The motor currents are illustrative. The supply voltage is 5 V in every setup.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 470;
let controlHeight = 52;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const MARGIN = 1.25, TOLERANCE = 0.05, SUPPLY_VOLTS = 5;
const IN_MIN = 0, IN_MAX = 50, IN_STEP = 0.05;        // the typed value: amperes, no default

// four setups, in fixed order. groups lists the loads: n of them at amps each.
const SETUPS = [
  { name: 'SO-ARM101 follower holding still', short: 'Follower holding still',
    groups: [{ n: 6, amps: 0.30, what: 'motors' }], options: [1, 2, 3],
    why: '1.80 × 1.25 = 2.25 A. Only the 3 A supply is at or above it.' },
  { name: 'SO-ARM101 follower in a busy moment', short: 'Follower, busy moment',
    groups: [{ n: 2, amps: 1.20, what: 'motors' }, { n: 4, amps: 0.30, what: 'motors' }], options: [3, 4, 5],
    why: '3.60 × 1.25 = 4.50 A. Only the 5 A supply is at or above it.' },
  { name: 'Classroom with three followers sharing one supply, all in a busy moment', short: 'Three followers, busy',
    groups: [{ n: 3, amps: 3.60, what: 'arms' }], options: [5, 10, 15],
    why: '10.80 × 1.25 = 13.50 A. Only the 15 A supply is at or above it.' },
  { name: 'SO-ARM101 leader arm held still', short: 'Leader held still',
    groups: [{ n: 6, amps: 0.15, what: 'motors' }], options: [0.5, 1, 2],
    why: '0.90 × 1.25 = 1.125 A. The 1 A supply is below it, so 2 A is the adequate option.' }
];
const MASTERY = 3;

// work in thousandths of an ampere so that sums such as 6 x 0.30 come out exact
SETUPS.forEach(s => {
  const milli = s.groups.reduce((a, g) => a + g.n * Math.round(g.amps * 1000), 0);
  s.total = milli / 1000;
  s.needed = Math.round(milli * MARGIN) / 1000;
  s.adequate = s.options.filter(o => o >= s.needed);
  s.motorText = s.groups.map(g => g.n + ' ' + g.what + ' at ' + g.amps.toFixed(2) + ' A each').join(' and ');
});

function fmtA(v) { const t = v.toFixed(3); return t.charAt(t.length - 1) === '0' ? v.toFixed(2) : t; }   // 2.25, 4.50, 1.125
function fmtSupply(v) { return String(v) + ' A'; }

// controls
let ampInput, checkBtn, supplyBtns = [], nextBtn;

// state
let phase = 'ask';                 // 'ask' (type the number), 'supply' (choose a supply), 'chosen' or 'done'
let idx = 0, correctCount = 0;
let typed = [];                    // the committed number for each setup
let chosen = [];                   // the supply chosen for each setup (not scored)
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  ampInput = createInput('', 'number');
  ampInput.attribute('min', IN_MIN); ampInput.attribute('max', IN_MAX); ampInput.attribute('step', IN_STEP);
  ampInput.attribute('placeholder', 'amps');
  ampInput.attribute('aria-label', 'Needed supply current in amperes');
  ampInput.input(refreshControls);
  ampInput.elt.addEventListener('keydown', e => { if (e.key === 'Enter') onCheck(); });

  checkBtn = createButton('Check');
  checkBtn.mouseClicked(onCheck);
  for (let i = 0; i < 3; i++) {
    const b = createButton('');
    b.mouseClicked(() => onSupply(i));
    supplyBtns.push(b);
  }
  nextBtn = createButton('Next setup');
  nextBtn.mouseClicked(onNext);

  layoutControls();
  refreshControls();
  describe('An arm setup is described with the current each motor draws, drawn as blocks laid end to end. The ' +
    'learner types the current the supply must deliver, after adding a 1.25 margin, then chooses one of three ' +
    'supplies. A number line shows the total, the margin and the supply ratings.');
}

function typedValue() {
  const v = parseFloat(ampInput.value());
  return (isFinite(v) && v >= IN_MIN && v <= IN_MAX) ? v : null;
}
function isRight(k) { return Math.abs(typed[k] - SETUPS[k].needed) <= TOLERANCE + 1e-9; }

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Power Budget Sizer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  txt(phase === 'done' ? 'All 4 setups done' : 'Setup ' + (idx + 1) + ' of ' + SETUPS.length, 10, sy, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + SETUPS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  const top = sy + size + 8;
  if (phase === 'done') { drawResults(top); return; }

  const s = SETUPS[idx], reveal = phase !== 'ask';
  const x = 8, w = canvasWidth - 16;
  // the setup: its name, the loads and the chart
  const chartH = reveal ? 126 : 46;
  let y = top + 8;
  const nameBottom = para(s.name, x + 10, y, w - 20, { size: size + 1, bold: true, measure: true });
  const listBottom = para(s.motorText + '.', x + 10, nameBottom + 4, w - 20, { size: size, lead: 'Motor currents:', leadCol: 'navy', measure: true });
  const infoBottom = para('Supply voltage: ' + SUPPLY_VOLTS + ' V. Margin factor: 1.25. The currents are illustrative.', x + 10, listBottom + 4, w - 20, { size: narrow ? 14 : 15, measure: true });
  const boxH = infoBottom + 8 + chartH + 8 - top;
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(x, top, w, boxH, 8);
  y = para(s.name, x + 10, y, w - 20, { size: size + 1, bold: true }) + 4;
  y = para(s.motorText + '.', x + 10, y, w - 20, { size: size, lead: 'Motor currents:', leadCol: 'navy' }) + 4;
  y = para('Supply voltage: ' + SUPPLY_VOLTS + ' V. Margin factor: 1.25. The currents are illustrative.', x + 10, y, w - 20, { size: narrow ? 14 : 15, col: 'dimgray' }) + 8;
  drawChart(s, { x: x + 14, y: y, w: w - 28, h: chartH }, reveal);

  // the question, or the feedback
  const ty = top + boxH + 6, th = drawHeight - ty - 6;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, ty, w, th, 10);
  drawText(s, x + 10, ty + 8, w - 20, th - 16, size);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The chart. Before the commit: the motor currents as blocks laid end to end, with no scale.
// After it: the same blocks on an ampere axis, with the margin, the needed current and the three supply ratings.
// ---------------------------------------------------------------------------
function drawChart(s, R, reveal) {
  const maxA = s.options[s.options.length - 1];
  const k = R.w / (maxA * 1.04);                           // pixels per ampere
  const X = a => R.x + a * k;
  const barY = reveal ? R.y + 34 : R.y + 4, barH = 30;
  // the motor blocks
  let a = 0;
  s.groups.forEach(g => {
    for (let i = 0; i < g.n; i++) {
      fill('darkorange'); stroke('saddlebrown'); strokeWeight(1.5);
      rect(X(a), barY, g.amps * k, barH, 3);
      const label = g.amps.toFixed(2);
      textSize(13); textStyle(NORMAL);
      if (tw(label) + 6 <= g.amps * k) txt(label, X(a) + g.amps * k / 2, barY + barH / 2 + 1, 'black', CENTER, CENTER, 13);
      a += g.amps;
    }
  });
  if (!reveal) return;
  // the margin, as a striped block from the total to the needed current
  const x1 = X(s.total), x2 = X(s.needed);
  fill('khaki'); stroke('darkgoldenrod'); strokeWeight(1.5); rect(x1, barY, x2 - x1, barH, 3);
  stroke('darkgoldenrod'); strokeWeight(1);
  for (let hx = x1 + 5; hx < x2 - 1; hx += 6) line(hx, barY + barH - 3, Math.min(hx + 6, x2 - 1), barY + 3);
  // the axis
  const axY = barY + barH + 10;
  stroke('black'); strokeWeight(1.5); line(X(0), axY, X(maxA * 1.03), axY);
  const step = maxA <= 2 ? 0.5 : (maxA <= 5 ? 1 : 5);
  for (let v = 0; v <= maxA + 1e-9; v += step) {
    stroke('black'); line(X(v), axY, X(v), axY + 5);
    txt(String(v), X(v), axY + 15, 'black', CENTER, CENTER, 13);
  }
  txt('A', X(maxA * 1.03) - 2, axY - 9, 'black', RIGHT, CENTER, 13);
  // the needed current: a line through the bar and the axis, with its value
  stroke('crimson'); strokeWeight(2.5); line(x2, barY - 6, x2, axY + 5); strokeWeight(1);
  const lbl = 'needed ' + fmtA(s.needed) + ' A';
  textSize(14); textStyle(BOLD);
  const lw = tw(lbl); textStyle(NORMAL);
  const lx = Math.min(Math.max(x2, R.x + lw / 2), R.x + R.w - lw / 2);
  txt(lbl, lx, R.y + 24 - 6, 'crimson', CENTER, CENTER, 14, true);
  txt('total ' + fmtA(s.total) + ' A', Math.max(X(s.total / 2), R.x + 44), R.y + 6, 'black', CENTER, CENTER, 13);
  // the three supply ratings, as flags under the axis
  const pick = chosen[idx];
  s.options.forEach(o => {
    const judged = phase === 'chosen';
    textSize(13); textStyle(BOLD);
    const fw = tw(fmtSupply(o)) + (judged ? 30 : 16);
    textStyle(NORMAL);
    const ok = o >= s.needed, fx = X(o), fy = axY + 28;               // the flags sit below the tick labels
    const bx = Math.min(Math.max(fx - fw / 2, R.x - 8), R.x + R.w + 8 - fw);
    stroke('dimgray'); strokeWeight(1); line(fx, axY + 23, fx, fy);
    fill(judged ? (ok ? 'palegreen' : 'mistyrose') : 'whitesmoke');
    stroke(pick === o ? 'black' : (judged ? (ok ? 'darkgreen' : 'firebrick') : 'gray')); strokeWeight(pick === o ? 3 : 1.5);
    rect(bx, fy, fw, 22, 5);
    strokeWeight(1);
    txt(fmtSupply(o), bx + (judged ? fw / 2 - 7 : fw / 2), fy + 12, 'black', CENTER, CENTER, 13, true);
    if (judged) drawMark(bx + fw - 11, fy + 11, ok, 4);
  });
}

// ---------------------------------------------------------------------------
// The question and the feedback
// ---------------------------------------------------------------------------
function drawText(s, x, y, w, maxH, size) {
  if (phase === 'ask') {
    let yy = para('What current must the supply deliver?', x, y, w, { size: size, bold: true }) + 4;
    paraFit('Add the motor currents, apply the margin factor, then type your answer in amperes and press Check. You get one attempt.',
      x, yy, w, maxH - (yy - y), { size: size, col: 'dimgray', tag: 'prompt' });
    return;
  }
  const ok = isRight(idx);
  const msg = ok ? 'Correct: ' + fmtA(s.needed) + ' A. ' + s.why
    : 'Not quite. Add the motor currents (' + fmtA(s.total) + ' A), then multiply by 1.25 to get ' + fmtA(s.needed) + ' A. ' + s.why;
  let follow;
  if (phase === 'supply') follow = 'Now choose a supply below. This choice is not scored.';
  else {
    const c = chosen[idx], good = c >= s.needed;
    follow = 'You chose the ' + fmtSupply(c) + ' supply. ' + (good
      ? 'It is at or above ' + fmtA(s.needed) + ' A, so it is adequate. A larger rating is safe, because the load decides the current.'
      : 'It is below ' + fmtA(s.needed) + ' A, so it would be run past its limit. The adequate option is ' + fmtSupply(s.adequate[0]) + '.');
  }
  let sz = size;
  const need = z => para(msg, x, 0, w, { size: z, measure: true }) + 6 + para(follow, x, 0, w, { size: z, bold: phase === 'supply', measure: true });
  while (sz > 12 && need(sz) > maxH) sz--;
  if (need(sz) > maxH + 1) layoutIssues.push('feedback overflows by ' + Math.round(need(sz) - maxH) + 'px');
  const yy = para(msg, x, y, w, { size: sz, col: ok ? 'darkgreen' : 'firebrick' }) + 6;
  para(follow, x, yy, w, { size: sz, bold: phase === 'supply' });
}

// ---------------------------------------------------------------------------
// The final screen
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, 268, 10);
  let y = top + 10;
  txt('Correct: ' + correctCount + ' of ' + SETUPS.length, x + 12, y, 'black', LEFT, TOP, 20, true);
  y += 30;
  y = para(ok ? 'Mastery reached (3 of 4 or better).' : 'Mastery is 3 of 4. Press Try again.', x + 12, y, w - 24,
    { size: 16, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 8;
  const fs = narrow ? 14 : 16, c2 = x + w * (narrow ? 0.66 : 0.60), c3 = x + w * (narrow ? 0.88 : 0.84);
  txt('Setup', x + 40, y + 10, 'dimgray', LEFT, CENTER, fs, true);
  txt('Needed', c2, y + 10, 'dimgray', CENTER, CENTER, fs, true);
  txt('Supply', c3, y + 10, 'dimgray', CENTER, CENTER, fs, true);
  y += 26;
  SETUPS.forEach((s, i) => {
    if (i % 2 === 0) { fill('whitesmoke'); noStroke(); rect(x + 6, y, w - 12, 32, 4); }
    drawMark(x + 22, y + 16, isRight(i), 6);
    lineFit((i + 1) + '. ' + s.short, x + 40, y + 17, c2 - 44 - (x + 40), { size: fs });
    txt(fmtA(s.needed) + ' A', c2, y + 17, 'black', CENTER, CENTER, fs, true);
    txt(fmtSupply(s.adequate[0]), c3, y + 17, 'black', CENTER, CENTER, fs, true);
    y += 32;
  });
  y += 8;
  para('Needed = total motor current × 1.25. Pick a supply rated at or above it.', x + 12, y, w - 24, { size: narrow ? 15 : 16, col: 'dimgray' });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  const y = drawHeight + 13;
  ampInput.position(narrow ? 150 : 250, y - 1);
  ampInput.size(narrow ? 70 : 90);
  checkBtn.position(canvasWidth - (narrow ? 114 : 170), y);
  checkBtn.size(narrow ? 104 : 160);
  supplyBtns.forEach((b, i) => { b.position((narrow ? 10 : 150) + i * (narrow ? 62 : 76), y); b.size(narrow ? 56 : 68); });
  nextBtn.position(canvasWidth - (narrow ? 124 : 170), y);
  nextBtn.size(narrow ? 114 : 160);
}

function drawControlLabels() {
  const y = drawHeight + 25;
  if (phase === 'ask') txt(narrow ? 'Needed current (A):' : 'Needed supply current (A):', 10, y, 'black', LEFT, CENTER, narrow ? 15 : 16);
  else if (!narrow) txt('Choose a supply:', 10, y, 'black');
}

function refreshControls() {
  const show = (c, on) => { if (on) c.show(); else c.hide(); };
  const able = (c, on) => { if (on) c.removeAttribute('disabled'); else c.attribute('disabled', ''); };
  show(ampInput, phase === 'ask'); show(checkBtn, phase === 'ask');
  supplyBtns.forEach(b => show(b, phase === 'supply' || phase === 'chosen'));
  show(nextBtn, phase !== 'ask');
  if (phase === 'ask') { able(checkBtn, typedValue() !== null); return; }
  if (phase === 'done') { nextBtn.html('Try again'); able(nextBtn, true); return; }
  SETUPS[idx].options.forEach((o, i) => { supplyBtns[i].html(fmtSupply(o)); able(supplyBtns[i], phase === 'supply'); });
  nextBtn.html(idx === SETUPS.length - 1 ? 'See score' : 'Next setup');
  able(nextBtn, phase === 'chosen');
}

function onCheck() {
  if (phase !== 'ask' || typedValue() === null) return;
  typed[idx] = typedValue();                              // one attempt at the number
  if (isRight(idx)) correctCount++;
  phase = 'supply';
  refreshControls();
}

function onSupply(i) {
  if (phase !== 'supply') return;
  chosen[idx] = SETUPS[idx].options[i];                   // a follow-up: shown with feedback, not scored
  phase = 'chosen';
  refreshControls();
}

function onNext() {
  if (phase === 'chosen') {
    ampInput.value('');
    if (idx < SETUPS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; typed = []; chosen = []; ampInput.value(''); phase = 'ask';
  }
  refreshControls();
}

// ---------------------------------------------------------------------------
// Text helpers. Words are wrapped by hand so that every block of text knows its own height.
// ---------------------------------------------------------------------------
function tw(s) { return (typeof fontWidth === 'function') ? fontWidth(s) : textWidth(s); }

function setFont(size, bold) { textSize(size); textStyle(bold ? BOLD : NORMAL); }

function wrapLines(str, maxW, size, bold) {
  setFont(size, bold);
  const out = [];
  String(str).split('\n').forEach(par => {
    let ln = '';
    par.split(' ').forEach(word => {
      let wd = word;
      while (tw(wd) > maxW && wd.length > 1) {   // a single word wider than the box
        if (ln) { out.push(ln); ln = ''; }
        let n = wd.length - 1;
        while (n > 1 && tw(wd.substring(0, n)) > maxW) n--;
        out.push(wd.substring(0, n)); wd = wd.substring(n);
      }
      const t = ln ? ln + ' ' + wd : wd;
      if (!ln || tw(t) <= maxW) ln = t; else { out.push(ln); ln = wd; }
    });
    out.push(ln);
  });
  textStyle(NORMAL);
  return out;
}

// draws wrapped text with its top-left corner at (x, y) and returns the y just below it.
// o: size, bold, col, center, lh (line height), lead (a colored label that starts the first line), leadCol, measure
function para(str, x, y, w, o) {
  o = o || {};
  const size = o.size || defaultTextSize;
  const lh = o.lh || Math.round(size * 1.3);
  const full = o.lead ? o.lead + ' ' + str : str;
  const lines = wrapLines(full, w, size, o.bold);
  if (!o.measure) {
    noStroke(); setFont(size, o.bold); textAlign(o.center ? CENTER : LEFT, TOP);
    lines.forEach((ln, i) => {
      if (i === 0 && o.lead && ln.indexOf(o.lead) === 0) {
        fill(o.leadCol || 'black'); text(o.lead, x, y);
        fill(o.col || 'black'); text(ln.substring(o.lead.length), x + tw(o.lead), y);
      } else {
        fill(o.col || 'black'); text(ln, o.center ? x + w / 2 : x, y + i * lh);
      }
    });
    textStyle(NORMAL);
  }
  return y + lines.length * lh;
}

// like para, but steps the text size down (not below o.min) until the text fits in maxH
function paraFit(str, x, y, w, maxH, o) {
  o = Object.assign({}, o || {});
  let size = o.size || defaultTextSize;
  const minSize = o.min || 12;
  const measure = s => para(str, x, y, w, Object.assign({}, o, { size: s, lh: 0, measure: true })) - y;
  while (size > minSize && measure(size) > maxH) size--;
  if (measure(size) > maxH + 1) layoutIssues.push((o.tag || 'text') + ' overflows by ' + Math.round(measure(size) - maxH) + 'px');
  return para(str, x, y, w, Object.assign({}, o, { size: size, lh: 0 }));
}

// one line of text, vertically centered on y (o.align: LEFT, CENTER or RIGHT). The size steps down until the
// line fits maxW. A line that still does not fit is reported in layoutIssues.
function lineFit(str, x, y, maxW, o) {
  o = o || {};
  let size = o.size || defaultTextSize;
  const minSize = o.min || 12;
  setFont(size, o.bold);
  while (size > minSize && tw(str) > maxW) { size--; setFont(size, o.bold); }
  if (tw(str) > maxW + 1) layoutIssues.push('line "' + str + '" is ' + Math.round(tw(str) - maxW) + 'px too wide');
  noStroke(); fill(o.col || 'black'); textAlign(o.align || LEFT, CENTER);
  text(str, x, y);
  textStyle(NORMAL);
}

// a tick (ok) or a cross (not ok), drawn with lines so it looks the same in every font
function drawMark(cx, cy, ok, s) {
  noFill(); strokeWeight(3);
  if (ok) {
    stroke('darkgreen');
    line(cx - s, cy, cx - s * 0.3, cy + s * 0.7);
    line(cx - s * 0.3, cy + s * 0.7, cx + s, cy - s * 0.7);
  } else {
    stroke('firebrick');
    line(cx - s * 0.8, cy - s * 0.8, cx + s * 0.8, cy + s * 0.8);
    line(cx - s * 0.8, cy + s * 0.8, cx + s * 0.8, cy - s * 0.8);
  }
  strokeWeight(1);
}

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
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  narrow = canvasWidth < 640;
}
