---
title: "PID Step Response"
description: "The learner will infer which gain change fixes a given step response (raise Kp, add Kd, add Ki, lower Ki, or no change) in five scenarios, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# PID Step Response



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md).

```text
Type: microsim
**sim-id:** pid-step-response<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer which gain change fixes a given step response (raise Kp, add Kd, add Ki, lower Ki, or no change) in five scenarios, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** position feedback, error, PID control, proportional, integral and derivative terms, overshoot, settling time, steady-state error (all defined in the section above this block).

**Evidence of Mastery:** For each of five scenarios the learner sees a plotted response and its gains and chooses one of five changes before the fix is applied. A choice is correct when it matches the Correct column in Content. Mastery is 4 of 5 correct on the first attempt. Moving the gain sliders in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A higher Kp is always better. (It overshoots when it is not braked.) (2) The integral term makes the response faster. (It removes a steady error and can add overshoot.) (3) The derivative term pushes toward the goal. (It brakes the motion.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from a symptom to a cause and a remedy. Showing the response curve with its numbers before the learner chooses links each symptom (slow, overshoot, steady error) to the one term that treats it.

**Content:**

The model is the toy joint from the chapter: unit inertia, friction 4, a goal of 90 degrees, and a time step of 0.01 s over 8 seconds. Each step: error = goal − angle; the integral sum adds error × 0.01; torque = Kp × error + Ki × sum − Kd × speed; speed += (torque − 4 × speed − gravity) × 0.01; angle += speed × 0.01. Gravity is 0 or 200. The units are made up and the sim labels them "illustrative".

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Kp | 0 | 100 | 5 | 40 | gain |
| Ki | 0 | 300 | 10 | 0 | gain |
| Kd | 0 | 30 | 1 | 0 | gain |
| Gravity | 0 | 200 | 200 | 0 | torque |

The five changes: "Raise Kp", "Add Kd", "Add Ki", "Lower Ki", "No change". Five scenarios in this fixed order:

| # | Gains and gravity | Observed response | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | Kp 5, Ki 0, Kd 0, gravity 0 | Overshoot 0.1%, settles in 2.09 s, final angle 90.0 | Raise Kp | The response is correct but sluggish, and a higher Kp pushes harder. |
| 2 | Kp 40, Ki 0, Kd 0, gravity 0 | Overshoot 34.7%, settles in 1.74 s | Add Kd | The joint arrives with speed and overshoots, and Kd brakes it. |
| 3 | Kp 40, Ki 0, Kd 10, gravity 200 | Overshoot 0.0%, never settles, final angle 85.0 | Add Ki | Gravity leaves a steady error of 5 degrees, which the integral term removes. |
| 4 | Kp 40, Ki 200, Kd 10, gravity 200 | Overshoot 55.1%, settles in 3.37 s, final angle 90.0 | Lower Ki | The integral has wound up and overshoots, so a smaller Ki is gentler. |
| 5 | Kp 40, Ki 0, Kd 10, gravity 0 | Overshoot 0.0%, settles in 1.12 s, final angle 90.0 | No change | Fast, no overshoot and no steady error. Leave it alone. |

**Provenance:** The model and the values are written for this sim and are the same as the chapter's table and the lab's `armlab/joint.py`. The values in the observed-response column were computed from that model.

**Rules:** Overshoot = (maximum angle − 90) / 90 × 100, floored at 0. Settling time is the earliest time after which the angle stays within 2 percent (±1.8 degrees) of 90, and "never" means it has not settled by 8 seconds. The final angle is the value at 8 seconds. In Explore mode the plot and these three numbers update as the sliders move, and the plot shows the 2 percent band.

**Learner Activity:**

1. In Explore mode the learner moves the sliders and the gravity switch and watches the curve and the three numbers. The learner should notice that Kd calms oscillation, that gravity leaves a gap, and that Ki closes it.
2. The learner switches to the five scenarios. Scenario 1 shows its gains and its plotted response.
3. The learner chooses one of the five changes and commits.
4. The sim applies the change, plots the new response next to the old one, and shows whether the answer was correct and the Why text. After scenario 5 it shows the score.

**Feedback:** Five scenarios, fixed order, one attempt each. Correct: "Correct: <change>. <Why>". Incorrect: "Not quite. The best change is <change>. <Why>". The correct change is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with Kp 40, Ki 0, Kd 0 and no gravity, showing the 34.7 percent overshoot.

**Chapter Anchors:** The chapter's table lists cases A to E with the numbers above (2.09 s, 34.7%, 1.12 s, a final angle of 85.0, and 35.5%). The sim has five scenarios and mastery is 4 of 5.
```

## Related Resources

- [Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md)
