# References: Serial and CAN Communication

1. [Universal asynchronous receiver-transmitter](https://en.wikipedia.org/wiki/Universal_asynchronous_receiver-transmitter) - Wikipedia - Describes UART framing with start, data, and stop bits, baud rate, and typical uses. It supports the chapter's UART frame timeline and explains why both ends of a link must agree on the same speed.

2. [CAN bus](https://en.wikipedia.org/wiki/CAN_bus) - Wikipedia - Covers the Controller Area Network standard, its frame format, arbitration, bit rates, and wiring including termination. It supports the chapter's CAN section, which applies the bus to the reBot-DevArm's motors.

3. [Watchdog timer](https://en.wikipedia.org/wiki/Watchdog_timer) - Wikipedia - Explains how a watchdog timer resets or halts a system that stops responding unless it is regularly refreshed. It supports the chapter's fail-safe design, where silence from the computer makes a motor stop.

4. Making Embedded Systems (2nd Edition) - Elecia White - O'Reilly Media - White explains peripheral communication through clear block diagrams and practical, hardware-first examples, with attention to how software meets real devices. Chosen for clarity, not as originator, it helps with the chapter's bytes, packets, and register ideas.

5. Serial Port Complete (2nd Edition) - Jan Axelson - Lakeview Research - Axelson is widely praised for plainly explaining how serial links work, including framing, baud rates, and wiring, with working examples. No single author originated these ideas, so this is chosen for clarity on the chapter's UART material.

6. [pySerial Short Introduction](https://pyserial.readthedocs.io/en/latest/shortintro.html) - pySerial Documentation - Shows how to open a serial port, set the baud rate and timeout, then write and read bytes in Python. It matches the chapter's code for sending a ping and reading the reply.

7. [python-can documentation](https://python-can.readthedocs.io/en/stable/) - python-can Project - Documents the Python package for sending and receiving CAN frames across many adapters through one interface. It is the library behind the chapter's CAN examples and helps students move from a pretend bus to hardware.

8. [SocketCAN - Controller Area Network](https://docs.kernel.org/networking/can.html) - Linux Kernel Documentation - Explains how Linux exposes CAN hardware as network interfaces such as can0 with socket-style access. It supports the chapter's CAN adapter section, including bringing up an interface and setting the bit rate.

9. [DYNAMIXEL Protocol 1.0](https://emanual.robotis.com/docs/en/dxl/protocol1/) - ROBOTIS e-Manual - Specifies a bus-servo protocol with the same style of header, device ID, length, instruction, parameters, and checksum, including ping and status packets. It is a well-documented companion for the chapter's packet and checksum sections.

10. [CAN Bus Explained - A Simple Intro](https://www.csselectronics.com/pages/can-bus-simple-intro-tutorial) - CSS Electronics - A beginner guide to how CAN connects devices, its frame structure, and how to log and decode frames. It supports the chapter's CAN frame and bit rate explanations with illustrated examples.
