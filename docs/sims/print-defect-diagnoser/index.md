---
title: "Print Defect Diagnoser"
description: "The learner will distinguish five common FDM print faults from eight written descriptions of failed prints, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Print Defect Diagnoser



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 7: 3D Printing, Fasteners, and Tools](../../chapters/07-printing-fasteners-and-tools/index.md).

```text
Type: microsim
**sim-id:** print-defect-diagnoser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** distinguish<br/>
**Learning Objective:** The learner will distinguish five common FDM print faults from eight written descriptions of failed prints, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** FDM printer, nozzle, bed, layer, filament, warping, support material, print quality inspection, and the five faults in the table above this block (all defined in the sections above).

**Evidence of Mastery:** For each of eight descriptions the learner chooses one of five faults and commits. A choice is correct when it matches the Fault column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the fault table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every print failure comes from the settings. (Several come from the machine: a loose belt or a tangled spool.) (2) A curled corner is harmless. (It can knock the nozzle and cause a layer shift.) (3) Stringing and under-extrusion are the same fault. (One has too much plastic where there should be none, and the other too little where there should be some.)

**Instructional Rationale:** An Analyze-level distinguish objective asks the learner to tell similar-looking cases apart by the evidence. Each description is a short symptom with no label, so the learner must decide which feature separates one fault from another.

**Content:**

The five faults: "Warping", "Stringing", "Under-extrusion", "Layer shift", "Poor first layer". Eight descriptions in this fixed order. Each is an illustrative description written for this sim, and the sim labels the set "illustrative".

| # | Description shown to the learner | Fault | Why (shown as feedback) |
|---|---|---|---|
| 1 | The corners of a large flat part have lifted off the bed and the part rocks when touched. | Warping | Corners that lift as the plastic cools and shrinks are warping. |
| 2 | Thin hairs of plastic stretch between two posts that were meant to be separate. | Stringing | Hairs between separate features come from plastic oozing while the nozzle travels. |
| 3 | The walls have visible gaps between the lines and the part snaps easily. | Under-extrusion | Gaps and thin walls mean too little plastic was pushed. |
| 4 | The top half of a tall part sits 3 mm to one side of the bottom half, and every layer above one height is displaced the same way. | Layer shift | A sudden sideways displacement that continues up the part is a layer shift. |
| 5 | The first layer came off the bed as loose strands, and the lines were squashed flat on one side of the bed and barely touching on the other. | Poor first layer | An uneven first layer across the bed points to a bed that is not level. |
| 6 | A long thin part was flat for the first hour, and by the end its ends bowed upward and the lower layers had split apart. | Warping | Bowing and split layers appear as the cooling part shrinks and pulls itself up. |
| 7 | Halfway through the print the extruder started clicking, and the later layers have holes and look thin. | Under-extrusion | A clicking extruder means the filament is not feeding, so the later layers got too little plastic. |
| 8 | After the nozzle struck a curled-up corner, every later layer is displaced about 3 mm along one axis. | Layer shift | A hit on the nozzle moved the print relative to the machine, so the layers above are shifted. |

**Provenance:** The fault names, causes and remedies are from the chapter section "Print Quality Inspection". The eight descriptions are illustrative and written for this sim.

**Rules:** Each description has exactly one correct fault. The five faults are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the five faults, each with its cause and remedy, in a list.
2. The learner switches to the eight descriptions. Description 1 is shown.
3. The learner chooses a fault and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After description 8 it shows the score and lists the faults that were missed.

**Feedback:** Eight descriptions, fixed order, one attempt each. Correct: "Correct: <fault>. <Why>". Incorrect: "Not quite. This is <fault>. <Why>". The correct fault is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the five faults listed and the prompt "Which fault is this?" ready for the first description.

**Chapter Anchors:** The chapter's table lists the five faults (warping, stringing, under-extrusion, layer shift, poor first layer) with a cause and a remedy for each. The sim has eight descriptions and mastery is 7 of 8.
```

## Related Resources

- [Chapter 7: 3D Printing, Fasteners, and Tools](../../chapters/07-printing-fasteners-and-tools/index.md)
