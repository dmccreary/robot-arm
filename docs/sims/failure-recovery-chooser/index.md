---
title: "Failure Recovery Chooser"
description: "The learner will recommend the best next action for each of eight situations an agent meets, choosing among retry once, replan, ask a human and stop the arm, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# Failure Recovery Chooser



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md).

```text
Type: microsim
**sim-id:** failure-recovery-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** recommend<br/>
**Learning Objective:** The learner will recommend the best next action for each of eight situations an agent meets, choosing among retry once, replan, ask a human and stop the arm, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** replanning, failed grasp recovery, asking a human, the stop tool, the table of situations (all defined in the section "When Something Goes Wrong" above this block).

**Evidence of Mastery:** For each of eight situations the learner chooses one of four actions and commits. A choice is correct when it matches the Best action column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the guidance in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The agent should keep retrying until it works. (After one retry, repeated attempts waste time and can cause harm.) (2) Ambiguity should be settled by a best guess. (A wrong guess can move the wrong object, so ask.) (3) A stopped arm can be restarted by the agent. (Only a person can clear a stop.)

**Instructional Rationale:** An Evaluate-level recommend objective asks the learner to choose a course of action against criteria and justify it. The four actions differ in risk and cost, so the learner must weigh them against each situation.

**Content:**

The four actions: "Retry once", "Replan", "Ask a human", "Stop the arm". Eight situations in this fixed order:

| # | Situation | Best action | Why (shown as feedback) |
|---|---|---|---|
| 1 | The grasp check says nothing is held, on the first attempt. | Retry once | The block may have moved a little, so one more try is reasonable. |
| 2 | The grasp check says nothing is held, on the second attempt. | Ask a human | The retry failed, so something else is wrong. |
| 3 | move_to_pose is refused: "x = 0.35 is outside the allowed range 0.1 to 0.28". | Replan | The refusal says how to fix the plan, so build a new one with x inside the range. |
| 4 | get_status says that the arm is stopped. | Ask a human | Only a person can clear a stop, and the agent should wait. |
| 5 | The scene description lists two red blocks, and the request was "pick up the red block". | Ask a human | A guess might move the wrong block. |
| 6 | The first look at the table returns no objects. | Retry once | The picture may have been blurred or dark, so look again. |
| 7 | The same refusal comes back twice in a row for the same step. | Ask a human | The agent is not making progress. |
| 8 | The user types "Stop!" while the arm is moving. | Stop the arm | Stopping is always the priority. |

**Provenance:** The actions and reasons are from the chapter section "When Something Goes Wrong". The situations are illustrative and written for this sim.

**Rules:** Each situation has exactly one correct action. "Retry once" applies to a first failure that may be due to chance. "Replan" applies when an error message says how to change the plan. "Ask a human" applies to repeated failure, ambiguity and a stop. "Stop the arm" applies to a user's request to stop.

**Learner Activity:**

1. In Explore mode the learner reads the table of situations and actions.
2. The learner switches to the eight situations. Situation 1 is shown.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 8 it shows the score.

**Feedback:** Eight situations, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. The best action is: <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the four actions listed and the prompt "What should the agent do next?" ready for the first situation.

**Chapter Anchors:** The chapter's recovery routine retries a missed grasp once and then asks a person, replans after a refusal that states a range, and asks a human for a stop or for two matching objects. The sim has eight situations and mastery is 7 of 8.
```

## Related Resources

- [Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md)
