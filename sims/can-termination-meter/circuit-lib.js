// circuit-lib.js - schematic symbols and animated current flow for the Chapter 3 MicroSims.
// Every function draws with p5.js globals, so call them from draw(). Nothing here keeps state except
// the colors. A copy of this file sits in each sim folder (the same pattern as robot-arm-lib.js).
//
// Current is drawn as the CONVENTIONAL current: dots leave the + terminal of the supply, go around the
// loop and return to the - terminal. Dots are spaced evenly. Their SPEED is proportional to the current,
// so doubling the current doubles how fast the dots move.

const Circuit = (function () {
  const COL = {
    wire: '#2b2b2b',        // wires and symbol outlines
    part: '#ffffff',        // fill inside meters, boxes and the supply
    flow: '#e8590c',        // current dots
    warn: '#c92a2a',        // overheating or blown parts
    dim: '#868e96',         // text that is not the main message
    ok: '#2b8a3e'
  };
  const FLOW_PX_PER_AMP = 16;     // dot speed in pixels per second for each ampere
  const FLOW_MAX_PX = 400;        // safety cap so very large currents do not smear

  // ---- paths and flowing dots -------------------------------------------------------------------
  function makePath(pts, closed) {
    const p = pts.slice();
    if (closed) p.push(pts[0]);
    const cum = [0];
    for (let i = 1; i < p.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    }
    return { pts: p, cum: cum, len: cum[cum.length - 1], closed: !!closed };
  }

  function pointAt(path, s) {
    s = ((s % path.len) + path.len) % path.len;
    let i = 1;
    while (i < path.cum.length - 1 && path.cum[i] < s) i++;
    const seg = path.cum[i] - path.cum[i - 1] || 1;
    const t = (s - path.cum[i - 1]) / seg;
    const a = path.pts[i - 1], b = path.pts[i];
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t };
  }

  // how far the dots slide this frame, in pixels, for a current in amperes
  function advance(phase, amps) {
    const px = Math.min(FLOW_MAX_PX, FLOW_PX_PER_AMP * Math.abs(amps));
    return phase + (px * deltaTime) / 1000;
  }

  // zones is an optional list of circles {x, y, r}; no dot is drawn inside one (meters, boxes)
  function drawFlow(path, phase, spacing, color, zones, radius) {
    if (path.len <= 0) return;
    const n = Math.floor(path.len / spacing);
    noStroke();
    fill(color || COL.flow);
    for (let k = 0; k < n; k++) {
      const p = pointAt(path, phase + k * spacing);
      let hidden = false;
      if (zones) for (const z of zones) if (Math.hypot(p.x - z.x, p.y - z.y) < z.r) hidden = true;
      if (!hidden) circle(p.x, p.y, radius || 9);
    }
  }

  // ---- symbols ----------------------------------------------------------------------------------
  function wire(pts, lw, col) {
    stroke(col || COL.wire); strokeWeight(lw || 3); noFill();
    for (let i = 1; i < pts.length; i++) line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
  }

  function node(x, y) { noStroke(); fill(COL.wire); circle(x, y, 10); }

  // a zigzag resistor from a to b; lead is the length of straight wire kept at each end
  function resistor(a, b, o) {
    o = o || {};
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const lead = o.lead !== undefined ? o.lead : L * 0.22;
    const amp = o.amp || 11, zigs = o.zigs || 6;
    push(); translate(a[0], a[1]); rotate(ang);
    stroke(o.color || COL.wire); strokeWeight(o.lw || 3); noFill();
    beginShape();
    vertex(0, 0); vertex(lead, 0);
    const body = L - 2 * lead;
    for (let i = 0; i < zigs; i++) {
      vertex(lead + body * (i + 0.5) / zigs, (i % 2 === 0 ? -1 : 1) * amp);
    }
    vertex(L - lead, 0); vertex(L, 0);
    endShape();
    pop();
  }

  // a DC supply: circle with + above and - below (vertical) ; r is the radius
  function supply(cx, cy, r) {
    stroke(COL.wire); strokeWeight(3); fill(COL.part); circle(cx, cy, 2 * r);
    noStroke(); fill(COL.wire); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(r * 0.95);
    text('+', cx, cy - r * 0.42); text('−', cx, cy + r * 0.45);
    textStyle(NORMAL);
  }

  function meter(cx, cy, r, letter) {
    stroke(COL.wire); strokeWeight(3); fill(COL.part); circle(cx, cy, 2 * r);
    noStroke(); fill(COL.wire); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(r * 1.05);
    text(letter, cx, cy + 1);
    textStyle(NORMAL);
  }

  // a fuse between a and b: a thin box with a wire through it; blown shows a gap and a spark mark
  function fuse(a, b, blown) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const lead = L * 0.18, h = 22;
    push(); translate(a[0], a[1]); rotate(ang);
    stroke(blown ? COL.warn : COL.wire); strokeWeight(3);
    line(0, 0, lead, 0); line(L - lead, 0, L, 0);
    fill(COL.part); rect(lead, -h / 2, L - 2 * lead, h);
    if (blown) {
      line(lead + 6, 0, L / 2 - 8, 0); line(L / 2 + 8, 0, L - lead - 6, 0);
      line(L / 2 - 6, -7, L / 2 + 6, 7); line(L / 2 - 6, 7, L / 2 + 6, -7);
    } else {
      line(lead + 4, 0, L - lead - 4, 0);
    }
    pop();
  }

  // a normally-closed contact: closed = the blade touches the right contact, open = lifted
  function switchNC(a, b, closed) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const lead = L * 0.22;
    push(); translate(a[0], a[1]); rotate(ang);
    stroke(COL.wire); strokeWeight(3);
    line(0, 0, lead, 0); line(L - lead, 0, L, 0);
    fill(COL.part); circle(lead, 0, 11); circle(L - lead, 0, 11);
    const bx = L - lead;
    if (closed) line(lead, 0, bx, 0);
    else {
      // lifted blade: about 28 degrees above the contacts, the same length as the closed blade
      const span = (L - 2 * lead) * 0.96;
      line(lead, 0, lead + span * Math.cos(0.49), -span * Math.sin(0.49));
    }
    pop();
  }

  function box(x, y, w, h, label, o) {
    o = o || {};
    stroke(o.color || COL.wire); strokeWeight(3); fill(o.fill || COL.part);
    rect(x, y, w, h, 4);
    noStroke(); fill(COL.wire); textAlign(CENTER, CENTER); textSize(o.size || 16);
    textStyle(BOLD); text(label, x + w / 2, y + h / 2); textStyle(NORMAL);
  }

  function ground(x, y) {
    stroke(COL.wire); strokeWeight(3);
    line(x, y, x, y + 10);
    line(x - 14, y + 10, x + 14, y + 10);
    line(x - 9, y + 16, x + 9, y + 16);
    line(x - 4, y + 22, x + 4, y + 22);
  }

  return { COL, makePath, pointAt, advance, drawFlow, wire, node, resistor, supply, meter, fuse, switchNC, box, ground };
})();
