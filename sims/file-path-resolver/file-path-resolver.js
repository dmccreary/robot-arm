// File Path Resolver - p5.js MicroSim
// CANVAS_HEIGHT: 624
// Learning objective (Apply, solve): solve eight path problems by determining which file, or no file, a path
// reaches from a given working directory, with at least 7 of 8 correct on the first attempt. Evidence: the
// answer committed with Check for each problem. The free-trial mode that follows is exploration, not evidence.
// Rules: start at / if the path begins with /, otherwise at the working directory. Then go through the pieces
// from left to right: . stays, .. moves to the parent (the parent of / is /), any other name moves into the
// child with that name. If a name is not there, the answer is "No such file".
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 540;
let controlHeight = 84;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// ---------------------------------------------------------------------------
// The file system. The tree on screen starts at /home/maker; / and /home exist but are not drawn.
// ---------------------------------------------------------------------------
function fileNode(name) { return { name: name, file: true, kids: [] }; }
function folderNode(name, kids) {
  const d = { name: name, file: false, kids: kids };
  kids.forEach(k => { k.parent = d; });
  return d;
}
const ROOT = folderNode('', [
  folderNode('home', [
    folderNode('maker', [
      fileNode('notes.txt'),
      folderNode('arm-lab', [
        fileNode('show_config.py'),
        folderNode('config', [fileNode('arm.json'), fileNode('arm_backup.json')]),
        folderNode('armlab', [fileNode('__init__.py'), fileNode('config.py')])
      ])
    ])
  ])
]);

function fullPath(n) {
  if (n === ROOT) return '/';
  const parts = [];
  for (let c = n; c !== ROOT; c = c.parent) parts.unshift(c.name);
  return '/' + parts.join('/');
}

// the short name used in the steps: /, /home and /home/maker are written in full, deeper folders by name
function shortName(n) {
  if (n === ROOT || n.parent === ROOT || n.parent.parent === ROOT) return fullPath(n);
  return n.name;
}

function nodeAt(absPath) {
  let cur = ROOT;
  absPath.split('/').filter(p => p.length > 0).forEach(p => { cur = cur.kids.find(k => k.name === p); });
  return cur;
}

// resolves pathStr starting from startNode. Returns the steps in words, the nodes visited and the node reached
// (null when a step names something that is not there).
function resolvePath(startNode, pathStr, startPhrase) {
  const absolute = pathStr.charAt(0) === '/';
  let cur = absolute ? ROOT : startNode;
  const steps = [absolute ? 'start at /, because the path begins with /' : startPhrase];
  const visited = [cur];
  const pieces = pathStr.split('/').filter(p => p.length > 0);
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    if (cur.file) { steps.push(cur.name + ' is a file, so nothing is inside it'); return { steps: steps, visited: visited, node: null }; }
    if (p === '.') {
      steps.push('stay in ' + shortName(cur));
    } else if (p === '..') {
      cur = cur.parent || cur;                         // the parent of / is /
      steps.push('move up to ' + shortName(cur));
      visited.push(cur);
    } else {
      const k = cur.kids.find(c => c.name === p);
      if (!k) { steps.push('there is no ' + p + ' in ' + shortName(cur)); return { steps: steps, visited: visited, node: null }; }
      cur = k;
      steps.push('move into ' + p);
      visited.push(cur);
    }
  }
  return { steps: steps, visited: visited, node: cur };
}

// the rows of the tree as drawn, top to bottom
const TREE_ROWS = [];
(function flatten(n, depth) {
  TREE_ROWS.push({ node: n, depth: depth });
  n.kids.forEach(k => flatten(k, depth + 1));
})(nodeAt('/home/maker'), 0);
const FILE_PATHS = TREE_ROWS.filter(r => r.node.file).map(r => fullPath(r.node));
const NONE = 'NONE';
const WORKING_DIRS = ['/home/maker', '/home/maker/arm-lab', '/home/maker/arm-lab/config', '/home/maker/arm-lab/armlab'];

// eight problems, in fixed order. correct is a full path, or NONE for "No such file".
// Problem 8 builds its path from the script's own location: start is the folder that holds the script.
const PROBLEMS = [
  { wd: '/home/maker/arm-lab', path: 'config/arm.json', correct: '/home/maker/arm-lab/config/arm.json',
    why: 'A relative path starts at the working directory, and config/arm.json is inside it.' },
  { wd: '/home/maker', path: 'config/arm.json', correct: NONE,
    why: 'There is no config folder inside /home/maker. It is inside arm-lab.' },
  { wd: '/home/maker/arm-lab/config', path: '../show_config.py', correct: '/home/maker/arm-lab/show_config.py',
    why: '.. moves up one folder, from config to arm-lab.' },
  { wd: '/home/maker/arm-lab/armlab', path: '../config/arm_backup.json', correct: '/home/maker/arm-lab/config/arm_backup.json',
    why: '.. moves up from armlab to arm-lab, then config/arm_backup.json goes back down.' },
  { wd: '/home/maker', path: '/home/maker/arm-lab/config/arm.json', correct: '/home/maker/arm-lab/config/arm.json',
    why: 'A path that starts with / is absolute, so the working directory is ignored.' },
  { wd: '/home/maker/arm-lab', path: './notes.txt', correct: NONE,
    why: '. is the working directory, arm-lab. The file notes.txt is one level up, in /home/maker.' },
  { wd: '/home/maker/arm-lab/armlab', path: '../../notes.txt', correct: '/home/maker/notes.txt',
    why: 'Two .. move up twice, from armlab to arm-lab to /home/maker.' },
  { wd: '/home/maker', script: '/home/maker/arm-lab/show_config.py', code: 'Path(__file__).parent / "config" / "arm.json"',
    path: 'config/arm.json', correct: '/home/maker/arm-lab/config/arm.json',
    why: '__file__ is the script\'s own location, so the path is built from arm-lab and the working directory does not matter.' }
];
const MASTERY = 7;

function solve(p) {
  if (p.script) {
    const dir = nodeAt(p.script).parent;
    return resolvePath(dir, p.path, 'start at ' + fullPath(dir) + ', the folder that holds the script');
  }
  return resolvePath(nodeAt(p.wd), p.path, 'start at ' + p.wd);
}
function answerOf(res) { return res.node && res.node.file ? fullPath(res.node) : NONE; }
function answerText(a) { return a === NONE ? 'No such file' : a; }

// controls
let modeSelect, actionBtn, answerSelect, wdSelect, pathInput;

// state
let mode = 'problems';             // 'problems' or 'free'
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0;
let answer = null;                 // the current, uncommitted answer: a full path, NONE or null
let picks = [];                    // committed answers
let unlocked = false;              // free trial unlocks after problem 8
let hint = '';
let treeRect = null, panelRect = null, rowRects = [], noneRect = null;
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Problems (8)', 'problems');
  modeSelect.option('Free trial (after problem 8)', 'free');
  modeSelect.selected('problems');
  modeSelect.changed(() => setMode(modeSelect.value()));

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  answerSelect = createSelect();
  answerSelect.option('Choose a file', '');
  FILE_PATHS.forEach(f => answerSelect.option(f, f));
  answerSelect.option('No such file', NONE);
  answerSelect.changed(() => { const v = answerSelect.value(); if (v && phase === 'ask') { answer = v; hint = ''; refreshControls(); } });

  wdSelect = createSelect();
  WORKING_DIRS.forEach(d => wdSelect.option(d, d));
  wdSelect.selected('/home/maker/arm-lab');
  pathInput = createInput('config/arm.json');
  pathInput.attribute('placeholder', 'type a path');
  pathInput.attribute('aria-label', 'Path to resolve');

  layoutControls();
  refreshControls();
  describe('A file tree for the folder /home/maker with an arm-lab project inside it. Each problem gives a working ' +
    'directory and a path. The learner picks the file the path reaches, or No such file, then sees the ' +
    'resolution step by step. A free-trial mode resolves any typed path.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('File Path Resolver', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  if (mode === 'problems') {
    txt(phase === 'done' ? 'All 8 problems done' : 'Problem ' + (idx + 1) + ' of ' + PROBLEMS.length, 10, sy, 'black', LEFT, TOP, size, true);
    txt('Correct: ' + correctCount + ' of ' + PROBLEMS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  } else {
    txt('Free trial: choose a working directory and type a path', 10, sy, 'black', LEFT, TOP, narrow ? 14 : 16, true);
  }

  computeLayout(sy + size + 8);
  const view = currentView();
  drawTree(view);
  drawPanel(view, size);
  drawControlLabels();
  updateCursor();
}

// what the tree should show right now: the working directory, the script, and (after a commitment) the route
function currentView() {
  if (mode === 'free') {
    const wd = wdSelect.value(), path = pathInput.value().trim();
    const res = path ? resolvePath(nodeAt(wd), path, 'start at ' + wd) : null;
    return { wd: wd, script: null, res: res, reveal: !!res, path: path };
  }
  if (phase === 'done') return { wd: null, script: null, res: null, reveal: false };
  const p = PROBLEMS[idx];
  return { wd: p.wd, script: p.script || null, res: solve(p), reveal: phase === 'feedback', problem: p };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout(top) {
  const rowH = narrow ? 21 : 36;
  if (narrow) {
    treeRect = { x: 8, y: top, w: canvasWidth - 16, h: TREE_ROWS.length * rowH + 44 };
    const py = treeRect.y + treeRect.h + 6;
    panelRect = { x: 8, y: py, w: canvasWidth - 16, h: drawHeight - py - 6 };
  } else {
    const w = Math.min(350, Math.round(canvasWidth * 0.44));
    treeRect = { x: 8, y: top, w: w, h: drawHeight - top - 8 };
    panelRect = { x: 8 + w + 10, y: top, w: canvasWidth - (8 + w + 10) - 8, h: drawHeight - top - 8 };
  }
  rowRects = TREE_ROWS.map((r, i) => ({ x: treeRect.x + 4, y: treeRect.y + 6 + i * rowH, w: treeRect.w - 8, h: rowH }));
  noneRect = { x: treeRect.x + 10, y: treeRect.y + 6 + TREE_ROWS.length * rowH + 6, w: treeRect.w - 20, h: 26 };
}

// ---------------------------------------------------------------------------
// The tree
// ---------------------------------------------------------------------------
function rowLook(pathOrNone, view) {
  // returns { fill, border, mark } for a file row or the "No such file" row
  const look = { fill: null, border: null, mark: null };
  if (mode === 'free') {
    if (!view.res) return look;
    const got = view.res.node ? fullPath(view.res.node) : NONE;
    if (got === pathOrNone) { look.fill = pathOrNone === NONE ? 'mistyrose' : 'palegreen'; look.border = pathOrNone === NONE ? 'firebrick' : 'darkgreen'; }
    return look;
  }
  if (phase === 'ask') {
    if (answer === pathOrNone) { look.fill = 'lemonchiffon'; look.border = 'darkorange'; }
  } else if (phase === 'feedback') {
    const right = PROBLEMS[idx].correct;
    if (pathOrNone === right) { look.fill = 'palegreen'; look.border = 'darkgreen'; look.mark = true; }
    else if (pathOrNone === picks[idx]) { look.fill = 'mistyrose'; look.border = 'firebrick'; look.mark = false; }
  }
  return look;
}

function drawTree(view) {
  const T = treeRect;
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(T.x, T.y, T.w, T.h, 8);
  const ind = narrow ? 17 : 24, fs = narrow ? 14 : 16;
  const colX = d => T.x + 14 + d * ind;                  // x of the icon for a row at depth d
  const hover = mode === 'problems' && phase === 'ask' ? hitAt(mouseX, mouseY) : null;

  // connector lines from each folder down to its children
  stroke('silver'); strokeWeight(1.5);
  TREE_ROWS.forEach((r, i) => {
    if (r.depth === 0) return;
    const pi = TREE_ROWS.findIndex(q => q.node === r.node.parent);
    const px = colX(r.depth - 1) + 7, cy = rowRects[i].y + rowRects[i].h / 2;
    line(px, rowRects[pi].y + rowRects[pi].h / 2 + 8, px, cy);
    line(px, cy, colX(r.depth) - 3, cy);
  });
  strokeWeight(1);

  TREE_ROWS.forEach((r, i) => {
    const n = r.node, rr = rowRects[i], cy = rr.y + rr.h / 2, x = colX(r.depth);
    const p = fullPath(n);
    if (n.file) {
      const look = rowLook(p, view);
      const bx = x - 4, bw = rr.x + rr.w - bx;
      if (look.fill) { fill(look.fill); stroke(look.border); strokeWeight(2); rect(bx, rr.y + 1, bw, rr.h - 2, 5); strokeWeight(1); }
      else if (hover === p) { fill('gainsboro'); noStroke(); rect(bx, rr.y + 1, bw, rr.h - 2, 5); }
      if (look.mark !== null) drawMark(rr.x + rr.w - 14, cy, look.mark, 6);
      // file icon: a small page
      fill('white'); stroke('dimgray'); strokeWeight(1); rect(x + 1, cy - 7, 11, 14, 2);
    } else {
      if (mode === 'free' && view.res && view.res.node === n) { fill('lightcyan'); stroke('steelblue'); strokeWeight(2); rect(x - 4, rr.y + 1, rr.x + rr.w - x + 4, rr.h - 2, 5); strokeWeight(1); }
      // folder icon: a tab and a body
      fill('khaki'); stroke('darkgoldenrod'); strokeWeight(1);
      rect(x, cy - 7, 7, 4, 1); rect(x, cy - 4, 15, 11, 2);
    }
    const label = r.depth === 0 ? '/home/maker/' : n.name + (n.file ? '' : '/');
    txt(label, x + 20, cy + 1, 'black', LEFT, CENTER, fs, !n.file);
    textSize(fs); textStyle(n.file ? NORMAL : BOLD);
    let tx = x + 20 + tw(label) + 8;
    textStyle(NORMAL);
    // tags in words: the working directory and (problem 8) the script
    if (view.wd === p) tx = pill(narrow ? 'working dir' : 'working directory', tx, cy, 'darkorange', 'black') + 6;
    if (view.script === p) tx = pill('the script', tx, cy, 'steelblue', 'white') + 6;
    // step numbers along the route, shown once the answer is revealed
    if (view.reveal && view.res) {
      const nums = [];
      view.res.visited.forEach((v, k) => { if (v === n) nums.push(k + 1); });
      if (nums.length) {
        const bxr = rr.x + rr.w - (n.file ? 40 : 16);
        fill('navy'); noStroke(); circle(bxr, cy, 18);
        txt(nums.join(','), bxr, cy + 1, 'white', CENTER, CENTER, nums.length > 1 ? 10 : 12, true);
      }
    }
  });

  // the "No such file" choice under the tree
  const look = rowLook(NONE, view), nr = noneRect;
  fill(look.fill || (hover === NONE ? 'gainsboro' : 'whitesmoke')); stroke(look.border || 'gray'); strokeWeight(look.border ? 2 : 1);
  rect(nr.x, nr.y, nr.w, nr.h, 6);
  strokeWeight(1);
  txt('No such file', nr.x + nr.w / 2, nr.y + nr.h / 2 + 1, 'black', CENTER, CENTER, fs, false);
  if (look.mark !== null) drawMark(nr.x + nr.w - 14, nr.y + nr.h / 2, look.mark, 6);
}

// a small rounded label; returns the x of its right edge
function pill(label, x, cy, bg, fg) {
  textSize(12); textStyle(BOLD);
  const w = tw(label) + 12;
  textStyle(NORMAL);
  fill(bg); noStroke(); rect(x, cy - 9, w, 18, 9);
  txt(label, x + w / 2, cy + 1, fg, CENTER, CENTER, 12, true);
  return x + w;
}

// ---------------------------------------------------------------------------
// The text panel
// ---------------------------------------------------------------------------
function stepsText(res) { return 'Steps: ' + res.steps.join(', ') + '.'; }

function drawPanel(view, size) {
  const P = panelRect;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(P.x, P.y, P.w, P.h, 10);
  const x = P.x + 10, w = P.w - 20, bottom = P.y + P.h - 8;
  let y = P.y + 8;

  if (mode === 'free') {
    y = para('The working directory is ' + view.wd + '.', x, y, w, { size: size }) + 6;
    if (!view.res) { para('Type a path in the box below, for example ../notes.txt', x, y, w, { size: size, col: 'dimgray' }); return; }
    y = codeBox(view.path, x, y, w) + 8;
    const n = view.res.node;
    const result = !n ? 'No such file.' : (n.file ? 'This path reaches the file ' + fullPath(n) + '.' : 'That path is a folder, not a file.');
    y = para(result, x, y, w, { size: size, bold: true, col: !n ? 'firebrick' : (n.file ? 'darkgreen' : 'navy') }) + 6;
    paraFit(stepsText(view.res), x, y, w, bottom - y, { size: size, tag: 'free steps' });
    return;
  }

  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    txt('Correct: ' + correctCount + ' of ' + PROBLEMS.length, x, y, 'black', LEFT, TOP, 20, true);
    y += 30;
    y = para(ok ? 'Mastery reached (7 of 8 or better).' : 'Mastery is 7 of 8. Press Try again.', x, y, w, { size: size, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 10;
    // one mark per problem
    const step = Math.min(44, w / PROBLEMS.length);
    PROBLEMS.forEach((p, i) => {
      txt(String(i + 1), x + i * step + 6, y + 8, 'dimgray', CENTER, CENTER, 14, true);
      drawMark(x + i * step + 24, y + 8, picks[i] === p.correct, 5);
    });
    y += 28;
    paraFit('Free trial is now unlocked. Choose Free trial in the menu below to try your own working directory and path.', x, y, w, bottom - y, { size: size, tag: 'done text' });
    return;
  }

  // ask and feedback
  const p = view.problem, reveal = phase === 'feedback';
  if (!(narrow && reveal)) {
    y = para('The working directory is ' + p.wd + '.', x, y, w, { size: size }) + 4;
    if (p.script) y = para('The script ' + p.script + ' runs this code:', x, y, w, { size: size }) + 4;
  }
  y = codeBox(p.code || p.path, x, y, w) + 8;
  if (!reveal) {
    y = para(p.script ? 'Which file does that code reach?' : 'Which file does this path reach?', x, y, w, { size: size, bold: true }) + 4;
    paraFit(hint || 'Click a file in the tree, or No such file. Then press Check.', x, y, w, bottom - y, { size: size, col: hint ? 'firebrick' : 'dimgray', tag: 'prompt' });
    return;
  }
  const ok = picks[idx] === p.correct;
  const shown = p.code || p.path;
  const msg = ok
    ? 'Correct: ' + answerText(p.correct) + '. ' + p.why
    : 'Not quite. From ' + p.wd + ', ' + shown + ' reaches ' + (p.correct === NONE ? 'no file (No such file)' : p.correct) + '. ' + p.why;
  const steps = stepsText(view.res);
  // both blocks must fit: step both sizes down together if they do not
  let sz = size;
  const need = z => (para(msg, x, 0, w, { size: z, measure: true }) + 8 + para(steps, x, 0, w, { size: z, measure: true }));
  while (sz > 12 && need(sz) > bottom - y) sz--;
  if (need(sz) > bottom - y + 1) layoutIssues.push('feedback overflows by ' + Math.round(need(sz) - (bottom - y)) + 'px');
  y = para(msg, x, y, w, { size: sz, col: ok ? 'darkgreen' : 'firebrick' }) + 8;
  para(steps, x, y, w, { size: sz });
}

// a path or a line of code in a dark box, the way a terminal or an editor shows it. Returns the y below the box.
function codeBox(str, x, y, w) {
  const size = narrow ? 15 : 16, pad = 7;
  const bottom = para(str, x + pad, y + pad, w - 2 * pad, { size: size, measure: true });
  fill('darkslategray'); stroke('black'); strokeWeight(1);
  rect(x, y, w, bottom - y + pad, 6);
  para(str, x + pad, y + pad, w - 2 * pad, { size: size, col: 'white' });
  return bottom + pad;
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 10, ROW2 = 48;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 240);
  actionBtn.position(canvasWidth - (narrow ? 128 : 160), drawHeight + ROW1);
  actionBtn.size(narrow ? 118 : 150);
  const lab = narrow ? 72 : 76;
  answerSelect.position(lab, drawHeight + ROW2);
  answerSelect.size(Math.min(canvasWidth - lab - 12, 400));
  if (narrow) {
    wdSelect.position(10, drawHeight + ROW2); wdSelect.size(170);
    pathInput.position(188, drawHeight + ROW2); pathInput.size(canvasWidth - 188 - 16);
  } else {
    wdSelect.position(160, drawHeight + ROW2); wdSelect.size(230);
    pathInput.position(450, drawHeight + ROW2); pathInput.size(Math.min(canvasWidth - 450 - 16, 320));
  }
}

function drawControlLabels() {
  const y = drawHeight + ROW2 + 12;
  if (mode === 'problems') { if (phase !== 'done') txt('Answer:', 10, y, 'black'); }
  else if (!narrow) { txt('Working directory:', 10, y, 'black'); txt('Path:', 404, y, 'black'); }
}

function refreshControls() {
  const free = mode === 'free';
  [wdSelect, pathInput].forEach(c => (free ? c.show() : c.hide()));
  if (free) { actionBtn.hide(); answerSelect.hide(); }
  else {
    actionBtn.show();
    if (phase === 'done') answerSelect.hide(); else answerSelect.show();
    answerSelect.selected(phase === 'feedback' ? picks[idx] : (answer || ''));
    if (phase === 'ask') answerSelect.removeAttribute('disabled'); else answerSelect.attribute('disabled', '');
    const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
    if (phase === 'ask') { actionBtn.html('Check'); able(answer !== null); }
    else if (phase === 'feedback') { actionBtn.html(idx === PROBLEMS.length - 1 ? 'See score' : 'Next problem'); able(true); }
    else { actionBtn.html('Try again'); able(true); }
  }
  modeSelect.elt.options[1].disabled = !unlocked;
}

function onAction() {
  if (mode !== 'problems') return;
  hint = '';
  if (phase === 'ask') {
    if (answer === null) return;
    picks[idx] = answer;                           // one attempt per problem
    if (answer === PROBLEMS[idx].correct) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    answer = null;
    if (idx < PROBLEMS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; unlocked = true; }
  } else {
    idx = 0; correctCount = 0; picks = []; answer = null; phase = 'ask';
  }
  refreshControls();
}

function setMode(m) {
  if (m === 'free' && !unlocked) { modeSelect.selected('problems'); return; }
  mode = m;
  if (m === 'problems') { idx = 0; correctCount = 0; picks = []; answer = null; phase = 'ask'; }
  hint = '';
  refreshControls();
}

// what is under (x, y): a file's full path, NONE for the "No such file" row, 'folder' for a folder row, or null
function hitAt(x, y) {
  if (!treeRect) return null;
  const nr = noneRect;
  if (x >= nr.x && x <= nr.x + nr.w && y >= nr.y && y <= nr.y + nr.h) return NONE;
  const i = rowRects.findIndex(r => x >= r.x && x <= r.x + r.w && y >= r.y && y < r.y + r.h);
  if (i < 0) return null;
  return TREE_ROWS[i].node.file ? fullPath(TREE_ROWS[i].node) : 'folder';
}

function mousePressed() {
  if (mode !== 'problems' || phase !== 'ask') return;
  const h = hitAt(mouseX, mouseY);
  if (h === null) return;
  if (h === 'folder') { hint = 'That is a folder. Pick a file, or No such file.'; return; }
  answer = h; hint = '';
  refreshControls();
}

function updateCursor() {
  const live = mode === 'problems' && phase === 'ask';
  const h = live ? hitAt(mouseX, mouseY) : null;
  cursor(h && h !== 'folder' ? 'pointer' : 'default');
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
