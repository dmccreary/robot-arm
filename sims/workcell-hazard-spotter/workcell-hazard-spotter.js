// Workcell Hazard Spotter - p5.js MicroSim
// CANVAS_HEIGHT: 544
// Learning objective (Analyze, distinguish): distinguish pinch-point, collision and electrical hazards from
// acceptable items in a desk robot-arm scene, in eight items, with at least 7 of 8 correct on the first attempt.
// Evidence: the class committed for each highlighted item in the quiz. Clicking items in Explore mode to read
// their names is exploration, not evidence.
// The scene is a schematic, not a photograph. The desk is seen from above. A top view cannot show the gripper
// jaws or the elbow gap, so those two items are shown in a side view drawn by robot-arm-lib.js.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 460;
let controlHeight = 84;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const CLASSES = ['Pinch point', 'Collision', 'Electrical', 'Acceptable'];
const CLASS_PHRASE = ['a pinch point', 'a collision hazard', 'an electrical hazard', 'acceptable'];

// eight items, in fixed order. cls is the index into CLASSES.
const ITEMS = [
  { name: 'Gripper jaws closing on a block', short: 'Gripper jaws', cls: 0,
    why: 'Two jaws move toward each other and can trap a finger.' },
  { name: 'The gap between the forearm and the upper arm when the elbow folds', short: 'Elbow gap', cls: 0,
    why: 'Two links move toward each other, trapping anything between them.' },
  { name: 'A laptop sitting inside the taped circle', short: 'Laptop inside the circle', cls: 1,
    why: 'The arm can sweep into it, damaging the laptop and the arm.' },
  { name: 'A cup of water beside the power supply', short: 'Cup of water by the supply', cls: 2,
    why: 'Water near a supply and its connectors is an electrical hazard as well as a spill risk.' },
  { name: 'A power cable with cracked insulation held together with tape', short: 'Cracked, taped cable', cls: 2,
    why: 'Damaged insulation can expose live conductors and overheat.' },
  { name: 'A long loose sleeve hanging near the base joint', short: 'Loose sleeve near the base', cls: 0,
    why: 'Cloth can be drawn into a joint, trapping the arm or the person wearing it.' },
  { name: 'Tape on the table marking the work envelope', short: 'Tape marking the envelope', cls: 3,
    why: 'Marking the work envelope is good practice. The envelope must also be kept clear.' },
  { name: 'A hardware E-stop button on the table edge within easy reach', short: 'E-stop within reach', cls: 3,
    why: 'An E-stop that can be reached in one move is the intended arrangement.' }
];
const MASTERY = 7;

// controls
let modeSelect, nextBtn, classBtns = [];

// state
let mode = 'explore';              // 'explore' or 'quiz'
let phase = 'ask';                 // quiz: 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0;
let picks = [];                    // committed class for each item
let selected = -1;                 // explore: the item last clicked
let hoverIdx = -1;                 // explore: the item under the pointer
let hint = '';
let arm;                           // the side-view arm
let spots = [];                    // where each item's clickable ring is this frame: { x, y, r }
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  modeSelect = createSelect();
  modeSelect.option('Explore: read the names', 'explore');
  modeSelect.option('Quiz: classify 8 items', 'quiz');
  modeSelect.selected('explore');
  modeSelect.changed(() => setMode(modeSelect.value()));

  nextBtn = createButton('Next item');
  nextBtn.mouseClicked(onNext);
  CLASSES.forEach((c, i) => {
    const b = createButton(c);
    b.mouseClicked(() => onClass(i));
    classBtns.push(b);
  });

  // the side view: the SO-ARM101 schematic with its elbow folded and its jaw closing
  arm = RobotArm.presets.so101Schematic();
  RobotArm.setAngle(arm, 'shoulder', 105);
  RobotArm.setAngle(arm, 'elbow', -138);
  RobotArm.setAngle(arm, 'wrist', 30);
  arm.effector.opening = 14;

  layoutControls();
  refreshControls();
  describe('A schematic desk seen from above: a robot arm inside a taped circle, a laptop, a power supply with a ' +
    'cup of water beside it, a taped power cable, a loose sleeve and an emergency stop button. A side view shows ' +
    'the gripper jaws and the folded elbow. The learner classifies eight numbered items as pinch point, ' +
    'collision, electrical or acceptable.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Workcell Hazard Spotter', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  if (mode === 'quiz') {
    txt(phase === 'done' ? 'All 8 items done' : 'Item ' + (idx + 1) + ' of ' + ITEMS.length, 10, sy, 'black', LEFT, TOP, size, true);
    txt('Correct: ' + correctCount + ' of ' + ITEMS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  } else {
    txt('Explore the scene', 10, sy, 'black', LEFT, TOP, size, true);
  }
  const top = sy + size + 8;
  if (mode === 'quiz' && phase === 'done') { spots = []; drawResults(top); cursor('default'); return; }

  const panelH = narrow ? 112 : 96;
  const S = { x: 8, y: top, w: canvasWidth - 16, h: drawHeight - top - panelH - 12 };
  drawScene(S);
  hoverIdx = mode === 'explore' ? spotAt(mouseX, mouseY) : -1;
  drawPanel({ x: 8, y: S.y + S.h + 6, w: canvasWidth - 16, h: panelH }, size);
  cursor(hoverIdx >= 0 ? 'pointer' : 'default');
}

// ---------------------------------------------------------------------------
// The scene: the desk from above on the left, the arm from the side on the right
// ---------------------------------------------------------------------------
function drawScene(S) {
  const dw = Math.round(S.w * (narrow ? 0.60 : 0.62));
  const D = { x: S.x, y: S.y, w: dw, h: S.h };                       // desk, top view
  const V = { x: S.x + dw + 6, y: S.y, w: S.w - dw - 6, h: S.h };    // arm, side view
  spots = [];

  // ---- the desk ----
  fill('wheat'); stroke('saddlebrown'); strokeWeight(2);
  rect(D.x, D.y, D.w, D.h, 6);
  txt(narrow ? 'Desk from above' : 'Desk from above (schematic)', D.x + D.w - 8, D.y + 12, 'saddlebrown', RIGHT, CENTER, 13);
  const P = narrow
    ? { cx: 0.50, cy: 0.58, r: 0.40 * D.w, sup: [0.05, 0.10], cup: [0.46, 0.165], lap: [0.60, 0.51], estop: [0.84, 0.93], sleeve: 0.16 }
    : { cx: 0.54, cy: 0.54, r: 0.41 * D.h, sup: [0.03, 0.12], cup: [0.25, 0.20], lap: [0.62, 0.42], estop: [0.93, 0.85], sleeve: 0.34 };
  const cx = D.x + P.cx * D.w, cy = D.y + P.cy * D.h, r = P.r;

  // item 7: the taped circle that marks the work envelope
  noFill(); stroke('gold'); strokeWeight(6); circle(cx, cy, 2 * r);
  stroke('black'); strokeWeight(6); drawingContext.setLineDash([8, 10]); circle(cx, cy, 2 * r); drawingContext.setLineDash([]);
  strokeWeight(1);

  // the power supply, and item 5: its cable to the arm, with a taped crack part way along
  const sx = D.x + P.sup[0] * D.w, sy2 = D.y + P.sup[1] * D.h, sw = narrow ? 58 : 94, sh = narrow ? 30 : 38;
  const bx0 = sx + sw * 0.5, by0 = sy2 + sh;                          // the cable leaves the bottom of the supply
  const mx = bx0 + (cx - bx0) * 0.30, my = by0 + (cy - by0) * 0.55;   // the taped crack
  noFill(); stroke('black'); strokeWeight(4);
  beginShape(); vertex(bx0, by0); vertex(bx0, my); vertex(mx, my); vertex(cx - 10, cy); endShape();
  stroke('silver'); strokeWeight(9); line(mx - 12, my, mx + 4, my);
  stroke('dimgray'); strokeWeight(1.5); line(mx - 9, my - 4, mx - 5, my + 4); line(mx - 3, my - 4, mx + 1, my + 4);
  fill('dimgray'); stroke('black'); strokeWeight(2); rect(sx, sy2, sw, sh, 4);
  txt(narrow ? 'supply' : 'power supply', sx + sw / 2, sy2 + sh / 2 + 1, 'white', CENTER, CENTER, 12, true);

  // item 4: a cup of water beside the supply
  const ux = D.x + P.cup[0] * D.w, uy = D.y + P.cup[1] * D.h;
  noFill(); stroke('dimgray'); strokeWeight(4); arc(ux + 13, uy, 14, 12, -Math.PI / 2, Math.PI / 2);
  fill('white'); stroke('dimgray'); strokeWeight(2); circle(ux, uy, 28);
  fill('deepskyblue'); noStroke(); circle(ux, uy, 19);

  // item 3: a laptop inside the taped circle
  const lx = D.x + P.lap[0] * D.w, ly = D.y + P.lap[1] * D.h, lw = narrow ? 44 : 64, lh = narrow ? 36 : 48;
  fill('lightslategray'); stroke('black'); strokeWeight(1.5); rect(lx, ly, lw, lh, 3);
  fill('gainsboro'); rect(lx + 4, ly + lh * 0.52, lw - 8, lh * 0.38, 2);
  fill('lightcyan'); rect(lx + 4, ly + 4, lw - 8, lh * 0.40, 2);

  // the arm from above, in the library's colors: base, one line of links, and the gripper
  const pal = RobotArm.PALETTE.follower, a = -2.45, len = r * 0.78;
  const ex = cx + len * Math.cos(a), ey = cy + len * Math.sin(a);
  stroke(pal.linkEdge); strokeWeight(14); line(cx, cy, ex, ey);
  stroke(pal.link); strokeWeight(10); line(cx, cy, ex, ey);
  stroke(pal.tool); strokeWeight(5);
  line(ex, ey, ex + 14 * Math.cos(a - 0.35), ey + 14 * Math.sin(a - 0.35));
  line(ex, ey, ex + 14 * Math.cos(a + 0.35), ey + 14 * Math.sin(a + 0.35));
  fill(pal.base); stroke(pal.baseEdge); strokeWeight(2); rect(cx - 15, cy - 15, 30, 30, 5);
  fill(pal.joint); stroke(pal.jointEdge); circle(cx, cy, 16);
  circle(cx + len * 0.5 * Math.cos(a), cy + len * 0.5 * Math.sin(a), 12);

  // item 6: a person's arm in a long loose sleeve, reaching in beside the base joint
  const vx = D.x + P.sleeve * D.w, vy = D.y + D.h - 3;
  fill('plum'); stroke('purple'); strokeWeight(2);
  beginShape();
  vertex(vx - 20, vy); vertex(vx + 16, vy); vertex(cx - 12, cy + 34); vertex(cx - 2, cy + 18);
  vertex(cx - 22, cy + 12); vertex(cx - 40, cy + 26);
  endShape(CLOSE);
  fill('peachpuff'); stroke('peru'); circle(cx - 24, cy + 14, 13);                   // the hand

  // item 8: the E-stop on the table edge
  const qx = D.x + P.estop[0] * D.w, qy = D.y + P.estop[1] * D.h;
  fill('gold'); stroke('black'); strokeWeight(2); rect(qx - 15, qy - 15, 30, 30, 4);
  fill('red'); stroke('darkred'); circle(qx, qy, 21);

  // ---- the side view ----
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(V.x, V.y, V.w, V.h, 6);
  txt(narrow ? 'Arm from the side' : 'Arm from the side (schematic)', V.x + V.w / 2, V.y + 12, 'dimgray', CENTER, CENTER, 13);
  const view = RobotArm.fitView({ x: V.x + 6, y: V.y + 24, w: V.w - 12, h: V.h - 30 }, arm, { pad: 14, mode: 'pose' });
  RobotArm.draw(arm, view, {});
  const pose = RobotArm.pose(arm);
  // the block between the jaws
  const ga = (pose.tip.heading + arm.effector.opening / 2) * Math.PI / 180, gl = arm.effector.length * 0.62;
  const g = RobotArm.toScreen(view, { x: pose.tip.x + gl * Math.cos(ga), y: pose.tip.y + gl * Math.sin(ga) });
  const gx = g.x, gy = g.y;
  fill('tomato'); stroke('darkred'); strokeWeight(1.5); rectMode(CENTER); rect(gx, gy, 11, 11, 2); rectMode(CORNER);
  // the elbow gap is between the middles of the two links
  const m1 = RobotArm.toScreen(view, { x: (pose.links[0].a.x + pose.links[0].b.x) / 2, y: (pose.links[0].a.y + pose.links[0].b.y) / 2 });
  const m2 = RobotArm.toScreen(view, { x: (pose.links[1].a.x + pose.links[1].b.x) / 2, y: (pose.links[1].a.y + pose.links[1].b.y) / 2 });

  // ---- the eight clickable rings, in item order ----
  const ringAngle = narrow ? -0.6 : -0.75;                                           // a clear spot on the tape
  spots = [
    { x: gx, y: gy, r: 17 },
    { x: (m1.x + m2.x) / 2, y: (m1.y + m2.y) / 2, r: 17 },
    { x: lx + lw / 2, y: ly + lh / 2, r: Math.max(lw, lh) / 2 + 5 },
    { x: ux + 2, y: uy, r: 20 },
    { x: mx - 4, y: my, r: 15 },
    { x: (vx + cx - 20) / 2, y: (vy + cy + 22) / 2, r: 18 },
    { x: cx + r * Math.cos(ringAngle), y: cy + r * Math.sin(ringAngle), r: 15 },
    { x: qx, y: qy, r: 21 }
  ];
  spots.forEach((sp, i) => drawSpot(sp, i));
}

// the ring and number badge of one item. The item being asked about (quiz) or selected (explore) is emphasised.
function drawSpot(sp, i) {
  const active = mode === 'quiz' ? i === idx : i === selected;
  noFill();
  if (active) { stroke('white'); strokeWeight(7); circle(sp.x, sp.y, 2 * sp.r); stroke('crimson'); strokeWeight(4); }
  else { stroke('navy'); strokeWeight(1.5); drawingContext.setLineDash([4, 4]); }
  circle(sp.x, sp.y, 2 * sp.r);
  drawingContext.setLineDash([]);
  const bx = sp.x + sp.r * 0.75, by = sp.y - sp.r * 0.75;
  fill(active ? 'crimson' : 'navy'); stroke('white'); strokeWeight(1.5); circle(bx, by, 19);
  txt(String(i + 1), bx, by + 1, 'white', CENTER, CENTER, 13, true);
  if (mode === 'quiz' && picks[i] !== undefined) {                    // answered: a tick or a cross under the ring
    fill('white'); noStroke(); circle(sp.x - sp.r * 0.75, by, 17);
    drawMark(sp.x - sp.r * 0.75, by, picks[i] === ITEMS[i].cls, 4);
  }
}

// ---------------------------------------------------------------------------
// The text panel
// ---------------------------------------------------------------------------
function drawPanel(P, size) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(P.x, P.y, P.w, P.h, 10);
  const x = P.x + 10, w = P.w - 20, maxH = P.h - 14;
  let y = P.y + 7;
  if (mode === 'explore') {
    const shown = hoverIdx >= 0 ? hoverIdx : selected;      // hovering or clicking both show the name
    if (shown < 0) {
      y = para('Click an item to read its name.', x, y, w, { size: size, bold: true }) + 4;
      paraFit(hint || 'The eight items are numbered. When you have read them all, choose Quiz in the menu below.', x, y, w, maxH - (y - P.y - 7), { size: size, col: 'dimgray', tag: 'explore prompt' });
    } else {
      y = para('Item ' + (shown + 1) + ' of 8', x, y, w, { size: size, col: 'dimgray' }) + 2;
      paraFit(ITEMS[shown].name + '.', x, y, w, maxH - (y - P.y - 7), { size: size + 1, bold: true, tag: 'item name' });
    }
    return;
  }
  const it = ITEMS[idx];
  if (phase === 'ask') {
    const q = 'Is it a pinch point, a collision hazard, an electrical hazard, or acceptable?';
    const qh = para(q, x, 0, w, { size: size, measure: true });
    y = paraFit(it.name + '.', x, y, w, maxH - qh - 4, { size: size + 1, bold: true, tag: 'item name' }) + 4;
    para(q, x, y, w, { size: size });
    if (y + qh > P.y + P.h - 4) layoutIssues.push('question overflows by ' + Math.round(y + qh - (P.y + P.h - 4)) + 'px');
    return;
  }
  const ok = picks[idx] === it.cls;
  const msg = ok ? 'Correct: ' + CLASSES[it.cls] + '. ' + it.why : 'Not quite. This is ' + CLASS_PHRASE[it.cls] + '. ' + it.why;
  const nameH = para(it.short + ':', x, 0, w, { size: size, bold: true, measure: true });
  para(it.short + ':', x, y, w, { size: size, bold: true });
  paraFit(msg, x, y + nameH + 2, w, maxH - nameH - 2, { size: size, col: ok ? 'darkgreen' : 'firebrick', tag: 'feedback' });
}

// ---------------------------------------------------------------------------
// The final screen: the score and the eight items with their classes
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, drawHeight - top - 8, 10);
  let y = top + 10;
  txt('Correct: ' + correctCount + ' of ' + ITEMS.length, x + 12, y, 'black', LEFT, TOP, 20, true);
  y += 30;
  y = para(ok ? 'Mastery reached (7 of 8 or better).' : 'Mastery is 7 of 8. Press Try again.', x + 12, y, w - 24,
    { size: 16, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 8;
  const fs = narrow ? 14 : 16, cClass = x + w - 10;
  txt('Item', x + 40, y + 10, 'dimgray', LEFT, CENTER, fs, true);
  txt('Class', cClass, y + 10, 'dimgray', RIGHT, CENTER, fs, true);
  y += 26;
  const rowH = Math.min(34, (drawHeight - 16 - y) / ITEMS.length);
  ITEMS.forEach((it, i) => {
    const cy = y + rowH / 2;
    if (i % 2 === 0) { fill('whitesmoke'); noStroke(); rect(x + 6, y, w - 12, rowH, 4); }
    drawMark(x + 22, cy, picks[i] === it.cls, 6);
    textSize(fs); textStyle(BOLD);
    const cw = tw(CLASSES[it.cls]); textStyle(NORMAL);
    lineFit((i + 1) + '. ' + (narrow ? it.short : it.name), x + 40, cy + 1, cClass - cw - 12 - (x + 40), { size: fs });
    txt(CLASSES[it.cls], cClass, cy + 1, 'black', RIGHT, CENTER, fs, true);
    y += rowH;
  });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
const ROW1 = 10, ROW2 = 48;

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 200 : 240);
  nextBtn.position(canvasWidth - (narrow ? 128 : 160), drawHeight + ROW1);
  nextBtn.size(narrow ? 118 : 150);
  const gap = narrow ? 5 : 10, bw = Math.min(160, (canvasWidth - 20 - 3 * gap) / 4);
  classBtns.forEach((b, i) => { b.position(10 + i * (bw + gap), drawHeight + ROW2); b.size(bw, 26); });
}

function refreshControls() {
  const quiz = mode === 'quiz';
  const able = (c, on) => { if (on) c.removeAttribute('disabled'); else c.attribute('disabled', ''); };
  classBtns.forEach(b => { if (quiz && phase !== 'done') b.show(); else b.hide(); able(b, phase === 'ask'); });
  if (quiz) nextBtn.show(); else nextBtn.hide();
  nextBtn.html(phase === 'done' ? 'Try again' : (idx === ITEMS.length - 1 ? 'See score' : 'Next item'));
  able(nextBtn, phase !== 'ask');
}

function setMode(m) {
  mode = m;
  idx = 0; correctCount = 0; picks = []; phase = 'ask'; selected = -1; hint = '';
  refreshControls();
}

function onClass(i) {
  if (mode !== 'quiz' || phase !== 'ask') return;
  picks[idx] = i;                                         // an item is answered once
  if (i === ITEMS[idx].cls) correctCount++;
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') { if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; } }
  else if (phase === 'done') { idx = 0; correctCount = 0; picks = []; phase = 'ask'; }
  refreshControls();
}

// the item whose ring contains (x, y), or -1. Smaller rings win, so an item inside a larger one stays clickable.
function spotAt(x, y) {
  let best = -1;
  spots.forEach((sp, i) => {
    if (Math.hypot(x - sp.x, y - sp.y) <= sp.r + 4 && (best < 0 || sp.r < spots[best].r)) best = i;
  });
  return best;
}

function mousePressed() {
  if (mode !== 'explore' || mouseY > drawHeight) return;
  const i = spotAt(mouseX, mouseY);
  if (i >= 0) { selected = i; hint = ''; }
  else if (spots.length && mouseY > 60) { hint = 'That is empty space. Click inside one of the numbered rings.'; selected = -1; }
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
