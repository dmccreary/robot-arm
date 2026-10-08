---
title: "Sourcing Parts and Planning a Budget"
description: "How to turn an arm design into a parts order: reading a bill of materials, comparing kit and self-sourced builds, vendors, lead times, shipping and taxes, spare parts, counterfeit and incompatible parts, and totaling a landed cost in Python."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 17:10:00"
version: 1.11
---

# Sourcing Parts and Planning a Budget

## Summary

This chapter shows how to turn an arm design into a parts order. You will read a bill of materials, compare kit and self-sourced builds, evaluate vendors and lead times, and watch for counterfeit or incompatible parts. After this chapter, you will be able to build and total a budget for an SO-ARM100 or reBot-DevArm in Python.

## Concepts Covered

This chapter covers the following 32 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| SO-ARM100 | 92 |
| reBot-DevArm | 91 |
| Bill of Materials | 63 |
| Distributor | 20 |
| Lead Time | 16 |
| Shipping and Customs | 14 |
| Total Build Cost | 13 |
| Spare Parts | 7 |
| Classroom Parts Order | 6 |
| Required Parts | 5 |
| reBot B601-DM | 4 |
| Datasheet | 4 |
| Substitute Parts | 3 |
| Part Revisions | 3 |
| CSV Parts List | 3 |
| Kit Build | 2 |
| Online Marketplace | 2 |
| Budgeting | 2 |
| SO-ARM101 | 2 |
| Vendor Documentation | 2 |
| Optional Parts | 1 |
| Self-Sourced Build | 1 |
| Official Kit | 1 |
| Direct from Manufacturer | 1 |
| Cost Calculator | 1 |
| Order Tracking | 1 |
| Counterfeit Parts | 1 |
| Incompatible Parts | 1 |
| SO-ARM100 vs SO-ARM101 | 1 |
| reBot B601-RS | 1 |
| Fact-Checking Specifications | 1 |
| Totaling Costs in Python | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)

---

!!! mascot-welcome "Time to Go Shopping!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    Before I can move, someone has to buy my parts, and a wrong order costs weeks and real money. In this chapter you will learn to read a parts list, spot what is missing, and total the true cost with a short Python script. Let's move it!

You now know what is inside an arm, how it is powered, and how it is commanded. This chapter answers the practical question that comes next: *what do I buy, from whom, and what will it really cost?* The answer is more than adding up prices. A parts list can leave out the plastic that holds the motors. A cheap listing can be the wrong voltage. A shipping fee can add a quarter to the bill, and a part that arrives broken can stop a whole classroom.

This chapter uses real numbers. The bill of materials for the SO-ARM101 comes from its open-source repository, the reBot-DevArm's from Seeed's repository, and the figures for a real purchase come from this project's own [procurement notes](../../procurement-notes.md), which record what the SO-ARM101 motor kit really cost on 2026-10-06. Prices change often, so every price in this chapter has a source and a date, and the habit of writing those down is one of the chapter's lessons.

## Choosing an Arm

This book follows two arms, and the choice between them decides almost everything about the order: how much it costs, which parts you must make, and how much help you can find. The next sections describe each in sourcing terms.

### The SO-ARM100 and SO-ARM101

The **SO-ARM100** is the open-source arm from The Robot Studio, designed with Hugging Face, that Chapter 2 introduced. The **SO-ARM101** is its successor, and the repository describes it as having improved wiring, easier assembly (no gear removal), and updated motors for the leader arm, and it marks the older SO-100 documentation as deprecated. The repository covers both arms, so the name you meet depends on the vendor. The practical points of **SO-ARM100 vs SO-ARM101** are the following.

| | SO-ARM100 | SO-ARM101 |
|---|---|---|
| Status | The earlier design, with deprecated documentation | The current design, used in this book |
| Wiring and assembly | Gear removal is needed during assembly | Improved wiring, no gear removal |
| Leader arm motors | Earlier selection | Updated motors with mixed gear ratios (Chapter 2) |
| Parts compatibility | Printed parts differ from the SO-ARM101's | Use the SO-ARM101's parts and instructions |

An arm of this family is built from the same parts list each time: twelve STS3215 servos for the pair (six for the follower and six for the leader), two servo control boards, cables, two power supplies, clamps, and the 3D-printed parts. The follower's motors can be the 7.4 V or the 12 V version, and the leader's are always 7.4 V, which is why Chapter 3 told you to check the voltage on every part. It is a low-cost entry: the project's own list prices the follower arm's parts at about $122, and the leader and follower pair at about $230, without the printed parts. This book's own build comes to about $350: the motor kit was $332.04 delivered, and the printed parts add $20 or more.

### The reBot-DevArm

The **reBot-DevArm** is Seeed Studio's open-source arm. It comes in two versions that share one design, the **reBot B601-DM** with Damiao motors on a 24 V supply and the **reBot B601-RS** with RobStride motors on a 48 V supply (Chapters 3 and 5). It is a bigger and more costly project. Its repository publishes a bill of materials for each version, and the parts include machined (CNC) components as well as 3D-printed ones, so the arm cannot be built from a printer and a few screws alone. News coverage at the launch of the B601-DM gave a starting price of about €1,120 for the arm.

| | SO-ARM101 | reBot B601-DM | reBot B601-RS |
|---|---|---|---|
| Motors | 12 STS3215 for a leader and follower pair | 4 DM4310 and 3 DM4340P | 4 RS00 and 3 RS06 |
| Motor cost in the project's bill of materials | $13.89 each | $120 (DM4310) and $175 (DM4340P) | $125 (RS00) and $210 (RS06) |
| Supply voltage | 5 V (7.4 V motors) | 24 V | 48 V |
| Frame parts | 3D-printed | 3D-printed and CNC-machined | 3D-printed and CNC-machined |
| Approximate Cost | $350 | About $1,200 to $1,500 | About $1,400 and up |

## Reading a Bill of Materials

A **bill of materials** (BOM) is the list of every part a build needs, with the quantity of each, its supplier, and its price. It is the most important document in this chapter, because the order *is* the BOM. A BOM line has a few fields, and the SO-ARM100 repository's list shows them well. This is a part of its table for two arms, with unit costs in US dollars, from the repository on 2026-10-07.

| Part | Amount | Unit cost (US) | Line total |
|---|---|---|---|
| STS3215 servo 7.4 V, 1/345 gear (C001) | 7 | $13.89 | $97.23 |
| STS3215 servo 7.4 V, 1/191 gear (C044) | 2 | $13.89 | $27.78 |
| STS3215 servo 7.4 V, 1/147 gear (C046) | 3 | $13.89 | $41.67 |
| Motor control board | 2 | $10.60 | $21.20 |
| USB-C cable (2 pieces) | 1 | $7.00 | $7.00 |
| Power supply | 2 | $10.00 | $20.00 |
| Table clamp (4 pieces) | 1 | $9.00 | $9.00 |
| Screwdriver set | 1 | $6.00 | $6.00 |
| **Total** | | | **$229.88** |

The three servo lines show something to look for in any BOM: the *same* motor in different gear ratios, with different part codes, because the leader arm uses mixed gearing (Chapter 2). Ordering twelve of the C001 would be a mistake that the table prevents. Some lines list the number of pieces in a pack (the clamp line has four pieces, so one pack covers both arms), and the quantity column counts packs, not pieces.

Not every line is equal. **Required parts** are those the arm cannot work without: the servos, the control boards, the power supplies. **Optional parts** improve the build but are not needed: the screwdriver set in the table, if you already own one, and the compliant grippers, camera mounts and tactile sensors that the repository lists as add-ons. Mark each line as required or optional in your own list, and total the two groups separately, as the lab does.

A BOM is only as good as its sources, so check four documents beside it. A **datasheet** is the manufacturer's specification for one part, with its voltage range, current, and dimensions, and it is the authority on what the part can do (the STS3215 numbers in Chapter 5 came from one). **Vendor documentation** is the seller's own pages: what the listing says is in the box, which version it is, and what is *not* included. A **CSV parts list** is a BOM saved in a plain comma-separated text file, which a spreadsheet can open and a Python program can read, and it is the format of this chapter's lab. And **part revisions** are the version numbers of a part: a listing that says "V1.2" and one that says "V1.1" may differ in torque, size, or connector, and a BOM written for one revision can be wrong for another.

!!! mascot-thinking "A BOM Is a Recipe, Not a Receipt"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A BOM tells you what to buy *to follow the build*, at the prices of the day it was written. It does not know your shipping, your taxes, or the vendor you will choose. Treat its total as the cost of the parts and expect the real bill to be higher.

## Ways to Buy

The same arm can be bought in several ways, and each trades money against time and risk. The table compares the five most common, and the sections after it explain each in turn.

| Way to buy | What you do | Typical advantage | Typical risk |
|---|---|---|---|
| Official kit | Buy a complete kit from the project's partner vendors | Everything matches the design | Higher price, vendor stock |
| Kit build | Buy a kit of motors and electronics, and print or buy the frame | Motors and boards already matched | Printed parts are separate |
| Self-sourced build | Buy every part yourself from the BOM | Lowest list price, full control | Many orders, many chances for an error |
| Direct from the manufacturer | Order from the maker of a part | Authentic parts, official support | Shipping from abroad, minimum quantities |
| Online marketplace | Order from a marketplace seller | Low price, many choices | Quality varies, long shipping |

An **official kit** is a bundle that the project or its partner vendors sell: the SO-ARM100 repository names Seeed Studio, WowRobo, Robonine, PartaBot, ForgeMotion Labs, RoboSEasy and Autodiscovery, and says that vendors offer printed-part kits, assembled versions, electronics kits and complete arm kits. A **kit build** is the middle path this project took: the motor kit arrives with the servos, boards and cables, and the frame comes separately. The project's order, on 2026-10-06, was the SO-ARM101 "Kit Pro" motor kit from a marketplace seller, and the listing states plainly that the 3D-printed parts are *not* included. The listing's photograph of the kit shows twelve STS3215 servos, each with its own small bag of horns and screws, plus two control boards, two power supplies and the cables. Twelve is exactly what the pair needs, so the kit has no spare servo.

A **self-sourced build** means you buy each part in the BOM yourself, from the links the repository gives for the United States, Europe, China and Japan. It can give the lowest list price, but it is also the most work: a dozen orders from several sellers, each with its own shipping. A **distributor** is a company that stocks parts from many manufacturers and sells them in small quantities, and it is the usual source for the commodity parts of a BOM, such as connectors, cables, power supplies and fasteners. Buying **direct from the manufacturer** is the route for a specialised part, such as a Damiao motor from Damiao's own channels, and it gives the best guarantee that the part is genuine and the best access to documentation. An **online marketplace** is a site where many independent sellers list the same kinds of parts. Prices are often the lowest, and the quality, the labelling and the shipping time vary the most.

The printed parts are their own choice. You can print them yourself (the repository gives the settings recorded in the procurement notes: PLA+, a 0.4 mm nozzle at 0.2 mm layers, 15 percent infill, and supports almost everywhere), pay a printing service (the repository points to a list of them), or buy a ready-made set of printed parts. Chapter 7 covers printing in detail.

!!! mascot-neutral "Printing Comes Next"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    Chapter 7 covers the printed parts, the fasteners and the tools in detail, and it adds their cost to the budget you start here.

Whichever way you buy, the next question is what the listing actually includes, and the answer is often less than the photograph suggests.

!!! mascot-warning "Check What Is Not in the Box"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A motor kit can arrive complete and still leave you unable to build, because the frame, the screws, the power supply, or the computer are separate. Before you pay, read the listing's "includes" and "does not include" lines, and tick off each BOM line against them. Whatever is not in the box must be on a second list with a source of its own.

## Time and Money

A parts order has two costs that a BOM does not show: the time it takes to arrive, and the money added on top of the sticker price.

### Lead Time and Order Tracking

**Lead time** is the time from placing an order to receiving the goods. It has two parts, the *processing* time before the seller ships and the *transit* time on the way, and for a build it is set by the *slowest* part, because you cannot start assembly without the last one. A listing usually shows only one estimate, so ask the seller or read the shipping options before you pay. **Order tracking** is how you watch the order: save the order number and the tracking number the day you buy, check the carrier's page, and note the promised date, so that a late parcel is noticed on the day it is late and not three weeks after.

You can compute dates in Python with the `datetime` module. A `date` object, and a `timedelta` for a span of days, give the expected arrival of an order. The numbers below are illustrative lead times for three parts of one order, and the latest of the three decides when you can build:

```python linenums="1"
from datetime import date, timedelta

ordered = date(2026, 10, 6)
transit_days = {"motor kit": 21, "printed parts": 10, "power supplies": 7}   # illustrative

arrivals = {part: ordered + timedelta(days=days) for part, days in transit_days.items()}
for part, when in arrivals.items():
    print(f"{part:<15}{when}")
print("You can start building on", max(arrivals.values()))
```

```text
motor kit      2026-10-27
printed parts  2026-10-16
power supplies 2026-10-13
You can start building on 2026-10-27
```

### Shipping and Customs

**Shipping and customs** cover everything that is charged to move the goods to you and into your country. Shipping is the carrier's fee. Customs is the import duty and tax that some countries charge on goods that cross the border, and the rules depend on the country, the kind of goods and the date, so check the checkout page for whether duties are included. The project's own order shows the other charges that appear even when the goods are not taxed at the border. The sticker price was $258.94 for the kit, and the order added $46.55 for shipping, $26.05 in sales tax (collected by the marketplace, which the law treats as the seller of record), and a $0.50 retail delivery fee that Minnesota and Colorado charge on orders shipped to them. None of the charges on that order was a tariff.

### Total Build Cost and Budgeting

The **total build cost** is the sum of *everything* needed to finish the build, and the number that matters is the **landed cost**, which is the sticker price plus shipping, tax, and fees, as it arrives at your door. The kit order is the worked example:

\[ 258.94 + 46.55 + 26.05 + 0.50 = 332.04 \]

The landed cost of $332.04 is $73.10 above the sticker price, an overhead of \( 73.10 / 258.94 \approx 28.2 \) percent. A **budget** is a plan for that total, written before you buy, with a line for each BOM group, a margin for surprises, and an amount you decide in advance you will not exceed. **Budgeting** is the habit of keeping it up to date as real prices replace estimates. For the SO-ARM101, a first budget has a line for each of the following, and the lab turns it into a program.

!!! mascot-thinking "The Landed Cost Is the Real Price"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    Only one number answers "can I afford this?", and it is the one printed on your card statement. Quote prices to your students and your parents as landed costs, and keep the sticker price as a separate column so you can see how much the extras added.

| Budget line | How to estimate it | Example for this project |
|---|---|---|
| Motor kit, landed | Sticker price plus shipping, tax and fees | $332.04 (the project's order) |
| 3D-printed parts | Filament if you print, or the vendor's price | $20 or more if you print them (Chapter 7) |
| Power supplies | The BOM's line, with shipping | $10 each in the repository's list |
| Fasteners and tools | The BOM's lines, with shipping | A screwdriver set at $6 in the list |
| Spare parts | A percentage of the servos and cables | One spare STS3215 servo at $13.89, before shipping (the kit has none) |
| Margin | 10 percent of the total | Decided before ordering |
| **Approximate total for the pair** | Motor kit plus printed parts, before the margin | **About $350** ($332.04 + $20 or more) |
| **Total with one spare servo** | The total above plus the spare | **About $364** ($350 + $13.89) |

!!! mascot-tip "Write the Source and the Date Beside Every Price"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    A price with no date is a rumour. In your parts list, keep a column for the source (a URL) and the date you saw it, and take a screenshot of the listing at the moment you buy, as the procurement notes do. When a price later changes, you will know whether the list or the world changed.

### Spare Parts

**Spare parts** are extra units you buy now because you may need them later. Two kinds of failure justify them. Servos can burn out or strip their gears when a joint is overloaded, which is the risk Chapter 5 described, and a build with no spare servo stops until a replacement arrives, a wait that can be weeks from an overseas seller. Printed parts crack, and you can reprint them, but only if the file and a printer are at hand. A common plan is one or two spare servos for each pair of arms (the kit we bought has none, so a spare is an extra purchase, and the budget above includes one), a spare cable of each kind, and a few spare screws. The extra cost is small next to the weeks it saves.

### Classroom Parts Orders

A **classroom parts order** multiplies a single build by the number of student teams and adds the spares for the whole class. The numbers grow quickly, and so do the places for an error. Here is a worked example. A class of 12 students working in pairs needs 6 leader-and-follower sets. Each set needs 12 servos, so the class needs 72. A 10 percent spare allowance is \( 0.10 \times 72 = 7.2 \), rounded *up* to 8 spare servos, for 80 servos in all, which at $13.89 each is \( 80 \times 13.89 = \$1111.20 \). Rounding up matters: a plan that rounds 7.2 down to 7 is short by a motor.

### Cost Calculator

A **cost calculator** is a tool that totals a BOM and adds the extras, and a spreadsheet or a Python script can be one. The first MicroSim here is a small one. You enter the sticker price, shipping, tax and fees of an order, and it shows the landed cost and the overhead. After you explore, four problems check that you can total an order yourself, including the project's own.

#### Diagram: Landed Cost Calculator

<details markdown="1">
<summary>Landed Cost Calculator</summary>
Type: microsim
**sim-id:** landed-cost-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the landed cost, the overhead percentage or the remaining budget of a parts order from its sticker price, shipping, tax and fees, to within one cent (or 0.1 percent), in five problems, with at least 4 of 5 correct on the first attempt.

**Prerequisites:** bill of materials, shipping and customs, total build cost, landed cost, overhead, budgeting (all defined in the sections above this block).

**Evidence of Mastery:** For each of five problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.01 dollars (or 0.1 percentage points) of the Correct column in Content. Mastery is 4 of 5 correct on the first attempt. Changing the order amounts in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The sticker price is what you pay. (Shipping, tax and fees are added.) (2) Overhead is a percentage of the landed cost. (It is a percentage of the sticker price.) (3) Tax applies to every charge in the same way. (Each problem states what the tax applies to.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of a procedure on new numbers with an immediate check. The sim shows each charge as a stacked bar on top of the sticker price, so the overhead is seen before it is computed.

**Content:**

Explore mode has four amounts the learner can change (sticker price, shipping, tax and fees), and shows the landed cost and the overhead, with the formulas landed = sticker + shipping + tax + fees and overhead = (landed − sticker) / sticker × 100.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Sticker price | 0 | 2000 | 0.01 | 258.94 | USD |
| Shipping | 0 | 300 | 0.01 | 46.55 | USD |
| Tax | 0 | 300 | 0.01 | 26.05 | USD |
| Fees | 0 | 50 | 0.01 | 0.50 | USD |

Five problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | A kit has a sticker price of $258.94, shipping of $46.55, tax of $26.05 and a $0.50 fee. What is the landed cost? | USD | 332.04 | 258.94 + 46.55 + 26.05 + 0.50 = 332.04. |
| 2 | For the order in problem 1, what is the overhead as a percentage of the sticker price? | percent | 28.2 | (332.04 − 258.94) / 258.94 × 100 = 28.23. |
| 3 | A $120 motor has $15 shipping and 7 percent sales tax on the item price only. What is the landed cost? | USD | 143.40 | Tax is 0.07 × 120 = 8.40, and 120 + 15 + 8.40 = 143.40. |
| 4 | Four motors at $120 and three at $175, with $60 shipping and no tax. What is the landed cost? | USD | 1065.00 | 4 × 120 + 3 × 175 = 1005, and 1005 + 60 = 1065. |
| 5 | You have $350 and place the order in problem 1. How much is left? | USD | 17.96 | 350 − 332.04 = 17.96, which is less than the $20 or more that the printed parts cost. |

**Provenance:** Problems 1, 2 and 5 use the project's order from the procurement notes (2026-10-06). The motor prices in problem 4 are from the reBot B601-DM bill of materials. Problem 3 is illustrative.

**Rules:** landed = sticker + shipping + tax + fees, rounded to cents. Overhead = (landed − sticker) / sticker × 100, rounded to one decimal. A typed answer is correct when |typed − correct| <= 0.01 for dollars and <= 0.1 for percent. The typed value has minimum 0, maximum 10000, step 0.01, and no default.

**Learner Activity:**

1. In Explore mode the learner changes the four amounts and watches the stacked bar, the landed cost and the overhead update. The learner should notice that shipping and tax together add more than a quarter to the sticker price in the default order.
2. The learner switches to the five problems. Problem 1 is shown.
3. The learner types an answer and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 5 it shows the score.

**Feedback:** Five problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 5" is shown and the final screen says whether mastery (4 of 5) was reached.

**Starting State:** Explore mode with the defaults, showing a landed cost of $332.04 and an overhead of 28.2 percent.

**Chapter Anchors:** The chapter's worked example is 258.94 + 46.55 + 26.05 + 0.50 = 332.04, an overhead of $73.10 or 28.2 percent. The sim has five problems and mastery is 4 of 5.
</details>

## Pitfalls

Most of the money lost on a first build is lost on a handful of mistakes. They are easy to avoid if you know their shapes.

**Counterfeit parts** are copies sold under the name of a genuine part. A servo marked STS3215 that is a cheaper motor in a similar case will not behave like one, and it may fail early. Warning signs are a price far below every other seller's (the BOM lists the STS3215 at $13.89, so an "STS3215" at $5 deserves doubt), no model or gear-ratio on the listing, photos copied from another seller, and a seller with no history. For servos, Chapter 4 gives you a test: the model number is stored in a register, at address 3 with a size of 2 bytes, and LeRobot's tables list 777 as the STS3215's. A clone can copy that number, so a matching result does not prove a part is genuine, but a *wrong* number proves it is not what the listing says.

**Incompatible parts** are genuine parts that do not work with the others in your build: a 12 V servo on a 5 V supply, a servo board for hobby PWM servos in a build of bus servos, or a printed part for the SO-ARM100 in an SO-ARM101. They are the most expensive mistake because the part itself is fine and the problem is in the combination. The cure is to check each part against the BOM line, not the picture, and to write the *voltage*, the *bus type* and the *revision* next to every part.

**Substitute parts** are parts you buy instead of the one in the BOM, because it was out of stock or too costly. Some substitutions are safe, such as a power supply with the same voltage and polarity and a higher current rating (Chapter 3), or a different brand of screw with the same size. Some are not: a motor with a different gear ratio changes how the joint moves and breaks the leader and follower match. A substitute is safe when you can show, from datasheets, that every number that matters is equal or better, and not otherwise.

!!! mascot-warning "A Cheap Part That Does Not Match Costs Twice"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A wrong-voltage servo or a counterfeit motor can destroy a board or stop a build, and the return shipping from overseas can cost more than the part. Before you buy, match the listing's model, voltage, gear ratio and revision to the BOM line, and when you receive the parts, test one before you assemble all of them.

### Fact-Checking Specifications

Specifications in articles, listings and even repositories can disagree, and the safest habit is to treat each number as a claim until two independent sources agree. **Fact-checking specifications** means finding the primary source (the datasheet or the maker's documentation), comparing it with what the seller says, and writing down which source you trusted and when. A real example from this book: Seeed's guide lists the DM4310 with a rated torque of 3 N·m and a peak of 7 N·m, while one reseller's listing for a DM-J4310-2EC V1.2 gives a rated torque of 3.5 N·m and a peak of 12.5 N·m. They could describe different revisions, or one could be wrong, and a build that depended on the peak torque would have to find out which. The next MicroSim practises the habit of looking critically at listings.

#### Diagram: Sourcing Listing Checker

<details markdown="1">
<summary>Sourcing Listing Checker</summary>
Type: microsim
**sim-id:** sourcing-listing-checker<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight parts listings as Buy, Check first or Avoid by comparing each with the bill of materials, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** bill of materials, datasheet, vendor documentation, part revisions, counterfeit parts, incompatible parts, substitute parts, fact-checking specifications (all defined in the sections above this block).

**Evidence of Mastery:** For each of eight listings the learner chooses one of three verdicts and commits. A choice is correct when it matches the Verdict column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the BOM reference in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The cheapest listing is the best deal. (A price far below the BOM suggests a counterfeit or the wrong part.) (2) A genuine part is always the right part. (It must also match the voltage, bus and revision of the build.) (3) A kit has everything. (The listing says what is not included.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to tell similar-looking cases apart on the evidence. A fixed reference BOM and a plan give the learner the criteria, so each listing must be compared with them and not judged by its appearance.

**Content:**

The reference plan for every listing is an SO-ARM101 build that uses 7.4 V STS3215 servos at $13.89 each, a 5 V power supply with a 5.5 × 2.1 mm barrel jack, and servo control boards for serial bus servos. The three verdicts are: "Buy", "Check first", "Avoid". Eight listings in this fixed order:

| # | Listing text | Verdict | Why (shown as feedback) |
|---|---|---|---|
| 1 | "STS3215 servo, 7.4 V, 1/345 gear, model C001, $13.89" | Buy | It matches the BOM line in model, voltage, gear ratio and price. |
| 2 | "Bus servo, compatible with SO-ARM, $4.99, no model number or gear ratio given" | Avoid | The price is far below the BOM's $13.89 and the listing names no model, which are signs of a counterfeit or a wrong part. |
| 3 | "STS3215 servo, 12 V version, 1/345 gear, $17.50" | Check first | It is a genuine option, but it needs a 12 V supply of 5 A or more, which the plan does not have. |
| 4 | "SO-ARM101 motor kit, 12 servos, boards and cables" with no line about printed parts | Check first | The listing does not say whether the printed frame is included, and it must be stated before paying. |
| 5 | "Power supply, 5 V, 4 A, 5.5 × 2.1 mm barrel plug, polarity diagram shown" | Buy | It matches the plan's voltage and plug, and the polarity is documented. |
| 6 | "Motor control board, works with any servo", photographs show three-pin PWM headers only | Avoid | PWM headers drive hobby servos, not serial bus servos. |
| 7 | "SO-ARM100 printed parts, old version" for an SO-ARM101 build | Avoid | The SO-ARM101 changed the wiring and assembly, so the older printed parts are the wrong revision. |
| 8 | "reBot-DevArm B601-RS, 48 V" for a plan with a 24 V power supply | Check first | The arm is genuine, but it needs a 48 V supply, so the plan must change before ordering. |

**Provenance:** The listings are illustrative and written for this sim. The reference values (the $13.89 price, the 7.4 V motors with a 5 V supply, the 12 V option with a 12 V supply of 5 A or more, and the 48 V supply of the B601-RS) come from the SO-ARM100 and reBot-DevArm repositories, as quoted in the chapter. The sim labels the listings "illustrative".

**Rules:** Each listing has exactly one correct verdict. "Buy" means it matches the plan on every checked field. "Check first" means a genuine part that conflicts with the plan or leaves a key field unstated. "Avoid" means the evidence points to a counterfeit, an incompatible bus or the wrong revision.

**Learner Activity:**

1. In Explore mode the learner reads the reference plan and the three verdicts with a one-line meaning of each.
2. The learner switches to the eight listings. Listing 1 is shown next to the reference plan.
3. The learner chooses a verdict and commits.
4. The sim shows whether the choice was correct and the Why text, marking the field that decided it. After listing 8 it shows the score.

**Feedback:** Eight listings, fixed order, one attempt each. Correct: "Correct: <verdict>. <Why>". Incorrect: "Not quite. This listing is <verdict>. <Why>". The correct verdict is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the reference plan on view and the prompt "Compare each listing with the plan."

**Chapter Anchors:** The chapter states the STS3215's BOM price of $13.89, the 5 V supply for the 7.4 V motors, the 12 V supply of 5 A or more for the 12 V motors, and the 48 V supply of the B601-RS. The sim has eight listings and mastery is 7 of 8.
</details>

## Lab: Total the Cost in Python

In this lab you will total a parts list from a CSV file, add the landed-cost extras, and check a delivery with the pretend bus. The one new Python idea is the `csv` module, which reads a CSV file row by row. You will extend the `arm-lab` project, and you will need the `read_register` function from Chapter 5.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the parts list.** The file is the SO-ARM100 repository's bill of materials for two arms, with the screwdriver set marked as optional and one spare servo added, as the spare-parts plan above recommends (the kit we bought has none). The first line names the columns. `spares` counts extra units, and `required` is `yes` or `no`. Create `config/so101_two_arms.csv`:

```text
part,qty,spares,unit_usd,required
STS3215 servo 7.4V 1/345 gear (C001),7,1,13.89,yes
STS3215 servo 7.4V 1/191 gear (C044),2,0,13.89,yes
STS3215 servo 7.4V 1/147 gear (C046),3,0,13.89,yes
Motor control board,2,0,10.60,yes
USB-C cable (2 pcs),1,0,7.00,yes
Power supply 5 V,2,0,10.00,yes
Table clamp (4 pcs),1,0,9.00,yes
Screwdriver set,1,0,6.00,no
```

**Step 3. Write the budget module.** `csv.DictReader` reads each row as a dictionary keyed by the column names, but every value arrives as text, so `load_parts` converts the numbers with `int` and `float` and turns the `required` column into `True` or `False`. `line_cost` counts every unit including spares. `parts_total` adds the lines, optionally only the required ones. `landed_cost` and `overhead_percent` are the formulas from the chapter. The `round(..., 2)` calls keep the results to whole cents, because adding many prices as floating-point numbers can leave tiny errors. Create `armlab/budget.py`:

```python linenums="1"
"""Read a CSV parts list and total what an arm will really cost."""

import csv


def load_parts(path):
    """Return the rows of a CSV parts list as dictionaries with numbers converted."""
    parts = []
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            parts.append({
                "part": row["part"],
                "qty": int(row["qty"]),
                "spares": int(row["spares"]),
                "unit_usd": float(row["unit_usd"]),
                "required": row["required"].strip().lower() == "yes",
            })
    return parts


def line_cost(part):
    """Cost of one line: every unit, spares included, times the unit price."""
    return round((part["qty"] + part["spares"]) * part["unit_usd"], 2)


def parts_total(parts, required_only=False):
    """Sum of the line costs, optionally counting only the required parts."""
    return round(sum(line_cost(p) for p in parts if p["required"] or not required_only), 2)


def landed_cost(subtotal, shipping, tax, fees=0.0):
    """What you actually pay: the goods plus shipping, tax, and any fees."""
    return round(subtotal + shipping + tax + fees, 2)


def overhead_percent(subtotal, landed):
    """How much more than the sticker price the landed cost is, in percent."""
    return round(100 * (landed - subtotal) / subtotal, 1)
```

**Step 4. Write the cost script.** It prints every line of the list, the totals with and without the optional part, the project's real order, and the comparison between the repository's list and what was paid. In the f-strings, `{p['part']:<38}` pads the name to 38 characters, and `${line_cost(p):>7.2f}` right-aligns a price with two decimals. Create `cost_demo.py`:

```python linenums="1"
"""Total an SO-ARM101 parts list and compare it with a real order."""

from pathlib import Path

from armlab.budget import landed_cost, line_cost, load_parts, overhead_percent, parts_total

CSV_PATH = Path(__file__).parent / "config" / "so101_two_arms.csv"


def main():
    parts = load_parts(CSV_PATH)

    print("1. Parts list (two arms)")
    for p in parts:
        flag = "" if p["required"] else "  (optional)"
        print(f"   {p['part']:<38}{p['qty'] + p['spares']:>3} x ${p['unit_usd']:>6.2f} = ${line_cost(p):>7.2f}{flag}")

    print("2. Totals")
    print(f"   Required parts only:      ${parts_total(parts, required_only=True):>8.2f}")
    print(f"   Everything on the list:   ${parts_total(parts):>8.2f}")

    print("3. A real order: the SO-ARM101 motor kit")
    subtotal, shipping, tax, fee = 258.94, 46.55, 26.05, 0.50
    landed = landed_cost(subtotal, shipping, tax, fee)
    print(f"   Sticker price ${subtotal:.2f}, landed cost ${landed:.2f}, "
          f"overhead {overhead_percent(subtotal, landed)}%")

    print("4. Repository list versus the real kit")
    listed = parts_total(parts)
    print(f"   Listed ${listed:.2f}, paid ${landed:.2f}, difference ${landed - listed:.2f}")


if __name__ == "__main__":
    main()
```

**Step 5. Run it.**

```bash
python cost_demo.py
```

```text
1. Parts list (two arms)
   STS3215 servo 7.4V 1/345 gear (C001)    8 x $ 13.89 = $ 111.12
   STS3215 servo 7.4V 1/191 gear (C044)    2 x $ 13.89 = $  27.78
   STS3215 servo 7.4V 1/147 gear (C046)    3 x $ 13.89 = $  41.67
   Motor control board                     2 x $ 10.60 = $  21.20
   USB-C cable (2 pcs)                     1 x $  7.00 = $   7.00
   Power supply 5 V                        2 x $ 10.00 = $  20.00
   Table clamp (4 pcs)                     1 x $  9.00 = $   9.00
   Screwdriver set                         1 x $  6.00 = $   6.00  (optional)
2. Totals
   Required parts only:      $  237.77
   Everything on the list:   $  243.77
3. A real order: the SO-ARM101 motor kit
   Sticker price $258.94, landed cost $332.04, overhead 28.2%
4. Repository list versus the real kit
   Listed $243.77, paid $332.04, difference $88.27
```

The repository's own total is $229.88; the list here is $243.77 because it adds one spare servo ($13.89) and the extra quantity is already counted in line 1. The real kit cost $88.27 more than that list. Part of the gap is shipping, tax and fees (the $73.10 of overhead), and the rest is that a retail kit price is not the BOM price. It is the reason that this chapter insists on landed cost.

**Step 6. Check a delivery with the pretend bus.** When the servos arrive, the cheapest test is to read each one's model number. This needs two small changes to your Chapter 4 and 5 code. In `armlab/packets.py`, add one line at the top of the `REGISTERS` table: `"Model_Number": (3, 2),`. In `armlab/fakebus.py`, add one line to `make_servos`, just before the line that sets the ID: `memory[3:5] = (777).to_bytes(2, "little")      # Model_Number: 777 is the STS3215`. The script then pretends that servo 4 is a different model, as a wrong delivery might be. Create `arrival_check.py`:

```python linenums="1"
"""Check the model number of every servo in a delivery, using the pretend bus."""

from armlab.fakebus import fake_bus, make_servos
from armlab.packets import read_register, scan

EXPECTED_MODEL = 777          # the STS3215, from the LeRobot motor tables
MODEL_NAMES = {777: "STS3215", 2825: "STS3250"}

servos = make_servos([1, 2, 3, 4, 5, 6])
servos[4][3:5] = (2825).to_bytes(2, "little")        # pretend servo 4 is the wrong model


def send(packet):
    return fake_bus(servos, packet)


found = scan(send, range(1, 8))
print(f"Servos found: {found}")
for servo_id in found:
    model = read_register(send, servo_id, "Model_Number")
    name = MODEL_NAMES.get(model, "unknown")
    verdict = "ok" if model == EXPECTED_MODEL else "WRONG MODEL - return or ask the seller"
    print(f"  ID {servo_id}: model {model} ({name}) -> {verdict}")
```

```bash
python arrival_check.py
```

```text
Servos found: [1, 2, 3, 4, 5, 6]
  ID 1: model 777 (STS3215) -> ok
  ID 2: model 777 (STS3215) -> ok
  ID 3: model 777 (STS3215) -> ok
  ID 4: model 2825 (STS3250) -> WRONG MODEL - return or ask the seller
  ID 5: model 777 (STS3215) -> ok
  ID 6: model 777 (STS3215) -> ok
```

With real servos you would use the `send` function from `read_servo.py` in Chapter 4 instead of the pretend one, one motor connected at a time while they all still have the factory ID 1. The model number does not prove a part is genuine, but a wrong one proves it is not what the listing said, and finding that on arrival is far cheaper than finding it after the build.

!!! mascot-tip "Test One Before You Assemble All"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The day a delivery arrives, power up one servo on the bench, ping it, and read its model number before you open the rest or start printing. If something is wrong, you are still inside the seller's return window.

**Step 7. Record your work.**

```bash
git add .
git commit -m "Add parts list, landed-cost budget, and arrival check"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python cost_demo.py` prints `Required parts only:      $  237.77` and `overhead 28.2%`.
- `python arrival_check.py` flags servo 4 as the wrong model and passes the others.
- `python bus_demo.py` and `python feedback_demo.py` still run after the changes to the registers.
- `config/so101_two_arms.csv` has no values with a trailing comma.
- `git log --oneline` shows a sixth commit.

### Challenge: Plan a Classroom Order

Add a function `classroom_servos(pairs, spare_fraction=0.10)` to `armlab/budget.py` that returns the total number of servos for a class that has `pairs` leader-and-follower sets, using 12 servos per set and rounding the spares *up*. Then use it with `cost_demo.py` to print the servo cost of 6 sets at $13.89 and the number of sets a class could afford with $1,500 if each set's landed cost is 28.2 percent above its required parts cost ($223.88 per set).

??? note "Click to see one solution"
    Add `from math import ceil` at the top of `armlab/budget.py`, and this function. `ceil` rounds up, so 7.2 spare servos becomes 8:

    ```python linenums="1"
    def classroom_servos(pairs, spare_fraction=0.10):
        """Return the servos to order: 12 per set plus spares, with spares rounded up."""
        needed = 12 * pairs
        return needed + ceil(needed * spare_fraction)
    ```

    Then try it in a Python session or at the bottom of `cost_demo.py`:

    ```python linenums="1"
    from armlab.budget import classroom_servos

    servos = classroom_servos(6)
    print(servos, round(servos * 13.89, 2))          # 80 servos, $1111.20

    per_set = round(223.88 * 1.282, 2)               # landed cost per set
    print(per_set, int(1500 // per_set))             # 287.01 per set, 5 sets
    ```

    The class needs 80 servos for $1,111.20. A budget of $1,500 buys 5 sets, because 6 sets at $287.01 would cost $1,722.06. The lesson is the one from the chapter: the landed cost, and not the sticker price, decides how many sets a budget buys.

## Summary and Key Takeaways

You can now plan an order and total what it will really cost.

- The **SO-ARM100** and its successor the **SO-ARM101** are the low-cost, serial-bus entry (about $350 for a pair: a $332.04 motor kit plus $20 or more of printed parts). The **reBot-DevArm**, in its **B601-DM** (24 V) and **B601-RS** (48 V) versions, uses CAN-bus motors and costs several times as much.
- A **bill of materials** lists every part, its quantity, supplier and price. Mark each line as a **required part** or an **optional part**, and check each against its **datasheet**, the **vendor documentation**, and the **part revision**. Save the list as a **CSV parts list** so that a program can read it.
- You can buy as an **official kit**, a **kit build**, a **self-sourced build**, **direct from the manufacturer**, from a **distributor**, or on an **online marketplace**. Each trades price against time and risk.
- **Lead time** is set by the slowest part, and **order tracking** catches a late parcel. **Shipping and customs** add to the sticker price, so the **total build cost** is the **landed cost**. The project's kit rose from $258.94 to $332.04, an overhead of 28.2 percent. **Budgeting** plans the total, with **spare parts** and a margin.
- A **classroom parts order** multiplies one build by the number of teams, with the spares rounded up.
- **Counterfeit parts**, **incompatible parts** and bad **substitute parts** are the common ways to lose money. Match the model, voltage, gear ratio and revision to the BOM line, and **fact-check specifications** against the primary source.
- In Python, the `csv` module reads a parts list, and a few functions turn it into a **cost calculator** that totals the cost and the landed cost.

!!! mascot-celebration "You Can Plan the Whole Order!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just read a bill of materials, separated required from optional parts, worked out a landed cost with shipping and tax, and wrote a Python script that totals it and checks a delivery. That is the planning that makes the build in the next chapters go smoothly. Let's move it on to Chapter 7!
