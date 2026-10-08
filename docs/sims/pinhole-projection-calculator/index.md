---
title: "Pinhole Projection Calculator"
description: "The learner will calculate the pixel position of a point, or the sideways distance of a point from its pixel and depth, using the pinhole camera model with fx = fy = 500 and the principal point (320, 240), for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Pinhole Projection Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md).

```text
Type: microsim
**sim-id:** pinhole-projection-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the pixel position of a point, or the sideways distance of a point from its pixel and depth, using the pinhole camera model with fx = fy = 500 and the principal point (320, 240), for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** camera intrinsics, focal length, principal point, pinhole model, pixel (all defined in the section "Camera Intrinsics and the Pinhole Model" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within the tolerance in the Tolerance column of Content. Mastery is 5 of 6 correct on the first attempt. Moving the point in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A point twice as far away has twice the pixel offset. (It has half the offset, because of the division by depth.) (2) The pixel (0, 0) is the middle of the picture. (The middle is the principal point, at (320, 240) here.) (3) Pixels and metres are the same scale everywhere. (The scale depends on the depth.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. A problem that runs the formula backward from a pixel to a distance shows that depth is needed to recover a position.

**Content:**

Explore mode shows a point in front of a pinhole camera and the pixel where it lands, with X, Y and Z set by the learner.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| X (right of the view axis) | -0.50 | 0.50 | 0.01 | 0.10 | m |
| Y (below the view axis) | -0.50 | 0.50 | 0.01 | 0.05 | m |
| Z (depth, along the view) | 0.10 | 2.00 | 0.01 | 0.50 | m |

Formulas: u = 500 x X / Z + 320 and v = 500 x Y / Z + 240. Six problems in this fixed order:

| # | Problem | Asked | Correct | Tolerance | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | X = 0.10 m, Y = 0.00 m, Z = 0.50 m | u (pixels) | 420 | 1 | u = 500 x 0.10 / 0.50 + 320 = 420. |
| 2 | X = 0.10 m, Y = 0.05 m, Z = 0.50 m | v (pixels) | 290 | 1 | v = 500 x 0.05 / 0.50 + 240 = 290. |
| 3 | X = -0.05 m, Y = 0.00 m, Z = 0.25 m | u (pixels) | 220 | 1 | u = 500 x (-0.05) / 0.25 + 320 = 220. |
| 4 | X = 0.00 m, Y = 0.06 m, Z = 0.30 m | v (pixels) | 340 | 1 | v = 500 x 0.06 / 0.30 + 240 = 340. |
| 5 | X = 0.20 m, Y = 0.00 m, Z = 1.00 m | u (pixels) | 420 | 1 | u = 500 x 0.20 / 1.00 + 320 = 420: a farther point has a smaller offset from the centre. |
| 6 | A point seen at u = 520 at depth Z = 0.50 m. What is X? | X (metres) | 0.200 | 0.001 | X = (u - 320) x Z / 500 = 200 x 0.50 / 500 = 0.200 m. |

**Provenance:** The formula is from the chapter section "Camera Intrinsics and the Pinhole Model". The camera (fx = fy = 500, principal point (320, 240)) is the synthetic camera of the lab. The problems are illustrative and written for this sim.

**Rules:** u = fx X / Z + cx and v = fy Y / Z + cy, with fx = fy = 500, cx = 320 and cy = 240. The inverse is X = (u - cx) Z / fx. An answer is correct when |typed - correct| <= the tolerance.

**Learner Activity:**

1. In Explore mode the learner changes X, Y and Z and watches the pixel move. The learner should notice that doubling Z halves the distance of the pixel from the centre.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with X = 0.10, Y = 0.05 and Z = 0.50, showing the pixel (420, 290).

**Chapter Anchors:** The chapter's worked example is f = 500, centre (320, 240), X = 0.10 m and Z = 0.50 m, which gives u = 420, and the same point at 1.0 m gives u = 370. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md)
