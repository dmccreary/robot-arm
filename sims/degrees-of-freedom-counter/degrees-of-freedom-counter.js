// Degrees of Freedom Counter - p5.js MicroSim
// CANVAS_HEIGHT: 542
// Learning objective (Apply, calculate): calculate the degrees of freedom of eight mechanisms by counting their
// independent single-axis joints, with at least 7 of 8 correct on the first attempt. Evidence: the whole number
// committed with Check for each mechanism. Reading the joint lists is exploration, not evidence.
// Counting rule: DOF = the number of independent single-axis joints (revolute or prismatic) the mechanism includes.
// The arms are drawn by robot-arm-lib.js as side-view schematics. A side view cannot show a pan or a roll joint,
// so every mechanism also lists its joints in words, and the list is what the learner counts.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 490;
let controlHeight = 52;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const RULE = 'Counting rule: DOF = the number of independent single-axis joints (revolute or prismatic) the mechanism includes.';
const QUESTION = 'How many degrees of freedom does this mechanism have?';
const SIDE_VIEW_NOTE = 'Schematic side view. It cannot show every joint, so count from the joint list.';

// eight mechanisms, in fixed order. picture names the drawing; dof is the number of joints listed.
const MECHANISMS = [
  { name: 'A door on one hinge', short: 'Door on one hinge', picture: 'door', joints: '1 revolute (the hinge)', dof: 1,
    why: 'One joint, one independent motion: the door swings.' },
  { name: 'A drawer on one slide', short: 'Drawer on one slide', picture: 'drawer', joints: '1 prismatic (the slide)', dof: 1,
    why: 'A prismatic joint counts like a revolute one: one joint, one DOF.' },
  { name: 'A flat two-link arm', short: 'Flat two-link arm', picture: 'twoLink', joints: '2 revolute (shoulder, elbow)', dof: 2,
    why: 'Two independent joints give two DOF.' },
  { name: 'A 3D-printer-style gantry', short: '3D-printer-style gantry', picture: 'gantry', joints: '3 prismatic (X, Y, Z slides)', dof: 3,
    why: 'Three independent slides give three DOF.' },
  { name: 'The SO-ARM101 follower, arm joints only', short: 'SO-ARM101, arm joints only', picture: 'so101Arm',
    joints: '5 revolute (shoulder pan, shoulder lift, elbow flex, wrist flex, wrist roll)', dof: 5,
    why: 'Five independent revolute joints. The gripper is not included in this mechanism.' },
  { name: 'The SO-ARM101 follower, with its gripper', short: 'SO-ARM101, with gripper', picture: 'so101Full',
    joints: '5 revolute arm joints + 1 gripper jaw joint (revolute)', dof: 6,
    why: 'The gripper\'s moving-jaw joint is a sixth independent joint. This is how LeRobot reaches "6 DOF".' },
  { name: 'The reBot-DevArm B601, arm joints only', short: 'reBot-DevArm B601, arm only', picture: 'rebotArm', joints: '6 revolute', dof: 6,
    why: 'Six independent revolute joints.' },
  { name: 'The reBot-DevArm B601, with its parallel gripper', short: 'reBot-DevArm B601, with gripper', picture: 'rebotFull',
    joints: '6 revolute arm joints + 1 gripper finger joint (prismatic)', dof: 7,
    why: 'The gripper adds a seventh joint. The project calls this "6+1".' }
];
const MASTERY = 7, DOF_MIN = 1, DOF_MAX = 8;

// controls
let dofSelect, actionBtn;

// state
let phase = 'ask';                 // 'ask', 'feedback' or 'done'
let idx = 0, correctCount = 0;
let picks = [];                    // committed answers
let arms = {};                     // the arm drawings, made once in setup
let layoutIssues = [];             // text that did not fit its box this frame (empty when the layout is healthy)

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  dofSelect = createSelect();
  dofSelect.option('Choose', '');
  for (let n = DOF_MIN; n <= DOF_MAX; n++) dofSelect.option(String(n), String(n));
  dofSelect.selected('');                               // no answer is selected at the start
  dofSelect.changed(refreshControls);

  actionBtn = createButton('Check');
  actionBtn.mouseClicked(onAction);

  // the arm pictures. "Arm joints only" mechanisms are drawn without a gripper.
  const P = RobotArm.presets;
  arms.twoLink = P.twoLink(10, 15, { shoulder: 45, elbow: -30 });
  arms.so101Full = P.so101Schematic();
  arms.so101Arm = P.so101Schematic(); arms.so101Arm.effector.type = 'none';
  arms.rebotFull = P.rebotSchematic();
  arms.rebotArm = P.rebotSchematic(); arms.rebotArm.effector.type = 'none';

  layoutControls();
  refreshControls();
  describe('A picture of a mechanism, such as a door on a hinge, a drawer, a gantry or a robot arm, beside a list ' +
    'of its joints and the counting rule. The learner chooses its number of degrees of freedom from 1 to 8 and ' +
    'gets feedback, across eight mechanisms.');
}

function draw() {
  updateCanvasSize();
  layoutIssues = [];
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  txt('Degrees of Freedom Counter', canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);
  const size = narrow ? 15 : 16, sy = narrow ? 36 : 42;
  txt(phase === 'done' ? 'All 8 mechanisms done' : 'Mechanism ' + (idx + 1) + ' of ' + MECHANISMS.length, 10, sy, 'black', LEFT, TOP, size, true);
  txt('Correct: ' + correctCount + ' of ' + MECHANISMS.length, canvasWidth - 10, sy, 'black', RIGHT, TOP, size, true);
  const top = sy + size + 8;

  if (phase === 'done') { drawResults(top); return; }

  let pic, panel;
  if (narrow) {
    pic = { x: 8, y: top, w: canvasWidth - 16, h: 168 };
    panel = { x: 8, y: top + 174, w: canvasWidth - 16, h: drawHeight - (top + 174) - 6 };
  } else {
    const w = Math.round((canvasWidth - 26) * 0.5);
    pic = { x: 8, y: top, w: w, h: drawHeight - top - 8 };
    panel = { x: 8 + w + 10, y: top, w: canvasWidth - 26 - w, h: drawHeight - top - 8 };
  }
  drawPicture(MECHANISMS[idx], pic);
  drawPanel(panel, size);
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// The pictures
// ---------------------------------------------------------------------------
function drawPicture(m, R) {
  fill('white'); stroke('gray'); strokeWeight(1);
  rect(R.x, R.y, R.w, R.h, 8);
  const capH = narrow ? 36 : 44;                          // room for the caption under the drawing
  const A = { x: R.x + 10, y: R.y + 8, w: R.w - 20, h: R.h - capH - 12 };
  let caption;
  if (arms[m.picture]) {
    const arm = arms[m.picture];
    const view = RobotArm.fitView(A, arm, { pad: 10, mode: 'pose' });
    RobotArm.draw(arm, view, {});
    caption = m.picture === 'twoLink' ? 'Schematic side view of a flat arm with two joints.' : SIDE_VIEW_NOTE;
  } else if (m.picture === 'door') { drawDoor(A); caption = 'View from above. The door swings on its hinge.'; }
  else if (m.picture === 'drawer') { drawDrawer(A); caption = 'Side view. The drawer slides in and out.'; }
  else { drawGantry(A); caption = 'Schematic. Each slide moves along one straight line.'; }
  paraFit(caption, R.x + 10, R.y + R.h - capH, R.w - 20, capH - 2, { size: narrow ? 14 : 15, col: 'dimgray', center: true, tag: 'caption' });
}

// a straight double-headed arrow
function arrow2(x1, y1, x2, y2, col) {
  stroke(col); strokeWeight(2.5); line(x1, y1, x2, y2);
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  [[x1, y1, a + Math.PI], [x2, y2, a]].forEach(e => {
    fill(col); noStroke();
    triangle(e[0] + h * Math.cos(e[2]), e[1] + h * Math.sin(e[2]),
      e[0] + h * 0.6 * Math.cos(e[2] + 2.3), e[1] + h * 0.6 * Math.sin(e[2] + 2.3),
      e[0] + h * 0.6 * Math.cos(e[2] - 2.3), e[1] + h * 0.6 * Math.sin(e[2] - 2.3));
  });
  strokeWeight(1);
}

function drawDoor(A) {
  const hx = A.x + A.w * 0.30, hy = A.y + A.h * 0.80;
  const len = Math.min(A.w * 0.5, A.h * 0.72);
  // the wall on both sides of the doorway
  stroke('slategray'); strokeWeight(8);
  line(A.x + 4, hy, hx - 10, hy);
  line(hx + len + 10, hy, A.x + A.w - 4, hy);
  // the swing of the door, as a dashed arc
  noFill(); stroke('gray'); strokeWeight(1.5);
  drawingContext.setLineDash([5, 5]);
  arc(hx, hy, len * 2, len * 2, -Math.PI / 2, 0);
  drawingContext.setLineDash([]);
  // the door, part way open
  const a = -Math.PI * 0.28;
  stroke('saddlebrown'); strokeWeight(9);
  line(hx, hy, hx + len * Math.cos(a), hy + len * Math.sin(a));
  // the hinge is the joint
  fill('slateblue'); stroke('midnightblue'); strokeWeight(2); circle(hx, hy, 18);
  txt('hinge', hx - 14, hy - 18, 'black', RIGHT, CENTER, 15, true);
  txt('door', hx + len * 0.62 * Math.cos(a) + 12, hy + len * 0.62 * Math.sin(a) + 14, 'black', LEFT, CENTER, 15);
}

function drawDrawer(A) {
  const cw = Math.min(A.w * 0.42, 150), ch = Math.min(A.h * 0.8, 110);
  const cx = A.x + A.w * 0.12, cy = A.y + (A.h - ch) / 2;
  // the cabinet, and the slide rail the drawer runs on
  fill('burlywood'); stroke('saddlebrown'); strokeWeight(2);
  rect(cx, cy, cw, ch, 3);
  stroke('slateblue'); strokeWeight(4);
  line(cx + 6, cy + ch * 0.62, cx + cw * 1.75, cy + ch * 0.62);
  // the drawer, pulled part way out
  const dw = cw * 0.9, dh = ch * 0.34, dx = cx + cw * 0.62, dy = cy + ch * 0.62 - dh;
  fill('wheat'); stroke('saddlebrown'); strokeWeight(2);
  rect(dx, dy, dw, dh, 2);
  strokeWeight(5); line(dx + dw, dy + dh * 0.35, dx + dw, dy + dh * 0.65);     // the handle
  // the labels and the arrow sit beside the cabinet, over the part of the drawer that sticks out
  const ox = cx + cw + 8, mid = (ox + dx + dw) / 2;
  arrow2(ox, cy + ch * 0.62 + 16, dx + dw, cy + ch * 0.62 + 16, 'slateblue');
  txt('slide', mid, cy + ch * 0.62 + 34, 'black', CENTER, CENTER, 15, true);
  txt('drawer', mid, dy - 12, 'black', CENTER, CENTER, 15);
}

function drawGantry(A) {
  const w = Math.min(A.w * 0.72, 300), h = A.h * 0.78;
  const x0 = A.x + (A.w - w) / 2, y0 = A.y + A.h * 0.12;
  // frame: two posts and the top beam (the X rail)
  stroke('slategray'); strokeWeight(7);
  line(x0, y0, x0, y0 + h); line(x0 + w, y0, x0 + w, y0 + h);
  stroke('slateblue'); strokeWeight(6); line(x0, y0 + 10, x0 + w, y0 + 10);
  // the bed, drawn as a slanted plate so the Y direction (front to back) can be seen
  fill('gainsboro'); stroke('slategray'); strokeWeight(2);
  quad(x0 + 14, y0 + h, x0 + w - 14, y0 + h, x0 + w - 40, y0 + h - 26, x0 + 40, y0 + h - 26);
  // the carriage on the X rail, and the Z slide hanging from it with the tool at the bottom
  const cx = x0 + w * 0.42;
  fill('darkorange'); stroke('saddlebrown'); strokeWeight(2); rect(cx - 16, y0, 32, 20, 3);
  stroke('slateblue'); strokeWeight(6); line(cx, y0 + 20, cx, y0 + h * 0.56);
  fill('teal'); noStroke(); triangle(cx - 7, y0 + h * 0.56, cx + 7, y0 + h * 0.56, cx, y0 + h * 0.56 + 12);
  // one double arrow for each slide
  arrow2(cx + 30, y0 - 7, cx + 30 + w * 0.24, y0 - 7, 'black'); txt('X', cx + 30 + w * 0.24 + 14, y0 - 6, 'black', CENTER, CENTER, 15, true);
  arrow2(cx + 18, y0 + h * 0.24, cx + 18, y0 + h * 0.52, 'black'); txt('Z', cx + 32, y0 + h * 0.38, 'black', CENTER, CENTER, 15, true);
  arrow2(x0 + w * 0.62, y0 + h - 5, x0 + w * 0.62 + 20, y0 + h - 21, 'black'); txt('Y', x0 + w * 0.62 - 12, y0 + h - 12, 'black', CENTER, CENTER, 15, true);
}

// ---------------------------------------------------------------------------
// The text panel
// ---------------------------------------------------------------------------
function drawPanel(P, size) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(P.x, P.y, P.w, P.h, 10);
  const x = P.x + 10, w = P.w - 20, bottom = P.y + P.h - 8;
  const m = MECHANISMS[idx];
  let y = P.y + 8;
  y = para(m.name, x, y, w, { size: size + 1, bold: true }) + 6;
  y = para(m.joints, x, y, w, { size: size, lead: 'Joints:', leadCol: 'navy' }) + 6;
  y = para(RULE, x, y, w, { size: narrow ? 14 : 15, col: 'dimgray' }) + 8;
  if (phase === 'ask') {
    y = para(QUESTION, x, y, w, { size: size, bold: true }) + 4;
    if (!narrow) paraFit('Choose a number from 1 to 8 below, then press Check. You get one attempt.', x, y, w, bottom - y, { size: size, col: 'dimgray', tag: 'prompt' });
    if (y > bottom + 1) layoutIssues.push('question overflows by ' + Math.round(y - bottom) + 'px');
    return;
  }
  const ok = picks[idx] === m.dof;
  const msg = ok ? 'Correct: ' + m.dof + ' DOF. ' + m.why
    : 'Not quite. Count each independent joint once: this mechanism has ' + m.dof + ' DOF. ' + m.why;
  paraFit(msg, x, y, w, bottom - y, { size: size, col: ok ? 'darkgreen' : 'firebrick', tag: 'feedback' });
}

// ---------------------------------------------------------------------------
// The final screen: the score and the eight mechanisms with their DOF side by side
// ---------------------------------------------------------------------------
function drawResults(top) {
  const ok = correctCount >= MASTERY;
  const x = 8, w = canvasWidth - 16;
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(x, top, w, drawHeight - top - 8, 10);
  let y = top + 10;
  txt('Correct: ' + correctCount + ' of ' + MECHANISMS.length, x + 12, y, 'black', LEFT, TOP, 20, true);
  y += 30;
  y = para(ok ? 'Mastery reached (7 of 8 or better).' : 'Mastery is 7 of 8. Press Try again.', x + 12, y, w - 24,
    { size: 16, bold: true, col: ok ? 'darkgreen' : 'firebrick' }) + 8;
  const fs = narrow ? 14 : 16, cDof = x + w - (narrow ? 36 : 60);
  txt('Mechanism', x + 40, y + 10, 'dimgray', LEFT, CENTER, fs, true);
  txt('DOF', cDof, y + 10, 'dimgray', CENTER, CENTER, fs, true);
  y += 26;
  const rowH = Math.min(34, (drawHeight - 16 - y) / MECHANISMS.length);
  MECHANISMS.forEach((m, i) => {
    const cy = y + rowH / 2;
    if (i % 2 === 0) { fill('whitesmoke'); noStroke(); rect(x + 6, y, w - 12, rowH, 4); }
    drawMark(x + 22, cy, picks[i] === m.dof, 6);
    lineFit((i + 1) + '. ' + (narrow ? m.short : m.name), x + 40, cy + 1, cDof - 24 - (x + 40), { size: fs });
    txt(String(m.dof), cDof, cy + 1, 'black', CENTER, CENTER, fs + 2, true);
    y += rowH;
  });
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
function layoutControls() {
  const y = drawHeight + 13;
  dofSelect.position(narrow ? 156 : 178, y);
  dofSelect.size(80);
  actionBtn.position(canvasWidth - (narrow ? 128 : 170), y);
  actionBtn.size(narrow ? 118 : 160);
}

function drawControlLabels() {
  txt(narrow ? 'Degrees of freedom:' : 'Degrees of freedom:', 10, drawHeight + 25, 'black', LEFT, CENTER, narrow ? 15 : 16);
}

function refreshControls() {
  const able = on => { if (on) actionBtn.removeAttribute('disabled'); else actionBtn.attribute('disabled', ''); };
  if (phase === 'done') dofSelect.hide(); else dofSelect.show();
  if (phase === 'ask') { dofSelect.removeAttribute('disabled'); actionBtn.html('Check'); able(dofSelect.value() !== ''); }
  else if (phase === 'feedback') { dofSelect.attribute('disabled', ''); actionBtn.html(idx === MECHANISMS.length - 1 ? 'See score' : 'Next mechanism'); able(true); }
  else { actionBtn.html('Try again'); able(true); }
}

function onAction() {
  if (phase === 'ask') {
    if (dofSelect.value() === '') return;
    picks[idx] = parseInt(dofSelect.value(), 10);         // one attempt per mechanism
    if (picks[idx] === MECHANISMS[idx].dof) correctCount++;
    phase = 'feedback';
  } else if (phase === 'feedback') {
    dofSelect.selected('');
    if (idx < MECHANISMS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else {
    idx = 0; correctCount = 0; picks = []; dofSelect.selected(''); phase = 'ask';
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
