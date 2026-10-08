// JSON Syntax Doctor - p5.js MicroSim
// CANVAS_HEIGHT: 604
// Learning objective (Evaluate, critique): critique six short JSON settings files by marking the line that breaks
// a JSON rule and naming the rule, or by judging the file correct, with at least 5 of 6 correct on the first
// attempt. Evidence: the line and rule (or "No error") committed with Check for each file.
// Files 1 to 5 each break exactly one of the five rules on exactly one line. File 6 is valid. An answer counts
// only when both the line and the rule are right. The file text is drawn in plain black, with no syntax
// coloring, so that color never gives the mistake away.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 520;
let controlHeight = 84;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// the five rules (Chapter 1, "The JSON File Format")
const RULES = [
  { letter: 'A', text: 'Text uses double quotes, never single quotes.', short: 'double quotes' },
  { letter: 'B', text: 'Items are separated by commas.', short: 'commas between items' },
  { letter: 'C', text: 'There is no comma after the last item.', short: 'no comma after the last item' },
  { letter: 'D', text: 'There are no comments.', short: 'no comments' },
  { letter: 'E', text: 'true, false, and null are lowercase.', short: 'lowercase true, false, null' }
];

// six files, in fixed order. line is the 1-based bad line and rule the index into RULES; both are null for the valid file.
const FILES = [
  { lines: ['{', '  \'port\': "/dev/ttyACM0",', '  "baud_rate": 1000000', '}'], line: 2, rule: 0, note: 'single quotes',
    why: '\'port\' uses single quotes. JSON keys and strings need double quotes.' },
  { lines: ['{', '  "port": "/dev/ttyACM0",', '  "baud_rate": 1000000,', '}'], line: 3, rule: 2, note: 'trailing comma',
    why: 'The comma after 1000000 has no item after it. The last item must not end with a comma. Python 3.13 reports it on line 3, and older versions may report line 4.' },
  { lines: ['{', '  "port": "/dev/ttyACM0"', '  "baud_rate": 1000000', '}'], line: 2, rule: 1, note: 'missing comma',
    why: 'Line 2 needs a comma at its end to separate it from line 3. The parser notices the problem on line 3, but the missing comma is on line 2.' },
  { lines: ['{', '  // serial port of the follower arm', '  "port": "/dev/ttyACM0"', '}'], line: 2, rule: 3, note: 'a comment',
    why: 'JSON has no comments. Put notes in a README or in a "notes" key instead.' },
  { lines: ['{', '  "torque_enabled": True,', '  "baud_rate": 1000000', '}'], line: 2, rule: 4, note: 'capital True',
    why: 'JSON writes the boolean as true. True with a capital T is Python, not JSON.' },
  { lines: ['{', '  "port": "/dev/ttyACM0",', '  "baud_rate": 1000000,', '  "calibrated": false', '}'], line: null, rule: null, note: '',
    why: 'Every key is in double quotes, items are separated by commas, the last item has no comma, and false is lowercase.' }
];
const MASTERY = 5, MAX_LINES = 5;
const NO_ERROR = 'none';

// controls
let lineSelect, ruleSelect, actionBtn;

// state
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0;
let selLine = null;                // 1-based line number, NO_ERROR, or null
let selRule = null;                // index into RULES, or null
let picks = [];                    // committed answers: { line, rule }
let fileRect = null, rulesRect = null, panelRect = null, lineRects = [], ruleRects = [], noneRect = null;
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  lineSelect = createSelect();
  lineSelect.option('Choose a line', '');
  for (let n = 1; n <= MAX_LINES; n++) lineSelect.option('Line ' + n, String(n));
  lineSelect.option('No error', NO_ERROR);
  lineSelect.changed(() => { const v = lineSelect.value(); if (v) chooseLine(v === NO_ERROR ? NO_ERROR : parseInt(v, 10)); });

  ruleSelect = createSelect();
  ruleSelect.option('Choose a rule', '');
  RULES.forEach((r, i) => ruleSelect.option(r.letter + ': ' + r.short, String(i)));
  ruleSelect.changed(() => { const v = ruleSelect.value(); if (v !== '') chooseRule(parseInt(v, 10)); });

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  layoutControls();
  refreshControls();
  describe('A short JSON settings file is shown with line numbers beside a list of five JSON rules. The learner ' +
    'marks the line that breaks a rule and names the rule, or judges the file correct. Feedback marks the bad ' +
    'line and explains it, across six files.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('JSON Syntax Doctor', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  txt(phase === 'done' ? 'All 6 files done' : 'File ' + (idx + 1) + ' of ' + FILES.length, 10, sy, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + FILES.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  const top = sy + size + 8;

  if (phase === 'done') { fileRect = null; drawResults(top); cursor('default'); return; }
  computeLayout(top);
  drawFile();
  drawRules();
  drawPanel(size);
  drawControlLabels();
  updateCursor();
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout(top) {
  const lineH = narrow ? 25 : 34, noneH = narrow ? 28 : 34;
  const fileH = 6 + MAX_LINES * lineH + 6 + noneH + 6;
  if (narrow) {
    const w = canvasWidth - 16, ruleH = 28;
    fileRect = { x: 8, y: top, w: w, h: fileH };
    rulesRect = { x: 8, y: top + fileH + 6, w: w, h: 4 + RULES.length * ruleH + 4, rowH: ruleH, head: 0 };
    const py = rulesRect.y + rulesRect.h + 6;
    panelRect = { x: 8, y: py, w: w, h: drawHeight - py - 6 };
  } else {
    const fw = Math.round((canvasWidth - 26) * 0.46);
    const head = 26, ruleH = (fileH - head - 8) / RULES.length;
    fileRect = { x: 8, y: top, w: fw, h: fileH };
    rulesRect = { x: 8 + fw + 10, y: top, w: canvasWidth - 26 - fw, h: fileH, rowH: ruleH, head: head };
    const py = top + fileH + 8;
    panelRect = { x: 8, y: py, w: canvasWidth - 16, h: drawHeight - py - 8 };
  }
  const n = FILES[idx].lines.length;
  lineRects = [];
  for (let i = 0; i < n; i++) lineRects.push({ x: fileRect.x + 4, y: fileRect.y + 6 + i * lineH, w: fileRect.w - 8, h: lineH });
  noneRect = { x: fileRect.x + 8, y: fileRect.y + 6 + MAX_LINES * lineH + 6, w: fileRect.w - 16, h: noneH };
  ruleRects = RULES.map((r, i) => ({ x: rulesRect.x + 4, y: rulesRect.y + 4 + rulesRect.head + i * rulesRect.rowH, w: rulesRect.w - 8, h: rulesRect.rowH }));
}

// ---------------------------------------------------------------------------
// The file and the rules
// ---------------------------------------------------------------------------
// how a line (1-based), the "No error" box or a rule row should look in the current phase
function choiceLook(isRule, key) {
  const f = FILES[idx], look = { fill: null, border: null, mark: null };
  const chosen = isRule ? selRule : selLine;
  const right = isRule ? f.rule : (f.line === null ? NO_ERROR : f.line);
  if (phase === 'ask') {
    if (chosen === key) { look.fill = 'lemonchiffon'; look.border = 'darkorange'; }
  } else if (phase === 'feedback') {
    const picked = isRule ? picks[idx].rule : picks[idx].line;
    if (key === right) { look.fill = 'palegreen'; look.border = 'darkgreen'; look.mark = true; }
    else if (key === picked) { look.fill = 'mistyrose'; look.border = 'firebrick'; look.mark = false; }
  }
  return look;
}

function drawFile() {
  const F = fileRect, f = FILES[idx];
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(F.x, F.y, F.w, F.h, 8);
  const gutter = narrow ? 26 : 32, fs = narrow ? 16 : 18;
  const hover = phase === 'ask' ? hitAt(mouseX, mouseY) : null;
  // gutter for the line numbers
  noStroke(); fill('whitesmoke');
  rect(F.x + 1, F.y + 1, gutter, lineRects.length * lineRects[0].h + 10, 7, 0, 0, 0);
  f.lines.forEach((raw, i) => {
    const r = lineRects[i], n = i + 1, cy = r.y + r.h / 2;
    const look = choiceLook(false, n);
    const bx = F.x + gutter + 2, bw = F.x + F.w - 4 - bx;
    if (look.fill) { fill(look.fill); stroke(look.border); strokeWeight(2); rect(bx, r.y + 1, bw, r.h - 2, 5); strokeWeight(1); }
    else if (hover && hover.kind === 'line' && hover.key === n) { fill('gainsboro'); noStroke(); rect(bx, r.y + 1, bw, r.h - 2, 5); }
    txt(String(n), F.x + gutter / 2 + 1, cy + 1, 'dimgray', CENTER, CENTER, narrow ? 14 : 15, false);
    const lead = raw.length - raw.trimStart().length;
    lineFit(raw.trim(), bx + 8 + lead * (narrow ? 8 : 10), cy + 1, bw - 16 - lead * (narrow ? 8 : 10) - 22, { size: fs });
    if (look.mark !== null) drawMark(F.x + F.w - 18, cy, look.mark, 6);
  });
  // the "No error" choice
  const nr = noneRect, look = choiceLook(false, NO_ERROR);
  const hv = hover && hover.kind === 'line' && hover.key === NO_ERROR;
  fill(look.fill || (hv ? 'gainsboro' : 'whitesmoke')); stroke(look.border || 'gray'); strokeWeight(look.border ? 2 : 1);
  rect(nr.x, nr.y, nr.w, nr.h, 6);
  strokeWeight(1);
  txt('No error: this file is valid', nr.x + nr.w / 2, nr.y + nr.h / 2 + 1, 'black', CENTER, CENTER, narrow ? 15 : 16, false);
  if (look.mark !== null) drawMark(nr.x + nr.w - 14, nr.y + nr.h / 2, look.mark, 6);
}

function drawRules() {
  const R = rulesRect;
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(R.x, R.y, R.w, R.h, 8);
  if (R.head) txt('The five JSON rules', R.x + 12, R.y + 4 + R.head / 2, 'black', LEFT, CENTER, 16, true);
  const hover = phase === 'ask' ? hitAt(mouseX, mouseY) : null;
  const needRule = !(phase === 'ask' && selLine === NO_ERROR);       // "No error" needs no rule
  RULES.forEach((rule, i) => {
    const r = ruleRects[i], cy = r.y + r.h / 2, look = choiceLook(true, i);
    if (look.fill) { fill(look.fill); stroke(look.border); strokeWeight(2); rect(r.x, r.y + 1, r.w, r.h - 2, 5); strokeWeight(1); }
    else if (needRule && hover && hover.kind === 'rule' && hover.key === i) { fill('gainsboro'); noStroke(); rect(r.x, r.y + 1, r.w, r.h - 2, 5); }
    const br = narrow ? 10 : 12;
    fill(needRule ? 'steelblue' : 'silver'); noStroke(); circle(r.x + 8 + br, cy, br * 2);
    txt(rule.letter, r.x + 8 + br, cy + 1, 'white', CENTER, CENTER, narrow ? 14 : 15, true);
    lineFit(rule.text, r.x + 16 + br * 2, cy + 1, r.w - (16 + br * 2) - 26, { size: narrow ? 14 : 16, col: needRule ? 'black' : 'gray' });
    if (look.mark !== null) drawMark(r.x + r.w - 14, cy, look.mark, 6);
  });
}

// ---------------------------------------------------------------------------
// The question and the feedback
// ---------------------------------------------------------------------------
function feedbackFor(k) {
  const f = FILES[k], p = picks[k];
  if (f.line === null) {
    const ok = p.line === NO_ERROR;
    return { ok: ok, text: (ok ? 'Correct: no error. ' : 'This file is valid. ') + f.why };
  }
  const letter = RULES[f.rule].letter;
  if (p.line === f.line && p.rule === f.rule) return { ok: true, text: 'Correct: line ' + f.line + ' breaks rule ' + letter + '. ' + f.why };
  if (p.line === f.line) return { ok: false, text: 'You found the bad line, but a different rule applies: rule ' + letter + '. ' + f.why };
  return { ok: false, text: 'Look again: the problem is on line ' + f.line + ' (rule ' + letter + '). ' + f.why };
}

function drawPanel(size) {
  const P = panelRect;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(P.x, P.y, P.w, P.h, 10);
  const x = P.x + 10, w = P.w - 20, bottom = P.y + P.h - 8;
  let y = P.y + 8;
  if (phase === 'ask') {
    y = para('Which line breaks a JSON rule, and which rule is it?', x, y, w, { size: size, bold: true }) + 4;
    let s = 'Click a line of the file, or No error. Then click a rule and press Check.';
    if (selLine === NO_ERROR) s = 'You chose No error. Press Check to commit, or click a line instead.';
    else if (selLine !== null && selRule === null) s = 'Line ' + selLine + ' is chosen. Now click the rule it breaks.';
    else if (selLine !== null) s = 'Line ' + selLine + ' and rule ' + RULES[selRule].letter + ' are chosen. Press Check to commit.';
    paraFit(s, x, y, w, bottom - y, { size: size, col: 'dimgray', tag: 'prompt' });
    return;
  }
  const fb = feedbackFor(idx);
  paraFit(fb.text, x, y, w, bottom - y, { size: size, col: fb.ok ? 'darkgreen' : 'firebrick', tag: 'feedback' });
}

// ---------------------------------------------------------------------------
// The final screen: the score and the six files with their verdicts
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, 300, 10);
  let y = top + 12;
  txt('Correct: ' + correctCount + ' of ' + FILES.length, x + 12, y, 'black', LEFT, TOP, 20, true);
  y += 30;
  y = para(ok ? 'Mastery reached (5 of 6 or better).' : 'Mastery is 5 of 6. Press Try again.', x + 12, y, w - 24,
    { size: 16, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 10;
  FILES.forEach((f, i) => {
    const p = picks[i];
    const good = f.line === null ? p.line === NO_ERROR : (p.line === f.line && p.rule === f.rule);
    const verdict = f.line === null ? 'no error, the file is valid'
      : 'line ' + f.line + ' breaks rule ' + RULES[f.rule].letter + ' (' + f.note + ')';
    drawMark(x + 22, y + 13, good, 6);
    lineFit('File ' + (i + 1) + ': ' + verdict, x + 40, y + 14, w - 52, { size: narrow ? 15 : 16 });
    y += 30;
  });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 10, ROW2 = 48;

function layoutControls() {
  lineSelect.position(narrow ? 48 : 54, drawHeight + ROW1);
  lineSelect.size(narrow ? 112 : 140);
  const rx = narrow ? 212 : 260;
  ruleSelect.position(rx, drawHeight + ROW1);
  ruleSelect.size(Math.min(canvasWidth - rx - 10, 260));
  actionBtn.position(canvasWidth - (narrow ? 128 : 160), drawHeight + ROW2);
  actionBtn.size(narrow ? 118 : 150);
}

function drawControlLabels() {
  if (phase === 'done') return;
  const y = drawHeight + ROW1 + 12;
  txt('Line:', 10, y, 'black');
  txt('Rule:', narrow ? 170 : 214, y, 'black');
  if (!narrow) txt('One attempt per file. Both the line and the rule must be right.', 10, drawHeight + ROW2 + 12, 'dimgray');
}

function refreshControls() {
  const asking = phase === 'ask';
  if (phase === 'done') { lineSelect.hide(); ruleSelect.hide(); } else { lineSelect.show(); ruleSelect.show(); }
  if (phase !== 'done') {
    const n = FILES[idx].lines.length;
    for (let k = 1; k <= MAX_LINES; k++) {                   // hide line numbers this file does not have
      lineSelect.elt.options[k].hidden = k > n;
      lineSelect.elt.options[k].disabled = k > n;
    }
    const shown = asking ? { line: selLine, rule: selRule } : picks[idx];
    lineSelect.selected(shown.line === null ? '' : String(shown.line));
    ruleSelect.selected(shown.rule === null ? '' : String(shown.rule));
    if (asking) lineSelect.removeAttribute('disabled'); else lineSelect.attribute('disabled', '');
    if (asking && selLine !== NO_ERROR) ruleSelect.removeAttribute('disabled'); else ruleSelect.attribute('disabled', '');
  }
  const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
  if (asking) { actionBtn.html('Check'); able(selLine === NO_ERROR || (selLine !== null && selRule !== null)); }
  else if (phase === 'feedback') { actionBtn.html(idx === FILES.length - 1 ? 'See score' : 'Next file'); able(true); }
  else { actionBtn.html('Try again'); able(true); }
}

function chooseLine(v) {
  if (phase !== 'ask') return;
  selLine = v;
  if (v === NO_ERROR) selRule = null;                         // a valid file breaks no rule
  refreshControls();
}

function chooseRule(i) {
  if (phase !== 'ask' || selLine === NO_ERROR) return;
  selRule = i;
  refreshControls();
}

function onAction() {
  if (phase === 'ask') {
    if (!(selLine === NO_ERROR || (selLine !== null && selRule !== null))) return;
    picks[idx] = { line: selLine, rule: selLine === NO_ERROR ? null : selRule };   // one attempt per file
    if (feedbackFor(idx).ok) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    selLine = null; selRule = null;
    if (idx < FILES.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else {
    idx = 0; correctCount = 0; picks = []; selLine = null; selRule = null; phase = 'ask';
  }
  refreshControls();
}

// what is under (x, y): { kind: 'line', key: n or NO_ERROR }, { kind: 'rule', key: i } or null
function hitAt(x, y) {
  if (!fileRect) return null;
  const inside = r => x >= r.x && x <= r.x + r.w && y >= r.y && y < r.y + r.h;
  if (inside(noneRect)) return { kind: 'line', key: NO_ERROR };
  const li = lineRects.findIndex(inside);
  if (li >= 0) return { kind: 'line', key: li + 1 };
  const ri = ruleRects.findIndex(inside);
  if (ri >= 0) return { kind: 'rule', key: ri };
  return null;
}

function mousePressed() {
  if (phase !== 'ask') return;
  const h = hitAt(mouseX, mouseY);
  if (!h) return;
  if (h.kind === 'line') chooseLine(h.key); else chooseRule(h.key);
}

function updateCursor() {
  const h = phase === 'ask' ? hitAt(mouseX, mouseY) : null;
  cursor(h && !(h.kind === 'rule' && selLine === NO_ERROR) ? 'pointer' : 'default');
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

// one line of text, vertically centered on y. The size steps down until it fits maxW; a line that still does not
// fit is reported, because cutting a line of a JSON file short would hide the very thing the learner must judge.
function lineFit(str, x, y, maxW, o) {
  o = o || {};
  let size = o.size || defaultTextSize;
  const minSize = o.min || 12;
  setFont(size, o.bold);
  while (size > minSize && tw(str) > maxW) { size--; setFont(size, o.bold); }
  if (tw(str) > maxW + 1) layoutIssues.push('line "' + str + '" is ' + Math.round(tw(str) - maxW) + 'px too wide');
  noStroke(); fill(o.col || 'black'); textAlign(LEFT, CENTER);
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
