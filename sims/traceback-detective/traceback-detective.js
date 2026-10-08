// Traceback Detective - p5.js MicroSim
// CANVAS_HEIGHT: 622
// Learning objective (Analyze, distinguish): distinguish the error-type line from the frames of a Python
// traceback, and identify the frame to check first, in each of five tracebacks, with at least 8 of 10 answers
// correct on the first attempt. Evidence: the two selections committed with Check for each traceback.
// Rules: the error-type line is always the last line. The frame to check first is the deepest frame whose file
// is inside the learner's project folder, /home/maker/arm-lab/. Frames under /usr/lib/python3.13/ are library
// frames and are never the answer.
// The tracebacks are drawn in the default sketch font, so each ~~~^^^ marker is placed under the characters it
// points at by measuring the source line above it.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 570;
let controlHeight = 52;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const PROJECT = '/home/maker/arm-lab/';

// five tracebacks, in fixed order. Each line keeps its leading spaces exactly as Python prints them.
// frameName is how the feedback names the frame to check first; why is the reason shown after the second answer.
const TRACEBACKS = [
  { label: 'KeyError',
    lines: [
      'Traceback (most recent call last):',
      '  File "/home/maker/arm-lab/list_joints.py", line 5, in <module>',
      '    print(config["joint_names"])',
      '          ~~~~~~^^^^^^^^^^^^^^^',
      'KeyError: \'joint_names\''
    ],
    frameName: 'list_joints.py, line 5 (the only frame)',
    why: 'The dictionary has no key joint_names. The settings file calls the key joints.' },
  { label: 'FileNotFoundError',
    lines: [
      'Traceback (most recent call last):',
      '  File "/home/maker/arm-lab/show_config.py", line 25, in <module>',
      '    main()',
      '    ~~~~^^',
      '  File "/home/maker/arm-lab/show_config.py", line 17, in main',
      '    config = load_config(args.config)',
      '  File "/home/maker/arm-lab/armlab/config.py", line 15, in load_config',
      '    with open(path) as f:',
      '         ~~~~^^^^^^',
      'FileNotFoundError: [Errno 2] No such file or directory: \'config/nope.json\''
    ],
    frameName: 'armlab/config.py, line 15, in load_config',
    why: 'The crash happened at open(path). The frames above it show how main passed the path in, but the deepest project frame is where to look first.' },
  { label: 'JSONDecodeError',
    lines: [
      'Traceback (most recent call last):',
      '  File "/home/maker/arm-lab/load_bad.py", line 4, in <module>',
      '    config = json.load(f)',
      '  File "/usr/lib/python3.13/json/__init__.py", line 293, in load',
      '    return loads(fp.read(),',
      '        cls=cls, object_hook=object_hook,',
      '        parse_float=parse_float, parse_int=parse_int,',
      '        parse_constant=parse_constant, object_pairs_hook=object_pairs_hook, **kw)',
      '  File "/usr/lib/python3.13/json/__init__.py", line 346, in loads',
      '    return _default_decoder.decode(s)',
      '           ~~~~~~~~~~~~~~~~~~~~~~~^^^',
      '  File "/usr/lib/python3.13/json/decoder.py", line 344, in decode',
      '    obj, end = self.raw_decode(s, idx=_w(s, 0).end())',
      '               ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^',
      '  File "/usr/lib/python3.13/json/decoder.py", line 360, in raw_decode',
      '    obj, end = self.scan_once(s, idx)',
      '               ~~~~~~~~~~~~~~^^^^^^^^',
      'json.decoder.JSONDecodeError: Illegal trailing comma before end of object: line 3 column 23 (char 50)'
    ],
    frameName: 'load_bad.py, line 4',
    why: 'The four frames inside /usr/lib/python3.13/json/ are Python\'s own code and are not buggy. Your only frame is the json.load(f) call, and the message says line 3 of the JSON file has a comma after its last item.' },
  { label: 'IndexError',
    lines: [
      'Traceback (most recent call last):',
      '  File "/home/maker/arm-lab/print_joints.py", line 3, in <module>',
      '    print(joints[i])',
      '          ~~~~~~^^^',
      'IndexError: list index out of range'
    ],
    frameName: 'print_joints.py, line 3 (the only frame)',
    why: 'joints[i] asked for a position the list does not have. The loop counted past the end.' },
  { label: 'ModuleNotFoundError',
    lines: [
      'Traceback (most recent call last):',
      '  File "/home/maker/arm-lab/ping_servo.py", line 1, in <module>',
      '    import serial',
      'ModuleNotFoundError: No module named \'serial\''
    ],
    frameName: 'ping_servo.py, line 1 (the only frame)',
    why: 'Python could not find serial. The fix is to activate the environment where pyserial is installed, not to change this line.' }
];
const MASTERY = 8, TOTAL = 10;

// turn the raw lines into rows: kind is 'header', 'file', 'src', 'mark' or 'error'; frame is the frame number
TRACEBACKS.forEach(tb => {
  let frame = -1;
  tb.rows = tb.lines.map((raw, i) => {
    let kind;
    if (i === 0) kind = 'header';
    else if (i === tb.lines.length - 1) kind = 'error';
    else if (raw.indexOf('  File "') === 0) { kind = 'file'; frame++; }
    else if (/^[ ~^]+$/.test(raw)) kind = 'mark';
    else kind = 'src';
    const inFrame = kind === 'file' || kind === 'src' || kind === 'mark';
    return { raw: raw, text: raw.trim(), lead: raw.length - raw.trimStart().length, kind: kind, frame: inFrame ? frame : -1 };
  });
  tb.frameCount = frame + 1;
  tb.errorRow = tb.rows.length - 1;
  // the frame to check first: the deepest frame whose file is inside the project folder
  tb.answerFrame = -1;
  tb.rows.forEach(r => { if (r.kind === 'file' && r.raw.indexOf('File "' + PROJECT) >= 0) tb.answerFrame = r.frame; });
});

// controls
let actionBtn;

// state
let phase = 'askLine';             // 'askLine', 'askFrame', 'feedback' or 'done'
let idx = 0;                       // which traceback
let selLine = -1, selFrame = -1;   // the current, uncommitted selection
let pickedLine = [], pickedFrame = [];   // committed answers for each traceback
let correctCount = 0;
let hint = '';
let tbLayout = null;               // where each row of the traceback is drawn this frame (also read by mousePressed)
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  layoutControls();
  refreshControls();
  describe('A Python traceback is shown line by line. The learner first clicks the line that names the error ' +
    'type, then clicks the frame to check first. Each answer is checked and explained, and a score out of ten ' +
    'is kept across five tracebacks.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Traceback Detective', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16;
  const sy = narrow ? 36 : 42;
  txt(phase === 'done' ? 'All 5 tracebacks done' : 'Traceback ' + (idx + 1) + ' of ' + TRACEBACKS.length, 10, sy, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + TOTAL, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  txt('Your project folder: ' + PROJECT, 10, sy + size + 5, 'dimgray', LEFT, TOP, narrow ? 14 : 15);
  const top = sy + size + 5 + 22;

  if (phase === 'done') { tbLayout = null; drawResults(top); cursor('default'); drawControlLabels(); return; }

  computeTracebackLayout(top);
  drawTraceback();
  const my = tbLayout.y + tbLayout.h + 8;
  drawMessage(10, my, canvasWidth - 20, drawHeight - my - 6, size);
  drawControlLabels();
  updateCursor();
}

// ---------------------------------------------------------------------------
// Traceback layout and drawing
// ---------------------------------------------------------------------------
function computeTracebackLayout(top) {
  const tb = TRACEBACKS[idx];
  const x = 8, w = canvasWidth - 16, pad = 8, markW = 22;
  const maxH = drawHeight - top - (narrow ? 100 : 120);     // leave room for the question and the feedback
  let size = narrow ? 14 : 17, L = null;                    // short tracebacks get larger text
  for (;;) {
    L = measureRows(tb, w - 2 * pad - markW, size);
    if (L.h + 2 * pad <= maxH || size <= 11) break;
    size--;
  }
  if (L.h + 2 * pad > maxH + 1) layoutIssues.push('traceback overflows by ' + Math.round(L.h + 2 * pad - maxH) + 'px');
  let y = top + pad;
  const rows = L.rows.map(r => { const o = Object.assign({}, r, { y: y }); y += r.h; return o; });
  tbLayout = { x: x, y: top, w: w, h: L.h + 2 * pad, pad: pad, size: size, lh: L.lh, rows: rows };
}

function measureRows(tb, innerW, size) {
  const lh = Math.round(size * (narrow ? 1.25 : 1.36));     // tighter lines on a phone, where long lines wrap
  const unit = size * (narrow ? 0.3 : 0.5);                 // width of one leading space of indentation
  let h = 0;
  const rows = tb.rows.map(r => {
    const indent = r.lead * unit;
    const wrapped = r.kind === 'mark' ? [r.text] : wrapLines(r.text, innerW - indent, size, false);
    h += wrapped.length * lh;
    return { indent: indent, wrapped: wrapped, h: wrapped.length * lh };
  });
  return { rows: rows, h: h, lh: lh };
}

// the vertical span of one frame (its File line, source lines and marker line)
function frameSpan(f) {
  const tb = TRACEBACKS[idx];
  let y0 = null, y1 = null;
  tb.rows.forEach((r, i) => {
    if (r.frame !== f) return;
    const lr = tbLayout.rows[i];
    if (y0 === null) y0 = lr.y;
    y1 = lr.y + lr.h;
  });
  return { y: y0, h: y1 - y0 };
}

function band(y, h, fillCol, strokeCol, weight) {
  const L = tbLayout;
  fill(fillCol);
  if (strokeCol) { stroke(strokeCol); strokeWeight(weight || 2); } else noStroke();
  rect(L.x + 3, y, L.w - 6, h, 4);
  strokeWeight(1);
}

function drawTraceback() {
  const tb = TRACEBACKS[idx], L = tbLayout;
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(L.x, L.y, L.w, L.h, 6);

  const hoverRow = rowAt(mouseX, mouseY);
  const marks = [];                                     // ticks and crosses to draw at the right edge
  const errRow = L.rows[tb.errorRow];

  // frame bands first, then line bands on top of them
  if (phase === 'askFrame') {
    const hf = hoverRow >= 0 ? tb.rows[hoverRow].frame : -1;
    if (hf >= 0 && hf !== selFrame) { const s = frameSpan(hf); band(s.y, s.h, 'gainsboro'); }
    if (selFrame >= 0) { const s = frameSpan(selFrame); band(s.y, s.h, 'lemonchiffon', 'darkorange', 2); }
  }
  if (phase === 'feedback') {
    const pf = pickedFrame[idx];
    if (pf !== tb.answerFrame) {
      const s = frameSpan(pf); band(s.y, s.h, 'mistyrose', 'firebrick', 2);
      marks.push({ y: s.y + s.h / 2, ok: false });
    }
    const s = frameSpan(tb.answerFrame); band(s.y, s.h, 'palegreen', 'darkgreen', 2);
    marks.push({ y: s.y + s.h / 2, ok: true });
  }
  if (phase === 'askLine') {
    if (hoverRow >= 0 && hoverRow !== selLine) band(L.rows[hoverRow].y, L.rows[hoverRow].h, 'gainsboro');
    if (selLine >= 0) band(L.rows[selLine].y, L.rows[selLine].h, 'lemonchiffon', 'darkorange', 2);
  } else {
    // the first answer has been committed: show the real error line, and a wrong pick if there was one
    band(errRow.y, errRow.h, 'palegreen', 'darkgreen', 2);
    marks.push({ y: errRow.y + errRow.h / 2, ok: true });
    const pl = pickedLine[idx];
    if (pl !== tb.errorRow) {
      band(L.rows[pl].y, L.rows[pl].h, 'mistyrose', 'firebrick', 2);
      marks.push({ y: L.rows[pl].y + L.rows[pl].h / 2, ok: false });
    }
  }

  // the text
  const tx = L.x + L.pad;
  noStroke(); setFont(L.size, false);
  L.rows.forEach((lr, i) => {
    const r = tb.rows[i];
    const dy = Math.max(1, Math.round((L.lh - L.size) / 2) - 1);      // centers a line of text in its row
    if (r.kind === 'mark') { drawMarker(r, tb.rows[i - 1], L.rows[i - 1], tx, lr.y - 2, L.size); return; }
    fill('black'); textAlign(LEFT, TOP); setFont(L.size, false);
    lr.wrapped.forEach((ln, k) => text(ln, tx + lr.indent + (k > 0 ? L.size : 0), lr.y + dy + k * L.lh));
  });
  marks.forEach(m => drawMark(L.x + L.w - 14, m.y, m.ok, 6));
}

// a ~~~^^^ marker line. Each run of the same character is spread evenly under the source characters it points at.
function drawMarker(r, src, srcLayout, tx, y, size) {
  noStroke(); fill('firebrick'); setFont(size, false);
  const a = r.lead - src.lead;                           // where the marker starts, as an index into the source text
  if (a < 0 || srcLayout.wrapped.length > 1) {           // the source line wrapped, so the columns no longer line up
    textAlign(LEFT, TOP); text(r.text, tx + srcLayout.indent, y);
    return;
  }
  const x0 = tx + srcLayout.indent, mk = r.text;
  textAlign(CENTER, TOP);
  let j = 0;
  while (j < mk.length) {
    let k = j;
    while (k < mk.length && mk[k] === mk[j]) k++;
    const xa = x0 + tw(src.text.substring(0, a + j)), xb = x0 + tw(src.text.substring(0, a + k));
    const cell = (xb - xa) / (k - j);
    for (let c = 0; c < k - j; c++) text(mk[j], xa + cell * (c + 0.5), y);
    j = k;
  }
}

// ---------------------------------------------------------------------------
// The question and the feedback under the traceback
// ---------------------------------------------------------------------------
function lineFeedback() {
  const tb = TRACEBACKS[idx], ok = pickedLine[idx] === tb.errorRow;
  return { ok: ok, text: ok ? 'Correct. The last line names the error type.'
    : 'That is not the error type. The last line of a traceback names the error: ' + tb.rows[tb.errorRow].text };
}

function frameFeedback() {
  const tb = TRACEBACKS[idx], ok = pickedFrame[idx] === tb.answerFrame;
  return { ok: ok, text: ok ? 'Correct. ' + tb.why : 'Check this frame first instead: ' + tb.frameName + '. ' + tb.why };
}

function drawMessage(x, y, w, maxH, size) {
  if (phase === 'askLine') {
    let yy = para('Click the line that names the error type.', x, y, w, { size: size, bold: true }) + 2;
    paraFit(hint || 'Then press Check. You get one attempt.', x, yy, w, maxH - (yy - y), { size: size, col: 'dimgray', tag: 'prompt' });
    return;
  }
  if (phase === 'askFrame') {
    const q = 'Now click the frame you would check first.' + (hint ? ' ' + hint : '');
    // the prompt keeps its size; the result of the first answer shrinks if space is short
    const qh = para(q, x, 0, w, { size: size, bold: true, measure: true });
    const fb = lineFeedback();
    const yy = paraFit(fb.text, x, y, w, maxH - qh - 4, { size: size, col: fb.ok ? 'darkgreen' : 'firebrick', tag: 'line feedback' }) + 4;
    para(q, x, yy, w, { size: size, bold: true });
    return;
  }
  const fb = frameFeedback();
  paraFit(fb.text, x, y, w, maxH, { size: size, col: fb.ok ? 'darkgreen' : 'firebrick', tag: 'frame feedback' });
}

// ---------------------------------------------------------------------------
// The final screen
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, narrow ? 330 : 300, 10);
  let y = top + 12;
  txt('Correct: ' + correctCount + ' of ' + TOTAL, x + 12, y, 'black', LEFT, TOP, 20, true);
  y += 30;
  y = para(ok ? 'Mastery reached (8 of 10 or better).' : 'Mastery is 8 of 10. Press Try again.', x + 12, y, w - 24,
    { size: 16, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 10;
  // one row per traceback: was the error line right, and was the frame right?
  const c1 = x + 12, c2 = x + w * (narrow ? 0.60 : 0.50), c3 = x + w * (narrow ? 0.82 : 0.72);
  const hs = narrow ? 14 : 16;
  txt('Traceback', c1, y, 'dimgray', LEFT, TOP, hs, true);
  txt(narrow ? 'Error' : 'Error line', c2, y, 'dimgray', CENTER, TOP, hs, true);
  txt('Frame', c3, y, 'dimgray', CENTER, TOP, hs, true);
  y += 26;
  TRACEBACKS.forEach((tb, i) => {
    txt((i + 1) + '. ' + tb.label, c1, y + 11, 'black', LEFT, CENTER, narrow ? 14 : 16);
    drawMark(c2, y + 11, pickedLine[i] === tb.errorRow, 6);
    drawMark(c3, y + 11, pickedFrame[i] === tb.answerFrame, 6);
    y += 28;
  });
  y += 6;
  para('Read the last line first. Then find the deepest frame inside your own project folder.', x + 12, y, w - 24, { size: narrow ? 15 : 16, col: 'dimgray' });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  actionBtn.position(canvasWidth - (narrow ? 138 : 170), drawHeight + 12);
  actionBtn.size(narrow ? 128 : 160);
}

function drawControlLabels() {
  let s = '';
  if (phase === 'askLine') s = narrow ? 'Click a line.' : 'Click a line of the traceback, then press Check.';
  else if (phase === 'askFrame') s = narrow ? 'Click a frame.' : 'Click a frame of the traceback, then press Check.';
  if (s) txt(s, 12, drawHeight + 26, 'black', LEFT, CENTER, narrow ? 15 : 16);
}

function refreshControls() {
  const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
  if (phase === 'askLine') { actionBtn.html('Check'); able(selLine >= 0); }
  else if (phase === 'askFrame') { actionBtn.html('Check'); able(selFrame >= 0); }
  else if (phase === 'feedback') { actionBtn.html(idx === TRACEBACKS.length - 1 ? 'See score' : 'Next traceback'); able(true); }
  else { actionBtn.html('Try again'); able(true); }
}

function onAction() {
  const tb = TRACEBACKS[idx];
  hint = '';
  if (phase === 'askLine') {
    if (selLine < 0) return;
    pickedLine[idx] = selLine;                       // one attempt per question
    if (selLine === tb.errorRow) correctCount++;
    selLine = -1; phase = 'askFrame';
  } else if (phase === 'askFrame') {
    if (selFrame < 0) return;
    pickedFrame[idx] = selFrame;
    if (selFrame === tb.answerFrame) correctCount++;
    selFrame = -1; phase = 'feedback';
  } else if (phase === 'feedback') {
    if (idx < TRACEBACKS.length - 1) { idx++; phase = 'askLine'; } else { phase = 'done'; }
  } else {
    idx = 0; correctCount = 0; pickedLine = []; pickedFrame = []; selLine = -1; selFrame = -1; phase = 'askLine';
  }
  refreshControls();
}

// which row of the traceback is at (x, y), or -1
function rowAt(x, y) {
  const L = tbLayout;
  if (!L || x < L.x || x > L.x + L.w) return -1;
  return L.rows.findIndex(r => y >= r.y && y < r.y + r.h);
}

function mousePressed() {
  if (phase !== 'askLine' && phase !== 'askFrame') return;
  const i = rowAt(mouseX, mouseY);
  if (i < 0) return;
  if (phase === 'askLine') { selLine = i; hint = ''; }
  else {
    const f = TRACEBACKS[idx].rows[i].frame;
    if (f < 0) { hint = 'A frame is a File line and the code under it.'; return; }
    selFrame = f; hint = '';
  }
  refreshControls();
}

function updateCursor() {
  const live = phase === 'askLine' || phase === 'askFrame';
  cursor(live && rowAt(mouseX, mouseY) >= 0 ? 'pointer' : 'default');
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
// o: size, bold, col, lh (line height), measure
function para(str, x, y, w, o) {
  o = o || {};
  const size = o.size || defaultTextSize;
  const lh = o.lh || Math.round(size * 1.3);
  const lines = wrapLines(str, w, size, o.bold);
  if (!o.measure) {
    noStroke(); fill(o.col || 'black'); setFont(size, o.bold); textAlign(LEFT, TOP);
    lines.forEach((ln, i) => text(ln, x, y + i * lh));
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
