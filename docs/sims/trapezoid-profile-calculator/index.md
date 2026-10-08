---
title: "Trapezoid Profile Calculator"
description: "The learner will calculate the acceleration time, cruise time, total time and peak speed of a joint move under a trapezoidal velocity profile, for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Trapezoid Profile Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../../chapters/11-moving-the-arm/index.md).

```text
Type: microsim
**sim-id:** trapezoid-profile-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the acceleration time, cruise time, total time and peak speed of a joint move under a trapezoidal velocity profile, for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** trajectory, velocity profile, speed limit, acceleration limit, trapezoidal velocity profile (all defined in the section "Velocity Profiles and the Acceleration Limit" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within the tolerance in the Tolerance column of Content. Mastery is 5 of 6 correct on the first attempt. Changing the distance and limits in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The move always reaches the speed limit. (A short move never does, and its profile is a triangle.) (2) The time is the distance divided by the speed limit. (The speed-up and slow-down add time.) (3) A higher acceleration limit changes the cruise speed. (It only shortens the ramps.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. Including a short move that makes a triangle forces the learner to test the condition before choosing the formula.

**Content:**

Explore mode has three quantities the learner can change, and shows the speed against time as a trapezoid or a triangle, with the four times and the peak speed.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Distance | 5 | 180 | 5 | 90 | degrees |
| Speed limit | 10 | 120 | 10 | 60 | degrees per second |
| Acceleration limit | 20 | 400 | 20 | 120 | degrees per second squared |

Rules for the problems: if D >= v^2 / a the profile is a trapezoid with t_accel = v / a, t_cruise = (D - v x t_accel) / v and T = 2 x t_accel + t_cruise. Otherwise it is a triangle with t_accel = sqrt(D / a), t_cruise = 0, T = 2 x t_accel and a peak speed of a x t_accel. Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Tolerance | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | D = 90 degrees, v = 60 deg/s, a = 120 deg/s^2. What is the total time? | seconds | 2.00 | 0.01 | 90 >= 30, so it is a trapezoid: T = 90 / 60 + 60 / 120 = 2.00 s. |
| 2 | The same move. How long is the speed-up? | seconds | 0.50 | 0.01 | t_accel = 60 / 120 = 0.50 s. |
| 3 | The same move. How long is the cruise? | seconds | 1.00 | 0.01 | t_cruise = (90 - 60 x 0.5) / 60 = 1.00 s. |
| 4 | D = 20 degrees, v = 60 deg/s, a = 120 deg/s^2. What is the total time? | seconds | 0.82 | 0.01 | 20 < 30, so it is a triangle: t_accel = sqrt(20 / 120) = 0.408 s and T = 0.82 s. |
| 5 | The same move. What is the peak speed? | deg/s | 49.0 | 0.1 | The peak is 120 x 0.408 = 49.0 deg/s, below the 60 deg/s limit. |
| 6 | D = 60 degrees, v = 30 deg/s, a = 60 deg/s^2. What is the total time? | seconds | 2.50 | 0.01 | 60 >= 15, so it is a trapezoid: T = 60 / 30 + 30 / 60 = 2.50 s. |

**Provenance:** The formulas are from the chapter section "Velocity Profiles and the Acceleration Limit". The problems are illustrative values written for this sim. Problems 1 to 5 are the chapter's worked examples.

**Rules:** An answer is correct when |typed - correct| <= the tolerance. The explore ranges cover every value in the problems. The sim chooses the trapezoid or the triangle by testing D >= v^2 / a.

**Learner Activity:**

1. In Explore mode the learner changes the distance and the limits and watches the speed graph change between a trapezoid and a triangle. The learner should notice that making the distance shorter turns the trapezoid into a triangle at D = v^2 / a.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with D = 90, v = 60 and a = 120, showing a trapezoid with a total time of 2.00 s.

**Chapter Anchors:** The chapter's worked examples are D = 90 (T = 2.0 s, speed-up 0.5 s, cruise 1.0 s) and D = 20 (T = 0.82 s, peak 49 degrees per second). The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../../chapters/11-moving-the-arm/index.md)
