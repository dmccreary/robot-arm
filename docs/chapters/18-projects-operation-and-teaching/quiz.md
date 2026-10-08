# Quiz: Projects, Operation, and Teaching

Test your understanding of capstone scoping, startup and shutdown procedures, monitoring, maintenance, and classroom use with these review questions.

---

#### 1. What three things make a capstone project different from an exercise?

<div class="upper-alpha" markdown>
1. A larger budget, a second arm, and an agent
2. A learned policy, a camera, and a language model
3. A faster computer, a bigger table, and a spare servo
4. A goal that you chose, a way to tell whether it worked, and a record of how to run it
</div>

??? question "Show Answer"
    The correct answer is **D**. A capstone is a project you finish end to end, which someone else can run without you. The most common way for one to fail is a goal that is too big, so the useful skill is scoping. A good capstone fits on a five-line card: the task, the success test, the safety story, the budget, and what counts as done. Neither a bigger budget nor a particular technology is part of the definition.

    **Concept Tested:** Capstone Project

    **See:** [The Capstone Project](index.md#the-capstone-project)

---

#### 2. Why does the shutdown procedure refuse to cut torque while the gripper is holding something?

<div class="upper-alpha" markdown>
1. The object would fall and an arm without torque sags, so a person should take the object first
2. The gripper's motor would overheat in a few seconds
3. The calibration file would be erased
4. The supply cannot be switched off with a load in the gripper
</div>

??? question "Show Answer"
    The correct answer is **A**. The shutdown procedure reverses the startup: the arm goes to its home pose, the folded pose of the configuration file, and then torque is cut, so that it is already parked when it goes limp. The one rule is that torque is never cut while the gripper holds something, because the object would drop. The lab's `shutdown` function refuses in that case and asks for a person to take the object first.

    **Concept Tested:** Shutdown Procedure

    **See:** [Startup and Shutdown Procedures](index.md#startup-and-shutdown-procedures)

---

#### 3. Why are maintenance intervals for an arm measured in hours of use and not in calendar days?

<div class="upper-alpha" markdown>
1. Calendar days cannot be stored in a file
2. The manufacturer publishes every interval in hours
3. An arm that sits on a shelf does not wear
4. Hours are always shorter than days
</div>

??? question "Show Answer"
    The correct answer is **C**. Wear comes from use, so a schedule keyed to hours of use is fair to an arm that is busy one week and idle the next. The chapter stresses that its intervals (10 h for screws and connectors, 25 h for calibration drift, 50 h for servo play, 100 h for full recalibration) are examples to start from, not figures from a manufacturer. A class should keep a log and adjust the numbers as it learns how its own arms wear.

    **Concept Tested:** Maintenance Schedule

    **See:** [Maintenance, Wear and Lubrication](index.md#maintenance-wear-and-lubrication)

---

#### 4. A script has the blocks' positions written into it. It grasps all three blocks when they are in place, but misses all three by 14 to 22 mm when a student nudges them. What does the chapter conclude?

<div class="upper-alpha" markdown>
1. A script is a poor choice for any robot task
2. The trouble is change, and a script that looks with a camera can cope, so use the simplest kind of program that does the job
3. The task must be moved to a learned policy
4. The blocks must be glued to the table
</div>

??? question "Show Answer"
    The correct answer is **B**. A script is not a poor choice: if the blocks are always in the same place, it is shorter, faster, and easier to test than anything else. The trouble is change. A program that finds the blocks by hue and converts pixels to table coordinates with the markers of Chapter 14 is still a script, since code decides every step, and it copes with an error under half a millimeter. Move up to a policy or an agent only when you can name what the simpler kind cannot do.

    **Concept Tested:** Script vs Policy vs Agent

    **See:** [Script vs Policy vs Agent](index.md#script-vs-policy-vs-agent)

---

#### 5. Why is the startup step "a person checks the table and the E-stop" a question put to a person and not an automated check?

<div class="upper-alpha" markdown>
1. The camera cannot see the table
2. Python cannot ask questions
3. The E-stop has no electrical connection
4. Only a person can see whether the table is clear and put a hand near the stop, and the program should not go on without a yes
</div>

??? question "Show Answer"
    The correct answer is **D**. The four startup steps are fixed in order because each makes the next safe: check the power, check the servos, have a person check the table and E-stop, and have a person clear the stop before the arm goes home. The third step cannot be automated, so the program asks and waits for a yes. Pilots and nurses use checklists for the same reason: the step that gets skipped is always the boring one.

    **Concept Tested:** Startup Procedure

    **See:** [Startup and Shutdown Procedures](index.md#startup-and-shutdown-procedures)

---

#### 6. Why does the chapter say not to lubricate a servo unless its maker says how?

<div class="upper-alpha" markdown>
1. Grease is illegal in classrooms
2. Servos are sealed with glue and cannot be opened
3. No guidance was found from the maker, and a guess can swell plastic or gum up the gearbox, while replacing a worn servo is cheap
4. Lubricant reduces the torque limit of the servo
</div>

??? question "Show Answer"
    The correct answer is **C**. Sources even disagreed on what the gears are made of, and no grease or oil guidance for the STS3215 came from its maker. Adding grease by guess can harm plastic parts and attract dust. The practical rules are to look, listen, and measure, and to replace a servo that has gone bad. That is what the spare from the budget is for.

    **Concept Tested:** Wear and Lubrication

    **See:** [Maintenance, Wear and Lubrication](index.md#maintenance-wear-and-lubrication)

---

#### 7. The kit for one team costs about $364 including a spare servo. About what is the class total for 7 teams?

<div class="upper-alpha" markdown>
1. About $2,184
2. About $2,548
3. About $2,912
4. About $2,456
</div>

??? question "Show Answer"
    The correct answer is **B**. Group parts ordering is mostly arithmetic: 7 × $364 = $2,548. The chapter's table lists 4 teams at about $1,456, 6 teams at about $2,184 (option A), and 8 teams at about $2,912 (option C). Decide the number of spares before ordering, print once for the whole class, and ask the seller about shipping, since the kit's delivered price was 28 percent above its sticker price.

    **Concept Tested:** Group Parts Ordering

    **See:** [Group Parts Ordering](index.md#group-parts-ordering)

---

#### 8. A task, "check servo play," is due every 50 hours. It was last done 41 hours of use ago, and the lab marks a task as "soon" at 80 percent of its interval. What is the task's status?

<div class="upper-alpha" markdown>
1. Soon, because 41 hours is more than 80 percent (40 hours) of the interval but less than the interval
2. Not due, because 41 hours is less than 50 hours
3. Due, because 41 hours is more than 40 hours
4. Overdue, because it has passed the soon mark
</div>

??? question "Show Answer"
    The correct answer is **A**. A task is due when the hours since it was last done reach its interval, here 50 hours. It is marked "soon" at 80 percent of the interval, so that it can be planned, and 80 percent of 50 is 40 hours. At 41 hours the task is past that mark and not yet due. Assigning the checks to teams in turn makes the maintenance schedule a teaching tool as well.

    **Concept Tested:** Maintenance Schedule

    **See:** [Maintenance, Wear and Lubrication](index.md#maintenance-wear-and-lubrication)

---

#### 9. In the lab's monitoring demonstration, the elbow warns at about 50 °C, the monitor stops the arm at about 60 °C, and after 20 minutes of rest the hottest joint is still at 44.2 °C. What does this show?

<div class="upper-alpha" markdown>
1. The monitor's thresholds are wrong
2. The toy model proves that the servos never overheat
3. An arm needs no rest after a stop
4. A joint cools slowly, so restarting the arm at once after a monitor stop would be asking too much of it
</div>

??? question "Show Answer"
    The correct answer is **D**. The temperatures come from a toy model, with made-up numbers: each degree of joint motion warms it by 0.004 °C and an idle arm cools by 0.8 °C a minute. The idea is that monitoring catches a problem before it becomes a failure, and a cooled-down arm still has heat to shed. On a real arm the monitor reads each servo's `Present_Temperature` register, with thresholds from the data sheet.

    **Concept Tested:** Monitoring

    **See:** [Monitoring](index.md#monitoring)

---

#### 10. Four teams propose capstone projects. Which one is best scoped according to the chapter?

<div class="upper-alpha" markdown>
1. Two arms sort ten colors from a messy table, and only the real hardware is tested
2. One arm sorts three colors from a taped square on a fake arm first and the real arm second, with a countable success test
3. A new learned policy, a chat interface, and a second robot are all added at once
4. An agent decides everything, and no tests are written
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter's advice is to cut a project by removing one dimension at a time: one arm instead of two, three colors instead of ten, flat blocks on a taped square instead of a messy table, and a fake arm first. A project that works in a small form can grow, while a big one that almost works cannot be handed in. Success should be countable, such as all blocks in the right bins in 10 of 10 runs.

    **Concept Tested:** Capstone Project

    **See:** [The Capstone Project](index.md#the-capstone-project)
