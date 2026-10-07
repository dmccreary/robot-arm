---
title: Setting Up Python for Robotics
description: Review the Python skills from Learning Python and add the project tooling used in every lab - the terminal, virtual environments, pip, packages, JSON configuration, command-line arguments, and git.
generated_by: claude skill chapter-content-generator
date: 2026-10-07 08:49:36
version: 1.11
---

# Setting Up Python for Robotics

## Summary

This chapter reviews the Python skills from Learning Python and adds the project tooling used in every later lab, including virtual environments, pip, packages, JSON files, and command-line arguments. It also introduces git for tracking changes. After this chapter, you will be able to set up a clean Python project for robot code.

## Concepts Covered

This chapter covers the following 25 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Learning Python Prerequisites | 4123 |
| Python Interpreter | 1603 |
| Python Script | 999 |
| Terminal | 630 |
| Virtual Environment | 602 |
| Pip | 601 |
| Python Module | 204 |
| Import Statement | 195 |
| Standard Library | 194 |
| Docstring | 145 |
| Reading a Traceback | 92 |
| Print Debugging | 87 |
| File Paths | 79 |
| JSON File Format | 45 |
| Git Version Control | 18 |
| Project Folder Layout | 9 |
| Python Package | 8 |
| Environment Variables | 6 |
| Command Line Arguments | 2 |
| REPL | 1 |
| Requirements File | 1 |
| Naming Conventions | 1 |
| Code Editor | 1 |
| Configuration File | 1 |
| Argparse Module | 1 |

## Prerequisites

This chapter assumes only the prerequisites listed in the [course description](../../course-description.md).

---

!!! mascot-welcome "Hi, Builder! I'm Servo."
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    I'm Servo, a robot arm who loves to see what happens when the code runs. By the end of this chapter you will have a clean Python project that is ready to talk to a real arm. I will pop up in six ways as you read:

    1. **Welcome:** I open each chapter and tell you what you will build.
    2. **Thinking:** I mark a big idea that is worth slowing down for.
    3. **Tip:** I share a shortcut you can use right away.
    4. **Warning:** I flag a trap that catches most builders, and show you the way out.
    5. **Encourage:** I cheer you on at a spot that is hard for everyone.
    6. **Celebrate:** I close the chapter and name what you just learned.

    If I'm not doing one of those six things, I'm not in the chapter. Let's move it!

Every robot program is a Python program first. Before a motor turns, your computer has to find Python, find your code, find the libraries your code needs, and find the settings file that says which port the arm is plugged into. When any one of those steps fails, the arm does nothing and the error message looks like gibberish.

This chapter fixes that. You will set up one tidy project folder, one private set of libraries, and one settings file. You will also learn to read the error messages that Python prints. Nothing in this chapter powers on an arm, so every mistake you make here is free.

## What You Already Know

This book is a Python book that happens to move a real robot. It assumes you finished the Learning Python course, or that you can do the things on the checklist below. You do not need to be an expert. You need to be able to read a short program and say what it will do.

Here is a quick self-check. Read the program, and predict what it prints *before* you run it.

```python linenums="1"
joints = {"shoulder_pan": 1, "elbow_flex": 3, "gripper": 6}


def describe(name, servo_id):
    return f"{name} uses servo {servo_id}"


for name, servo_id in joints.items():
    if servo_id > 2:
        print(describe(name, servo_id))

try:
    print(joints["wrist_roll"])
except KeyError:
    print("no wrist_roll yet")
```

The dictionary `joints` maps each joint name to a servo ID. The loop visits all three joints, but the `if` keeps only IDs greater than 2. That leaves `elbow_flex` and `gripper`. The last lookup asks for a key that is not in the dictionary, so Python raises a `KeyError`, and the `except` block catches it. The program prints:

```text
elbow_flex uses servo 3
gripper uses servo 6
no wrist_roll yet
```

If you predicted all three lines, you are ready. If one piece surprised you, such as the dictionary lookup, the f-string, or the `try` block, review that topic in Learning Python first. The table below lists every prerequisite skill, a way to test yourself, and the first place this book needs it.

| Skill from Learning Python | Check yourself | First used for |
|---|---|---|
| Variables, strings, f-strings, `print()`, `input()` | Print `f"{angle} degrees"` for a variable `angle` | Showing joint readings in every lab |
| `if`/`elif`/`else`, `for`, `while`, `range()` | Loop over six joints and print each one | Checking joint limits and running control loops |
| Functions with parameters, return values, and docstrings | Write a function that converts degrees to radians | Unit conversion for servos |
| Lists, tuples, dictionaries, sets, comprehensions | Store joint IDs in a dictionary | The joint settings in this chapter |
| Modules such as `math`, `random`, and `time` | Call `math.radians(90)` | Kinematics and timing loops |
| Text files with `with open(...)`, and JSON | Read a JSON file into a dictionary | Saving servo IDs and calibration |
| `try`/`except` and reading a traceback | Catch a `KeyError` | Shutting down safely when something fails |
| A simple class with `__init__` and methods | Write a class with one method | The `Arm` and `Joint` classes in Chapter 10 |
| matplotlib and NumPy basics | Plot a list of numbers | Trajectories and kinematics |
| REPL, running a script, `pip` in a virtual environment | Install a package into a virtual environment | Setting up the arm software (this chapter) |

The last row is the topic of this chapter. Learning Python introduced it quickly. Here we slow down, because every lab in this book starts with it.

## The Terminal

A **terminal** is a text window where you type commands to the computer and read its replies. The program running inside the terminal is called the **shell**. On macOS the shell is usually `zsh`. On Linux, and on Windows through WSL (the Windows Subsystem for Linux), it is usually `bash`. The commands in this book work the same in all three. If you use Windows, do your robot work inside a WSL terminal, not in the old Command Prompt. (WSL cannot see USB devices until you share them with it. The section "Port Names and Windows" later in this chapter explains how.)

The shell always has a **working directory**: the folder it is "standing in" right now. Commands that mention a file by name look for it there first. You will see in the File Paths section that this one fact explains many confusing errors.

The commands below are the ones you will type most often. Read them as a short conversation: *where am I, what is here, go somewhere else, make a folder.*

```bash
pwd                      # print the working directory
mkdir -p ~/projects      # make a folder called projects in your home folder
cd ~/projects            # change directory into it
mkdir arm-lab            # make the folder for this chapter's project
cd arm-lab               # step into it
ls                       # list what is here (nothing yet)
cd ..                    # step back out to the parent folder
```

The `~` character is a shortcut for your home folder, and `..` means "the folder above this one." The `#` starts a comment, so you can leave those parts out when you type.

| Command | What it does |
|---|---|
| `pwd` | Prints the full path of the working directory |
| `ls` | Lists the files and folders in the working directory |
| `cd folder` | Moves into `folder` |
| `cd ..` | Moves up to the parent folder |
| `mkdir name` | Makes a new folder called `name` |
| `clear` | Clears the screen |

!!! mascot-tip "Let the Terminal Type for You"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Press **Tab** after typing the first few letters of a file or folder name and the shell completes it. Press the **Up arrow** to bring back the last command you typed. Together they save hundreds of keystrokes a day.

Two keys matter when a program is running. **Ctrl-C** asks a running Python program to stop. **Ctrl-D** on an empty line ends a typed session, such as the REPL you will meet shortly. Ctrl-C is a polite request made through the keyboard, and the program has to be listening. It is *not* an emergency stop for a robot. Later chapters add a real hardware emergency stop, and you will always keep your hand near it.

## The Code Editor

A **code editor** is a program for writing source files. It colors the words in your code, flags typos as you type, and lets you run a file with one click. This book uses Visual Studio Code (VS Code) because it is free and works on macOS, Linux, and Windows. Thonny and PyCharm are good choices too, and nothing in this book depends on one editor.

Whichever editor you choose, make sure it can do three things:

- Show the **terminal** inside the editor window, so you can type commands without switching windows.
- Let you choose which Python **interpreter** runs your code. You will point it at your project's own environment in a few pages.
- Show the first line of a function's documentation when you hover over its name.

In VS Code, open the Command Palette and run **Python: Select Interpreter** to pick the interpreter. Open your project *folder* (not a single file), so the editor knows where the project begins.

## The Python Interpreter

When you write a `.py` file, you have written plain text. A computer cannot run text. The **Python interpreter** is the program that reads your Python text, checks it, and carries out its instructions one step at a time. When you type `python3` in the terminal, you are starting the interpreter.

Your computer can hold several interpreters at once. The operating system may include one. A package manager such as Homebrew may install another. Each one has a **version** number such as 3.10 or 3.12. The code in this book needs Python 3.10 or newer, so the first job in any new setup is to ask which interpreter you have and where it lives.

!!! mascot-thinking "The Interpreter Is Just a Program"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Python is not magic. It is a program, stored in a file on your disk, that reads *your* file as input. Once you see it that way, every setup problem becomes a question you can answer: which interpreter ran, and where is it?

Three commands answer those questions. Run them now, and read the output next to them.

```bash
python3 --version
which python3
python3 -c "print(2 + 2)"
```

The first command asks for the version. The second prints the path of the file that the shell will run when you type `python3`. The third uses the `-c` flag, which means "run this one line of Python and exit."

```text
Python 3.12.3
/usr/bin/python3
4
```

Your version number and path will differ. What matters is that the version is 3.10 or newer. The table below shows how to read each answer.

| Command | What it tells you | Good result |
|---|---|---|
| `python3 --version` | Which version of Python will run | 3.10 or higher |
| `which python3` | Which file the shell found | A path that exists |
| `python3 -c "print(2 + 2)"` | That the interpreter can run code at all | `4` |

If `python3 --version` says the version is too old, install a newer Python from python.org, or with your system's package manager, before you go on. Some readers use conda to manage Python. The ideas in this chapter still apply, but the book's commands use the built-in `venv` tool, so we will not mix the two.

## The REPL

The **REPL** (Read-Evaluate-Print Loop) is the interpreter in conversation mode. Type `python3` with nothing after it and you get a `>>>` prompt. Python reads the line you type, evaluates it, prints the answer, and waits for the next line.

```text
>>> 90 / 360 * 4096
1024.0
>>> exit()
```

That one line converted a 90-degree turn into a position on a servo whose encoder has 4096 steps per full turn. The REPL is the fastest place to test a formula or check how a function behaves. Leave it with `exit()` or by pressing Ctrl-D. Anything you want to keep belongs in a script, not in the REPL, because the REPL forgets everything when you close it.

## Python Scripts

A **Python script** is a text file, ending in `.py`, that holds a program you can run again and again. You run it by naming it after the interpreter:

```bash
python3 hello_arm.py
```

Before we look at a script, here are the two ideas it uses. The built-in variable `__name__` holds the name of the file Python is running. When you run a file directly, Python sets `__name__` to the special string `"__main__"`. When another file *imports* it, `__name__` holds the file's own name instead. The line `if __name__ == "__main__":` therefore means "only do this part when someone runs me directly." The `sys` module lets a program ask questions about itself, and `sys.executable` is the path of the interpreter that is running it.

Create a file called `hello_arm.py` with this content:

```python linenums="1"
"""Say hello and show which Python is running."""

import sys


def main():
    print("Hello, arm!")
    print(f"Python {sys.version_info.major}.{sys.version_info.minor} at {sys.executable}")


if __name__ == "__main__":
    main()
```

Run it with `python3 hello_arm.py`. It prints a greeting and then the version and path of your interpreter. Putting the work inside `main()` keeps the file safe to import later without running anything by accident. Every script in this book follows that shape.

Now you have a terminal, an interpreter, and a script. The next question is what happens between pressing Enter and seeing output. A script passes through six stages, and a failure at each stage produces a different kind of error message. Knowing the stage tells you where to look.

1. **Type the command.** You type `python3 hello_arm.py` and press Enter.
2. **The shell finds the interpreter.** The shell searches the folders listed in an environment variable called `PATH` for a program named `python3`.
3. **The interpreter opens the script.** Python starts and opens the file you named.
4. **The interpreter checks the syntax.** It reads the *whole* file and checks that it follows Python's grammar, before it runs a single line.
5. **The interpreter runs the lines.** It runs your code from top to bottom. Each `import` is carried out when its line is reached.
6. **Output and exit.** Printed text appears. If an exception went uncaught, Python prints a traceback first. Then the shell prompt returns.

The next MicroSim lets you open each stage and then sort five real error messages onto the stage that produces them. Open all six stages first. The sorting activity unlocks after that.

#### Diagram: Python Run Stage Sorter

<details markdown="1">
<summary>Python Run Stage Sorter</summary>
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
</details>

## Modules, Imports, and the Standard Library

A script that holds everything gets long fast. Python lets you split code into files and reuse them. The next four ideas fit together: modules, imports, the standard library, and packages.

### Python Modules

A **Python module** is a `.py` file whose names (functions, classes, constants) can be used by other Python code. The module's name is its filename without the `.py`. Any script you write is also a module. That is why the `main()` guard from the last section matters.

Here is a module with a conversion function that the book uses often. Servos report position in *ticks*, and there are 4096 ticks in one full turn of the STS3215 servo.

```python linenums="1"
# conversions.py
TICKS_PER_TURN = 4096


def degrees_to_ticks(degrees):
    """Return the servo position, in ticks, for an angle in degrees."""
    return round(degrees / 360 * TICKS_PER_TURN)
```

A second file in the same folder can now use it:

```python linenums="1"
# demo.py
import conversions

print(conversions.degrees_to_ticks(90))
```

Running `python3 demo.py` prints `1024`. A quarter turn is a quarter of 4096. The module did not copy its code into `demo.py`. It lets `demo.py` borrow it by name, and any other script can borrow the same function without rewriting it.

There is one more thing a module does that surprises beginners: **the first time a module is imported, Python runs every line at its top level.** It then remembers the module, so a second `import` of the same name does not run it again. You can watch this happen. Save a one-line file called `noisy.py`:

```python linenums="1"
print("noisy.py is running, __name__ =", __name__)
```

Run it two ways and compare the output:

```bash
python3 noisy.py
python3 -c "import noisy"
```

```text
noisy.py is running, __name__ = __main__
noisy.py is running, __name__ = noisy
```

The same line ran both times. The difference is the value of `__name__`: `"__main__"` when the file was the script, and `"noisy"` when it was imported. Now you can see why `if __name__ == "__main__":` is so useful. Without it, importing a script would run its whole program, and a robot script that moves an arm would move the arm just because another file imported it.

### The Import Statement

The **import statement** loads a module and makes its names available. It has three common forms. The table below shows each form, how you call a function afterwards, and when it fits.

| Statement | How you use it | When to use it |
|---|---|---|
| `import math` | `math.radians(90)` | The default. The prefix shows where each name came from. |
| `from math import radians` | `radians(90)` | One or two names used many times in a file. |
| `import numpy as np` | `np.array([1, 2, 3])` | A long name with a standard short nickname. |

When Python meets `import conversions`, it needs to find a file called `conversions.py`. It searches a list of folders in order. You can see the list yourself:

```python linenums="1"
import sys

print(sys.path)
```

The first entry is the folder that holds the script you ran. After it come the folders of Python's own built-in library, and finally a folder named `site-packages`, where installed libraries live. Here is what that list might look like for a script run inside the `arm-lab` environment you will build later (the paths on your computer will differ):

```text
['/home/maker/arm-lab',
 '/usr/lib/python312.zip',
 '/usr/lib/python3.12',
 '/usr/lib/python3.12/lib-dynload',
 '/home/maker/arm-lab/.venv/lib/python3.12/site-packages']
```

Now trace `import serial` through that list. Python checks the project folder for `serial.py` and finds none. It checks the standard-library folders and finds none. It checks `site-packages`, finds the `serial` folder that `pip` put there, and loads it. If every folder came up empty, Python would raise `ModuleNotFoundError`. Notice that the *last* folder is inside `.venv`. That is how a virtual environment gives your project its own libraries: it adds its own `site-packages` to the list.

Python stops at the *first* match. That order has a consequence that surprises almost every beginner.

!!! mascot-warning "Don't Name Your File math.py"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    If you save your own file as `math.py` or `random.py`, Python finds *your* file first and never reaches the real one, so `import math` seems broken. The error may read `AttributeError: partially initialized module`. Rename your file, delete the `__pycache__` folder beside it, and run again.

### The Standard Library

The **standard library** is the collection of modules that comes with Python itself. Because it ships with the interpreter, you never need `pip` for it. You only need `import`. Python programmers call this "batteries included," and it is why many robot scripts need nothing else.

Here is a short program that uses two standard-library modules, `math` for angle conversion and `time` for a stopwatch. The notation `:.4f` inside an f-string means "show this number with four digits after the decimal point."

```python linenums="1"
import math
import time

start = time.perf_counter()
angle = math.radians(90)
print(f"90 degrees is {angle:.4f} radians")
print(f"That took {time.perf_counter() - start:.6f} seconds")
```

The first line printed is always `90 degrees is 1.5708 radians`. The second line varies, because it measures a real clock. The table summarizes the standard-library modules this book relies on, so you know their names when they appear.

| Module | What it does | First used for |
|---|---|---|
| `math` | Trigonometry, square roots, constants such as pi | Forward and inverse kinematics |
| `time` | Pauses and clocks | Control loops that run at a fixed rate |
| `json` | Reads and writes JSON text | Settings and calibration files |
| `pathlib` | Works with file and folder paths | Finding the settings file |
| `argparse` | Reads options typed after the script name | Choosing a port or a file from the terminal |
| `os` | Talks to the operating system, including environment variables | Reading a port from the environment |
| `sys` | Facts about the running interpreter | Showing which Python is running |
| `logging` | Writes timestamped messages | Keeping a record of every move |
| `dataclasses` | Builds small data-holding classes | Describing poses and joint limits |

The complete reference for every module is at `docs.python.org/3/library/`. Reading a module's page there is a skill worth practicing.

### Python Packages

The word **package** has two meanings in Python, and the second one confuses everyone at first.

A **Python package** is a folder of modules that contains a file named `__init__.py`. The file can be empty. Its presence tells Python "this folder is importable." Our project will have a package called `armlab`:

```text
armlab/
├── __init__.py     # empty; marks the folder as a package
└── config.py       # a module inside the package
```

Code outside the folder imports from it with a dotted name: `from armlab.config import load_config`. Read it as "from the `config` module in the `armlab` package, bring me `load_config`."

The other meaning is a *pip package*: a library published online that you install with `pip`, such as `numpy` or `pyserial`. When people say "install the package," they mean this second kind. In this book we say **package** for a folder with `__init__.py` and **library** for something you install with pip. The table pulls the four related words together.

| Word | What it is | Example in this chapter |
|---|---|---|
| Script | A `.py` file you run directly | `show_config.py` |
| Module | A `.py` file other code imports | `armlab/config.py` |
| Package | A folder of modules with an `__init__.py` | `armlab/` |
| Library | Code someone else published, installed with pip | `pyserial` |

A single file can be both a script and a module. That is exactly what the `__main__` guard allows.

## Virtual Environments and Pip

Now to the setup step that every later lab depends on. Suppose two projects need different versions of the same library. An older project needs NumPy 1.x, and your new arm project needs NumPy 2.x. A computer's main Python can hold only one version of NumPy at a time, so one project breaks. Installing everything into one shared place is the root of most "it worked yesterday" problems.

### Virtual Environments

A **virtual environment** is a private folder that holds its own copy of the interpreter's launcher and its own set of installed libraries. Each project gets its own, so projects cannot interfere with each other. The tool that makes one is `venv`, which comes with Python.

!!! mascot-thinking "One Toolbox per Project"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Think of a virtual environment as a toolbox that belongs to one project. The tools go in the toolbox, and your code stays outside it. Throw the toolbox away and nothing you wrote is lost, because you can rebuild it in a minute.

Create and use one with these commands, run from inside your `arm-lab` folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
which python
deactivate
```

Here is what each line does. `python3 -m venv .venv` runs the `venv` module (`-m` means "run this module") and builds a folder named `.venv`. The leading dot keeps the folder hidden in file lists. `source .venv/bin/activate` **activates** the environment: it changes the `PATH` of *this terminal only*, so that the name `python` now points inside `.venv`. Your prompt gains a `(.venv)` prefix as a reminder. `which python` should now print a path ending in `.venv/bin/python`. `deactivate` puts everything back.

```text
(.venv) maker@laptop:~/projects/arm-lab$ which python
/home/maker/projects/arm-lab/.venv/bin/python
```

Activation lasts only for the terminal window where you ran it. Open a new terminal and you must activate again. On Debian, Ubuntu, and Raspberry Pi OS you may first need `sudo apt install python3-venv`. In native Windows, the activate command is `.venv\Scripts\activate`, but this book assumes WSL.

| | Without a virtual environment | With a virtual environment |
|---|---|---|
| Where libraries are installed | One shared place for the whole computer | A `.venv` folder inside each project |
| Two projects, two NumPy versions | One of them breaks | Each project keeps its own |
| Cleaning up | Hard to know what is safe to remove | Delete the folder and rebuild |
| What you share with others | "It works on my machine" | A list of exactly what to install |

Before the next MicroSim, three terms. The **active environment** is the one your terminal is currently using, and the prompt prefix shows its name. **System Python** is the interpreter that came with your operating system, used when no environment is active. A `ModuleNotFoundError` means Python searched every folder on its list and found no module with that name. In the MicroSim you will predict what happens in eight situations, using the three environments below. (The package versions are illustrative.)

#### Diagram: Virtual Environment Explorer

<details markdown="1">
<summary>Virtual Environment Explorer</summary>
Type: microsim
**sim-id:** virtual-environment-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer what an import or a pip command does in each of eight terminal situations, given which environment is active and which packages each environment contains, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** virtual environment, active environment, system Python, pip, package, library, `ModuleNotFoundError` (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight scenarios, the learner commits an answer before the result is shown. An answer is correct when it matches the Correct column of the scenario table in Content. Mastery is 7 of 8 correct on the first attempt. Running commands in free exploration afterwards is not evidence.

**Misconceptions:** (1) `pip install` installs a library for the whole computer. (2) A library installed in one project's environment is available to other projects. (3) The environment folder holds the project's own code. (It holds only libraries and a launcher.)

**Instructional Rationale:** An Understand-level infer objective needs the learner to apply a rule to a new case and commit to a result. Predicting the outcome while the three package lists stay visible makes the learner use the rule "only the active environment's packages are visible". The exploration mode that follows lets the learner confirm the rule with commands of their own.

**Content:**

The three places Python can run from, and what each contains at the start of every scenario:

| Place | Installed packages (illustrative versions) |
|---|---|
| System Python (no environment active) | Only the standard library. The operating system manages it, and `pip install` is refused with `error: externally-managed-environment`. |
| `arm-lab` environment | numpy 2.1, pyserial 3.5 |
| `old-project` environment | numpy 1.26 |

The eight scenarios, in this fixed order. Every scenario offers the same three answer options except where the Choices column differs:

| # | Active environment | Command(s) | Choices | Correct | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | `arm-lab` | `python -c "import serial"` | (a) It imports pyserial 3.5. (b) `ModuleNotFoundError: No module named 'serial'`. (c) `error: externally-managed-environment`. | a | pyserial is installed in `arm-lab`, and `arm-lab` is the active environment. |
| 2 | none (system Python) | `python -c "import serial"` | same as 1 | b | System Python has no pyserial. The copy inside `arm-lab` cannot be seen from outside it. |
| 3 | `old-project` | `python -c "import serial"` | same as 1 | b | pyserial was installed only in `arm-lab`. Each environment has its own libraries. |
| 4 | `arm-lab` | `python -c "import numpy; print(numpy.__version__)"` | (a) 1.26 (b) 2.1 (c) `ModuleNotFoundError: No module named 'numpy'` | b | `arm-lab` holds numpy 2.1. |
| 5 | `old-project` | `python -c "import numpy; print(numpy.__version__)"` | same as 4 | a | `old-project` keeps its own numpy 1.26. The newer copy in `arm-lab` does not affect it. |
| 6 | none (system Python) | `python -c "import numpy; print(numpy.__version__)"` | same as 4 | c | System Python has only the standard library, so there is no numpy to import. |
| 7 | `arm-lab`, then switch to `old-project` | `pip install matplotlib`, then (after activating `old-project`) `python -c "import matplotlib"` | (a) It imports matplotlib. (b) `ModuleNotFoundError: No module named 'matplotlib'`. (c) `error: externally-managed-environment`. | b | `pip install` put matplotlib only into `arm-lab`, the environment that was active at the time. |
| 8 | none (system Python) | `pip install matplotlib` | (a) It installs matplotlib for every project. (b) It installs matplotlib into `arm-lab`. (c) pip stops with `error: externally-managed-environment`. | c | System Python is managed by the operating system, so pip refuses. Activate an environment first. |

Free exploration commands (available after the eight scenarios): activate `arm-lab`, activate `old-project`, deactivate, `pip install numpy`, `pip install pyserial`, `pip install matplotlib`, `python -c "import numpy"`, `python -c "import serial"`, `python -c "import matplotlib"`, and `pip list`.

**Provenance:** The behavior follows the chapter sections "Virtual Environments" and "Pip", and the externally-managed-environment refusal follows PEP 668 as applied by Homebrew Python and recent Debian, Ubuntu, and Raspberry Pi OS releases. The package versions are illustrative and the sim labels them "illustrative".

**Rules:** Only the active environment's packages can be imported. With no environment active, only System Python's contents are visible. `pip install <name>` adds the package to the active environment, and the install message is `Successfully installed <name>-<version>`, using the version in this list: numpy 2.1, pyserial 3.5, matplotlib 3.9 (illustrative). If the package is already present in the active environment, the message is `Requirement already satisfied`. With no environment active, `pip install` prints `error: externally-managed-environment` and installs nothing. Importing a package that is not in the active environment prints `ModuleNotFoundError: No module named '<import name>'`, where the import name for pyserial is `serial`. Each scenario begins from the Content table's starting state. In free exploration, changes persist until the learner presses Reset, which restores the starting state. There are no adjustable numeric quantities.

**Learner Activity:**

1. The learner sees the three environments with their package lists and the first scenario: the active environment, the command, and three choices.
2. The learner commits one choice. The sim runs the command against the three environments and shows the output, the result for the committed choice, and the reason.
3. The learner continues through all eight scenarios.
4. After scenario 8, free exploration unlocks. The learner picks commands, watches the three package lists and the active-environment label update, and tries to make a `ModuleNotFoundError` appear and disappear.

**Feedback:** Eight scenarios, fixed order, one attempt each. Correct: "Correct: <Why>". Incorrect: "Not quite. The answer is (<letter>): <Why>". The correct answer is revealed after each commitment. A running count "Correct: n of 8" is shown, and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** The three environments are shown with their packages, no environment is active, and the first scenario asks "What happens when this command runs?"

**Chapter Anchors:** The chapter says the MicroSim has eight situations and three environments (system Python, `arm-lab`, `old-project`) with illustrative package versions, and that `pip install` with no environment active is refused on modern systems.
</details>

### Pip

**Pip** is Python's installer for libraries. It downloads a library from the Python Package Index (PyPI, a public online catalog) and puts it into the active environment. Always run it *after* activating your environment, so the library lands in the right toolbox. Use the form `python -m pip` instead of plain `pip`. It runs the pip that belongs to the interpreter named in front of it, which removes any doubt about which toolbox you are filling.

Here is a session that installs the library used to talk to servos in Chapter 4. The `serial` import name differs from the install name, which is a trap you will see again:

```bash
source .venv/bin/activate
python -m pip install pyserial
python -m pip list
python -c "import serial; print(serial.__version__)"
```

```text
Successfully installed pyserial-3.5
Package    Version
---------- -------
pip        24.0
pyserial   3.5
3.5
```

Your version numbers will differ. Notice that you *install* `pyserial` but *import* `serial`. The name on PyPI and the name you import are not always the same. The OpenCV library you will use for cameras is installed as `opencv-python` and imported as `cv2`. The install name is on the library's PyPI page, and its documentation shows the import line.

| Command | What it does |
|---|---|
| `python -m pip install name` | Installs a library into the active environment |
| `python -m pip list` | Lists everything installed in the active environment |
| `python -m pip show name` | Shows a library's version and where it is installed |
| `python -m pip uninstall name` | Removes a library from the active environment |
| `python -m pip freeze` | Lists installed libraries in a format a requirements file can reuse |

!!! mascot-warning "If Pip Refuses to Install"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    If pip prints `error: externally-managed-environment`, you forgot to activate your virtual environment, and pip is protecting the system's Python. Run `source .venv/bin/activate`, check that the prompt shows `(.venv)`, and try again. Never override the error with `--break-system-packages`. That flag is how a computer's own tools get broken.

### Requirements Files

A **requirements file** is a text file, normally named `requirements.txt`, that lists the libraries a project needs, one per line. It lets anyone rebuild your environment exactly. Save one with `python -m pip freeze > requirements.txt`, and rebuild with `python -m pip install -r requirements.txt`.

```text
numpy>=1.26
pyserial>=3.5
```

The `>=` means "this version or newer." (The versions shown are examples.) Commit `requirements.txt` to git, but never commit the `.venv` folder itself. It is large, specific to your computer, and easy to rebuild from the file.

## Writing Code Others Can Read

Robot code is read far more often than it is written. You will read it when something breaks, and so will teammates and teachers. Two habits make that reading easy: documentation inside the code, and consistent names.

### Docstrings

A **docstring** is a string placed as the very first statement of a module, function, or class, written in triple quotes. Python stores it, so `help()` can show it and an editor can display it when you hover over the name. A comment (`#`) is read only by people looking at the source file. A docstring travels with the code.

Compare these two versions of one function. The first works. The second can be used by someone who has never seen the file.

```python linenums="1"
def degrees_to_ticks(degrees):
    return round(degrees / 360 * 4096)
```

```python linenums="1"
def degrees_to_ticks(degrees):
    """Return the servo position, in ticks, for an angle in degrees.

    Args:
        degrees: The joint angle in degrees, measured from the zero position.

    Returns:
        A whole number of ticks. 4096 ticks make one full turn.
    """
    return round(degrees / 360 * 4096)
```

Type `help(degrees_to_ticks)` in the REPL after loading the second version, and Python prints the docstring as a manual page. A good docstring has a one-line summary that starts with a verb, then lists each parameter and the return value *with their units*, as the table shows.

| Part | What to write | Example |
|---|---|---|
| Summary line | One sentence starting with a verb | `Return the servo position...` |
| `Args:` | Each parameter, its meaning, and its unit | `degrees: ... in degrees` |
| `Returns:` | What comes back, and its unit | `A whole number of ticks` |
| `Raises:` | Errors a caller should expect, if any | `ValueError: if degrees is not a number` |

!!! mascot-tip "Put the Unit in the Docstring"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    When you write a docstring for a function that touches an arm, always state the unit of every number: degrees, radians, ticks, seconds. A function that quietly expects radians but receives degrees will drive a joint to the wrong place, and the docstring is where that mistake gets caught.

### Naming Conventions

**Naming conventions** are shared rules for how to spell the names in your code. Python's official style guide, PEP 8, sets them. Following them lets any Python reader guess what a name is at a glance.

| Kind of name | Style | Example |
|---|---|---|
| Variables and functions | `lowercase_with_underscores` | `target_angle`, `read_position` |
| Classes | `CapitalizedWords` | `ArmController` |
| Constants | `UPPERCASE_WITH_UNDERSCORES` | `TICKS_PER_TURN` |
| Modules and packages | short, lowercase | `config`, `armlab` |

For robot code, add the unit as a suffix: `shoulder_lift_deg`, `speed_ticks_per_s`, `timeout_s`. A name such as `angle` hides its unit, but `angle_deg` shows it. Mixed-up units have cost real missions. NASA lost the Mars Climate Orbiter in 1999 after one team's software produced results in pound-force seconds while another team's software expected newton seconds.

## When Things Go Wrong

Programs fail. The skill that separates a frustrated beginner from a confident builder is not writing code that never fails. It is reading the failure calmly and finding the cause. Python gives you two tools for that: the traceback it prints when a program crashes, and the `print()` calls you add to look inside a running program.

### Reading a Traceback

A **traceback** is the report Python prints when an exception is not caught. It shows the chain of function calls that led to the crash, with the file name, the line number, and the source line for each call. The last line names the type of error and gives a message.

!!! mascot-encourage "Red Text Is Not a Verdict"
    ![Servo giving an encouraging thumbs-up](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    A long traceback looks scary, and almost everyone freezes the first time they see one. You already read dictionaries and loops in Learning Python, so you can read this too. Start at the bottom, take it one line at a time, and you will find the problem in under a minute.

Here is a small program with a bug. It asks for an angle and converts it to servo ticks. Save it as `move_joint.py` and run it, typing `90` when asked.

```python linenums="1"
def degrees_to_ticks(degrees):
    return round(degrees / 360 * 4096)


angle = input("Angle in degrees: ")
ticks = degrees_to_ticks(angle)
print(ticks)
```

Python prints this (the folder name on your computer will differ):

```text
Angle in degrees: 90
Traceback (most recent call last):
  File "/home/maker/arm-lab/move_joint.py", line 6, in <module>
    ticks = degrees_to_ticks(angle)
  File "/home/maker/arm-lab/move_joint.py", line 2, in degrees_to_ticks
    return round(degrees / 360 * 4096)
                 ~~~~~~~~^~~~~
TypeError: unsupported operand type(s) for /: 'str' and 'int'
```

Follow these four steps, in this order, every time:

1. **Read the last line first.** It gives the *type* of error (`TypeError`) and a message. Here Python says it cannot divide a `str` (text) by an `int` (a whole number).
2. **Find the deepest frame in your own code.** Each pair of lines starting with `File` is a *frame*, one function call. "Most recent call last" means the frame nearest the bottom is where the crash happened. Here it is line 2, inside `degrees_to_ticks`.
3. **Look at the marker line.** Python 3.11 and newer draw `~~~^^^` under the part of the line that failed. Here it points at `degrees / 360`.
4. **Walk up to find the cause.** Line 6 passed `angle` to the function. `input()` always returns text, so `angle` is the string `"90"`. The fix is `angle = float(input("Angle in degrees: "))`.

The error type is the fastest clue. The table lists the ones you will meet most often in this book, what each usually means, and a robot-flavored example.

| Error type | What it usually means | Example |
|---|---|---|
| `SyntaxError` | The code breaks Python's grammar, so nothing ran | A missing closing parenthesis |
| `NameError` | A name is used before it is defined or is misspelled | Typing `shoulder_angel` for `shoulder_angle` |
| `TypeError` | A value has the wrong type for the operation | Dividing text by a number |
| `ValueError` | The type is right but the value is not | `int("ninety")` |
| `KeyError` | A dictionary does not have that key | `config["joint_names"]` when the key is `joints` |
| `IndexError` | A list position does not exist | Asking for joint 4 in a list of 3 |
| `AttributeError` | An object has no such attribute or method | Calling `.move()` on an object that has no `move` |
| `FileNotFoundError` | The file is not where the path says | A wrong settings-file path |
| `ModuleNotFoundError` | Python cannot find the module to import | Forgetting to activate the environment |
| `json.JSONDecodeError` | A JSON file has a syntax mistake | A comma after the last item |

In the next MicroSim you practice this skill on five real tracebacks. For each one you answer two questions: which line names the error, and which frame to check first. The rule for the second question is the one from step 2. The frame to check first is the deepest frame whose file is inside your own project folder. Frames inside Python's own library are almost never where the bug is.

#### Diagram: Traceback Detective

<details markdown="1">
<summary>Traceback Detective</summary>
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
</details>

### Print Debugging

**Print debugging** means adding `print()` calls to a program to see the values inside it while it runs. It is the oldest debugging method and still the one professionals reach for first. Where a traceback tells you *where* a program crashed, print debugging helps when a program runs to the end but gives the *wrong answer*.

Here is such a bug. The function should turn degrees into ticks, but a 90-degree move sends the servo to position 0.

```python linenums="1"
def degrees_to_ticks(degrees):
    return round(degrees // 360 * 4096)


target_deg = 90
ticks = degrees_to_ticks(target_deg)
print(f"{target_deg=} {ticks=}")
```

The f-string `{name=}` is a shortcut that prints both the name and the value. Running the program prints:

```text
target_deg=90 ticks=0
```

The input is right and the output is wrong, so the fault is inside the function. Add a print at the line you suspect, and show each step of the calculation:

```python linenums="1"
def degrees_to_ticks(degrees):
    turns = degrees // 360
    print(f"{degrees=} {turns=}")
    return round(turns * 4096)
```

```text
degrees=90 turns=0
```

There it is. `//` is *floor division*, which throws away the fraction, so 90 // 360 is 0. The fix is a single slash: `degrees / 360` gives `0.25`, and the result is `1024` ticks. Remove the extra prints once the bug is fixed.

Where you place a print matters as much as what it shows. The table lists the four places that find most bugs.

| Place the print | What it answers |
|---|---|
| First line of a function | "What did this function actually receive?" |
| Just before the line that fails | "What are the values on the line that crashed?" |
| After a calculation | "Is this step giving the number I expect?" |
| Top of a loop body | "Which pass through the loop am I on?" |

!!! mascot-tip "Print Before You Send"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Use `print(f"{name=}")` instead of `print(name)`, so every line of output says what it is. And when your code is about to command an arm, print the command first. Seeing `target_ticks=0` on the screen *before* the joint swings there is the cheapest safety check you have.

Print debugging has a weakness. The prints stay in the code until you delete them, and they vanish when the program closes. Chapter 13 introduces the `logging` module, which keeps a permanent, timestamped record without cluttering the screen.

## Finding Files and Storing Settings

Robot programs need to know things that are not in the code: which USB port the arm is on, which servo has which ID, and how far each joint may turn. Those facts live in files. The next group of ideas covers how to find a file, how to arrange your project so files are easy to find, and how to store settings in them.

### File Paths

A **file path** is the text that names where a file lives. An **absolute path** starts at the root of the file system and works anywhere: `/home/maker/arm-lab/config/arm.json`. A **relative path** starts from the working directory and so means different things in different places: `config/arm.json`. Two shortcuts help in relative paths. A single dot `.` means "the working directory," and two dots `..` mean "the parent folder." Python always uses forward slashes `/` in paths, even on Windows.

When you call `open("config/arm.json")`, Python uses the folder your *terminal* is standing in, not the folder your script is saved in. This is the cause of the most common beginner file error. Try the same script from two places:

```bash
cd ~/projects/arm-lab
python3 show_config.py --config config/arm.json
cd ~
python3 projects/arm-lab/show_config.py --config config/arm.json
```

The first command works. The second fails with the error below, because from the home folder the path `config/arm.json` points at `~/config/arm.json`, which does not exist.

```text
FileNotFoundError: [Errno 2] No such file or directory: 'config/arm.json'
```

The robust fix is to build the path from the location of the script itself. Python's `pathlib` module has a `Path` class for this. Three pieces are needed. `__file__` is a built-in variable holding the path of the current script. `Path(__file__).parent` is the folder that contains it. The `/` operator joins path pieces. Together:

```python linenums="1"
from pathlib import Path

DEFAULT_CONFIG = Path(__file__).parent / "config" / "arm.json"
```

This path is the same no matter where the terminal is standing. Our lab script uses exactly this line for its default.

| Path | Kind | Starts from | Works from any folder? |
|---|---|---|---|
| `/home/maker/arm-lab/config/arm.json` | Absolute | The root `/` | Yes, but only on this computer |
| `config/arm.json` | Relative | The working directory | No |
| `../config/arm.json` | Relative | The parent of the working directory | No |
| `Path(__file__).parent / "config" / "arm.json"` | Built from the script | The script's own folder | Yes |

In the next MicroSim you practice resolving paths. The project folder in the sim is fixed, and you will answer eight questions of the form "from this working directory, which file does this path reach?" One of the eight uses the `__file__` technique.

#### Diagram: File Path Resolver

<details markdown="1">
<summary>File Path Resolver</summary>
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
</details>

### Project Folder Layout

A **project folder layout** is an agreed arrangement of files and folders. With a standard layout you always know where the code, the settings, and the notes live. This is the layout you will build in the lab, and it is a small version of the layout every later chapter extends.

```text
arm-lab/
├── .gitignore          # files git must not track
├── .venv/              # the virtual environment (not committed)
├── README.md           # what the project is and how to run it
├── requirements.txt    # libraries to install
├── config/
│   └── arm.json        # settings: port, servo IDs, joint limits
├── armlab/             # your code, as a package
│   ├── __init__.py
│   └── config.py       # a module that loads the settings
└── show_config.py      # a script that uses the package
```

Settings go in `config/`, reusable code goes in the `armlab` package, and runnable scripts sit at the top. Keep the top level short. Run scripts from the project folder, so that `import armlab` finds the package: Python looks first in the script's own folder, and the package sits right beside the script.

### Configuration Files

A **configuration file** holds settings that you can change without editing the code. The serial port of an arm changes when you plug it into a different USB socket. Servo IDs change when you rebuild an arm. If those values are written inside the program, you edit and re-test code every time. If they live in a configuration file, you edit one line of data.

!!! mascot-thinking "Separate What Changes from What Doesn't"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Code describes *how* to do something, and a configuration file describes *which one*. When you change a value, you want to be sure you changed only a value and no logic. That is why settings belong in their own file, where a mistake is easy to see and cannot break a function.

Configuration files come in several formats, such as JSON, TOML, and YAML. This book uses JSON because Python can read it with its standard library and you have already met it.

### The JSON File Format

**JSON** (JavaScript Object Notation) is a plain-text format for structured data. Its rules are strict, and a program will reject a file that breaks any of them:

- Text is always in **double quotes**: `"port"`. Single quotes are not allowed.
- Items in an object or a list are separated by **commas**.
- There is **no comma after the last item**.
- There are **no comments**.
- The words `true`, `false`, and `null` are written in **lowercase**.

Python maps JSON to its own types in an obvious way. The table lists the pairs, so you know what you get after loading a file.

| JSON | Python |
|---|---|
| object `{ }` | `dict` |
| array `[ ]` | `list` |
| string `"text"` | `str` |
| number `12` or `1.5` | `int` or `float` |
| `true` / `false` | `True` / `False` |
| `null` | `None` |

Here is the settings file for this chapter's lab. The values are examples. Your arm's port, IDs, and limits will come from its own build.

```json
{
  "arm_name": "follower",
  "port": "/dev/ttyACM0",
  "baud_rate": 1000000,
  "joints": {
    "shoulder_pan": {"id": 1, "min_deg": -110, "max_deg": 110},
    "shoulder_lift": {"id": 2, "min_deg": -100, "max_deg": 100},
    "elbow_flex": {"id": 3, "min_deg": -97, "max_deg": 97},
    "wrist_flex": {"id": 4, "min_deg": -95, "max_deg": 95},
    "wrist_roll": {"id": 5, "min_deg": -160, "max_deg": 160},
    "gripper": {"id": 6, "min_deg": 0, "max_deg": 100}
  }
}
```

The `baud_rate` is the speed of the serial link in bits per second, which Chapter 4 explains. Loading the file takes two lines. `json.load(f)` reads the open file and returns a dictionary, and `json.dump(data, f, indent=2)` writes one back with readable indentation.

```python linenums="1"
import json

with open("config/arm.json") as f:
    config = json.load(f)

print(config["joints"]["elbow_flex"]["id"])
```

This prints `3`. A single misplaced comma makes `json.load` raise a `JSONDecodeError` and the whole file is rejected, so learning to spot those mistakes pays off. The next MicroSim presents six short settings files. Five contain one mistake each, and one is correct. You find the bad line and name which of the five rules above it breaks.

#### Diagram: JSON Syntax Doctor

<details markdown="1">
<summary>JSON Syntax Doctor</summary>
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
</details>

### Environment Variables

An **environment variable** is a named value that the operating system hands to every program it starts. You have already met one: `PATH` is the list of folders the shell searches for programs, and activating a virtual environment changes it. You can print any variable with `echo`:

```bash
echo $HOME
export ARM_PORT=/dev/ttyACM0
echo $ARM_PORT
```

The `export` command sets a variable for the current terminal window and every program started from it. Close the window and the value is gone. Python reads variables through the `os` module. The call `os.environ.get("ARM_PORT", "/dev/ttyACM0")` returns the variable's value, or the second argument if the variable is not set.

Our lab loader uses this to let the environment override the settings file. A setting that depends on the *computer* (which USB socket the arm is in today) belongs in an environment variable, and a setting that belongs to the *arm* (servo IDs) belongs in the file. Later chapters use the same technique for API keys, which are secrets that must never be written into code or committed to git.

### Port Names and Windows

Chapter 4 shows how to find your arm's port. For now, you need to know that the *name* of a serial port depends on the operating system. The `"port"` value in `config/arm.json` must match the computer you are using, so the example `/dev/ttyACM0` will be wrong on two of the three systems below.

| System | What a port name looks like | Example |
|---|---|---|
| Linux | A file under `/dev` named `ttyACM` or `ttyUSB` plus a number | `/dev/ttyACM0` |
| macOS | A file under `/dev` that starts with `tty.usbmodem` or `cu.usbmodem` (some adapters use `usbserial`) | `/dev/tty.usbmodem123` |
| Windows (native Python) | A COM port number | `COM3` |
| Windows with WSL | The Linux form, but only after you attach the USB device to WSL | `/dev/ttyACM0` |

The last row needs explaining. WSL 2 runs Linux in a lightweight virtual machine, and **it cannot see USB devices on its own**. A USB serial adapter plugged into a Windows laptop is invisible to your WSL terminal until you share it with a free tool called `usbipd-win`. You do this once per plug-in. Nothing in Chapters 1 to 3 needs it, because those chapters never open a port. You will need it when you first talk to a servo in Chapter 4.

!!! note "Connecting a USB adapter to WSL"
    These steps follow Microsoft's guide, *Connect USB devices* (Microsoft Learn, WSL documentation). They need Windows 10 or 11 with WSL 2 and a current `usbipd-win`, and Microsoft's guide lists the exact version requirements.

    1. In **Windows PowerShell**, install the tool once: `winget install --interactive --exact dorssel.usbipd-win`
    2. Plug in the adapter and keep a WSL terminal open. In PowerShell opened **as administrator**, run `usbipd list` and note the BUSID of your adapter, such as `4-4`.
    3. Still as administrator, share the device once: `usbipd bind --busid 4-4`
    4. Attach it to WSL (this step no longer needs administrator rights): `usbipd attach --wsl --busid 4-4`
    5. In the WSL terminal, run `lsusb` to confirm the device is listed, and then `ls /dev/ttyACM* /dev/ttyUSB*` to find the port name.

    While the device is attached to WSL, Windows cannot use it. Run `usbipd detach --busid 4-4` to give it back. The attach step has to be repeated each time you unplug and replug the adapter.

    If `lsusb` lists the adapter but no `ttyACM` or `ttyUSB` file appears, the WSL kernel may not include the driver for that adapter. Microsoft's guide does not cover this case, so check the `usbipd-win` project's WSL support page. The simple fallback is to run the hardware scripts with native Windows Python and use the `COM` port instead. Python code that never touches a port, which is every example in this chapter, runs the same in WSL.

Whichever system you use, change only the `"port"` line in `config/arm.json`, or set `ARM_PORT`. No code needs to change, and that is the reason the port lives in a settings file.

### Command Line Arguments

**Command line arguments** are the words typed after a script's name, such as `--config config/arm.json`. They let you change what a script does each time you run it without editing the file. Python stores the raw words in a list called `sys.argv`, but reading them by hand quickly becomes tedious and error-prone.

### The Argparse Module

The **argparse module** is the standard-library tool that reads command line arguments for you. You describe the options you want, and `argparse` checks the input, converts it, and writes a `--help` page automatically. Our lab script uses three calls: `ArgumentParser(...)` makes the parser, `add_argument("--config", ...)` declares an option with a default value, and `parse_args()` reads what the user typed. Running `python3 show_config.py --help` prints:

```text
usage: show_config.py [-h] [--config CONFIG]

Show an arm configuration.

options:
  -h, --help       show this help message and exit
  --config CONFIG  path to the JSON configuration file
```

## Tracking Changes with Git

**Git** is a version control system: a tool that records snapshots of your project so you can see what changed, undo mistakes, and share your work. Each snapshot is called a **commit**. Robot code especially benefits. When an arm that worked yesterday misbehaves today, the history tells you exactly what you changed in between.

Git works in three steps. You change files. You *stage* the changes you want to record with `git add`. You then record them with `git commit` and a short message. Here is the whole cycle, using the lab project:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git init -b main
git status
git add .
git commit -m "Add config loader and show_config script"
git log --oneline
```

The two `git config` lines tell git who you are, and you run them once per computer. `git init -b main` turns the current folder into a repository with a branch called `main`. `git status` lists what has changed. `git add .` stages everything in the folder (except what `.gitignore` excludes), and `git commit -m` records it. `git log --oneline` shows one line per commit:

```text
a1b2c3d Add config loader and show_config script
```

A **`.gitignore`** file lists patterns for files git must not track. For this project it holds three lines:

```text
.venv/
__pycache__/
*.pyc
```

Git is not GitHub. Git runs on your own computer and needs no account. GitHub is one website that stores copies of git repositories so you can back them up and share them.

!!! mascot-warning "Never Commit a Secret"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Do not commit passwords, API keys, or the `.venv` folder. Deleting a secret in a later commit does not remove it, because git keeps the full history. If a key ever lands in a commit, treat it as leaked and replace it at the provider. Keep secrets in environment variables, and list any file that holds them in `.gitignore` *before* the first `git add`.

## Lab: Build the arm-lab Project

In this lab you will put every idea from the chapter into one working project. You will make a folder, a private environment, a settings file, a small package, and a script. You will then break the settings file on purpose, read the traceback, and fix it. Finally you will record the result in git. No arm is needed, and nothing here sends a command to hardware. As always in this book: **simulate first, then power on.**

**Step 1. Make the project folder.**

```bash
mkdir -p ~/projects/arm-lab
cd ~/projects/arm-lab
mkdir config armlab
touch armlab/__init__.py
echo "# arm-lab" > README.md
```

`mkdir config armlab` makes both folders at once. `touch` creates an empty file, which is all `__init__.py` needs to be. Run `ls` to check that you see `README.md`, `armlab`, and `config`.

**Step 2. Create and activate the environment.**

```bash
python3 -m venv .venv
source .venv/bin/activate
which python
```

The last command should print a path that ends in `arm-lab/.venv/bin/python`. If it does not, the environment is not active, so stop and fix that before going on.

**Step 3. Install a library and record it.**

```bash
python -m pip install pyserial
python -m pip freeze > requirements.txt
cat requirements.txt
```

The file now lists `pyserial` and its exact version. You will use this library in Chapter 4. Anyone who clones your project can rebuild the environment with `python -m pip install -r requirements.txt`.

**Step 4. Write the settings file.** Create `config/arm.json` in your editor, and paste in the JSON from the JSON File Format section. Remember that JSON allows no comments and no trailing commas.

**Step 5. Write the loader module.** The module has one function. `load_config` takes a path, opens the file, and uses `json.load` to turn it into a dictionary. It then lets the `ARM_PORT` environment variable override the `"port"` setting, using the `os.environ.get` call from the Environment Variables section. The docstring states what goes in and what comes out. Create `armlab/config.py`:

```python linenums="1"
"""Load the arm configuration from a JSON file."""

import json
import os


def load_config(path):
    """Return the arm settings stored in a JSON file as a dictionary.

    Args:
        path: Path to the JSON file, as a string or a Path.

    The ARM_PORT environment variable, if set, replaces the "port" value.
    """
    with open(path) as f:
        config = json.load(f)
    config["port"] = os.environ.get("ARM_PORT", config["port"])
    return config
```

**Step 6. Write the script.** The script does four things. It builds the default settings path from `__file__`, as in the File Paths section. It creates an `argparse` parser with one option, `--config`. It loads the file with `load_config`. It then prints the arm name, the port, and one line per joint. In the last print, `{name:<14}` pads the joint name to 14 characters, and `{joint['min_deg']:>5}` right-aligns the number in 5 characters, so the columns line up. Create `show_config.py` in the top-level folder:

```python linenums="1"
"""Print the joints and serial settings from an arm configuration file."""

import argparse
from pathlib import Path

from armlab.config import load_config

DEFAULT_CONFIG = Path(__file__).parent / "config" / "arm.json"


def main():
    parser = argparse.ArgumentParser(description="Show an arm configuration.")
    parser.add_argument("--config", default=DEFAULT_CONFIG,
                        help="path to the JSON configuration file")
    args = parser.parse_args()

    config = load_config(args.config)
    print(f"Arm: {config['arm_name']}")
    print(f"Port: {config['port']} at {config['baud_rate']} baud")
    for name, joint in config["joints"].items():
        print(f"  {joint['id']}  {name:<14} {joint['min_deg']:>5} to {joint['max_deg']} degrees")


if __name__ == "__main__":
    main()
```

**Step 7. Run it three ways.**

```bash
python show_config.py
ARM_PORT=/dev/tty.usbmodem123 python show_config.py
cd ~ && python projects/arm-lab/show_config.py && cd ~/projects/arm-lab
```

The first run prints the settings from the file:

```text
Arm: follower
Port: /dev/ttyACM0 at 1000000 baud
  1  shoulder_pan    -110 to 110 degrees
  2  shoulder_lift   -100 to 100 degrees
  3  elbow_flex       -97 to 97 degrees
  4  wrist_flex       -95 to 95 degrees
  5  wrist_roll      -160 to 160 degrees
  6  gripper            0 to 100 degrees
```

In the second run, writing `ARM_PORT=...` before the command sets the variable for that one run only, and the port line changes to the value you gave. The third run works from your home folder because the default path is built from `__file__`. If it fails there, check that you used `Path(__file__).parent` and not a bare `"config/arm.json"`.

**Step 8. Break it on purpose.** Open `config/arm.json` and add a comma after the closing brace of the `gripper` line, so the last joint ends with `},`. Save and run `python show_config.py`. The traceback ends with a `JSONDecodeError`. Its message is `Illegal trailing comma before end of object` on Python 3.13, and `Expecting property name enclosed in double quotes` on some older versions. Scroll up, find the deepest frame inside *your* folder, and confirm it is the `json.load(f)` line in `armlab/config.py`. Remove the comma and run again to see the output return.

**Step 9. Record your work.** Create `.gitignore` *before* the first `git add`:

```bash
printf '.venv/\n__pycache__/\n*.pyc\n' > .gitignore
git init -b main
git add .
git status
git commit -m "Add config loader and show_config script"
git log --oneline
```

`git status` should list the files you wrote but *not* `.venv` or `__pycache__`. If `.venv` appears, the `.gitignore` is missing or misspelled, so fix it before committing.

### Check Your Work

Your project is complete when all of these are true:

- `which python` shows a path inside `arm-lab/.venv` while the environment is active.
- `requirements.txt` lists `pyserial`.
- `python show_config.py` prints the arm name, the port, and six joints, from any folder.
- Setting `ARM_PORT` changes the port line.
- `python show_config.py --help` prints a usage page.
- `git log --oneline` shows one commit, and `git status` shows a clean working tree.

### Challenge: Show One Joint

Add a `--joint` option that prints only the named joint, so `python show_config.py --joint elbow_flex` prints the arm lines and just the `elbow_flex` row. Try it yourself first. You need one new `add_argument` call and a check inside the loop.

??? note "Click to see one solution"
    Add this line after the `--config` option:

    ```python linenums="1"
    parser.add_argument("--joint", help="show only this joint")
    ```

    Then, inside the `for` loop, skip every joint that does not match:

    ```python linenums="1"
    for name, joint in config["joints"].items():
        if args.joint and name != args.joint:
            continue
        print(f"  {joint['id']}  {name:<14} {joint['min_deg']:>5} to {joint['max_deg']} degrees")
    ```

    The `continue` statement jumps to the next joint. When `--joint` is left out, `args.joint` is `None`, which counts as false, so every joint prints.

## Summary and Key Takeaways

You now have a repeatable way to start any robot project. Every later lab begins with the same moves: a folder, an environment, a requirements file, a settings file, and a first commit.

- A **terminal** runs your commands from a **working directory**, and a **code editor** writes the files.
- The **Python interpreter** is a program that runs your **script**. The **REPL** is the same interpreter in conversation mode.
- A script passes through six stages, and each kind of error message belongs to one stage.
- A **module** is a file, a **package** is a folder with `__init__.py`, and the **standard library** comes with Python. An **import statement** finds them by searching a list of folders in order.
- A **virtual environment** gives each project its own libraries, and **pip** installs into the active one. A **requirements file** records the list.
- **Docstrings** and **naming conventions** make code readable, and units belong in both.
- Read a **traceback** from the bottom: the error type first, then the deepest frame in your own code.
- **Print debugging** shows the values inside a program. Print a command before you send it.
- **File paths** are absolute or relative to the working directory. Build paths from `__file__` to make them work anywhere.
- A **configuration file** in **JSON** keeps settings out of code, **environment variables** hold per-computer values, and **argparse** reads **command line arguments**.
- **Git** records snapshots of your project, and secrets never go into a commit.

!!! mascot-celebration "You Built a Clean Robot Project!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just set up a virtual environment, loaded a JSON settings file from a package you wrote, read a real traceback, and made your first commit. That is the foundation every lab after this one stands on. Let's move it on to Chapter 2!

### Self-Check Questions

Test yourself before you move on. Click each question to reveal an answer.

??? question "1. You run `python3 demo.py` and see `ModuleNotFoundError: No module named 'serial'`. At which of the six stages did it fail, and what is the most likely fix?"
    It failed at stage 5, when the interpreter ran the `import` line. The most likely cause is that the virtual environment holding `pyserial` is not active. Activate it with `source .venv/bin/activate` and run the script again. If the library was never installed, run `python -m pip install pyserial` with the environment active.

??? question "2. A traceback shows five frames. Four are inside `/usr/lib/python3.13/json/` and one is in `load_bad.py`. Which frame do you check first, and why?"
    Check the `load_bad.py` frame. It is the deepest frame inside your own project, and the library frames are Python's own code, which is almost never the source of the bug. The last line of the traceback, the `JSONDecodeError`, tells you what is wrong with your JSON file.

??? question "3. Your script works when you run it from the project folder but fails with `FileNotFoundError` from your home folder. What causes this, and how do you fix it?"
    A relative path such as `config/arm.json` starts from the working directory, which is different in the two cases. Build the path from the script's location instead: `Path(__file__).parent / "config" / "arm.json"`.

??? question "4. Why should the serial port be in an environment variable or a settings file and not written in the code?"
    The port changes when you plug the arm into a different USB socket or use a different computer. If it is data and not code, you change one value and cannot accidentally break any logic. The environment variable also lets one computer override the file without editing it.

??? question "5. A teammate sends you a project folder that includes the `.venv` directory. What should you do instead of using it, and what file makes this easy?"
    Do not reuse another computer's `.venv`, because it is tied to that machine's paths and Python. Create your own with `python3 -m venv .venv`, activate it, and run `python -m pip install -r requirements.txt`. The requirements file lists exactly what to install.

In Chapter 2 you will leave the keyboard for the workbench and learn the parts of a robot arm: links, joints, degrees of freedom, and the workspace that your Python code will soon be moving through.
