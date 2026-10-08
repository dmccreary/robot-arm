---
title: "Polynomial Order Chooser"
description: "The learner will differentiate eight trajectory requirements as needing a cubic, a quintic or a cubic spline, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Polynomial Order Chooser



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md).

```text
Type: microsim
**sim-id:** polynomial-order-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight trajectory requirements as needing a cubic, a quintic or a cubic spline, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** boundary conditions, cubic polynomial trajectory, quintic polynomial trajectory, via points, cubic spline (all defined in the section "Trajectories" above this block).

**Evidence of Mastery:** For each of eight requirements the learner chooses one of three kinds and commits. A choice is correct when it matches the Kind column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the comparison table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A higher degree is always smoother. (A polynomial only controls the conditions it is given.) (2) One polynomial can pass through any number of via points well. (A chain of cubics in a spline does it without wild swings.) (3) A cubic can keep the acceleration continuous with the last move. (It has no coefficient left for acceleration.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to separate cases that look alike. The deciding fact is how many conditions are specified, and whether there are several via points, so the learner must count conditions and not look at the words.

**Content:**

The three kinds: "Cubic" (four conditions: position and speed at both ends, one move), "Quintic" (six conditions: position, speed and acceleration at both ends, one move), "Cubic spline" (several via points joined with continuous speed and acceleration). Eight requirements in this fixed order:

| # | Requirement | Kind | Why (shown as feedback) |
|---|---|---|---|
| 1 | Move one joint from 0 to 1 radian in 2 seconds, starting and ending at rest. | Cubic | Position and speed at both ends are four conditions, and a cubic has four coefficients. |
| 2 | The same move, but the acceleration must also be zero at both ends. | Quintic | Six conditions need six coefficients. |
| 3 | The move starts while the joint is already turning at 0.5 radians per second, and ends at rest. | Cubic | The start speed is one of the four conditions of a cubic. |
| 4 | The move must continue exactly from the end acceleration of the previous move. | Quintic | Matching an acceleration is a fifth and sixth condition. |
| 5 | The joint must pass through four via points at set times, with a continuous speed and acceleration. | Cubic spline | Several via points joined smoothly are what a spline is for. |
| 6 | A rest-to-rest move where the force must build up gently, with no jump in acceleration at the start. | Quintic | Zero acceleration at the ends is what the quintic can control. |
| 7 | A quick rest-to-rest move where only the position and the speed at the ends matter. | Cubic | Four conditions are enough, and a cubic is the simpler choice. |
| 8 | A path that passes through six via points and ends at rest. | Cubic spline | A chain of cubics avoids the swings of a high-degree polynomial through many points. |

**Provenance:** The kinds and their condition counts follow the chapter section "Trajectories". The requirements are illustrative and written for this sim.

**Rules:** Each requirement has exactly one correct kind. Count the conditions: four means a cubic, six means a quintic, and several via points mean a spline.

**Learner Activity:**

1. In Explore mode the learner reads the three kinds and the number of conditions each controls.
2. The learner switches to the eight requirements. Requirement 1 is shown.
3. The learner chooses a kind and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After requirement 8 it shows the score.

**Feedback:** Eight requirements, fixed order, one attempt each. Correct: "Correct: <kind>. <Why>". Incorrect: "Not quite. This needs a: <kind>. <Why>". The correct kind is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the three kinds listed and the prompt "How many conditions must be met?" ready for the first requirement.

**Chapter Anchors:** The chapter says that a cubic meets four boundary conditions, a quintic six, and that a cubic spline joins cubics through via points with continuous position, speed and acceleration. The sim has eight requirements and mastery is 7 of 8.
```

## Related Resources

- [Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md)
