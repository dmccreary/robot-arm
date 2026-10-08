---
title: "Demo Episode Judge"
description: "The learner will judge eight described demonstration episodes as worth keeping or needing to be re-recorded, using the data-collection guidance of the chapter, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# Demo Episode Judge



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md).

```text
Type: microsim
**sim-id:** demo-episode-judge<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** judge<br/>
**Learning Objective:** The learner will judge eight described demonstration episodes as worth keeping or needing to be re-recorded, using the data-collection guidance of the chapter, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** demonstration data, episode, dataset, observation and action, the data-collection guidance (all defined in the section "Imitation Learning, Demonstrations, and Policies" and "Recording Episodes and Datasets" above this block).

**Evidence of Mastery:** For each of eight episodes the learner chooses Keep or Re-record and commits. A choice is correct when it matches the Verdict column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the guidance list in Explore mode is exploration, not evidence.

**Misconceptions:** (1) More variety in every episode is always better. (Variety should be added only after the policy is reliable, and not too fast.) (2) A bad episode can stay because the policy will average it out. (A policy copies inconsistent behaviour.) (3) The camera can be moved between episodes. (The cameras must stay fixed.)

**Instructional Rationale:** An Evaluate-level judge objective asks the learner to decide against criteria and justify the decision. Each episode breaks, or keeps, exactly one of the guidance rules, so the learner must match a described situation to a rule.

**Content:**

The guidance rules the learner can read in Explore mode: keep the cameras fixed; the object must be visible in the camera; grasp consistently; use a few planned locations (about 10 episodes per location) and add variation only after the policy is reliable; cancel and re-record an episode that goes wrong. The two verdicts: "Keep" and "Re-record". Eight episodes in this fixed order:

| # | Episode description | Verdict | Why (shown as feedback) |
|---|---|---|---|
| 1 | The block is visible in the front camera throughout, and the grasp matches the other episodes. | Keep | It follows every guidance rule. |
| 2 | The leader arm and the operator's hand cover the block in the camera for half of the episode. | Re-record | The object must be visible in the camera, and a policy cannot learn from what it cannot see. |
| 3 | The camera was knocked halfway through and now shows a different part of the table. | Re-record | The cameras must stay fixed, or the same pixels mean different places. |
| 4 | The operator grasped the block from the side in this episode and from above in the other 49. | Re-record | The grasp should be consistent, and a policy will copy the inconsistency. |
| 5 | The block is in a different spot from the previous episode, one of the five planned locations. | Keep | Planned variation in the object's location is the right kind of variety. |
| 6 | The operator dropped the block and pressed the left arrow to cancel. | Re-record | The left arrow cancels the episode and records it again, which is the right response to a failed attempt. |
| 7 | A first-day dataset where every episode uses a new location, a new grasp style and a new camera angle. | Re-record | Variation should be added slowly and only after the policy is reliable, so plan fewer changes. |
| 8 | The block is clearly visible, and the operator completes the task in one smooth motion within the time limit. | Keep | It is a clean, consistent demonstration. |

**Provenance:** The rules are from LeRobot's imitation-learning guide (`il_robots.mdx`, read on 2026-10-07), as summarized in the chapter section "Imitation Learning, Demonstrations, and Policies". The episodes are illustrative and written for this sim.

**Rules:** Each episode has exactly one correct verdict. An episode that breaks any guidance rule is "Re-record", and one that breaks none is "Keep".

**Learner Activity:**

1. In Explore mode the learner reads the guidance rules.
2. The learner switches to the eight episodes. Episode 1 is shown.
3. The learner chooses a verdict and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After episode 8 it shows the score.

**Feedback:** Eight episodes, fixed order, one attempt each. Correct: "Correct: <verdict>. <Why>". Incorrect: "Not quite. The verdict is: <verdict>. <Why>". The correct verdict is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the guidance rules listed and the prompt "Would you keep this episode?" ready for the first episode.

**Chapter Anchors:** The chapter states the advice to record at least 50 episodes with 10 episodes per location, to keep cameras fixed, to keep the object visible, to grasp consistently, and that the left arrow cancels and re-records an episode. The sim has eight episodes and mastery is 7 of 8.
```

## Related Resources

- [Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md)
