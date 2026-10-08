---
title: "3D Printing, Fasteners, and Tools"
description: "How to make and check the parts of an arm that are not bought as a kit: FDM 3D printing, filament and print settings, tolerances and quality checks, screws and servo horns, crimping and soldering, cable care, and the multimeter, with a Python lab that checks an STL file before it is printed."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 20:31:37"
version: 1.11
---

# 3D Printing, Fasteners, and Tools

## Summary

This chapter covers fabricating the parts that are not bought as a kit. It teaches 3D printing materials, settings, and quality checks, followed by fasteners, servo horns, crimping, soldering, cable management, and the multimeter. After this chapter, you will be able to print, inspect, and prepare parts for assembly.

## Concepts Covered

This chapter covers the following 29 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| 3D Printing | 42 |
| FDM Printer | 36 |
| Print Settings | 31 |
| Dimensional Tolerance | 12 |
| Print Quality Inspection | 11 |
| Crimping | 10 |
| Multimeter | 10 |
| Cable Management | 9 |
| Fasteners | 8 |
| Screws | 5 |
| Filament | 4 |
| Assembly Tools | 4 |
| STL File | 3 |
| Print Orientation | 2 |
| Slicer | 2 |
| Strain Relief | 2 |
| Soldering | 2 |
| Soldering Safety | 1 |
| 3D Printer Safety | 1 |
| PLA | 1 |
| PETG | 1 |
| Layer Height | 1 |
| Infill | 1 |
| Support Material | 1 |
| STEP File | 1 |
| G-Code | 1 |
| Warping | 1 |
| Heat-Set Insert | 1 |
| Servo Horn | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 6: Sourcing Parts and Planning a Budget](../06-sourcing-parts-and-budget/index.md)

---

!!! mascot-welcome "Let's Make My Bones!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    The motors you ordered are my muscles, but the printed parts are my bones, and nobody sells those in a box. In this chapter you will learn to print them well, check that they fit, fasten them, and test the wires that join them, and you will write a Python script that checks a part before a single gram of plastic is used. Let's move it!

Chapter 6 ended with a motor kit on the way and a line in the budget that said "3D-printed parts: to be recorded in Chapter 7." This chapter fills that line. The frame of the SO-ARM101 is plastic that you print, the motors are held in it with small screws, and the whole arm is connected by cables. Each of those three jobs has its own craft: printing, fastening, and wiring. A mistake in any of them is cheap to make and annoying to find, so the chapter spends as much time on *checking* as on making.

The chapter follows the path of a part. It starts with the machine that makes the plastic, then follows a design file from your computer to the printer, then covers how to judge what came out. The second half turns to screws and horns, the wires and connectors, and the meter that tells you whether electricity is going where you think.

## Printing the Frame

### 3D Printing and the FDM Printer

**3D printing** builds an object by adding material one thin layer at a time, which is why it is also called additive manufacturing. A machine that *removes* material (a saw or a drill) starts with a block and cuts away what is not needed. A 3D printer starts with nothing and adds only what is needed, so it can make shapes that no saw could cut, such as a hollow arm link with ribs inside.

The printers in this book are **FDM printers**. FDM stands for fused deposition modeling. An FDM printer pushes a plastic string, the filament, into a hot metal tip called the **nozzle**, where it melts. The nozzle moves over a flat plate called the **bed** and lays down a thin line of molten plastic, which cools and hardens in a fraction of a second. When one layer is finished, the nozzle moves up (or the bed moves down) by one layer height and draws the next layer on top of the last. A motor-driven gear called the **extruder** feeds the filament, and the part of the machine that holds the nozzle and heater is the **hot end**.

A small calculation shows what that means for time. The follower print plate in the SO-ARM100 repository is about 87 mm tall. At a layer height of 0.2 mm, the printer must draw \( 87 / 0.2 = 435 \) layers, and each layer is a full pass of the nozzle over every part on the plate. That is why a plate takes many hours, and why it is worth checking a file *before* you start rather than after.

The size of the bed limits the size of a part. This is the **build volume**, given as width, depth and height. The repository supplies print plates that are already laid out for two common sizes of bed: 220 × 220 mm (the Creality Ender 3 class) and 205 × 250 mm (the Prusa and UP class). You will check one of these in the lab.

!!! mascot-thinking "Everything Is Layers"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Almost every choice in 3D printing comes from one fact: the part is a stack of thin lines that are glued to each other by heat. Along a layer the plastic is one continuous strand, and between two layers it is only a weld. Keep that picture in mind and the settings in this chapter stop being a list to memorize.

### 3D Printer Safety

**3D printer safety** starts with heat. The nozzle runs at roughly 190 to 260 °C depending on the plastic, and the bed is usually warm as well, so touching either can burn you. Wait for the bed to cool before you reach in, and never touch the nozzle. Melting plastic also gives off fumes and very fine particles, so print in a room with fresh air, and put the printer on a surface that does not burn, with some clear space around it. Do not leave a printer running unattended, especially overnight, and keep a smoke alarm in the room. Keep hair, sleeves and cables away from the moving parts. As the course description says, readers under 16 should print with an adult present.

### Filament

**Filament** is the plastic string that a printer uses. The common sizes are 1.75 mm and 2.85 mm in diameter, and most desktop printers take 1.75 mm. It is sold on spools, usually by the kilogram, and the label on the spool gives the plastic type, the diameter, and the temperature range the maker recommends. Follow the spool's label before any table in a book, including this one. Filament that has soaked up moisture from the air bubbles and makes rough prints, so keep spools in a closed box.

Two plastics matter for this arm. **PLA** (polylactic acid) is the easiest plastic to print. It melts at a fairly low temperature, it warps little, and it is the material that the SO-ARM100 repository asks for, in a version called PLA+. PLA+ is a trade name for PLA blends that are tougher than plain PLA, and the blend differs between makers. PLA has one weakness that the arm's builders should know: it softens at about 60 to 65 °C, the temperature at which the plastic stops being rigid. The inside of a car in the sun can pass 50 to 60 °C, and a PLA part under load there can slowly bend. **PETG** (a glycol-modified polyester) is a little harder to print, takes hotter settings, and keeps its shape to a higher temperature, near 80 °C. It is a good choice for a part that will be warm.

| | PLA | PETG |
|---|---|---|
| Typical nozzle temperature | About 185 to 235 °C | About 215 to 270 °C |
| Typical bed temperature | About 50 to 60 °C | About 70 to 90 °C |
| Softens at about | 60 to 65 °C | About 80 °C |
| Ease of printing | Easiest | Needs more tuning (it strings more) |
| Used for the SO-ARM101 | Yes, as PLA+ (the repository's choice) | An alternative for warm places |

The temperatures are typical ranges from filament makers, so read the spool.

!!! mascot-warning "Do Not Leave PLA in a Hot Car"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A PLA arm left in a sunny window or a parked car can soften and sag, and the holes for the motors can stretch until the screws no longer grip. Store the arm in a cool place, and if a part must live somewhere warm, reprint it in PETG.

### From a Design to the Printer

A design reaches a printer through a short chain of file types. Each one has a job, and it helps to know which file you are holding.

A **STEP file** (extension `.step` or `.stp`) is the exact shape from a CAD program. It stores true curves and surfaces, not approximations, so it is the file to use if you want to change the design. The SO-ARM100 repository has a folder of STEP files for that purpose. An **STL file** (`.stl`) is a shape that has been cut into a surface of small triangles. An STL file stores nothing but those triangles: no colors, and no units, so the same file can be read as millimeters or inches. It is the file that printers' software accepts, and the repository's printable parts are all STL files.

A **slicer** is a program (PrusaSlicer, Cura, Bambu Studio and OrcaSlicer are common ones) that takes an STL file and cuts it into layers, then plans the path that the nozzle will follow in each layer. Its output is a **G-code** file. G-code is plain text, one command per line, that tells the printer where to move, how fast, and how much filament to push. A line such as `G1 X50 Y10 E1.6` means "move in a straight line to X = 50 mm, Y = 10 mm, and push the extruder to a total of 1.6 mm of filament". Everything after a semicolon is a comment. The printer reads the G-code from a card or over the network, and prints it.

| File | Made by | Holds | You use it to |
|---|---|---|---|
| STEP | CAD program | Exact shapes | Change the design |
| STL | CAD program or export | A mesh of triangles | Hand a shape to the slicer |
| G-code | Slicer | Moves and extrusion, one per line | Run the printer |

An STL file comes in two forms. An **ASCII STL** is text, with a few lines for every triangle, and it is large. A **binary STL** is a compact block of bytes: an 80-byte header, then a 4-byte count of the triangles, then 50 bytes for each triangle. Each triangle's 50 bytes are twelve 4-byte decimal numbers (three for the direction the triangle faces, and three each for its three corners) and two spare bytes. That fixed size gives a quick check. A binary file with 96,584 triangles must be exactly \( 80 + 4 + 50 \times 96584 = 4{,}829{,}284 \) bytes long, and the Prusa-bed follower plate in the repository is exactly that. You will read files with this layout in Python in the lab, using the `struct` module from Chapter 4.

### Print Settings

**Print settings** are the choices you give the slicer, and they decide how strong the part is, how long it takes, and how it looks. The SO-ARM100 repository recommends these, in its "Printing the Parts" instructions.

| Setting | The repository's recommendation |
|---|---|
| Material | PLA+ |
| Nozzle and layer height | 0.4 mm nozzle at 0.2 mm layers, or 0.6 mm nozzle at 0.4 mm layers |
| Infill | 15 percent |
| Supports | Everywhere, but ignore slopes steeper than 45 degrees to the horizontal; no supports inside screw holes whose axes are horizontal |
| Bed preparation | Level the bed; clean off dust and grease; a thin layer of glue stick if the printer's maker recommends it |

The recommendation leaves out the temperatures, the speed and the number of walls, so use your filament's label and your slicer's defaults for those. The repository's own instructions for printing services say 20 percent infill, which is a reminder that these numbers are a starting point.

**Layer height** is the thickness of each layer. A smaller layer height gives a smoother surface and takes more layers: the follower plate needs 435 layers at 0.2 mm and \( 87 / 0.4 \approx 218 \) at 0.4 mm, about half as many, which is why the repository offers the 0.6 mm nozzle at 0.4 mm as an alternative. The limit is the nozzle: a layer is usually kept below about three quarters of the nozzle width. **Infill** is how much of the *inside* of a part is filled with plastic, given as a percentage. The outside walls are always solid, and the inside is a light pattern, like a honeycomb. At 15 percent the inside is mostly air, which saves plastic and time, and for small parts that are held by screws the walls carry most of the load anyway. Raising the infill makes a part heavier and a little stronger, and the gain falls off quickly.

**Support material** is a scaffold of thin plastic that the slicer adds under any part that hangs in the air, such as a hole in a wall or a bridge, because a layer cannot be printed on nothing. You break it off afterwards, and it leaves a rougher surface. The repository's rule of ignoring slopes steeper than 45 degrees means that a surface that leans out by less than 45 degrees from vertical prints well without support, and one that leans out further needs it. It also asks you to avoid supports in horizontal screw holes, because they are hard to clean out of a small hole.

**Print orientation** is the direction in which a part sits on the bed. It matters for strength, because the weakest direction of a printed part is *between* layers. A peg printed standing up is a stack of thin welds that can snap along one layer, and the same peg printed lying down has strands that run along its length. Orientation also decides where the supports go. The repository's plates are already arranged so that each part has "z upwards to minimize supports", so for this arm you will rarely change the orientation, but you should know why it was chosen.

!!! mascot-tip "Use the Plate for Your Bed"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Load the print plate that was made for your bed size. The Prusa-class follower plate is about 243 × 205 mm, which fits a 205 × 250 mm bed (barely) and does not fit a 220 × 220 mm one. Check the size with the lab script before you slice, and save a wasted afternoon.

### Warping

**Warping** is when the corners of a part curl up off the bed during the print. Plastic shrinks as it cools, and the layers on the bed cool slower than the ones above them, so the part pulls itself into a bow. The curl is worst on large flat parts and on plastics that shrink a lot. It is a small problem with PLA and a large one with ABS, a harder plastic that needs a closed, warm box around the printer. You prevent warping by starting with a level, clean bed, a thin layer of glue stick if your printer's maker recommends one, the bed temperature on the spool's label, and no cold draughts across the print. A warped corner can also catch the moving nozzle and knock the whole print out of position, which the inspection section calls a layer shift.

### Dimensional Tolerance

**Dimensional tolerance** is the amount by which a real dimension may differ from the intended one and still work. A tolerance of \( \pm 0.2 \) mm on a 40 mm part means any length from 39.8 to 40.2 mm is acceptable. A well-tuned desktop FDM printer typically holds about \( \pm 0.1 \) to \( \pm 0.3 \) mm, a figure that depends on the printer, the plastic and the part, and makers of 3D-printing services give the same range.

Two things follow. First, a hole usually prints *smaller* than designed, because the nozzle's plastic spreads inwards, so a hole needs a little extra room. Second, parts that must slide or fit together need a **clearance**, a deliberate gap. A common starting rule is to leave about 0.15 to 0.2 mm. The clearance is the printed hole minus the part that goes in it:

\[ \text{clearance} = \text{printed hole size} - \text{mating part size} \]

Here is a worked example with a real size. The STS3215 servo body is 45.2 × 24.7 × 35 mm, according to Feetech's data sheet. A pocket designed exactly 24.7 mm wide, on a printer that makes holes 0.15 mm small, prints 24.55 mm wide. The clearance is \( 24.55 - 24.7 = -0.15 \) mm. It is negative, so the servo will not go in. A pocket designed 25.0 mm wide, on the same printer with a 0.10 mm error, prints 24.90 mm, which gives \( 24.90 - 24.7 = +0.20 \) mm, a good sliding fit. The next MicroSim lets you predict the outcome for six cases, and then change the numbers yourself. The sizes in it are illustrative, apart from the servo's and the screw's.

#### Diagram: Tolerance Fit Explorer

<iframe src="../../sims/tolerance-fit-explorer/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Tolerance Fit Explorer MicroSim fullscreen](../../sims/tolerance-fit-explorer/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Tolerance Fit Explorer</summary>
Type: microsim
**sim-id:** tolerance-fit-explorer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** infer<br/>
**Learning Objective:** The learner will infer whether a printed hole is too tight, snug, a good sliding fit, or loose from its designed size, the printer's size error and the size of the part that goes into it, in six cases, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** 3D printing, dimensional tolerance, clearance, printed hole size, mating part (all defined in the section above this block).

**Evidence of Mastery:** For each of six cases the learner chooses one of four outcomes and commits before the outcome is shown. A choice is correct when it matches the Outcome column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the numbers in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A hole prints at exactly the size that was designed. (It prints smaller by the printer's error.) (2) A bigger hole is always safer. (Beyond about 0.3 mm of clearance the part rattles.) (3) Zero clearance is a perfect fit. (It is a press fit that may not go in at all.)

**Instructional Rationale:** An Understand-level infer objective asks the learner to reason from numbers to a physical outcome. Predicting before the result is shown makes the learner apply the clearance rule instead of watching a picture.

**Content:**

Explore mode has three quantities the learner can change, and shows the printed hole size, the clearance and the outcome, with the picture of a part sliding into a hole.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Designed hole size | 2.5 | 26.0 | 0.05 | 25.0 | mm |
| Printer size error (negative means the hole prints smaller) | -0.40 | 0.40 | 0.05 | -0.10 | mm |
| Mating part size | 2.5 | 26.0 | 0.05 | 24.7 | mm |

The four outcomes: "Too tight", "Snug", "Good sliding fit", "Loose". Six cases in this fixed order:

| # | Case | Designed hole (mm) | Printer error (mm) | Mating part (mm) | Outcome | Why (shown as feedback) |
|---|---|---|---|---|---|---|
| 1 | STS3215 body width into a pocket designed with no extra room | 24.70 | -0.15 | 24.70 | Too tight | The pocket prints 24.55 mm, so the clearance is -0.15 mm and the servo will not go in. |
| 2 | STS3215 body width into a pocket designed with 0.3 mm of room | 25.00 | -0.10 | 24.70 | Good sliding fit | The pocket prints 24.90 mm, so the clearance is +0.20 mm. |
| 3 | M3 screw shaft into a hole designed at 3.2 mm | 3.20 | -0.25 | 3.00 | Too tight | The hole prints 2.95 mm, so the clearance is -0.05 mm and the screw will not enter. |
| 4 | M3 screw shaft into a hole designed at 3.4 mm | 3.40 | -0.20 | 3.00 | Good sliding fit | The hole prints 3.20 mm, so the clearance is +0.20 mm. |
| 5 | M3 screw shaft into a hole designed at 3.8 mm | 3.80 | -0.10 | 3.00 | Loose | The hole prints 3.70 mm, so the clearance is +0.70 mm and the screw rattles. |
| 6 | Servo output spline of 5.9 mm into a hole designed at 6.0 mm | 6.00 | -0.10 | 5.90 | Snug | The hole prints 5.90 mm, so the clearance is 0.00 mm, a press fit. |

**Provenance:** The servo body width (24.7 mm) and the output spline outer diameter (5.9 mm) are from Feetech's STS3215 data sheet. The M3 shaft diameter (3.0 mm) is the standard size. The designed hole sizes and printer errors are illustrative values written for this sim, and the sim labels them "illustrative". The clearance rule is from the chapter section "Dimensional Tolerance".

**Rules:** printed hole = designed hole + printer error. Clearance = printed hole - mating part, rounded to 0.01 mm. Clearance < 0 is "Too tight". 0 <= clearance < 0.10 is "Snug". 0.10 <= clearance <= 0.30 is "Good sliding fit". Clearance > 0.30 is "Loose". In Explore mode the picture of the part and the hole is drawn from the same rule.

**Learner Activity:**

1. In Explore mode the learner changes the three quantities and watches the printed size, the clearance and the outcome. The learner should notice that a printer error of -0.10 mm turns a designed clearance of 0.30 mm into 0.20 mm.
2. The learner switches to the six cases. Case 1 is shown with the numbers but not the outcome.
3. The learner chooses one of the four outcomes and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After case 6 it shows the score.

**Feedback:** Six cases, fixed order, one attempt each. Correct: "Correct: <outcome>. <Why>". Incorrect: "Not quite. This case is <outcome>. <Why>". The correct outcome is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the defaults, showing a printed hole of 24.90 mm, a clearance of 0.20 mm and the outcome "Good sliding fit".

**Chapter Anchors:** The chapter states a typical FDM tolerance of about ±0.1 to ±0.3 mm, a starting clearance of about 0.15 to 0.2 mm, the servo body width of 24.7 mm, the worked example of -0.15 mm and +0.20 mm, and the rule that clearance is the printed hole minus the mating part. The sim has six cases and mastery is 5 of 6.
</details>

### Print Quality Inspection

**Print quality inspection** is looking at a finished print, and measuring it, before you build with it. It takes five minutes per part and saves the much longer job of taking an arm apart. The SO-ARM100 repository adds a useful tool: a set of small **gauge** prints. Its "Step 3" tells you to print a gauge and test it against your object, and it provides gauges for the STS3215 servo and for a LEGO brick. A gauge prints in a minute or two and tells you whether your printer's settings give the right fit for the real parts, so you print it *before* the whole plate.

A good inspection goes in this order: look, then feel, then measure, then test-fit. Look for the faults in the next list. Feel the part for loose strands and for support material still stuck in a hole. Measure the sizes that matter (a servo pocket, a screw hole) with digital calipers and compare them with the plan, as the lab's tolerance check does. And test-fit one servo or screw in the part before you print more. These are the faults to know, since each has a cause and a remedy.

| Fault | What you see | Usual cause | Usual remedy |
|---|---|---|---|
| Warping | Corners curl off the bed | Plastic cooling and shrinking, a dirty or unlevel bed | Clean and level the bed, check bed temperature, remove draughts |
| Stringing | Fine hairs of plastic between separate parts of the print | The nozzle is too hot, or the filament is wet | Lower the nozzle temperature, dry the filament, turn on retraction |
| Under-extrusion | Gaps or thin, weak walls | Too little plastic is pushed: a partly blocked nozzle, a tangled spool, or a worn extruder | Clear the nozzle, free the spool, check the filament path |
| Layer shift | The upper part is displaced sideways from the lower part | The nozzle hit something (a curled corner), or a belt or screw slipped | Remove what was hit, check that the belts are tight |
| Poor first layer | The first lines do not stick, or are squashed unevenly | The bed is not level, or the nozzle is too far from or too close to it | Level the bed, set the first-layer height, clean the bed |

#### Diagram: Print Defect Diagnoser

<iframe src="../../sims/print-defect-diagnoser/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Print Defect Diagnoser MicroSim fullscreen](../../sims/print-defect-diagnoser/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Print Defect Diagnoser</summary>
Type: microsim
**sim-id:** print-defect-diagnoser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** distinguish<br/>
**Learning Objective:** The learner will distinguish five common FDM print faults from eight written descriptions of failed prints, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** FDM printer, nozzle, bed, layer, filament, warping, support material, print quality inspection, and the five faults in the table above this block (all defined in the sections above).

**Evidence of Mastery:** For each of eight descriptions the learner chooses one of five faults and commits. A choice is correct when it matches the Fault column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the fault table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Every print failure comes from the settings. (Several come from the machine: a loose belt or a tangled spool.) (2) A curled corner is harmless. (It can knock the nozzle and cause a layer shift.) (3) Stringing and under-extrusion are the same fault. (One has too much plastic where there should be none, and the other too little where there should be some.)

**Instructional Rationale:** An Analyze-level distinguish objective asks the learner to tell similar-looking cases apart by the evidence. Each description is a short symptom with no label, so the learner must decide which feature separates one fault from another.

**Content:**

The five faults: "Warping", "Stringing", "Under-extrusion", "Layer shift", "Poor first layer". Eight descriptions in this fixed order. Each is an illustrative description written for this sim, and the sim labels the set "illustrative".

| # | Description shown to the learner | Fault | Why (shown as feedback) |
|---|---|---|---|
| 1 | The corners of a large flat part have lifted off the bed and the part rocks when touched. | Warping | Corners that lift as the plastic cools and shrinks are warping. |
| 2 | Thin hairs of plastic stretch between two posts that were meant to be separate. | Stringing | Hairs between separate features come from plastic oozing while the nozzle travels. |
| 3 | The walls have visible gaps between the lines and the part snaps easily. | Under-extrusion | Gaps and thin walls mean too little plastic was pushed. |
| 4 | The top half of a tall part sits 3 mm to one side of the bottom half, and every layer above one height is displaced the same way. | Layer shift | A sudden sideways displacement that continues up the part is a layer shift. |
| 5 | The first layer came off the bed as loose strands, and the lines were squashed flat on one side of the bed and barely touching on the other. | Poor first layer | An uneven first layer across the bed points to a bed that is not level. |
| 6 | A long thin part was flat for the first hour, and by the end its ends bowed upward and the lower layers had split apart. | Warping | Bowing and split layers appear as the cooling part shrinks and pulls itself up. |
| 7 | Halfway through the print the extruder started clicking, and the later layers have holes and look thin. | Under-extrusion | A clicking extruder means the filament is not feeding, so the later layers got too little plastic. |
| 8 | After the nozzle struck a curled-up corner, every later layer is displaced about 3 mm along one axis. | Layer shift | A hit on the nozzle moved the print relative to the machine, so the layers above are shifted. |

**Provenance:** The fault names, causes and remedies are from the chapter section "Print Quality Inspection". The eight descriptions are illustrative and written for this sim.

**Rules:** Each description has exactly one correct fault. The five faults are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the five faults, each with its cause and remedy, in a list.
2. The learner switches to the eight descriptions. Description 1 is shown.
3. The learner chooses a fault and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After description 8 it shows the score and lists the faults that were missed.

**Feedback:** Eight descriptions, fixed order, one attempt each. Correct: "Correct: <fault>. <Why>". Incorrect: "Not quite. This is <fault>. <Why>". The correct fault is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the five faults listed and the prompt "Which fault is this?" ready for the first description.

**Chapter Anchors:** The chapter's table lists the five faults (warping, stringing, under-extrusion, layer shift, poor first layer) with a cause and a remedy for each. The sim has eight descriptions and mastery is 7 of 8.
</details>

!!! mascot-tip "Print the Gauge First"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The repository's small gauge prints take a few minutes and test your printer's fit against a real STS3215. If the servo does not slide in, change one setting and print the gauge again, before you commit a whole plate and half a day.

### What a Print Costs

Chapter 6 left a line in the budget for the printed parts. The lab measures the plastic in the repository's own plates, and the answer is a bracket, because the real mass depends on the walls, the infill and the pattern that the slicer chooses. The Prusa-bed follower plate has a solid volume of 571 cm³ and the leader plate 615 cm³. If every bit were solid plastic, with PLA's density of about 1.24 g/cm³, the two plates would weigh \( 571 \times 1.24 \approx 709 \) g and \( 615 \times 1.24 \approx 762 \) g. At the other extreme, 15 percent of the volume with no walls would be 106 g and 114 g. A real print lies between the extremes, and the slicer will give the figure. The bracket for the pair is 220 g to 1,471 g. At an *illustrative* price of $20 per kilogram, that is \( 0.2206 \times 20 \approx \$4.41 \) to \( 1.471 \times 20 \approx \$29.42 \). Check your own spool's price. Either way, printing the pair yourself costs much less than the motor kit, in plastic, and costs hours of machine time instead. This book budgets $20 or more for the printed parts, which with the $332.04 motor kit makes the whole pair about $350. If you have no printer, Chapter 6's note about buying a printed set or using a printing service applies.

## Fasteners and Assembly Tools

### Fasteners and Screws

**Fasteners** are the small parts that hold other parts together: screws, nuts, washers, and pins. In the SO-ARM101, nearly all of them are **screws**, which are a threaded shaft with a head that you turn with a screwdriver. A screw is named by the diameter of its thread and its length. An *M3 × 6* screw is metric (the M), has a thread 3 mm across, and is 6 mm long. The SO-ARM101 build uses two sizes, according to LeRobot's assembly instructions.

| Screw | Where it is used | Source |
|---|---|---|
| M3 × 6 mm | Holding a horn to a motor, and joining frame parts to horns | LeRobot SO-101 instructions |
| M2 × 6 mm | Fastening a motor into the printed frame (usually four per motor), and the smallest joints | LeRobot SO-101 instructions |

By the build instructions' wording, a follower arm needs about two dozen M2 × 6 and about forty to fifty M3 × 6 screws. That is the author's own count from the text, which does not give totals, so count the screws in your kit when it arrives and ask the seller if you are short. The repository does not say whether they are self-tapping screws (which cut their own thread into plastic) or machine screws, and it does not use nuts. Use the screws that come with your kit. The one rule that always applies when you screw into plastic is to stop turning when the screw is snug. A screw driven too tight strips the thread it has cut in the plastic, and the hole is then useless.

A **heat-set insert** is a small brass nut with a ribbed outside that you press into a printed hole with a hot soldering iron. The plastic melts around it and sets, leaving a metal thread that can be screwed in and out many times without wearing. The SO-ARM101 does not use them, since all its screws go into plastic or into the servos' own holes, but you will meet them in other printed designs. The hole must be slightly *smaller* than the insert, and the insert maker's data sheet gives the size, for example about 4 mm for an M3 insert.

### Servo Horns

A **servo horn** is the plastic or metal arm that fits on a servo's output shaft and carries the next part of the arm. The shaft has a ring of fine teeth around it, called a spline, and the horn has matching teeth inside. The STS3215's spline has 25 teeth (called 25T) and an outside diameter of 5.9 mm, from Feetech's data sheet, and the horn's own screw is an M3 × 6. LeRobot's instructions have each joint motor carry two horns, one on each side. The top horn is secured with one M3 × 6 screw, and the bottom horn is not screwed on. The 25 teeth mean that the horn can be placed in 25 positions around the shaft, which is \( 360 / 25 = 14.4 \) degrees apart, so the position you choose at assembly is a coarse setting and the calibration in Chapter 8 does the fine one.

### Assembly Tools

The **assembly tools** for this arm are few. The repository's list has a set of precision Phillips screwdrivers, and its instructions say the two sizes #0 and #1 are highly recommended. You also need a putty knife to lift the prints off the bed, a small screwdriver to pick out support material, and a table clamp for each arm (the list gives four clamps for two arms). Optional but very useful are digital calipers for the tolerance checks, a pair of flush cutters for supports, and tweezers for the small screws. Put the screws in small dishes, one size per dish, because an M2 × 6 and an M3 × 6 look alike in a heap.

!!! mascot-warning "Do Not Overtighten Plastic"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A screw in printed plastic has only the thread it cut for itself, and turning past snug strips it, so the screw spins and holds nothing. Stop when the screw stops, and if a thread does strip, move to a new hole or fill the old one and reprint the part, since a stripped joint will loosen on every move of the arm.

## Wires, Connectors, and Meters

### The Servo Cable

The STS3215 servos are connected by three-wire cables with a small plastic plug. Feetech's data sheet names the plug a 5264 three-pin, with the wires in this order: ground, supply voltage, and signal. The cable on the servo is 15 cm long. The pitch is 2.54 mm (0.1 inch), the same spacing as the pins on a breadboard. The SO-ARM101 build uses only ready-made cables that plug in, so building it needs no soldering and no crimping. The rest of this section teaches those skills for the day you must repair a cable, make a longer one, or wire the power for the reBot-DevArm in Chapter 9.

### Crimping

**Crimping** joins a wire to a metal terminal by squeezing the terminal's barrel around the bare wire with a special tool, with no heat. A good crimp makes a gas-tight joint that is strong and conducts well. The steps are the same for most terminals: strip the insulation to the length the terminal's data sheet gives (for a 2.54 mm terminal it is only about 3 mm), place the bare wire and the terminal in the right slot of the crimping tool, and squeeze until the tool releases. Then pull the wire gently to test it. A terminal for this size of plug suits wire of about 22 to 30 AWG and is rated for a few amps, so check the data sheet and use the right tool for the terminal, because a general pair of pliers makes a poor crimp that fails later. Chapter 3's table of wire gauges tells you what current a gauge can carry.

### Soldering and Soldering Safety

**Soldering** joins two metal parts with a melted metal alloy called solder, which flows into the joint and hardens. It is the right choice for joining wires to a circuit board and for a permanent connection. **Soldering safety** matters because the iron's tip runs between about 315 and 425 °C and causes serious burns. Always return the iron to its stand, never put it down on the bench, wear safety glasses because solder and flux can spit, work with fresh air moving or with a fume fan so that you do not breathe the smoke, and wash your hands afterward, since many solders contain lead. Unplug the iron when you finish. Soldering mains-powered parts is for an adult only.

### Cable Management and Strain Relief

**Cable management** is arranging the cables so that they do not snag, pull, or rub as the arm moves. Wires that bend thousands of times in an arm break inside their insulation, and the break shows up as a fault that comes and goes. Three habits prevent most of it. Leave a little slack at each joint so the cable is never stretched when the arm moves to the end of its range. Bundle the cables along the links with ties or clips that hold them without squeezing, since a very tight tie directly on a wire crushes it. And give every connector **strain relief**, which is anything that takes the pull on the cable instead of the joint at the end: a clip near the plug, a loop of slack, or a sleeve. A sharp bend right beside a connector is a common place for the wire to break. Chapter 8 returns to this when you route the cables through the arm.

!!! mascot-tip "Test the Range Before You Tie Down"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Before you fasten a cable bundle, move the joint by hand to both ends of its range and watch the cable. Tie it down only where it stays slack at both ends, and you will not chase a flickering joint later.

### The Multimeter

A **multimeter** is a hand-held meter that measures voltage, resistance and (in some modes) current, and tests whether two points are connected. It is the tool that tells you what electricity is doing, and it connects Chapter 3's ideas to a real circuit. A dial or buttons choose the mode, and two probes, one red and one black, touch the circuit. Four modes cover almost everything you will do with this arm.

| Mode | Symbol | What it measures | How to connect | Power |
|---|---|---|---|---|
| DC voltage | V with a straight line | The voltage between two points | Probes across the two points (in parallel) | On |
| Resistance | Ω | The resistance between two points | Probes across the part, in parallel | Off |
| Continuity | A diode or sound-wave symbol | Whether two points are connected; it beeps if they are | Probes at the two points | Off |
| DC current | A with a straight line | The current in a wire | The meter becomes part of the circuit: you break the wire and put the meter in the gap (in series) | On |

Voltage is measured *across* two points, because it is a difference between them. Current is measured *through* a wire, because it is a flow, and so the circuit has to be opened and the meter put in the gap. This is the mistake that blows the meter's fuse: connecting the meter in current mode across a power supply is a near short circuit. Resistance must be measured with the power *off*, because the meter sends its own small current through the part and a powered circuit gives a wrong reading. When the screen shows "OL" or "1", the value is over the meter's range or the circuit is open.

!!! mascot-warning "Never Use Current Mode Across a Supply"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    In current mode the meter is almost a wire, so probes across a supply make a short circuit that can blow the meter's fuse, or worse. To check voltage, use the voltage mode, with the probes across the points. Use the current mode only after you have opened the circuit to put the meter in series, and put the meter back in voltage mode when you finish.

The meters that most hobbyists buy are rated for low-voltage electronics. The arms in this book run from 5 to 48 V DC, which is within the range of any meter, but the supply that feeds them is plugged into the mains, and a meter used near mains must carry a safety category rating (CAT II or higher). Do not measure the mains side unless you are an adult who knows how.

In the following MicroSim you practise the three choices that every measurement needs: which mode, whether the power is on, and how the meter connects. The six tasks come from this book's circuits.

#### Diagram: Multimeter Practice

<iframe src="../../sims/multimeter-practice/main.html" height="620px" width="100%" scrolling="no"></iframe>

[Run the Multimeter Practice MicroSim fullscreen](../../sims/multimeter-practice/main.html){ .md-button .md-button--primary }

<details markdown="1">
<summary>Multimeter Practice</summary>
Type: microsim
**sim-id:** multimeter-practice<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** use<br/>
**Learning Objective:** The learner will use a virtual multimeter by choosing the correct mode, power state and connection for six measuring tasks from this book's circuits, with at least 5 of 6 tasks fully correct on the first attempt.

**Prerequisites:** multimeter, DC voltage, resistance, continuity, DC current, parallel and series connection, CAN termination (all defined in the sections above this block and in Chapters 3 and 4).

**Evidence of Mastery:** For each of six tasks the learner sets three choices (the meter's mode, whether the circuit's power is on or off, and whether the meter is connected across the points or in series with the wire) and commits. A task is fully correct when all three match the Correct row in Content. Mastery is 5 of 6 tasks fully correct on the first attempt. Trying settings in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Current is measured across two points, like voltage. (It is measured in series, by opening the circuit.) (2) Resistance can be measured in a live circuit. (The power must be off.) (3) Continuity is the same as voltage. (It tests for a connection and needs the power off.)

**Instructional Rationale:** An Apply-level use objective needs the learner to carry out a procedure, so the sim makes the learner set every part of a measurement, and shows what the meter would read, so a wrong setting produces a visible wrong result.

**Content:**

The meter has five modes: "DC voltage", "AC voltage", "Resistance", "Continuity", "DC current". The power choices are "Power on" and "Power off". The connection choices are "Across the points" and "In series (open the wire)". In Explore mode the learner can set the meter any way and choose any of the six circuits, and the sim shows what the display would read, or the warning "Short circuit: the fuse would blow" when the setting is wrong.

Six tasks in this fixed order:

| # | Task | Mode | Power | Connection | Expected reading | Why (shown as feedback) |
|---|---|---|---|---|---|---|
| 1 | Check that the 5 V arm supply gives about 5 V at its plug. | DC voltage | Power on | Across the points | About 5 V | Voltage is a difference between two points, so the probes go across them with the supply running. |
| 2 | Check that one wire of a servo cable has no break. | Continuity | Power off | Across the points | A beep | Continuity needs the power off and the probes at the two ends of the wire. |
| 3 | Check the CAN bus terminators of the reBot-DevArm bus. | Resistance | Power off | Across the points | About 60 Ω | Resistance is measured with the power off, across CAN_H and CAN_L, and two 120 Ω terminators in parallel give 60 Ω. |
| 4 | Check whether a fuse is blown. | Continuity | Power off | Across the points | A beep if the fuse is good | A good fuse is a connection, so it beeps, and an open fuse is silent. |
| 5 | Check whether the red and black supply wires touch each other. | Continuity | Power off | Across the points | Silence if they are apart | Continuity between the two supply wires means they touch, which is a short. |
| 6 | Find out how much current the arm draws from its supply. | DC current | Power on | In series (open the wire) | A current in amperes | Current flows through the wire, so the wire is opened and the meter is put in the gap. |

**Provenance:** The modes, connections and the power rules are from the chapter section "The Multimeter". Task 1 uses the 5 V supply from Chapter 3. Task 3 uses the 60 Ω reading from Chapter 4. The tasks are illustrative situations written for this sim.

**Rules:** Each task has exactly one correct combination of mode, power and connection. A combination is fully correct only when all three choices are correct. The sim does not give partial credit. In Explore mode, current mode with the connection "Across the points" on a powered circuit shows the "Short circuit" warning, and resistance mode with the power on shows "Reading is not valid".

**Learner Activity:**

1. In Explore mode the learner tries the modes on the circuits and reads the display. The learner should notice the warnings for current mode across a supply and for resistance on a powered circuit.
2. The learner switches to the six tasks. Task 1 is shown.
3. The learner sets the mode, the power state and the connection, and commits.
4. The sim shows whether all three were correct, the reading, and the Why text, then moves on. After task 6 it shows the score.

**Feedback:** Six tasks, fixed order, one attempt each. Correct: "Correct: <mode>, <power>, <connection>. <Why>". Incorrect: "Not quite. This task needs <mode>, <power>, <connection>. <Why>". The correct setting is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with the meter in DC voltage mode on the 5 V supply circuit, showing about 5 V.

**Chapter Anchors:** The chapter lists four modes (DC voltage, resistance, continuity, DC current) in a table and states that voltage is measured across two points, that current is measured in series, and that resistance needs the power off. The sim has six tasks, a task needs all three choices correct, and mastery is 5 of 6.
</details>

## Lab: Check a Part Before You Print It

In this lab you will write a small toolkit that reads an STL file, checks whether the part fits your printer's bed, estimates the plastic it needs, reads the filament from a G-code file, and checks a measured size against a tolerance. Everything runs on any computer with no printer, and the last step uses a real print plate from the SO-ARM100 repository. The one new Python idea is the **`struct` module**, which unpacks the numbers inside a block of bytes. You used it for packets in Chapter 4, and here it reads a file format. You will extend the `arm-lab` project.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the STL module.** A binary STL is 80 bytes of header, then a 4-byte count, then 50 bytes per triangle. `struct.Struct("<12fH")` describes one triangle: the `<` means little-endian, `12f` means twelve 4-byte decimals (the normal and the three corners), and `H` is the 2 spare bytes, for 50 bytes in all. `read_stl` reads the whole file, checks that its length matches the count (the test from the chapter), and unpacks each triangle with `unpack_from`, which reads at a given position. `bounding_box` finds the smallest and largest value of each axis, so the size of the part is high minus low. `volume_mm3` uses a neat trick: each triangle and the origin make a small pyramid, and adding the signed volumes of all the pyramids gives the volume of the solid. `write_box_stl` makes a test file, a box, from 12 triangles, so you have something to read. Create `armlab/stl.py`:

```python linenums="1"
"""Read and write binary STL files, the triangle-mesh format that slicers accept."""

import struct

HEADER_SIZE = 80                      # bytes of free text at the start of the file
TRIANGLE = struct.Struct("<12fH")     # normal (3), three vertices (9), 2 spare bytes: 50 bytes


def write_box_stl(path, dx, dy, dz):
    """Write a solid box with one corner at the origin as 12 triangles."""
    c = [(x, y, z) for x in (0, dx) for y in (0, dy) for z in (0, dz)]
    # Each face is two triangles, listed counter-clockwise when seen from outside.
    faces = [
        (0, 2, 3), (0, 3, 1),   # x = 0
        (4, 5, 7), (4, 7, 6),   # x = dx
        (0, 1, 5), (0, 5, 4),   # y = 0
        (2, 6, 7), (2, 7, 3),   # y = dy
        (0, 4, 6), (0, 6, 2),   # z = 0
        (1, 3, 7), (1, 7, 5),   # z = dz
    ]
    with open(path, "wb") as f:
        f.write(b"box".ljust(HEADER_SIZE, b" "))
        f.write(struct.pack("<I", len(faces)))
        for a, b, d in faces:
            f.write(TRIANGLE.pack(0, 0, 0, *c[a], *c[b], *c[d], 0))   # a zero normal: slicers recompute it


def read_stl(path):
    """Return the triangles of a binary STL file as a list of three (x, y, z) tuples each."""
    with open(path, "rb") as f:
        data = f.read()
    (count,) = struct.unpack_from("<I", data, HEADER_SIZE)
    if len(data) != HEADER_SIZE + 4 + count * TRIANGLE.size:
        hint = " (it starts with 'solid', so it may be an ASCII STL)" if data[:5] == b"solid" else ""
        raise ValueError("not a binary STL file: the size does not match the triangle count" + hint)
    triangles = []
    for i in range(count):
        values = TRIANGLE.unpack_from(data, HEADER_SIZE + 4 + i * TRIANGLE.size)
        v = values[3:12]                          # skip the 3 normal numbers
        triangles.append([tuple(v[0:3]), tuple(v[3:6]), tuple(v[6:9])])
    return triangles


def bounding_box(triangles):
    """Return ((min_x, min_y, min_z), (max_x, max_y, max_z)) of all the vertices."""
    points = [p for tri in triangles for p in tri]
    low = tuple(min(p[i] for p in points) for i in range(3))
    high = tuple(max(p[i] for p in points) for i in range(3))
    return low, high


def volume_mm3(triangles):
    """Volume of a closed mesh: add up the signed volume of a tetrahedron per triangle."""
    total = 0.0
    for a, b, c in triangles:
        cross = (b[1] * c[2] - b[2] * c[1],
                 b[2] * c[0] - b[0] * c[2],
                 b[0] * c[1] - b[1] * c[0])
        total += (a[0] * cross[0] + a[1] * cross[1] + a[2] * cross[2]) / 6
    return abs(total)
```

**Step 3. Write the checks.** `fits_bed` compares the part's length and width with the bed, trying both ways round, by sorting each pair of sizes. `mass_g` turns a volume into grams: 1,000 mm³ is 1 cm³, and the density of PLA is about 1.24 g/cm³. `filament_length_m` finds how long a 1.75 mm string holds that mass, using the area of the filament's circle. `check_dimension` returns whether a measured size is within the tolerance of the intended one, and the signed error. Create `armlab/printcheck.py`:

```python linenums="1"
"""Sanity checks to run on a part before it goes to the printer."""

import math

PLA_DENSITY_G_CM3 = 1.24      # typical for PLA; check the spool's label
FILAMENT_DIAMETER_MM = 1.75   # the common size; the other is 2.85 mm


def fits_bed(size_mm, bed_mm):
    """True if a part of size (x, y) fits on a bed of size (x, y), in either orientation."""
    (px, py), (bx, by) = sorted(size_mm[:2]), sorted(bed_mm[:2])
    return px <= bx and py <= by


def mass_g(volume_mm3, fill_fraction, density=PLA_DENSITY_G_CM3):
    """Mass of plastic if the given fraction of the part's volume is solid."""
    return volume_mm3 / 1000 * fill_fraction * density          # 1000 mm^3 = 1 cm^3


def filament_length_m(mass, density=PLA_DENSITY_G_CM3, diameter=FILAMENT_DIAMETER_MM):
    """Length of filament that holds `mass` grams of plastic."""
    area_mm2 = math.pi * (diameter / 2) ** 2
    return mass / density * 1000 / area_mm2 / 1000              # g -> cm^3 -> mm^3 -> mm -> m


def check_dimension(nominal, measured, tolerance):
    """Return (ok, error): is the measured size within +/- tolerance of the nominal one?"""
    error = round(measured - nominal, 3)
    return abs(error) <= tolerance, error
```

**Step 4. Write the G-code reader.** The file has one command per line. The function throws away the comment (everything after a `;`), and looks at lines that start with `G1`, a move. A word that begins with `E` is the total filament pushed so far, so the amount used in one move is the new `E` minus the old one. A retraction (the extruder pulls back a little to stop oozing) is a *negative* step and cancels the push that follows it, so adding the signed steps gives the net filament. `G92 E0` resets the count. Create `armlab/gcode.py`, and a short hand-made G-code file, `config/sample.gcode`:

```python linenums="1"
"""Read a few facts out of a G-code file."""


def filament_used_mm(lines):
    """Return (moves, filament_mm): the number of G1 moves and the filament pushed in total.

    Assumes absolute extrusion (M82), where E is the total pushed so far and G92 resets it.
    """
    moves, used, e_now = 0, 0.0, 0.0
    for raw in lines:
        line = raw.split(";")[0].strip()          # everything after ; is a comment
        if not line:
            continue
        words = line.split()
        if words[0] == "G92":                     # "set position": E restarts from a new value
            for w in words[1:]:
                if w[0] == "E":
                    e_now = float(w[1:])
        elif words[0] == "G1":
            moves += 1
            for w in words[1:]:
                if w[0] == "E":
                    e_new = float(w[1:])
                    used += e_new - e_now         # a retraction is negative, so it cancels the un-retract
                    e_now = e_new
    return moves, used
```

```text
; a tiny hand-written example, not from a real slicer
M82              ; absolute extrusion
G92 E0           ; start counting filament at zero
G1 Z0.2 F1200    ; move the nozzle to the first layer height
G1 X10 Y10 F3000 ; travel with no plastic
G1 X50 Y10 E1.6  ; print a line: 1.6 mm of filament pushed
G1 X50 Y30 E2.4  ; print a line
G1 E1.9          ; retract by 0.5 mm so the nozzle does not ooze
G1 X10 Y30       ; travel
G1 E2.4          ; un-retract
G1 X10 Y10 E4.0  ; print a line
```

**Step 5. Write the check script and run it.** The script makes a small block (40 × 20 × 10 mm) and a part that is too long (300 × 40 × 10 mm), reads each file back, and prints its size, volume, whether it fits a 220 × 220 mm bed, and the plastic it needs when it is fully solid and when it is 15 percent solid. It then reads the sample G-code and checks two measured sizes. The measured sizes (a block length of 40.12 mm and a screw hole of 3.05 mm) are made up for the lab. Create `partcheck.py`:

```python linenums="1"
"""Check a part before printing it: size, plastic needed, and G-code filament."""

from pathlib import Path

from armlab.gcode import filament_used_mm
from armlab.printcheck import check_dimension, filament_length_m, fits_bed, mass_g
from armlab.stl import bounding_box, read_stl, volume_mm3, write_box_stl

BED_MM = (220, 220, 250)          # an Ender-3-class bed, from the SO-ARM100 printing notes
HERE = Path(__file__).parent

write_box_stl(HERE / "block.stl", 40, 20, 10)
write_box_stl(HERE / "huge.stl", 300, 40, 10)

for name in ("block.stl", "huge.stl"):
    triangles = read_stl(HERE / name)
    low, high = bounding_box(triangles)
    size = tuple(round(h - l, 3) for l, h in zip(low, high))
    volume = volume_mm3(triangles)
    print(f"{name}: {len(triangles)} triangles, size {size} mm, volume {volume:.0f} mm^3")
    print(f"   fits the bed: {fits_bed(size, BED_MM)}")
    for fill in (1.0, 0.15):
        grams = mass_g(volume, fill)
        print(f"   {fill:>4.0%} solid: {grams:5.2f} g, {filament_length_m(grams):.2f} m of filament")

lines = (HERE / "config" / "sample.gcode").read_text().splitlines()
moves, used = filament_used_mm(lines)
print(f"sample.gcode: {moves} G1 moves, {used:.1f} mm of filament")

for feature, nominal, measured, tol in [("block length", 40.0, 40.12, 0.2), ("screw hole", 3.4, 3.05, 0.2)]:
    ok, err = check_dimension(nominal, measured, tol)
    print(f"{feature}: nominal {nominal}, measured {measured}, error {err:+.2f} -> {'ok' if ok else 'OUT OF TOLERANCE'}")
```

```bash
python partcheck.py
```

```text
block.stl: 12 triangles, size (40.0, 20.0, 10.0) mm, volume 8000 mm^3
   fits the bed: True
   100% solid:  9.92 g, 3.33 m of filament
    15% solid:  1.49 g, 0.50 m of filament
huge.stl: 12 triangles, size (300.0, 40.0, 10.0) mm, volume 120000 mm^3
   fits the bed: False
   100% solid: 148.80 g, 49.89 m of filament
    15% solid: 22.32 g, 7.48 m of filament
sample.gcode: 8 G1 moves, 4.0 mm of filament
block length: nominal 40.0, measured 40.12, error +0.12 -> ok
screw hole: nominal 3.4, measured 3.05, error -0.35 -> OUT OF TOLERANCE
```

Read the results as a designer would. The block fits, uses about 1.5 to 10 g of plastic, and its length is within 0.2 mm of 40 mm. The long part is rejected because 300 mm does not fit a 220 mm bed, with no need to slice it. The screw hole was designed at 3.4 mm and printed 3.05 mm, 0.35 mm small, which is out of the 0.2 mm tolerance and, with a 3.0 mm screw, leaves a clearance of only 0.05 mm: it is snug, and a screw would go in only with force. The G-code pushes 4.0 mm of filament in total: 1.6, then 0.8, then a 0.5 mm retraction, then 0.5 mm back, then 1.6.

!!! mascot-thinking "A Check Is Cheaper Than a Print"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Notice that the script rejected the long part in a few milliseconds, and the printer would have needed hours to find out the same thing. Turning a physical failure into a number that a program can test is one of the most useful habits in robotics, and you will use it again with joint limits and power in later chapters.

**Step 6. Try it on a real plate.** This step uses a real file from the SO-ARM100 repository. Download `Prusa_Follower_SO101.stl` from the repository's `STL/SO101/Follower` folder (the file is about 4.8 MB), and save it next to your scripts. Then create `plate_check.py`, which takes the file name when you run it:

```python linenums="1"
"""Check a real print plate from the SO-ARM100 repository: python plate_check.py FILE.stl"""

import sys

from armlab.printcheck import fits_bed, mass_g
from armlab.stl import bounding_box, read_stl, volume_mm3

BEDS = {"Ender-class (220 x 220)": (220, 220), "Prusa/UP-class (205 x 250)": (205, 250)}

triangles = read_stl(sys.argv[1])
low, high = bounding_box(triangles)
size = tuple(round(h - l, 1) for l, h in zip(low, high))
volume = volume_mm3(triangles)
print(f"{len(triangles)} triangles, size {size} mm, volume {volume / 1000:.0f} cm^3")
for name, bed in BEDS.items():
    print(f"   fits {name}: {fits_bed(size, bed)}")
print(f"plastic if 100% solid: {mass_g(volume, 1.0):.0f} g; if only 15% infill and no walls: {mass_g(volume, 0.15):.0f} g")
```

```bash
python plate_check.py Prusa_Follower_SO101.stl
```

```text
96584 triangles, size (243.4, 204.9, 87.0) mm, volume 571 cm^3
   fits Ender-class (220 x 220): False
   fits Prusa/UP-class (205 x 250): True
plastic if 100% solid: 709 g; if only 15% infill and no walls: 106 g
```

The file has exactly the 96,584 triangles whose size the chapter computed (80 + 4 + 50 × 96,584 = 4,829,284 bytes). The plate is 243.4 mm long and 204.9 mm wide, so it fits the Prusa-class bed (205 × 250 mm) by 0.1 mm in one direction and does not fit the Ender-class bed. The Ender plates are different files for that reason, and they are ASCII STL files, so `read_stl` will refuse one with an error that says so:

```text
ValueError: not a binary STL file: the size does not match the triangle count (it starts with 'solid', so it may be an ASCII STL)
```

If your computer shows a different number for the size or the volume, the repository may have updated the file since this chapter was written. The method is what matters.

**Step 7. Record your work.**

```bash
git add .
git commit -m "Add STL reader, print checks, and G-code filament reader"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python partcheck.py` reports `huge.stl` as not fitting the bed, and `sample.gcode` as `4.0 mm of filament`.
- The screw-hole check says `OUT OF TOLERANCE` for a hole of 3.05 mm designed at 3.4 mm.
- `python plate_check.py Prusa_Follower_SO101.stl` prints `96584 triangles`.
- Earlier scripts (`bus_demo.py`, `cost_demo.py`) still run.
- `git log --oneline` shows a seventh commit.

### Challenge: Read the ASCII Plate

An ASCII STL stores each triangle as text, and each corner is a line such as `vertex 12.5 4.0 0.0`. Write a function `read_ascii_stl(path)` that returns the same list of triangles as `read_stl`, by reading the file line by line and collecting every three `vertex` lines into one triangle. Then run `bounding_box` and `volume_mm3` on `Ender_Follower_SO101.stl`. Does its volume agree with the Prusa plate's?

??? note "Click to see one solution"
    Add this to `armlab/stl.py`. A `for` loop over an open file gives one line at a time, `split()` cuts a line into words, and the three numbers after the word `vertex` are the corner:

    ```python linenums="1"
    def read_ascii_stl(path):
        """Return the triangles of an ASCII STL file, in the same form as read_stl."""
        triangles, corners = [], []
        with open(path) as f:
            for line in f:
                words = line.split()
                if words and words[0] == "vertex":
                    corners.append(tuple(float(w) for w in words[1:4]))
                    if len(corners) == 3:
                        triangles.append(corners)
                        corners = []
        return triangles
    ```

    Running it on the Ender follower plate gives 96,584 triangles, a size of about 216.3 × 215.3 × 87.0 mm, which fits a 220 × 220 mm bed, and a volume of about 571 cm³. The Prusa plate has the same 96,584 triangles and about 571 cm³: the two plates hold the same parts in a different arrangement, so the plastic needed is the same and only the layout changes. The ASCII file is about five times larger, since a number takes several characters of text where the binary form takes four bytes.

## Summary and Key Takeaways

You can now make, check and prepare the parts of an arm.

- **3D printing** adds material in layers. An **FDM printer** melts **filament** in a nozzle and draws each layer on a bed. **PLA** is the easy plastic that the SO-ARM101 uses (as PLA+), and it softens at about 60 to 65 °C. **PETG** keeps its shape to a higher temperature. **3D printer safety** means hot parts, fresh air, a clear surface, and never leaving a print unattended.
- A **STEP file** holds exact CAD shapes, an **STL file** holds a mesh of triangles, and a **slicer** turns an STL into **G-code**, the text that drives the printer. A binary STL is 80 + 4 + 50 bytes per triangle.
- **Print settings** are **layer height**, **infill**, **support material** and **print orientation**. The repository asks for PLA+, 0.2 mm layers on a 0.4 mm nozzle, 15 percent infill, and supports almost everywhere. A part is weakest between layers. **Warping** is the curl of a part cooling on the bed.
- **Dimensional tolerance** is the allowed error, about ±0.1 to ±0.3 mm for FDM. Holes print small, so leave about 0.15 to 0.2 mm of clearance. **Print quality inspection** is look, feel, measure, test-fit, and the repository's gauges test the fit cheaply.
- **Fasteners** and **screws** here are M3 × 6 and M2 × 6. Stop turning when a screw is snug. A **heat-set insert** is a metal thread melted into plastic, used in other designs. A **servo horn** fits the 25-tooth spline of the STS3215.
- **Assembly tools** are #0 and #1 Phillips screwdrivers, a putty knife, a small screwdriver and clamps. **Crimping** joins a wire to a terminal by squeezing. **Soldering** joins metal with a melted alloy and needs **soldering safety**. **Cable management** and **strain relief** stop wires breaking where they bend.
- A **multimeter** measures voltage across two points, resistance with the power off, and current in series. In the lab, Python reads an STL, checks that it fits the bed, estimates plastic, and checks a tolerance.

!!! mascot-celebration "You Can Make and Check My Bones!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just learned how a printer builds a part, wrote a script that reads an STL file and tells you whether it fits your bed, how much plastic it needs and whether a measured hole is in tolerance, and learned which meter mode to trust. With printed parts, screws and a tested set of tools, you have everything the build needs. Let's move it on to Chapter 8!

### Self-Check Questions

Test yourself before you move on. Click each question to reveal an answer.

??? question "1. A tall part is 60 mm high. How many layers does it have at 0.2 mm and at 0.4 mm, and what is the trade-off?"
    At 0.2 mm it has \( 60 / 0.2 = 300 \) layers, and at 0.4 mm it has 150. The thicker layers print in roughly half the passes, so the part finishes sooner, but the surface is coarser. The nozzle limits the layer height to about three quarters of its width.

??? question "2. A binary STL file is 5,000,084 bytes long. How many triangles does it hold?"
    Subtract the 80-byte header and the 4-byte count to leave 5,000,000 bytes, then divide by 50 bytes per triangle: \( 5{,}000{,}000 / 50 = 100{,}000 \) triangles.

??? question "3. A servo pocket is designed 25.0 mm wide and the printer's holes come out 0.2 mm small. Will the 24.7 mm servo fit, and with what clearance?"
    The pocket prints \( 25.0 - 0.2 = 24.8 \) mm. The clearance is \( 24.8 - 24.7 = 0.1 \) mm, which is the lower edge of a sliding fit, so it should fit, but snugly. A little more room would be safer.

??? question "4. Why should a peg that has to carry a sideways load be printed lying down rather than standing up?"
    A printed part is weakest *between* layers, where it is a weld, and strongest along the strands inside a layer. A standing peg has layer welds across its width, so a sideways load can snap it along one layer. A lying peg has strands that run along its length.

??? question "5. You want to know how much current a servo draws. Which mode do you use, and how do you connect the meter?"
    Use the DC current mode, and connect the meter in series: open the supply wire and put the meter in the gap, so the current flows through the meter. Connecting it across the supply in this mode is a short circuit.

??? question "6. A cable to a servo works when the arm is still and glitches when the elbow moves. What is the likely cause, and what do you check?"
    The conductor has probably broken inside the insulation where the cable bends, or the plug is pulling out under strain, which gives a fault that comes and goes. Move the joint slowly and watch for the glitch, check for a sharp bend or a tight tie near the connector, and add slack or strain relief.

Chapter 8 puts the parts together: you will prepare the servos, give each one its ID, assemble the follower and leader arms, power on for the first time, and calibrate.

[See Annotated References](./references.md)
