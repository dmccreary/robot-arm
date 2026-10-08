---
title: "File Path Resolver"
description: "The learner will solve eight path problems by determining which file, or no file, a path reaches from a given working directory, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# File Path Resolver



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md).

````text
Type: microsim
**sim-id:** file-path-resolver<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** solve<br/>
**Learning Objective:** The learner will solve eight path problems by determining which file, or no file, a path reaches from a given working directory, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** file path, absolute path, relative path, working directory, parent folder, `..`, `.`, `__file__`, `pathlib.Path` (all defined in the section "File Paths" above this block).

**Evidence of Mastery:** For each of eight problems, the learner commits one answer: the file the path reaches, or "No such file". An answer is correct when it matches the Correct column of the problem table in Content. Mastery is 7 of 8 correct on the first attempt. The free-trial mode that follows is not evidence.

**Misconceptions:** (1) A relative path starts from the folder the script is saved in. (It starts from the working directory.) (2) `.` and `..` mean the same thing. (3) An absolute path depends on the working directory. (4) Code that builds a path from `__file__` fails when run from another folder.

**Instructional Rationale:** Apply-level solving needs the learner to carry out a procedure on new inputs and check the result. Seeing the folder tree while working out each path, and committing before the answer is revealed, makes the learner execute the resolution steps rather than recall a rule.

**Content:**

The file system the learner sees (folders end in `/`):

```text
/home/maker/
├── notes.txt
└── arm-lab/
    ├── show_config.py
    ├── config/
    │   ├── arm.json
    │   └── arm_backup.json
    └── armlab/
        ├── __init__.py
        └── config.py
```

Eight problems in this fixed order. In each, the learner picks one file from the tree, or "No such file":

| # | Working directory | Path or code | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | `/home/maker/arm-lab` | `config/arm.json` | `/home/maker/arm-lab/config/arm.json` | A relative path starts at the working directory, and `config/arm.json` is inside it. |
| 2 | `/home/maker` | `config/arm.json` | No such file | There is no `config` folder inside `/home/maker`. It is inside `arm-lab`. |
| 3 | `/home/maker/arm-lab/config` | `../show_config.py` | `/home/maker/arm-lab/show_config.py` | `..` moves up one folder, from `config` to `arm-lab`. |
| 4 | `/home/maker/arm-lab/armlab` | `../config/arm_backup.json` | `/home/maker/arm-lab/config/arm_backup.json` | `..` moves up from `armlab` to `arm-lab`, then `config/arm_backup.json` goes back down. |
| 5 | `/home/maker` | `/home/maker/arm-lab/config/arm.json` | `/home/maker/arm-lab/config/arm.json` | A path that starts with `/` is absolute, so the working directory is ignored. |
| 6 | `/home/maker/arm-lab` | `./notes.txt` | No such file | `.` is the working directory, `arm-lab`. The file `notes.txt` is one level up, in `/home/maker`. |
| 7 | `/home/maker/arm-lab/armlab` | `../../notes.txt` | `/home/maker/notes.txt` | Two `..` move up twice, from `armlab` to `arm-lab` to `/home/maker`. |
| 8 | `/home/maker` | `Path(__file__).parent / "config" / "arm.json"`, in the script `/home/maker/arm-lab/show_config.py` | `/home/maker/arm-lab/config/arm.json` | `__file__` is the script's own location, so the path is built from `arm-lab` and the working directory does not matter. |

The free-trial mode lets the learner choose a working directory from the folders in the tree (`/home/maker`, `/home/maker/arm-lab`, `/home/maker/arm-lab/config`, `/home/maker/arm-lab/armlab`) and type any path, then shows each step of the resolution.

**Provenance:** The tree and the problems are written for this sim and follow the chapter's `arm-lab` project. The resolution rules are the standard file-system rules described in the chapter section "File Paths".

**Rules:** To resolve a path, start at `/` if the path begins with `/`, otherwise start at the working directory. Process the pieces left to right: `.` stays where it is, `..` moves to the parent (the parent of `/` is `/`), and any other name moves into the child with that name. The result is a file if it is a file in the tree, a folder if it is a folder in the tree, and "No such file" if any step names something that is not in the tree. In the eight problems the learner must reach a file or "No such file". If a path ends at a folder in free-trial mode, the sim says "That path is a folder, not a file." There are no adjustable numeric quantities.

**Learner Activity:**

1. The learner sees the file tree, problem 1's working directory, and its path.
2. The learner clicks one file in the tree, or "No such file", and commits.
3. The sim highlights the correct answer, shows each step of the resolution in the form "start at <folder>, move into <name>, move into <name>", and shows the Why text.
4. The learner continues through all eight problems. After problem 8 the sim shows the score and unlocks free-trial mode, where the learner tries their own working directory and path.

**Feedback:** Eight problems, fixed order, one attempt each. Correct: "Correct: <full path or No such file>. <Why>". Incorrect: "Not quite. From <working directory>, <path> reaches <correct answer>. <Why>". The correct answer and the step-by-step resolution are shown after each commitment. A running count "Correct: n of 8" is shown, and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** The file tree is shown with problem 1: "The working directory is /home/maker/arm-lab. Which file does `config/arm.json` reach?"

**Chapter Anchors:** The chapter says the sim has eight problems, that one of them uses `Path(__file__).parent`, and that a relative path starts from the working directory and not from the script's folder. Mastery is 7 of 8.
````

## Related Resources

- [Chapter 1: Setting Up Python for Robotics](../../chapters/01-python-setup-for-robotics/index.md)
