---
title: "Pytest Output Reader"
description: "The learner will attribute each of six pytest failure messages to its most likely cause, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Pytest Output Reader



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md).

```text
Type: microsim
**sim-id:** pytest-output-reader<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** attribute<br/>
**Learning Objective:** The learner will attribute each of six pytest failure messages to its most likely cause, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** unit test, pytest, assertion, fixture, pytest.approx, pytest.raises, the Python path (all defined in the section "Testing" above this block).

**Evidence of Mastery:** For each of six failure messages the learner chooses one of six causes and commits. A choice is correct when it matches the Cause column in Content. Mastery is 5 of 6 correct on the first attempt. Reading the cause list in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A failing test always means that the code is wrong. (The test itself can be wrong or incomplete.) (2) Exact equality is fine for decimals. (Rounding makes equal-looking numbers differ.) (3) An error before any test runs is a test failure. (It is a set-up problem: a missing fixture or an import path.)

**Instructional Rationale:** An Analyze-level attribute objective asks the learner to work out the cause behind a pattern. Each message is a real line of pytest output, so the learner must read it as a clue and not as noise.

**Content:**

The six causes: "The code returns a different value than the test expects", "Decimals were compared with exact equality", "A fixture is missing or misspelled", "The test never created the state that it checks", "A check that should have refused did not refuse", "Python cannot find the library". Six messages in this fixed order. They are the real outputs of the lab's code with a bug introduced for each:

| # | Pytest output | Cause | Why (shown as feedback) |
|---|---|---|---|
| 1 | assert 2504 == 2503, where 2504 = deg_to_raw(45, JointCalibration(...)) | The code returns a different value than the test expects | The function gave 2504 and the test said 2503, so one of them is wrong, and the arithmetic (1992 + 45 x 11.375 = 2503.9) says that 2504 is right. |
| 2 | assert (0.1 + 0.2) == 0.3 | Decimals were compared with exact equality | 0.1 + 0.2 is 0.30000000000000004 in binary arithmetic, so use pytest.approx. |
| 3 | fixture 'arm_connected' not found | A fixture is missing or misspelled | The test names a fixture that conftest.py does not define, and the fixture is called arm. |
| 4 | assert 0.0 == 10.0 | The test never created the state that it checks | The test read a joint that was never moved, so it still has its starting value of 0.0. |
| 5 | Failed: DID NOT RAISE JointLimitError | A check that should have refused did not refuse | The call that should have been refused went through, so the limit check is missing. |
| 6 | ModuleNotFoundError: No module named 'armlab' | Python cannot find the library | The tests were run from a place where the project folder is not on the path, so use python -m pytest from the project folder. |

**Provenance:** The six outputs were produced by running pytest 9.1.1 on a copy of the lab's tests with one deliberate bug for each. The causes and remedies are from the chapter section "Testing".

**Rules:** Each message has exactly one correct cause. The six causes are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the six causes, each with the fix that it usually needs.
2. The learner switches to the six messages. Message 1 is shown.
3. The learner chooses a cause and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After message 6 it shows the score.

**Feedback:** Six messages, fixed order, one attempt each. Correct: "Correct: <cause>. <Why>". Incorrect: "Not quite. The likely cause is: <cause>. <Why>". The correct cause is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the six causes listed and the prompt "What does this failure message point to?" ready for the first message.

**Chapter Anchors:** The chapter states that tests are run with python -m pytest -q, that decimals are compared with pytest.approx, and that raises is checked with pytest.raises. The sim has six messages and mastery is 5 of 6.
```

## Related Resources

- [Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md)
