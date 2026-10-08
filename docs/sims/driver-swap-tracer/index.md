---
title: "Driver Swap Tracer"
description: "The learner will interpret what a call on the Arm interface does underneath for each of three drivers, in six calls, by choosing the correct low-level action, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Driver Swap Tracer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 10: A Python Hardware Library for Robot Arms](../../chapters/10-python-hardware-library/index.md).

```text
Type: microsim
**sim-id:** driver-swap-tracer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** interpret<br/>
**Learning Objective:** The learner will interpret what a call on the Arm interface does underneath for each of three drivers, in six calls, by choosing the correct low-level action, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** class interface, Arm class, hardware abstraction layer, inheritance for drivers, fake arm, unit conversion (all defined in the sections above this block).

**Evidence of Mastery:** For each of six calls the learner chooses one of six low-level actions and commits. A choice is correct when it matches the Action column in Content. Mastery is 5 of 6 correct on the first attempt. Reading the layer table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The same call sends the same bytes on every arm. (Each driver translates it into its own units and messages.) (2) The limit check is done by the driver. (It is done once, in the base class, before the driver is called.) (3) A fake arm does nothing. (It remembers the targets so that a test can look at them.)

**Instructional Rationale:** An Understand-level interpret objective asks the learner to explain what a representation means. Showing one high-level call and asking for its low-level translation makes the learner trace through the layers and unit conversions.

**Content:**

The six actions the learner chooses among: "Stores the values in a dictionary and records the write", "Writes Goal_Position to servo 1 with raw 2106", "Sends an MIT frame to CAN ID 0x01 with a position of about 0.175 rad", "Reads Present_Position from servo 1 and converts raw 2047 to degrees", "Sends an enable frame to CAN ID 0x01 and decodes the position in the reply", "Raises JointLimitError and sends nothing". The calibration of the shoulder pan is range 742 to 3242. Six calls in this fixed order:

| # | Driver | Call | Action | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | FakeArm | move_to a pose with shoulder_pan = 10.0 | Stores the values in a dictionary and records the write | The fake arm has no hardware, so it keeps the values and a log of the writes. |
| 2 | FeetechArm | move_to a pose with shoulder_pan = 10.0 | Writes Goal_Position to servo 1 with raw 2106 | 1992 + 10 x 11.375 = 2105.75, which rounds to 2106. |
| 3 | DamiaoArm | move_to a pose with joint1 = 10.0 | Sends an MIT frame to CAN ID 0x01 with a position of about 0.175 rad | 10 degrees is 0.1745 radians, packed into the 16-bit position field. |
| 4 | FeetechArm | read_pose | Reads Present_Position from servo 1 and converts raw 2047 to degrees | The driver reads the raw steps and converts them: (2047 - 1992) / 11.375 = 4.84 degrees. |
| 5 | DamiaoArm | read_pose | Sends an enable frame to CAN ID 0x01 and decodes the position in the reply | Every reply carries a position, so the driver asks with an enable frame and decodes it. |
| 6 | FeetechArm | move_to a pose with shoulder_pan = 140.0 (limit 110) | Raises JointLimitError and sends nothing | The base class checks the limits first, so no driver code runs. |

**Provenance:** The calls and values are from the chapter sections "Inheritance for Drivers" and "Reading and Writing Positions" and the lab of this chapter. The calibration is the illustrative one of the lab in Chapter 8.

**Rules:** Each call has exactly one correct action. The limit check happens before any driver method. Raw = round(1992 + degrees x 11.375) for the shoulder pan.

**Learner Activity:**

1. In Explore mode the learner reads the layer table and sees the same call, move_to shoulder_pan = 10, traced through the three drivers.
2. The learner switches to the six calls. Call 1 is shown with the driver named.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After call 6 it shows the score.

**Feedback:** Six calls, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. Underneath, this call <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode showing the call move_to shoulder_pan = 10 and the three drivers, with the prompt "Trace the call through each driver."

**Chapter Anchors:** The chapter states that the limit check is in the base class, that the Feetech driver converts 10 degrees to raw 2106 for the shoulder pan of the lab, and that the Damiao driver sends an MIT frame and reads the position from the feedback. The sim has six calls and mastery is 5 of 6.
```

## Related Resources

- [Chapter 10: A Python Hardware Library for Robot Arms](../../chapters/10-python-hardware-library/index.md)
