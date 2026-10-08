# Quiz: Logging, Testing, Simulation, and ROS 2

Test your understanding of logging, pytest, simulation, and the ROS 2 concepts with these review questions.

---

#### 1. Which log level is meant for something unexpected that the program handled, such as a target within 2 degrees of a joint limit?

<div class="upper-alpha" markdown>
1. `DEBUG`
2. `INFO`
3. `WARNING`
4. `CRITICAL`
</div>

??? question "Show Answer"
    The correct answer is **C**. The five levels rank messages by importance: `DEBUG` (10) for detail, `INFO` (20) for normal events, `WARNING` (30) for something unexpected that was handled, `ERROR` (40) for a failed operation, and `CRITICAL` (50) for a program that cannot go on or a safety risk. Keep `WARNING` and above for things that need a person, so that when one appears, someone looks.

    **Concept Tested:** Log Levels

    **See:** [Log Levels](index.md#log-levels)

---

#### 2. What is a ROS topic?

<div class="upper-alpha" markdown>
1. A named channel with a message type, where nodes publish messages and any number of nodes can subscribe
2. A single program that does one logical thing in a robot system
3. A file that describes the links and joints of a robot
4. A tool that plans collision-free paths for an arm
</div>

??? question "Show Answer"
    The correct answer is **A**. A ROS topic is a named channel with a defined message type. A node publishes messages to it, and any number of nodes subscribe, with the system connecting them by discovery and no addresses to type. For example, `sensor_msgs/JointState` carries arrays of joint names, positions, velocities, and efforts. Option B describes a node, option C a URDF, and option D MoveIt.

    **Concept Tested:** ROS Topic

    **See:** [ROS 2](index.md#ros-2)

---

#### 3. Why should floating-point results in a test be compared with `pytest.approx` and not `==`?

<div class="upper-alpha" markdown>
1. `==` can only compare integers in Python
2. `pytest.approx` runs the test faster
3. `==` raises an error when the numbers are decimals
4. Decimal numbers carry tiny rounding errors, and 0.1 + 0.2 is not exactly 0.3
</div>

??? question "Show Answer"
    The correct answer is **D**. Floating-point arithmetic cannot represent most decimals exactly, in any language, so a comparison with `==` can fail even when two values are equal for all practical purposes. `pytest.approx` accepts values that are close within a tolerance, such as `abs=0.05` for a round trip through whole servo steps. Use `pytest.raises` to check that an error happens, and `parametrize` to repeat a test.

    **Concept Tested:** Pytest

    **See:** [Unit Tests and Pytest](index.md#unit-tests-and-pytest)

---

#### 4. Why does the lab's `CsvLogger` call `flush()` after every row?

<div class="upper-alpha" markdown>
1. Flushing makes the CSV file smaller
2. A program that crashes with data still in memory leaves an empty file, and a crash is exactly when you want the log
3. The `csv` module requires a flush after each row
4. Flushing prevents blank lines on Windows
</div>

??? question "Show Answer"
    The correct answer is **B**. A flush forces the data out to disk. Without it, a million numbers waiting in memory are lost when the program crashes. Two habits make a CSV log useful: put the time first, taken from `time.perf_counter()`, and flush each row. Blank lines on Windows are prevented by opening the file with `newline=""`, which is a separate matter.

    **Concept Tested:** CSV Logging

    **See:** [CSV Logging](index.md#csv-logging)

---

#### 5. A new logger writes only `INFO` messages, but nothing appears on the screen. What is the most likely reason?

<div class="upper-alpha" markdown>
1. `INFO` messages are only written to files
2. The `INFO` method has been removed from recent versions of Python
3. The root logger's default level is `WARNING`, so `INFO` is hidden until the level is lowered
4. Loggers print only when a CSV file is open
</div>

??? question "Show Answer"
    The correct answer is **C**. If the level is set to `INFO`, then `INFO` and everything above it is shown. The default of the root logger is `WARNING`, so a message below that level is hidden until the program's setup lowers the level, for example with `logging.basicConfig(level=logging.INFO)`. This is also why the same program can run quietly in daily use and show every detail at `DEBUG` without changing any message.

    **Concept Tested:** Logging Module

    **See:** [Log Levels](index.md#log-levels)

---

#### 6. Why does the chapter warn that "a passing simulation is not a safe arm"?

<div class="upper-alpha" markdown>
1. A simulation proves logic but leaves out friction, lag, and loose gears, so the first real run must be small, slow, and logged
2. Simulations always produce errors that real arms do not have
3. A simulation can only be run on a real arm
4. The simulator disables the joint limits
</div>

??? question "Show Answer"
    The correct answer is **A**. Simulation is safe, fast, and repeatable, and it catches silly mistakes in logic. It cannot prove that the real arm will behave the same, because the simulator's assumptions are flattering. In the lab, an ideal fake arm follows a trajectory with zero error while a lagging one trails by about 4.5 degrees. Treat the first hardware run as a new experiment, with your hand near the E-stop and a log running.

    **Concept Tested:** Sim-to-Real Gap

    **See:** [The Sim-to-Real Gap](index.md#the-sim-to-real-gap)

---

#### 7. A joint moves at 40 degrees per second and chases its target with a time constant of 0.1 seconds. About how far behind its target will it run during the move?

<div class="upper-alpha" markdown>
1. About 0.4 degrees
2. About 4 degrees
3. About 400 degrees
4. About 40 degrees
</div>

??? question "Show Answer"
    The correct answer is **B**. The steady gap of a lagging joint is its speed times its time constant: 40 × 0.1 = 4 degrees. The chapter's example is 30 degrees per second with a 0.15 second delay, giving about 4.5 degrees. Plotting the target and the actual position against time shows the gap as two parallel lines, which is far quicker to read than a thousand numbers.

    **Concept Tested:** Plotting Trajectories

    **See:** [Plotting Trajectories and Workspaces](index.md#plotting-trajectories-and-workspaces)

---

#### 8. A safety-limit test is written with two stacked `@pytest.mark.parametrize` marks, one for the joint name and one for the side (min or max). The arm has 6 joints. How many separate test runs does pytest make?

<div class="upper-alpha" markdown>
1. 6
2. 8
3. 2
4. 12
</div>

??? question "Show Answer"
    The correct answer is **D**. Stacked `parametrize` marks multiply: 6 joints × 2 sides = 12 runs from a single function. The lab's version has 3 joints and 2 sides, so it makes 6 runs from a few lines. Testing every joint at both ends is the most valuable test you will write for an arm, because if someone later removes the limit check from `move_to`, this test fails the same day.

    **Concept Tested:** Testing Safety Limits

    **See:** [Fixtures, Safety Limits, and Regression Tests](index.md#fixtures-safety-limits-and-regression-tests)

---

#### 9. A coverage report shows `arm.py` at 95 percent and `kinematics.py` at 62 percent. Which conclusion does the chapter support?

<div class="upper-alpha" markdown>
1. The untested lines in `kinematics.py`, such as the Jacobian, have nothing protecting them, and coverage is a flashlight and not a score
2. `kinematics.py` is 62 percent correct
3. Every line in `arm.py` has been verified by a test
4. The project should chase 100 percent coverage for its own sake
</div>

??? question "Show Answer"
    The correct answer is **A**. Coverage measures how much of the code the tests ran, not how correct it is. A line that no test reaches is a line that nothing protects, so the missing lines are a to-do list. In the lab, the tests never ran the Jacobian, workspace sampling, collision check, or three-dimensional solver. But a line that was merely executed is not necessarily checked, so a high number does not prove correctness.

    **Concept Tested:** Test Coverage

    **See:** [Success Rate and Test Coverage](index.md#success-rate-and-test-coverage)

---

#### 10. After a change to the planner, the regression test that pins the standard move at 101 poses fails because the planner now produces 76 poses. What is the right response?

<div class="upper-alpha" markdown>
1. Delete the test, because it no longer passes
2. Change the code back immediately without looking at why the count changed
3. Decide whether the change was a mistake or an improvement, and update the test on purpose only if it was an improvement
4. Ignore the failure, because regression tests are advisory
</div>

??? question "Show Answer"
    The correct answer is **C**. A regression test pins down behavior that was right once, so that no later change breaks it by accident. When it fails, the test is asking a question: did you mean to change this? If the new behavior is a mistake, fix the code. If it is a real improvement, update the recorded numbers deliberately. Deleting or ignoring the test throws away the protection it was written to give.

    **Concept Tested:** Regression Testing

    **See:** [Fixtures, Safety Limits, and Regression Tests](index.md#fixtures-safety-limits-and-regression-tests)
