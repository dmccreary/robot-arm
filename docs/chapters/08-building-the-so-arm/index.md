---
title: "Building and Calibrating the SO-ARM100"
description: "How to build, power up and calibrate the SO-ARM101 from the open-source SO-ARM100 repository: preparing servos and setting their IDs, assembling the follower and leader arms, the first power-on, the calibration procedure and its file, and troubleshooting, with a Python lab that sets IDs, calibrates and runs pre-flight checks on a pretend bus."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 20:38:02"
version: 1.11
---

# Building and Calibrating the SO-ARM100

## Summary

This chapter walks through building the SO-ARM100 from the open-source repository. You will prepare and test servos, assemble the follower and leader arms, power on for the first time, calibrate, and troubleshoot common faults. After this chapter, you will have a working, calibrated arm pair.

## Concepts Covered

This chapter covers the following 30 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Servo Bus Controller Board | 25 |
| Servo Preparation | 24 |
| Setting Servo IDs | 22 |
| Servo Testing | 20 |
| Open-Source Repository | 15 |
| Assembly Guide | 12 |
| Follower Assembly | 10 |
| Troubleshooting | 9 |
| Safe Shutdown | 8 |
| Calibration | 8 |
| Safety Checklist | 6 |
| Cable Routing | 6 |
| First Power-On | 5 |
| Calibration Procedure | 4 |
| Servo Overheating | 4 |
| Leader Gear Ratios | 3 |
| Calibration File | 3 |
| Leader Assembly | 2 |
| Repository Version History | 1 |
| Setting Baud Rate | 1 |
| Leader Handle and Trigger | 1 |
| Joint Assembly Order | 1 |
| Mounting to a Table | 1 |
| Homing Position | 1 |
| Range of Motion Limits | 1 |
| Calibration Drift | 1 |
| Servo Not Found | 1 |
| Jitter | 1 |
| Loose Gears | 1 |
| Intermittent Wiring | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 4: Serial and CAN Communication](../04-serial-and-can-communication/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 6: Sourcing Parts and Planning a Budget](../06-sourcing-parts-and-budget/index.md)
- [Chapter 7: 3D Printing, Fasteners, and Tools](../07-printing-fasteners-and-tools/index.md)

---

!!! mascot-welcome "Time to Put Me Together!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    This is the chapter where the box of parts becomes a robot arm that copies your hand. You will give every servo its name, assemble two arms, wake them up safely, and teach them where "straight ahead" is. Let's move it!

For seven chapters you have learned how an arm works, how to power it, how to talk to it, and where to get one. Now you build one. The parts are on the table: the printed frame from Chapter 7, the motor kit from Chapter 6, a control board, cables, and a power supply. The result will be a pair of arms. The **follower** is the arm that does the work, and the **leader** is the arm that you move by hand while the follower copies it (Chapter 2).

The build has four stages, and the order matters. First you prepare the servos, which means giving each one a unique ID on the bus while it is still alone, because that is hard to do after the arm is assembled. Then you assemble the follower and the leader. Then you power on for the first time, under the checklist of Chapter 3. Last you calibrate, so that the numbers the leader reports mean the same thing as the numbers the follower understands. The chapter ends with a guide to the faults that builders meet most.

Everything here follows the open-source instructions, and those instructions change. Where the chapter quotes a command or a file name it says where it came from and when it was read (2026-10-07), so that you can check for newer versions.

## The Open-Source Repository

### Where the Instructions Live

An **open-source repository** is a public project folder, kept under version control with Git (Chapter 1), that holds the design files, parts lists and instructions for a piece of hardware or software, together with a license that lets you use and change them. Two repositories matter for this build.

The SO-ARM100 repository, from The Robot Studio at `github.com/TheRobotStudio/SO-ARM100`, holds the hardware: the printable STL files, the bill of materials (Chapter 6), the printing instructions (Chapter 7), and links to purchasing. It is released under the Apache 2.0 license. Its README describes the SO-101 as the next-generation version of the SO-100, with improved wiring, easier assembly (no gear removal), and updated motors for the leader arm, and it marks the SO-100's own documentation as deprecated. The repository kept the name SO-ARM100 for both, which is why this book writes "SO-ARM101" for the arm and "the SO-ARM100 repository" for where it comes from.

The LeRobot repository, from Hugging Face at `github.com/huggingface/lerobot`, holds the software. Its SO-101 page is the **assembly guide**: the step-by-step instructions for setting up the motors, assembling each joint with the screws for it, calibrating, and teleoperating. The LeRobot page sends you to the hardware README for the parts list and the printing instructions, and holds the assembly steps itself. The guide includes a short video for each joint, and you should watch the video for a joint before you assemble it, since a photograph shows what the finished joint looks like and a video shows how it goes together.

### Repository Version History

The **repository version history** is the record of what changed and when, and it matters because these projects move quickly. Git records every change as a *commit*, and a *tag* gives a name to one commit, such as a release. The SO-ARM100 repository, read on 2026-10-07, had a latest commit that day (`a758567c`) and only one tag, `v0.1.1`. Its changelog stops at version 0.1.13 on 2025-01-27 and describes the SO-100 era, so the repository does not record when the SO-101 appeared. LeRobot, read the same day, was at a development version labeled 0.6.2, with 0.6.1 (released 2026-08-03) the latest numbered release.

Three changes in LeRobot's history show why you should record the version you built with. The code for the SO-101 follower used to live in a folder named `so101_follower`, and now the SO-100 and SO-101 share one class in a folder named `so_follower`, though the command-line names `so101_follower` and `so101_leader` still work. The setting `use_degrees`, which chooses whether joint angles are reported in degrees, was off by default in version 0.4.3 and on in version 0.5.1 and later. And the install instructions now require Python 3.12. A forum post from a year ago may be right for the version it was written about and wrong for yours.

!!! mascot-tip "Write Down Your Versions"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    When your arm works, run `pip show lerobot` and write the version in your build notes, together with the date. If something breaks after an update, you will know exactly what changed, and you can install the old version again to get back to a working arm.

To install the software, create a clean environment as in Chapter 1, then follow the LeRobot installation page. At the time of reading the steps were:

```bash
conda create -y -n lerobot python=3.12
conda activate lerobot
git clone https://github.com/huggingface/lerobot.git
cd lerobot
pip install -e ".[core_scripts]"
pip install -e ".[feetech]"
```

The `feetech` extra installs the Feetech servo library (`feetech-servo-sdk`), which is the vendor SDK of Chapter 4, and the `core_scripts` extra installs the command-line tools used below. The SO-101 page itself lists only the second line, so if a command is missing, check the installation page.

## Before You Power Anything

A **safety checklist** is a short written list of checks that you do the same way every time. Chapter 3 gave you the seven-step safe power-up sequence. For this arm, five extra checks come first, and each one is the answer to a mistake that real builders have made.

| Check | How | Why it matters |
|---|---|---|
| The supply matches the motors | Read the voltage on the supply, the board and the motor label. Measure the supply's output with a multimeter set to DC volts | A follower with 7.4 V motors uses a 5 V supply, and a 12 V motor needs a 12 V supply of 5 A or more. The leader is always 7.4 V. A builder reported a "12 V" adapter that measured about 16 V, and the servos went into protection and would not turn on |
| The board's jumpers are on B | Look at the Waveshare control board | The two jumpers must be on channel B (USB). Position A is for a microcontroller's serial port |
| Every servo has its own ID | Scan the bus (the lab) | Two servos with one ID answer at the same time and corrupt each other's replies |
| Cables are seated and not strained | Push each plug in and look at the bends | A loose cable is the most common fault (see Troubleshooting) |
| The arm is parked and the area clear | Follow Chapter 3's steps 1 and 4 | A joint can sag or swing when the torque first comes on |

The first row uses the multimeter from Chapter 7. The Waveshare maker's own page says the board's input voltage must match the servo voltage, and the input range it lists does not obviously agree with the 5 V supply that the parts list gives for the 7.4 V motors. Because the sources disagree, use exactly the supply that your kit's parts list names, never swap supplies between arms, and ask the seller if you are unsure.

**Safe shutdown** is the reverse. Return the arm to a resting pose, turn the torque off so the joints go loose, switch off the supply, and only then unplug anything. The follower is designed for this: by default LeRobot turns the torque off when the program disconnects, which means an arm that was holding a pose goes limp. Support the arm with a hand, or park it folded, before you disconnect, as Chapter 3 advised.

## Servo Preparation

### The Servo Bus Controller Board

A **servo bus controller board** connects the computer to the bus of servos. The one in the SO-ARM100 parts list is the Waveshare Bus Servo Adapter. It has a USB-C socket to the computer, a barrel jack for the 5.5 × 2.1 mm power plug, and several three-pin sockets for the servo cables. Inside, it converts the USB serial signal into the half-duplex TTL signal of Chapter 4 and feeds the power to the servos. The two jumpers choose the source of the signal: on channel B the board takes its commands from the USB port. You need one board for each arm.

### Servo Preparation, Testing, and IDs

**Servo preparation** is everything done to a servo before it goes into the frame: checking that it is the right model and gear ratio, giving it its ID and baud rate, and testing that it answers. Doing this on the bench, one servo at a time, is far easier than finding a bad servo after the arm is built. The Waveshare maker's advice is the same: set the IDs before assembly, because taking the cables apart afterwards is troublesome.

Start with the checks from Chapter 6. Compare the label on each servo with the parts list, and sort the servos by gear ratio into two piles, because the follower uses six 1/345 servos and the leader uses a mix. Chapter 6's arrival check can read the model number from each servo.

**Setting servo IDs** is the step that makes the shared bus work. The packets of Chapter 4 begin with the ID of the servo they are meant for. Every new STS3215 servo comes with the same ID, 1, so if you connect six new servos at once they all answer to ID 1, and nothing works. You therefore connect **one servo at a time** to the board, give it its ID, mark it, and set it aside. The ID is stored in the servo's EEPROM (memory that keeps its contents without power), so you need to do this only once for each servo. A servo taken from another project often carries an old ID and needs the same treatment.

LeRobot automates the job with a command that asks for each motor in turn. For the follower:

```bash
lerobot-setup-motors \
    --robot.type=so101_follower \
    --robot.port=/dev/tty.usbmodem585A0076841
```

and for the leader:

```bash
lerobot-setup-motors \
    --teleop.type=so101_leader \
    --teleop.port=/dev/tty.usbmodem575E0031751
```

The port is the name of the board's serial port. The command `lerobot-find-port` finds it with the unplug trick from Chapter 4: it lists the ports, asks you to unplug the board's USB cable, lists them again, and reports the one that disappeared. On a Mac the name looks like `/dev/tty.usbmodem...`, on Linux `/dev/ttyACM0`, and on Windows `COM3`. On Linux you may also need to let your account use the port, which the LeRobot guide does with `sudo chmod 666 /dev/ttyACM0`; that setting is lost at the next reboot.

The command works from the gripper back to the shoulder. For each joint it prints "Connect the controller board to the '<name>' motor only and press enter." You connect that single motor, press Enter, and it prints a line such as "'gripper' motor id set to 6". The IDs and the joints they belong to are fixed:

| Joint | ID | Follower servo | Leader servo (gear ratio) |
|---|---|---|---|
| shoulder_pan | 1 | 1/345 | 1/191 |
| shoulder_lift | 2 | 1/345 | 1/345 |
| elbow_flex | 3 | 1/345 | 1/191 |
| wrist_flex | 4 | 1/345 | 1/147 |
| wrist_roll | 5 | 1/345 | 1/147 |
| gripper | 6 | 1/345 | 1/147 |

Inside, the command does what Chapter 4 taught you to do by hand. It looks for the one motor on the bus by trying the possible baud rates and pinging, turns the torque off, writes the new ID to the `ID` register at address 5, and writes the `Baud_Rate` register at address 6. It raises an error if it finds no motor, and an error if the motor it finds has a model number different from the one expected, which is a way to catch a wrong part.

**Setting baud rate** is the second write. The factory baud rate of the STS3215 is 1,000,000, and LeRobot's default is the same. The register holds a code and not the number itself, in this table from LeRobot:

| Baud rate | 1,000,000 | 500,000 | 250,000 | 128,000 | 115,200 | 57,600 | 38,400 | 19,200 |
|---|---|---|---|---|---|---|---|---|
| Register code | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |

Leave the rate at 1,000,000. Every device on one bus must agree (Chapter 4), and the rest of the book assumes it.

!!! mascot-warning "One Servo at a Time"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    If the setup command says it cannot find a motor, or finds the wrong one, the usual cause is two servos on the board at once, or none. Unplug everything except the cable to the motor it named, and run the step again. Then check the supply, the USB cable and the three-pin cable, in that order, and make sure the jumpers are on B.

**Servo testing** is the last preparation step. With the servo connected alone, scan the bus, read the model number, read the voltage and temperature, and move it a small amount by hand (with the torque off, it turns freely) or by a small command to see that the position reading changes. If it passes, put a label on it with its ID and its gear ratio. The sequence of the whole step is practised in the first MicroSim of the chapter.

#### Diagram: Servo ID Setup Sequencer

<details markdown="1">
<summary>Servo ID Setup Sequencer</summary>
Type: microsim
**sim-id:** servo-id-setup-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the eight steps of setting one servo's ID into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts.

**Prerequisites:** servo bus controller board, setting servo IDs, setting the baud rate, serial port, EEPROM (all defined in the section above this block and in Chapter 4).

**Evidence of Mastery:** The learner arranges eight shuffled step cards into an order and presses Check. An arrangement is scored by the number of cards in their correct position, as given in the Position column in Content. Mastery is 7 or more of 8 cards in the correct position within three attempts. Reading the explanations of the steps in Explore mode is exploration, not evidence.

**Misconceptions:** (1) All six servos can be connected and given IDs together. (They all start with ID 1, so they must be connected one at a time.) (2) The ID is lost when the power is switched off. (It is stored in EEPROM and kept.) (3) The order of motors does not matter. (The command asks for the gripper first and the shoulder pan last, and each ID is tied to a joint.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to structure the parts of a procedure by their dependencies. Ordering shuffled cards forces the learner to reason about which step must come before which, and the count of correct positions shows which dependency was missed.

**Content:**

The eight steps, with the correct position of each:

| Position | Step | Why it goes here (shown as feedback) |
|---|---|---|
| 1 | Find the board's serial port with lerobot-find-port. | The setup command needs the port name, so you find it first. |
| 2 | Connect the power supply and the USB cable to the control board, with the jumpers on channel B. | The board must be powered and linked to the computer before it can talk to a servo. |
| 3 | Run lerobot-setup-motors with the robot type and the port. | The command is what writes the IDs, and it begins by asking for the first motor. |
| 4 | When it names a motor, connect that one servo, and only that one, to the board. | All new servos have ID 1, so two on the bus would answer at once. |
| 5 | Press Enter. | The command only starts looking for the motor after you confirm that it is connected. |
| 6 | Read the confirmation line "motor id set to" with the number. | The line confirms that the ID was written, so you know that this servo is done. |
| 7 | Label the servo with its ID and put it aside. | An unlabeled servo cannot be told apart from the others later. |
| 8 | Repeat for the next motor, in the order the command asks: gripper, wrist roll, wrist flex, elbow flex, shoulder lift, shoulder pan. | The command works from joint 6 back to joint 1, so the order is part of the procedure. |

**Provenance:** The steps and their order are from the chapter section "Servo Preparation, Testing, and IDs", which follows the LeRobot SO-101 guide read on 2026-10-07 (the commands, the prompts and the order gripper to shoulder pan).

**Rules:** An arrangement has exactly one correct order, the one in the Position column. The score is the number of cards whose position equals their correct position. Mastery is a score of 7 or 8. The three attempts are separate: each attempt starts from the card order the learner left.

**Learner Activity:**

1. In Explore mode the learner reads the eight steps in the correct order, each with its explanation.
2. The learner switches to the exercise. The eight cards are shown in a shuffled order.
3. The learner moves the cards into the order they would do them and presses Check.
4. The sim shows the score and marks the cards that are in a wrong position, without revealing the right place for each. The learner can rearrange and check again, up to three attempts in all.
5. After the last attempt, or after a score of 8, the sim shows the correct order with the explanations.

**Feedback:** One exercise, up to three attempts. After each attempt: "<n> of 8 cards are in the right place." and the wrong cards are marked. After a score of 7 or 8: "Mastery reached." After the third attempt with a score below 7, the correct order is shown with the explanations, and the exercise counts as missed.

**Starting State:** Explore mode with the correct order shown, and the prompt "Put the steps in the order you would do them." ready for the exercise.

**Chapter Anchors:** The chapter says the command works from the gripper back to the shoulder, that the servos must be connected one at a time because new servos all have ID 1, and that the ID is stored in EEPROM. The sim has eight steps, three attempts, and mastery is 7 of 8 in the correct position.
</details>

## Assembling the Arms

### The Assembly Order

The **assembly guide** builds the arm from the base upward, one joint at a time, which is the **joint assembly order**: joint 1 (shoulder pan), joint 2 (shoulder lift), joint 3 (elbow flex), joint 4 (wrist flex), joint 5 (wrist roll), then the gripper. Working in this order means that each joint's motor is fixed to a part that is already in place, and that you can put one three-pin cable into each motor as you place it, as the guide says, before the next part covers the socket. Before you start, remove all support material from the printed parts with a small screwdriver, and pick the screws out into dishes by size (Chapter 7).

### Follower Assembly

**Follower assembly** repeats one pattern for each joint. Fit the two horns to the motor (the top one with an M3 × 6 screw, and the bottom one with none), slide the motor into its pocket in the frame, fasten it with M2 × 6 screws, and then fasten the next frame part to the horns with M3 × 6 screws. The table lists the screws that the LeRobot guide gives for each joint. All of the screws are the M2 × 6 and M3 × 6 of Chapter 7.

| Joint | What goes in | Screws given in the guide |
|---|---|---|
| 1 shoulder pan | Motor 1 into the base, then the first motor holder, then the shoulder | 4 M2 × 6 for the motor, 2 M2 × 6 for the holder, 4 M3 × 6 on top and 4 underneath for the shoulder |
| 2 shoulder lift | Motor 2 from above, then the upper arm | 4 M2 × 6 for the motor, 4 M3 × 6 on each side for the arm |
| 3 elbow flex | Motor 3, then the forearm | 4 M2 × 6 for the motor, 4 M3 × 6 on each side for the forearm |
| 4 wrist flex | Motor holder, then motor 4 | 4 M2 × 6 for the motor |
| 5 wrist roll | Motor 5 into the wrist holder, with one horn only, then the wrist | 2 M2 × 6 at the front, 1 M3 × 6 for the horn, 4 M3 × 6 on each side to join the wrist to motor 4 |
| Gripper | Gripper body on motor 5, the gripper motor, then the moving claw | 4 M3 × 6 for the body, 2 M2 × 6 on each side for the motor, 4 M3 × 6 on each side for the claw |

Count the M2 × 6 screws in the table: \( 4 + 2 + 4 + 4 + 4 + 2 + 4 = 24 \), which is the "about two dozen" of Chapter 7. Counting the M3 × 6 gives a number in the forties to fifties, depending on how you count the horn screws, which is why Chapter 7 said to count your kit.

Wrist roll and the gripper are different in one way: joint 5 has only one horn, and the gripper is carried by it. Take care at every joint to stop turning each screw when it is snug, as the warning in Chapter 7 says.

!!! mascot-neutral "Watch the Videos"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    The LeRobot guide has a short video for every joint and for the leader. Watch each one just before you build that joint, and pause it as you work. It shows the direction each part faces, which a table of screws cannot.

### Cable Routing and Mounting to a Table

**Cable routing** is the path of the cables through the arm. The guide's only rule is to plug in one three-pin cable per motor as you go, and the repository gives no routing instructions, so Chapter 7's cable habits apply. The motors are connected in a chain, from the board to motor 1, then motor 2, and so on to motor 6, and the first motor (the shoulder pan, ID 1) is the one connected to the board, which sits in the base. Leave slack at each joint, and before tying anything down, move each joint by hand, torque off, through its whole range while you watch the cable. A cable that stays slack at both ends of the range is routed well. A cable that goes tight at one end will break there, and it will be the intermittent fault described at the end of this chapter.

**Mounting to a table** keeps the arm from sliding or tipping when it moves, since the base feels the reaction of every motion. The parts list gives table clamps, two for a follower and four for a pair of arms, and LeRobot's own diagrams show the base on a C-clamp at a table edge. Clamp it before the first power-on, and check the clamp again after the first few moves, because vibration loosens it.

### Leader Assembly

The **leader assembly** is the same as the follower for joints 1 to 5, with different servos and a different end. The **leader gear ratios** are the mix in the table above: three gear ratios in one arm, so the leader can hold up its own weight and still be moved by a hand without much force (the reason given in LeRobot's guide, and Chapter 2's). The parts list for a pair has seven servos of ratio 1/345 (six for the follower and one for the leader), two of 1/191 and three of 1/147, which matches the three servo lines of the parts table in Chapter 6. The follower is therefore six servos of one type, and the leader is six servos of three types. If a leader joint is built with the wrong servo, it will still work, but it will feel too stiff or too light, so check the label against the table as you place each motor.

The **leader handle and trigger** replace the gripper. A leader holder is fixed to the wrist with 4 M3 × 6 screws, the handle is fixed with 1 M2 × 6, and the trigger, the printed part that you squeeze to close the follower's gripper, is fastened with 4 M3 × 6. The leader's sixth motor sits in the handle: it is fastened with 2 M2 × 6 screws on each side, and it carries a horn with an M3 × 6 horn screw. The leader's motors are always the 7.4 V type, so the leader never needs the 12 V supply that a 12 V follower would.

## Powering On and Calibrating

### First Power-On

The **first power-on** is the moment mistakes in wiring show up, so it follows the checklists in a fixed order. Do it with an adult present if you are under 16. First complete the five checks of the safety checklist and the seven steps of Chapter 3. Then check the arm in software before you give it a command: a **pre-flight check** that scans the bus, reads each servo's voltage and temperature, and confirms that every servo answers. The lab at the end of the chapter writes one. The voltage a servo reports is a handy second check on the supply: it should be close to what your multimeter read.

Keep the first movement small and slow: enable one joint, move it a few degrees, and watch. The speed and distance limits of Chapter 5 apply from the first command. In LeRobot the follower accepts a setting named `max_relative_target`, which limits how far a joint may be told to move in one step, and it is worth setting while you are still learning how the arm behaves.

### Two Different "Zeros"

Two ideas share the word "home" and they are easy to confuse. The **home position** of Chapter 2 is a pose you choose, a safe rest where the arm starts and ends. The **homing position** used in calibration is a different pose, which LeRobot asks you to set with every joint in the middle of its range of motion, so that the program can measure from it. The home pose is for safety. The homing position is for measuring. After you calibrate, you will choose a home pose for your own arm and save it in `config/arm.json`.

!!! mascot-thinking "Calibration Is a Shared Language"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Two arms with the same servos can still read 1200 and 1900 at the same pose, because each servo was clamped onto its horn at a slightly different angle. Calibration translates each arm's raw numbers into a common scale, so that "halfway" means halfway on both. The leader and follower can then agree about where they are, without being built identically.

### Calibration

**Calibration** is the procedure that finds, for every joint, the raw position that means "the middle" and the raw positions of the two ends of its travel, and stores them. The reason is the leader and follower pair. The LeRobot guide says calibration ensures that the two arms report the same values when they are in the same physical position, which is also what lets a neural network trained on one robot work on another (Chapter 14).

#### The Calibration Procedure

The **calibration procedure** has two steps, and you run it on each arm. For the follower:

```bash
lerobot-calibrate \
    --robot.type=so101_follower \
    --robot.port=/dev/tty.usbmodem58760431551 \
    --robot.id=my_awesome_follower_arm
```

and for the leader, with `--teleop.type=so101_leader`, `--teleop.port` and `--teleop.id=my_awesome_leader_arm`. The program turns the torque off, so every joint moves freely by hand, and then:

1. It asks you to move the arm to the position where all joints are in the middle of their ranges, and to press Enter. It reads each joint's position there. This is the homing position. It then computes the difference between that reading and 2047, the middle of the range 0 to 4095, and stores the difference in the servo's `Homing_Offset` register (address 31). From then on the servo reports its position as the actual position minus the offset, so the middle pose reads 2047 on every arm. The offset is stored in the servo's sign-and-magnitude format of Chapter 4, with the sign in bit 11.
2. It asks you to move every joint, one after another, through its **full range of motion** and to press Enter when done. While you move them, the program polls each position about fifty times a second and keeps the smallest and largest value for each joint. These become the **range of motion limits**, and they are stored in the servo's `Min_Position_Limit` and `Max_Position_Limit` registers (addresses 9 and 11). The wrist roll is not swept, because it can turn all the way round: its range is set to the whole 0 to 4095. If a joint did not move at all, so that its smallest and largest values are equal, the program stops with an error.

Notice what this does. Before calibration, a joint's number depends on how the horn happened to sit on the shaft. After it, the middle pose is 2047 and the ends are the measured limits, so every later number is a position inside a known range.

!!! mascot-encourage "Calibration Feels Fiddly, and That Is Normal"
    ![Servo encouraging the reader](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Most builders run the calibration two or three times before they are happy, because it is easy to press Enter a moment too early. You already know how to read a register and to find a minimum and maximum, and that is all this is. If a run goes wrong, start it again, and move each joint slowly to the very end of its travel.

The program asks again if a calibration already exists: when a file is found for the `id` you gave, it asks you to press Enter to use it, or to type `c` and press Enter to calibrate again.

#### The Calibration File

The result is saved in a **calibration file**, in JSON format (Chapter 1), with one entry per joint and five numbers in each:

```text
{
    "shoulder_pan": {
        "id": 1,
        "drive_mode": 0,
        "homing_offset": -12,
        "range_min": 785,
        "range_max": 3320
    },
    "...": "the other joints follow in the same form"
}
```

The values above show the form and are not from a real arm. `id` is the servo's ID, `drive_mode` is 0 (a setting that flips the direction of a joint, which the procedure leaves at 0), `homing_offset` is the number from step 1, and `range_min` and `range_max` are the limits from step 2. By default LeRobot keeps these files in `~/.cache/huggingface/lerobot/calibration/`, in a subfolder for robots or for teleoperators, and the file is named after the `id` you chose, as in `my_awesome_follower_arm.json`. The subfolder name has changed between versions, so search for the file by its name.

The `id` matters. The guide says to use the same `id` every time that you teleoperate, record or evaluate with the same arm, because the program finds the calibration by it. Give the leader and the follower different ids, and keep to them. If a file is missing, or if its numbers disagree with what the servo holds, LeRobot starts the calibration procedure for you.

A program can use the file to convert raw numbers. The default in current LeRobot is degrees: a raw reading is turned into an angle measured from the *middle of the calibrated range*, \( (\text{raw} - \text{mid}) \times 360 / 4095 \) with \( \text{mid} = (\text{range\_min} + \text{range\_max}) / 2 \), and the gripper is reported from 0 (closed) to 100 (open). Older versions used a scale from -100 to +100 for every joint. The range measured in this way gives the joint limits that Chapter 2 only estimated, which the lab copies into a settings file.

#### Calibration Drift

**Calibration drift** is when the file stops matching the arm. The causes are physical: a horn that has slipped on its shaft, a screw that came loose, or a joint that was taken apart and put together again. The joint then reads a different number at the same pose, and the leader and follower disagree by a few degrees. A shift of 40 steps is \( 40 \times 360 / 4095 \approx 3.5 \) degrees. The remedy is to find and fix the mechanical cause, and then to calibrate again. The next MicroSim practices the reasoning, with six situations and the result each one gives.

#### Diagram: Calibration Range Recorder

<details markdown="1">
<summary>Calibration Range Recorder</summary>
Type: microsim
**sim-id:** calibration-range-recorder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer the result of a calibration run from a description of what the builder did in each of its two steps, in six situations, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** calibration, homing position, homing offset, range of motion limits, calibration file, calibration drift (all defined in the sections above this block).

**Evidence of Mastery:** For each of six situations the learner chooses one of five results and commits before the result is shown. A choice is correct when it matches the Result column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the poses in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The homing position is the arm's resting pose. (It is the middle of each joint's range, a measuring pose.) (2) The calibrated range is the range the servo can physically turn. (It is the range the builder actually moved it through.) (3) A calibration file stays right forever. (A slipped horn makes it wrong.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from causes to effects. Each situation changes one thing in the procedure, so the learner must trace which stored number is affected and what that does to the readings.

**Content:**

Explore mode shows one joint and three quantities the learner can change. It shows the homing offset, the recorded range, the width of the range in degrees, and the reading at the middle pose. The rules for the calculation are given under Rules.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Raw position at the middle pose | 0 | 4095 | 1 | 2105 | steps |
| Raw position at one end of the sweep | 0 | 4095 | 1 | 800 | steps |
| Raw position at the other end of the sweep | 0 | 4095 | 1 | 3300 | steps |

The five results: "The program stops with an error", "The recorded range is too narrow", "The existing file is offered for reuse", "The full range 0 to 4095 is recorded", "The readings are shifted by the slip". Six situations in this fixed order (two of them have the same result):

| # | Situation | Result | Why (shown as feedback) |
|---|---|---|---|
| 1 | In step 2 the builder never moves the elbow flex joint. | The program stops with an error | A joint that did not move has equal smallest and largest values, and the program raises an error. |
| 2 | In step 2 the builder moves the shoulder lift only halfway to each end. | The recorded range is too narrow | The limits are the smallest and largest values seen, so a half sweep records a half range. |
| 3 | The builder runs the calibration for an arm that already has a file under the same id. | The existing file is offered for reuse | The program asks whether to use the file or type c to calibrate again. |
| 4 | The builder does not sweep the wrist roll at all. | The full range 0 to 4095 is recorded | The wrist roll can turn all the way round, so the program sets its range without a sweep. |
| 5 | After calibration, a horn on the shoulder pan slips by 40 steps. | The readings are shifted by the slip | The file still holds the old offset, so the joint reads 40 steps (about 3.5 degrees) away from where the file expects it. |
| 6 | In step 2 the builder opens the gripper only a quarter of the way. | The recorded range is too narrow | Only the positions that were visited are recorded, so the open end of the range is far too low. |

**Provenance:** The behavior of the two steps, the 2047 rule, the error for equal limits, the full range for the wrist roll and the reuse prompt are from the LeRobot source and guide read on 2026-10-07, as described in the chapter section "The Calibration Procedure". The situations and the 40-step slip are illustrative and written for this sim, and the sim labels them "illustrative". The Explore defaults are the made-up positions used in the lab.

**Rules:** homing offset = reading at the middle pose - 2047. Recorded range_min = smallest raw position seen during the sweep - offset, and range_max = largest raw position seen - offset. Width in degrees = (range_max - range_min) x 360 / 4095. The degrees of a drift of s steps = s x 360 / 4095. If the smallest and largest values are equal, calibration stops with an error. The explore values must satisfy that the two sweep ends differ.

**Learner Activity:**

1. In Explore mode the learner changes the middle pose and the two sweep ends and watches the offset, the range and the width in degrees update. The learner should notice that the offset follows the middle pose and not the ends.
2. The learner switches to the six situations. Situation 1 is shown.
3. The learner chooses a result and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 6 it shows the score.

**Feedback:** Six situations, fixed order, one attempt each. Correct: "Correct: <result>. <Why>". Incorrect: "Not quite. The result is <result>. <Why>". The correct result is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with a middle pose of 2105 and sweep ends of 800 and 3300, showing an offset of 58, a recorded range of 742 to 3242 and a width of about 219.8 degrees.

**Chapter Anchors:** The chapter states that the offset is the reading at the middle pose minus 2047, that the limits are the smallest and largest values seen, that the wrist roll is set to 0 to 4095, that a drift of 40 steps is about 3.5 degrees, and that an existing file is offered for reuse. The sim has six situations and mastery is 5 of 6.
</details>

## When Something Goes Wrong

**Troubleshooting** is finding a fault by changing one thing at a time. The method is the same for every fault in this section. Write down what you see, decide the smallest part of the system that could cause it, and test that part alone: one servo on the board, one cable swapped for another, one measurement with the multimeter. Resist the urge to change three things and hope. The faults below are the ones that builders meet most, with where to look first.

**Servo not found** is when a servo never answers a scan, and the setup command says it cannot find the motor at any baud rate. The causes are in the chain from the wall to the servo. Check the supply (a multimeter reading of 0 V, or of a voltage far from the label, tells you at once), the USB cable between the computer and the board, the three-pin cable from the board, and the jumpers on B. If a scan finds servos 1 to 3 and nothing after, the break is in the cable between 3 and 4.

**Intermittent wiring** is a fault that comes and goes. The errors, such as "There is no status packet" or a failed read of the position, appear only when a joint moves into a certain pose, or when you touch a cable. A conductor is breaking inside its insulation, or a plug is working loose, and the cure is Chapter 7's: slack, strain relief and a firm plug. Replace the cable if it is damaged. LeRobot retries a failed read twice by default, which hides a few glitches and does not cure a bad cable.

**Loose gears** are a mechanical fault. A joint that has play, a click, or a slop at the end of the arm may have a horn that is not seated on the 25-tooth spline, a screw that has come loose, or a stripped plastic thread. Rock the part by hand with the torque off and see where the movement is: between the horn and the frame, or inside the servo. Re-seat the horn and tighten the screw to snug. Stripped plastic must be replaced.

**Jitter** is a joint that trembles around its goal and never settles. A loose horn or a loose gear is a common cause, because the position sensor and the controller are fighting the slop. Other causes are noisy communication and gains that are too stiff for the load: LeRobot sets the follower's proportional gain to 16 and its derivative gain to 32, and Chapter 5's lessons on gains apply. Fix the mechanical play first, check the cable, and only then think about the gains.

**Servo overheating** is a servo that gets too hot to touch. The STS3215's data sheet (read from a translated copy) lists protections: the servo turns its torque off above 70 °C, it protects itself against a stall (torque held above 80 percent of the stall value for 2 seconds), against current above 2 A for 2 seconds, and against a supply above 7.4 V or below 4 V. When a protection trips, the joint goes limp, and this can be confused with a broken servo. Let it cool, find what loaded it, and reduce the load or the torque limit. LeRobot gives the follower's gripper a torque limit of 50 percent and an overload torque of 25 percent (Chapter 5) because it is the joint that is most often held against an object. A maintainer's advice for a burnt-out gripper was that it can happen if it is overloaded for too long, for example by closing the leader's trigger fully while the follower holds something.

!!! mascot-warning "Do Not Force a Joint That Is Stuck"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    If a joint stops moving, switch the torque off before you turn it by hand, because pushing against a motor that is holding strips gears. Then look for the cause (a cable caught in the joint, a part that touches the base) before you power up again.

The last MicroSim of the chapter practices the first step of troubleshooting: matching a symptom to its most likely cause.

#### Diagram: Assembly Fault Finder

<details markdown="1">
<summary>Assembly Fault Finder</summary>
Type: microsim
**sim-id:** assembly-fault-finder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate six causes of SO-ARM101 faults from eight written symptoms, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** servo not found, intermittent wiring, loose gears, jitter, servo overheating, calibration drift, duplicate ID, supply voltage (all defined in the sections above this block and in Chapters 3 and 4).

**Evidence of Mastery:** For each of eight symptoms the learner chooses one of six causes and commits. A choice is correct when it matches the Cause column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the cause list in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A servo that does not answer is broken. (Power, ID and cable faults are more common.) (2) A joint that goes limp is faulty. (A protection may have tripped from heat or overload.) (3) Every fault needs software changes. (Many are mechanical or electrical.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to tell similar-looking cases apart by their evidence. Each symptom carries one distinguishing clue (when the fault appears, or what a measurement read), so the learner must pick out the clue rather than the general topic.

**Content:**

The six causes: "Power: missing or wrong voltage", "Duplicate or wrong ID", "Loose cable or connector", "Loose horn or gear", "Overload or heat", "Calibration out of date". Eight symptoms in this fixed order:

| # | Symptom shown to the learner | Cause | Why (shown as feedback) |
|---|---|---|---|
| 1 | The setup command cannot find the motor at any baud rate, and a multimeter reads 0 V at the board's power input. | Power: missing or wrong voltage | With no supply voltage the servo cannot answer anything. |
| 2 | With all six new servos connected the replies are garbled, but each servo works alone. | Duplicate or wrong ID | New servos all have ID 1, so they answer at the same time and corrupt each other. |
| 3 | "No status packet" errors appear only when the elbow bends and disappear when the arm is straight. | Loose cable or connector | A fault that depends on the pose points to a conductor or plug that moves. |
| 4 | A joint trembles around its goal, and the horn can be wiggled a little on its shaft by hand. | Loose horn or gear | Play at the horn means the controller fights slop, which shows as jitter. |
| 5 | After 20 minutes of holding a load, a joint goes limp and the servo reads 70 °C. | Overload or heat | A servo turns its torque off above 70 °C, so it goes limp when it overheats. |
| 6 | Since a horn was removed and put back, the elbow of the follower is 4 degrees off from the leader. | Calibration out of date | A re-fitted horn changes the angle at the same raw reading, so the arm must be calibrated again. |
| 7 | The follower's gripper is hot and stiff after the leader's trigger was closed fully while the gripper held an object. | Overload or heat | Pushing a gripper against an object keeps the current high, which heats the motor. |
| 8 | A "12 V" adapter reads about 16 V on the multimeter, and the servos will not turn on. | Power: missing or wrong voltage | A supply far above the label puts the servos into protection. |

**Provenance:** Symptoms 5 and 7 draw on the STS3215 data sheet's 70 °C protection and a LeRobot maintainer's comment on a burnt-out gripper. Symptom 8 draws on a user's report in LeRobot issue 3394. The other symptoms are illustrative and written for this sim. The sim labels the set "illustrative".

**Rules:** Each symptom has exactly one correct cause. The six causes are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the six causes, each with a first check.
2. The learner switches to the eight symptoms. Symptom 1 is shown.
3. The learner chooses a cause and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After symptom 8 it shows the score.

**Feedback:** Eight symptoms, fixed order, one attempt each. Correct: "Correct: <cause>. <Why>". Incorrect: "Not quite. The likely cause is <cause>. <Why>". The correct cause is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the six causes listed and the prompt "What is the most likely cause?" ready for the first symptom.

**Chapter Anchors:** The chapter states a 70 °C torque cut-off, a supply of about 16 V from a "12 V" adapter, a 40-step shift of about 3.5 degrees, and the six faults of servo not found, intermittent wiring, loose gears, jitter, servo overheating and calibration drift. The sim has eight symptoms and mastery is 7 of 8.
</details>

## Lab: Set IDs, Calibrate, and Check Before Power-On

In this lab you will rehearse the three software jobs of this chapter on the pretend bus: giving servos their IDs one at a time, calibrating six joints and saving the calibration file, and running a pre-flight check. Nothing here needs hardware. The one new Python idea is the **dataclass**, a short way to define a class that mainly holds data: you list its fields, and Python writes the `__init__` method for you. You will extend the `arm-lab` project and reuse the pretend bus of Chapter 4.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Teach the toolkit five more registers and two helpers.** Open `armlab/packets.py`. In the `REGISTERS` table, add these five lines after the `"Baud_Rate"` line. They are the addresses from LeRobot's STS3215 table:

```text
    "Min_Position_Limit": (9, 2),
    "Max_Position_Limit": (11, 2),
    "Max_Temperature_Limit": (13, 1),
    "Homing_Offset": (31, 2),
    "Lock": (55, 1),
```

Then add two functions at the bottom. `encode_sign_magnitude` is the opposite of the `decode_sign_magnitude` of Chapter 4: it stores a negative value as a sign bit plus a magnitude. `write_register` sends a write and checks that the reply has no error:

```python linenums="1"
def encode_sign_magnitude(value, sign_bit):
    """Store a signed value as a sign bit plus a magnitude (the reverse of decode_sign_magnitude)."""
    if abs(value) >= 1 << sign_bit:
        raise ValueError(f"{value} does not fit in {sign_bit} magnitude bits")
    return (1 << sign_bit | -value) if value < 0 else value


def write_register(send, servo_id, name, value):
    """Write one register and check that the servo answered without an error."""
    reply = send(write_packet(servo_id, name, value))
    _, error, _ = parse_status(reply)
    if error:
        raise ValueError(f"servo {servo_id} reported error byte {error:#04x}")
```

**Step 3. Teach the pretend bus two new tricks.** In `armlab/fakebus.py`, change the import line to `from armlab.packets import HEADER, PING, READ, WRITE, checksum, decode_sign_magnitude`. In `fake_bus`, replace the end of the function, from `if instruction == WRITE:` down to the final `return b""`, with the version below, which makes a servo whose ID register was written answer to its new ID. Then add `move_by_hand` at the bottom. It models a person turning a joint: the servo reports the actual position minus its stored offset, the rule from the calibration section.

```python linenums="1"
    if instruction == WRITE:
        address, data = params[0], params[1:]
        memory[address:address + len(data)] = data
        if address <= 5 < address + len(data):          # the ID register changed: the servo has a new address
            servos[memory[5]] = servos.pop(servo_id)
        return build_status(servo_id)
    return b""


def move_by_hand(memory, actual):
    """Pretend someone turned the joint to a raw position. Present = Actual - Homing_Offset."""
    offset = decode_sign_magnitude(int.from_bytes(memory[31:33], "little"), 11)
    memory[56:58] = ((actual - offset) % 4096).to_bytes(2, "little")
```

**Step 4. Write the ID setter.** `set_servo_id` does what the LeRobot command does. It scans for servos and refuses to go on unless exactly one answers, because a new servo has ID 1 and two on the bus would collide. Then it turns the torque off, unlocks the memory, writes the ID and the baud-rate code, and locks the memory again. Create `armlab/setup.py`:

```python linenums="1"
"""Give a brand-new servo its ID and baud rate, one servo at a time."""

from armlab.packets import scan, write_register

# Baud rate -> the code stored in the Baud_Rate register, from LeRobot's STS3215 table.
BAUD_CODES = {1_000_000: 0, 500_000: 1, 250_000: 2, 128_000: 3,
              115_200: 4, 57_600: 5, 38_400: 6, 19_200: 7}


def set_servo_id(send, new_id, baud=1_000_000):
    """Find the one servo on the bus and give it new_id and the chosen baud rate.

    Raises ValueError unless exactly one servo answers, because a new servo has ID 1
    and two of them on one bus would both answer the same writes.
    """
    found = scan(send, range(0, 254))
    if len(found) != 1:
        raise ValueError(f"expected exactly one servo on the bus, found {found}")
    old_id = found[0]
    write_register(send, old_id, "Torque_Enable", 0)     # the real library turns torque off
    write_register(send, old_id, "Lock", 0)              # and unlocks the memory first
    write_register(send, old_id, "ID", new_id)
    write_register(send, new_id, "Baud_Rate", BAUD_CODES[baud])
    write_register(send, new_id, "Lock", 1)
    return old_id
```

**Step 5. Set the IDs of six new servos.** The script makes a fresh servo with ID 1 for each joint, alone on the pretend bench, in the order LeRobot uses (gripper first), sets its ID, and checks the result by scanning. It then chains all six servos together and scans, and finally tries to run the setter with all six connected, to show the refusal. Create `setup_demo.py`:

```python linenums="1"
"""Set the IDs of six new servos, one at a time, the way lerobot-setup-motors does."""

from armlab.config import load_config
from armlab.fakebus import fake_bus, make_servos
from armlab.packets import scan
from armlab.setup import set_servo_id

config = load_config("config/arm.json")
joints = list(config["joints"])                    # shoulder_pan first, gripper last

for name in reversed(joints):                      # LeRobot works from the gripper back to the shoulder
    wanted = config["joints"][name]["id"]
    bench = make_servos([1])                       # a brand-new servo is alone on the bench, with ID 1

    def send(packet):
        return fake_bus(bench, packet)

    set_servo_id(send, wanted)
    assert scan(send, range(0, 254)) == [wanted], "the servo did not take its new ID"
    print(f"'{name}' motor id set to {wanted}")

# Now chain all six together on one bus and look for them.
chain = make_servos([config["joints"][name]["id"] for name in joints])


def send_chain(packet):
    return fake_bus(chain, packet)


print("Servos on the chained bus:", scan(send_chain, range(1, 11)))

try:
    set_servo_id(send_chain, 7)                    # a mistake: six servos are connected
except ValueError as error:
    print("Refused:", error)
```

```bash
python setup_demo.py
```

```text
'gripper' motor id set to 6
'wrist_roll' motor id set to 5
'wrist_flex' motor id set to 4
'elbow_flex' motor id set to 3
'shoulder_lift' motor id set to 2
'shoulder_pan' motor id set to 1
Servos on the chained bus: [1, 2, 3, 4, 5, 6]
Refused: expected exactly one servo on the bus, found [1, 2, 3, 4, 5, 6]
```

**Step 6. Write the calibration module.** A **dataclass** called `JointCalibration` holds the five numbers of the calibration file. The decorator `@dataclass` writes `__init__` from the field list, and `asdict` turns an instance into a dictionary for JSON. `calibrate_joint` follows the two steps of the procedure: it resets the offset and limits, reads the middle pose and stores `reading - 2047` as the offset, then watches the position while the joint is moved through a list of positions and keeps the smallest and largest. `hand` is a function that stands for the person moving the joint. `to_degrees` and `drift_degrees` use the conversion of the chapter, and `measured_limits` turns the ranges into joint limits in degrees. Create `armlab/calibrate.py`:

```python linenums="1"
"""Calibrate a joint: find its centre and its range, and save them in a file."""

import json
from dataclasses import asdict, dataclass
from pathlib import Path

from armlab.packets import encode_sign_magnitude, read_register, write_register

MIDDLE = 2047          # LeRobot makes the middle pose read 2047, the middle of 0..4095
STEPS_PER_DEGREE = 4095 / 360


@dataclass
class JointCalibration:
    """What the calibration file stores for one joint."""
    id: int
    drive_mode: int
    homing_offset: int
    range_min: int
    range_max: int


def calibrate_joint(send, servo_id, hand, middle, sweep, full_turn=False):
    """Calibrate one joint and return its JointCalibration.

    Args:
        send: Function that sends a packet and returns the reply.
        servo_id: The servo's ID.
        hand: Function hand(actual) that turns the joint to a raw position (the person's hand).
        middle: The raw position of the joint at the middle of its range.
        sweep: The raw positions the joint passes through while it is moved through its full range.
        full_turn: True for a joint that turns all the way round, which is not swept.
    """
    # 1. Reset: no offset, and the full range, so that the readings are raw.
    write_register(send, servo_id, "Homing_Offset", 0)
    write_register(send, servo_id, "Min_Position_Limit", 0)
    write_register(send, servo_id, "Max_Position_Limit", 4095)

    # 2. Half-turn homing: read the middle pose and store the difference from 2047.
    hand(middle)
    offset = read_register(send, servo_id, "Present_Position") - MIDDLE
    write_register(send, servo_id, "Homing_Offset", encode_sign_magnitude(offset, 11))

    # 3. Range of motion: watch the position while the joint is moved, keep the smallest and largest.
    if full_turn:
        low, high = 0, 4095
    else:
        seen = []
        for actual in sweep:
            hand(actual)
            seen.append(read_register(send, servo_id, "Present_Position"))
        low, high = min(seen), max(seen)
        if low == high:
            raise ValueError("the joint did not move: its minimum and maximum are the same")
    write_register(send, servo_id, "Min_Position_Limit", low)
    write_register(send, servo_id, "Max_Position_Limit", high)
    return JointCalibration(servo_id, 0, offset, low, high)


def save_calibration(path, calibrations):
    """Write {joint name: JointCalibration} to a JSON file."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump({name: asdict(cal) for name, cal in calibrations.items()}, f, indent=4)


def load_calibration(path):
    """Read a calibration file back into {joint name: JointCalibration}."""
    with open(path) as f:
        return {name: JointCalibration(**values) for name, values in json.load(f).items()}


def to_degrees(raw, cal):
    """Convert a raw reading to degrees from the middle of the calibrated range."""
    raw = max(cal.range_min, min(raw, cal.range_max))
    return (raw - (cal.range_min + cal.range_max) / 2) / STEPS_PER_DEGREE


def drift_degrees(send, cal, middle_reading=None):
    """How far a joint held at its middle pose has moved from where the file says it is.

    Returns the difference in degrees between the present reading and 2047.
    """
    reading = middle_reading if middle_reading is not None else read_register(send, cal.id, "Present_Position")
    return (reading - MIDDLE) / STEPS_PER_DEGREE


def measured_limits(calibrations):
    """Return {joint name: (min_deg, max_deg)} from the calibrated ranges, in degrees from the middle.

    The gripper is left out: LeRobot measures it from 0 (closed) to 100 (open), not in degrees.
    """
    return {name: (round(to_degrees(cal.range_min, cal), 1), round(to_degrees(cal.range_max, cal), 1))
            for name, cal in calibrations.items() if name != "gripper"}
```

**Step 7. Calibrate six pretend joints.** The numbers for where each joint sits in the middle pose and where its ends are are made up for the lab. The script calibrates all six, saves the file, loads it back, converts three raw readings to degrees, slips a horn by 40 steps, and writes the measured limits to a new settings file, `config/arm_measured.json`. Create `calibrate_demo.py`:

```python linenums="1"
"""Calibrate six pretend joints, save the file, then see what a slipped horn does."""

import json

from armlab.calibrate import (calibrate_joint, drift_degrees, load_calibration, measured_limits,
                              save_calibration, to_degrees)
from armlab.config import load_config
from armlab.fakebus import fake_bus, make_servos, move_by_hand
from armlab.packets import read_register

config = load_config("config/arm.json")
names = list(config["joints"])
servos = make_servos([config["joints"][n]["id"] for n in names])


def send(packet):
    return fake_bus(servos, packet)


# Made-up raw positions: where each joint sits in the middle pose, and the two ends it reaches.
MIDDLE_POSE = {"shoulder_pan": 2105, "shoulder_lift": 1990, "elbow_flex": 2210,
               "wrist_flex": 2040, "wrist_roll": 2300, "gripper": 2050}
ENDS = {"shoulder_pan": (800, 3300), "shoulder_lift": (900, 3150), "elbow_flex": (850, 3200),
        "wrist_flex": (950, 3100), "wrist_roll": (0, 4095), "gripper": (1980, 3400)}

calibrations = {}
for name in names:
    servo_id = config["joints"][name]["id"]

    def hand(actual, servo_id=servo_id):
        move_by_hand(servos[servo_id], actual)

    low, high = ENDS[name]
    sweep = [low, (low + high) // 2, high, low + 10]                # the hand moves it end to end
    calibrations[name] = calibrate_joint(send, servo_id, hand, MIDDLE_POSE[name], sweep,
                                         full_turn=(name == "wrist_roll"))

print("1. Calibration result")
for name, cal in calibrations.items():
    print(f"   {name:<14} offset {cal.homing_offset:>5}  range {cal.range_min:>4} to {cal.range_max:>4}")

save_calibration("calibration/my_follower.json", calibrations)
loaded = load_calibration("calibration/my_follower.json")
print("2. Saved and loaded again:", loaded == calibrations)

cal = loaded["shoulder_pan"]
print("3. Raw readings of the shoulder pan in degrees from its middle")
for raw in (cal.range_min, 2047, cal.range_max):
    print(f"   raw {raw:>4} -> {to_degrees(raw, cal):>7.1f} degrees")

print("4. A horn slips by 40 steps on the shoulder pan")
move_by_hand(servos[1], MIDDLE_POSE["shoulder_pan"] + 40)
print(f"   the joint is at its middle pose but reads {read_register(send, 1, 'Present_Position')}"
      f", {drift_degrees(send, cal):.1f} degrees away from where the file expects it")

print("5. Joint limits measured from the calibrated ranges")
limits = measured_limits(loaded)
for name, (low, high) in limits.items():
    print(f"   {name:<14} {low:>7.1f} to {high:>6.1f} degrees")
for name, (low, high) in limits.items():                 # copy the measured limits into a new settings file
    config["joints"][name]["min_deg"], config["joints"][name]["max_deg"] = low, high
with open("config/arm_measured.json", "w") as f:
    json.dump(config, f, indent=2)
```

```bash
python calibrate_demo.py
```

```text
1. Calibration result
   shoulder_pan   offset    58  range  742 to 3242
   shoulder_lift  offset   -57  range  957 to 3207
   elbow_flex     offset   163  range  687 to 3037
   wrist_flex     offset    -7  range  957 to 3107
   wrist_roll     offset   253  range    0 to 4095
   gripper        offset     3  range 1977 to 3397
2. Saved and loaded again: True
3. Raw readings of the shoulder pan in degrees from its middle
   raw  742 ->  -109.9 degrees
   raw 2047 ->     4.8 degrees
   raw 3242 ->   109.9 degrees
4. A horn slips by 40 steps on the shoulder pan
   the joint is at its middle pose but reads 2087, 3.5 degrees away from where the file expects it
5. Joint limits measured from the calibrated ranges
   shoulder_pan    -109.9 to  109.9 degrees
   shoulder_lift    -98.9 to   98.9 degrees
   elbow_flex      -103.3 to  103.3 degrees
   wrist_flex       -94.5 to   94.5 degrees
   wrist_roll      -180.0 to  180.0 degrees
```

Look at three things in the output. The offsets differ between the joints (58, -57, 163 and so on), because each joint's middle pose had a different raw reading, and after calibration all of them read 2047 there. The shoulder pan's range of 742 to 3242 is the sweep ends minus its offset of 58. And the degrees in item 3 are measured from the middle of the *range* (raw 1992), not from the middle pose (raw 2047), which is why raw 2047 reads 4.8 degrees and the two ends read exactly -109.9 and +109.9. The measured limits are therefore always symmetric. The file `calibration/my_follower.json` has the form that the chapter showed.

**Step 8. Write the pre-flight check.** `check_joint` pings a servo, reads its voltage, temperature and position, and returns a list of problems. The limits are the ones from the chapter: the 7.4 V model's working range of 4.0 to 7.4 V, and a temperature limit of 60 °C, chosen well below the servo's own 70 °C cut-off. `preflight` runs it for every joint of the configuration. Create `armlab/preflight.py`:

```python linenums="1"
"""Checks to run before the first power-on, and before every session after it."""

from armlab.packets import ping_packet, parse_status, read_register

VOLTAGE_RANGE_V = (4.0, 7.4)       # the STS3215 7.4 V model's working range, from its data sheet
TEMPERATURE_LIMIT_C = 60           # stay well below the servo's own 70 C cut-off


def check_joint(send, name, servo_id, cal):
    """Return a list of problems for one joint (an empty list means it passed)."""
    try:
        parse_status(send(ping_packet(servo_id)))
    except ValueError:
        return [f"servo {servo_id} does not answer: check its cable, the power and the ID"]
    problems = []
    volts = read_register(send, servo_id, "Present_Voltage") / 10
    if not VOLTAGE_RANGE_V[0] <= volts <= VOLTAGE_RANGE_V[1]:
        problems.append(f"supply reads {volts:.1f} V, outside {VOLTAGE_RANGE_V[0]} to {VOLTAGE_RANGE_V[1]} V")
    temp = read_register(send, servo_id, "Present_Temperature")
    if temp >= TEMPERATURE_LIMIT_C:
        problems.append(f"temperature is {temp} C, at or above {TEMPERATURE_LIMIT_C} C: let it cool")
    position = read_register(send, servo_id, "Present_Position")
    if not cal.range_min <= position <= cal.range_max:
        problems.append(f"position {position} is outside the calibrated range {cal.range_min} to {cal.range_max}")
    return problems


def preflight(send, config, calibrations):
    """Check every joint. Return {joint name: problems}; the arm is ready when all lists are empty."""
    return {name: check_joint(send, name, joint["id"], calibrations[name])
            for name, joint in config["joints"].items()}
```

**Step 9. Run it on an arm with two faults.** The script unplugs servo 5 and heats servo 3 to 68 °C. Create `preflight_demo.py`:

```python linenums="1"
"""Run the pre-power-on checks against a pretend arm that has two faults."""

from armlab.calibrate import load_calibration
from armlab.config import load_config
from armlab.fakebus import fake_bus, make_servos
from armlab.preflight import preflight

config = load_config("config/arm.json")
calibrations = load_calibration("calibration/my_follower.json")

servos = make_servos([1, 2, 3, 4, 6])              # servo 5 (wrist_roll) is unplugged
servos[3][63] = 68                                 # servo 3 (elbow_flex) is hot: 68 C
for memory in servos.values():
    memory[56:58] = (2047).to_bytes(2, "little")   # every joint rests at the middle


def send(packet):
    return fake_bus(servos, packet)


results = preflight(send, config, calibrations)
for name, problems in results.items():
    print(f"{name:<14}", "ok" if not problems else "; ".join(problems))

ready = all(not problems for problems in results.values())
print("Ready to power on:", ready)
```

```bash
python preflight_demo.py
```

```text
shoulder_pan   ok
shoulder_lift  ok
elbow_flex     temperature is 68 C, at or above 60 C: let it cool
wrist_flex     ok
wrist_roll     servo 5 does not answer: check its cable, the power and the ID
gripper        ok
Ready to power on: False
```

The check found both faults and said what to do for each, and it declared the arm not ready. In the real pre-flight check on your arm you would use the `send` function from `read_servo.py` of Chapter 4 instead of the pretend one.

!!! mascot-tip "Make the Check a Habit"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Run the pre-flight check at the start of every session, before the first motion. It takes a second and catches the unplugged cable, the hot servo and the dead supply while they are still cheap to fix.

**Step 10. Record your work.**

```bash
git add .
git commit -m "Add servo ID setter, calibration module, and pre-flight check"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python setup_demo.py` ends with `Refused: expected exactly one servo on the bus, found [1, 2, 3, 4, 5, 6]`.
- `python calibrate_demo.py` prints `Saved and loaded again: True` and a shoulder-pan range of `742 to 3242`.
- `calibration/my_follower.json` has six joints with five fields each.
- `python preflight_demo.py` flags the elbow flex (hot) and the wrist roll (no answer), and ends with `Ready to power on: False`.
- Earlier scripts (`bus_demo.py`, `cost_demo.py`, `partcheck.py`) still run.
- `git log --oneline` shows an eighth commit.

### Challenge: A Drift Alarm

Write a function `needs_recalibration(send, calibrations, limit_deg=2.0)` in `armlab/calibrate.py`. With the arm held at its middle pose, it should read every joint, and return the list of joint names whose reading differs from 2047 by more than `limit_deg`. Use it in a script that calibrates the six joints, slips the shoulder pan's horn by 40 steps and the elbow's by 10, and prints which joints need recalibration.

??? note "Click to see one solution"
    A drift of 2 degrees is \( 2 \times 4095 / 360 \approx 23 \) steps, so 40 steps trips the alarm and 10 does not. Add this to `armlab/calibrate.py`:

    ```python linenums="1"
    def needs_recalibration(send, calibrations, limit_deg=2.0):
        """Names of the joints whose reading at the middle pose is more than limit_deg from 2047."""
        return [name for name, cal in calibrations.items()
                if abs(drift_degrees(send, cal)) > limit_deg]
    ```

    The script uses the pieces of `calibrate_demo.py`. After the six joints are calibrated, put every joint back at its middle pose with `move_by_hand(servos[id], MIDDLE_POSE[name])`, then slip two of them and call the function:

    ```python linenums="1"
    from armlab.calibrate import needs_recalibration

    for name in names:
        move_by_hand(servos[config["joints"][name]["id"]], MIDDLE_POSE[name])
    move_by_hand(servos[1], MIDDLE_POSE["shoulder_pan"] + 40)     # a slipped horn
    move_by_hand(servos[3], MIDDLE_POSE["elbow_flex"] + 10)       # a small slip
    print(needs_recalibration(send, calibrations))                # ['shoulder_pan']
    ```

    Only the shoulder pan is reported, because 10 steps is 0.9 degrees, which is under the limit. Choosing the limit is a judgement: too small and it raises false alarms from sensor noise, and too large and it lets a real shift pass.

## Summary and Key Takeaways

You can now build, power up and calibrate an arm pair.

- The **open-source repository** (SO-ARM100 for the hardware and LeRobot for the software, whose SO-101 page is the **assembly guide**) holds the instructions, and its **version history** matters: record the versions you used.
- A **safety checklist** comes before power: the supply matches the motors, the jumpers are on B, the IDs are unique, the cables are seated, and the arm is parked. **Safe shutdown** parks the arm and turns the torque off before the supply.
- **Servo preparation** happens on the bench with the **servo bus controller board**. **Setting servo IDs** is done one servo at a time, because new servos all have ID 1, with `lerobot-setup-motors`, which works from the gripper (6) to the shoulder pan (1). **Setting the baud rate** leaves it at 1,000,000. **Servo testing** confirms each servo answers.
- Assemble in **joint assembly order**: the **follower assembly** uses M2 × 6 screws for the motors and M3 × 6 for the parts, and the **leader assembly** uses the mixed **leader gear ratios** (1/191, 1/345, 1/191, 1/147, 1/147, 1/147) and ends in a **leader handle and trigger**. **Cable routing** keeps slack and **mounting to a table** keeps the base still.
- The **first power-on** follows the checklist, with a **pre-flight check** and a small first move. The **homing position** (every joint in the middle) is different from the **home position** (a safe rest).
- **Calibration** stores each joint's **homing offset** (the middle reads 2047) and its **range of motion limits** in a **calibration file**. The **calibration procedure** is two steps. **Calibration drift** is a file that no longer matches the arm, and 40 steps is about 3.5 degrees.
- **Troubleshooting** changes one thing at a time. **Servo not found**, **intermittent wiring**, **loose gears**, **jitter** and **servo overheating** each have a first place to look, and an STS3215 turns its torque off above 70 °C.

!!! mascot-celebration "You Built and Calibrated an Arm!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just gave six servos their names, put together a follower and a leader, woke them up safely and taught them where their middle and their ends are, and you wrote the Python that does the same on a pretend bus. That is a working arm pair, and the hardest part of the build is behind you. Let's move it on to Chapter 9!
