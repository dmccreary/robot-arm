---
title: "Sourcing Listing Checker"
description: "The learner will differentiate eight parts listings as Buy, Check first or Avoid by comparing each with the bill of materials, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Sourcing Listing Checker



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 6: Sourcing Parts and Planning a Budget](../../chapters/06-sourcing-parts-and-budget/index.md).

```text
Type: microsim
**sim-id:** sourcing-listing-checker<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight parts listings as Buy, Check first or Avoid by comparing each with the bill of materials, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** bill of materials, datasheet, vendor documentation, part revisions, counterfeit parts, incompatible parts, substitute parts, fact-checking specifications (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight listings the learner chooses one of three verdicts and commits. A choice is correct when it matches the Verdict column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the BOM reference in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The cheapest listing is the best deal. (A price far below the BOM suggests a counterfeit or the wrong part.) (2) A genuine part is always the right part. (It must also match the voltage, bus and revision of the build.) (3) A kit has everything. (The listing says what is not included.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to tell similar-looking cases apart on the evidence. A fixed reference BOM and a plan give the learner the criteria, so each listing must be compared with them and not judged by its appearance.

**Content:**

The reference plan for every listing is an SO-ARM101 build that uses 7.4 V STS3215 servos at $13.89 each, a 5 V power supply with a 5.5 × 2.1 mm barrel jack, and servo control boards for serial bus servos. The three verdicts are: "Buy", "Check first", "Avoid". Eight listings in this fixed order:

| # | Listing text | Verdict | Why (shown as feedback) |
|---|---|---|---|
| 1 | "STS3215 servo, 7.4 V, 1/345 gear, model C001, $13.89" | Buy | It matches the BOM line in model, voltage, gear ratio and price. |
| 2 | "Bus servo, compatible with SO-ARM, $4.99, no model number or gear ratio given" | Avoid | The price is far below the BOM's $13.89 and the listing names no model, which are signs of a counterfeit or a wrong part. |
| 3 | "STS3215 servo, 12 V version, 1/345 gear, $17.50" | Check first | It is a genuine option, but it needs a 12 V supply of 5 A or more, which the plan does not have. |
| 4 | "SO-ARM101 motor kit, 12 servos, boards and cables" with no line about printed parts | Check first | The listing does not say whether the printed frame is included, and it must be stated before paying. |
| 5 | "Power supply, 5 V, 4 A, 5.5 × 2.1 mm barrel plug, polarity diagram shown" | Buy | It matches the plan's voltage and plug, and the polarity is documented. |
| 6 | "Motor control board, works with any servo", photographs show three-pin PWM headers only | Avoid | PWM headers drive hobby servos, not serial bus servos. |
| 7 | "SO-ARM100 printed parts, old version" for an SO-ARM101 build | Avoid | The SO-ARM101 changed the wiring and assembly, so the older printed parts are the wrong revision. |
| 8 | "reBot-DevArm B601-RS, 48 V" for a plan with a 24 V power supply | Check first | The arm is genuine, but it needs a 48 V supply, so the plan must change before ordering. |

**Provenance:** The listings are illustrative and written for this sim. The reference values (the $13.89 price, the 7.4 V motors with a 5 V supply, the 12 V option with a 12 V supply of 5 A or more, and the 48 V supply of the B601-RS) come from the SO-ARM100 and reBot-DevArm repositories, as quoted in the chapter. The sim labels the listings "illustrative".

**Rules:** Each listing has exactly one correct verdict. "Buy" means it matches the plan on every checked field. "Check first" means a genuine part that conflicts with the plan or leaves a key field unstated. "Avoid" means the evidence points to a counterfeit, an incompatible bus or the wrong revision.

**Learner Activity:**

1. In Explore mode the learner reads the reference plan and the three verdicts with a one-line meaning of each.
2. The learner switches to the eight listings. Listing 1 is shown next to the reference plan.
3. The learner chooses a verdict and commits.
4. The sim shows whether the choice was correct and the Why text, marking the field that decided it. After listing 8 it shows the score.

**Feedback:** Eight listings, fixed order, one attempt each. Correct: "Correct: <verdict>. <Why>". Incorrect: "Not quite. This listing is <verdict>. <Why>". The correct verdict is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the reference plan on view and the prompt "Compare each listing with the plan."

**Chapter Anchors:** The chapter states the STS3215's BOM price of $13.89, the 5 V supply for the 7.4 V motors, the 12 V supply of 5 A or more for the 12 V motors, and the 48 V supply of the B601-RS. The sim has eight listings and mastery is 7 of 8.
```

## Related Resources

- [Chapter 6: Sourcing Parts and Planning a Budget](../../chapters/06-sourcing-parts-and-budget/index.md)
