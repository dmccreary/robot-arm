# Quiz: Electricity, Power, and Safety Basics

Test your understanding of voltage, current, wire and fuse selection, power budgets, emergency stops, and safe operation with these review questions.

---

#### 1. How should an ammeter be connected to measure the current in a circuit?

<div class="upper-alpha" markdown>
1. Across the part, touching the two points you want to compare
2. In series, by breaking the loop and placing the meter in the gap
3. Directly across the supply terminals
4. In parallel with the fuse
</div>

??? question "Show Answer"
    The correct answer is **B**. An ammeter must sit in series so that all of the current passes through it, which means you break the loop and put the meter in the gap. A voltmeter goes across a part. The chapter's rhyme is "amps go through, volts go across." Connecting an ammeter straight across a supply gives the current an almost empty path and can blow the meter's fuse or damage the meter.

    **Concept Tested:** Current

    **See:** [Current](index.md#current)

---

#### 2. In the American Wire Gauge (AWG) system, what does a larger gauge number tell you about a wire?

<div class="upper-alpha" markdown>
1. The wire is thinner, so it has more resistance and carries less current
2. The wire is thicker, so it has less resistance and carries more current
3. The wire is longer, so it drops more voltage
4. The wire has insulation rated for a higher voltage
</div>

??? question "Show Answer"
    The correct answer is **A**. With AWG, a larger number means a thinner wire. Thicker copper has less resistance and carries more current before it heats up. The chapter's table shows AWG 14 at 8.28 mΩ per metre with a 15 A teaching limit, while AWG 24 has 84.22 mΩ per metre and only a 2 A limit. Gauge describes thickness, not length or insulation rating.

    **Concept Tested:** Wire Gauge

    **See:** [Wire Gauge](index.md#wire-gauge)

---

#### 3. A 24 V supply is connected across an 8 Ω resistor. What current flows through the resistor?

<div class="upper-alpha" markdown>
1. 192 A
2. 0.33 A
3. 16 A
4. 3 A
</div>

??? question "Show Answer"
    The correct answer is **D**. Ohm's law is V = I × R, so the current is I = V / R. Here I = 24 V / 8 Ω = 3 A, and the power is 24 V × 3 A = 72 W. Option A multiplies voltage by resistance, which finds nothing useful. Option B divides the wrong way around, and option C subtracts the two values. Always check an answer by putting it back into V = I × R.

    **Concept Tested:** Ohm's Law

    **See:** [Ohm's Law](index.md#ohms-law)

---

#### 4. A power supply is labeled "5 V 4 A". What does the 4 A rating mean?

<div class="upper-alpha" markdown>
1. The supply forces 4 A into any load that is connected to it
2. The load must draw exactly 4 A for the supply to hold 5 V
3. The supply can deliver up to 4 A while holding 5 V, and the load decides how much current flows
4. The supply can raise its voltage to 4 times 5 V when the load needs it
</div>

??? question "Show Answer"
    The correct answer is **C**. The current rating is the most that the supply *can* deliver. The load decides how much current really flows, as Ohm's law shows. A larger current rating never harms a load, so it is the safe direction to be wrong in. A smaller rating means the supply cannot keep up, its voltage sags, and the arm resets or behaves oddly. The voltage, by contrast, must match the load.

    **Concept Tested:** Power Supply

    **See:** [Power Supply](index.md#power-supply)

---

#### 5. A 12 V arm draws 4 A through 2 m of AWG 20 wire in each direction (33.31 mΩ per metre). Does the cable meet the 5 percent voltage-drop rule?

<div class="upper-alpha" markdown>
1. Yes, the wires drop about 0.53 V, which is 4.4 percent of 12 V
2. Yes, the wires drop about 0.13 V, which is 1.1 percent of 12 V
3. No, the wires drop about 1.07 V, which is 8.9 percent of 12 V
4. No, the wires drop about 0.80 V, which is 6.7 percent of 12 V
</div>

??? question "Show Answer"
    The correct answer is **A**. The current needs a lead wire and a return wire, so the combined length is 4 m. The resistance is 4 × 0.03331 = 0.133 Ω, and the drop is 4 A × 0.133 Ω ≈ 0.53 V. The limit is 5 percent of 12 V, which is 0.6 V, so the cable passes with 4.4 percent. Option B forgets to multiply by the current, and option C counts the wire length twice.

    **Concept Tested:** Wire Gauge

    **See:** [Wire Gauge](index.md#wire-gauge)

---

#### 6. What does a fuse protect in the power path of an arm?

<div class="upper-alpha" markdown>
1. The motor, by stopping it before it can stall
2. The computer, by blocking surges that arrive over the USB cable
3. The wire, by opening the circuit before the wire overheats and starts a fire
4. The supply, by refusing a plug that has reversed polarity
</div>

??? question "Show Answer"
    The correct answer is **C**. A fuse is a deliberately weak link that melts and opens the circuit when the current stays too high. It protects the wire and prevents fire. It does not protect the motor, because a motor can be damaged by heat or stalling at a current well below the fuse rating. The fuse goes in series with the positive wire, as close to the supply as possible.

    **Concept Tested:** Fuse

    **See:** [Fuse](index.md#fuse)

---

#### 7. An arm's normal peak current is 3.6 A, and you must use AWG 22 wire with a 3 A teaching limit. The fuse must exceed the peak by a 1.25 margin and stay below the wire's limit. What is the correct conclusion?

<div class="upper-alpha" markdown>
1. A 3 A fuse works because it is at the wire's limit
2. A 5 A fuse works because it is a standard blade-fuse value
3. The fuse rating does not matter if the arm has an E-stop
4. No fuse fits the window, so the wire must be replaced with a thicker one
</div>

??? question "Show Answer"
    The correct answer is **D**. The fuse must be at least 3.6 × 1.25 = 4.5 A to survive normal work, and no more than the wire's 3 A limit to protect it. No rating can satisfy both, so the wire itself is the problem. A 3 A fuse would blow during normal use, and a 5 A fuse would let the wire overheat. Swapping to AWG 18, with a 7 A limit, opens the window to 4.5 through 7 A.

    **Concept Tested:** Current Rating

    **See:** [Current Rating](index.md#current-rating)

---

#### 8. Which failure defeats a software E-stop but leaves a hardware E-stop working?

<div class="upper-alpha" markdown>
1. The program raises an exception partway through a move
2. The USB cable falls out, so the stop command cannot reach the motors
3. The operator presses the stop key on the keyboard
4. The supply label was read carefully before power-up
</div>

??? question "Show Answer"
    The correct answer is **B**. A software E-stop works by sending a command, so it needs the computer, the program, the USB cable, and the motor board all to still work. A cable that has fallen out cannot carry the command. A hardware E-stop opens the power circuit and needs none of those. A `finally` block still runs after an exception (A), and a keyboard stop works when the software is alive (C).

    **Concept Tested:** Software E-Stop

    **See:** [Software E-Stop](index.md#software-e-stop)

---

#### 9. Why does the safe power-up sequence put "simulate the program" before "switch on the power supply"?

<div class="upper-alpha" markdown>
1. The supply cannot be switched on until the program is saved
2. Simulating warms up the motors so that they respond smoothly
3. The cheap, reversible checks come first, so mistakes cost nothing before anything can move
4. Python must be running before the supply can set its output voltage
</div>

??? question "Show Answer"
    The correct answer is **C**. The steps are ordered so that cheap, reversible checks come first and the step that can hurt something comes late. Running the motion against the software fake arm catches errors with no power and no risk. Only after the work envelope is clear, the voltage label is checked, the arm is parked, and a hand is near the E-stop does power go on. The other options invent dependencies that do not exist.

    **Concept Tested:** Safe Power-Up Sequence

    **See:** [Safe Power-Up Sequence](index.md#safe-power-up-sequence)

---

#### 10. In the chapter's software stop, the command that turns the torque off is placed in a `finally` block. When does a `finally` block run?

<div class="upper-alpha" markdown>
1. Only when the `try` block finishes without an error
2. Only when the user presses Ctrl+C
3. Only when the program freezes in an endless loop
4. Whenever the `try` block ends, whether normally, with an error, or with Ctrl+C
</div>

??? question "Show Answer"
    The correct answer is **D**. Code in a `finally` block runs whenever the `try` block ends, which makes it the natural place for a stop command. In the lab, the stop message prints before the error is caught, because `finally` runs while the error is still on its way out. It does *not* run if the program freezes in an endless loop or the process is killed from outside, which is why the hardware E-stop is still needed.

    **Concept Tested:** Software E-Stop

    **See:** [Software E-Stop](index.md#software-e-stop)
