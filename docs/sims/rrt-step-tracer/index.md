---
title: "RRT Step Tracer"
description: "The learner will execute one step of the RRT algorithm by hand, finding the distance to the nearest node and the coordinates of the new node, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# RRT Step Tracer



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md).

```text
Type: microsim
**sim-id:** rrt-step-tracer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** execute<br/>
**Learning Objective:** The learner will execute one step of the RRT algorithm by hand, finding the distance to the nearest node and the coordinates of the new node, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** configuration space, tree, nearest node, step size, steering (all defined in the section "Planning Around Obstacles" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Moving the nodes and the random point in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The new node is the random point. (It is a fixed step from the nearest node toward the random point, unless the point is nearer than a step.) (2) The nearest node is the most recent one. (It is the one at the smallest distance from the random point.) (3) The step moves the tree toward the goal. (It moves toward the random point.)

**Instructional Rationale:** An Apply-level execute objective asks the learner to carry out a procedure. The step has three small parts (nearest, direction, step), and doing them by hand on easy numbers shows what the planner does thousands of times.

**Content:**

Explore mode shows a grid of the configuration space (in units of 10 degrees), a few tree nodes, one random point, and the step size, with the nearest node, the distance and the new node drawn. Formulas: distance = the square root of (dx^2 + dy^2); the new node = the nearest node + step x (dx, dy) / distance, when the distance is larger than the step, and the random point itself otherwise. No obstacles are used in the problems.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Step size | 0.5 | 3.0 | 0.5 | 1.0 | grid units |
| Random point x | 0 | 10 | 0.1 | 3.0 | grid units |
| Random point y | 0 | 10 | 0.1 | 4.0 | grid units |

Six problems in this fixed order. A grid unit is 10 degrees.

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | The tree has one node at (0, 0). The random point is (3, 4) and the step is 1. What is the x of the new node? | grid units | 0.6 | The distance is 5, so the new node is (0, 0) + 1 x (3, 4) / 5 = (0.6, 0.8). |
| 2 | The same step. What is the y of the new node? | grid units | 0.8 | The y part of (0.6, 0.8) is 0.8. |
| 3 | The tree has nodes at (0, 0) and (4, 0). The random point is (6, 3). How far is the nearest node from the random point? | grid units | 3.6 | (4, 0) is nearest: the distance is the square root of (4 + 9) = 3.6. |
| 4 | The same tree, point and a step of 1. What is the x of the new node? | grid units | 4.6 | The new node is (4, 0) + 1 x (2, 3) / 3.606 = (4.555, 0.832), so x is 4.6. |
| 5 | The tree has one node at (2, 2). The random point is (2.3, 2.4) and the step is 1. What is the x of the new node? | grid units | 2.3 | The point is only 0.5 away, nearer than a step, so the new node is the random point itself. |
| 6 | The tree has nodes at (0, 0) and (5, 5). The random point is (6, 8) and the step is 2. What is the y of the new node? | grid units | 6.9 | (5, 5) is nearest, at a distance of 3.162. The new node is (5, 5) + 2 x (1, 3) / 3.162 = (5.632, 6.897), so y is 6.9. |

**Provenance:** The step is the RRT step described in the chapter section "Sampling-Based Planning and the RRT Algorithm" (LaValle 1998), without obstacles. The problems are illustrative and written for this sim.

**Rules:** distance = the square root of (dx^2 + dy^2). new node = nearest + step x (dx, dy) / distance, if distance > step; otherwise the new node is the random point. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner moves the random point and the step size and watches the nearest node and the new node.
2. The learner switches to the six problems. Problem 1 is shown with its picture.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with one node at (0, 0), a random point at (3, 4) and a step of 1, showing the new node at (0.6, 0.8).

**Chapter Anchors:** The chapter's RRT draws a random configuration, finds the nearest node, steers a fixed step toward it, and keeps the new node if the segment is free. The sim has six problems and mastery is 5 of 6.
```

## Related Resources

- [Chapter 19: Optional Advanced Chapter: The Mathematics of Arm Paths](../../chapters/19-advanced-arm-path-mathematics/index.md)
