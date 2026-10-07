# Drawing Conventions for Robot Arm Sims

## Contents

- Coordinates and angles
- Colors and shapes
- Labels
- Honesty about what the picture is
- Out of scope, and how to extend the library

## Coordinates and angles

- Model space: x forward, y up, origin on the shoulder axis. This matches the chapter's two-link
  model and the base frame (x forward, z up) seen from the side.
- Angles are in degrees and counter-clockwise is positive. Joint 0 is a heading measured from +x. Every
  later joint is a bend from "straight on", so 0 means the next link continues in a straight line.
- The side view cannot show a rotation about a vertical axis (shoulder pan) or about the link's own
  axis (wrist roll). The turntable and the roll sleeve are visual cues for them. If the sim must make the
  learner act on pan or roll, add a `drawDial` gauge (zero up, a view from above, for pan) beside the arm and say
  so in the picture's caption or the text. `drawBar` does the same for a gripper opening.
- Real arms choose their own zero and positive direction. When a sim shows angles, print the
  convention it uses ("0 degrees is straight; positive bends upward") so the picture does not teach
  that one convention is universal.

## Colors and shapes

- Links are orange capsules, joints are indigo round caps, the base is a slate trapezoid, the tool is
  teal. A leader arm swaps to a teal-and-brown palette so a pair is distinguishable at a glance.
- Meaning never rests on color alone. Joints are circles, links are long rounded bars, and the highlight is
  a thicker dark outline as well as a gold fill. Do not use red and green as a pair.
- Highlight one thing at a time. The library dims everything else when `highlight` is set, which keeps
  attention on the part being asked about.

## Labels

- Text is 16 px or larger. Use `drawCallouts` for name tags so leader lines never cross text.
- Use the chapter's words exactly (Upper arm, Forearm, End effector). The picture and the prose must
  agree, and quiz feedback should reuse the same names.
- Do not label a part in a sim that asks the learner to identify it. Quiz mode draws the arm bare.
- Axis labels use full words such as "x (forward)", not single letters alone.

## Honesty about what the picture is

- Presets are teaching schematics. Write "schematic" in or near the drawing.
- Do not state real dimensions, payloads or joint counts in the drawing unless the spec supplies them
  with a source. Take them from the chapter text.
- A sim that compares the SO-ARM101 and the reBot-DevArm should draw each arm's real gripper type
  (moving-jaw and parallel) because that is the true visible difference.

## Out of scope, and how to extend the library

Not supported yet: 3D views, top-down views, prismatic joints in the drawn chain, parallel mechanisms,
and photographic overlays. When a spec needs one, extend `robot-arm-lib.js` instead of
drawing it ad hoc in one sim, so every later sim gets it:

1. Add the geometry as shapes in `parts()` so drawing and hit-testing stay in sync.
2. Add a test for it in `robot-arm-lib.test.js`, then run `node robot-arm-lib.test.js`.
3. Document it in `references/api.md`.
4. Existing sims keep their own copy of the library, so they do not change until someone updates them.
