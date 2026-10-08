---
title: "Kinematics: Where Is the Hand and How Do I Get There"
description: "The geometry of an arm in Python: NumPy arrays, sine and cosine, vectors, coordinate frames, rotations and homogeneous transforms, forward kinematics of the SO-101 checked against its URDF, inverse kinematics in closed form and numerically, the Jacobian and singularities, straight-line Cartesian motion, workspace sampling, and collision checking."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 21:40:52"
version: 1.11
---

# Kinematics: Where Is the Hand and How Do I Get There

## Summary

This chapter explains how to describe where the hand is and how to move it to a target. It covers coordinate frames, transforms, forward and inverse kinematics, multiple solutions, singularities, the Jacobian, and Cartesian motion. After this chapter, you will be able to compute and use kinematics for a simple arm in Python.

## Concepts Covered

This chapter covers the following 27 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| NumPy Array | 307 |
| Sine and Cosine | 108 |
| Coordinate Frame | 106 |
| Cartesian Coordinates | 105 |
| Rotation | 104 |
| Rotation Matrix | 103 |
| Link Lengths | 95 |
| Vector | 94 |
| Homogeneous Transform | 93 |
| Transform Chain | 83 |
| Forward Kinematics | 81 |
| Inverse Kinematics | 19 |
| Jacobian | 17 |
| Collision Checking | 9 |
| Singular Pose | 5 |
| Cartesian Motion | 5 |
| Two-Link Arm | 4 |
| Numerical Inverse Kinematics | 4 |
| Geometric Inverse Kinematics | 3 |
| Workspace Sampling | 3 |
| Multiple IK Solutions | 2 |
| Straight-Line Motion | 2 |
| Denavit-Hartenberg Parameters | 1 |
| Elbow Up and Elbow Down | 1 |
| Unreachable Target | 1 |
| Orientation Control | 1 |
| Reachability Map | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../11-moving-the-arm/index.md)

---

!!! mascot-welcome "Where Is My Hand, Really?"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Until now you told me joint angles and hoped my hand ended up somewhere useful. In this chapter you will work out exactly where my hand is for any set of angles, and, even better, which angles put it exactly where you want. It is geometry with a purpose, and you will run it in Python. Let's move it!

In Chapter 11 you moved the arm by giving it joint angles, and the pick-and-place poses were guesses that happened to be inside the limits. A person does not think that way. A person says "pick up the block that is 20 centimetres in front of the base and 10 centimetres to the left". To follow such an order, a program has to answer two questions. The first is *forward kinematics*: if the joints have these angles, where is the hand? The second is *inverse kinematics*: if the hand must be at this point, what should the joint angles be? The first has exactly one answer. The second can have many answers, or none, and most of the interesting problems in this chapter live there.

The chapter starts with the mathematical tools, which are NumPy arrays, sine and cosine, and vectors, and then it adds the idea of a coordinate frame. It builds rotations and transforms, and chains them to compute forward kinematics for the SO-101, checked against the arm's own design file. Then it turns the problem around for inverse kinematics, and it ends with speed, the Jacobian, straight-line motion, and what the arm can reach without hitting anything. Everything runs on your computer with no arm attached.

## The Tools: Arrays, Angles, and Vectors

### NumPy Arrays

A **NumPy array** is a block of numbers that Python can calculate with all at once. The NumPy library is the standard tool for numerical work in Python, and it is the one new library of this chapter. You install it in your `arm-lab` environment with `python -m pip install numpy`. An array is made from a list: `np.array([3.0, 4.0])` is a one-dimensional array of two numbers, and `np.array([[1, 0], [0, 1]])` is a two-dimensional array (a matrix) with two rows and two columns. Its `shape` says how many numbers it has along each direction, and `.T` is its transpose, with rows and columns swapped.

The point of an array is that arithmetic works on all its numbers together. Adding two arrays adds them number by number, and multiplying an array by 2 doubles every number. A plain Python list would need a loop for each of these. Matrix multiplication is the `@` operator: `A @ B` multiplies two matrices, and `A @ v` applies a matrix to a vector. NumPy also has the functions this chapter needs, such as `np.sin`, `np.cos`, `np.arctan2`, `np.linalg.norm` for the length of a vector, `np.linalg.inv` for the inverse of a matrix, and `np.linalg.det` for its determinant.

```python linenums="1"
import numpy as np

a = np.array([3.0, 4.0])
b = np.array([1.0, -2.0])
print(a + b)                       # [4. 2.]
print(2 * a)                       # [6. 8.]
print(np.linalg.norm(a))           # 5.0, the length of the arrow from the origin to (3, 4)
R = np.array([[0.0, -1.0],
              [1.0, 0.0]])
print(R @ np.array([1.0, 0.0]))    # [0. 1.]
```

!!! mascot-tip "Print the Shape When Something Looks Wrong"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Most NumPy errors come from arrays with the wrong shape, such as a list of three numbers where a matrix of three rows was expected. When a calculation fails or gives odd numbers, print `.shape` of every array in it. It takes five seconds and usually shows the problem.

### Sine and Cosine

**Sine and cosine** turn an angle into a position. Imagine a point on a circle of radius \( r \), at an angle \( \theta \) counted counter-clockwise from the right-hand direction. Its horizontal position is \( x = r \cos\theta \) and its vertical position is \( y = r \sin\theta \). That is all an arm link is: a stick of length \( r \) that points at an angle. Chapter 10 told you that Python's `np.sin` and `np.cos` take *radians*, and the conversion is `np.radians`.

A worked example: the SO-101's forearm is about 0.135 m long. Pointing 30 degrees above horizontal, its far end is at \( x = 0.135 \cos 30^\circ = 0.117 \) m and \( z = 0.135 \sin 30^\circ = 0.0675 \) m from its near end. Run the other way, `np.arctan2(y, x)` gives the angle of a point, and it is better than dividing \( y \) by \( x \) because it works in all four quarters of the circle and when \( x \) is zero.

### Vectors

A **vector** is a quantity with a size and a direction, and in code it is an array of numbers: `np.array([x, y, z])` is a position in space or an arrow from the origin to that position. Vectors are added number by number, which matches walking along one arrow and then the next, and a vector's length is `np.linalg.norm(v)`, which is \( \sqrt{x^2 + y^2 + z^2} \). The distance between two points is the length of the vector between them. Everything in this chapter is a vector or a matrix: the position of the hand is a vector, a link is a vector from one joint to the next, and a rotation is a matrix that turns vectors.

## Where Things Are: Frames, Axes, and Link Lengths

### Cartesian Coordinates

**Cartesian coordinates** describe a point by how far it is along each of three perpendicular axes, called x, y and z, from a chosen starting point called the origin. This book uses the convention of robotics and of the SO-101's design files: x points forward from the base, y points to the left, and z points up. The three axes follow the right-hand rule: point the fingers of your right hand along x, curl them toward y, and your thumb points along z. Positions are in metres, which keeps them compatible with the URDF files of Chapter 13.

### Coordinate Frames

A **coordinate frame** is an origin together with a set of axes, and every position needs one to mean anything. "The hand is at (0.30, 0.10, 0.05)" is incomplete without "measured from where, along which axes". The **base frame** is attached to the arm's base and does not move (Chapter 2 introduced it). Each link of the arm has its own frame that moves with it. The gripper's frame, for instance, travels as the joints move. Much of kinematics is converting a position from one frame into another: where a point on the gripper is *in the base frame*, which is what you need to compare it with a point on the table. Pick one frame per problem, write its name next to every number, and the mistakes drop sharply.

### Link Lengths and the Two-Link Arm

The **link lengths** are the distances between a joint and the next one. The SO-101's design file (the `so101_new_calib.urdf` file in the SO-ARM100 repository's Simulation folder) gives the positions of every joint, and from its numbers the three links in the arm's vertical plane are about 116.0 mm for the upper arm (from the shoulder-lift axis to the elbow axis), 135.0 mm for the forearm, and 159.2 mm from the wrist-flex axis to the gripper's tip. They are not exact straight sticks: the upper arm leans about 14 degrees from the line between its joints, and the forearm about 2 degrees. And the real arm has small sideways offsets of 18 mm. The chapter therefore uses two models. A **two-link arm** is the simplest: two straight links of lengths \( l_1 \) and \( l_2 \) in a flat plane, with the upper arm at the angle \( \theta_1 \) from the horizontal and the forearm bent by \( \theta_2 \) at the elbow. It is the best model for understanding, and the SO-101's upper arm and forearm give \( l_1 = 0.116 \) m and \( l_2 = 0.135 \) m. For computing, the second model keeps the real offsets and uses transform chains, which come next.

!!! mascot-neutral "The Numbers Come From the Design File"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    Every length and offset in this chapter is read from the SO-101's own URDF design file, which Chapter 13 opens up in detail. The arm you build may differ by a millimetre or two, and a ruler on your own arm is the best check.

## Rotations and Transforms

### Rotation and the Rotation Matrix

A **rotation** turns a vector about a point or an axis without changing its length. In a plane, rotating a vector by an angle \( \theta \) counter-clockwise is a matrix multiplication, with the **rotation matrix**

\[ R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix} \]

Apply it to the vector (1, 0) with \( \theta = 90^\circ \) and you get (0, 1): the right-pointing arrow now points up. In three dimensions a rotation matrix is 3 by 3, and the three basic ones turn about the x, y and z axes. The one about z, for instance, is the same 2 by 2 block in the top left corner with a 1 in the last place. Rotation matrices have two properties that make them easy to trust. Multiplying one by its transpose gives the identity matrix, so the transpose *is* the inverse (turning back is the transpose), and the determinant is 1. The lab checks both. The `armlab/geometry.py` module holds `rot2`, `rot_z` and `rot_y`. The y-rotation carries x toward -z, which is the way the SO-101's shoulder, elbow and wrist joints bend the arm down for a positive angle.

### Homogeneous Transforms

A rotation turns, but it cannot move. Moving a point is adding a vector, and a rotation is a multiplication, so combining the two takes two operations. A **homogeneous transform** puts both in one 4 by 4 matrix: the 3 by 3 rotation in the top left, the translation in the top right, and a bottom row of 0, 0, 0, 1. To use it on a point \( (x, y, z) \), write the point as \( (x, y, z, 1) \), multiply, and drop the 1. The result is \( R\,p + t \): rotate first, then move.

A worked example: turn 90 degrees about z and then move 0.2 m along x. The point (0.1, 0, 0) in the arm's own frame goes to (0.2, 0.1, 0) in the base frame. It is rotated to (0, 0.1, 0) and then moved 0.2 m forward. The same two steps in the other order give (0, 0.3, 0): the point is moved to (0.3, 0, 0) and then rotated. **Order matters**, and it is the most common source of kinematics bugs. The lab prints both.

### Transform Chains

A **transform chain** is a product of transforms, one for each link and joint, from the base to the hand. Each link contributes two things in order: a rotation by the joint's angle, and a fixed move to the next joint. Multiplying them from left to right gives the position and the orientation of every later frame in the *base* frame. The first matrix acts last on a point, which is the order-matters rule again: the chain reads like a trip. Start at the base, go to the pan axis, turn, go to the shoulder, tilt, go to the elbow, bend, and so on, and each step is expressed in the frame you just reached.

Here is the SO-101 as such a chain, with distances in metres from the design file. The pan axis is 0.03884 m in front of the base origin. From the pan frame the shoulder-lift axis is at (0.03039, 0, 0.1166). From the upper arm's frame the elbow axis is at (0.028, 0, 0.11257), from the forearm's frame the wrist axis is at (0.1349, 0, 0.0052), and from the hand's frame the gripper's tip is at (0.15923, 0, -0.0079). The pan turns about the vertical axis (clockwise seen from above for a positive angle, because the design file points that axis downward), and the lift, elbow and wrist turn about the y axis. The small sideways offsets of the real arm are left out. The `so101_frames` function in the lab multiplies the chain together.

| Step | Fixed move to the next joint (m) | Then the next turn |
|---|---|---|
| Base to the pan axis | (0.03884, 0, 0) | Pan, about the vertical axis |
| Pan frame to the shoulder | (0.03039, 0, 0.1166) | Lift, about y |
| Upper arm to the elbow | (0.028, 0, 0.11257) | Elbow, about y |
| Forearm to the wrist | (0.1349, 0, 0.0052) | Wrist flex, about y |
| Wrist to the tip | (0.15923, 0, -0.0079) | None |

!!! mascot-thinking "A Chain Is Just a Trip"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Do not try to hold all the matrices in your head. Imagine walking along the arm: at each joint you turn by that joint's angle, then walk a fixed distance to the next one. Where you stand at the end is the hand. The matrix product is the same trip written down, and it gives the same answer every time.

### Denavit-Hartenberg Parameters

**Denavit-Hartenberg parameters** are an older and shorter way to describe a chain: four numbers per joint (an angle, an offset along the joint axis, a link length and a twist) that give the transform from one joint to the next by a fixed recipe. Textbooks use them, and some robot manuals publish them. The SO-101 and the reBot-DevArm are published as URDF files with positions and rotations, so this book uses those directly, and you will meet the four-number form only when you read an industrial arm's manual. The two descriptions hold the same information.

## Forward Kinematics

**Forward kinematics** computes the hand's position and orientation from the joint angles. With the tools above, it is the transform chain evaluated for a set of angles, and its answer is unique: one set of angles, one hand position. For the two-link arm it has a closed form:

\[ x = l_1 \cos\theta_1 + l_2 \cos(\theta_1 + \theta_2), \qquad z = l_1 \sin\theta_1 + l_2 \sin(\theta_1 + \theta_2) \]

The second link points at the *sum* of the two angles, because the elbow's bend is measured from the first link. A worked example with both links 0.10 m: \( \theta_1 = 30^\circ \) and \( \theta_2 = 60^\circ \) give \( x = 0.1 \cos 30^\circ + 0.1 \cos 90^\circ = 0.0866 \) m and \( z = 0.1 \sin 30^\circ + 0.1 \sin 90^\circ = 0.150 \) m.

For the SO-101, the check is against the arm's own design file. With every joint at zero, the chain puts the tip at (0.39136, 0, 0.22647), the same as the URDF's gripper frame. At a pose of pan 30, lift 20, elbow 40 and wrist -10 degrees it gives (0.2670, -0.1317, -0.0285), within 0.04 mm of the URDF's own result, which the author computed with a separate small program that reads the file. The zero pose is worth picturing: the SO-101's calibration puts zero in the middle of each joint's range, so the upper arm points nearly straight up and the forearm points straight forward. A positive lift tilts the arm forward and a positive elbow or wrist bends the part beyond it downward.

One caution that is simple to test. The signs here are the signs of the URDF. Whether your arm's calibrated angles use the same signs depends on how it was assembled and calibrated, so move one joint a few degrees with your program, watch which way it goes, and flip the sign in your configuration if it moves the wrong way. LeRobot's own kinematics support uses the same URDF: its `RobotKinematics` class (which needs the `placo` library, installed with the `kinematics` extra) takes joint angles in *degrees*, as the robot reports them, and returns a 4 by 4 transform.

#### Diagram: Transform Chain Calculator

<iframe src="../../sims/transform-chain-calculator/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Transform Chain Calculator MicroSim fullscreen](../../sims/transform-chain-calculator/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Transform Chain Calculator</summary>
Type: microsim
**sim-id:** transform-chain-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the tip position of a flat two-link arm from its joint angles using the forward kinematics equations, to within 0.001 m, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** sine and cosine, vector, two-link arm, link lengths, forward kinematics (all defined in the sections above this block).

**Evidence of Mastery:** For each of six problems the learner types one coordinate of the tip in metres and commits. An answer is correct when it is within 0.001 m of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Moving the arm's joints in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The second link points at the angle theta2 alone. (It points at theta1 plus theta2.) (2) Angles can be typed in degrees into sine and cosine. (They must be converted to radians first, in code.) (3) The tip position is the sum of the two angles. (It is the sum of two vectors.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. Showing the two links as vectors that add makes the formula's structure visible.

**Content:**

Explore mode shows a flat two-link arm with both links 0.10 m long, and two angles the learner can change. It shows the two link vectors adding up to the tip position, with x forward and z up.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| theta1 | -90 | 180 | 5 | 30 | degrees |
| theta2 | -150 | 150 | 5 | 60 | degrees |

Formulas: x = l1 cos(theta1) + l2 cos(theta1 + theta2) and z = l1 sin(theta1) + l2 sin(theta1 + theta2), with l1 = l2 = 0.10 m. Six problems in this fixed order:

| # | Problem | Asked | Correct (m) | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | theta1 = 0 degrees, theta2 = 0 degrees | x | 0.200 | Both links point forward: 0.1 + 0.1 = 0.200 m. |
| 2 | theta1 = 90 degrees, theta2 = 0 degrees | z | 0.200 | Both links point up: 0.1 + 0.1 = 0.200 m. |
| 3 | theta1 = 0 degrees, theta2 = 90 degrees | z | 0.100 | The first link is flat and the second points up: z = 0.1 sin 90 = 0.100 m. |
| 4 | theta1 = 45 degrees, theta2 = -90 degrees | x | 0.141 | The second link points at -45 degrees: x = 0.1 cos 45 + 0.1 cos(-45) = 0.141 m. |
| 5 | theta1 = 30 degrees, theta2 = 60 degrees | x | 0.087 | x = 0.1 cos 30 + 0.1 cos 90 = 0.0866 m. |
| 6 | theta1 = 60 degrees, theta2 = -60 degrees | z | 0.087 | z = 0.1 sin 60 + 0.1 sin 0 = 0.0866 m. |

**Provenance:** The formulas are from the chapter section "Forward Kinematics". The problems are illustrative values written for this sim, and problems 1 to 4 and the angles 30 and 60 appear in the chapter and the lab.

**Rules:** x and z are computed from the formulas, in metres, with the angles converted to radians. An answer is correct when |typed - correct| <= 0.001.

**Learner Activity:**

1. In Explore mode the learner changes theta1 and theta2 and watches the two link vectors and the tip position. The learner should notice that changing theta1 turns the whole arm, and changing theta2 turns only the second link.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> m. <Why>". Incorrect: "Not quite. The answer is <value> m. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with theta1 = 30 and theta2 = 60, showing the tip at x = 0.087 m and z = 0.150 m.

**Chapter Anchors:** The chapter's worked example is theta1 = 30 and theta2 = 60 with both links 0.10 m, which gives x = 0.0866 and z = 0.150 m. The formulas are x = l1 cos theta1 + l2 cos(theta1 + theta2) and z = l1 sin theta1 + l2 sin(theta1 + theta2). The sim has six problems and mastery is 5 of 6.
</details>

## Inverse Kinematics

### Geometric Inverse Kinematics

**Inverse kinematics** (IK) turns the question around: given where the hand should be, find the joint angles. For the two-link arm it can be solved with geometry, which is called **geometric inverse kinematics**, and it uses the law of cosines on the triangle formed by the two links and the line from the shoulder to the target. If the target is at distance \( r = \sqrt{x^2 + z^2} \) from the shoulder, the elbow's bend satisfies

\[ \cos\theta_2 = \frac{x^2 + z^2 - l_1^2 - l_2^2}{2\, l_1 l_2}, \qquad \theta_1 = \operatorname{atan2}(z, x) - \operatorname{atan2}\big(l_2 \sin\theta_2,\; l_1 + l_2 \cos\theta_2\big) \]

A worked example with \( l_1 = 0.116 \), \( l_2 = 0.135 \) and the target (0.15, 0.10): \( \cos\theta_2 = (0.0325 - 0.013456 - 0.018225) / (2 \times 0.116 \times 0.135) = 0.0262 \), so \( \theta_2 = 88.5^\circ \), and \( \theta_1 = -14.8^\circ \). Put the angles back into forward kinematics and you get (0.150, 0.100): always check an IK answer by running it forward.

### Multiple Solutions and Elbow Up and Down

The cosine gives *two* angles, \( +\theta_2 \) and \( -\theta_2 \), so most targets have **multiple IK solutions**. Here the two are \( \theta_2 = +88.5^\circ \) with \( \theta_1 = -14.8^\circ \), and \( \theta_2 = -88.5^\circ \) with \( \theta_1 = +82.2^\circ \). They are the **elbow up and elbow down** poses: the same hand position, with the elbow above or below the line from the shoulder to the hand, as your own arm can reach a cup with the elbow high or low. A program must pick one, and the usual choice is the solution nearest the arm's present pose, so that the move does not swing the elbow through a large angle. A real arm adds a rule of its own: a solution outside a joint's limits is not a solution.

### Unreachable Targets

A target is an **unreachable target** when no angles can put the hand there, and the geometry says when. The hand can be no farther from the shoulder than \( l_1 + l_2 \), when the arm is straight, and no nearer than \( |l_1 - l_2| \), when it is folded back. For the SO-101's upper arm and forearm that is 0.019 m to 0.251 m. Outside that ring, the cosine in the formula is larger than 1 or smaller than -1, and the library function raises an `UnreachableError` and never returns nonsense. On the boundary there is exactly one solution (a straight arm or a folded one), and strictly inside there are two. The next MicroSim classifies eight targets.

#### Diagram: IK Target Classifier

<iframe src="../../sims/ik-target-classifier/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the IK Target Classifier MicroSim fullscreen](../../sims/ik-target-classifier/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>IK Target Classifier</summary>
Type: microsim
**sim-id:** ik-target-classifier<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight targets for a two-link arm (l1 = 0.116 m, l2 = 0.135 m) as having two solutions, one solution, or being unreachable too far or too close, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** inverse kinematics, geometric inverse kinematics, multiple IK solutions, elbow up and elbow down, unreachable target, workspace ring (all defined in the section "Inverse Kinematics" above this block).

**Evidence of Mastery:** For each of eight targets the learner chooses one of four classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 7 of 8 correct on the first attempt. Dragging the target in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every target inside the outer circle can be reached. (A target too close to the shoulder cannot, when the links differ in length.) (2) Every reachable target has exactly one solution. (Most have two.) (3) The elbow can be placed anywhere. (Its place is fixed by the target and the choice of up or down.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to separate cases by the feature that matters. Here the only feature is the distance from the shoulder, so the learner must compute and compare it to two limits.

**Content:**

The shoulder is at the origin. Explore mode shows the two-link arm, the ring of reachable positions between the inner radius 0.019 m and the outer radius 0.251 m, and a target the learner can drag, with the elbow-up and elbow-down arms drawn when they exist.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Target x | -0.30 | 0.30 | 0.005 | 0.150 | m |
| Target z | -0.30 | 0.30 | 0.005 | 0.100 | m |

The four classes: "Two solutions", "One solution", "Too far to reach", "Too close to reach". Eight targets in this fixed order, with r the distance from the shoulder:

| # | Target (x, z) in m | r (m) | Class | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | (0.150, 0.100) | 0.180 | Two solutions | r is between 0.019 and 0.251, so the elbow can be up or down. |
| 2 | (0.251, 0.000) | 0.251 | One solution | r equals l1 + l2, so the arm is straight and there is one pose. |
| 3 | (0.300, 0.100) | 0.316 | Too far to reach | r is more than l1 + l2 = 0.251 m. |
| 4 | (0.010, 0.010) | 0.014 | Too close to reach | r is less than l2 - l1 = 0.019 m, so the folded arm cannot get that close. |
| 5 | (0.019, 0.000) | 0.019 | One solution | r equals l2 - l1, so the arm is folded back and there is one pose. |
| 6 | (0.000, 0.200) | 0.200 | Two solutions | r is inside the ring, so there are two poses. |
| 7 | (0.200, 0.200) | 0.283 | Too far to reach | r is more than 0.251 m. |
| 8 | (0.050, 0.050) | 0.071 | Two solutions | r is inside the ring, so there are two poses. |

**Provenance:** The link lengths (0.116 m and 0.135 m) are from the SO-101 URDF as described in the chapter section "Link Lengths and the Two-Link Arm". The targets are illustrative values written for this sim.

**Rules:** r = sqrt(x^2 + z^2). Too far: r > l1 + l2 + 0.0005. Too close: r < |l1 - l2| - 0.0005. One solution: r within 0.0005 m of l1 + l2 or of |l1 - l2|. Otherwise two solutions. Distances are in metres.

**Learner Activity:**

1. In Explore mode the learner drags the target and watches the arm. The learner should notice that the arm straightens at the outer circle and folds at the inner one, and that two arms are drawn between them.
2. The learner switches to the eight targets. Target 1 is shown.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After target 8 it shows the score.

**Feedback:** Eight targets, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This target is: <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the target at (0.150, 0.100), showing the elbow-up and elbow-down arms.

**Chapter Anchors:** The chapter states a reach of 0.019 m to 0.251 m for l1 = 0.116 and l2 = 0.135, two solutions for the target (0.15, 0.10) with theta2 of plus and minus 88.5 degrees, and exactly one solution on the boundary. The sim has eight targets and mastery is 7 of 8.
</details>

### Numerical Inverse Kinematics and Orientation Control

The real arm has three joints in its plane (lift, elbow, wrist), real offsets, and joint limits, and a closed form for that is messy. **Numerical inverse kinematics** finds the angles by repeated improvement instead of by a formula. Start with a guess, compute the forward kinematics, measure the *error* between the hand and the target, and move the joints by a small step that reduces the error, using the Jacobian of the next section to know which way. Repeat until the error is tiny or the limit of rounds is reached. The step is a *damped least-squares* step, which stays calm even near awkward poses, and the joints are held inside their limits at every round. Libraries do this for you: LeRobot's `inverse_kinematics` runs a few such rounds from the present joint angles, and the reBot-DevArm's control library uses the same damped least-squares idea with up to 1,000 rounds.

**Orientation control** adds a requirement about which way the hand points. Position alone leaves one joint free, and the extra joint can be used to hold the gripper's *pitch*, the sum of the lift, elbow and wrist angles, at a chosen value. A pitch of 90 degrees points the gripper straight down, which is how you grasp something from above. Asking for the orientation shrinks the set of reachable points: in the lab, the SO-101 can put a tip 0.20 m forward and 0.10 m to the left, 7 cm above the base plane, with the gripper pointing straight down, but it cannot reach 9 cm up there, and tilting the gripper to 60 degrees brings 13 cm within reach. That is why the pre-grasp approach of Chapter 11 sometimes tilts.

## Velocity: The Jacobian

### The Jacobian

The **Jacobian** is the matrix that connects joint speeds to hand speed: \( \dot p = J(q)\,\dot q \), where \( \dot q \) is the list of joint speeds and \( \dot p \) is the speed of the hand. Each column says how fast the hand moves when one joint turns at one radian per second. For the two-link arm,

\[ J = \begin{pmatrix} -l_1 \sin\theta_1 - l_2 \sin(\theta_1 + \theta_2) & -l_2 \sin(\theta_1 + \theta_2) \\ l_1 \cos\theta_1 + l_2 \cos(\theta_1 + \theta_2) & l_2 \cos(\theta_1 + \theta_2) \end{pmatrix} \]

Read the other way, the Jacobian answers the question that Cartesian motion asks: to move the hand at a chosen speed, how fast must each joint turn? Solve \( J\,\dot q = \dot p \) for \( \dot q \). For a robot with no neat formula, the Jacobian can be *estimated numerically*: nudge each joint by a tiny angle, run the forward kinematics, and divide the change in hand position by the nudge. The lab's `numeric_jacobian` does exactly that, and it is the engine inside the numerical IK.

### Singular Poses

A **singular pose** is one where the Jacobian cannot be solved, because some direction of hand motion is impossible whatever the joints do. For the two-link arm the determinant is \( l_1 l_2 \sin\theta_2 \), which is zero when \( \theta_2 = 0 \) (the arm straight) or \( 180^\circ \) (folded). At full stretch the hand cannot move *along* the arm, because both links are lined up with it. Near such a pose, joint speeds grow without limit. The lab's table shows the joint speeds needed to move the hand at 0.1 m/s along x with the first joint at 20 degrees: at \( \theta_2 = 90^\circ \) they are 17 and 23 degrees per second, at 10 degrees they are 246 and 476, at 1 degree they are 2,642 and 4,927, and at 0 the problem has no answer. The **condition number** of the matrix, the ratio of its largest to its smallest stretch (`np.linalg.cond`), climbs from 2.8 to 297 and then to infinity, and it is a handy warning light. A program that plans Cartesian paths must stay away from singular poses, and Chapter 19 gives the tools to do it.

!!! mascot-warning "Straight Arms Are Dangerous Arms"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Near full stretch, a tiny hand motion can demand a huge joint speed, and a program that does not check will command it. Keep Cartesian moves away from a straight or fully folded elbow, watch the condition number, and let the speed limit of Chapter 11 catch whatever is left.

#### Diagram: Singularity Spotter

<iframe src="../../sims/singularity-spotter/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Singularity Spotter MicroSim fullscreen](../../sims/singularity-spotter/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Singularity Spotter</summary>
Type: microsim
**sim-id:** singularity-spotter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify eight elbow angles of a two-link arm as safe, near a singularity, or singular, from the value of sin(theta2), with at least 7 of 8 correct on the first attempt.

**Prerequisites:** Jacobian, determinant, singular pose, condition number, two-link arm (all defined in the section "Velocity: The Jacobian" above this block).

**Evidence of Mastery:** For each of eight elbow angles the learner chooses one of three classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 7 of 8 correct on the first attempt. Moving the elbow in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Only a perfectly straight arm is a problem. (Poses near it demand very large joint speeds.) (2) A folded arm is safe. (Theta2 near 180 degrees is singular too.) (3) A negative bend is different from a positive one. (The sign does not matter, only the size of sin(theta2).)

**Instructional Rationale:** An Understand-level classify objective asks the learner to sort examples by a rule. The single quantity sin(theta2) sets the class, so the learner links the picture of a straightening arm to a number.

**Content:**

Explore mode shows a two-link arm with l1 = 0.116 m and l2 = 0.135 m, one elbow angle the learner can change, the determinant l1 l2 |sin(theta2)|, the condition number, and the joint speeds needed for a tip speed of 0.1 m/s.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| theta2 | -180 | 180 | 1 | 90 | degrees |

The three classes: "Safe", "Near a singularity", "Singular". Eight elbow angles in this fixed order:

| # | theta2 | abs(sin(theta2)) | Class | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | 90 degrees | 1.000 | Safe | The determinant is at its largest, so the arm moves freely in every direction. |
| 2 | 0 degrees | 0.000 | Singular | The arm is straight and the determinant is zero. |
| 3 | 10 degrees | 0.174 | Near a singularity | abs(sin) is below 0.3, so joint speeds are already very large. |
| 4 | 45 degrees | 0.707 | Safe | abs(sin) is well above 0.3. |
| 5 | 180 degrees | 0.000 | Singular | The arm is folded back on itself and the determinant is zero. |
| 6 | -5 degrees | 0.087 | Near a singularity | The sign does not matter, and abs(sin) is below 0.3. |
| 7 | 170 degrees | 0.174 | Near a singularity | The arm is almost folded back, and abs(sin) is below 0.3. |
| 8 | 20 degrees | 0.342 | Safe | abs(sin) is above 0.3, so the pose is acceptable. |

**Provenance:** The determinant l1 l2 sin(theta2) is from the chapter section "Singular Poses". The thresholds 0.02 and 0.3 are teaching values chosen for this sim, and the sim labels them "teaching thresholds".

**Rules:** Singular: abs(sin(theta2)) < 0.02. Near a singularity: 0.02 <= abs(sin(theta2)) < 0.3. Safe: abs(sin(theta2)) >= 0.3. In Explore mode the determinant is l1 l2 abs(sin(theta2)), the condition number comes from the singular values of the Jacobian at theta1 = 20 degrees, and the joint speeds are shown as undefined when the class is Singular.

**Learner Activity:**

1. In Explore mode the learner moves the elbow angle and watches the condition number and the joint speeds. The learner should notice that the speeds climb steeply as the arm straightens.
2. The learner switches to the eight angles. Angle 1 is shown.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After angle 8 it shows the score.

**Feedback:** Eight angles, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This angle is: <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with theta2 = 90 degrees, showing a determinant of 0.0157 and a condition number of 2.8.

**Chapter Anchors:** The chapter states a determinant of l1 l2 sin(theta2), singular poses at theta2 equal to 0 and 180 degrees, and condition numbers of 2.8, 29.7 and 297 at theta2 of 90, 10 and 1 degrees. The sim has eight angles and mastery is 7 of 8.
</details>

### Cartesian Motion and Straight-Line Motion

**Cartesian motion** moves the hand along a path described in space and lets the program work out the joints. The simplest path is **straight-line motion**: divide the line from the start to the goal into many small steps, solve inverse kinematics at each, and send the joint angles one after another, using the previous answer as the starting guess so that the elbow does not flip. This matters because moving each joint in a straight line in joint space (the interpolation of Chapter 11) does *not* move the hand in a straight line. The lab shows it. For a vertical line from (0.25, 0.05) to (0.25, 0.30) m, joint-space interpolation strays 33.5 mm sideways from the line, and Cartesian motion with IK at every step strays 0.008 mm. If the hand must carry a full cup, or slide along a wall, Cartesian motion is the right tool. If it just has to get from one pose to another, joint-space motion is simpler and smoother.

## What the Arm Can Reach and What It Can Hit

### Workspace Sampling and the Reachability Map

**Workspace sampling** finds what the arm can reach by brute force. Step each joint through its allowed range in small increments, compute the forward kinematics of every combination, and record the hand positions. The lab does it for the SO-101's three planar joints at 2-degree steps, which is 950,208 poses and takes under a second with NumPy. A **reachability map** shows the result: a grid of cells over the plane, marked when at least one sampled pose lands in the cell. The map is a picture of the workspace of Chapter 2, with its true holes, such as the pocket in the middle where the arm's own links and joint limits forbid the hand, and the region near the base. It includes points behind the base because in the arm's plane the lift and elbow can fold backward, and a real arm would meet its own base and cables there, so treat the map as the workspace of the *joints*, to which collision checking adds the arm's body.

### Collision Checking

**Collision checking** asks whether a pose puts any part of the arm somewhere it should not be. The cheap method is to represent each link as a line from one joint to the next, sample points along it, and test each point against the obstacles: the table is the plane \( z = 0 \) (with a clearance), and a box is a range in x and in z. The lab's `collisions` function returns a sentence for each problem, such as "hand reaches the table". Its results for three poses are a safe pose with no collision, a pose that pushes the tip below the table, and a pose that places the hand inside a box 0.20 to 0.30 m out and 0.08 m high. The check treats links as thin lines, so give every obstacle a margin about the thickness of the arm. Chapter 19 turns such a check into a planner that finds a path around obstacles.

## Lab: Find the Hand and Aim the Arm

In this lab you will install NumPy, write the geometry and kinematics modules of the chapter, check forward kinematics against the SO-101's URDF, solve inverse kinematics in closed form and numerically, and finally aim the pick and place of Chapter 11 at real points. Nothing needs hardware. The new Python idea is the NumPy array. You will extend the `arm-lab` project.

**Step 1. Activate the project and install NumPy.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
python -m pip install numpy
git status
```

**Step 2. Write the geometry module.** It holds the matrices of the chapter: `rot2`, `rot_z` and `rot_y`, `homogeneous` to join a rotation and a translation into a 4 by 4 transform, `transform_point` to apply one, and `compose` to multiply a chain from left to right. Create `armlab/geometry.py`:

```python linenums="1"
"""Vectors, rotations, and 4 x 4 transforms with NumPy."""

import numpy as np


def rot2(angle_rad):
    """The 2 x 2 matrix that turns a flat vector counter-clockwise by an angle."""
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    return np.array([[c, -s],
                     [s, c]])


def rot_z(angle_rad):
    """The 3 x 3 matrix for a turn about the z axis (counter-clockwise seen from above)."""
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    return np.array([[c, -s, 0.0],
                     [s, c, 0.0],
                     [0.0, 0.0, 1.0]])


def rot_y(angle_rad):
    """The 3 x 3 matrix for a turn about the y axis (it carries x towards -z, as the SO-101's lift does)."""
    c, s = np.cos(angle_rad), np.sin(angle_rad)
    return np.array([[c, 0.0, s],
                     [0.0, 1.0, 0.0],
                     [-s, 0.0, c]])


def homogeneous(rotation=None, translation=(0.0, 0.0, 0.0)):
    """Join a rotation and a translation into one 4 x 4 transform."""
    transform = np.eye(4)
    if rotation is not None:
        transform[:3, :3] = rotation
    transform[:3, 3] = translation
    return transform


def transform_point(transform, point):
    """Apply a 4 x 4 transform to a point (x, y, z) and return the new point."""
    return (transform @ np.append(point, 1.0))[:3]


def compose(*transforms):
    """Multiply transforms from left to right: the first one is applied last, to the point."""
    result = np.eye(4)
    for transform in transforms:
        result = result @ transform
    return result
```

**Step 3. Write the kinematics module.** Read it in this order. The constants are the URDF numbers of the chapter. `two_link_fk`, `two_link_ik` and `two_link_jacobian` are the closed forms, and `UnreachableError` is raised outside the ring. `so101_frames` is the transform chain, and `so101_tip` gives its last point. `numeric_jacobian` nudges each joint, and `so101_ik` is the damped least-squares loop of the chapter, with joint limits and an optional pitch. `sample_workspace`, `segment_points` and `collisions` are the last two sections, and `so101_ik_3d` turns a point in space into pan, lift, elbow and wrist angles by first turning the pan toward the target and then solving in the arm's plane. Create `armlab/kinematics.py`:

```python linenums="1"
"""Forward and inverse kinematics: a two-link arm in closed form, and the SO-101 as a chain of transforms."""

import numpy as np

from armlab.geometry import compose, homogeneous, rot_y, rot_z

L1, L2 = 0.116, 0.135        # metres: upper arm and forearm lengths of the simplified SO-101 (from the URDF)

# The SO-101 geometry in metres, from Simulation/SO101/so101_new_calib.urdf in the SO-ARM100 repository.
# Each tuple is where the next joint sits, measured in the frame of the one before it, at the zero pose.
PAN_AXIS_X = 0.03884                       # the pan axis is this far in front of the base origin
SHOULDER = (0.03039, 0.0, 0.1166)          # pan frame to the shoulder-lift axis
ELBOW = (0.028, 0.0, 0.11257)              # upper arm to the elbow axis
WRIST = (0.1349, 0.0, 0.0052)              # forearm to the wrist-flex axis
TIP = (0.15923, 0.0, -0.0079)              # wrist to the gripper's tip


class UnreachableError(ValueError):
    """The target is outside the reach of the arm."""


def two_link_fk(l1, l2, theta1, theta2):
    """Tip (x, z) of a flat two-link arm. theta1 is measured from the +x axis, theta2 is the bend at the elbow."""
    x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)
    z = l1 * np.sin(theta1) + l2 * np.sin(theta1 + theta2)
    return x, z


def two_link_ik(l1, l2, x, z, elbow="down"):
    """Angles (theta1, theta2) that put the tip of a two-link arm at (x, z). Raises UnreachableError."""
    cos_t2 = (x * x + z * z - l1 * l1 - l2 * l2) / (2 * l1 * l2)
    if abs(cos_t2) > 1.0 + 1e-12:
        raise UnreachableError(f"({x:.3f}, {z:.3f}) is outside the reach {abs(l1 - l2):.3f} to {l1 + l2:.3f} m")
    theta2 = np.arccos(np.clip(cos_t2, -1.0, 1.0))
    if elbow == "up":
        theta2 = -theta2
    theta1 = np.arctan2(z, x) - np.arctan2(l2 * np.sin(theta2), l1 + l2 * np.cos(theta2))
    return theta1, theta2


def two_link_jacobian(l1, l2, theta1, theta2):
    """The 2 x 2 Jacobian: how the tip speed (x, z) depends on the joint speeds."""
    s1, c1 = np.sin(theta1), np.cos(theta1)
    s12, c12 = np.sin(theta1 + theta2), np.cos(theta1 + theta2)
    return np.array([[-l1 * s1 - l2 * s12, -l2 * s12],
                     [l1 * c1 + l2 * c12, l2 * c12]])


def so101_frames(pan_deg, lift_deg, elbow_deg, wrist_deg):
    """The SO-101 as a transform chain. Returns the points [shoulder, elbow, wrist, tip] in the base frame.

    Each joint is a rotation followed by a fixed offset to the next joint. Multiplying them in order
    gives every point in the base frame. (The small sideways offsets of the real arm are left out.)
    """
    pan = compose(homogeneous(translation=(PAN_AXIS_X, 0, 0)), homogeneous(rot_z(-np.radians(pan_deg))))
    shoulder = compose(pan, homogeneous(translation=SHOULDER))
    elbow = compose(shoulder, homogeneous(rot_y(np.radians(lift_deg))), homogeneous(translation=ELBOW))
    wrist = compose(elbow, homogeneous(rot_y(np.radians(elbow_deg))), homogeneous(translation=WRIST))
    tip = compose(wrist, homogeneous(rot_y(np.radians(wrist_deg))), homogeneous(translation=TIP))
    return [frame[:3, 3].copy() for frame in (shoulder, elbow, wrist, tip)]


def so101_tip(pan_deg, lift_deg, elbow_deg, wrist_deg):
    """Forward kinematics: the position (x, y, z) of the gripper's tip, in metres."""
    return so101_frames(pan_deg, lift_deg, elbow_deg, wrist_deg)[-1]


def _planar(q):
    """(x, z, pitch) of the tip for joint angles q = (lift, elbow, wrist) in radians, with the pan at zero.

    x and z are in metres and pitch (lift + elbow + wrist) is in radians.
    """
    x, _, z = so101_tip(0.0, *np.degrees(q))
    return np.array([x, z, np.sum(q)])


def numeric_jacobian(function, q, step=1e-6):
    """Estimate a Jacobian by nudging each joint a little and watching the output change."""
    q = np.asarray(q, dtype=float)
    base = function(q)
    columns = []
    for i in range(len(q)):
        nudged = q.copy()
        nudged[i] += step
        columns.append((function(nudged) - base) / step)
    return np.array(columns).T


def so101_ik(target_x, target_z, pitch_deg=None, start=(0.0, 0.0, 0.0),
             limits=((-100, 100), (-97, 97), (-95, 95)), iterations=200, damping=1e-3):
    """Numerical inverse kinematics in the arm's plane. Returns (lift, elbow, wrist) in degrees.

    Each round moves the joints by a damped least-squares step that shrinks the error between the
    tip and the target, and holds them inside their limits. If pitch_deg is given, the gripper's
    pitch (lift + elbow + wrist) is steered to it as well. Raises UnreachableError if it cannot arrive.
    """
    q = np.radians(np.array(start, dtype=float))
    low, high = np.radians(np.array(limits, dtype=float)).T
    rows = [0, 1] if pitch_deg is None else [0, 1, 2]
    goal = np.array([target_x, target_z, np.radians(pitch_deg) if pitch_deg is not None else 0.0])
    for _ in range(iterations):
        error = (goal - _planar(q))[rows]
        if np.hypot(error[0], error[1]) < 1e-5 and (len(rows) == 2 or abs(error[2]) < 1e-4):
            return np.degrees(q)
        jac = numeric_jacobian(lambda v: _planar(v)[rows], q)
        step = jac.T @ np.linalg.solve(jac @ jac.T + damping ** 2 * np.eye(len(rows)), error)
        q = np.clip(q + step, low, high)
    raise UnreachableError(f"no solution found for ({target_x:.3f}, {target_z:.3f})")


def sample_workspace(step_deg=5, limits=((-100, 100), (-97, 97), (-95, 95))):
    """Forward kinematics for a grid of joint angles inside the limits. Returns arrays x, z of tip positions."""
    axes = [np.radians(np.arange(low, high + 0.1, step_deg)) for low, high in limits]
    lift, elbow, wrist = np.meshgrid(*axes, indexing="ij")

    def turn(q, vector):                      # rotate the (x, z) vector by q, with the lift's sign convention
        return vector[0] * np.cos(q) + vector[2] * np.sin(q), -vector[0] * np.sin(q) + vector[2] * np.cos(q)

    x = np.full(lift.shape, SHOULDER[0] + PAN_AXIS_X)
    z = np.full(lift.shape, SHOULDER[2])
    for angle, vector in ((lift, ELBOW), (lift + elbow, WRIST), (lift + elbow + wrist, TIP)):
        dx, dz = turn(angle, vector)
        x, z = x + dx, z + dz
    return x.ravel(), z.ravel()


def segment_points(a, b, count=11):
    """Evenly spaced points along the straight segment from a to b, ends included."""
    return [a + (b - a) * i / (count - 1) for i in range(count)]


def collisions(points, table_z=0.0, clearance=0.01, box=None):
    """Describe every link that comes too near the table or touches a box.

    points is the chain [shoulder, elbow, wrist, tip] of so101_frames. box is ((x_min, x_max),
    (z_min, z_max)) in the arm's plane, or None. Each link is checked at 11 points along its length.
    """
    problems = []
    links = (("upper arm", points[0], points[1]), ("forearm", points[1], points[2]), ("hand", points[2], points[3]))
    for name, a, b in links:
        for p in segment_points(a, b):
            if p[2] < table_z + clearance:
                problems.append(f"{name} reaches the table")
                break
        for p in segment_points(a, b):
            if box and box[0][0] <= p[0] <= box[0][1] and box[1][0] <= p[2] <= box[1][1]:
                problems.append(f"{name} is inside the box")
                break
    return problems


def so101_ik_3d(x, y, z, pitch_deg=90.0, seeds=((-30.0, 30.0, 30.0), (-60.0, 60.0, 30.0), (0.0, 0.0, 90.0), (30.0, -30.0, 90.0))):
    """Joint angles (pan, lift, elbow, wrist), in degrees, that put the tip at (x, y, z) in the base frame.

    The pan turns the arm towards the target (the pan axis points down, so a positive pan turns it
    clockwise seen from above). The other three joints are solved in the arm's plane with the gripper's
    pitch held at pitch_deg (90 means pointing straight down). The solver is tried from several starting
    guesses, because one guess may end in a dead end that another one avoids.
    """
    dx = x - PAN_AXIS_X
    pan_deg = -np.degrees(np.arctan2(y, dx))
    reach = PAN_AXIS_X + np.hypot(dx, y)               # the distance out along the arm's own plane
    for seed in seeds:
        try:
            lift, elbow, wrist = so101_ik(reach, z, pitch_deg=pitch_deg, start=seed)
            return np.array([pan_deg, lift, elbow, wrist])
        except UnreachableError:
            continue
    raise UnreachableError(f"no solution found for ({x:.3f}, {y:.3f}, {z:.3f}) with pitch {pitch_deg:.0f}")
```

**Step 4. Run the forward kinematics.** The script prints the vector and rotation examples of the chapter, a homogeneous transform in both orders, the two-link arm for four poses, and the SO-101's chain against the URDF's own numbers. Create `fk_demo.py`:

```python linenums="1"
"""Vectors, rotations, transforms, and forward kinematics, checked against the SO-101's own URDF file."""

import numpy as np

from armlab.geometry import compose, homogeneous, rot2, rot_z, transform_point
from armlab.kinematics import so101_frames, so101_tip, two_link_fk

np.set_printoptions(precision=4, suppress=True)

print("1. Vectors and arrays")
a, b = np.array([3.0, 4.0]), np.array([1.0, -2.0])
print(f"   a + b = {a + b}, length of a = {np.linalg.norm(a):.1f}, shape of a = {a.shape}")

print("2. Rotations")
print(f"   rotate (1, 0) by 90 degrees: {rot2(np.radians(90)) @ np.array([1.0, 0.0])}")
r = rot_z(np.radians(30))
print(f"   rot_z(30 degrees) times its transpose is the identity: {np.allclose(r @ r.T, np.eye(3))}, determinant {np.linalg.det(r):.1f}")

print("3. A homogeneous transform: turn 90 degrees about z, then move 0.2 m along x")
T = homogeneous(rot_z(np.radians(90)), translation=(0.2, 0.0, 0.0))
print(f"   the point (0.1, 0, 0) in the arm's frame is {transform_point(T, np.array([0.1, 0.0, 0.0]))} in the base frame")
swapped = compose(homogeneous(rot_z(np.radians(90))), homogeneous(translation=(0.2, 0.0, 0.0)))
print(f"   the same two steps in the other order give {transform_point(swapped, np.array([0.1, 0.0, 0.0]))}: order matters")

print("4. A flat two-link arm, both links 0.10 m")
for t1, t2 in ((0, 0), (90, 0), (0, 90), (45, -90)):
    x, z = two_link_fk(0.10, 0.10, np.radians(t1), np.radians(t2))
    print(f"   theta1 {t1:>3}, theta2 {t2:>3} -> tip ({x:+.3f}, {z:+.3f}) m")

print("5. The SO-101 as a chain of transforms, against the URDF")
URDF_TIP_ZERO = np.array([0.39136, 0.0, 0.22647])          # the URDF's gripper frame at all-zero angles
URDF_TIP_POSE = np.array([0.2670, -0.1317, -0.0285])        # the URDF at pan 30, lift 20, elbow 40, wrist -10
for label, angles, expected in (("all joints at 0", (0, 0, 0, 0), URDF_TIP_ZERO),
                                ("pan 30, lift 20, elbow 40, wrist -10", (30, 20, 40, -10), URDF_TIP_POSE)):
    tip = so101_tip(*angles)
    print(f"   {label}: tip {tip}, URDF {expected}, difference {1000 * np.linalg.norm(tip - expected):.2f} mm")

print("6. Every point of the chain at the zero pose (shoulder, elbow, wrist, tip)")
for name, point in zip(("shoulder", "elbow", "wrist", "tip"), so101_frames(0, 0, 0, 0)):
    print(f"   {name:<8} {point}")
```

```bash
python fk_demo.py
```

```text
1. Vectors and arrays
   a + b = [4. 2.], length of a = 5.0, shape of a = (2,)
2. Rotations
   rotate (1, 0) by 90 degrees: [0. 1.]
   rot_z(30 degrees) times its transpose is the identity: True, determinant 1.0
3. A homogeneous transform: turn 90 degrees about z, then move 0.2 m along x
   the point (0.1, 0, 0) in the arm's frame is [0.2 0.1 0. ] in the base frame
   the same two steps in the other order give [0.  0.3 0. ]: order matters
4. A flat two-link arm, both links 0.10 m
   theta1   0, theta2   0 -> tip (+0.200, +0.000) m
   theta1  90, theta2   0 -> tip (+0.000, +0.200) m
   theta1   0, theta2  90 -> tip (+0.100, +0.100) m
   theta1  45, theta2 -90 -> tip (+0.141, +0.000) m
5. The SO-101 as a chain of transforms, against the URDF
   all joints at 0: tip [0.3914 0.     0.2265], URDF [0.3914 0.     0.2265], difference 0.00 mm
   pan 30, lift 20, elbow 40, wrist -10: tip [ 0.267  -0.1317 -0.0285], URDF [ 0.267  -0.1317 -0.0285], difference 0.04 mm
6. Every point of the chain at the zero pose (shoulder, elbow, wrist, tip)
   shoulder [0.0692 0.     0.1166]
   elbow    [0.0972 0.     0.2292]
   wrist    [0.2321 0.     0.2344]
   tip      [0.3914 0.     0.2265]
```

Check items 3 and 5. Swapping the order of the two steps moved the same point from (0.2, 0.1, 0) to (0, 0.3, 0). And the chain matches the URDF to 0.04 mm or better, so the model is trustworthy for the SO-101, apart from the small sideways offsets that the chapter left out. The URDF numbers in the script come from a separate small program that reads the design file and multiplies its transforms, which the author used to check the chain.

**Step 5. Run the inverse kinematics.** The script solves the two-link arm for both elbows, tries targets at and beyond the edges of the ring, solves the SO-101 numerically with and without a pitch, shows two different answers for one target from two different starting guesses, and then asks for something unreachable. Create `ik_demo.py`:

```python linenums="1"
"""Inverse kinematics: closed form for a two-link arm, and numerical for the SO-101."""

import numpy as np

from armlab.kinematics import L1, L2, UnreachableError, so101_ik, so101_tip, two_link_fk, two_link_ik

np.set_printoptions(precision=2, suppress=True)

print(f"1. Closed form for a two-link arm (l1 = {L1} m, l2 = {L2} m), target (0.15, 0.10)")
for elbow in ("down", "up"):
    t1, t2 = two_link_ik(L1, L2, 0.15, 0.10, elbow)
    x, z = two_link_fk(L1, L2, t1, t2)
    print(f"   elbow {elbow:<4}: theta1 {np.degrees(t1):+7.2f}, theta2 {np.degrees(t2):+7.2f} -> forward kinematics gives ({x:.3f}, {z:.3f})")

print("2. Targets at and beyond the edges of the workspace")
for label, (x, z) in (("just inside the reach", (0.250, 0.0)), ("exactly at full reach", (L1 + L2, 0.0)),
                      ("beyond full reach", (0.30, 0.0)), ("too close to the shoulder", (0.01, 0.0))):
    try:
        t1, t2 = two_link_ik(L1, L2, x, z)
        print(f"   {label:<26} ({x:.3f}, {z:.3f}): theta2 = {np.degrees(t2):+6.1f} degrees")
    except UnreachableError as error:
        print(f"   {label:<26} ({x:.3f}, {z:.3f}): {error}")

print("3. Numerical IK on the SO-101: joint angles (lift, elbow, wrist) for a tip target")
for label, x, z, pitch in (("anywhere, tip at (0.25, 0.10)", 0.25, 0.10, None),
                           ("gripper pointing down, tip at (0.20, 0.05)", 0.20, 0.05, 90.0)):
    q = so101_ik(x, z, pitch_deg=pitch)
    tip = so101_tip(0.0, *q)
    print(f"   {label}: {q}, forward kinematics gives ({tip[0]:.4f}, {tip[2]:.4f}), pitch {q.sum():.0f}")

print("4. Many solutions: the same tip target from two different starting guesses")
for start in ((0, 0, 0), (-60, 60, 0)):
    q = so101_ik(0.25, 0.10, start=start)
    print(f"   start {start}: angles {q}")

print("5. A target the arm cannot reach with the gripper pointing down")
try:
    so101_ik(0.25, 0.10, pitch_deg=90.0)
except UnreachableError as error:
    print(f"   {error}")
```

```bash
python ik_demo.py
```

```text
1. Closed form for a two-link arm (l1 = 0.116 m, l2 = 0.135 m), target (0.15, 0.10)
   elbow down: theta1  -14.78, theta2  +88.50 -> forward kinematics gives (0.150, 0.100)
   elbow up  : theta1  +82.16, theta2  -88.50 -> forward kinematics gives (0.150, 0.100)
2. Targets at and beyond the edges of the workspace
   just inside the reach      (0.250, 0.000): theta2 =  +10.3 degrees
   exactly at full reach      (0.251, 0.000): theta2 =   +0.0 degrees
   beyond full reach          (0.300, 0.000): (0.300, 0.000) is outside the reach 0.019 to 0.251 m
   too close to the shoulder  (0.010, 0.000): (0.010, 0.000) is outside the reach 0.019 to 0.251 m
3. Numerical IK on the SO-101: joint angles (lift, elbow, wrist) for a tip target
   anywhere, tip at (0.25, 0.10): [-63.12  67.67  25.66], forward kinematics gives (0.2500, 0.1000), pitch 30
   gripper pointing down, tip at (0.20, 0.05): [-11.16  23.28  77.88], forward kinematics gives (0.2000, 0.0500), pitch 90
4. Many solutions: the same tip target from two different starting guesses
   start (0, 0, 0): angles [-63.12  67.67  25.66]
   start (-60, 60, 0): angles [-75.45  83.48  10.57]
5. A target the arm cannot reach with the gripper pointing down
   no solution found for (0.250, 0.100)
```

Each answer was put back through forward kinematics, and each matched the target. Item 4 shows multiple solutions at work: two very different sets of joint angles reach the same point, and the solver returns whichever is nearer its starting guess. In item 5 the solver fails for a target that it could reach with a tilted gripper and cannot reach with the gripper pointing straight down.

**Step 6. Explore speed, the workspace, straight lines and collisions.** The script prints the singularity table, the reachability map, the straight-line comparison and the collision checks. Create `reach_demo.py`:

```python linenums="1"
"""The Jacobian and singularities, a reachability map, straight-line motion, and collision checking."""

import numpy as np

from armlab.kinematics import (L1, L2, collisions, sample_workspace, so101_frames, so101_ik, so101_tip,
                               two_link_jacobian)

np.set_printoptions(precision=3, suppress=True)

print("1. The Jacobian of the two-link arm near a singular pose (theta1 = 20 degrees)")
print("   theta2  det J  condition number  joint speeds (deg/s) for a tip speed of 0.1 m/s along x")
for t2 in (90, 45, 10, 1, 0):
    J = two_link_jacobian(L1, L2, np.radians(20), np.radians(t2))
    det = np.linalg.det(J)
    if abs(det) < 1e-9:
        print(f"   {t2:>5}  {det:>6.4f}  {'infinite':>16}  undefined: the tip cannot move along x")
    else:
        speeds = np.degrees(np.linalg.solve(J, [0.1, 0.0])).round(0)
        print(f"   {t2:>5}  {det:>6.4f}  {np.linalg.cond(J):>16.1f}  {speeds}")

print("2. Reachability map of the SO-101 tip in its plane, from sampling the joint limits (# reachable, . not)")
x, z = sample_workspace(step_deg=2)
cell = 0.025
x_edges, z_edges = np.arange(-0.35, 0.50 + cell, cell), np.arange(-0.225, 0.55 + cell, cell)
counts, _, _ = np.histogram2d(x, z, bins=[x_edges, z_edges])
for row in range(counts.shape[1] - 1, -1, -2):                         # every second row, to keep the map short
    line = "".join("#" if counts[col, row] > 0 else "." for col in range(counts.shape[0]))
    print(f"   z {z_edges[row] + cell / 2:+.3f} {line}")
print(f"   {len(x)} sampled poses; each character is {cell} m wide; x runs from {x_edges[0]:+.2f} m (left) to {x_edges[-1]:+.2f} m (right)")

print("3. A straight vertical line from (0.25, 0.05) to (0.25, 0.30): joint-space motion against Cartesian motion")
qa, qb = so101_ik(0.25, 0.05, start=(-50, 50, 0)), so101_ik(0.25, 0.30, start=(-50, 50, 0))
joint_path = [so101_tip(0, *(qa + (qb - qa) * s)) for s in np.linspace(0, 1, 21)]
worst_joint = max(abs(p[0] - 0.25) for p in joint_path)
q, worst_cartesian = qa, 0.0
for s in np.linspace(0, 1, 21):
    q = so101_ik(0.25, 0.05 + 0.25 * s, start=q)
    worst_cartesian = max(worst_cartesian, abs(so101_tip(0, *q)[0] - 0.25))
print(f"   joint-space interpolation strays {1000 * worst_joint:.1f} mm sideways from the line")
print(f"   Cartesian motion (IK at every step) strays {1000 * worst_cartesian:.3f} mm")

print("4. Collision checking against the table (z = 0) and a box 0.20 to 0.30 m out and 0.08 m high")
box = ((0.20, 0.30), (0.0, 0.08))
poses = (("a safe pose", (0, -60, 60, 60)), ("tip pushed into the table", (0, 40, 40, 40)),
         ("tip at (0.25, 0.04), inside the box", (0, *np.round(so101_ik(0.25, 0.04, start=(-50, 50, 0))))))
for label, angles in poses:
    result = collisions(so101_frames(*angles), box=box)
    print(f"   {label:<36} {tuple(int(a) for a in angles)}: {result or 'no collision'}")
```

```bash
python reach_demo.py
```

```text
1. The Jacobian of the two-link arm near a singular pose (theta1 = 20 degrees)
   theta2  det J  condition number  joint speeds (deg/s) for a tip speed of 0.1 m/s along x
      90  0.0157               2.8  [-17. -23.]
      45  0.0111               6.3  [ 30. -86.]
      10  0.0027              29.7  [ 246. -476.]
       1  0.0003             297.2  [ 2642. -4927.]
       0  0.0000          infinite  undefined: the tip cannot move along x
2. Reachability map of the SO-101 tip in its plane, from sampling the joint limits (# reachable, . not)
   z +0.537 ...............####...............
   z +0.487 ........#################.........
   z +0.437 .....#######################......
   z +0.387 ....##########################....
   z +0.337 ..#############################...
   z +0.287 .#########.....#################..
   z +0.237 ########...######################.
   z +0.187 #######...######...###############
   z +0.137 #######..######....###############
   z +0.087 #######..######....###############
   z +0.037 #######..########################.
   z -0.013 .#######.########################.
   z -0.063 ...#############################..
   z -0.113 ...........####################...
   z -0.163 .............################.....
   z -0.212 ................##########........
   950208 sampled poses; each character is 0.025 m wide; x runs from -0.35 m (left) to +0.50 m (right)
3. A straight vertical line from (0.25, 0.05) to (0.25, 0.30): joint-space motion against Cartesian motion
   joint-space interpolation strays 33.5 mm sideways from the line
   Cartesian motion (IK at every step) strays 0.008 mm
4. Collision checking against the table (z = 0) and a box 0.20 to 0.30 m out and 0.08 m high
   a safe pose                          (0, -60, 60, 60): no collision
   tip pushed into the table            (0, 40, 40, 40): ['hand reaches the table']
   tip at (0.25, 0.04), inside the box  (0, -40, 82, -8): ['hand is inside the box']
```

The first table is the one from the chapter: as the elbow straightens, the condition number goes from 2.8 to 297 and then to infinity, and the joint speeds from tens of degrees per second to thousands. The map has the shape of the SO-101's reach, with the empty pocket in the middle. And the straight-line test shows that joint-space interpolation wanders 33.5 mm from a line that Cartesian motion follows to better than a hundredth of a millimetre.

!!! mascot-tip "Always Run an IK Answer Forward"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Whatever method produced a set of joint angles, feed them back through forward kinematics and compare with the target. It takes one line, it catches a wrong sign or a wrong unit at once, and it is the best test you can write for kinematics code.

**Step 7. Aim the pick and place.** In Chapter 11 the poses were guesses. Here they come from points: an object at (0.20, 0.10, 0.03) m and a bin at (0.20, -0.10, 0.03) m, with the gripper pointing straight down and the "above" poses 4 cm higher. The script solves each, prints the angles and the tip position that forward kinematics gives back, shows how high the tip can go with the gripper tilted and straight, and then runs the pick-and-place state machine of Chapter 11 on the fake arm. Create `aim_demo.py`:

```python linenums="1"
"""Aim the pick and place of Chapter 11 at real points, using inverse kinematics instead of guessed angles."""

import numpy as np

from armlab.arm import Joint, Pose
from armlab.config import load_config
from armlab.fakeworld import FakeArmWithObject
from armlab.kinematics import UnreachableError, so101_ik_3d, so101_tip
from armlab.pick import Task, run_pick_and_place

config = load_config("config/arm.json")
joints = [Joint(name, j["id"], j["min_deg"], j["max_deg"], "percent" if name == "gripper" else "deg")
          for name, j in config["joints"].items()]


def pose_at(x, y, z, gripper, pitch=90.0):
    """The pose that puts the gripper's tip at (x, y, z) pointing down, with the gripper open by some percent."""
    pan, lift, elbow, wrist = so101_ik_3d(x, y, z, pitch_deg=pitch)
    return Pose({"shoulder_pan": pan, "shoulder_lift": lift, "elbow_flex": elbow, "wrist_flex": wrist,
                 "wrist_roll": 0.0, "gripper": gripper})


print("1. Poses from points (metres in the base frame: x forward, y left, z up)")
OBJECT, BIN, ABOVE = (0.20, 0.10, 0.03), (0.20, -0.10, 0.03), 0.04
poses = {"pick above": pose_at(OBJECT[0], OBJECT[1], OBJECT[2] + ABOVE, 100), "pick": pose_at(*OBJECT, 100),
         "place above": pose_at(BIN[0], BIN[1], BIN[2] + ABOVE, 20), "place": pose_at(*BIN, 20)}
for name, p in poses.items():
    angles = [p.values[j] for j in ("shoulder_pan", "shoulder_lift", "elbow_flex", "wrist_flex")]
    tip = so101_tip(*angles)
    print(f"   {name:<12} pan {angles[0]:+6.1f} lift {angles[1]:+6.1f} elbow {angles[2]:+6.1f} wrist {angles[3]:+6.1f}"
          f" -> tip ({tip[0]:.3f}, {tip[1]:+.3f}, {tip[2]:.3f})")

print("2. How high can the tip go with the gripper pointing straight down at (0.20, 0.10)?")
for height in (0.07, 0.09, 0.13):
    for pitch in (90.0, 60.0):
        try:
            so101_ik_3d(0.20, 0.10, height, pitch_deg=pitch)
            outcome = "reachable"
        except UnreachableError:
            outcome = "not reachable"
        print(f"   z = {height:.2f} m, gripper pitch {pitch:.0f} degrees: {outcome}")

print("3. Run the pick and place with these poses on the fake arm")
arm = FakeArmWithObject(joints)
with arm:
    result = run_pick_and_place(Task(arm, poses["pick above"], poses["pick"], poses["place above"], poses["place"]))
print(f"   result: {result.name}")
```

```bash
python aim_demo.py
```

```text
1. Poses from points (metres in the base frame: x forward, y left, z up)
   pick above   pan  -31.8 lift   +2.1 elbow   -0.4 wrist  +88.3 -> tip (0.200, +0.100, 0.070)
   pick         pan  -31.8 lift   +4.8 elbow  +13.4 wrist  +71.8 -> tip (0.200, +0.100, 0.030)
   place above  pan  +31.8 lift   +2.1 elbow   -0.4 wrist  +88.3 -> tip (0.200, -0.100, 0.070)
   place        pan  +31.8 lift   +4.8 elbow  +13.4 wrist  +71.8 -> tip (0.200, -0.100, 0.030)
2. How high can the tip go with the gripper pointing straight down at (0.20, 0.10)?
   z = 0.07 m, gripper pitch 90 degrees: reachable
   z = 0.07 m, gripper pitch 60 degrees: reachable
   z = 0.09 m, gripper pitch 90 degrees: not reachable
   z = 0.09 m, gripper pitch 60 degrees: reachable
   z = 0.13 m, gripper pitch 90 degrees: not reachable
   z = 0.13 m, gripper pitch 60 degrees: reachable
3. Run the pick and place with these poses on the fake arm
   APPROACH
   DESCEND
   GRASP
   LIFT
   TRANSPORT
   LOWER
   RELEASE
   RETREAT
   DONE
   result: DONE
```

The pan angle for the object on the left is negative, because a positive pan turns the arm clockwise seen from above in the URDF's convention, and the state machine ran from the first state to `DONE` with poses computed from points. Section 2 holds a lesson for real use: with the gripper straight down, the "above" height is limited to about 8 cm at this distance, because the lift, elbow and wrist reach their limits. A pre-grasp approach that tilts the gripper (a pitch of 60 degrees works up to at least 15 cm) is the answer, and this is the kind of fact that only kinematics reveals before the arm tries it.

**Step 8. Record your work.**

```bash
git add .
git commit -m "Add geometry, forward and inverse kinematics, reachability, and an aimed pick and place"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python fk_demo.py` prints a difference of `0.00 mm` for the zero pose and under `0.1 mm` for the second pose.
- `python ik_demo.py` shows two solutions for the target (0.15, 0.10) and raises an error for the target (0.30, 0.0).
- `python reach_demo.py` prints a condition number of `infinite` at theta2 = 0 and a joint-space deviation of `33.5 mm`.
- `python aim_demo.py` ends with `result: DONE`.
- Earlier scripts (`pick_demo.py`, `arm_demo.py`) still run.
- `git log --oneline` shows a twelfth commit.

### Challenge: A Safe Straight Line

Write a function `straight_line_joints(start_xz, end_xz, steps)` in `armlab/kinematics.py` that returns the list of joint triples (lift, elbow, wrist) along a straight line in the arm's plane, using each answer as the next starting guess, and that stops with an `UnreachableError` if any step is unreachable. Use it for the line from (0.25, 0.05) to (0.25, 0.30) in 10 steps, and print the largest change of any joint between two steps.

??? note "Click to see one solution"
    The function loops over the points of the line and solves each with the previous answer as the guess, which keeps the elbow in the same state. The largest change is found with `np.abs` and `np.diff`:

    ```python linenums="1"
    def straight_line_joints(start_xz, end_xz, steps):
        """Joint angles (lift, elbow, wrist) for evenly spaced points on a straight line in the arm's plane."""
        start, end = np.array(start_xz, dtype=float), np.array(end_xz, dtype=float)
        guess, path = (-50.0, 50.0, 0.0), []
        for s in np.linspace(0.0, 1.0, steps + 1):
            x, z = start + (end - start) * s
            guess = so101_ik(x, z, start=guess)         # raises UnreachableError if a step cannot be reached
            path.append(guess)
        return path

    path = straight_line_joints((0.25, 0.05), (0.25, 0.30), 10)
    print(np.abs(np.diff(path, axis=0)).max())
    ```

    The largest change between two steps is a few degrees, which at the 50 Hz of Chapter 11 is a smooth motion. If one step failed, the function would raise the error before any move was sent, and that is the same "check the whole list first" rule that you used for waypoints.

## Summary and Key Takeaways

You can now compute where the hand is and which joint angles put it where you want.

- A **NumPy array** holds numbers that are calculated all at once, and `@` multiplies matrices. **Sine and cosine** turn an angle and a length into a position, and a **vector** is a position or an arrow. **Cartesian coordinates** use x forward, y left and z up, and every number needs its **coordinate frame**.
- A **rotation matrix** turns a vector and its transpose turns it back. A **homogeneous transform** is a 4 by 4 matrix with a rotation and a translation, and the order of multiplication matters. A **transform chain** multiplies one transform per joint and link, like a trip from the base to the hand. **Link lengths** and offsets come from the URDF, and **Denavit-Hartenberg parameters** are a four-number form of the same information.
- **Forward kinematics** has one answer: for a **two-link arm** \( x = l_1 \cos\theta_1 + l_2 \cos(\theta_1 + \theta_2) \). The SO-101 chain matches its URDF to 0.04 mm.
- **Inverse kinematics** can have **multiple IK solutions** (elbow up and elbow down) or none. **Geometric inverse kinematics** uses the law of cosines, an **unreachable target** lies outside the ring of 0.019 to 0.251 m, and **numerical inverse kinematics** improves a guess by damped least-squares steps. **Orientation control** holds the gripper's pitch and shrinks the reachable set.
- The **Jacobian** links joint speeds to hand speed. A **singular pose** (a straight or folded elbow) makes it unsolvable, and the condition number warns of it. **Cartesian motion**, in particular **straight-line motion**, solves IK at every step, and it keeps the hand on the line where joint-space interpolation strays.
- **Workspace sampling** builds a **reachability map** by brute force, and **collision checking** tests points along the links against the table and obstacles.

!!! mascot-celebration "You Can Find My Hand Anywhere!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just turned joint angles into a hand position with a chain of transforms, matched the SO-101's own design file to a twentieth of a millimetre, and solved the problem backward to aim a pick and place at real points. That is the mathematics that lets a program talk about the world instead of about joints. Let's move it on to Chapter 13!

[See Annotated References](./references.md)
