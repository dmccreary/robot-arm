---
title: "Plan Checker"
description: "The learner will examine eight pick-and-place plans written as lists of tool calls and name the problem with each, or say that the plan is valid, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Plan Checker



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md).

```text
Type: microsim
**sim-id:** plan-checker<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** examine<br/>
**Learning Objective:** The learner will examine eight pick-and-place plans written as lists of tool calls and name the problem with each, or say that the plan is valid, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** task planning, task decomposition, the planner-executor split, the plan of ten steps, tool schemas and their ranges (all defined in the section "The Architecture of an Agent System" above this block and in Chapter 15).

**Evidence of Mastery:** For each of eight plans the learner chooses one of six outcomes and commits. A choice is correct when it matches the Outcome column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the model plan in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A plan is fine if each step is individually legal. (The order matters: closing the gripper before the approach, or lifting without checking the grasp, are order faults.) (2) A plan that the model wrote needs no checking. (A plan is data that should always be checked as a whole.) (3) The executor can fix a bad plan as it goes. (It should refuse a bad plan before anything moves.)

**Instructional Rationale:** An Analyze-level examine objective asks the learner to break a plan into its steps and test each against rules and against its neighbors. Each plan has at most one fault, so the learner must look for the specific rule that is broken.

**Content:**

The model plan, shown in Explore mode, is the ten-step plan of the chapter. The six outcomes: "Valid plan", "Missing status check", "Gripper closed on approach", "Value out of range", "No grasp check before lifting", "Uses a tool that does not exist". Eight plans in this fixed order, each a short list of steps:

| # | Plan | Outcome | Why (shown as feedback) |
|---|---|---|---|
| 1 | get_status, open_gripper, move above the block, move down, close_gripper, check holding_something, move up, go_home | Valid plan | Every rule is met and the order is safe. |
| 2 | open_gripper, move above the block, move down, close_gripper, check holding_something, move up | Missing status check | The first step should be get_status, so that the plan starts from what the arm really reports. |
| 3 | get_status, move above the block, move down, close_gripper, check holding_something, move up | Gripper closed on approach | The gripper was never opened, so the fingers would hit the block on the way down. |
| 4 | get_status, open_gripper, move above the block with z = 0.01, move down, close_gripper, check holding_something | Value out of range | z = 0.01 is below the minimum of 0.02 m. |
| 5 | get_status, open_gripper, move above the block, move down, close_gripper, move up | No grasp check before lifting | The plan lifts without reading whether the gripper holds something. |
| 6 | get_status, open_gripper, move above the block, wave_hello, move down | Uses a tool that does not exist | There is no tool called wave_hello. |
| 7 | get_status, open_gripper, move above the block, move down, close_gripper, check holding_something, move above the bin, open_gripper, go_home | Valid plan | The grasp is checked and the order is safe. |
| 8 | get_status, open_gripper, move above the block with x = 0.40, move down, close_gripper, check holding_something | Value out of range | x = 0.40 is above the maximum of 0.28 m. |

**Provenance:** The ten-step plan, the tools and the ranges are from the chapter and Chapter 15. The plans are illustrative and written for this sim.

**Rules:** Each plan has at most one fault, and exactly one correct outcome. The checks, in order: every tool exists; every value is inside its range; the first step is get_status; the gripper is opened before the first move down; a close_gripper step is followed by a check of holding_something before any lift.

**Learner Activity:**

1. In Explore mode the learner reads the model plan and the five checks.
2. The learner switches to the eight plans. Plan 1 is shown.
3. The learner chooses an outcome and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After plan 8 it shows the score.

**Feedback:** Eight plans, fixed order, one attempt each. Correct: "Correct: <outcome>. <Why>". Incorrect: "Not quite. This plan is: <outcome>. <Why>". The correct outcome is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the model plan listed and the prompt "What is wrong with this plan, if anything?" ready for the first plan.

**Chapter Anchors:** The chapter's plan has ten steps, starts with get_status, opens the gripper before the approach, and checks the grasp before lifting. The ranges are x 0.10 to 0.28 m and z 0.02 to 0.07 m. The sim has eight plans and mastery is 7 of 8.
```

## Related Resources

- [Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md)
