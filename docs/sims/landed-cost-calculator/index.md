---
title: "Landed Cost Calculator"
description: "The learner will calculate the landed cost, the overhead percentage or the remaining budget of a parts order from its sticker price, shipping, tax and fees, to within one cent (or 0.1 percent), in five problems, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Landed Cost Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 6: Sourcing Parts and Planning a Budget](../../chapters/06-sourcing-parts-and-budget/index.md).

```text
Type: microsim
**sim-id:** landed-cost-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the landed cost, the overhead percentage or the remaining budget of a parts order from its sticker price, shipping, tax and fees, to within one cent (or 0.1 percent), in five problems, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** bill of materials, shipping and customs, total build cost, landed cost, overhead, budgeting (all defined in the sections above this block).

**Evidence of Mastery:** For each of five problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.01 dollars (or 0.1 percentage points) of the Correct column in Content. Mastery is 4 of 5 correct on the first attempt. Changing the order amounts in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The sticker price is what you pay. (Shipping, tax and fees are added.) (2) Overhead is a percentage of the landed cost. (It is a percentage of the sticker price.) (3) Tax applies to every charge in the same way. (Each problem states what the tax applies to.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a procedure on new numbers with an immediate check. The sim shows each charge as a stacked bar on top of the sticker price, so the overhead is seen before it is computed.

**Content:**

Explore mode has four amounts the learner can change (sticker price, shipping, tax and fees), and shows the landed cost and the overhead, with the formulas landed = sticker + shipping + tax + fees and overhead = (landed − sticker) / sticker × 100.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Sticker price | 0 | 2000 | 0.01 | 258.94 | USD |
| Shipping | 0 | 300 | 0.01 | 46.55 | USD |
| Tax | 0 | 300 | 0.01 | 26.05 | USD |
| Fees | 0 | 50 | 0.01 | 0.50 | USD |

Five problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | A kit has a sticker price of $258.94, shipping of $46.55, tax of $26.05 and a $0.50 fee. What is the landed cost? | USD | 332.04 | 258.94 + 46.55 + 26.05 + 0.50 = 332.04. |
| 2 | For the order in problem 1, what is the overhead as a percentage of the sticker price? | percent | 28.2 | (332.04 − 258.94) / 258.94 × 100 = 28.23. |
| 3 | A $120 motor has $15 shipping and 7 percent sales tax on the item price only. What is the landed cost? | USD | 143.40 | Tax is 0.07 × 120 = 8.40, and 120 + 15 + 8.40 = 143.40. |
| 4 | Four motors at $120 and three at $175, with $60 shipping and no tax. What is the landed cost? | USD | 1065.00 | 4 × 120 + 3 × 175 = 1005, and 1005 + 60 = 1065. |
| 5 | You have $350 and place the order in problem 1. How much is left? | USD | 17.96 | 350 − 332.04 = 17.96, which is less than the $20 or more that the printed parts cost. |

**Provenance:** Problems 1, 2 and 5 use the project's order from the procurement notes (2026-10-06). The motor prices in problem 4 are from the reBot B601-DM bill of materials. Problem 3 is illustrative.

**Rules:** landed = sticker + shipping + tax + fees, rounded to cents. Overhead = (landed − sticker) / sticker × 100, rounded to one decimal. A typed answer is correct when |typed − correct| <= 0.01 for dollars and <= 0.1 for percent. The typed value has minimum 0, maximum 10000, step 0.01, and no default.

**Learner Activity:**

1. In Explore mode the learner changes the four amounts and watches the stacked bar, the landed cost and the overhead update. The learner should notice that shipping and tax together add more than a quarter to the sticker price in the default order.
2. The learner switches to the five problems. Problem 1 is shown.
3. The learner types an answer and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 5 it shows the score.

**Feedback:** Five problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with the defaults, showing a landed cost of $332.04 and an overhead of 28.2 percent.

**Chapter Anchors:** The chapter's worked example is 258.94 + 46.55 + 26.05 + 0.50 = 332.04, an overhead of $73.10 or 28.2 percent. The sim has five problems and mastery is 4 of 5.
```

## Related Resources

- [Chapter 6: Sourcing Parts and Planning a Budget](../../chapters/06-sourcing-parts-and-budget/index.md)
