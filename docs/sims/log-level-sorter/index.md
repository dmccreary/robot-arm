---
title: "Log Level Sorter"
description: "The learner will classify eight log messages from an arm program into the five log levels DEBUG, INFO, WARNING, ERROR and CRITICAL, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Log Level Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md).

```text
Type: microsim
**sim-id:** log-level-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify eight log messages from an arm program into the five log levels DEBUG, INFO, WARNING, ERROR and CRITICAL, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** logging module, logger, log levels and their numbers (all defined in the sections "The Logging Module" and "Log Levels" above this block).

**Evidence of Mastery:** For each of eight messages the learner chooses one of five levels and commits. A choice is correct when it matches the Level column in Content. Mastery is 7 of 8 correct on the first attempt. Setting the minimum level in Explore mode and watching which messages appear is exploration, not evidence.

**Misconceptions:** (1) Every message should be an error so that it is not missed. (Too many high-level messages hide the ones that matter.) (2) A warning means the program stopped. (It means something unexpected was handled.) (3) A failed operation that the program recovers from is critical. (CRITICAL is for a program that cannot continue or a safety risk.)

**Instructional Rationale:** An Understand-level classify objective asks the learner to sort examples by a rule. Each message is a realistic line from an arm program, so the learner must apply the meaning of the five levels to a concrete event.

**Content:**

Explore mode shows a stream of the eight messages and a control that sets the minimum level. Only messages at or above the minimum are shown, so the learner sees how the same stream looks at each level. Eight messages in this fixed order:

| # | Message | Level | Why (shown as feedback) |
|---|---|---|---|
| 1 | Loop tick 1042 started | DEBUG | A routine detail that is only useful when hunting a fault. |
| 2 | Arm connected on /dev/ttyACM0 | INFO | A normal event worth recording. |
| 3 | Joint elbow_flex temperature is 62 C, above the 60 C warning level | WARNING | Unexpected, but nothing has failed yet, and a person should know. |
| 4 | Failed to read servo 3 after 2 retries | ERROR | An operation failed, even though the program continues. |
| 5 | Emergency stop pressed: torque disabled | CRITICAL | The program cannot go on and safety is involved. |
| 6 | Calibration file loaded: my_follower.json | INFO | A normal event worth recording. |
| 7 | Packet checksum failed on servo 2: retrying (attempt 1 of 2) | WARNING | Something unexpected that the program is handling. |
| 8 | Sent goal position 2106 to servo 1 | DEBUG | A routine detail of one command. |

**Provenance:** The five levels and their meanings are from the chapter section "Log Levels" and the Python logging documentation. The messages are illustrative and written for this sim.

**Rules:** Each message has exactly one correct level. The five levels are ordered DEBUG < INFO < WARNING < ERROR < CRITICAL. In Explore mode a message is shown when its level is at or above the chosen minimum.

**Learner Activity:**

1. In Explore mode the learner sets the minimum level and watches which of the eight messages remain. The learner should notice that at WARNING only three of them are left.
2. The learner switches to the eight messages. Message 1 is shown.
3. The learner chooses a level and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After message 8 it shows the score.

**Feedback:** Eight messages, fixed order, one attempt each. Correct: "Correct: <level>. <Why>". Incorrect: "Not quite. This message is <level>. <Why>". The correct level is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the minimum level set to DEBUG, showing all eight messages.

**Chapter Anchors:** The chapter lists five levels with numbers 10, 20, 30, 40 and 50, and states that the root logger's default is WARNING. The sim has eight messages and mastery is 7 of 8.
```

## Related Resources

- [Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md)
