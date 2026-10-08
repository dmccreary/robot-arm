---
title: "HSV Color Classifier"
description: "The learner will classify eight pixels given as OpenCV HSV values as red, green, blue, or none of the three, according to the thresholds of the chapter, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# HSV Color Classifier



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md).

```text
Type: microsim
**sim-id:** hsv-color-classifier<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify eight pixels given as OpenCV HSV values as red, green, blue, or none of the three, according to the thresholds of the chapter, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** color space, HSV, hue, saturation, value, color thresholding, the red wrap-around (all defined in the section "Color Spaces and Color Thresholding" above this block).

**Evidence of Mastery:** For each of eight pixels the learner chooses one of four classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 7 of 8 correct on the first attempt. Changing the hue, saturation and value in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Red is one range of hues. (It wraps around: 0 to 10 and 170 to 179.) (2) Any pixel with a blue hue is blue. (A pale or dark pixel is not inside the range.) (3) Hue alone decides the color. (Saturation and value must be high enough as well.)

**Instructional Rationale:** An Understand-level classify objective asks the learner to sort examples by a rule. Each pixel tests one clause of the rule (a wrap-around, a hue outside every range, low saturation, low value), so the learner must apply all three channels.

**Content:**

Explore mode shows a swatch for a hue, saturation and value that the learner sets, and says which of the three color ranges (if any) contains it.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Hue | 0 | 179 | 1 | 60 | OpenCV hue units |
| Saturation | 0 | 255 | 1 | 255 | none |
| Value | 0 | 255 | 1 | 255 | none |

The three ranges, each requiring saturation >= 120 and value >= 70: red is hue 0 to 10 or 170 to 179, green is hue 45 to 75, and blue is hue 100 to 130. The four classes: "Red", "Green", "Blue", "None of the three". Eight pixels in this fixed order:

| # | Pixel (H, S, V) | Class | Why (shown as feedback) |
|---|---|---|---|
| 1 | (5, 200, 200) | Red | Hue 5 is in 0 to 10, and saturation and value are high enough. |
| 2 | (175, 180, 150) | Red | Hue 175 is in 170 to 179, the part of red that wraps around. |
| 3 | (60, 255, 255) | Green | Hue 60 is inside 45 to 75. |
| 4 | (120, 200, 100) | Blue | Hue 120 is inside 100 to 130, and value 100 is at least 70. |
| 5 | (30, 255, 255) | None of the three | Hue 30 is yellow, which none of the three ranges contains. |
| 6 | (60, 40, 200) | None of the three | Saturation 40 is below 120: a pale, grayish pixel with a green hue. |
| 7 | (0, 255, 30) | None of the three | Value 30 is below 70: too dark to tell the color. |
| 8 | (110, 130, 90) | Blue | Hue 110 is in range, and saturation 130 and value 90 are above the minimums. |

**Provenance:** The ranges are those of the chapter's `COLOR_RANGES` table in the lab. The hue values for pure colors (red 0, yellow 30, green 60, blue 120) were checked with OpenCV 4.14 and 5.0. The pixels are illustrative and written for this sim.

**Rules:** A pixel is Red when (0 <= H <= 10 or 170 <= H <= 179) and S >= 120 and V >= 70. It is Green when 45 <= H <= 75 and S >= 120 and V >= 70. It is Blue when 100 <= H <= 130 and S >= 120 and V >= 70. Otherwise it is None of the three.

**Learner Activity:**

1. In Explore mode the learner changes the three channels and watches the swatch and the class. The learner should notice that moving the hue from 5 up to 175 passes through colors that are not red, and that reducing the saturation turns every hue gray.
2. The learner switches to the eight pixels. Pixel 1 is shown as a swatch with its HSV values.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After pixel 8 it shows the score.

**Feedback:** Eight pixels, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This pixel is: <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with hue 60, saturation 255 and value 255, showing a green swatch and the class "Green".

**Chapter Anchors:** The chapter states OpenCV hues run from 0 to 179, that pure red, yellow, green and blue have hues of 0, 30, 60 and 120, that red needs two ranges (0 to 10 and 170 to 179), and the minimum saturation of 120 and value of 70. The sim has eight pixels and mastery is 7 of 8.
```

## Related Resources

- [Chapter 14: Cameras, Perception, and Learning from Demonstration](../../chapters/14-perception-and-learning/index.md)
