# Quiz: Optional Advanced Chapter: The Mathematics of Arm Paths

Test your understanding of rotations, damped least squares, polynomial trajectories, torque margins, RRT planning, and path prediction with these review questions.

---

#### 1. What is jerk?

<div class="upper-alpha" markdown>
1. The rate of change of position
2. The rate of change of speed
3. The rate of change of acceleration
4. The rate of change of torque
</div>

??? question "Show Answer"
    The correct answer is **C**. Speed is the rate of change of position, acceleration is the rate of change of speed, and jerk is the rate of change of acceleration. It measures how suddenly the acceleration itself changes, and so how hard the arm is jolted. A joint standing still has a flat position curve, and a trajectory with a jump in acceleration has an infinite jerk for an instant.

    **Concept Tested:** Derivative as Rate of Change

    **See:** [Derivative as Rate of Change](index.md#derivative-as-rate-of-change)

---

#### 2. What is gimbal lock in Euler angles?

<div class="upper-alpha" markdown>
1. When the middle angle is ±90°, the first and third turns act about the same axis, and one degree of freedom is lost
2. When two quaternions have the same length
3. When a rotation is written as a single turn about one axis
4. When the pseudoinverse of a Jacobian does not exist
</div>

??? question "Show Answer"
    The correct answer is **A**. With a yaw, pitch, and roll sequence, a pitch of ±90° makes the yaw and roll act about the same axis. In the lab, a yaw of 0.5 rad with a roll of 0.2 rad and a pitch of 90° is exactly the same rotation as a yaw of 0.3 rad with no roll, and the two original angles cannot be recovered from the matrix. Quaternions and axis-angle forms avoid it, which is why robot libraries use quaternions inside.

    **Concept Tested:** Euler Angles and Gimbal Lock

    **See:** [Euler Angles and Gimbal Lock](index.md#euler-angles-and-gimbal-lock)

---

#### 3. Why is damped least squares (DLS) safer than the Jacobian pseudoinverse near a singular pose?

<div class="upper-alpha" markdown>
1. DLS always solves the problem in a single step
2. DLS bounds the largest gain to about 1/(2λ), while the pseudoinverse can reach 1/σ_min, which grows without limit as σ_min approaches zero
3. DLS ignores the error between the tip and the target
4. DLS uses quaternions instead of matrices
</div>

??? question "Show Answer"
    The correct answer is **B**. Near a singular pose, the Jacobian has a tiny singular value, and its pseudoinverse has a huge one, so a small error in the unlucky direction asks for an enormous joint motion. In the lab, the pseudoinverse winds the elbow to 814° for an unreachable target, with one step as large as 427.6°, while DLS takes steps of at most 4.6° and settles at the nearest reachable point. DLS trades a little exactness for a lot of safety.

    **Concept Tested:** Jacobian-Based IK

    **See:** [Jacobian-Based IK, the Pseudoinverse and Damped Least Squares](index.md#jacobian-based-ik-the-pseudoinverse-and-damped-least-squares)

---

#### 4. Why is a quintic polynomial trajectory gentler at its ends than a cubic one?

<div class="upper-alpha" markdown>
1. A quintic has fewer coefficients, so it is simpler
2. A quintic always moves faster
3. A quintic ignores the boundary conditions
4. A quintic can fix the acceleration at both ends, while a cubic's acceleration jumps from zero to a large value at the start
</div>

??? question "Show Answer"
    The correct answer is **D**. A polynomial of degree n has n + 1 coefficients, so it can meet n + 1 boundary conditions. A cubic meets four (position and speed at both ends), while a quintic meets six, adding the acceleration at both ends. For a rest-to-rest cubic, the acceleration starts at 6Δ/T², which is an instantly large force and a jolt. The quintic with zero acceleration at both ends builds up force gradually, and it is exactly the minimum-jerk trajectory.

    **Concept Tested:** Quintic Polynomial Trajectory

    **See:** [Quintic Polynomial Trajectory](index.md#quintic-polynomial-trajectory)

---

#### 5. A minimum-jerk move has a peak speed of 0.8 units/s and a peak acceleration of 2.4 units/s². The duration is stretched to three times as long with the same path. What are the new peak speed and peak acceleration?

<div class="upper-alpha" markdown>
1. Speed 0.267, acceleration 0.800
2. Speed 0.267, acceleration 0.089
3. Speed 0.089, acceleration 0.267
4. Speed 0.267, acceleration 0.267
</div>

??? question "Show Answer"
    The correct answer is **D**. If the duration T becomes kT, speeds fall by a factor of k, accelerations by k², and jerks by k³. With k = 3, the speed is 0.8 / 3 ≈ 0.267 and the acceleration is 2.4 / 9 ≈ 0.267. In the lab, doubling the duration halves the peak speed and quarters the peak acceleration. Option B divides the acceleration by 27, which is the factor for jerk.

    **Concept Tested:** Time Scaling

    **See:** [Time Scaling and Velocity Limit Scaling](index.md#time-scaling-and-velocity-limit-scaling)

---

#### 6. A minimum-jerk move of 90 degrees must keep its peak speed under 60 degrees per second. The peak speed is 1.875Δ/T. What is the shortest duration that meets the limit?

<div class="upper-alpha" markdown>
1. About 2.81 seconds
2. About 1.50 seconds
3. About 3.75 seconds
4. About 1.88 seconds
</div>

??? question "Show Answer"
    The correct answer is **A**. Solving 1.875Δ/T ≤ v_max for T gives T = 1.875 × 90 / 60 = 2.8125 seconds. A shorter time would make the peak speed exceed the limit. For an acceleration limit the shortest duration is T = √(5.77Δ/a_max), and you take the larger of the two answers. When several joints must arrive together, the slowest joint sets the common duration, and the others are slowed to match.

    **Concept Tested:** Velocity Limit Scaling

    **See:** [Time Scaling and Velocity Limit Scaling](index.md#time-scaling-and-velocity-limit-scaling)

---

#### 7. A servo has a stall torque of 1.913 N·m, and a pose puts a static load of 0.6 N·m on its joint. What is the servo torque margin?

<div class="upper-alpha" markdown>
1. About 0.31
2. About 3.2
3. About 1.15
4. About 2.0
</div>

??? question "Show Answer"
    The correct answer is **B**. The margin is the stall torque divided by the load: 1.913 / 0.6 ≈ 3.2. Below 1 the servo cannot hold the load. A margin of at least 2 is a comfortable classroom target, since a joint working near its stall torque draws a large current and heats up, though the figure of 2 is a rule of thumb and not a manufacturer's number. Option A inverts the ratio.

    **Concept Tested:** Servo Torque Margin

    **See:** [Servo Torque Margin](index.md#servo-torque-margin)

---

#### 8. The predicted and measured tip paths look the same on a plot, yet the tracking error has an RMSE of 16.2 mm and a maximum of 25.8 mm near the middle of the move. What explains this?

<div class="upper-alpha" markdown>
1. The planner chose the wrong route in space
2. The inverse kinematics failed
3. A lagging joint travels the same route but later, so the error is in the timing, and it is largest where the speed is highest
4. The plot was drawn in the wrong coordinate frame
</div>

??? question "Show Answer"
    The correct answer is **C**. A lagging joint closes only a fraction of the remaining gap at each step, so at each instant the arm is a little behind where the plan says it should be. The path in space is the same, but the trajectory, which includes timing, differs. This is the difference between a path and a trajectory once more. The error peaks near the middle of the move, where the speed is highest, because the lag error grows with speed.

    **Concept Tested:** Predicted vs Measured Path

    **See:** [Predicted vs Measured Path, Tracking Error, RMSE and Maximum Deviation](index.md#predicted-vs-measured-path-tracking-error-rmse-and-maximum-deviation)

---

#### 9. The lab measures each error source alone: servo lag, delay, calibration offset, gear backlash, and sensor noise. After fitting the time constant and delay of the lag model, which source can the fit NOT remove?

<div class="upper-alpha" markdown>
1. The calibration offset, because it is a constant that needs the calibration of Chapter 8
2. The servo lag, because it changes with speed
3. The delay, because it is too small to measure
4. The time constant, because it is built into the servo
</div>

??? question "Show Answer"
    The correct answer is **A**. The lag dominates at 12.75 mm RMSE, and the fit captures it, which cuts the total RMSE from 16.2 mm to 0.81 mm. A calibration offset of 1° contributes 5.45 mm RMSE, and no fit of lag and delay can remove a constant. Backlash and sensor noise set the floor. A slower move reduces the lag error, which grows with speed, and leaves the constant errors as they were.

    **Concept Tested:** Prediction Error Sources

    **See:** [Prediction Error Sources](index.md#prediction-error-sources)

---

#### 10. An RRT planner finds a path around an obstacle, and shortcut smoothing then cuts it from 64 points to 6. Which judgment of the result is best?

<div class="upper-alpha" markdown>
1. The shorter path is safe, because it was built from points the planner had already tested
2. The path is a plan only after a safety check walks every segment at a resolution finer than the smallest obstacle, because shortcuts join points the planner never connected
3. The smoothed path is unusable, because smoothing always makes paths longer
4. The RRT path should be discarded, because the algorithm finds only the shortest path
</div>

??? question "Show Answer"
    The correct answer is **B**. A shortcut joins two points with a straight segment that the planner never tested, and that segment may touch the obstacle. The path safety check walks every segment of the final path at a fine resolution, such as 1.5°, and tests every sample for collisions and limits. A coarse check can step over a thin obstacle. A path that has not been checked at this level is not a plan, only a hope. RRT finds a path if one exists, but not the shortest one.

    **Concept Tested:** Path Safety Check

    **See:** [Path Smoothing, Shortcut Smoothing and the Path Safety Check](index.md#path-smoothing-shortcut-smoothing-and-the-path-safety-check)
