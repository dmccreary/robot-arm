# Quiz: Serial and CAN Communication

Test your understanding of baud rates, packets, checksums, registers, timeouts, and CAN buses with these review questions.

---

#### 1. What does the baud rate of a serial link specify?

<div class="upper-alpha" markdown>
1. The number of bytes in each packet
2. The number of devices that can share the bus
3. The number of bits per second on the wire, which both ends must use
4. The voltage swing of the logic signals
</div>

??? question "Show Answer"
    The correct answer is **C**. A UART has no shared clock wire, so both ends agree in advance on the speed, and that speed is the baud rate in bits per second. For the STS3215 servos the factory setting is 1,000,000 baud. If the two ends disagree, the receiver samples the wire at the wrong moments and reads garbage, even though every wire is connected correctly.

    **Concept Tested:** Baud Rate

    **See:** [UART and Baud Rate](index.md#uart-and-baud-rate)

---

#### 2. With 8N1 framing at 500,000 baud, how long does it take to send an 8-byte packet?

<div class="upper-alpha" markdown>
1. 16 µs
2. 160 µs
3. 128 µs
4. 1.6 ms
</div>

??? question "Show Answer"
    The correct answer is **B**. Each byte travels as ten bits on the wire: a start bit, 8 data bits, and a stop bit. The time is bytes × 10 / baud, so 8 × 10 / 500,000 = 160 µs. Option C counts only the 64 data bits and forgets the start and stop bits. Options A and D are off by a factor of ten because of slips in the arithmetic.

    **Concept Tested:** UART

    **See:** [UART and Baud Rate](index.md#uart-and-baud-rate)

---

#### 3. A servo answers a position read with the data bytes `E8 03`. The Feetech motors use little-endian order. What position does the servo report?

<div class="upper-alpha" markdown>
1. 59,395 steps
2. 232 steps
3. 1,512 steps
4. 1,000 steps
</div>

??? question "Show Answer"
    The correct answer is **D**. Little-endian order puts the low byte first, so `E8 03` is read as `0x03E8`, which is 1,000 steps. In Python, `int.from_bytes(data, "little")` does the conversion. Option A reads the bytes in the wrong order as `0xE803`, and option B keeps only the first byte. At 4096 steps per turn, 1,000 steps is about 87.9 degrees.

    **Concept Tested:** Little-Endian Byte Order

    **See:** [Bytes in Python](index.md#bytes-in-python)

---

#### 4. What is the checksum byte of a PING instruction packet for servo 3, whose bytes after the header are ID `03`, length `02`, and instruction `01`?

<div class="upper-alpha" markdown>
1. `0xF9`
2. `0xFA`
3. `0x06`
4. `0x03`
</div>

??? question "Show Answer"
    The correct answer is **A**. The checksum adds the bytes from the ID through the last parameter, keeps the low byte of the sum, and flips every bit. Here 3 + 2 + 1 = 6, and the bitwise NOT of `0x06` is `0xF9`. In Python that is `~sum(body) & 0xFF`. Option B is the checksum for servo 2, option C forgets to flip the bits, and option D is just the ID.

    **Concept Tested:** Checksum

    **See:** [Checksum](index.md#checksum)

---

#### 5. Which device ID is the broadcast ID on an STS3215 bus, meaning "everyone"?

<div class="upper-alpha" markdown>
1. 0
2. 1
3. 255
4. 254 (`0xFE`)
</div>

??? question "Show Answer"
    The correct answer is **D**. Device IDs for the STS3215 run from 0 to 253, and the value 254 (`0xFE`) is reserved as the broadcast ID. Because every motor hears every packet on the shared data wire, the ID is the only thing that tells them apart, so each servo needs a unique value. A brand-new motor usually ships with ID 1, which is why setup connects the motors one at a time.

    **Concept Tested:** Device ID

    **See:** [Device ID](index.md#device-id)

---

#### 6. Why does the chapter warn you never to write the `ID` or `Baud_Rate` register of a motor you have not read first?

<div class="upper-alpha" markdown>
1. Writes to those registers are slow and block the bus for several seconds
2. They are saved permanently, and a baud rate your adapter does not use makes the servo seem to vanish
3. A WRITE instruction only works after a READ has been sent to the same register
4. Writing them makes the joint move to its limit
</div>

??? question "Show Answer"
    The correct answer is **B**. The `ID` and `Baud_Rate` registers are stored in non-volatile memory, so the new value survives a power cycle. A servo set to a baud rate your adapter does not use stops answering. The safe habit is to read first, change one register at a time, and write down the old value so that you can restore it. Writing `Goal_Position`, not these registers, is what moves a joint.

    **Concept Tested:** Writing a Register

    **See:** [Writing a Register](index.md#writing-a-register)

---

#### 7. Your program opens the port with power on, but every reply from every servo is garbage with no valid headers or checksums. Which cause best explains this symptom?

<div class="upper-alpha" markdown>
1. Two motors share one device ID
2. The daisy chain has a broken link in the middle
3. The port's baud rate differs from the motors' baud rate
4. One of the CAN terminators is missing
</div>

??? question "Show Answer"
    The correct answer is **C**. When the two ends disagree about the baud rate, the receiver samples the wire at the wrong moments, so every byte is misread even though the wiring is perfect. A broken link would silence only the motors beyond it, and a shared ID would give mixed replies from one ID. CAN termination applies to the reBot's CAN bus, not to the serial bus. The fix is to set the port to the motor's rate, 1,000,000 by default.

    **Concept Tested:** Communication Errors

    **See:** [Communication Errors](index.md#communication-errors)

---

#### 8. With the power off, a meter across CAN_H and CAN_L reads about 40 Ω. What does this tell you?

<div class="upper-alpha" markdown>
1. There is an extra terminator, because three 120 Ω resistors in parallel give 40 Ω
2. One terminator is missing, because a single 120 Ω resistor gives 40 Ω
3. The bus is healthy, because two terminators give 40 Ω
4. A short circuit joins the two wires
</div>

??? question "Show Answer"
    The correct answer is **A**. A healthy CAN bus has a 120 Ω terminator at each of its two ends. Two in parallel read 60 Ω. Three 120 Ω resistors in parallel give 40 Ω, which means an extra terminator is switched on somewhere. One missing terminator would read about 120 Ω, and a short circuit would read near 0 Ω. Switch on terminators only at the two physical ends of the bus.

    **Concept Tested:** CAN Termination

    **See:** [CAN Termination](index.md#can-termination)

---

#### 9. What does `bus.recv(timeout=0.2)` return in python-can if no frame arrives within 0.2 seconds?

<div class="upper-alpha" markdown>
1. An empty bytes object, `b""`
2. A `can.Message` with all data bytes set to zero
3. `None`
4. It never returns, because `recv` always waits for a frame
</div>

??? question "Show Answer"
    The correct answer is **C**. With a timeout, `recv` waits up to that many seconds and returns `None` if nothing arrived, so your code must handle the `None`. A bare `bus.recv()` with no timeout waits forever, and a program that hangs while a motor is enabled is exactly the failure Chapter 3 warned about. The empty `b""` result belongs to pyserial's `read`, not to python-can.

    **Concept Tested:** Python-CAN Library

    **See:** [Python-CAN Library](index.md#python-can-library)

---

#### 10. On a CAN bus, what does the identifier carried in each frame label?

<div class="upper-alpha" markdown>
1. The message itself, so devices decide which identifiers they care about
2. The reader of the message, as an address that only one device may use
3. The baud rate at which the frame was sent
4. The number of data bytes that follow in the frame
</div>

??? question "Show Answer"
    The correct answer is **A**. A CAN frame says what the message is about, and every device decides which identifiers it listens for. The serial bus differs, because its packet names the servo it is for. For the reBot's Damiao motors the identifier works like an address, since each motor listens to its CAN ID and replies from its Master ID. A lower identifier wins arbitration, so a lower number means a higher priority.

    **Concept Tested:** CAN Frame

    **See:** [CAN Bus](index.md#can-bus)
