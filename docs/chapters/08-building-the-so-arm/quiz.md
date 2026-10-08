# Quiz: Building and Calibrating the SO-ARM100

Test your understanding of servo preparation, assembly, calibration, and troubleshooting with these review questions.

---

#### 1. What device ID does a brand-new STS3215 servo have when it ships?

<div class="upper-alpha" markdown>
1. 0
2. 6
3. 254
4. 1
</div>

??? question "Show Answer"
    The correct answer is **D**. Every new STS3215 comes with the same ID, 1. If you connect six new servos at once, they all answer to ID 1 and nothing works. The ID lives in the servo's EEPROM, so you set it only once per servo. The final IDs are fixed: shoulder_pan is 1, shoulder_lift is 2, elbow_flex is 3, wrist_flex is 4, wrist_roll is 5, and gripper is 6.

    **Concept Tested:** Setting Servo IDs

    **See:** [Servo Preparation, Testing, and IDs](index.md#servo-preparation-testing-and-ids)

---

#### 2. Why does the `lerobot-setup-motors` procedure ask you to connect one servo at a time?

<div class="upper-alpha" markdown>
1. The servo bus is too slow to carry traffic for six servos
2. All new servos share ID 1, so several on the bus would answer at once and corrupt each other's replies
3. The controller board has only one socket for servo cables
4. LeRobot refuses to run while the power supply is switched on
</div>

??? question "Show Answer"
    The correct answer is **B**. Because every new STS3215 has ID 1, a command to ID 1 would be heard by all of them, and their replies would collide. Connecting one servo at a time lets the command find exactly one motor and give it a unique ID. If the setup command cannot find a motor, or finds the wrong one, the usual cause is two servos on the board at once, or none.

    **Concept Tested:** Servo Preparation

    **See:** [Servo Preparation, Testing, and IDs](index.md#servo-preparation-testing-and-ids)

---

#### 3. On the Waveshare servo bus controller board, where must the two jumpers be set so that the board takes its commands from the USB port?

<div class="upper-alpha" markdown>
1. Both on channel B
2. Both on channel A
3. Both removed
4. One on channel A and one on channel B
</div>

??? question "Show Answer"
    The correct answer is **A**. Channel B is the USB input, and the LeRobot documentation says both jumpers must be on B. Position A is for a microcontroller's serial port. The jumpers are one of the five extra checks on the safety checklist before powering on, because a wrong jumper position makes the board silent to your computer and looks like a dead servo.

    **Concept Tested:** Servo Bus Controller Board

    **See:** [The Servo Bus Controller Board](index.md#the-servo-bus-controller-board)

---

#### 4. How does the "homing position" used in calibration differ from the "home position" of Chapter 2?

<div class="upper-alpha" markdown>
1. They are the same pose, and the two names are interchangeable
2. The home position is for measuring, and the homing position is a safe rest
3. The homing position puts every joint in the middle of its range so the program can measure, and the home position is a safe rest you choose
4. The homing position is where the servo's torque is switched off for good
</div>

??? question "Show Answer"
    The correct answer is **C**. The home position is a pose you choose in advance as a safe place to start and finish. The homing position is the pose LeRobot asks for during calibration, with every joint in the middle of its range of motion, so that the program can measure from it. One is for safety and the other is for measuring. After calibration you choose a home pose and save it in `config/arm.json`.

    **Concept Tested:** Homing Position

    **See:** [Two Different "Zeros"](index.md#two-different-zeros)

---

#### 5. During calibration, a joint held in the middle pose reads a raw position of 2105. What homing offset does LeRobot store for it?

<div class="upper-alpha" markdown>
1. −58
2. 58
3. 2105
4. 2047
</div>

??? question "Show Answer"
    The correct answer is **B**. The program computes the difference between the reading at the middle pose and 2047, the middle of the range 0 to 4095: 2105 − 2047 = 58. The servo then reports its position as the actual position minus the offset, so the middle pose reads 2047 on every arm. Option A has the wrong sign, and options C and D are raw positions, not the difference.

    **Concept Tested:** Calibration Procedure

    **See:** [The Calibration Procedure](index.md#the-calibration-procedure)

---

#### 6. A horn slips by 60 steps on a joint held at its calibrated middle pose. Using 4095 steps for 360 degrees, about how many degrees is the joint now away from where the file expects it?

<div class="upper-alpha" markdown>
1. About 5.3 degrees
2. About 3.5 degrees
3. About 0.17 degrees
4. About 21.1 degrees
</div>

??? question "Show Answer"
    The correct answer is **A**. The conversion is steps × 360 / 4095, so 60 × 360 / 4095 ≈ 5.3 degrees. The chapter's example is a shift of 40 steps, which is about 3.5 degrees (option B). A drift like this means the leader and follower now disagree by a few degrees. The remedy is to find the mechanical cause, such as a loose screw or a slipped horn, and then calibrate again.

    **Concept Tested:** Calibration Drift

    **See:** [Calibration Drift](index.md#calibration-drift)

---

#### 7. A bus scan finds servos 1, 2, and 3 but nothing after them, and the supply voltage is correct. Where should you look first?

<div class="upper-alpha" markdown>
1. The baud rate of servo 1
2. Two servos that share the ID 3
3. The supply, which may be set too high
4. The cable or plug between servo 3 and servo 4
</div>

??? question "Show Answer"
    The correct answer is **D**. Servos are connected in a daisy chain, so everything before a break still answers and everything after it is silent. A scan that finds 1 to 3 and nothing beyond points to the link between servo 3 and servo 4. Reseat that plug and inspect the cable. A wrong baud rate would silence the whole bus, and a duplicate ID would produce mixed replies from one ID.

    **Concept Tested:** Servo Not Found

    **See:** [When Something Goes Wrong](index.md#when-something-goes-wrong)

---

#### 8. Why does the LeRobot guide have you calibrate both the leader and the follower?

<div class="upper-alpha" markdown>
1. So that the leader's motors can produce more torque than the follower's
2. So that the follower can use a higher supply voltage
3. So that the two arms report the same values when they are in the same physical position
4. So that the servos can be assigned unique IDs on the bus
</div>

??? question "Show Answer"
    The correct answer is **C**. Two arms with identical servos can read different raw numbers at the same pose, because each servo was clamped onto its horn at a slightly different angle. Calibration translates each arm's raw numbers to a common scale, so that "halfway" means halfway on both. This is also what lets a neural network trained on one robot work on another. Torque, voltage, and IDs are unrelated to the calibration file.

    **Concept Tested:** Calibration

    **See:** [Calibration](index.md#calibration)

---

#### 9. At what temperature does the STS3215's own protection turn its torque off?

<div class="upper-alpha" markdown>
1. 50 °C
2. 70 °C
3. 90 °C
4. 120 °C
</div>

??? question "Show Answer"
    The correct answer is **B**. The data sheet lists a protection that turns the torque off above 70 °C. When a protection trips, the joint goes limp, which can be confused with a broken servo. The chapter's pre-flight check uses a lower limit of 60 °C so the program can warn you before the servo's own cut-off acts. Let the servo cool, find what loaded it, and reduce the load or the torque limit.

    **Concept Tested:** Servo Overheating

    **See:** [When Something Goes Wrong](index.md#when-something-goes-wrong)

---

#### 10. A follower joint trembles around its goal and never settles. What is the best order of investigation?

<div class="upper-alpha" markdown>
1. Raise the proportional gain first, to make the joint more stiff
2. Set the torque limit to zero so the joint cannot push
3. Check for a loose horn or gear first, then the cable, and only then think about the gains
4. Replace the 5 V supply with a 12 V supply
</div>

??? question "Show Answer"
    The correct answer is **C**. Jitter is often caused by mechanical play, such as a loose horn or loose gear, because the position sensor and the controller are fighting the slop. Noisy communication and gains that are too stiff for the load are other causes. Fix the mechanical play first, check the cable, and only then adjust the gains. Raising the proportional gain on a loose joint makes the trembling worse, and a wrong supply can damage the motors.

    **Concept Tested:** Jitter

    **See:** [When Something Goes Wrong](index.md#when-something-goes-wrong)
