---
title: Hobby PWM Servo vs. Serial Bus Servo
description: An interactive side-by-side comparison showing why a hobby PWM servo such as the MG995 cannot replace the STS3215 serial bus servos in an SO-ARM100/101 robot arm.
status: built
image: /sims/pwm-vs-bus-servos/pwm-vs-bus-servos.png
og:image: /sims/pwm-vs-bus-servos/pwm-vs-bus-servos.png
twitter:image: /sims/pwm-vs-bus-servos/pwm-vs-bus-servos.png
social:
   cards: false
---

# Hobby PWM Servo vs. Serial Bus Servo

<iframe src="main.html" height="592px" width="100%" scrolling="no"></iframe>

[Run the Hobby PWM Servo vs. Serial Bus Servo MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

This MicroSim is the interactive core of
[Appendix A: Why Hobby PWM Servos Won't Work with the SO-ARM](../../appendices/pwm-servos/index.md).

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/pwm-vs-bus-servos/main.html"
        height="592px" width="100%" scrolling="no"></iframe>
```

## Description

The MicroSim puts a hobby PWM servo (an MG995) and a serial bus servo (an
STS3215) side by side and asks one question: *what does the controller learn
about the servo?* Three views answer it.

1. **Command and readback.** Set a command angle and a load. Both servos drive
   the same arm against the same load, so both fall the same distance short of
   the goal. Only the bus servo reports its position, load, and temperature.
   The PWM controller sees nothing and still believes the arm is at the goal.
2. **Leader and follower.** Drag the gold handle on a leader arm. The bus
   follower copies the angle it reads from the leader. The PWM follower has no
   angle to copy, because a PWM servo has no wire to report one.
3. **Wiring.** Slide the number of joints per arm from 1 to 6. PWM needs one
   timing wire per joint. A bus chain needs one cable per arm, with an ID for
   each servo.

The load, shortfall, and temperature values are teaching values, not datasheet
measurements. The pulse widths (1 to 2 ms every 20 ms) and the 4096 steps per
turn of the STS3215 are typical published figures.

## How to Use

1. Pick a view with the **View** menu.
2. In *Command and readback*, predict what each panel will show before you
   raise the **Load on arm** slider, then check your prediction.
3. In *Leader and follower*, drag the gold handle left and right.
4. In *Wiring*, move **Joints per arm** from 1 up to 6 and watch the wire count.

## Lesson Plan

### Learning Objective

Students will be able to explain why a hobby PWM servo cannot replace an
STS3215 bus servo in a leader/follower robot arm, by comparing what each servo
reports back, whether a leader arm can be read, and how many wires each needs.

### Audience and Duration

Makers, undergraduates, and self-taught roboticists. Allow 10 to 15 minutes.

### Prerequisites

Students should know that a servo turns to a commanded angle. No programming
is needed.

### Activities

1. **Predict (3 min).** Before touching the load slider, write down what each
   panel will report when the arm is pushed 25° short of its goal.
2. **Explore (5 min).** Work through all three views. In the leader/follower
   view, find the angle at which the bus follower lags the leader the most.
3. **Explain (5 min).** In two sentences, tell a classmate who owns six MG995
   servos why they cannot use them in an SO-ARM101.

### Assessment

A student can be asked to name the three things a leader/follower system needs
from each servo (a readable position, a unique address on a shared bus, and
the ability to go limp) and to say which of them an MG995 provides.

## References

1. [SO-ARM100 and SO-ARM101 open-source arm design](https://github.com/TheRobotStudio/SO-ARM100), The Robot Studio. Bill of materials and assembly notes.
2. [SO-101 documentation](https://huggingface.co/docs/lerobot/so101), Hugging Face LeRobot.
3. [Servo (radio control)](https://en.wikipedia.org/wiki/Servo_(radio_control)), Wikipedia. How hobby servos use a pulse width and an internal potentiometer.
4. [Pulse-width modulation](https://en.wikipedia.org/wiki/Pulse-width_modulation), Wikipedia.
