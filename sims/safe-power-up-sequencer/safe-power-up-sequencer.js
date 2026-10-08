// Safe Power-Up Sequencer - p5.js MicroSim
// CANVAS_HEIGHT: 584
// Learning objective (Apply, implement): implement the safe power-up sequence by arranging seven shuffled steps
// in the correct order, with at least 6 of the 7 steps in their correct positions on the first attempt.
// Evidence: the arrangement committed with the first Check. Rearranging before that, and every later practice
// round after Shuffle, is exploration, not evidence.
// The steps and their order are from the chapter section "Safe Power-Up Sequence".
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 500;
let controlHeight = 84;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the seven steps in their correct order (index 0 is position 1)
const STEPS = [
  { text: 'Clear the work envelope of people, loose cables and objects',
    why: 'Start with the cheapest, most reversible check, and keep people out before anything has power.' },
  { text: 'Check the voltage label, the polarity and the fuse',
    why: 'A wrong voltage or polarity is the fault that can damage parts the moment power is on.' },
  { text: 'Run the program against the fake arm with no power',
    why: 'Errors in the program are cheap to find in simulation and dangerous to find on a powered arm.' },
  { text: 'Park the arm in its home pose, supported if it might sag',
    why: 'The arm should start from a known, safe pose when the torque comes on.' },
  { text: 'Place your hand within reach of the released E-stop',
    why: 'The stop must be reachable before anything can move.' },
  { text: 'Switch on the power supply and watch and listen',
    why: 'Power goes on only after every earlier check has passed.' },
  { text: 'Enable the motors and make one small, slow move',
    why: 'The first motion is small and slow so that a surprise costs little.' }
];
const START_ORDER = [5, 2, 7, 4, 1, 6, 3];       // the first shuffle, as correct positions (fixed by the chapter)
const MASTERY = 6;
const PROMPT = 'Put the steps in the order you would do them before the first power-up.';

// controls
let stepSelect, upBtn, downBtn, actionBtn;

// state
let phase = 'arrange';             // 'arrange' or 'review'
let order = START_ORDER.map(p => p - 1);   // order[row] = index into STEPS of the step now in that row
let committed = null;              // the order as it was when Check was pressed
let sel = -1;                      // arrange: the selected row. review: the selected step (index into STEPS)
let firstScore = null;             // the score of the first commit: the evidence
let lastScore = 0;
let rounds = 0;                    // how many times Check has been pressed
let rowRects = [];
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  stepSelect = createSelect();
  stepSelect.changed(() => { const v = parseInt(stepSelect.value(), 10); if (v >= 0) { sel = v; refreshControls(); } });
  upBtn = createButton('Move up');
  upBtn.mouseClicked(() => move(-1));
  downBtn = createButton('Move down');
  downBtn.mouseClicked(() => move(1));
  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  layoutControls();
  refreshControls();
  describe('Seven steps of the safe power-up sequence are listed in a shuffled order. The learner selects a step ' +
    'and moves it up or down until the list is in order, then presses Check. The sim marks each step, shows the ' +
    'correct order and gives the reason for each position.');
}

function scoreOf(ord) { return ord.filter((s, row) => s === row).length; }

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Safe Power-Up Sequencer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  const status = phase === 'review' ? 'Steps in the correct position: ' + lastScore + ' of ' + STEPS.length
    : (rounds === 0 ? 'Your order (not checked yet)' : 'Practice round (not scored)');
  txt(status, 10, sy, 'black', LEFT, TOP, size, true);
  const top = sy + size + 8;

  let L, P;
  if (narrow) {
    L = { x: 8, y: top, w: canvasWidth - 16, h: STEPS.length * 42 + 8 };
    P = { x: 8, y: top + L.h + 6, w: canvasWidth - 16, h: drawHeight - (top + L.h + 6) - 6 };
  } else {
    const w = Math.round((canvasWidth - 26) * 0.58);
    L = { x: 8, y: top, w: w, h: drawHeight - top - 8 };
    P = { x: 8 + w + 10, y: top, w: canvasWidth - 26 - w, h: drawHeight - top - 8 };
  }
  drawList(L);
  drawPanel(P, size);
  drawControlLabels();
  cursor(rowAt(mouseX, mouseY) >= 0 ? 'pointer' : 'default');
}

// ---------------------------------------------------------------------------
// The list. While arranging, the rows are in the learner's order. In the review, they are in the correct order.
// ---------------------------------------------------------------------------
function drawList(L) {
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(L.x, L.y, L.w, L.h, 8);
  const rowH = (L.h - 8) / STEPS.length, fs = narrow ? 14 : 16;
  rowRects = [];
  const hover = rowAt(mouseX, mouseY);
  for (let row = 0; row < STEPS.length; row++) {
    const r = { x: L.x + 4, y: L.y + 4 + row * rowH, w: L.w - 8, h: rowH };
    rowRects.push(r);
  }
  rowRects.forEach((r, row) => {
    const stepIdx = phase === 'review' ? row : order[row];
    const selected = phase === 'review' ? sel === stepIdx : sel === row;
    const cy = r.y + r.h / 2;
    let good = null, was = -1;
    if (phase === 'review') { was = committed.indexOf(stepIdx); good = was === stepIdx; }
    // the row background
    if (selected) { fill('lemonchiffon'); stroke('darkorange'); strokeWeight(2.5); rect(r.x, r.y + 2, r.w, r.h - 4, 6); }
    else if (hover === row) { fill('gainsboro'); noStroke(); rect(r.x, r.y + 2, r.w, r.h - 4, 6); }
    else if (row % 2 === 0) { fill('whitesmoke'); noStroke(); rect(r.x, r.y + 2, r.w, r.h - 4, 6); }
    strokeWeight(1);
    // the position number
    fill(phase === 'review' ? 'steelblue' : 'slategray'); noStroke(); circle(r.x + 20, cy, 26);
    txt(String(row + 1), r.x + 20, cy + 1, 'white', CENTER, CENTER, 15, true);
    // the step text, on one or two lines, and (in the review) the mark and where the learner had put it
    const rightW = phase === 'review' ? (good ? 30 : (narrow ? 78 : 110)) : 8;
    const tx = r.x + 40, twd = r.w - 40 - rightW;
    const lines = wrapLines(STEPS[stepIdx].text, twd, fs, false);
    if (lines.length * (fs + 3) > r.h) layoutIssues.push('step "' + STEPS[stepIdx].text + '" needs ' + lines.length + ' lines');
    noStroke(); fill('black'); setFont(fs, false); textAlign(LEFT, CENTER);
    lines.forEach((ln, i) => text(ln, tx, cy + 1 + (i - (lines.length - 1) / 2) * (fs + 3)));
    if (phase === 'review') {
      drawMark(r.x + r.w - 16, cy, good, 6);
      if (!good) txt((narrow ? 'you: ' : 'your place: ') + (was + 1), r.x + r.w - 30, cy + 1, 'firebrick', RIGHT, CENTER, 13);
    }
  });
}

// ---------------------------------------------------------------------------
// The text panel
// ---------------------------------------------------------------------------
function drawPanel(P, size) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(P.x, P.y, P.w, P.h, 10);
  const x = P.x + 10, w = P.w - 20, bottom = P.y + P.h - 8;
  let y = P.y + 8;
  if (phase === 'arrange') {
    y = para(PROMPT, x, y, w, { size: size, bold: true }) + 4;
    let s = 'Click a step, then press Move up or Move down. Press Check when the list is in order.';
    s += rounds === 0 ? ' Only your first Check is scored.' : ' Your first Check scored ' + firstScore + ' of 7, and that score stays.';
    paraFit(s, x, y, w, bottom - y, { size: size, col: 'dimgray', tag: 'prompt' });
    return;
  }
  // review: the result, then the reason for the selected step
  const ok = lastScore >= MASTERY;
  let head = ok ? 'Mastery reached (6 of 7 or better).' : 'Mastery is 6 of 7.';
  if (rounds > 1) head = 'Practice round: ' + lastScore + ' of 7. Only your first Check (' + firstScore + ' of 7) counts.';
  y = para(head, x, y, w, { size: size, bold: true, col: rounds > 1 ? 'black' : (ok ? 'darkgreen' : 'firebrick') }) + 4;
  if (!narrow) y = para('The list now shows the correct order. Click a step to read why it belongs there.', x, y, w, { size: 15, col: 'dimgray' }) + 6;
  const st = STEPS[sel], good = committed.indexOf(sel) === sel;
  const msg = good ? 'Step ' + (sel + 1) + ': in the right place. ' + st.why
    : 'Step "' + st.text + '" belongs at position ' + (sel + 1) + '. ' + st.why;
  paraFit(msg, x, y, w, bottom - y, { size: size, col: good ? 'darkgreen' : 'firebrick', tag: 'feedback' });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 10, ROW2 = 48;

function layoutControls() {
  const lab = narrow ? 50 : 56;
  stepSelect.position(lab, drawHeight + ROW1);
  stepSelect.size(Math.min(canvasWidth - lab - 12, 520));
  upBtn.position(10, drawHeight + ROW2); upBtn.size(narrow ? 104 : 120);
  downBtn.position(narrow ? 120 : 140, drawHeight + ROW2); downBtn.size(narrow ? 104 : 120);
  actionBtn.position(canvasWidth - (narrow ? 104 : 150), drawHeight + ROW2); actionBtn.size(narrow ? 94 : 140);
}

function drawControlLabels() {
  txt('Step:', 10, drawHeight + ROW1 + 12, 'black');
}

function refreshControls() {
  // the dropdown lists the rows as they are now, so it is rebuilt after every change
  stepSelect.elt.innerHTML = '';
  if (phase === 'arrange') {
    stepSelect.option('Choose a step to move', '-1');
    order.forEach((s, row) => stepSelect.option((row + 1) + '. ' + STEPS[s].text, String(row)));
  } else {
    STEPS.forEach((s, i) => stepSelect.option((i + 1) + '. ' + s.text, String(i)));
  }
  stepSelect.selected(String(sel));
  const able = (c, on) => { if (on) c.removeAttribute('disabled'); else c.attribute('disabled', ''); };
  if (phase === 'arrange') {
    upBtn.html('Move up'); downBtn.html('Move down'); actionBtn.html('Check');
    able(upBtn, sel > 0); able(downBtn, sel >= 0 && sel < STEPS.length - 1); able(actionBtn, true);
  } else {
    upBtn.html('Previous step'); downBtn.html('Next step'); actionBtn.html('Shuffle');
    able(upBtn, sel > 0); able(downBtn, sel < STEPS.length - 1); able(actionBtn, true);
  }
}

// arrange: move the selected step one row. review: step through the reasons.
function move(d) {
  const to = sel + d;
  if (sel < 0 || to < 0 || to >= STEPS.length) return;
  if (phase === 'arrange') { const t = order[sel]; order[sel] = order[to]; order[to] = t; }
  sel = to;
  refreshControls();
}

function onAction() {
  if (phase === 'arrange') {
    committed = order.slice();                       // the list is scored once, when Check is pressed
    lastScore = scoreOf(committed);
    rounds++;
    if (firstScore === null) firstScore = lastScore; // the first commit is the evidence and never changes
    phase = 'review';
    const firstWrong = STEPS.findIndex((s, i) => committed.indexOf(i) !== i);
    sel = firstWrong >= 0 ? firstWrong : 0;
  } else {
    // a new shuffle to practise on (never the correct order itself)
    do {
      order = STEPS.map((s, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = order[i]; order[i] = order[j]; order[j] = t;
      }
    } while (scoreOf(order) === STEPS.length);
    sel = -1; phase = 'arrange';
  }
  refreshControls();
}

function rowAt(x, y) {
  return rowRects.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y < r.y + r.h);
}

function mousePressed() {
  const row = rowAt(mouseX, mouseY);
  if (row < 0) return;
  sel = row;                                         // a row while arranging; a step (same number) in the review
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
