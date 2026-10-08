---
title: "Serial and CAN Communication"
description: "How a computer talks to the motors in a robot arm: serial and CAN buses, bytes, packets, registers, device IDs, baud rates, timeouts and watchdogs, with pyserial and python-can labs that run against a pretend bus before any hardware."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 13:05:00"
version: 1.11
---

# Serial and CAN Communication

## Summary

This chapter explains how a computer sends commands to motors over serial and CAN buses, including packets, registers, device IDs, and baud rates. You will use the pyserial and python-can libraries to ping devices and read registers. After this chapter, you will be able to find a device on a bus and read and write its settings from Python.

## Concepts Covered

This chapter covers the following 34 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Serial Communication | 1375 |
| UART | 597 |
| USB Serial Adapter | 592 |
| Serial Port | 477 |
| Pyserial Library | 445 |
| Bytes and Bytearray | 412 |
| Packet Structure | 401 |
| Instruction Packet | 371 |
| Register Map | 347 |
| CAN Bus | 203 |
| Writing a Register | 175 |
| Reading a Register | 171 |
| CAN Adapter | 89 |
| Python-CAN Library | 82 |
| Device ID | 30 |
| Communication Timeout | 29 |
| Status Packet | 24 |
| Watchdog Timer | 24 |
| Ping Command | 23 |
| Fail-Safe Behavior | 23 |
| Hexadecimal | 7 |
| Checksum | 5 |
| CAN Bit Rate | 4 |
| CAN Termination | 4 |
| Communication Errors | 4 |
| TTL Half-Duplex Serial | 2 |
| Baud Rate | 2 |
| Bus Scan | 2 |
| Daisy Chain Wiring | 1 |
| CAN Frame | 1 |
| Vendor SDK | 1 |
| Struct Module | 1 |
| Bit Operations | 1 |
| Little-Endian Byte Order | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)

---

!!! mascot-welcome "Let's Learn to Talk!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    My motors only understand short bursts of bytes, and you are about to learn to speak that language from Python. By the end of this chapter you will be able to find every motor on a bus, read its position, and tell when a conversation has gone wrong. Let's move it!

Chapter 3 fed the arm with electricity. This chapter is about the other wire that matters: the one that carries *commands*. A motor with power and no commands just sits there. To make a joint move, your Python program has to send the motor a message, and to know where the joint is, the motor has to send one back.

Every message travels over a **bus**, which is a set of shared wires that several devices use to talk to one computer. This book meets two buses. The SO-ARM101's STS3215 servos use a **serial bus** (one data wire, shared by all six motors). The reBot-DevArm's motors use a **CAN bus** (two wires, shared by all seven). Their wiring is different, but the idea is the same: a message goes out, one device recognises its name in it and answers.

You will not need any hardware to follow the chapter. Every packet in the text is shown byte by byte, and the lab runs against a **pretend bus** written in Python, in keeping with the rule that runs through this whole book: *simulate first, then power on*. The last lab step is an optional read-only check on a real servo bus.

## Serial Communication

**Serial communication** sends data one bit at a time over a single wire (plus a ground reference). Its opposite is *parallel* communication, which sends several bits at once on several wires. Parallel sounds faster, but it needs many wires, and at high speed the bits arrive at slightly different times and get mixed up. Serial needs only a few wires, so it is cheap, easy to run along an arm, and it is how almost all robot motors are connected.

A *bit* is a single 0 or 1. On a wire, a 1 is a high voltage and a 0 is a low voltage (a few volts, which is why this is called *low-level* signalling and why the common ground of Chapter 3 matters). A **byte** is a group of 8 bits, and one byte is the smallest unit this chapter talks about. A message is a sequence of bytes sent one after another.

| | Serial | Parallel |
|---|---|---|
| Bits sent at the same moment | 1 | Several (for example 8) |
| Wires for data | 1 or 2 | One per bit, plus extras |
| Good for | Long, thin cables, robot arms | Short, fast links inside a computer |
| Used by the arms in this book | Yes | No |

!!! mascot-thinking "A Bus Is a Shared Wire"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Picture one narrow hallway that six people share. Only one person can talk at a time, and each message must say who it is for, or everyone will answer at once. Nearly everything in this chapter, from IDs to checksums to timeouts, is a rule that makes a shared hallway work.

### UART and Baud Rate

A **UART** (universal asynchronous receiver-transmitter) is the small circuit, inside a computer or a motor, that turns bytes into a stream of bits on a wire and turns the stream back into bytes. *Asynchronous* means that there is no shared clock wire. Instead, both ends agree in advance on the speed, and each byte tells the receiver when it starts.

The **baud rate** is that speed: the number of bits per second on the wire. For the STS3215 servos the factory setting is 1,000,000 baud, and the sender and the receiver must use the *same* baud rate. If they do not, the receiver samples the wire at the wrong moments and reads garbage, even though every wire is connected correctly.

The standard layout of one byte on the wire is called **8N1**. The line rests at a high voltage when nothing is being sent. One byte then travels as ten bits: a **start bit** (low) that wakes up the receiver, 8 data bits, and a **stop bit** (high) that returns the line to rest. Only 8 of those 10 bits are data, so the speed in *bytes* per second is the baud rate divided by 10.

Here is a worked example. At 1,000,000 baud one bit takes 1 microsecond (µs), so one byte takes 10 µs. A six-byte ping packet takes 60 µs to send, and the six-byte reply takes another 60 µs. At 115,200 baud, a slower rate that many hobby boards use, one byte takes \( 10 / 115200 \approx 87 \) µs, so the same six-byte ping takes 0.52 ms. The Python formula is simply `bytes * 10 / baud`.

```python linenums="1"
def transfer_time_s(num_bytes, baud):
    """Seconds to send num_bytes at the given baud rate with 8N1 framing."""
    return num_bytes * 10 / baud


print(f"{transfer_time_s(6, 1_000_000) * 1e6:.0f} us")   # one ping packet at 1,000,000 baud
print(f"{transfer_time_s(6, 115_200) * 1e3:.2f} ms")     # the same packet at 115,200 baud
```

```text
60 us
0.52 ms
```

The STS3215 stores its baud rate in a register as a code from 0 to 7, from the LeRobot motor tables:

| Code | Baud rate |
|---|---|
| 0 | 1,000,000 |
| 1 | 500,000 |
| 2 | 250,000 |
| 3 | 128,000 |
| 4 | 115,200 |
| 5 | 57,600 |
| 6 | 38,400 |
| 7 | 19,200 |

The next MicroSim practises the formula. You choose a baud rate and a packet, watch the ten-bit frames line up on a time line, and then answer five timing questions.

#### Diagram: UART Frame Timeline

<iframe src="../../sims/uart-frame-timeline/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the UART Frame Timeline MicroSim fullscreen](../../sims/uart-frame-timeline/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>UART Frame Timeline</summary>
Type: microsim
**sim-id:** uart-frame-timeline<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the time to send a given number of bytes at a given baud rate using 8N1 framing, to within 1 percent, in five problems, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** serial communication, bit, byte, UART, baud rate, 8N1, start bit, stop bit (all defined in the sections above this block).

**Evidence of Mastery:** For each of five problems the learner types a time in the unit shown and commits. An answer is correct when it is within 1 percent of the Correct time column in Content. Mastery is 4 of 5 correct on the first attempt. Moving the baud and packet controls in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A byte is 8 bits on the wire. (It is 10 bits with 8N1 framing.) (2) A higher baud rate sends bytes with fewer bits. (It only makes each bit shorter.) (3) Both ends can use different baud rates. (A mismatch gives garbage.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of one formula on new numbers with an immediate check. The time line shows ten-bit frames end to end, so the factor of 10 is seen before it is calculated.

**Content:**

The formula is time = bytes × 10 / baud. Explore mode lets the learner choose one of the eight baud rates in the chapter's table and one of three example packets: a ping request (6 bytes), a position-read request (8 bytes), and a position-read reply (8 bytes). The time line shows each byte as a start bit, eight data bits and a stop bit, with the total time written beneath.

Five problems in this fixed order:

| # | Problem | Bytes | Baud | Unit asked | Correct time | Why (shown as feedback) |
|---|---|---|---|---|---|---|
| 1 | Send one ping request | 6 | 1,000,000 | µs | 60 µs | 6 × 10 / 1,000,000 = 60 µs. |
| 2 | One position read, request plus reply | 16 | 1,000,000 | µs | 160 µs | 16 × 10 / 1,000,000 = 160 µs. |
| 3 | The same position read | 16 | 115,200 | ms | 1.39 ms | 16 × 10 / 115,200 = 1.389 ms. |
| 4 | Read all six servos' positions, one at a time | 96 | 1,000,000 | µs | 960 µs | 6 reads × 16 bytes = 96 bytes; 96 × 10 / 1,000,000 = 960 µs. |
| 5 | The same six reads | 96 | 57,600 | ms | 16.67 ms | 96 × 10 / 57,600 = 16.667 ms. |

**Provenance:** The byte counts follow the packet examples in the chapter section "Instruction Packet" and "Status Packet". The baud rates are from the STS3215 baud rate table (LeRobot motor tables). The times are computed from the formula and ignore USB and software delays, and the sim says so.

**Rules:** time (s) = bytes × 10 / baud. An answer is correct when |typed − correct| / correct <= 0.01 after converting to the unit shown. The typed value has minimum 0, maximum 1000, step 0.01, and no default. Baud rates are the eight values in the table and the default is 1,000,000.

**Learner Activity:**

1. In Explore mode the learner picks a baud rate and a packet and watches the frames and the total time change. The learner should notice that slowing the baud rate stretches every bit equally.
2. The learner switches to the problems. Problem 1 shows its bytes and baud rate.
3. The learner types a time and presses Check to commit.
4. The sim shows whether the answer was correct, the correct time and the Why text, then moves on. After problem 5 it shows the score.

**Feedback:** Five problems, fixed order, one attempt each. Correct: "Correct: <time>. <Why>". Incorrect: "Not quite. Each byte is 10 bits, so the time is <time>. <Why>". The correct time is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with 1,000,000 baud and the ping request selected, showing six frames and "60 µs".

**Chapter Anchors:** The chapter's worked example is 6 bytes at 1,000,000 baud giving 60 µs, and at 115,200 baud giving 0.52 ms. The formula is bytes × 10 / baud. The sim has five problems and mastery is 4 of 5.
</details>

### TTL Half-Duplex Serial and Daisy Chains

Two more terms describe how the servos are wired. **TTL** names the voltage levels: logic signals that swing between 0 V and a few volts (3.3 V or 5 V), as opposed to the larger swings of older serial standards. A **duplex** link is one that carries data in both directions. A *full-duplex* link has one wire for each direction. The STS3215 servos use **half-duplex** serial, a single data wire that carries traffic in *both* directions, but only one direction at a time. The computer talks, then listens, and the servo that was addressed talks while everyone else listens.

That is why a half-duplex servo system needs a small interface board between the computer's USB port and the servos. The board takes the computer's two-wire serial (one transmit line, one receive line) and merges them onto the servos' single data wire, and it supplies motor power from the barrel-jack supply of Chapter 3. The servos then connect in a **daisy chain**: each motor has two identical three-pin sockets, and a short cable runs from one motor to the next, like beads on a string. The three wires in each cable are power, ground, and the shared data line, so *every* motor sees every message, and only the addressed one answers.

!!! mascot-tip "Plug in One Motor to Test, Then the Chain"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Because the data wire is shared, one loose connector in the middle of the chain can silence every motor after it. When something does not answer, connect only the first motor to the board, test it, and add one motor at a time until the problem appears. The motor you just added, or its cable, is the culprit.

## Bytes in Python

To send a packet, your program must work with raw bytes, not with numbers and strings. Python has two types for that. A **bytes** object is an immutable sequence of byte values from 0 to 255, written with a `b` before the quotes. A **bytearray** is the same thing but changeable, which makes it right for a memory block you will update. Indexing either one gives back a plain integer.

```python linenums="1"
packet = bytes([0xFF, 0xFF, 0x01, 0x02, 0x01, 0xFB])   # six byte values
print(packet)
print(packet[2])            # indexing gives an integer
print(packet.hex(" "))      # a readable string, one pair of digits per byte

memory = bytearray(4)       # four zero bytes that can be changed
memory[1] = 0x20
print(memory)
```

```text
b'\xff\xff\x01\x02\x01\xfb'
1
ff ff 01 02 01 fb
bytearray(b'\x00 \x00\x00')
```

Python prints non-letter bytes as `\x` followed by two digits. That second spelling is **hexadecimal** (hex for short), a number system with 16 digits: 0 to 9 and then A to F for ten to fifteen. Hex matters because *two hex digits are exactly one byte*. `0xFF` is 255, the largest byte value, and `0x38` is 56. You can always let Python convert: `int("38", 16)` gives 56 and `hex(56)` gives `'0x38'`. Python's `0x` prefix marks a hex literal, and the `.hex(" ")` method above is the quickest way to inspect a packet.

A number larger than 255 needs more than one byte, and the question is which byte comes first. **Little-endian** byte order puts the *low* byte first. The value 1304 is `0x0518` in hex, so it is sent as the two bytes `18 05`. The Feetech motors use little-endian for every two-byte value. Python reads and writes it with `int.from_bytes` and `to_bytes`, or with the **struct module**, which packs and unpacks fixed layouts using a short format string. In the format `"<H"`, the `<` means little-endian and `H` means one unsigned 16-bit number.

```python linenums="1"
import struct

data = bytes([0x18, 0x05])                    # two bytes read from a servo
print(int.from_bytes(data, "little"))         # 1304
print(struct.unpack("<H", data)[0])           # 1304 again; unpack returns a tuple
print((1304).to_bytes(2, "little").hex(" "))  # back to bytes: 18 05
```

```text
1304
1304
18 05
```

Finally, **bit operations** act on the individual bits of a number. Three are enough here. `& 0xFF` keeps only the lowest byte, `>> 8` shifts a number right by 8 bits (so it drops the low byte), and `~` flips every bit. One use is a **sign bit**. The STS3215 reports a speed as 15 bits of size plus one sign bit in bit 15, a layout called sign-magnitude. A raw reading of `0x8064` therefore means bit 15 is set (negative) and the size is `0x0064`, or 100:

```python linenums="1"
raw = 0x8064
magnitude = raw & 0x7FFF        # keep the lower 15 bits
negative = (raw >> 15) == 1     # look at bit 15
speed = -magnitude if negative else magnitude
print(speed)
```

```text
-100
```

!!! mascot-encourage "Hex and Byte Order Feel Strange at First"
    ![Servo giving an encouraging thumbs-up](../../img/mascot/encouraging.png){ class="mascot-admonition-img" }
    Reading `18 05` as 1304 feels backwards for everyone, and it only gets easy through repetition. You already switch between kinds of numbers, such as degrees and radians. Run the three code blocks above, change a byte, and predict the output before you press Enter.

## From the Computer to the Bus

A computer has no UART pins that you can wire to a servo, but it does have USB ports. A **USB serial adapter** closes the gap: it is a small device (or a board with a chip on it) that appears to the computer as a serial port and presents UART signals on its other side. In the SO-ARM101 the adapter is built into the servo interface board. The same board can also switch between two input channels, and the LeRobot documentation notes that on the Waveshare board the two jumpers must be set to the `B` channel (USB). USB carries only the *data*. The motors get their power from the separate barrel-jack supply, so you must connect both.

When you plug the adapter in, the operating system creates a **serial port**, a named doorway that programs open to reach the device. Its name depends on the operating system, as Chapter 1 showed. LeRobot's documentation shows `/dev/tty.usbmodem585A0076841` on macOS and `/dev/ttyACM0` on Linux, and Windows uses names such as `COM3`. On Linux you may also need permission to open the port. The LeRobot documentation uses `sudo chmod 666 /dev/ttyACM0` for a quick fix, and adding your user to the `dialout` group gives a permanent one.

Python's **pyserial library** opens a serial port and moves bytes through it. You install it with `python -m pip install pyserial` (you did this in Chapter 1). Four calls cover this chapter. `serial.Serial(port, baudrate, timeout=...)` opens the port, and the `timeout` (seconds) stops a read from waiting forever. `write(data)` sends bytes. `read(n)` waits for up to `n` bytes and returns whatever arrived, which may be fewer if the timeout expired. And `serial.tools.list_ports.comports()` lists the ports on your computer. Using `with` closes the port automatically, even if an error occurs.

```python linenums="1"
import serial
from serial.tools import list_ports

for port in list_ports.comports():            # every serial port the computer can see
    print(port.device, "-", port.description)

# Open a port, send a ping to servo 1, and read up to six bytes back.
with serial.Serial("/dev/ttyACM0", 1_000_000, timeout=0.1) as ser:
    ser.write(bytes([0xFF, 0xFF, 0x01, 0x02, 0x01, 0xFB]))
    reply = ser.read(6)                       # b"" if nothing answered in 0.1 s
    print(reply.hex(" "))
```

Without a servo attached this code would raise an error, so treat it as a preview. In the lab you will run the same logic against a pretend bus first.

!!! mascot-tip "Unplug to Find Your Port"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    When a computer lists five ports, find yours by difference. Make a list of ports, unplug the adapter, list them again, and the port that vanished is yours. LeRobot's `lerobot-find-port` does exactly this, and the lab shows the six lines of Python.

## Packets

Raw bytes on a shared wire would be useless without rules about where a message begins, who it is for, and whether it arrived intact. A **packet** is a message with that structure. The STS3215 servos use the Feetech serial protocol, which follows the same layout as other widely used bus servos. Every packet has the same **packet structure**, and the table shows the layout of an *instruction* packet (sent by the computer) and a *status* packet (sent back by a servo).

| Field | Size | Instruction packet | Status packet |
|---|---|---|---|
| Header | 2 bytes | `FF FF` | `FF FF` |
| ID | 1 byte | Which servo the packet is for | Which servo is answering |
| Length | 1 byte | Number of parameter bytes + 2 | Number of data bytes + 2 |
| Instruction / Error | 1 byte | What to do | 0 if all is well, otherwise a fault code |
| Parameters / Data | 0 or more | Extra information for the instruction | The values you asked for |
| Checksum | 1 byte | Detects damage in transit | Detects damage in transit |

!!! mascot-thinking "A Packet Is an Envelope"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The header says "a message starts here", the ID is the address, the length says how much is inside, and the checksum is the seal that shows whether it was damaged on the way. Every field exists to solve one problem of a shared wire, so when a packet fails you can ask which problem it was.

### Device ID

The **device ID** is the number that names one device on the bus. For the STS3215 it is a single byte from 0 to 253, and the value 254 (`0xFE`) is the *broadcast* ID, which means "everyone". Every servo on a bus must have a different ID, because they all hear every packet and the ID is the only thing that tells them apart. A brand-new motor usually ships with ID 1, which is why the LeRobot setup procedure connects the motors to the controller board *one at a time* and gives each its own ID (`shoulder_pan` is 1, up to `gripper` as 6, as in the `arm.json` of Chapter 1). Two motors with the same ID answer at the same time and their replies collide.

### Instruction Packet

An **instruction packet** is the packet the computer sends. Its **instruction** byte says what the servo should do, and these are the codes from the Feetech protocol:

| Instruction | Code | What it does |
|---|---|---|
| PING | `0x01` | Asks whether the device is there, with no parameters |
| READ | `0x02` | Reads bytes from the device's registers |
| WRITE | `0x03` | Writes bytes into the device's registers |
| REG WRITE | `0x04` | Stores a write and waits for ACTION |
| ACTION | `0x05` | Runs the stored writes together |
| SYNC READ | `0x82` | Reads the same registers from several devices |
| SYNC WRITE | `0x83` | Writes to several devices in one packet, with no replies |

This chapter uses PING, READ and WRITE. The *Length* field equals the number of parameter bytes plus 2, which counts the instruction byte and the checksum. In Python, the whole packet is built from those pieces, and the next subsection builds the last one.

### Checksum

A **checksum** is a single byte computed from the other bytes of a packet, so that the receiver can detect damage. The sender adds up everything from the ID through the last parameter, keeps only the lowest byte of the sum, and flips every bit of it (the `~` operation). The receiver repeats the calculation and compares. If one bit changed on the wire, the numbers will almost always disagree, and the receiver ignores the packet.

Here is a worked example for a PING to servo 1. The bytes after the header are the ID `01`, the length `02`, and the instruction `01`. Their sum is 4, which is `0x04`. Flipping all eight bits gives `0xFB`. The packet is therefore `FF FF 01 02 01 FB`. In Python, `~sum(body) & 0xFF` does the whole job in one line, because `& 0xFF` keeps the low byte after the flip.

```python linenums="1"
def checksum(body):
    """Return the checksum byte for the bytes from the ID through the last parameter."""
    return ~sum(body) & 0xFF


body = bytes([0x01, 0x02, 0x01])      # ID, length, instruction
print(hex(checksum(body)))
```

```text
0xfb
```

In the next MicroSim you calculate the checksum byte of six packets. Each shows its ID, instruction and parameters, and you type the hex value of the final byte before the sim reveals the full packet.

#### Diagram: Packet Checksum Calculator

<iframe src="../../sims/packet-checksum-calculator/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Packet Checksum Calculator MicroSim fullscreen](../../sims/packet-checksum-calculator/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Packet Checksum Calculator</summary>
Type: microsim
**sim-id:** packet-checksum-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the checksum byte of six instruction packets from their ID, instruction and parameters, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** packet structure, device ID, instruction packet, hexadecimal, checksum, bit operations (all defined in the sections above this block).

**Evidence of Mastery:** For each of six packets the learner types the checksum as two hex digits and commits. An answer is correct when it equals the Checksum column in Content, ignoring case. Mastery is 5 of 6 correct on the first attempt. Building packets freely in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The checksum includes the two header bytes. (It starts at the ID.) (2) The checksum is the plain sum. (It is the bitwise NOT of the low byte of the sum.) (3) The Length field counts every byte of the packet. (It counts the parameters plus 2.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a procedure on new data. Showing the sum, its low byte and the flipped result step by step after each answer lets the learner find which step went wrong.

**Content:**

Explore mode lets the learner choose an ID (1 to 6), an instruction (PING, READ or WRITE), a register name from the chapter's register table and a value, and shows the packet bytes with the checksum worked out in steps. Register addresses: ID 5, Baud_Rate 6, Torque_Enable 40, Goal_Position 42, Present_Position 56, Present_Voltage 62, Present_Temperature 63.

Six packets in this fixed order. Sums are in decimal and then hex.

| # | Packet | Bytes from ID to last parameter | Sum | Checksum | Why (shown as feedback) |
|---|---|---|---|---|---|
| 1 | PING servo 1 | 01 02 01 | 4 (0x04) | FB | ~0x04 = 0xFB. |
| 2 | PING servo 2 | 02 02 01 | 5 (0x05) | FA | ~0x05 = 0xFA. |
| 3 | READ servo 1, Present_Position (address 56, 2 bytes) | 01 04 02 38 02 | 65 (0x41) | BE | ~0x41 = 0xBE. |
| 4 | READ servo 3, Present_Temperature (address 63, 1 byte) | 03 04 02 3F 01 | 73 (0x49) | B6 | ~0x49 = 0xB6. |
| 5 | WRITE servo 1, Goal_Position = 2048 (bytes 00 08, little-endian) | 01 05 03 2A 00 08 | 59 (0x3B) | C4 | ~0x3B = 0xC4. |
| 6 | WRITE servo 2, Torque_Enable = 0 | 02 04 03 28 00 | 49 (0x31) | CE | ~0x31 = 0xCE. |

**Provenance:** The packet layout, the instruction codes and the checksum rule are from the Feetech serial protocol; packets 1 and 3 are the examples given in that protocol's documentation. The register addresses are from the STS3215 control table in the LeRobot motor tables. The sim is a calculator and sends nothing to any device.

**Rules:** Length = parameter bytes + 2. Checksum = (~(sum of the bytes from the ID to the last parameter)) & 0xFF. The typed value must be exactly two hex digits (0-9, A-F, either case).

**Learner Activity:**

1. In Explore mode the learner builds packets of their own and watches the sum and the flipped checksum appear in steps.
2. The learner switches to the six packets. Packet 1 shows its fields without the checksum.
3. The learner types two hex digits and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the complete packet, then moves to the next packet. After packet 6 it shows the score.

**Feedback:** Six packets, fixed order, one attempt each. Correct: "Correct: <checksum>. <Why>". Incorrect: "Not quite. The sum is <sum> (<hex>), and its bitwise NOT is <checksum>. <Why>". The correct checksum is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with PING to servo 1 selected, showing the packet `FF FF 01 02 01 FB` with its working.

**Chapter Anchors:** The chapter's worked example is the PING packet `FF FF 01 02 01 FB`, with a sum of 4 and a checksum of FB. The sim has six packets and mastery is 5 of 6.
</details>

### Status Packet

A **status packet** is what a servo sends back after an instruction. It has the same shape as an instruction packet, except that the instruction byte is replaced by an **error byte**: 0 means the servo is operating normally, and any other value reports a problem (the servo's manual lists what each bit means). After the error byte come the *data* bytes you asked for, if any, and a checksum. The length is again the number of data bytes plus 2.

Here is the status packet for a position read from servo 1, whose data were `18 05`. The bytes after the header are the ID `01`, the length `04` (two data bytes plus 2), the error `00`, and the data `18 05`. The sum is `0x22`, so the checksum is `0xDD`, and the packet is `FF FF 01 04 00 18 05 DD`. Reading the data in little-endian order gives 1304 steps of the servo's position. The servo's encoder has 4096 steps per turn, so the angle is \( 1304 / 4096 \times 360 \approx 114.6 \) degrees.

!!! mascot-warning "Check the Error Byte and the Checksum Every Time"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A reply that looks like data can still be damaged or can report a fault, and code that skips both checks will act on garbage, such as a position that is wrong by thousands of steps. Always verify the header, the length and the checksum, and treat a non-zero error byte as a stop sign. The `parse_status` function in the lab does all three.

The next MicroSim practises reading replies. You are shown six reply packets as hex bytes, and you classify each as a valid reading, a bad checksum, a servo-reported error, or not a packet at all.

#### Diagram: Status Packet Decoder

<iframe src="../../sims/status-packet-decoder/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Status Packet Decoder MicroSim fullscreen](../../sims/status-packet-decoder/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Status Packet Decoder</summary>
Type: microsim
**sim-id:** status-packet-decoder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify six reply packets as a valid reading, a bad checksum, a servo-reported error or not a packet, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** packet structure, status packet, error byte, checksum, little-endian byte order, hexadecimal (all defined in the sections above this block).

**Evidence of Mastery:** For each of six reply packets the learner chooses one of four classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 5 of 6 correct on the first attempt. Selecting bytes to see their field names is exploration, not evidence.

**Misconceptions:** (1) Any reply that starts with FF FF is valid. (The checksum and error byte must also pass.) (2) A non-zero error byte means the data is wrong. (It means the servo reports a fault, and the checksum can still be correct.) (3) A wrong checksum can be ignored if the data looks plausible.

**Instructional Rationale:** An Understand-level classify objective asks the learner to place an example into a category on its features. Checking header, length, checksum and error byte in order gives a procedure that separates the four classes.

**Content:**

The classes are: "Valid reading", "Bad checksum", "Servo reports an error", "Not a packet". In Explore mode the learner clicks any byte to see which field it belongs to. Six replies in this fixed order, with the question each one answers:

| # | Reply bytes | Question asked | Class | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | FF FF 01 04 00 18 05 DD | Position of servo 1 | Valid reading | Header, length and checksum are right and the error is 0. Data 18 05 = 1304 steps = 114.6 degrees. |
| 2 | FF FF 02 03 00 49 B1 | Voltage of servo 2 | Valid reading | The data byte 0x49 = 73, which is 7.3 V in units of 0.1 V. |
| 3 | FF FF 03 03 00 1F DA | Temperature of servo 3 | Valid reading | The data byte 0x1F = 31, which is 31 degrees Celsius. |
| 4 | FF FF 01 04 00 18 05 DC | Position of servo 1 | Bad checksum | The checksum should be DD but is DC, so a bit was damaged in transit. |
| 5 | FF FF 01 02 20 DC | Ping of servo 1 | Servo reports an error | The checksum is right, but the error byte is 0x20, not 0. |
| 6 | FE FF 01 02 00 FC | Ping of servo 1 | Not a packet | The first header byte is FE, not FF. |

**Provenance:** The packet layout and checksum are from the Feetech serial protocol; packet 1 uses the position example in the protocol's documentation. The units (0.1 V and degrees Celsius) and the address meanings are from the STS3215 memory table. The data values are illustrative.

**Rules:** A reply is a valid reading when it starts with FF FF, its length equals the byte count minus 4, its checksum matches and its error byte is 0. Check in this order: header, then length, then checksum, then error byte. The first check that fails decides the class.

**Learner Activity:**

1. In Explore mode the learner clicks the bytes of a sample reply and sees each field's name and value.
2. The learner switches to the six replies. Reply 1 is shown with the question it answers.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct, marks the field that decided the class, and shows the Why text. After reply 6 it shows the score.

**Feedback:** Six replies, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This is <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with reply 1 shown and no byte selected, with the prompt "Click a byte to see which field it is."

**Chapter Anchors:** The chapter's status packet example is `FF FF 01 04 00 18 05 DD`, which is 1304 steps and about 114.6 degrees. The sim has six replies and mastery is 5 of 6.
</details>

### Ping Command and Bus Scan

A **ping command** asks a device "are you there?" and nothing more. It has no parameters and changes nothing in the servo, which makes it the safest packet you can send. A servo that hears its own ID answers with a status packet (`FF FF 01 02 00 FC` for servo 1), and a servo that is missing, unpowered or on the wrong baud rate stays silent. Ping is therefore the first thing to try with any bus.

A **bus scan** is a ping sent to every possible ID in turn. The IDs that answer are the devices on the bus. Because only the answering IDs are reported, a scan also tells you which ones are *missing*, such as a motor whose cable fell out of the chain. LeRobot's motor library has a ready-made `broadcast_ping`, which sends one broadcast ping and collects the answers, and the lab builds the slower one-at-a-time version so that you can see every packet. Every ID that does not answer costs one full timeout (see the section on communication timeouts), so a scan of ten IDs with a 0.1 second timeout can take close to a second. Scan only the IDs you expect, such as 1 to 10, and never while the arm is moving.

## Registers

A servo is a small computer with a block of memory, and everything you can read or change about it lives in that memory. A **register** is one location in the block, named by its numeric **address**. A **register map** (or control table) is the list of all registers: their address, size in bytes, meaning, and whether they can be written. Each manufacturer publishes one for each motor. The table shows the STS3215 registers used in this book. The addresses and sizes come from the LeRobot motor tables, and the units from the STS memory table.

| Register | Address | Size (bytes) | Meaning | Writable |
|---|---|---|---|---|
| ID | 5 | 1 | The device ID (0 to 253) | Yes |
| Baud_Rate | 6 | 1 | Baud rate code (0 to 7) | Yes |
| Torque_Enable | 40 | 1 | 0 = torque off, 1 = torque on | Yes |
| Goal_Position | 42 | 2 | Where the joint should go, in steps | Yes |
| Present_Position | 56 | 2 | Where the joint is now, in steps (about 0.088 degrees each) | Read only |
| Present_Voltage | 62 | 1 | Supply voltage at the servo, in units of 0.1 V | Read only |
| Present_Temperature | 63 | 1 | Motor temperature in degrees Celsius | Read only |

The map has two kinds of memory. Registers such as `ID` and `Baud_Rate` are stored in non-volatile memory (EEPROM) and keep their values when the power is off. Registers such as `Present_Position` live in working memory and change continuously. A write to an EEPROM register therefore changes the motor *permanently*, which matters in the warning below.

!!! mascot-thinking "A Register Is a Named Pigeonhole"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    To a bus servo, "move to 90 degrees" is just "put these two bytes into the pigeonhole at address 42." Everything the motor can be told, and everything it can say, is a read or a write at some address. Once you have the map, the whole motor is an array.

### Reading a Register

**Reading a register** asks the servo to report some bytes of its memory. The READ instruction carries two parameters: the starting address and the number of bytes. A position read for servo 1 is the packet `FF FF 01 04 02 38 02 BE`. The ID is 1, the length is 4 (two parameters plus 2), the instruction is `02`, the address is `0x38` (56, `Present_Position`), the size is 2, and `BE` is the checksum. The servo answers with the status packet from the earlier example, and the two data bytes `18 05` are the position in little-endian order.

### Writing a Register

**Writing a register** puts bytes into the servo's memory. The WRITE instruction carries the starting address followed by the new bytes. To command servo 1 to go to the middle of its travel, 2048 steps, write `0x0800` to `Goal_Position` (address 42, or `0x2A`). In little-endian order the bytes are `00 08`, so the packet is `FF FF 01 05 03 2A 00 08 C4`. The length is 5 (three parameters plus 2). A write to a goal position makes a powered motor move, so every write you send to real hardware needs the checks from Chapter 3: a clear workspace, a reachable E-stop, and a small first step.

Writing is also how a servo is configured. Writing `0` to `Torque_Enable` lets a joint go limp, and writing a new value to `ID` changes the motor's name for good. Chapter 5 covers what the control registers do, and Chapter 8 walks through configuring a real motor.

!!! mascot-warning "Never Write ID or Baud Rate to a Motor You Have Not Read First"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    The `ID` and `Baud_Rate` registers are saved permanently, and a servo set to a baud rate your adapter does not use will seem to disappear from the bus. Read a register before you write to it, change only one register at a time, and write down the old value so that you can restore it. In this chapter, write only to the pretend bus.

### The Vendor SDK and the LeRobot Library

Building packets by hand is how you learn the protocol, but a real program should not have to. A **vendor SDK** is the software library that the motor maker (or the community around the motor) provides for talking to its devices. Feetech's SDK handles the packet layout, the checksum and the port handling for you. LeRobot builds a layer on top of it: its `FeetechMotorsBus` class opens the port, wraps reads and writes by *register name* (for example `Present_Position`), and has methods such as `broadcast_ping`, `enable_torque` and `disable_torque`. The layers stack up like this:

| Layer | What you write | Example | Where you meet it |
|---|---|---|---|
| Raw bytes | The packets themselves | `FF FF 01 02 01 FB` | This chapter |
| Vendor SDK | Calls to read and write registers | A packet handler and port handler | Behind LeRobot |
| LeRobot motor bus | Register names and motor names | `read("Present_Position")` | Chapters 10 and 11 |
| Hardware abstraction (yours) | `arm.move_to(pose)` | The `Arm` class | Chapter 10 |

You learn the lowest layer so that when a higher layer fails, you can read the packets and see why.

## When Communication Fails

A shared wire fails in ordinary ways: a loose cable, a wrong setting, two devices with one name. This section covers how to detect those failures in code and what to do about them.

### Communication Timeout

A **communication timeout** is the longest your program will wait for a reply before it decides that none is coming. Without one, a program that waits for a motor that has been unplugged waits forever. With pyserial, you set it when you open the port, as in `timeout=0.1`. A `read` then returns after 0.1 seconds with whatever has arrived, possibly an empty `b""`. A good timeout is short enough to catch trouble quickly and long enough for a healthy reply. At 1,000,000 baud a reply takes microseconds on the wire, so 0.05 to 0.1 seconds is generous, and the real limit is the delay inside the USB adapter.

A timeout is only useful if the code *does something* when it fires. The usual choices are to retry a small number of times, to report which device failed, and to stop the arm if the failure repeats.

### Communication Errors

**Communication errors** are the failures that a protocol can detect: no reply, a reply with a bad checksum, a reply from the wrong ID, a reply with a non-zero error byte, and a reply that is not a packet at all. Each has typical causes, and learning the pattern saves hours.

| What you see | Likely cause | First thing to try |
|---|---|---|
| No reply from any ID | Wrong port, no motor power, or wrong baud rate | Check the port name, the barrel-jack supply, and the jumpers on the board |
| Garbage bytes, no valid packets | Baud rate mismatch | Set the port to the motor's baud rate (1,000,000 by default) |
| Some IDs answer, others never do | A loose cable or a broken link in the daisy chain | Reseat the cable just before the first silent motor |
| Replies that are your own request | The adapter echoes what you send | Skip the echoed bytes, or ask how your adapter is set up |
| Two replies mixed together | Two motors share one ID | Disconnect all but one motor and give each a different ID |
| Occasional bad checksums | Electrical noise, a poor connection, or a missing common ground | Shorten the cable, reseat the plugs, and check the ground |

The next MicroSim turns the table into a troubleshooting exercise. It shows eight symptom reports from a real-looking bus session, and you choose the most likely cause for each.

#### Diagram: Bus Fault Finder

<iframe src="../../sims/bus-fault-finder/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Bus Fault Finder MicroSim fullscreen](../../sims/bus-fault-finder/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Bus Fault Finder</summary>
Type: microsim
**sim-id:** bus-fault-finder<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate six causes of serial bus failure by choosing the most likely cause for each of eight symptom reports, with at least 6 of 8 correct on the first attempt.

**Prerequisites:** baud rate, serial port, device ID, daisy chain wiring, bus scan, checksum, communication timeout, communication errors, common ground (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight symptom reports the learner chooses one of six causes and commits. A choice is correct when it matches the Cause column in Content. Mastery is 6 of 8 correct on the first attempt. Viewing the cause list and the packet traces in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Silence always means the motor is broken. (Silence is usually the port, the power or the baud rate.) (2) Garbage means the cable is bad. (It usually means a baud rate mismatch.) (3) A partial scan means a bad adapter. (It points to the chain.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to tell similar-looking cases apart by the evidence. Each report includes the scan result and the raw bytes, so the learner must separate causes by what the bytes show, not by the first guess.

**Content:**

The six causes: "Wrong port", "No motor power", "Baud rate mismatch", "Duplicate ID", "Broken chain link", "Noise or missing ground". Eight reports in this fixed order:

| # | Symptom report | Cause | Why (shown as feedback) |
|---|---|---|---|
| 1 | The program raises an error that the port `/dev/ttyACM1` does not exist. `list_ports` shows only `/dev/ttyACM0`. | Wrong port | The port named in the program is not the one the computer sees. |
| 2 | The port opens and the adapter is listed by the computer. A scan of IDs 1 to 6 returns nothing, and the barrel-jack supply is switched off. | No motor power | USB carries data only, and the motors need their own supply. |
| 3 | A scan of IDs 1 to 6 returns nothing. The bytes received after each ping are `00 FE 80 00 F8`, and the motors have power. The port is open at 115,200 baud. | Baud rate mismatch | The motors answer at 1,000,000 baud, so the reply is read as garbage. |
| 4 | A scan finds IDs 1, 2 and 3 only. IDs 4, 5 and 6 never answer, and a cable between motors 3 and 4 is half unplugged. | Broken chain link | Everything after the break is silent, and everything before it answers. |
| 5 | A ping to ID 2 sometimes gets a good reply and sometimes one that fails its checksum. Two motors are on the bus, and both are set to ID 2. | Duplicate ID | Two servos answered together and their replies overlapped. |
| 6 | Pings succeed, but about one read in five fails its checksum. The cable to the motors is long, and the controller and the motors run from different supplies whose grounds are not joined. | Noise or missing ground | Poor grounding and long wires corrupt bits at random. |
| 7 | A scan on `/dev/ttyACM0` returns nothing although the arm is powered. The follower's adapter is the second entry in `list_ports`, `/dev/ttyACM1`. | Wrong port | The script opened the other adapter's port. |
| 8 | All six motors stay silent. The supply's label reads 5 V, and the supply's plug is in the wall, but its barrel jack is not in the board. | No motor power | The supply is not connected to the board, so the motors have no power. |

**Provenance:** The symptoms are illustrative and written for this sim from the chapter's table of communication errors. The garbage bytes in report 3 are invented for illustration and are labeled "illustrative".

**Rules:** Each report has exactly one correct cause among the six. A choice is scored once and cannot be changed after it is committed.

**Learner Activity:**

1. In Explore mode the learner reads the six causes and the typical signs of each.
2. The learner switches to the reports. Report 1 is shown with its scan result and bytes.
3. The learner chooses one of the six causes and commits.
4. The sim shows whether the choice was correct, the Why text, and the evidence that decided it. After report 8 it shows the score.

**Feedback:** Eight reports, fixed order, one attempt each. Correct: "Correct: <cause>. <Why>". Incorrect: "Not quite. The most likely cause is <cause>. <Why>". The correct cause is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (6 of 8) was reached.

**Starting State:** Explore mode with the six causes listed and the prompt "Read the evidence, then choose the most likely cause."

**Chapter Anchors:** The chapter's error table lists the same kinds of symptoms (silence, garbage, partial replies, duplicate IDs, intermittent checksums). The sim has six causes and eight reports, and mastery is 6 of 8.
</details>

### Watchdog Timer

A **watchdog timer** is a countdown that your program must keep resetting. As long as the program is healthy it "feeds the watchdog" at regular intervals, and if the program freezes the countdown runs out and the watchdog triggers a safe action. It is the standard answer to the problem from Chapter 3, where a frozen program cannot send a stop command: the watchdog does not need the program to *act*, only to *stop acting*.

A watchdog can live in the motor or in your own code. Damiao's documentation for its motors, for example, describes a timeout protection: if the motor receives no CAN command within the configured interval, it enters protection mode. In your own code, a software watchdog stores the time of the last good command and checks it in each pass of the control loop:

```python linenums="1"
import time

TIMEOUT_S = 0.5
last_command_time = time.monotonic()      # a clock that never jumps backwards


def feed_watchdog():
    """Call this every time a fresh command arrives."""
    global last_command_time
    last_command_time = time.monotonic()


def watchdog_expired():
    """True when no command has arrived for TIMEOUT_S seconds."""
    return time.monotonic() - last_command_time > TIMEOUT_S
```

A software watchdog protects against a *stalled source of commands*, such as a leader arm that stopped sending, but it shares the weakness of every software stop: if the whole program freezes, the check never runs. A watchdog inside the motor or the controller board does not have that weakness, so use one in the motor when the motor offers it.

### Fail-Safe Behavior

**Fail-safe behavior** is what a system does by design when something goes wrong, chosen so that the failure is harmless. The question to ask is: *what should the arm do when the commands stop?* There are three common answers, and each has a cost.

| Behavior | What happens | Good for | Cost |
|---|---|---|---|
| Hold position | The motors keep holding the last position | Carrying a load, delicate tasks | An arm that was heading into an obstacle may keep pushing |
| Torque off | The motors release the joints | Stopping a harmful push | The arm can sag or fall (see the warning in Chapter 3) |
| Go home slowly | The arm moves to a safe pose at low speed | Open spaces | The motion itself is a risk if the cause was a loose cable |

There is no single best choice. A good habit is to decide it on purpose for each arm and write it down, test it with the arm unloaded, and check what the motor does *by itself* when the commands stop, because motors differ.

## CAN Bus

The reBot-DevArm's motors use a different bus. A **CAN bus** (Controller Area Network) connects devices with just two wires, called CAN_H and CAN_L, that carry a *difference* in voltage between them. It was designed for cars, where many small computers must talk reliably despite electrical noise, and the differential signalling makes it tolerant of that noise. CAN also differs from the serial bus in how it names things. A device on a CAN bus does not have an address in the packet. Instead, every message carries an *identifier* that labels what the message is about, and the devices decide which identifiers they care about. Any device may start a message when the bus is idle.

!!! mascot-thinking "CAN Labels the Message, Not the Reader"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    On the serial bus a packet says "this is for servo 3". On a CAN bus a frame says "this is message 0x03", and whoever cares about message 0x03 listens. A motor design then decides what each identifier means, so for the motors in this book the identifier works like an address.

### CAN Frame

A **CAN frame** is one message on the bus. A classical CAN frame carries an *identifier* (11 bits in the standard format, 29 bits in the extended one), a count of how many data bytes follow, and **up to 8 data bytes**. The bus hardware adds and checks the error-detecting fields for you, so your Python code only deals with the identifier and the data. When two devices start a frame at the same moment, the one with the *lower* identifier wins and goes on, and the other waits and tries again. That rule is called arbitration, and it means a lower number is a higher priority.

The reBot-DevArm's Damiao motors give each motor two identifiers. The documentation calls them the **CAN ID**, which is the identifier the motor *listens* to for commands, and the **Master ID**, which is the identifier the motor *uses* when it sends feedback. Its example sets motor 1 to CAN ID `0x01` and Master ID `0x11`, and it recommends choosing the Master ID higher than the CAN ID by `0x10`. Two special eight-byte commands turn the motor's drive on and off: seven bytes of `FF` followed by `FC` enables the motor, and seven bytes of `FF` followed by `FD` disables it. The table shows the pair of frames for motor 1.

| Direction | Identifier | Data bytes | Meaning |
|---|---|---|---|
| Computer to motor 1 | `0x01` | `FF FF FF FF FF FF FF FC` | Enable the motor |
| Computer to motor 1 | `0x01` | `FF FF FF FF FF FF FF FD` | Disable the motor |
| Motor 1 to computer | `0x11` | A feedback frame (layout in the motor's manual) | Position, speed and torque |

### CAN Bit Rate

The **CAN bit rate** is the CAN version of the baud rate: how many bits per second travel on the pair of wires. Every device on one bus must use the same bit rate, or each will see the other's frames as errors. The Seeed documentation for the Damiao 43 series motors sets the rate to 1,000,000 bits per second (1 Mbps). A standard frame with 8 data bytes is roughly 110 to 135 bits long, depending on how many extra bits the bus inserts, so each frame takes about 0.11 to 0.14 ms at 1 Mbps. A control cycle that sends one command to each of seven motors and receives seven replies needs 14 frames, or about 1.5 to 1.9 ms. That caps a loop at roughly 500 to 600 cycles per second, a rate that suits an arm.

### CAN Termination

**CAN termination** is a 120 Ω resistor connected between CAN_H and CAN_L at *each of the two physical ends* of the bus. Without them, the signal reflects off the open end of the wire and corrupts the frames that follow. Only the two ends get one, however many motors are in between.

Chapter 3's equations tell you how to test them. Two 120 Ω resistors that sit across the same two wires are in parallel, so the resistance between CAN_H and CAN_L is \( 1 / (1/120 + 1/120) = 60 \) Ω. With the power off, a meter across the two wires of a healthy bus should read about 60 Ω. The readings below point to the usual faults.

| Reading between CAN_H and CAN_L (power off) | What it means |
|---|---|
| About 60 Ω | Healthy: two terminators |
| About 120 Ω | One terminator is missing |
| Open (very large) | No terminators, or a wire is broken |
| About 40 Ω | An extra terminator: three 120 Ω in parallel |
| Near 0 Ω | A short circuit between the two wires |

!!! mascot-warning "Terminate Only the Two Ends"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    Three terminators is as wrong as none, and the meter shows it: 40 Ω instead of 60 Ω. Many adapters and motors have a built-in terminator you can switch on, so check which devices sit at the two ends of your bus, and switch on only those. Measure with the power off.

In the next MicroSim you read a resistance from a virtual meter across a CAN bus and say what it shows about the terminators. In Explore mode you can add and remove terminators and see the meter respond.

#### Diagram: CAN Termination Meter

<iframe src="../../sims/can-termination-meter/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the CAN Termination Meter MicroSim fullscreen](../../sims/can-termination-meter/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>CAN Termination Meter</summary>
Type: microsim
**sim-id:** can-termination-meter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer the state of a CAN bus's termination from the resistance a meter reads between CAN_H and CAN_L, in six readings, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** CAN bus, CAN_H and CAN_L, CAN termination, resistance, parallel resistors, Ohm's law (all defined in the sections above this block and in Chapter 3).

**Evidence of Mastery:** For each of six meter readings the learner chooses one of five diagnoses and commits. A choice is correct when it matches the Diagnosis column in Content. Mastery is 5 of 6 correct on the first attempt. Adding and removing terminators in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every motor on the bus needs its own terminator. (Only the two ends do.) (2) The reading should be 120 Ω. (Two in parallel give 60 Ω.) (3) More terminators are safer. (Three give 40 Ω and load the bus.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from evidence to a state. The meter reading is the evidence, and the parallel-resistor rule from Chapter 3 is the reasoning, so the learner must apply it to the numbers.

**Content:**

The diagram shows a CAN bus with two ends and up to three terminator positions (the two ends and one in the middle that should be empty). A virtual meter with power off shows the resistance between CAN_H and CAN_L. Each terminator is 120 Ω, and the meter reading is the parallel combination of the terminators present. A broken wire gives an open reading and a short gives a near-zero reading.

The five diagnoses: "Healthy: two terminators", "One terminator missing", "No terminators or a broken wire", "Extra terminator", "Short circuit". Six readings in this fixed order:

| # | Meter reading | Diagnosis | Why (shown as feedback) |
|---|---|---|---|
| 1 | 60 Ω | Healthy: two terminators | Two 120 Ω resistors in parallel give 60 Ω. |
| 2 | 120 Ω | One terminator missing | One 120 Ω resistor alone reads 120 Ω. |
| 3 | Open (over 1 MΩ) | No terminators or a broken wire | With no resistor connected, the meter sees an open circuit. |
| 4 | 40 Ω | Extra terminator | Three 120 Ω resistors in parallel give 120 / 3 = 40 Ω. |
| 5 | 0.3 Ω | Short circuit | A reading near 0 Ω means CAN_H touches CAN_L. |
| 6 | 62 Ω | Healthy: two terminators | The meter and resistors have tolerances, so 62 Ω is within the healthy band. |

**Provenance:** The readings are illustrative values written for this sim. The 120 Ω terminator value, the 60 Ω healthy reading and the parallel-resistor rule are from the chapter section "CAN Termination".

**Rules:** For n terminators of 120 Ω in parallel, R = 120 / n. Healthy is 54 Ω <= R <= 66 Ω. One missing is 108 Ω <= R <= 132 Ω. Extra is 36 Ω <= R <= 44 Ω. Short is R < 5 Ω. Open is R > 1 MΩ. In Explore mode the learner can switch each of three terminator positions on or off, and can add a broken-wire or short fault, and the meter shows the resulting resistance.

**Learner Activity:**

1. In Explore mode the learner toggles the terminators and watches the meter. The learner should notice 60 Ω with two, 120 Ω with one and 40 Ω with three.
2. The learner switches to the six readings. Reading 1 is shown on the meter.
3. The learner chooses a diagnosis and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After reading 6 it shows the score.

**Feedback:** Six readings, fixed order, one attempt each. Correct: "Correct: <diagnosis>. <Why>". Incorrect: "Not quite. A reading of <value> means <diagnosis>. <Why>". The correct diagnosis is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the two end terminators on, the middle one off, and the meter reading 60 Ω.

**Chapter Anchors:** The chapter states that a healthy bus reads 60 Ω, that one terminator missing reads 120 Ω, that three read 40 Ω, and that the terminator value is 120 Ω. The sim has six readings and mastery is 5 of 6.
</details>

### CAN Adapter

A computer has no CAN wires, so a **CAN adapter** (often called a USB-to-CAN interface) sits between the computer's USB port and the two CAN wires, just as the serial adapter did for the servo bus. The reBot-DevArm's parts list includes a "CAN-USB driver board" at about $15 in its public bill of materials. You connect CAN_H on the adapter to CAN_H on the motors, CAN_L to CAN_L, and a ground wire between them, using the common-ground idea of Chapter 3. Many adapters can switch a 120 Ω terminator on or off, so check what yours does before you count terminators.

How the operating system sees the adapter depends on the adapter and the computer. On Linux, many adapters appear as a network-style interface, such as `can0`, through a feature called SocketCAN, and you set the bit rate with one command before using it:

```bash
sudo ip link set can0 up type can bitrate 1000000
```

Other adapters, and other operating systems, are handled by a different *interface* inside python-can, so follow the instructions for the adapter you bought.

### Python-CAN Library

The **python-can library** gives Python one way to use many different adapters. You install it with `python -m pip install python-can`. Its main pieces are a `can.Bus`, which represents your connection to the bus, and a `can.Message`, which represents one frame, with an `arbitration_id` (the identifier), `data` (up to 8 bytes) and `is_extended_id` (whether the identifier is 29 bits). You send with `bus.send(message)` and receive with `bus.recv(timeout)`. The call waits up to `timeout` seconds and returns `None` if no frame arrived, so the timeout lesson from the serial section applies again. A `with` statement shuts the bus down for you, and the errors the library raises are all subclasses of `CanError`.

```python linenums="1"
import can

ENABLE = bytes([0xFF] * 7 + [0xFC])

# For a Linux SocketCAN adapter that was brought up as can0 (see the previous section).
with can.Bus(interface="socketcan", channel="can0") as bus:
    bus.send(can.Message(arbitration_id=0x01, data=ENABLE, is_extended_id=False))
    reply = bus.recv(timeout=0.2)          # None if nothing answered
    if reply is None:
        print("no reply: check power, wiring, termination and the bit rate")
    else:
        print(f"reply from 0x{reply.arbitration_id:02X}: {reply.data.hex(' ')}")
```

!!! mascot-tip "Always Give recv a Timeout"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A bare `bus.recv()` waits forever, and a program that hangs while a motor is enabled is exactly the failure Chapter 3 warned about. Write `recv(timeout=0.2)` every time and handle the `None` that comes back.

Python-can also includes a **virtual** interface that connects buses *inside one Python program*. Two `Bus` objects on the same virtual channel hear each other, with no adapter and no wires, which makes it the CAN version of the pretend servo bus. The lab uses it. The real reBot-DevArm control code is provided by its own libraries, which are a vendor SDK in the sense of the earlier section: the project names a Python SDK called Motorbridge and a control library called `reBotArm_control_py`, and Seeed's Damiao guide uses a call of the form `controlMIT(motor, kp, kd, q, dq, tau)` for position, speed and torque control.

!!! mascot-neutral "Where the Motors Come Together"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    This chapter only moves bytes. Chapter 5 explains what the registers and the control modes actually do to a motor, Chapter 9 builds the reBot-DevArm, and Chapter 10 wraps both buses in one Python class.

## Lab: Talk to a Pretend Bus

In this lab you will build a packet toolkit for the servo bus, test it against a pretend bus, and then use the same logic with python-can's virtual bus. Nothing in the first six steps touches hardware, so everything runs on any computer. The last step is an optional, read-only check on a real servo bus. You will extend the `arm-lab` project from Chapters 1 to 3.

**Step 1. Activate the project and install python-can.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
python -m pip install python-can
python -m pip freeze > requirements.txt
git status
```

You installed pyserial in Chapter 1. The freeze command records both libraries.

**Step 2. Write the packet module.** It holds the constants and six functions from the chapter. `checksum` and `build_packet` make an instruction packet, and `ping_packet`, `read_packet` and `write_packet` fill in the common cases by *register name*, using the `REGISTERS` table of addresses and sizes. `parse_status` checks the header, the length and the checksum of a reply, and returns the ID, the error byte and the data, or raises a `ValueError` that says what was wrong. `scan` pings a list of IDs through any function that sends a packet and returns the reply, which is what lets the same code work with a pretend bus and a real one. Create `armlab/packets.py`:

```python linenums="1"
"""Build and read packets for Feetech STS serial bus servos (protocol 0)."""

HEADER = b"\xff\xff"
PING, READ, WRITE = 0x01, 0x02, 0x03

# Register name -> (address, size in bytes), from the STS3215 control table.
REGISTERS = {
    "ID": (5, 1),
    "Baud_Rate": (6, 1),
    "Torque_Enable": (40, 1),
    "Goal_Position": (42, 2),
    "Present_Position": (56, 2),
    "Present_Voltage": (62, 1),
    "Present_Temperature": (63, 1),
}


def checksum(body):
    """Return the checksum byte: the bitwise NOT of the low byte of the sum."""
    return ~sum(body) & 0xFF


def build_packet(servo_id, instruction, params=b""):
    """Return an instruction packet as bytes."""
    body = bytes([servo_id, len(params) + 2, instruction]) + bytes(params)
    return HEADER + body + bytes([checksum(body)])


def ping_packet(servo_id):
    return build_packet(servo_id, PING)


def read_packet(servo_id, name):
    address, size = REGISTERS[name]
    return build_packet(servo_id, READ, bytes([address, size]))


def write_packet(servo_id, name, value):
    address, size = REGISTERS[name]
    return build_packet(servo_id, WRITE, bytes([address]) + value.to_bytes(size, "little"))


def parse_status(raw):
    """Return (servo_id, error, data) from a status packet, or raise ValueError."""
    if len(raw) < 6 or raw[:2] != HEADER:
        raise ValueError(f"not a status packet: {raw.hex(' ')}")
    servo_id, length = raw[2], raw[3]
    if len(raw) != length + 4:
        raise ValueError(f"wrong length: {raw.hex(' ')}")
    if raw[-1] != checksum(raw[2:-1]):
        raise ValueError(f"bad checksum: {raw.hex(' ')}")
    return servo_id, raw[4], raw[5:-1]


def scan(send, ids=range(1, 11)):
    """Ping every ID in ids and return the ones that answered.

    Args:
        send: A function that takes a packet (bytes) and returns the reply
            bytes, or b"" if nothing answered.
        ids: The device IDs to try.
    """
    found = []
    for servo_id in ids:
        reply = send(ping_packet(servo_id))
        if reply:
            try:
                parse_status(reply)
            except ValueError:
                continue
            found.append(servo_id)
    return found
```

**Step 3. Write the pretend bus.** `make_servos` creates a dictionary that maps each ID to a 90-byte `bytearray` that plays the servo's memory, with a position of 2048 steps, a voltage of 7.3 V and a temperature of 31 °C filled in at the addresses of the register table. `fake_bus` takes a request packet and returns the reply a real bus would give: nothing for a damaged packet or an unknown ID, a plain status packet for a PING, the requested bytes for a READ, and for a WRITE it changes the memory and then answers. Create `armlab/fakebus.py`:

```python linenums="1"
"""A pretend servo bus, so packet code can be tested with no hardware."""

from armlab.packets import HEADER, PING, READ, WRITE, checksum


def make_servos(ids):
    """Return {id: memory} with a 90-byte memory block for each fake servo."""
    servos = {}
    for servo_id in ids:
        memory = bytearray(90)
        memory[5] = servo_id                          # ID
        memory[56:58] = (2048).to_bytes(2, "little")  # Present_Position: halfway
        memory[62] = 73                               # Present_Voltage: 7.3 V
        memory[63] = 31                               # Present_Temperature: 31 C
        servos[servo_id] = memory
    return servos


def build_status(servo_id, data=b"", error=0):
    body = bytes([servo_id, len(data) + 2, error]) + bytes(data)
    return HEADER + body + bytes([checksum(body)])


def fake_bus(servos, request):
    """Return the reply a real bus would give to a request, or b"" for none."""
    if len(request) < 6 or request[-1] != checksum(request[2:-1]):
        return b""                                    # servos ignore bad packets
    servo_id, instruction, params = request[2], request[4], request[5:-1]
    if servo_id not in servos:
        return b""                                    # nobody has this ID
    memory = servos[servo_id]
    if instruction == PING:
        return build_status(servo_id)
    if instruction == READ:
        address, size = params
        return build_status(servo_id, memory[address:address + size])
    if instruction == WRITE:
        address, data = params[0], params[1:]
        memory[address:address + len(data)] = data
        return build_status(servo_id)
    return b""
```

**Step 4. Write the demo script.** The script gives the pretend bus five servos with IDs 1, 2, 3, 5 and 6, so servo 4 is "unplugged". It pings servo 1, reads its position, writes a new goal position, scans IDs 1 to 8, and finally damages one reply in transit to show `parse_status` rejecting it. The inner function `send` is the one-argument function that `scan` expects. Create `bus_demo.py`:

```python linenums="1"
"""Talk to a pretend servo bus: ping, read, write, scan, and catch a bad packet."""

from armlab.fakebus import fake_bus, make_servos
from armlab.packets import (parse_status, ping_packet, read_packet, scan,
                            write_packet)

servos = make_servos([1, 2, 3, 5, 6])      # servo 4 is "unplugged"


def send(packet):
    return fake_bus(servos, packet)


print("1. Ping servo 1")
request = ping_packet(1)
reply = send(request)
print(f"   request {request.hex(' ')}   reply {reply.hex(' ')}")
print(f"   parsed  {parse_status(reply)}")

print("2. Read servo 1 position")
request = read_packet(1, "Present_Position")
reply = send(request)
_, error, data = parse_status(reply)
ticks = int.from_bytes(data, "little")
print(f"   request {request.hex(' ')}   reply {reply.hex(' ')}")
print(f"   {ticks} ticks = {ticks / 4096 * 360:.1f} degrees")

print("3. Write servo 1 goal position")
request = write_packet(1, "Goal_Position", 1024)
send(request)
print(f"   request {request.hex(' ')}")
print(f"   memory at address 42: {servos[1][42:44].hex(' ')}")

print("4. Scan IDs 1 to 8")
print(f"   found {scan(send, range(1, 9))}")

print("5. A corrupted reply")
bad = bytearray(send(ping_packet(2)))
bad[4] = 0x20                              # flip the error byte in transit
try:
    parse_status(bytes(bad))
except ValueError as problem:
    print(f"   rejected: {problem}")
```

**Step 5. Run it.**

```bash
python bus_demo.py
```

```text
1. Ping servo 1
   request ff ff 01 02 01 fb   reply ff ff 01 02 00 fc
   parsed  (1, 0, b'')
2. Read servo 1 position
   request ff ff 01 04 02 38 02 be   reply ff ff 01 04 00 00 08 f2
   2048 ticks = 180.0 degrees
3. Write servo 1 goal position
   request ff ff 01 05 03 2a 00 04 c8
   memory at address 42: 00 04
4. Scan IDs 1 to 8
   found [1, 2, 3, 5, 6]
5. A corrupted reply
   rejected: bad checksum: ff ff 02 02 20 fb
```

The first request and the position request are exactly the packets from the chapter, and `ff ff 01 04 00 00 08 f2` is the pretend servo's answer for 2048 steps (`00 08` in little-endian order). The scan finds five servos and shows that ID 4 is missing, which is the signature of a loose cable. The last line shows the checksum check at work: changing one byte makes the old checksum wrong.

**Step 6. Do the same with CAN.** The script below creates two buses on one virtual channel. One is the "host", and the other plays the motor. The function `fake_motor_step` listens for one frame and, if it was sent to the motor's CAN ID `0x01`, answers from the Master ID `0x11` with a copy of the data. A real motor answers with a feedback frame whose layout is in its manual, so this lab simply echoes the command so that you can see the round trip. The third frame goes to ID `0x05`, which no motor owns, so nobody answers and the host's `recv` times out. Create `can_demo.py`:

```python linenums="1"
"""A pretend CAN bus: a host and a fake motor talk through python-can's virtual bus."""

import can

CAN_ID, MASTER_ID = 0x01, 0x11            # the host sends to CAN_ID, the motor answers from MASTER_ID
ENABLE = bytes([0xFF] * 7 + [0xFC])
DISABLE = bytes([0xFF] * 7 + [0xFD])


def fake_motor_step(bus):
    """Handle one frame: echo the command back from MASTER_ID if it was meant for us."""
    frame = bus.recv(timeout=0.5)
    if frame is not None and frame.arbitration_id == CAN_ID:
        bus.send(can.Message(arbitration_id=MASTER_ID, data=frame.data, is_extended_id=False))


with can.Bus(channel="arm", interface="virtual") as host, \
        can.Bus(channel="arm", interface="virtual") as motor:
    for label, data, target in [("enable", ENABLE, CAN_ID),
                                ("disable", DISABLE, CAN_ID),
                                ("enable motor 5", ENABLE, 0x05)]:
        host.send(can.Message(arbitration_id=target, data=data, is_extended_id=False))
        fake_motor_step(motor)
        reply = host.recv(timeout=0.2)
        if reply is None:
            print(f"{label:<15} sent to 0x{target:02X}  -> no reply (timeout)")
        else:
            print(f"{label:<15} sent to 0x{target:02X}  -> reply from 0x{reply.arbitration_id:02X}: "
                  f"{reply.data.hex(' ')}")
```

```bash
python can_demo.py
```

```text
enable          sent to 0x01  -> reply from 0x11: ff ff ff ff ff ff ff fc
disable         sent to 0x01  -> reply from 0x11: ff ff ff ff ff ff ff fd
enable motor 5  sent to 0x05  -> no reply (timeout)
```

**Step 7 (optional, with a real SO-ARM101). Read from the real bus.** Do this step only after the power-up checks from Chapter 3, with an adult present for the first power-up and the arm resting at home. Nothing below writes to a servo, so no joint will move. First find the adapter's port using the unplug trick. Create `find_port.py`:

```python linenums="1"
"""Find the serial port of one adapter by unplugging it, the way lerobot-find-port does."""

from serial.tools import list_ports


def port_names():
    return {port.device for port in list_ports.comports()}


before = port_names()
input("Press Enter, then unplug the adapter's USB cable... ")
input("Press Enter once the cable is unplugged. ")
gone = before - port_names()
if len(gone) == 1:
    print(f"Your adapter is {gone.pop()}")
else:
    print(f"Could not tell: {len(gone)} ports vanished. Ports before: {sorted(before)}")
```

Then create `read_servo.py`. The inner `send` writes a packet, clears any stale input first, and reads as many bytes as the reply should have, and `reply_size` is 6 for a ping and 6 plus the data size for a read. It uses the same `scan`, `read_packet` and `parse_status` as the pretend bus, which is the payoff for designing `scan` around a `send` function.

```python linenums="1"
"""Read-only check of a real servo bus: ping, then read position, voltage and temperature."""

import argparse

import serial

from armlab.packets import parse_status, ping_packet, read_packet, scan


def main():
    parser = argparse.ArgumentParser(description="Read-only check of a servo bus.")
    parser.add_argument("--port", required=True, help="serial port, such as /dev/ttyACM0 or COM3")
    parser.add_argument("--baud", type=int, default=1_000_000)
    parser.add_argument("--ids", type=int, default=10, help="scan IDs 1 up to this number")
    args = parser.parse_args()

    with serial.Serial(args.port, args.baud, timeout=0.1) as ser:

        def send(packet, reply_size=6):
            """Send a packet and return the reply bytes (b"" if none arrived in time)."""
            ser.reset_input_buffer()
            ser.write(packet)
            return ser.read(reply_size)

        found = scan(send, range(1, args.ids + 1))
        print(f"Servos that answered: {found}")
        for servo_id in found:
            _, _, data = parse_status(send(read_packet(servo_id, "Present_Position"), 8))
            ticks = int.from_bytes(data, "little")
            _, _, data = parse_status(send(read_packet(servo_id, "Present_Voltage"), 7))
            _, _, temp = parse_status(send(read_packet(servo_id, "Present_Temperature"), 7))
            print(f"  ID {servo_id}: {ticks / 4096 * 360:6.1f} degrees, "
                  f"{data[0] / 10:.1f} V, {temp[0]} C")


if __name__ == "__main__":
    main()
```

```bash
python find_port.py
python read_servo.py --port /dev/ttyACM0
```

Your output will differ with your arm. A healthy follower reports six servos, with positions in degrees, a voltage a little below the supply voltage (because of the drop in the wires from Chapter 3), and a temperature near the room's. If it reports fewer, read the table of communication errors and add motors back one at a time. If the reply seems to start with your own request bytes, your adapter echoes what you send; compare the length of the reply with `reply_size` and ask the adapter's documentation how to turn the echo off.

**Step 8. Record your work.**

```bash
git add .
git commit -m "Add servo packet toolkit, pretend bus, and CAN demo"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python bus_demo.py` prints `found [1, 2, 3, 5, 6]` and rejects the corrupted reply.
- `python can_demo.py` prints two replies from `0x11` and one timeout.
- The packet `ff ff 01 04 02 38 02 be` appears in the output of step 2.
- `requirements.txt` lists both `pyserial` and `python-can`.
- `git log --oneline` shows a fourth commit.

### Challenge: Read All the Positions

Add a function `read_positions(send, ids)` to `armlab/packets.py`. It should return a dictionary that maps each ID to its position in degrees, using `read_packet` and `parse_status`, and it should skip any ID that does not answer. Test it on the pretend bus with `scan` first, then change one servo's memory with `servos[3][56:58] = (1024).to_bytes(2, "little")` and confirm that servo 3 now reads 90.0 degrees.

??? note "Click to see one solution"
    Add this function to `armlab/packets.py`. The reply to a two-byte read is 8 bytes long, and `send` hides the details of getting it:

    ```python linenums="1"
    def read_positions(send, ids):
        """Return {id: position in degrees} for every servo in ids that answers."""
        positions = {}
        for servo_id in ids:
            reply = send(read_packet(servo_id, "Present_Position"))
            if not reply:
                continue                       # nobody answered: skip this ID
            _, _, data = parse_status(reply)
            ticks = int.from_bytes(data, "little")
            positions[servo_id] = round(ticks / 4096 * 360, 1)
        return positions
    ```

    Try it at the bottom of `bus_demo.py`:

    ```python linenums="1"
    servos[3][56:58] = (1024).to_bytes(2, "little")
    print(read_positions(send, [1, 2, 3, 4, 5, 6]))
    ```

    It prints `{1: 180.0, 2: 180.0, 3: 90.0, 5: 180.0, 6: 180.0}`. ID 4 is skipped because the pretend bus returns `b""` for it. With a real bus the reply to this read is 8 bytes, so you would call `send(packet, 8)`, as `read_servo.py` does. Give the pretend `send` the same optional second argument (`def send(packet, reply_size=None)`) to use one function for both.

## Summary and Key Takeaways

You can now speak to a motor in bytes, and you have a toolkit that works on a pretend bus and a real one.

- A **bus** is a shared set of wires. **Serial communication** sends bits one at a time, and a **UART** turns bytes into bits using a **baud rate** that both ends must share. With 8N1 framing, a byte takes 10 bits, so the time is bytes × 10 / baud.
- The STS3215 servos use **TTL half-duplex serial** on a **daisy chain**, with a **USB serial adapter** and a **serial port** to reach the computer, and the **pyserial library** to use the port from Python.
- **Bytes and bytearray** hold raw data, **hexadecimal** shows it, **little-endian byte order** puts the low byte first, the **struct module** and **bit operations** unpack it.
- A **packet** has a header, a **device ID**, a length, an instruction or error byte, parameters or data, and a **checksum**. The computer sends an **instruction packet**, and the servo answers with a **status packet**. A **ping command** tests whether a device is there, and a **bus scan** pings every ID.
- A **register map** lists a motor's memory. **Reading a register** and **writing a register** are the two operations that make up almost all motor control. Writes to the ID and baud-rate registers are permanent. A **vendor SDK** such as Feetech's, and LeRobot on top of it, hide the packets.
- **Communication timeouts** stop a program from waiting forever. **Communication errors** have recognisable patterns. A **watchdog timer** triggers a safe action when commands stop, and **fail-safe behavior** decides in advance what that action is.
- A **CAN bus** has two wires and labels each **CAN frame** with an identifier. All devices share one **CAN bit rate** (1 Mbps for the Damiao motors) and the bus needs **CAN termination**: 120 Ω at each of its two ends, which reads 60 Ω across a healthy bus. A **CAN adapter** connects the bus to USB, and the **python-can library** sends and receives frames, with a virtual bus for testing.

!!! mascot-celebration "You Can Talk to My Motors!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just built a packet by hand, checked a reply byte by byte, scanned a bus, and sent CAN frames with a timeout, all in Python. That is the lowest layer of everything the rest of the book builds on. Let's move it on to Chapter 5!

### Self-Check Questions

Test yourself before you move on. Click each question to reveal an answer.

??? question "1. Write the bytes of a PING packet for servo 2, including the checksum."
    The header is `FF FF`, the ID is `02`, the length is `02` and the instruction is `01`. The sum of `02 02 01` is 5, and the bitwise NOT of `0x05` is `0xFA`, so the packet is `FF FF 02 02 01 FA`.

??? question "2. A servo answers `FF FF 01 04 00 E8 03 0F` to a position read. Is the reply valid, and what position does it report?"
    Header, length and checksum all check out: the sum of `01 04 00 E8 03` is `0xF0`, and its bitwise NOT is `0x0F`. The error byte is 0. The data `E8 03` in little-endian order is `0x03E8`, which is 1000 steps, or \( 1000 / 4096 \times 360 \approx 87.9 \) degrees.

??? question "3. A scan of IDs 1 to 6 finds servos 1, 2 and 3 only, and every motor has power. What is the most likely cause, and where do you look first?"
    A broken link in the daisy chain, between servo 3 and servo 4. Everything before the break answers and everything after it is silent. Reseat the cable between those two motors. Duplicate IDs and a wrong baud rate would not produce this pattern.

??? question "4. Why does `ser.read(6)` need a timeout, and what should the program do when it returns `b""`?"
    Without a timeout, `read` waits until six bytes arrive, so an unplugged or unpowered servo makes the program hang. With a timeout, the call returns what arrived, and an empty result means no reply. The program should retry a small number of times, report which device failed, and stop the arm if the failure repeats.

??? question "5. A meter across CAN_H and CAN_L on the powered-off reBot bus reads 120 Ω. What is wrong, and why is the number 120?"
    One of the two 120 Ω terminators is missing, so the meter sees a single 120 Ω resistor. With both present, the two resistors are in parallel and give \( 1 / (1/120 + 1/120) = 60 \) Ω.

??? question "6. A software watchdog and a watchdog inside the motor both stop the arm when commands stop. Why is the one inside the motor stronger?"
    The software watchdog runs in your program, so if the whole program or the computer freezes, the check never runs, which is the weakness of every software stop in Chapter 3. The watchdog in the motor counts the silence itself and needs nothing from your computer to trigger.

In Chapter 5 you will look inside the motors that these packets control, and learn how a joint holds a position and how to set limits that keep it safe.

[See Annotated References](./references.md)
