---
title: "Bus Fault Finder"
description: "The learner will differentiate six causes of serial bus failure by choosing the most likely cause for each of eight symptom reports, with at least 6 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Analyze
---

# Bus Fault Finder



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md).

```text
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
```

## Related Resources

- [Chapter 4: Serial and CAN Communication](../../chapters/04-serial-and-can-communication/index.md)
