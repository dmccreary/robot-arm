---
title: "JSON Syntax Doctor"
description: "The learner will critique six short JSON settings files by marking the line that breaks a JSON rule and naming the rule, or by judging the file correct, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Evaluate
---

# JSON Syntax Doctor



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md).

````text
Type: microsim
**sim-id:** json-syntax-doctor<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/learning-python/tree/main/docs/sims/json-python-mapper<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** critique<br/>
**Learning Objective:** The learner will critique six short JSON settings files by marking the line that breaks a JSON rule and naming the rule, or by judging the file correct, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** JSON, object, double quotes, comma, trailing comma, comment, `true`, `false`, `null` (all defined in the section "The JSON File Format" above this block).

**Evidence of Mastery:** For each of six files the learner commits an answer. For files that contain a mistake, the answer is a line number and a rule from the rule list. For a correct file, the answer is "No error". An answer is correct when it matches the answer column in Content: both the line and the rule must be right. Mastery is 5 of 6 correct on the first attempt.

**Misconceptions:** (1) Single quotes work in JSON as they do in Python. (2) A trailing comma is harmless, as in Python lists. (3) `#` or `//` comments are allowed. (4) JSON booleans are spelled `True` and `False`. (5) A file that looks unusual must be wrong.

**Instructional Rationale:** Evaluate-level critique asks the learner to judge a work against criteria and justify the judgment. Giving the learner five explicit rules as criteria, plus one file that is correct, forces a judgment instead of a hunt for anything odd. The correct file tests whether the learner can decide that nothing is wrong.

**Content:**

The five rules, shown as a list the learner chooses from:

| Rule | Text of the rule |
|---|---|
| A | Text uses double quotes, never single quotes. |
| B | Items are separated by commas. |
| C | There is no comma after the last item. |
| D | There are no comments. |
| E | `true`, `false`, and `null` are lowercase. |

The six files, each shown with line numbers 1 to 4 (file 6 has 5 lines), in this fixed order:

File 1:

```text
1  {
2    'port': "/dev/ttyACM0",
3    "baud_rate": 1000000
4  }
```

File 2:

```text
1  {
2    "port": "/dev/ttyACM0",
3    "baud_rate": 1000000,
4  }
```

File 3:

```text
1  {
2    "port": "/dev/ttyACM0"
3    "baud_rate": 1000000
4  }
```

File 4:

```text
1  {
2    // serial port of the follower arm
3    "port": "/dev/ttyACM0"
4  }
```

File 5:

```text
1  {
2    "torque_enabled": True,
3    "baud_rate": 1000000
4  }
```

File 6:

```text
1  {
2    "port": "/dev/ttyACM0",
3    "baud_rate": 1000000,
4    "calibrated": false
5  }
```

Answer table:

| File | Correct line | Correct rule | Why (shown as feedback) |
|---|---|---|---|
| 1 | 2 | A | `'port'` uses single quotes. JSON keys and strings need double quotes. |
| 2 | 3 | C | The comma after `1000000` has no item after it. The last item must not end with a comma. Python 3.13 reports it on line 3, and older versions may report line 4. |
| 3 | 2 | B | Line 2 needs a comma at its end to separate it from line 3. The parser notices the problem on line 3, but the missing comma is on line 2. |
| 4 | 2 | D | JSON has no comments. Put notes in a README or in a `"notes"` key instead. |
| 5 | 2 | E | JSON writes the boolean as `true`. `True` with a capital T is Python, not JSON. |
| 6 | No error | No error | Every key is in double quotes, items are separated by commas, the last item has no comma, and `false` is lowercase. |

**Provenance:** The files are written for this sim, and the error behavior was checked by loading each one with Python 3.13's `json` module. The values `/dev/ttyACM0` and `1000000` are illustrative settings.

**Rules:** A file is correct when it follows all five rules. Each of files 1 to 5 breaks exactly one rule on exactly one line. The learner's answer is correct only when both the line and the rule match. For file 6, the only correct answer is "No error". There are no adjustable quantities.

**Learner Activity:**

1. The learner reads file 1 and the five rules.
2. The learner clicks the line they think breaks a rule (or chooses "No error"), then chooses which rule is broken, and commits.
3. The sim shows whether the answer was correct, marks the bad line, shows the Why text, and presents the next file.
4. After file 6 the sim shows the score and the six files with their verdicts.

**Feedback:** Six files, fixed order, one attempt each. Correct: "Correct: line <n> breaks rule <letter>. <Why>". Right line but wrong rule: "You found the bad line, but a different rule applies: rule <letter>. <Why>". Wrong line: "Look again: the problem is on line <n>. <Why>". Wrong judgment on file 6: "This file is valid. <Why>". The correct answer is revealed after each commitment. A running count "Correct: n of 6" is shown, and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** File 1 is shown beside the five rules, with no line selected and the question "Which line breaks a JSON rule, and which rule is it?"

**Chapter Anchors:** The chapter lists five JSON rules in prose (double quotes, commas between items, no comma after the last item, no comments, lowercase `true`/`false`/`null`) and says the sim has six files, five with one mistake each and one correct. Mastery is 5 of 6.
````

## Related Resources

- [Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md)
