---
title: "Assembly Fault Finder"
description: "The learner will differentiate six causes of SO-ARM101 faults from eight written symptoms, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Assembly Fault Finder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md).

```text
Type: microsim
**sim-id:** assembly-fault-finder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate six causes of SO-ARM101 faults from eight written symptoms, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** servo not found, intermittent wiring, loose gears, jitter, servo overheating, calibration drift, duplicate ID, supply voltage (all defined in the sections above this block and in Chapters 3 and 4).

**Evidence of Mastery:** For each of eight symptoms the learner chooses one of six causes and commits. A choice is correct when it matches the Cause column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the cause list in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A servo that does not answer is broken. (Power, ID and cable faults are more common.) (2) A joint that goes limp is faulty. (A protection may have tripped from heat or overload.) (3) Every fault needs software changes. (Many are mechanical or electrical.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to tell similar-looking cases apart by their evidence. Each symptom carries one distinguishing clue (when the fault appears, or what a measurement read), so the learner must pick out the clue rather than the general topic.

**Content:**

The six causes: "Power: missing or wrong voltage", "Duplicate or wrong ID", "Loose cable or connector", "Loose horn or gear", "Overload or heat", "Calibration out of date". Eight symptoms in this fixed order:

| # | Symptom shown to the learner | Cause | Why (shown as feedback) |
|---|---|---|---|
| 1 | The setup command cannot find the motor at any baud rate, and a multimeter reads 0 V at the board's power input. | Power: missing or wrong voltage | With no supply voltage the servo cannot answer anything. |
| 2 | With all six new servos connected the replies are garbled, but each servo works alone. | Duplicate or wrong ID | New servos all have ID 1, so they answer at the same time and corrupt each other. |
| 3 | "No status packet" errors appear only when the elbow bends and disappear when the arm is straight. | Loose cable or connector | A fault that depends on the pose points to a conductor or plug that moves. |
| 4 | A joint trembles around its goal, and the horn can be wiggled a little on its shaft by hand. | Loose horn or gear | Play at the horn means the controller fights slop, which shows as jitter. |
| 5 | After 20 minutes of holding a load, a joint goes limp and the servo reads 70 °C. | Overload or heat | A servo turns its torque off above 70 °C, so it goes limp when it overheats. |
| 6 | Since a horn was removed and put back, the elbow of the follower is 4 degrees off from the leader. | Calibration out of date | A re-fitted horn changes the angle at the same raw reading, so the arm must be calibrated again. |
| 7 | The follower's gripper is hot and stiff after the leader's trigger was closed fully while the gripper held an object. | Overload or heat | Pushing a gripper against an object keeps the current high, which heats the motor. |
| 8 | A "12 V" adapter reads about 16 V on the multimeter, and the servos will not turn on. | Power: missing or wrong voltage | A supply far above the label puts the servos into protection. |

**Provenance:** Symptoms 5 and 7 draw on the STS3215 data sheet's 70 °C protection and a LeRobot maintainer's comment on a burnt-out gripper. Symptom 8 draws on a user's report in LeRobot issue 3394. The other symptoms are illustrative and written for this sim. The sim labels the set "illustrative".

**Rules:** Each symptom has exactly one correct cause. The six causes are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the six causes, each with a first check.
2. The learner switches to the eight symptoms. Symptom 1 is shown.
3. The learner chooses a cause and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After symptom 8 it shows the score.

**Feedback:** Eight symptoms, fixed order, one attempt each. Correct: "Correct: <cause>. <Why>". Incorrect: "Not quite. The likely cause is <cause>. <Why>". The correct cause is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the six causes listed and the prompt "What is the most likely cause?" ready for the first symptom.

**Chapter Anchors:** The chapter states a 70 °C torque cut-off, a supply of about 16 V from a "12 V" adapter, a 40-step shift of about 3.5 degrees, and the six faults of servo not found, intermittent wiring, loose gears, jitter, servo overheating and calibration drift. The sim has eight symptoms and mastery is 7 of 8.
```

## Related Resources

- [Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md)
