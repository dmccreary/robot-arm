// robot-arm-lib.js  v1.0
// Side-view robot-arm drawing library for p5.js MicroSims.
//
// Copy this file into the sim folder and load it in main.html BEFORE the sketch.
// The file has two layers:
//   1. Pure geometry (no p5 calls): create(), pose(), parts(), hitTest(), ik2(),
//      sampleWorkspace(), fitView(). These run in Node, see robot-arm-lib.test.js.
//   2. p5.js drawing: draw(), drawCallouts(), drawAngleArc(), drawRing(), drawDimension(), drawAxes(),
//      drawPoints(), drawTarget(), drawGrid(), drawDial(), drawBar(). They call p5 globals at run time.
//
// Model space: x forward, y up, origin on the shoulder axis, units are arbitrary
// ("model units", the chapter usually calls them cm). Angles are degrees, counter-
// clockwise positive. Joint 0 is an absolute heading from the +x axis. Every later
// joint is a bend relative to the link before it, and 0 means "straight on".
// Screen space (pixels) is made from model space by a view {ox, oy, scale}.

const RobotArm = (function () {
  'use strict';

  const D2R = Math.PI / 180;
  const R2D = 180 / Math.PI;

  // Orange links and indigo joints match the Servo mascot and are distinguishable
  // for common color-vision deficiencies. Meaning is also carried by shape: joints
  // are round caps, links are long capsules, the base is a flat trapezoid.
  const PALETTE = {
    follower: { link: '#F57C00', linkEdge: '#7A3E00', joint: '#3F51B5', jointEdge: '#1A237E',
                base: '#546E7A', baseEdge: '#263238', tool: '#00897B', toolEdge: '#004D40' },
    leader:   { link: '#26A69A', linkEdge: '#004D40', joint: '#5C6BC0', jointEdge: '#1A237E',
                base: '#78909C', baseEdge: '#263238', tool: '#8D6E63', toolEdge: '#3E2723' },
    highlight: '#FFC107',
    highlightEdge: '#212121',
    ghost: '#9E9E9E',
    text: '#212121',
    ring: 'rgba(63,81,181,0.18)',
    ringEdge: '#3F51B5'
  };

  // ---------------------------------------------------------------------------
  // Layer 1: pure geometry
  // ---------------------------------------------------------------------------

  /**
   * spec = {
   *   name, style: 'follower' | 'leader', jointRadius,
   *   base:  { width, height, turntable: { width, height } | null },
   *   joints: [ { id, name, angle, min, max, kind: 'revolute' | 'roll', extra: 'roll' } ],
   *   links:  [ { id, name, length, thickness } ],   // links.length is joints.length or one less
   *   effector: { type: 'none' | 'tip' | 'moving-jaw' | 'parallel' | 'handle',
   *               length, opening, thickness }
   * }
   * Joint i is followed by link i. The effector hangs from the end of the chain.
   */
  function create(spec) {
    if (!spec.joints || spec.joints.length < 1) throw new Error('RobotArm.create: need at least one joint');
    const links = (spec.links || []).map(l => Object.assign({ thickness: 2.4, name: l.id }, l));
    if (links.length > spec.joints.length || links.length < spec.joints.length - 1) {
      throw new Error('RobotArm.create: links.length must be joints.length or joints.length - 1');
    }
    return {
      name: spec.name || 'Robot arm',
      style: spec.style === 'leader' ? 'leader' : 'follower',
      jointRadius: spec.jointRadius || 1.7,
      base: Object.assign({ width: 9, height: 2.5, turntable: null }, spec.base || {}),
      joints: spec.joints.map(j => Object.assign({ kind: 'revolute', angle: 0, min: -180, max: 180, name: j.id }, j)),
      links: links,
      effector: Object.assign({ id: 'end_effector', name: 'End effector', type: 'none',
                                length: 4, opening: 0, thickness: 1.5 }, spec.effector || {})
    };
  }

  function jointIndex(arm, id) {
    const i = arm.joints.findIndex(j => j.id === id);
    if (i < 0) throw new Error('RobotArm: no joint with id ' + id);
    return i;
  }

  /** Sets a joint angle. With clamp:true the angle is held inside [min, max]. Returns the angle used. */
  function setAngle(arm, id, deg, opts) {
    const j = arm.joints[jointIndex(arm, id)];
    j.angle = (opts && opts.clamp) ? Math.min(j.max, Math.max(j.min, deg)) : deg;
    return j.angle;
  }

  /** Forward kinematics: where each joint, each link and the tip are, in model units. */
  function pose(arm) {
    let p = { x: 0, y: 0 };
    let h = 0;
    const joints = [];
    const links = [];
    arm.joints.forEach((j, i) => {
      if (j.kind !== 'roll') h += j.angle * D2R; // a roll spins about the link axis, so the side view does not change
      joints.push({ x: p.x, y: p.y, heading: h });
      const l = arm.links[i];
      if (l) {
        const q = { x: p.x + l.length * Math.cos(h), y: p.y + l.length * Math.sin(h) };
        links.push({ a: { x: p.x, y: p.y }, b: q, heading: h });
        p = q;
      }
    });
    return { joints: joints, links: links, tip: { x: p.x, y: p.y, heading: h } };
  }

  /** Furthest the effector tip can be from the shoulder axis. */
  function maxReach(arm) {
    const e = arm.effector;
    const eff = (e.type === 'none') ? 0 : e.length;
    return arm.links.reduce((s, l) => s + l.length, 0) + eff;
  }

  // Shapes are in model space: circle {t,x,y,r}, capsule {t,a,b,r}, polygon {t,pts}.
  // Named mk* on purpose: a local function called circle() would hide p5's circle() inside this file.
  function mkCircle(x, y, r) { return { t: 'circle', x: x, y: y, r: r }; }
  function mkCap(a, b, r) { return { t: 'cap', a: a, b: b, r: r }; }
  function mkPoly(pts) { return { t: 'poly', pts: pts }; }

  function effectorShapes(arm, tip) {
    const e = arm.effector;
    const dir = { x: Math.cos(tip.heading), y: Math.sin(tip.heading) };
    const nrm = { x: -dir.y, y: dir.x };
    const at = (s, n) => ({ x: tip.x + dir.x * s + nrm.x * n, y: tip.y + dir.y * s + nrm.y * n });
    const t = e.thickness / 2;
    if (e.type === 'tip') return [mkCircle(tip.x, tip.y, t)];
    if (e.type === 'moving-jaw') {
      const open = e.opening * D2R;
      const jawEnd = { x: Math.cos(tip.heading + open), y: Math.sin(tip.heading + open) };
      return [
        mkCap(at(0, -t * 0.4), at(e.length, -t * 0.4), t * 0.6),
        mkCap({ x: tip.x + nrm.x * t * 0.4, y: tip.y + nrm.y * t * 0.4 },
            { x: tip.x + nrm.x * t * 0.4 + jawEnd.x * e.length, y: tip.y + nrm.y * t * 0.4 + jawEnd.y * e.length }, t * 0.6)
      ];
    }
    if (e.type === 'parallel') {
      const half = e.opening / 2 + t * 0.6;
      return [
        mkCap(at(0, -half), at(0, half), t * 0.7),
        mkCap(at(0, -half), at(e.length, -half), t * 0.6),
        mkCap(at(0, half), at(e.length, half), t * 0.6)
      ];
    }
    if (e.type === 'handle') {
      return [mkCap(at(0, 0), at(e.length, 0), t * 1.1),
              mkCap(at(e.length * 0.45, t * 0.8), at(e.length * 0.8, t * 2.4), t * 0.5)];
    }
    return [];
  }

  /**
   * The nameable parts in order from the table to the tool. Each part has an id,
   * a name, a kind ('fixed' | 'joint' | 'link' | 'tool') and model-space shapes.
   * The same shapes are used for drawing and for hit-testing, so they never disagree.
   */
  function parts(arm) {
    const ps = pose(arm);
    const jr = arm.jointRadius;
    const out = [];

    // base (and the turntable, which belongs to the first joint's group)
    let stackTop = -jr * 0.8;
    const tt = arm.base.turntable;
    let turntable = null;
    if (tt) {
      turntable = mkPoly([[-tt.width / 2, stackTop], [tt.width / 2, stackTop],
                        [tt.width / 2, stackTop - tt.height], [-tt.width / 2, stackTop - tt.height]]);
      stackTop -= tt.height;
    }
    const bw = arm.base.width;
    out.push({ id: 'base', name: 'Base', kind: 'fixed', style: 'base',
      shapes: [mkPoly([[-bw * 0.35, stackTop], [bw * 0.35, stackTop], [bw / 2, stackTop - arm.base.height],
                     [-bw / 2, stackTop - arm.base.height]])] });

    arm.joints.forEach((j, i) => {
      const jp = ps.joints[i];
      const shapes = [mkCircle(jp.x, jp.y, jr)];
      if (i === 0 && turntable) shapes.push(turntable);
      if (j.extra === 'roll') {
        // a short sleeve behind the cap shows a rotation about the link axis, which a side view cannot show as a bend
        const back = { x: jp.x - Math.cos(jp.heading) * jr * 1.1, y: jp.y - Math.sin(jp.heading) * jr * 1.1 };
        shapes.push(mkCap(back, { x: jp.x - Math.cos(jp.heading) * jr * 1.6, y: jp.y - Math.sin(jp.heading) * jr * 1.6 }, jr * 0.5));
      }
      out.push({ id: j.id, name: j.name, kind: 'joint', style: 'joint', jointIndex: i, shapes: shapes });
      const l = arm.links[i];
      if (l) {
        const seg = ps.links[i];
        out.push({ id: l.id, name: l.name, kind: 'link', style: 'link', shapes: [mkCap(seg.a, seg.b, l.thickness / 2)] });
      }
    });

    if (arm.effector.type !== 'none') {
      out.push({ id: arm.effector.id, name: arm.effector.name, kind: 'tool', style: 'tool',
        shapes: effectorShapes(arm, ps.tip) });
    }
    return out;
  }

  function distToSegment(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }

  function pointInPoly(p, pts) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
      if (((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  function inShape(p, s, grow) {
    if (s.t === 'circle') return Math.hypot(p.x - s.x, p.y - s.y) <= s.r + grow;
    if (s.t === 'cap') return distToSegment(p, s.a, s.b) <= s.r + grow;
    return pointInPoly(p, s.pts);
  }

  /**
   * Which part is under a model-space point? Tools and joints win over links, and
   * links win over the base, so a joint cap sitting on a link is easy to pick.
   * grow adds a forgiving margin in model units. Returns a part id or null.
   */
  function hitTestModel(arm, p, grow) {
    const g = grow || 0;
    const order = { joint: 0, tool: 1, link: 2, fixed: 3 };
    const ps = parts(arm).slice().sort((a, b) => order[a.kind] - order[b.kind]);
    for (const part of ps) if (part.shapes.some(s => inShape(p, s, g))) return part.id;
    return null;
  }

  /** Same as hitTestModel for a screen point. A margin of 6 px keeps small parts clickable. */
  function hitTest(arm, view, sx, sy, marginPx) {
    const p = { x: (sx - view.ox) / view.scale, y: (view.oy - sy) / view.scale };
    return hitTestModel(arm, p, (marginPx === undefined ? 6 : marginPx) / view.scale);
  }

  /** Model-space bounding box of everything drawn for the current pose. */
  function poseBounds(arm) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (x, y, r) => { x0 = Math.min(x0, x - r); y0 = Math.min(y0, y - r); x1 = Math.max(x1, x + r); y1 = Math.max(y1, y + r); };
    parts(arm).forEach(part => part.shapes.forEach(s => {
      if (s.t === 'circle') add(s.x, s.y, s.r);
      else if (s.t === 'cap') { add(s.a.x, s.a.y, s.r); add(s.b.x, s.b.y, s.r); }
      else s.pts.forEach(q => add(q[0], q[1], 0));
    }));
    return { x0: x0, y0: y0, x1: x1, y1: y1 };
  }

  /**
   * A view that fits the arm into a screen rectangle {x, y, w, h}.
   * mode 'pose': fit the current pose's bounding box, so the arm fills the rectangle.
   *   Use it for labeling and other pictures where the arm stays near one pose.
   * mode 'poses': fit every pose in opts.poses, an array of { jointId: angle } maps. Use it when only some
   *   joints move, so the arm is as large as it can be and still never leaves the rectangle.
   * mode 'forward' (default): fit the arm's full reach, base at the left, so the picture
   *   does not change size while the arm moves. Use it when the learner moves the arm.
   * mode 'full': like 'forward' but with the shoulder in the middle and reach all round.
   */
  function fitView(rect, arm, opts) {
    const o = Object.assign({ pad: 16, mode: 'forward' }, opts || {});
    let xmin, xmax, ymin, ymax;
    if (o.mode === 'pose' || o.mode === 'poses') {
      let b = poseBounds(arm);
      if (o.mode === 'poses') {
        // the union of the bounding boxes of every pose in o.poses, each a map of joint id to angle
        const saved = arm.joints.map(j => j.angle);
        const boxes = o.poses.map(ps => {
          Object.keys(ps).forEach(id => { arm.joints[jointIndex(arm, id)].angle = ps[id]; });
          return poseBounds(arm);
        });
        arm.joints.forEach((j, i) => { j.angle = saved[i]; });
        b = boxes.reduce((u, q) => ({ x0: Math.min(u.x0, q.x0), y0: Math.min(u.y0, q.y0), x1: Math.max(u.x1, q.x1), y1: Math.max(u.y1, q.y1) }));
      }
      xmin = b.x0; xmax = b.x1; ymin = b.y0; ymax = b.y1;
    } else {
      const reach = maxReach(arm) + arm.jointRadius;
      const tt = arm.base.turntable ? arm.base.turntable.height : 0;
      const depth = arm.jointRadius * 0.8 + tt + arm.base.height;
      xmin = o.mode === 'full' ? -reach : -Math.max(arm.base.width / 2, arm.jointRadius);
      xmax = reach;
      ymin = o.mode === 'full' ? -reach : -depth;
      ymax = reach;
    }
    const scale = Math.min((rect.w - 2 * o.pad) / (xmax - xmin), (rect.h - 2 * o.pad) / (ymax - ymin));
    const usedW = (xmax - xmin) * scale, usedH = (ymax - ymin) * scale;
    const left = rect.x + (rect.w - usedW) / 2;
    const top = rect.y + (rect.h - usedH) / 2;
    return { ox: left - xmin * scale, oy: top + ymax * scale, scale: scale, rect: rect };
  }

  /**
   * Two-link inverse kinematics for the chapter's flat arm: shoulder at the origin,
   * links L1 and L2, elbow angle measured from straight. Returns
   * { r, c, reachable, solutions: [{theta1, theta2, withinLimit}], reason }.
   * c = (r^2 - L1^2 - L2^2) / (2 L1 L2) and theta2 = +/- acos(c).
   * elbowLimit = [min, max] in degrees; reachable needs one solution inside it.
   */
  function ik2(L1, L2, x, y, elbowLimit) {
    const lim = elbowLimit || [-180, 180];
    const r = Math.hypot(x, y);
    const c = (r * r - L1 * L1 - L2 * L2) / (2 * L1 * L2);
    const eps = 1e-6;
    if (c < -1 - eps || c > 1 + eps) {
      return { r: r, c: c, reachable: false, solutions: [],
               reason: r > L1 + L2 ? 'beyond reach' : 'inside the hole' };
    }
    const th2 = Math.acos(Math.max(-1, Math.min(1, c)));
    const cands = th2 === 0 ? [0] : [th2, -th2];
    const solutions = cands.map(t2 => {
      const t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
      const d2 = t2 * R2D;
      return { theta1: t1 * R2D, theta2: d2, withinLimit: d2 >= lim[0] - eps && d2 <= lim[1] + eps };
    });
    const ok = solutions.some(s => s.withinLimit);
    return { r: r, c: c, reachable: ok, solutions: solutions, reason: ok ? 'reachable' : 'blocked by the elbow limit' };
  }

  /** A view with a fixed scale: halfExtent model units fit from the centre of rect to its nearest edge. */
  function fixedView(rect, halfExtent, opts) {
    const o = Object.assign({ originAt: 'center', pad: 8 }, opts || {});
    const scale = (Math.min(rect.w, rect.h) / 2 - o.pad) / halfExtent;
    const ox = o.originAt === 'left' ? rect.x + o.pad : rect.x + rect.w / 2;
    return { ox: ox, oy: rect.y + rect.h / 2, scale: scale, rect: rect };
  }

  /** Distance from the shoulder to the tip of a flat two-link arm with elbow bend theta2 (degrees). */
  function tipDistance2(L1, L2, theta2) {
    return Math.sqrt(Math.max(0, L1 * L1 + L2 * L2 + 2 * L1 * L2 * Math.cos(theta2 * D2R)));
  }

  /**
   * The band of distances a flat two-link arm can reach when the shoulder is free to turn all the way round
   * and the elbow is held inside [min, max] degrees. Returns { rMin, rMax }. Because the shoulder can
   * point anywhere, the workspace is always a ring, and an elbow limit only raises rMin.
   */
  function ringForElbowLimit(L1, L2, elbowLimit) {
    const lim = elbowLimit || [-180, 180];
    const lo = lim[0], hi = lim[1];
    let aMin, aMax; // the smallest and largest |bend| the elbow can make
    if (lo <= 0 && hi >= 0) { aMin = 0; aMax = Math.max(-lo, hi); }
    else if (lo > 0) { aMin = lo; aMax = hi; }
    else { aMin = -hi; aMax = -lo; }
    return { rMin: tipDistance2(L1, L2, aMax), rMax: tipDistance2(L1, L2, aMin) };
  }

  /**
   * The pose that gets the tip as near as possible to a target. When the target is reachable the tip lands
   * on it. Otherwise the elbow goes to the in-limit angle whose tip distance is closest to the target
   * distance, and the shoulder points the arm at the target, so the tip sits on the line to the target.
   * Returns { theta1, theta2, tip, miss, reachable, kind } where kind is 'on target', 'short' (the tip is
   * nearer the shoulder than the target) or 'past' (the tip is beyond the target).
   */
  function nearestPose2(L1, L2, x, y, elbowLimit) {
    const lim = elbowLimit || [-180, 180];
    const r = Math.hypot(x, y);
    const ik = ik2(L1, L2, x, y, lim);
    let theta2;
    if (ik.reachable) {
      const ok = ik.solutions.filter(s => s.withinLimit);
      theta2 = ok.reduce((best, s) => (best === null || s.theta2 > best ? s.theta2 : best), null);
    } else {
      theta2 = lim[0];
      let best = Infinity;
      const cands = [lim[0], lim[1], 0];
      for (let a = lim[0]; a <= lim[1]; a += 0.5) cands.push(a);
      cands.forEach(a => {
        if (a < lim[0] || a > lim[1]) return;
        const d = Math.abs(tipDistance2(L1, L2, a) - r);
        if (d < best - 1e-9) { best = d; theta2 = a; }
      });
    }
    const theta1 = Math.atan2(y, x) * R2D - Math.atan2(L2 * Math.sin(theta2 * D2R), L1 + L2 * Math.cos(theta2 * D2R)) * R2D;
    const rt = tipDistance2(L1, L2, theta2);
    const dir = Math.atan2(y, x);
    const miss = Math.abs(rt - r);
    return { theta1: theta1, theta2: theta2, tip: { x: rt * Math.cos(dir), y: rt * Math.sin(dir) }, miss: miss,
             reachable: ik.reachable, kind: ik.reachable ? 'on target' : (rt < r ? 'short' : 'past') };
  }

  /**
   * Points the tip can reach, by sweeping every joint through its range.
   * opts.step is the sweep step in degrees (default 5). Joints with a fixed
   * range (min === max) are held. Use for shading a workspace with joint limits.
   */
  function sampleWorkspace(arm, opts) {
    const step = (opts && opts.step) || 5;
    const saved = arm.joints.map(j => j.angle);
    const pts = [];
    const sweep = (i) => {
      if (i === arm.joints.length) { const t = pose(arm).tip; pts.push({ x: t.x, y: t.y }); return; }
      const j = arm.joints[i];
      if (j.kind === 'roll') { sweep(i + 1); return; }
      for (let a = j.min; a <= j.max + 1e-9; a += step) { j.angle = a; sweep(i + 1); }
    };
    sweep(0);
    arm.joints.forEach((j, i) => { j.angle = saved[i]; });
    return pts;
  }

  /** The joint angle that makes link i point at a model-space target. Used for dragging a joint. */
  function angleToward(arm, id, target) {
    const i = jointIndex(arm, id);
    const ps = pose(arm);
    const jp = ps.joints[i];
    const want = Math.atan2(target.y - jp.y, target.x - jp.x);
    const parent = jp.heading - (arm.joints[i].kind === 'roll' ? 0 : arm.joints[i].angle * D2R);
    let d = (want - parent) * R2D;
    while (d > 180) d -= 360;
    while (d <= -180) d += 360;
    return d;
  }

  /** A plain-English description for p5's describe(), so the sim has alt text. */
  function describeArm(arm) {
    const names = parts(arm).map(p => p.name.toLowerCase());
    const list = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0];
    const ang = arm.joints.map(j => j.name.toLowerCase() + ' ' + Math.round(j.angle) + ' degrees').join(', ');
    return 'Side-view schematic of a serial robot arm with ' + list + '. Joint angles: ' + ang + '.';
  }

  // ---------------------------------------------------------------------------
  // Layer 2: p5.js drawing
  // ---------------------------------------------------------------------------

  function toScreen(view, p) { return { x: view.ox + p.x * view.scale, y: view.oy - p.y * view.scale }; }

  function partColors(arm, part, opts) {
    const pal = PALETTE[arm.style];
    const f = { link: pal.link, joint: pal.joint, base: pal.base, tool: pal.tool };
    const e = { link: pal.linkEdge, joint: pal.jointEdge, base: pal.baseEdge, tool: pal.toolEdge };
    let fill = f[part.style], edge = e[part.style], edgeW = 2;
    const hl = opts.highlight && [].concat(opts.highlight).indexOf(part.id) >= 0;
    if (hl) { fill = PALETTE.highlight; edge = PALETTE.highlightEdge; edgeW = 4; }
    return { fill: fill, edge: edge, edgeW: edgeW, highlighted: hl,
             dimmed: !!opts.highlight && !hl && opts.dimOthers !== false };
  }

  function drawShape(view, s, col) {
    const k = view.scale;
    if (s.t === 'poly') {
      stroke(col.edge); strokeWeight(col.edgeW); fill(col.fill);
      beginShape();
      s.pts.forEach(p => { const q = toScreen(view, { x: p[0], y: p[1] }); vertex(q.x, q.y); });
      endShape(CLOSE);
    } else if (s.t === 'circle') {
      const c = toScreen(view, s);
      stroke(col.edge); strokeWeight(col.edgeW); fill(col.fill);
      circle(c.x, c.y, 2 * s.r * k);
    } else {
      // a capsule is one thick round-capped line drawn twice: edge colour first, fill colour on top
      const a = toScreen(view, s.a), b = toScreen(view, s.b);
      noFill(); strokeCap(ROUND);
      stroke(col.edge); strokeWeight(2 * s.r * k + 2 * col.edgeW); line(a.x, a.y, b.x, b.y);
      stroke(col.fill); strokeWeight(2 * s.r * k); line(a.x, a.y, b.x, b.y);
    }
  }

  /**
   * Draws the arm. opts:
   *   highlight: part id or array of ids drawn in the highlight colour, others dimmed
   *   ghost: true draws a translucent grey outline (a "target" or "previous" pose)
   *   alpha: 0-255 overall opacity (default 255)
   *   showPivots: true draws a small dot at each joint axis
   */
  function draw(arm, view, opts) {
    const o = opts || {};
    push();
    const drawOrder = { fixed: 0, link: 1, tool: 2, joint: 3 };
    const all = parts(arm).sort((a, b) => drawOrder[a.kind] - drawOrder[b.kind]);
    const alpha = o.alpha === undefined ? 255 : o.alpha;
    all.forEach(part => {
      const col = partColors(arm, part, o);
      if (o.ghost) { col.fill = PALETTE.ghost; col.edge = '#616161'; col.edgeW = 1.5; }
      drawingContext.globalAlpha = (col.dimmed ? 0.35 : 1) * (alpha / 255) * (o.ghost ? 0.55 : 1);
      part.shapes.forEach(s => drawShape(view, s, col));
    });
    drawingContext.globalAlpha = 1;
    if (o.showPivots) {
      const ps = pose(arm);
      noStroke(); fill('white');
      ps.joints.forEach(j => { const c = toScreen(view, j); circle(c.x, c.y, Math.max(4, arm.jointRadius * view.scale * 0.35)); });
    }
    pop();
  }

  /** The screen point where a callout line should touch a part (the middle of its main shape). */
  function anchorOf(arm, view, id) {
    const part = parts(arm).find(p => p.id === id);
    if (!part) return null;
    const s = part.shapes[0];
    const m = s.t === 'cap' ? { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 }
            : s.t === 'circle' ? { x: s.x, y: s.y }
            : { x: s.pts.reduce((a, p) => a + p[0], 0) / s.pts.length, y: s.pts.reduce((a, p) => a + p[1], 0) / s.pts.length };
    return toScreen(view, m);
  }

  /**
   * Name tags with leader lines, stacked in columns so they never overlap.
   * items: [{ id, text }]. opts: { size: text px (min 16), side, x, xLeft, xRight }.
   * side 'right' (default) puts every tag in one column at pixel x. side 'left' does the same on the left.
   * side 'auto' splits the tags by where their parts are: parts left of the average part position
   * go in a column at xLeft and the rest in a column at xRight, which keeps the leader lines short and uncrossed.
   * Tags are ordered by the height of the part they name.
   */
  function drawCallouts(arm, view, items, opts) {
    const o = Object.assign({ side: 'right', size: 16 }, opts || {});
    const gap = Math.max(22, o.size + 6);
    const entries = items.map(it => ({ it: it, a: anchorOf(arm, view, it.id) })).filter(e => e.a);
    let groups;
    if (o.side === 'auto') {
      const mean = entries.reduce((s, e) => s + e.a.x, 0) / (entries.length || 1);
      groups = [{ list: entries.filter(e => e.a.x < mean), x: o.xLeft, side: 'left' },
                { list: entries.filter(e => e.a.x >= mean), x: o.xRight, side: 'right' }];
    } else {
      groups = [{ list: entries, x: o.x, side: o.side }];
    }
    push();
    textSize(o.size);
    groups.forEach(g => {
      const list = g.list.slice().sort((p, q) => p.a.y - q.a.y);
      let y = -Infinity;
      list.forEach(e => { y = Math.max(y + gap, e.a.y); e.ly = y; });
      const over = list.length ? list[list.length - 1].ly - (view.rect.y + view.rect.h - 12) : 0;
      if (over > 0) list.forEach(e => { e.ly -= over; });
      textAlign(g.side === 'right' ? LEFT : RIGHT, CENTER);
      list.forEach(e => {
        stroke('#616161'); strokeWeight(1); line(e.a.x, e.a.y, g.x, e.ly);
        fill('white'); circle(e.a.x, e.a.y, 6);
        noStroke(); fill(PALETTE.text); text(e.it.text, g.x + (g.side === 'right' ? 6 : -6), e.ly);
      });
    });
    pop();
  }

  /** A pie-shaped angle marker at a screen point, from one model angle to another, with a label. */
  function drawAngleArc(view, centerModel, fromDeg, toDeg, radiusPx, label) {
    const c = toScreen(view, centerModel);
    const n = Math.max(6, Math.ceil(Math.abs(toDeg - fromDeg) / 4));
    push();
    stroke('#B71C1C'); strokeWeight(2); fill('rgba(183,28,28,0.15)');
    beginShape();
    vertex(c.x, c.y);
    for (let i = 0; i <= n; i++) {
      const a = (fromDeg + (toDeg - fromDeg) * i / n) * D2R;
      vertex(c.x + radiusPx * Math.cos(a), c.y - radiusPx * Math.sin(a));
    }
    endShape(CLOSE);
    if (label) {
      const mid = (fromDeg + toDeg) / 2 * D2R;
      noStroke(); fill('#B71C1C'); textSize(16); textAlign(CENTER, CENTER);
      text(label, c.x + (radiusPx + 18) * Math.cos(mid), c.y - (radiusPx + 18) * Math.sin(mid));
    }
    pop();
  }

  /**
   * The ring a two-link arm can reach: shaded between rMin and rMax model units around a centre.
   * It is one closed outline (the outer circle, a zero-width bridge, then the inner circle the other
   * way round) instead of a contour, because p5's contour support does not cut the hole reliably.
   */
  function drawRing(view, centerModel, rMin, rMax) {
    const c = toScreen(view, centerModel);
    const n = 120;
    const pt = (r, i) => { const a = (i / n) * 2 * Math.PI; return [c.x + r * view.scale * Math.cos(a), c.y - r * view.scale * Math.sin(a)]; };
    push();
    fill(PALETTE.ring); stroke(PALETTE.ringEdge); strokeWeight(1.5);
    beginShape();
    for (let i = 0; i <= n; i++) { const q = pt(rMax, i); vertex(q[0], q[1]); }
    if (rMin > 0.001) {
      for (let i = n; i >= 0; i--) { const q = pt(rMin, i); vertex(q[0], q[1]); }
    }
    endShape(CLOSE);
    pop();
  }

  /** Dots for a sampled workspace (see sampleWorkspace). */
  function drawPoints(view, pts, colorStr) {
    push();
    noStroke(); fill(colorStr || 'rgba(63,81,181,0.35)');
    pts.forEach(p => { const q = toScreen(view, p); circle(q.x, q.y, Math.max(3, view.scale * 0.5)); });
    pop();
  }

  /**
   * A dashed length marker between two model points with a text label. offsetPx moves the label sideways off
   * the line (to the lower side, or the right for a vertical line) so a short line does not hide under its own label.
   */
  function drawDimension(view, aModel, bModel, label, offsetPx) {
    const a = toScreen(view, aModel), b = toScreen(view, bModel);
    push();
    stroke('#455A64'); strokeWeight(1.5); drawingContext.setLineDash([5, 4]);
    line(a.x, a.y, b.x, b.y);
    drawingContext.setLineDash([]);
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    let nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
    if (ny < -1e-9 || (Math.abs(ny) < 1e-9 && nx < 0)) { nx = -nx; ny = -ny; }
    const off = offsetPx || 0;
    noStroke(); fill('white'); rectMode(CENTER);
    textSize(16);
    const mx = (a.x + b.x) / 2 + nx * off, my = (a.y + b.y) / 2 + ny * off;
    rect(mx, my, textWidth(label) + 8, 20, 4);
    fill(PALETTE.text); textAlign(CENTER, CENTER); text(label, mx, my);
    pop();
  }

  /** x and y axes with arrowheads at a model point. Labels are the full words the book uses. */
  function drawAxes(view, originModel, lengthModel, xLabel, yLabel) {
    const o = toScreen(view, originModel);
    const L = lengthModel * view.scale;
    const head = (x, y, ang) => {
      line(x, y, x - 8 * Math.cos(ang - 0.4), y - 8 * Math.sin(ang - 0.4));
      line(x, y, x - 8 * Math.cos(ang + 0.4), y - 8 * Math.sin(ang + 0.4));
    };
    push();
    stroke('#37474F'); strokeWeight(2);
    line(o.x, o.y, o.x + L, o.y); head(o.x + L, o.y, 0);
    line(o.x, o.y, o.x, o.y - L); head(o.x, o.y - L, -Math.PI / 2);
    noStroke(); fill(PALETTE.text); textSize(16);
    textAlign(LEFT, CENTER); text(xLabel || 'x (forward)', o.x + L + 6, o.y);
    textAlign(CENTER, BOTTOM); text(yLabel || 'y (up)', o.x, o.y - L - 4);
    pop();
  }

  /** A crosshair marker for a target at a model point, with an optional label beside it. */
  function drawTarget(view, pModel, label) {
    const c = toScreen(view, pModel);
    push();
    stroke('#B71C1C'); strokeWeight(3); noFill();
    circle(c.x, c.y, 18);
    line(c.x - 14, c.y, c.x + 14, c.y); line(c.x, c.y - 14, c.x, c.y + 14);
    if (label) { noStroke(); fill('#B71C1C'); textSize(16); textAlign(LEFT, BOTTOM); text(label, c.x + 12, c.y - 10); }
    pop();
  }

  /** Light grid lines every stepModel units out to halfExtent, so distances can be judged by eye. */
  function drawGrid(view, stepModel, halfExtent) {
    const o = toScreen(view, { x: 0, y: 0 });
    push();
    stroke('rgba(0,0,0,0.08)'); strokeWeight(1);
    for (let v = -halfExtent; v <= halfExtent + 1e-9; v += stepModel) {
      const s = v * view.scale;
      line(o.x + s, o.y - halfExtent * view.scale, o.x + s, o.y + halfExtent * view.scale);
      line(o.x - halfExtent * view.scale, o.y + s, o.x + halfExtent * view.scale, o.y + s);
    }
    pop();
  }

  /**
   * A round gauge for a rotation a side view cannot show, such as shoulder pan (seen from above) or wrist roll.
   * opts: { cx, cy, r (px), angle (needle, degrees counter-clockwise from zero), zero: 'right' | 'up',
   *         min, max (shaded allowed range, optional), markAngle (a second tick, optional),
   *         title, valueText, color }.
   * Zero is the reference direction: 'right' for a bend measured from straight, 'up' for forward on a top view.
   */
  function drawDial(o) {
    const zeroDeg = o.zero === 'up' ? 90 : 0;
    const dir = (deg) => { const a = (zeroDeg + deg) * D2R; return { x: Math.cos(a), y: -Math.sin(a) }; };
    push();
    stroke('#455A64'); strokeWeight(2); fill('white');
    circle(o.cx, o.cy, 2 * o.r);
    if (o.min !== undefined && o.max !== undefined && o.max > o.min) {
      noStroke(); fill('rgba(0,137,123,0.25)');
      beginShape();
      vertex(o.cx, o.cy);
      const n = Math.max(6, Math.ceil((o.max - o.min) / 4));
      for (let i = 0; i <= n; i++) { const d = dir(o.min + (o.max - o.min) * i / n); vertex(o.cx + d.x * o.r, o.cy + d.y * o.r); }
      endShape(CLOSE);
      stroke('#004D40'); strokeWeight(2);
      [o.min, o.max].forEach(a => { const d = dir(a); line(o.cx + d.x * o.r * 0.78, o.cy + d.y * o.r * 0.78, o.cx + d.x * o.r, o.cy + d.y * o.r); });
    }
    const z = dir(0);
    stroke('#90A4AE'); strokeWeight(2); line(o.cx, o.cy, o.cx + z.x * o.r, o.cy + z.y * o.r);
    if (o.markAngle !== undefined) {
      const m = dir(o.markAngle);
      stroke('#6D4C41'); strokeWeight(2); line(o.cx, o.cy, o.cx + m.x * o.r * 0.92, o.cy + m.y * o.r * 0.92);
      noStroke(); fill('#6D4C41'); circle(o.cx + m.x * o.r * 0.92, o.cy + m.y * o.r * 0.92, 8);
    }
    const nd = dir(o.angle);
    stroke(o.color || PALETTE.follower.joint); strokeWeight(4);
    line(o.cx, o.cy, o.cx + nd.x * o.r * 0.9, o.cy + nd.y * o.r * 0.9);
    noStroke(); fill(o.color || PALETTE.follower.joint); circle(o.cx, o.cy, 10);
    fill(PALETTE.text); textSize(16);
    if (o.title) { textAlign(CENTER, BOTTOM); text(o.title, o.cx, o.cy - o.r - 4); }
    if (o.valueText) { textAlign(CENTER, TOP); text(o.valueText, o.cx, o.cy + o.r + 4); }
    pop();
  }

  /**
   * A straight gauge for a value that is not an angle, such as a gripper opening.
   * opts: { x, y, w, h (px), value, min, max (scale), limitMin, limitMax (shaded allowed range, optional),
   *         markValue (second tick, optional), title, valueText, color }.
   */
  function drawBar(o) {
    const at = (v) => o.x + o.w * (v - o.min) / (o.max - o.min);
    push();
    stroke('#455A64'); strokeWeight(2); fill('white'); rect(o.x, o.y, o.w, o.h, 4);
    if (o.limitMin !== undefined && o.limitMax !== undefined) {
      noStroke(); fill('rgba(0,137,123,0.25)');
      rect(at(o.limitMin), o.y + 1, at(o.limitMax) - at(o.limitMin), o.h - 2);
    }
    if (o.markValue !== undefined) { stroke('#6D4C41'); strokeWeight(2); line(at(o.markValue), o.y - 3, at(o.markValue), o.y + o.h + 3); }
    stroke(o.color || PALETTE.follower.joint); strokeWeight(4); line(at(o.value), o.y - 5, at(o.value), o.y + o.h + 5);
    noStroke(); fill(PALETTE.text); textSize(16);
    if (o.title) { textAlign(CENTER, BOTTOM); text(o.title, o.x + o.w / 2, o.y - 8); }
    if (o.valueText) { textAlign(CENTER, TOP); text(o.valueText, o.x + o.w / 2, o.y + o.h + 8); }
    pop();
  }

  // ---------------------------------------------------------------------------
  // Presets: schematic arms. Proportions are for teaching, NOT measured from a
  // real arm, so a sim must label the picture "schematic". For measured link
  // lengths, pass them in through the overrides.
  // ---------------------------------------------------------------------------
  const presets = {
    // The chapter's flat two-link arm: shoulder at the origin, L1 and L2, elbow from straight.
    twoLink: function (L1, L2, o) {
      o = o || {};
      return create({ name: 'Two-link arm', base: { width: 8, height: 2.5 },
        joints: [{ id: 'shoulder', name: 'Shoulder', angle: o.shoulder === undefined ? 45 : o.shoulder },
                 { id: 'elbow', name: 'Elbow', angle: o.elbow === undefined ? 60 : o.elbow, min: o.elbowMin === undefined ? -180 : o.elbowMin,
                   max: o.elbowMax === undefined ? 180 : o.elbowMax }],
        links: [{ id: 'upper_arm', name: 'Upper arm', length: L1 }, { id: 'forearm', name: 'Forearm', length: L2 }],
        effector: { type: 'tip', thickness: 1.6 }, jointRadius: 1.4 });
    },
    // Seven nameable parts: base, shoulder, upper arm, elbow, forearm, wrist, end effector.
    sixAxisSchematic: function (o) {
      o = o || {};
      return create({ name: 'Six-axis arm (schematic)',
        base: { width: 10, height: 2.2, turntable: { width: 5.5, height: 1.6 } },
        joints: [{ id: 'shoulder', name: 'Shoulder', angle: 70, min: 0, max: 180 },
                 { id: 'elbow', name: 'Elbow', angle: -85, min: -150, max: 150 },
                 { id: 'wrist', name: 'Wrist', angle: 25, min: -110, max: 110, extra: 'roll' }],
        links: [{ id: 'upper_arm', name: 'Upper arm', length: o.upper || 11, thickness: 2.6 },
                { id: 'forearm', name: 'Forearm', length: o.fore || 10, thickness: 2.2 }],
        effector: { type: o.effector || 'moving-jaw', length: 6, opening: o.opening === undefined ? 25 : o.opening, thickness: 2.2 },
        jointRadius: 1.8 });
    },
    // The moving-jaw gripper of the SO-ARM101 follower, schematic.
    so101Schematic: function () { return presets.sixAxisSchematic({ effector: 'moving-jaw' }); },
    // A parallel gripper as on the reBot-DevArm B601, schematic. opening is the gap in model units.
    rebotSchematic: function () { return presets.sixAxisSchematic({ effector: 'parallel', opening: 2.5, upper: 12, fore: 11 }); },
    // A leader arm: same chain, drawn in the leader colours, with a hand handle in place of a gripper.
    leaderSchematic: function () {
      const a = presets.sixAxisSchematic({});
      a.style = 'leader'; a.effector.type = 'handle'; a.effector.name = 'Handle';
      return a;
    }
  };

  return { PALETTE: PALETTE, create: create, setAngle: setAngle, pose: pose, parts: parts, maxReach: maxReach,
    hitTest: hitTest, hitTestModel: hitTestModel, fitView: fitView, toScreen: toScreen,
    ik2: ik2, nearestPose2: nearestPose2, ringForElbowLimit: ringForElbowLimit, tipDistance2: tipDistance2, fixedView: fixedView,
    sampleWorkspace: sampleWorkspace, angleToward: angleToward, describeArm: describeArm,
    draw: draw, drawCallouts: drawCallouts, anchorOf: anchorOf, drawAngleArc: drawAngleArc, drawRing: drawRing,
    drawPoints: drawPoints, drawDimension: drawDimension, drawAxes: drawAxes, drawTarget: drawTarget, drawGrid: drawGrid,
    drawDial: drawDial, drawBar: drawBar, presets: presets };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = RobotArm;
