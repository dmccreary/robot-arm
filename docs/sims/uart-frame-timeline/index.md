---
title: "UART Frame Timeline"
description: "The learner will calculate the time to send a given number of bytes at a given baud rate using 8N1 framing, to within 1 percent, in five problems, with at least 4 of 5 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Apply
---

# UART Frame Timeline



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md).

```text
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
```

## Related Resources

- [Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md)
