---
title: "List of Hands-On Lab Ideas"
description: "A working list of about 50 hands-on lab ideas for the Controlling a Robot Arm book, built on the Raspberry Pi Pico and MicroPython: servos, stepper motors, sensors, displays, bus communication, safety, and mini robot arms."
status: draft
---

# List of Hands-On Lab Ideas

This is the **idea list** for the Labs section. Nothing here is written yet.
Each row is a candidate lab, kept to one line so we can sort, cut, and
reorder before spending any writing effort. Once a lab is chosen it gets its
own page under `docs/labs/<lab-id>/index.md`.

!!! mascot-welcome "Why labs come before the big arm"
    ![Servo waving welcome](../img/mascot/welcome.png){ class="mascot-admonition-img" }
    A $330 arm is a poor place to learn that a servo needs its own power supply. A $4 servo on a breadboard is a great one. Every lab here is cheap, small, and safe to get wrong.

## Design Assumptions

These assumptions shape every idea below. Change one and the list changes.

| Assumption | Choice |
|---|---|
| Microcontroller | Raspberry Pi **Pico 2 W** (a plain Pico also works for every lab except the Wi-Fi ones) |
| Language | **MicroPython**, edited in Thonny; `mpremote` introduced once labs get larger |
| Station | One Pico, one breadboard, one OLED, one ToF sensor, one USB cable per student or pair |
| Budget | About **$60 per station** for the core kit (less when pairs share a multimeter), about **$170** with every add-on (estimates; verify prices before publishing) |
| Prior skill | Python from *Learning Python*. MicroPython and electronics are taught just in time |
| Bridge to the book | Labs that touch the laptop use the same `pyserial` and Python style as Chapters 4, 10, and 11 |

!!! mascot-warning "Pico pins are not motor power"
    ![Servo warning](../img/mascot/warning.png){ class="mascot-admonition-img" }
    A Pico GPIO pin can supply a few milliamps. A hobby servo can pull an amp when it stalls. Every servo and stepper lab must power the motor from a separate supply with a shared ground.

## How to Read the Tables

- **ID** is `track letter + number`. It becomes the lab's directory name.
- **Min** is the estimated classroom time, including wiring.
- **Level**: `1` first lab with that part, `2` builds on a level 1 lab, `3` stretch or instructor-led.
- **Source** shows where an existing lesson can be adapted:
    - `LM` = the *Learning MicroPython* book at `learning-micropython/docs/`
    - `SR` = the *STEM Robots* book at `stem-robots/docs/`
    - `New` = nothing to borrow; we write it from scratch
- **Ch** is the chapter in this book that the lab reinforces.

## Track A: Getting Started with the Pico

Short labs that every other track assumes. Skip any that students already know.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| A1 | Hello, Pico | Flash MicroPython, open Thonny, blink the LED, use the REPL | 30 | 1 | LM `basics/01-blink.md`, SR `setup/05-thonny-installation.md` | 1 |
| A2 | Buttons and Debouncing | Read a push button with pull-ups; see contact bounce and fix it in software | 30 | 1 | LM `basics/03-button.md`, `advanced-labs/21-button-callback.md` | 1 |
| A3 | Multimeter and Ohm's Law | Measure voltage and resistance, then predict a current before measuring it | 40 | 1 | LM `hands-on-labs/05-electronics-fundamentals/breadboards.md` | 3 |
| A4 | Reading a Knob | Use the ADC to read a potentiometer and print values; map 0-65535 to an angle | 30 | 1 | LM `basics/03-potentiometer.md` | 5 |
| A5 | Hello, OLED | Wire an SSD1306 over I2C, write text, run an I2C scanner | 40 | 1 | LM `hands-on-labs/15-oled-setup/11-oled-ssd1306-i2c.md`, `advanced-labs/06-i2c.md` | 4 |
| A6 | Config Files and Pin Maps | Keep pin numbers and calibration in `config.json` so code never hard-codes a pin | 30 | 2 | SR `lessons/07-config-file.md` | 1 |

## Track B: Hobby Servos

The core of the book's first half. Five of these should be written first.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| B1 | First Servo Sweep | PWM at 50 Hz; convert an angle to a pulse width; sweep 0 to 180 degrees | 40 | 1 | LM `basics/04-servo.md`, `hands-on-labs/12-motors-servos-steppers/06-servos.md` | 5 |
| B2 | Calibrate Your Servo | Find the true minimum and maximum pulse for *this* servo and save them to `config.json`; compare an SG90 and an MG90S | 40 | 2 | New | 5 |
| B3 | Knob-Controlled Servo | Potentiometer sets the angle; OLED shows the angle and the pulse width | 40 | 2 | LM `hands-on-labs/12-motors-servos-steppers/10-tof-motor-pot-display.md` | 5 |
| B4 | Smooth Motion | Limit speed with a step-per-tick ramp, then add easing at the ends; compare to a jump | 45 | 2 | New | 11 |
| B5 | Servo Power and Brownouts | Run a servo from USB, watch the Pico reset under load, then fix it with a separate 5 V supply and a shared ground | 45 | 2 | New | 3 |
| B6 | Servo Under Load | Hang weights on a horn-mounted arm and measure current with an INA219; find the stall current | 60 | 3 | New | 5 |
| B7 | Pan-Tilt Drawing | Two servos and a laser pointer or pen trace squares, circles, and Lissajous curves | 50 | 2 | New | 11 |
| B8 | Gripper with a Limit | Open and close a gripper; stop when current jumps because it holds an object | 60 | 3 | New | 11 |
| B9 | Three-Pot Leader, Three-Servo Follower | Three knobs are the leader arm; three servos copy them. A tiny leader-follower pair | 60 | 3 | New | 2, 11 |
| B10 | Hack a Servo for Feedback | Tap the potentiometer wiper inside an SG90 and read the *real* joint angle on an ADC pin | 60 | 3 | New | 5 |

## Track C: Sensors and Displays

Sensors tell the arm about the world and about itself.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| C1 | Ultrasonic Ranging | HC-SR04 echo timing; convert microseconds to centimeters; why 5 V echo needs a divider | 45 | 1 | LM `sensors/03-ping.md`, SR `lessons/55-ultrasonic-sensors.md` | 5 |
| C2 | Time-of-Flight Distance | VL53L0X over I2C; read millimeters; show on the OLED | 45 | 1 | LM `sensors/07-VL53L0X_GY.md`, SR `lessons/50-tof-sensors.md` | 5 |
| C3 | Noise and Filtering | Log 500 readings, plot in Thonny, then compare a moving average with a median filter | 45 | 2 | New | 5 |
| C4 | Rotary Encoder | Count quadrature pulses with interrupts; show position and direction | 50 | 2 | LM `sensors/10-rotary-encoder.md` | 5 |
| C5 | Tilt Angle from an IMU | MPU6050 gives a link angle; smooth it with a complementary filter | 60 | 3 | LM `chapters/10-motion-light-sensors`, SR `kits/imu-mpu6050` | 5, 12 |
| C6 | Limit Switches and Homing | Wire a microswitch; drive a joint until it clicks, then call that angle zero | 45 | 2 | New | 8 |
| C7 | Current and Voltage Monitor | INA219 on the supply line; print volts, amps, and watts on the OLED | 45 | 2 | New | 3 |
| C8 | Magnetic Angle Sensor | AS5600 absolute encoder on a shaft; read 12-bit angle over I2C | 50 | 3 | New | 5 |
| C9 | Live Plot on the Laptop | Stream sensor values from the Pico over USB serial; plot them with Python on the laptop | 50 | 2 | New | 4 |

## Track D: DC Motors and Steppers

Servos hide the control loop. These labs open it up.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| D1 | DC Motor with an H-Bridge | DRV8833 forward, reverse, and brake; pair with the H-Bridge Current Paths MicroSim | 50 | 1 | LM `hands-on-labs/12-motors-servos-steppers/03-h-bridge.md`, `08-drv8833.md`; `docs/sims/h-bridge-current-paths/` | 5 |
| D2 | Motor Speed and RPM | PWM duty vs. speed; measure RPM with an encoder or a slotted wheel | 50 | 2 | SR `lessons/20-motor-speed.md`, `25-pwm.md` | 5 |
| D3 | Stepper Basics with a 28BYJ-48 | ULN2003 driver; full-step and half-step sequences; count steps per revolution | 50 | 1 | LM `hands-on-labs/12-motors-servos-steppers/07-stepper-motors.md` | 5 |
| D4 | NEMA 17 with Step/Dir | A4988 or DRV8825 driver; set the current limit with a multimeter; microstepping | 60 | 2 | New | 5 |
| D5 | Acceleration Ramps and Lost Steps | Start too fast and watch the motor stall; add a ramp and fix it | 50 | 2 | New | 5 |
| D6 | Turntable with Homing | Stepper plus limit switch; command angles in degrees, not steps | 60 | 3 | New | 8, 11 |
| D7 | Closed-Loop Stepper | AS5600 on the stepper shaft detects a missed step and corrects it | 60 | 3 | New | 5 |
| D8 | PID Position Control | DC motor plus encoder; tune P, then I, then D, and plot each response | 70 | 3 | New | 5 |

## Track E: Build a Mini Arm

These labs turn parts into a mechanism. They need a cheap arm: laser-cut or
printed links, two to four MG90S servos, and a pen or pointer for the end.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| E1 | Assemble a 2-Link Arm | Mount two servos, set horns at known angles, label shoulder and elbow | 60 | 2 | New; see `robot-arm-drawing` skill and `docs/sims/two-link-workspace-explorer/` | 2 |
| E2 | Forward Kinematics on the Pico | Given two angles, compute the hand position; check it against a ruler | 60 | 3 | New | 12 |
| E3 | Inverse Kinematics Pen Plotter | Given a target point, compute the angles; draw a line, a square, and a circle | 90 | 3 | New | 12 |
| E4 | Workspace Mapping | Sweep every angle pair; mark reachable points on graph paper; compare to the Two-Link Workspace MicroSim | 60 | 2 | New | 2, 12 |
| E5 | Joystick Teleoperation | Dual-axis joystick drives two joints; add a button to open and close the gripper | 50 | 2 | LM `misc/projects.md` (joystick notes) | 11 |
| E6 | Waypoint Recorder | A button saves the current pose to a list; a second button plays the list back and stores it in a JSON file | 60 | 3 | LM `advanced-labs/17-file-system.md` | 11 |
| E7 | Pan-Tilt Depth Map | Two servos sweep a ToF sensor; build a 2D depth map | 70 | 3 | LM `hands-on-labs/12-motors-servos-steppers/09-2d-depth-mapping.md` | 14 |
| E8 | Pick and Place a Block | Move above a block, descend, grip, lift, move, release; add pauses and speed limits | 90 | 3 | New | 11, 18 |

## Track F: Communication and Bus Servos

This track connects the Pico to the protocol chapters. It is the bridge from
hobby servos to the STS3215 servos in the SO-ARM101.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| F1 | UART Loopback | Wire TX to RX on one Pico; send bytes and read them back; see baud-rate mismatch | 40 | 1 | New | 4 |
| F2 | Two Picos Talking | Pico A sends a packet; Pico B verifies the checksum and answers | 60 | 2 | New | 4 |
| F3 | Pico as a Serial Arm Controller | Laptop Python sends `MOVE 1 90`; the Pico moves a servo. First hardware abstraction layer | 60 | 2 | New | 4, 10 |
| F4 | Fake Arm, Real Arm | Same laptop program drives a software fake arm and the Pico arm through one class | 50 | 3 | New | 10 |
| F5 | Logic Analyzer Lab | Capture PWM and UART with an inexpensive logic analyzer (or a second Pico); read the waveforms | 60 | 2 | New | 4 |
| F6 | Ping an STS3215 | Half-duplex UART to one bus servo; build the ping packet by hand; read position, voltage, and temperature | 70 | 3 | New | 4, 5 |
| F7 | Move and Chain Bus Servos | Set servo IDs; move two servos on one wire; read all registers | 70 | 3 | New | 4, 5 |
| F8 | CAN Loopback with an MCP2515 | SPI CAN module in loopback mode; send and receive a frame; read arbitration IDs | 70 | 3 | New | 4 |
| F9 | Two-Node CAN | Two Picos with MCP2515 modules exchange frames; add termination and see why it matters | 70 | 3 | New | 4 |

## Track G: Power and Safety

Safety labs are the ones students remember. They also match Chapters 3 and 17.

| ID | Lab | What students build and learn | Min | Level | Source | Ch |
|---|---|---|---|---|---|---|
| G1 | Power Budget | Measure idle, moving, and stall current for each motor; size a supply with a 50% margin | 50 | 2 | New | 3 |
| G2 | Build an E-Stop | Normally closed button in series with a relay or MOSFET cuts motor power; Pico reads its state and shows it on the OLED | 60 | 2 | New | 3, 17 |
| G3 | Soft Limits | A `Joint` class clamps angle and speed; test it with out-of-range commands | 45 | 2 | New | 5, 17 |
| G4 | Heartbeat and Watchdog | Laptop sends a heartbeat; the Pico stops the arm if it goes quiet, and the hardware watchdog resets a hung program | 60 | 3 | LM `advanced-labs/13-timers.md` (WDT) | 17 |
| G5 | Overheat and Overload Guard | Read temperature or load and stop the joint when it passes a threshold | 50 | 3 | New | 5, 17 |
| G6 | Fuse and Wire Gauge | Compare thin and thick wire under load; measure voltage drop; blow a fuse on purpose in a safe setup | 50 | 2 | New; see `docs/sims/wire-voltage-drop-explorer/` | 3 |

## Track H: Integration and Capstones

Each capstone combines three or more earlier labs. Prerequisites are listed.

| ID | Lab | What students build and learn | Min | Level | Prereqs | Ch |
|---|---|---|---|---|---|---|
| H1 | Guarded Move | The gripper approaches an object and stops 2 cm away, using a ToF sensor | 60 | 3 | C2, E1, G3 | 14 |
| H2 | Servo Radar | A servo sweeps an ultrasonic or ToF sensor; draw a polar plot on the laptop | 70 | 3 | C2, B1, C9 | 14 |
| H3 | Teach Pendant | OLED, three knobs, and buttons on a handheld box that drives the mini arm and shows pose and status | 90 | 3 | A5, B3, E6, G2 | 11 |
| H4 | Distance-Triggered Wave | Wave the arm when a hand comes within 30 cm; add a cooldown so it never chatters | 45 | 2 | C2, B4 | 18 |
| H5 | Agent-Safe Tool Server | The Pico exposes `move_to`, `read_distance`, and `stop` over serial; a laptop script (later, an AI agent) calls them through a safety layer that enforces limits | 120 | 3 | F3, G3, G4 | 15, 16, 17 |
| H6 | Mini Leader-Follower Over Serial | Two Picos: one reads three knobs, one drives three servos, linked by UART with a heartbeat | 120 | 3 | B9, F2, G4 | 2, 11 |
| H7 | Draw a Signature | Record a pen path with the waypoint recorder, then replay it with IK smoothing | 120 | 3 | E3, E6 | 12 |

## Suggested First Twelve to Write

Write these first. They form one connected path and each uses only parts we
already plan to buy.

1. **A1** Hello, Pico
2. **A4** Reading a Knob
3. **B1** First Servo Sweep
4. **B2** Calibrate Your Servo
5. **B5** Servo Power and Brownouts
6. **B3** Knob-Controlled Servo
7. **C2** Time-of-Flight Distance
8. **B4** Smooth Motion
9. **F3** Pico as a Serial Arm Controller
10. **G3** Soft Limits
11. **D3** Stepper Basics with a 28BYJ-48
12. **B9** Three-Pot Leader, Three-Servo Follower

## Core Station Kit (draft)

All prices are rough estimates for planning, not quotes.

| Part | Qty | Approx. cost | Used by |
|---|---|---|---|
| Raspberry Pi Pico 2 W with headers | 1 | $7 | All |
| Half-size breadboard and jumper kit | 1 | $6 | All |
| SSD1306 128x64 I2C OLED | 1 | $5 | A5 and later |
| VL53L0X ToF sensor | 1 | $4 | C2, E7, H1, H2 |
| HC-SR04 ultrasonic sensor and 2 resistors | 1 | $3 | C1 |
| 10 kohm potentiometers | 3 | $2 | A4, B3, B9 |
| Push buttons | 4 | $1 | A2, E6 |
| MG90S micro servos | 4 | $12 | B, E |
| 5 V 3 A bench or wall supply with barrel jack adapter | 1 | $8 | B5, G1 |
| INA219 current sensor | 1 | $3 | B6, C7, G1 |
| Multimeter | 1 per pair | $12 | A3, G1 |
| **Core total** | | **about $63 (about $51 without the multimeter)** | |

### Add-ons by track

| Add-on | Approx. cost | Needed for |
|---|---|---|
| 28BYJ-48 stepper with ULN2003 board | $4 | D3 |
| NEMA 17 stepper, A4988 or DRV8825 driver, 12 V supply | $25 | D4-D7 |
| AS5600 magnetic encoder board | $4 | C8, D7 |
| MPU6050 IMU | $3 | C5 |
| Rotary encoder module | $2 | C4 |
| DRV8833 board and small DC gear motor | $6 | D1, D2, D8 |
| Dual-axis analog joystick | $2 | E5 |
| Relay or logic-level MOSFET module, plus mushroom E-stop | $8 | G2 |
| MCP2515 CAN module (two) with 120-ohm terminators | $10 | F8, F9 |
| Bus-servo adapter and one STS3215 servo | $30 | F6, F7 |
| Cheap logic analyzer (24 MHz, 8 channel) | $10 | F5 |
| Mini arm links, laser cut or printed | $5 | E1-E8 |

## Dependency Chains

Read each line left to right. A lab needs the ones before it on its line.

| Goal | Chain |
|---|---|
| Move a servo precisely | A1, A4, B1, B2, B3, B4 |
| Build and aim a mini arm | B2, E1, E2, E3 |
| Sense the world | A1, A5, C2, then H1 or H2 |
| Control from a laptop | B1, F3, G3, F4, H5 |
| Bus servos and CAN | F1, F2, F6, F7 (and F8, F9 for CAN) |
| Leader and follower | B3, B9, F2, G4, H6 |

## MicroSim Ideas to Pair with Labs

A lab asks students to *do*; a MicroSim lets them *predict* first. These pair
well and several already exist.

| MicroSim | Pairs with | Status |
|---|---|---|
| H-Bridge Current Paths | D1 | Exists (`docs/sims/h-bridge-current-paths/`) |
| Two-Link Workspace Explorer | E1, E4 | Exists |
| Leader and Follower Mirror | B9, H6 | Exists |
| Common Ground Loop | B5 | Exists |
| Wire Voltage-Drop Explorer | G6 | Exists |
| Servo Pulse-Width Explorer (adapt `learning-micropython/docs/sims/servo-pwm-explorer/`) | B1, B2 | To build |
| Stepper Step Sequence Animator | D3, D4 | To build |
| Debounce Waveform Viewer | A2 | To build |
| Ultrasonic Echo Timing (adapt `learning-micropython/docs/sims/ultrasonic-ranging/`) | C1 | To build |
| Acceleration Ramp Plotter | B4, D5 | To build |
| UART Byte Timing Diagram | F1, F2 | To build |

## Lab Page Template (proposal)

Every finished lab should follow the same shape so students learn where to
look:

1. **Goal** in one sentence, and the one new idea (the book's one-new-idea rule)
2. **Time, level, cost**
3. **Parts list** with a link to the station kit
4. **Safety check** (power source, pinch points, what to unplug first)
5. **Wiring diagram** and a wiring table
6. **Predict first**: a question to answer before running anything
7. **Code** in short steps, each Python block with `linenums="1"`
8. **What you should see**, including the common wrong result
9. **Troubleshooting** table: symptom, likely cause, fix
10. **Extend it**: two stretch tasks
11. **Check yourself**: three short questions
12. **Link to the chapter** and to the next lab

## Open Questions for the Author

1. **Which Pico?** Pico 2 W is assumed. A plain Pico is $4 cheaper and runs everything here except Wi-Fi.
2. **Which mini arm?** Laser-cut MG90S arm, printed arm, or a purchased $25 kit? E labs depend on this choice.
3. **STS3215 from a Pico.** The bus servo uses half-duplex TTL serial at high baud rates. Before writing F6 and F7, confirm a Pico plus an adapter board can drive it reliably; if not, run these labs from the laptop instead.
4. **CAN.** The Pico has no CAN controller, so F8 and F9 need the MCP2515 module. They are the most expensive and least reusable labs. Keep or cut?
5. **Lab numbering.** Keep track letters (A to H) or number labs in one global order like a course?
6. **Where do answers go?** Instructor guides are a separate section in this book and do not use the mascot.
