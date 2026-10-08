---
title: "Packet Checksum Calculator"
description: "The learner will calculate the checksum byte of six instruction packets from their ID, instruction and parameters, with at least 5 of 6 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# Packet Checksum Calculator



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md).

```text
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
```

## Related Resources

- [Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md)
