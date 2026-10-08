# Quiz: 3D Printing, Fasteners, and Tools

Test your understanding of FDM printing, file types, print settings, tolerances, fasteners, and the multimeter with these review questions.

---

#### 1. Which file type stores the exact shape from a CAD program, with true curves and surfaces, and is the one to use if you want to change a design?

<div class="upper-alpha" markdown>
1. STL
2. STEP
3. G-code
4. ASCII STL
</div>

??? question "Show Answer"
    The correct answer is **B**. A STEP file stores exact curves and surfaces, not approximations, so it is the file for editing a design. An STL file cuts the shape into a mesh of small triangles, with no colors and no units, and it is what slicers accept. G-code is the text that drives the printer. The SO-ARM100 repository keeps a folder of STEP files for builders who want to modify the arm.

    **Concept Tested:** STEP File

    **See:** [From a Design to the Printer](index.md#from-a-design-to-the-printer)

---

#### 2. What does a slicer produce from an STL file?

<div class="upper-alpha" markdown>
1. A STEP file with exact curves
2. A larger STL file with more triangles
3. A filament profile for the spool
4. A G-code file that tells the printer where to move and how much filament to push
</div>

??? question "Show Answer"
    The correct answer is **D**. A slicer such as PrusaSlicer, Cura, Bambu Studio, or OrcaSlicer cuts the shape into layers and plans the nozzle's path in each layer. Its output is G-code, a plain-text file with one command per line, such as `G1 X50 Y10 E1.6`. The printer reads the G-code from a card or over the network and prints it. The slicer does not edit the design.

    **Concept Tested:** Slicer

    **See:** [From a Design to the Printer](index.md#from-a-design-to-the-printer)

---

#### 3. A binary STL file holds 2,000 triangles. How many bytes long must the file be?

<div class="upper-alpha" markdown>
1. 100,084 bytes
2. 100,000 bytes
3. 2,084 bytes
4. 160,084 bytes
</div>

??? question "Show Answer"
    The correct answer is **A**. A binary STL has an 80-byte header, a 4-byte triangle count, and 50 bytes for each triangle: 80 + 4 + 50 × 2000 = 100,084 bytes. Each triangle's 50 bytes are twelve 4-byte numbers plus two spare bytes. This fixed size gives a quick check, and the lab's `read_stl` function raises an error when the file length does not match the count.

    **Concept Tested:** STL File

    **See:** [From a Design to the Printer](index.md#from-a-design-to-the-printer)

---

#### 4. A part is 90 mm tall. How many layers does a printer draw at a layer height of 0.2 mm and at 0.4 mm?

<div class="upper-alpha" markdown>
1. 225 layers at 0.2 mm and 450 layers at 0.4 mm
2. 450 layers at both layer heights
3. 450 layers at 0.2 mm and 225 layers at 0.4 mm
4. 90 layers at 0.2 mm and 45 layers at 0.4 mm
</div>

??? question "Show Answer"
    The correct answer is **C**. The number of layers is the height divided by the layer height: 90 / 0.2 = 450 and 90 / 0.4 = 225. A thicker layer needs about half as many passes, so the part finishes sooner, though its surface is coarser. This is why the repository offers a 0.6 mm nozzle at 0.4 mm layers as an alternative. A layer is usually kept below about three quarters of the nozzle width.

    **Concept Tested:** Layer Height

    **See:** [Print Settings](index.md#print-settings)

---

#### 5. A servo pocket is designed 24.9 mm wide. Your printer makes holes 0.25 mm too small, and the servo body is 24.7 mm wide. What happens?

<div class="upper-alpha" markdown>
1. The servo fits with 0.25 mm of clearance
2. The servo will not fit, because the clearance is −0.05 mm
3. The servo fits with 0.20 mm of clearance
4. The servo fits exactly, with zero clearance
</div>

??? question "Show Answer"
    The correct answer is **B**. The printed pocket is 24.9 − 0.25 = 24.65 mm wide. The clearance is the printed hole size minus the mating part size: 24.65 − 24.7 = −0.05 mm. A negative clearance means the servo will not go in. The chapter's rule is to leave about 0.15 to 0.2 mm, so a pocket designed at 25.0 mm on a printer with a 0.10 mm error would give a good sliding fit.

    **Concept Tested:** Dimensional Tolerance

    **See:** [Dimensional Tolerance](index.md#dimensional-tolerance)

---

#### 6. Why might you reprint a frame part in PETG instead of PLA if the arm will live somewhere warm?

<div class="upper-alpha" markdown>
1. PETG keeps its shape to a higher temperature, near 80 °C, while PLA softens at about 60 to 65 °C
2. PETG is easier to print than PLA and needs no tuning
3. PETG is the plastic named in the SO-ARM100 repository
4. PETG weighs far less than PLA, so the joints carry less load
</div>

??? question "Show Answer"
    The correct answer is **A**. PLA stops being rigid at about 60 to 65 °C, and a PLA part under load in a sunny window or a parked car can slowly bend, stretching the motor holes until the screws no longer grip. PETG keeps its shape near 80 °C. It is harder to print and strings more, so it needs more tuning. The repository asks for PLA+, and PETG is only an alternative for warm places.

    **Concept Tested:** PETG

    **See:** [Filament](index.md#filament)

---

#### 7. Why should a peg that carries a sideways load be printed lying down and not standing up?

<div class="upper-alpha" markdown>
1. A lying peg needs no support material
2. A lying peg uses less filament overall
3. A printed part is weakest between layers, and a lying peg has strands running along its length
4. A standing peg cannot be sliced by most slicers
</div>

??? question "Show Answer"
    The correct answer is **C**. A printed part is a stack of thin lines. Along a layer the plastic is one continuous strand, but between two layers it is only a weld. A standing peg has layer welds across its width, so a sideways load can snap it along one layer. A lying peg has strands that run along its length. Orientation also decides where supports go, but strength is the reason here.

    **Concept Tested:** Print Orientation

    **See:** [Print Settings](index.md#print-settings)

---

#### 8. Why must resistance be measured with the power off?

<div class="upper-alpha" markdown>
1. The meter's fuse would blow if the circuit were live
2. The probes cannot be placed in parallel with a powered part
3. The meter shows only the symbol "OL" on a live circuit
4. The meter sends its own small current through the part, and a powered circuit would give a wrong reading
</div>

??? question "Show Answer"
    The correct answer is **D**. In resistance mode the meter works by sending a small current of its own through the part and measuring the result. A powered circuit adds other voltages and currents, so the reading is wrong. Resistance and continuity are measured with the power off, while DC voltage and DC current are measured with the power on. "OL" means the value is over range or the circuit is open.

    **Concept Tested:** Multimeter

    **See:** [The Multimeter](index.md#the-multimeter)

---

#### 9. You want to measure the current drawn by a servo with a multimeter. How should the meter be connected?

<div class="upper-alpha" markdown>
1. In series, by opening the supply wire and putting the meter in the gap
2. In parallel, with the probes across the supply terminals
3. In parallel, with the probes across the servo's signal wire
4. In series, but only after turning the power off and switching to resistance mode
</div>

??? question "Show Answer"
    The correct answer is **A**. Current is a flow, so the meter becomes part of the circuit: you break the wire and place the meter in the gap, so all the current passes through it. Connecting a meter in current mode across a supply is a near short circuit, which can blow the meter's fuse or worse. Afterward, switch the meter back to voltage mode, which is measured across two points.

    **Concept Tested:** Multimeter

    **See:** [The Multimeter](index.md#the-multimeter)

---

#### 10. A screw hole was designed at 3.4 mm with a tolerance of ±0.2 mm and printed at 3.05 mm. For a 3.0 mm screw, what is the best reading of this result?

<div class="upper-alpha" markdown>
1. The hole is within tolerance, so the screw will slide in freely
2. The hole is out of tolerance, but the extra room is a benefit that will not matter
3. The hole is 0.35 mm small and out of tolerance, leaving only 0.05 mm of clearance, so the screw would go in only with force
4. The hole is too large, so the screw will not grip the plastic
</div>

??? question "Show Answer"
    The correct answer is **C**. The error is 3.05 − 3.4 = −0.35 mm, which is outside the ±0.2 mm tolerance. Holes usually print smaller than designed, and here the 3.0 mm screw has only 0.05 mm of clearance, so it is snug and would need force. A fix is to print the gauge first, adjust one setting, or enlarge the hole in the design. The hole is too small, not too large.

    **Concept Tested:** Print Quality Inspection

    **See:** [Print Quality Inspection](index.md#print-quality-inspection)
