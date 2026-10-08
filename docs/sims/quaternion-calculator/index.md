---
title: "Quaternion Calculator"
description: "The learner will calculate quaternion components, turn angles and SLERP angles from given rotations, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Quaternion Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md).

```text
Type: microsim
**sim-id:** quaternion-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate quaternion components, turn angles and SLERP angles from given rotations, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** quaternion, unit quaternion, axis and angle, SLERP, dot product (all defined in the section "Rotations in Four Forms" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the axis and angle in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The w of a quaternion is the cosine of the full angle. (It is the cosine of half the angle.) (2) SLERP at one quarter of the way is a quarter of the numbers. (It is a quarter of the angle.) (3) The angle between two rotations is the arccosine of the dot product. (It is twice that.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a few formulas on new numbers with an immediate check. The half angle is the step that most learners miss, so each formula appears in at least one problem.

**Content:**

Explore mode shows two sliders, for the axis (about x, y or z) and the angle, and the resulting quaternion. Formulas: q = (cos(angle / 2), sin(angle / 2) x axis); angle = 2 x arccos(w); w = the square root of (1 - x^2 - y^2 - z^2) for a unit quaternion; SLERP at fraction t between no turn and a turn of A degrees is a turn of t x A degrees; the angle between two rotations whose quaternions have dot product d is 2 x arccos(d).

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Angle | 0 | 180 | 5 | 90 | degrees |
| Axis | x | z | one of three | z | none |

Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | What is w of the unit quaternion for a 60 degree turn about the x axis? (Answer as w x 100.) | w x 100 | 86.6 | w = cos(30 degrees) = 0.866, and 0.866 x 100 = 86.6. |
| 2 | A unit quaternion has w = 0.5. What angle does it turn? | degrees | 120.0 | angle = 2 x arccos(0.5) = 2 x 60 = 120 degrees. |
| 3 | A unit quaternion has x = 0.6 and y = z = 0. What is w? (Answer as w x 100, positive w.) | w x 100 | 80.0 | w = the square root of (1 - 0.36) = 0.8, and 0.8 x 100 = 80.0. |
| 4 | SLERP from no turn to a 120 degree turn about z, one quarter of the way. What angle has been turned? | degrees | 30.0 | A quarter of 120 degrees is 30 degrees. |
| 5 | SLERP from no turn to a 150 degree turn about z, at t = 0.4. What angle has been turned? | degrees | 60.0 | 0.4 x 150 = 60 degrees. |
| 6 | Two unit quaternions have a dot product of 0.5. What is the angle between the two rotations? | degrees | 120.0 | The angle is 2 x arccos(0.5) = 120 degrees. |

**Provenance:** The formulas are from the chapter section "Rotations in Four Forms" and were checked against SciPy's Rotation in the lab. The problems are illustrative and written for this sim.

**Rules:** w = cos(angle / 2). angle = 2 x arccos(w). w = the square root of (1 - x^2 - y^2 - z^2). SLERP turns an angle that is t times the total. The angle between rotations = 2 x arccos(dot product). An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner changes the axis and the angle and watches the four numbers of the quaternion.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the axis z and an angle of 90 degrees, showing the quaternion 0.7071, 0, 0, 0.7071.

**Chapter Anchors:** The chapter's quaternion is (cos of half the angle, sin of half the angle times the axis), and SLERP from no turn to 120 degrees about z gives 30, 60 and 90 degrees at a quarter, a half and three quarters. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md)
