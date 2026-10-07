# robot-arm-lib.js API

All functions live on the global `RobotArm`. Angles are degrees. Model units are arbitrary;
chapters usually call them cm. Screen units are pixels.

## Contents

- Building an arm
- Reading the pose and the parts
- Views and hit-testing
- Drawing
- Reach and workspace helpers
- Presets

## Building an arm

`RobotArm.create(spec)` returns an arm. The chain is joint, link, joint, link, ..., then the effector.

| Field | Meaning |
|-------|---------|
| `name`, `style` | `style` is `'follower'` (default) or `'leader'` and picks the palette |
| `jointRadius` | Size of the round joint caps (default 1.7) |
| `base` | `{ width, height, turntable: { width, height } or null }`. A turntable is drawn between base and shoulder and counts as part of the first joint's group |
| `joints[]` | `{ id, name, angle, min, max, kind, extra }`. Joint 0 is an absolute heading from +x. Later joints bend relative to the link before. `kind: 'roll'` does not bend the side view. `extra: 'roll'` adds a small sleeve to show a roll axis |
| `links[]` | `{ id, name, length, thickness }`. Count is `joints.length` or one fewer |
| `effector` | `{ type, length, opening, thickness, id, name }`. Types: `'none'`, `'tip'`, `'moving-jaw'` (opening in degrees), `'parallel'` (opening is the gap in model units), `'handle'` (a leader arm's hand grip) |

`RobotArm.setAngle(arm, id, deg, { clamp })` sets a joint and returns the angle used. `clamp: true` holds it inside `[min, max]`.

## Reading the pose and the parts

- `RobotArm.pose(arm)` returns `{ joints: [{x, y, heading}], links: [{a, b, heading}], tip: {x, y, heading} }` in model units.
- `RobotArm.parts(arm)` returns the nameable parts from the table to the tool, each `{ id, name, kind, shapes }`. `kind` is `'fixed'`, `'joint'`, `'link'` or `'tool'`. Use it to build quiz lists so the names match the drawing.
- `RobotArm.maxReach(arm)` is the longest the chain and effector can stretch.
- `RobotArm.describeArm(arm)` returns alt text for `describe()`.

## Views and hit-testing

- `RobotArm.fitView(rect, arm, { pad, mode })` returns a view `{ ox, oy, scale, rect }` that fits the arm into `rect = {x, y, w, h}`. `mode: 'pose'` fits the current pose's bounding box so the arm fills the space: use it for labeling pictures where the arm stays near one pose. `mode: 'poses'` with `poses: [{ jointId: angle }, ...]` fits the union of the listed poses: use it when only some joints move, so the arm is as large as it can be and still never leaves the rectangle. `mode: 'forward'` (default) fits the full reach with the base at the left, so the picture keeps its size while the arm moves. `mode: 'full'` centres the shoulder and leaves room all round.
- `RobotArm.fixedView(rect, halfExtent, { originAt, pad })` makes a view with a fixed scale that shows `halfExtent` model units from the centre (or the left edge with `originAt: 'left'`). Use it for a plane the learner reads numbers from, such as a workspace plot, so the scale does not change as the arm or sliders change.
- `RobotArm.toScreen(view, {x, y})` converts a model point to pixels.
- `RobotArm.hitTest(arm, view, sx, sy, marginPx)` returns the id of the part under a screen point, or `null`. Joints beat the tool, the tool beats links, links beat the base. `marginPx` defaults to 6 so thin parts stay clickable. `RobotArm.hitTestModel(arm, p, grow)` does the same in model units.
- `RobotArm.angleToward(arm, jointId, targetModelPoint)` returns the angle that points the joint's link at a model point. Use it to drag a joint with the mouse.

## Drawing

All drawing functions call p5 globals, so call them from `draw()`.

- `RobotArm.draw(arm, view, opts)`. Options: `highlight` (a part id or array of ids, drawn in the highlight colour with the others dimmed), `dimOthers: false` to turn dimming off, `ghost: true` for a grey translucent "target" pose, `alpha` 0 to 255, `showPivots: true`.
- `RobotArm.drawCallouts(arm, view, items, { side, x, xLeft, xRight, size })`. `items` is `[{ id, text }]`. `side: 'right'` or `'left'` stacks every tag in one column at pixel `x`. `side: 'auto'` puts parts left of the average part position in a column at `xLeft` and the rest at `xRight`, which keeps leader lines short and uncrossed. Reserve about 110 px on each side of the arm for the columns. Tags never overlap.
- `RobotArm.anchorOf(arm, view, id)` is the screen point a callout line touches.
- `RobotArm.drawAngleArc(view, centerModel, fromDeg, toDeg, radiusPx, label)`.
- `RobotArm.drawRing(view, centerModel, rMin, rMax)` shades an annulus, with the hole cut as part of one outline.
- `RobotArm.drawTarget(view, pModel, label)` draws a crosshair marker. `RobotArm.drawGrid(view, stepModel, halfExtent)` draws light grid lines.
- `RobotArm.drawDial({ cx, cy, r, angle, zero, min, max, markAngle, title, valueText, color })` draws a round gauge for a rotation a side view cannot show, such as shoulder pan (`zero: 'up'`, a view from above) or wrist roll. `min` and `max` shade an allowed range and `markAngle` adds a second tick, for example the commanded angle before a calibration error. `RobotArm.drawBar({ x, y, w, h, value, min, max, limitMin, limitMax, markValue, title, valueText, color })` is the straight version for values such as a gripper opening.
- `RobotArm.sampleWorkspace(arm, { step })` sweeps every joint through its range and returns tip points. `RobotArm.drawPoints(view, pts, colorStr)` draws them. Use these when joint limits change the reachable region.
- `RobotArm.drawDimension(view, aModel, bModel, label)` and `RobotArm.drawAxes(view, originModel, lengthModel, xLabel, yLabel)`.

## Reach and workspace helpers

`RobotArm.ringForElbowLimit(L1, L2, [min, max])` returns `{ rMin, rMax }`, the ring of distances a flat two-link arm reaches when its shoulder can turn all the way round and its elbow is held in the limit. An elbow limit only raises `rMin`.

`RobotArm.nearestPose2(L1, L2, x, y, [min, max])` returns `{ theta1, theta2, tip, miss, reachable, kind }`, the pose that puts the tip nearest a target. `kind` is `'on target'`, `'short'` or `'past'`. Use it to draw the arm reaching for, or falling short of, a target.

`RobotArm.ik2(L1, L2, x, y, [elbowMin, elbowMax])` solves the flat two-link arm:
`c = (r^2 - L1^2 - L2^2) / (2 L1 L2)`, elbow angle `+/- acos(c)`. It returns
`{ r, c, reachable, solutions: [{ theta1, theta2, withinLimit }], reason }`. `reason` is `'reachable'`,
`'beyond reach'`, `'inside the hole'` or `'blocked by the elbow limit'`. A `c` within 1e-6 of -1 or 1 counts as in range.

## Presets

`presets.twoLink(L1, L2, { shoulder, elbow, elbowMin, elbowMax })`, `presets.sixAxisSchematic()`,
`presets.so101Schematic()`, `presets.rebotSchematic()`, `presets.leaderSchematic()`.
The six-axis presets have the parts `base, shoulder, upper_arm, elbow, forearm, wrist, end_effector`
(`handle` instead of `end_effector` for the leader). Their proportions are schematic, not measured.
