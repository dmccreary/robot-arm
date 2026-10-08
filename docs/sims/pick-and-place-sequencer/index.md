---
title: "Pick and Place Sequencer"
description: "The learner will organize the eight steps of a pick-and-place task into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Pick and Place Sequencer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../../chapters/11-moving-the-arm/index.md).

```text
Type: microsim
**sim-id:** pick-and-place-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the eight steps of a pick-and-place task into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts.

**Prerequisites:** pick and place, pre-grasp approach, lift and retreat, gripper control, state machine (all defined in the section "The Pick-and-Place State Machine" above this block).

**Evidence of Mastery:** The learner arranges eight shuffled step cards into an order and presses Check. An arrangement is scored by the number of cards in their correct position, as given in the Position column in Content. Mastery is 7 or more of 8 cards in the correct position within three attempts. Reading the explanations in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The arm should go straight to the object's height from home. (It approaches from above first, so that the fingers do not hit the object.) (2) The gripper closes at the same time as the arm descends. (It closes after the arm has stopped at the object.) (3) The arm can move away as soon as the gripper opens. (It must retreat upward, clear of what it placed.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to structure the parts of a procedure by their dependencies. Ordering the cards forces the learner to reason about which step must happen before which, and the count of correct positions shows which dependency was missed.

**Content:**

The eight steps, with the correct position of each:

| Position | Step | Why it goes here (shown as feedback) |
|---|---|---|
| 1 | Move above the object with the gripper open. | The approach from above keeps the fingers clear of the object. |
| 2 | Descend to the object. | The fingers must surround the object before they close. |
| 3 | Close the gripper and check that it holds something. | The grasp is checked now, so that a miss is found before the move. |
| 4 | Lift straight up with the object. | Lifting first keeps the object clear of the table. |
| 5 | Move above the place. | The object travels at a safe height. |
| 6 | Lower to the place. | The object is put down gently. |
| 7 | Open the gripper. | The object is released only when it is in place. |
| 8 | Retreat upward. | The arm goes up before it moves away, so it does not knock the object. |

**Provenance:** The steps and their order are from the chapter section "The Pick-and-Place State Machine".

**Rules:** An arrangement has exactly one correct order, the one in the Position column. The score is the number of cards whose position equals their correct position. Mastery is a score of 7 or 8. The three attempts are separate: each attempt starts from the card order the learner left.

**Learner Activity:**

1. In Explore mode the learner reads the eight steps in the correct order, each with its explanation.
2. The learner switches to the exercise. The eight cards are shown in a shuffled order.
3. The learner moves the cards into the order they would do them and presses Check.
4. The sim shows the score and marks the cards that are in a wrong position, without revealing the right place for each. The learner can rearrange and check again, up to three attempts in all.
5. After the last attempt, or after a score of 8, the sim shows the correct order with the explanations.

**Feedback:** One exercise, up to three attempts. After each attempt: "<n> of 8 cards are in the right place." and the wrong cards are marked. After a score of 7 or 8: "Mastery reached." After the third attempt with a score below 7, the correct order is shown with the explanations, and the exercise counts as missed.

**Starting State:** Explore mode with the correct order shown, and the prompt "Put the steps in the order you would do them." ready for the exercise.

**Chapter Anchors:** The chapter's table has eight steps: approach, descend, grasp, lift, transport, lower, release and retreat. The sim has eight steps, three attempts, and mastery is 7 of 8 in the correct position.
```

## Related Resources

- [Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../../chapters/11-moving-the-arm/index.md)
