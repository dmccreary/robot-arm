# Quiz: Setting Up Python for Robotics

Test your understanding of the Python interpreter, virtual environments, tracebacks, JSON settings, and git with these review questions.

---

#### 1. What is the Python interpreter?

<div class="upper-alpha" markdown>
1. A text editor that colors your code and flags typos as you type
2. A program that reads your Python text, checks it, and carries out its instructions one step at a time
3. A folder that holds a private copy of the libraries for one project
4. A command-line tool that downloads libraries from the Python Package Index
</div>

??? question "Show Answer"
    The correct answer is **B**. A `.py` file is only plain text, and a computer cannot run text. The interpreter is the program that reads that text and carries out its instructions. When you type `python3` in the terminal, you start it. Option A describes a code editor, option C describes a virtual environment, and option D describes pip. Each of those is a separate tool with a separate job.

    **Concept Tested:** Python Interpreter

    **See:** [The Python Interpreter](index.md#the-python-interpreter)

---

#### 2. When you run a file directly with `python3 hello_arm.py`, what value does Python give the built-in variable `__name__`?

<div class="upper-alpha" markdown>
1. The filename without the `.py`, which is `hello_arm`
2. The full path of the folder that holds the file
3. The word `main` with no underscores
4. The special string `"__main__"`
</div>

??? question "Show Answer"
    The correct answer is **D**. When a file is run directly, Python sets `__name__` to `"__main__"`. When another file imports it, `__name__` holds the file's own name instead, such as `noisy` in the chapter's example. This difference is what makes the `if __name__ == "__main__":` guard work. Option A describes the imported case, and options B and C are not values Python ever assigns to `__name__`.

    **Concept Tested:** Python Script

    **See:** [Python Scripts](index.md#python-scripts)

---

#### 3. Why do the scripts in this book put their work inside `main()` and call it only under `if __name__ == "__main__":`?

<div class="upper-alpha" markdown>
1. So that importing the file does not run the whole program, such as moving an arm, by accident
2. So that Python checks the syntax of the file before running it
3. So that the script can read command line arguments from the terminal
4. So that the script runs faster than it would with top-level code
</div>

??? question "Show Answer"
    The correct answer is **A**. The first time a module is imported, Python runs every line at its top level. Without the guard, importing a robot script would run its program, and a script that moves an arm would move the arm just because another file imported it. The guard limits that work to the case where someone runs the file directly. Syntax checking, argument parsing, and speed are unrelated to the guard.

    **Concept Tested:** Python Module

    **See:** [Python Modules](index.md#python-modules)

---

#### 4. Which pair of lines correctly installs the library used to talk to servos and then imports it?

<div class="upper-alpha" markdown>
1. `python -m pip install serial` and then `import serial`
2. `python -m pip install pyserial` and then `import pyserial`
3. `python -m pip install pyserial` and then `import serial`
4. `python -m pip install serial` and then `import pyserial`
</div>

??? question "Show Answer"
    The correct answer is **C**. The name on PyPI and the name you import are not always the same. The library is installed as `pyserial` but imported as `serial`. The chapter gives a second example: OpenCV is installed as `opencv-python` and imported as `cv2`. The install name is on the library's PyPI page, and its documentation shows the correct import line. Each of the other options mixes up the two names.

    **Concept Tested:** Pip

    **See:** [Pip](index.md#pip)

---

#### 5. You activate no environment and run `python -m pip install matplotlib`. Pip prints `error: externally-managed-environment`. What should you do first?

<div class="upper-alpha" markdown>
1. Activate your project's virtual environment and run the install again
2. Rerun the command with the `--break-system-packages` flag
3. Reinstall Python from python.org to replace the system interpreter
4. Delete the `.venv` folder and rebuild it from `requirements.txt`
</div>

??? question "Show Answer"
    The correct answer is **A**. The error means pip is protecting the operating system's own Python because no virtual environment is active. Activating the environment with `source .venv/bin/activate` and checking for the `(.venv)` prompt prefix lets the library land in the right toolbox. The chapter warns against `--break-system-packages`, because that flag is how a computer's own tools get broken. The other options fix a problem you do not have.

    **Concept Tested:** Virtual Environment

    **See:** [Virtual Environments](index.md#virtual-environments)

---

#### 6. Why should the `.venv` folder be listed in `.gitignore` instead of committed to git?

<div class="upper-alpha" markdown>
1. Git cannot store folders whose names start with a dot
2. The folder holds your own source code, which should stay private
3. Python refuses to run if the folder is tracked by git
4. It is large, specific to your computer, and easy to rebuild from `requirements.txt`
</div>

??? question "Show Answer"
    The correct answer is **D**. A virtual environment holds only a launcher and installed libraries, never your own code. It is large and tied to one computer's paths and Python version, so it should not be shared. A requirements file records exactly what to install, so anyone can rebuild the environment in a minute. You commit `requirements.txt` and leave `.venv/` out. Git can store dot-folders, and Python does not care about git.

    **Concept Tested:** Requirements File

    **See:** [Requirements Files](index.md#requirements-files)

---

#### 7. A function should turn 90 degrees into servo ticks, but it returns 0. A print inside it shows `degrees=90 turns=0`, where `turns = degrees // 360`. What is the cause?

<div class="upper-alpha" markdown>
1. The input was read with `input()`, so it is text and not a number
2. The constant 4096 is the wrong number of ticks for one full turn
3. The `//` operator is floor division, which throws away the fraction, so 90 // 360 is 0
4. The `round()` function always rounds small values down to zero
</div>

??? question "Show Answer"
    The correct answer is **C**. The print shows `degrees=90`, so the input is a number and the fault is inside the function. Floor division discards the fractional part, so `90 // 360` is `0`, and zero times 4096 is zero. A single slash gives `0.25`, and the result becomes 1024 ticks. A text input (A) would raise a `TypeError`, not return 0, and 4096 is the correct tick count (B).

    **Concept Tested:** Print Debugging

    **See:** [Print Debugging](index.md#print-debugging)

---

#### 8. Which of these is valid JSON that `json.load` will accept?

<div class="upper-alpha" markdown>
1. `{"port": "/dev/ttyACM0", "calibrated": True}`
2. `{"port": "/dev/ttyACM0", "calibrated": false}`
3. `{'port': '/dev/ttyACM0', 'calibrated': false}`
4. `{"port": "/dev/ttyACM0", "calibrated": false,}`
</div>

??? question "Show Answer"
    The correct answer is **B**. JSON requires double quotes, commas between items, no comma after the last item, no comments, and lowercase `true`, `false`, and `null`. Option A uses Python's `True`, option C uses single quotes, and option D has a trailing comma. Each of those would make `json.load` raise a `JSONDecodeError` and reject the whole file.

    **Concept Tested:** JSON File Format

    **See:** [The JSON File Format](index.md#the-json-file-format)

---

#### 9. The serial port name changes whenever you plug the arm into a different USB socket. Where does the chapter recommend keeping that value?

<div class="upper-alpha" markdown>
1. In an environment variable such as `ARM_PORT`, which can override the settings file
2. In a constant at the top of every script that opens the port
3. In a docstring, so that the value travels with the function
4. In the `.gitignore` file, so that git does not track it
</div>

??? question "Show Answer"
    The correct answer is **A**. A setting that depends on the computer, such as today's USB socket, belongs in an environment variable. A setting that belongs to the arm, such as servo IDs, belongs in the configuration file. Keeping the port as data and not code means you change one value and cannot accidentally break any logic. The lab loader uses `os.environ.get("ARM_PORT", ...)` to let the environment override the file.

    **Concept Tested:** Environment Variables

    **See:** [Environment Variables](index.md#environment-variables)

---

#### 10. Which name follows the PEP 8 naming convention for a constant?

<div class="upper-alpha" markdown>
1. `ticksPerTurn`
2. `TicksPerTurn`
3. `TICKS_PER_TURN`
4. `ticks-per-turn`
</div>

??? question "Show Answer"
    The correct answer is **C**. Constants use `UPPERCASE_WITH_UNDERSCORES`, such as `TICKS_PER_TURN`. Variables and functions use `lowercase_with_underscores`, and classes use `CapitalizedWords` (option B). Option A is camelCase, which PEP 8 does not use for these names, and option D contains hyphens, which Python reads as subtraction and cannot use in a name.

    **Concept Tested:** Naming Conventions

    **See:** [Naming Conventions](index.md#naming-conventions)
