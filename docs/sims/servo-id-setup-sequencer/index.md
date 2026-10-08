---
title: "Servo ID Setup Sequencer"
description: "The learner will organize the eight steps of setting one servo's ID into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Servo ID Setup Sequencer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md).

```text
Type: microsim
**sim-id:** servo-id-setup-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the eight steps of setting one servo's ID into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts.

**Prerequisites:** servo bus controller board, setting servo IDs, setting the baud rate, serial port, EEPROM (all defined in the section above this block and in Chapter 4).

**Evidence of Mastery:** The learner arranges eight shuffled step cards into an order and presses Check. An arrangement is scored by the number of cards in their correct position, as given in the Position column in Content. Mastery is 7 or more of 8 cards in the correct position within three attempts. Reading the explanations of the steps in Explore mode is exploration, not evidence.

**Misconceptions:** (1) All six servos can be connected and given IDs together. (They all start with ID 1, so they must be connected one at a time.) (2) The ID is lost when the power is switched off. (It is stored in EEPROM and kept.) (3) The order of motors does not matter. (The command asks for the gripper first and the shoulder pan last, and each ID is tied to a joint.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to structure the parts of a procedure by their dependencies. Ordering shuffled cards forces the learner to reason about which step must come before which, and the count of correct positions shows which dependency was missed.

**Content:**

The eight steps, with the correct position of each:

| Position | Step | Why it goes here (shown as feedback) |
|---|---|---|
| 1 | Find the board's serial port with lerobot-find-port. | The setup command needs the port name, so you find it first. |
| 2 | Connect the power supply and the USB cable to the control board, with the jumpers on channel B. | The board must be powered and linked to the computer before it can talk to a servo. |
| 3 | Run lerobot-setup-motors with the robot type and the port. | The command is what writes the IDs, and it begins by asking for the first motor. |
| 4 | When it names a motor, connect that one servo, and only that one, to the board. | All new servos have ID 1, so two on the bus would answer at once. |
| 5 | Press Enter. | The command only starts looking for the motor after you confirm that it is connected. |
| 6 | Read the confirmation line "motor id set to" with the number. | The line confirms that the ID was written, so you know that this servo is done. |
| 7 | Label the servo with its ID and put it aside. | An unlabeled servo cannot be told apart from the others later. |
| 8 | Repeat for the next motor, in the order the command asks: gripper, wrist roll, wrist flex, elbow flex, shoulder lift, shoulder pan. | The command works from joint 6 back to joint 1, so the order is part of the procedure. |

**Provenance:** The steps and their order are from the chapter section "Servo Preparation, Testing, and IDs", which follows the LeRobot SO-101 guide read on 2026-10-07 (the commands, the prompts and the order gripper to shoulder pan).

**Rules:** An arrangement has exactly one correct order, the one in the Position column. The score is the number of cards whose position equals their correct position. Mastery is a score of 7 or 8. The three attempts are separate: each attempt starts from the card order the learner left.

**Learner Activity:**

1. In Explore mode the learner reads the eight steps in the correct order, each with its explanation.
2. The learner switches to the exercise. The eight cards are shown in a shuffled order.
3. The learner moves the cards into the order they would do them and presses Check.
4. The sim shows the score and marks the cards that are in a wrong position, without revealing the right place for each. The learner can rearrange and check again, up to three attempts in all.
5. After the last attempt, or after a score of 8, the sim shows the correct order with the explanations.

**Feedback:** One exercise, up to three attempts. After each attempt: "<n> of 8 cards are in the right place." and the wrong cards are marked. After a score of 7 or 8: "Mastery reached." After the third attempt with a score below 7, the correct order is shown with the explanations, and the exercise counts as missed.

**Starting State:** Explore mode with the correct order shown, and the prompt "Put the steps in the order you would do them." ready for the exercise.

**Chapter Anchors:** The chapter says the command works from the gripper back to the shoulder, that the servos must be connected one at a time because new servos all have ID 1, and that the ID is stored in EEPROM. The sim has eight steps, three attempts, and mastery is 7 of 8 in the correct position.
```

## Related Resources

- [Chapter 8: Building and Calibrating the SO-ARM100](../../chapters/08-building-the-so-arm/index.md)
