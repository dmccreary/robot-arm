---
name: robot-arm-drawing
description: Use when a MicroSim, diagram or infographic needs to draw a robot arm, such as labeled parts, joint angles, reach or workspace, or a leader and follower pair.
---

# Robot Arm Drawing

## Overview

Chapters of this book keep asking for pictures of an arm: name its parts, bend its
joints, shade where it can reach, mirror a leader arm onto a follower. Drawing the
arm from scratch each time produces arms that look different from sim to sim and
hit-regions that do not match what is on screen. This skill avoids both by
keeping one drawing library, `assets/robot-arm-lib.js`, that every arm sim copies.

The library draws a **side-view schematic** of a serial arm. One set of shapes
drives both the drawing and the click-testing, so what a learner sees is what a
click selects. You write only the sketch around it: the quiz, the controls, the
feedback. A typical sim is 150 to 250 lines.

Use it for part labeling, joint-angle sliders, reach and workspace pictures, link
lengths, gripper types, and leader/follower pairs. Route elsewhere for 3D arms or
URDF viewers, circuit or wiring pictures (`breadboard-sim-generator`), photographs of the
real hardware, and charts of data (`microsim-generator`).

This skill adds the arm drawing to the normal MicroSim workflow. For control layout,
`main.html`, `index.md` and `metadata.json` rules, follow
`$BK_HOME/skills/microsim-generator/references/p5-guide.md`. The templates in
`assets/` already follow it.

## Step 0: Set paths

```bash
PROJECT=$(python3 -c "
import os, sys
d = os.path.abspath('.')
while d != os.path.dirname(d):
    if os.path.isfile(os.path.join(d, 'mkdocs.yml')): print(d); sys.exit()
    d = os.path.dirname(d)
print('ERROR: mkdocs.yml not found', file=sys.stderr); sys.exit(1)
")
SKILL="$PROJECT/skills/robot-arm-drawing"
```

This skill lives inside the robot-arm book repository because the arm style is specific
to this book. If `$SKILL` is missing, you are in a different project.

## Step 1: Read the specification before drawing

The chapter's `<details>` block says what the learner must do and what the sim must
contain. Pull out four things and keep them in your reply:

1. **The evidence action.** What the learner commits (a click on a part, an angle, a
   Reachable/Not reachable verdict). The drawing exists to make that action possible.
2. **Which parts or quantities the drawing must show,** by the exact names the chapter uses.
3. **What changes when the learner acts,** and what stays fixed.
4. **The numbers the chapter states** (link lengths, limits, angles). Draw these, do not
   re-derive them, so picture and prose agree.

If the spec asks for something the library cannot draw (see
`references/drawing-conventions.md`, "Out of scope"), say so and propose the nearest
side-view picture before building.

## Step 2: Choose the arm

Pick a preset, or build one with `RobotArm.create()`:

| Need | Use |
|------|-----|
| Name the parts, joint-group pictures | `presets.sixAxisSchematic()` |
| Reach, workspace, inverse kinematics | `presets.twoLink(L1, L2)` |
| The SO-ARM101 follower's moving-jaw gripper | `presets.so101Schematic()` |
| The reBot-DevArm's parallel gripper | `presets.rebotSchematic()` |
| A leader arm with a hand handle | `presets.leaderSchematic()` |
| Pan, roll or gripper values beside an arm | `drawDial()` and `drawBar()` |

Two honesty rules, because learners treat a drawing as fact:

- **Label it "schematic".** The preset proportions are for teaching, not measured from either
  arm. Put the word in the drawing. Use real link lengths only when the spec gives them,
  and say where they came from.
- **State the angle convention in the picture** when angles matter: zero position,
  positive direction, unit. The chapter teaches that these differ between arms.

## Step 3: Build the sim

1. Create `docs/sims/<sim-id>/` and copy in `assets/robot-arm-lib.js`. Copying keeps the
   folder self-contained so teachers can paste the sketch into the p5.js editor.
2. Start from `assets/main-template.html`, `assets/index-template.md` and
   `assets/metadata-template.json`. `main.html` must load `robot-arm-lib.js` before the sketch.
   **Frontmatter rule:** in `index.md`, put double quotes around every value that contains a colon, and escape
   any inner double quote as `\"`. Always quote `title` and `description`, because descriptions routinely contain
   colons and a later edit can add one. An unquoted `description: A sim: it does X` is invalid YAML. mkdocs then
   prints the frontmatter at the top of the page and drops its metadata, such as the `status` dot, without
   failing `mkdocs build --strict`. Keys that contain a colon (`og:image`) need no quotes; only values do.
3. In `setup()`, call `updateCanvasSize()` first, parent the canvas to `document.querySelector('main')`,
   create every control, then position them. Use native p5.js controls only, and attach button
   handlers with `mouseClicked`, not `mousePressed`, so Enter and Space work for keyboard users.
4. Each frame: fill the drawing region, then
   `const view = RobotArm.fitView(drawRect, arm, { mode: 'pose' })` and `RobotArm.draw(arm, view, opts)`.
   Use `mode: 'pose'` for labeling pictures so the arm fills the space, and the default mode when the learner
   moves the arm so the picture keeps its size. Recompute the view every frame so it follows window resizes.
5. Call `describe(RobotArm.describeArm(arm))` in `setup()` for alt text.
6. For clicks, use `RobotArm.hitTest(arm, view, mouseX, mouseY)` and compare the returned
   part id with the part being asked about.
7. Keep text at 16 px or larger. Callouts take a column x and stack themselves so
   they cannot overlap.

The full function list is in `references/api.md`. Three working sketches in `assets/examples/` show the
three usual patterns:

- `robot-arm-part-identifier.js`: label parts, click-testing, a quiz, callouts.
- `two-link-workspace-explorer.js`: a fixed-scale plane, a target, the shaded ring, and an explore mode with sliders.
- `leader-follower-mirror.js`: two arms side by side, with dials and a bar for rotations a side view cannot show.

## Step 4: Verify

1. `node $SKILL/assets/robot-arm-lib.test.js` after any change to the library. It checks poses,
   hit-testing, the two-link numbers the chapter states (54.3 and 156.9 degrees), and the drawing calls
   against stubbed p5 functions. In the library, never name a local helper after a p5 function such as
   `circle`, `line` or `rect`: it silently hides the p5 one and the shape is never drawn.
2. `python3 $SKILL/scripts/audit-frontmatter.py` from `$PROJECT`: it enforces the frontmatter rule above on every sim `index.md`.
   It fails on invalid YAML or an unquoted value that contains a colon. Fix what it reports, then rerun it.
3. `mkdocs build --strict` from `$PROJECT`. Never start `mkdocs serve`: the author runs it.
4. Open `main.html` in a browser at a wide size and at about 400 px wide. The author's `mkdocs serve`
   usually serves it at `http://127.0.0.1:8000/robot-arm/sims/<sim-id>/main.html`; a `file://` page
   will not load the scripts. Check that labels do not collide, every part can be clicked, and the picture
   is not clipped at maximum reach. To script clicks, dispatch `PointerEvent`s (p5 2.x ignores plain mouse
   events) and `await redraw()` before reading pixels, because `redraw()` is asynchronous in p5 2.x.
5. Set `status: built` in `index.md`. Never set `approved`: only the author does, after using the controls.
6. Remind the author to save a screenshot as `<sim-id>.png` for the social preview.

## Reference files

- `references/api.md`: every library function, option and preset.
- `references/drawing-conventions.md`: coordinates, angle signs, palette, labeling rules, what is out of scope and how to extend the library.
- `assets/robot-arm-lib.js`, `assets/robot-arm-lib.test.js`: the library and its geometry tests.
