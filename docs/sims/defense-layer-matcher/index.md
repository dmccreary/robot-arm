---
title: "Defense Layer Matcher"
description: "The learner will attribute each of eight agent requests to the one safety layer that refuses it first, among six layers, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Defense Layer Matcher



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 17: Safety Layers and Evaluation for Agent-Controlled Arms](../../chapters/17-agent-safety-and-evaluation/index.md).

```text
Type: microsim
**sim-id:** defense-layer-matcher<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** attribute<br/>
**Learning Objective:** The learner will attribute each of eight agent requests to the one safety layer that refuses it first, among six layers, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** safety layer, defense in depth, least privilege, command validation, workspace limits, rate limiting, confirmation step, the stop tool (all defined in the section "Layers of Safety" above this block and in Chapter 15).

**Evidence of Mastery:** For each of eight requests the learner chooses one of six layers and commits. A choice is correct when it matches the Layer column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the layer table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) One strong check is enough. (Each layer catches things that the others cannot.) (2) The schema check covers every limit. (It says what is possible, and the workspace says what is allowed today.) (3) The agent can approve its own risky moves. (Only a person can, outside the agent's tools.)

**Instructional Rationale:** An Analyze-level attribute objective asks the learner to work out which of several mechanisms is responsible for an effect. Each request differs from a valid one in exactly one way, so the learner must find which layer's rule it breaks.

**Content:**

The layers are checked in this order: role, rate limit, schema, workspace, confirmation, and (in the tool itself) the stop state. The schema allows x 0.10 to 0.28 m, y -0.15 to 0.15 m, z 0.02 to 0.07 m and speed 5 to 60 degrees per second. Today's workspace is x 0.12 to 0.26 m, y -0.12 to 0.12 m and z 0.02 to 0.07 m. A move needs confirmation if its speed is above 40 degrees per second or z is below 0.03 m. The six layer names: "Role", "Rate limit", "Schema", "Workspace", "Confirmation", "Stop state". Eight requests in this fixed order:

| # | Request | Layer | Why (shown as feedback) |
|---|---|---|---|
| 1 | An agent running as a reader is told by a web page to open the gripper. | Role | The reader role may only look and stop. |
| 2 | An operator agent asks for move_to_pose with z = 0.5. | Schema | z = 0.5 is outside the schema's range of 0.02 to 0.07 m. |
| 3 | An operator agent asks for move_to_pose with x = 0.27. | Workspace | The schema allows x up to 0.28, and today's workspace stops at 0.26. |
| 4 | An operator agent asks for move_to_pose with speed 60 degrees per second. | Confirmation | A speed above 40 degrees per second is risky and needs a person. |
| 5 | An operator agent calls get_status 100 times in one second. | Rate limit | Calls beyond the limit in a second are refused. |
| 6 | An operator agent asks for go_home after the arm was stopped. | Stop state | A stopped arm refuses everything but a status report. |
| 7 | An operator agent calls a tool named run_python. | Schema | There is no such tool, and an unknown tool fails the tool list and schema check. |
| 8 | An operator agent asks for move_to_pose with z = 0.025. | Confirmation | A z below 0.03 m is a low move and needs a person. |

**Provenance:** The layers, limits and order are those of the chapter's `SafetyLayer` in the lab, and each request's outcome was checked by running it. The requests are illustrative and written for this sim.

**Rules:** Each request has exactly one correct layer, the first in the order that refuses it. Request 6 happens after a stop.

**Learner Activity:**

1. In Explore mode the learner reads the six layers, the order and the limits.
2. The learner switches to the eight requests. Request 1 is shown.
3. The learner chooses a layer and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After request 8 it shows the score.

**Feedback:** Eight requests, fixed order, one attempt each. Correct: "Correct: <layer>. <Why>". Incorrect: "Not quite. This request is refused by: <layer>. <Why>". The correct layer is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the six layers and the limits listed and the prompt "Which layer refuses this request first?" ready for the first request.

**Chapter Anchors:** The chapter's workspace is x 0.12 to 0.26 m, y -0.12 to 0.12 m and z 0.02 to 0.07 m, and a move needs confirmation above 40 degrees per second or below z = 0.03 m. The sim has eight requests and mastery is 7 of 8.
```

## Related Resources

- [Chapter 17: Safety Layers and Evaluation for Agent-Controlled Arms](../../chapters/17-agent-safety-and-evaluation/index.md)
