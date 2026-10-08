// Python Run Stage Sorter - p5.js MicroSim
// CANVAS_HEIGHT: 572
// Learning objective (Understand, classify): classify each of five Python error messages by the stage of running
// a script that produces it, with at least 4 of 5 correct on the first attempt. Evidence: the stage committed
// with Check for each message. Opening a stage description is exploration, not evidence.
// Pattern: a fixed sequence of six stages that the learner opens one by one, then a one-attempt sorting quiz with
// immediate feedback. Nothing is animated and nothing is random.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 520;
let controlHeight = 52;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the six stages, in fixed order (Chapter 1, "Python Scripts")
const STAGES = [
  { name: 'Type the command',
    what: 'You type python3 hello_arm.py in the terminal and press Enter. The text goes to the shell.',
    fail: 'Nothing in Python can fail yet. A typo here becomes a stage 2 problem.' },
  { name: 'Shell finds the interpreter',
    what: 'The shell looks for a program named python3 in each folder listed in the PATH environment variable.',
    fail: 'No program named python3 is in any PATH folder.' },
  { name: 'Interpreter opens the script',
    what: 'Python starts and opens the file named after it.',
    fail: 'The file is not at the path you typed.' },
  { name: 'Interpreter checks the syntax',
    what: 'Python reads the whole file and checks that it follows Python\'s grammar. No line has run yet.',
    fail: 'A SyntaxError.' },
  { name: 'Interpreter runs the lines',
    what: 'Python runs the code from top to bottom. Each import is carried out when its line is reached.',
    fail: 'Any exception raised while a line runs. The messages in this activity use two of them, ModuleNotFoundError and KeyError.' },
  { name: 'Output and exit',
    what: 'Printed text appears. An uncaught exception prints a traceback first. The shell prompt returns.',
    fail: 'Nothing new can fail. Errors from stage 5 are reported here.' }
];

// the five error messages, in fixed order. stage is the 1-based number of the stage that produces the message.
const MESSAGES = [
  { text: 'zsh: command not found: python3', short: 'zsh: command not found: python3', stage: 2,
    why: 'The shell prints this before Python starts, because no program named python3 is in a PATH folder.' },
  { text: 'python3: can\'t open file \'/home/maker/arm-lab/hello_arm.py\': [Errno 2] No such file or directory',
    short: 'python3: can\'t open file \'…/hello_arm.py\'', stage: 3,
    why: 'Python started, but the script is not at the path you typed.' },
  { text: 'SyntaxError: \'(\' was never closed', short: 'SyntaxError: \'(\' was never closed', stage: 4,
    why: 'Syntax is checked for the whole file before any line runs, so no earlier print output appears.' },
  { text: 'ModuleNotFoundError: No module named \'serial\'', short: 'ModuleNotFoundError: No module named \'serial\'', stage: 5,
    why: 'An import is carried out when its line is reached. Lines above it have already run.' },
  { text: 'KeyError: \'elbow_flex\'', short: 'KeyError: \'elbow_flex\'', stage: 5,
    why: 'A dictionary lookup happens when its line runs, after the syntax check has passed.' }
];
const MASTERY = 4;
const START_QUESTION = 'Which stage of running a script produces each error message? Open every stage to begin.';

// controls
let stageSelect, actionBtn;

// state
let phase = 'explore';                 // 'explore', 'ask', 'feedback' or 'done'
let opened = [false, false, false, false, false, false];
let current = -1;                      // 0-based index of the stage that is open (explore) or chosen (ask)
let idx = 0;                           // which message is being sorted
let correctCount = 0;
let picks = [];                        // the stage (0-based) the learner committed for each message
let stageRects = [];                   // where the six stage rows are drawn this frame (also read by mousePressed)
let panelRect = { x: 0, y: 0, w: 0, h: 0 };
let layoutIssues = [];                 // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  stageSelect = createSelect();
  stageSelect.option('Choose a stage', '-1');
  STAGES.forEach((s, i) => stageSelect.option((i + 1) + '. ' + s.name, String(i)));
  stageSelect.selected('-1');
  stageSelect.changed(() => { const i = parseInt(stageSelect.value(), 10); if (i >= 0) chooseStage(i); });

  actionBtn = createButton('Start sorting');
  actionBtn.mouseClicked(onAction); // 'click' also fires for Enter and Space, so keyboard users can press it

  layoutControls();
  refreshControls();
  describe('Six stages of running a Python script are listed in order. The learner opens each stage to read what ' +
    'happens and what can fail there, then sorts five error messages onto the stage that produces each one. ' +
    'Feedback and a running score follow every answer.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Python Run Stage Sorter', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  computeLayout();
  drawStages();
  if (phase === 'done') drawResults(); else drawPanel();
  drawControlLabels();
  updateCursor();
}

// ---------------------------------------------------------------------------
// Layout: where the six stage rows and the text panel go
// ---------------------------------------------------------------------------
function messagesForStage(i) {
  const out = [];
  MESSAGES.forEach((m, k) => { if (m.stage - 1 === i) out.push(k); });
  return out;
}

function computeLayout() {
  stageRects = [];
  if (narrow) {
    // stacked: stage list on top, panel below. On the final screen each stage row grows to hold its messages.
    const x = 8, w = canvasWidth - 16;
    let y = phase === 'done' ? 98 : 40;
    for (let i = 0; i < STAGES.length; i++) {
      const extra = phase === 'done' ? messagesForStage(i).length * 24 : 0;
      stageRects.push({ x: x, y: y, w: w, h: 28, extra: extra });
      y += 28 + extra + 3;
    }
    panelRect = { x: x, y: y + 3, w: w, h: drawHeight - y - 11 };
  } else {
    // side by side: stage list on the left with arrows between the rows, panel on the right
    const x = 10, top = 46, gap = 16;
    const w = Math.min(300, Math.round(canvasWidth * 0.4));
    const h = (drawHeight - top - 10 - gap * (STAGES.length - 1)) / STAGES.length;
    for (let i = 0; i < STAGES.length; i++) {
      stageRects.push({ x: x, y: top + i * (h + gap), w: w, h: h, extra: 0 });
    }
    panelRect = { x: x + w + 12, y: top, w: canvasWidth - (x + w + 12) - 10, h: drawHeight - top - 10 };
  }
}

// ---------------------------------------------------------------------------
// The stage rows
// ---------------------------------------------------------------------------
function stageLook(i) {
  // returns { fill, border, weight, mark } for stage i in the current phase
  const look = { fill: 'white', border: 'gray', weight: 1, mark: null };
  if (phase === 'explore') {
    if (opened[i]) look.fill = 'honeydew';
    if (i === current) { look.fill = 'lemonchiffon'; look.border = 'darkorange'; look.weight = 3; }
  } else if (phase === 'ask') {
    if (i === current) { look.fill = 'lemonchiffon'; look.border = 'darkorange'; look.weight = 3; }
  } else if (phase === 'feedback') {
    const right = MESSAGES[idx].stage - 1;
    if (i === right) { look.fill = 'palegreen'; look.border = 'darkgreen'; look.weight = 3; look.mark = true; }
    else if (i === picks[idx]) { look.fill = 'mistyrose'; look.border = 'firebrick'; look.weight = 3; look.mark = false; }
  }
  return look;
}

function drawStages() {
  for (let i = 0; i < STAGES.length; i++) {
    const r = stageRects[i], look = stageLook(i);
    // arrow to the next stage (wide layout only; the narrow rows are too close together)
    if (!narrow && i < STAGES.length - 1) {
      const ax = r.x + 22, ay = r.y + r.h + 2;
      stroke('gray'); strokeWeight(2); line(ax, ay, ax, ay + 8);
      noStroke(); fill('gray'); triangle(ax - 5, ay + 7, ax + 5, ay + 7, ax, ay + 13);
    }
    fill(look.fill); stroke(look.border); strokeWeight(look.weight);
    rect(r.x, r.y, r.w, r.h, 8);
    strokeWeight(1);
    // number badge
    const cy = r.y + r.h / 2, br = narrow ? 10 : 14;
    fill('steelblue'); noStroke(); circle(r.x + 8 + br, cy, br * 2);
    txt(String(i + 1), r.x + 8 + br, cy + 1, 'white', CENTER, CENTER, narrow ? 14 : 16, true);
    // name, leaving room on the right for a mark
    const nameX = r.x + 16 + br * 2, markW = 26;
    lineFit(STAGES[i].name, nameX, cy + 1, r.x + r.w - nameX - markW - 4, { size: narrow ? 15 : 16, bold: i === current && phase !== 'feedback' });
    // mark on the right: a small tick once a stage has been opened, or the right / wrong mark after a commitment
    const mx = r.x + r.w - 16;
    if (phase === 'feedback' && look.mark !== null) drawMark(mx, cy, look.mark, 7);
    else if (phase === 'explore' && opened[i]) drawMark(mx, cy, true, 5, 'seagreen', 2);
  }
}

// ---------------------------------------------------------------------------
// The text panel (explore, ask and feedback)
// ---------------------------------------------------------------------------
function drawPanel() {
  const p = panelRect;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(p.x, p.y, p.w, p.h, 10);
  const x = p.x + 10, w = p.w - 20, bottom = p.y + p.h - 8;
  const size = narrow ? 15 : 16;
  let y = p.y + 8;

  if (phase === 'explore') {
    const n = opened.filter(Boolean).length;
    y = para(START_QUESTION, x, y, w, { size: size, bold: true });
    y += 4;
    const done = n === STAGES.length;
    y = para(done ? 'All 6 stages opened. Press Start sorting.' : 'Opened: ' + n + ' of 6. Click a stage to open it.',
      x, y, w, { size: size, col: done ? 'darkgreen' : 'dimgray', bold: done });
    y += 8;
    if (current >= 0) drawStageText(current, x, y, w, bottom - y, size);
    return;
  }

  // ask and feedback
  const m = MESSAGES[idx];
  txt('Message ' + (idx + 1) + ' of ' + MESSAGES.length, x, y, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + MESSAGES.length, x + w, y, 'black', RIGHT, TOP, size, true);
  y += size + 10;
  y = drawTerminal(m.text, x, y, w) + 8;

  if (phase === 'ask') {
    if (current < 0) {
      para('Click the stage that produces this message, then press Check.', x, y, w, { size: size });
      return;
    }
    if (!narrow) y = para('Stage ' + (current + 1) + ' is chosen. Press Check to commit, or click another stage.', x, y, w, { size: size, col: 'dimgray' }) + 8;
    drawStageText(current, x, y, w, bottom - y, size);
    return;
  }

  // feedback
  const right = m.stage - 1, ok = picks[idx] === right;
  const msg = ok
    ? 'Correct: stage ' + m.stage + ', ' + STAGES[right].name + '. ' + m.why
    : 'Not quite. This message comes from stage ' + m.stage + ', ' + STAGES[right].name + '. ' + m.why;
  y = paraFit(msg, x, y, w, bottom - y, { size: size, col: ok ? 'darkgreen' : 'firebrick', tag: 'feedback' }) + 12;
  // the wide layout has room to repeat the correct stage's description under the feedback
  if (!narrow) drawStageText(right, x, y, w, bottom - y, size);
}

// the name of a stage, what happens there and what can fail there
function drawStageText(i, x, y, w, maxH, size) {
  const s = STAGES[i];
  // measure first, and step the text size down if the three blocks would not fit
  let sz = size;
  const measure = z => {
    let yy = para('Stage ' + (i + 1) + ': ' + s.name, x, 0, w, { size: z, bold: true, measure: true }) + 4;
    yy = para(s.what, x, yy, w, { size: z, lead: 'What happens:', measure: true }) + 4;
    return para(s.fail, x, yy, w, { size: z, lead: 'What can fail here:', measure: true });
  };
  while (sz > 12 && measure(sz) > maxH) sz--;
  if (measure(sz) > maxH + 1) layoutIssues.push('stage text overflows by ' + Math.round(measure(sz) - maxH) + 'px');
  y = para('Stage ' + (i + 1) + ': ' + s.name, x, y, w, { size: sz, bold: true }) + 4;
  y = para(s.what, x, y, w, { size: sz, lead: 'What happens:', leadCol: 'navy' }) + 4;
  para(s.fail, x, y, w, { size: sz, lead: 'What can fail here:', leadCol: 'firebrick' });
}

// an error message drawn the way a terminal shows it: light text on a dark box. Returns the y below the box.
function drawTerminal(str, x, y, w) {
  const size = narrow ? 15 : 16, pad = 8;
  const bottom = para(str, x + pad, y + pad, w - 2 * pad, { size: size, measure: true });
  fill('darkslategray'); stroke('black'); strokeWeight(1);
  rect(x, y, w, bottom - y + pad, 6);
  para(str, x + pad, y + pad, w - 2 * pad, { size: size, col: 'white' });
  return bottom + pad;
}

// ---------------------------------------------------------------------------
// The final screen: the score, and the five messages beside their stages
// ---------------------------------------------------------------------------
function drawResults() {
  const ok = correctCount >= MASTERY;
  const scoreLine = 'Correct: ' + correctCount + ' of ' + MESSAGES.length;
  const masteryLine = ok ? 'Mastery reached (4 of 5 or better).' : 'Mastery is 4 of 5. Press Try again.';

  if (narrow) {
    fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
    rect(8, 38, canvasWidth - 16, 54, 10);
    txt(scoreLine, 18, 46, 'black', LEFT, TOP, 17, true);
    txt(masteryLine, 18, 68, ok ? 'darkgreen' : 'firebrick', LEFT, TOP, 15, true);
  } else {
    // stages 1 and 6 produce no messages, so the space beside them holds the score and a closing note
    const p = panelRect, r0 = stageRects[0], r5 = stageRects[5];
    txt(scoreLine, p.x + 4, r0.y + 6, 'black', LEFT, TOP, 20, true);
    txt(masteryLine, p.x + 4, r0.y + 34, ok ? 'darkgreen' : 'firebrick', LEFT, TOP, 16, true);
    para('Stages 1 and 6 produce none of these messages. Only syntax is checked before any line runs.', p.x + 4, r5.y + 4, p.w - 8, { size: 16, col: 'dimgray' });
  }

  for (let i = 0; i < STAGES.length; i++) {
    const r = stageRects[i], list = messagesForStage(i);
    list.forEach((k, n) => {
      const good = picks[k] === i;
      let x, y, w;
      if (narrow) { x = r.x + 30; y = r.y + r.h + 12 + n * 24; w = r.w - 34; }
      else { x = panelRect.x + 26; y = r.y + (list.length === 1 ? r.h / 2 : 14 + n * (r.h - 28)); w = panelRect.w - 30; }
      drawMark(x - 14, y, good, 6);
      const tail = good ? '' : '   (you chose stage ' + (picks[k] + 1) + ')';
      lineFit(MESSAGES[k].short + (narrow ? '' : tail), x, y + 1, w, { size: narrow ? 14 : 16, col: good ? 'darkgreen' : 'firebrick' });
    });
  }

  if (narrow) {
    const p = panelRect;
    if (p.h > 40) para('Stages 1 and 6 produce none of these messages. Only syntax is checked before any line runs.', p.x + 4, p.y + 4, p.w - 8, { size: 15, col: 'dimgray' });
  }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  const y = drawHeight + 13;
  stageSelect.position(narrow ? 8 : 70, y);
  stageSelect.size(narrow ? 190 : 250);
  actionBtn.position(canvasWidth - (narrow ? 118 : 150), y);
  actionBtn.size(narrow ? 110 : 140);
}

function drawControlLabels() {
  if (!narrow) txt('Stage:', 12, drawHeight + 25, 'black');
}

function refreshControls() {
  stageSelect.selected(String(current));
  if (phase === 'explore' || phase === 'ask') stageSelect.removeAttribute('disabled'); else stageSelect.attribute('disabled', '');
  const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
  if (phase === 'explore') { actionBtn.html('Start sorting'); able(opened.every(Boolean)); }
  else if (phase === 'ask') { actionBtn.html('Check'); able(current >= 0); }
  else if (phase === 'feedback') { actionBtn.html(idx === MESSAGES.length - 1 ? 'See score' : 'Next message'); able(true); }
  else { actionBtn.html('Try again'); able(true); }
}

// open a stage (explore) or choose it as the answer (ask)
function chooseStage(i) {
  if (phase === 'explore') { opened[i] = true; current = i; }
  else if (phase === 'ask') { current = i; }
  refreshControls();
}

function onAction() {
  if (phase === 'explore') {
    if (!opened.every(Boolean)) return;        // the sorting stays locked until all six stages have been opened
    phase = 'ask'; idx = 0; correctCount = 0; picks = []; current = -1;
  } else if (phase === 'ask') {
    if (current < 0) return;
    picks[idx] = current;                       // one attempt per message
    if (current === MESSAGES[idx].stage - 1) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    current = -1;
    if (idx < MESSAGES.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else {
    phase = 'ask'; idx = 0; correctCount = 0; picks = []; current = -1;
  }
  refreshControls();
}

function stageAt(x, y) {
  return stageRects.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
}

function mousePressed() {
  if (phase !== 'explore' && phase !== 'ask') return;
  const i = stageAt(mouseX, mouseY);
  if (i >= 0) chooseStage(i);
}

function updateCursor() {
  const live = phase === 'explore' || phase === 'ask';
  cursor(live && stageAt(mouseX, mouseY) >= 0 ? 'pointer' : 'default');
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
      while (tw(wd) > maxW && wd.length > 1) {   // a single word wider than the box (a long file path)
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
// o: size, bold, col, lh (line height), lead (a colored label that starts the first line), leadCol, measure
function para(str, x, y, w, o) {
  o = o || {};
  const size = o.size || defaultTextSize;
  const lh = o.lh || Math.round(size * 1.3);
  const full = o.lead ? o.lead + ' ' + str : str;
  const lines = wrapLines(full, w, size, o.bold);
  if (!o.measure) {
    noStroke(); setFont(size, o.bold); textAlign(LEFT, TOP);
    lines.forEach((ln, i) => {
      if (i === 0 && o.lead && ln.indexOf(o.lead) === 0) {
        fill(o.leadCol || 'black'); text(o.lead, x, y);
        fill(o.col || 'black'); text(ln.substring(o.lead.length), x + tw(o.lead), y);
      } else {
        fill(o.col || 'black'); text(ln, x, y + i * lh);
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

// one line of text, vertically centered on y. The size steps down until it fits maxW; after that it is cut short.
function lineFit(str, x, y, maxW, o) {
  o = o || {};
  let size = o.size || defaultTextSize;
  const minSize = o.min || 12;
  setFont(size, o.bold);
  while (size > minSize && tw(str) > maxW) { size--; setFont(size, o.bold); }
  let s = str, base = str;
  while (base.length > 3 && tw(s) > maxW) { base = base.substring(0, base.length - 1); s = base.trim() + '…'; }
  noStroke(); fill(o.col || 'black'); textAlign(LEFT, CENTER);
  text(s, x, y);
  textStyle(NORMAL);
}

// a tick (ok) or a cross (not ok), drawn with lines so it looks the same in every font
function drawMark(cx, cy, ok, s, col, weight) {
  noFill(); strokeWeight(weight || 3);
  if (ok) {
    stroke(col || 'darkgreen');
    line(cx - s, cy, cx - s * 0.3, cy + s * 0.7);
    line(cx - s * 0.3, cy + s * 0.7, cx + s, cy - s * 0.7);
  } else {
    stroke(col || 'firebrick');
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
