// Accuracy and Repeatability Targets - p5.js MicroSim
// CANVAS_HEIGHT: 512
// Learning objective (Understand, classify): classify four sets of landing points as accurate or not and
// repeatable or not, using a stated distance threshold, with at least 3 of 4 sets classified correctly on the
// first attempt. Evidence: the label committed with Check for each set. Reading the numbers, and seeing the
// measured values after an answer, is exploration, not evidence.
// Rules: the mean offset is the average of the five x values and the five y values. Accurate means the mean is
// at most 0.5 mm from the target. Repeatable means no point is more than 0.5 mm from the mean. The 0.5 mm
// threshold is a teaching value and the landing points are illustrative. Every plot uses the same scale.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 52;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const THRESHOLD = 0.5;             // mm, a teaching value
const PLOT_HALF = 5;               // every plot shows 5 mm each way from the target

// four sets of five landing points: offsets (x, y) in mm from the target at (0, 0). Set 2 is the chapter's example.
const SETS = [
  { pts: [[0.1, 0.0], [-0.1, 0.2], [0.2, -0.1], [0.0, 0.1], [-0.2, -0.2]] },
  { pts: [[2.1, 1.0], [1.9, 1.2], [2.2, 0.9], [2.0, 1.1], [1.8, 0.8]] },
  { pts: [[1.8, -1.6], [-1.5, 1.9], [0.4, 2.1], [-2.0, -0.9], [1.3, -1.5]] },
  { pts: [[3.8, -2.6], [0.5, 0.9], [2.4, 1.1], [0.0, -1.9], [3.3, -2.5]] }
];
const LABELS = ['Accurate and repeatable', 'Repeatable, not accurate', 'Accurate on average, not repeatable', 'Neither'];
const MASTERY = 3;
const QUESTION = 'Is this arm accurate, repeatable, both, or neither?';

// measure each set once: mean offset, distance of the mean from the target, largest distance from the mean
SETS.forEach(s => {
  const n = s.pts.length;
  s.mx = s.pts.reduce((a, p) => a + p[0], 0) / n;
  s.my = s.pts.reduce((a, p) => a + p[1], 0) / n;
  s.offset = Math.hypot(s.mx, s.my);
  s.spread = Math.max.apply(null, s.pts.map(p => Math.hypot(p[0] - s.mx, p[1] - s.my)));
  // compare the values as shown (two decimals), so the label always agrees with the numbers on screen
  s.accurate = round2(s.offset) <= THRESHOLD;
  s.repeatable = round2(s.spread) <= THRESHOLD;
  s.label = s.accurate ? (s.repeatable ? 0 : 2) : (s.repeatable ? 1 : 3);
  const o = f2(s.offset), sp = f2(s.spread);
  s.why = [
    'The mean is ' + o + ' mm from the target (≤ 0.5) and no point is more than ' + sp + ' mm from the mean (≤ 0.5).',
    'The points are tightly grouped (' + sp + ' mm), but the group sits ' + o + ' mm from the target.',
    'The mean is on the target, but the points are spread up to ' + sp + ' mm from the mean.',
    'The group is ' + o + ' mm from the target and spread up to ' + sp + ' mm.'
  ][s.label];
});

function round2(v) { return Math.round(v * 100) / 100; }
function f2(v) { const r = round2(v); return (Object.is(r, -0) ? 0 : r).toFixed(2); }
function f1(v) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(1); }

// controls
let labelSelect, actionBtn;

// state
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0;
let picks = [];                    // committed label index for each set
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  labelSelect = createSelect();
  labelSelect.option('Choose a label', '');
  LABELS.forEach((l, i) => labelSelect.option(l, String(i)));
  labelSelect.selected('');
  labelSelect.changed(refreshControls);

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  layoutControls();
  refreshControls();
  describe('Five landing points of a robot arm are plotted as dots on a target and listed as offsets in ' +
    'millimeters. The learner labels the set as accurate and repeatable, repeatable but not accurate, accurate ' +
    'on average but not repeatable, or neither. The mean point and the spread are then drawn on the target.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt(narrow ? 'Accuracy and Repeatability' : 'Accuracy and Repeatability Targets', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  txt(phase === 'done' ? 'All 4 sets done' : 'Set ' + (idx + 1) + ' of ' + SETS.length, 10, sy, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + SETS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  const top = sy + size + 8;

  if (phase === 'done') { drawResults(top); return; }

  const s = SETS[idx], reveal = phase === 'feedback';
  let plot, table, text;
  if (narrow) {
    const side = Math.min(176, Math.round(canvasWidth * 0.47));
    plot = { x: 8, y: top, w: side, h: side };
    table = { x: 8 + side + 6, y: top, w: canvasWidth - 16 - side - 6, h: side };
    text = { x: 8, y: top + side + 6, w: canvasWidth - 16, h: drawHeight - (top + side + 6) - 6 };
  } else {
    const side = Math.min(drawHeight - top - 30, Math.round(canvasWidth * 0.44));
    plot = { x: 8, y: top, w: side, h: side };
    table = { x: 8 + side + 10, y: top, w: canvasWidth - 26 - side, h: 150 };
    text = { x: table.x, y: top + 156, w: table.w, h: drawHeight - (top + 156) - 8 };
    txt('Offsets in millimeters. Illustrative data.', plot.x + side / 2, plot.y + side + 12, 'dimgray', CENTER, CENTER, 14);
  }
  drawPlot(plot, s, reveal, false);
  drawTable(table, s, reveal);
  drawText(text, s, reveal, size);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The target plot. Every plot shows 5 mm each way from the target, so the sets can be compared by eye.
// ---------------------------------------------------------------------------
function drawPlot(R, s, reveal, mini) {
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(R.x, R.y, R.w, R.h, 6);
  const cx = R.x + R.w / 2, cy = R.y + R.h / 2, k = (R.w / 2 - 4) / PLOT_HALF;      // k = pixels per mm
  const X = v => cx + v * k, Y = v => cy - v * k;
  // rings every 1 mm, and the two axes
  noFill(); stroke('gainsboro'); strokeWeight(1);
  for (let r = 1; r <= PLOT_HALF; r++) circle(cx, cy, 2 * r * k);
  stroke('silver'); line(R.x + 3, cy, R.x + R.w - 3, cy); line(cx, R.y + 3, cx, R.y + R.h - 3);
  if (!mini) {
    const ts = narrow ? 12 : 13;
    [-4, -2, 2, 4].forEach(v => {
      txt(String(v).replace('-', '−'), X(v), cy + 9, 'dimgray', CENTER, CENTER, ts);
      txt(String(v).replace('-', '−'), cx - 5, Y(v), 'dimgray', RIGHT, CENTER, ts);
    });
    txt('x (mm)', R.x + R.w - 6, cy - 10, 'dimgray', RIGHT, CENTER, ts);
    txt('y (mm)', cx + 6, R.y + 10, 'dimgray', LEFT, CENTER, ts);
  }
  // the 0.5 mm threshold ring around the target, and the target center
  noFill(); stroke('darkorange'); strokeWeight(mini ? 1.5 : 2);
  circle(cx, cy, 2 * THRESHOLD * k);
  stroke('black'); strokeWeight(mini ? 1.5 : 2);
  line(cx - 5, cy, cx + 5, cy); line(cx, cy - 5, cx, cy + 5);

  if (reveal) {
    // a circle around the mean that just contains the points, and the mean itself as a square marker
    const mxp = X(s.mx), myp = Y(s.my);
    stroke('gray'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]);
    line(cx, cy, mxp, myp);
    drawingContext.setLineDash([]);
    noFill(); stroke('crimson'); strokeWeight(mini ? 1.5 : 2);
    circle(mxp, myp, Math.max(2 * s.spread * k, 8));
    fill('crimson'); noStroke(); rectMode(CENTER); rect(mxp, myp, mini ? 5 : 7, mini ? 5 : 7); rectMode(CORNER);
  }
  // the five landing points
  stroke('white'); strokeWeight(1); fill('navy');
  s.pts.forEach(p => circle(X(p[0]), Y(p[1]), mini ? 5 : (narrow ? 6 : 7)));
  strokeWeight(1);
  if (!mini && !narrow) {
    // a short key in the bottom left corner, which no point or circle of the four sets reaches
    const ks = narrow ? 12 : 13;
    const lx = R.x + 8, ly = R.y + R.h - (reveal ? 44 : 30);
    fill('navy'); stroke('white'); circle(lx + 4, ly, 7);
    txt('landing point', lx + 14, ly + 1, 'black', LEFT, CENTER, ks);
    noFill(); stroke('darkorange'); strokeWeight(2); circle(lx + 4, ly + 14, 8); strokeWeight(1);
    txt('0.5 mm around target', lx + 14, ly + 15, 'black', LEFT, CENTER, ks);
    if (reveal) {
      fill('crimson'); noStroke(); rect(lx + 1, ly + 25, 7, 7);
      txt('mean, and its circle', lx + 14, ly + 29, 'black', LEFT, CENTER, ks);
    }
  }
}

// ---------------------------------------------------------------------------
// The table of offsets
// ---------------------------------------------------------------------------
function drawTable(T, s, reveal) {
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(T.x, T.y, T.w, T.h, 6);
  const rows = s.pts.length + 2, rh = Math.min(24, (T.h - 8) / rows), fs = narrow ? 14 : 15;
  const c1 = T.x + T.w * 0.22, c2 = T.x + T.w * 0.55, c3 = T.x + T.w * 0.84;
  let y = T.y + 4 + rh / 2;
  txt('Trial', c1, y, 'dimgray', CENTER, CENTER, fs, true);
  txt('x (mm)', c2, y, 'dimgray', CENTER, CENTER, fs, true);
  txt('y (mm)', c3, y, 'dimgray', CENTER, CENTER, fs, true);
  stroke('silver'); line(T.x + 6, y + rh / 2, T.x + T.w - 6, y + rh / 2);
  s.pts.forEach((p, i) => {
    y += rh;
    txt(String(i + 1), c1, y, 'black', CENTER, CENTER, fs);
    txt(f1(p[0]), c2, y, 'black', CENTER, CENTER, fs);
    txt(f1(p[1]), c3, y, 'black', CENTER, CENTER, fs);
  });
  y += rh;
  stroke('silver'); line(T.x + 6, y - rh / 2, T.x + T.w - 6, y - rh / 2);
  txt('Mean', c1, y, reveal ? 'crimson' : 'dimgray', CENTER, CENTER, fs, true);
  txt(reveal ? f2(s.mx).replace('-', '−') : '?', c2, y, reveal ? 'crimson' : 'dimgray', CENTER, CENTER, fs, true);
  txt(reveal ? f2(s.my).replace('-', '−') : '?', c3, y, reveal ? 'crimson' : 'dimgray', CENTER, CENTER, fs, true);
}

// ---------------------------------------------------------------------------
// Definitions, question and feedback
// ---------------------------------------------------------------------------
function drawText(T, s, reveal, size) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(T.x, T.y, T.w, T.h, 10);
  const x = T.x + 10, w = T.w - 20, bottom = T.y + T.h - 8;
  const ds = narrow ? 14 : 15;
  let y = T.y + 8;
  y = para('the mean landing point is at most 0.5 mm from the target.', x, y, w, { size: ds, lead: 'Accurate:', leadCol: 'navy' }) + 3;
  y = para('no point is more than 0.5 mm from the mean.', x, y, w, { size: ds, lead: 'Repeatable:', leadCol: 'navy' }) + 3;
  if (!narrow) y = para('The 0.5 mm limit is a teaching value.', x, y, w, { size: ds, col: 'dimgray' });
  else if (!reveal) y = para('Illustrative data. The orange ring marks 0.5 mm around the target, a teaching value.', x, y, w, { size: ds, col: 'dimgray' });
  y += 6;
  if (!reveal) {
    y = para(QUESTION, x, y, w, { size: size, bold: true }) + 4;
    if (y < bottom - 20) paraFit('Choose a label below and press Check. You get one attempt.', x, y, w, bottom - y, { size: ds, col: 'dimgray', tag: 'prompt' });
    if (y > bottom + 1) layoutIssues.push('question overflows by ' + Math.round(y - bottom) + 'px');
    return;
  }
  const ok = picks[idx] === s.label, name = LABELS[s.label];
  const msg = (ok ? 'Correct: ' + name + '. ' : 'Not quite. This set is ' + name.charAt(0).toLowerCase() + name.substring(1) + '. ') + s.why;
  const nums = 'Mean offset (' + f2(s.mx).replace('-', '−') + ', ' + f2(s.my).replace('-', '−') + ') mm. Mean to target: ' + f2(s.offset) +
    ' mm. Largest distance from the mean: ' + f2(s.spread) + ' mm.';
  let sz = size;
  const need = z => para(msg, x, 0, w, { size: z, measure: true }) + 6 + para(nums, x, 0, w, { size: z, measure: true });
  while (sz > 12 && need(sz) > bottom - y) sz--;
  if (need(sz) > bottom - y + 1) layoutIssues.push('feedback overflows by ' + Math.round(need(sz) - (bottom - y)) + 'px');
  y = para(msg, x, y, w, { size: sz, col: ok ? 'darkgreen' : 'firebrick' }) + 6;
  para(nums, x, y, w, { size: sz });
}

// ---------------------------------------------------------------------------
// The final screen: the score and all four sets side by side
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  txt('Correct: ' + correctCount + ' of ' + SETS.length, 12, top + 2, 'black', LEFT, TOP, 20, true);
  txt(ok ? 'Mastery reached (3 of 4 or better).' : 'Mastery is 3 of 4. Press Try again.', 12, top + 30, ok ? 'darkgreen' : 'firebrick', LEFT, TOP, 16, true);
  const y0 = top + 58, cols = narrow ? 2 : 4, rows = SETS.length / cols;
  const cw = (canvasWidth - 16) / cols, ch = (drawHeight - y0 - 6) / rows;
  const labelH = narrow ? 40 : 62;
  SETS.forEach((s, i) => {
    const x = 8 + (i % cols) * cw, y = y0 + Math.floor(i / cols) * ch;
    const side = Math.min(cw - 14, ch - labelH - 6);
    const R = { x: x + (cw - side) / 2, y: y, w: side, h: side };
    drawPlot(R, s, true, true);
    drawMark(R.x + 12, R.y + 12, picks[i] === s.label, 5);
    paraFit('Set ' + (i + 1) + ': ' + LABELS[s.label], x + 4, y + side + 4, cw - 8, labelH, { size: narrow ? 14 : 15, center: true, tag: 'result label' });
  });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  const y = drawHeight + 13, bw = narrow ? 104 : 160;
  labelSelect.position(narrow ? 10 : 64, y);
  labelSelect.size(narrow ? canvasWidth - bw - 30 : 300);
  actionBtn.position(canvasWidth - bw - 10, y);
  actionBtn.size(bw);
}

function drawControlLabels() {
  if (!narrow) txt('Label:', 10, drawHeight + 25, 'black');
}

function refreshControls() {
  const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
  if (phase === 'done') labelSelect.hide(); else labelSelect.show();
  if (phase === 'ask') { labelSelect.removeAttribute('disabled'); actionBtn.html('Check'); able(labelSelect.value() !== ''); }
  else if (phase === 'feedback') { labelSelect.attribute('disabled', ''); actionBtn.html(idx === SETS.length - 1 ? 'See score' : 'Next set'); able(true); }
  else { actionBtn.html('Try again'); able(true); }
}

function onAction() {
  if (phase === 'ask') {
    if (labelSelect.value() === '') return;
    picks[idx] = parseInt(labelSelect.value(), 10);       // one attempt per set
    if (picks[idx] === SETS[idx].label) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    labelSelect.selected('');
    if (idx < SETS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else {
    idx = 0; correctCount = 0; picks = []; labelSelect.selected(''); phase = 'ask';
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
