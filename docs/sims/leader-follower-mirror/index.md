---
title: "Leader and Follower Mirror"
description: "Six scenarios in which you predict where a follower arm's joint ends up when it copies a leader arm, stops at its own joint limits, and adds any calibration error. Afterwards, a free mode lets you move the leader's shoulder pan, elbow flex and wrist roll. Used in Chapter 2."
status: built
image: /sims/leader-follower-mirror/leader-follower-mirror.png
og:image: /sims/leader-follower-mirror/leader-follower-mirror.png
twitter:image: /sims/leader-follower-mirror/leader-follower-mirror.png
social:
   cards: false
---

# Leader and Follower Mirror

<iframe src="main.html" height="722px" width="100%" scrolling="no"></iframe>

[Run the Leader and Follower Mirror MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/leader-follower-mirror/main.html"
        height="722px" width="100%" scrolling="no"></iframe>
```

## Description

Six scenarios in which you predict where a follower arm's joint ends up when it copies a leader arm, stops at its own joint limits, and adds any calibration error. Afterwards, a free mode lets you move the leader's shoulder pan, elbow flex and wrist roll. Used in Chapter 2.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Predict first.** Read the scenario, choose one of three angles, and commit. The arms move only after you answer.
2. **Apply the rule in order.** Copy the leader's angle, hold it at the follower's limit if it is outside, then add any calibration error.
3. **Read the gauges.** Shoulder pan and wrist roll cannot be seen in a side view, so each has a gauge. The shaded wedge on the follower's gauge is its allowed range, and a small tick shows the commanded angle when there is a calibration error.
4. **Free mode.** After the six scenarios, move the leader's joints past the follower's limits and switch the calibration error on and off.

The pictures are **schematics**, drawn with the shared [robot-arm drawing library](https://github.com/dmccreary/robot-arm/tree/main/skills/robot-arm-drawing).

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md).
