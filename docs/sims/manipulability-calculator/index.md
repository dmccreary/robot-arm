---
title: "Manipulability Calculator"
description: "The learner will calculate the manipulability of a two-link arm from its link lengths and elbow bend, and compare two poses, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Manipulability Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md).

```text
Type: microsim
**sim-id:** manipulability-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the manipulability of a two-link arm from its link lengths and elbow bend, and compare two poses, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** Jacobian, determinant, manipulability, singular pose, sine (all defined in the section "Velocity, the Jacobian, and Singularities" above this block and in Chapter 12).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Moving the sliders in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Manipulability depends on the shoulder angle. (For a two-link arm it depends only on the elbow bend and the link lengths.) (2) A straight arm is the most manipulable. (It is a singularity, with zero.) (3) Halving the bend halves the manipulability. (It follows the sine, so it falls more slowly at first and then faster.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of one formula on new numbers. The formula w = l1 x l2 x |sin(bend)| is short, so the work is in the sine and the units, and a ratio problem shows how fast w falls near a singularity.

**Content:**

Explore mode shows two sliders for the elbow bend and the shoulder angle, the manipulability w, the condition number, and a small drawing of the ellipse. Link lengths are 0.116 m and 0.135 m unless a problem says otherwise. Answers are in units of 0.001 (that is, w x 1000). Formula: w = l1 x l2 x |sin(bend)|.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Elbow bend | 0 | 180 | 1 | 90 | degrees |
| Shoulder angle | 0 | 180 | 5 | 30 | degrees |

Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | Links of 0.116 m and 0.135 m, elbow bent 90 degrees. What is w? | w x 1000 | 15.7 | w = 0.116 x 0.135 x 1 = 0.01566, so 15.7 in units of 0.001. |
| 2 | The same arm, elbow bent 30 degrees. What is w? | w x 1000 | 7.8 | w = 0.01566 x 0.5 = 0.00783, so 7.8. |
| 3 | The same arm, elbow bent 10 degrees. What is w? | w x 1000 | 2.7 | w = 0.01566 x sin(10 degrees) = 0.01566 x 0.1736 = 0.00272, so 2.7. |
| 4 | The same arm, elbow bent 45 degrees. What is w? | w x 1000 | 11.1 | w = 0.01566 x 0.7071 = 0.01107, so 11.1. |
| 5 | Links of 0.2 m and 0.2 m, elbow bent 60 degrees. What is w? | w x 1000 | 34.6 | w = 0.2 x 0.2 x 0.866 = 0.03464, so 34.6. |
| 6 | How many times smaller is w with the elbow bent 5 degrees than with it bent 90 degrees? | times | 11.5 | w(90) / w(5) = 1 / sin(5 degrees) = 1 / 0.08716 = 11.5. |

**Provenance:** The formula is the chapter's w = l1 x l2 x |sin(bend)|, which the lab checks against the square root of det(J J^T). The link lengths are the SO-101's upper arm and forearm from its URDF. The problems are illustrative and written for this sim.

**Rules:** w = l1 x l2 x |sin(bend)|. Answers are w x 1000, except problem 6, which is a ratio. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner moves the sliders and watches w, the condition number and the ellipse.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the elbow bent 90 degrees and the shoulder at 30 degrees, showing w = 15.7 (x 0.001) and a condition number of 2.8.

**Chapter Anchors:** The chapter's manipulability of the two-link arm is l1 x l2 x |sin(bend)|, equal to 0.01566 for 0.116 m and 0.135 m links at a right angle, and it falls to zero as the arm straightens. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md)
