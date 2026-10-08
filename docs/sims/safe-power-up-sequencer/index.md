---
title: "Safe Power-Up Sequencer"
description: "The learner will implement the safe power-up sequence by arranging seven shuffled steps in the correct order, with at least 6 of the 7 steps in their correct positions on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Safe Power-Up Sequencer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).

```text
Type: microsim
**sim-id:** safe-power-up-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** implement<br/>
**Learning Objective:** The learner will implement the safe power-up sequence by arranging seven shuffled steps in the correct order, with at least 6 of the 7 steps in their correct positions on the first attempt.

**Prerequisites:** work envelope, polarity, fuse, hardware E-stop, torque, simulation (all defined in the sections above this block).

**Evidence of Mastery:** The learner arranges the seven steps in a vertical list and commits with Check. A step is in the correct position when its position in the learner's list equals its position in the Content table. Mastery is 6 of 7 steps in the correct position on the first commit. Rearranging the list before committing is exploration, not evidence.

**Misconceptions:** (1) Power on first, then check. (The checks come before the supply is switched on.) (2) Simulating the program is optional. (It is step 3 and comes before any power.) (3) The E-stop can be reached for later. (Your hand is placed within reach before power is on.)

**Instructional Rationale:** An Apply-level implement objective for a procedure is met by performing the procedure in order. A sequencing activity requires the learner to retrieve the order and the reason for each step, and it exposes the common mistake of powering on before checking.

**Content:**

Seven steps, shown to the learner in this shuffled order: 5, 2, 7, 4, 1, 6, 3 (the numbers refer to the correct positions below).

| Correct position | Step text | Why this position (shown as feedback) |
|---|---|---|
| 1 | Clear the work envelope of people, loose cables and objects | Start with the cheapest, most reversible check, and keep people out before anything has power. |
| 2 | Check the voltage label, the polarity and the fuse | A wrong voltage or polarity is the fault that can damage parts the moment power is on. |
| 3 | Run the program against the fake arm with no power | Errors in the program are cheap to find in simulation and dangerous to find on a powered arm. |
| 4 | Park the arm in its home pose, supported if it might sag | The arm should start from a known, safe pose when the torque comes on. |
| 5 | Place your hand within reach of the released E-stop | The stop must be reachable before anything can move. |
| 6 | Switch on the power supply and watch and listen | Power goes on only after every earlier check has passed. |
| 7 | Enable the motors and make one small, slow move | The first motion is small and slow so that a surprise costs little. |

**Provenance:** The steps and their order are from the chapter section "Safe Power-Up Sequence".

**Rules:** The learner can move any step up or down in the list. The list is scored once, when the learner commits with Check. The score is the count of steps whose position equals the correct position. After the reveal, the learner can reset to a new shuffle but the score of the first commit stays recorded as the evidence.

**Learner Activity:**

1. The learner sees the seven steps in the shuffled order.
2. The learner moves steps up and down until the list matches the order they believe is correct.
3. The learner presses Check to commit.
4. The sim marks each step as in the correct position or not, shows the correct list with each Why text, and shows the score.
5. The learner can press Shuffle to practise again. Only the first commit counts as evidence.

**Feedback:** One arrangement, one attempt for the evidence score. Correct position: "Step <n>: in the right place. <Why>". Wrong position: "Step <text> belongs at position <n>. <Why>". The correct list is revealed after the commit. The final line is "Steps in the correct position: n of 7" and says whether mastery (6 of 7) was reached.

**Starting State:** The seven steps in the shuffled order, with the prompt "Put the steps in the order you would do them before the first power-up."

**Chapter Anchors:** The chapter's list has seven steps in this order: clear the envelope, check label, polarity and fuse, simulate, park home, hand near the E-stop, switch on the supply, enable one small slow move. The chapter says the checks come before power. The sim has seven steps and mastery is 6 of 7.
```

## Related Resources

- [Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md)
