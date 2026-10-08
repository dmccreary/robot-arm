---
title: "Calibration Range Recorder"
description: "The learner will infer the result of a calibration run from a description of what the builder did in each of its two steps, in six situations, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Calibration Range Recorder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md).

```text
Type: microsim
**sim-id:** calibration-range-recorder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer the result of a calibration run from a description of what the builder did in each of its two steps, in six situations, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** calibration, homing position, homing offset, range of motion limits, calibration file, calibration drift (all defined in the sections above this block).

**Evidence of Mastery:** For each of six situations the learner chooses one of five results and commits before the result is shown. A choice is correct when it matches the Result column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the poses in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The homing position is the arm's resting pose. (It is the middle of each joint's range, a measuring pose.) (2) The calibrated range is the range the servo can physically turn. (It is the range the builder actually moved it through.) (3) A calibration file stays right forever. (A slipped horn makes it wrong.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from causes to effects. Each situation changes one thing in the procedure, so the learner must trace which stored number is affected and what that does to the readings.

**Content:**

Explore mode shows one joint and three quantities the learner can change. It shows the homing offset, the recorded range, the width of the range in degrees, and the reading at the middle pose. The rules for the calculation are given under Rules.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Raw position at the middle pose | 0 | 4095 | 1 | 2105 | steps |
| Raw position at one end of the sweep | 0 | 4095 | 1 | 800 | steps |
| Raw position at the other end of the sweep | 0 | 4095 | 1 | 3300 | steps |

The five results: "The program stops with an error", "The recorded range is too narrow", "The existing file is offered for reuse", "The full range 0 to 4095 is recorded", "The readings are shifted by the slip". Six situations in this fixed order (two of them have the same result):

| # | Situation | Result | Why (shown as feedback) |
|---|---|---|---|
| 1 | In step 2 the builder never moves the elbow flex joint. | The program stops with an error | A joint that did not move has equal smallest and largest values, and the program raises an error. |
| 2 | In step 2 the builder moves the shoulder lift only halfway to each end. | The recorded range is too narrow | The limits are the smallest and largest values seen, so a half sweep records a half range. |
| 3 | The builder runs the calibration for an arm that already has a file under the same id. | The existing file is offered for reuse | The program asks whether to use the file or type c to calibrate again. |
| 4 | The builder does not sweep the wrist roll at all. | The full range 0 to 4095 is recorded | The wrist roll can turn all the way round, so the program sets its range without a sweep. |
| 5 | After calibration, a horn on the shoulder pan slips by 40 steps. | The readings are shifted by the slip | The file still holds the old offset, so the joint reads 40 steps (about 3.5 degrees) away from where the file expects it. |
| 6 | In step 2 the builder opens the gripper only a quarter of the way. | The recorded range is too narrow | Only the positions that were visited are recorded, so the open end of the range is far too low. |

**Provenance:** The behavior of the two steps, the 2047 rule, the error for equal limits, the full range for the wrist roll and the reuse prompt are from the LeRobot source and guide read on 2026-10-07, as described in the chapter section "The Calibration Procedure". The situations and the 40-step slip are illustrative and written for this sim, and the sim labels them "illustrative". The Explore defaults are the made-up positions used in the lab.

**Rules:** homing offset = reading at the middle pose - 2047. Recorded range_min = smallest raw position seen during the sweep - offset, and range_max = largest raw position seen - offset. Width in degrees = (range_max - range_min) x 360 / 4095. The degrees of a drift of s steps = s x 360 / 4095. If the smallest and largest values are equal, calibration stops with an error. The explore values must satisfy that the two sweep ends differ.

**Learner Activity:**

1. In Explore mode the learner changes the middle pose and the two sweep ends and watches the offset, the range and the width in degrees update. The learner should notice that the offset follows the middle pose and not the ends.
2. The learner switches to the six situations. Situation 1 is shown.
3. The learner chooses a result and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 6 it shows the score.

**Feedback:** Six situations, fixed order, one attempt each. Correct: "Correct: <result>. <Why>". Incorrect: "Not quite. The result is <result>. <Why>". The correct result is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with a middle pose of 2105 and sweep ends of 800 and 3300, showing an offset of 58, a recorded range of 742 to 3242 and a width of about 219.8 degrees.

**Chapter Anchors:** The chapter states that the offset is the reading at the middle pose minus 2047, that the limits are the smallest and largest values seen, that the wrist roll is set to 0 to 4095, that a drift of 40 steps is about 3.5 degrees, and that an existing file is offered for reuse. The sim has six situations and mastery is 5 of 6.
```

## Related Resources

- [Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md)
