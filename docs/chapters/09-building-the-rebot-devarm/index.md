---
title: "Building the reBot-DevArm and Choosing a Platform"
description: "How to build and bring up the reBot-DevArm: its body, the 24 V and 48 V power system, CAN motor configuration, IDs, modes, bring-up and zeroing, followed by a comparison of the SO-ARM101 and the reBot-DevArm on cost, payload and learning curve and a method for choosing a platform, with a Python lab that packs Damiao CAN frames and runs a bring-up check."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 20:44:52"
version: 1.11
---

# Building the reBot-DevArm and Choosing a Platform

## Summary

This chapter covers building the reBot-DevArm, including CAN motor configuration, assembly, high-voltage power distribution, and zeroing. It ends by comparing the SO-ARM100 and reBot-DevArm on cost, payload, and learning curve. After this chapter, you will be able to set up either arm and choose the right one for a project.

## Concepts Covered

This chapter covers the following 21 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Arm Comparison | 85 |
| CAN Motor Configuration | 6 |
| Motor ID Assignment | 4 |
| B601 Body Structure | 3 |
| CAN Bring-Up Check | 3 |
| Cost Comparison | 3 |
| Payload Comparison | 3 |
| Learning Curve | 3 |
| Voltage Drop | 2 |
| Power Distribution Board | 2 |
| 24 V to 48 V Systems | 2 |
| Zeroing | 2 |
| Platform Selection Criteria | 2 |
| Quasi-Direct Drive | 1 |
| Brown-Out | 1 |
| Reverse Polarity Protection | 1 |
| reBot Gripper Assembly | 1 |
| reBot Wrist Assembly | 1 |
| High-Voltage Power Distribution | 1 |
| Zero Offset | 1 |
| Motor Mode Selection | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 4: Serial and CAN Communication](../04-serial-and-can-communication/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 6: Sourcing Parts and Planning a Budget](../06-sourcing-parts-and-budget/index.md)
- [Chapter 7: 3D Printing, Fasteners, and Tools](../07-printing-fasteners-and-tools/index.md)
- [Chapter 8: Building and Calibrating the SO-ARM100](../08-building-the-so-arm/index.md)

---

!!! mascot-welcome "Meet My Bigger Cousin!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    The reBot-DevArm lifts three times what I can, and it takes a few new skills: power at 24 or 48 volts, motors on a CAN bus, and zeroing. In this chapter you will learn those, then compare the two arms side by side so you can pick the one that fits your project. Let's move it!

Chapter 8 built the low-cost arm. This chapter builds the other one, and then puts the two next to each other. The reBot-DevArm is Seeed Studio's open-source arm. It is bigger, it carries a heavier load, and it is built from motors that talk on a CAN bus, as Chapters 4 and 5 described. It also costs several times as much and needs more care with power. Its extra capability is real, and so are its extra demands.

The chapter has two halves. The first half is the build, and it follows the order that worked in Chapter 8: the body, the power, the motors' settings, the first check that every motor answers, and the zero position. The second half is the comparison, which is the most important idea in the chapter, because the right arm depends on the project. A short Python lab at the end packs the motor's CAN frames, runs a bring-up check on a pretend bus, and compares what the wires lose at different voltages.

As in Chapter 8, the facts come from the project's own documents, read on 2026-10-07: the reBot-DevArm repository and wiki from Seeed Studio, Damiao's motor catalogue, and Seeed's Damiao and RobStride guides. Prices and versions change, and where the sources disagree or say nothing, the chapter says so.

## The reBot-DevArm

### Two Versions, One Body

The reBot-DevArm has two versions that share one design. The **B601-DM** uses Damiao motors and a 24 V supply. The **B601-RS** uses RobStride motors and a 48 V supply. Both have six joints and a gripper, so seven motors. The repository, at `github.com/Seeed-Projects/reBot-DevArm`, is certified open-source hardware: the hardware is released under the CERN-OHL-W 2.0 license and the software under Apache 2.0. Its README gives these specifications.

| | B601-DM | B601-RS |
|---|---|---|
| Payload | 1.5 kg | 2.5 kg |
| Maximum reach | 767 mm | 754 mm |
| Weight | about 4.5 kg | about 6.7 kg |
| Repeatability | under 0.2 mm | under 0.2 mm |
| Degrees of freedom | 6 plus a gripper | 6 plus a gripper |
| Supply | 24 V DC | 48 V DC |

The README also advises working within 70 percent of the arm's reach.

### B601 Body Structure

The **B601 body structure** is made of two kinds of parts. Some are 3D-printed, as in the SO-ARM101, and others are CNC-machined from 5052 aluminum, which is cut from solid metal by a computer-controlled machine to a tolerance of \( \pm 0.02 \) mm. The bill of materials prices the printed parts at an average of $50 and the machined parts at an average of $250, and it notes that many of the machined parts can be printed in ABS instead. Its printing advice is ABS at 30 percent infill for the parts that carry load, PLA at 15 percent infill for covers, a 0.4 mm nozzle and 0.2 mm layers. The bill of materials also says that it is not the final shipping version, which adds metal parts and braided cable sleeves.

The three big joints at the base use the larger motors. The table gives the model and the two CAN identifiers of each motor in the B601-DM, from Seeed's wiki. The first three motors are the larger Damiao DM4340P, and the other four are the smaller DM4310 (Chapter 5). Motor 7 is the gripper.

| Motor | Joint | Model | CAN ID | Master ID |
|---|---|---|---|---|
| 1 | Joint 1 | DM4340P | 0x01 | 0x11 |
| 2 | Joint 2 | DM4340P | 0x02 | 0x12 |
| 3 | Joint 3 | DM4340P | 0x03 | 0x13 |
| 4 | Joint 4 | DM4310 | 0x04 | 0x14 |
| 5 | Joint 5 | DM4310 | 0x05 | 0x15 |
| 6 | Joint 6 | DM4310 | 0x06 | 0x16 |
| 7 | Gripper | DM4310 | 0x07 | 0x17 |

Notice that the Master ID is the CAN ID plus 0x10, the rule from Chapter 4. Seeed's wiki states it as a rule: set the Master ID to the CAN ID plus 0x10, and never to 0x00.

The assembly guide is in Seeed's wiki and repository, and the notes that matter here are general. Fasten with the torque the guide gives (3 to 6 kgf·cm) and use the lowest torque setting on an electric screwdriver. The bill of materials warns that screws can loosen, and says to use thread-locking fluid. Clamp the base to the table with two clamps of at least 3 inches, as the wiki says. And since the arm weighs about 4.5 kg and moves fast, the wiki says that children must be supervised during assembly. In a classroom, this build is for an adult or a closely supervised team.

### The Wrist and the Gripper

The **reBot wrist assembly** is the last three joints, joints 4, 5 and 6, which use the smaller DM4310 motors and set the orientation of the hand. They are light on purpose, because a heavy wrist loads every joint behind it, which is the lesson of the torque calculation later in this chapter. The **reBot gripper assembly** is a parallel gripper driven by motor 7, a DM4310. The bill of materials lists a 170 mm linear rail, a 16-tooth gear, and bearings among the parts that make it, and the assembly guide shows how they fit. As with the SO-ARM101, assemble the wrist and the gripper last, with the motors already tested, and put a cable on each motor as you place it.

## Power at 24 V and 48 V

### Why Higher Voltage

A **24 V to 48 V system** supplies the motors at two to ten times the voltage of the SO-ARM101. The reason is the equation of Chapter 3: power is voltage times current, so for the same power a higher voltage needs a smaller current. Smaller current means less heat in the wires and less voltage lost along them. The cost is that the energy is more dangerous. Both voltages are below 60 V DC, a level that safety standards often treat as the line between low-voltage and hazardous (the figure is from a summary of IEC 62368-1), and 48 V is much closer to it than 5 V is. The supply's *input* side, plugged into the wall, is full mains voltage and is for an adult only.

The power parts are in the bills of materials. The B601-DM uses a Mean Well LRS-350-24 supply (24 V, 14.6 A, listed at $27.35). The B601-RS uses a Mean Well LRS-600-48 (48 V, 12.5 A, $69.50). The bill of materials includes a printed enclosure with a mains inlet that has a red switch, an XT60 output connector, and 1.5 mm² mains leads that the builder crimps (Chapter 7). Crimping mains leads is a job for an adult, and a pre-wired supply is a good alternative.

### The Power Distribution Board

A **power distribution board** takes one power input and divides it among several outputs. On the reBot-DevArm it is a small board that the repository calls the signal-power separation board, listed at $15 for the B601-RS. The wiki's path for the power is: supply, an XT60 plug, an XT30 plug, the separation board, and then XT30 2+2 cables that run from joint to joint in a chain, carrying both the power and the CAN signal in one cable. The USB-CAN adapter connects the computer to the same chain. The board is the right place for a fuse, as the single point where every motor's current passes, which is the reason a distribution board exists.

**High-voltage power distribution** here means handling the 24 V or 48 V path with the habits of Chapter 3, with a few more. The wiki's rules for working on the bus are these.

- Do not plug or unplug the XT30 2+2 connectors with the power on ("no hot-plugging").
- Keep at least one metre away from the arm while you debug and operate it.
- Set sensible limits in your program, and have an emergency stop.
- Do not buy a supply from an unbranded maker.

### Missing Protections

The published bills of materials list no fuse, no hardware emergency stop and no reverse-polarity protection, and the wiki says only that you should have an emergency stop in your program. You should add the first two yourself, following Chapter 3: a fuse in the positive lead, as close to the supply as possible, at least 1.25 times the largest current the arm draws and no more than the wire's limit, and an E-stop that cuts the DC supply. The red switch on the mains inlet is a power switch, not an emergency stop.

**Reverse polarity protection** is a way of making sure that a supply connected the wrong way round does no harm. A reversed supply sends current backwards through electronics that were never designed for it. The usual protections are a connector that can only be plugged in one way (the XT-series plugs are shaped so that they cannot be reversed), a fuse that blows, a diode in series with the supply (which wastes power as heat at high current), and a transistor circuit that acts as a near-lossless diode. Check the polarity with a multimeter before you connect, as Chapter 3 taught.

### Voltage Drop and Brown-Out

Chapter 3 introduced **voltage drop**: wires have resistance, so the voltage at the motor is less than the voltage at the supply by the current times the wire's resistance. It matters more here because of the currents involved. Take a peak draw of 200 W through 1 m of AWG 18 wire (lead and return), which is 2 m of wire with a resistance of \( 2 \times 1 \times 20.95 / 1000 = 0.042 \) Ω. At 12 V the current is \( 200 / 12 = 16.7 \) A and the wires drop \( 16.7 \times 0.042 = 0.70 \) V, which is 5.8 percent. At 24 V the current is 8.3 A and the drop is 0.35 V, or 1.5 percent. At 48 V it is 4.2 A and 0.17 V, or 0.4 percent. Doubling the voltage halves the current, halves the drop in volts, and quarters it as a percentage. The existing MicroSim from Chapter 3 lets you try the same effect with a 12 V supply:

<iframe src="../../sims/wire-voltage-drop-explorer/main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Wire Voltage-Drop Explorer MicroSim fullscreen](../../sims/wire-voltage-drop-explorer/main.html){ .md-button }

A **brown-out** is a dip in the supply voltage, caused by wire loss or by a supply that cannot deliver the current, that falls below what the electronics need to work. A device that browns out can reset, misbehave or stop. The Damiao motors have an under-voltage setting, with a minimum of 15 V, below which the drive stops. On a 24 V arm the margin is large, as the example shows: 23.65 V reaches the motors, about 8.7 V above 15 V. But the arithmetic also shows something else. Even at 24 V, 8.3 A is more than the 7 A teaching limit of AWG 18 from Chapter 3, so the wire is too thin for the *current* even though the *drop* is small. The cure is a thicker wire, such as AWG 16 with a 10 A limit. The lab does the calculation in Python.

!!! mascot-warning "Never Plug a Powered Motor In or Out"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Unplugging a connector that carries 24 or 48 V can make a spark and send a voltage spike into the electronics, and plugging one in can do the same. Switch the supply off and wait before you touch an XT30 connector, as the wiki says, and keep a hand clear of the arm while you work.

## Configuring the Motors

### CAN Motor Configuration and Motor ID Assignment

**CAN motor configuration** is setting the parameters inside each motor so that the bus works: its identifiers, its control mode, and its limits. As with the STS3215, the settings are stored in the motor, so you do this once, with one motor at a time connected. A reBot-DevArm that comes pre-assembled from Seeed has its IDs and calibration done, and you can skip to the bring-up check.

**Motor ID assignment** is the CAN version of Chapter 8's servo IDs. Each motor needs its own CAN ID, the one it listens to, and a Master ID, the one it answers from, so that the host can tell the motors apart. The Damiao tool for this, `DM_Tools`, runs on Windows and talks to the motor at 921,600 baud through the adapter. In outline, you connect one motor, press Read Parameters, type the CAN ID and the Master ID, press Write Parameters, and then enable the motor, after which its LED turns solid green. The wiki warns about a mistake that repeats the lesson of Chapter 8: pressing the CAN-ID Set button with several motors on the bus gives *all* of them the same ID. Configure one motor at a time, label it, and put it away.

The tool shows more than the IDs. Among the parameters the wiki names are the minimum under-voltage setting (15 V), a recommended maximum temperature (100 °C or less), and three limits for the control frame, `PMAX`, `VMAX` and `TMAX`, which the next section uses.

!!! mascot-tip "Write the IDs on the Motors"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Put a strip of tape on each motor with its number and its CAN and Master IDs the moment you set them. When you build joint 3 into the arm, you will not remember which of three identical-looking motors you configured as 3.

### Motor Mode Selection

**Motor mode selection** chooses how the motor interprets a command. The Damiao motors offer three control modes: MIT mode, position-and-velocity mode, and velocity mode. You pick one in the tool, write it to the motor, and then send commands in that mode. MIT mode (Chapter 5) puts the control loop \( \tau = K_p (q_{des} - q) + K_d (\dot q_{des} - \dot q) + \tau_{ff} \) inside the motor and lets one frame set position, speed, the two gains and a feed-forward torque, which makes it the mode for compliant, smooth motion and the one that Seeed's libraries use. Position-velocity mode is simpler when you only want to go to a position at a given speed.

### An MIT Frame in Eight Bytes

A CAN frame carries only 8 data bytes (Chapter 4), and an MIT command must carry five numbers. The motor's designers solved it by turning each number into a whole number with a fixed number of **bits** and then packing the bits next to each other. The position gets 16 bits, and the speed, the proportional gain \( K_p \), the derivative gain \( K_d \) and the torque get 12 bits each, which is \( 16 + 4 \times 12 = 64 \) bits, exactly 8 bytes.

To turn a number into a whole number, the library maps the allowed range of the number onto the range of the bits. A value \( x \) in the range from \( x_{min} \) to \( x_{max} \), stored in \( n \) bits, becomes

\[ \text{integer} = \left\lfloor \frac{(x - x_{min}) \times (2^n - 1)}{x_{max} - x_{min}} \right\rfloor \]

The ranges are fixed: \( K_p \) from 0 to 500, \( K_d \) from 0 to 5, and the other three come from the three limits that you saw in the tool, `PMAX`, `VMAX` and `TMAX`, as plus and minus ranges. Seeed's defaults are in the table (the sources disagree about the speed limit of the 48 V version of the 4340P, so read the limits from the tool for your motor).

| Model | PMAX (rad) | VMAX (rad/s) | TMAX (N·m) |
|---|---|---|---|
| DM4310 | 12.5 | 30 | 10 |
| DM4340P | 12.5 | 8 | 28 |

Here is a worked example for a DM4310 and a goal of 1.0 rad. The position has 16 bits over \( \pm 12.5 \) rad, so its integer is \( (1.0 + 12.5) \times 65535 / 25 = 35388.9 \), which is 35388 as a whole number, or `0x8A3C` in hexadecimal. A \( K_d \) of 1 with 12 bits over 0 to 5 is \( 1 \times 4095 / 5 = 819 \). The step between two neighbouring positions is \( 25 / 65535 \approx 0.00038 \) rad, or 0.022 degrees, so the packing loses almost nothing.

The pieces are then packed into the 8 bytes with shifts and masks. A **bit shift** `x >> 4` moves the bits of `x` four places to the right (dropping the low four), `x << 4` moves them left, `x & 0xF` keeps only the low four bits, and `a | b` joins two groups of bits. A 12-bit number does not fit in one byte, so it is split: its top 8 bits go in one byte, and its last 4 bits share the next byte with 4 bits of the next number. The library's packing is:

| Byte | Contents |
|---|---|
| 0 | The position's top 8 bits |
| 1 | The position's low 8 bits |
| 2 | The speed's top 8 bits |
| 3 | The speed's last 4 bits, then \( K_p \)'s top 4 bits |
| 4 | \( K_p \)'s low 8 bits |
| 5 | \( K_d \)'s top 8 bits |
| 6 | \( K_d \)'s last 4 bits, then the torque's top 4 bits |
| 7 | The torque's low 8 bits |

The motor's reply uses a similar layout. Its first byte holds the motor's ID in the low four bits and a status code in the high four, then come 16 bits of position, 12 bits of speed, 12 bits of torque, and one byte each for the drive's temperature and the rotor's temperature. The meanings of the status codes are in the Damiao manual, which the book's sources did not include, so check it before you rely on them.

!!! mascot-encourage "Bit Packing Looks Scarier Than It Is"
    ![Servo encouraging the reader](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Shifts and masks look like a puzzle, and most people need a second look. You already unpacked a servo's reply in Chapter 4, and this is the same job in the other direction. Do the first byte by hand with a pencil, and the rest follow the same pattern.

The first MicroSim of the chapter makes you do the first step of this by hand: turning a value into its integer.

#### Diagram: MIT Frame Packer

<details markdown="1">
<summary>MIT Frame Packer</summary>
Type: microsim
**sim-id:** mit-frame-packer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the whole number that a value becomes when it is packed into an MIT-mode field of a Damiao motor, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** CAN frame, MIT mode, bits, PMAX, VMAX, TMAX, the packing formula (all defined in the section "An MIT Frame in Eight Bytes" above this block).

**Evidence of Mastery:** For each of six problems the learner types a whole number and commits. An answer is correct when it equals the Correct column in Content exactly. Mastery is 5 of 6 correct on the first attempt. Changing the values in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A value of zero maps to the middle number exactly. (With an even number of steps the middle falls between two integers and the whole number is rounded down.) (2) All the fields have the same range. (Each field has its own range and number of bits.) (3) The conversion rounds to the nearest whole number. (It drops the fraction.)

**Instructional Rationale:** An Apply-level calculate objective needs the learner to carry out the formula on new values with an immediate check. Typing the integer, and seeing the formula worked afterwards, ties the formula to the bytes that the lab produces.

**Content:**

The formula is integer = floor((x - x_min) x (2^n - 1) / (x_max - x_min)). In Explore mode the learner can choose a model (DM4310 or DM4340P), set the five values, and see each integer, its hexadecimal form, and the eight packed bytes.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Position | -12.5 | 12.5 | 0.1 | 1.0 | rad |
| Speed (DM4310: limit 30, DM4340P: limit 8) | the negative limit | the limit | 0.1 | 0.0 | rad/s |
| Kp | 0 | 500 | 1 | 20 | none |
| Kd | 0 | 5 | 0.1 | 1.0 | none |
| Torque (DM4310: limit 10, DM4340P: limit 28) | the negative limit | the limit | 0.1 | 0.0 | N·m |

Six problems in this fixed order:

| # | Problem | Bits | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | DM4310, position 0 rad (range -12.5 to 12.5). | 16 | 32767 | 12.5 x 65535 / 25 = 32767.5, and the fraction is dropped. |
| 2 | DM4310, Kd = 1.0 (range 0 to 5). | 12 | 819 | 1.0 x 4095 / 5 = 819. |
| 3 | DM4310, Kp = 20 (range 0 to 500). | 12 | 163 | 20 x 4095 / 500 = 163.8, and the fraction is dropped. |
| 4 | DM4340P, speed 3 rad/s (range -8 to 8). | 12 | 2815 | (3 + 8) x 4095 / 16 = 2815.3, and the fraction is dropped. |
| 5 | DM4340P, torque -7 N·m (range -28 to 28). | 12 | 1535 | (-7 + 28) x 4095 / 56 = 1535.6, and the fraction is dropped. |
| 6 | DM4310, position 1.0 rad (range -12.5 to 12.5). | 16 | 35388 | 13.5 x 65535 / 25 = 35388.9, and the fraction is dropped. |

**Provenance:** The formula, the bit counts, the Kp and Kd ranges and the PMAX, VMAX and TMAX values are from the chapter section "An MIT Frame in Eight Bytes", which follows the Damiao Python library in Seeed's wiki read on 2026-10-07. The problems are illustrative and written for this sim.

**Rules:** integer = floor((x - x_min) x (2^n - 1) / (x_max - x_min)). A typed answer is a whole number between 0 and 2^n - 1, and is correct only if it equals the Correct value. A value outside its range is limited to the range before the formula is applied.

**Learner Activity:**

1. In Explore mode the learner changes the model and the five values and watches the integers, the hexadecimal values and the eight bytes update. The learner should notice that a speed of exactly 0 does not give exactly the middle integer.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a whole number and presses Check to commit.
4. The sim shows whether the answer was correct and the worked formula with the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value>. <Why>". Incorrect: "Not quite. The answer is <value>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the DM4310 and the defaults, showing the packed bytes 8A 3C 7F F0 A3 33 37 FF.

**Chapter Anchors:** The chapter's worked example is a DM4310 at 1.0 rad, which is 35388 or 0x8A3C, with Kd = 1.0 giving 819. The sim has six problems and mastery is 5 of 6.
</details>

### Quasi-Direct Drive

**Quasi-direct drive** is the design idea behind these motors. A *direct-drive* motor has no gearbox at all and is smooth and fast but weak. A geared servo like the STS3215 has a very high ratio (1/345 in the SO-ARM101's follower), which makes it strong and slow, and hard to turn by hand. A quasi-direct-drive actuator is in between: a powerful brushless motor with a *low* ratio, here 10:1 in the DM4310 and 40:1 in the DM4340P, from Damiao's catalogue. A low ratio means the joint is easy to push back (it is **backdrivable**), and the torque can be estimated from the motor's current. It lets the arm be gentle and responsive, which is why MIT mode works so well on it. The price is that torque per kilogram of motor is lower than with a high ratio, so the motor must be larger, and that is part of why the reBot-DevArm costs more.

## Bring-Up and Zeroing

### The CAN Bring-Up Check

A **CAN bring-up check** is the first test that tells you the bus is alive, run before you try to move anything. It follows the chain of Chapter 4: the terminators, the bit rate and the IDs. The order is:

1. With the power off, measure across CAN_H and CAN_L with a multimeter. A healthy bus reads about 60 Ω (Chapter 4).
2. Check the adapter. The DM version of the arm uses a USB-CAN board that appears as a serial port (such as `/dev/ttyACM0`, at 921,600 baud), whereas the RS version uses a SocketCAN interface (`can0`) at 1 Mbps. The Linux command for the second is `sudo ip link set can0 type can bitrate 1000000`.
3. Power on. Send each motor's enable frame, one ID at a time, and wait for the reply on the Master ID.
4. Check each reply: it came from the Master ID that you expected, it names the right motor, and the temperatures are sensible.
5. Disable each motor again before moving on.

The Seeed software expects an Ubuntu 24.04 computer (the wiki says that a virtual machine is not enough), and the setup tool for the DM motors is a Windows program, so budget time for the computer as well as the arm. The lab writes this check in Python on a pretend bus.

### Zeroing and the Zero Offset

**Zeroing** is defining the arm's zero pose, the pose in which every joint is called zero, so that angles mean the same thing on every arm and in every program. The **zero offset** is the stored number that makes it so: the difference between the motor's own encoder reading and the angle that your arm calls zero. It is the CAN counterpart of Chapter 8's homing offset, and the same two ideas apply: the offset belongs to *this* arm, and a joint that has been taken apart needs it set again. Seeed's Quick Start says that you must reset the zero point before controlling the arm. The set-zero is done with Seeed's MotorBridge Studio, a web tool that has a one-click zero setting, and its procedure is shown in the wiki's video, so follow that source for the steps. The lab stands in for it with a pretend motor that stores its own zero, so you can see what happens to readings and commands after zeroing.

The wiki has one more caution that matters here: triggering the motor's own calibration by accident can overwrite its factory parameters and leave it noisy at start-up. Use the vendor's documented steps and nothing else.

## Comparing the Arms

### Arm Comparison

**Arm comparison** is the central skill of this chapter. You have now met both arms in enough detail to compare them on the things that decide a project. The table collects what the book has established, with the figures from the sources named in Chapters 5 and 6 and above. Where the sources used here give no figure, the cell says so.

| | SO-ARM101 | reBot B601-DM | reBot B601-RS |
|---|---|---|---|
| Motors | 6 STS3215 per arm, serial bus | 4 DM4310 and 3 DM4340P, CAN | 4 RS00 and 3 RS06, CAN |
| Drive type | Geared servo, 1/345 or less | Quasi-direct, 10:1 and 40:1 | Quasi-direct |
| Payload | About 0.5 kg (listed by sellers) | 1.5 kg | 2.5 kg |
| Reach | Not given in the sources used | 767 mm | 754 mm |
| Weight | Not given in the sources used | About 4.5 kg | About 6.7 kg |
| Approximate cost | About $350 | About $1,400 to $1,500 | About $1,230 or more, before the frame |
| Supply | 5 V (7.4 V motors) or 12 V | 24 V | 48 V |
| Leader arm | Built in: the leader of the pair | Optional, a separate arm | Optional, a separate arm |
| Software | LeRobot | ROS 1 and 2, LeRobot, Pinocchio, Isaac Sim, Python SDK | A Python SDK and Seeed's control library |
| Frame | 3D-printed | 3D-printed and CNC aluminum | 3D-printed and CNC aluminum |

The two arms are not versions of one product at two prices. They are different machines for different jobs, and the table shows it: the SO-ARM101 is built to be cheap and easy, and it has a leader arm because teleoperation is its purpose, while the reBot-DevArm is built to carry more and to connect to a heavier software ecosystem. The next three sections compare the arms on cost, payload and learning curve, which are the three numbers that most often decide.

### Cost Comparison

The **cost comparison** adds up what each arm costs to build, and uses the lines that each bill of materials gives. For the SO-ARM101, the project's own build comes to about $350: the motor kit cost $332.04 delivered and the printed parts add $20 or more (Chapter 6). The repository's parts list for two arms, $229.88, leaves out shipping, tax and printing. For the B601-DM, the published bill of materials gives these lines.

| Line | Amount (US$) |
|---|---|
| 4 DM4310 at $120 | 480.00 |
| 3 DM4340P at $175 | 525.00 |
| CAN-USB board | 15.00 |
| 3D-printed parts (average) | 50.00 |
| CNC aluminum parts (average) | 250.00 |
| Mean Well LRS-350-24 supply | 27.35 |
| 2 clamps at $20 | 40.00 |
| **Priced lines above** | **1,387.35** |

Seeed's store sells the unassembled B601-DM as a bundle for $1,517.58, so the lines above, which leave out the bearings, the rail, the gear, the cables and the screws, are about $130 short of the store price. The B601-RS's motors alone are \( 4 \times 125 + 3 \times 210 = \$1130 \), and its supply is $69.50, so it starts at about $1,230 before the frame. The B601-DM's priced lines come to \( 1387.35 / 350 \approx 4.0 \) times the cost of the SO-ARM101. A press article at the launch quoted a starting price of about €1,120, which is lower than the store bundle, so the arm's price depends on the configuration and the date. Re-check before you order.

### Payload Comparison

The **payload comparison** asks what each arm can carry. The reBot-DevArm's published payloads are 1.5 kg for the B601-DM and 2.5 kg for the B601-RS, and sellers list the SO-ARM101 at about 0.5 kg, three times and five times less. The numbers make sense when you do the physics of Chapter 5. A payload at the end of an arm of length \( r \) puts a torque on the shoulder of \( \tau = m g r \), with \( g = 9.81 \) m/s², and that is *before* counting the weight of the arm itself.

For the SO-ARM101, an illustrative 0.5 kg at 0.3 m needs \( 0.5 \times 9.81 \times 0.3 = 1.47 \) N·m. The STS3215's stall torque at 6 V is 16.5 kg·cm, which is \( 16.5 \times 0.0981 = 1.62 \) N·m, so the payload alone takes 91 percent of the motor's stall torque. For the B601-DM, 1.5 kg at 0.45 m needs \( 1.5 \times 9.81 \times 0.45 = 6.6 \) N·m. The DM4340P has a rated torque of 9 N·m, so the load takes 74 percent of it. Both arms are working near the limit of their shoulder motors at their stated payload, which is how payloads are chosen, and a motor can carry its peak torque only for a short time. Seeed's own tests on the B601-DM agree: moving 1.5 kg back and forth within 70 percent of the reach ran for more than two hours before a motor reached 90 °C and the test was stopped, and moving 2.5 kg was stopped by overheat protection after 40 minutes. Its advice is to keep loads under 1.5 kg and to stay inside 70 percent of the reach. The figures in the DM4310's catalogue are 3 N·m rated and 7 N·m peak, and resellers list a newer version of it at 3.5 and 12.5 N·m. Seeed's bill of materials names the part "DM4310 (V4)", which may be that newer version, so treat the peak torque as unconfirmed until you have Damiao's own document for your version.

### Learning Curve

The **learning curve** is how much a builder has to learn before the arm works, and it is the comparison that is most about the *reader*. The SO-ARM101 needs a serial protocol, one library (LeRobot), a low-voltage supply, and the skills of Chapters 7 and 8. The reBot-DevArm needs all of that kind of skill and more: a CAN bus and its termination, 24 V or 48 V power that needs fusing and an E-stop, mains wiring on the supply side, Windows software for the motor setup, an Ubuntu computer for the SDK, bit-level frame formats, and a zeroing procedure that is shown in a video. None of it is beyond a determined builder, and an older builder with an adult mentor can learn it, but it is more, and the safety demands are higher. That is the reason this book builds the SO-ARM101 first.

### Platform Selection Criteria

**Platform selection criteria** are the questions that decide between the arms for a particular project. Five cover most cases.

- **Cost.** What can you spend, as a landed cost? (Chapter 6.)
- **Payload.** What is the heaviest thing the arm must hold, at what distance? Use \( \tau = m g r \).
- **Learning curve and supervision.** Who will build and run it, with what experience, and under what supervision?
- **Software.** Which libraries must it work with? LeRobot runs on both, and the reBot-DevArm's repository lists ROS 1 and 2, Pinocchio and Isaac Sim as supported.
- **Power.** What supply do you have, and who can safely wire it?

A *requirement* (the arm must carry 2 kg) is a filter that removes any arm that fails it. A *preference* (cheaper is better) is a weight. Treat the two differently: filter first, then weigh what remains. The final MicroSim makes you recommend a platform for six situations, and in its Explore mode you can set the weights for the five criteria and see how the totals change. The scores in Explore mode are the author's judgments and not measurements, and you can disagree with them.

#### Diagram: Platform Chooser

<details markdown="1">
<summary>Platform Chooser</summary>
Type: microsim
**sim-id:** platform-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** recommend<br/>
**Learning Objective:** The learner will recommend one of three robot arms (the SO-ARM101, the reBot B601-DM or the reBot B601-RS) for each of six project situations by applying the platform selection criteria, with at least 5 of 6 recommendations correct on the first attempt.

**Prerequisites:** SO-ARM101, reBot B601-DM, reBot B601-RS, payload, landed cost, supervision, supply voltage, platform selection criteria (all defined in the sections above this block and in Chapters 3, 5 and 6).

**Evidence of Mastery:** For each of six situations the learner chooses one of three arms and commits. A choice is correct when it matches the Recommended arm column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the weights in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The most capable arm is always the best choice. (Cost, supervision and power can rule it out.) (2) A weighted score decides a hard requirement. (A requirement is a filter that must be applied first.) (3) The cheapest arm can do any job. (Its payload is about a third of the B601-DM's.)

**Instructional Rationale:** An Evaluate-level recommend objective asks the learner to make and justify a judgment against criteria. Each situation fixes some criteria as requirements and leaves others as preferences, so the learner must apply the filter before the weights.

**Content:**

The three arms and the facts that the learner may use: SO-ARM101, payload about 0.5 kg, about $350 for a pair including the printed parts, 5 V supply, LeRobot software, lowest supervision need. reBot B601-DM, payload 1.5 kg, bill of materials lines of about $1,387 and a store bundle of $1,517.58, 24 V supply, ROS 1 and 2, LeRobot, Pinocchio and Isaac Sim, higher supervision need. reBot B601-RS, payload 2.5 kg, motors alone $1,130 and a supply of $69.50, 48 V supply, a Python SDK, highest supervision need.

Six situations in this fixed order:

| # | Situation shown to the learner | Recommended arm | Why (shown as feedback) |
|---|---|---|---|
| 1 | A class of 12 students aged 12 to 14, working in pairs, has about $400 for each pair's arms and wants to learn Python and teleoperation. | SO-ARM101 | It is the only arm that fits the budget, and its supervision demands suit the age. |
| 2 | A lab must lift a 1.2 kg part again and again and has a 24 V bench supply. | reBot B601-DM | Its payload of 1.5 kg covers 1.2 kg, and 24 V is the supply it needs. |
| 3 | A project must hold a 2.0 kg object, has a 48 V supply and has an adult who can wire it. | reBot B601-RS | Only the B601-RS has a payload (2.5 kg) above 2.0 kg. |
| 4 | A hobbyist with no experience of mains wiring wants to try imitation learning with a leader and follower, on a $400 budget. | SO-ARM101 | It has a built-in leader arm, a low-voltage supply, and fits the budget. |
| 5 | A university course needs ROS 2, Isaac Sim and Pinocchio support, a 1 kg payload, a 24 V supply, and staff who can do the mains wiring. | reBot B601-DM | Its repository lists all three software tools, and 1.5 kg covers 1 kg. |
| 6 | A team has only a 5 V, 4 A supply and wants the cheapest build that can copy a leader arm. | SO-ARM101 | The other two arms need 24 V or 48 V supplies the team does not have. |

Explore mode scores each arm from 1 (worst) to 5 (best) on five criteria. The learner sets a weight from 0 to 5 for each criterion and sees the weighted totals. The scores are the author's judgments and the sim labels them "judgment".

| Criterion | SO-ARM101 | reBot B601-DM | reBot B601-RS |
|---|---|---|---|
| Low cost | 5 | 2 | 1 |
| Payload | 1 | 3 | 5 |
| Easy to learn | 5 | 3 | 2 |
| Software support | 4 | 5 | 3 |
| Simple, low-voltage power | 5 | 3 | 2 |

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Weight of each criterion | 0 | 5 | 1 | 3 | none |

**Provenance:** The payloads, prices, voltages and software lists are from the chapter sections "The reBot-DevArm", "Cost Comparison", "Payload Comparison" and Chapters 5 and 6. The situations are illustrative and written for this sim. The criterion scores are the author's judgment.

**Rules:** Each situation has exactly one correct arm, found by applying the requirements in the situation as filters first. Weighted total of an arm = the sum over the five criteria of weight x score. The arm with the highest total is shown first, and a tie is shown in the order SO-ARM101, B601-DM, B601-RS.

**Learner Activity:**

1. In Explore mode the learner changes the five weights and watches the three totals reorder. The learner should notice that raising the weight of payload to 5 and every other weight to 0 puts the B601-RS first.
2. The learner switches to the six situations. Situation 1 is shown with the facts on each arm.
3. The learner chooses one of the three arms and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 6 it shows the score.

**Feedback:** Six situations, fixed order, one attempt each. Correct: "Correct: <arm>. <Why>". Incorrect: "Not quite. The best fit is <arm>. <Why>". The correct arm is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with all five weights at 3, showing the totals 60 for the SO-ARM101, 48 for the B601-DM and 39 for the B601-RS.

**Chapter Anchors:** The chapter states payloads of about 0.5 kg, 1.5 kg and 2.5 kg, supplies of 5 V, 24 V and 48 V, an SO-ARM101 cost of about $350, a B601-DM store bundle of $1,517.58, and that requirements are filters and preferences are weights. The sim has six situations, five criteria with weights from 0 to 5, and mastery is 5 of 6.
</details>

!!! mascot-thinking "Requirements Filter, Preferences Weigh"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A weighted score hides a trap: it lets a very good score on one thing pay for a failure on another. An arm that cannot lift your load is not "a bit worse", it is out. Write down your must-haves first and remove any arm that fails one, and only then weigh what is left.

## Lab: Pack Frames, Bring Up a Bus, and Zero a Joint

In this lab you will pack and unpack Damiao MIT-mode frames, run the bring-up check on a pretend CAN bus with three problems in it, zero a pretend joint, and compare the wire loss at 12, 24 and 48 V. Everything runs on any computer. The one new Python idea is **bit operations**: the shift operators `<<` and `>>`, the mask `&` and the join `|`, which you met when decoding the servo's sign bit in Chapter 4 and use here to pack bits into bytes. You will extend the `arm-lab` project and use python-can's virtual bus from Chapter 4.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the frame module.** `float_to_uint` is the formula of the chapter, with a clamp to the allowed range, and `uint_to_float` is its inverse. `pack_mit` turns a model name and five values into the eight bytes in the order of the table, with `>>` to take the top bits of a number, `&` to keep the low bits, and `<<` and `|` to put two groups of bits into one byte. `unpack_mit` and `unpack_feedback` do the reverse and return the numbers, and `LIMITS` holds the `PMAX`, `VMAX` and `TMAX` of the table. Create `armlab/damiao.py`:

```python linenums="1"
"""Pack and unpack the CAN frames of a Damiao motor in MIT mode, and a pretend motor to test them."""

ENABLE = bytes([0xFF] * 7 + [0xFC])
DISABLE = bytes([0xFF] * 7 + [0xFD])

# model -> (P_MAX in rad, V_MAX in rad/s, T_MAX in N*m): the default limits in Seeed's wiki.
LIMITS = {"DM4310": (12.5, 30.0, 10.0), "DM4340P": (12.5, 8.0, 28.0)}
KP_MAX, KD_MAX = 500.0, 5.0


def float_to_uint(x, x_min, x_max, bits):
    """Map a float in [x_min, x_max] onto a whole number of the given number of bits."""
    x = max(x_min, min(x, x_max))
    return int((x - x_min) * ((1 << bits) - 1) / (x_max - x_min))


def uint_to_float(n, x_min, x_max, bits):
    """The reverse of float_to_uint."""
    return n * (x_max - x_min) / ((1 << bits) - 1) + x_min


def pack_mit(model, q, dq, kp, kd, tau):
    """Return the 8 data bytes of an MIT-mode command: position, speed, two gains, torque."""
    p_max, v_max, t_max = LIMITS[model]
    q_i = float_to_uint(q, -p_max, p_max, 16)
    dq_i = float_to_uint(dq, -v_max, v_max, 12)
    kp_i = float_to_uint(kp, 0, KP_MAX, 12)
    kd_i = float_to_uint(kd, 0, KD_MAX, 12)
    tau_i = float_to_uint(tau, -t_max, t_max, 12)
    return bytes([
        q_i >> 8,                                   # high byte of the position
        q_i & 0xFF,                                 # low byte of the position
        dq_i >> 4,                                  # the top 8 of the speed's 12 bits
        ((dq_i & 0xF) << 4) | ((kp_i >> 8) & 0xF),  # the speed's last 4 bits, then kp's top 4
        kp_i & 0xFF,
        kd_i >> 4,
        ((kd_i & 0xF) << 4) | ((tau_i >> 8) & 0xF),
        tau_i & 0xFF,
    ])


def unpack_mit(model, data):
    """The reverse of pack_mit: return (q, dq, kp, kd, tau)."""
    p_max, v_max, t_max = LIMITS[model]
    q_i = data[0] << 8 | data[1]
    dq_i = data[2] << 4 | data[3] >> 4
    kp_i = (data[3] & 0xF) << 8 | data[4]
    kd_i = data[5] << 4 | data[6] >> 4
    tau_i = (data[6] & 0xF) << 8 | data[7]
    return (uint_to_float(q_i, -p_max, p_max, 16), uint_to_float(dq_i, -v_max, v_max, 12),
            uint_to_float(kp_i, 0, KP_MAX, 12), uint_to_float(kd_i, 0, KD_MAX, 12),
            uint_to_float(tau_i, -t_max, t_max, 12))


def unpack_feedback(model, data):
    """Decode an 8-byte feedback frame into a dictionary."""
    p_max, v_max, t_max = LIMITS[model]
    return {
        "id": data[0] & 0x0F,                                   # low half of byte 0: the motor's ID
        "status": data[0] >> 4,                                 # high half: a status code (see the motor manual)
        "q": uint_to_float(data[1] << 8 | data[2], -p_max, p_max, 16),
        "dq": uint_to_float(data[3] << 4 | data[4] >> 4, -v_max, v_max, 12),
        "tau": uint_to_float((data[4] & 0xF) << 8 | data[5], -t_max, t_max, 12),
        "mos_c": data[6],
        "rotor_c": data[7],
    }
```

**Step 3. Pack a command and read it back.** The script packs the worked example, a DM4310 at 1.0 rad with \( K_p = 20 \) and \( K_d = 1 \), prints the eight bytes, unpacks them, and shows the quantization error of each field. Create `mit_demo.py`:

```python linenums="1"
"""Pack a Damiao MIT-mode command into 8 bytes and read it back."""

from armlab.damiao import LIMITS, pack_mit, unpack_mit

model = "DM4310"
p_max, v_max, t_max = LIMITS[model]
print(f"{model}: position +/-{p_max} rad (16 bits), speed +/-{v_max} rad/s (12 bits), torque +/-{t_max} N*m (12 bits)")

command = dict(q=1.0, dq=0.0, kp=20.0, kd=1.0, tau=0.0)
data = pack_mit(model, **command)
print("command :", command)
print("bytes   :", data.hex(" "))

back = unpack_mit(model, data)
for name, sent, got in zip(command, command.values(), back):
    print(f"   {name:<4} sent {sent:>6.3f}  read back {got:>8.4f}  error {got - sent:+.4f}")

step_deg = 2 * p_max / (2**16 - 1) * 180 / 3.14159265
print(f"One position step is {2 * p_max / (2**16 - 1):.5f} rad = {step_deg:.3f} degrees")
```

```bash
python mit_demo.py
```

```text
DM4310: position +/-12.5 rad (16 bits), speed +/-30.0 rad/s (12 bits), torque +/-10.0 N*m (12 bits)
command : {'q': 1.0, 'dq': 0.0, 'kp': 20.0, 'kd': 1.0, 'tau': 0.0}
bytes   : 8a 3c 7f f0 a3 33 37 ff
   q    sent  1.000  read back   0.9997  error -0.0003
   dq   sent  0.000  read back  -0.0073  error -0.0073
   kp   sent 20.000  read back  19.9023  error -0.0977
   kd   sent  1.000  read back   1.0000  error +0.0000
   tau  sent  0.000  read back  -0.0024  error -0.0024
One position step is 0.00038 rad = 0.022 degrees
```

The first two bytes `8a 3c` are the position 35388 that the chapter computed by hand. Every value comes back with a small error, because it passed through a whole number: the position is off by 0.0003 rad, and a speed of exactly zero returns as -0.0073 rad/s. That last one is the misconception that the MicroSim warns about: 12 bits give an even count of steps, so no whole number sits exactly at zero, and 0 maps to 2047, just below the middle. The error is far smaller than the motor's own accuracy, so nothing is wrong, but it is worth knowing before you wonder why a stopped motor reports a tiny speed.

**Step 4. Write a pretend motor.** `PretendMotor` answers the frames that a real motor would. It answers an enable frame by becoming enabled and replying with feedback, answers a disable frame the same way, and while enabled it unpacks an MIT command and lets a toy joint move for half a second under the control law of Chapter 5, with a made-up inertia of 0.05 kg·m². It replies from its Master ID, which is the CAN ID plus 0x10 unless you give it another. `serve_once` lets all the pretend motors on a bus handle one frame. Create `armlab/pretend_damiao.py`:

```python linenums="1"
"""A software stand-in for Damiao motors, so frames can be tested with no hardware."""

import can

from armlab.damiao import DISABLE, ENABLE, LIMITS, float_to_uint, unpack_mit


class PretendMotor:
    """A software stand-in for one Damiao motor: it answers frames and moves a toy joint."""

    INERTIA = 0.05          # kg*m^2, made up
    DT = 0.01               # seconds per simulation step

    def __init__(self, model, can_id, master_id=None):
        self.model, self.can_id = model, can_id
        self.master_id = can_id + 0x10 if master_id is None else master_id
        self.enabled, self.q, self.dq = False, 0.0, 0.0
        self.zero_offset = 0.0

    def set_zero(self):
        """Call the joint's present position zero, as the set-zero button in the vendor tool does."""
        self.zero_offset = self.q

    def feedback(self):
        p_max, v_max, t_max = LIMITS[self.model]
        q_i = float_to_uint(self.q - self.zero_offset, -p_max, p_max, 16)
        dq_i = float_to_uint(self.dq, -v_max, v_max, 12)
        tau_i = float_to_uint(0.0, -t_max, t_max, 12)
        return bytes([self.can_id & 0x0F, q_i >> 8, q_i & 0xFF, dq_i >> 4,
                      ((dq_i & 0xF) << 4) | (tau_i >> 8), tau_i & 0xFF, 31, 33])

    def handle(self, data):
        """Return the data of the reply to a command frame, or None if the motor stays silent."""
        if data == ENABLE:
            self.enabled = True
        elif data == DISABLE:
            self.enabled = False
        elif self.enabled:
            self._run(*unpack_mit(self.model, data))
        else:
            return None
        return self.feedback()

    def _run(self, q_des, dq_des, kp, kd, tau_ff, seconds=0.5):
        """Let the toy joint move for a while under the MIT control law."""
        _, v_max, t_max = LIMITS[self.model]
        for _ in range(int(seconds / self.DT)):
            tau = kp * (q_des + self.zero_offset - self.q) + kd * (dq_des - self.dq) + tau_ff
            tau = max(-t_max, min(tau, t_max))
            self.dq = max(-v_max, min(self.dq + tau / self.INERTIA * self.DT, v_max))
            self.q += self.dq * self.DT


def serve_once(bus, motors, timeout=0.05):
    """Let the pretend motors handle one frame from the bus. `motors` maps a CAN ID to a PretendMotor."""
    frame = bus.recv(timeout=timeout)
    if frame is not None and frame.arbitration_id in motors:
        motor = motors[frame.arbitration_id]
        reply = motor.handle(bytes(frame.data))
        if reply is not None:
            bus.send(can.Message(arbitration_id=motor.master_id, data=reply, is_extended_id=False))
```

**Step 5. Write the bring-up check.** For each CAN ID in a list, `bring_up` sends the enable frame, lets the pretend motors handle it, waits for the reply and judges it: no reply, a reply from the wrong Master ID, or a good reply with the temperatures. It then disables the motor again so that nothing is left running. Create `armlab/bringup.py`:

```python linenums="1"
"""A CAN bring-up check: ask each motor ID to answer, and report what came back."""

import can

from armlab.damiao import DISABLE, ENABLE, unpack_feedback
from armlab.pretend_damiao import serve_once


def bring_up(host, motor_bus, motors, models, can_ids, timeout=0.1):
    """Enable each CAN ID in turn, read the reply, disable it again, and return a report.

    Args:
        host: The python-can bus the program talks on.
        motor_bus: The pretend motors' bus (a real arm has no such thing; the motors are the wires' far end).
        motors: {CAN ID: PretendMotor}, the pretend motors.
        models: {CAN ID: model name}, which model the program expects at each ID.
        can_ids: The CAN IDs to try.
    """
    report = {}
    for can_id in can_ids:
        host.send(can.Message(arbitration_id=can_id, data=ENABLE, is_extended_id=False))
        serve_once(motor_bus, motors)
        reply = host.recv(timeout=timeout)
        if reply is None:
            report[can_id] = "no reply: check power, wiring, termination, bit rate and the CAN ID"
        elif reply.arbitration_id != can_id + 0x10:
            report[can_id] = (f"answered from 0x{reply.arbitration_id:02X}, expected 0x{can_id + 0x10:02X}: "
                              "fix the Master ID")
        else:
            info = unpack_feedback(models[can_id], bytes(reply.data))
            report[can_id] = (f"ok, position {round(info['q'], 2) + 0.0:+.2f} rad, "
                              f"drive {info['mos_c']} C, rotor {info['rotor_c']} C")
        host.send(can.Message(arbitration_id=can_id, data=DISABLE, is_extended_id=False))   # leave it off
        serve_once(motor_bus, motors)
        host.recv(timeout=0.01)                                                             # discard the reply
    return report
```

**Step 6. Run it on an arm with faults.** The pretend arm has motors 1 to 4 and 7 in order. Motor 5 is "unplugged", and motor 6 was given a wrong Master ID (0x26). The check also tries ID 8, which no motor owns. The script then moves motor 4 to 1.0 rad twice, once with a soft joint (\( K_p = 5 \), \( K_d = 0.5 \)) and once with a stiff one (\( K_p = 60 \), \( K_d = 2 \)). Create `bringup_demo.py`:

```python linenums="1"
"""Bring up a pretend reBot-DevArm B601-DM bus with three faults, then move one motor in MIT mode."""

import can

from armlab.bringup import bring_up
from armlab.damiao import pack_mit, unpack_feedback
from armlab.pretend_damiao import PretendMotor, serve_once

MODELS = {1: "DM4340P", 2: "DM4340P", 3: "DM4340P", 4: "DM4310", 5: "DM4310", 6: "DM4310", 7: "DM4310"}

# The pretend arm: motor 5 is unplugged, and motor 6 was given a wrong Master ID (0x26 instead of 0x16).
motors = {i: PretendMotor(MODELS[i], i) for i in (1, 2, 3, 4, 7)}
motors[6] = PretendMotor("DM4310", 6, master_id=0x26)

with can.Bus(channel="rebot", interface="virtual") as host, \
        can.Bus(channel="rebot", interface="virtual") as motor_bus:
    print("1. Bring-up check")
    for can_id, message in bring_up(host, motor_bus, motors, MODELS, range(1, 9)).items():
        print(f"   motor {can_id}: {message}")

    print("2. Move motor 4 to 1.0 rad with a soft joint, then a stiff one")
    for kp, kd in ((5.0, 0.5), (60.0, 2.0)):
        host.send(can.Message(arbitration_id=4, data=bytes([0xFF] * 7 + [0xFC]), is_extended_id=False))
        serve_once(motor_bus, motors)
        host.recv(timeout=0.1)
        motors[4].q = motors[4].dq = 0.0
        host.send(can.Message(arbitration_id=4, data=pack_mit("DM4310", 1.0, 0.0, kp, kd, 0.0),
                              is_extended_id=False))
        serve_once(motor_bus, motors)
        info = unpack_feedback("DM4310", bytes(host.recv(timeout=0.1).data))
        print(f"   kp={kp:>5}, kd={kd}: after 0.5 s the joint is at {info['q']:.3f} rad, speed {info['dq']:+.2f} rad/s")
```

```bash
python bringup_demo.py
```

```text
1. Bring-up check
   motor 1: ok, position +0.00 rad, drive 31 C, rotor 33 C
   motor 2: ok, position +0.00 rad, drive 31 C, rotor 33 C
   motor 3: ok, position +0.00 rad, drive 31 C, rotor 33 C
   motor 4: ok, position +0.00 rad, drive 31 C, rotor 33 C
   motor 5: no reply: check power, wiring, termination, bit rate and the CAN ID
   motor 6: answered from 0x26, expected 0x16: fix the Master ID
   motor 7: ok, position +0.00 rad, drive 31 C, rotor 33 C
   motor 8: no reply: check power, wiring, termination, bit rate and the CAN ID
2. Move motor 4 to 1.0 rad with a soft joint, then a stiff one
   kp=  5.0, kd=0.5: after 0.5 s the joint is at 1.061 rad, speed -0.80 rad/s
   kp= 60.0, kd=2.0: after 0.5 s the joint is at 0.999 rad, speed -0.01 rad/s
```

The check found the two faults, told you what to look at for each, and passed the good motors. Compare the two moves. After half a second the stiff joint has arrived at 0.999 rad and stopped, and the soft one has overshot to 1.061 rad and is still moving. A larger \( K_p \) pulls harder toward the goal, and a larger \( K_d \) brakes harder, which is the trade-off of Chapter 5, now set by two numbers in eight bytes.

!!! mascot-tip "Run the Bring-Up Check Every Session"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Make the bring-up check the first thing your program does, and have it stop before any command if a motor fails to answer. A silent motor on a live arm is much easier to deal with before a move than in the middle of one.

**Step 7. Zero a joint.** The pretend motor has a `set_zero` method that stands in for the vendor tool's set-zero: it makes the present position the new zero. The script leaves a joint 0.37 rad from where zero should be, reads it, zeroes it, reads it again, and then commands +0.5 rad. Create `zero_demo.py`:

```python linenums="1"
"""Zero a pretend joint: the same pose reads 0.00 rad afterwards, and moves are measured from it."""

import can

from armlab.damiao import DISABLE, ENABLE, pack_mit, unpack_feedback
from armlab.pretend_damiao import PretendMotor, serve_once

motor = PretendMotor("DM4310", 4)
motor.q = 0.37                       # the joint was left 0.37 rad from where we want zero to be
motors = {4: motor}


def talk(host, motor_bus, data):
    """Send one frame to motor 4 and return its decoded feedback."""
    host.send(can.Message(arbitration_id=4, data=data, is_extended_id=False))
    serve_once(motor_bus, motors)
    return unpack_feedback("DM4310", bytes(host.recv(timeout=0.1).data))


with can.Bus(channel="zero", interface="virtual") as host, can.Bus(channel="zero", interface="virtual") as motor_bus:
    print(f"before zeroing: reads {talk(host, motor_bus, ENABLE)['q']:+.2f} rad")
    motor.set_zero()
    print(f"after zeroing:  reads {round(talk(host, motor_bus, ENABLE)['q'], 2) + 0.0:+.2f} rad")
    after = talk(host, motor_bus, pack_mit("DM4310", 0.5, 0.0, 60.0, 2.0, 0.0))
    print(f"command +0.5 rad: reads {after['q']:+.2f} rad, and the joint itself is at {motor.q:.2f} rad")
    talk(host, motor_bus, DISABLE)
```

```bash
python zero_demo.py
```

```text
before zeroing: reads +0.37 rad
after zeroing:  reads +0.00 rad
command +0.5 rad: reads +0.50 rad, and the joint itself is at 0.87 rad
```

After zeroing, the same physical pose reads 0.00 rad, and a command of +0.50 rad moves the joint by 0.50 rad from there, so the joint itself ends at 0.87 rad on the motor's own scale. That difference of 0.37 rad is the zero offset. On a real motor the offset lives in the motor, and a motor that has been taken apart will need it set again.

**Step 8. Compare the wires at three voltages.** The script uses `wire_drop_v` from Chapter 3 to find what 200 W loses in 1 m of AWG 18 at 12, 24 and 48 V, checks each current against the wire's teaching limit, and then checks the headroom above the Damiao under-voltage setting. Create `drop_demo.py`:

```python linenums="1"
"""The same power at different voltages: what the wires lose, and what reaches the motors."""

from armlab.power import wire_drop_v

POWER_W = 200            # an illustrative peak draw for a whole arm
AWG, ONE_WAY_M = 18, 1.0
AWG_LIMIT_A = {14: 15, 16: 10, 18: 7, 20: 5, 22: 3, 24: 2}      # the teaching limits from Chapter 3
UNDER_VOLTAGE_V = 15     # the Damiao drive stops below this, from Seeed's wiki

print(f"{POWER_W} W through {ONE_WAY_M:g} m of AWG {AWG} (lead and return), wire limit {AWG_LIMIT_A[AWG]} A")
for volts in (12, 24, 48):
    amps = POWER_W / volts
    drop = wire_drop_v(amps, ONE_WAY_M, AWG)
    verdict = "ok" if amps <= AWG_LIMIT_A[AWG] else "TOO MUCH CURRENT for this wire"
    print(f"  {volts:>2} V: {amps:>5.1f} A, wires lose {drop:>4.2f} V ({100 * drop / volts:>3.1f}%), "
          f"motors get {volts - drop:>5.2f} V, {verdict}")

print(f"Headroom above the Damiao under-voltage setting of {UNDER_VOLTAGE_V} V:")
for volts in (24, 48):
    reaching = volts - wire_drop_v(POWER_W / volts, ONE_WAY_M, AWG)
    print(f"  {volts} V supply: {reaching:.2f} V at the motors, {reaching - UNDER_VOLTAGE_V:.2f} V above the limit")
```

```bash
python drop_demo.py
```

```text
200 W through 1 m of AWG 18 (lead and return), wire limit 7 A
  12 V:  16.7 A, wires lose 0.70 V (5.8%), motors get 11.30 V, TOO MUCH CURRENT for this wire
  24 V:   8.3 A, wires lose 0.35 V (1.5%), motors get 23.65 V, TOO MUCH CURRENT for this wire
  48 V:   4.2 A, wires lose 0.17 V (0.4%), motors get 47.83 V, ok
Headroom above the Damiao under-voltage setting of 15 V:
  24 V supply: 23.65 V at the motors, 8.65 V above the limit
  48 V supply: 47.83 V at the motors, 32.83 V above the limit
```

The loss falls as the voltage rises, as the chapter showed. Look at the verdicts. At 24 V the loss is only 1.5 percent and the headroom over 15 V is large, yet the script still reports "TOO MUCH CURRENT" because 8.3 A is above the 7 A limit of AWG 18. The wire has to be chosen for the *heat* as well as the *drop*, which is the two-rule test of Chapter 3's MicroSim. AWG 16, with a limit of 10 A, would pass.

**Step 9. Record your work.**

```bash
git add .
git commit -m "Add Damiao MIT frames, pretend motors, CAN bring-up check, and zeroing"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python mit_demo.py` prints the bytes `8a 3c 7f f0 a3 33 37 ff`.
- `python bringup_demo.py` reports motor 5 as no reply, motor 6 as a wrong Master ID, and motors 1 to 4 and 7 as ok.
- `python zero_demo.py` shows `after zeroing:  reads +0.00 rad`.
- `python drop_demo.py` shows `TOO MUCH CURRENT for this wire` for 12 V and 24 V and `ok` for 48 V.
- Earlier scripts (`bus_demo.py`, `calibrate_demo.py`) still run.
- `git log --oneline` shows a ninth commit.

### Challenge: Rank the Arms

Write `compare.py` with a weighted decision matrix for the three arms, using the five criteria and the scores from the Platform Chooser MicroSim. A function `rank(weights)` takes a dictionary of weights and returns the arms ordered by weighted total. Rank them for a school class (cost 5, payload 1, easy to learn 4, software 3, simple power 5) and for a lab that lifts 2 kg (cost 1, payload 5, easy to learn 1, software 3, simple power 1). Is the second answer trustworthy?

??? note "Click to see one solution"
    A dictionary of scores for each arm, and a sum of weight times score, give the totals. The `sorted` call with `reverse=True` puts the best first:

    ```python linenums="1"
    """Rank the three arms with a weighted decision matrix."""

    # Scores from 1 (worst) to 5 (best) are the author's judgments, not measurements.
    SCORES = {
        "SO-ARM101":     {"cost": 5, "payload": 1, "easy to learn": 5, "software": 4, "simple power": 5},
        "reBot B601-DM": {"cost": 2, "payload": 3, "easy to learn": 3, "software": 5, "simple power": 3},
        "reBot B601-RS": {"cost": 1, "payload": 5, "easy to learn": 2, "software": 3, "simple power": 2},
    }


    def rank(weights):
        """Return [(arm, weighted total)] with the best first. weights maps a criterion to 0..5."""
        totals = {arm: sum(weights[c] * s for c, s in scores.items()) for arm, scores in SCORES.items()}
        return sorted(totals.items(), key=lambda item: item[1], reverse=True)


    for title, weights in [
        ("A school class", {"cost": 5, "payload": 1, "easy to learn": 4, "software": 3, "simple power": 5}),
        ("A lab that lifts 2 kg", {"cost": 1, "payload": 5, "easy to learn": 1, "software": 3, "simple power": 1}),
    ]:
        print(title)
        for arm, total in rank(weights):
            print(f"   {arm:<14}{total:>4}")
    ```

    ```text
    A school class
       SO-ARM101       83
       reBot B601-DM   55
       reBot B601-RS   37
    A lab that lifts 2 kg
       reBot B601-RS   39
       reBot B601-DM   38
       SO-ARM101       32
    ```

    The school class gets a clear answer. The second answer is not trustworthy as it stands: the B601-RS leads the B601-DM by one point, which a small change of weights would reverse, even though the B601-DM *cannot* lift 2 kg at all, since its payload is 1.5 kg. A requirement should remove an arm before any weights are added. Add a `payload_kg` field and a `min_payload_kg` argument, drop every arm below it, and only then rank what is left: with a 2 kg requirement only the B601-RS survives, and no weights are needed.

## Summary and Key Takeaways

You can now bring up a reBot-DevArm and choose between the arms.

- The reBot-DevArm comes as the **B601-DM** (Damiao motors, 24 V, 1.5 kg payload) and the B601-RS (RobStride motors, 48 V, 2.5 kg). The **B601 body structure** is 3D-printed and CNC-machined aluminum parts, and the **reBot wrist assembly** and **reBot gripper assembly** use the smaller DM4310 motors.
- A **24 V to 48 V system** needs less current for the same power, so a **power distribution board** and **high-voltage power distribution** handle it with no hot-plugging, a fuse and an E-stop that you add yourself, since the published bills of materials list none. **Reverse polarity protection** keeps a backwards supply from doing harm.
- **Voltage drop** falls with higher voltage: 200 W in AWG 18 loses 5.8 percent at 12 V and 0.4 percent at 48 V. A **brown-out** is a dip below what the electronics need, and the Damiao motors stop below 15 V. A wire must pass both the drop and the current limit.
- **CAN motor configuration** sets the **motor ID assignment** (a CAN ID and a Master ID equal to the CAN ID plus 0x10), one motor at a time, and the **motor mode selection** (MIT, position-velocity or velocity). An MIT frame packs a 16-bit position and four 12-bit fields into 8 bytes. **Quasi-direct drive** uses a low gear ratio so that the joint can be pushed back.
- The **CAN bring-up check** tests the terminators, the bit rate and each ID, and **zeroing** stores a **zero offset** that defines the arm's zero pose.
- The **arm comparison** finds the SO-ARM101 cheapest, easiest and lightest in payload, and the reBot-DevArm stronger, with a bigger software ecosystem, at about four times the cost. The **cost comparison**, the **payload comparison** (\( \tau = m g r \)) and the **learning curve** feed the **platform selection criteria**: filter by requirements first, then weigh preferences.

!!! mascot-celebration "You Can Set Up and Choose Between Both Arms!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just learned how a CAN motor is configured and brought up, packed a command into eight bytes and read it back, worked out what the wires lose at 12, 24 and 48 volts, and compared two arms with numbers instead of hunches. That is the end of the build. From Chapter 10 on, we write the Python that makes either arm move. Let's move it!

### Self-Check Questions

Test yourself before you move on. Click each question to reveal an answer.

??? question "1. A motor's CAN ID is 0x03. What Master ID should it have, and why must you never use 0x00?"
    The Master ID should be the CAN ID plus 0x10, which is 0x13. The wiki says never to set it to 0x00. A distinct Master ID per motor lets the host tell the replies apart, because every reply is a frame with that identifier.

??? question "2. A DM4310 is asked for \( K_p = 100 \). What 12-bit integer is sent?"
    \( K_p \) ranges from 0 to 500 in 12 bits, so the integer is \( 100 \times 4095 / 500 = 819 \) exactly, or `0x333`.

??? question "3. Why does a 48 V arm lose less in its wires than a 12 V arm of the same power?"
    Power is voltage times current, so at four times the voltage the current is four times smaller. The voltage lost in a wire is the current times its resistance, so it falls four times in volts, and as a percentage of the supply it falls sixteen times, because the supply is also four times larger.

??? question "4. A 24 V arm shows only 1.5 percent loss in its wires, but the wire is still too thin. How can that be?"
    The wire has two limits. One is the voltage drop, and the other is the heat from the current, which sets the largest current the wire may carry. A wire can pass the first and fail the second, as AWG 18 does at 8.3 A against its 7 A limit.

??? question "5. The bring-up check reports 'answered from 0x26, expected 0x16'. What is wrong and how do you fix it?"
    The motor's Master ID was set to 0x26 instead of 0x16, so its replies come from the wrong identifier. Connect that one motor alone, set its Master ID to its CAN ID plus 0x10 in the vendor tool, write the parameters, and check again.

??? question "6. A project must hold 2 kg, and a weighted score puts the B601-DM first. What went wrong?"
    A hard requirement was treated as a weight. The B601-DM's payload is 1.5 kg, so it cannot meet the requirement, however well it scores on cost or software. The requirement should have been a filter that removed it before any weights were applied.

Chapter 10 turns to the software: a Python class for an arm, with the same methods for either of the two arms, so that the programs of the rest of the book run on whichever you chose.
