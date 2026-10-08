# Quiz: Anatomy of a Robot Arm

Test your understanding of joints, links, poses, degrees of freedom, workspace, and leader and follower arms with these review questions.

---

#### 1. What kind of motion does a revolute joint produce, and how is that motion measured?

<div class="upper-alpha" markdown>
1. It slides along a straight line and is measured as a distance
2. It grips an object and is measured as a force
3. It rotates around a fixed axis and is measured as an angle
4. It bends a rigid piece and is measured as a curvature
</div>

??? question "Show Answer"
    The correct answer is **C**. A revolute joint rotates around a fixed line called its axis, like a door on a hinge, and its motion is measured in degrees or radians. Option A describes a prismatic joint, which slides like a drawer. Links never bend, so option D is wrong. Every joint in the SO-ARM101 is revolute, each driven by a motor that turns a shaft.

    **Concept Tested:** Revolute Joint

    **See:** [Joints and Links](index.md#joints-and-links)

---

#### 2. What is the end effector of a robot arm?

<div class="upper-alpha" markdown>
1. The tool at the very end of the chain, which is the part that touches the world
2. The first motor in the chain, which is fixed to the table
3. The rigid piece between the elbow and the wrist
4. The coordinate system fixed to the base of the arm
</div>

??? question "Show Answer"
    The correct answer is **A**. The end effector is the tool at the end of the chain, such as a gripper, a suction cup, a pen holder, or a camera. It is called an effector because it is where the robot has its effect. Option B describes the base, option C describes a link, and option D describes the base frame. Naming parts from the base outward ends with the end effector.

    **Concept Tested:** End Effector

    **See:** [Naming the Parts](index.md#naming-the-parts)

---

#### 3. Why does the joint nearest the base of a serial arm have to work harder than the joint nearest the tool?

<div class="upper-alpha" markdown>
1. Revolute joints near the base are always built with weaker gearing
2. The base joint must also keep the table from moving
3. Joints near the tool are prismatic, so they need no torque
4. Weight adds up along the chain, so the base joint carries the whole arm plus the load
</div>

??? question "Show Answer"
    The correct answer is **D**. In a serial manipulator the joints form a single chain, and each joint moves and supports everything beyond it. Motion adds up along the chain, and so does weight. The joint nearest the base carries the entire arm and whatever the gripper holds, while the joint nearest the tool carries only a small part of the weight. The other options invent causes that the chapter does not describe.

    **Concept Tested:** Serial Manipulator

    **See:** [What Is a Robot Arm?](index.md#what-is-a-robot-arm)

---

#### 4. The reBot-DevArm's parallel gripper is driven by a motor that turns, yet the chapter calls its finger motion prismatic. Why?

<div class="upper-alpha" markdown>
1. Prismatic joints are defined as any joint that is driven by a motor
2. The kind of joint is decided by the motion at the output, and the fingers slide along a line
3. The gripper has no motor, so it must be a different kind of joint
4. A parallel gripper is always classified as a revolute joint at its base
</div>

??? question "Show Answer"
    The correct answer is **B**. A mechanism can change one kind of motion into another, so the type of joint depends on the motion you get at the output, not on the motor behind it. The reBot's fingers slide toward each other along a line, which is prismatic motion, measured as a distance. Option A is not a definition, option C is false because the gripper is motorized, and option D contradicts the chapter's table.

    **Concept Tested:** Prismatic Joint

    **See:** [Joints and Links](index.md#joints-and-links)

---

#### 5. What is the smallest number of independent joints an arm needs to place its gripper at any position and point it in any direction?

<div class="upper-alpha" markdown>
1. Three, because there are three position axes
2. Four, because most industrial arms have four
3. Six, because a free object has three translations and three rotations
4. Seven, because the gripper needs its own motor as well
</div>

??? question "Show Answer"
    The correct answer is **C**. A free object in space can move in six independent ways: three translations (forward and back, left and right, up and down) and three rotations (tilting forward, tilting sideways, and spinning). To choose all six numbers freely, an arm needs at least six joints. Arms with fewer joints are still useful, but some part of the hand's pose is tied to another part.

    **Concept Tested:** Degrees of Freedom

    **See:** [Degrees of Freedom](index.md#degrees-of-freedom)

---

#### 6. A flat two-link arm has a 12 cm upper arm and a 20 cm forearm, and both joints can turn all the way around. Which target distance from the shoulder can its tip reach?

<div class="upper-alpha" markdown>
1. 25 cm
2. 6 cm
3. 34 cm
4. 7 cm
</div>

??? question "Show Answer"
    The correct answer is **A**. A fully rotating two-link arm reaches distances from |L1 − L2| to L1 + L2. Here that is |12 − 20| = 8 cm up to 12 + 20 = 32 cm. A distance of 25 cm is inside that ring. Targets at 6 cm and 7 cm fall in the central hole where the arm cannot fold tightly enough, and 34 cm is beyond the full stretch of 32 cm.

    **Concept Tested:** Workspace

    **See:** [The Workspace](index.md#the-workspace)

---

#### 7. Why should software joint limits be set inside the mechanical limits, with a margin?

<div class="upper-alpha" markdown>
1. Mechanical limits are only suggestions that the motors ignore
2. Software limits run faster than mechanical stops
3. A smaller range makes the arm easier to calibrate
4. A program should never ask a joint to push against a stop, where current rises, the motor heats up, and printed parts take the load
</div>

??? question "Show Answer"
    The correct answer is **D**. If a program commands 120 degrees but the joint stops at 97, the servo keeps pushing against the stop. Its motor current rises, it heats up, and the printed parts carry the load. A software limit with a margin, such as stopping 5 degrees before the mechanical stop, refuses the command before anything moves. Mechanical stops are real physical barriers, so option A is wrong.

    **Concept Tested:** Joint Limits

    **See:** [Joint Limits](index.md#joint-limits)

---

#### 8. You bend the leader arm's elbow to +30 degrees and a program copies that number to the follower, which bends 30 degrees the opposite way. Nothing is broken. What is the most likely cause?

<div class="upper-alpha" markdown>
1. The follower's gripper is a parallel gripper and not a moving-jaw gripper
2. The two arms disagree about the positive direction, so the same number means mirrored motion
3. The follower's motors use a 1/345 gear ratio and the leader's do not
4. The follower is outside its workspace, so it reflects the command
</div>

??? question "Show Answer"
    The correct answer is **B**. Each maker picks its own zero position and positive direction, so the same number can mean different physical motions on two arms. If the leader counts a forward bend as positive and the follower counts it as negative, the follower looks like a mirror image. Gear ratio changes how hard a joint is to turn, not which way it moves. Calibration in Chapter 8 makes the same number mean the same angle on both arms.

    **Concept Tested:** Joint Angle

    **See:** [Joint Angle](index.md#joint-angle)

---

#### 9. Five trials with the same command all land within 0.3 mm of one another, but the cluster is 2 mm from the target. How should this arm be described?

<div class="upper-alpha" markdown>
1. Repeatable but not accurate
2. Accurate but not repeatable
3. Both accurate and repeatable
4. Neither accurate nor repeatable
</div>

??? question "Show Answer"
    The correct answer is **A**. Repeatability is how tightly the landing points cluster, and accuracy is how close their average is to the point you asked for. This cluster is tight, so the arm is repeatable, but its average sits 2 mm from the target, so it is not accurate. A repeatable arm can be fixed with one correction from calibration. A scattered arm cannot, because its error changes every time.

    **Concept Tested:** Repeatability

    **See:** [Repeatability](index.md#repeatability)

---

#### 10. Which arm carries a handle and a trigger and does no physical work?

<div class="upper-alpha" markdown>
1. The follower arm
2. The bimanual arm
3. The leader arm
4. The parallel arm
</div>

??? question "Show Answer"
    The correct answer is **C**. The leader arm is the one a person holds and moves by hand. It senses joint angles and ends in a handle with a trigger that stands in for the follower's gripper. The follower does the work and has a real gripper. A bimanual robot has two working arms, which is a different idea from a leader and follower pair. A parallel gripper is a type of end effector, not a kind of arm.

    **Concept Tested:** Leader Arm

    **See:** [The Leader Arm](index.md#the-leader-arm)
