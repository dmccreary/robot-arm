---
title: "Moving the Arm: Trajectories, Grippers, and Teleoperation"
description: "How to make an arm move well in Python: the time module and fixed-rate control loops, joint-space moves, interpolation and velocity profiles, waypoints, gripper control, a pick-and-place state machine, and a teleoperation loop that makes a follower copy a leader."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 21:56:16"
version: 1.11
---

# Moving the Arm: Trajectories, Grippers, and Teleoperation

## Summary

This chapter teaches how to make the arm move well. You will write joint-space moves, timed control loops, smooth trajectories, gripper control, and pick-and-place routines, and use a leader arm to teleoperate a follower. After this chapter, you will be able to program a repeatable pick-and-place task.

## Concepts Covered

This chapter covers the following 28 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Time Module | 105 |
| Control Loop | 104 |
| Joint-Space Motion | 103 |
| Single-Joint Move | 97 |
| Multi-Joint Move | 96 |
| Waypoint | 96 |
| Waypoint List | 95 |
| Teleoperation Loop | 64 |
| Interpolation | 49 |
| Gripper Control | 40 |
| Trajectory | 32 |
| Pick and Place | 32 |
| Linear Interpolation | 11 |
| Acceleration Limit | 7 |
| Grasp Force | 5 |
| Trapezoidal Velocity Profile | 4 |
| Control Rate | 4 |
| Timing Jitter | 3 |
| Blocking vs Non-Blocking Code | 3 |
| Threads | 2 |
| Pre-Grasp Approach | 2 |
| Latency | 2 |
| Smooth Velocity Profile | 1 |
| Stop Flag | 1 |
| Gripper Width | 1 |
| Lift and Retreat | 1 |
| State Machine | 1 |
| Leader-Follower Mapping | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 8: Building and Calibrating the SO-ARM100](../08-building-the-so-arm/index.md)
- [Chapter 10: A Python Hardware Library for Robot Arms](../10-python-hardware-library/index.md)

---

!!! mascot-welcome "Time to Move Me, Smoothly!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Until now I could read my joints and jump to a pose. In this chapter you will teach me to *move*: at a steady rhythm, in smooth curves, through a list of stops, and all the way to picking something up and putting it down. Let's move it!

The `Arm` class of Chapter 10 can say where the joints are and send them a target. If you ask it to go from 0 to 90 degrees, it sends 90 and the servo races there as fast as it can, with a jolt at the start and a jolt at the end. That is a fine way to test a joint and a poor way to carry a full cup of tea. Good motion needs three more things: a sense of *time*, so that the program does something many times a second at a steady pace; a *plan*, so that the joint moves in a smooth curve; and a *routine*, so that many such moves add up to a useful task.

The chapter follows that order. It starts with the loop that everything else rests on, the control loop that repeats at a fixed rate. Then it moves joints, one and then many, along straight and smooth paths. It adds the gripper and ties the pieces into a pick-and-place routine, and it ends with teleoperation, in which a person's hand on a leader arm is the plan. As always, every program runs first on the fake arm of Chapter 10, with no power, and Chapter 3's rule applies when you move to the real arm: first moves are small and slow.

## Time and the Control Loop

### The Time Module

The **time module** is Python's way of asking "what time is it?" and "wait a while". It has four functions that matter here, and picking the right one is the first skill of this chapter.

| Function | What it does | Use it for |
|---|---|---|
| `time.sleep(seconds)` | Pauses the program for about that long | Waiting between steps |
| `time.perf_counter()` | A clock with very fine resolution that only goes forward | Timing how long something takes |
| `time.monotonic()` | A clock that never goes backward, with coarser resolution | Timeouts and deadlines |
| `time.time()` | The wall-clock time, in seconds since 1970 | Time stamps in a log |

The wall clock, `time.time()`, can jump: the computer corrects its clock over the network, or the user changes the time zone. A control loop that measured its steps with it could see a step that lasted minus two seconds. The two other clocks cannot jump, so measure durations with `time.perf_counter()`.

Here is a worked example that shows the limit of `time.sleep`. The code asks to sleep for 10 milliseconds, 20 times, and measures what really happened:

```python linenums="1"
import time

delays = []
for _ in range(20):
    start = time.perf_counter()
    time.sleep(0.010)
    delays.append(time.perf_counter() - start)

print(f"asked for 10.0 ms, got {1000 * min(delays):.1f} to {1000 * max(delays):.1f} ms")
```

On a typical laptop the result is a little over 10 ms every time, and sometimes much more, because the operating system decides when your program runs again. The program asked for a minimum, and the computer promised only that it would not return early. The rest of this section is about building a loop that works anyway.

### The Control Loop

A **control loop** is a piece of code that does three things over and over at a steady rate: *read* the state of the world, *decide* what to do, and *write* a command. For an arm, reading is `read_pose()`, deciding is "where should each joint be now?", and writing is `move_to()`. The PID controller inside a servo (Chapter 5) has the same shape, and it runs inside the motor much faster than your program can. Your loop runs on the computer, and 50 times a second is plenty for the arm in this book. A loop does not have to read first. The trajectory player later in this chapter only writes, and the teleoperation loop reads one arm and writes to another.

The tempting way to write a loop is to do the work and then sleep for one period. It has a hidden flaw: the work takes time too, so every cycle lasts the work plus the sleep. At 50 Hz the period is 20 ms. If the work takes 8 ms, each cycle takes 28 ms, and the loop runs at 36 Hz and not 50. The better way is to schedule each cycle from the start time: the *n*th cycle is due at `start + n × period`, and the loop sleeps only for the time that is left. The work then fits inside the period, and the rate is exact on average.

```python linenums="1"
import time

period = 1 / 50                       # 20 ms
next_time = time.perf_counter()
for tick in range(100):
    do_the_work(tick)                 # read, decide, write
    next_time += period               # when this cycle is due to end
    delay = next_time - time.perf_counter()
    if delay > 0:
        time.sleep(delay)             # sleep only for the time that is left
    else:
        next_time = time.perf_counter()   # we are late: start again from now
```

The last two lines handle the case where the work takes *longer* than the period. A loop that tried to catch up by rushing through the next cycles would send a burst of commands, so the version above skips ahead and accepts a lower rate. The lab turns this into the function `run_loop`.

!!! mascot-thinking "A Loop Is a Promise About Time"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A fixed-rate loop is a promise: "I will look at the world and answer, on schedule, every 20 milliseconds." Everything smooth about a robot's motion comes from keeping that promise. If the work cannot fit in the period, no cleverness will help, and the honest answer is a lower rate or less work per tick.

### Control Rate, Timing Jitter, and Latency

The **control rate** is how many times per second the loop runs, in hertz (Hz), and the **period** is its inverse: \( \text{period} = 1 / \text{rate} \). A rate of 50 Hz has a period of 20 ms, and 60 Hz has a period of 16.7 ms. LeRobot's teleoperation command defaults to 60 frames per second, and its recording examples use 30. A higher rate gives smoother motion and a faster reaction, and it needs more work per second from the computer and the bus. At 1,000,000 baud a byte takes 10 microseconds (Chapter 4), so a short packet to one servo takes well under a millisecond, and for this arm the limit is usually the program and not the wires.

**Timing jitter** is the variation in the time between loop cycles. A loop at 50 Hz has a planned period of 20 ms, and some cycles last 19 ms and others 24 ms. A little jitter is harmless, since the motors smooth it out. A lot of it makes the motion stutter, and it grows when the computer is busy with something else. The lab measures the worst jitter of a loop.

**Latency** is the delay between something happening and the arm's response to it. In teleoperation, it is the time from the leader's joint moving to the follower's joint starting to move. It has three parts: the wait for the next loop cycle (up to one period), the time to read and write on the bus, and the time that the follower's own motor takes to react. At 50 Hz the first part alone is up to 20 ms.

The next MicroSim practises the arithmetic of loops. You predict the rate of a naive loop and of a scheduled loop for different amounts of work.

#### Diagram: Loop Rate Calculator

<iframe src="../../sims/loop-rate-calculator/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Loop Rate Calculator MicroSim fullscreen](../../sims/loop-rate-calculator/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Loop Rate Calculator</summary>
Type: microsim
**sim-id:** loop-rate-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the period of a control loop and the rate that a naive loop and a scheduled loop actually achieve, for six loops, to within 0.1 of the unit shown, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** control loop, control rate, period, naive loop, scheduled loop, work time (all defined in the section "Time and the Control Loop" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the target rate and the work time in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A loop that sleeps one period after its work runs at the target rate. (It runs slower, since each cycle is the work plus the sleep.) (2) A scheduled loop can always keep the target rate. (It cannot if the work takes longer than the period.) (3) A faster target rate is always better. (The work must fit inside the period.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. The three formulas are short, and comparing the naive and scheduled answers for the same numbers shows why the scheduled loop is better.

**Content:**

Explore mode has two quantities the learner can change, and shows the period, the rate of a naive loop and the rate of a scheduled loop, with a bar of the cycle that is work and the part that is waiting.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Target rate | 10 | 200 | 10 | 50 | Hz |
| Work per cycle | 0 | 50 | 1 | 8 | ms |

Formulas: period (ms) = 1000 / target rate. Naive rate (Hz) = 1000 / (work + period). Scheduled rate (Hz) = the smaller of the target rate and 1000 / work. Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | What is the period of a 50 Hz loop? | ms | 20.0 | 1000 / 50 = 20 ms. |
| 2 | What is the period of a 60 Hz loop? | ms | 16.7 | 1000 / 60 = 16.67 ms. |
| 3 | A naive loop targets 50 Hz and its work takes 5 ms. What rate does it achieve? | Hz | 40.0 | Each cycle is 5 + 20 = 25 ms, and 1000 / 25 = 40 Hz. |
| 4 | A scheduled loop targets 50 Hz and its work takes 5 ms. What rate does it achieve? | Hz | 50.0 | The work fits inside the 20 ms period, so the loop keeps the target rate. |
| 5 | A scheduled loop targets 50 Hz and its work takes 25 ms. What rate does it achieve? | Hz | 40.0 | The work is longer than the period, so each cycle is 25 ms and 1000 / 25 = 40 Hz. |
| 6 | A naive loop targets 100 Hz and its work takes 4 ms. What rate does it achieve? | Hz | 71.4 | The period is 10 ms, each cycle is 4 + 10 = 14 ms, and 1000 / 14 = 71.4 Hz. |

**Provenance:** The formulas are from the chapter sections "The Control Loop" and "Control Rate, Timing Jitter, and Latency". The numbers are illustrative values written for this sim.

**Rules:** period = 1000 / rate. naive = 1000 / (work + period). scheduled = min(rate, 1000 / work) and equals the target rate when work <= period. When the work is 0 ms the scheduled rate equals the target rate. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner changes the target rate and the work time and watches the two achieved rates. The learner should notice that the naive loop falls below the target as soon as there is any work, and that the scheduled loop stays at the target until the work is longer than the period.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with a target rate of 50 Hz and 8 ms of work, showing a period of 20 ms, a naive rate of 35.7 Hz and a scheduled rate of 50 Hz.

**Chapter Anchors:** The chapter states that 50 Hz has a period of 20 ms, that 60 Hz has a period of 16.7 ms, and that a naive loop with 8 ms of work at 50 Hz runs at 36 Hz. The sim has six problems and mastery is 5 of 6.
</details>

### Blocking, Threads, and the Stop Flag

The difference between **blocking vs non-blocking code** is whether the program can do anything else while it waits. Code is *blocking* when it cannot. `time.sleep(2)` blocks: for two seconds the program is deaf, and a stop request that arrives during the sleep is not noticed until it ends. A loop that runs for a minute, as a teleoperation loop does, blocks the main program for a minute. **Non-blocking** code returns at once and lets the program carry on, either by doing a small piece of work each time it is called, or by running the work somewhere else.

**Threads** are separate paths of execution inside one program, and each path is a *thread*. The standard library's `threading` module starts one with `threading.Thread(target=function)` and `start()`. The control loop can run in a thread, while the main program waits for a key, draws a picture, or talks to an agent (Chapter 15). Two threads need a safe way to talk, and the simplest is a **stop flag**, a `threading.Event`. The loop checks `stop.is_set()` at the top of every cycle, and the main program calls `stop.set()` to ask it to finish. It is polite and it is bounded: the loop notices within one period, and it always shuts down cleanly. A thread has one big rule for robots. A loop that moves the arm must never be killed from outside in the middle of a command. Always stop it with a flag, so that its last act is the clean `finally` of Chapter 10.

!!! mascot-warning "A Loop That Cannot Be Stopped Is a Hazard"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Every loop that moves the arm needs a way out that you can reach: a stop flag, a time limit, or both. A loop with neither can only be stopped by the E-stop, and the E-stop should be the last resort and not the usual way. Put the flag in before you write the rest of the loop.

## Moving Joints

### Joint-Space Motion

**Joint-space motion** is movement described by the *joint angles* alone. You say "shoulder pan 60 degrees, elbow 30 degrees", and each joint goes there. You never say where the hand ends up in the room, because the pose of Chapter 2 is exactly this list of angles. The alternative is Cartesian motion, which describes the hand's position in space and works backward to the joints, and Chapter 12 covers it. Joint-space motion is simpler and it needs no maths, and it is the right choice when you know the pose you want, such as "home" or "pick above the bin". Its drawback is that equal joint steps do not make the hand move in a straight line.

### Linear Interpolation and the Single-Joint Move

**Interpolation** is finding the values *between* two known values. **Linear interpolation** does it with a straight line: the value a fraction \( t \) of the way from \( a \) to \( b \) is

\[ \text{value}(t) = a + (b - a)\, t, \qquad 0 \le t \le 1 \]

A **single-joint move** is the simplest use: one joint goes from a start angle to an end angle over a chosen time, with a new target sent at every tick of the control loop. A worked example is shoulder pan from 0 to 60 degrees in 2 seconds at 50 Hz. There are \( 2 \times 50 = 100 \) steps, and the target at step \( i \) is \( 0 + 60 \times i / 100 \), which rises by 0.6 degrees at each tick. The speed is \( 60 / 2 = 30 \) degrees per second. In code, `lerp(a, b, t)` is one line, and a trajectory is a list of such values, one per tick.

### Multi-Joint Moves and the Speed Limit

A **multi-joint move** moves several joints at once, and the natural wish is that they all start together and arrive together, so that the arm moves as one. The rule is that every joint uses the *same* \( t \) at every tick, so each joint covers its own distance in the same time. That means the joints go at different speeds: the one with the longest way to go sets the pace, and the others go proportionally slower. Take a move in which the shoulder pan goes 60 degrees and the elbow 30 degrees, with a speed limit of 30 degrees per second. The pan, with the longer way, sets the time: \( 60 / 30 = 2 \) seconds. The elbow takes the same 2 seconds for 30 degrees, so it moves at 15 degrees per second. In general

\[ T = \max_i \frac{|d_i|}{v_{max}} \]

where \( d_i \) is the distance of joint \( i \). The speed limit is the safety rule of Chapter 5 in motion form: it is the largest speed that you allow any joint, chosen well below what the servo could do.

### Trajectories

A **trajectory** is a path *with timing*: the pose that every joint should have at each moment. A list of poses at a fixed rate is a trajectory, and the `Trajectory` dataclass of the lab holds exactly that, with its duration. The same path can be driven slowly or quickly, so the same path gives many trajectories. The velocity profile, next, is the part of the trajectory that decides how the joint speeds up and slows down.

### Velocity Profiles and the Acceleration Limit

The linear move has a flaw you can hear. At the first tick the joint goes from standing still to 30 degrees per second at once, which means an infinite acceleration, and the same happens at the end. The servo, the gears and the printed parts feel this as a jolt. A **velocity profile** is the shape of the speed over time, and a good profile starts and ends at zero speed.

The **smooth velocity profile** replaces \( t \) with the ramp \( s(t) = 3t^2 - 2t^3 \). It starts and ends at zero speed and is steepest in the middle, where its speed is 1.5 times the average. It is one line of code, and it is a good default. Chapter 19 develops better curves, such as the minimum-jerk polynomial. The price of the smooth profile is time: to keep the same peak speed, it needs 1.5 times as long as the linear move.

The **trapezoidal velocity profile** is the classic profile of industrial robots. The joint speeds up at a constant acceleration until it reaches the speed limit, cruises at that speed, and slows down at the same rate. Plotted, the speed is a trapezoid. The **acceleration limit** \( a_{max} \), in degrees per second squared, is the largest change of speed that you allow, and it is what keeps the start and stop gentle. For a distance \( D \), a speed limit \( v \) and an acceleration limit \( a \), if \( D \ge v^2 / a \) then

\[ t_{accel} = \frac{v}{a}, \qquad t_{cruise} = \frac{D - v\, t_{accel}}{v}, \qquad T = 2\, t_{accel} + t_{cruise} = \frac{D}{v} + \frac{v}{a} \]

If the distance is too short to reach the speed limit, the speed never reaches \( v \), and the profile is a triangle: \( t_{accel} = \sqrt{D / a} \), \( T = 2\, t_{accel} \) and the peak speed is \( a\, t_{accel} \). A worked example: \( D = 90 \) degrees, \( v = 60 \) degrees per second and \( a = 120 \) degrees per second squared. Because \( 90 \ge 60^2 / 120 = 30 \), the profile is a trapezoid, with \( t_{accel} = 60 / 120 = 0.5 \) s, \( t_{cruise} = (90 - 60 \times 0.5) / 60 = 1.0 \) s, and \( T = 2.0 \) s. For \( D = 20 \) degrees the profile is a triangle, with \( t_{accel} = \sqrt{20 / 120} = 0.41 \) s, \( T = 0.82 \) s and a peak of 49 degrees per second.

| Profile | Speed at the start | Speed in the middle | Time for the same peak speed | Use it for |
|---|---|---|---|---|
| Linear | Jumps to full speed | Constant | Shortest | Testing, tiny moves |
| Smooth | Starts at zero | 1.5 times the average | 1.5 times the linear time | A good default |
| Trapezoidal | Starts at zero, rises steadily | Constant at the limit | Between the two | Speed and acceleration limits you can state |

Next, a MicroSim for the trapezoid arithmetic.

#### Diagram: Trapezoid Profile Calculator

<iframe src="../../sims/trapezoid-profile-calculator/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Trapezoid Profile Calculator MicroSim fullscreen](../../sims/trapezoid-profile-calculator/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Trapezoid Profile Calculator</summary>
Type: microsim
**sim-id:** trapezoid-profile-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the acceleration time, cruise time, total time and peak speed of a joint move under a trapezoidal velocity profile, for six problems, to within the tolerance shown, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** trajectory, velocity profile, speed limit, acceleration limit, trapezoidal velocity profile (all defined in the section "Velocity Profiles and the Acceleration Limit" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within the tolerance in the Tolerance column of Content. Mastery is 5 of 6 correct on the first attempt. Changing the distance and limits in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The move always reaches the speed limit. (A short move never does, and its profile is a triangle.) (2) The time is the distance divided by the speed limit. (The speed-up and slow-down add time.) (3) A higher acceleration limit changes the cruise speed. (It only shortens the ramps.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a formula on new numbers with an immediate check. Including a short move that makes a triangle forces the learner to test the condition before choosing the formula.

**Content:**

Explore mode has three quantities the learner can change, and shows the speed against time as a trapezoid or a triangle, with the four times and the peak speed.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Distance | 5 | 180 | 5 | 90 | degrees |
| Speed limit | 10 | 120 | 10 | 60 | degrees per second |
| Acceleration limit | 20 | 400 | 20 | 120 | degrees per second squared |

Rules for the problems: if D >= v^2 / a the profile is a trapezoid with t_accel = v / a, t_cruise = (D - v x t_accel) / v and T = 2 x t_accel + t_cruise. Otherwise it is a triangle with t_accel = sqrt(D / a), t_cruise = 0, T = 2 x t_accel and a peak speed of a x t_accel. Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Tolerance | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | D = 90 degrees, v = 60 deg/s, a = 120 deg/s^2. What is the total time? | seconds | 2.00 | 0.01 | 90 >= 30, so it is a trapezoid: T = 90 / 60 + 60 / 120 = 2.00 s. |
| 2 | The same move. How long is the speed-up? | seconds | 0.50 | 0.01 | t_accel = 60 / 120 = 0.50 s. |
| 3 | The same move. How long is the cruise? | seconds | 1.00 | 0.01 | t_cruise = (90 - 60 x 0.5) / 60 = 1.00 s. |
| 4 | D = 20 degrees, v = 60 deg/s, a = 120 deg/s^2. What is the total time? | seconds | 0.82 | 0.01 | 20 < 30, so it is a triangle: t_accel = sqrt(20 / 120) = 0.408 s and T = 0.82 s. |
| 5 | The same move. What is the peak speed? | deg/s | 49.0 | 0.1 | The peak is 120 x 0.408 = 49.0 deg/s, below the 60 deg/s limit. |
| 6 | D = 60 degrees, v = 30 deg/s, a = 60 deg/s^2. What is the total time? | seconds | 2.50 | 0.01 | 60 >= 15, so it is a trapezoid: T = 60 / 30 + 30 / 60 = 2.50 s. |

**Provenance:** The formulas are from the chapter section "Velocity Profiles and the Acceleration Limit". The problems are illustrative values written for this sim. Problems 1 to 5 are the chapter's worked examples.

**Rules:** An answer is correct when |typed - correct| <= the tolerance. The explore ranges cover every value in the problems. The sim chooses the trapezoid or the triangle by testing D >= v^2 / a.

**Learner Activity:**

1. In Explore mode the learner changes the distance and the limits and watches the speed graph change between a trapezoid and a triangle. The learner should notice that making the distance shorter turns the trapezoid into a triangle at D = v^2 / a.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with D = 90, v = 60 and a = 120, showing a trapezoid with a total time of 2.00 s.

**Chapter Anchors:** The chapter's worked examples are D = 90 (T = 2.0 s, speed-up 0.5 s, cruise 1.0 s) and D = 20 (T = 0.82 s, peak 49 degrees per second). The sim has six problems and mastery is 5 of 6.
</details>

### Waypoints and Waypoint Lists

A **waypoint** is a named pose that the arm passes through, with an optional pause once it gets there. A **waypoint list** is the ordered list of them that makes up a task: "home", "above the object", "at the object", "above the bin". A task written as waypoints is easy to read and to change, because you can edit a single pose without touching the code that moves between them. The lab's `Waypoint` dataclass holds the name, the pose and the pause.

A waypoint list has one rule that saves arms. *Check the whole list before anything moves.* A list with a pose outside a joint's limit should fail on the first line of the program, with a message that names the waypoint and the joint, and not on the fifth waypoint with the arm half way through a task. The lab's `check_waypoints` returns every problem in the list at once. It uses the limits that `Joint` holds, which are the limits that you measured in Chapter 8.

!!! mascot-tip "Name Every Waypoint"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A waypoint called `pick_above_bin` tells you what it is for, and `pose_4` tells you nothing. When something goes wrong you will read the names in an error message, and when a joint is wrong you will fix one line and not hunt through numbers.

## Grippers and Pick and Place

### Gripper Control, Width, and Force

**Gripper control** treats the gripper as one more joint, with its own target at every tick, in the percent that Chapter 10 gave it: 0 is closed and 100 is open, from the calibration. The **gripper width** is how far apart the fingers are, and the percent is a measure of it. To turn the percent into millimeters, measure the opening with calipers (Chapter 7) at 0 percent and at 100 percent, and interpolate between the two. The width matters because a grasp works only if the opening is wider than the object when approaching and the fingers close until they touch it.

**Grasp force** is how hard the fingers squeeze, and the gripper limits it with a torque limit (Chapter 5). The LeRobot follower's configuration gives the gripper a torque limit of 50 percent and an overload torque of 25 percent, so that a gripper that closes on an object cannot burn out its motor by pushing forever. The squeeze that you want is just enough to hold the object, and the force limit is also the safety limit.

A closed gripper that has something in it behaves differently from an empty one, and a program can tell. Command 0 percent, wait for the move to end, and read the gripper. An empty gripper reads about 0. A gripper that holds an object stops where the object stops it, at the object's width, for example 20 percent. That is the same idea as the stall check of Chapter 5, and it is the program's only way to know whether a grasp worked. The lab uses a threshold of 5 percent.

### The Pick-and-Place State Machine

**Pick and place** is the most common arm task: pick something up at one place and put it down at another. It breaks into steps that must come in a fixed order, and each step has a reason.

| Step | What the arm does | Why |
|---|---|---|
| Approach | Move above the object with the gripper open | The **pre-grasp approach** comes from above so that the fingers do not hit the object on the way in |
| Descend | Go straight down to the object | The fingers surround it |
| Grasp | Close the gripper and check that it holds something | A missed grasp must be found now, not after the move |
| Lift | Go straight back up with the object | The **lift and retreat** moves keep the arm clear of the table and the object |
| Transport | Move above the place | Nothing is dragged across the table |
| Lower | Go down to the place | |
| Release | Open the gripper | |
| Retreat | Go back up, clear of the object | The arm does not knock what it just put down |

A **state machine** is a program built around a list of *states* and rules for the next state. Here each step above is a state, and the rule is mostly "the next one in the list". Its power is in the *exceptions*: the grasp state can send the machine back to the approach state to try again, or to a failed state when the tries run out. Writing the task as a state machine keeps these decisions in one place, with one function per state and a table that maps each state to its function, and it prints the state it is in, which makes a task easy to watch and debug. Python's `enum` module makes the states a named list that cannot be mistyped.

!!! mascot-tip "Check the Grasp Before the Lift"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The cheapest place to find a missed grasp is the moment the gripper closes. Read the gripper right then, and let the state machine retry or stop, and you will not carry an empty gripper across the table or put "nothing" down very carefully.

The next MicroSim practises the order of the steps.

#### Diagram: Pick and Place Sequencer

<iframe src="../../sims/pick-and-place-sequencer/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Pick and Place Sequencer MicroSim fullscreen](../../sims/pick-and-place-sequencer/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Pick and Place Sequencer</summary>
Type: microsim
**sim-id:** pick-and-place-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the eight steps of a pick-and-place task into their correct order, with at least 7 of the 8 steps in their correct positions within three attempts.

**Prerequisites:** pick and place, pre-grasp approach, lift and retreat, gripper control, state machine (all defined in the section "The Pick-and-Place State Machine" above this block).

**Evidence of Mastery:** The learner arranges eight shuffled step cards into an order and presses Check. An arrangement is scored by the number of cards in their correct position, as given in the Position column in Content. Mastery is 7 or more of 8 cards in the correct position within three attempts. Reading the explanations in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The arm should go straight to the object's height from home. (It approaches from above first, so that the fingers do not hit the object.) (2) The gripper closes at the same time as the arm descends. (It closes after the arm has stopped at the object.) (3) The arm can move away as soon as the gripper opens. (It must retreat upward, clear of what it placed.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to structure the parts of a procedure by their dependencies. Ordering the cards forces the learner to reason about which step must happen before which, and the count of correct positions shows which dependency was missed.

**Content:**

The eight steps, with the correct position of each:

| Position | Step | Why it goes here (shown as feedback) |
|---|---|---|
| 1 | Move above the object with the gripper open. | The approach from above keeps the fingers clear of the object. |
| 2 | Descend to the object. | The fingers must surround the object before they close. |
| 3 | Close the gripper and check that it holds something. | The grasp is checked now, so that a miss is found before the move. |
| 4 | Lift straight up with the object. | Lifting first keeps the object clear of the table. |
| 5 | Move above the place. | The object travels at a safe height. |
| 6 | Lower to the place. | The object is put down gently. |
| 7 | Open the gripper. | The object is released only when it is in place. |
| 8 | Retreat upward. | The arm goes up before it moves away, so it does not knock the object. |

**Provenance:** The steps and their order are from the chapter section "The Pick-and-Place State Machine".

**Rules:** An arrangement has exactly one correct order, the one in the Position column. The score is the number of cards whose position equals their correct position. Mastery is a score of 7 or 8. The three attempts are separate: each attempt starts from the card order the learner left.

**Learner Activity:**

1. In Explore mode the learner reads the eight steps in the correct order, each with its explanation.
2. The learner switches to the exercise. The eight cards are shown in a shuffled order.
3. The learner moves the cards into the order they would do them and presses Check.
4. The sim shows the score and marks the cards that are in a wrong position, without revealing the right place for each. The learner can rearrange and check again, up to three attempts in all.
5. After the last attempt, or after a score of 8, the sim shows the correct order with the explanations.

**Feedback:** One exercise, up to three attempts. After each attempt: "<n> of 8 cards are in the right place." and the wrong cards are marked. After a score of 7 or 8: "Mastery reached." After the third attempt with a score below 7, the correct order is shown with the explanations, and the exercise counts as missed.

**Starting State:** Explore mode with the correct order shown, and the prompt "Put the steps in the order you would do them." ready for the exercise.

**Chapter Anchors:** The chapter's table has eight steps: approach, descend, grasp, lift, transport, lower, release and retreat. The sim has eight steps, three attempts, and mastery is 7 of 8 in the correct position.
</details>

## Teleoperation

### The Teleoperation Loop

**Teleoperation** is controlling a robot from a distance by hand, and Chapter 2 introduced the leader and follower pair for it. The **teleoperation loop** is the control loop that does it. At every tick it reads the leader arm's pose, turns it into a target for the follower, and sends the target. Nothing is planned. The person is the planner, and the loop has only to be fast and safe. LeRobot's `lerobot-teleoperate` command is this loop, with the leader and follower named on the command line, and it defaults to 60 cycles per second:

```bash
lerobot-teleoperate \
    --robot.type=so101_follower \
    --robot.port=/dev/tty.usbmodem58760431541 \
    --robot.id=my_awesome_follower_arm \
    --teleop.type=so101_leader \
    --teleop.port=/dev/tty.usbmodem58760431551 \
    --teleop.id=my_awesome_leader_arm
```

Your own version, in the lab, does the same thing with the `Arm` interface, so it works with any pair of arms that have drivers. Two things keep it safe. The follower's command goes through `execute` with a step limit, so that if the leader jumps, the follower catches up at a limited speed and does not snap to the new pose. And the loop has a stop flag, so that it ends cleanly.

### Leader-Follower Mapping

The **leader-follower mapping** is the rule that turns a leader joint's value into a follower joint's value. When both arms have been calibrated (Chapter 8) and have the same geometry, the rule is the identity: the follower's elbow goes to wherever the leader's elbow is, and that is the whole point of calibration. A mapping with two numbers covers the rest: \( \text{follower} = \text{scale} \times \text{leader} + \text{offset} \). A scale of -1 mirrors a joint, which is handy when a leader is mounted facing the other way. A scale of 0.5 halves a motion for fine work, and an offset corrects a known difference between the arms. The lab's `JointMap` dataclass holds the two numbers for each joint, and `map_pose` applies them to a whole pose.

Latency matters most here, because the person feels it. At 50 Hz the follower can be up to 20 ms late from waiting for the next cycle, and the bus and the motors add more. A person usually stops noticing a delay of a few tens of milliseconds, and sees a lag when it grows to a tenth of a second. If the loop cannot hold its rate, because the work per tick is too long, the follower falls behind, and the way to fix it is the one that the loop section gave: less work per tick, or a lower rate.

## Lab: Move the Fake Arm

In this lab you will write the pieces of the chapter and run them on the fake arm: a fixed-rate control loop, planned moves, a pick-and-place state machine with a pretend object, and a teleoperation loop in a thread. Nothing needs hardware. The new Python ideas are `time`, `threading` and `enum`. The programs print only numbers that are the same on every run, such as a rate that is within 5 percent of the target, because timing differs a little from one computer to the next.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the control loop.** `run_loop` is the scheduled loop of the chapter: it calls a function `step(tick, seconds)` at the chosen rate until it has made the number of calls that you asked for, the duration has passed, or the stop flag is set, scheduling each tick from the start time, and returns the real time between ticks. `naive_loop` is the do-the-work-then-sleep version, for comparison. The two small functions after them turn a list of periods into a rate and a worst jitter. Create `armlab/loop.py`:

```python linenums="1"
"""A control loop that runs at a fixed rate, and a naive one for comparison."""

import time


def run_loop(step, rate_hz, duration_s=None, stop=None, ticks=None, clock=time.perf_counter, sleep=time.sleep):
    """Call step(tick, seconds_since_start) at rate_hz, until ticks calls have been made, duration_s has passed,
    or stop is set.

    The next call is scheduled from the *start* time, not from the end of the last call, so the time
    that step takes does not slow the loop down. Returns the real time between calls, in seconds.
    """
    period = 1.0 / rate_hz
    start = last = next_time = clock()
    periods, tick = [], 0
    while not (stop is not None and stop.is_set()):
        now = clock()
        if (ticks is not None and tick >= ticks) or (duration_s is not None and now - start >= duration_s):
            break
        step(tick, now - start)
        tick += 1
        next_time += period
        delay = next_time - clock()
        if delay > 0:
            sleep(delay)
        else:
            next_time = clock()          # we fell behind: start again from now instead of rushing
        now = clock()
        periods.append(now - last)
        last = now
    return periods


def naive_loop(step, rate_hz, ticks, clock=time.perf_counter, sleep=time.sleep):
    """The loop most people write first: do the work, then sleep one period. Returns the real periods."""
    periods, last = [], clock()
    for tick in range(ticks):
        step(tick, 0.0)
        sleep(1.0 / rate_hz)
        now = clock()
        periods.append(now - last)
        last = now
    return periods


def mean_rate_hz(periods):
    """The average rate of a loop, from the time between its calls."""
    return len(periods) / sum(periods)


def worst_jitter_s(periods, rate_hz):
    """The largest difference between a real period and the planned one, in seconds."""
    return max(abs(p - 1.0 / rate_hz) for p in periods)
```

**Step 3. Compare the loops.** The script runs a naive loop and a scheduled loop with 8 ms of work, and then a scheduled loop with 30 ms of work, which is more than the 20 ms period. Create `loop_demo.py`:

```python linenums="1"
"""Compare a naive loop with a scheduled one, and show what happens when the work is too slow."""

import time

from armlab.loop import mean_rate_hz, naive_loop, run_loop, worst_jitter_s

RATE = 50


def work_8ms(tick, seconds):
    time.sleep(0.008)                     # pretend that reading and writing the arm takes 8 ms


def work_30ms(tick, seconds):
    time.sleep(0.030)                     # and a slow one that takes longer than the 20 ms period


print(f"Target: {RATE} Hz, a period of {1000 / RATE:.0f} ms")

naive = naive_loop(work_8ms, RATE, ticks=50)
print(f"1. Naive loop (work, then sleep 20 ms), 8 ms of work: below 40 Hz: {mean_rate_hz(naive) < 40}")

scheduled = run_loop(work_8ms, RATE, duration_s=1.0)
print(f"2. Scheduled loop, 8 ms of work: within 5% of 50 Hz: {abs(mean_rate_hz(scheduled) - RATE) < 2.5}")
print(f"   worst jitter under 10 ms: {worst_jitter_s(scheduled, RATE) < 0.010}")

overloaded = run_loop(work_30ms, RATE, duration_s=1.0)
print(f"3. Scheduled loop, 30 ms of work: runs at about 1 / 0.030 = 33 Hz, below 40 Hz: {mean_rate_hz(overloaded) < 40}")
print(f"   it fell behind on every tick instead of trying to catch up")
```

```bash
python loop_demo.py
```

```text
Target: 50 Hz, a period of 20 ms
1. Naive loop (work, then sleep 20 ms), 8 ms of work: below 40 Hz: True
2. Scheduled loop, 8 ms of work: within 5% of 50 Hz: True
   worst jitter under 10 ms: True
3. Scheduled loop, 30 ms of work: runs at about 1 / 0.030 = 33 Hz, below 40 Hz: True
   it fell behind on every tick instead of trying to catch up
```

The naive loop falls below 40 Hz, though it was asked for 50, because each cycle is 28 ms or more. The scheduled loop holds 50 Hz with small jitter. And in the overloaded case the loop does not rush or crash. It settles at the rate that the work allows.

**Step 4. Write the motion module.** It holds the pieces of the sections on moving joints. Read each function in turn: `lerp` is linear interpolation, `smooth` is the smooth ramp, `trapezoid_times` and `trapezoid_fraction` are the formulas of the trapezoid, `plan_move` builds a `Trajectory` for a multi-joint move with the joint that has the longest way to go setting the time, `follow` sends a trajectory to an arm at its rate, and `Waypoint` and `check_waypoints` are the waypoint list and its check. Create `armlab/motion.py`:

```python linenums="1"
"""Moving in joint space: interpolation, velocity profiles, trajectories, and waypoints."""

import math
from dataclasses import dataclass

from armlab.arm import Pose
from armlab.loop import run_loop


def lerp(a, b, t):
    """Linear interpolation: the value a fraction t of the way from a to b."""
    return a + (b - a) * t


def smooth(s):
    """A smooth ramp from 0 to 1 that starts and ends at zero speed (3s^2 - 2s^3)."""
    return s * s * (3 - 2 * s)


def trapezoid_times(distance, v_max, a_max):
    """Return (accel_time, cruise_time, total_time, peak_speed) for a trapezoidal speed profile.

    The joint speeds up at a_max until it reaches v_max, cruises, and slows down the same way.
    If the distance is too short to reach v_max, the profile is a triangle with a lower peak.
    """
    distance = abs(distance)
    if distance == 0:
        return 0.0, 0.0, 0.0, 0.0
    if distance >= v_max ** 2 / a_max:
        t_accel = v_max / a_max
        t_cruise = (distance - v_max * t_accel) / v_max
        return t_accel, t_cruise, 2 * t_accel + t_cruise, v_max
    t_accel = math.sqrt(distance / a_max)
    return t_accel, 0.0, 2 * t_accel, a_max * t_accel


def trapezoid_fraction(t, distance, v_max, a_max):
    """The fraction (0 to 1) of the move done at time t under a trapezoidal profile."""
    t_a, t_c, total, peak = trapezoid_times(distance, v_max, a_max)
    if total == 0 or t >= total:
        return 1.0
    if t <= t_a:
        travelled = 0.5 * a_max * t * t
    elif t <= t_a + t_c:
        travelled = 0.5 * a_max * t_a ** 2 + peak * (t - t_a)
    else:
        left = total - t
        travelled = abs(distance) - 0.5 * a_max * left * left
    return travelled / abs(distance)


@dataclass
class Trajectory:
    """Poses at a fixed rate: where every joint should be at each tick."""
    rate_hz: float
    poses: list[Pose]

    @property
    def duration(self) -> float:
        return (len(self.poses) - 1) / self.rate_hz


def plan_move(start: Pose, end: Pose, rate_hz: float, v_max: float, a_max: float | None = None,
              profile: str = "linear") -> Trajectory:
    """Plan a move in which every joint starts and stops together.

    The joint with the longest way to go sets the time, so it travels at the speed limit v_max (degrees
    per second) and the others go proportionally slower. profile is "linear", "smooth" or "trapezoid".
    """
    distances = {name: end.values[name] - start.values[name] for name in start.values}
    longest = max(abs(d) for d in distances.values())
    if profile == "trapezoid":
        duration = trapezoid_times(longest, v_max, a_max)[2]
    elif profile == "smooth":
        duration = 1.5 * longest / v_max          # the steepest part of 3s^2 - 2s^3 is 1.5 times the average
    else:
        duration = longest / v_max
    steps = max(1, math.ceil(duration * rate_hz))
    poses = []
    for i in range(steps + 1):
        s = i / steps                              # the fraction of the time that has passed
        if profile == "smooth":
            s = smooth(s)
        elif profile == "trapezoid":
            s = trapezoid_fraction(i / rate_hz, longest, v_max, a_max) if longest else 1.0
        poses.append(Pose({name: lerp(start.values[name], end.values[name], s) for name in start.values}))
    return Trajectory(rate_hz, poses)


def follow(arm, trajectory: Trajectory, stop=None):
    """Send a trajectory to an arm at its own rate. Returns the real time between ticks."""
    def step(tick, seconds):
        arm.move_to(trajectory.poses[tick])

    return run_loop(step, trajectory.rate_hz, ticks=len(trajectory.poses), stop=stop)


@dataclass
class Waypoint:
    """A named pose to pass through, with an optional pause once it is reached."""
    name: str
    pose: Pose
    pause_s: float = 0.0


def check_waypoints(arm, waypoints: list[Waypoint]) -> list[str]:
    """Return a list of problems with a waypoint list, so that nothing moves until it is clean."""
    problems = []
    for waypoint in waypoints:
        for name, value in waypoint.pose.values.items():
            joint = arm.joints.get(name)
            if joint is None:
                problems.append(f"{waypoint.name}: unknown joint {name}")
            elif not joint.min <= value <= joint.max:
                problems.append(f"{waypoint.name}: {name} = {value} is outside {joint.min} to {joint.max}")
    return problems
```

**Step 5. Plan moves without moving anything.** The script plans the multi-joint move of the chapter, compares the three profiles on a 90 degree move, and prints the trapezoid numbers. Create `trajectory_demo.py`:

```python linenums="1"
"""Plan moves without moving anything: durations, speeds, and the shape of three velocity profiles."""

from armlab.arm import Pose
from armlab.motion import plan_move, trapezoid_times

RATE = 50
start = Pose({"shoulder_pan": 0.0, "elbow_flex": 0.0})

print("1. A multi-joint move: shoulder pan 60 degrees, elbow 30 degrees, speed limit 30 degrees per second")
trajectory = plan_move(start, Pose({"shoulder_pan": 60.0, "elbow_flex": 30.0}), RATE, v_max=30)
last = trajectory.poses[-1].values
print(f"   {len(trajectory.poses)} poses, {trajectory.duration:.2f} s, ends at {last}")
print(f"   shoulder pan speed {60 / trajectory.duration:.0f} deg/s, elbow speed {30 / trajectory.duration:.0f} deg/s: they arrive together")

print("2. Three profiles for a 90 degree move (speed limit 60 deg/s, acceleration limit 120 deg/s^2)")
end = Pose({"shoulder_pan": 90.0, "elbow_flex": 0.0})
print("   profile      time  speed at 0.1 s  speed at middle  largest speed")
for profile in ("linear", "smooth", "trapezoid"):
    t = plan_move(start, end, RATE, v_max=60, a_max=120, profile=profile)
    speeds = [(b.values["shoulder_pan"] - a.values["shoulder_pan"]) * RATE for a, b in zip(t.poses, t.poses[1:])]
    print(f"   {profile:<10} {t.duration:>5.2f} s {speeds[4]:>11.0f} deg/s {speeds[len(speeds) // 2]:>11.0f} deg/s {max(speeds):>11.0f} deg/s")

print("3. The trapezoid in numbers")
for distance in (90, 20):
    t_accel, t_cruise, total, peak = trapezoid_times(distance, 60, 120)
    print(f"   {distance:>2} degrees: speed up {t_accel:.2f} s, cruise {t_cruise:.2f} s, total {total:.2f} s, peak {peak:.0f} deg/s")
```

```bash
python trajectory_demo.py
```

```text
1. A multi-joint move: shoulder pan 60 degrees, elbow 30 degrees, speed limit 30 degrees per second
   101 poses, 2.00 s, ends at {'shoulder_pan': 60.0, 'elbow_flex': 30.0}
   shoulder pan speed 30 deg/s, elbow speed 15 deg/s: they arrive together
2. Three profiles for a 90 degree move (speed limit 60 deg/s, acceleration limit 120 deg/s^2)
   profile      time  speed at 0.1 s  speed at middle  largest speed
   linear      1.50 s          60 deg/s          60 deg/s          60 deg/s
   smooth      2.26 s           9 deg/s          60 deg/s          60 deg/s
   trapezoid   2.00 s          11 deg/s          60 deg/s          60 deg/s
3. The trapezoid in numbers
   90 degrees: speed up 0.50 s, cruise 1.00 s, total 2.00 s, peak 60 deg/s
   20 degrees: speed up 0.41 s, cruise 0.00 s, total 0.82 s, peak 49 deg/s
```

Look at the second table. All three profiles have the same peak speed, 60 degrees per second. The linear profile is at full speed at 0.1 s, which means it jumped there. The smooth profile is at 9 degrees per second and the trapezoid at 11, so both start gently, and the price is time: 2.26 s and 2.00 s against 1.50 s. The numbers in the last section are the worked examples of the chapter.

**Step 6. Write the pick-and-place state machine.** `State` is an `enum` with one member per step, plus `DONE` and `FAILED`. `Task` holds the arm, the four poses, the speed and the retry limit. One small function per state moves the arm and returns the next state, and `HANDLERS` is the table from a state to its function. `_grasp` is where the decision is made: it closes the gripper, reads it, and returns `LIFT` if the reading is above 5 percent, `APPROACH` for another try, or `FAILED` when the tries are used up. Create `armlab/pick.py`:

```python linenums="1"
"""Pick and place as a state machine: one state per step, and a rule for what comes next."""

from dataclasses import dataclass
from enum import Enum, auto

from armlab.arm import Pose
from armlab.motion import follow, plan_move

GRASP_MIN_PERCENT = 5.0       # a closed gripper reads about 0; if it stops above this, something is in it


class State(Enum):
    APPROACH = auto()         # move above the object with the gripper open
    DESCEND = auto()          # go down to the object
    GRASP = auto()            # close the gripper and check that it holds something
    LIFT = auto()             # go back up with the object
    TRANSPORT = auto()        # move above the place
    LOWER = auto()            # go down to the place
    RELEASE = auto()          # open the gripper
    RETREAT = auto()          # go back up, clear of the object
    DONE = auto()
    FAILED = auto()


@dataclass
class Task:
    """Everything a pick and place needs: the arm, four poses, the speed, and a retry limit."""
    arm: object
    pick_above: Pose
    pick: Pose
    place_above: Pose
    place: Pose
    rate_hz: float = 50
    v_max: float = 120
    max_tries: int = 2
    tries: int = 0


def _go(task, pose, gripper=None):
    """Move every joint to a pose (optionally with a different gripper value) in one trajectory."""
    target = pose if gripper is None else pose.with_joint("gripper", gripper)
    follow(task.arm, plan_move(task.arm.read_pose(), target, task.rate_hz, task.v_max))


def _approach(task):
    _go(task, task.pick_above, gripper=100)
    return State.DESCEND


def _descend(task):
    _go(task, task.pick, gripper=100)
    return State.GRASP


def _grasp(task):
    _go(task, task.pick, gripper=0)
    held = task.arm.read_pose().values["gripper"] > GRASP_MIN_PERCENT
    if held:
        return State.LIFT
    task.tries += 1
    print(f"      the gripper closed fully ({task.arm.read_pose().values['gripper']:.0f}%): nothing was grasped")
    return State.APPROACH if task.tries < task.max_tries else State.FAILED


def _lift(task):
    _go(task, task.pick_above, gripper=0)
    return State.TRANSPORT


def _transport(task):
    _go(task, task.place_above, gripper=0)
    return State.LOWER


def _lower(task):
    _go(task, task.place, gripper=0)
    return State.RELEASE


def _release(task):
    _go(task, task.place, gripper=100)
    return State.RETREAT


def _retreat(task):
    _go(task, task.place_above, gripper=100)
    return State.DONE


HANDLERS = {State.APPROACH: _approach, State.DESCEND: _descend, State.GRASP: _grasp, State.LIFT: _lift,
            State.TRANSPORT: _transport, State.LOWER: _lower, State.RELEASE: _release, State.RETREAT: _retreat}


def run_pick_and_place(task):
    """Run the machine until it reaches DONE or FAILED. Returns the final state."""
    state = State.APPROACH
    while state not in (State.DONE, State.FAILED):
        print(f"   {state.name}")
        state = HANDLERS[state](task)
    print(f"   {state.name}")
    return state
```

**Step 7. Make a pretend object, and run a pick-and-place that works and one that misses.** `FakeArmWithObject` is a fake arm whose gripper cannot close past 20 percent while an object is in the way, which is how a real gripper stalls on an object. It lives in its own small module, so that the next chapter can use it too. Create `armlab/fakeworld.py`:

```python linenums="1"
"""Pretend objects for the fake arm, so that a grasp can succeed or fail."""

from armlab.arm import FakeArm


class FakeArmWithObject(FakeArm):
    """A fake arm whose gripper cannot close past an object, if there is one in the way."""

    def __init__(self, joints, object_percent=20.0, object_present=True):
        super().__init__(joints)
        self.object_percent, self.object_present = object_percent, object_present

    def _write(self, values):
        if self.object_present and "gripper" in values:
            values = {**values, "gripper": max(values["gripper"], self.object_percent)}
        super()._write(values)
```

The script checks the waypoints first, runs the task, and then runs it again with the object missing. The poses are illustrative joint targets within the limits, since Chapter 12 will compute poses from the position of a real object. Create `pick_demo.py`:

```python linenums="1"
"""Pick and place on a fake arm with a pretend object: one run that works, and one that misses."""

import time

from armlab.arm import Joint, Pose
from armlab.config import load_config
from armlab.fakeworld import FakeArmWithObject
from armlab.motion import check_waypoints, Waypoint
from armlab.pick import Task, run_pick_and_place

config = load_config("config/arm.json")
joints = [Joint(name, j["id"], j["min_deg"], j["max_deg"], "percent" if name == "gripper" else "deg")
          for name, j in config["joints"].items()]


def pose(pan, lift, elbow, wrist_flex, gripper):
    return Pose({"shoulder_pan": pan, "shoulder_lift": lift, "elbow_flex": elbow,
                 "wrist_flex": wrist_flex, "wrist_roll": 0, "gripper": gripper})


# Illustrative joint targets. Chapter 12 will compute poses from where an object really is.
# The fake arm starts with every joint at 0.
PICK_ABOVE, PICK = pose(35, -30, 50, 40, 100), pose(35, -15, 55, 35, 100)
PLACE_ABOVE, PLACE = pose(-35, -30, 50, 40, 20), pose(-35, -15, 55, 35, 20)

for label, present in (("1. The object is there", True), ("2. The object is missing", False)):
    print(label)
    arm = FakeArmWithObject(joints, object_present=present)
    waypoints = [Waypoint(n, p) for n, p in (("pick above", PICK_ABOVE), ("pick", PICK),
                                             ("place above", PLACE_ABOVE), ("place", PLACE))]
    assert check_waypoints(arm, waypoints) == [], "a waypoint is outside the limits"
    started = time.perf_counter()
    with arm:
        result = run_pick_and_place(Task(arm, PICK_ABOVE, PICK, PLACE_ABOVE, PLACE))
    print(f"   result: {result.name}, {len(arm.writes)} commands sent, about {round(time.perf_counter() - started)} s")
```

```bash
python pick_demo.py
```

```text
1. The object is there
   APPROACH
   DESCEND
   GRASP
   LIFT
   TRANSPORT
   LOWER
   RELEASE
   RETREAT
   DONE
   result: DONE, 188 commands sent, about 4 s
2. The object is missing
   APPROACH
   DESCEND
   GRASP
      the gripper closed fully (0%): nothing was grasped
   APPROACH
   DESCEND
   GRASP
      the gripper closed fully (0%): nothing was grasped
   FAILED
   result: FAILED, 188 commands sent, about 4 s
```

In the first run the machine goes through all eight states to `DONE`. In the second, the gripper closes to 0 percent, the grasp check finds nothing, the machine tries once more, and then stops in `FAILED` without lifting anything. That decision, made by a three-line check, is the difference between a task that fails safely and one that carries nothing across the table. The number of commands is the number of control ticks that the moves needed.

!!! mascot-thinking "Check Before You Commit"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The state machine did not hope that the grasp worked. It looked at the gripper and chose the next state from what it saw. Reading the world before each commitment, and having a branch for "it did not work", is the idea that turns a script into a task you can trust.

**Step 8. Write the teleoperation loop.** `JointMap` and `map_pose` are the leader-follower mapping. `teleop_loop` reads the leader, maps its pose, and sends it to the follower with `execute` and a step limit, and it measures how long each copy takes. Create `armlab/teleop.py`:

```python linenums="1"
"""Teleoperation: read a leader arm, map it, and command a follower arm, many times a second."""

import time
from dataclasses import dataclass

from armlab.arm import Command, Pose
from armlab.loop import run_loop


@dataclass
class JointMap:
    """How one leader joint maps to the follower: follower = scale * leader + offset."""
    scale: float = 1.0
    offset: float = 0.0


def map_pose(leader_pose: Pose, mapping: dict[str, JointMap]) -> Pose:
    """Turn the leader's pose into the pose the follower should take."""
    return Pose({name: mapping[name].scale * value + mapping[name].offset
                 for name, value in leader_pose.values.items()})


def teleop_loop(leader, follower, mapping, rate_hz, duration_s=None, stop=None, max_step=None):
    """Make the follower copy the leader. Returns the time each copy took, in seconds.

    Each tick reads the leader, maps its pose, and sends it to the follower, with no joint allowed to
    move more than max_step degrees in one tick. The loop ends when duration_s has passed or the
    stop flag (a threading.Event) is set.
    """
    latencies = []

    def step(tick, seconds):
        started = time.perf_counter()
        target = map_pose(leader.read_pose(), mapping)
        follower.execute(Command(target, max_step))
        latencies.append(time.perf_counter() - started)

    run_loop(step, rate_hz, duration_s=duration_s, stop=stop)
    return latencies
```

**Step 9. Run teleoperation in a thread.** The script makes two fake arms (the follower's bus is slowed by 2 ms per write, as a real one is) and starts the loop in a thread. The main program plays the part of the hand: it moves the leader's shoulder pan from 0 to 40 degrees over a second, and then jumps it to 90. The follower may move only 5 degrees per tick, so the second move shows the step limit at work. At the end the main program sets the stop flag and waits for the thread. Create `teleop_demo.py`:

```python linenums="1"
"""Teleoperation with two fake arms, a loop in a thread, a stop flag, and a step limit."""

import threading
import time

from armlab.arm import FakeArm, Joint
from armlab.motion import lerp
from armlab.teleop import JointMap, teleop_loop

joints = [Joint("shoulder_pan", 1, -110, 110), Joint("elbow_flex", 2, -97, 97)]


class SlowArm(FakeArm):
    """A fake arm whose bus takes a little time for every write, as a real one does."""

    def _write(self, values):
        time.sleep(0.002)
        super()._write(values)


leader, follower = FakeArm(joints), SlowArm(joints)
mapping = {"shoulder_pan": JointMap(), "elbow_flex": JointMap()}      # the arms are calibrated alike
stop = threading.Event()
results = {}


def run():
    results["latencies"] = teleop_loop(leader, follower, mapping, rate_hz=50, stop=stop, max_step=5.0)


with leader, follower:
    thread = threading.Thread(target=run)
    thread.start()                                    # the loop runs in the background

    print("1. The hand moves the leader's shoulder pan from 0 to 40 degrees over 1 second")
    started = time.perf_counter()
    while (elapsed := time.perf_counter() - started) < 1.0:
        leader.values["shoulder_pan"] = lerp(0.0, 40.0, elapsed)
        time.sleep(0.01)                              # the main program is free to do other things
    leader.values["shoulder_pan"] = 40.0

    print("2. Then the hand jumps the leader to 90 degrees at once. The follower may move 5 degrees a tick")
    jump_time = time.perf_counter()
    leader.values["shoulder_pan"] = 90.0
    while follower.values["shoulder_pan"] < 90.0:
        time.sleep(0.005)
    catch_up = time.perf_counter() - jump_time

    stop.set()                                        # ask the loop to finish
    thread.join()

latencies = results["latencies"]
print(f"   the follower caught up in about {round(catch_up, 1)} s")
print(f"   follower {follower.writes[-1]['shoulder_pan']:.0f} degrees, leader {leader.values['shoulder_pan']:.0f} degrees")
print(f"   ticks sent between 55 and 70: {55 <= len(latencies) <= 70}; slowest copy under 20 ms: {max(latencies) < 0.020}")

print("3. The mapping can also mirror a joint: follower = -1 x leader + 0")
mirrored = JointMap(scale=-1.0)
print(f"   leader 30 degrees -> follower {mirrored.scale * 30 + mirrored.offset:.0f} degrees")
```

```bash
python teleop_demo.py
```

```text
1. The hand moves the leader's shoulder pan from 0 to 40 degrees over 1 second
2. Then the hand jumps the leader to 90 degrees at once. The follower may move 5 degrees a tick
   the follower caught up in about 0.2 s
   follower 90 degrees, leader 90 degrees
   ticks sent between 55 and 70: True; slowest copy under 20 ms: True
3. The mapping can also mirror a joint: follower = -1 x leader + 0
   leader 30 degrees -> follower -30 degrees
```

The jump of 50 degrees at 5 degrees per tick takes 10 ticks, which at 50 Hz is 0.2 seconds, and that is what the script reports. The main program stayed free while the loop ran, because the loop was in a thread, and the stop flag ended it cleanly. To use your own loop with the real arms, build a `FeetechArm` for each of the leader and the follower from Chapter 10, with each one's own port and calibration file.

**Step 10. Record your work.**

```bash
git add .
git commit -m "Add the control loop, trajectories, waypoints, pick and place, and teleoperation"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python loop_demo.py` prints `True` for the naive loop being below 40 Hz and for the scheduled loop being within 5 percent of 50 Hz.
- `python trajectory_demo.py` prints a trapezoid time of `2.00 s` for the 90 degree move.
- `python pick_demo.py` ends the first run in `DONE` and the second in `FAILED`.
- `python teleop_demo.py` prints `follower 90 degrees, leader 90 degrees`.
- Earlier scripts (`arm_demo.py`, `safe_demo.py`) still run.
- `git log --oneline` shows an eleventh commit.

### Challenge: A Slow Start

The linear move jumps to full speed. Add a function `ramped_move(start, end, rate_hz, v_max, ramp_s)` to `armlab/motion.py` that is a *linear* move with a speed ramp at the start only: the speed rises from 0 to `v_max` over `ramp_s` seconds, then stays constant. Test it on a 60 degree move at 30 degrees per second with a ramp of 0.5 seconds, and print the speed at the first three ticks.

??? note "Click to see one solution"
    A ramp that starts at zero speed and reaches \( v \) in time \( r \) covers \( v r / 2 \) degrees while it ramps. After that the joint moves at \( v \). One way to write it is to compute the distance travelled as a function of time and divide by the total:

    ```python linenums="1"
    def ramped_move(start, end, rate_hz, v_max, ramp_s):
        """A move that ramps up to v_max over ramp_s seconds and then cruises. Returns a Trajectory."""
        distances = {name: end.values[name] - start.values[name] for name in start.values}
        longest = max(abs(d) for d in distances.values())
        ramp_distance = 0.5 * v_max * ramp_s
        total = ramp_s + (longest - ramp_distance) / v_max          # time to cover the longest distance
        steps = max(1, math.ceil(total * rate_hz))
        poses = []
        for i in range(steps + 1):
            t = min(i / rate_hz, total)
            travelled = 0.5 * (v_max / ramp_s) * t * t if t < ramp_s else ramp_distance + v_max * (t - ramp_s)
            s = min(travelled / longest, 1.0) if longest else 1.0
            poses.append(Pose({n: lerp(start.values[n], end.values[n], s) for n in start.values}))
        return Trajectory(rate_hz, poses)
    ```

    For 60 degrees at 30 degrees per second with a 0.5 second ramp, the ramp covers 7.5 degrees, the cruise covers 52.5 degrees in 1.75 seconds, and the total is 2.25 seconds. At 50 Hz the first three ticks are about 0.06, 0.24 and 0.54 degrees, so the speeds are about 3, 9 and 15 degrees per second, rising steadily instead of jumping to 30.

## Summary and Key Takeaways

You can now move an arm smoothly, in a loop, through a list of waypoints, and by hand.

- The **time module** offers `sleep`, `perf_counter`, `monotonic` and `time`. Use `perf_counter` to measure. A **control loop** reads, decides and writes at a fixed **control rate**, and scheduling each tick from the start keeps the rate. **Timing jitter** is the variation between ticks and **latency** is the delay between cause and response.
- Code that waits is **blocking**. A **thread** lets the loop run in the background, and a **stop flag** (`threading.Event`) is the safe way to end it.
- **Joint-space motion** specifies joint angles. **Interpolation**, in its simplest form **linear interpolation**, gives the values between two poses. A **single-joint move** and a **multi-joint move** use the same \( t \) for every joint, and the joint with the longest way to go sets the time.
- A **trajectory** is a path with timing. The **smooth velocity profile** and the **trapezoidal velocity profile** start and end at zero speed, and the **acceleration limit** keeps the start gentle. For a trapezoid, \( T = D / v + v / a \).
- A **waypoint** is a named pose and a **waypoint list** is a task. Check the whole list before anything moves.
- **Gripper control** treats the gripper as a joint in percent, and **gripper width** and **grasp force** come from its calibration and its torque limit. A gripper that stops above 0 percent when told to close holds something.
- **Pick and place** is a **state machine**: a **pre-grasp approach**, a descent, a checked grasp, a **lift and retreat**, a transport, and a release, with retries and a failure state.
- The **teleoperation loop** reads a leader, applies the **leader-follower mapping**, and writes a follower, with a step limit and a stop flag.

!!! mascot-celebration "You Can Move Me Like a Pro!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You wrote a steady control loop, planned moves with gentle starts and stops, followed a list of waypoints, picked something up and checked the grasp, and made one arm copy another in real time. That is everything a program needs to make me move. Let's move it on to Chapter 12!

[See Annotated References](./references.md)
