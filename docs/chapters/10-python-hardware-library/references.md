# References: A Python Hardware Library for Robot Arms

1. [Radian](https://en.wikipedia.org/wiki/Radian) - Wikipedia - Defines the radian as the angle whose arc equals the circle's radius and shows conversions to degrees and turns. It supports the chapter's unit conversion between raw servo counts, degrees, and radians in the Arm class.

2. [Hardware abstraction](https://en.wikipedia.org/wiki/Hardware_abstraction) - Wikipedia - Describes software layers that hide device-specific details behind a common interface, using joystick and operating-system examples. It frames the chapter's hardware abstraction layer, where one Arm class works with either servo or CAN drivers.

3. [Exception handling (programming)](https://en.wikipedia.org/wiki/Exception_handling_(programming)) - Wikipedia - Surveys how languages signal and recover from errors, including try, catch, and finally constructs. It gives the general background for the chapter's custom hardware exceptions and the cleanup that must run when a move fails.

4. Fluent Python (2nd Edition) - Luciano Ramalho - O'Reilly Media - Ramalho teaches Python through its data model, showing how special methods and protocols let your own classes behave like built-in types. This clarifies duck typing, the idea that lets a fake arm replace a real driver without changes.

5. Effective Python (2nd Edition) - Brett Slatkin - Addison-Wesley - Written as short numbered items, each with a recommendation, a bad example, and a fixed example. The items on with statements and try/finally cleanup map directly to the chapter's guarantee that torque switches off after any failure.

6. [dataclasses - Data Classes](https://docs.python.org/3/library/dataclasses.html) - Python Documentation - The official reference for the dataclass decorator, field defaults, frozen instances, and generated methods. It is the source for the chapter's Joint, Pose, and Command dataclasses and their default values.

7. [Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) - Python Tutorial - Explains try and except, raising exceptions, defining custom exception classes, and the finally clause and with statement for cleanup actions. It matches the chapter's section on when hardware fails.

8. [abc - Abstract Base Classes](https://docs.python.org/3/library/abc.html) - Python Documentation - Documents ABC and the abstractmethod decorator, which stop a class from being created until required methods exist. This is the tool for the chapter's driver base class that every concrete driver must complete.

9. [PEP 484 - Type Hints](https://peps.python.org/pep-0484/) - Python Enhancement Proposals - The specification that introduced type hints, explaining annotation syntax and why checkers such as mypy read them while Python does not enforce them at runtime. It supports the chapter's typed Arm class methods.

10. [LeRobot Documentation](https://huggingface.co/docs/lerobot/index) - Hugging Face - Presents a hardware-agnostic Python interface for controlling real arms such as the SO-ARM101, with common connect, read, and send calls. It shows a production example of the one-interface-many-drivers design built in this chapter.
