---
title: "Encoder Resolution Reader"
description: "The learner will calculate the step size of an encoder, convert between encoder steps and degrees, and find a speed from two position readings, to within 1 percent, in five problems, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Encoder Resolution Reader



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md).

```text
Type: microsim
**sim-id:** encoder-resolution-reader<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the step size of an encoder, convert between encoder steps and degrees, and find a speed from two position readings, to within 1 percent, in five problems, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** encoder, magnetic encoder, absolute and incremental, resolution, bits, position feedback, velocity feedback (all defined in the sections above this block).

**Evidence of Mastery:** For each of five problems the learner types a number in the unit shown and commits. An answer is correct when it is within 1 percent of the Correct column in Content. Mastery is 4 of 5 correct on the first attempt. Turning the dial and changing the bit count in Explore mode is exploration, not evidence.

**Misconceptions:** (1) More bits means a larger step. (It means a smaller step.) (2) The encoder reports total turns. (This one reports the angle within one turn.) (3) A fine encoder is an accurate joint. (Resolution and accuracy are different.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a conversion on new numbers. A dial that shows the steps appear as the shaft turns, with the step size shrinking as the bit count rises, makes the relation visible before it is calculated.

**Content:**

Explore mode shows a shaft angle dial with an encoder of 8 to 16 bits, and the step number, step size and angle update as the learner turns the shaft. The formulas: step size = 360 / 2^bits; angle = steps / 2^bits × 360; steps = angle / 360 × 2^bits; speed = change in angle / time.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Encoder bits | 8 | 16 | 1 | 12 | bits |
| Shaft angle | 0 | 359.9 | 0.1 | 90 | degrees |

Five problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | How large is one step of a 12-bit encoder? | degrees | 0.0879 | 360 / 4096 = 0.08789 degrees. |
| 2 | How large is one step of a 16-bit encoder? | degrees | 0.00549 | 360 / 65536 = 0.005493 degrees. |
| 3 | A 12-bit encoder reads 3072. What is the angle? | degrees | 270 | 3072 / 4096 × 360 = 270 degrees. |
| 4 | What step number is 45 degrees on a 12-bit encoder? | steps | 512 | 45 / 360 × 4096 = 512. |
| 5 | A 12-bit encoder reads 1000 and then 1100, 0.05 s later. How fast is the joint turning? | degrees per second | 175.8 | 100 steps is 100 / 4096 × 360 = 8.789 degrees, and 8.789 / 0.05 = 175.8 degrees per second. |

**Provenance:** The 12-bit resolution is the STS3215's 4096 steps per turn (LeRobot motor tables). The 16-bit value is the Damiao DM-J4310 listing. The readings in problems 3 to 5 are illustrative.

**Rules:** Step size = 360 / 2^bits. A typed answer is correct when |typed − correct| / correct <= 0.01 in the unit shown. The typed value has minimum 0, maximum 10000, step 0.00001, and no default. Angles wrap: 360 degrees reads as step 0.

**Learner Activity:**

1. In Explore mode the learner turns the shaft and changes the bit count, and watches the step number and the step size. The learner should notice that adding one bit halves the step.
2. The learner switches to the five problems. Problem 1 is shown.
3. The learner types an answer and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 5 it shows the score.

**Feedback:** Five problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. One turn is 2^bits steps, so <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with a 12-bit encoder at 90 degrees, showing step 1024 and a step size of 0.0879 degrees.

**Chapter Anchors:** The chapter states 4096 steps and about 0.088 degrees for a 12-bit encoder, and 65536 steps and about 0.0055 degrees for 16 bits. The sim has five problems and mastery is 4 of 5.
```

## Related Resources

- [Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md)
