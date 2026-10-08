---
title: Glossary of Terms
description: Alphabetical glossary of the concepts in Controlling a Robot Arm, with ISO 11179-style definitions and robot-arm examples.
---

# Glossary of Terms

#### 24 V to 48 V Systems

Power setups running at medium voltages, common in larger robot arms, that need more careful wiring, connectors, and shutdown behavior than 5 V or 12 V setups.

The reBot arm falls into this range, so safety practices step up.

**Example:** A 24 V supply feeding CAN actuators through a fused distribution board.

#### 3D Printer Safety

Practices for operating printers safely, including avoiding hot nozzles and beds, ensuring ventilation, and never leaving heating machines unattended.

Printing the arm's parts is a core activity.

**Example:** Waiting for the bed to cool before removing a part and keeping flammable items away.

#### 3D Printing

A manufacturing process that builds a physical object by depositing material layer by layer from a digital model.

It makes the structural parts of the SO-ARM101 affordable and customizable.

**Example:** Printing a forearm bracket overnight from an STL file.

#### Acceleration Limit

A cap on how quickly speed may change.

Limits prevent shaking, tipping, or dropping objects.

**Example:** Limiting a joint to 100 degrees per second squared.

#### Accuracy

How close the arm's actual position is to the position it was commanded or intended to reach, measured against a true reference.

Low-cost arms have limited accuracy because of backlash and calibration error.

**Example:** Commanding a point 200 mm from the base and measuring it 203 mm away is an error of 3 mm.

#### ACT Policy

A transformer-based imitation-learning model, Action Chunking with Transformers, that predicts a short sequence of future actions at once.

It performs well with small demonstration datasets on low-cost arms.

**Example:** An ACT policy predicting the next 100 actions from the latest images and positions.

#### Actuator

A device that converts electrical energy into mechanical motion, such as rotation or linear movement.

Actuators are what make every joint of the arm move.

**Example:** The servo in the shoulder is an actuator that turns the upper arm.

#### Adult Supervision

The presence of a responsible adult who oversees activities involving tools, power, or hazards that minors undertake.

It applies to soldering, printing, and powering the larger arms in school settings.

**Example:** A teacher checks wiring before students switch on the 24 V supply.

#### Agent Architecture

The overall structure of an agent system, including the model, tools, memory, planners, and safety components and how they connect.

A clear architecture makes behavior understandable and checkable.

**Example:** A chat interface feeding a planner that calls validated tools connected to the arm.

#### Agent Evaluation Suite

A collection of test cases with expected outcomes that measures an agent's performance and safety.

It tracks improvement and catches regressions.

**Example:** Fifty prompts, each paired with the tool calls that should and should not occur.

#### Agent Is Not the Safety Layer

The design stance that safety must be enforced by code and hardware outside the model, because a model can err or be manipulated.

Prompts alone cannot guarantee safe behavior.

**Example:** Joint limits are enforced in the driver even if the model asks for more.

See also: Safety Layer

#### Agent Loop

The repeating cycle in which an agent observes the situation, decides what to do, acts, and examines the result.

Tasks emerge from many such cycles.

**Example:** The agent calls a move tool, reads the result, then calls the gripper tool.

#### Agent Planner

The component of an agent that breaks a goal into steps and decides which tools to use.

It handles reasoning, not low-level motion.

**Example:** A planner turning sort the blocks into a list of pick and place steps.

#### Agent Skill

A packaged set of instructions and resources that teaches an agent how to perform a certain task or use certain tools.

Skills reuse know-how.

**Example:** A skill file describing how to safely operate the arm.

#### Agent Testing

Checking how reliably and safely an agent behaves across varied requests and conditions.

Agents are unpredictable and need systematic checks.

**Example:** Running 50 sample requests in simulation and counting the unsafe attempts.

#### Agent Tool

A function made available to an agent that performs an action or retrieves information.

Tools are the agent's hands.

**Example:** A tool that opens the gripper.

#### AI Agent

A software system that uses a language model to decide on actions, call tools, and pursue a goal over multiple steps.

It adds natural-language control and planning on top of the arm.

**Example:** An agent that takes the request pick up the red block and calls tools to carry it out.

#### Ambiguous Instructions

Requests that can be read in more than one way, so the intended action is unclear.

Acting on a wrong guess can cause errors or harm.

**Example:** Move it over there with no object or place defined.

#### API Key Handling

Practices for storing and using secret keys that authorize access to a service, such as keeping them out of code and version control.

A leaked key lets others spend the owner's money.

**Example:** Reading a key from an environment variable rather than typing it into a script.

#### Argparse Module

A standard library module that defines, parses, and validates the arguments given to a script on the command line and generates help text automatically.

It saves learners from hand-parsing `sys.argv` and gives clear errors for bad input.

**Example:** `parser.add_argument("--port", required=True)` makes the script refuse to start without a serial port.

#### Arm Class

A Python class that represents a whole robot arm, bundling its connection, joints, and motion methods behind one object.

It organizes the control library.

**Example:** `arm = Arm(port="/dev/ttyACM0")` followed by `arm.move_to(pose)`.

#### Arm Comparison

A side-by-side evaluation of different robot arms across measures such as cost, payload, reach, and complexity.

It supports platform choice.

**Example:** A table comparing the SO-ARM101 and reBot arms.

#### Asking a Human

Deliberately requesting guidance or confirmation from a person when an agent is uncertain or a step is risky.

It prevents guessing in unclear situations.

**Example:** The agent asks which of the two red blocks to pick.

#### Assembly Guide

A step-by-step document, often with photos or video, showing how to put a product together.

Following it in order prevents rework.

**Example:** A guide that shows which servo goes into the shoulder bracket first.

#### Assembly Tools

The hand tools used to build the arm, including screwdrivers, hex keys, pliers, and cutters.

Using the right ones avoids stripped screws.

**Example:** A small Phillips screwdriver and a set of hex keys.

#### Assessment Rubric

A scoring guide that lists criteria and performance levels for judging student work.

It makes grading of projects clear and consistent.

**Example:** Rubric rows for working code, safe operation, testing, and documentation.

#### Audit Log

A tamper-resistant record of actions taken, including who or what requested them, when, and with what result.

It supports review after problems.

**Example:** A file listing each tool call, its parameters, and its outcome with timestamps.

#### Axis-Angle Rotation

A way to describe a 3D rotation by a unit axis direction and an angle about it.

It is intuitive and converts to other forms.

**Example:** A rotation of 90 degrees about the z axis.

#### B601 Body Structure

The mechanical layout of the reBot B601 arm, including its link construction, joint arrangement, and mounting points for actuators.

Understanding it guides assembly and kinematic modeling.

**Example:** A base column, shoulder housing, upper arm, forearm, and wrist block holding six actuators.

#### Back-EMF

The voltage produced by a spinning motor that opposes the supply voltage, rising with speed.

It limits top speed and can push energy back into the supply when braking.

**Example:** A fast-spinning motor generates a back-EMF close to the supply voltage, so current falls as speed rises.

#### Backlash

The small amount of free play between meshing gears, causing a delay or error when the direction of motion reverses.

It limits the accuracy of low-cost arms.

**Example:** Wiggling the gripper by hand and feeling a small gap before the motor engages is backlash.

#### Base Frame

The fixed coordinate system attached to the arm's base, serving as the reference against which all other positions are measured.

All forward and inverse kinematics results are expressed in it.

**Example:** The origin sits at the center of the shoulder pan axis on the table, with the x axis pointing forward.

See also: Coordinate Frame

#### Battery

A device that stores chemical energy and supplies it as direct-current electricity.

It enables a portable or mobile robot but has limited current capacity.

**Example:** A 3-cell lithium-polymer pack provides about 11.1 V for a small mobile arm.

#### Baud Rate

The number of signal changes per second on a serial link, which for simple serial equals bits per second.

Both ends must use the same value to understand each other.

**Example:** SO-ARM servos communicate at 1,000,000 baud by default.

#### Bill of Materials

A complete list of every part needed to build a product, with quantities, descriptions, and often suppliers and costs.

It is the shopping list for an arm build.

**Example:** A spreadsheet listing six servos, a bus board, a power supply, screws, and printed parts.

#### Bimanual Robot

A robot with two arms that can work together on a single task.

Two-handed tasks like folding or passing objects need this arrangement.

**Example:** Two SO-ARM101 followers, each paired with a leader, set up to hold a jar steady and unscrew its lid.

#### Bimanual Setup

Arranging two arms with their leaders, cameras, and workspace so they can cooperate.

Two arms double the wiring, calibration, and safety needs.

**Example:** Two followers mounted facing each other across a table.

#### Bit Operations

Operations that act directly on the individual binary digits of integers, including AND, OR, XOR, and shifts.

They assemble and extract fields in compact messages.

**Example:** `(value >> 8) & 0xFF` extracts the high byte of a 16-bit number.

#### Blocking vs Non-Blocking Code

The distinction between calls that wait until finished before returning and those that return immediately, allowing other work to continue.

Blocking calls can freeze a program that must still watch for a stop signal.

**Example:** `sleep(5)` blocks, while a thread that moves the arm lets the main program keep listening for input.

#### Boundary Conditions

The starting and ending requirements for a motion, such as positions, velocities, and accelerations at each end.

Polynomial trajectories are fitted to meet them.

**Example:** Starting and stopping with zero velocity.

#### Bounded Commands

Commands whose parameters are limited to safe ranges and a fixed menu of actions.

They shrink the damage a mistaken request can cause.

**Example:** A move command accepting only angles between joint limits.

#### Brown-Out

A temporary dip in supply voltage low enough to make electronics reset or misbehave.

Several motors starting at once can trigger it.

**Example:** The controller restarts every time the arm lifts quickly because the supply sags.

#### Brushless Motor

A motor that has no brushes and relies on electronic switching of coil currents to spin its magnets, giving high efficiency and long life.

It powers the high-performance actuators of the reBot arm.

**Example:** A three-phase brushless motor spins when its controller energizes the windings in sequence.

#### Budgeting

Planning how money will be spent on a project, with limits for each category and a reserve for surprises.

Classrooms with fixed funds need it before ordering.

**Example:** Setting aside ten percent of the budget for replacement servos.

#### Bus Scan

A routine that pings every possible ID on a bus to discover which devices are connected.

It reveals missing or duplicate IDs fast.

**Example:** Looping IDs 1 to 253 and printing those that answer.

#### Bytes and Bytearray

Python types that hold sequences of integer values from 0 to 255, immutable in the first case and changeable in the second.

Serial packets are built and parsed with them.

**Example:** `bytearray([0xFF, 0xFF, 0x01, 0x02, 0x01, 0xFB])` builds a six-byte packet.

#### Cable Management

Arranging and securing wires so they do not tangle, snag, or get pinched as the arm moves.

Loose cables are a common cause of faults.

**Example:** Using clips and short sleeves to guide cables along the forearm.

#### Cable Routing

The path chosen for each wire through and along the arm so it can follow joint motion without stretching or rubbing.

Poor routing leads to intermittent faults.

**Example:** Leaving a loop of slack near the elbow so the cable does not pull when it bends.

#### Calibration

The process of mapping each joint's raw sensor readings to known physical angles so software commands correspond to actual positions.

An uncalibrated arm moves unpredictably, especially when leader and follower must match.

**Example:** Moving each joint through its range so software records its minimum and maximum raw values.

#### Calibration Drift

A gradual change over time in how well stored calibration matches the real arm, caused by wear, loosened screws, or servo changes.

Periodic checks catch it.

**Example:** The home pose slowly shifts a few degrees after a gear shifts on its horn.

#### Calibration File

A file that stores calibration results, such as offsets and ranges for each joint, so they can be loaded in later sessions.

Saving it avoids recalibrating each time.

**Example:** A JSON file with a minimum, maximum, and offset per joint.

#### Calibration Procedure

The ordered steps carried out to calibrate an arm, such as placing it in a reference pose and moving each joint through its range while the software records readings.

Following the same steps gives repeatable results.

**Example:** Moving the arm to the middle of its range, pressing Enter, then sweeping each joint to its limits.

#### Camera

A device that captures light from a scene and turns it into digital images.

It gives the arm the ability to see objects.

**Example:** A camera mounted above the table views the workspace.

#### Camera Calibration

Determining a camera's internal parameters and lens distortion by imaging a known pattern.

It is needed to measure real-world positions from pictures.

**Example:** Capturing 15 photos of a checkerboard and solving for the camera matrix.

#### Camera Extrinsics

The position and orientation of a camera relative to another frame, such as the robot base.

They change when the camera is moved.

**Example:** A transform describing a camera mounted 40 cm above and in front of the base.

#### Camera Intrinsics

The internal parameters of a camera, including focal length, optical center, and lens distortion, which map 3D points to pixels.

They are fixed for a given camera and lens.

**Example:** A 3x3 matrix holding focal lengths in pixels and the image center.

See also: Camera Extrinsics

#### CAN Adapter

A device that connects a computer to a CAN bus, translating between USB or another interface and CAN frames.

Python needs one to speak to the reBot actuators.

**Example:** A USB-to-CAN dongle shown to the operating system as a `can0` interface.

#### CAN Bit Rate

The speed of data transfer on a CAN bus, in bits per second, which every node must be set to match.

Mismatched rates produce silence or error frames.

**Example:** Setting the adapter and every motor to 1 Mbit/s.

#### CAN Bring-Up Check

A short test sequence that confirms a CAN network works, including adapter detection, bit rate, termination, and a reply from each motor.

It isolates wiring problems from software ones.

**Example:** Bringing up `can0`, sending an enable frame to each motor, and checking each responds.

#### CAN Bus

A two-wire differential serial network where many nodes share the same lines and messages are prioritized by identifier.

It is the communication backbone of the reBot arm.

**Example:** All reBot actuators connect to one CAN pair, each responding to its own identifier.

#### CAN Frame

A single message on the CAN bus, containing an identifier, a length code, up to eight data bytes in classic CAN, and error-checking fields.

Motor commands and status all travel in frames.

**Example:** An 8-byte frame carries a target position, velocity, and gains to one actuator.

#### CAN Motor Configuration

The process of setting up a CAN actuator's parameters, including its ID, bit rate, mode, and limits, before use.

Each motor must be configured to coexist on a shared bus.

**Example:** Connecting one motor at a time to assign it a unique CAN ID.

#### CAN Termination

A 120-ohm resistor placed at each physical end of a CAN bus to absorb signal reflections.

Without it, long or fast buses become unreliable.

**Example:** Measuring about 60 ohms between CAN-H and CAN-L with power off shows both end resistors are in place.

#### Capstone Project

A final, larger project in which learners combine skills from throughout the course to build something complete.

It demonstrates integrated understanding.

**Example:** A vision-guided sorting arm with tests, safety limits, and documentation.

#### Cartesian Coordinates

A system that locates a point by its distances along perpendicular axes, usually x, y, and z.

Humans describe where to place the gripper this way.

**Example:** The point (0.20, 0.05, 0.10) in meters in front of the base.

#### Cartesian Motion

Movement planned in terms of the end effector's position in space rather than individual joint values.

It lets users command where the tool goes.

**Example:** Moving the gripper 5 cm to the right while keeping height constant.

#### Cartesian Straight-Line Path

A path in which the end effector follows a straight line in space, produced by computing joint values at many points along it.

It is the usual path for pick and place approach.

**Example:** Interpolating positions between two points and solving inverse kinematics for each.

#### Chat-Controlled Arm

A project in which a user commands the arm through a messaging app via an agent.

It shows natural-language control with safety layers.

**Example:** Texting stop or pick up the cube to an arm connected to an agent.

#### Checksum

A small value computed from the contents of a message and appended to it so the receiver can detect corrupted bytes.

It catches noise on the servo bus.

**Example:** In Feetech packets the checksum is the bitwise inverse of the low byte of the sum of ID, length, instruction, and parameters.

#### Class Interface

The set of public methods and attributes a class offers to users, separate from how they are implemented.

A stable interface lets implementations change without breaking programs.

**Example:** Every arm class offers `connect()`, `read_positions()`, and `write_positions()`.

#### Classroom Parts Order

A coordinated purchase of components for a whole class, with quantities for each team plus spares.

Planning it carefully saves money and time.

**Example:** Ordering 12 servo sets for six pairs of students, plus 3 spares.

#### Classroom Use

Applying the arm in group teaching, including shared equipment, schedules, supervision, and lesson planning.

Arms in school need extra care for safety and access.

**Example:** Eight students rotating through four arm stations in a lesson.

#### Cloud Agent

An agent that relies on a remote server or hosted model to reason, with network access needed.

It offers stronger models but adds delay, cost, and data sharing.

**Example:** Sending the request to a hosted language model that returns a tool call.

#### Code Editor

A program for writing and editing source code, offering features such as syntax highlighting, indentation help, and integrated terminals.

A good editor catches typos in register addresses before they reach the hardware.

**Example:** Visual Studio Code highlights an undefined variable in red before the script is run.

#### Collision

An unintended contact between the arm and an object, a person, or itself.

Detecting and avoiding them protects the hardware and people.

**Example:** The gripper strikes the table because a target height was entered too low.

#### Collision Checking

Testing whether a planned pose or path would make the arm hit an obstacle or itself.

It is needed before executing motion in clutter.

**Example:** Verifying that the forearm does not intersect the table plane.

#### Color Sorting Project

A project in which the arm uses a camera to find objects by color and place them in matching locations.

It integrates vision, kinematics, and motion.

**Example:** Sorting red, green, and blue blocks into three bins.

#### Color Space

A system for representing colors as numbers, such as RGB, BGR, or HSV.

Choosing a convenient one makes color detection reliable.

**Example:** Converting a frame from BGR to HSV so red hue can be isolated despite lighting changes.

#### Color Thresholding

Selecting the pixels in an image whose color values fall within a chosen range, producing a mask.

It finds colored objects simply.

**Example:** `cv2.inRange(hsv, low, high)` keeps only the pixels that look red.

#### Command Dataclass

A dataclass that packages a motion request, such as target values, speed, and duration, into one object.

Bundling makes commands easy to validate and log.

**Example:** `Command(targets=[0, 45, 90, 0, 0, 30], speed=20)`.

#### Command Line Arguments

Values typed after a program's name in the terminal that are passed into the program to change its behavior for that run.

They let one script handle many ports, speeds, or joints.

**Example:** `python move_arm.py --port /dev/ttyACM0 --speed 20` passes a port and a speed to the script.

See also: Argparse Module

#### Command Parsing

Turning an input, such as a text message, into a structured command with a name and parameters.

It connects human phrasing to program calls.

**Example:** Converting go home slowly into `go_home(speed=0.3)`.

#### Command Validation

Checking each command for correctness and safety before execution.

It stops bad requests early.

**Example:** Rejecting a move whose target would put the gripper below the table surface.

#### Common Ground

A shared electrical reference connection among all devices in a circuit so their signals are measured against the same zero volts.

Without it, signals between boards are unreliable.

**Example:** Joining the grounds of the servo supply and the controller board so the data line works.

#### Communication Errors

Failures in sending or receiving data, including corrupted bytes, missing replies, collisions, and mismatched settings.

Handling them cleanly prevents commands from being silently lost.

**Example:** A bad checksum or a missing status packet raises an exception in the driver.

#### Communication Timeout

The maximum time a program waits for a reply before treating the exchange as failed.

Proper timeouts stop a program from hanging forever when a cable is loose.

**Example:** `timeout=0.1` in `serial.Serial` returns after 100 ms if no bytes arrive.

#### Condition Number

The ratio of the largest to the smallest singular value of a matrix, indicating how sensitive its solutions are to small errors.

High values signal near-singular poses.

**Example:** A Jacobian with condition number 500 produces large joint changes for tiny position errors.

#### Configuration File

A file outside the program code that stores settings, such as port names, servo IDs, and speed limits, so they can change without editing the program.

It lets the same script run on different arms and classroom computers.

**Example:** A `config.json` that sets `"port": "/dev/ttyACM0"` and `"baud": 1000000`.

#### Configuration Space

The space of all possible joint-value combinations of an arm, in which each point represents one complete arm pose.

Planning is often done there.

**Example:** For a two-joint arm, a plane with shoulder angle on one axis and elbow angle on the other.

#### Confirmation Step

A pause in which a person must approve a planned action before it proceeds.

It adds human judgment to risky actions.

**Example:** The agent shows its plan and waits for a yes before moving.

#### Connect and Disconnect

Methods that open and close the communication link to hardware, and leave it in a safe state.

Every session depends on them being paired properly.

**Example:** `arm.connect()` opens the serial port and `arm.disconnect()` releases torque and closes it.

#### Context Manager

A Python object that runs setup code on entering a block and cleanup code on leaving it, even after an error.

It guarantees cleanup of hardware connections.

**Example:** `with Arm(port) as arm:` connects on entry and disconnects on exit.

#### Contour Detection

Finding the outlines of connected regions in a binary image.

It turns a mask into distinct object shapes.

**Example:** `cv2.findContours` returns the boundary of each red block in a mask.

#### Control Loop

A repeating cycle in which a program reads sensors, decides on actions, and sends commands to actuators.

Nearly every robot behavior runs inside one.

**Example:** A loop that reads positions, computes the next target, and writes it every 20 ms.

#### Control Rate

The number of control loop cycles completed per second, in hertz.

Higher rates give smoother and more responsive motion until the bus or computer cannot keep up.

**Example:** Running at 50 Hz means a new command every 20 ms.

#### Coordinate Frame

A set of axes and an origin used to describe positions and orientations, attached to the world, a link, or a tool.

Kinematics is the art of relating one frame to another.

**Example:** A frame at the shoulder and another at the gripper tip.

See also: Base Frame

#### Cost Calculator

A tool, often a short script or spreadsheet, that sums prices and quantities to produce a project cost.

It makes comparing options quick and repeatable.

**Example:** A Python script that reads a parts file and prints the total with tax and shipping.

#### Cost Comparison

An evaluation of what each option costs in total, including parts, shipping, tools, and time.

Price alone can mislead.

**Example:** A kit that costs more up front but saves hours of sourcing.

#### Counterfeit Parts

Imitation components made to look like genuine branded ones, often of lower quality or with false specifications.

Fake servos can fail early or behave differently from the datasheet.

**Example:** A servo sold under a known brand whose gears are plastic instead of metal.

#### Crimping

Joining a metal terminal to a wire by squeezing it with a special tool to form a solid, gas-tight connection.

Servo cables often need new connectors made this way.

**Example:** Crimping a pin onto a wire end before inserting it into a plastic connector housing.

#### CSV Logging

Recording data rows, such as time and joint angles, into a comma-separated values file for later analysis.

It is simple and opens in any spreadsheet.

**Example:** Writing a row of timestamp and six joint angles every control cycle.

#### CSV Parts List

A parts list stored as comma-separated values, where each row is one item with columns such as name, quantity, and price.

Python can read it to total costs automatically.

**Example:** A file with lines like `STS3215,6,13.50`.

#### Cubic Polynomial Trajectory

A motion plan using a third-degree polynomial in time, fitting start and end positions and velocities.

It gives smooth position and velocity.

**Example:** Moving from 0 to 90 degrees in 2 s, starting and ending at rest.

#### Cubic Spline

A piecewise third-degree polynomial curve that passes through given points with continuous slope and curvature.

It gives smooth paths through many waypoints.

**Example:** Joining six waypoints with a smooth curve.

#### Current

The flow of electric charge through a conductor, measured in amperes.

Motors draw more current under load, so supplies must be sized for peaks.

**Example:** A servo may draw 0.2 A at rest and over 2 A when stalled.

#### Current Rating

The maximum current a component, wire, or supply can carry continuously without overheating.

Choosing parts with sufficient ratings avoids fires and brown-outs.

**Example:** A connector rated for 3 A cannot safely feed six servos that can draw 12 A together.

#### Current Sensing

Measuring the electric current flowing into a motor, which is roughly proportional to the torque it produces.

It lets software detect strain or collisions.

**Example:** A sudden jump in motor current as the gripper squeezes a block reveals contact.

#### Custom Exceptions

User-defined exception classes that name specific problems in a program.

They give clearer error handling than generic errors.

**Example:** `class JointLimitError(Exception):` raised when a target exceeds a limit.

#### Daisy Chain Wiring

A wiring layout in which each device connects to the next in line, so a single cable run passes through every unit.

It keeps wiring tidy on a multi-joint arm.

**Example:** The controller board plugs into servo 1, servo 1 into servo 2, and so on up to the gripper.

#### Damiao Actuator

A compact brushless joint motor with an integrated gearbox, encoder, and controller made by Damiao, commanded over CAN bus.

It supports torque, velocity, and position control, which suits the reBot B601-DM arm.

**Example:** A DM-series actuator receives a CAN frame with a target position and gains, then replies with its current state.

See also: reBot B601-DM, CAN Bus

#### Damped Least Squares

A stable way to invert the Jacobian by adding a small damping term, trading accuracy for stability near singularities.

It prevents extreme joint speeds.

**Example:** Solving with `J.T @ inv(J @ J.T + lambda**2 * I)`.

#### Data Collection Station

A fixed setup with arms, cameras, and lighting arranged for recording consistent demonstrations.

Consistent conditions improve training data.

**Example:** A table with a leader, follower, and two cameras on stands.

#### Dataclass

A Python class decorated with `@dataclass` that automatically generates initialization and representation methods for storing simple data.

It makes small data containers short.

**Example:** `@dataclass class Pose: x: float; y: float; z: float`.

#### Dataset

An organized collection of data used for training or evaluation, with consistent format.

Learning needs well-structured data.

**Example:** A LeRobot dataset containing episodes of observations and actions.

#### Datasheet

A manufacturer's technical document listing a component's specifications, limits, pin assignments, and operating conditions.

It is the authoritative source for voltage, torque, and protocol details.

**Example:** The servo datasheet states the rated voltage and stall torque.

#### DC Motor

A motor that spins when direct current flows through it, with speed set by voltage and torque set by current.

It is the simplest motor inside a servo.

**Example:** The small brushed motor inside a hobby servo is a DC motor driven by an H-bridge.

#### Defense in Depth

Using several independent protective layers so that if one fails, others still protect.

No single control is trusted alone.

**Example:** Prompts, validation code, speed limits, and a hardware e-stop all guard the same arm.

#### Degrees and Radians

Two units for measuring angles: a full circle is 360 degrees or 2 pi radians.

Humans prefer degrees while math libraries expect radians.

**Example:** `math.radians(90)` returns about 1.5708.

#### Degrees of Freedom

The number of independent motions, translations or rotations, a mechanism can perform, often counted as the number of independently actuated joints.

It determines which poses the arm can reach and how much computation inverse kinematics needs.

**Example:** An arm with five rotating joints plus a gripper is commonly described as having 6 degrees of freedom.

#### Demonstration Data

Recorded examples of a task being done correctly, typically images and joint positions over time.

The quality of the demonstrations limits the learned policy.

**Example:** Fifty teleoperated episodes of placing a block in a bowl.

#### Denavit-Hartenberg Parameters

A convention that describes each link and joint using four numbers, so transforms for a serial arm can be written systematically.

It standardizes arm models.

**Example:** A table of a, alpha, d, and theta for each of the arm's six joints.

#### Derivative as Rate of Change

The idea that the derivative of a quantity measures how fast it changes with respect to another, such as velocity being the derivative of position.

It links position to speed and acceleration.

**Example:** If angle changes by 10 degrees in 0.5 s, the average rate is 20 degrees per second.

#### Descriptive Error Messages

Error reports that say what went wrong and how to fix it, written so that people and agents can act on them.

They allow an agent to correct its request.

**Example:** Elbow angle 200 is outside the allowed range of 0 to 150.

#### Desk Assistant Project

A capstone-style build in which the arm helps with small desk tasks, such as handing over or tidying items.

It combines hardware, vision, and agent skills.

**Example:** An arm that picks up a pen on a spoken request.

#### Desktop Robot Arm

A small, low-cost arm designed to sit on a table, with modest reach and payload, for education and research.

These arms make hands-on robotics affordable for classrooms.

**Example:** The SO-ARM101 clamps to a desk and works within about a 30 cm radius.

#### Device ID

A unique number assigned to each servo or motor on a shared bus so commands reach only the intended unit.

Two units with the same ID collide, so every joint needs its own.

**Example:** The shoulder pan servo has ID 1 and the gripper servo has ID 6.

#### Dimensional Tolerance

The permitted amount by which a measured size may differ from its intended size.

Printed holes and slots often need adjusting so parts fit.

**Example:** A hole designed at 3.0 mm printing at 2.8 mm, so screws will not fit without drilling.

#### Direct from Manufacturer

Buying a product straight from the company that makes it, without an intermediary.

It can give authentic parts and technical support, but may involve longer shipping.

**Example:** Ordering actuators from the maker's own web shop.

#### Distributor

A company that buys products from manufacturers and resells them to customers, often carrying a wide range of parts.

Authorized distributors help avoid counterfeits.

**Example:** An electronics distributor selling genuine servo motors and warranty support.

#### Docstring

A string literal placed as the first statement of a module, class, or function that documents what it does and how to call it.

Good docstrings tell a classmate what units a function expects, such as degrees versus raw servo counts.

**Example:** `"""Move one joint to angle_deg, in degrees."""` as the first line of `move_joint()`.

#### Dry-Run Mode

An operating mode in which commands are checked and reported but not sent to the hardware.

It lets users see what would happen.

**Example:** Printing planned joint targets without moving any servo.

#### Edge AI Computer

A small, low-power computer designed to run AI models near the robot instead of in a data center.

It provides local inference at modest cost.

**Example:** A single-board computer with a built-in AI accelerator mounted by the arm.

#### Elbow

The joint between the upper arm and forearm that bends to extend or fold the arm.

Together with the shoulder it sets how far the gripper reaches.

**Example:** Straightening the elbow from 90 degrees to 0 degrees extends the gripper outward.

#### Elbow Up and Elbow Down

The two mirror configurations of a two-link arm that place the gripper at the same point, with the elbow above or below the line between shoulder and gripper.

Choosing between them affects clearance and joint limits.

**Example:** Choosing elbow-up to keep the forearm away from the table.

#### Electrical Power

The rate at which electrical energy is used or delivered, equal to voltage multiplied by current and measured in watts.

It sizes supplies and wiring.

**Example:** A 12 V supply delivering 3 A provides 36 W.

#### Emergency Stop

A prominent control or action that immediately halts all dangerous motion, overriding normal operation.

Every setup in this book needs one that is quick to reach.

**Example:** A red mushroom button that cuts motor power.

#### Encoder

A sensor that measures the position, and often the direction and speed, of a rotating shaft and reports it as a digital value.

Servos use it to know where the joint is.

**Example:** A 12-bit encoder divides one revolution into 4096 counts.

#### End Effector

The tool or device at the free end of a robot arm that interacts with the world.

Kinematics usually computes where this point ends up in space.

**Example:** On the SO-ARM101, the two-finger gripper is the end effector.

#### Environment Variables

Named values stored by the operating system outside any program, which processes can read at run time.

They are the safe place to keep secrets such as API keys, away from source code.

**Example:** `os.environ["ANTHROPIC_API_KEY"]` reads a key that was set in the shell rather than typed into a script.

#### Euler Angles

A way to describe 3D orientation as three successive rotations about chosen axes, commonly called roll, pitch, and yaw.

They are easy to read but have pitfalls.

**Example:** Roll 0, pitch 90, yaw 0 degrees.

#### Evaluating a Policy

Testing how well a trained policy performs on its task, usually by running it repeatedly on the robot or in simulation.

Evaluation reveals real performance.

**Example:** Running 20 trials and counting how often the block lands in the bowl.

#### Exception Handling for Hardware

Using `try` and `except` blocks to catch faults such as timeouts and bad packets and respond safely rather than crashing mid-motion.

Hardware fails in ways ordinary programs do not.

**Example:** Catching a timeout error and stopping motion before retrying.

#### Fact-Checking Specifications

The practice of verifying claimed specifications such as torque, price, or voltage against primary sources or measurement.

Marketing numbers are often optimistic.

**Example:** Comparing a store listing's torque claim to the datasheet and to a test with a known weight.

#### Fail-Safe Behavior

A design in which a failure leads to the safest available state rather than a dangerous one.

Arms should stop or go limp gently, not run away.

**Example:** If communication drops, the follower holds position or lowers slowly instead of continuing at full speed.

#### Failed Grasp Recovery

Actions taken after detecting that a grasp did not secure the object, such as retrying or asking for help.

It makes pick tasks robust.

**Example:** Gripper closes fully with no resistance, so the arm reopens and tries again.

#### Fake Arm

A software stand-in that has the same interface as a real arm but moves only numbers in memory.

It allows code to be tested safely without hardware.

**Example:** `FakeArm` stores the last target angles and returns them from `read_positions()`.

See also: Mock Hardware

#### Fasteners

Hardware items such as screws, nuts, and bolts used to join parts mechanically.

The arm's structure and servos are held together with them.

**Example:** M2 and M3 screws secure servos to printed brackets.

#### FDM Printer

A 3D printer that melts plastic filament and extrudes it through a heated nozzle to draw each layer, short for fused deposition modeling.

It is the common, low-cost machine used for arm parts.

**Example:** A desktop FDM printer with a 220 mm square bed prints all SO-ARM101 parts.

#### Fiducial Markers

Printed black-and-white square patterns with unique codes that cameras can detect easily and use to measure position and orientation.

They provide reliable reference points.

**Example:** An ArUco marker on the table that marks the origin.

#### Filament

The thin plastic strand, usually 1.75 mm in diameter, that an FDM printer melts to form parts.

Its type sets strength, heat resistance, and print difficulty.

**Example:** A 1 kg spool of PLA filament prints a full set of arm parts.

#### File Paths

Text strings that identify the location of a file or folder, either absolute from the root of the drive or relative to the current working directory.

Wrong paths are a common reason a calibration file fails to load.

**Example:** `Path("calibration") / "arm1.json"` builds a path using the `pathlib` module.

#### First Power-On

The first time electric power is applied to a newly built or rewired arm.

Doing it carefully catches wiring mistakes before they cause damage.

**Example:** Applying power while watching for smoke, heat, or unusual noise with the workspace clear.

#### Follower Arm

The arm that reproduces the joint positions of the leader arm, carrying out the physical work.

It is the arm that touches objects and records camera data during demonstrations.

**Example:** The follower closes its gripper on a block when the human squeezes the leader's trigger.

#### Follower Assembly

The sequence of building the follower arm, including mounting servos, attaching links, installing the gripper, and routing cables.

It produces the arm that does the actual work.

**Example:** Starting at the base, adding each servo and bracket upward to the gripper.

#### Force Limit

A cap on the force or torque the arm may apply, often through torque limits or current limits.

It prevents crushing objects and injuring people.

**Example:** Capping gripper torque so it can hold an egg without breaking it.

#### Forward Kinematics

Computing the end effector's position and orientation from known joint values.

It answers where the gripper is.

**Example:** Given shoulder 30 degrees and elbow 60 degrees, the function returns the gripper's x and y.

#### Forward Simulation of Paths

Computing the end effector positions that result from a sequence of joint commands.

It shows what a plan will do.

**Example:** Applying forward kinematics to each point of a trajectory and plotting the result.

#### Fuse

A protective component containing a thin conductor that melts and opens the circuit when current exceeds its rating.

It stops short circuits from damaging wiring or starting fires.

**Example:** A 10 A fuse placed in the supply line blows during a short circuit.

#### G-Code

A text language of movement and temperature commands, such as `G1 X10 Y20`, that tells a printer or machine exactly what to do.

Printers read it line by line.

**Example:** A slicer writes a file of G-code lines that heat the nozzle and trace each layer.

#### Gear Ratio

The ratio of input shaft turns to output shaft turns in a gear train, which multiplies torque and divides speed by the same factor.

A higher ratio gives more lifting strength but slower motion.

**Example:** A 1:345 ratio means the motor turns 345 times for one turn of the output.

#### Gearbox

An assembly of gears that transmits motion from a motor to a joint while trading speed for torque.

It is also a main source of backlash and wear in cheap servos.

**Example:** A servo's plastic or metal gearbox sits between its small motor and the output horn.

#### Geometric Inverse Kinematics

A closed-form solution to inverse kinematics found using geometry and trigonometry, such as the law of cosines.

It is fast and exact for simple arms.

**Example:** Computing the elbow angle of a two-link arm from the target distance.

#### Gimbal Lock

A loss of one degree of rotational freedom in Euler angles when two rotation axes align, making some orientation changes ambiguous.

It is why other representations are preferred.

**Example:** With pitch at 90 degrees, changing roll and yaw rotates the object about the same axis.

#### Git Version Control

A system that records snapshots of a project's files over time, letting users review history, undo changes, branch, and share work with others.

Learners use it to keep arm code and calibration files safe and to fetch open-source arm repositories.

**Example:** `git clone` downloads the SO-ARM101 repository, and `git commit` saves a working version of a motion script.

#### Go Home Tool

An agent tool that returns the arm to its home position by a safe route.

It gives the agent a reliable reset.

**Example:** Calling it after finishing a task.

#### GPU Training

Training models on a graphics processing unit, which handles many calculations in parallel and is far faster than a regular processor for neural networks.

It makes policy training practical.

**Example:** A training run that takes four hours on a GPU but days on a CPU.

#### Grasp Force

The amount of squeezing force a gripper applies to an object.

Too little drops it, too much crushes it.

**Example:** A torque limit set so the gripper holds a foam cube without denting it.

#### Gravity Load on Joints

The torque exerted on joints by the weight of the arm and any payload.

It is greatest when the arm extends horizontally.

**Example:** The shoulder carries more load with the arm straight out than folded up.

#### Gripper

An end effector that grasps and releases objects by closing and opening its fingers or jaws.

Picking tasks depend on controlling its opening and grip strength.

**Example:** The follower arm's gripper closes around a wooden cube when its servo is commanded to a smaller angle.

#### Gripper Control

Software for opening and closing the gripper to desired widths with chosen force.

Grasping depends on it.

**Example:** `arm.set_gripper(0.3)` closes the gripper to 30 percent open.

#### Gripper Width

The distance between the gripper jaws, or the opening value that represents it.

It must match the object size.

**Example:** A 40 mm cube needs a width slightly larger than 40 mm before closing.

#### Group Parts Ordering

Coordinating purchases of parts for multiple teams in a single order to save money and shipping.

It needs a shared list and deadline.

**Example:** One order that covers six teams' kits plus spares.

#### Hallucinated Tool Calls

Calls made by a model to tools or parameters that do not exist, or with invented values.

Validation must catch them.

**Example:** The model calls `rotate_wrist_fast` although no such tool is available.

#### Hand-Eye Calibration

Finding the fixed transform between a camera and the robot frame, using observations of a known target at several arm poses.

It lets the arm convert image locations into arm coordinates.

**Example:** Moving the gripper to several known marker positions and solving for the camera's pose.

#### Hardware Abstraction Layer

A software layer that presents a uniform interface to different devices, hiding their protocols and details from the code that uses them.

It lets the same program drive a servo arm or a CAN arm.

**Example:** A `connect()` and `move_to()` interface that works on either kind of arm.

#### Hardware E-Stop

An emergency stop built from physical components, such as a switch or contactor, that interrupts motor power independently of software.

It works even when the program or computer crashes.

**Example:** A red button wired in series with the motor supply.

See also: Software E-Stop

#### Heat-Set Insert

A threaded metal insert pressed into a printed hole with a hot soldering iron so it melts into the plastic and gives durable threads.

Plastic threads wear out, but inserts stay firm.

**Example:** Melting an M3 insert into the base so a screw can be tightened many times.

#### Hexadecimal

A base-16 number system using digits 0-9 and letters A-F, so one byte fits in exactly two characters.

Packet dumps and register addresses are written this way.

**Example:** The decimal value 255 is `0xFF` in hexadecimal.

#### High-Voltage Power Distribution

The arrangement of fused supply lines, connectors, and switches that carry higher-voltage power, such as 24 V, to motors.

Care is needed because energy and fault currents are larger.

**Example:** A power board with a main switch, fuse, and separate output for each actuator.

#### Hobby Servo

A small, inexpensive actuator that rotates its output shaft to an angle set by a pulse-width signal, typically within a range of about 180 degrees.

It is the cheapest way to move a joint but gives no feedback to the computer.

**Example:** A 9 g hobby servo in a model aircraft positions its shaft from a 1.5 ms pulse.

#### Home Position

A known, safe resting configuration the arm returns to at startup and shutdown.

A consistent starting point makes motions predictable.

**Example:** The arm folded with its gripper tucked above the base is the home position.

See also: Homing Position

#### Homing Position

The reference pose in which every joint is placed during calibration so the software knows a zero point.

A consistent pose makes calibration repeatable.

**Example:** All joints straight in the middle of their range before capturing offsets.

See also: Home Position

#### Homogeneous Transform

A 4x4 matrix that combines a rotation and a translation so one multiplication moves a point from one frame to another.

It lets chained frames be combined cleanly.

**Example:** Multiplying a point in the gripper frame by a transform gives its position in the base frame.

#### HTTP API

A programming interface in which clients send requests over the web protocol HTTP to specific addresses and receive responses.

It is a common way to expose the arm to other programs.

**Example:** A POST request to `/move` with joint targets.

#### Hugging Face Hub

An online platform for hosting and sharing models and datasets.

LeRobot uses it to store demonstrations and trained policies.

**Example:** Uploading a recorded dataset to the Hub so a classmate can download it.

#### Image Frame

A single still picture from a camera, stored as a grid of pixel values, with video being a series of them.

Vision code processes one at a time.

**Example:** `ok, frame = cap.read()` returns a 480 by 640 array with three color channels.

#### Image-to-Arm Coordinates

Converting positions found in a camera image into positions in the arm's base frame.

It ties vision to motion.

**Example:** Using a calibration to turn pixel (320, 240) into x = 0.18 m, y = 0.03 m.

#### Imitation Learning

Training a robot to perform a task by copying demonstrations from a human instead of programming rules.

It is the book's route to learned behavior.

**Example:** Training a model on 50 recorded demonstrations of picking up a block.

#### Import Statement

A Python statement beginning with `import` or `from ... import` that makes the contents of a module or package available in the current file.

Imports bring in `serial`, `struct`, and `numpy` so the program can use them.

**Example:** `from time import sleep` lets a script pause between servo commands by calling `sleep(0.5)`.

#### Incompatible Parts

Components that cannot work together because of mismatched voltage, connectors, protocols, or dimensions.

Checking compatibility before ordering saves money.

**Example:** A 7.4 V servo bought for a 12 V bus.

#### Infill

The internal pattern and density printed inside a part's outer walls, expressed as a percentage.

Higher infill adds strength and weight.

**Example:** A 25 percent grid infill makes a bracket strong while saving filament.

#### Inheritance for Drivers

Creating specialized driver classes that extend a common base class, so they share structure but implement hardware-specific details.

It supports multiple arm types.

**Example:** `ServoArm` and `CanArm` both subclass `BaseArm` and override `write_positions()`.

#### Inrush Current

The brief surge of current drawn when a device or motor is first switched on, higher than its steady running level.

It can trip protection or sag the supply.

**Example:** A motor draws several times its running current in the first milliseconds after power is applied.

#### Instruction Packet

A message sent from the controller to a servo that asks it to perform an action, such as ping, read, or write.

Every command from Python becomes one.

**Example:** A packet with instruction 0x03 asks the servo to write the goal position register.

See also: Status Packet

#### Intermittent Wiring

A wiring fault that makes a connection work sometimes and fail at others, usually because of a loose contact or damaged wire.

It is hard to diagnose because symptoms come and go.

**Example:** The arm freezes only when the cable bends at the wrist.

#### Interpolation

Computing intermediate values between known points to produce a smooth progression.

It fills the gaps between waypoints.

**Example:** Generating 50 positions between 0 and 90 degrees over two seconds.

#### Inverse Kinematics

Computing the joint values needed to put the end effector at a desired position and orientation.

It answers what angles reach there.

**Example:** Given a target of 15 cm forward and 5 cm up, the function returns shoulder and elbow angles.

#### Isaac Sim Tour

An introductory walk-through of NVIDIA's Isaac Sim robot simulator, showing how to load an arm and run it virtually.

It shows how professional simulation looks and works.

**Example:** Opening a robot model in Isaac Sim and moving its joints from a script.

#### Jacobian

A matrix that relates small changes in joint values to resulting changes in the end effector's position and orientation.

It drives velocity control and numerical IK.

**Example:** A 2x2 matrix of partial derivatives for a two-link arm.

#### Jacobian Pseudoinverse

A generalized inverse of the Jacobian that can be computed for non-square or singular matrices and gives minimal joint motion.

It allows velocity control for redundant arms.

**Example:** `np.linalg.pinv(J)`.

#### Jacobian-Based IK

An inverse kinematics method that repeatedly uses the Jacobian to adjust joint values toward the target.

It generalizes to many arms.

**Example:** Looping updates until the position error falls below 1 mm.

#### Jerk

The rate of change of acceleration, the third derivative of position.

High values cause shaking and wear.

**Example:** An instant start with sudden acceleration produces very high jerk.

#### Jitter

Small, rapid, unwanted back-and-forth movement of a joint around its target.

It signals gain, power, or mechanical problems.

**Example:** The gripper trembles while holding a position because the supply voltage sags.

#### Joint

A connection between two links that allows relative motion between them, usually rotation about an axis.

Each joint is typically driven by one motor, so the joint count sets how many commands the arm needs.

**Example:** The elbow joint of an SO-ARM101 bends the forearm relative to the upper arm.

#### Joint Angle

The rotation of a revolute joint measured from a defined zero reference, usually in degrees or radians.

The list of all such values completely describes the arm's configuration.

**Example:** An elbow at 90 degrees holds the forearm perpendicular to the upper arm.

#### Joint Assembly Order

The planned sequence for installing joints so that each can be attached, wired, and tested before covered by the next.

Wrong order may block access to screws.

**Example:** Fitting the wrist before the forearm cover hides its screws.

#### Joint Class

A Python class that represents one joint, holding its ID, limits, calibration, and methods to read and command it.

It keeps joint-specific logic in one place.

**Example:** `elbow = Joint(id=3, min_deg=-10, max_deg=140)`.

#### Joint Limits

The minimum and maximum values a joint is permitted to reach, set by mechanical stops, cabling, or software.

They protect the hardware and bound the workspace.

**Example:** A software check rejects a command of 200 degrees when the elbow limit is 150 degrees.

#### Joint-Limit Constrained Planning

Planning motions that keep every joint within its allowed range at all points.

Paths that violate limits are unsafe.

**Example:** Rejecting a path where the elbow would pass 150 degrees.

#### Joint-Space Motion

Movement described by specifying target values for each joint rather than the position of the end effector.

It is the simplest motion type to command.

**Example:** Moving to `[0, 45, 90, 0, 0, 0]` degrees across six joints.

#### JSON File Format

A text format for storing structured data as nested key-value pairs and lists, readable by both humans and nearly every programming language.

This book stores calibration values and waypoints in it.

**Example:** `{"shoulder_pan": {"offset": 2048, "min": 800, "max": 3300}}` records one joint's calibration.

#### JSON Requests

Messages that carry structured data formatted as JSON in the body of a network call.

They are easy for both programs and agents to read.

**Example:** `{"joint": "elbow", "angle": 45}` sent to the arm service.

#### Kit Build

Building a robot from a packaged set of parts that a vendor has gathered together.

It is the quickest and lowest-risk route.

**Example:** Buying a complete SO-ARM101 kit with servos, board, and printed parts.

#### Lab Schedule

A timetable that assigns time slots on shared equipment to groups.

It ensures fair access and safe supervision.

**Example:** Each team gets a 40-minute slot on the data collection station.

#### Large Language Model

A neural network trained on huge amounts of text that can understand and generate language and follow instructions.

It is the reasoning engine of the book's agents.

**Example:** A model that turns the sentence move the cup to the left into a plan of tool calls.

#### Larger Arms

Robot arms with greater reach, payload, and power than desktop models, needing stronger safety measures.

They indicate where the field leads.

**Example:** An industrial arm that carries several kilograms and moves at high speed.

#### Latency

The delay between an action or input and its effect or response.

Delay in teleoperation or camera feeds reduces control quality.

**Example:** A 100 ms lag between moving the leader and the follower responding.

#### Latency and Cost

The trade-off between response delay and money spent on running an agent, especially with remote models.

Choices here shape which design is practical.

**Example:** A larger model gives better plans but takes seconds and costs per call.

#### Layer Height

The thickness of each deposited layer in a print, usually between 0.1 and 0.3 mm.

Thinner layers give a smoother surface but take longer.

**Example:** Switching from 0.2 mm to 0.1 mm roughly doubles the print time.

#### Lead Time

The delay between placing an order and receiving the goods.

It shapes class schedules, since late parts delay builds.

**Example:** A four-week lead time on a batch of servos means ordering before the term starts.

#### Leader Arm

A manually moved arm whose joint positions are read and sent as commands to another arm that copies the motion.

It gives a human an intuitive way to demonstrate tasks.

**Example:** A student moves the leader arm's handle, and the follower arm repeats the motion.

See also: Follower Arm, Teleoperation

#### Leader Assembly

The sequence of building the lighter leader arm, including its servos and the handle used to guide it.

It results in the arm the human holds.

**Example:** Attaching servos with specific gear ratios to each leader joint.

#### Leader Gear Ratios

The mix of different gear ratios used among the leader arm's servos so each joint is light to move yet has enough torque to hold its own weight.

Leader arms are moved by hand, so lower-ratio gearing is used on some joints.

**Example:** Leader joints carry different gearing, such as 1/191 and 1/147, rather than the 1/345 used throughout the follower.

#### Leader Handle and Trigger

The grip and squeezable lever at the end of the leader arm that the operator holds, whose trigger controls the follower's gripper.

It provides natural control of opening and closing.

**Example:** Squeezing the trigger moves the leader's last servo, which commands the follower's gripper to close.

#### Leader-Follower Mapping

The rule that converts leader arm readings into follower commands, including calibration and unit conversion.

Poor mapping makes the follower mimic imprecisely.

**Example:** Matching each leader joint's calibrated angle to the same joint on the follower.

#### Learned Policy Executor

The component that carries out a step by running a trained policy to produce motions.

It provides skilled movement for tasks hard to script.

**Example:** The planner calls the executor to run the pick policy.

#### Learning Curve

The rate at which a learner gains skill with a tool or platform, affected by documentation and complexity.

A steep curve can discourage beginners.

**Example:** Servo-based arms have a gentler curve than CAN-based ones.

#### Learning Python Prerequisites

The set of basic Python skills a learner brings from an introductory course: variables, functions, loops, conditionals, lists, dictionaries, classes, and reading simple error messages.

This book builds directly on those skills and does not re-teach them.

**Example:** A learner who can write a `for` loop over a list of numbers is ready to loop over a list of joint angles.

#### Least Privilege

A security principle in which a component is given only the permissions and tools it needs for its job.

It limits what a compromised or mistaken agent can do.

**Example:** An agent that can call move and stop, but cannot change speed limits.

#### LeRobot Library

An open-source library from Hugging Face for robot learning that provides datasets, models, and tools for real robots such as the SO-ARM101.

It supplies the driver, calibration, recording, and training tools used in this book.

**Example:** Running a LeRobot record command to save demonstration episodes.

#### Lift and Retreat

The motion that raises an object after grasping and moves away from the pick location.

It clears obstacles and avoids dragging.

**Example:** Raising 8 cm after the gripper closes, then moving toward the drop zone.

#### Linear Algebra with NumPy

Using NumPy functions to perform vector and matrix operations such as products, inverses, and decompositions.

It is the toolkit for kinematics.

**Example:** `np.linalg.inv(J)` computes a matrix inverse.

#### Linear Interpolation

Interpolation that changes a value at a constant rate along a straight line between two points.

It is the simplest method, though speed starts and stops abruptly.

**Example:** `a + (b - a) * t` for t from 0 to 1.

#### Link

A rigid segment of a manipulator that connects one joint to the next and moves as a single body.

Link lengths determine reach and appear in every kinematics equation.

**Example:** The upper arm of a two-link planar arm is a 12 cm link between the shoulder and elbow.

#### Link Lengths

The fixed distances between consecutive joint axes along an arm.

They appear in every kinematics equation.

**Example:** L1 = 0.116 m and L2 = 0.135 m for a small arm's upper arm and forearm.

#### Little-Endian Byte Order

A way of storing multi-byte numbers with the least significant byte first.

Feetech servo registers use it, so bytes must be reassembled in that order.

**Example:** The position 0x0800 is sent as the bytes 0x00 then 0x08.

#### Load Feedback

A reported value indicating how hard a servo is working against its load, usually as a percentage of maximum output.

It supports gentle gripping and stall detection.

**Example:** The present-load register jumps toward its maximum when the arm pushes against the table.

#### Local Agent

An agent whose model and tools run on the user's own computer rather than on a remote service.

It improves privacy and offline use, but small local models may be less capable.

**Example:** A language model running on a laptop controls the arm with no internet.

#### Log Levels

Named severity categories such as DEBUG, INFO, WARNING, ERROR, and CRITICAL that classify log messages.

They let users filter noise from important events.

**Example:** A joint-limit violation logged at WARNING level.

#### Logging Module

The standard library module that records messages from a program with levels, timestamps, and destinations.

It replaces scattered print statements with organized records.

**Example:** `logging.info("Moved to home")` writes a time-stamped line.

#### Loose Gears

Excess free play inside a servo's gear train, from wear or damage, that lets the output shaft wobble.

It reduces accuracy and may precede failure.

**Example:** The output horn can be rocked by hand with a clicking sound.

#### Magnetic Encoder

An encoder that senses the angle of a small magnet attached to the shaft using a magnetic field sensor chip, with no contact between parts.

It is compact and robust enough for low-cost servos.

**Example:** The STS3215 senses a magnet on its output shaft to report an absolute position.

#### Mains Power Safety

Practices for working near wall-outlet electricity, which can cause fatal shock, such as using certified adapters and never opening powered equipment.

Learners use low-voltage supplies and leave mains wiring to certified products.

**Example:** Using a certified wall adapter rather than cutting and splicing a mains cord.

#### Maintenance Schedule

A planned timetable for inspecting, cleaning, tightening, and replacing parts.

Regular care prevents unexpected failures.

**Example:** Checking screw tightness and gear wear every month.

#### Makerspace Use

Operating the arm in an open workshop shared by members with varying experience.

Shared spaces need clear rules and signage.

**Example:** A posted sign requiring training before powering the arm.

#### Manipulability

A measure of how easily an arm can move its end effector in all directions at a given configuration.

Low values warn of nearness to a singular pose.

**Example:** Computed as the square root of the determinant of `J @ J.T`.

#### Manipulability Ellipse

A shape drawn at the end effector showing in which directions it can move quickly or slowly for a given pose.

It makes manipulability visible.

**Example:** A long thin ellipse shows the arm moves easily in one direction but poorly in the other.

#### Matplotlib Animation

Producing moving plots with the Matplotlib `animation` tools, redrawing a figure frame by frame.

It lets learners watch the arm move over time.

**Example:** `FuncAnimation` redraws a two-link arm at each time step.

#### Matplotlib Plot

A chart drawn by the Matplotlib Python library, such as a line plot or scatter plot.

Plots reveal patterns invisible in raw numbers.

**Example:** `plt.plot(t, angle)` draws elbow angle against time.

#### Matrix Multiplication

An operation that combines two grids of numbers by multiplying rows with columns, used to chain transformations.

It underlies kinematics.

**Example:** `A @ B` in NumPy multiplies two matrices.

#### Maximum Deviation

The largest single difference between expected and actual values over a run.

It reveals the worst case.

**Example:** The gripper strays at most 6 mm from the planned line.

#### MCP Server

A program that exposes tools, data, or prompts to AI applications following the Model Context Protocol.

It wraps the arm so agents can use it safely.

**Example:** A server offering move, home, and stop tools for the arm.

#### Minimum-Jerk Trajectory

A motion that minimizes total jerk, giving bell-shaped speed and very smooth movement resembling natural human reaching.

It is gentle on hardware.

**Example:** A quintic polynomial with zero velocity and acceleration at both ends.

#### Mobile Manipulation

Combining a movable base with an arm so a robot can both travel and handle objects.

It extends reach beyond a fixed workspace.

**Example:** A wheeled platform carrying a small arm to pick up items from different tables.

#### Mock Hardware

Test replacements that mimic the behavior of real devices so code can be tested without them.

Mocks make tests fast, safe, and repeatable.

**Example:** A mock serial port that returns a canned status packet for each ping.

#### Model Context Protocol

An open standard for connecting AI applications to tools and data sources through a common message format.

It lets one tool server work with many agents.

**Example:** An agent discovering the arm's tools through an MCP connection.

See also: MCP Server

#### Moment Arm

The perpendicular distance from a joint's axis to the line along which a force acts.

Torque equals force times this distance.

**Example:** A 200 g weight held 0.25 m from the shoulder gives a larger torque than the same weight at 0.1 m.

#### Monitoring

Watching system values such as temperature, current, and errors while it runs.

It catches problems before they fail.

**Example:** Printing servo temperatures once per second during a long test.

#### Motor Controller

An electronic circuit that takes commands and supplies the appropriate voltage and current to run a motor.

Every actuator needs one, whether inside the servo or separate.

**Example:** An H-bridge board that reverses motor direction in response to a signal.

#### Motor ID Assignment

Giving each motor on a shared bus a different identifier so frames reach only the intended one.

Duplicate IDs cause conflicting replies.

**Example:** Numbering reBot motors from 1 at the base to 6 at the wrist.

#### Motor Mode Selection

Choosing how an actuator is commanded, such as position, velocity, or torque (MIT-style) control.

The mode decides which values a command must carry.

**Example:** Setting a motor to position mode before sending target angles.

#### Motor Speed

How fast a motor's shaft turns, expressed as rotations per minute, degrees per second, or radians per second.

Speed limits keep motion safe and smooth.

**Example:** A servo with a no-load speed of 0.222 seconds per 60 degrees turns about 270 degrees per second.

#### Mounting to a Table

Fixing the arm's base to a work surface with clamps or screws so it does not slide or tip during motion.

An unmounted arm can lurch when it accelerates.

**Example:** Two C-clamps hold the base to the edge of a desk.

#### Move to Pose Tool

An agent tool that moves the arm to a given pose, checking validity and limits before executing.

It is the agent's main motion action.

**Example:** `move_to_pose(x=0.2, y=0.0, z=0.1)`.

#### MoveIt Planning

Using the MoveIt motion planning framework in ROS to compute collision-free paths for arms.

It shows how professional planners work.

**Example:** Asking MoveIt for a path from the home pose to a pick pose around an obstacle.

#### Multi-Joint Move

A motion command that changes several joints at once toward their targets.

Coordinated timing makes the path smooth.

**Example:** Moving shoulder, elbow, and wrist together to reach over a block.

#### Multimeter

A handheld instrument that measures voltage, current, and resistance, and often tests continuity.

It is the main tool for checking wiring and power.

**Example:** Measuring 12.1 V across the supply terminals before connecting the servo board.

#### Multiple IK Solutions

The fact that more than one set of joint values can reach the same target.

Software must choose among them.

**Example:** One solution with the elbow bent up and another bent down.

#### Naming Conventions

The agreed patterns for naming variables, functions, classes, and constants, such as `snake_case` for functions and `CapWords` for classes.

Consistent names make robot code readable and reduce wiring-up mistakes between modules.

**Example:** `shoulder_angle_deg` as a variable name, `ServoBus` as a class name, and `MAX_SPEED` as a constant.

#### Natural-Language Control

Operating a robot using everyday sentences instead of code or buttons.

It lowers the barrier to using robots.

**Example:** Telling the arm to pick up the blue block.

#### Numerical Differentiation

Estimating a derivative from sampled values by dividing differences by the step size.

It turns logged positions into velocities.

**Example:** `np.diff(angle) / dt`.

#### Numerical Inverse Kinematics

An iterative method that adjusts joint values step by step until the computed end effector position matches the target.

It handles arms without simple formulas.

**Example:** Repeating a Jacobian update until the position error is under 1 mm.

#### Numerical Jacobian

A Jacobian estimated by making small changes to each joint and measuring the resulting end effector movement.

It avoids deriving formulas by hand.

**Example:** Perturbing each joint by 0.001 rad and recording how the position changes.

#### NumPy Array

A fixed-type, multi-dimensional grid of numbers from the NumPy library that supports fast math on whole collections at once.

It is the standard container for vectors and matrices in kinematics code.

**Example:** `np.array([0.2, 0.0, 0.1])` holds a point.

#### Object Centroid

The center point of an object's shape in an image, found from its pixels or contour.

It gives one location to aim at.

**Example:** Computing a block's centroid at pixel (312, 245) from image moments.

#### Object Detection

Locating and identifying objects in an image, often returning boxes and labels.

It lets an arm find what to pick up.

**Example:** A detector returning a box around a cup with the label cup.

#### Object Localization

Determining where in an image or workspace a specific object is.

It turns recognition into a target for the arm.

**Example:** Finding the red block at pixel (320, 240).

#### Observation and Action

The pair of data at each time step in robot learning: what the robot senses, such as camera images and joint positions, and what it is commanded to do.

A policy learns to map the first to the second.

**Example:** An observation of two camera frames and six joint angles, with an action of six target angles.

#### Obstacle Representation

The method of describing obstacles to a planner, such as boxes, spheres, or grids.

It defines which poses are blocked.

**Example:** A box shape marking the table surface as a no-go region.

#### Official Kit

A kit sold by the design's creators or their authorized partners, with parts tested to work together.

It reduces compatibility surprises.

**Example:** A kit offered through the arm's official vendor with known-good servos.

#### Ohm's Law

The relationship stating that the current through a conductor equals the voltage across it divided by its resistance, V = I × R.

It explains heating, voltage drops, and resistor choices.

**Example:** A 5 V signal across a 1 kilohm resistor yields 5 mA.

#### Online Marketplace

A website where many independent sellers list products, with prices and quality that vary by seller.

It often has low prices, but vetting sellers is necessary.

**Example:** An online store listing several vendors for the same servo at different prices.

#### Open Gripper Tool

An agent tool that opens the gripper to a safe width.

It is a simple action to release an object.

**Example:** Calling the tool to drop a block into a bin.

#### Open-Source Contribution

Giving back to a public project by improving code, documentation, designs, or reporting issues.

It strengthens the community the book relies on.

**Example:** Submitting a pull request that fixes a typo in the assembly guide.

#### Open-Source Hardware

Physical designs whose files, such as CAD models, drawings, and parts lists, are published under a license that lets anyone study, build, modify, and sell versions.

It is why the SO-ARM101 can be printed and built by a school at low cost.

**Example:** Downloading the STL files from the public repository and printing the parts yourself.

#### Open-Source Repository

A public online store of a project's files, such as designs, code, and documentation, where anyone can view, copy, and often contribute.

It is where the arm designs live.

**Example:** The SO-ARM100 repository on GitHub holds STL files, a parts list, and an assembly guide.

#### OpenClaw

An open-source personal AI agent framework that runs locally, connects to messaging apps, and uses skills and tools to take actions.

It serves as the agent platform in this book's later chapters.

**Example:** Using OpenClaw to receive a chat message and trigger an arm movement.

#### OpenClaw Installation

The steps to install and configure OpenClaw on a computer, including its dependencies and model access.

A working installation is the base for agent projects.

**Example:** Installing OpenClaw and confirming it can reply to a test message.

#### OpenClaw Messaging Interface

The connection through which OpenClaw receives instructions and sends replies using a chat service.

It lets users control the arm by messages.

**Example:** Sending a message from a phone that the agent reads and acts upon.

#### OpenClaw Skill Files

Text files that describe to OpenClaw how to do a task, listing instructions and how to call scripts or tools.

They define what the agent knows how to do.

**Example:** A skill file for the arm naming the commands it may use and their limits.

#### OpenCV Library

An open-source computer vision library, imported in Python as `cv2`, with functions for capturing, filtering, and analyzing images.

It is the main tool for the vision chapters.

**Example:** `cv2.VideoCapture(0)` opens the first webcam.

#### Optional Parts

Items that improve convenience, appearance, or capability but are not needed for basic operation.

They can be added later as budget allows.

**Example:** A table clamp upgrade, a camera mount, or extra cable sleeves.

#### Order Tracking

Following a shipment's progress using a carrier's tracking number.

It helps plan the build and catch lost packages early.

**Example:** Entering a tracking number to see that a parcel is stuck at customs.

#### Orientation Control

Commanding and keeping the direction the end effector faces as well as its position.

Grasping often needs the gripper pointing downward.

**Example:** Keeping the gripper vertical while sliding across the table.

#### Overfitting

When a model memorizes training examples and fails on new situations.

It makes a policy work only in the conditions seen in the demonstrations.

**Example:** A policy that works only when the block sits at exactly the same spot.

#### Overload Protection

A built-in feature that cuts or limits motor output when load, current, or temperature crosses a safe threshold.

It protects servos from burnout, but it can also make an arm go limp in the middle of a task.

**Example:** A servo stops responding after holding against a wall, then recovers when it cools.

#### Packet Structure

The defined layout of a message, with fields such as header, ID, length, instruction, parameters, and checksum in a fixed order.

Knowing the layout is how a program builds and decodes commands.

**Example:** The Feetech format starts with two 0xFF bytes, then the ID, length, instruction, data, and a final checksum.

#### Parallel Gripper

A gripper whose jaws stay parallel to each other while they open and close, so the object is clamped between flat faces.

The jaw gap maps neatly to a single width value.

**Example:** A linear-rail gripper opens its jaws from 0 mm to 60 mm in a straight line.

#### Parameter Validation

Checking that the inputs to a command are acceptable in type, range, and meaning before acting on them.

It blocks dangerous or nonsensical requests.

**Example:** Rejecting an angle of 400 degrees.

#### Part Revisions

Updated versions of a component or design, identified by version numbers, that may change dimensions or behavior.

Mixing revisions can create fit or software problems.

**Example:** A newer servo revision with a different default setting.

#### Path Parameterization

Describing a path by a single parameter, typically from 0 to 1, so position along the path can be assigned a timing.

It separates geometry from speed.

**Example:** Position equals start plus s times the difference, where s rises smoothly with time.

#### Path Prediction

Calculating in advance where the arm will go along a command, using a model.

It enables preview and checks.

**Example:** Running forward kinematics for each planned joint set to draw the gripper path.

#### Path Safety Check

A review of a planned path to confirm it respects limits, avoids collisions, and stays inside the safe region before running.

It prevents harmful motion.

**Example:** Checking every waypoint against joint limits and the table boundary.

#### Path Smoothing

Adjusting a planned path to remove unnecessary bends and jerky motion.

Raw sampled paths wander.

**Example:** Replacing a zigzag route with a gentler curve.

#### Path vs Trajectory

The distinction that a path is the geometric route taken, while a trajectory also specifies the timing along that route.

Two motions can share a path but differ in speed.

**Example:** The same straight line traveled in two seconds or in ten.

#### Payload

The maximum mass an arm can carry at its end effector while meeting its performance specifications.

Payload falls as the load is held farther from the base.

**Example:** A small desktop arm may lift a 100 g bottle cap at close range but droop with 500 g.

#### Payload Comparison

A comparison of how much mass different arms can carry, using the same test conditions.

It matches the arm to the task.

**Example:** A small servo arm lifts a few hundred grams while a CAN-actuator arm handles kilograms.

#### Perceive Plan Act Observe

A four-stage cycle describing agent behavior: take in information, decide a plan, execute a step, then check the outcome.

It frames how an arm agent behaves.

**Example:** See the block, plan a pick, close the gripper, then look to check the grasp.

#### PETG

A tougher, more heat-tolerant thermoplastic filament that prints at higher temperatures than PLA and resists impact better.

It suits parts that see heat or stress.

**Example:** Choosing PETG for a gripper finger that may be dropped.

#### Physics Simulator

Software that models forces, collisions, and motion according to physical laws so virtual robots behave realistically.

It allows testing and training without wear or risk.

**Example:** A simulator in which the arm drops a block under gravity.

#### Pick and Place

A task in which a robot picks up an object at one location and puts it down at another.

It is the classic demonstration of arm control.

**Example:** Moving a red block from the left side of the table to a box on the right.

#### PID Control

A feedback control method that computes a motor command from the present error, its accumulated sum, and its rate of change, using three gains.

Servos run this loop internally to track a target position.

**Example:** Raising the proportional gain makes a joint reach its target faster but may cause oscillation.

#### Pinch Point

A location where two moving parts, or a moving and a fixed part, can trap and crush fingers or objects.

Arms have many, especially at joints and gripper jaws.

**Example:** The gap between the forearm and upper arm as the elbow closes.

#### Ping Command

A minimal instruction that asks a device to reply with its status without changing anything.

It confirms a servo is present, powered, and talking.

**Example:** Pinging ID 3 and receiving a status packet shows the elbow servo is alive.

#### Pinocchio Library

An open-source rigid-body dynamics and kinematics library, usable from Python, that computes transforms, Jacobians, and dynamics from a URDF.

It offers fast, tested kinematics.

**Example:** Loading a URDF and calling a forward kinematics function for a joint vector.

#### Pip

The standard Python package installer, which downloads libraries from the Python Package Index and installs them into the active environment.

Nearly every dependency in this book, from `pyserial` to `numpy`, arrives through this tool.

**Example:** `pip install pyserial` adds the serial-port library to the active virtual environment.

#### Pixel-to-World Mapping

Converting a point's pixel coordinates in an image into physical coordinates on the work surface.

It is how a detected block becomes a pick target.

**Example:** A homography that maps pixel (312, 245) to table coordinates (0.18 m, 0.04 m).

#### PLA

A biodegradable thermoplastic filament that prints easily at low temperatures but softens at around 60 degrees Celsius.

It is the default material for classroom arm parts.

**Example:** Printing the arm in PLA at a nozzle temperature near 200 degrees Celsius.

See also: PETG, Filament

#### Planner-Executor Split

A design in which a language-model planner chooses what to do while a separate, specialized component performs how to do it.

It keeps slow reasoning apart from fast control.

**Example:** The agent selects the next step and a trained policy produces the joint motions.

#### Platform Selection Criteria

The factors used to choose an arm platform, such as budget, payload, accuracy, software support, and classroom needs.

Stating them first makes the choice rational.

**Example:** Weighing cost and LeRobot support above payload for a beginner classroom.

#### Plotting Trajectories

Drawing planned or measured motion paths as graphs of position, velocity, or acceleration against time.

It lets learners judge smoothness.

**Example:** Plotting commanded and measured elbow angle on the same axes.

#### Plotting Workspace

Drawing the points the end effector can reach as a scatter or surface.

It shows where tasks are possible.

**Example:** A top-down plot of sampled reachable x and y positions.

#### Policy

A function, often a neural network, that chooses the robot's action given the current observation.

It is the learned controller.

**Example:** A policy that outputs the next six joint targets from the camera image and current joint angles.

#### Policy Failure Modes

The typical ways a learned policy goes wrong, such as hesitating, missing the object, or drifting.

Knowing them guides data and training improvements.

**Example:** The arm hovers above a block without descending.

#### Pose

The position and orientation of an object, such as the end effector, in a given coordinate frame; in this book also a full set of joint values.

Pose is the target of most motion commands.

**Example:** A pose of x = 0.20 m, y = 0.0 m, z = 0.10 m, with the gripper pointing down.

#### Pose Dataclass

A dataclass that holds the position and orientation of the end effector, or a set of joint values, as named fields.

It passes poses around cleanly.

**Example:** `Pose(x=0.2, y=0.0, z=0.1, pitch=-90.0)`.

#### Position Feedback

Data from a sensor that tells the controller where a joint actually is, so it can compare against the target.

Without it, the arm would have to guess its pose.

**Example:** Reading a joint's present position register to confirm it reached 90 degrees.

#### Power Budget

An estimate of the total power every component might draw, compared to what the supply can deliver.

It prevents undersized supplies.

**Example:** Six servos at 2 A peak each is 12 A, so a 5 A supply is not enough.

#### Power Connectors

The plugs and sockets that join power sources to circuits, such as barrel jacks, XT30, XT60, and screw terminals.

The right connector keeps polarity correct and contact resistance low.

**Example:** An XT60 connector carries the current for the larger reBot actuators.

#### Power Distribution Board

A board that splits one power source into several protected outputs with common connectors.

It keeps the arm's wiring neat and shares current safely among actuators.

**Example:** A board with one XT60 input and several outputs, each with its own fuse.

#### Power Supply

A device that converts mains electricity or another source into the steady voltage and current a circuit needs.

The arm's motors depend on a supply that matches their rating.

**Example:** A 12 V, 5 A wall adapter with a barrel plug powers the servo bus.

#### Pre-Grasp Approach

The motion to a position just above or beside an object, before the final move to grasp it.

It avoids bumping the object.

**Example:** Stopping 5 cm above a block before lowering straight down.

#### Predicted vs Measured Path

A comparison between the path a model forecasts and the path the real arm follows.

Differences reveal calibration and modeling errors.

**Example:** Plotting predicted gripper positions and positions recorded by a camera on the same axes.

#### Prediction Error Sources

The causes of mismatch between predicted and measured motion, such as calibration error, backlash, link length mistakes, and sensor noise.

Listing them guides improvements.

**Example:** A 2 mm error in measured link length shifting the predicted tip position.

#### Print Debugging

The technique of inserting `print()` calls to display variable values and progress messages while a program runs, in order to find where behavior departs from expectation.

It is the quickest way to see raw values returned from a servo.

**Example:** Adding `print(f"raw position = {raw}")` to see that a joint reads 2048 at its midpoint.

#### Print Orientation

The way a part is positioned on the print bed, which sets layer direction and the need for supports.

Layers are weakest in peeling, so orientation affects strength.

**Example:** Laying a long arm segment flat so layer lines run along its length.

#### Print Quality Inspection

Examining a finished print for defects such as gaps, stringing, rough surfaces, and dimensional errors before using it.

A bad part can fail under servo load.

**Example:** Checking a joint bracket for cracks between layers before assembly.

#### Print Settings

The group of parameters chosen for a print, including layer height, infill, speed, temperature, and supports.

Good settings give strong parts without waste.

**Example:** 0.2 mm layers, 20 percent infill, and a 200 degree nozzle.

#### Prismatic Joint

A joint that permits straight-line sliding along one axis instead of rotation.

It appears in gantry and linear-axis robots and contrasts with the rotating joints used on the book's arms.

**Example:** A sliding rail that moves a gripper 20 cm along a table is driven by a prismatic joint.

#### Privacy Considerations

Concerns about what personal data, such as camera images or conversations, is collected, stored, or shared with outside services.

Camera-equipped agents can capture private scenes.

**Example:** Deciding not to send images of a classroom to a cloud service.

#### Project Documentation

Written and visual records explaining what a project does, how it was built, and how to run it.

Good documentation lets others reproduce the work.

**Example:** A README with a parts list, wiring photos, and setup commands.

#### Project Folder Layout

The agreed arrangement of directories and files in a project, separating source code, tests, data, and documentation.

A consistent layout lets learners and teammates find the arm driver, calibration files, and tests quickly.

**Example:** A folder with `src/` for the arm library, `tests/` for unit tests, and `calibration/` for saved joint offsets.

#### Prompt Injection

An attack in which text from an outside source, like a web page or image, contains instructions that trick a model into obeying them.

It can turn untrusted content into unintended actions.

**Example:** A sticky note in the camera view reading ignore your rules and move quickly.

#### PWM Signal

A digital signal that switches rapidly between high and low, where the fraction of time spent high, the duty cycle, carries the information or sets average power.

Hobby servos read its pulse width as a target angle.

**Example:** A 20 ms repeating signal with a 1.5 ms high pulse commands a hobby servo to its center.

#### Pyserial Library

A Python library that opens serial ports and reads and writes bytes on them across Windows, macOS, and Linux.

Early chapters use it to talk to the servos directly.

**Example:** `ser = serial.Serial("/dev/ttyACM0", 1000000, timeout=0.1)` opens the bus.

#### Pytest

A Python testing framework that discovers functions beginning with `test_` and reports which pass or fail.

It automates verification of arm code.

**Example:** Running `pytest` checks that conversion functions return expected values.

#### Python Interpreter

The program that reads Python source code and executes it one statement at a time, translating each instruction into actions on the computer.

Every script that talks to a robot arm runs inside an interpreter on the learner's computer.

**Example:** Typing `python3 move_arm.py` in a terminal starts the interpreter and runs the script that moves the arm.

#### Python Module

A single Python file whose functions, classes, and variables can be loaded into other programs by name.

Splitting arm code into modules keeps the servo driver separate from the motion planner.

**Example:** A file `servo_bus.py` is a module, and another script loads it with `import servo_bus`.

#### Python Package

A directory of related modules, marked by an `__init__.py` file, that is imported as a single unit under one name.

The book's hardware library is organized as a package so related pieces stay together.

**Example:** A folder `robotarm/` containing `arm.py`, `joint.py`, and `__init__.py` is imported with `import robotarm`.

See also: Python Module, Import Statement

#### Python Script

A plain text file ending in `.py` that holds a sequence of Python statements and runs from top to bottom when passed to the interpreter.

Scripts are the first unit of robot control in this book, such as a short file that homes the arm.

**Example:** A file named `go_home.py` that connects to the arm, moves each joint to its home angle, and disconnects.

#### Python-CAN Library

A Python package that gives a common interface to many CAN adapters, for sending and receiving frames.

It lets learners control CAN actuators without writing low-level drivers.

**Example:** `bus = can.interface.Bus(channel="can0", interface="socketcan")` opens the bus.

#### Quasi-Direct Drive

An actuator design using a low gear ratio so the output can be pushed back easily and torque can be read from motor current.

It gives smooth, responsive force behavior.

**Example:** A 6:1 planetary gearbox on a brushless motor lets the joint be moved by hand with little resistance.

#### Quaternion

A four-number representation of 3D orientation with no gimbal lock and efficient composition.

Libraries and simulators use it widely.

**Example:** `(w, x, y, z) = (1, 0, 0, 0)` means no rotation.

#### Quaternion Rotation

Using a unit quaternion to rotate vectors or combine orientations by quaternion multiplication.

It is stable and compact.

**Example:** Multiplying two quaternions to combine two rotations.

#### Quintic Polynomial Trajectory

A motion plan using a fifth-degree polynomial in time, fitting positions, velocities, and accelerations at both ends.

It adds smoothness in acceleration.

**Example:** A 3 s move with zero velocity and zero acceleration at both ends.

#### Range of Motion Limits

The measured minimum and maximum readings each joint can reach, recorded during calibration.

They bound later commands.

**Example:** The elbow's raw range recorded as 780 to 3310.

#### Rate Limiting

Restricting how often commands or requests may be made within a period.

It prevents floods of commands or runaway costs.

**Example:** Allowing at most one motion command per second.

#### Raw Servo Units

The native integer counts used by a servo to represent position, speed, or load, before conversion to degrees or other units.

Drivers must convert from them.

**Example:** A 12-bit position of 0 to 4095 spans one full turn.

#### Reach

The maximum distance from the base to the end effector when the arm is fully stretched.

It is the first number to compare when choosing an arm for a task.

**Example:** An arm with 11 cm and 13 cm links has a reach of about 24 cm plus the gripper length.

#### Reachability Map

A plot or table showing which points in space the end effector can reach, and sometimes how well.

It guides task layout.

**Example:** A colored map where green marks reachable table positions.

#### Reading a Register

Requesting and decoding the value stored at a specific address in a device's memory.

It is how software learns position, temperature, and load.

**Example:** Sending a read instruction for the present-position address and decoding the two returned bytes.

#### Reading a Traceback

The skill of interpreting the stack of file names, line numbers, and messages Python prints when an exception stops a program, starting from the last line.

Most hardware failures, such as a missing serial port, first show up as a traceback.

**Example:** A `SerialException: could not open port` on the last line tells the learner the adapter is unplugged or the port name is wrong.

#### Reading Joint Positions

Querying the servos or motors for their present angles and returning them in useful units.

Control and logging begin with accurate readings.

**Example:** `angles = arm.read_positions()` returns six values in degrees.

#### reBot B601-DM

The reBot arm variant that uses Damiao CAN actuators in its joints.

Its commands follow the Damiao protocol.

**Example:** Controlling a B601-DM through a USB-to-CAN adapter and the Damiao message format.

#### reBot B601-RS

The reBot arm variant that uses RobStride CAN actuators in its joints.

Its commands follow the RobStride protocol, which differs from the Damiao one.

**Example:** Setting motor IDs and enabling a B601-RS joint using RobStride messages.

#### reBot Gripper Assembly

The steps for building and mounting the gripper on the reBot arm, including its actuator, fingers, and cabling.

The gripper is the tool that touches objects.

**Example:** Fitting the gripper actuator to the wrist flange and routing its cable along the arm.

#### reBot Wrist Assembly

The steps for building and installing the wrist on the reBot arm, including its joints, actuators, and cabling.

The wrist sets how well the gripper can be oriented.

**Example:** Bolting the wrist actuators together at right angles and connecting them to the CAN line.

#### reBot-DevArm

A larger open-source robot arm from Seeed Studio that uses CAN-bus actuators, aimed at developers moving beyond hobby servos.

It is the book's higher-performance platform.

**Example:** A reBot-DevArm with six actuators connected through a CAN adapter to a laptop.

#### Recording Episodes

Saving a time-ordered set of observations and actions, such as images and joint positions, for a complete task attempt.

These recordings become training data.

**Example:** Capturing a 20-second demonstration of picking up a block.

#### Register Map

A table listing each memory address in a device, what it stores, its size, and whether it can be read, written, or both.

It is the manual a programmer uses to control a servo.

**Example:** Address 56 holds present position, and address 42 holds goal position, on the STS series.

#### Regression Testing

Re-running tests after changes to confirm that earlier working behavior has not been broken.

It keeps improvements from reintroducing old bugs.

**Example:** Running the full test suite after rewriting the interpolation code.

#### Repeatability

How closely an arm returns to the same position when commanded there many times, under the same conditions.

Good repeatability matters more than raw accuracy for pick-and-place when targets are taught by example.

**Example:** Returning to a taught point ten times and landing within 1 mm each time indicates good repeatability.

See also: Accuracy

#### Repeatability Test

A procedure that repeats the same task many times to measure consistency.

It shows whether a result was luck.

**Example:** Commanding the same pose 20 times and recording the spread of final positions.

#### REPL

An interactive Python session, short for read-evaluate-print loop, that reads one typed statement, runs it immediately, prints the result, and waits for the next one.

It lets learners test a single servo command before putting it in a program.

**Example:** In the REPL you can type `1000000 / 8` and instantly see the number of bytes per second a bus could carry.

See also: Python Interpreter, Terminal

#### Replanning

Revising a plan when conditions change or a step fails.

Real environments rarely follow the first plan.

**Example:** The block was knocked away, so the agent finds it again and plans a new approach.

#### Replay Testing

Re-running recorded requests or logged sessions against a system to see whether behavior matches earlier results.

It checks changes without new human input.

**Example:** Feeding a logged conversation to a revised agent and comparing its tool calls.

#### Replaying Motion

Playing back recorded joint positions on the arm to reproduce a previously performed movement.

It checks recordings and repeats fixed tasks.

**Example:** Loading a saved episode and sending its actions to the follower in order.

#### Repository Version History

The recorded sequence of changes to a project's files, showing what changed, when, and by whom.

It reveals why parts differ between revisions.

**Example:** Reading commit messages to find when the gripper design was updated.

#### Requests Library

A popular Python package for sending HTTP requests and handling responses.

It lets scripts talk to tool servers and web services.

**Example:** `requests.post(url, json={"angle": 45})`.

#### Required Parts

The items that must be obtained for the build to work at all.

Knowing them prevents getting stuck midway.

**Example:** Servos, a controller board, a power supply, and printed structure are required for an SO-ARM101.

#### Requirements File

A text file, usually named `requirements.txt`, that lists the packages and versions a project needs so another person can install them in one command.

It makes a classroom of identical arm setups reproducible.

**Example:** A file containing the lines `pyserial`, `numpy`, and `matplotlib` is installed with `pip install -r requirements.txt`.

#### Responsible Robotics

Building and using robots with attention to safety, privacy, fairness, and effects on people.

It frames technical decisions as ethical ones too.

**Example:** Asking before recording video of other students near the arm.

#### Reverse Polarity Protection

Circuitry or connectors that prevent damage when power is connected with positive and negative swapped.

A single swapped wire can destroy a controller board.

**Example:** A keyed connector that only fits one way around, or a diode in series with the supply.

#### Revolute Joint

A joint that permits rotation about a single fixed axis, like a door hinge.

Almost every joint in the arms used in this book is of this kind.

**Example:** The wrist roll of the SO-ARM101 is a joint that twists the gripper about the forearm's axis.

See also: Joint, Prismatic Joint

#### Risk Assessment

A systematic review of what could go wrong in a task, how likely and how severe it is, and what reduces the risk.

Doing one before new experiments builds good habits.

**Example:** A table listing pinch points, power faults, and falling parts, each with a control measure.

#### RMSE

Root mean square error, a summary of the typical size of errors, found by squaring them, averaging, and taking the square root.

It condenses a whole path comparison into one number.

**Example:** An RMSE of 1.5 degrees across a trajectory.

#### Robot Arm

A programmable mechanical manipulator made of rigid segments connected by joints that moves a tool or hand through space.

Controlling one with Python is the subject of the whole book.

**Example:** The SO-ARM101 is a six-motor desktop robot arm that can pick up a small block.

#### Robot Arm Applications

The range of tasks arms perform, including assembly, welding, painting, packaging, laboratory automation, and sorting, as well as education and research.

Knowing the uses helps match arm size and accuracy to the job.

**Example:** A desktop arm sorts colored blocks while an industrial arm spot-welds car bodies.

#### Robot Arm Skill

An agent skill specifically for operating the robot arm, listing the available tools, limits, and safe usage.

It focuses the agent on the arm's capabilities.

**Example:** A skill that maps open the gripper to the open-gripper tool.

#### Robot Safety

The practices, devices, and habits that prevent a robot from harming people, itself, or its surroundings.

It comes before every motion experiment in this book.

**Example:** Keeping hands clear of the arm and having a way to cut power quickly.

#### RobStride Actuator

A brushless joint motor with integrated gearbox and drive electronics made by RobStride and controlled over CAN bus.

It is the actuator choice for the reBot B601-RS arm.

**Example:** A RobStride unit is given a CAN identifier, then sent a frame requesting a target position.

See also: reBot B601-RS, CAN Bus

#### ROS 2 Bridge

A connector that translates between an agent's tool calls and ROS 2 messages or services.

It lets agents drive ROS-based robots.

**Example:** A tool call to move that publishes a trajectory message on a ROS topic.

#### ROS 2 Tour

An introductory walk-through of the Robot Operating System 2 framework and its nodes, topics, and tools.

It shows how robots are built from cooperating programs.

**Example:** Listing active topics while a simulated arm runs.

#### ROS Node

A single running program in ROS 2 that performs one function and communicates with other nodes.

Systems are built by combining nodes.

**Example:** A node that reads joint states and another that sends commands.

#### ROS Topic

A named channel in ROS 2 on which nodes publish and subscribe to messages of a given type.

It is the main way robot data flows.

**Example:** A `/joint_states` topic carrying current joint angles.

#### Rotation

A turning of an object about an axis, described by an angle and axis, a matrix, or a quaternion.

It orients the tool and links.

**Example:** Turning the gripper 90 degrees about its vertical axis.

#### Rotation Matrix

A square matrix that rotates a vector from one orientation to another while preserving lengths.

It encodes orientation in 3D.

**Example:** A 2x2 matrix with entries cos and sin turns a planar point by an angle.

#### RRT Algorithm

A sampling-based planner, rapidly-exploring random tree, that grows a tree from the start toward random samples until it reaches the goal.

It finds paths in high-dimensional spaces.

**Example:** Growing a tree of valid poses from home until one is near the target.

#### Runaway Motion

Unintended continued or accelerating movement of the arm that the program is not commanding or cannot stop.

It is one of the main hazards of software-controlled hardware.

**Example:** A bug leaves the target position stuck at a large value and the arm keeps pushing against its stop.

#### Safe Power-Up Sequence

The ordered steps followed when turning on a robot: inspect wiring, clear the workspace, connect low-power logic, then apply motor power.

Doing so avoids sudden unexpected motion.

**Example:** Checking polarity with a multimeter, plugging in USB, and only then switching on the motor supply.

#### Safe Shutdown

An ordered sequence that brings the arm to a safe pose, disables torque, and removes power without sudden drops.

It protects the arm and anything in its grasp.

**Example:** Moving to the rest position, waiting until it stops, then disabling torque and disconnecting.

#### Safe Work Envelope

The region of space the arm is allowed to move in, kept clear of people and fragile objects.

Marking it prevents accidents.

**Example:** Taping a boundary on the table around the arm and keeping cables outside it.

#### Safety Checklist

A written list of checks to complete before running a robot, such as cable condition, clear workspace, and stop button access.

It makes safety routine rather than memory-dependent.

**Example:** A card at the workstation with boxes to tick: workspace clear, e-stop tested, speed limit set.

#### Safety Layer

A program component between the agent and hardware that checks and limits every command before it reaches the arm.

It protects regardless of what the agent decides.

**Example:** A function that clips speed and rejects poses outside the safe region.

#### Sampling-Based Planning

A family of path-planning methods that randomly sample poses and connect valid ones, rather than searching every possibility.

It handles many joints.

**Example:** Sampling random configurations until a collision-free route is found.

#### Scene Description

A text summary of what is visible in an image, naming objects and their layout.

It gives an agent awareness of the workspace.

**Example:** Three blocks on a table: red on the left, blue in the middle, green on the right.

#### SciPy Interpolation

Functions from the SciPy library, such as `interp1d` and `CubicSpline`, for estimating values between known data points.

They save writing numerical code.

**Example:** `CubicSpline(times, angles)` creates a smooth function of time.

#### SciPy Optimize

The SciPy submodule that finds parameter values minimizing a function, such as `minimize` and `least_squares`.

It fits models or solves inverse kinematics numerically.

**Example:** `scipy.optimize.least_squares` adjusting joint angles until the tip position error is small.

#### Screws

Threaded fasteners driven into a hole or nut to hold parts together, classed by diameter, length, and head type.

Using the wrong length can crack plastic or miss the thread.

**Example:** An M3 x 8 mm screw has a 3 mm diameter and 8 mm length.

#### Script vs Policy vs Agent

A comparison of three ways to control an arm: fixed hand-written code, a learned model, or a language-model system that chooses tools.

Each suits different tasks and risks.

**Example:** A script repeats a fixed motion, a policy copes with variation in object placement, and an agent interprets a spoken request.

#### Self-Sourced Build

Building a robot by purchasing each part individually from various suppliers and printing others.

It can cost less and teaches sourcing skills but needs more care.

**Example:** Ordering servos from one site, a board from another, and printing the body at school.

#### Serial Bus Servo

A servo with its own microcontroller that receives digital commands over a shared two-way data line and reports back position, load, and temperature.

Many of them can be chained on one cable, each answering to a unique ID.

**Example:** Six STS3215 servos on one cable, each identified by a number from 1 to 6.

See also: STS3215 Servo, Device ID

#### Serial Communication

Sending data one bit at a time over a single wire or pair of wires, with sender and receiver agreeing on timing.

It is how a computer talks to servos with few wires.

**Example:** Sending command bytes down a USB cable to the servo bus.

#### Serial Manipulator

A robot arm whose links are connected one after another in a single chain from base to end effector.

Its forward kinematics reduces to multiplying one transform per joint in order.

**Example:** The SO-ARM101 is a chain from base through shoulder, elbow, and wrist to the gripper.

#### Serial Port

The software handle, such as `COM3` or `/dev/ttyUSB0`, through which a program sends and receives serial data.

Programs must open the right one to reach the arm.

**Example:** Passing `"/dev/ttyACM0"` to `serial.Serial` opens the connection to the follower arm.

#### Servo Bus Controller Board

A small circuit board that connects a computer's USB port to a servo bus and provides the half-duplex serial interface and power connection.

It is the hardware bridge between Python and the servos.

**Example:** A Waveshare-style bus servo adapter with a USB-C port and a screw terminal for the 5 V or 12 V supply.

#### Servo Compliance

The amount of give a servo allows around its target, determined by gains and dead zones, so it behaves like a spring rather than a rigid lock.

Some softness protects against shocks and makes contact gentler.

**Example:** A softer setting lets the gripper yield when it meets a block slightly off target.

#### Servo Horn

The attachment piece that mounts onto the servo's output shaft and carries the arm segment or gripper.

It transfers the servo's rotation to the link.

**Example:** A round plastic horn screwed to the shaft and bolted to the upper arm.

#### Servo Motor

An actuator that combines a motor, gearbox, position sensor, and control electronics so its shaft moves to and holds a commanded position.

Servos make hobby-grade arms practical because the control loop is built in.

**Example:** Commanding a servo to 2048 counts turns its shaft to the middle of its range.

#### Servo Not Found

A fault where a bus scan or command gets no reply from a servo.

Causes include missing power, wrong ID, wrong baud rate, or broken cable.

**Example:** Servo 4 does not answer a ping because a connector has pulled loose.

#### Servo Overheating

A condition where a servo's temperature rises dangerously, often from holding heavy loads or being blocked.

The servo may shut down or be damaged.

**Example:** A shoulder servo holding the arm outstretched for minutes reports 70 degrees Celsius.

#### Servo Preparation

The steps taken before assembly to make servos ready, such as assigning IDs, setting baud rate, and testing movement.

Doing it first avoids having to take the arm apart later.

**Example:** Connecting each servo alone to the controller and giving it its joint ID.

#### Servo Replacement

Removing a worn or failed servo and installing a new one, then restoring its ID, settings, and calibration.

Servos eventually wear out.

**Example:** Swapping the elbow servo, setting its ID to 3, and recalibrating.

#### Servo Testing

Running simple movements on a servo before installing it to confirm it works, centers correctly, and reads back values.

It catches faulty units early.

**Example:** Commanding a servo through its range while watching for grinding noises.

#### Servo Torque Margin

The amount by which a servo's available torque exceeds the torque needed, often shown as a ratio or percentage.

A comfortable margin avoids stalls and overheating.

**Example:** A servo rated for 3 N-m used at 1 N-m has a large margin.

#### Setting Baud Rate

Configuring a servo's serial speed so it matches the controller's.

All devices on one bus must agree.

**Example:** Changing a servo from a factory setting to 1,000,000 baud to match the rest.

#### Setting Servo IDs

Assigning a unique bus identifier number to each servo by writing to its ID register while it is connected alone.

It lets software address each joint separately.

**Example:** Setting the shoulder pan servo to 1, the shoulder lift to 2, and so on up to 6.

See also: Device ID

#### Shipping and Customs

The transportation of goods between locations and the border inspections, duties, and taxes that apply to international orders.

These add cost and delay that the sticker price hides.

**Example:** An import fee added when servos from overseas cross the border.

#### Shortcut Smoothing

A simple smoothing method that tries to connect two non-adjacent points directly and removes the points between if the shortcut is collision-free.

It shortens paths.

**Example:** Skipping three intermediate waypoints because a straight move is clear.

#### Shoulder

The joint or joints nearest the base that swing the whole arm, typically one rotating about the vertical axis and one lifting the upper arm.

Its motors carry the heaviest loads.

**Example:** On the SO-ARM101, `shoulder_pan` turns the arm left and right and `shoulder_lift` raises the upper arm.

#### Shutdown Procedure

The ordered steps followed to stop the system safely, such as returning home, releasing torque, and removing power.

It protects both the hardware and the people.

**Example:** Send the arm home, disable torque, close the port, and switch off the supply.

#### Sim-to-Real Gap

The difference between how a robot behaves in simulation and in the real world, caused by modeling errors in friction, timing, and sensors.

Skills learned virtually may fail on hardware.

**Example:** A policy that grips well in simulation drops the block on the real arm.

#### Simulation

Running a computer model of a robot and its environment to predict behavior without physical hardware.

It enables safe, fast testing.

**Example:** Playing a trajectory on a virtual arm before running it on the real one.

#### Simulation Mode

An operating mode in which commands drive a virtual arm instead of the real one.

It allows safe rehearsal of agent behavior.

**Example:** Running the agent against the simulator before connecting hardware.

#### Sine and Cosine

Trigonometric functions that give the vertical and horizontal components of a point on a unit circle at a given angle.

They appear in every arm geometry formula.

**Example:** A 10 cm link at 30 degrees reaches 10 * cos(30) = 8.66 cm horizontally.

#### Single-Joint Move

A motion command that changes just one joint while the others hold still.

It is the first movement learners test.

**Example:** Turning only the shoulder pan by 30 degrees.

#### Singular Pose

An arm configuration where the Jacobian loses rank, so certain end effector motions become impossible or require very large joint speeds.

Arms behave badly near them.

**Example:** A fully stretched arm that cannot extend further in that direction.

#### Singularity Avoidance

Techniques that steer the arm away from singular poses or reduce speeds near them.

They prevent wild joint motions.

**Example:** Switching to damped least squares when manipulability drops below a threshold.

#### Six-Axis Arm

An arm with six rotating joints, enough in principle to place its end effector at any position and orientation within reach.

It is the industrial standard layout that the larger reBot arm follows.

**Example:** An industrial welding arm with three joints in the wrist is a six-axis arm.

#### SLERP

Spherical linear interpolation, a way of smoothly blending between two orientations at constant angular speed along the shortest rotation.

It produces natural orientation changes.

**Example:** Turning the gripper smoothly from facing forward to facing down.

#### Slicer

Software that cuts a 3D model into layers and produces the printing path instructions for a printer.

Its settings decide quality, strength, and time.

**Example:** Loading an STL into a slicer, choosing PLA settings, and exporting the result.

#### Smooth Velocity Profile

A speed plan with gradual changes, such as an S-curve or minimum-jerk shape, that reduces abrupt acceleration.

It gives gentler motion and less mechanical stress.

**Example:** A speed curve that rises and falls like a bell shape.

#### SO-ARM100

An open-source six-motor desktop robot arm designed by The Robot Studio with Hugging Face, using STS3215 servos and printed parts, available as leader and follower arms.

It is the original of the family that this book builds on.

**Example:** A pair of SO-ARM100 arms used to collect demonstration data with LeRobot.

See also: SO-ARM101

#### SO-ARM100 vs SO-ARM101

A comparison of the two designs, covering wiring, assembly effort, gearing, and the changes made between versions.

It helps learners choose and understand older tutorials.

**Example:** The SO-ARM101 removes the need to route and solder some cables that the SO-ARM100 required.

#### SO-ARM101

The improved revision of the SO-ARM100, with simpler wiring, easier assembly, and revised leader gearing, using the same servo family and LeRobot software.

It is the primary low-cost platform of this book.

**Example:** An SO-ARM101 follower arm and leader arm built from a kit and calibrated through LeRobot.

#### Software E-Stop

An emergency stop implemented in code that commands all motion to cease, such as disabling torque or sending a stop command.

It is convenient but cannot be trusted alone, since the program can fail.

**Example:** Pressing a key in a script triggers a handler that disables torque on every joint.

#### Soldering

Joining metal parts by melting a filler metal, solder, around them so it cools into a strong electrical connection.

Used for wiring power leads and connectors.

**Example:** Soldering a power wire to a terminal on the distribution board.

#### Soldering Safety

Precautions for working with a hot soldering iron and molten solder, including ventilation, eye protection, and safe handling of hot tools.

Wire connections for the arm often involve soldering.

**Example:** Using a stand for the iron and working with a fume fan on.

#### Spare Parts

Extra components kept on hand to replace those that fail or break during use.

Classrooms need them because wear and mistakes are common.

**Example:** Two extra servos and a spare bus board in a drawer.

#### Speed Limit

A cap on how fast a joint or end effector may move, enforced in software or hardware.

Lower speeds give people time to react and reduce impact forces.

**Example:** Limiting joint speeds to 30 degrees per second while testing a new script.

#### Stall Torque

The maximum torque a motor can produce when its shaft is held still and not allowed to turn.

It is the headline figure on a servo's datasheet and is not safe to sustain.

**Example:** A servo's datasheet lists a stall torque of 30 kg-cm at 12 V, reached only while blocked.

#### Standard Library

The collection of modules that ships with Python itself and needs no separate installation.

Modules such as `struct`, `time`, `json`, and `argparse` do much of the work in the early chapters.

**Example:** `import json` loads a calibration file without installing anything extra.

#### Startup Procedure

The ordered steps followed to start the system safely, such as checking the workspace, powering on, connecting, and homing.

A routine prevents surprises.

**Example:** Clear the table, switch on power, run the connect script, and move to home.

#### State Machine

A model in which a program is in exactly one named state at a time and changes state on defined events or conditions.

It organizes multi-step tasks and makes error handling clear.

**Example:** States such as `approach`, `grasp`, `lift`, `place`, and `home` for a pick-and-place routine.

#### Static Torque Estimate

A calculation of the torque each joint needs to hold the arm still against gravity at a given pose.

It checks that servos are strong enough.

**Example:** Estimating the shoulder torque from link masses and distances.

#### Status Packet

The reply a servo sends back after an instruction, carrying its ID, an error byte, and any requested data.

Reading it confirms the command succeeded.

**Example:** After a read instruction the servo returns a packet containing its present position bytes.

#### STEP File

A 3D model format that stores precise solid geometry, rather than a triangle mesh, and can be edited in CAD software.

It lets users modify dimensions before printing.

**Example:** Opening a STEP file in CAD to enlarge a screw hole by 0.2 mm.

#### STL File

A common 3D model format describing a surface as a mesh of triangles, widely used as input to slicers.

Arm repositories publish parts in it.

**Example:** Downloading `Base.stl` from the repository and loading it into the slicer.

#### Stop Flag

A shared variable that one part of a program sets to ask another running part, such as a loop or thread, to finish.

It offers a clean way to end motion.

**Example:** `threading.Event()` is set when the user presses Q, and the loop checks it each cycle.

#### Stop Tool

An agent tool that immediately halts motion, usually by disabling torque or commanding a stop.

It lets a user or agent interrupt activity.

**Example:** Sending stop in a chat message cancels the current motion.

#### Straight-Line Motion

Movement of the end effector along a straight line in Cartesian space.

Straight lines in space need coordinated, non-uniform joint motion.

**Example:** Lowering a gripper directly down onto a block.

#### Strain Relief

A feature that absorbs pulling and bending forces at a cable's connection point so the joint is not stressed.

It extends cable life.

**Example:** Looping a wire and clipping it so tugging does not pull on the connector.

#### Struct Module

A standard library module that converts between Python values and packed binary bytes according to a format string.

It decodes multi-byte register values from a servo.

**Example:** `struct.unpack("<H", data)` turns two bytes into an unsigned 16-bit integer.

#### STS3215 Servo

A serial bus servo made by Feetech, with a magnetic encoder and metal gears, used as the joint motor in the SO-ARM100 and SO-ARM101.

Knowing its limits, such as its 4096-count resolution, shapes every driver in this book.

**Example:** The follower arm uses six of them, each rated for 7.4 V or 12 V depending on the version bought.

#### Substitute Parts

Alternative components that can replace specified ones with comparable function, voltage, and dimensions.

They help when stock runs out, but compatibility must be checked.

**Example:** Using a different brand of 5 V power supply with the same connector and current rating.

#### Success Rate

The fraction of attempts in which a task is completed correctly.

It is the main measure of a policy or agent.

**Example:** 17 of 20 block placements succeed, a rate of 85 percent.

#### Supervised Operation

Running a robot only while a trained person watches and can intervene immediately.

New code always starts this way.

**Example:** An instructor stands next to the arm with a hand near the power switch during first tests.

#### Support Material

Temporary structure printed beneath overhangs so they do not sag, removed after printing.

It affects finish and print time.

**Example:** Tree supports under a hole that faces sideways, snapped off afterward.

#### Task Decomposition

Breaking a large goal into smaller, manageable subtasks.

It makes complex requests feasible.

**Example:** Splitting tidy the desk into pick the pen, place it in the cup, and repeat for each item.

#### Task Planning

Deciding the ordered steps needed to reach a goal.

It lets agents handle multi-step jobs.

**Example:** Planning to open the gripper, approach, grasp, lift, move, and release.

#### Teleoperation

Controlling a robot remotely in real time by a human operator, whose movements are transmitted to the machine.

It is how learning-from-demonstration data is collected.

**Example:** Driving the follower arm by moving the leader arm across the table.

#### Teleoperation Loop

The repeating cycle that reads the leader arm's joint positions and writes them to the follower arm.

It is the core of demonstration data collection.

**Example:** At 30 Hz, read six leader angles and send six targets to the follower.

#### Temperature Sensing

Reading the internal temperature of a motor or servo to detect overheating before damage occurs.

Hot servos reduce torque and may shut down.

**Example:** Polling the temperature register and warning the user when it exceeds 60 degrees Celsius.

#### Terminal

A text-based window in which a user types commands to the operating system and reads the text the commands print back.

Installing packages, running scripts, and finding serial ports all happen here.

**Example:** Running `ls /dev/tty*` in the terminal on macOS or Linux lists the serial devices, including the arm's USB adapter.

#### Test Coverage

A measure of how much of the code is executed when the tests run.

Low coverage hides untested paths.

**Example:** A report showing 85 percent of lines exercised.

#### Test Fixtures

Reusable setup code that supplies tests with objects or data they need, defined with `@pytest.fixture`.

They keep tests short and consistent.

**Example:** A fixture returns a `FakeArm` that every test uses.

#### Testing Safety Limits

Writing tests that confirm commands outside allowed ranges are rejected or clipped.

It verifies protections work before they matter.

**Example:** A test that sends 200 degrees to the elbow and expects a `JointLimitError`.

#### Threads

Independent sequences of execution within a single program that run concurrently.

They let a robot control loop run while another part handles user input.

**Example:** A background thread streams positions while the main thread waits for a keypress.

#### Time Module

The standard library module that provides clock readings, timing measurements, and delays.

It paces control loops.

**Example:** `time.sleep(0.02)` waits 20 ms.

#### Time Scaling

Changing how fast a planned path is traversed without altering its shape.

It adjusts speed to fit limits.

**Example:** Stretching a 2 s trajectory to 4 s to halve speeds.

#### Timing Jitter

Variation in the time between loop cycles that should be evenly spaced.

It makes motion uneven.

**Example:** A 20 ms loop that sometimes takes 35 ms because the computer is busy.

#### Tool Calling

A model capability in which it outputs a structured request to run a named function with given arguments, rather than only plain text.

It is how an agent causes real actions.

**Example:** The model returns `move_to_pose` with x, y, and z values.

#### Tool Schema

A structured description of a tool's name, purpose, and parameters with their types, given to the model so it can call the tool correctly.

Clear schemas reduce wrong calls.

**Example:** A JSON schema saying `angle` is a number between 0 and 180.

#### Tool Server

A service that hosts a set of tools and runs them on request from clients such as agents.

It separates safety logic and hardware access from the model.

**Example:** A small web service that exposes the arm's functions.

#### Torque

The turning force produced about an axis, measured as force multiplied by distance, in units such as newton-meters or kilogram-centimeters.

Torque determines what loads a joint can hold or lift.

**Example:** A 5 kg-cm servo can hold a 1 kg weight on a 5 cm lever.

#### Torque Enable

A servo setting that switches the motor's drive on or off; when off, the joint moves freely by hand.

It is the quickest way to release or lock a joint in software.

**Example:** Writing 0 to the torque-enable register lets the leader arm be moved by hand.

See also: Torque Release

#### Torque Limit

A setting that caps the maximum torque or output a servo may apply.

It prevents crushing objects and protects the gears.

**Example:** Reducing the gripper servo's limit to 40 percent so it does not squeeze a paper cup flat.

#### Torque Release

Switching off a servo's holding torque so the joint becomes free to move.

It lets a person move a stuck arm, though gravity may then drop the limbs.

**Example:** Releasing torque on the leader arm so it can be moved by hand while torque stays on for the follower.

#### Total Build Cost

The full cost of a finished build, including parts, shipping, taxes, tools, and consumables.

It supports honest comparison between platforms.

**Example:** Servos plus shipping, filament, and a power supply add up to a total near the kit's advertised price.

#### Totaling Costs in Python

Using a short program to read a parts list and add up the quantity times price for every item.

It turns a bill of materials into a total build cost.

**Example:** A loop over `csv.DictReader` rows that adds `qty * price` into a running sum.

#### Tracking Error

The difference between a commanded position and the actual position at the same moment.

Large errors indicate lag, load, or limits.

**Example:** The elbow lags its target by 3 degrees during fast motion.

#### Training a Policy

Adjusting a model's parameters using data so its predicted actions match demonstrations.

This is how the arm gains learned skills.

**Example:** Running a training script for hours on a GPU using recorded episodes.

#### Training Loss

A number measuring how far a model's predictions are from the desired outputs, which training tries to reduce.

Watching it reveals whether learning is progressing.

**Example:** A loss curve that decreases over training steps.

#### Trajectory

A path through space together with timing, specifying where the arm should be at each moment.

It defines both position and speed over time.

**Example:** A list of joint angles sampled every 20 ms over three seconds.

#### Transform Chain

The product of successive transforms, one per link, that carries a point from the last link back to the base.

It is the structure of forward kinematics.

**Example:** `T = T1 @ T2 @ T3` for a three-joint arm.

#### Trapezoidal Velocity Profile

A speed plan that accelerates at a constant rate, cruises at a fixed speed, then decelerates at a constant rate, forming a trapezoid when graphed.

It avoids sudden jumps in speed.

**Example:** A joint speeds up for 0.5 s, cruises for 1 s, and slows for 0.5 s.

#### Troubleshooting

A structured process of finding and fixing the cause of a fault by testing hypotheses, from simplest to most complex.

Hardware projects always need it.

**Example:** Checking power, then cables, then IDs, then software when a joint will not move.

#### Try Finally

A Python structure where the `finally` block always executes after the `try` block, whether or not an error occurred.

It ensures torque is released and ports closed.

**Example:** Wrapping a motion loop in `try:` and calling `arm.disconnect()` in `finally:`.

#### TTL Half-Duplex Serial

A serial link that uses logic-level voltages and a single data wire shared for both sending and receiving, so only one side talks at a time.

The STS3215 servo bus works this way.

**Example:** Servos listen on the same wire the controller uses to send, and answer only after being addressed.

#### Two-Link Arm

A planar arm with two links and two revolute joints, the simplest model for learning kinematics.

Closed-form formulas exist for it.

**Example:** An arm with 12 cm and 10 cm links and shoulder and elbow joints.

#### Type Hints

Annotations that tell readers and tools the expected types of variables, parameters, and return values in Python code.

They catch mistakes early and document interfaces.

**Example:** `def move_joint(joint_id: int, angle_deg: float) -> None:`.

#### Typed Parameters

Tool inputs with declared types, such as number, string, or enumerated choice, so wrong kinds of input are rejected.

They make calls predictable.

**Example:** `speed: float` between 0 and 1, instead of free text.

#### UART

A hardware circuit that sends and receives bytes asynchronously as framed bits, with agreed speed and no shared clock line.

It is the foundation of the servo bus and many USB adapters.

**Example:** A microcontroller's UART transmits the byte 0xFF as a start bit, eight data bits, and a stop bit.

#### Unit Conversion

Translating a quantity from one unit to another using a known factor.

Mistakes in conversion cause arms to move to the wrong place.

**Example:** Converting 2048 raw counts to degrees with `raw * 360 / 4096`.

#### Unit Test

An automated test that checks a small piece of code, such as one function, in isolation.

It catches bugs before hardware is involved.

**Example:** A test that confirms 2048 counts converts to 180 degrees.

#### Unreachable Target

A requested position that lies outside the arm's workspace, so no joint values can achieve it.

Good code detects this and reports it.

**Example:** A target 50 cm away for an arm that reaches 30 cm.

#### Untrusted Input

Data from sources not controlled by the system's owner, which may be wrong or malicious.

Agents must treat it as data, not as commands.

**Example:** Text read from a web page or a message from an unknown sender.

#### URDF Model

An XML file format describing a robot's links, joints, shapes, and limits for use by simulators and planners.

It is the standard way to share arm models.

**Example:** Loading the SO-ARM101 URDF in a physics simulator.

#### USB Serial Adapter

A small device that turns a computer's USB port into a serial port that can talk to TTL or RS-485 devices.

It bridges the laptop to the servo bus.

**Example:** The servo bus controller board's USB-C connection appears as `/dev/ttyACM0`.

See also: Serial Port, Servo Bus Controller Board

#### USB Webcam

A low-cost camera that connects over USB and presents itself to the computer as a video device.

It is the usual choice for desk arms.

**Example:** A 1080p webcam on a stand recording the workspace at 30 frames per second.

#### Vector

A quantity with both magnitude and direction, written as a list of numbers.

Positions, velocities, and forces are vectors.

**Example:** `[0.2, 0.0, 0.1]` is a position vector in meters.

#### Velocity Feedback

Measured information about how fast a joint is turning, from the sensor or from the change in position over time.

It enables smooth motion and damping.

**Example:** A motor reports 2.0 rad/s in its status frame.

#### Velocity Kinematics

The relationship between joint speeds and end effector speed, described by the Jacobian.

It supports smooth Cartesian control.

**Example:** Computing the joint speeds that give the gripper a velocity of 5 cm/s.

#### Velocity Limit Scaling

Slowing an entire motion proportionally so that no joint exceeds its allowed speed.

It preserves path shape while enforcing limits.

**Example:** Scaling time by 1.4 because the shoulder would otherwise move 40 percent too fast.

#### Vendor Documentation

The manuals, guides, and software notes supplied by a seller or manufacturer for their products.

It explains setup steps, though quality varies.

**Example:** A PDF with register tables and wiring diagrams from the servo maker.

#### Vendor SDK

A software kit supplied by a hardware maker that wraps the device's protocol in ready-made functions or classes.

It shortcuts driver work but ties code to one manufacturer.

**Example:** Using the manufacturer's Python package to enable a motor and set its mode instead of building raw frames.

#### Via-Point Trajectory

A trajectory that passes through chosen intermediate points between start and end.

It lets planners steer around obstacles.

**Example:** Lifting the gripper to a point above the table before moving across.

#### Virtual Environment

An isolated folder holding its own Python interpreter and installed packages, so one project's library versions do not conflict with another's.

It keeps the LeRobot installation separate from other Python work on the same computer.

**Example:** Running `python -m venv .venv` and then activating it gives the arm project its own private copy of `pyserial`.

#### Vision-Language Model

A model that accepts both images and text and produces text answers about what it sees.

It lets an agent describe and locate objects in camera images.

**Example:** Asking the model which of the blocks in the image is red.

#### Voltage

The electrical potential difference between two points, measured in volts, which pushes current through a circuit.

Supplying the wrong voltage can damage servos.

**Example:** A 12 V supply drives the STS3215 12 V variant, while a 7.4 V servo needs a lower supply.

#### Voltage Drop

The reduction in voltage along a wire or connector caused by resistance as current flows through it.

Long thin wires can leave distant servos underpowered.

**Example:** A 2 A load on a wire with 0.5 ohms of resistance loses 1 V along the way.

#### Voltage Rating

The range of supply voltage a component is designed to accept without damage or malfunction.

Exceeding it can destroy electronics.

**Example:** A servo marked 6 V to 8.4 V should not be connected to a 12 V supply.

#### Warping

A defect where the corners of a print lift off the bed as the plastic cools and shrinks unevenly.

It ruins the fit of arm parts.

**Example:** A long base plate curling upward at the edges.

#### Watchdog Timer

A timer that must be regularly reset by the running program, and that triggers a safe action such as stopping motion if the program stops responding.

It guards against frozen software.

**Example:** A script that must send a heartbeat every 200 ms or the motors disable.

#### Waypoint

A specific pose, either joint values or an end-effector position, that the arm is told to pass through or stop at during a motion.

Chains of them describe tasks.

**Example:** A point 5 cm above a block where the arm pauses before descending.

#### Waypoint List

An ordered collection of waypoints that defines a motion sequence.

It is stored and replayed to repeat tasks.

**Example:** `[home, above_block, at_block, lift, drop_zone]`.

#### Wear and Lubrication

The gradual loss of material from moving parts, and the use of lubricants to reduce friction and slow it.

Attention extends the life of gears and joints.

**Example:** Adding a small amount of plastic-safe grease to an exposed gear.

#### Wire Gauge

A standard number describing a wire's thickness, where a smaller AWG number means a thicker wire able to carry more current.

Thin wires overheat and drop voltage on high-current motors.

**Example:** 22 AWG suits small signal runs, while 16 AWG is better for a high-current motor supply.

#### With Statement

The Python statement that uses a context manager to run a block between setup and automatic cleanup.

It replaces manual open and close calls.

**Example:** `with open("calibration.json") as f:` closes the file automatically.

#### Workspace

The set of all positions the end effector can reach, bounded by link lengths and joint limits.

Planning a task starts by checking that the target lies inside it.

**Example:** A block 40 cm away is outside the workspace of an arm that reaches only 30 cm.

#### Workspace Limits

Boundaries on where the arm may move, set in software to keep it away from obstacles, people, and fragile items.

They shrink the area of possible harm.

**Example:** A box in front of the base outside of which no target is accepted.

#### Workspace Sampling

Estimating an arm's workspace by computing end effector positions for many joint combinations.

It reveals reach shape without algebra.

**Example:** Looping through joint angles on a grid and recording each forward kinematics result.

#### Wrist

The joints near the end of the arm that orient the end effector without much changing its position.

Wrist joints are light, so smaller motors serve them.

**Example:** The SO-ARM101 wrist flex tilts the gripper up and down, and wrist roll rotates it about its own axis.

#### Writing a Register

Sending a value to a specific address in a device's memory to change a setting or issue a command.

It is how programs set goal positions, speeds, and torque enable.

**Example:** Writing 2048 to the goal-position register turns the joint to its midpoint.

#### Writing Target Positions

Sending goal angles to the joints so they move to the commanded pose.

It is the basic output action of an arm controller.

**Example:** `arm.write_positions([0, 30, 60, 0, 0, 10])`.

#### Zero Offset

The stored difference between a sensor's raw zero and the chosen physical zero position of a joint.

Subtracting it converts raw readings to meaningful angles.

**Example:** A raw reading of 2100 at the straight pose gives an offset of 2100 counts.

#### Zeroing

Setting the current joint position as the reference zero angle for a motor or encoder.

It defines where angle zero lies for later commands.

**Example:** Placing the arm in its straight pose and sending each actuator a command to treat that spot as zero.

See also: Zero Offset

