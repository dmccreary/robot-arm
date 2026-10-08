---
title: "Traceback Detective"
description: "The learner will distinguish the error-type line from the frames of a Python traceback, and identify the frame to check first, in each of five tracebacks, with at least 8 of 10 answers correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Traceback Detective



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md).

````text
Type: microsim
**sim-id:** traceback-detective<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Template:** https://github.com/dmccreary/computer-science/tree/main/docs/sims/exception-hierarchy<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** distinguish<br/>
**Learning Objective:** The learner will distinguish the error-type line from the frames of a Python traceback, and identify the frame to check first, in each of five tracebacks, with at least 8 of 10 answers correct on the first attempt.

**Prerequisites:** traceback, frame, exception, error type, library, project folder (all defined in the section "Reading a Traceback" above this block).

**Evidence of Mastery:** For each of five tracebacks the learner commits two clicks: (1) the line that names the error type, and (2) the frame to check first. A click is correct when it matches the answer table in Content. Mastery is 8 of 10 clicks correct on the first attempt. Reading the hint text is exploration, not evidence.

**Misconceptions:** (1) The top line of a traceback shows the cause. (The top frame is only where the program started; the error type is on the last line.) (2) If the bottom frames are inside a library, the library has a bug. (The mistake is almost always in the learner's own call, which is the deepest frame inside the project folder.) (3) A longer traceback means a harder bug.

**Instructional Rationale:** Analyze-level distinguishing needs the learner to separate the parts of a structure and say what role each plays. Clicking the error line and then the frame to check first, on tracebacks of different shapes, makes the learner apply the two roles rather than recognize them. Tracebacks with library frames test whether the learner can separate their own code from the library's.

**Content:**

The learner's project folder is `/home/maker/arm-lab/`. A frame is a line starting `File` together with the source line (and any `~~~^^^` marker line) beneath it. Five tracebacks are shown in this fixed order.

Traceback 1:

```text
Traceback (most recent call last):
  File "/home/maker/arm-lab/list_joints.py", line 5, in <module>
    print(config["joint_names"])
          ~~~~~~^^^^^^^^^^^^^^^
KeyError: 'joint_names'
```

Traceback 2:

```text
Traceback (most recent call last):
  File "/home/maker/arm-lab/show_config.py", line 25, in <module>
    main()
    ~~~~^^
  File "/home/maker/arm-lab/show_config.py", line 17, in main
    config = load_config(args.config)
  File "/home/maker/arm-lab/armlab/config.py", line 15, in load_config
    with open(path) as f:
         ~~~~^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'config/nope.json'
```

Traceback 3:

```text
Traceback (most recent call last):
  File "/home/maker/arm-lab/load_bad.py", line 4, in <module>
    config = json.load(f)
  File "/usr/lib/python3.13/json/__init__.py", line 293, in load
    return loads(fp.read(),
        cls=cls, object_hook=object_hook,
        parse_float=parse_float, parse_int=parse_int,
        parse_constant=parse_constant, object_pairs_hook=object_pairs_hook, **kw)
  File "/usr/lib/python3.13/json/__init__.py", line 346, in loads
    return _default_decoder.decode(s)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^
  File "/usr/lib/python3.13/json/decoder.py", line 344, in decode
    obj, end = self.raw_decode(s, idx=_w(s, 0).end())
               ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^
  File "/usr/lib/python3.13/json/decoder.py", line 360, in raw_decode
    obj, end = self.scan_once(s, idx)
               ~~~~~~~~~~~~~~^^^^^^^^
json.decoder.JSONDecodeError: Illegal trailing comma before end of object: line 3 column 23 (char 50)
```

Traceback 4:

```text
Traceback (most recent call last):
  File "/home/maker/arm-lab/print_joints.py", line 3, in <module>
    print(joints[i])
          ~~~~~~^^^
IndexError: list index out of range
```

Traceback 5:

```text
Traceback (most recent call last):
  File "/home/maker/arm-lab/ping_servo.py", line 1, in <module>
    import serial
ModuleNotFoundError: No module named 'serial'
```

Answer table:

| # | Correct error-type line | Correct frame to check first | Why (shown as feedback) |
|---|---|---|---|
| 1 | `KeyError: 'joint_names'` | `list_joints.py`, line 5 (the only frame) | The dictionary has no key `joint_names`. The settings file calls the key `joints`. |
| 2 | `FileNotFoundError: [Errno 2] No such file or directory: 'config/nope.json'` | `armlab/config.py`, line 15, in `load_config` | The crash happened at `open(path)`. The frames above it show how `main` passed the path in, but the deepest project frame is where to look first. |
| 3 | `json.decoder.JSONDecodeError: Illegal trailing comma before end of object: line 3 column 23 (char 50)` | `load_bad.py`, line 4 | The four frames inside `/usr/lib/python3.13/json/` are Python's own code and are not buggy. Your only frame is the `json.load(f)` call, and the message says line 3 of the JSON file has a comma after its last item. |
| 4 | `IndexError: list index out of range` | `print_joints.py`, line 3 (the only frame) | `joints[i]` asked for a position the list does not have. The loop counted past the end. |
| 5 | `ModuleNotFoundError: No module named 'serial'` | `ping_servo.py`, line 1 (the only frame) | Python could not find `serial`. The fix is to activate the environment where pyserial is installed, not to change this line. |

**Provenance:** Tracebacks 1 to 4 were produced by running short scripts under Python 3.13 and then replacing the real folder paths with `/home/maker/arm-lab/` and `/usr/lib/python3.13/`. Traceback 5 is the standard format Python prints for a failed import. The error-type lines are verbatim.

**Rules:** The error-type line is always the last line of the traceback. The frame to check first is the deepest frame whose file path begins with `/home/maker/arm-lab/`. A click anywhere on a frame's `File` line, source line, or marker line counts as clicking that frame. Frames in files under `/usr/lib/python3.13/` are library frames and are never correct answers. There are no adjustable quantities.

**Learner Activity:**

1. The learner reads traceback 1. The sim asks "Click the line that names the error type."
2. The learner clicks a line and commits. The sim shows whether it was correct, then asks "Click the frame you would check first."
3. The learner clicks a frame and commits. The sim shows whether it was correct, highlights the correct frame, and shows the Why text.
4. The sim moves to the next traceback and repeats steps 1 to 3. After traceback 5 the sim shows the score.

**Feedback:** Five tracebacks, fixed order, two questions each, one attempt per question, ten answers in all. Correct: "Correct. <Why>". Incorrect on the error line: "That is not the error type. The last line of a traceback names the error: <correct line>." Incorrect on the frame: "Check this frame first instead: <correct frame>. <Why>". The correct answer is revealed after each commitment. A running count "Correct: n of 10" is shown, and the final screen says whether mastery (8 of 10) was reached.

**Starting State:** Traceback 1 is shown with no line selected and the question "Click the line that names the error type."

**Chapter Anchors:** The chapter says there are five real tracebacks and two questions for each, that the error type is the last line, and that the frame to check first is the deepest frame inside the learner's own project folder. Mastery is 8 of 10.
````

## Related Resources

- [Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md)
