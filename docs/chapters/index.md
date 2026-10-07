# Chapters

This textbook is organized into 19 chapters covering 537 concepts. Chapter 19 is optional and is marked as advanced.

## Chapter Overview

1. [Setting Up Python for Robotics](01-python-setup-for-robotics/index.md) - Reviews Learning Python and adds the tooling every lab uses: virtual environments, pip, packages, JSON configuration, command-line arguments, and git.
2. [Anatomy of a Robot Arm](02-anatomy-of-a-robot-arm/index.md) - Introduces links, joints, degrees of freedom, workspace, payload, and repeatability, plus leader and follower arms and open-source desktop arms.
3. [Electricity, Power, and Safety Basics](03-electricity-power-and-safety/index.md) - Covers voltage, current, power supplies, and wiring, together with the core safety habits: pinch points, work envelopes, emergency stops, and supervision.
4. [Serial and CAN Communication](04-serial-and-can-communication/index.md) - Explains how a computer talks to motors using UART, TTL serial, and CAN, with packets, registers, and the pyserial and python-can libraries.
5. [Actuators and Sensors](05-actuators-and-sensors/index.md) - Compares hobby servos, serial bus servos, and CAN actuators, and covers gearing, torque, encoders, feedback, and torque and speed limits.
6. [Sourcing Parts and Planning a Budget](06-sourcing-parts-and-budget/index.md) - Teaches how to read a bill of materials, compare kits with self-sourced builds, choose vendors, and budget for the SO-ARM100 and reBot-DevArm.
7. [3D Printing, Fasteners, and Tools](07-printing-fasteners-and-tools/index.md) - Covers printing the arm's structure, then fasteners, servo horns, crimping, soldering, cable management, and the multimeter.
8. [Building and Calibrating the SO-ARM100](08-building-the-so-arm/index.md) - Walks through the open-source repository, preparing and testing servos, assembling leader and follower arms, calibration, and troubleshooting.
9. [Building the reBot-DevArm and Choosing a Platform](09-building-the-rebot-devarm/index.md) - Covers CAN motor setup, assembly, and high-voltage power distribution for the reBot-DevArm, then compares both arms to help choose a platform.
10. [A Python Hardware Library for Robot Arms](10-python-hardware-library/index.md) - Builds a Python hardware library with classes, dataclasses, type hints, a fake arm for testing, and safe connection handling.
11. [Moving the Arm: Trajectories, Grippers, and Teleoperation](11-moving-the-arm/index.md) - Teaches joint-space moves, control loops and timing, smooth trajectories, gripper control, pick and place, and leader and follower teleoperation.
12. [Kinematics: Where Is the Hand and How Do I Get There](12-kinematics/index.md) - Explains coordinate frames, forward and inverse kinematics, multiple solutions and singularities, the Jacobian, and Cartesian motion.
13. [Logging, Testing, Simulation, and ROS 2](13-logging-testing-simulation/index.md) - Covers logging and plotting, testing with pytest and the fake arm, simulation with URDF, and guided tours of Pinocchio, Isaac Sim, and ROS 2.
14. [Cameras, Perception, and Learning from Demonstration](14-perception-and-learning/index.md) - Introduces cameras and OpenCV, calibration, mapping pixels to arm coordinates, and learning from demonstration with LeRobot.
15. [AI Agents, Tools, and OpenClaw Skills](15-agents-and-openclaw-skills/index.md) - Teaches the agent loop, tool calling, OpenClaw and its skills, and how to write a robot-arm skill with bounded, validated commands.
16. [Agent Planning, Vision, and Interfaces](16-agent-planning-and-vision/index.md) - Covers task planning and replanning, vision-language models, local and cloud agents, MCP and ROS 2 bridges, and safe web API calls.
17. [Safety Layers and Evaluation for Agent-Controlled Arms](17-agent-safety-and-evaluation/index.md) - Explains safety layers, command validation, dry-run modes, audit logs, prompt injection, and how to test and evaluate agent-controlled arms.
18. [Projects, Operation, and Teaching](18-projects-operation-and-teaching/index.md) - Brings the book together with capstone projects, startup and shutdown procedures, maintenance, and classroom and makerspace use.
19. [Optional Advanced Chapter: The Mathematics of Arm Paths](19-advanced-arm-path-mathematics/index.md) - An optional advanced chapter on orientation math, the Jacobian, trajectory polynomials, path planning, and predicting and measuring arm paths.

## How to Use This Textbook

Read chapters 1 through 18 in order. Each chapter builds on the ones before it, and every chapter lists the earlier chapters it depends on. Chapter 19 is optional: no other chapter depends on it, so you can skip it and still complete every build and project.

---

**Note:** Each chapter includes a list of concepts covered. Make sure to complete prerequisites before moving to advanced chapters.
