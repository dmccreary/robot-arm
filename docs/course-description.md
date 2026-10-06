---
title: Course Description for Controlling a Robot Arm
description: A detailed course description for Controlling a Robot Arm including overview, topics covered and learning objectives in the format of the 2001 Bloom Taxonomy
quality_score: 96
---

# Course Description for Controlling a Robot Arm

## Title

Controlling a Robot Arm: Source, Build and Control

## Subtitle

Learn Python by Sourcing, Building, and Programming Low-Cost Robot Arms with the SO-ARM100 and the Seeed Studio reBot-DevArm, and Connecting Them to AI Agents

## Overview

This is a **Python programming book that happens to move a real robot**. Every
chapter turns an idea into Python code that reads a sensor, moves a joint, or
makes a decision, and then shows the result on a physical arm. The reader
starts with a bill of materials and ends with an AI agent that can safely
command a robot arm through Python code the reader wrote.

The book follows one learning path across two open-source desktop arms at
opposite ends of the hobbyist-to-developer range:

- **SO-ARM100** (and its successor, the SO-ARM101) — a 3D-printed,
  six-degree-of-freedom arm designed by The Robot Studio with Hugging Face. It
  is built in leader/follower pairs around STS3215 serial bus servos and works
  with the open-source LeRobot library. It is the low-cost entry point: cheap
  to source, easy to print, and well supported for teleoperation and imitation
  learning.
- **reBot-DevArm** (B601 series) from Seeed Studio — an open-source six-axis arm
  plus a parallel gripper, built around CAN-bus actuators (Damiao motors in the
  B601-DM variant, RobStride in the B601-RS variant). It has a higher payload
  and reach, and is compatible with ROS, LeRobot, NVIDIA Isaac Sim, and
  Pinocchio. It is the step up for readers who need more capability and a
  more industrial software stack.

Comparing the two arms lets the reader see which design decisions (actuators,
buses, power, kinematics, software) are essential to any arm and which are
specific to one platform. It also motivates the book's central Python skill:
writing a small **hardware abstraction layer** (a Python class) so the same
program can drive either arm.

### How the Python Is Taught

The reader is assumed to have **only the Python from the Learning Python
course**. Anything beyond that is introduced just in time, inside the lab that
needs it, using these rules:

1. **One new Python idea per lab.** A lab may introduce a new library or
   language feature, never several at once.
2. **Simulate first, then power on.** Each program runs against a software
   "fake arm" before it touches hardware, so mistakes are cheap and safe.
3. **Small, readable programs.** Code listings stay short, use clear names, and
   build on code from earlier labs rather than starting over.
4. **Use the high-level library first.** The reader drives the arms with
   LeRobot's Python interface and vendor SDKs before seeing what happens
   underneath. Robotics frameworks that need deep background (ROS 2, Isaac Sim,
   Pinocchio, and neural-network training for imitation learning) are
   presented as **guided tours with working example code**, not as skills the
   reader must master.
5. **Math is computed, not memorized.** Trigonometry and geometry appear as
   short Python functions the reader runs, plots, and experiments with.

## Audience

- **Primary:** middle-school students, high-school students, and adults, with
  a **minimum age of 12**, who completed the Learning Python course and want a
  motivating project that uses Python to control a physical machine.
- **Secondary:** makers, hobbyists, and self-taught roboticists who can write
  basic Python and want to build and program their first arm.
- **Tertiary:** middle-school, high-school, and undergraduate students in
  robotics, computer science, or AI classes that need a low-cost lab platform,
  and the teachers, makerspace leaders, and club mentors who plan the parts
  order for them.
- **Also useful to:** software developers and AI practitioners who want to give
  an AI agent a physical body and need to learn the hardware side.

**Supervision note:** the minimum age is 12. Readers under 16 should work with
an adult when using 3D printers, soldering irons, or mains-powered supplies,
and when working with the higher-voltage reBot-DevArm. The book flags every
such step.

## Prerequisites

The reader must have completed the **Learning Python** course or be able to do
everything in the list below. The book reviews each item briefly the first time
it is used.

**Python skills assumed (all from Learning Python):**

- Variables, numbers, strings, f-strings, and `input()` / `print()`.
- `if`/`elif`/`else`, `for` and `while` loops, and `range()`.
- Writing functions with parameters, return values, and docstrings.
- Lists, tuples, dictionaries, sets, and list comprehensions.
- Importing and using modules such as `math`, `random`, and `time`.
- Reading and writing text files with `with open(...)`, and reading JSON.
- Handling errors with `try`/`except` and reading a traceback.
- Defining a simple class with `__init__`, attributes, methods, and basic
  inheritance.
- Making a basic plot with matplotlib and basic array math with NumPy.
- Using the Python REPL, running a script from the terminal, and installing a
  package with `pip` inside a virtual environment.

**Other prerequisites:**

- Basic algebra and the idea of an angle. Sine and cosine are reviewed with
  Python code in the first kinematics lab.
- Willingness to follow safety instructions when working with motors and
  power supplies.

**Not assumed.** The book does not assume any experience with robotics,
electronics, 3D printing, soldering, ROS, machine learning frameworks,
asynchronous programming, or large language models. Each is introduced
when first needed.

## Python Skills Ladder

New Python skills are introduced in this order, each in the lab that first
needs it. This ladder is the core of the book's design.

| Stage | New Python skill | First used for |
|-------|------------------|----------------|
| 1 | Review: `pip`, virtual environments, project folders | Setting up the arm software |
| 2 | Serial ports and bytes with `pyserial` and the vendor SDK | Pinging a servo and reading its position |
| 3 | Configuration with JSON files and `argparse` | Saving servo IDs, limits, and calibration |
| 4 | Classes for hardware: `Arm` and `Joint`, and a fake arm for testing | A single program that drives either arm |
| 5 | `dataclass` and light type hints | Describing poses, joint limits, and commands |
| 6 | `try`/`finally` and context managers (`with`) | Always releasing torque and closing the port safely |
| 7 | Timing loops with `time` and a fixed control rate | Smooth motion and trajectories |
| 8 | `math` and NumPy for angles and vectors | Forward and inverse kinematics |
| 9 | Plotting with matplotlib | Visualizing trajectories and workspace |
| 10 | Logging with the `logging` module and CSV output | Debugging and audit trails |
| 11 | Testing with `pytest` and mock objects | Verifying safety limits without hardware |
| 12 | Camera frames with OpenCV and NumPy | Finding an object's position |
| 13 | Using web APIs and JSON requests | Calling a vision-language model |
| 14 | Functions as tools: typed parameters, validation, docstrings | Exposing arm commands to an AI agent |
| 15 | Threads and a stop flag (introductory only) | A responsive emergency stop |

Asynchronous programming (`async`/`await`), decorators, and metaclasses are
**not** required. Where a library uses them, the book provides a ready-made
wrapper.

## Why This Book Matters

Python is the language of robotics research and of AI, and the arms in this
book are among the lowest-cost ways to run real robot-learning code. A reader
who finishes the book has written code that crosses the line from software to
hardware, where mistakes have physical consequences. That experience teaches
careful programming habits (validation, testing, logging, safe shutdown) that
carry into every later project.

AI agents are also beginning to act in the physical world. Letting an agent
call Python functions that move an arm is a concrete, low-risk setting in which
to learn what makes agent control useful and what makes it dangerous. Readers
learn to build the safety layer, not just the demo.

## Topics Covered

The book is organized into ten main topic areas. Each area lists the concepts
it introduces and the Python skills (from the ladder above) that it uses.

1. **Robot arm fundamentals** — links, joints, degrees of freedom, end
   effectors, workspace, payload, repeatability, reach, and singular poses.
   *Python:* describing an arm as data (dictionaries, then a class).

2. **Actuators, sensors, and electronics** — hobby servos, serial bus servos,
   and CAN-bus actuators; gear ratios, torque, encoders, position feedback;
   TTL half-duplex serial, UART, USB adapters, CAN bus, device IDs, and baud
   rates; power supplies, voltage and current, wiring, fuses, and emergency
   stops. *Python:* serial communication, bytes, and reading a servo's state.

3. **Safety** — pinch points, torque and speed limits, runaway behavior, safe
   work envelopes, supervising a powered arm, safe power-up and shutdown, and
   emergency stops. *Python:* limit checking, `try`/`finally`, and context
   managers.

4. **Sourcing parts** — reading a bill of materials; kits versus self-sourced
   builds; official sellers, distributors, and marketplaces; lead times;
   budgeting; counterfeit and incompatible parts; SO-ARM100 versus SO-ARM101
   revisions; 3D printers, materials, and print settings; fasteners, cables,
   and tools. *Python:* a bill-of-materials cost calculator using dictionaries,
   CSV or JSON files, and sorting.

5. **Building and calibrating the SO-ARM100** — reading an open-source
   repository, preparing servos (IDs and baud rates), assembling the follower
   and leader arms, cable routing, calibration, and troubleshooting.
   *Python:* configuration files, calibration scripts, and a servo-testing tool.

6. **Building and calibrating the reBot-DevArm** — the B601-DM and B601-RS
   variants, CAN-bus configuration, higher-voltage power distribution,
   assembly, zeroing, calibration, and a side-by-side comparison with the
   SO-ARM100. *Python:* a hardware abstraction class that drives both arms.

7. **Motion programming in Python** — reading joint positions, joint-space
   moves, speed and acceleration limits, smooth trajectories and interpolation,
   control loops and timing, gripper control, pick-and-place routines, and
   teleoperation with a leader and follower arm. *Python:* classes, timing
   loops, NumPy, and matplotlib plots.

8. **Kinematics and simulation** — forward kinematics, inverse kinematics,
   multiple solutions, unreachable targets, Cartesian moves, and testing code
   in simulation before using hardware. *Python:* `math`, NumPy, and a fake arm
   for testing. Robot-model formats (URDF) and simulators are presented as
   guided tours.

9. **Perception and learning from demonstration** — cameras and calibration,
   finding colored objects, converting image coordinates to arm coordinates,
   recording demonstration episodes, datasets, and training and evaluating an
   imitation policy. *Python:* OpenCV, NumPy, and LeRobot's recording and
   training scripts. Training internals are presented as a guided tour.

10. **AI agents that control the arm** — the agent loop (perceive, plan, act,
    observe); OpenClaw (installation, messaging interfaces, and skills);
    writing a robot-arm skill with bounded, validated commands; natural-language
    control; local versus cloud agents; combining an agent planner with
    LeRobot execution; other agent interfaces such as the Model Context
    Protocol (MCP) and ROS 2 bridges; designing tools for agents; vision-language
    models as perception; task planning and replanning; safety guardrails
    (workspace limits, speed limits, command validation, dry-run mode,
    confirmations, hardware emergency stop, and audit logs); risks specific to
    agents (ambiguous instructions, hallucinated tool calls, and prompt
    injection); testing and evaluating agent-controlled systems; and deploying
    and operating the result. *Python:* functions as tools, type hints,
    validation, logging, `pytest`, and web API calls.

Chapters on classroom and makerspace use (parts ordering for groups, lab
schedules, assessment) and on next steps (bimanual setups, mobile manipulation,
larger arms, contributing to open-source projects) close the book.

## Topics Not Covered

- Designing a robot arm from scratch, including custom mechanical design, PCB
  design, and custom firmware.
- Advanced control theory such as dynamics-based, force, and impedance control.
- Training large foundation models for robotics, or writing neural networks
  from scratch.
- Mastery of ROS 2, Isaac Sim, or Pinocchio (these are guided tours only).
- Asynchronous programming, decorators, metaclasses, and other advanced Python
  language features.
- Industrial robot-arm certification and safety-standards compliance.
- Humanoid robots and mobile bases, other than as pointers for next steps.
- Web development, databases, and cloud deployment beyond calling an API.

## Interactive Elements (MicroSims)

The book uses interactive simulations to make abstract ideas concrete. Planned
MicroSims include:

- Joint and link explorer showing degrees of freedom and workspace.
- Two-link forward kinematics playground, with a six-joint extension.
- Inverse kinematics solver showing multiple solutions and singularities.
- Servo versus CAN-actuator comparison chart.
- Bill-of-materials cost calculator for the SO-ARM100 and reBot-DevArm.
- Power budget and wire-gauge calculator.
- Bus topology diagrams for serial-bus and CAN-bus wiring.
- Serial packet explorer that shows the bytes sent to a servo.
- Calibration walk-through with a virtual arm.
- Trajectory profile plotter (trapezoidal versus smooth velocity).
- Python-in-the-browser arm sandbox with a fake arm for first programs.
- Agent loop visualizer: perceive, plan, act, observe.
- Tool-call and safety-layer flow diagram for an agent-driven arm.
- Imitation-learning data pipeline diagram.

## Learning Outcomes

After completing this book, readers will be able to demonstrate the following
competencies.

### Remember

- **Name** the parts of a robot arm and **define** degrees of freedom,
  workspace, payload, and repeatability.
- **List** the major components in the SO-ARM100 and reBot-DevArm bills of
  materials.
- **Recall** the actuator type, communication bus, and supply voltage each arm
  uses.
- **State** the safety rules for working with a powered arm.
- **Identify** the Python libraries used in the book (`pyserial`, NumPy,
  matplotlib, OpenCV, `pytest`, LeRobot) and the job each does.
- **Recall** the steps in the agent loop and the purpose of an agent skill or
  tool.

### Understand

- **Explain** how serial bus servos and CAN-bus actuators differ in wiring,
  addressing, and speed.
- **Explain** what calibration does and why a miscalibrated arm misbehaves.
- **Describe** the difference between joint-space and Cartesian control.
- **Explain** how forward and inverse kinematics relate and why inverse
  kinematics can have several solutions or none.
- **Describe** how a Python class can hide hardware differences behind one
  interface.
- **Explain** why `try`/`finally` and context managers matter when a program
  controls a motor.
- **Explain** why the leader/follower arrangement produces useful training
  data.
- **Describe** how an agent framework such as OpenClaw calls Python functions
  to act in the physical world.

### Apply

- **Source** a complete parts list for an arm and place an order within a
  budget.
- **Print**, assemble, wire, and calibrate an SO-ARM100.
- **Configure** the actuators and software for a reBot-DevArm.
- **Write** Python programs that read joint state, move the arm along a planned
  path, and run a pick-and-place routine.
- **Implement** forward kinematics for a two-link arm in Python and **plot** the
  workspace.
- **Write** a Python class that drives a real arm and a fake arm through the
  same interface.
- **Use** `logging` and `pytest` to record and verify a program's behavior
  without hardware.
- **Teleoperate** an arm with a leader arm and **record** a dataset.
- **Install** OpenClaw and **write** a skill that exposes arm commands to an
  agent.

### Analyze

- **Compare** the two arms on cost, payload, reach, accuracy, software support,
  and assembly effort.
- **Diagnose** a failing arm from symptoms (communication errors, jitter,
  overheating, drift) by isolating power, bus, mechanical, and software causes.
- **Trace** a Python command from a function call through the library, bus, and
  motor to the physical motion.
- **Break down** an agent-driven task into perception, planning, tool-call, and
  safety-check stages and **identify** where failures arise.
- **Analyze** the risks of giving an AI agent control of physical hardware,
  including prompt injection and hallucinated commands.
- **Examine** log files to find why a motion failed.

### Evaluate

- **Judge** whether a kit, a self-sourced build, or a different arm best fits a
  given budget, classroom, or project.
- **Assess** a safety design for an agent-controlled arm and decide whether it
  is adequate for the intended setting.
- **Critique** a robot-control program for missing limit checks, unsafe
  shutdown behavior, and unclear names.
- **Evaluate** the success rate and repeatability of a scripted routine, a
  learned policy, and an agent-driven task.
- **Decide** when a task should use a fixed script, a learned policy, or an AI
  agent, and justify the choice.

### Create

- **Design** and **build** a complete agent-controlled arm system: hardware,
  Python control library, tool interface, safety layer, tests, and logging.
- **Create** a reusable Python package that drives both arms through one
  interface.
- **Create** a custom OpenClaw skill (or an equivalent tool interface for
  another agent framework) with bounded, validated commands.
- **Design** an original multi-step project, such as a desk assistant that
  sorts objects, and **document** it so others can reproduce it.
- **Produce** a reusable parts list, build guide, and test plan for a classroom
  set of arms.

**Capstone ideas:** a chat-controlled desk arm; a color-sorting arm that uses a
camera; a leader/follower data-collection station; an agent-driven arm with a
complete safety layer and test suite.

## Hardware and Software Used

| Item | Details |
|------|---------|
| Arm 1 | SO-ARM100 (SO-ARM101 differences noted), 6 DOF per arm, STS3215 serial bus servos, leader/follower pair |
| Arm 2 | Seeed Studio reBot-DevArm B601 series, 6 axes plus parallel gripper, CAN-bus actuators |
| Fabrication | FDM 3D printer, hand tools, soldering or crimping tools as needed |
| Computer | macOS, Linux, or Windows with WSL; an optional edge AI computer for local agents |
| Camera | A USB webcam for the perception chapters |
| Python libraries | `pyserial` or vendor SDKs, NumPy, matplotlib, OpenCV, LeRobot, `pytest` |
| Agent tools | OpenClaw; an LLM or vision-language model service (cloud or local) |
| Optional tours | ROS 2, a physics simulator |

Specifications of both arms, software versions, and prices change often. The
book links to the official repositories and vendor pages as the source of truth
and notes the date each fact was last checked.

## Estimated Scale

- 14 to 18 chapters, each with at least one hands-on Python lab.
- Roughly 300 to 450 concepts in the learning graph.
- Every build and programming lab includes a fake-arm version that runs without
  hardware, so readers can complete the Python work even before their arm
  arrives.
