---
title: "Actuator Type Matcher"
description: "The learner will classify eight descriptions of an actuator as a hobby servo, a serial bus servo or a brushless CAN actuator, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Actuator Type Matcher



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md).

```text
Type: microsim
**sim-id:** actuator-type-matcher<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify eight descriptions of an actuator as a hobby servo, a serial bus servo or a brushless CAN actuator, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** actuator, hobby servo, PWM signal, serial bus servo, STS3215 servo, brushless motor, Damiao actuator, RobStride actuator, position feedback (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight descriptions the learner chooses one of three families and commits. A choice is correct when it matches the Family column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the comparison table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) All servos are controlled by a pulse width. (Only hobby servos are.) (2) A bus servo and a CAN actuator are the same thing. (They use different buses and voltages.) (3) A hobby servo reports its position. (It does not.)

**Instructional Rationale:** An Understand-level classify objective asks the learner to place an example into a category on its features. Using one distinguishing feature per description makes the learner attend to the command method, the feedback, the voltage and the price, which are the properties that separate the three families.

**Content:**

The three families: "Hobby servo", "Serial bus servo", "Brushless CAN actuator". Eight descriptions in this fixed order:

| # | Description | Family | Why (shown as feedback) |
|---|---|---|---|
| 1 | Its command is a pulse of 1.5 ms sent every 20 ms. | Hobby servo | The command is a pulse width, which is the PWM signal of a hobby servo. |
| 2 | Each motor on the three-wire daisy chain has an ID, and the program can read its position, load and temperature. | Serial bus servo | A shared digital bus with IDs and readable registers is a serial bus servo. |
| 3 | It accepts MIT-mode frames with a position, a speed, Kp, Kd and a feed-forward torque. | Brushless CAN actuator | MIT mode is the Damiao actuators' control mode over CAN. |
| 4 | Your program has no way to read how far it has turned. | Hobby servo | The potentiometer feedback stays inside the case. |
| 5 | It is listed at $13.89 each in the SO-ARM100 bill of materials. | Serial bus servo | That is the STS3215 price. |
| 6 | It runs from a 24 V or 48 V supply. | Brushless CAN actuator | The reBot-DevArm's actuators run at 24 V (B601-DM) or 48 V (B601-RS). |
| 7 | It has a 12-bit magnetic encoder and a 1/345 gearbox. | Serial bus servo | Those are the STS3215's encoder and the follower's gear ratio. |
| 8 | It is a low-cost servo with one signal wire and no ID, and the MG995 is an example. | Hobby servo | One signal wire per servo and no address are properties of a hobby servo. |

**Provenance:** The descriptions are written for this sim from the chapter's comparison table and the sections on each family. The $13.89 price is from the SO-ARM100 bill of materials, and the voltages are from the reBot-DevArm repository.

**Rules:** Each description has exactly one correct family. A choice is scored once and cannot be changed after it is committed.

**Learner Activity:**

1. In Explore mode the learner reads the three-column comparison of command, feedback, voltage and cost.
2. The learner switches to the eight descriptions. Description 1 is shown.
3. The learner chooses a family and commits.
4. The sim shows whether the choice was correct, the Why text, and the matching row of the comparison. After description 8 it shows the score.

**Feedback:** Eight descriptions, fixed order, one attempt each. Correct: "Correct: <family>. <Why>". Incorrect: "Not quite. This is a <family>. <Why>". The correct family is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the comparison table of the three families and the prompt "Read the table, then try the descriptions."

**Chapter Anchors:** The chapter's comparison table gives the three families' command, feedback, voltage and cost, and the sim has eight descriptions with mastery at 7 of 8.
```

## Related Resources

- [Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md)
