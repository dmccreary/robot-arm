---
title: "Wire Voltage-Drop Explorer"
description: "Choose a wire gauge, a wire length and a load current for a 12 V arm supply and see how much voltage is lost in the wires, with animated current dots and wire thickness that follows the gauge. Then pick the thinnest safe wire for five loads. Used in Chapter 3."
status: built
image: /sims/wire-voltage-drop-explorer/wire-voltage-drop-explorer.png
og:image: /sims/wire-voltage-drop-explorer/wire-voltage-drop-explorer.png
twitter:image: /sims/wire-voltage-drop-explorer/wire-voltage-drop-explorer.png
social:
   cards: false
---

# Wire Voltage-Drop Explorer

<iframe src="main.html" height="562px" width="100%" scrolling="no"></iframe>

[Run the Wire Voltage-Drop Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/wire-voltage-drop-explorer/main.html"
        height="562px" width="100%" scrolling="no"></iframe>
```

## Description

Choose a wire gauge, a wire length and a load current for a 12 V arm supply and see how much voltage is lost in the wires, with animated current dots and wire thickness that follows the gauge. Then pick the thinnest safe wire for five loads. Used in Chapter 3.

The wire limits (2 A to 15 A) are conservative teaching values for short, bundled hobby wiring, not the maximum a wire could carry. Published ratings are higher, so always check your wire's datasheet.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Start at the default.** AWG 22, 2 m and 3 A loses about 0.64 V, which is 5.3% of 12 V. Find the thinnest gauge that fixes it.
2. **Change one thing at a time.** Double the length, then double the current. The drop doubles each time, and the heat in the wire grows with the square of the current.
3. **Watch the red wire.** When the current passes the wire's teaching limit the wire turns red and glows.
4. **Challenges.** Five loads: choose the thinnest gauge that passes both rules, then press Check.

The picture is a **schematic**, drawn with the shared `circuit-lib.js` helpers. Orange dots show conventional current: they leave the + terminal of the supply, and their speed is proportional to the current.

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 3: Electricity, Power, and Safety Basics](../../chapters/03-electricity-power-and-safety/index.md).
