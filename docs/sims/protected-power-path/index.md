---
title: "Fuse and E-Stop Power Path"
description: "A 12 V supply, a fuse, an E-stop contact and an arm motor board in series. Predict whether the arm runs, the fuse blows, or the E-stop stops the arm in six situations, watch the current dots stop, then explore your own fuse, load and E-stop settings. Used in Chapter 3."
status: built
image: /sims/protected-power-path/protected-power-path.png
og:image: /sims/protected-power-path/protected-power-path.png
twitter:image: /sims/protected-power-path/protected-power-path.png
social:
   cards: false
---

# Fuse and E-Stop Power Path

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Fuse and E-Stop Power Path MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/protected-power-path/main.html"
        height="562px" width="100%" scrolling="no"></iframe>
```

## Description

A 12 V supply, a fuse, an E-stop contact and an arm motor board in series. Predict whether the arm runs, the fuse blows, or the E-stop stops the arm in six situations, watch the current dots stop, then explore your own fuse, load and E-stop settings. Used in Chapter 3.

The fuse blows 0.6 seconds after the current first exceeds its rating. That is a teaching simplification: a real fuse takes longer for a small overload and much less time for a short circuit.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Predict first.** Read the fuse rating, the load and the E-stop state, choose what will happen, and only then watch the dots.
2. **Watch the dots.** Current flows only while the E-stop contact is closed and the fuse is whole.
3. **Explore.** Raise the load past the fuse rating, then press the E-stop first. The fuse never sees the overload.
4. **Remember.** Cutting power makes an arm lose torque, so it can sag under gravity. Chapter 3 covers how to park it first.

The picture is a **schematic**, drawn with the shared `circuit-lib.js` helpers. Orange dots show conventional current: they leave the + terminal of the supply, and their speed is proportional to the current.

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).
