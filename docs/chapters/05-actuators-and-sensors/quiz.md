# Quiz: Actuators and Sensors

Test your understanding of motors, gearboxes, encoders, feedback, PID control, and the limits that keep a joint safe with these review questions.

---

#### 1. In a brushed DC motor, what is the motor's torque proportional to?

<div class="upper-alpha" markdown>
1. The supply voltage across the coil
2. The speed at which the shaft spins
3. The gear ratio of the gearbox
4. The current that flows through the coil
</div>

??? question "Show Answer"
    The correct answer is **D**. A DC motor's torque is proportional to the current through it, while its speed is proportional to the voltage across it less the back-EMF. This makes current a window onto force: a motor that pushes hard draws many amps, and an idle motor draws almost none. You can use that fact later to detect when a joint is pushing against an obstacle.

    **Concept Tested:** DC Motor

    **See:** [DC Motor](index.md#dc-motor)

---

#### 2. Why does a stalled DC motor draw the most current?

<div class="upper-alpha" markdown>
1. The brushes press harder against the coil when the shaft is blocked
2. A blocked motor makes no back-EMF, so the whole supply voltage falls across the small winding resistance
3. The gearbox turns the friction of the blocked shaft into extra current
4. The controller automatically raises the supply voltage when it detects a blockage
</div>

??? question "Show Answer"
    The correct answer is **B**. A spinning motor generates back-EMF that opposes the supply, so the current is (V − V_back) / R. When the shaft is blocked, there is no back-EMF at all, and Ohm's law gives the stall current. For the STS3215 that is 6 V across about 3 Ω, or 2.0 A. The same effect explains inrush current at start-up, and heat grows with the square of the current.

    **Concept Tested:** Back-EMF

    **See:** [DC Motor](index.md#dc-motor)

---

#### 3. A 12-bit magnetic encoder, with 4096 steps per turn, reads 3072. What angle does the joint report?

<div class="upper-alpha" markdown>
1. 67.5 degrees
2. 135 degrees
3. 270 degrees
4. 0.75 degrees
</div>

??? question "Show Answer"
    The correct answer is **C**. The angle is 3072 / 4096 × 360 = 270 degrees, since 3072 steps is three quarters of a turn. Each step is about 0.088 degrees. Option D is the fraction of a turn and forgets to multiply by 360. A 16-bit encoder would divide the same turn into 65,536 steps, which is 16 times finer, but resolution is not the same as accuracy.

    **Concept Tested:** Encoder

    **See:** [Encoder](index.md#encoder)

---

#### 4. The STS3215 `Present_Current` register counts in units of about 6.5 mA. A raw reading of 400 means what current?

<div class="upper-alpha" markdown>
1. About 2.6 A
2. About 0.4 A
3. About 26 A
4. About 61.5 A
</div>

??? question "Show Answer"
    The correct answer is **A**. Multiply the raw count by the unit size: 400 × 6.5 mA = 2,600 mA, or 2.6 A. This is above the motor's 2.0 A stall current listing, so a reading like this suggests the joint is working very hard. Option D divides instead of multiplying, and options B and C slip a decimal place. Because torque follows current, this register is the best view into the force at a joint.

    **Concept Tested:** Current Sensing

    **See:** [Velocity, Load, and Current Feedback](index.md#velocity-load-and-current-feedback)

---

#### 5. Why can a hobby servo not serve as the joint of a leader and follower pair?

<div class="upper-alpha" markdown>
1. It needs a 24 V supply that desktop arms cannot provide
2. Its position feedback never leaves the case, so the program cannot read its angle, and it has no address on a shared bus
3. It is too strong to be turned by hand
4. Its magnetic encoder wears out after a few hours
</div>

??? question "Show Answer"
    The correct answer is **B**. A hobby servo listens for a PWM pulse and uses an internal potentiometer for feedback, but that feedback stays inside the case. Your program cannot read the angle, the temperature, or the load, and each servo needs its own signal wire because it has no address. A leader arm must report its joint angles. Hobby servos run from about 5 to 6 V and use a potentiometer, not a magnetic encoder.

    **Concept Tested:** Hobby Servo

    **See:** [Hobby Servo](index.md#hobby-servo)

---

#### 6. Why does the SO-ARM101 leader use lower gear ratio numbers, such as 1/147, on some joints, where the follower uses 1/345 everywhere?

<div class="upper-alpha" markdown>
1. A person must be able to turn those joints by hand, and a lower ratio is easier to move while the joint can still hold its own weight
2. A lower ratio gives the leader more torque than the follower
3. A lower ratio removes backlash from the gearbox
4. The leader needs faster motors to track the follower
</div>

??? question "Show Answer"
    The correct answer is **A**. A high ratio such as 1/345 makes a joint strong but hard to turn by hand. The leader's job is to be moved by a person, so its wrist and gripper use 1/147, which is easier to move, though it has less torque and a higher output speed. Backlash is a property of how gears mesh and is not removed by a lower ratio. The leader exists to sense, not to match the follower's strength.

    **Concept Tested:** Gear Ratio

    **See:** [Gears and Torque](index.md#gears-and-torque)

---

#### 7. In the chapter's toy joint under gravity, case D (PD control) settles at 85 degrees for a 90-degree goal. Case E adds an integral term and reaches 90 but overshoots by about 35 percent. What does comparing the two show?

<div class="upper-alpha" markdown>
1. The proportional term alone can remove a steady error if it is raised high enough without limit
2. Adding the integral term lowers the final angle but removes all overshoot
3. Gravity error disappears whenever the derivative gain is raised
4. The integral term removes a steady error because it keeps growing while the error remains, but the built-up sum causes overshoot
</div>

??? question "Show Answer"
    The correct answer is **D**. With gravity pulling, a proportional push needs an error to exist, so the joint settles short of its goal. The integral term sums the error over time and keeps pushing until the last bit of error is gone. The cost is that the sum keeps growing while the joint is on its way, which causes overshoot. Raising K_p alone only shrinks the error, and K_d brakes the motion without removing a steady error.

    **Concept Tested:** PID Control

    **See:** [PID Control](index.md#pid-control)

---

#### 8. In the STS3215, the `Torque_Limit` register takes a value from 0 to 1000, in tenths of a percent. What value gives a 30 percent torque limit?

<div class="upper-alpha" markdown>
1. 30
2. 3
3. 300
4. 700
</div>

??? question "Show Answer"
    The correct answer is **C**. Because each unit is a tenth of a percent, 30 percent is 300 units, and the full range of 0 to 1000 covers 0 to 100 percent. LeRobot's gripper setting of 500 is therefore 50 percent. Since torque is proportional to current, a torque limit is also a current limit, and it bounds both the push and the heat. Option D is the setting for a 70 percent limit.

    **Concept Tested:** Torque Limit

    **See:** [Torque Enable, Release, and Limit](index.md#torque-enable-release-and-limit)

---

#### 9. During a first test move, a joint travels the wrong way and keeps going. What is the correct response?

<div class="upper-alpha" markdown>
1. Press the E-stop, then look for a sign error, a swapped motor ID, or a calibration problem
2. Wait a few seconds to see whether the feedback corrects the motion
3. Raise the torque limit so that the joint can reach the goal faster
4. Increase K_p so that the controller reacts more strongly
</div>

??? question "Show Answer"
    The correct answer is **A**. Reversed feedback or a sign error is the worst case of runaway motion, because the larger the error grows, the harder the motor pushes away from the goal. Waiting, raising the torque limit, or raising K_p all make a runaway joint stronger. The chapter says to press the E-stop, find the cause, and retest with a low torque limit and a small step.

    **Concept Tested:** Runaway Motion

    **See:** [Runaway Motion](index.md#runaway-motion)

---

#### 10. Why should you write the present position into the goal register before enabling torque?

<div class="upper-alpha" markdown>
1. The `Torque_Enable` register refuses to switch on while the goal is zero
2. It prevents the EEPROM from wearing out
3. It makes the magnetic encoder absolute
4. The servo works toward whatever goal is stored, which may be an old value far from the joint, and the arm can lunge
</div>

??? question "Show Answer"
    The correct answer is **D**. As soon as torque comes on, the servo starts working toward the value in its goal register. If that is stale, the arm moves suddenly across a large distance. The safe sequence is to read the present position, write it as the goal, and only then enable torque, with the arm in a safe pose and a hand near the E-stop. Changes to settings should be made while torque is off.

    **Concept Tested:** Torque Enable

    **See:** [Torque Enable, Release, and Limit](index.md#torque-enable-release-and-limit)
