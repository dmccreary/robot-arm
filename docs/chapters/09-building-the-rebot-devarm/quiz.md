# Quiz: Building the reBot-DevArm and Choosing a Platform

Test your understanding of CAN motor setup, high-voltage power, MIT frames, zeroing, and platform selection with these review questions.

---

#### 1. Which description matches the two versions of the reBot-DevArm B601?

<div class="upper-alpha" markdown>
1. The B601-DM uses Damiao motors on a 24 V supply, and the B601-RS uses RobStride motors on a 48 V supply
2. The B601-DM uses RobStride motors on a 24 V supply, and the B601-RS uses Damiao motors on a 48 V supply
3. Both versions use Damiao motors, one on 24 V and one on 48 V
4. The B601-DM uses Feetech servos on 5 V, and the B601-RS uses Damiao motors on 12 V
</div>

??? question "Show Answer"
    The correct answer is **A**. The two versions share one body design. The B601-DM has Damiao motors (four DM4310 and three DM4340P) and a 24 V supply, with a payload of 1.5 kg. The B601-RS has RobStride motors (four RS00 and three RS06) and a 48 V supply, with a payload of 2.5 kg. Both have six joints plus a gripper, so seven motors in all. Feetech STS3215 servos belong to the SO-ARM101.

    **Concept Tested:** reBot-DevArm

    **See:** [Two Versions, One Body](index.md#two-versions-one-body)

---

#### 2. A Damiao motor has CAN ID `0x06`. Following Seeed's rule, what Master ID should it have?

<div class="upper-alpha" markdown>
1. `0x00`
2. `0x06`
3. `0x16`
4. `0x60`
</div>

??? question "Show Answer"
    The correct answer is **C**. Seeed's wiki says to set the Master ID to the CAN ID plus `0x10`, and never to `0x00`. For CAN ID `0x06`, that gives `0x16`. The CAN ID is the identifier the motor listens to for commands, and the Master ID is the identifier it answers from, so the host can tell the replies of different motors apart. Using the same value as the CAN ID, as in option B, would make replies look like commands.

    **Concept Tested:** Motor ID Assignment

    **See:** [CAN Motor Configuration and Motor ID Assignment](index.md#can-motor-configuration-and-motor-id-assignment)

---

#### 3. An MIT-mode frame stores the derivative gain K_d in 12 bits over the range 0 to 5. What whole number represents K_d = 2.0?

<div class="upper-alpha" markdown>
1. 819
2. 1638
3. 4095
4. 2047
</div>

??? question "Show Answer"
    The correct answer is **B**. The mapping is (x − x_min) × (2^n − 1) / (x_max − x_min), so 2.0 × 4095 / 5 = 1638. Option A is the value for K_d = 1.0, which the chapter computes as 819. Option C is the largest 12-bit value, which would stand for K_d = 5, and option D is about the middle of the range. The same formula packs position, speed, and torque with their own ranges.

    **Concept Tested:** Motor Mode Selection

    **See:** [An MIT Frame in Eight Bytes](index.md#an-mit-frame-in-eight-bytes)

---

#### 4. Why do the 24 V and 48 V systems of the reBot-DevArm lose less in their wires than a 12 V system of the same power?

<div class="upper-alpha" markdown>
1. Higher voltage makes the copper in the wire a better conductor
2. Higher voltage supplies are always built with thicker wires
3. Higher voltage slows the motors, so they draw no peak current
4. For the same power, a higher voltage needs a smaller current, so less is lost as heat and voltage drop
</div>

??? question "Show Answer"
    The correct answer is **D**. Power is voltage times current, so at twice the voltage the current is halved. The voltage lost in a wire is the current times its resistance, so the drop in volts halves, and as a percentage of the supply it quarters. The chapter's example shows 200 W in AWG 18 losing 5.8 percent at 12 V and 0.4 percent at 48 V. The cost is that the energy is more dangerous.

    **Concept Tested:** 24 V to 48 V Systems

    **See:** [Why Higher Voltage](index.md#why-higher-voltage)

---

#### 5. An arm holds a 1.0 kg object at a horizontal distance of 0.4 m from the shoulder. Ignoring the arm's own weight, what torque does the load put on the shoulder?

<div class="upper-alpha" markdown>
1. About 3.9 N·m
2. About 0.39 N·m
3. About 39 N·m
4. About 2.5 N·m
</div>

??? question "Show Answer"
    The correct answer is **A**. The torque is τ = m × g × r = 1.0 × 9.81 × 0.4 ≈ 3.9 N·m. Options B and C move the decimal point. This is before counting the weight of the arm itself, so the real load is larger. The chapter uses the same calculation to show that a 1.5 kg payload at 0.45 m takes about 74 percent of the DM4340P's 9 N·m rated torque.

    **Concept Tested:** Payload Comparison

    **See:** [Payload Comparison](index.md#payload-comparison)

---

#### 6. What is the "zero offset" of a joint?

<div class="upper-alpha" markdown>
1. The voltage below which the motor drive stops
2. The angle of the last command that the motor received
3. The stored difference between the motor's own encoder reading and the angle the arm calls zero
4. The error between two neighbouring values in a 12-bit field
</div>

??? question "Show Answer"
    The correct answer is **C**. Zeroing defines the arm's zero pose, and the zero offset is the stored number that makes it so. It is the CAN counterpart of Chapter 8's homing offset. In the lab, a joint 0.37 rad from zero reads +0.37 before zeroing and 0.00 after, and a command of +0.50 rad then leaves the joint at 0.87 rad on the motor's own scale. A joint that is taken apart needs its offset set again.

    **Concept Tested:** Zero Offset

    **See:** [Zeroing and the Zero Offset](index.md#zeroing-and-the-zero-offset)

---

#### 7. What makes the Damiao motors "quasi-direct drive", and why does it matter?

<div class="upper-alpha" markdown>
1. They have no gearbox at all, so they are fast but very weak
2. They use a low gear ratio (10:1 or 40:1), so the joint is easy to push back and its torque can be estimated from the motor current
3. They use a very high ratio like 1/345, so the joint is strong and hard to turn by hand
4. They use hobby PWM signals instead of a CAN bus
</div>

??? question "Show Answer"
    The correct answer is **B**. A quasi-direct-drive actuator is a powerful brushless motor with a low gear ratio, 10:1 in the DM4310 and 40:1 in the DM4340P. The low ratio makes the joint backdrivable and lets the arm be gentle and responsive, which is why MIT mode works well. The price is lower torque per kilogram of motor, so the motor must be larger, and that is part of why the arm costs more. Option A describes direct drive, and option C describes the STS3215.

    **Concept Tested:** Quasi-Direct Drive

    **See:** [Quasi-Direct Drive](index.md#quasi-direct-drive)

---

#### 8. In the lab, 200 W at 24 V through 1 m of AWG 18 loses only 1.5 percent, yet the script reports "TOO MUCH CURRENT". What explains this?

<div class="upper-alpha" markdown>
1. The voltage drop is too small to measure accurately
2. The supply voltage is above the Damiao under-voltage setting
3. The script confuses the lead wire with the return wire
4. A wire has two limits, the voltage drop and the heat from the current, and 8.3 A exceeds the 7 A teaching limit of AWG 18
</div>

??? question "Show Answer"
    The correct answer is **D**. A wire can pass one test and fail the other. The drop of 0.35 V is small, but 200 W / 24 V = 8.3 A, which is more than AWG 18 should carry continuously. The heat grows with the square of the current, so the wire must be chosen for both the drop and the current limit. AWG 16, with a 10 A limit, would pass. Headroom above 15 V is a separate matter about brown-out.

    **Concept Tested:** Voltage Drop

    **See:** [Voltage Drop and Brown-Out](index.md#voltage-drop-and-brown-out)

---

#### 9. A project must hold a 2 kg object, and a weighted score ranks the B601-DM first. What went wrong in the decision?

<div class="upper-alpha" markdown>
1. The weights for cost and software were set too low
2. The scores for the SO-ARM101 should have been raised
3. A hard requirement was treated as a weight, but the B601-DM's 1.5 kg payload cannot meet it
4. The B601-DM should always win when software support matters
</div>

??? question "Show Answer"
    The correct answer is **C**. A requirement, such as carrying 2 kg, is a filter that removes any arm that fails it. A preference, such as cheaper being better, is a weight. A weighted score lets a good result on one criterion pay for a failure on another. With a 2 kg requirement, only the B601-RS, rated at 2.5 kg, survives, and no weights are needed. Filter first, then weigh what remains.

    **Concept Tested:** Platform Selection Criteria

    **See:** [Platform Selection Criteria](index.md#platform-selection-criteria)

---

#### 10. Which protections do the published bills of materials for the reBot-DevArm include?

<div class="upper-alpha" markdown>
1. A fuse and a hardware E-stop, but no reverse-polarity protection
2. No fuse, no hardware E-stop, and no reverse-polarity protection
3. Only reverse-polarity protection
4. A fuse, a hardware E-stop, and reverse-polarity protection
</div>

??? question "Show Answer"
    The correct answer is **B**. The published bills list none of the three, and the wiki says only that you should have an emergency stop in your program. You should add a fuse in the positive lead, close to the supply and rated at least 1.25 times the largest current, and a hardware E-stop that cuts the DC supply. The red switch on the mains inlet is a power switch, not an emergency stop.

    **Concept Tested:** Reverse Polarity Protection

    **See:** [Missing Protections](index.md#missing-protections)
