# Quiz: Sourcing Parts and Planning a Budget

Test your understanding of bills of materials, ways to buy, landed cost, lead time, and sourcing pitfalls with these review questions.

---

#### 1. What does the term "landed cost" mean for a parts order?

<div class="upper-alpha" markdown>
1. The sticker price shown on the seller's listing
2. The price of the parts in the bill of materials, without any shipping
3. The sticker price plus shipping, tax, and fees, as it arrives at your door
4. The price after any refund for returned or broken parts
</div>

??? question "Show Answer"
    The correct answer is **C**. The landed cost is the number that appears on your card statement. For the project's SO-ARM101 motor kit it was $258.94 + $46.55 + $26.05 + $0.50 = $332.04, an overhead of about 28.2 percent over the sticker price. Quote landed costs to students and parents, and keep the sticker price in a separate column so that you can see how much the extras added.

    **Concept Tested:** Total Build Cost

    **See:** [Total Build Cost and Budgeting](index.md#total-build-cost-and-budgeting)

---

#### 2. A build needs several parts that arrive at different times. What sets the date on which you can start assembly?

<div class="upper-alpha" markdown>
1. The slowest part, because you cannot start without the last one
2. The average arrival date of all the parts
3. The fastest part, because it starts the clock
4. The seller's processing time for the first order placed
</div>

??? question "Show Answer"
    The correct answer is **A**. Lead time is the time from placing an order to receiving the goods, made up of processing time and transit time. For a build, it is set by the slowest part. The chapter's `max(arrivals.values())` line expresses this in Python. A listing usually shows only one estimate, so ask the seller or read the shipping options before you pay.

    **Concept Tested:** Lead Time

    **See:** [Lead Time and Order Tracking](index.md#lead-time-and-order-tracking)

---

#### 3. A marketplace order has a sticker price of $120.00, shipping of $18.00, sales tax of $9.60, and a retail delivery fee of $0.50. What is the landed cost?

<div class="upper-alpha" markdown>
1. $129.60
2. $148.10
3. $147.60
4. $138.00
</div>

??? question "Show Answer"
    The correct answer is **B**. The landed cost is the sum of the sticker price and every extra: 120.00 + 18.00 + 9.60 + 0.50 = $148.10. That is $28.10 above the sticker price, an overhead of about 23.4 percent. Option A leaves out shipping and the fee, option C leaves out only the $0.50 fee, and option D leaves out the tax and the fee. In `armlab/budget.py`, the `landed_cost` function does this addition.

    **Concept Tested:** Shipping and Customs

    **See:** [Shipping and Customs](index.md#shipping-and-customs)

---

#### 4. A class of 16 students works in pairs, and each pair builds one leader-and-follower set that needs 12 servos. The teacher adds a 10 percent spare allowance, rounded up. How many servos should the class order?

<div class="upper-alpha" markdown>
1. 96
2. 105
3. 116
4. 106
</div>

??? question "Show Answer"
    The correct answer is **D**. Sixteen students in pairs make 8 sets, and 8 × 12 = 96 servos. Ten percent of 96 is 9.6, which rounds up to 10 spares, so the class orders 106. Option A forgets the spares, and option B rounds the spares down to 9. Rounding down leaves the class short of a motor. Option C adds 10 spares per set instead of 10 percent of the total.

    **Concept Tested:** Classroom Parts Order

    **See:** [Classroom Parts Orders](index.md#classroom-parts-orders)

---

#### 5. Why would ordering twelve servos with the same part code (C001) be a mistake for a leader and follower pair?

<div class="upper-alpha" markdown>
1. The leader uses mixed gear ratios, so some servos have different part codes
2. The C001 servo is the 12 V version, which the leader cannot use
3. The leader arm uses hobby PWM servos instead of bus servos
4. Twelve servos are too many for one pair of arms
</div>

??? question "Show Answer"
    The correct answer is **A**. The same STS3215 motor is sold in different gear ratios with different part codes. The follower uses 1/345 throughout, while the leader mixes 1/191 (C044), 1/147 (C046), and 1/345, as Chapter 2 described. Twelve servos is exactly right for a pair, and the leader's motors are always 7.4 V. Reading the BOM lines, and not just the picture, prevents this error.

    **Concept Tested:** Bill of Materials

    **See:** [Reading a Bill of Materials](index.md#reading-a-bill-of-materials)

---

#### 6. Why does reading a servo's model number register only partly verify that the servo is genuine?

<div class="upper-alpha" markdown>
1. The register exists only on counterfeit servos
2. The model number cannot be read over the bus
3. A clone can copy the number, so a match proves little, but a wrong number proves the part is not what the listing said
4. The model number changes with the gear ratio, so it differs on every servo
</div>

??? question "Show Answer"
    The correct answer is **C**. The model number sits at address 3 with a size of 2 bytes, and LeRobot's tables list 777 for the STS3215. A counterfeit can copy that value, so a match does not prove the part is genuine. A wrong number, such as 2825 in the lab, proves that the servo is a different model from the one on the listing. Finding that on arrival is far cheaper than finding it after the build.

    **Concept Tested:** Counterfeit Parts

    **See:** [Pitfalls](index.md#pitfalls)

---

#### 7. Which item does the listing for the SO-ARM101 motor kit used in this project state is *not* included?

<div class="upper-alpha" markdown>
1. The twelve STS3215 servos
2. The two motor control boards
3. The two power supplies
4. The 3D-printed parts
</div>

??? question "Show Answer"
    The correct answer is **D**. The kit build comes with the servos, boards, power supplies, and cables, and the listing states plainly that the 3D-printed parts are not included. The frame comes separately, either printed at home, from a printing service, or as a ready-made set. Reading the "includes" and "does not include" lines before paying, and ticking each BOM line against them, finds these gaps while they are still cheap to fix.

    **Concept Tested:** Kit Build

    **See:** [Ways to Buy](index.md#ways-to-buy)

---

#### 8. Seeed's guide lists the DM4310 with a rated torque of 3 N·m and a peak of 7 N·m. A reseller's listing for a DM-J4310-2EC V1.2 gives 3.5 N·m rated and 12.5 N·m peak. What is the best way to handle the disagreement?

<div class="upper-alpha" markdown>
1. Average the two sets of values and design around the result
2. Treat both as claims, since they may describe different revisions or one may be wrong, then find the primary datasheet and record which source you trusted
3. Trust the reseller's numbers, because a higher peak gives more safety margin
4. Trust the cheaper listing, because the lowest price is the best evidence of a genuine part
</div>

??? question "Show Answer"
    The correct answer is **B**. Specifications in articles, listings, and even repositories can disagree. The safest habit is to treat each number as a claim until two independent sources agree, find the primary source such as the datasheet or the maker's documentation, and write down which source you trusted and when. The two listings could describe different revisions. Averaging, or choosing the larger number, builds on a value nobody has verified.

    **Concept Tested:** Fact-Checking Specifications

    **See:** [Fact-Checking Specifications](index.md#fact-checking-specifications)

---

#### 9. Which substitution is safe according to the chapter?

<div class="upper-alpha" markdown>
1. A servo with a different gear ratio for a leader arm joint
2. A 12 V servo on a 5 V supply because it is the same size
3. A power supply with the same voltage and polarity but a higher current rating
4. A servo board for hobby PWM servos in a build of bus servos
</div>

??? question "Show Answer"
    The correct answer is **C**. A substitute is safe when you can show from datasheets that every number that matters is equal or better. A supply with the same voltage and polarity and a larger current rating is correct, because the load decides how much current flows (Chapter 3). A different gear ratio changes how the joint moves and breaks the leader and follower match. The other options are incompatible parts, which are the most expensive mistake.

    **Concept Tested:** Substitute Parts

    **See:** [Pitfalls](index.md#pitfalls)

---

#### 10. An order is placed on 2026-10-06. The parts have transit times of 14 days, 5 days, and 30 days. On which date can you start building?

<div class="upper-alpha" markdown>
1. 2026-11-05
2. 2026-10-20
3. 2026-10-11
4. 2026-10-26
</div>

??? question "Show Answer"
    The correct answer is **A**. The slowest part decides the start date, so add 30 days to October 6. October has 31 days, so 25 days brings the date to October 31, and the remaining 5 days land on November 5. Option B is the date of the 14-day part, and option C is the date of the 5-day part. In Python, `date(2026, 10, 6) + timedelta(days=30)` gives the same result.

    **Concept Tested:** Order Tracking

    **See:** [Lead Time and Order Tracking](index.md#lead-time-and-order-tracking)
