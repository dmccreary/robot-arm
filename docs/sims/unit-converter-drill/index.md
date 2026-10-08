---
title: "Unit Converter Drill"
description: "The learner will calculate conversions between raw servo steps, degrees, radians and percent for a calibrated joint, to within 0.1 degree, 0.001 radian, 1 step or 0.1 percent as asked, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Unit Converter Drill



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 10: A Python Hardware Library for Robot Arms](../../chapters/10-python-hardware-library/index.md).

```text
Type: microsim
**sim-id:** unit-converter-drill<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate conversions between raw servo steps, degrees, radians and percent for a calibrated joint, to within 0.1 degree, 0.001 radian, 1 step or 0.1 percent as asked, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** raw servo units, degrees, radians, calibration range, middle of the range, unit conversion (all defined in the section "Units: Raw, Degrees, and Radians" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within the tolerance in the Tolerance column of Content. Mastery is 5 of 6 correct on the first attempt. Changing the calibration or the raw value in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The same raw number means the same angle on every joint. (It depends on the joint's calibrated range.) (2) Zero degrees is raw 2048. (Zero is the middle of the joint's own range.) (3) A target beyond the range moves the joint beyond it. (The conversion holds it at the end of the range.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a procedure on new numbers with an immediate check. Fixing one calibration for all problems lets the learner see how the same rule gives different answers for different inputs.

**Content:**

Explore mode shows one joint with a calibrated range, and converts a value the learner sets in any one unit into the other three. The formulas are those of the table in the chapter section "Unit Conversion", with 4095 / 360 = 11.375 steps per degree.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| range_min | 0 | 4095 | 1 | 742 | steps |
| range_max | 0 | 4095 | 1 | 3242 | steps |
| Raw value | 0 | 4095 | 1 | 1992 | steps |

The range_max value must be larger than range_min. Six problems in this fixed order. The first five use the shoulder pan of the chapter (range 742 to 3242, middle 1992) and problem 6 uses the gripper (range 1977 to 3397).

| # | Problem | Unit asked | Correct | Tolerance | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | The shoulder pan reads raw 3000. What is the angle? | degrees | 88.6 | 0.1 | (3000 - 1992) / 11.375 = 88.6 degrees. |
| 2 | The shoulder pan is commanded to 45 degrees. What raw value is sent? | steps | 2504 | 1 | 1992 + 45 x 11.375 = 2503.9, which rounds to 2504. |
| 3 | The shoulder pan reads raw 1000. What is the angle? | degrees | -87.2 | 0.1 | (1000 - 1992) / 11.375 = -87.2 degrees. |
| 4 | A Damiao motor reports 0.5 radians. How many degrees is that? | degrees | 28.6 | 0.1 | 0.5 x 180 / pi = 28.65 degrees, which rounds to 28.6 or 28.7 within the tolerance. |
| 5 | A joint is commanded to 30 degrees. How many radians is that? | radians | 0.524 | 0.001 | 30 x pi / 180 = 0.5236 radians. |
| 6 | The gripper (range 1977 to 3397) reads raw 2500. What percent open is it? | percent | 36.8 | 0.1 | (2500 - 1977) / (3397 - 1977) x 100 = 36.8 percent. |

**Provenance:** The calibration of the shoulder pan (742 to 3242) and of the gripper (1977 to 3397) are the results of the lab in Chapter 8, which uses made-up positions, and the sim labels them "illustrative". The formulas are from the chapter section "Unit Conversion". The steps per degree is 4095 / 360, the convention used by LeRobot.

**Rules:** middle = (range_min + range_max) / 2. degrees = (raw - middle) x 360 / 4095. raw = round(middle + degrees x 4095 / 360), limited to range_min through range_max. percent = (raw - range_min) / (range_max - range_min) x 100. radians = degrees x pi / 180. An answer is correct when |typed - correct| <= the tolerance.

**Learner Activity:**

1. In Explore mode the learner sets the range and a value in one unit and reads the other three units. The learner should notice that the middle of the range converts to 0 degrees and 50 percent, whatever the range is.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with range 742 to 3242 and raw 1992, showing 0.0 degrees, 0.000 radians and 50.0 percent.

**Chapter Anchors:** The chapter's worked example is the shoulder pan with range 742 to 3242: raw 3000 is 88.6 degrees, 45 degrees is raw 2504, and 150 degrees is held at raw 3242. The chapter states 4095 / 360 steps per degree, 90 degrees as 1.5708 radians and 0.5 radians as 28.65 degrees. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 10: A Python Hardware Library for Robot Arms](../../chapters/10-python-hardware-library/index.md)
