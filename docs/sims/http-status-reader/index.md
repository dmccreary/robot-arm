---
title: "HTTP Status Reader"
description: "The learner will interpret eight HTTP status codes returned by the arm's tool server or a model provider by choosing what the client should do, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# HTTP Status Reader



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md).

```text
Type: microsim
**sim-id:** http-status-reader<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** interpret<br/>
**Learning Objective:** The learner will interpret eight HTTP status codes returned by the arm's tool server or a model provider by choosing what the client should do, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** HTTP API, status code, requests library, API key (all defined in the sections "HTTP APIs, JSON Requests, and the Requests Library" and "API Key Handling" above this block).

**Evidence of Mastery:** For each of eight responses the learner chooses one of six actions and commits. A choice is correct when it matches the Action column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the status table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Any error means that the server is broken. (A 4xx means that the request was wrong.) (2) A 401 means the request body is wrong. (It means the key is missing or wrong.) (3) A 429 should be retried at once. (The client should slow down first.)

**Instructional Rationale:** An Understand-level interpret objective asks the learner to explain what a message means. The status code's first digit separates the client's faults from the server's, so the learner must connect each code to the right party and the right remedy.

**Content:**

The six actions: "Use the answer", "Fix the request", "Fix the key or the permission", "Fix the address or the name", "Slow down and retry later", "Server problem: retry after a wait, then report". Eight responses in this fixed order:

| # | Response | Action | Why (shown as feedback) |
|---|---|---|---|
| 1 | 200 from POST /call/get_status | Use the answer | The call worked. |
| 2 | 400 with the message "x = 0.35 is outside the allowed range 0.1 to 0.28" | Fix the request | The request had an invalid value, and the message says how to correct it. |
| 3 | 401 from GET /tools | Fix the key or the permission | The X-API-Key header is missing or wrong. |
| 4 | 403 from a model provider with a valid key | Fix the key or the permission | The key is valid but is not allowed to do this. |
| 5 | 404 from POST /call/wave_hello | Fix the address or the name | There is no tool with that name. |
| 6 | 429 from a model provider | Slow down and retry later | The client sent too many requests. |
| 7 | 500 from a model provider | Server problem: retry after a wait, then report | The failure is on the server's side, and a retry after a wait often works. |
| 8 | 529 from a model provider | Slow down and retry later | The service is overloaded, so retry after a wait. |

**Provenance:** The meanings of the codes are from the chapter's status table, which follows the Anthropic API's documentation of its errors (401 for a problem with the key, 429 for rate limits, 500 for a server error to retry with backoff, 529 for overload) and the lab's tool server (400, 404 and 409). The responses are illustrative and written for this sim.

**Rules:** Each response has exactly one correct action. A 2xx is success. A 4xx is the client's fault, and the action depends on the code. A 5xx is the server's fault. A 429 and a 529 are answered by waiting.

**Learner Activity:**

1. In Explore mode the learner reads the status table.
2. The learner switches to the eight responses. Response 1 is shown.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After response 8 it shows the score.

**Feedback:** Eight responses, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. The right action is: <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the status table listed and the prompt "What should the client do?" ready for the first response.

**Chapter Anchors:** The chapter's table lists 200, 400, 401, 403, 404, 409, 429, 500 and 529, and states that 4xx is the client's fault and 5xx the server's. The sim has eight responses and mastery is 7 of 8.
```

## Related Resources

- [Chapter 16: Agent Planning, Vision, and Interfaces](../../chapters/16-agent-planning-and-vision/index.md)
