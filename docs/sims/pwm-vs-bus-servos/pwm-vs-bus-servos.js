// Hobby PWM Servo vs. Serial Bus Servo - p5.js MicroSim
// CANVAS_HEIGHT: 590
// Learning objective (Analyze): explain why a hobby PWM servo (MG995) cannot replace the STS3215
// serial bus servos in an SO-ARM100/101 by comparing three things side by side:
//   1. what each servo reports back (command and readback)
//   2. whether a leader arm can be read and copied (leader and follower)
//   3. how many wires each needs (wiring)
// Illustrative model: load, shortfall and temperature are teaching values, not datasheet data.
// MicroSim template version 2026.03

// global variables for width and height
let containerWidth; // calculated from the container on init and on resize
let canvasWidth = 400;
// fixed top drawing region - no controls in here
let drawHeight = 470;
// control region: 3 rows x 35 + 10 = 115, rounded up to 120
let controlHeight = 120;
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;

let margin = 25;
// room for "Command angle: 180°" to the left of the sliders
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// layout of the two side-by-side panels
const PANEL_TOP = 44;
const PANEL_H = 340;
const PANEL_GAP = 10;
const PANEL_PAD = 10;
const INSIGHT_Y = 392;
const INSIGHT_H = 70;

// controls
let viewSelect;
let cmdSlider;
let loadSlider;
let jointSlider;

// 1 = command and readback, 2 = leader and follower, 3 = wiring
let viewMode = 1;
// true when the canvas is narrow; set in updateCanvasSize()
let narrow = false;

// view 1 state: the real arm angle eases toward where the load lets it settle
let actualAngle = 93;

// view 2 state
let leaderAngle = 90;
let followerAngle = 90;
let dragging = false;
let dragPanel = 0;
let hasDragged = false;

function setup() {
  updateCanvasSize(); // must be first: sets the width from the container
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // All controls are created here, before layoutControls() positions them.
  viewSelect = createSelect();
  viewSelect.option('1. Command and readback', '1');
  viewSelect.option('2. Leader and follower', '2');
  viewSelect.option('3. Wiring', '3');
  viewSelect.selected('1');
  viewSelect.changed(onViewChange);

  cmdSlider = createSlider(0, 180, 120, 1);
  loadSlider = createSlider(0, 100, 70, 1);
  jointSlider = createSlider(1, 6, 6, 1);

  layoutControls();
  onViewChange();

  describe('Side-by-side comparison of a hobby PWM servo and a serial bus servo. ' +
    'The PWM servo sends no data back, so the controller cannot see load, position, or a leader arm. ' +
    'The bus servo reports position, load and temperature, so a follower arm can copy a leader arm.', LABEL);
}

function draw() {
  updateCanvasSize();

  // drawing region and control region backgrounds (required MicroSim standard)
  fill('aliceblue');
  stroke('silver');
  strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // title drawn first, panels after, so nothing overwrites it
  txt('Hobby PWM Servo vs. Serial Bus Servo', canvasWidth / 2, 10, 'black',
    CENTER, TOP, canvasWidth < 560 ? 20 : 24, true);

  let message = '';
  if (viewMode === 1) message = drawCommandView();
  else if (viewMode === 2) message = drawLeaderFollowerView();
  else message = drawWiringView();

  drawInsight(message);
  drawControlLabels();
  updateCursor();
}

// ---------------------------------------------------------------------------
// View 1: command and readback
// ---------------------------------------------------------------------------
function drawCommandView() {
  const cmd = cmdSlider.value();
  const load = loadSlider.value();

  // Model: the same physical arm and the same load for both servos, so the only
  // difference between the panels is what each servo tells the controller.
  const shortfall = pow(load / 100, 2) * 55; // degrees short of the goal
  const settleAngle = max(0, cmd - shortfall);
  actualAngle += (settleAngle - actualAngle) * 0.15;
  const moving = abs(actualAngle - settleAngle) > 2;

  const pulseMs = 1 + cmd / 180;                 // typical 1-2 ms hobby servo pulse
  const goalRaw = round(cmd / 360 * 4096);       // STS3215: 4096 steps per turn
  const posRaw = round(actualAngle / 360 * 4096);
  const temp = round(28 + load * 0.35);

  for (let i = 0; i < 2; i++) {
    const isBus = i === 1;
    const r = panelRect(i);
    const col = isBus ? 'steelblue' : 'darkorange';
    drawPanelFrame(r, isBus ? 'Bus servo (STS3215)' : 'PWM servo (MG995)',
      isBus ? 'lightcyan' : 'papayawhip');

    const px = r.x + r.w / 2;
    const py = r.y + 112;
    const len = min(66, r.w / 2 - 30);
    drawArm(px, py, len, actualAngle, col, cmd, isBus ? 'goal' : (narrow ? 'thinks' : 'believed'));
    txt('Real angle: ' + round(actualAngle) + '°', px, py + 32, 'dimgray', CENTER, CENTER);

    // two signal lanes: what goes to the servo, and what comes back
    const laneX0 = r.x + 36;
    const laneW = r.w - 36 - 14;
    const lane1 = r.y + 160;
    const lane2 = r.y + 180;
    arrow(r.x + 12, lane1 + 7, r.x + 30, lane1 + 7, col, 3);
    arrow(r.x + 30, lane2 + 7, r.x + 12, lane2 + 7, isBus ? 'seagreen' : 'lightgray', 3);
    if (isBus) {
      drawPacket(laneX0, lane1, col);
      // the reply starts after the command packet, but must stay inside the panel
      drawPacket(laneX0 + min(130, laneW - 114), lane2, 'seagreen');
    } else {
      drawPulses(laneX0, lane1, laneW, pulseMs, col);
      drawDashedLine(laneX0, lane2 + 7, laneX0 + laneW, lane2 + 7, 'lightgray');
      // white backing so the label does not read as struck through
      noStroke();
      fill('white');
      rect(laneX0 + laneW / 2 - 62, lane2, 124, 14);
      txt('no return wire', laneX0 + laneW / 2, lane2 + 7, 'crimson', CENTER, CENTER, 16, true);
    }

    if (isBus) txt(narrow ? 'Sent: goal ' + goalRaw : 'Sent: WRITE id 1, goal ' + goalRaw, r.x + 12, r.y + 210, 'black');
    else txt('Sent: ' + pulseMs.toFixed(2) + ' ms pulse' + (narrow ? '' : ', every 20 ms'), r.x + 12, r.y + 210, 'black');

    if (isBus) {
      let status = ['Status', 'At goal', 'seagreen', true];
      if (moving) status = ['Status', 'Moving', 'dimgray', false];
      else if (shortfall > 4) {
        status = ['Status', narrow ? 'Short ' + round(shortfall) + '°' : 'Stalled, ' + round(shortfall) + '° short', 'crimson', true];
      }
      drawTelemetry(r, r.y + 226, narrow ? 'Reply:' : 'Reply from servo 1:', [
        ['Position', posRaw + ' (' + round(actualAngle) + '°)'],
        ['Load', load + ' %'],
        ['Temperature', temp + ' °C'],
        status
      ]);
    } else {
      drawTelemetry(r, r.y + 226, narrow ? 'Reply: none' : 'Reply from servo: none', [
        ['Position', 'no data', 'crimson'],
        ['Load', 'no data', 'crimson'],
        ['Temperature', 'no data', 'crimson'],
        ['Status', 'unknown', 'crimson', true]
      ]);
    }
  }

  if (shortfall < 4) {
    return narrow
      ? 'No load: both arms reach the goal. Raise the load to push the arm short.'
      : 'With no load both arms reach the goal and look identical. Raise the load to push the arm short of its goal.';
  }
  return narrow
    ? 'Same ' + load + '% load, same ' + round(shortfall) + '° miss. Only the bus servo reports it; PWM still believes ' + cmd + '°.'
    : 'Same arm, same ' + load + '% load, same ' + round(shortfall) + '° shortfall. The bus servo reports it. ' +
      'The PWM controller sees nothing and still believes the arm is at ' + cmd + '°.';
}

// ---------------------------------------------------------------------------
// View 2: leader and follower
// ---------------------------------------------------------------------------
function leaderGeom(i) {
  const r = panelRect(i);
  return { x: r.x + r.w * 0.27, y: r.y + 150, len: min(60, r.w * 0.15) };
}

function drawLeaderFollowerView() {
  // the bus follower copies the leader with a little lag; the PWM follower has nothing to copy
  followerAngle += (leaderAngle - followerAngle) * 0.25;
  const leaderRaw = round(leaderAngle / 360 * 4096);

  for (let i = 0; i < 2; i++) {
    const isBus = i === 1;
    const r = panelRect(i);
    const col = isBus ? 'steelblue' : 'darkorange';
    drawPanelFrame(r, isBus ? 'Bus servo (STS3215)' : 'PWM servo (MG995)',
      isBus ? 'lightcyan' : 'papayawhip');

    const g = leaderGeom(i);
    const fx = r.x + r.w * 0.73;
    drawArm(g.x, g.y, g.len, leaderAngle, 'slategray', null, '');
    drawArm(fx, g.y, g.len, isBus ? followerAngle : 90, col, null, '');
    txt('Leader', g.x, g.y + 32, 'dimgray', CENTER, CENTER);
    txt('Follower', fx, g.y + 32, 'dimgray', CENTER, CENTER);

    // draggable handle on the leader tip
    const tip = armTip(g.x, g.y, g.len, leaderAngle);
    stroke('darkgoldenrod');
    strokeWeight(2);
    fill('gold');
    circle(tip.x, tip.y, 24);
    if (!hasDragged) txt('drag me', tip.x, tip.y - 26, 'darkgoldenrod', CENTER, CENTER, 16, true);

    // angle data from leader to follower
    const ay = g.y + 68;
    if (isBus) {
      arrow(g.x + 24, ay, fx - 24, ay, 'seagreen', 4);
      txt((narrow ? 'Leader: ' : 'Leader reports: ') + leaderRaw + ' (' + round(leaderAngle) + '°)', r.x + 12, g.y + 94, 'black');
      txt((narrow ? 'Goal: ' : 'Follower goal: ') + leaderRaw, r.x + 12, g.y + 116, 'black');
    } else {
      const mid = (g.x + fx) / 2;
      drawDashedLine(g.x + 24, ay, fx - 24, ay, 'crimson');
      stroke('crimson');
      strokeWeight(5);
      line(mid - 10, ay - 10, mid + 10, ay + 10);
      line(mid - 10, ay + 10, mid + 10, ay - 10);
      txt(narrow ? 'Leader: no data' : 'Leader reports: no data', r.x + 12, g.y + 94, 'crimson', LEFT, CENTER, 16, true);
      txt(narrow ? 'Hold 90°' : 'Follower command: hold 90°', r.x + 12, g.y + 116, 'black');
    }

    // verdict pill
    const py = g.y + 136;
    stroke(isBus ? 'seagreen' : 'crimson');
    strokeWeight(2);
    fill(isBus ? 'honeydew' : 'mistyrose');
    rect(r.x + 12, py, r.w - 24, 30, 15);
    const verdict = isBus ? (narrow ? 'Copies leader' : 'Follower copies the leader')
                          : (narrow ? 'Cannot copy' : 'Follower cannot copy the leader');
    txt(verdict, r.x + r.w / 2, py + 15, isBus ? 'seagreen' : 'crimson', CENTER, CENTER, 16, true);
  }

  return narrow
    ? 'A leader arm needs angle readback. A bus servo reports it; a PWM servo has no wire to.'
    : 'A leader arm works by reading joint angles and copying them to the follower. ' +
      'A bus servo reports its angle on request. A PWM servo has no wire to report it, so there is nothing to copy.';
}

// ---------------------------------------------------------------------------
// View 3: wiring
// ---------------------------------------------------------------------------
function drawWiringView() {
  const n = jointSlider.value();
  const rowH = 34;

  for (let i = 0; i < 2; i++) {
    const isBus = i === 1;
    const r = panelRect(i);
    const col = isBus ? 'steelblue' : 'darkorange';
    drawPanelFrame(r, isBus ? 'Bus servo (STS3215)' : 'PWM servo (MG995)',
      isBus ? 'lightcyan' : 'papayawhip');

    // controller board
    const bx = r.x + 12;
    const by = r.y + 40;
    const bw = narrow ? 54 : 80;
    stroke('gray');
    strokeWeight(1);
    fill('whitesmoke');
    rect(bx, by, bw, 232, 6);
    txt(isBus ? 'Bus\nboard' : 'PWM\ndriver', bx + bw / 2, by + 20, 'black', CENTER, CENTER, 16, true);

    // servo column
    const sw = narrow ? 64 : 92;
    const sx = r.x + r.w - sw - 12;
    const rowY = (k) => r.y + 86 + k * rowH;

    if (isBus) {
      // one shared cable: a trunk to a backbone, with a short tap to each servo
      const trunkX = sx - (narrow ? 10 : 16);
      const midY = (rowY(0) + rowY(n - 1)) / 2;
      stroke(col);
      strokeWeight(3);
      line(bx + bw, midY, trunkX, midY);
      line(trunkX, rowY(0), trunkX, rowY(n - 1));
      for (let k = 0; k < n; k++) line(trunkX, rowY(k), sx, rowY(k));
      noStroke();
      fill(col);
      rect(bx + bw - 4, midY - 4, 8, 8);
    } else {
      // one wire per joint
      for (let k = 0; k < n; k++) {
        stroke(col);
        strokeWeight(3);
        line(bx + bw, rowY(k), sx, rowY(k));
        noStroke();
        fill(col);
        rect(bx + bw - 4, rowY(k) - 4, 8, 8);
      }
    }
    for (let k = 0; k < n; k++) {
      stroke(col);
      strokeWeight(2);
      fill('white');
      rect(sx, rowY(k) - 14, sw, 28, 5);
      txt((isBus ? 'ID ' : 'Joint ') + (k + 1), sx + sw / 2, rowY(k), 'black', CENTER, CENTER);
    }

    if (isBus) {
      txt(narrow ? 'Wires: 1 shared' : 'Signal wires: 1 (shared by all)', r.x + 12, r.y + 292, 'black');
      txt(narrow ? 'Pair: 2 ports' : 'Leader + follower: 2 serial ports', r.x + 12, r.y + 314, 'black');
    } else {
      txt(narrow ? 'Wires: ' + n : 'Signal wires: ' + n + ' (one per joint)', r.x + 12, r.y + 292, 'black');
      txt(narrow ? 'Pair: ' + (2 * n) + ' channels' : 'Leader + follower: ' + (2 * n) + ' PWM channels', r.x + 12, r.y + 314, 'black');
    }
  }

  return narrow
    ? 'PWM: ' + n + ' wires, no reply. Bus: one cable, each servo answers by ID. A pair needs ' + (2 * n) + ' PWM channels or 2 ports.'
    : 'PWM needs one timing wire per joint and gets nothing back. A bus servo chain needs one cable per arm: ' +
      'each servo has its own ID and replies when asked. A leader plus follower pair of ' + n +
      ' joints needs ' + (2 * n) + ' PWM channels, or 2 serial ports.';
}

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------
function panelRect(i) {
  const w = (canvasWidth - 2 * PANEL_PAD - PANEL_GAP) / 2;
  return { x: PANEL_PAD + i * (w + PANEL_GAP), y: PANEL_TOP, w: w, h: PANEL_H };
}

function drawPanelFrame(r, title, headerFill) {
  stroke('silver');
  strokeWeight(1);
  fill('white');
  rect(r.x, r.y, r.w, r.h, 8);
  noStroke();
  fill(headerFill);
  rect(r.x + 1, r.y + 1, r.w - 2, 27, 7, 7, 0, 0);
  txt(title, r.x + r.w / 2, r.y + 15, 'black', CENTER, CENTER, 16, true);
}

// screen position of an arm tip: 0 degrees points left, 90 up, 180 right
function armTip(px, py, len, deg) {
  const a = radians(deg);
  return { x: px - len * cos(a), y: py - len * sin(a) };
}

function drawArm(px, py, len, deg, col, goalDeg, goalLabel) {
  // goal marker first so the real arm draws on top of it
  if (goalDeg !== null) {
    const g = armTip(px, py, len, goalDeg);
    drawingContext.setLineDash([6, 5]);
    stroke('gray');
    strokeWeight(3);
    line(px, py, g.x, g.y);
    drawingContext.setLineDash([]);
    noFill();
    circle(g.x, g.y, 14);
    const right = g.x >= px;
    txt(goalLabel, g.x + (right ? 14 : -14), g.y, 'dimgray', right ? LEFT : RIGHT, CENTER);
  }
  // base, link, and joint
  noStroke();
  fill('dimgray');
  rect(px - 18, py + 6, 36, 12, 3);
  const t = armTip(px, py, len, deg);
  stroke(col);
  strokeWeight(10);
  strokeCap(ROUND);
  line(px, py, t.x, t.y);
  strokeWeight(2);
  fill('white');
  circle(px, py, 18);
  fill(col);
  noStroke();
  circle(t.x, t.y, 12);
}

// PWM command lane: two 20 ms frames, each holding one pulse of 1-2 ms
function drawPulses(x, y, w, pulseMs, col) {
  const frame = w / 2;
  const pulse = frame * pulseMs / 20;
  stroke('lightgray');
  strokeWeight(1);
  line(x, y + 14, x + w, y + 14);
  noStroke();
  fill(col);
  for (let f = 0; f < 2; f++) rect(x + f * frame, y, pulse, 14);
}

// bus lane: one packet drawn as header, id, data, and checksum blocks
function drawPacket(x, y, col) {
  stroke('lightgray');
  strokeWeight(1);
  line(x - 4, y + 14, x + 114, y + 14);
  noStroke();
  fill(col);
  const blocks = [[0, 22], [26, 12], [42, 44], [90, 16]];
  blocks.forEach(b => rect(x + b[0], y, b[1], 14, 2));
}

function drawTelemetry(r, y, title, rows) {
  const x = r.x + 10;
  const w = r.w - 20;
  stroke('silver');
  strokeWeight(1);
  fill('whitesmoke');
  rect(x, y, w, 106, 6);
  txt(title, x + 8, y + 14, 'black', LEFT, CENTER, 16, true);
  rows.forEach((row, k) => {
    const yy = y + 14 + (k + 1) * 21;
    txt(row[0], x + 8, yy, 'dimgray');
    txt(row[1], x + w - 8, yy, row[2] || 'black', RIGHT, CENTER, 16, row[3] || false);
  });
}

function drawInsight(message) {
  stroke('goldenrod');
  strokeWeight(1);
  fill('lightyellow');
  rect(PANEL_PAD, INSIGHT_Y, canvasWidth - 2 * PANEL_PAD, INSIGHT_H, 8);
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
  textLeading(20);
  text(message, PANEL_PAD + 10, INSIGHT_Y + 6, canvasWidth - 2 * PANEL_PAD - 20, INSIGHT_H - 8);
}

function drawControlLabels() {
  txt('View:', 10, drawHeight + 18, 'black');
  if (viewMode === 1) {
    txt('Command angle: ' + cmdSlider.value() + '°', 10, drawHeight + 53, 'black');
    txt('Load on arm: ' + loadSlider.value() + ' %', 10, drawHeight + 88, 'black');
  } else if (viewMode === 2) {
    txt('Drag a gold handle to move both leaders.', 10, drawHeight + 53, 'black');
  } else {
    txt('Joints per arm: ' + jointSlider.value(), 10, drawHeight + 53, 'black');
  }
}

function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke(); // always clear the stroke before text
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  text(str, x, y);
  textStyle(NORMAL);
}

function arrow(x1, y1, x2, y2, col, w) {
  stroke(col);
  strokeWeight(w);
  line(x1, y1, x2, y2);
  const a = atan2(y2 - y1, x2 - x1);
  const s = 8 + w;
  noStroke();
  fill(col);
  triangle(x2, y2,
    x2 - s * cos(a - 0.45), y2 - s * sin(a - 0.45),
    x2 - s * cos(a + 0.45), y2 - s * sin(a + 0.45));
}

function drawDashedLine(x1, y1, x2, y2, col) {
  drawingContext.setLineDash([6, 5]);
  stroke(col);
  strokeWeight(3);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------
function onViewChange() {
  viewMode = int(viewSelect.value());
  if (viewMode === 1) cmdSlider.show(); else cmdSlider.hide();
  if (viewMode === 1) loadSlider.show(); else loadSlider.hide();
  if (viewMode === 3) jointSlider.show(); else jointSlider.hide();
  layoutControls();
}

function layoutControls() {
  const sliderW = max(80, canvasWidth - sliderLeftMargin - margin);
  viewSelect.position(60, drawHeight + 5);
  viewSelect.size(240);
  cmdSlider.position(sliderLeftMargin, drawHeight + 40);
  cmdSlider.size(sliderW);
  jointSlider.position(sliderLeftMargin, drawHeight + 40);
  jointSlider.size(sliderW);
  loadSlider.position(sliderLeftMargin, drawHeight + 75);
  loadSlider.size(sliderW);
}

function mousePressed() {
  if (viewMode !== 2) return;
  for (let i = 0; i < 2; i++) {
    const g = leaderGeom(i);
    const tip = armTip(g.x, g.y, g.len, leaderAngle);
    if (dist(mouseX, mouseY, tip.x, tip.y) < 24) {
      dragging = true;
      dragPanel = i;
      hasDragged = true;
      return false;
    }
  }
}

function mouseDragged() {
  if (!dragging) return;
  const g = leaderGeom(dragPanel);
  const up = g.y - mouseY;
  // inverse of armTip(): 0 degrees = left, 180 = right; below the pivot clamps to the nearer end
  leaderAngle = constrain(degrees(atan2(max(up, 0), g.x - mouseX)), 0, 180);
  return false;
}

function mouseReleased() {
  dragging = false;
}

function updateCursor() {
  if (viewMode === 2) {
    if (dragging) { cursor('grabbing'); return; }
    for (let i = 0; i < 2; i++) {
      const g = leaderGeom(i);
      const tip = armTip(g.x, g.y, g.len, leaderAngle);
      if (dist(mouseX, mouseY, tip.x, tip.y) < 24) { cursor('grab'); return; }
    }
  }
  cursor(ARROW);
}

// ---------------------------------------------------------------------------
// Width responsiveness - keep these at the END of the file
// ---------------------------------------------------------------------------
function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
  redraw();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width); // avoid fractional pixels
  canvasWidth = containerWidth;
  // panels under ~340 px wide use shorter labels so 16 px text stays inside them
  narrow = canvasWidth < 700;
}
