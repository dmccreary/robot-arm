---
title: "Python Run Stage Sorter"
description: "The learner will classify each of five Python error messages by the stage of running a script that produces it, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Python Run Stage Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md).

```text
Type: microsim
**sim-id:** python-run-stage-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify each of five Python error messages by the stage of running a script that produces it, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** terminal, shell, interpreter, script, import statement, PATH, syntax, traceback (all defined in the sections above this block).

**Evidence of Mastery:** After opening all six stage descriptions, the learner assigns each of five error messages to one of the six stages. An assignment is correct when it matches the Stage column of the message table in Content. Mastery is 4 of 5 correct on the first attempt. Opening a stage description is exploration, not evidence.

**Misconceptions:** (1) Python checks the whole program for every kind of error before running any line. (Only syntax is checked first; a missing module or a missing dictionary key shows up only when its line runs.) (2) "command not found" is a Python error. (It is printed by the shell, before Python starts.) (3) A `ModuleNotFoundError` means the module's file is broken. (It means Python could not find the module in any folder it searches.)

**Instructional Rationale:** An Understand-level classify objective asks the learner to place an example into the right category and give a reason. Sorting real messages onto a visible sequence of stages forces the learner to use each stage's definition instead of re-reading the prose.

**Content:**

The six stages, in fixed order, each with the text revealed when the learner opens it:

| # | Stage name | What happens (text revealed) | What can fail here (text revealed) |
|---|---|---|---|
| 1 | Type the command | You type `python3 hello_arm.py` in the terminal and press Enter. The text goes to the shell. | Nothing in Python can fail yet. A typo here becomes a stage 2 problem. |
| 2 | Shell finds the interpreter | The shell looks for a program named `python3` in each folder listed in the PATH environment variable. | No program named `python3` is in any PATH folder. |
| 3 | Interpreter opens the script | Python starts and opens the file named after it. | The file is not at the path you typed. |
| 4 | Interpreter checks the syntax | Python reads the whole file and checks that it follows Python's grammar. No line has run yet. | A `SyntaxError`. |
| 5 | Interpreter runs the lines | Python runs the code from top to bottom. Each `import` is carried out when its line is reached. | Any exception raised while a line runs. The messages below use two of them, `ModuleNotFoundError` and `KeyError`. |
| 6 | Output and exit | Printed text appears. An uncaught exception prints a traceback first. The shell prompt returns. | Nothing new can fail. Errors from stage 5 are reported here. |

The five error messages, shown in this fixed order:

| # | Message shown to the learner | Stage | Why (shown as feedback) |
|---|---|---|---|
| 1 | `zsh: command not found: python3` | 2 | The shell prints this before Python starts, because no program named `python3` is in a PATH folder. |
| 2 | `python3: can't open file '/home/maker/arm-lab/hello_arm.py': [Errno 2] No such file or directory` | 3 | Python started, but the script is not at the path you typed. |
| 3 | `SyntaxError: '(' was never closed` | 4 | Syntax is checked for the whole file before any line runs, so no earlier `print` output appears. |
| 4 | `ModuleNotFoundError: No module named 'serial'` | 5 | An `import` is carried out when its line is reached. Lines above it have already run. |
| 5 | `KeyError: 'elbow_flex'` | 5 | A dictionary lookup happens when its line runs, after the syntax check has passed. |

**Provenance:** Stage text is from the chapter sections "The Python Interpreter" and "Python Scripts". The five messages are real Python 3.13 and zsh messages; the folder name `/home/maker/arm-lab` is illustrative.

**Rules:** There are no adjustable quantities. The stages are fixed and ordered. The sorting activity stays locked until all six stage descriptions have been opened at least once. Each message gets exactly one attempt. Messages 4 and 5 both belong to stage 5, so a stage may receive more than one message, and some stages (1 and 6) receive none.

**Learner Activity:**

1. The learner opens each of the six stages to read what happens and what can fail there. When all six have been opened, the sorting activity unlocks.
2. The sim shows message 1. The learner chooses the stage that produces it and commits the choice.
3. The sim shows whether the choice was correct, shows the correct stage and the reason, and presents the next message.
4. After message 5, the sim shows the score and the five messages beside their stages.

**Feedback:** Five messages, fixed order, one attempt each. Correct: "Correct: stage <number>, <stage name>. <Why>". Incorrect: "Not quite. This message comes from stage <number>, <stage name>. <Why>". The correct stage is revealed immediately after each commitment. A running count "Correct: n of 5" is shown, and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** The six stages are shown in order, none opened, with the question "Which stage of running a script produces each error message? Open every stage to begin."

**Chapter Anchors:** The chapter lists six stages and says a `SyntaxError` is found before any line runs. The sim uses five messages, and mastery is 4 of 5.
```

## Related Resources

- [Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md)
