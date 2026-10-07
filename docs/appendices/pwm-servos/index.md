---
title: "Appendix A: Why Hobby PWM Servos Won't Work with the SO-ARM"
description: Why a hobby PWM servo such as the MG995 cannot replace the STS3215 serial bus servos in an SO-ARM100/101 robot arm, with an interactive MicroSim.
---

# Appendix A: Why Hobby PWM Servos Won't Work with the SO-ARM

If you already own a few hobby servos, such as the popular MG995, it is
tempting to try them in the SO-ARM100/101. Don't. Strength is not the problem.
The problem is **information**: the SO-ARM and the LeRobot software that drives
it depend on each servo *reporting back*, and a hobby PWM servo has no wire to
do that.

!!! note "Short answer"
    A hobby PWM servo accepts a target angle and never tells you anything in
    return. A leader/follower arm needs to read the leader's joint angles, and
    LeRobot needs to record where each follower joint actually is. An MG995
    can do neither.

## How a Hobby Servo Listens

A hobby servo has three wires: power, ground, and one signal wire. The
controller sends a short pulse about every 20 ms (50 Hz). The pulse width,
typically between 1 ms and 2 ms, is the target angle: a short pulse means one
end of travel and a long pulse means the other.

Inside the case, a potentiometer on the output shaft feeds a small analog
circuit that drives the motor until the shaft matches the pulse. So a hobby
servo *does* have a feedback loop. It is just sealed inside. The reading never
leaves the case, which makes the loop closed inside and open from the outside.

## How a Bus Servo Listens

The STS3215 puts a microcontroller and a magnetic encoder inside the case. The
encoder resolves 4096 steps per turn, about 0.09° per step. All the servos on an
arm share a single three-wire cable and talk over a half-duplex serial protocol.
Each servo has its own ID, set once during assembly. The controller can:

- write a goal position to servo 3
- read servo 3's present position, load, voltage, and temperature
- switch servo 3's torque off so a person can move it by hand

## Try It

<iframe src="../../sims/pwm-vs-bus-servos/main.html" height="592px" width="100%" scrolling="no"></iframe>

[Open the MicroSim fullscreen](../../sims/pwm-vs-bus-servos/main.html){ .md-button .md-button--primary }

Work through the three views in order, and predict before you touch a control.

1. **Command and readback.** Before you move the load slider, predict what each
   panel will show when the arm is pushed well short of its goal. Then check.
2. **Leader and follower.** Drag the gold handle. Which follower moves, and why?
3. **Wiring.** Slide the joint count to 6. How many timing channels does a
   leader and follower pair need for each servo type?

## Why the Swap Fails

### 1. A Leader Arm Is Only Useful If You Can Read It

Teleoperation in the SO-ARM101 is one short loop, repeated many times a second.
This sketch is pseudocode, not the LeRobot API:

```python
# One step of leader/follower teleoperation (pseudocode)
leader_angles = read_angles(leader_bus)       # needs readback
write_goals(follower_bus, leader_angles)      # sends goals
follower_angles = read_angles(follower_bus)   # needs readback again
```

The first line has no PWM equivalent. The third one matters for learning:
LeRobot records the leader's joints as the `action` and the follower's measured
joints as the `observation.state`. With PWM servos the measured joints would
simply be a copy of the commanded ones. The policy would learn from what the
arm was *told* to do, not from what it *did*, and the two diverge exactly when
the arm touches or lifts something, which is when the data matters most.

### 2. The Software Speaks a Different Protocol

LeRobot's motor layer talks to Feetech serial bus servos through a bus adapter
board and a USB serial port. Its calibration step moves each joint through its
range by hand with torque off, then records the raw position limits. A PWM servo
cannot be read, so there is no raw position to record, and there is no driver
that would turn a PWM channel into a LeRobot motor bus.

### 3. The Hardware Does Not Fit

The printed brackets are sized for the STS3215 body and horn, and an MG995 is
larger. Each arm needs six PWM channels (twelve for a pair) instead of one
cable per arm. The voltage can also be a problem: the bus board supplies the
servo supply voltage on the power pin of every connector, and a 12 V supply
will damage a servo rated for 6 V or 7.2 V. The 3-pin connectors look similar
but do not carry the same signals.

## Side by Side

| | MG995-class hobby servo | STS3215 bus servo |
|---|---|---|
| Command | Pulse width, 1 to 2 ms every 20 ms | Serial packet addressed by ID |
| Reports back | Nothing | Position, speed, load, voltage, temperature |
| Position resolution | Analog potentiometer plus deadband, commonly about a degree or worse | 4096 steps per turn, about 0.09° |
| Wires for a 6-joint arm | 6 signal wires plus power | 1 shared cable |
| Torque off by command | No, only by removing power or signal | Yes, per servo |
| Works with LeRobot | No | Yes |

!!! warning "Check the datasheet"
    These are typical values. Hobby servo clones vary widely between vendors,
    and the STS3215 comes in several voltage and gear-ratio variants. Confirm
    the numbers for the exact parts you buy.

## What MG995 Servos Are Good For

They are good for learning, which is why this book covers them.

- **Open-loop labs.** A two- or three-joint arm driven from a microcontroller
  or a PCA9685 servo driver is a cheap way to see PWM, and to see exactly what
  you lose without feedback.
- **Accessories.** A pan-tilt mount for a camera, or a simple gripper on your
  own bracket, does not need readback.
- **Feedback mods.** It is possible to tap the potentiometer wire of a hobby
  servo, or to buy a feedback-ready model. You then get a position reading
  through an analog input per servo, but still no load or temperature, and
  still no LeRobot driver.

## Self-Check

??? question "Why can't a hobby servo's internal feedback loop be used for a leader arm?"
    The loop is sealed inside the case. The potentiometer reading is used by
    the servo's own circuit and is never sent out on the signal wire, so the
    controller has nothing to read.

??? question "Two MG995 servos push an arm against the same load and stall short of the goal. What does the PWM controller see?"
    Nothing. It sent a pulse for the goal angle and has no reply, so it still
    believes the arm is at the goal. A bus servo would report a position short
    of the goal along with a high load.

??? question "A leader and follower pair has six joints per arm. How many PWM channels versus serial ports does each design need?"
    Twelve PWM channels for the PWM design, and two serial ports for the bus
    design, one per arm.
