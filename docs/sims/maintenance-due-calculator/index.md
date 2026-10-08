---
title: "Maintenance Due Calculator"
description: "The learner will calculate the hours left before a maintenance task is due, the percent of its interval used, and the weeks until it is due, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Maintenance Due Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md).

```text
Type: microsim
**sim-id:** maintenance-due-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the hours left before a maintenance task is due, the percent of its interval used, and the weeks until it is due, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** maintenance schedule, interval, hours of use, due and soon states (all defined in the section "Maintenance, Wear and Lubrication" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the hours in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The interval is counted in calendar days. (It is counted in hours of use.) (2) Hours left is the interval minus the hours now. (It is the interval minus the hours since the task was last done.) (3) An overdue task has zero hours left. (The number goes below zero.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of the same few formulas on new numbers with an immediate check. The problems mix the three formulas so that the learner has to choose the right one.

**Content:**

Explore mode shows the six tasks with their intervals, and two sliders for the hours of use now and the hours at which the task was last done, with the resulting state. Formulas: hours since = hours now - last done; hours left = interval - hours since (below zero when overdue); percent used = 100 x hours since / interval; weeks = hours left / hours per week. A task is "soon" at 80 percent used and "due" at 100 percent.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Hours of use now | 0 | 200 | 1 | 42 | hours |
| Last done at | 0 | 200 | 1 | 30 | hours |
| Interval | 10 | 100 | 5 | 10 | hours |

Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | Inspect cables (every 10 h) was last done at 34 h, and the arm is now at 41 h. How many hours are left before it is due? | hours | 3.0 | Hours since = 41 - 34 = 7, and 10 - 7 = 3.0 hours left. |
| 2 | Check calibration drift (every 25 h) was last done at 10 h, and the arm is now at 38 h. How many hours are left? (Use a negative number if it is overdue.) | hours | -3.0 | Hours since = 28, and 25 - 28 = -3.0, so it is 3 hours overdue. |
| 3 | Check servo play (every 50 h) was last done at 0 h, and the arm is now at 42 h. What percent of the interval is used? | percent | 84.0 | 100 x 42 / 50 = 84.0 percent, which is past the 80 percent mark, so it is "soon". |
| 4 | Full recalibration (every 100 h) was last done at 60 h, and the arm is now at 130 h. How many hours are left? | hours | 30.0 | Hours since = 70, and 100 - 70 = 30.0 hours left. |
| 5 | A class uses an arm for 6 hours a week, and "Check screws and connectors" (every 10 h) was just done. In how many weeks is it due? | weeks | 1.7 | 10 / 6 = 1.67, which rounds to 1.7 weeks. |
| 6 | Inspect printed parts (every 25 h) was last done 9.5 hours ago. What percent of the interval is used? | percent | 38.0 | 100 x 9.5 / 25 = 38.0 percent. |

**Provenance:** The tasks and intervals are the chapter's example schedule, which is not from a manufacturer. The problems are illustrative and written for this sim.

**Rules:** hours since = hours now - last done. hours left = interval - hours since. percent used = 100 x hours since / interval. weeks = hours left / hours per week. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner moves the two sliders and watches the hours left, the percent used and the state.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with 42 hours of use now, last done at 30 hours, and an interval of 10 hours, showing 12 hours since and a state of due.

**Chapter Anchors:** The chapter's schedule has intervals of 10, 10, 25, 25, 50 and 100 hours, marks a task soon at 80 percent of its interval, and says the intervals are examples and not a manufacturer's figures. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 18: Projects, Operation, and Teaching](../../chapters/18-projects-operation-and-teaching/index.md)
