---
title: "Workcell Hazard Spotter"
description: "The learner will distinguish pinch-point, collision, and electrical hazards from acceptable items in a desk robot-arm scene, in eight items, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Workcell Hazard Spotter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).

```text
Type: microsim
**sim-id:** workcell-hazard-spotter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** distinguish<br/>
**Learning Objective:** The learner will distinguish pinch-point, collision, and electrical hazards from acceptable items in a desk robot-arm scene, in eight items, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** pinch point, collision, safe work envelope, mains power safety, current rating, risk assessment (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight highlighted items in a top-view scene of a desk with an arm, the learner chooses one of four classes and commits. A choice is correct when it matches the Correct class column in Content. Mastery is 7 of 8 correct on the first attempt. Hovering over items to read their names is exploration, not evidence.

**Misconceptions:** (1) Only the gripper can pinch. (The elbow gap and loose clothing near a joint can too.) (2) Anything near the arm is a hazard. (A taped envelope and a reachable E-stop are good practice.) (3) Water near a power supply is only a spill risk. (It is an electrical hazard.)

**Instructional Rationale:** An Analyze-level distinguish objective asks the learner to tell categories apart on features, not on names. Presenting realistic items and requiring one of four classes forces attention to the mechanism of harm: trapping, striking, shocking, or none.

**Content:**

The scene is a top view of a desk with an SO-ARM101 follower inside a taped circle (the work envelope), a power supply and cable at one side, and a laptop. The four classes are: "Pinch point", "Collision", "Electrical", and "Acceptable". Eight items in this fixed order:

| # | Item shown | Correct class | Why (shown as feedback) |
|---|---|---|---|
| 1 | Gripper jaws closing on a block | Pinch point | Two jaws move toward each other and can trap a finger. |
| 2 | The gap between the forearm and the upper arm when the elbow folds | Pinch point | Two links move toward each other, trapping anything between them. |
| 3 | A laptop sitting inside the taped circle | Collision | The arm can sweep into it, damaging the laptop and the arm. |
| 4 | A cup of water beside the power supply | Electrical | Water near a supply and its connectors is an electrical hazard as well as a spill risk. |
| 5 | A power cable with cracked insulation held together with tape | Electrical | Damaged insulation can expose live conductors and overheat. |
| 6 | A long loose sleeve hanging near the base joint | Pinch point | Cloth can be drawn into a joint, trapping the arm or the person wearing it. |
| 7 | Tape on the table marking the work envelope, with nothing inside | Acceptable | The marked, clear envelope is good practice. |
| 8 | A hardware E-stop button on the table edge within easy reach | Acceptable | An E-stop that can be reached in one move is the intended arrangement. |

**Provenance:** The items are written for this sim from the chapter sections "Pinch Point", "Collision", "Safe Work Envelope", "Mains Power Safety" and "Emergency Stop". The scene is an illustration, not a photograph of a real desk, and the sim labels it "schematic".

**Rules:** An item is answered once. A click on empty space does not count as an answer. Each item has exactly one correct class. The score counts correct first answers.

**Learner Activity:**

1. In explore mode the learner hovers or clicks the eight items to read their names, with no classes shown.
2. The learner switches to the quiz. The sim highlights item 1.
3. The learner picks one of the four classes and commits.
4. The sim shows whether the choice was correct and the Why text, then moves to the next item.
5. After item 8 the sim shows the score and the eight items with their classes.

**Feedback:** Eight items, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This is <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** The scene is shown in explore mode with no item selected and the prompt "Click an item to read its name."

**Chapter Anchors:** The chapter names three hazard types in this sim (pinch point, collision, electrical) and that gripper, elbow gap and loose clothing can all pinch. The sim has eight items and mastery is 7 of 8.
```

## Related Resources

- [Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md)
