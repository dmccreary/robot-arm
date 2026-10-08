---
title: "Degrees of Freedom Counter"
description: "The learner will calculate the degrees of freedom of eight mechanisms by counting their independent single-axis joints, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Degrees of Freedom Counter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md).

```text
Type: microsim
**sim-id:** degrees-of-freedom-counter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the degrees of freedom of eight mechanisms by counting their independent single-axis joints, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** joint, revolute joint, prismatic joint, degree of freedom, the counting rule, gripper (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight mechanisms the sim lists its joints, and the learner commits a whole-number answer for its degrees of freedom. An answer is correct when it equals the Correct DOF column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the joint lists is exploration, not evidence.

**Misconceptions:** (1) A robot's DOF is the number of its links. (It is the number of independent joints.) (2) A gripper never counts. (The counting rule counts every independent single-axis joint listed, so it depends on which joints the mechanism includes.) (3) Prismatic joints do not count as degrees of freedom. (They count exactly like revolute joints.)

**Instructional Rationale:** Apply-level calculation needs practice with a rule on new cases, with an immediate check. Giving every joint explicitly removes ambiguity about the mechanism, so a wrong answer reveals a wrong rule and not a hidden assumption. The progression from one-joint mechanisms to the two real arms lets the learner meet the 5-versus-6 counting question with the rule already in hand.

**Content:**

The counting rule shown in the sim: DOF = the number of independent single-axis joints (revolute or prismatic) the mechanism includes.

Eight mechanisms in this fixed order:

| # | Mechanism | Joints listed | Correct DOF | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | A door on one hinge | 1 revolute (the hinge) | 1 | One joint, one independent motion: the door swings. |
| 2 | A drawer on one slide | 1 prismatic (the slide) | 1 | A prismatic joint counts like a revolute one: one joint, one DOF. |
| 3 | A flat two-link arm | 2 revolute (shoulder, elbow) | 2 | Two independent joints give two DOF. |
| 4 | A 3D-printer-style gantry | 3 prismatic (X, Y, Z slides) | 3 | Three independent slides give three DOF. |
| 5 | The SO-ARM101 follower, arm joints only | 5 revolute (shoulder pan, shoulder lift, elbow flex, wrist flex, wrist roll) | 5 | Five independent revolute joints. The gripper is not included in this mechanism. |
| 6 | The SO-ARM101 follower, with its gripper | 5 revolute arm joints + 1 gripper jaw joint (revolute) | 6 | The gripper's moving-jaw joint is a sixth independent joint. This is how LeRobot reaches "6 DOF". |
| 7 | The reBot-DevArm B601, arm joints only | 6 revolute | 6 | Six independent revolute joints. |
| 8 | The reBot-DevArm B601, with its parallel gripper | 6 revolute arm joints + 1 gripper finger joint (prismatic) | 7 | The gripper adds a seventh joint. The project calls this "6+1". |

**Provenance:** Mechanisms 1 to 4 are written for this sim. Mechanisms 5 and 6 follow the SO-ARM101 joint list in the LeRobot SO-101 documentation (six STS3215 motors named shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, and gripper). Mechanisms 7 and 8 follow the reBot-DevArm B601 project's published "6 DOF + gripper" specification, checked on 2026-10-07.

**Rules:** The correct DOF is the number of joints listed for the mechanism. The learner's answer is a whole number from 1 to 8 (minimum 1, maximum 8, step 1, unit "degrees of freedom"). No answer is selected at the start.

**Learner Activity:**

1. The sim shows mechanism 1 with its list of joints and the counting rule.
2. The learner chooses a number from 1 to 8 for the mechanism's DOF and commits.
3. The sim shows whether the answer was correct and the reason, then presents the next mechanism.
4. After mechanism 8, the sim shows the score and the eight mechanisms with their DOF side by side.

**Feedback:** Eight mechanisms, fixed order, one attempt each. Correct: "Correct: <number> DOF. <Why>". Incorrect: "Not quite. Count each independent joint once: this mechanism has <number> DOF. <Why>". The correct answer is revealed after each commitment. A running count "Correct: n of 8" is shown, and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Mechanism 1, a door on one hinge, is shown with the counting rule and the question "How many degrees of freedom does this mechanism have?"

**Chapter Anchors:** The chapter states the counting rule, that a free object has six degrees of freedom, that the SO-ARM101 has five arm joints plus a gripper joint (six in LeRobot's count), and that the reBot-DevArm B601 is a six-axis arm plus a parallel gripper ("6+1"). The sim has eight mechanisms and mastery is 7 of 8.
```

## Related Resources

- [Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md)
