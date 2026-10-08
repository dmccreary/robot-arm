---
title: "A Python Hardware Library for Robot Arms"
description: "How to build a small Python library that hides hardware differences behind one interface: raw units, degrees and radians, classes and interfaces, type hints, dataclasses, a fake arm, drivers for the SO-ARM101 and the reBot-DevArm, and exceptions and context managers for hardware."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 21:22:41"
version: 1.11
---

# A Python Hardware Library for Robot Arms

## Summary

This chapter builds a small Python library that hides hardware differences behind one interface. It introduces classes, dataclasses, type hints, a fake arm for testing, context managers, and exception handling for hardware. After this chapter, you will be able to read and write joint positions in real units on either arm or on the fake arm.

## Concepts Covered

This chapter covers the following 22 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Class Interface | 593 |
| Arm Class | 436 |
| Type Hints | 305 |
| Reading Joint Positions | 170 |
| Writing Target Positions | 151 |
| Raw Servo Units | 105 |
| Degrees and Radians | 105 |
| Unit Conversion | 104 |
| Hardware Abstraction Layer | 75 |
| Inheritance for Drivers | 74 |
| Fake Arm | 73 |
| Dataclass | 4 |
| Try Finally | 4 |
| Exception Handling for Hardware | 3 |
| Pose Dataclass | 2 |
| Connect and Disconnect | 2 |
| With Statement | 2 |
| Custom Exceptions | 2 |
| Joint Class | 1 |
| Mock Hardware | 1 |
| Command Dataclass | 1 |
| Context Manager | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 4: Serial and CAN Communication](../04-serial-and-can-communication/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 9: Building the reBot-DevArm and Choosing a Platform](../09-building-the-rebot-devarm/index.md)

---

!!! mascot-welcome "One Program, Any Arm!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Right now you can talk to my servos in bytes and to my cousin's motors in CAN frames. In this chapter you will hide all of that behind a few friendly methods, so a program that says "move the shoulder to 30 degrees" works on either arm, or on a pretend one. Let's move it!

You have now built two arms and learned two bus languages. Chapter 4 gave you packets of bytes for the SO-ARM101's servos, and Chapter 9 gave you eight-byte CAN frames for the reBot-DevArm's motors. A program that uses them directly has a problem. Every line that talks to a servo mentions register names, raw steps and checksums, and every line that talks to a Damiao motor mentions identifiers, bits and radians. If you wrote a pick-and-place program in either style, you could not run it on the other arm, and you could not test it without the arm.

The cure is a layer of software that the rest of your programs talk to. Programs say what they want in units that people use, such as "elbow to 45 degrees". The layer turns that into bytes or frames for whichever arm is attached. This chapter builds the layer in the `armlab` package that you have grown since Chapter 1. It begins with the units, because the first job of any such layer is to translate. Then it defines what an arm *is* in Python, writes a fake arm that needs no hardware, adds the two real drivers, and finally makes the library safe when something goes wrong.

## Units: Raw, Degrees, and Radians

### Raw Servo Units

**Raw servo units** are the numbers that a servo uses inside, before anyone converts them to something a person can picture. The STS3215's position register holds a count of encoder steps, from 0 to 4095, because the encoder has 12 bits (Chapter 5). A full turn is about 4096 steps, so one step is \( 360 / 4095 \approx 0.088 \) degrees. LeRobot divides by 4095, the largest value, rather than by 4096, and this book follows it. The difference is about 0.02 percent, which is far below the servo's accuracy.

The raw number is meaningless without the calibration of Chapter 8. A raw reading of 2047 is the middle of the range for one joint, and for another joint it is 55 steps from the middle. The calibration file stores each joint's smallest and largest raw values, so the same raw number can be turned into a real position once you know the joint it came from. That is the first reason for a library: raw numbers belong to one joint of one arm, and the program should never see them.

### Degrees and Radians

A **degree** is one 360th of a full turn, the unit that people use for angles. A **radian** is the angle at which the arc along a circle equals the circle's radius, so a full turn is \( 2\pi \) radians and \( 180^\circ = \pi \) radians. Conversion is a multiplication:

\[ \text{radians} = \text{degrees} \times \frac{\pi}{180}, \qquad \text{degrees} = \text{radians} \times \frac{180}{\pi} \]

Python's `math.radians` and `math.degrees` do it. Both units appear in robotics. The Damiao motors of Chapter 9 report position in radians, and so does most of the mathematics of Chapter 12, because sine and cosine in Python's `math` module take radians. People think in degrees, and the configuration file of Chapter 2 is written in degrees. A worked example: 90 degrees is \( 90 \times \pi / 180 = 1.5708 \) radians, and 0.5 radians is \( 0.5 \times 180 / \pi = 28.65 \) degrees. A classic bug is passing degrees to `math.sin`, which expects radians: `math.sin(90)` is 0.894 and not 1.

### Unit Conversion

**Unit conversion** is the single place where all of this is done. The rule that keeps a library sane is to *convert at the edge*. Inside your programs, every joint value has one unit: degrees for the arm's joints and percent for a gripper (0 closed, 100 open, as LeRobot does). Raw steps and radians exist only inside a driver, and the driver converts on the way in and on the way out. The conversion functions use a joint's calibration. For a joint whose calibrated range runs from `range_min` to `range_max`, the middle of the range is \( (\text{range\_min} + \text{range\_max}) / 2 \), and

\[ \text{degrees} = \frac{\text{raw} - \text{middle}}{4095 / 360}, \qquad \text{raw} = \text{middle} + \text{degrees} \times \frac{4095}{360} \]

with the raw value rounded to a whole step and kept inside the calibrated range. A percent runs from 0 at `range_min` to 100 at `range_max`.

Here is a worked example with the shoulder pan from the lab of Chapter 8, whose range is 742 to 3242. The middle is 1992. A raw reading of 3000 is \( (3000 - 1992) / 11.375 = 88.6 \) degrees, and a target of 45 degrees is raw \( 1992 + 45 \times 11.375 = 2504 \). A target of 150 degrees would be raw 3698, which is outside the range, so the conversion holds it at 3242, the same as 109.9 degrees. The table summarizes the conversions that the library needs.

| From | To | Rule |
|---|---|---|
| Raw steps | Degrees | \( (\text{raw} - \text{middle}) \times 360 / 4095 \) |
| Degrees | Raw steps | \( \text{middle} + \text{degrees} \times 4095 / 360 \), rounded, kept in range |
| Raw steps | Percent | \( (\text{raw} - \text{range\_min}) / (\text{range\_max} - \text{range\_min}) \times 100 \) |
| Degrees | Radians | \( \text{degrees} \times \pi / 180 \) |

The next MicroSim lets you practise these conversions with the calibration of that shoulder pan.

#### Diagram: Unit Converter Drill

<details markdown="1">
<summary>Unit Converter Drill</summary>
Type: microsim
**sim-id:** unit-converter-drill<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate conversions between raw servo steps, degrees, radians and percent for a calibrated joint, to within 0.1 degree, 0.001 radian, 1 step or 0.1 percent as asked, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** raw servo units, degrees, radians, calibration range, middle of the range, unit conversion (all defined in the section "Units: Raw, Degrees, and Radians" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within the tolerance in the Tolerance column of Content. Mastery is 5 of 6 correct on the first attempt. Changing the calibration or the raw value in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The same raw number means the same angle on every joint. (It depends on the joint's calibrated range.) (2) Zero degrees is raw 2048. (Zero is the middle of the joint's own range.) (3) A target beyond the range moves the joint beyond it. (The conversion holds it at the end of the range.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a procedure on new numbers with an immediate check. Fixing one calibration for all problems lets the learner see how the same rule gives different answers for different inputs.

**Content:**

Explore mode shows one joint with a calibrated range, and converts a value the learner sets in any one unit into the other three. The formulas are those of the table in the chapter section "Unit Conversion", with 4095 / 360 = 11.375 steps per degree.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| range_min | 0 | 4095 | 1 | 742 | steps |
| range_max | 0 | 4095 | 1 | 3242 | steps |
| Raw value | 0 | 4095 | 1 | 1992 | steps |

The range_max value must be larger than range_min. Six problems in this fixed order. The first five use the shoulder pan of the chapter (range 742 to 3242, middle 1992) and problem 6 uses the gripper (range 1977 to 3397).

| # | Problem | Unit asked | Correct | Tolerance | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | The shoulder pan reads raw 3000. What is the angle? | degrees | 88.6 | 0.1 | (3000 - 1992) / 11.375 = 88.6 degrees. |
| 2 | The shoulder pan is commanded to 45 degrees. What raw value is sent? | steps | 2504 | 1 | 1992 + 45 x 11.375 = 2503.9, which rounds to 2504. |
| 3 | The shoulder pan reads raw 1000. What is the angle? | degrees | -87.2 | 0.1 | (1000 - 1992) / 11.375 = -87.2 degrees. |
| 4 | A Damiao motor reports 0.5 radians. How many degrees is that? | degrees | 28.6 | 0.1 | 0.5 x 180 / pi = 28.65 degrees, which rounds to 28.6 or 28.7 within the tolerance. |
| 5 | A joint is commanded to 30 degrees. How many radians is that? | radians | 0.524 | 0.001 | 30 x pi / 180 = 0.5236 radians. |
| 6 | The gripper (range 1977 to 3397) reads raw 2500. What percent open is it? | percent | 36.8 | 0.1 | (2500 - 1977) / (3397 - 1977) x 100 = 36.8 percent. |

**Provenance:** The calibration of the shoulder pan (742 to 3242) and of the gripper (1977 to 3397) are the results of the lab in Chapter 8, which uses made-up positions, and the sim labels them "illustrative". The formulas are from the chapter section "Unit Conversion". The steps per degree is 4095 / 360, the convention used by LeRobot.

**Rules:** middle = (range_min + range_max) / 2. degrees = (raw - middle) x 360 / 4095. raw = round(middle + degrees x 4095 / 360), limited to range_min through range_max. percent = (raw - range_min) / (range_max - range_min) x 100. radians = degrees x pi / 180. An answer is correct when |typed - correct| <= the tolerance.

**Learner Activity:**

1. In Explore mode the learner sets the range and a value in one unit and reads the other three units. The learner should notice that the middle of the range converts to 0 degrees and 50 percent, whatever the range is.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with range 742 to 3242 and raw 1992, showing 0.0 degrees, 0.000 radians and 50.0 percent.

**Chapter Anchors:** The chapter's worked example is the shoulder pan with range 742 to 3242: raw 3000 is 88.6 degrees, 45 degrees is raw 2504, and 150 degrees is held at raw 3242. The chapter states 4095 / 360 steps per degree, 90 degrees as 1.5708 radians and 0.5 radians as 28.65 degrees. The sim has six problems and mastery is 5 of 6.
</details>

!!! mascot-tip "Convert at the Edge"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Give every value inside your program one unit, and convert only where data enters or leaves the library. When a number looks wrong, ask first "which unit is this in?" Mixed units are the cause of more robot bugs than any other mistake.

## Classes and Interfaces

### Class Interface

A **class interface** is the list of methods that a program may call on an object, and the promise of what each one does. It says nothing about *how*. Think of a light switch: its interface is "up is on, down is off", and the wiring behind the wall can be anything. A program that depends on an interface works with every class that keeps the promise. That is the idea of this whole chapter: define the interface of an arm once, and write each real arm to keep it.

Python has a tool for writing interfaces down. A class that inherits from `ABC` (from the `abc` module) and marks methods with `@abstractmethod` is an **abstract base class**. It cannot be used directly. Python refuses to create an object of it, and refuses to create an object of a subclass that has not filled in every abstract method. That check catches a missing method when the program starts, and not in the middle of a move.

LeRobot does the same thing. Its `Robot` base class lists what every robot must do: `connect`, `disconnect`, `get_observation`, `send_action`, and a way to say whether it is calibrated. The SO-101 class is one implementation of that interface. The `Arm` class of this chapter has the same shape, with simpler names and in units that you choose.

!!! mascot-thinking "The Interface Is a Promise"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A good interface is small and says what, never how. When your program calls `arm.move_to(pose)`, it should not know or care whether bytes, CAN frames or a dictionary sit underneath. If you ever catch a program checking which arm it has, the interface is missing something.

### Type Hints

**Type hints** are notes in the code that say what type of value a function expects and returns. They go after a colon for each parameter and after an arrow for the result:

```python linenums="1"
def deg_to_rad(deg: float) -> float:
    return deg * 3.14159265 / 180


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(value, high))


def first_name(names: list[str]) -> str | None:
    return names[0] if names else None
```

The notation builds up from simple names (`int`, `float`, `str`, `bool`) to containers: `list[str]` is a list of strings, `dict[str, float]` is a dictionary from strings to floats, and `float | None` means "a float, or None". Python does not enforce them: calling `clamp("a", 0, 1)` still runs and fails inside. Their value is somewhere else. They document the code for the next reader, they let an editor warn you of a mismatch as you type, and a checker such as `mypy` can find a whole class of mistakes before the program runs. For a library that other programs depend on, they are the cheapest documentation there is, which is why every function in `armlab/arm.py` carries them.

### Dataclasses: Joint, Pose and Command

A **dataclass** is a class whose main job is to hold data. Writing the `__init__` method for such a class by hand is tedious, and Python can do it. You put `@dataclass` above the class and list the fields with their types, and Python writes the constructor, a readable `repr`, and the `==` comparison. You used one in Chapter 8 for the calibration. Three dataclasses carry the library's data.

The **Joint class** describes one joint: its name, its ID on the bus, its limits, and the unit its values are given in. It is frozen, which means that it cannot be changed after it is made, so a joint's limits cannot change by accident in the middle of a program.

```python linenums="1"
@dataclass(frozen=True)
class Joint:
    name: str
    id: int
    min: float
    max: float
    unit: str = "deg"
```

The **Pose dataclass** holds a value for each joint, as Chapter 2's dictionary did, with methods for the things you do with poses. `with_joint` returns a *copy* with one joint changed, which avoids changing a pose that other code still holds, and `max_difference` gives the largest change of any joint between two poses, which Chapter 11 uses to decide when a move is finished. The **Command dataclass** is a request: a target pose and an optional limit on how far any joint may move in one step. It is the object that Chapters 11 and 15 pass between a planner and the arm.

## The Arm Class

### Reading and Writing Positions

The **Arm class** is the interface. A program uses four methods and one property of it. `connect()` opens the arm and switches the motors on, and `disconnect()` switches them off and closes it. **Reading joint positions** is `read_pose()`, which returns a `Pose` in the library's units. **Writing target positions** is `move_to(pose)`, which checks each target against its joint's limits, sends it, and returns the pose that was sent. A fifth method, `execute(command)`, is `move_to` with the speed limit of Chapter 5: it reads where the joints are, lets no joint move more than the command's `max_step`, and sends the limited target.

The class does the same job every time, such as checking the limits, and leaves the arm-specific work to four methods whose names begin with an underscore: `_open`, `_close`, `_read` and `_write`. A subclass fills in those four and gets everything else free. This is the **template method** pattern, and it is worth noticing which side does what.

| Part | Written once in `Arm` | Written by each driver |
|---|---|---|
| Checking that the arm is connected | Yes | No |
| Checking limits before a write | Yes | No |
| Limiting the step of a command | Yes | No |
| Opening the bus and switching the torque on | No | `_open` |
| Reading a joint in the library's unit | No | `_read` |
| Sending a target in the arm's own unit | No | `_write` |
| Switching the torque off and closing the bus | No | `_close` |

The limit check is in the base class on purpose. A driver that forgot it would be a safety hole, so the check sits where no driver can skip it. This is the first of many places where the library puts a safety rule in the layer that cannot be bypassed, an idea that Chapter 17 builds into a whole safety layer.

### Connect and Disconnect

**Connect and disconnect** frame everything else. The arm is useless before `connect` and dangerous to leave connected, so the class refuses to read or write when it is not connected, with an error that says to connect first. The torque, the setting that holds the joints, comes on in `_open` and goes off in `_close`, as Chapter 8's safe shutdown requires.

## Drivers and the Hardware Abstraction Layer

### The Hardware Abstraction Layer

A **hardware abstraction layer** (HAL) is the layer between a program and the hardware that hides the differences between devices. Chapter 4's table of layers had a row "Hardware abstraction (yours)" with the example `arm.move_to(pose)`, and now you build it. The table extends the earlier one with the pieces from this chapter.

| Layer | What it knows | Example |
|---|---|---|
| Your program | Poses, in degrees and percent | `arm.move_to(pose)` |
| `Arm` interface | Limits, connection, step limits | The base class |
| A driver | One arm's units and messages | `FeetechArm`, `DamiaoArm` |
| The bus functions | Packets or frames | `write_register`, `pack_mit` |
| The hardware | Steps, amps and the physical world | The servos and motors |

The program at the top never imports anything from below the interface, and that is what lets it run on any arm.

### Inheritance for Drivers

**Inheritance** lets a class take everything from another and add or replace parts. A driver *inherits* from `Arm`: `class FeetechArm(Arm)` means "a `FeetechArm` is an `Arm`, plus these four methods". The driver for the SO-ARM101, `FeetechArm`, takes a `send` function like the one in Chapter 4 (a pretend bus or a real serial port) and the calibration of each joint. Its `_open` writes `Torque_Enable` to each servo, `_read` reads `Present_Position` and converts the raw steps to degrees or percent, `_write` converts degrees or percent to raw steps and writes `Goal_Position`, and `_close` turns the torque off. The driver for the reBot-DevArm, `DamiaoArm`, takes an `exchange` function that sends one CAN frame and returns the reply's data. It turns degrees to radians, packs an MIT frame, and reads a position from the feedback that every reply carries.

Look at what the two drivers do *not* contain: a limit check, a connection check, or a step limit. They inherit them. A third arm needs only four methods, and every program written for the interface runs on it at once.

!!! mascot-warning "Do Not Leak the Hardware Upward"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    The moment a program checks `isinstance(arm, FeetechArm)` or mentions a raw step, the abstraction has leaked, and it will break on the next arm. If a program needs something that the interface does not offer, add it to the interface, with a version for every driver, and do not reach under it.

The next MicroSim practises seeing through the layers. You are given one call on one driver, and you say what actually happens underneath.

#### Diagram: Driver Swap Tracer

<details markdown="1">
<summary>Driver Swap Tracer</summary>
Type: microsim
**sim-id:** driver-swap-tracer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** interpret<br/>
**Learning Objective:** The learner will interpret what a call on the Arm interface does underneath for each of three drivers, in six calls, by choosing the correct low-level action, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** class interface, Arm class, hardware abstraction layer, inheritance for drivers, fake arm, unit conversion (all defined in the sections above this block).

**Evidence of Mastery:** For each of six calls the learner chooses one of six low-level actions and commits. A choice is correct when it matches the Action column in Content. Mastery is 5 of 6 correct on the first attempt. Reading the layer table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The same call sends the same bytes on every arm. (Each driver translates it into its own units and messages.) (2) The limit check is done by the driver. (It is done once, in the base class, before the driver is called.) (3) A fake arm does nothing. (It remembers the targets so that a test can look at them.)

**Instructional Rationale:** An Understand-level interpret objective asks the learner to explain what a representation means. Showing one high-level call and asking for its low-level translation makes the learner trace through the layers and unit conversions.

**Content:**

The six actions the learner chooses among: "Stores the values in a dictionary and records the write", "Writes Goal_Position to servo 1 with raw 2106", "Sends an MIT frame to CAN ID 0x01 with a position of about 0.175 rad", "Reads Present_Position from servo 1 and converts raw 2047 to degrees", "Sends an enable frame to CAN ID 0x01 and decodes the position in the reply", "Raises JointLimitError and sends nothing". The calibration of the shoulder pan is range 742 to 3242. Six calls in this fixed order:

| # | Driver | Call | Action | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | FakeArm | move_to a pose with shoulder_pan = 10.0 | Stores the values in a dictionary and records the write | The fake arm has no hardware, so it keeps the values and a log of the writes. |
| 2 | FeetechArm | move_to a pose with shoulder_pan = 10.0 | Writes Goal_Position to servo 1 with raw 2106 | 1992 + 10 x 11.375 = 2105.75, which rounds to 2106. |
| 3 | DamiaoArm | move_to a pose with joint1 = 10.0 | Sends an MIT frame to CAN ID 0x01 with a position of about 0.175 rad | 10 degrees is 0.1745 radians, packed into the 16-bit position field. |
| 4 | FeetechArm | read_pose | Reads Present_Position from servo 1 and converts raw 2047 to degrees | The driver reads the raw steps and converts them: (2047 - 1992) / 11.375 = 4.84 degrees. |
| 5 | DamiaoArm | read_pose | Sends an enable frame to CAN ID 0x01 and decodes the position in the reply | Every reply carries a position, so the driver asks with an enable frame and decodes it. |
| 6 | FeetechArm | move_to a pose with shoulder_pan = 140.0 (limit 110) | Raises JointLimitError and sends nothing | The base class checks the limits first, so no driver code runs. |

**Provenance:** The calls and values are from the chapter sections "Inheritance for Drivers" and "Reading and Writing Positions" and the lab of this chapter. The calibration is the illustrative one of the lab in Chapter 8.

**Rules:** Each call has exactly one correct action. The limit check happens before any driver method. Raw = round(1992 + degrees x 11.375) for the shoulder pan.

**Learner Activity:**

1. In Explore mode the learner reads the layer table and sees the same call, move_to shoulder_pan = 10, traced through the three drivers.
2. The learner switches to the six calls. Call 1 is shown with the driver named.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After call 6 it shows the score.

**Feedback:** Six calls, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. Underneath, this call <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode showing the call move_to shoulder_pan = 10 and the three drivers, with the prompt "Trace the call through each driver."

**Chapter Anchors:** The chapter states that the limit check is in the base class, that the Feetech driver converts 10 degrees to raw 2106 for the shoulder pan of the lab, and that the Damiao driver sends an MIT frame and reads the position from the feedback. The sim has six calls and mastery is 5 of 6.
</details>

### The Fake Arm

A **fake arm** is an `Arm` with no hardware. It keeps the joint values in a dictionary, remembers every write in a list, tracks whether the torque is "on", and can be told to fail after a number of writes. Because it keeps the same interface, a program cannot tell the difference, which is the point. Chapter 3's second rule was to simulate first and then power on, and the fake arm is how a program is run before the first real movement. **Mock hardware** is the general name for any software that stands in for a device in this way, such as the pretend servo bus and the pretend Damiao motors of Chapters 4 and 9. The fake arm sits at a higher level than they do, and replaces the whole driver. Chapter 13 uses it to test programs automatically.

## When Hardware Fails

### Custom Exceptions

A program talks to a machine, and machines fail in ways that arithmetic never does: a cable comes loose, a reply is garbled, a target is outside what a joint can do. **Exception handling for hardware** is the practice of deciding, ahead of time, what each failure becomes in your program. The first step is to give each kind its own name, with **custom exceptions**: classes that inherit from `Exception`. The library has a family under one parent, `ArmError`, with three children: `NotConnectedError` (a method was used before `connect`), `CommunicationError` (the arm did not answer, or answered with something unreadable), and `JointLimitError` (a target is outside a limit). A program can catch the parent to handle any arm failure, or one child to handle just that kind. The limit error carries the joint, the value and the limits as attributes, so a handler can say exactly what was wrong without parsing a message.

Low-level errors should be *translated* on the way up. When `FeetechArm` receives a damaged reply, the packet code of Chapter 4 raises a `ValueError` that says "bad checksum", which means nothing to a program that does not know about packets. The driver catches it and raises `CommunicationError` instead, with `raise ... from error` to keep the original attached as the cause for anyone who needs to debug. The user of the library sees one family of errors, and the details are still there.

### Try, Finally, and the With Statement

Some code must run *whatever happens*, and for an arm the clearest case is switching the torque off. **Try finally** is the Python construct for it. The `finally` block runs after the `try` block ends normally, with a `return`, or with an exception, and the exception then continues upward. Chapter 3's `run_moves` function used it in exactly this way.

The **with statement** is a shorter and safer way to say the same thing for a thing that has a start and an end. An object that works with `with` is a **context manager**: it has an `__enter__` method that runs at the start of the block and an `__exit__` method that runs at the end, always, even when an error was raised inside. The `Arm` class is one. Its `__enter__` calls `connect` and returns the arm, and its `__exit__` calls `disconnect` and returns `False`, which means "do not hide the error".

```python linenums="1"
with arm:
    arm.move_to(target)         # if this raises, the torque is still switched off
```

is the same as

```python linenums="1"
arm.connect()
try:
    arm.move_to(target)
finally:
    arm.disconnect()
```

but you cannot forget the second form's `finally`. The lab runs four versions of the same failure, and the difference is dramatic: with a `with` block, or a `try` and `finally`, the torque is off at the end, and with neither it is still on. The last MicroSim of the chapter asks you to predict that outcome for six small programs.

!!! mascot-warning "A Missing Cleanup Leaves the Torque On"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A program that crashes after `connect()` and before `disconnect()` leaves the motors holding, with nobody commanding them. Always use `with arm:` (or a `try` and `finally`), so that the torque comes off whatever happens, and do not rely on remembering to clean up at the end of the happy path.

#### Diagram: With Block Predictor

<details markdown="1">
<summary>With Block Predictor</summary>
Type: microsim
**sim-id:** with-block-predictor<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer the outcome of six short programs that use a fake arm, by choosing what happens to the error and to the torque, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** connect and disconnect, exception handling for hardware, custom exceptions, try finally, with statement, context manager (all defined in the section "When Hardware Fails" above this block).

**Evidence of Mastery:** For each of six programs the learner chooses one of four outcomes and commits before the outcome is run. A choice is correct when it matches the Outcome column in Content. Mastery is 5 of 6 correct on the first attempt. Running programs in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A with block hides errors. (It switches the torque off and lets the error continue.) (2) An error that is caught inside a with block leaves the torque on. (The block still ends and disconnects.) (3) Code after a failed call still runs. (An uncaught error skips the rest of the block.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from code to behavior. Predicting the outcome before it is run makes the learner trace the flow of control through the cleanup, which is the skill that keeps real arms safe.

**Content:**

Each program uses a fake arm with joints shoulder_pan (limits -110 to 110) and elbow_flex (limits -97 to 97). The four outcomes: "The error continues upward and the torque is off", "The error continues upward and the torque is still on", "The error is caught and the torque is off", "The error continues upward and the torque was never on". Six programs in this fixed order:

| # | Program | Outcome | Why (shown as feedback) |
|---|---|---|---|
| 1 | with arm: followed by arm.move_to(Pose({"shoulder_pan": 140.0})) | The error continues upward and the torque is off | The limit check raises JointLimitError, the with block exits through __exit__, which disconnects, and the error is not hidden. |
| 2 | arm.connect() followed by arm.move_to(Pose({"shoulder_pan": 140.0})), with no with and no try | The error continues upward and the torque is still on | Nothing runs disconnect, so the torque stays on after the error. |
| 3 | arm.connect(); try: arm.move_to(Pose({"shoulder_pan": 140.0})) finally: arm.disconnect() | The error continues upward and the torque is off | The finally block runs on the way out, so the torque is switched off and the error continues. |
| 4 | with arm: try: arm.move_to(Pose({"shoulder_pan": 140.0})) except JointLimitError: print("limit") | The error is caught and the torque is off | The except block handles the error, the program continues, and the with block still disconnects at its end. |
| 5 | arm.read_pose() with no connect() | The error continues upward and the torque was never on | NotConnectedError is raised before any driver code runs, and the torque was never switched on. |
| 6 | with FakeArm(joints, fail_after=0) as arm: followed by arm.move_to(Pose({"shoulder_pan": 10.0})) | The error continues upward and the torque is off | The first write raises CommunicationError, and the with block disconnects on the way out. |

**Provenance:** The programs and their outcomes are from the lab of this chapter, and were checked by running them. The programs are illustrative.

**Rules:** Each program has exactly one correct outcome. An error raised inside a with block runs __exit__ before it continues. An error caught by an except block inside the with block does not leave the block. A write is checked against the joint limits before the driver is called.

**Learner Activity:**

1. In Explore mode the learner picks one of the programs, runs it, and sees the sequence of events: connect, the call, the error, the cleanup, and the final torque state.
2. The learner switches to the six programs. Program 1 is shown.
3. The learner chooses an outcome and commits.
4. The sim runs the program and shows whether the choice was correct and the Why text, then moves on. After program 6 it shows the score.

**Feedback:** Six programs, fixed order, one attempt each. Correct: "Correct: <outcome>. <Why>". Incorrect: "Not quite. The outcome is: <outcome>. <Why>". The correct outcome is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with program 1 shown and the prompt "What will happen to the error and to the torque?"

**Chapter Anchors:** The chapter states that a with block calls disconnect even when an error is raised, that its __exit__ returns False so that the error is not hidden, and that without a with block or a finally block the torque stays on after a failure. The sim has six programs and mastery is 5 of 6.
</details>

## Lab: Build the Arm Library

In this lab you will build the library of this chapter in your `arm-lab` project and run one program on three arms: the fake arm, the SO-ARM101 driver on the pretend servo bus, and the reBot driver on the pretend CAN bus. Nothing needs hardware. The new Python ideas are the ones of the chapter: classes with an abstract base, type hints, dataclasses, custom exceptions, and the `with` statement. You will use the calibration file from Chapter 8 (`calibration/my_follower.json`) and the pretend Damiao motors from Chapter 9.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the unit conversions.** Each function is one row of the table in the chapter. They take a joint's calibration, the `JointCalibration` of Chapter 8, and use its `range_min` and `range_max`. Create `armlab/units.py`:

```python linenums="1"
"""Convert between raw servo steps, degrees, radians, and percent."""

import math

STEPS_PER_DEGREE = 4095 / 360          # the 12-bit encoder, as LeRobot counts it


def deg_to_rad(deg):
    return math.radians(deg)


def rad_to_deg(rad):
    return math.degrees(rad)


def _middle(cal):
    return (cal.range_min + cal.range_max) / 2


def raw_to_deg(raw, cal):
    """Degrees from the middle of the calibrated range, for a raw reading."""
    return (raw - _middle(cal)) / STEPS_PER_DEGREE


def deg_to_raw(deg, cal):
    """The raw position for an angle, kept inside the calibrated range."""
    raw = round(_middle(cal) + deg * STEPS_PER_DEGREE)
    return max(cal.range_min, min(raw, cal.range_max))


def raw_to_percent(raw, cal):
    """0 at the low end of the calibrated range and 100 at the high end."""
    return (raw - cal.range_min) / (cal.range_max - cal.range_min) * 100


def percent_to_raw(percent, cal):
    raw = round(cal.range_min + percent / 100 * (cal.range_max - cal.range_min))
    return max(cal.range_min, min(raw, cal.range_max))
```

**Step 3. Run the conversions.** The script prints the conversions of the chapter's worked example, for the shoulder pan and the gripper. Create `units_demo.py`:

```python linenums="1"
"""Raw steps, degrees, radians and percent for the shoulder pan and the gripper."""

from armlab.calibrate import load_calibration
from armlab.units import deg_to_rad, deg_to_raw, percent_to_raw, rad_to_deg, raw_to_deg, raw_to_percent

calibrations = load_calibration("calibration/my_follower.json")
pan, grip = calibrations["shoulder_pan"], calibrations["gripper"]
print(f"shoulder_pan range {pan.range_min} to {pan.range_max}, gripper range {grip.range_min} to {grip.range_max}")

print("Raw steps to degrees (shoulder pan)")
for raw in (pan.range_min, 1992, 2047, pan.range_max):
    deg = raw_to_deg(raw, pan)
    print(f"   raw {raw:>4} -> {deg:>7.2f} deg = {deg_to_rad(deg):>6.3f} rad")

print("Degrees to raw steps and back (shoulder pan)")
for deg in (0, 10, 45, 90, 150):
    raw = deg_to_raw(deg, pan)
    print(f"   {deg:>3} deg -> raw {raw:>4} -> {raw_to_deg(raw, pan):>7.2f} deg")

print("Gripper percent to raw steps and back")
for percent in (0, 25, 100):
    raw = percent_to_raw(percent, grip)
    print(f"   {percent:>3}% -> raw {raw:>4} -> {raw_to_percent(raw, grip):>5.1f}%")

print(f"One degree is {4095 / 360:.3f} steps; 90 degrees is {rad_to_deg(deg_to_rad(90)):.1f} degrees or {deg_to_rad(90):.4f} rad")
```

```bash
python units_demo.py
```

```text
shoulder_pan range 742 to 3242, gripper range 1977 to 3397
Raw steps to degrees (shoulder pan)
   raw  742 -> -109.89 deg = -1.918 rad
   raw 1992 ->    0.00 deg =  0.000 rad
   raw 2047 ->    4.84 deg =  0.084 rad
   raw 3242 ->  109.89 deg =  1.918 rad
Degrees to raw steps and back (shoulder pan)
     0 deg -> raw 1992 ->    0.00 deg
    10 deg -> raw 2106 ->   10.02 deg
    45 deg -> raw 2504 ->   45.01 deg
    90 deg -> raw 3016 ->   90.02 deg
   150 deg -> raw 3242 ->  109.89 deg
Gripper percent to raw steps and back
     0% -> raw 1977 ->   0.0%
    25% -> raw 2332 ->  25.0%
   100% -> raw 3397 -> 100.0%
One degree is 11.375 steps; 90 degrees is 90.0 degrees or 1.5708 rad
```

Look at three lines. Raw 2047 is 4.84 degrees and not zero, because zero is the middle of this joint's range (1992), the point made in Chapter 8. A command of 150 degrees is held at raw 3242 and reads back as 109.89 degrees, the end of the range. And the round trips are off by about 0.01 degree, because a step is 0.088 degrees and the raw value must be a whole number.

**Step 4. Write the Arm interface and the fake arm.** This is the heart of the chapter. Read it in this order: the exceptions, then the three dataclasses, then the `Arm` class with its four abstract methods and the public methods built on them, and last `FakeArm`. Notice that `move_to` raises `JointLimitError` before it calls `_write`, and that `__exit__` returns `False`. The file imports `limit_target` from the `guard.py` module of Chapter 5 for `execute`. Create `armlab/arm.py`:

```python linenums="1"
"""One interface for every arm: the Arm base class, a fake arm, and the data types they share."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, replace

from armlab.guard import limit_target


class ArmError(Exception):
    """The base class for every error that an arm raises."""


class NotConnectedError(ArmError):
    """An arm method was used before connect() or after disconnect()."""


class CommunicationError(ArmError):
    """The arm did not answer, or answered with something unreadable."""


class JointLimitError(ArmError):
    """A target is outside a joint's limits."""

    def __init__(self, joint, value, low, high):
        super().__init__(f"{joint}: {value} is outside the limits {low} to {high}")
        self.joint, self.value, self.low, self.high = joint, value, low, high


@dataclass(frozen=True)
class Joint:
    """One joint: its name, bus ID, limits, and the unit its values are given in."""
    name: str
    id: int
    min: float
    max: float
    unit: str = "deg"


@dataclass
class Pose:
    """A value for each joint, in the joint's own unit (degrees, or percent for a gripper)."""
    values: dict[str, float]

    def with_joint(self, name: str, value: float) -> "Pose":
        """A copy of the pose with one joint changed."""
        return Pose({**self.values, name: value})

    def max_difference(self, other: "Pose") -> float:
        """The largest change of any joint between two poses."""
        return max(abs(self.values[n] - other.values[n]) for n in self.values)


@dataclass
class Command:
    """A request to move to a pose, with a limit on how far any joint may move in one step."""
    target: Pose
    max_step: float | None = None


class Arm(ABC):
    """What every arm can do. A driver fills in the four underscore methods."""

    def __init__(self, joints: list[Joint]):
        self.joints = {joint.name: joint for joint in joints}
        self._connected = False

    # --- the driver's part -------------------------------------------------
    @abstractmethod
    def _open(self) -> None:
        """Open the connection and switch the motors on."""

    @abstractmethod
    def _close(self) -> None:
        """Switch the motors off and close the connection."""

    @abstractmethod
    def _read(self) -> dict[str, float]:
        """Return the present value of every joint, in its own unit."""

    @abstractmethod
    def _write(self, values: dict[str, float]) -> None:
        """Send a target value for each joint named."""

    # --- what a program uses ----------------------------------------------
    @property
    def is_connected(self) -> bool:
        return self._connected

    def connect(self) -> None:
        self._open()
        self._connected = True

    def disconnect(self) -> None:
        if self._connected:
            try:
                self._close()
            finally:
                self._connected = False

    def __enter__(self) -> "Arm":
        self.connect()
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        self.disconnect()
        return False                      # never hide an error

    def _require_connection(self) -> None:
        if not self._connected:
            raise NotConnectedError("connect the arm first")

    def read_pose(self) -> Pose:
        self._require_connection()
        return Pose(self._read())

    def move_to(self, pose: Pose) -> Pose:
        """Check every target against its joint's limits, then send them. Returns what was sent."""
        self._require_connection()
        for name, value in pose.values.items():
            joint = self.joints[name]
            if not joint.min <= value <= joint.max:
                raise JointLimitError(name, value, joint.min, joint.max)
        self._write(pose.values)
        return pose

    def execute(self, command: Command) -> Pose:
        """Like move_to, but no joint moves more than command.max_step from where it is now."""
        if command.max_step is None:
            return self.move_to(command.target)
        now = self.read_pose()
        limited = {name: limit_target(now.values[name], value, command.max_step)
                   for name, value in command.target.values.items()}
        return self.move_to(Pose(limited))


class FakeArm(Arm):
    """An arm with no hardware: it remembers the last targets, and can be told to fail."""

    def __init__(self, joints: list[Joint], fail_after: int | None = None):
        super().__init__(joints)
        self.values = {joint.name: 0.0 for joint in joints}
        self.torque = False
        self.writes = []                  # every write, for a test to look at
        self.fail_after = fail_after      # raise CommunicationError on the write after this many

    def _open(self):
        self.torque = True

    def _close(self):
        self.torque = False

    def _read(self):
        return dict(self.values)

    def _write(self, values):
        if self.fail_after is not None and len(self.writes) >= self.fail_after:
            raise CommunicationError("the fake arm was told to fail")
        self.writes.append(dict(values))
        self.values.update(values)
```

**Step 5. Write the drivers.** Each driver is a subclass of `Arm` that fills in four methods. `FeetechArm` converts with `armlab/units.py` and calls the bus functions of Chapter 4 and 8, and its `_call` method turns a `ValueError` into a `CommunicationError`. `DamiaoArm` turns degrees into radians, packs frames with `pack_mit` from Chapter 9, and reads positions from the feedback. Create `armlab/drivers.py`:

```python linenums="1"
"""Drivers: the two real arms behind the Arm interface, written against a pretend or a real bus."""

from armlab.arm import Arm, CommunicationError
from armlab.damiao import DISABLE, ENABLE, pack_mit, unpack_feedback
from armlab.packets import read_register, write_register
from armlab.units import deg_to_raw, deg_to_rad, percent_to_raw, rad_to_deg, raw_to_deg, raw_to_percent


class FeetechArm(Arm):
    """The SO-ARM101: serial bus servos that count in raw steps."""

    def __init__(self, joints, send, calibrations):
        super().__init__(joints)
        self.send, self.calibrations = send, calibrations

    def _call(self, function, *args):
        """Run a bus function and turn a bad reply into a CommunicationError."""
        try:
            return function(self.send, *args)
        except ValueError as error:
            raise CommunicationError(str(error)) from error

    def _open(self):
        for joint in self.joints.values():
            self._call(write_register, joint.id, "Torque_Enable", 1)

    def _close(self):
        for joint in self.joints.values():
            self._call(write_register, joint.id, "Torque_Enable", 0)

    def _read(self):
        values = {}
        for name, joint in self.joints.items():
            raw = self._call(read_register, joint.id, "Present_Position")
            cal = self.calibrations[name]
            values[name] = raw_to_percent(raw, cal) if joint.unit == "percent" else raw_to_deg(raw, cal)
        return values

    def _write(self, values):
        for name, value in values.items():
            joint, cal = self.joints[name], self.calibrations[name]
            raw = percent_to_raw(value, cal) if joint.unit == "percent" else deg_to_raw(value, cal)
            self._call(write_register, joint.id, "Goal_Position", raw)


class DamiaoArm(Arm):
    """The reBot-DevArm: CAN motors that count in radians and take MIT-mode frames."""

    def __init__(self, joints, exchange, models, kp=60.0, kd=2.0):
        super().__init__(joints)
        self.exchange, self.models, self.kp, self.kd = exchange, models, kp, kd

    def _ask(self, joint, data):
        """Send one frame to a joint's motor and return its decoded feedback."""
        reply = self.exchange(joint.id, data)
        if reply is None:
            raise CommunicationError(f"motor {joint.id} ({joint.name}) did not answer")
        return unpack_feedback(self.models[joint.name], reply)

    def _open(self):
        for joint in self.joints.values():
            self._ask(joint, ENABLE)

    def _close(self):
        for joint in self.joints.values():
            self._ask(joint, DISABLE)

    def _read(self):
        return {name: rad_to_deg(self._ask(joint, ENABLE)["q"]) for name, joint in self.joints.items()}

    def _write(self, values):
        for name, value in values.items():
            joint = self.joints[name]
            self._ask(joint, pack_mit(self.models[name], deg_to_rad(value), 0.0, self.kp, self.kd, 0.0))
```

Two small changes make the pretend hardware work with the drivers. First, the pretend servo bus must behave a little more like a real one when a goal is written. In `armlab/fakebus.py`, in the `WRITE` branch of `fake_bus`, add these two lines after the lines that handle the ID register. They make the pretend servo jump to a new goal at once, so that a read after a write returns it:

```python linenums="1"
        if address <= 42 < address + len(data):         # a new Goal_Position: the pretend servo jumps there
            memory[56:58] = memory[42:44]
```

Second, add one function at the bottom of `armlab/pretend_damiao.py`. It returns an `exchange` function that sends a frame to the pretend motors and returns the data of the reply, which is what `DamiaoArm` needs:

```python linenums="1"
def pretend_exchange(host, motor_bus, motors):
    """Return exchange(can_id, data): send one frame and give back the reply's data, or None."""
    def exchange(can_id, data):
        host.send(can.Message(arbitration_id=can_id, data=data, is_extended_id=False))
        serve_once(motor_bus, motors)
        reply = host.recv(timeout=0.1)
        return None if reply is None else bytes(reply.data)
    return exchange
```

A real `DamiaoArm` would give `exchange` a function that uses a python-can bus, and a real `FeetechArm` would give `send` a function that uses a serial port. The drivers would not change. One caution on `_read`: a real motor is asked for its position here by repeating the enable frame, which returns feedback in the same layout. Check your vendor library for its own "refresh" command before you use this on a real arm.

**Step 6. Run one program on three arms.** The function `nudge_first_joint` is the program: it connects, reads the pose, moves the first joint by some degrees with a step limit of 15, reads again and disconnects. It does not know which arm it has. The script builds the three arms and calls the same function on each. The reBot joints use illustrative limits of plus and minus 90 degrees, because the real limits come from Seeed's documents. Create `arm_demo.py`:

```python linenums="1"
"""One program, three arms: the same function runs on a fake arm, the SO-ARM101 driver and the reBot driver."""

import can

from armlab.arm import Command, FakeArm, Joint, Pose
from armlab.calibrate import load_calibration
from armlab.config import load_config
from armlab.damiao import LIMITS
from armlab.drivers import DamiaoArm, FeetechArm
from armlab.fakebus import fake_bus, make_servos
from armlab.pretend_damiao import PretendMotor, pretend_exchange

config = load_config("config/arm.json")
so_joints = [Joint(name, j["id"], j["min_deg"], j["max_deg"], "percent" if name == "gripper" else "deg")
             for name, j in config["joints"].items()]

REBOT_MODELS = {"joint1": "DM4340P", "joint2": "DM4340P", "joint3": "DM4340P",
                "joint4": "DM4310", "joint5": "DM4310", "joint6": "DM4310", "gripper": "DM4310"}
# The limits here are illustrative. Use the limits in Seeed's documentation for a real arm.
rebot_joints = [Joint(name, i, -90, 90) for i, name in enumerate(REBOT_MODELS, start=1)]


def nudge_first_joint(arm, degrees):
    """The program: read the arm, move its first joint by some degrees, and read it again."""
    with arm:
        before = arm.read_pose()
        name = next(iter(arm.joints))
        arm.execute(Command(before.with_joint(name, before.values[name] + degrees), max_step=15))
        after = arm.read_pose()
    print(f"   {name}: {before.values[name]:+7.2f} -> {after.values[name]:+7.2f}   "
          f"(still connected afterwards: {arm.is_connected})")


print("Fake arm")
nudge_first_joint(FakeArm(so_joints), 10)

print("SO-ARM101 driver on the pretend servo bus")
servos = make_servos([j.id for j in so_joints])
for joint in so_joints:
    servos[joint.id][56:58] = (2047).to_bytes(2, "little")
feetech = FeetechArm(so_joints, lambda packet: fake_bus(servos, packet), load_calibration("calibration/my_follower.json"))
nudge_first_joint(feetech, 10)

print("reBot driver on the pretend CAN bus")
with can.Bus(channel="arm-demo", interface="virtual") as host, can.Bus(channel="arm-demo", interface="virtual") as motor_bus:
    motors = {j.id: PretendMotor(REBOT_MODELS[j.name], j.id) for j in rebot_joints}
    rebot = DamiaoArm(rebot_joints, pretend_exchange(host, motor_bus, motors), REBOT_MODELS)
    nudge_first_joint(rebot, 10)
```

```bash
python arm_demo.py
```

```text
Fake arm
   shoulder_pan:   +0.00 ->  +10.00   (still connected afterwards: False)
SO-ARM101 driver on the pretend servo bus
   shoulder_pan:   +4.84 ->  +14.86   (still connected afterwards: False)
reBot driver on the pretend CAN bus
   joint1:   -0.01 ->   +9.96   (still connected afterwards: False)
```

The same eight lines of program ran on all three. The fake arm moved exactly 10 degrees. The Feetech arm started at +4.84 degrees (the pretend servos sit at raw 2047, which is 4.84 degrees from the middle of the range) and ended at +14.86, a move of 10.02 degrees, since the steps are 0.088 degrees wide. The reBot arm read -0.01 degrees, because a 16-bit position cannot hold exactly zero, and ended at +9.96 degrees, because the pretend motor moves under the MIT control law for half a second and has not quite arrived. None of those details appears in the program.

!!! mascot-tip "Write the Program First, Then the Driver"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    When you add a new arm, begin with the fake arm and a short program that uses the interface. Once it works, the driver only has to fill four methods, and any problem that appears afterwards is in the driver and nowhere else.

**Step 7. Make it fail on purpose.** The next script runs the five failures of the chapter: a target outside the limits, using the arm before `connect`, a failure in the middle of a move with a `with` block, the same failure with no cleanup at all, and a damaged reply from the Feetech driver. Create `safe_demo.py`:

```python linenums="1"
"""What happens when things go wrong: limits, forgotten connections, and failures in the middle of a move."""

from armlab.arm import (ArmError, CommunicationError, FakeArm, Joint, JointLimitError, NotConnectedError, Pose)
from armlab.calibrate import load_calibration
from armlab.drivers import FeetechArm
from armlab.fakebus import fake_bus, make_servos

joints = [Joint("shoulder_pan", 1, -110, 110), Joint("elbow_flex", 2, -97, 97)]

print("1. A target outside the limits")
arm = FakeArm(joints)
with arm:
    try:
        arm.move_to(Pose({"shoulder_pan": 140.0}))
    except JointLimitError as error:
        print(f"   caught: {error} (joint={error.joint})")
print(f"   torque after the with block: {arm.torque}")

print("2. Using the arm before connect()")
try:
    FakeArm(joints).read_pose()
except NotConnectedError as error:
    print(f"   caught: {error}")

print("3. A failure in the middle of a move, with a with block")
arm = FakeArm(joints, fail_after=1)
try:
    with arm:
        arm.move_to(Pose({"shoulder_pan": 10.0}))
        arm.move_to(Pose({"shoulder_pan": 20.0}))       # this write fails
        print("   never reached")
except CommunicationError as error:
    print(f"   caught: {error}")
print(f"   writes made: {len(arm.writes)}, torque afterwards: {arm.torque}")

print("4. The same failure with no with block and no finally")
arm = FakeArm(joints, fail_after=1)
arm.connect()
try:
    arm.move_to(Pose({"shoulder_pan": 10.0}))
    arm.move_to(Pose({"shoulder_pan": 20.0}))
except ArmError as error:
    print(f"   caught: {error}")
print(f"   torque afterwards: {arm.torque}   <- still on!")
arm.disconnect()

print("5. A damaged reply from a real driver becomes a CommunicationError")
servos = make_servos([1, 2])


def noisy_bus(packet):
    reply = fake_bus(servos, packet)
    return reply[:-1] + bytes([reply[-1] ^ 0xFF]) if reply else reply     # flip the checksum


driver = FeetechArm(joints, noisy_bus, load_calibration("calibration/my_follower.json"))
try:
    driver.connect()
except CommunicationError as error:
    print(f"   caught: {error}")
    print(f"   the original error was a {type(error.__cause__).__name__}")
```

```bash
python safe_demo.py
```

```text
1. A target outside the limits
   caught: shoulder_pan: 140.0 is outside the limits -110 to 110 (joint=shoulder_pan)
   torque after the with block: False
2. Using the arm before connect()
   caught: connect the arm first
3. A failure in the middle of a move, with a with block
   caught: the fake arm was told to fail
   writes made: 1, torque afterwards: False
4. The same failure with no with block and no finally
   caught: the fake arm was told to fail
   torque afterwards: True   <- still on!
5. A damaged reply from a real driver becomes a CommunicationError
   caught: bad checksum: ff ff 01 02 00 03
   the original error was a ValueError
```

Compare cases 3 and 4. Both fail on the second write, and both catch the error, but after case 3 the torque is off and after case 4 it is still on, which is the result of leaving out the `with`. In case 5 the program sees a `CommunicationError`, and the cause is still available as the original `ValueError`.

**Step 8. Record your work.**

```bash
git add .
git commit -m "Add the Arm interface, fake arm, units, and drivers for both arms"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python units_demo.py` prints `raw 2047 ->    4.84 deg`.
- `python arm_demo.py` prints a line for each of the three arms, and each ends with `still connected afterwards: False`.
- `python safe_demo.py` shows `torque afterwards: False` for case 3 and `torque afterwards: True` for case 4.
- Earlier scripts (`bringup_demo.py`, `calibrate_demo.py`) still run.
- `git log --oneline` shows a tenth commit.

### Challenge: Clamp Instead of Failing

Sometimes a program would rather move as far as the limits allow than stop. Add a method `move_to_clamped(self, pose)` to `Arm` that holds every target inside its joint's limits and then calls `move_to`, returning the pose that was actually sent. Test it on a fake arm with a `shoulder_pan` target of 140 and limits of plus and minus 110.

??? note "Click to see one solution"
    The method builds a new `Pose` with each value held between the joint's limits (the same chained `max` and `min` as in Chapter 2), and passes it to `move_to`, which now cannot raise a limit error. Add it to the `Arm` class in `armlab/arm.py`:

    ```python linenums="1"
    def move_to_clamped(self, pose: Pose) -> Pose:
        """Move as near to the pose as the limits allow, and return the pose that was sent."""
        clamped = Pose({name: max(self.joints[name].min, min(value, self.joints[name].max))
                        for name, value in pose.values.items()})
        return self.move_to(clamped)
    ```

    Then, with a connected `FakeArm`, `arm.move_to_clamped(Pose({"shoulder_pan": 140.0}))` returns `Pose(values={'shoulder_pan': 110})`. Think about when to use it. Clamping is kind for a person who nudges a slider past the end, and dangerous for a program whose plan assumed that the target was reached, since the arm quietly goes somewhere else. For planned motion, the raising `move_to` is usually the better choice.

## Summary and Key Takeaways

You can now read and write joint positions in real units on either arm or on a fake one.

- **Raw servo units** are encoder steps that mean something only with a joint's calibration. **Degrees and radians** are the units that people and mathematics use, and \( \text{radians} = \text{degrees} \times \pi / 180 \). **Unit conversion** happens at the edge, inside the drivers, so that programs see one unit per joint.
- A **class interface** is a promise about methods. An abstract base class with `@abstractmethod` enforces it. **Type hints** document the types of parameters and results and let tools check them, without being enforced at run time.
- A **dataclass** holds data and writes its own constructor. The **Joint class**, the **Pose dataclass** and the **Command dataclass** carry limits, targets and requests.
- The **Arm class** offers `connect`, `disconnect`, **reading joint positions** with `read_pose`, and **writing target positions** with `move_to`, with the limit check in the base class where no driver can skip it.
- The **hardware abstraction layer** is built by **inheritance for drivers**: `FeetechArm` and `DamiaoArm` each fill four methods. The **fake arm** and other **mock hardware** let programs be run and tested with no arm.
- **Custom exceptions** (`ArmError` and its children) name each failure, and drivers translate low-level errors into them. **Exception handling for hardware** relies on **try finally** or the **with statement** with a **context manager**, so that **connect and disconnect** always pair and the torque comes off whatever happens.

!!! mascot-celebration "You Wrote One Interface for Two Arms!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just wrote a class that any program can use, two drivers that translate it into servo packets and CAN frames, a fake arm for testing, and error handling that switches the torque off whatever goes wrong. Every program from here on runs on whichever arm you have. Let's move it on to Chapter 11!
