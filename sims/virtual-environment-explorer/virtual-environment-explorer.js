// Virtual Environment Explorer - p5.js MicroSim
// CANVAS_HEIGHT: 600
// Learning objective (Understand, infer): infer what an import or a pip command does in each of eight terminal
// situations, given which environment is active and which packages each environment contains, with at least
// 7 of 8 correct on the first attempt. Evidence: the choice committed before the output is shown. Running
// commands in Explore mode afterwards is exploration, not evidence.
// Model: a tiny pretend shell. Only the active environment's packages can be imported. pip install adds a
// package to the active environment, and is refused when no environment is active (PEP 668 behaviour).
// The package versions are illustrative, and "activate arm-lab" is shorthand for running
// "source .venv/bin/activate" inside that project's folder.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 450;
let controlHeight = 150;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

// what pip installs (illustrative versions) and the name each package is imported by
const VERSIONS = { numpy: '2.1', pyserial: '3.5', matplotlib: '3.9' };
const IMPORT_NAME = { numpy: 'numpy', pyserial: 'serial', matplotlib: 'matplotlib' };
const ENV_NAMES = ['arm-lab', 'old-project'];

// what each environment holds at the start of every scenario (system Python has only the standard library)
function startingEnvs() {
  return {
    'arm-lab': [{ name: 'numpy', ver: '2.1', isNew: false }, { name: 'pyserial', ver: '3.5', isNew: false }],
    'old-project': [{ name: 'numpy', ver: '1.26', isNew: false }]
  };
}

// commands the pretend shell understands
const C = {
  activate: env => ({ op: 'activate', env: env }),
  deactivate: () => ({ op: 'deactivate' }),
  install: pkg => ({ op: 'install', pkg: pkg }),
  imp: pkg => ({ op: 'import', pkg: pkg, version: false }),
  impVersion: pkg => ({ op: 'import', pkg: pkg, version: true }),
  list: () => ({ op: 'list' })
};

function commandText(c) {
  if (c.op === 'activate') return 'activate ' + c.env;
  if (c.op === 'deactivate') return 'deactivate';
  if (c.op === 'install') return 'pip install ' + c.pkg;
  if (c.op === 'list') return 'pip list';
  const m = IMPORT_NAME[c.pkg];
  return c.version ? 'python -c "import ' + m + '; print(' + m + '.__version__)"' : 'python -c "import ' + m + '"';
}

const CH_SERIAL = ['It imports pyserial 3.5.', 'ModuleNotFoundError: No module named \'serial\'', 'error: externally-managed-environment'];
const CH_NUMPY = ['It prints 1.26', 'It prints 2.1', 'ModuleNotFoundError: No module named \'numpy\''];
const CH_MPL = ['It imports matplotlib.', 'ModuleNotFoundError: No module named \'matplotlib\'', 'error: externally-managed-environment'];
const CH_PIP = ['It installs matplotlib for every project.', 'It installs matplotlib into arm-lab.', 'pip stops with error: externally-managed-environment'];

// the eight scenarios, in fixed order. active is the environment at the start (null = system Python);
// pre are commands that run before the question; cmd is the command the learner predicts.
const SCENARIOS = [
  { active: 'arm-lab', pre: [], cmd: C.imp('pyserial'), choices: CH_SERIAL, correct: 0,
    why: 'pyserial is installed in arm-lab, and arm-lab is the active environment.' },
  { active: null, pre: [], cmd: C.imp('pyserial'), choices: CH_SERIAL, correct: 1,
    why: 'System Python has no pyserial. The copy inside arm-lab cannot be seen from outside it.' },
  { active: 'old-project', pre: [], cmd: C.imp('pyserial'), choices: CH_SERIAL, correct: 1,
    why: 'pyserial was installed only in arm-lab. Each environment has its own libraries.' },
  { active: 'arm-lab', pre: [], cmd: C.impVersion('numpy'), choices: CH_NUMPY, correct: 1,
    why: 'arm-lab holds numpy 2.1.' },
  { active: 'old-project', pre: [], cmd: C.impVersion('numpy'), choices: CH_NUMPY, correct: 0,
    why: 'old-project keeps its own numpy 1.26. The newer copy in arm-lab does not affect it.' },
  { active: null, pre: [], cmd: C.impVersion('numpy'), choices: CH_NUMPY, correct: 2,
    why: 'System Python has only the standard library, so there is no numpy to import.' },
  { active: 'arm-lab', pre: [C.install('matplotlib'), C.activate('old-project')], cmd: C.imp('matplotlib'), choices: CH_MPL, correct: 1,
    why: 'pip install put matplotlib only into arm-lab, the environment that was active at the time.' },
  { active: null, pre: [], cmd: C.install('matplotlib'), choices: CH_PIP, correct: 2,
    why: 'System Python is managed by the operating system, so pip refuses. Activate an environment first.' }
];
const MASTERY = 7;
const LETTERS = ['a', 'b', 'c'];

// the commands offered in Explore mode
const EXPLORE_COMMANDS = [
  C.activate('arm-lab'), C.activate('old-project'), C.deactivate(),
  C.install('numpy'), C.install('pyserial'), C.install('matplotlib'),
  C.imp('numpy'), C.imp('pyserial'), C.imp('matplotlib'), C.list()
];

// controls
let modeSelect, nextBtn, choiceBtns = [], cmdSelect, runBtn, resetBtn;

// the pretend computer
let envs = startingEnvs();
let active = null;                 // 'arm-lab', 'old-project' or null (system Python)
let term = [];                     // terminal lines: { kind: 'cmd' | 'out' | 'err' | 'note', env, text }

// quiz state
let mode = 'predict';              // 'predict' or 'explore'
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0, picked = -1, correctCount = 0;
let unlocked = false;              // Explore unlocks after scenario 8
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Predict (8 scenarios)', 'predict');
  modeSelect.option('Explore (after scenario 8)', 'explore');
  modeSelect.selected('predict');
  modeSelect.changed(() => setMode(modeSelect.value()));

  nextBtn = createButton('Next scenario');
  nextBtn.mouseClicked(onNext);
  for (let i = 0; i < 3; i++) {
    const b = createButton(LETTERS[i]);
    b.mouseClicked(() => onChoice(i));
    b.style('text-align', 'left');
    choiceBtns.push(b);
  }

  cmdSelect = createSelect();
  EXPLORE_COMMANDS.forEach((c, i) => cmdSelect.option(commandText(c), String(i)));
  runBtn = createButton('Run');
  runBtn.mouseClicked(onRun);
  resetBtn = createButton('Reset');
  resetBtn.mouseClicked(resetExplore);

  layoutControls();
  loadScenario();
  refreshControls();
  describe('Three boxes show the packages installed in system Python, in the arm-lab environment and in the ' +
    'old-project environment. A pretend terminal shows a command. The learner predicts what the command does, ' +
    'then sees the output and the reason. After eight scenarios the learner can run commands freely.');
}

// ---------------------------------------------------------------------------
// The pretend shell
// ---------------------------------------------------------------------------
function resetWorld() { envs = startingEnvs(); active = null; term = []; }

// runs one command: adds the command line and its output to the terminal and changes envs / active
function execute(c) {
  term.push({ kind: 'cmd', env: active, text: commandText(c) });
  runCommand(c).forEach(o => term.push(o));
}

// returns the output lines of a command and applies its effect
function runCommand(c) {
  const out = [];
  const here = active ? envs[active] : [];        // system Python holds no extra packages
  if (c.op === 'activate') {
    active = c.env;
  } else if (c.op === 'deactivate') {
    if (active) active = null;
    else out.push({ kind: 'note', text: '(no environment was active, so nothing changed)' });
  } else if (c.op === 'install') {
    if (!active) {
      out.push({ kind: 'err', text: 'error: externally-managed-environment' });
    } else if (here.some(p => p.name === c.pkg)) {
      out.push({ kind: 'out', text: 'Requirement already satisfied: ' + c.pkg });
    } else {
      here.push({ name: c.pkg, ver: VERSIONS[c.pkg], isNew: true });
      out.push({ kind: 'out', text: 'Successfully installed ' + c.pkg + '-' + VERSIONS[c.pkg] });
    }
  } else if (c.op === 'import') {
    const p = here.find(q => q.name === c.pkg);
    if (!p) out.push({ kind: 'err', text: 'ModuleNotFoundError: No module named \'' + IMPORT_NAME[c.pkg] + '\'' });
    else if (c.version) out.push({ kind: 'out', text: p.ver });
    else out.push({ kind: 'note', text: '(no output: ' + p.name + ' ' + p.ver + ' was imported)' });
  } else if (c.op === 'list') {
    if (here.length === 0) out.push({ kind: 'note', text: '(no added packages: only the standard library)' });
    here.forEach(p => out.push({ kind: 'out', text: p.name + ' ' + p.ver }));
  }
  return out;
}

function loadScenario() {
  const s = SCENARIOS[Math.min(idx, SCENARIOS.length - 1)];
  resetWorld();
  active = s.active;
  s.pre.forEach(execute);
  term.push({ kind: 'cmd', env: active, text: commandText(s.cmd) });
  term.push({ kind: 'note', text: '(the output is hidden until you choose)', hidden: true });
  s.choices.forEach((t, i) => choiceBtns[i].html(LETTERS[i] + ') ' + t));
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Virtual Environment Explorer', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  const boxTop = narrow ? 38 : 44, boxH = 110;
  drawEnvBoxes(boxTop, boxH);
  txt('Package versions are illustrative.', canvasWidth / 2, boxTop + boxH + 3, 'dimgray', CENTER, TOP, 13);

  // status line
  const sy = boxTop + boxH + 24, size = narrow ? 15 : 16;
  if (mode === 'predict') {
    txt(phase === 'done' ? 'All 8 scenarios done' : 'Scenario ' + (idx + 1) + ' of ' + SCENARIOS.length, 10, sy, 'black', LEFT, TOP, size, true);
    txt('Correct: ' + correctCount + ' of ' + SCENARIOS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  } else {
    txt('Explore: run your own commands', 10, sy, 'black', LEFT, TOP, size, true);
  }

  const termTop = sy + size + 8, termH = narrow ? 158 : 150;
  drawTerminal(8, termTop, canvasWidth - 16, termH);
  drawMessage(10, termTop + termH + 8, canvasWidth - 20, drawHeight - (termTop + termH + 8) - 6, size);
}

function drawEnvBoxes(top, h) {
  const x0 = 8, gap = narrow ? 6 : 12;
  const w = (canvasWidth - 2 * x0 - 2 * gap) / 3;
  const places = [
    { key: null, title: 'System Python' },
    { key: 'arm-lab', title: 'arm-lab' },
    { key: 'old-project', title: 'old-project' }
  ];
  const tSize = narrow ? 14 : 16, pSize = narrow ? 14 : 16;
  places.forEach((p, i) => {
    const x = x0 + i * (w + gap), on = active === p.key;
    fill(on ? 'lemonchiffon' : 'white'); stroke(on ? 'darkorange' : 'gray'); strokeWeight(on ? 3 : 1);
    rect(x, top, w, h, 8);
    strokeWeight(1);
    txt(p.title, x + w / 2, top + 7, 'black', CENTER, TOP, tSize, true);
    // a tag in words, so the active place does not depend on color alone
    const tag = on ? (p.key ? 'ACTIVE' : 'IN USE') : (p.key ? 'not active' : 'not in use');
    if (on) {
      textSize(13); textStyle(BOLD);
      const tagW = tw(tag) + 14;
      fill('darkorange'); noStroke(); rect(x + w / 2 - tagW / 2, top + 26, tagW, 18, 9);
      txt(tag, x + w / 2, top + 36, 'black', CENTER, CENTER, 13, true);
    } else {
      txt(tag, x + w / 2, top + 36, 'dimgray', CENTER, CENTER, 13);
    }
    const listTop = top + 50, listH = h - 54;
    if (!p.key) {
      paraFit(narrow ? 'standard library only, managed by the OS' : 'standard library only, managed by the operating system',
        x + 6, listTop, w - 12, listH, { size: pSize - 1, center: true, tag: 'system box' });
    } else {
      envs[p.key].forEach((pk, k) => {
        const label = pk.name + ' ' + pk.ver + (pk.isNew && !narrow ? ' (new)' : '');
        txt(label, x + w / 2, listTop + k * 18, pk.isNew ? 'darkgreen' : 'black', CENTER, TOP, pSize, pk.isNew);
      });
    }
  });
}

function drawTerminal(x, y, w, h) {
  fill('darkslategray'); stroke('black'); strokeWeight(1);
  rect(x, y, w, h, 6);
  const size = narrow ? 14 : 16, pad = 8, lh = Math.round(size * 1.3);
  const inner = w - 2 * pad;
  let lines = term;
  if (mode === 'explore' && term.length === 0) {
    lines = [{ kind: 'note', text: 'Pick a command below and press Run.' }];
  }
  const str = t => (t.kind === 'cmd' ? promptText(t.env) + ' ' + t.text : t.text);
  const counts = lines.map(t => wrapLines(str(t), inner, size, false).length);
  let total = counts.reduce((a, b) => a + b, 0), start = 0;
  while (total * lh > h - 2 * pad && start < lines.length - 1) { total -= counts[start]; start++; }   // old lines scroll away
  if (mode === 'predict' && (start > 0 || total * lh > h - 2 * pad)) layoutIssues.push('terminal lines do not fit');
  const COL = { cmd: 'white', out: 'khaki', err: 'lightsalmon', note: 'silver' };
  let yy = y + pad;
  for (let i = start; i < lines.length; i++) {
    const t = lines[i];
    if (t.kind === 'cmd') yy = para(t.text, x + pad, yy, inner, { size: size, col: COL.cmd, lead: promptText(t.env), leadCol: 'palegreen' });
    else yy = para(t.text, x + pad, yy, inner, { size: size, col: COL[t.kind] });
  }
}

function promptText(env) { return env ? '(' + env + ') $' : '$'; }

function activeLabel() { return active ? active : 'none (system Python)'; }

// the question, the feedback, the final score or the Explore goal, under the terminal
function drawMessage(x, y, w, maxH, size) {
  if (mode === 'explore') {
    paraFit('Active environment: ' + activeLabel() + '. Try to make a ModuleNotFoundError appear, then make it disappear. ' +
      'Changes stay until you press Reset.', x, y, w, maxH, { size: size, tag: 'explore text' });
    return;
  }
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    let yy = para(ok ? 'Mastery reached (7 of 8 or better).' : 'Mastery is 7 of 8. Press Try again.', x, y, w,
      { size: size + 1, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 4;
    paraFit('Explore is now unlocked. Choose Explore in the menu below to run your own commands.', x, yy, w, maxH - (yy - y), { size: size, tag: 'done text' });
    return;
  }
  const s = SCENARIOS[idx];
  if (phase === 'ask') {
    const q = s.pre.length ? 'What happens when the last command runs?' : 'What happens when this command runs?';
    let yy = para('Active environment: ' + activeLabel() + '.', x, y, w, { size: size }) + 2;
    paraFit(q + ' Choose a, b or c.', x, yy, w, maxH - (yy - y), { size: size, bold: true, tag: 'question' });
    return;
  }
  const ok = picked === s.correct;
  const msg = ok ? 'Correct: ' + s.why : 'Not quite. The answer is (' + LETTERS[s.correct] + '): ' + s.why;
  paraFit(msg, x, y, w, maxH, { size: size, col: ok ? 'darkgreen' : 'firebrick', tag: 'feedback' });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 8, ROW2 = 44, ROW_STEP = 34;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 260);
  nextBtn.position(canvasWidth - (narrow ? 128 : 160), drawHeight + ROW1);
  nextBtn.size(narrow ? 118 : 150);
  choiceBtns.forEach((b, i) => {
    b.position(10, drawHeight + ROW2 + i * ROW_STEP);
    b.size(canvasWidth - 20, 28);
    b.style('font-size', narrow ? '13px' : '15px');
  });
  cmdSelect.position(10, drawHeight + ROW2);
  cmdSelect.size(Math.min(canvasWidth - 20, 420));
  runBtn.position(10, drawHeight + ROW2 + ROW_STEP);
  runBtn.size(100);
  resetBtn.position(120, drawHeight + ROW2 + ROW_STEP);
  resetBtn.size(100);
}

function refreshControls() {
  const ex = mode === 'explore';
  [cmdSelect, runBtn, resetBtn].forEach(c => (ex ? c.show() : c.hide()));
  choiceBtns.forEach(b => (ex || phase === 'done' ? b.hide() : b.show()));
  if (ex) nextBtn.hide(); else nextBtn.show();
  modeSelect.elt.options[1].disabled = !unlocked;
  if (ex) return;
  const s = SCENARIOS[Math.min(idx, SCENARIOS.length - 1)];
  choiceBtns.forEach((b, i) => {
    if (phase === 'ask') { b.removeAttribute('disabled'); b.style('background-color', ''); b.style('color', ''); }
    else {
      b.attribute('disabled', '');
      // after the commitment, the correct choice is tinted green and a wrong pick is tinted red
      const tint = i === s.correct ? 'palegreen' : (i === picked ? 'mistyrose' : '');
      b.style('background-color', tint); b.style('color', tint ? 'black' : '');
    }
  });
  if (phase === 'ask') nextBtn.attribute('disabled', ''); else nextBtn.removeAttribute('disabled');
  nextBtn.html(phase === 'done' ? 'Try again' : (idx === SCENARIOS.length - 1 ? 'See score' : 'Next scenario'));
}

function onChoice(i) {
  if (mode !== 'predict' || phase !== 'ask') return;
  picked = i;                                   // one attempt per scenario
  const s = SCENARIOS[idx];
  if (i === s.correct) correctCount++;
  term = term.filter(t => !t.hidden);
  runCommand(s.cmd).forEach(o => term.push(o)); // only now does the command run
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'predict') return;
  if (phase === 'feedback') {
    picked = -1;
    if (idx < SCENARIOS.length - 1) { idx++; phase = 'ask'; loadScenario(); }
    else { phase = 'done'; unlocked = true; resetWorld(); term.push({ kind: 'note', text: 'All eight scenarios are done.' }); }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; picked = -1; phase = 'ask'; loadScenario();
  }
  refreshControls();
}

function setMode(m) {
  if (m === 'explore' && !unlocked) { modeSelect.selected('predict'); return; }
  mode = m;
  if (m === 'explore') { resetWorld(); }
  else { idx = 0; correctCount = 0; picked = -1; phase = 'ask'; loadScenario(); }
  refreshControls();
}

function onRun() {
  if (mode !== 'explore') return;
  execute(EXPLORE_COMMANDS[parseInt(cmdSelect.value(), 10)]);
}

function resetExplore() {
  if (mode !== 'explore') return;
  resetWorld();
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
