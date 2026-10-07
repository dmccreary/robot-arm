---
title: "Common Ground Loop"
description: "A 5 V controller and a 12 V motor driver each have their own supply. Predict what the driver's input reads with and without a shared ground wire, and watch the signal's current loop appear and vanish. Used in Chapter 3."
status: built
image: /sims/common-ground-loop/common-ground-loop.png
og:image: /sims/common-ground-loop/common-ground-loop.png
twitter:image: /sims/common-ground-loop/common-ground-loop.png
social:
   cards: false
---

# Common Ground Loop

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Common Ground Loop MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/common-ground-loop/main.html"
        height="562px" width="100%" scrolling="no"></iframe>
```

## Description

A 5 V controller and a 12 V motor driver each have their own supply. Predict what the driver's input reads with and without a shared ground wire, and watch the signal's current loop appear and vanish. Used in Chapter 3.

The signal current in a real circuit is tiny, so its dot speed is not to scale.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Predict first.** Is the ground wire connected? What does the controller send? What will the driver read?
2. **Follow the dots.** With a ground wire, signal dots go out on the signal wire and come back on the ground wire.
3. **Break the loop.** Remove the ground wire. The signal has no way home, and the input flickers between HIGH and LOW.
4. **Remember.** Join the grounds, never the positive rails of two different supplies.

The picture is a **schematic**, drawn with the shared `circuit-lib.js` helpers. Orange dots show conventional current: they leave the + terminal of the supply, and their speed is proportional to the current.

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).
