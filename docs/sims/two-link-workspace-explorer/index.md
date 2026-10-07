---
title: "Two-Link Workspace Explorer"
description: "Seven reachability problems for a flat two-link arm: decide whether the tip can reach a target, given the link lengths and an elbow limit. Afterwards, an explore mode lets you change both links and the elbow limit and watch the reachable ring change shape. Used in Chapter 2."
status: built
image: /sims/two-link-workspace-explorer/two-link-workspace-explorer.png
og:image: /sims/two-link-workspace-explorer/two-link-workspace-explorer.png
twitter:image: /sims/two-link-workspace-explorer/two-link-workspace-explorer.png
social:
   cards: false
---

# Two-Link Workspace Explorer

<iframe src="main.html" height="662px" width="100%" scrolling="no"></iframe>

[Run the Two-Link Workspace Explorer MicroSim Fullscreen](./main.html){ .md-button .md-button--primary }

You can include this MicroSim on your website using the following `iframe`:

```html
<iframe src="https://dmccreary.github.io/robot-arm/sims/two-link-workspace-explorer/main.html"
        height="662px" width="100%" scrolling="no"></iframe>
```

## Description

Seven reachability problems for a flat two-link arm: decide whether the tip can reach a target, given the link lengths and an elbow limit. Afterwards, an explore mode lets you change both links and the elbow limit and watch the reachable ring change shape. Used in Chapter 2.

## Lesson Plan

**Grade level:** Middle school and up (age 12+).  **Time:** 10 to 15 minutes.

1. **Work out each problem before you commit.** Find the distance r from the shoulder to the target, check it against the ring, and think about how far the elbow has to bend.
2. **Commit, then compare.** The shaded ring appears only after you answer, and the arm moves to the target or as close as it can get.
3. **Look at problems 6 and 7.** They use the same arm and the same elbow limit. Why is (20, 10) reachable and (7, 0) not, although both are inside the unlimited ring?
4. **Explore.** After problem 7, change L1, L2 and the elbow limits. Predict how the ring changes, then click points to test them.

The picture is a **schematic**, drawn with the shared [robot-arm drawing library](https://github.com/dmccreary/robot-arm/tree/main/skills/robot-arm-drawing).

## Specification

The learning objective, evidence of mastery and content for this MicroSim are specified in
[Chapter 2: Anatomy of a Robot Arm](../../chapters/02-anatomy-of-a-robot-arm/index.md).
