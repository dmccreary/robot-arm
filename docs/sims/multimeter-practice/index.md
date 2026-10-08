---
title: "Multimeter Practice"
description: "The learner will use a virtual multimeter by choosing the correct mode, power state and connection for six measuring tasks from this book's circuits, with at least 5 of 6 tasks fully correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Multimeter Practice



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 7: 3D Printing, Fasteners, and Tools](../../chapters/07-printing-fasteners-and-tools/index.md).

```text
Type: microsim
**sim-id:** multimeter-practice<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** use<br/>
**Learning Objective:** The learner will use a virtual multimeter by choosing the correct mode, power state and connection for six measuring tasks from this book's circuits, with at least 5 of 6 tasks fully correct on the first attempt.

**Prerequisites:** multimeter, DC voltage, resistance, continuity, DC current, parallel and series connection, CAN termination (all defined in the sections above this block and in Chapters 3 and 4).

**Evidence of Mastery:** For each of six tasks the learner sets three choices (the meter's mode, whether the circuit's power is on or off, and whether the meter is connected across the points or in series with the wire) and commits. A task is fully correct when all three match the Correct row in Content. Mastery is 5 of 6 tasks fully correct on the first attempt. Trying settings in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Current is measured across two points, like voltage. (It is measured in series, by opening the circuit.) (2) Resistance can be measured in a live circuit. (The power must be off.) (3) Continuity is the same as voltage. (It tests for a connection and needs the power off.)

**Instructional Rationale:** An Apply-level use objective needs the learner to carry out a procedure, so the sim makes the learner set every part of a measurement, and shows what the meter would read, so a wrong setting produces a visible wrong result.

**Content:**

The meter has five modes: "DC voltage", "AC voltage", "Resistance", "Continuity", "DC current". The power choices are "Power on" and "Power off". The connection choices are "Across the points" and "In series (open the wire)". In Explore mode the learner can set the meter any way and choose any of the six circuits, and the sim shows what the display would read, or the warning "Short circuit: the fuse would blow" when the setting is wrong.

Six tasks in this fixed order:

| # | Task | Mode | Power | Connection | Expected reading | Why (shown as feedback) |
|---|---|---|---|---|---|---|
| 1 | Check that the 5 V arm supply gives about 5 V at its plug. | DC voltage | Power on | Across the points | About 5 V | Voltage is a difference between two points, so the probes go across them with the supply running. |
| 2 | Check that one wire of a servo cable has no break. | Continuity | Power off | Across the points | A beep | Continuity needs the power off and the probes at the two ends of the wire. |
| 3 | Check the CAN bus terminators of the reBot-DevArm bus. | Resistance | Power off | Across the points | About 60 Ω | Resistance is measured with the power off, across CAN_H and CAN_L, and two 120 Ω terminators in parallel give 60 Ω. |
| 4 | Check whether a fuse is blown. | Continuity | Power off | Across the points | A beep if the fuse is good | A good fuse is a connection, so it beeps, and an open fuse is silent. |
| 5 | Check whether the red and black supply wires touch each other. | Continuity | Power off | Across the points | Silence if they are apart | Continuity between the two supply wires means they touch, which is a short. |
| 6 | Find out how much current the arm draws from its supply. | DC current | Power on | In series (open the wire) | A current in amperes | Current flows through the wire, so the wire is opened and the meter is put in the gap. |

**Provenance:** The modes, connections and the power rules are from the chapter section "The Multimeter". Task 1 uses the 5 V supply from Chapter 3. Task 3 uses the 60 Ω reading from Chapter 4. The tasks are illustrative situations written for this sim.

**Rules:** Each task has exactly one correct combination of mode, power and connection. A combination is fully correct only when all three choices are correct. The sim does not give partial credit. In Explore mode, current mode with the connection "Across the points" on a powered circuit shows the "Short circuit" warning, and resistance mode with the power on shows "Reading is not valid".

**Learner Activity:**

1. In Explore mode the learner tries the modes on the circuits and reads the display. The learner should notice the warnings for current mode across a supply and for resistance on a powered circuit.
2. The learner switches to the six tasks. Task 1 is shown.
3. The learner sets the mode, the power state and the connection, and commits.
4. The sim shows whether all three were correct, the reading, and the Why text, then moves on. After task 6 it shows the score.

**Feedback:** Six tasks, fixed order, one attempt each. Correct: "Correct: <mode>, <power>, <connection>. <Why>". Incorrect: "Not quite. This task needs <mode>, <power>, <connection>. <Why>". The correct setting is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the meter in DC voltage mode on the 5 V supply circuit, showing about 5 V.

**Chapter Anchors:** The chapter lists four modes (DC voltage, resistance, continuity, DC current) in a table and states that voltage is measured across two points, that current is measured in series, and that resistance needs the power off. The sim has six tasks, a task needs all three choices correct, and mastery is 5 of 6.
```

## Related Resources

- [Chapter 7: 3D Printing, Fasteners, and Tools](../../chapters/07-printing-fasteners-and-tools/index.md)
