---
title: "Script Policy Agent Sorter"
description: "The learner will differentiate eight situations as a script, a learned policy or an agent, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Script Policy Agent Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md).

```text
Type: microsim
**sim-id:** script-policy-agent-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight situations as a script, a learned policy or an agent, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** script, learned policy, agent, demonstrations, tools (all defined in the section "Script vs Policy vs Agent" above this block and in Chapters 11, 14 and 15).

**Evidence of Mastery:** For each of eight situations the learner chooses one of three kinds and commits. A choice is correct when it matches the Kind column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the comparison table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A camera makes a program an agent. (A program with a camera is still a script when code decides every step.) (2) Anything with a neural network is an agent. (A policy maps what it sees straight to actions and does not choose tools.) (3) An agent is always better. (It is less predictable, so it is used only where the job needs words or changing plans.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to separate things that look alike. The three kinds differ in who decides each move, so the learner must look at the decision maker and not at the hardware.

**Content:**

The three kinds: "Script" (code that a person wrote decides every step), "Learned policy" (a model trained on demonstrations turns what it sees into the next action), "Agent" (a language model chooses which tools to call, in a loop). Eight situations in this fixed order:

| # | Situation | Kind | Why (shown as feedback) |
|---|---|---|---|
| 1 | Every morning the arm moves through the same five poses to warm up. | Script | A person wrote the five poses, and nothing is decided at run time. |
| 2 | A model trained on fifty recorded demonstrations folds a towel. | Learned policy | The knowledge came from demonstrations, and the model maps what it sees to actions. |
| 3 | A student types "put the red block in the left bin" and a language model picks the tools to call. | Agent | A language model chooses tools in response to words. |
| 4 | The arm plays back a recorded motion exactly the same way every time. | Script | Playback is fixed steps, and it decides nothing. |
| 5 | A network reads the camera picture and the joint angles and outputs the next joint targets at every tick. | Learned policy | It maps observations to actions, and it was trained from demonstrations. |
| 6 | A language model reads a scene description, writes a plan, calls the move and gripper tools, and asks a person when a grasp fails twice. | Agent | The model plans and chooses tools, and handles a failure. |
| 7 | A program finds blocks by hue, converts them to table coordinates, and runs a fixed pick-and-place for each. | Script | A camera supplies facts, but code decides every step. |
| 8 | A person asks "is the gripper open?" and a language model calls the status tool and answers. | Agent | The model chose a tool to answer a question in words. |

**Provenance:** The three kinds follow Chapters 11, 14 and 15 of this book. The situations are illustrative and written for this sim.

**Rules:** Each situation has exactly one correct kind. The deciding question is who decides the next move: fixed code, a trained model, or a language model choosing tools.

**Learner Activity:**

1. In Explore mode the learner reads the three kinds and the deciding question.
2. The learner switches to the eight situations. Situation 1 is shown.
3. The learner chooses a kind and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 8 it shows the score.

**Feedback:** Eight situations, fixed order, one attempt each. Correct: "Correct: <kind>. <Why>". Incorrect: "Not quite. This is a: <kind>. <Why>". The correct kind is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the three kinds listed and the prompt "Who decides the next move?" ready for the first situation.

**Chapter Anchors:** The chapter says that a program with a camera is still a script when code decides every step, that a script with the blocks' positions written in misses by 14 to 22 millimeters when the blocks are moved, and that most projects use a script for motion, vision for facts and an agent only for words. The sim has eight situations and mastery is 7 of 8.
```

## Related Resources

- [Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md)
