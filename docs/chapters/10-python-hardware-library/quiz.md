# Quiz: A Python Hardware Library for Robot Arms

Test your understanding of unit conversion, class interfaces, drivers, fake arms, and exception handling for hardware with these review questions.

---

#### 1. What does Python do when you try to create an object from a subclass of an abstract base class that has not filled in every `@abstractmethod`?

<div class="upper-alpha" markdown>
1. It creates the object, and fails later when the missing method is called
2. It refuses to create the object, so the missing method is caught when the program starts
3. It fills in a default version of each missing method
4. It silently skips the missing methods
</div>

??? question "Show Answer"
    The correct answer is **B**. A class that inherits from `ABC` and marks methods with `@abstractmethod` cannot be used directly, and neither can a subclass that leaves any abstract method unfilled. The check catches a missing method when the program starts and not in the middle of a move. This is how the `Arm` class forces every driver to supply `_open`, `_close`, `_read`, and `_write`.

    **Concept Tested:** Class Interface

    **See:** [Class Interface](index.md#class-interface)

---

#### 2. The `Arm` class's `__exit__` method returns `False`. What does that mean?

<div class="upper-alpha" markdown>
1. Any error raised inside the `with` block is suppressed
2. The `with` block restarts from the beginning
3. The arm disconnects a second time
4. The error is not hidden and continues upward after the arm disconnects
</div>

??? question "Show Answer"
    The correct answer is **D**. A context manager's `__exit__` runs at the end of the block, always, even when an error was raised inside. Returning `False` means "do not hide the error," so the exception continues to the caller after the arm has been disconnected and its torque switched off. Returning `True` would swallow the error and let the program carry on as if nothing had happened, which is dangerous for a machine.

    **Concept Tested:** Context Manager

    **See:** [Try, Finally, and the With Statement](index.md#try-finally-and-the-with-statement)

---

#### 3. A joint's calibrated range is raw 1000 to 3000, so its middle is 2000. There are 4095/360 ≈ 11.375 steps per degree. A raw reading of 2228 corresponds to what angle?

<div class="upper-alpha" markdown>
1. About 20.0 degrees
2. About 15.8 degrees
3. About 195.9 degrees
4. About 228 degrees
</div>

??? question "Show Answer"
    The correct answer is **A**. The conversion is degrees = (raw − middle) / (4095 / 360). The middle is (1000 + 3000) / 2 = 2000, so (2228 − 2000) / 11.375 ≈ 20.0 degrees. Option B uses 2048 as the middle instead of the calibrated middle, option C forgets to subtract the middle, and option D forgets to divide. The raw number means nothing without the joint's calibration.

    **Concept Tested:** Unit Conversion

    **See:** [Unit Conversion](index.md#unit-conversion)

---

#### 4. The shoulder pan's calibrated range is raw 742 to 3242 with a middle of 1992. A driver is asked to write a target of 150 degrees. Which raw value does `deg_to_raw` produce?

<div class="upper-alpha" markdown>
1. 3698
2. 2504
3. 3242
4. 150
</div>

??? question "Show Answer"
    The correct answer is **C**. The unclamped calculation gives 1992 + 150 × 11.375 ≈ 3698, which is outside the calibrated range. The conversion function keeps the raw value inside the range, so it is held at 3242, which reads back as 109.89 degrees. Option B is the raw value for 45 degrees. In the library, the `Arm` base class also rejects a 150-degree target earlier with a `JointLimitError`.

    **Concept Tested:** Raw Servo Units

    **See:** [Unit Conversion](index.md#unit-conversion)

---

#### 5. A program calls `arm.connect()`, then `arm.move_to(...)`, and the write raises a `CommunicationError` that the program catches. There is no `with` block and no `finally`. What is the state of the torque afterward?

<div class="upper-alpha" markdown>
1. Off, because an exception automatically calls `disconnect`
2. Still on, because nothing ever called `disconnect`
3. Off, because the fake arm resets itself after a failure
4. Undefined, because Python cannot catch errors from hardware
</div>

??? question "Show Answer"
    The correct answer is **B**. Catching the error does not clean up. The torque comes on in `_open` and goes off only in `_close`, which runs from `disconnect`. In the lab's case 4, the torque is still on after the failure, with the motors holding and nobody commanding them. In case 3, with a `with arm:` block, the same failure leaves the torque off. Use `with` or `try` and `finally` every time.

    **Concept Tested:** Try Finally

    **See:** [Try, Finally, and the With Statement](index.md#try-finally-and-the-with-statement)

---

#### 6. Why is the joint-limit check written in the `Arm` base class and not in each driver?

<div class="upper-alpha" markdown>
1. The check runs faster in the base class than in a driver
2. Python does not allow a subclass to compare numbers
3. The limits are stored only in the fake arm
4. A driver that forgot the check would be a safety hole, so the check sits where no driver can skip it
</div>

??? question "Show Answer"
    The correct answer is **D**. The chapter puts safety rules in the layer that cannot be bypassed. Because `move_to` checks every target before it calls the driver's `_write`, a new driver for a third arm inherits the check for free and cannot forget it. This idea grows into the safety layers of Chapter 17. Speed and language rules play no part here.

    **Concept Tested:** Arm Class

    **See:** [Reading and Writing Positions](index.md#reading-and-writing-positions)

---

#### 7. What does the rule "convert at the edge" mean for the library?

<div class="upper-alpha" markdown>
1. Programs use one unit per joint, and raw steps and radians exist only inside a driver, which converts on the way in and out
2. Every function converts its arguments to raw steps before it does any work
3. Conversions are done only when a pose is saved to a file
4. Each program should choose its own units for each joint
</div>

??? question "Show Answer"
    The correct answer is **A**. Inside programs, every joint value has one unit: degrees for the arm's joints and percent for a gripper. Raw steps and radians appear only inside a driver, which converts on the way in and out. Mixed units cause more robot bugs than any other mistake, such as passing degrees to `math.sin`, which expects radians. Letting each program choose its own units would bring those bugs back.

    **Concept Tested:** Unit Conversion

    **See:** [Unit Conversion](index.md#unit-conversion)

---

#### 8. Why does `FeetechArm` catch a low-level `ValueError` and raise a `CommunicationError` using `raise ... from error`?

<div class="upper-alpha" markdown>
1. Python requires every error to be converted into the `Exception` class
2. The original error is deleted so that the program cannot see it
3. The program sees one family of arm errors, and the original error stays attached as the cause for debugging
4. The `ValueError` can only be raised by the fake arm
</div>

??? question "Show Answer"
    The correct answer is **C**. A "bad checksum" `ValueError` means nothing to a program that does not know about packets. The driver translates it into a `CommunicationError`, which belongs to the `ArmError` family that a program can catch as a whole. Using `from error` keeps the original attached as `__cause__`, so the details are still there for anyone debugging. In the lab, the cause prints as a `ValueError`.

    **Concept Tested:** Custom Exceptions

    **See:** [Custom Exceptions](index.md#custom-exceptions)

---

#### 9. A teammate's program contains `if isinstance(arm, FeetechArm):` before it moves a joint. What does this indicate?

<div class="upper-alpha" markdown>
1. It is the recommended way to make a program safe
2. The arm must be connected before the call
3. The program is running on the fake arm
4. The abstraction has leaked, and the missing feature should be added to the interface with a version for every driver
</div>

??? question "Show Answer"
    The correct answer is **D**. A program that checks which driver it has, or mentions a raw step, depends on the hardware underneath the interface, and it will break on the next arm. If a program needs something the interface does not offer, add it to the `Arm` interface with an implementation in every driver, and do not reach under it. The chapter says that if you ever catch a program checking which arm it has, the interface is missing something.

    **Concept Tested:** Hardware Abstraction Layer

    **See:** [Inheritance for Drivers](index.md#inheritance-for-drivers)

---

#### 10. In the lab, the fake arm reads exactly 0.00 degrees at the start, but the reBot driver on the pretend CAN bus reads −0.01 degrees for the same starting pose. What best explains the difference?

<div class="upper-alpha" markdown>
1. A 16-bit position field has an even number of steps, so no whole number sits exactly at zero
2. The pretend motor moves slowly toward its start position
3. The driver adds a small bias on purpose to protect the joint
4. The fake arm is less accurate than the reBot driver
</div>

??? question "Show Answer"
    The correct answer is **A**. The MIT frame stores position as a 16-bit whole number over a range that is symmetric about zero. With 65,536 values, the zero value falls between two neighbouring steps, so 0 maps to just below the middle and reads back as a tiny negative number. The error is far smaller than the motor's accuracy. The fake arm keeps plain Python floats in a dictionary, so it has no such rounding.

    **Concept Tested:** Fake Arm

    **See:** [The Fake Arm](index.md#the-fake-arm)
