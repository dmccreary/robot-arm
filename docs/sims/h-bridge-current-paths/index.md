---
title: "H-Bridge Current Paths"
description: "Set the four switches of an H-bridge motor driver and predict whether the motor runs forward, runs in reverse, coasts, brakes, or short-circuits the supply, then watch animated current dots follow the closed path. Used in Chapter 5."
status: built
image: /sims/h-bridge-current-paths/h-bridge-current-paths.png
og:image: /sims/h-bridge-current-paths/h-bridge-current-paths.png
twitter:image: /sims/h-bridge-current-paths/h-bridge-current-paths.png
social:
   cards: false
---

# H-Bridge Current Paths

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the H-Bridge Current Paths MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/h-bridge-current-paths/main.html"
        height="562px" width="100%" scrolling="no"></iframe>
```

## Description

Set the four switches of an H-bridge motor driver and predict whether the motor runs forward, runs in reverse, coasts, brakes, or short-circuits the supply, then watch animated current dots follow the closed path. Used in Chapter 5.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Predict first.** Read which switches are closed, trace a path from the supply to ground, and choose what the motor does before the circuit runs.
2. **Watch the dots.** Orange dots show conventional current. They go through the motor from left to right for forward and from right to left for reverse.
3. **Find the forbidden state.** Two switches closed in the same leg connect the supply straight to ground. The dots turn red and speed up.
4. **Explore.** After the six combinations, toggle the switches yourself and look for every combination that brakes the motor.

The picture is a **schematic**, drawn with the shared `circuit-lib.js` helpers.

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 5: Actuators and Sensors](../../chapters/05-actuators-and-sensors/index.md).
