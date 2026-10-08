---
title: "Joint Limit Chooser"
description: "The learner will recommend the torque limit for each of five joint tasks, choosing the smallest option that is at least 1.5 times the torque the task needs, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# Joint Limit Chooser



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md).

```text
Type: microsim
**sim-id:** joint-limit-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** recommend<br/>
**Learning Objective:** The learner will recommend the torque limit for each of five joint tasks, choosing the smallest option that is at least 1.5 times the torque the task needs, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** torque, torque limit, stall torque, force limit, overload protection, servo compliance, runaway motion (all defined in the sections above this block).

**Evidence of Mastery:** For each of five tasks the learner chooses one of three torque limits and commits. A choice is correct when it matches the Correct limit column in Content, which follows the rule in Rules. Mastery is 4 of 5 correct on the first attempt. Dragging the limit in Explore mode and watching the simulated joint is exploration, not evidence.

**Misconceptions:** (1) The highest limit is the safest because the joint never fails. (A high limit raises the push and the heat in a fault.) (2) The lowest limit is the safest. (The joint cannot do its job, and a joint that struggles overheats.) (3) The limit should equal the torque the task needs. (It needs a margin.)

**Instructional Rationale:** An Evaluate-level recommend objective asks the learner to weigh two risks, too little torque and too much, and to justify a choice by a criterion. A margin rule makes the criterion explicit and checkable, and the feedback names the failure each wrong option would cause.

**Content:**

The rule of thumb for this sim, stated in the chapter, is: choose the smallest available torque limit that is at least 1.5 times the torque the task needs. Torque needs and limits are percentages of the joint's maximum torque. Five tasks in this fixed order:

| # | Task | Torque needed | Options (torque limit) | Correct limit | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | The gripper holds a 50 g block. | 15 percent | 20, 30, 100 percent | 30 percent | 1.5 × 15 = 22.5, so 20 is too low. 30 is the smallest that is enough, and 100 is more than the task needs. |
| 2 | The shoulder-lift joint holds the arm up with a 0.3 kg load at reach. | 60 percent | 80, 90, 100 percent | 100 percent | 1.5 × 60 = 90, and 90 is only just enough. With the arm's own weight, 100 is the only option with margin. |
| 3 | The wrist roll turns a light camera. | 10 percent | 10, 20, 50 percent | 20 percent | 1.5 × 10 = 15, so 10 is too low and 20 is the smallest that is enough. |
| 4 | The gripper closes near students during a demo. | 20 percent | 25, 40, 100 percent | 40 percent | 1.5 × 20 = 30, so 25 is too low, and 100 is a needless risk near people. |
| 5 | A first test of an untested program, small and slow. | 30 percent | 30, 50, 100 percent | 50 percent | 1.5 × 30 = 45, so 30 is too low, and a test should not use 100 percent. |

**Provenance:** The tasks and percentages are illustrative and written for this sim, and the sim labels them "illustrative". The idea of a lower limit for the gripper follows LeRobot's SO-101 configuration, which limits the gripper to 50 percent. The 1.5 margin is a teaching rule of thumb, not a standard.

**Rules:** The correct limit is the smallest option with option >= 1.5 × needed. Each task has exactly one such option. In Explore mode the learner drags a torque limit from 0 to 100 percent (step 5, default 50) against a task of a chosen needed torque (10 to 90 percent, step 10, default 30), and the sim shows a joint that either completes the task, completes it with little margin, or stalls because the limit is below the needed torque.

**Learner Activity:**

1. In Explore mode the learner moves the limit and the needed torque and watches a simulated joint hold, strain or fail. The learner should notice that below the needed torque the joint stalls and above it only the fault risk grows.
2. The learner switches to the five tasks. Task 1 shows its needed torque and the three options.
3. The learner chooses one option and commits.
4. The sim shows whether the choice was correct, the margin of each option, and the Why text. After task 5 it shows the score.

**Feedback:** Five tasks, fixed order, one attempt each. Correct: "Correct: <limit> percent. <Why>". Incorrect: "Not quite. The best choice is <limit> percent. <Why>". The correct limit is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with a 50 percent limit and a task that needs 30 percent, showing the joint holding with margin.

**Chapter Anchors:** The chapter's rule is "smallest limit at least 1.5 times the torque needed", and it cites LeRobot's gripper settings of 50 percent maximum torque, a protection current of 250 and an overload torque of 25. The sim has five tasks and mastery is 4 of 5.
```

## Related Resources

- [Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md)
