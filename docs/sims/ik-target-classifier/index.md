---
title: "IK Target Classifier"
description: "The learner will differentiate eight targets for a two-link arm (l1 = 0.116 m, l2 = 0.135 m) as having two solutions, one solution, or being unreachable too far or too close, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# IK Target Classifier



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 12: Kinematics: Where Is the Hand and How Do I Get There](../../chapters/12-kinematics/index.md).

```text
Type: microsim
**sim-id:** ik-target-classifier<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight targets for a two-link arm (l1 = 0.116 m, l2 = 0.135 m) as having two solutions, one solution, or being unreachable too far or too close, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** inverse kinematics, geometric inverse kinematics, multiple IK solutions, elbow up and elbow down, unreachable target, workspace ring (all defined in the section "Inverse Kinematics" above this block).

**Evidence of Mastery:** For each of eight targets the learner chooses one of four classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 7 of 8 correct on the first attempt. Dragging the target in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every target inside the outer circle can be reached. (A target too close to the shoulder cannot, when the links differ in length.) (2) Every reachable target has exactly one solution. (Most have two.) (3) The elbow can be placed anywhere. (Its place is fixed by the target and the choice of up or down.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to separate cases by the feature that matters. Here the only feature is the distance from the shoulder, so the learner must compute and compare it to two limits.

**Content:**

The shoulder is at the origin. Explore mode shows the two-link arm, the ring of reachable positions between the inner radius 0.019 m and the outer radius 0.251 m, and a target the learner can drag, with the elbow-up and elbow-down arms drawn when they exist.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Target x | -0.30 | 0.30 | 0.005 | 0.150 | m |
| Target z | -0.30 | 0.30 | 0.005 | 0.100 | m |

The four classes: "Two solutions", "One solution", "Too far to reach", "Too close to reach". Eight targets in this fixed order, with r the distance from the shoulder:

| # | Target (x, z) in m | r (m) | Class | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | (0.150, 0.100) | 0.180 | Two solutions | r is between 0.019 and 0.251, so the elbow can be up or down. |
| 2 | (0.251, 0.000) | 0.251 | One solution | r equals l1 + l2, so the arm is straight and there is one pose. |
| 3 | (0.300, 0.100) | 0.316 | Too far to reach | r is more than l1 + l2 = 0.251 m. |
| 4 | (0.010, 0.010) | 0.014 | Too close to reach | r is less than l2 - l1 = 0.019 m, so the folded arm cannot get that close. |
| 5 | (0.019, 0.000) | 0.019 | One solution | r equals l2 - l1, so the arm is folded back and there is one pose. |
| 6 | (0.000, 0.200) | 0.200 | Two solutions | r is inside the ring, so there are two poses. |
| 7 | (0.200, 0.200) | 0.283 | Too far to reach | r is more than 0.251 m. |
| 8 | (0.050, 0.050) | 0.071 | Two solutions | r is inside the ring, so there are two poses. |

**Provenance:** The link lengths (0.116 m and 0.135 m) are from the SO-101 URDF as described in the chapter section "Link Lengths and the Two-Link Arm". The targets are illustrative values written for this sim.

**Rules:** r = sqrt(x^2 + z^2). Too far: r > l1 + l2 + 0.0005. Too close: r < |l1 - l2| - 0.0005. One solution: r within 0.0005 m of l1 + l2 or of |l1 - l2|. Otherwise two solutions. Distances are in metres.

**Learner Activity:**

1. In Explore mode the learner drags the target and watches the arm. The learner should notice that the arm straightens at the outer circle and folds at the inner one, and that two arms are drawn between them.
2. The learner switches to the eight targets. Target 1 is shown.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After target 8 it shows the score.

**Feedback:** Eight targets, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This target is: <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the target at (0.150, 0.100), showing the elbow-up and elbow-down arms.

**Chapter Anchors:** The chapter states a reach of 0.019 m to 0.251 m for l1 = 0.116 and l2 = 0.135, two solutions for the target (0.15, 0.10) with theta2 of plus and minus 88.5 degrees, and exactly one solution on the boundary. The sim has eight targets and mastery is 7 of 8.
```

## Related Resources

- [Chapter 12: Kinematics: Where Is the Hand and How Do I Get There](../../chapters/12-kinematics/index.md)
