# References: Setting Up Python for Robotics

1. [Python (programming language)](https://en.wikipedia.org/wiki/Python_(programming_language)) - Wikipedia - Covers Python's design philosophy, syntax, interpreter model, standard library, and history. Gives students context for why Python became the common language for robotics scripting and machine-learning tools such as LeRobot.

2. [Read–eval–print loop](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop) - Wikipedia - Explains the REPL cycle of reading an expression, evaluating it, and printing the result. It supports the chapter's use of the interactive prompt to test one idea at a time before saving it in a script.

3. [JSON](https://en.wikipedia.org/wiki/JSON) - Wikipedia - Describes the JSON data format, its syntax rules, data types, and common uses. This is the format the chapter uses for configuration files, so the article helps students read and repair their own settings files.

4. Automate the Boring Stuff with Python (2nd Edition) - Al Sweigart - No Starch Press - Sweigart teaches by starting each topic from a small real task such as renaming files or reading spreadsheets. That task-first approach shows beginners why paths, modules, and scripts matter, which mirrors this chapter's robot-motivated setup steps.

5. Think Python (3rd Edition) - Allen B. Downey - O'Reilly Media - Downey ends chapters with a dedicated debugging section and a vocabulary list, treating error messages as clues to reason from. This habit clarifies the chapter's traceback reading and print debugging. Widely praised for clarity rather than a sole originator.

6. [12. Virtual Environments and Packages](https://docs.python.org/3/tutorial/venv.html) - Python Documentation - The official tutorial on creating, activating, and deactivating a venv, then installing packages with pip and saving them to requirements.txt. It matches the chapter's virtual environment and requirements-file workflow step for step.

7. [Install packages in a virtual environment using pip and venv](https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/) - Python Packaging User Guide - A platform-by-platform walkthrough of creating a virtual environment and installing, upgrading, and recording dependencies. It is useful when a student's Windows, macOS, or Linux setup behaves differently from the chapter's examples.

8. [pathlib: Object-oriented filesystem paths](https://docs.python.org/3/library/pathlib.html) - Python Documentation - Reference for building and inspecting file paths that work on every operating system. It supports the chapter's file path and project layout sections, where scripts must find configuration files regardless of the current folder.

9. [json: JSON encoder and decoder](https://docs.python.org/3/library/json.html) - Python Documentation - Explains how Python dictionaries and lists convert to and from JSON text with load and dump. It shows how to read and write the robot configuration files that the chapter stores settings in.

10. [8. Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) - Python Documentation - Distinguishes syntax errors from exceptions and shows how to handle them with try and except. It deepens the chapter's traceback section by explaining what the exception names mean and how programs can recover.
