---
title: "Transform Chain Calculator"
description: "The learner will calculate the tip position of a flat two-link arm from its joint angles using the forward kinematics equations, to within 0.001 m, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Transform Chain Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 12: Kinematics: Where Is the Hand and How Do I Get There](../../chapters/12-kinematics/index.md).

```text
Type: microsim
**sim-id:** transform-chain-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the tip position of a flat two-link arm from its joint angles using the forward kinematics equations, to within 0.001 m, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** sine and cosine, vector, two-link arm, link lengths, forward kinematics (all defined in the sections above this block).

**Evidence of Mastery:** For each of six problems the learner types one coordinate of the tip in metres and commits. An answer is correct when it is within 0.001 m of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Moving the arm's joints in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The second link points at the angle theta2 alone. (It points at theta1 plus theta2.) (2) Angles can be typed in degrees into sine and cosine. (They must be converted to radians first, in code.) (3) The tip position is the sum of the two angles. (It is the sum of two vectors.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. Showing the two links as vectors that add makes the formula's structure visible.

**Content:**

Explore mode shows a flat two-link arm with both links 0.10 m long, and two angles the learner can change. It shows the two link vectors adding up to the tip position, with x forward and z up.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| theta1 | -90 | 180 | 5 | 30 | degrees |
| theta2 | -150 | 150 | 5 | 60 | degrees |

Formulas: x = l1 cos(theta1) + l2 cos(theta1 + theta2) and z = l1 sin(theta1) + l2 sin(theta1 + theta2), with l1 = l2 = 0.10 m. Six problems in this fixed order:

| # | Problem | Asked | Correct (m) | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | theta1 = 0 degrees, theta2 = 0 degrees | x | 0.200 | Both links point forward: 0.1 + 0.1 = 0.200 m. |
| 2 | theta1 = 90 degrees, theta2 = 0 degrees | z | 0.200 | Both links point up: 0.1 + 0.1 = 0.200 m. |
| 3 | theta1 = 0 degrees, theta2 = 90 degrees | z | 0.100 | The first link is flat and the second points up: z = 0.1 sin 90 = 0.100 m. |
| 4 | theta1 = 45 degrees, theta2 = -90 degrees | x | 0.141 | The second link points at -45 degrees: x = 0.1 cos 45 + 0.1 cos(-45) = 0.141 m. |
| 5 | theta1 = 30 degrees, theta2 = 60 degrees | x | 0.087 | x = 0.1 cos 30 + 0.1 cos 90 = 0.0866 m. |
| 6 | theta1 = 60 degrees, theta2 = -60 degrees | z | 0.087 | z = 0.1 sin 60 + 0.1 sin 0 = 0.0866 m. |

**Provenance:** The formulas are from the chapter section "Forward Kinematics". The problems are illustrative values written for this sim, and problems 1 to 4 and the angles 30 and 60 appear in the chapter and the lab.

**Rules:** x and z are computed from the formulas, in metres, with the angles converted to radians. An answer is correct when |typed - correct| <= 0.001.

**Learner Activity:**

1. In Explore mode the learner changes theta1 and theta2 and watches the two link vectors and the tip position. The learner should notice that changing theta1 turns the whole arm, and changing theta2 turns only the second link.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> m. <Why>". Incorrect: "Not quite. The answer is <value> m. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with theta1 = 30 and theta2 = 60, showing the tip at x = 0.087 m and z = 0.150 m.

**Chapter Anchors:** The chapter's worked example is theta1 = 30 and theta2 = 60 with both links 0.10 m, which gives x = 0.0866 and z = 0.150 m. The formulas are x = l1 cos theta1 + l2 cos(theta1 + theta2) and z = l1 sin theta1 + l2 sin(theta1 + theta2). The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 12: Kinematics: Where Is the Hand and How Do I Get There](../../chapters/12-kinematics/index.md)
