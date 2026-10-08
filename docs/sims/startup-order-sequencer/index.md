---
title: "Startup Order Sequencer"
description: "The learner will organize the four startup steps and the three shutdown steps of the chapter into their correct order, choosing the next step in each of eight rounds, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Startup Order Sequencer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md).

```text
Type: microsim
**sim-id:** startup-order-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the four startup steps and the three shutdown steps of the chapter into their correct order, choosing the next step in each of eight rounds, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** startup procedure, shutdown procedure, stop, home pose, pre-flight check (all defined in the section "Startup and Shutdown Procedures" above this block and in Chapters 3 and 8).

**Evidence of Mastery:** In each of eight rounds the learner chooses one of three steps as the next one and commits. A choice is correct when it matches the Next Step column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the full procedure in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The stop can be cleared first so that the checks can move the arm. (The checks come first, and the stop is cleared after them.) (2) The agent can clear the stop. (Only a person can.) (3) Torque is cut first and the arm is parked afterwards. (A parked arm has little left to fall, and an arm that is not parked sags.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to put parts into a structure. Choosing the next step, again and again, makes the learner think about what each step makes safe for the following one.

**Content:**

The full procedure, shown in Explore mode: Startup steps 1 to 4, then Shutdown steps 5 to 7. Eight rounds in this fixed order. In each round the steps already done are shown, and the learner picks the next one from three choices.

| Round | Steps done so far | Next Step | The two wrong choices | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | none | Check that the supply covers the motors | Clear the stop; Go to the home pose | Nothing else is safe until power is known to be right. |
| 2 | Power checked | Check that every servo answers, is cool and is in range | Clear the stop; Cut torque | The servos are checked before any stop is cleared. |
| 3 | Power, servos | A person confirms the table is clear and the E-stop is in reach | Go to the home pose; Cut torque | A person must look before the arm may move. |
| 4 | Power, servos, table | A person clears the stop | Cut torque; Take the object from the gripper | The arm can move only after a person clears the stop. |
| 5 | Startup done, the arm is working | Check that the gripper holds nothing | Cut torque; Clear the stop | Torque is never cut while the gripper holds something. |
| 6 | Gripper empty | Go to the home pose | Cut torque; Check the servos | The arm is parked before torque is cut. |
| 7 | Arm at home | Cut torque | Check the power supply; Clear the stop | Torque is cut last, with the arm parked. |
| 8 | Torque cut | Leave the arm stopped until a person clears it | Let the agent clear the stop; Move the arm to test it | A stop stays in force until a person clears it. |

**Provenance:** The steps are those of the chapter's `startup` and `shutdown` functions. The wrong choices are written for this sim.

**Rules:** Each round has exactly one correct next step. A step is wrong if it comes in the wrong place, or if it is something that only a person may do and the choice gives it to the agent.

**Learner Activity:**

1. In Explore mode the learner reads the seven steps in order.
2. The learner switches to the eight rounds. Round 1 is shown.
3. The learner chooses the next step and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After round 8 it shows the score.

**Feedback:** Eight rounds, fixed order, one attempt each. Correct: "Correct: <step>. <Why>". Incorrect: "Not quite. The next step is: <step>. <Why>". The correct step is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the seven steps listed in order and the prompt "What comes next?" ready for round 1.

**Chapter Anchors:** The chapter's startup has four steps (power, servos, a person checks the table and the E-stop, a person clears the stop and the arm goes home), and its shutdown parks the arm, then cuts torque, and refuses while the gripper holds something. The sim has eight rounds and mastery is 7 of 8.
```

## Related Resources

- [Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md)
