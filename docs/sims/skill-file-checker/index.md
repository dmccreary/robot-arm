---
title: "Skill File Checker"
description: "The learner will validate eight skill-file headers against the rules of the OpenClaw skill format, naming the one rule that each breaks or saying that it is valid, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# Skill File Checker



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 15: AI Agents, Tools, and OpenClaw Skills](../../chapters/15-agents-and-openclaw-skills/index.md).

```text
Type: microsim
**sim-id:** skill-file-checker<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** validate<br/>
**Learning Objective:** The learner will validate eight skill-file headers against the rules of the OpenClaw skill format, naming the one rule that each breaks or saying that it is valid, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** agent skill, OpenClaw skill files, front matter, the name and description rules (all defined in the section "Agent Skills and OpenClaw Skill Files" above this block).

**Evidence of Mastery:** For each of eight headers the learner chooses one of six outcomes and commits. A choice is correct when it matches the Outcome column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the rules in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The skill's rules are enforced by the agent's good behavior. (A skill is only instructions, and the enforcement is in the code that it calls.) (2) Capital letters and underscores are fine in a name. (Only lowercase letters, digits and hyphens are allowed.) (3) A colon in a description is harmless. (An unquoted colon followed by a space is invalid YAML.)

**Instructional Rationale:** An Evaluate-level validate objective asks the learner to check an item against stated criteria and say which one fails. Each header breaks at most one rule, so the learner must test each rule in turn.

**Content:**

The rules shown in Explore mode: name and description are required; the name uses lowercase letters, digits and hyphens; the name equals the folder's name; the description is under 160 characters; a value containing a colon and a space must be in quotes. The six outcomes: "Valid", "Invalid: bad name", "Invalid: missing field", "Invalid: name and folder differ", "Invalid: description too long", "Invalid: unquoted colon". Eight headers in this fixed order:

| # | Folder and header | Outcome | Why (shown as feedback) |
|---|---|---|---|
| 1 | Folder robot-arm; name robot-arm; description of 109 characters, with no colon. | Valid | Every rule is met. |
| 2 | Folder robot-arm; name Robot_Arm; a short description. | Invalid: bad name | The name has a capital letter and an underscore, and it must use lowercase letters, digits and hyphens. |
| 3 | Folder robot-arm; name robot-arm; no description line. | Invalid: missing field | The description is required. |
| 4 | Folder arm-skill; name robot-arm; a short description. | Invalid: name and folder differ | The name should equal the folder's name. |
| 5 | Folder robot-arm; name robot-arm; a description of 175 characters. | Invalid: description too long | The description must be under 160 characters. |
| 6 | Folder robot-arm; name robot-arm; description: Moves the arm: carefully | Invalid: unquoted colon | A value with a colon and a space must be in quotes, or the YAML is invalid. |
| 7 | Folder robot-arm-2; name robot-arm-2; a short description. | Valid | Digits and hyphens are allowed in a name. |
| 8 | Folder robot-arm; name robot-arm; a short description; an extra line: user-invocable: true | Valid | user-invocable is one of the optional fields of the format. |

**Provenance:** The rules are from OpenClaw's skill documentation (read on 2026-10-07), as summarized in the chapter section, and the outcomes were checked with the lab's `check_skill.py` for the rules that it covers. The headers are illustrative and written for this sim.

**Rules:** Each header has exactly one correct outcome. A header that breaks no rule is Valid. No header breaks more than one rule.

**Learner Activity:**

1. In Explore mode the learner reads the five rules.
2. The learner switches to the eight headers. Header 1 is shown.
3. The learner chooses an outcome and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After header 8 it shows the score.

**Feedback:** Eight headers, fixed order, one attempt each. Correct: "Correct: <outcome>. <Why>". Incorrect: "Not quite. This header is: <outcome>. <Why>". The correct outcome is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the five rules listed and the prompt "Does this header follow the rules?" ready for the first header.

**Chapter Anchors:** The chapter states that name and description are required, that the name uses lowercase letters, digits and hyphens and equals the folder name, that the description is under 160 characters, and that a colon requires quotes. The sim has eight headers and mastery is 7 of 8.
```

## Related Resources

- [Chapter 15: AI Agents, Tools, and OpenClaw Skills](../../chapters/15-agents-and-openclaw-skills/index.md)
