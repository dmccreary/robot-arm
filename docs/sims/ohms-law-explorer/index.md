---
title: "Ohm's Law Explorer"
description: "Change the supply voltage and the load resistance in a simple loop and watch animated current dots speed up and slow down with the ammeter reading. Then solve five challenges that set a target current or power. Used in Chapter 3."
status: built
image: /sims/ohms-law-explorer/ohms-law-explorer.png
og:image: /sims/ohms-law-explorer/ohms-law-explorer.png
twitter:image: /sims/ohms-law-explorer/ohms-law-explorer.png
social:
   cards: false
---

# Ohm's Law Explorer

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Ohm's Law Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/ohms-law-explorer/main.html"
        height="562px" width="100%" scrolling="no"></iframe>
```

## Description

Change the supply voltage and the load resistance in a simple loop and watch animated current dots speed up and slow down with the ammeter reading. Then solve five challenges that set a target current or power. Used in Chapter 3.

The circuit is the schematic from Chapter 3, drawn by `circuit-lib.js`, a small library of schematic symbols and animated current dots that is copied into each of the Chapter 3 circuit MicroSims.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Predict first.** Before you move a slider, say what will happen to the ammeter and to the dots.
2. **Explore.** Double V, then double R. Notice that the dot speed follows the ammeter, and that the power changes faster than the current.
3. **Challenges.** Five targets: set the free slider, then press Check. A free slider and a locked slider are shown for each target.
4. **Think about it.** A real motor is not a fixed resistor. Chapter 5 shows why its current changes with load.

The picture is a **schematic**, drawn with the shared `circuit-lib.js` helpers. Orange dots show conventional current: they leave the + terminal of the supply, and their speed is proportional to the current.

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).
