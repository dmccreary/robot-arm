# Quiz: Moving the Arm: Trajectories, Grippers, and Teleoperation

Test your understanding of control loops, velocity profiles, waypoints, pick-and-place state machines, and teleoperation with these review questions.

---

#### 1. Which Python function should a control loop use to measure how long something took?

<div class="upper-alpha" markdown>
1. `time.time()`, because it gives the real clock time
2. `time.sleep()`, because it pauses for a measured time
3. `time.perf_counter()`, because it is fine-grained and only goes forward
4. `time.localtime()`, because it handles time zones
</div>

??? question "Show Answer"
    The correct answer is **C**. The wall clock from `time.time()` can jump when the computer corrects its clock over the network or the user changes the time zone, so a loop that measured a step with it could see a step that lasted minus two seconds. `time.perf_counter()` has very fine resolution and cannot go backward. `time.monotonic()` is the coarser option for timeouts and deadlines, and `time.time()` is for log time stamps.

    **Concept Tested:** Time Module

    **See:** [The Time Module](index.md#the-time-module)

---

#### 2. What is the recommended way to end a loop that is moving the arm from a thread?

<div class="upper-alpha" markdown>
1. Set a `threading.Event` stop flag that the loop checks at the top of every cycle
2. Kill the thread from outside in the middle of a command
3. Wait for the operator to press the E-stop
4. Call `time.sleep()` with a long delay in the main program
</div>

??? question "Show Answer"
    The correct answer is **A**. The main program calls `stop.set()`, and the loop notices within one period and shuts down cleanly, so its last act is the clean `finally` of Chapter 10. A loop that moves the arm must never be killed from outside in the middle of a command. The E-stop is the last resort and not the usual way to stop. `time.sleep()` blocks the program and would make it deaf to a stop request.

    **Concept Tested:** Stop Flag

    **See:** [Blocking, Threads, and the Stop Flag](index.md#blocking-threads-and-the-stop-flag)

---

#### 3. A naive loop does 12 ms of work and then sleeps one period of 20 ms. About what rate does it really run at?

<div class="upper-alpha" markdown>
1. 50 Hz, because the period is 20 ms
2. About 31 Hz, because each cycle lasts 32 ms
3. About 62 Hz, because the work and sleep overlap
4. About 20 Hz, because the work doubles the period
</div>

??? question "Show Answer"
    The correct answer is **B**. In the naive version, every cycle lasts the work plus the sleep: 12 + 20 = 32 ms, and 1 / 0.032 ≈ 31 Hz. The chapter's example with 8 ms of work gives 28 ms and about 36 Hz instead of 50. The fix is to schedule each cycle from the start time, so that the loop sleeps only for the time that is left, and the rate is exact on average.

    **Concept Tested:** Control Rate

    **See:** [The Control Loop](index.md#the-control-loop)

---

#### 4. A multi-joint move sends the shoulder pan 80 degrees and the elbow 20 degrees, with a speed limit of 40 degrees per second. How fast does the elbow move?

<div class="upper-alpha" markdown>
1. 40 degrees per second
2. 20 degrees per second
3. 5 degrees per second
4. 10 degrees per second
</div>

??? question "Show Answer"
    The correct answer is **D**. The joint with the longest way to go sets the time: T = 80 / 40 = 2 seconds. Every joint uses the same fraction t at every tick, so the elbow covers its 20 degrees in the same 2 seconds, at 20 / 2 = 10 degrees per second. All joints start and arrive together, and only the joint with the longest distance travels at the speed limit.

    **Concept Tested:** Multi-Joint Move

    **See:** [Multi-Joint Moves and the Speed Limit](index.md#multi-joint-moves-and-the-speed-limit)

---

#### 5. A joint moves 120 degrees with a speed limit of 60 degrees per second and an acceleration limit of 120 degrees per second squared, using a trapezoidal profile. How long does the move take?

<div class="upper-alpha" markdown>
1. 2.0 seconds
2. 2.5 seconds
3. 3.0 seconds
4. 1.5 seconds
</div>

??? question "Show Answer"
    The correct answer is **B**. The distance 120 is at least v²/a = 60² / 120 = 30, so the profile is a trapezoid. The total time is T = D / v + v / a = 120 / 60 + 60 / 120 = 2.0 + 0.5 = 2.5 seconds. That is a 0.5 s speed-up, a 1.5 s cruise, and a 0.5 s slow-down. Option A is the time for a linear move at the speed limit, which jumps to full speed.

    **Concept Tested:** Trapezoidal Velocity Profile

    **See:** [Velocity Profiles and the Acceleration Limit](index.md#velocity-profiles-and-the-acceleration-limit)

---

#### 6. Why does a linear move cause a jolt, and how does the smooth velocity profile avoid it?

<div class="upper-alpha" markdown>
1. A linear move jumps from rest to full speed at the first tick, which is an infinite acceleration, while the smooth profile starts and ends at zero speed
2. A linear move is always faster, and the smooth profile is always slower
3. A linear move ignores the joint limits, and the smooth profile checks them
4. A linear move uses degrees, and the smooth profile uses radians
</div>

??? question "Show Answer"
    The correct answer is **A**. At the first tick, a linear move goes from standing still to full speed at once, and the same happens at the end. The servo, gears, and printed parts feel this as a jolt. The smooth profile replaces t with 3t² − 2t³, which starts and ends at zero speed and is steepest in the middle. The price is time, because it needs 1.5 times as long for the same peak speed.

    **Concept Tested:** Smooth Velocity Profile

    **See:** [Velocity Profiles and the Acceleration Limit](index.md#velocity-profiles-and-the-acceleration-limit)

---

#### 7. Why should the whole waypoint list be checked before anything moves?

<div class="upper-alpha" markdown>
1. Checking first makes the arm move faster
2. A checked list is sorted by joint name
3. A bad pose should fail on the first line with a message naming the waypoint and joint, and not on the fifth waypoint with the arm half way through a task
4. The gripper cannot open until the list is checked
</div>

??? question "Show Answer"
    The correct answer is **C**. A waypoint list with a pose outside a joint's limit should be rejected before any motion begins. The lab's `check_waypoints` returns every problem in the list at once, such as "pick: elbow_flex = 120 is outside −97 to 97". A failure partway through leaves the arm stranded in the middle of a task, perhaps holding an object. Checking has no effect on speed or sorting.

    **Concept Tested:** Waypoint List

    **See:** [Waypoints and Waypoint Lists](index.md#waypoints-and-waypoint-lists)

---

#### 8. In a pick-and-place routine, the program commands the gripper to 0 percent and reads it back. How does it decide whether the grasp worked?

<div class="upper-alpha" markdown>
1. The grasp worked if the gripper reads exactly 100 percent
2. The grasp worked if the move finished without raising an error
3. The grasp worked if the gripper's temperature rose
4. The grasp worked if the gripper stopped above a small threshold such as 5 percent, because the object stopped it
</div>

??? question "Show Answer"
    The correct answer is **D**. An empty gripper closes to about 0 percent. A gripper that holds an object stops where the object stops it, for example at 20 percent. This is the same idea as the stall check of Chapter 5, and it is the program's only way to know whether the grasp worked. The check belongs right when the gripper closes, so that a missed grasp is found before the lift and transport.

    **Concept Tested:** Gripper Control

    **See:** [Gripper Control, Width, and Force](index.md#gripper-control-width-and-force)

---

#### 9. In the lab, a scheduled loop at 50 Hz is given 30 ms of work per tick. When a tick is late, the code sets `next_time = clock()`. What does this accomplish?

<div class="upper-alpha" markdown>
1. It makes the loop run exactly at 50 Hz by shortening the work
2. It stops the loop with an error
3. It starts scheduling again from now, so the loop settles at the rate the work allows and does not send a burst of commands to catch up
4. It doubles the sleep delay on the next tick
</div>

??? question "Show Answer"
    The correct answer is **C**. When the work takes longer than the 20 ms period, there is no time left to sleep. A loop that tried to catch up by rushing through the next cycles would send a burst of commands to the arm. Resetting the schedule from now accepts a lower rate, about 1 / 0.030 ≈ 33 Hz, and keeps the loop steady. The honest answer to work that cannot fit in the period is a lower rate or less work per tick.

    **Concept Tested:** Timing Jitter

    **See:** [The Control Loop](index.md#the-control-loop)

---

#### 10. In the lab's second pick-and-place run, the object is missing. The machine tries twice and ends in `FAILED`. What would happen if the program skipped the grasp check and went straight to `LIFT`?

<div class="upper-alpha" markdown>
1. The arm would carry an empty gripper across the table and place "nothing", with no sign that the task had failed
2. The gripper would refuse to open at the place position
3. The state machine would raise a `JointLimitError`
4. The arm would stay at the pick position until the thread stopped
</div>

??? question "Show Answer"
    The correct answer is **A**. The grasp state is where the decision is made: it closes the gripper, reads it, and returns `LIFT` only if the reading is above 5 percent. Without the check, the machine would go through lift, transport, lower, and release as if it held an object. A three-line check is the difference between a task that fails safely and one that carries nothing across the table. Reading the world before each commitment turns a script into a task you can trust.

    **Concept Tested:** State Machine

    **See:** [The Pick-and-Place State Machine](index.md#the-pick-and-place-state-machine)
