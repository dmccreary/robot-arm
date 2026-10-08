---
title: "CAN Termination Meter"
description: "The learner will infer the state of a CAN bus's termination from the resistance a meter reads between CAN_H and CAN_L, in six readings, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# CAN Termination Meter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md).

```text
Type: microsim
**sim-id:** can-termination-meter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer the state of a CAN bus's termination from the resistance a meter reads between CAN_H and CAN_L, in six readings, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** CAN bus, CAN_H and CAN_L, CAN termination, resistance, parallel resistors, Ohm's law (all defined in the sections above this block and in Chapter 3).

**Evidence of Mastery:** For each of six meter readings the learner chooses one of five diagnoses and commits. A choice is correct when it matches the Diagnosis column in Content. Mastery is 5 of 6 correct on the first attempt. Adding and removing terminators in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every motor on the bus needs its own terminator. (Only the two ends do.) (2) The reading should be 120 Ω. (Two in parallel give 60 Ω.) (3) More terminators are safer. (Three give 40 Ω and load the bus.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from evidence to a state. The meter reading is the evidence, and the parallel-resistor rule from Chapter 3 is the reasoning, so the learner must apply it to the numbers.

**Content:**

The diagram shows a CAN bus with two ends and up to three terminator positions (the two ends and one in the middle that should be empty). A virtual meter with power off shows the resistance between CAN_H and CAN_L. Each terminator is 120 Ω, and the meter reading is the parallel combination of the terminators present. A broken wire gives an open reading and a short gives a near-zero reading.

The five diagnoses: "Healthy: two terminators", "One terminator missing", "No terminators or a broken wire", "Extra terminator", "Short circuit". Six readings in this fixed order:

| # | Meter reading | Diagnosis | Why (shown as feedback) |
|---|---|---|---|
| 1 | 60 Ω | Healthy: two terminators | Two 120 Ω resistors in parallel give 60 Ω. |
| 2 | 120 Ω | One terminator missing | One 120 Ω resistor alone reads 120 Ω. |
| 3 | Open (over 1 MΩ) | No terminators or a broken wire | With no resistor connected, the meter sees an open circuit. |
| 4 | 40 Ω | Extra terminator | Three 120 Ω resistors in parallel give 120 / 3 = 40 Ω. |
| 5 | 0.3 Ω | Short circuit | A reading near 0 Ω means CAN_H touches CAN_L. |
| 6 | 62 Ω | Healthy: two terminators | The meter and resistors have tolerances, so 62 Ω is within the healthy band. |

**Provenance:** The readings are illustrative values written for this sim. The 120 Ω terminator value, the 60 Ω healthy reading and the parallel-resistor rule are from the chapter section "CAN Termination".

**Rules:** For n terminators of 120 Ω in parallel, R = 120 / n. Healthy is 54 Ω <= R <= 66 Ω. One missing is 108 Ω <= R <= 132 Ω. Extra is 36 Ω <= R <= 44 Ω. Short is R < 5 Ω. Open is R > 1 MΩ. In Explore mode the learner can switch each of three terminator positions on or off, and can add a broken-wire or short fault, and the meter shows the resulting resistance.

**Learner Activity:**

1. In Explore mode the learner toggles the terminators and watches the meter. The learner should notice 60 Ω with two, 120 Ω with one and 40 Ω with three.
2. The learner switches to the six readings. Reading 1 is shown on the meter.
3. The learner chooses a diagnosis and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After reading 6 it shows the score.

**Feedback:** Six readings, fixed order, one attempt each. Correct: "Correct: <diagnosis>. <Why>". Incorrect: "Not quite. A reading of <value> means <diagnosis>. <Why>". The correct diagnosis is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the two end terminators on, the middle one off, and the meter reading 60 Ω.

**Chapter Anchors:** The chapter states that a healthy bus reads 60 Ω, that one terminator missing reads 120 Ω, that three read 40 Ω, and that the terminator value is 120 Ω. The sim has six readings and mastery is 5 of 6.
```

## Related Resources

- [Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md)
