# Quiz: Kinematics: Where Is the Hand and How Do I Get There

Test your understanding of transforms, forward and inverse kinematics, the Jacobian, singularities, and Cartesian motion with these review questions.

---

#### 1. How do forward kinematics and inverse kinematics differ in the number of answers they give?

<div class="upper-alpha" markdown>
1. Forward kinematics has exactly one answer for a set of joint angles, and inverse kinematics can have many answers or none
2. Forward kinematics can have many answers, and inverse kinematics always has exactly one
3. Both always have exactly one answer
4. Both can have many answers for the same input
</div>

??? question "Show Answer"
    The correct answer is **A**. Forward kinematics computes the hand's position from the joint angles, and one set of angles gives one hand position. Inverse kinematics turns the question around, and a target can be reached by several joint sets, as with elbow up and elbow down, or by none when it is outside the workspace. Most of the interesting problems in the chapter live in the inverse direction.

    **Concept Tested:** Forward Kinematics

    **See:** [Forward Kinematics](index.md#forward-kinematics)

---

#### 2. What does a homogeneous transform combine in one 4 by 4 matrix?

<div class="upper-alpha" markdown>
1. A position and a velocity
2. Two separate rotations about different axes
3. A rotation and a translation, so that a point can be rotated and then moved in a single multiplication
4. A joint angle and a joint torque
</div>

??? question "Show Answer"
    The correct answer is **C**. A rotation turns but cannot move, and moving is an addition, so combining the two normally takes two operations. A homogeneous transform places the 3 by 3 rotation in the top left, the translation in the top right, and a bottom row of 0, 0, 0, 1. To use it, you write a point as (x, y, z, 1), multiply, and drop the 1. The result is R·p + t.

    **Concept Tested:** Homogeneous Transform

    **See:** [Homogeneous Transforms](index.md#homogeneous-transforms)

---

#### 3. A flat two-link arm has both links 0.10 m long. With θ1 = 0° and θ2 = 90°, where is the tip, as (x, z)?

<div class="upper-alpha" markdown>
1. (0.200, 0.000) m
2. (0.100, 0.100) m
3. (0.000, 0.200) m
4. (0.141, 0.000) m
</div>

??? question "Show Answer"
    The correct answer is **B**. The forward kinematics formulas are x = l1·cos θ1 + l2·cos(θ1 + θ2) and z = l1·sin θ1 + l2·sin(θ1 + θ2). With θ1 = 0 and θ2 = 90°, x = 0.1 + 0.1·cos 90° = 0.1 and z = 0 + 0.1·sin 90° = 0.1. The second link points at the sum of the two angles, because the elbow's bend is measured from the first link. Option A is the fully straight arm.

    **Concept Tested:** Two-Link Arm

    **See:** [Forward Kinematics](index.md#forward-kinematics)

---

#### 4. A two-link arm has l1 = 0.116 m and l2 = 0.135 m, and both joints can turn all the way around. Which target in its plane (x, z) is unreachable?

<div class="upper-alpha" markdown>
1. (0.10, 0.10) m
2. (0.15, 0.10) m
3. (0.25, 0.00) m
4. (0.20, 0.20) m
</div>

??? question "Show Answer"
    The correct answer is **D**. The reachable distances run from |l1 − l2| = 0.019 m to l1 + l2 = 0.251 m. The point (0.20, 0.20) is √(0.04 + 0.04) ≈ 0.283 m from the shoulder, beyond the full stretch of 0.251 m. The other points are at 0.141 m, 0.180 m, and 0.250 m, all inside the ring. For an unreachable target, the cosine in the formula is greater than 1 or less than −1, and the library raises an `UnreachableError`.

    **Concept Tested:** Unreachable Target

    **See:** [Unreachable Targets](index.md#unreachable-targets)

---

#### 5. A transform turns 90 degrees about z and then moves 0.2 m along x. Where does the point (0.1, 0, 0), given in the arm's own frame, end up in the base frame?

<div class="upper-alpha" markdown>
1. (0.2, 0.1, 0)
2. (0, 0.3, 0)
3. (0.3, 0, 0)
4. (0.1, 0.2, 0)
</div>

??? question "Show Answer"
    The correct answer is **A**. The transform rotates first and then moves, giving R·p + t. The point (0.1, 0, 0) is rotated to (0, 0.1, 0), and then moved 0.2 m along x to (0.2, 0.1, 0). Doing the same two steps in the other order, moving first and rotating second, gives (0, 0.3, 0), which is option B. Order matters, and it is the most common source of kinematics bugs.

    **Concept Tested:** Transform Chain

    **See:** [Homogeneous Transforms](index.md#homogeneous-transforms)

---

#### 6. Why does the closed-form inverse kinematics of a two-link arm give two solutions for most targets?

<div class="upper-alpha" markdown>
1. The two links have different lengths
2. The law of cosines gives cos θ2, and both +θ2 and −θ2 satisfy it, which are the elbow-down and elbow-up poses
3. The joint limits always allow two different angles
4. Numerical errors make the result unreliable
</div>

??? question "Show Answer"
    The correct answer is **B**. The cosine gives two angles of the same size and opposite sign, so the same hand position can be reached with the elbow above or below the line from the shoulder to the hand. For the target (0.15, 0.10) the solutions are θ2 = +88.5° with θ1 = −14.8°, and θ2 = −88.5° with θ1 = +82.2°. A program must pick one, usually the one nearest the present pose, and discard any solution outside the joint limits.

    **Concept Tested:** Multiple IK Solutions

    **See:** [Multiple Solutions and Elbow Up and Down](index.md#multiple-solutions-and-elbow-up-and-down)

---

#### 7. Why does the chapter warn that a straight arm is dangerous for Cartesian motion?

<div class="upper-alpha" markdown>
1. A straight arm cannot hold any load
2. A straight arm always collides with the table
3. Near full stretch the Jacobian becomes singular, so a tiny hand motion can demand a huge joint speed
4. The forward kinematics gives two answers for a straight arm
</div>

??? question "Show Answer"
    The correct answer is **C**. For the two-link arm, the Jacobian's determinant is l1·l2·sin θ2, which is zero when the elbow is straight or fully folded. At full stretch the hand cannot move along the arm, and near it the joint speeds needed grow without limit. The lab's table shows 17 and 23 degrees per second at θ2 = 90°, but thousands of degrees per second at 1°. Watch the condition number and let the speed limit catch what remains.

    **Concept Tested:** Singular Pose

    **See:** [Singular Poses](index.md#singular-poses)

---

#### 8. In the lab, moving each joint in a straight line in joint space strays 33.5 mm from a straight vertical line, while Cartesian motion with IK at every step strays 0.008 mm. What explains the difference?

<div class="upper-alpha" markdown>
1. Joint-space motion ignores the joint limits
2. Cartesian motion uses larger motors
3. Joint-space motion uses radians and Cartesian motion uses degrees
4. Equal steps in each joint angle do not move the hand in a straight line, so the path must be built from the hand's own positions
</div>

??? question "Show Answer"
    The correct answer is **D**. Joint-space interpolation (Chapter 11) moves every joint by the same fraction of its distance, which makes the hand follow a curve. Cartesian motion divides the line into small steps, solves inverse kinematics at each, and uses the previous answer as the next starting guess so the elbow does not flip. Use Cartesian motion when the hand must carry a full cup or slide along a wall, and joint-space motion when it just has to get from one pose to another.

    **Concept Tested:** Straight-Line Motion

    **See:** [Cartesian Motion and Straight-Line Motion](index.md#cartesian-motion-and-straight-line-motion)

---

#### 9. Numerical IK on the SO-101 for the tip target (0.25, 0.10) returns lift/elbow/wrist angles of [−63.12, 67.67, 25.66] from one starting guess, and [−75.45, 83.48, 10.57] from another. Which explanation fits?

<div class="upper-alpha" markdown>
1. The target has many solutions, and the solver returns whichever one is nearer its starting guess
2. One of the two answers must be wrong, because a target has only one solution
3. The solver ignores the joint limits in the second run
4. The forward kinematics changed between the two runs
</div>

??? question "Show Answer"
    The correct answer is **A**. The SO-101 has three joints in its plane, which is more than the two needed to place the tip, so many angle sets reach the same point. Numerical IK improves a guess step by step and stops at the nearest solution. Each answer was put back through forward kinematics and matched the target. The chapter's advice is to always run an IK answer forward to check it, whichever method produced it.

    **Concept Tested:** Numerical Inverse Kinematics

    **See:** [Numerical Inverse Kinematics and Orientation Control](index.md#numerical-inverse-kinematics-and-orientation-control)

---

#### 10. The solver cannot reach (0.25, 0.10) with the gripper pointing straight down, though it reaches that point easily with the gripper tilted. What does this show?

<div class="upper-alpha" markdown>
1. The target is outside the arm's reach no matter how the gripper points
2. Requiring an orientation uses up the spare joint, so the set of reachable points shrinks
3. The pitch is computed in radians and the target in degrees
4. The inverse kinematics code has a bug that appears only for downward grasps
</div>

??? question "Show Answer"
    The correct answer is **B**. Position alone leaves one joint free in the plane. Orientation control uses that extra joint to hold the gripper's pitch (lift + elbow + wrist) at a chosen value, such as 90 degrees for pointing straight down. With the extra freedom spent, fewer points can be reached. In the lab, the tip can reach 7 cm up at 0.20 m out with the gripper down but not 9 cm, and tilting to 60 degrees brings 13 cm into reach. That is why a pre-grasp approach sometimes tilts.

    **Concept Tested:** Orientation Control

    **See:** [Numerical Inverse Kinematics and Orientation Control](index.md#numerical-inverse-kinematics-and-orientation-control)
