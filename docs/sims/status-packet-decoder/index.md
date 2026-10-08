---
title: "Status Packet Decoder"
description: "The learner will classify six reply packets as a valid reading, a bad checksum, a servo-reported error or not a packet, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Status Packet Decoder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md).

```text
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
```

## Related Resources

- [Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md)
