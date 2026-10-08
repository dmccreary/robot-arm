---
title: "Evaluation Metrics Calculator"
description: "The learner will calculate success rates, violation rates, mean results, ranges and changed-call rates from the results of agent tests, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Evaluation Metrics Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 17: Safety Layers and Evaluation for Agent-Controlled Arms](../../chapters/17-agent-safety-and-evaluation/index.md).

```text
Type: microsim
**sim-id:** evaluation-metrics-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate success rates, violation rates, mean results, ranges and changed-call rates from the results of agent tests, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** success rate, violation rate, repeatability test, replay testing, mean, range (all defined in the section "Testing an Agent" above this block and in Chapter 13).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the numbers in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A high success rate means the agent is safe. (Safety is the violation rate, which must be zero.) (2) A rate is a count. (It is a count divided by the number of trials, as a percentage.) (3) The range is the average spread. (It is the largest value minus the smallest.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. The three kinds of number that an evaluation reports (rates, means, ranges) each get at least one problem.

**Content:**

Explore mode shows a table of trials with a count of successes and violations that the learner can change, and the resulting rates. Formulas: rate (percent) = 100 x count / trials; mean = sum / count; range = largest - smallest.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Trials | 1 | 200 | 1 | 40 | none |
| Successes | 0 | 200 | 1 | 26 | none |
| Violations | 0 | 200 | 1 | 0 | none |

Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | An agent finishes the task in 43 of 50 trials. What is the success rate? | percent | 86.0 | 100 x 43 / 50 = 86.0 percent. |
| 2 | In the same 50 trials, 2 trials broke a safety rule. What is the violation rate? | percent | 4.0 | 100 x 2 / 50 = 4.0 percent, and a safe design needs 0. |
| 3 | With a misbehaving model, 26 of 40 trials finish. What is the success rate? | percent | 65.0 | 100 x 26 / 40 = 65.0 percent. |
| 4 | Five repeats of a move end with the tip at x = 220, 221, 219, 222 and 218 mm. What is the mean? | mm | 220.0 | (220 + 221 + 219 + 222 + 218) / 5 = 220.0 mm. |
| 5 | For the same five repeats, what is the range? | mm | 4.0 | The largest is 222 and the smallest is 218, so the range is 4.0 mm. |
| 6 | A replay of 120 logged calls through a new safety layer refuses 9 that were allowed before. What percent of the calls changed? | percent | 7.5 | 100 x 9 / 120 = 7.5 percent. |

**Provenance:** The formulas are from the chapter section "Testing an Agent". The numbers in problem 3 are from the lab's evaluation at a misbehavior chance of 0.3, and the others are illustrative and written for this sim.

**Rules:** rate = 100 x count / trials, in percent. mean = sum / count. range = largest - smallest. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner changes the trials, successes and violations and watches the two rates.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with 40 trials, 26 successes and 0 violations, showing a success rate of 65.0 percent and a violation rate of 0.0 percent.

**Chapter Anchors:** The chapter's evaluation reports 26 of 40 trials finishing (65 percent) at a misbehavior chance of 0.3, with 0 workspace violations, and a replay in which calls 7 and 8 change. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 17: Safety Layers and Evaluation for Agent-Controlled Arms](../../chapters/17-agent-safety-and-evaluation/index.md)
