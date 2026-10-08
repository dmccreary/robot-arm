---
title: "Platform Chooser"
description: "The learner will recommend one of three robot arms (the SO-ARM101, the reBot B601-DM or the reBot B601-RS) for each of six project situations by applying the platform selection criteria, with at least 5 of 6 recommendations correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# Platform Chooser



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 9: Building the reBot-DevArm and Choosing a Platform](../../chapters/09-building-the-rebot-devarm/index.md).

```text
Type: microsim
**sim-id:** platform-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** recommend<br/>
**Learning Objective:** The learner will recommend one of three robot arms (the SO-ARM101, the reBot B601-DM or the reBot B601-RS) for each of six project situations by applying the platform selection criteria, with at least 5 of 6 recommendations correct on the first attempt.

**Prerequisites:** SO-ARM101, reBot B601-DM, reBot B601-RS, payload, landed cost, supervision, supply voltage, platform selection criteria (all defined in the sections above this block and in Chapters 3, 5 and 6).

**Evidence of Mastery:** For each of six situations the learner chooses one of three arms and commits. A choice is correct when it matches the Recommended arm column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the weights in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The most capable arm is always the best choice. (Cost, supervision and power can rule it out.) (2) A weighted score decides a hard requirement. (A requirement is a filter that must be applied first.) (3) The cheapest arm can do any job. (Its payload is about a third of the B601-DM's.)

**Instructional Rationale:** An Evaluate-level recommend objective asks the learner to make and justify a judgment against criteria. Each situation fixes some criteria as requirements and leaves others as preferences, so the learner must apply the filter before the weights.

**Content:**

The three arms and the facts that the learner may use: SO-ARM101, payload about 0.5 kg, about $350 for a pair including the printed parts, 5 V supply, LeRobot software, lowest supervision need. reBot B601-DM, payload 1.5 kg, bill of materials lines of about $1,387 and a store bundle of $1,517.58, 24 V supply, ROS 1 and 2, LeRobot, Pinocchio and Isaac Sim, higher supervision need. reBot B601-RS, payload 2.5 kg, motors alone $1,130 and a supply of $69.50, 48 V supply, a Python SDK, highest supervision need.

Six situations in this fixed order:

| # | Situation shown to the learner | Recommended arm | Why (shown as feedback) |
|---|---|---|---|
| 1 | A class of 12 students aged 12 to 14, working in pairs, has about $400 for each pair's arms and wants to learn Python and teleoperation. | SO-ARM101 | It is the only arm that fits the budget, and its supervision demands suit the age. |
| 2 | A lab must lift a 1.2 kg part again and again and has a 24 V bench supply. | reBot B601-DM | Its payload of 1.5 kg covers 1.2 kg, and 24 V is the supply it needs. |
| 3 | A project must hold a 2.0 kg object, has a 48 V supply and has an adult who can wire it. | reBot B601-RS | Only the B601-RS has a payload (2.5 kg) above 2.0 kg. |
| 4 | A hobbyist with no experience of mains wiring wants to try imitation learning with a leader and follower, on a $400 budget. | SO-ARM101 | It has a built-in leader arm, a low-voltage supply, and fits the budget. |
| 5 | A university course needs ROS 2, Isaac Sim and Pinocchio support, a 1 kg payload, a 24 V supply, and staff who can do the mains wiring. | reBot B601-DM | Its repository lists all three software tools, and 1.5 kg covers 1 kg. |
| 6 | A team has only a 5 V, 4 A supply and wants the cheapest build that can copy a leader arm. | SO-ARM101 | The other two arms need 24 V or 48 V supplies the team does not have. |

Explore mode scores each arm from 1 (worst) to 5 (best) on five criteria. The learner sets a weight from 0 to 5 for each criterion and sees the weighted totals. The scores are the author's judgments and the sim labels them "judgment".

| Criterion | SO-ARM101 | reBot B601-DM | reBot B601-RS |
|---|---|---|---|
| Low cost | 5 | 2 | 1 |
| Payload | 1 | 3 | 5 |
| Easy to learn | 5 | 3 | 2 |
| Software support | 4 | 5 | 3 |
| Simple, low-voltage power | 5 | 3 | 2 |

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Weight of each criterion | 0 | 5 | 1 | 3 | none |

**Provenance:** The payloads, prices, voltages and software lists are from the chapter sections "The reBot-DevArm", "Cost Comparison", "Payload Comparison" and Chapters 5 and 6. The situations are illustrative and written for this sim. The criterion scores are the author's judgment.

**Rules:** Each situation has exactly one correct arm, found by applying the requirements in the situation as filters first. Weighted total of an arm = the sum over the five criteria of weight x score. The arm with the highest total is shown first, and a tie is shown in the order SO-ARM101, B601-DM, B601-RS.

**Learner Activity:**

1. In Explore mode the learner changes the five weights and watches the three totals reorder. The learner should notice that raising the weight of payload to 5 and every other weight to 0 puts the B601-RS first.
2. The learner switches to the six situations. Situation 1 is shown with the facts on each arm.
3. The learner chooses one of the three arms and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 6 it shows the score.

**Feedback:** Six situations, fixed order, one attempt each. Correct: "Correct: <arm>. <Why>". Incorrect: "Not quite. The best fit is <arm>. <Why>". The correct arm is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with all five weights at 3, showing the totals 60 for the SO-ARM101, 48 for the B601-DM and 39 for the B601-RS.

**Chapter Anchors:** The chapter states payloads of about 0.5 kg, 1.5 kg and 2.5 kg, supplies of 5 V, 24 V and 48 V, an SO-ARM101 cost of about $350, a B601-DM store bundle of $1,517.58, and that requirements are filters and preferences are weights. The sim has six situations, five criteria with weights from 0 to 5, and mastery is 5 of 6.
```

## Related Resources

- [Chapter 9: Building the reBot-DevArm and Choosing a Platform](../../chapters/09-building-the-rebot-devarm/index.md)
