---
title: "Accuracy and Repeatability Targets"
description: "The learner will classify four sets of landing points as accurate or not and repeatable or not, using a stated distance threshold, with at least 3 of 4 sets classified correctly on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Accuracy and Repeatability Targets



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md).

```text
Type: microsim
**sim-id:** accuracy-repeatability-targets<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify four sets of landing points as accurate or not and repeatable or not, using a stated distance threshold, with at least 3 of 4 sets classified correctly on the first attempt.

**Prerequisites:** accuracy, repeatability, landing point, offset from the target (all defined in the sections "Repeatability" and "Accuracy" above this block).

**Evidence of Mastery:** For each of four sets of five landing points, the learner commits one of four labels. A label is correct when it matches the Correct label column in Content. Mastery is 3 of 4 correct on the first attempt. Reading the numbers, and seeing the measured values after an answer, is exploration, not evidence.

**Misconceptions:** (1) A repeatable arm is also an accurate one. (Repeatability measures the cluster's width, and accuracy measures where it sits.) (2) If the average is on target the arm is precise. (An arm can be centered on average and scattered.) (3) Accuracy and repeatability are two names for the same spec.

**Instructional Rationale:** Understand-level classification means placing an example into the right category and giving a reason. Showing the five points on a target next to their offsets, then asking for a two-part decision (centered? tight?), forces the learner to separate the two qualities that everyday speech runs together.

**Content:**

Each set shows five landing points as offsets (x, y) in millimeters from the target at (0, 0), plotted on a target. The data are illustrative, and the sim labels them "illustrative".

| Set | Landing points (x, y) in mm | Mean offset (mm) | Distance of mean from target (mm) | Largest distance from the mean (mm) |
|---|---|---|---|---|
| 1 | (0.1, 0.0), (-0.1, 0.2), (0.2, -0.1), (0.0, 0.1), (-0.2, -0.2) | (0.00, 0.00) | 0.00 | 0.28 |
| 2 | (2.1, 1.0), (1.9, 1.2), (2.2, 0.9), (2.0, 1.1), (1.8, 0.8) | (2.00, 1.00) | 2.24 | 0.28 |
| 3 | (1.8, -1.6), (-1.5, 1.9), (0.4, 2.1), (-2.0, -0.9), (1.3, -1.5) | (0.00, 0.00) | 0.00 | 2.42 |
| 4 | (3.8, -2.6), (0.5, 0.9), (2.4, 1.1), (0.0, -1.9), (3.3, -2.5) | (2.00, -1.00) | 2.24 | 2.42 |

The four labels the learner chooses from: "Accurate and repeatable", "Repeatable, not accurate", "Accurate on average, not repeatable", "Neither".

| Set | Correct label | Why (shown as feedback) |
|---|---|---|
| 1 | Accurate and repeatable | The mean is 0.00 mm from the target (<= 0.5) and no point is more than 0.28 mm from the mean (<= 0.5). |
| 2 | Repeatable, not accurate | The points are tightly grouped (0.28 mm), but the group sits 2.24 mm from the target. |
| 3 | Accurate on average, not repeatable | The mean is on the target, but the points are spread up to 2.42 mm from the mean. |
| 4 | Neither | The group is 2.24 mm from the target and spread up to 2.42 mm. |

**Provenance:** The point sets are illustrative values written for this sim. Set 2 is the same data as the worked example in the chapter section "Repeatability". The means and distances were computed from the points and rounded to two decimals.

**Rules:** For a set, the mean offset is the average of the five x values and the average of the five y values. Accurate means the distance from the target to the mean offset is <= 0.5 mm. Repeatable means the largest distance from any point to the mean offset is <= 0.5 mm. The 0.5 mm threshold is a teaching value and the sim says so. There are no adjustable quantities.

**Learner Activity:**

1. The learner sees set 1 as a table of five offsets and as five dots on a target, with a mark for the target center.
2. The learner chooses one of the four labels and commits.
3. The sim shows the correct label, marks the mean point on the target, draws a circle that contains the points around the mean, and shows the numbers from the table above and the Why text.
4. The sim presents the next set. After set 4 it shows the score and all four sets side by side.

**Feedback:** Four sets, fixed order, one attempt each. Correct: "Correct: <label>. <Why>". Incorrect: "Not quite. This set is <label>. <Why>". The correct label is revealed after each commitment. A running count "Correct: n of 4" is shown, and the final screen says whether mastery (3 of 4) was reached.

**Starting State:** Set 1 is shown with the question "Is this arm accurate, repeatable, both, or neither?" and the definitions of accuracy and repeatability in view.

**Chapter Anchors:** The chapter's worked example for repeatability is set 2 with its five points, a mean of (2.00, 1.00) mm, a distance of 2.24 mm from the target, and a spread of 0.28 mm. The chapter's four-box table matches the four labels. Mastery is 3 of 4.
```

## Related Resources

- [Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md)
