---
title: "Robot Arm Part Identifier"
description: "A labeling MicroSim for a six-axis robot arm: explore the seven named parts (base, shoulder, upper arm, elbow, forearm, wrist and end effector), then click each part as it is named. Used in Chapter 2."
status: built
image: /sims/robot-arm-part-identifier/robot-arm-part-identifier.png
og:image: /sims/robot-arm-part-identifier/robot-arm-part-identifier.png
twitter:image: /sims/robot-arm-part-identifier/robot-arm-part-identifier.png
social:
   cards: false
---

# Robot Arm Part Identifier

<iframe src="main.html" height="522px" width="100%" scrolling="no"></iframe>

[Run the Robot Arm Part Identifier MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/robot-arm-part-identifier/main.html"
        height="522px" width="100%" scrolling="no"></iframe>
```

## Description

A labeling MicroSim for a six-axis robot arm: explore the seven named parts (base, shoulder, upper arm, elbow, forearm, wrist and end effector), then click each part as it is named. Used in Chapter 2.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 5 to 10 minutes.

1. **Explore first.** Click each of the seven parts in explore mode and read what each one does. Notice which parts are joints (they move), which are links (they do not bend), the fixed base, and the tool.
2. **Take the quiz.** Switch to quiz mode. The sim names one part at a time, in a fixed order, and you click it. You get one attempt per name. Mastery is 6 of 7 correct.
3. **Discuss the misconceptions.** Ask why the shoulder is a *joint* and not the long piece above it, why the wrist is not the hand, and why the base is not a joint.
4. **Connect to the chapter.** Match each part to a joint name in `config/arm.json` from Chapter 1 and to the SO-ARM101 joint table in Chapter 2.

The drawing is a **schematic**, not a photograph and not to scale. It is drawn with the shared [robot-arm drawing library](https://github.com/dmccreary/robot-arm/tree/main/skills/robot-arm-drawing).

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md).
