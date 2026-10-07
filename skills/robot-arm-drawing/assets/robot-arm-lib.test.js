// Checks the pure-geometry layer of robot-arm-lib.js. Run with: node robot-arm-lib.test.js
// The expected numbers come from Chapter 2 of the book (two-link workspace, L1 = 10, L2 = 15).
const assert = require('assert');
const RobotArm = require('./robot-arm-lib.js');

let n = 0;
function check(name, fn) { fn(); n++; console.log('ok  ' + name); }
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 0.05);

check('pose: straight arm along +x reaches L1 + L2', () => {
  const arm = RobotArm.presets.twoLink(10, 15, { shoulder: 0, elbow: 0 });
  const t = RobotArm.pose(arm).tip;
  assert(near(t.x, 25) && near(t.y, 0));
});

check('pose: shoulder 90 raises the arm; elbow bends relative to the upper arm', () => {
  const arm = RobotArm.presets.twoLink(10, 15, { shoulder: 90, elbow: -90 });
  const t = RobotArm.pose(arm).tip;
  assert(near(t.x, 15) && near(t.y, 10));
});

check('pose: a roll joint does not change the heading', () => {
  const arm = RobotArm.create({ joints: [{ id: 'a', angle: 30 }, { id: 'r', kind: 'roll', angle: 90 }],
                                links: [{ id: 'l', length: 5 }], effector: { type: 'tip' } });
  assert(near(RobotArm.pose(arm).tip.heading, 30 * Math.PI / 180, 1e-9));
});

check('setAngle clamps only when asked', () => {
  const arm = RobotArm.presets.twoLink(10, 15, { elbowMin: 0, elbowMax: 90 });
  assert.strictEqual(RobotArm.setAngle(arm, 'elbow', 120), 120);
  assert.strictEqual(RobotArm.setAngle(arm, 'elbow', 120, { clamp: true }), 90);
});

check('create rejects a link count that does not fit the joints', () => {
  assert.throws(() => RobotArm.create({ joints: [{ id: 'a' }], links: [{ id: 'x', length: 1 }, { id: 'y', length: 1 }] }));
});

// The seven Chapter 2 problems: [x, y, elbowMin, elbowMax, expected reachable, expected r, expected |bend|]
const problems = [
  [20, 10, -180, 180, true, 22.36, 54.3],
  [30, 0, -180, 180, false, 30.0, null],
  [3, 2, -180, 180, false, 3.61, null],
  [25, 0, -180, 180, true, 25.0, 0],
  [7, 0, -180, 180, true, 7.0, 156.9],
  [20, 10, 0, 90, true, 22.36, 54.3],
  [7, 0, 0, 90, false, 7.0, 156.9]
];
problems.forEach((p, i) => check('ik2: chapter problem ' + (i + 1), () => {
  const r = RobotArm.ik2(10, 15, p[0], p[1], [p[2], p[3]]);
  assert.strictEqual(r.reachable, p[4], 'reachable');
  assert(near(r.r, p[5], 0.01), 'r ' + r.r);
  if (p[6] !== null) assert(near(Math.abs(r.solutions[0].theta2), p[6], 0.05), 'bend ' + r.solutions[0].theta2);
}));

check('ik2: solutions reproduce the target through forward kinematics', () => {
  const r = RobotArm.ik2(10, 15, 20, 10);
  r.solutions.forEach(s => {
    const arm = RobotArm.presets.twoLink(10, 15, { shoulder: s.theta1, elbow: s.theta2 });
    const t = RobotArm.pose(arm).tip;
    assert(near(t.x, 20, 1e-6) && near(t.y, 10, 1e-6));
  });
});

check('sampleWorkspace: every sample lies in the ring and the arm angles are restored', () => {
  const arm = RobotArm.presets.twoLink(10, 15, { shoulder: 33, elbow: 44 });
  arm.joints[0].min = 0; arm.joints[0].max = 360;
  const pts = RobotArm.sampleWorkspace(arm, { step: 15 });
  assert(pts.length > 100);
  pts.forEach(p => { const r = Math.hypot(p.x, p.y); assert(r >= 5 - 1e-6 && r <= 25 + 1e-6); });
  assert.strictEqual(arm.joints[0].angle, 33);
  assert.strictEqual(arm.joints[1].angle, 44);
});

const six = RobotArm.presets.sixAxisSchematic();

check('parts: the six-axis schematic has the seven chapter parts in order', () => {
  const ids = RobotArm.parts(six).map(p => p.id);
  assert.deepStrictEqual(ids, ['base', 'shoulder', 'upper_arm', 'elbow', 'forearm', 'wrist', 'end_effector']);
});

check('parts: kinds are fixed, joint, link, joint, link, joint, tool', () => {
  const kinds = RobotArm.parts(six).map(p => p.kind);
  assert.deepStrictEqual(kinds, ['fixed', 'joint', 'link', 'joint', 'link', 'joint', 'tool']);
});

check('hitTestModel: the centre of every part returns that part', () => {
  const ps = RobotArm.pose(six);
  assert.strictEqual(RobotArm.hitTestModel(six, ps.joints[0]), 'shoulder');
  assert.strictEqual(RobotArm.hitTestModel(six, ps.joints[1]), 'elbow');
  assert.strictEqual(RobotArm.hitTestModel(six, ps.joints[2]), 'wrist');
  const mid = (l) => ({ x: (l.a.x + l.b.x) / 2, y: (l.a.y + l.b.y) / 2 });
  assert.strictEqual(RobotArm.hitTestModel(six, mid(ps.links[0])), 'upper_arm');
  assert.strictEqual(RobotArm.hitTestModel(six, mid(ps.links[1])), 'forearm');
  assert.strictEqual(RobotArm.hitTestModel(six, { x: 0, y: -4 }), 'base');
});

check('hitTestModel: the shoulder group includes the turntable', () => {
  assert.strictEqual(RobotArm.hitTestModel(six, { x: 0, y: -2.4 }), 'shoulder');
});

check('hitTestModel: empty space returns null and the effector is found at the tip', () => {
  assert.strictEqual(RobotArm.hitTestModel(six, { x: -40, y: 40 }), null);
  const tip = RobotArm.pose(six).tip;
  const inside = { x: tip.x + Math.cos(tip.heading) * 3, y: tip.y + Math.sin(tip.heading) * 3 };
  assert.strictEqual(RobotArm.hitTestModel(six, inside, 0.5), 'end_effector');
});

check('hitTest (screen) agrees with hitTestModel through a view', () => {
  const view = RobotArm.fitView({ x: 0, y: 0, w: 600, h: 400 }, six);
  const ps = RobotArm.pose(six);
  const s = RobotArm.toScreen(view, ps.joints[1]);
  assert.strictEqual(RobotArm.hitTest(six, view, s.x, s.y), 'elbow');
});

check('fitView: the arm at its maximum reach stays inside the rectangle', () => {
  const rect = { x: 10, y: 20, w: 500, h: 300 };
  const view = RobotArm.fitView(rect, six, { pad: 16 });
  const reach = RobotArm.maxReach(six);
  const right = view.ox + reach * view.scale, top = view.oy - reach * view.scale;
  assert(right <= rect.x + rect.w && top >= rect.y);
});

check('fitView pose mode: the current pose fills the rectangle and stays inside it', () => {
  const rect = { x: 0, y: 0, w: 400, h: 300 };
  const view = RobotArm.fitView(rect, six, { pad: 10, mode: 'pose' });
  const fwd = RobotArm.fitView(rect, six, { pad: 10 });
  assert(view.scale > fwd.scale, 'pose mode should be larger than full-reach mode');
  RobotArm.parts(six).forEach(part => part.shapes.forEach(s => {
    const pts = s.t === 'poly' ? s.pts.map(q => ({ x: q[0], y: q[1] })) : s.t === 'circle' ? [{ x: s.x, y: s.y }] : [s.a, s.b];
    pts.forEach(p => { const sp = RobotArm.toScreen(view, p);
      assert(sp.x >= rect.x && sp.x <= rect.x + rect.w && sp.y >= rect.y && sp.y <= rect.y + rect.h); });
  }));
});

check('fitView poses mode: every listed pose fits, the arm is restored, and it beats full-reach mode', () => {
  const arm = RobotArm.presets.sixAxisSchematic();
  const rect = { x: 0, y: 0, w: 300, h: 170 };
  const before = arm.joints.map(j => j.angle);
  const poses = [-110, 0, 110].map(e => ({ shoulder: 65, elbow: e, wrist: 0 }));
  const view = RobotArm.fitView(rect, arm, { pad: 8, mode: 'poses', poses: poses });
  assert.deepStrictEqual(arm.joints.map(j => j.angle), before, 'angles restored');
  assert(view.scale > RobotArm.fitView(rect, arm, { pad: 8 }).scale, 'larger than full-reach mode');
  poses.forEach(ps => {
    Object.keys(ps).forEach(id => RobotArm.setAngle(arm, id, ps[id]));
    RobotArm.parts(arm).forEach(part => part.shapes.forEach(sh => {
      const pts = sh.t === 'poly' ? sh.pts.map(q => ({ x: q[0], y: q[1] })) : sh.t === 'circle' ? [{ x: sh.x, y: sh.y }] : [sh.a, sh.b];
      pts.forEach(p => { const sp = RobotArm.toScreen(view, p);
        assert(sp.x >= rect.x - 1e-6 && sp.x <= rect.x + rect.w + 1e-6 && sp.y >= rect.y - 1e-6 && sp.y <= rect.y + rect.h + 1e-6, 'pose ' + JSON.stringify(ps)); });
    }));
  });
});

check('every preset builds and has a description', () => {
  ['twoLink', 'sixAxisSchematic', 'so101Schematic', 'rebotSchematic', 'leaderSchematic'].forEach(k => {
    const arm = k === 'twoLink' ? RobotArm.presets.twoLink(10, 15) : RobotArm.presets[k]();
    assert(RobotArm.parts(arm).length >= 5);
    assert(RobotArm.describeArm(arm).length > 40);
  });
});

check('angleToward: pointing a link at a target gives an angle that reaches it', () => {
  const arm = RobotArm.presets.twoLink(10, 15, { shoulder: 0, elbow: 0 });
  const a = RobotArm.angleToward(arm, 'shoulder', { x: 0, y: 5 });
  assert(near(a, 90));
  RobotArm.setAngle(arm, 'shoulder', 90);
  const b = RobotArm.angleToward(arm, 'elbow', { x: 10, y: 10 });
  assert(near(b, -90));
});

// --- Drawing layer, run against stubbed p5 functions -------------------------------------------
// The geometry tests above cannot see drawing bugs. A real one slipped through once: a local helper
// named circle() hid p5's circle(), so joint caps were never painted. These checks run draw()
// against recording stubs and verify the p5 calls that must happen.
const calls = {};
const rec = (name) => (...a) => { (calls[name] = calls[name] || []).push(a); };
['push', 'pop', 'fill', 'stroke', 'noStroke', 'noFill', 'strokeWeight', 'strokeCap', 'line', 'circle', 'rect',
 'beginShape', 'endShape', 'vertex', 'beginContour', 'endContour', 'text', 'textSize', 'textAlign', 'rectMode']
  .forEach(n => { global[n] = rec(n); });
Object.assign(global, { CLOSE: 'close', ROUND: 'round', LEFT: 'left', RIGHT: 'right', CENTER: 'center', BOTTOM: 'bottom', TOP: 'top',
  drawingContext: { globalAlpha: 1, setLineDash() {} }, textWidth: (s) => String(s).length * 8 });
const reset = () => Object.keys(calls).forEach(k => delete calls[k]);
const count = (n) => (calls[n] || []).length;

check('draw: p5 circle() is called once per joint cap (guards against a shadowed circle)', () => {
  reset();
  const arm = RobotArm.presets.sixAxisSchematic();
  RobotArm.draw(arm, RobotArm.fitView({ x: 0, y: 0, w: 400, h: 300 }, arm));
  assert.strictEqual(count('circle'), 3, 'three joint caps expected, got ' + count('circle'));
  assert(count('line') >= 4, 'capsules for links and the gripper are drawn as thick lines');
  assert.strictEqual(count('endShape'), 2, 'one polygon for the base and one for the turntable');
});

check('draw: a highlighted part is drawn in the highlight colour', () => {
  reset();
  const arm = RobotArm.presets.sixAxisSchematic();
  RobotArm.draw(arm, RobotArm.fitView({ x: 0, y: 0, w: 400, h: 300 }, arm), { highlight: 'elbow' });
  const fills = calls.fill.map(a => a[0]);
  assert(fills.includes(RobotArm.PALETTE.highlight), 'highlight fill used');
});

check('drawCallouts: one leader line, one dot and one label per item', () => {
  reset();
  const arm = RobotArm.presets.sixAxisSchematic();
  const view = RobotArm.fitView({ x: 0, y: 0, w: 400, h: 300 }, arm);
  RobotArm.drawCallouts(arm, view, RobotArm.parts(arm).map(p => ({ id: p.id, text: p.name })),
    { side: 'auto', xLeft: 80, xRight: 320 });
  assert.strictEqual(count('line'), 7);
  assert.strictEqual(count('circle'), 7);
  assert.strictEqual(count('text'), 7);
});

check('drawCallouts: tags in one column are at least 22 px apart', () => {
  reset();
  const arm = RobotArm.presets.sixAxisSchematic();
  const view = RobotArm.fitView({ x: 0, y: 0, w: 400, h: 300 }, arm);
  RobotArm.drawCallouts(arm, view, RobotArm.parts(arm).map(p => ({ id: p.id, text: p.name })), { side: 'right', x: 380 });
  const ys = calls.text.map(a => a[2]).sort((a, b) => a - b);
  for (let i = 1; i < ys.length; i++) assert(ys[i] - ys[i - 1] >= 22 - 1e-9, 'tags overlap: ' + ys);
});

check('drawDimension: the label moves to the lower side of the line when offset', () => {
  reset();
  const view = RobotArm.fixedView({ x: 0, y: 0, w: 400, h: 300 }, 30);
  RobotArm.drawDimension(view, { x: 0, y: 0 }, { x: 10, y: 0 }, 'r = 10', 20);
  const [mx, my] = calls.rect[0];
  const mid = RobotArm.toScreen(view, { x: 5, y: 0 });
  assert(near(mx, mid.x, 1e-9) && near(my, mid.y + 20, 1e-9), 'label centre ' + mx + ',' + my);
  reset();
  RobotArm.drawDimension(view, { x: 0, y: 0 }, { x: 10, y: 0 }, 'r = 10');
  assert(near(calls.rect[0][1], mid.y, 1e-9), 'no offset keeps the label on the line');
});

check('drawRing: one outline with the hole cut by a reversed inner loop, and no p5 contours', () => {
  reset();
  const view = RobotArm.fixedView({ x: 0, y: 0, w: 400, h: 300 }, 30);
  RobotArm.drawRing(view, { x: 0, y: 0 }, 5, 25);
  assert.strictEqual(count('endShape'), 1);
  assert.strictEqual(count('beginContour'), 0, 'contours do not cut the hole reliably in p5 2.x');
  assert.strictEqual(count('vertex'), 2 * 121, 'outer and inner loops');
  const v = calls.vertex.map(a => Math.hypot(a[0] - view.ox, a[1] - view.oy) / view.scale);
  assert(near(Math.max(...v), 25, 0.01) && near(Math.min(...v), 5, 0.01));
  reset();
  RobotArm.drawRing(view, { x: 0, y: 0 }, 0, 25);
  assert.strictEqual(count('vertex'), 121, 'no inner loop when rMin is 0');
});

check('drawRing, drawAngleArc, drawDimension, drawAxes, drawPoints run without error', () => {
  reset();
  const arm = RobotArm.presets.twoLink(10, 15);
  const view = RobotArm.fitView({ x: 0, y: 0, w: 400, h: 300 }, arm, { mode: 'full' });
  RobotArm.drawRing(view, { x: 0, y: 0 }, 5, 25);
  RobotArm.drawAngleArc(view, { x: 0, y: 0 }, 0, 45, 30, '45 degrees');
  RobotArm.drawDimension(view, { x: 0, y: 0 }, { x: 10, y: 0 }, 'L1 = 10');
  RobotArm.drawAxes(view, { x: 0, y: 0 }, 8);
  RobotArm.drawPoints(view, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);
  assert.strictEqual(count('circle'), 2, 'drawPoints draws one circle per point');
});

// --- Additions for the workspace and leader/follower sims -----------------------------------------
check('ringForElbowLimit: the workspace is a ring and an elbow limit only raises the inner radius', () => {
  const full = RobotArm.ringForElbowLimit(10, 15, [-180, 180]);
  assert(near(full.rMin, 5, 1e-6) && near(full.rMax, 25, 1e-6));
  const lim = RobotArm.ringForElbowLimit(10, 15, [0, 90]);
  assert(near(lim.rMax, 25, 1e-6) && near(lim.rMin, 18.03, 0.01), 'rMin ' + lim.rMin);
  const pos = RobotArm.ringForElbowLimit(10, 15, [30, 90]);
  assert(pos.rMax < 25 && near(pos.rMin, 18.03, 0.01), 'a limit that excludes straight lowers rMax');
});

check('ringForElbowLimit agrees with ik2 on the seven chapter problems', () => {
  problems.forEach(p => {
    const ring = RobotArm.ringForElbowLimit(10, 15, [p[2], p[3]]);
    const r = Math.hypot(p[0], p[1]);
    const inRing = r >= ring.rMin - 1e-6 && r <= ring.rMax + 1e-6;
    assert.strictEqual(inRing, p[4], 'problem ' + p);
  });
});

check('nearestPose2: a reachable target is hit exactly, by an in-limit elbow', () => {
  const n = RobotArm.nearestPose2(10, 15, 20, 10, [0, 90]);
  assert(n.reachable && n.kind === 'on target' && near(n.miss, 0, 1e-6));
  assert(near(n.theta2, 54.3, 0.05) && near(n.tip.x, 20, 1e-6) && near(n.tip.y, 10, 1e-6));
});

check('nearestPose2: beyond reach stretches straight at the target and falls 5 cm short', () => {
  const n = RobotArm.nearestPose2(10, 15, 30, 0);
  assert(!n.reachable && n.kind === 'short' && near(n.theta2, 0) && near(n.miss, 5, 1e-6));
  assert(near(n.tip.x, 25, 1e-6) && near(n.tip.y, 0, 1e-6));
});

check('nearestPose2: inside the hole folds fully and ends past the target', () => {
  const n = RobotArm.nearestPose2(10, 15, 3, 2);
  assert(!n.reachable && n.kind === 'past' && near(Math.abs(n.theta2), 180, 0.6));
  assert(near(Math.hypot(n.tip.x, n.tip.y), 5, 0.01) && near(n.miss, Math.hypot(3, 2) - 5 > 0 ? Math.hypot(3, 2) - 5 : 5 - Math.hypot(3, 2), 0.01));
});

check('nearestPose2: an elbow limit leaves the tip short of a near target (chapter problem 7)', () => {
  const n = RobotArm.nearestPose2(10, 15, 7, 0, [0, 90]);
  assert(!n.reachable && n.kind === 'past' && near(n.theta2, 90, 0.6));
  assert(near(Math.hypot(n.tip.x, n.tip.y), 18.03, 0.01));
});

check('fixedView: the scale does not depend on the arm', () => {
  const rect = { x: 0, y: 0, w: 400, h: 300 };
  const v = RobotArm.fixedView(rect, 30, { pad: 10 });
  assert(near(v.scale, (150 - 10) / 30, 1e-9) && near(v.ox, 200, 1e-9) && near(v.oy, 150, 1e-9));
  const left = RobotArm.fixedView(rect, 30, { pad: 10, originAt: 'left' });
  assert(near(left.ox, 10, 1e-9));
});

check('drawDial, drawBar, drawTarget and drawGrid make the p5 calls they should', () => {
  reset();
  RobotArm.drawDial({ cx: 100, cy: 100, r: 40, angle: 30, zero: 'up', min: -110, max: 110, markAngle: 20, title: 'Pan', valueText: '30' });
  assert(count('circle') >= 2 && count('line') >= 4 && count('endShape') === 1 && count('text') === 2, 'dial calls');
  reset();
  RobotArm.drawBar({ x: 10, y: 10, w: 200, h: 14, value: 60, min: 0, max: 100, limitMin: 0, limitMax: 100, title: 'Gripper', valueText: '60' });
  assert(count('rect') === 2 && count('text') === 2, 'bar calls');
  reset();
  const view = RobotArm.fixedView({ x: 0, y: 0, w: 400, h: 300 }, 30);
  RobotArm.drawTarget(view, { x: 20, y: 10 }, 'Target');
  assert(count('circle') === 1 && count('line') === 2 && count('text') === 1, 'target calls');
  reset();
  RobotArm.drawGrid(view, 10, 30);
  assert.strictEqual(count('line'), 14);
});

console.log('\n' + n + ' checks passed');
