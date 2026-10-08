---
title: "Projects, Operation, and Teaching"
description: "How to finish and run an arm project and teach with it: capstone scoping, script versus policy versus agent, four project ideas, startup and shutdown procedures, monitoring, a maintenance schedule, wear and servo replacement, documentation, classroom and makerspace use, lab schedules, group orders, assessment rubrics, bimanual, mobile and larger arms, open-source contribution, and responsible robotics, with a color-sorting capstone lab."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 22:38:20"
version: 1.11
---

# Projects, Operation, and Teaching

## Summary

This chapter brings the book together. You will plan capstone projects such as a desk assistant or a color-sorting arm, follow startup and shutdown procedures, maintain the hardware, and plan classroom and makerspace use. After this chapter, you will be able to complete, document, and operate an agent-controlled arm project.

## Concepts Covered

This chapter covers the following 23 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| Monitoring | 4 |
| Classroom Use | 4 |
| Desk Assistant Project | 3 |
| Chat-Controlled Arm | 3 |
| Maintenance Schedule | 3 |
| Capstone Project | 2 |
| Color Sorting Project | 1 |
| Data Collection Station | 1 |
| Project Documentation | 1 |
| Startup Procedure | 1 |
| Shutdown Procedure | 1 |
| Servo Replacement | 1 |
| Wear and Lubrication | 1 |
| Script vs Policy vs Agent | 1 |
| Makerspace Use | 1 |
| Lab Schedule | 1 |
| Assessment Rubric | 1 |
| Group Parts Ordering | 1 |
| Bimanual Setup | 1 |
| Mobile Manipulation | 1 |
| Larger Arms | 1 |
| Open-Source Contribution | 1 |
| Responsible Robotics | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 2: Anatomy of a Robot Arm](../02-anatomy-of-a-robot-arm/index.md)
- [Chapter 3: Electricity, Power, and Safety Basics](../03-electricity-power-and-safety/index.md)
- [Chapter 5: Actuators and Sensors](../05-actuators-and-sensors/index.md)
- [Chapter 6: Sourcing Parts and Planning a Budget](../06-sourcing-parts-and-budget/index.md)
- [Chapter 8: Building and Calibrating the SO-ARM100](../08-building-the-so-arm/index.md)
- [Chapter 9: Building the reBot-DevArm and Choosing a Platform](../09-building-the-rebot-devarm/index.md)
- [Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../11-moving-the-arm/index.md)
- [Chapter 13: Logging, Testing, Simulation, and ROS 2](../13-logging-testing-simulation/index.md)
- [Chapter 14: Cameras, Perception, and Learning from Demonstration](../14-perception-and-learning/index.md)
- [Chapter 15: AI Agents, Tools, and OpenClaw Skills](../15-agents-and-openclaw-skills/index.md)
- [Chapter 16: Agent Planning, Vision, and Interfaces](../16-agent-planning-and-vision/index.md)
- [Chapter 17: Safety Layers and Evaluation for Agent-Controlled Arms](../17-agent-safety-and-evaluation/index.md)

---

!!! mascot-welcome "We Made It to the Last Hands-On Chapter!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    You have wired me, built me, taught me to move, to see and to take advice from an agent, and walled me in with safety layers. Now let's put all of it to work on one real project, and learn how to keep me running and how to share me with a class. Let's move it!

The chapters so far each taught one skill. A project needs *all* of them at once, and it needs three more things that are not in any single chapter: a way of choosing a goal small enough to finish, a routine for running the arm every day without surprises, and the habits of a team that shares equipment. Those are the subjects here.

The chapter has four parts. The first is about *choosing*: what a capstone project is, which kind of program fits which job, and four projects to pick from. The second is about *operating*: starting up, shutting down, watching the arm while it works, and looking after it as it wears. The third is about *teaching*: how a class, a makerspace or a club can share arms, order parts and grade work. The fourth looks *outward*: more arms, bigger arms, contributing back to the open-source projects that made this possible, and the questions that a person who builds robots should ask. The lab builds a color-sorting capstone on the fake arm, with every procedure of the chapter as running, tested code.

## Choosing a Project

### The Capstone Project

A **capstone project** is a project that you finish end to end, using what you have learned, and that someone else can run without you. It is different from an exercise in three ways. It has a goal that you chose, a way to *tell* whether it worked, and a record of how to run it. The most common way for a capstone to fail is that the goal is too big, so the useful skill is *scoping*: cutting a project down until it fits the time that you have. A good capstone fits on a card with five lines.

| Line | Question | Example for the lab project |
|---|---|---|
| Task | What does the arm do, in one sentence? | Put each red, green or blue block in the bin of its color. |
| Success test | What number says it worked? | All blocks in the right bins in 10 of 10 runs. |
| Safety story | Which layers hold if the program is wrong? | Safety layer, workspace limits, E-stop in reach, monitor. |
| Budget | What does it cost, and what is spare? | The parts list of Chapter 6, plus a spare servo. |
| Done when | What do you hand over? | Working code, tests, a one-page `PROJECT.md`, and a demonstration. |

Cut a project by removing a *dimension*, one at a time: one arm instead of two, three colors instead of ten, flat blocks on a taped square instead of a messy table, a fake arm first and the real arm second. A project that works in a small form can grow. A big one that almost works cannot be handed in.

### Script vs Policy vs Agent

Chapters 11, 14 and 15 gave you three different ways of deciding what the arm does next, and **script vs policy vs agent** is the choice among them. Choosing well saves weeks. The test is simple: use the *simplest* kind that does the job.

| | Script | Learned policy | Agent |
|---|---|---|---|
| Who decides each move? | Code that a person wrote | A model trained on demonstrations | A language model choosing tools |
| Where did the knowledge come from? | The programmer | Recorded demonstrations (Chapter 14) | The model's training, and the tool descriptions (Chapter 15) |
| Handles a task nobody planned? | No | Only if it looks like the demonstrations | Often, if the tools allow it |
| Predictable? | Completely | Mostly | Least, so it needs the safety layers of Chapter 17 |
| Good for | Fixed jobs, tests, demos | Skills that are hard to write down, like folding cloth | Requests in plain language, and plans that change |

A script is not a poor choice. If the blocks are always in the same place, a script is shorter, faster and easier to test than anything else. The trouble is *change*. The lab shows it with numbers: a script that has the blocks' positions written into it grasps all three blocks when they are where it expects them, and misses all three by 14 to 22 millimeters when a student nudges them by hand. A program that *looks* with a camera, finds the blocks by hue, and converts pixels to table coordinates with the markers of Chapter 14 is still a script in the sense that code decides every step, and it copes, with an error of under half a millimeter. A learned policy would be the choice if the task could not be written down, and an agent the choice if a person is to *talk* to the arm. Most good projects use a script for the motions, vision for the facts, and an agent only at the top, for the words.

!!! mascot-thinking "Add a Smarter Part Only When the Simpler One Fails"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A script that works beats a policy that mostly works, and a policy that works beats an agent that sometimes surprises you. Move up a step only when you can name the thing the simpler step cannot do, and when you do, bring the safety layers with you.

#### Diagram: Script Policy Agent Sorter

<details markdown="1">
<summary>Script Policy Agent Sorter</summary>
Type: microsim
**sim-id:** script-policy-agent-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** differentiate<br/>
**Learning Objective:** The learner will differentiate eight situations as a script, a learned policy or an agent, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** script, learned policy, agent, demonstrations, tools (all defined in the section "Script vs Policy vs Agent" above this block and in Chapters 11, 14 and 15).

**Evidence of Mastery:** For each of eight situations the learner chooses one of three kinds and commits. A choice is correct when it matches the Kind column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the comparison table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A camera makes a program an agent. (A program with a camera is still a script when code decides every step.) (2) Anything with a neural network is an agent. (A policy maps what it sees straight to actions and does not choose tools.) (3) An agent is always better. (It is less predictable, so it is used only where the job needs words or changing plans.)

**Instructional Rationale:** An Analyze-level differentiate objective asks the learner to separate things that look alike. The three kinds differ in who decides each move, so the learner must look at the decision maker and not at the hardware.

**Content:**

The three kinds: "Script" (code that a person wrote decides every step), "Learned policy" (a model trained on demonstrations turns what it sees into the next action), "Agent" (a language model chooses which tools to call, in a loop). Eight situations in this fixed order:

| # | Situation | Kind | Why (shown as feedback) |
|---|---|---|---|
| 1 | Every morning the arm moves through the same five poses to warm up. | Script | A person wrote the five poses, and nothing is decided at run time. |
| 2 | A model trained on fifty recorded demonstrations folds a towel. | Learned policy | The knowledge came from demonstrations, and the model maps what it sees to actions. |
| 3 | A student types "put the red block in the left bin" and a language model picks the tools to call. | Agent | A language model chooses tools in response to words. |
| 4 | The arm plays back a recorded motion exactly the same way every time. | Script | Playback is fixed steps, and it decides nothing. |
| 5 | A network reads the camera picture and the joint angles and outputs the next joint targets at every tick. | Learned policy | It maps observations to actions, and it was trained from demonstrations. |
| 6 | A language model reads a scene description, writes a plan, calls the move and gripper tools, and asks a person when a grasp fails twice. | Agent | The model plans and chooses tools, and handles a failure. |
| 7 | A program finds blocks by hue, converts them to table coordinates, and runs a fixed pick-and-place for each. | Script | A camera supplies facts, but code decides every step. |
| 8 | A person asks "is the gripper open?" and a language model calls the status tool and answers. | Agent | The model chose a tool to answer a question in words. |

**Provenance:** The three kinds follow Chapters 11, 14 and 15 of this book. The situations are illustrative and written for this sim.

**Rules:** Each situation has exactly one correct kind. The deciding question is who decides the next move: fixed code, a trained model, or a language model choosing tools.

**Learner Activity:**

1. In Explore mode the learner reads the three kinds and the deciding question.
2. The learner switches to the eight situations. Situation 1 is shown.
3. The learner chooses a kind and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 8 it shows the score.

**Feedback:** Eight situations, fixed order, one attempt each. Correct: "Correct: <kind>. <Why>". Incorrect: "Not quite. This is a: <kind>. <Why>". The correct kind is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the three kinds listed and the prompt "Who decides the next move?" ready for the first situation.

**Chapter Anchors:** The chapter says that a program with a camera is still a script when code decides every step, that a script with the blocks' positions written in misses by 14 to 22 millimeters when the blocks are moved, and that most projects use a script for motion, vision for facts and an agent only for words. The sim has eight situations and mastery is 7 of 8.
</details>

### Four Project Ideas

Each project below is made from parts that you already have. The table gives the shape of each, and the paragraphs say what is hard about it.

| Project | The task | Built from | The hard part |
|---|---|---|---|
| Color sorting | Put blocks in bins by color | Vision (14), planner (16), safety layer (17) | Finding blocks when they move, and gripping them |
| Desk assistant | Hand over, hold or point at small things on a desk, on request | Agent and skill (15), tools (16), roles (17) | Staying safe near a person |
| Chat-controlled arm | Control the arm from a chat window | Tool server (16), safety layer (17) | Trust: who may send commands, and with what role |
| Data collection station | Record clean demonstrations for a policy | Teleoperation (11), logging (13), dataset (14) | Consistency: the same setup every time |

A **color sorting project** is the one that the lab builds. A camera above the table finds red, green and blue blocks by hue, maps them to table coordinates, and the arm puts each in the bin of its color. It is a good first capstone because success is countable (blocks in the right bins), the failures are visible, and each part, from the camera to the safety layer, has been built in an earlier chapter.

A **desk assistant project** is an arm that helps a person at a desk: it holds a phone at a good angle, passes a pen, or points a light. Its difficulty is that the person is *in the workspace*. The safety story has to be strong: low speeds, a small and taped workspace, a physical E-stop that the person can reach, a confirmation step for anything fast, and the `reader` role whenever the agent reads anything from outside. A desk assistant is the project in which the chapter on safety layers earns its place.

A **chat-controlled arm** is an arm that takes its orders from a chat window, which is a tool server of Chapter 16 with a person on the other end. The first design question is *who may send commands*: a window that anyone in a group can write to is a source of untrusted input. Give each user a role, log every command with the name of the sender, and make sure that `approve_next_risky_call` is a person's button, not a chat command.

A **data collection station** is a fixed setup for recording demonstrations with the leader arm, for training a policy as in Chapter 14. The aim is *consistency*, since a policy learns from what it is shown. Fix the camera, mark the object's start positions on the table, light the table the same way, and record a log of every episode with a note on whether it was good. Throw away the bad demonstrations as soon as you know they are bad, because a policy copies mistakes as faithfully as skills.

## Operating the Arm

### Startup and Shutdown Procedures

The **startup procedure** is the list of things done, in a fixed order, before an arm is allowed to move. The reason for a fixed order is that each step makes the next one safe. You cannot check the servos before power is on, and you must not clear a stop before the servos have been checked. The lab's `startup` function does it in four steps and stops at the first one that fails.

1. **Power.** Does the supply cover the motors, with margin? (The power budget of Chapter 3.)
2. **Servos.** Does every servo answer, is it cool, and is it inside its calibrated range? (The pre-flight check of Chapter 8.)
3. **A person checks the table and the E-stop.** Is the table clear, and is a hand near the stop? This step cannot be automated, which is why it is a question put to a person.
4. **A person clears the stop, and the arm goes home.** The stop that ended the last session stays in force until a *person* clears it, and no tool can.

The **shutdown procedure** reverses it. The arm goes to its home pose, the folded pose of the configuration file, and *then* torque is cut, so that it is already parked when it goes limp. The one rule is that torque is never cut while the gripper holds something, because the object would fall and an arm without torque sags. The lab's `shutdown` function refuses to cut torque in that case and asks for a person to take the object first.

!!! mascot-tip "Make the Hard-to-Forget Step a Question"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Pilots and nurses use checklists because the step that gets skipped is always the boring one. Write your startup so that the program *asks* about the table and the E-stop and will not go on without a yes, and write your shutdown so that it checks the gripper for you.

#### Diagram: Startup Order Sequencer

<details markdown="1">
<summary>Startup Order Sequencer</summary>
Type: microsim
**sim-id:** startup-order-sequencer<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** organize<br/>
**Learning Objective:** The learner will organize the four startup steps and the three shutdown steps of the chapter into their correct order, choosing the next step in each of eight rounds, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** startup procedure, shutdown procedure, stop, home pose, pre-flight check (all defined in the section "Startup and Shutdown Procedures" above this block and in Chapters 3 and 8).

**Evidence of Mastery:** In each of eight rounds the learner chooses one of three steps as the next one and commits. A choice is correct when it matches the Next Step column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the full procedure in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The stop can be cleared first so that the checks can move the arm. (The checks come first, and the stop is cleared after them.) (2) The agent can clear the stop. (Only a person can.) (3) Torque is cut first and the arm is parked afterwards. (A parked arm has little left to fall, and an arm that is not parked sags.)

**Instructional Rationale:** An Analyze-level organize objective asks the learner to put parts into a structure. Choosing the next step, again and again, makes the learner think about what each step makes safe for the following one.

**Content:**

The full procedure, shown in Explore mode: Startup steps 1 to 4, then Shutdown steps 5 to 7. Eight rounds in this fixed order. In each round the steps already done are shown, and the learner picks the next one from three choices.

| Round | Steps done so far | Next Step | The two wrong choices | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | none | Check that the supply covers the motors | Clear the stop; Go to the home pose | Nothing else is safe until power is known to be right. |
| 2 | Power checked | Check that every servo answers, is cool and is in range | Clear the stop; Cut torque | The servos are checked before any stop is cleared. |
| 3 | Power, servos | A person confirms the table is clear and the E-stop is in reach | Go to the home pose; Cut torque | A person must look before the arm may move. |
| 4 | Power, servos, table | A person clears the stop | Cut torque; Take the object from the gripper | The arm can move only after a person clears the stop. |
| 5 | Startup done, the arm is working | Check that the gripper holds nothing | Cut torque; Clear the stop | Torque is never cut while the gripper holds something. |
| 6 | Gripper empty | Go to the home pose | Cut torque; Check the servos | The arm is parked before torque is cut. |
| 7 | Arm at home | Cut torque | Check the power supply; Clear the stop | Torque is cut last, with the arm parked. |
| 8 | Torque cut | Leave the arm stopped until a person clears it | Let the agent clear the stop; Move the arm to test it | A stop stays in force until a person clears it. |

**Provenance:** The steps are those of the chapter's `startup` and `shutdown` functions. The wrong choices are written for this sim.

**Rules:** Each round has exactly one correct next step. A step is wrong if it comes in the wrong place, or if it is something that only a person may do and the choice gives it to the agent.

**Learner Activity:**

1. In Explore mode the learner reads the seven steps in order.
2. The learner switches to the eight rounds. Round 1 is shown.
3. The learner chooses the next step and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After round 8 it shows the score.

**Feedback:** Eight rounds, fixed order, one attempt each. Correct: "Correct: <step>. <Why>". Incorrect: "Not quite. The next step is: <step>. <Why>". The correct step is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the seven steps listed in order and the prompt "What comes next?" ready for round 1.

**Chapter Anchors:** The chapter's startup has four steps (power, servos, a person checks the table and the E-stop, a person clears the stop and the arm goes home), and its shutdown parks the arm, then cuts torque, and refuses while the gripper holds something. The sim has eight rounds and mastery is 7 of 8.
</details>

### Monitoring

**Monitoring** is watching the arm while it works, so that a problem is noticed *before* it becomes a failure. A person watching is the best monitor, and software can add a second pair of eyes that never gets bored. Three things are worth watching.

- **Temperature.** A servo that is working hard gets hot, and a hot servo can shut itself down or wear faster. The pre-flight check of Chapter 8 refuses to start with a servo at 60 °C or more, which stays well below the 70 °C cut-off of the STS3215 that the book's sources give. The lab's `Monitor` warns at 50 °C and *stops the arm* at 60 °C.
- **Refusals.** A run of refused calls (Chapter 17) means that the agent and the layers disagree. The monitor warns when more than 30 percent of the last 10 calls were refused.
- **Counts.** Calls, refusals and moves per run, kept over time, show a slow change that no single run shows.

The temperatures in the lab come from a *toy model*: each degree that a joint turns warms it by 0.004 °C, and an idle arm cools by 0.8 °C a minute. These numbers are made up to show the idea, and they are not measurements of any servo. On a real arm the monitor reads each servo's `Present_Temperature` register, as the pre-flight check already does, and the thresholds should come from the arm's data sheet. The lab shows what monitoring *does*: in the demonstration the elbow warms from 25 °C to a warning at 50.2 °C after about ten rounds of sorting, the monitor stops the arm at 60.2 °C in the 13th, and after 20 minutes of rest the hottest joint is still at 44.2 °C, so a person who sees the arm restart at once would be asking too much of it.

### Maintenance, Wear and Lubrication

A **maintenance schedule** is a list of things to check or do, each with an interval, so that wear is found by looking and not by failing. Intervals are measured in *hours of use* and not in calendar days, because an arm that sits on a shelf does not wear. The lab's schedule is data: each task is a name, an interval and a line on how to do it.

| Task | Every | How |
|---|---|---|
| Check screws and connectors | 10 h | Look and press: nothing loose, no cable half out |
| Inspect cables | 10 h | Look for chafing and kinks where the cable bends |
| Check calibration drift | 25 h | Hold the arm in the middle pose and run the drift check of Chapter 8 |
| Inspect printed parts | 25 h | Look for cracks and stretched holes near the servos |
| Check servo play | 50 h | Wiggle each joint with torque off |
| Full recalibration | 100 h | Run the calibration routine again and compare with the saved file |

**These intervals are examples to start from. They are not figures from a manufacturer.** Neither the SO-ARM100 repository's README nor any source used for this book gives a maintenance interval, so a class should start with numbers like these, keep a log, and change them as it learns how its own arms wear. A task is **due** when the hours since it was last done reach its interval, and the lab marks a task **soon** at 80 percent of the interval, so that it can be planned.

**Wear and lubrication** is a place to be honest about what is not known. Wear shows itself as play (a joint that moves a little before the servo moves it), noise, jitter, drift in the calibration and heat. *Lubrication is a different matter.* No grease or oil guidance for the STS3215 was found from its maker, and the sources that were found disagree even on what the gears are made of (retailer listings say steel in some places and copper in others, and say that the horn is plastic). Adding grease by guess can harm plastic parts and attract dust, so the rule is: **do not lubricate a servo unless its maker says how**, and ask the seller or the maker if the gearbox needs attention. A servo with worn gears is cheap to replace, which brings us to the next topic.

The printed parts wear in a different way. PLA softens as it warms, with a glass transition that sources put at around 60 °C, and a part that carries a steady load can slowly creep. Both points come from secondary sources, one of them weakly sourced, so treat the numbers as a caution and not as a specification. The practical rules are easy to follow: do not leave an arm in a hot car or in direct sun, do not leave it holding a load for days, and look at the printed parts near the shoulder and the elbow, where the loads are highest, as part of the schedule.

!!! mascot-warning "Do Not Grease What the Maker Did Not Say to Grease"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    No lubrication guidance was found for these servos, so adding grease is a guess, and a wrong guess can swell plastic or gum up a gearbox. Look, listen and measure, and replace a servo that has gone bad. That is cheap, and it is what the spare is for.

**Servo replacement** uses the skills of Chapter 8, in order. Keep the spare from the budget of Chapter 6, and take care to use the *same gear-ratio variant* for the joint: the book's parts list uses the 1/345 ratio (C001) for most joints, 1/191 (C044) and 1/147 (C046) for others. Then: switch the power off, remove the old servo, connect the new one *alone* to the controller board, set its ID to the old one's, fit it, reconnect the bus, run the pre-flight check, check the calibration, and test at low speed. A replaced servo changes the arm's zero, so the calibration step is not optional. Write the replacement in the log, with the date and the hours of use.

#### Diagram: Maintenance Due Calculator

<details markdown="1">
<summary>Maintenance Due Calculator</summary>
Type: microsim
**sim-id:** maintenance-due-calculator<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Apply<br/>
**Bloom Verb:** calculate<br/>
**Learning Objective:** The learner will calculate the hours left before a maintenance task is due, the percent of its interval used, and the weeks until it is due, to within 0.1 of the unit shown, in six problems, with at least 5 of 6 correct on the first attempt.

**Prerequisites:** maintenance schedule, interval, hours of use, due and soon states (all defined in the section "Maintenance, Wear and Lubrication" above this block).

**Evidence of Mastery:** For each of six problems the learner types a number in the unit shown and commits. An answer is correct when it is within 0.1 of the Correct column in Content. Mastery is 5 of 6 correct on the first attempt. Changing the hours in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The interval is counted in calendar days. (It is counted in hours of use.) (2) Hours left is the interval minus the hours now. (It is the interval minus the hours since the task was last done.) (3) An overdue task has zero hours left. (The number goes below zero.)

**Instructional Rationale:** An Apply-level calculate objective needs repeated use of the same few formulas on new numbers with an immediate check. The problems mix the three formulas so that the learner has to choose the right one.

**Content:**

Explore mode shows the six tasks with their intervals, and two sliders for the hours of use now and the hours at which the task was last done, with the resulting state. Formulas: hours since = hours now - last done; hours left = interval - hours since (below zero when overdue); percent used = 100 x hours since / interval; weeks = hours left / hours per week. A task is "soon" at 80 percent used and "due" at 100 percent.

| Quantity | Min | Max | Step | Default | Unit |
|---|---|---|---|---|---|
| Hours of use now | 0 | 200 | 1 | 42 | hours |
| Last done at | 0 | 200 | 1 | 30 | hours |
| Interval | 10 | 100 | 5 | 10 | hours |

Six problems in this fixed order:

| # | Problem | Unit asked | Correct | Why (shown as feedback) |
|---|---|---|---|---|
| 1 | Inspect cables (every 10 h) was last done at 34 h, and the arm is now at 41 h. How many hours are left before it is due? | hours | 3.0 | Hours since = 41 - 34 = 7, and 10 - 7 = 3.0 hours left. |
| 2 | Check calibration drift (every 25 h) was last done at 10 h, and the arm is now at 38 h. How many hours are left? (Use a negative number if it is overdue.) | hours | -3.0 | Hours since = 28, and 25 - 28 = -3.0, so it is 3 hours overdue. |
| 3 | Check servo play (every 50 h) was last done at 0 h, and the arm is now at 42 h. What percent of the interval is used? | percent | 84.0 | 100 x 42 / 50 = 84.0 percent, which is past the 80 percent mark, so it is "soon". |
| 4 | Full recalibration (every 100 h) was last done at 60 h, and the arm is now at 130 h. How many hours are left? | hours | 30.0 | Hours since = 70, and 100 - 70 = 30.0 hours left. |
| 5 | A class uses an arm for 6 hours a week, and "Check screws and connectors" (every 10 h) was just done. In how many weeks is it due? | weeks | 1.7 | 10 / 6 = 1.67, which rounds to 1.7 weeks. |
| 6 | Inspect printed parts (every 25 h) was last done 9.5 hours ago. What percent of the interval is used? | percent | 38.0 | 100 x 9.5 / 25 = 38.0 percent. |

**Provenance:** The tasks and intervals are the chapter's example schedule, which is not from a manufacturer. The problems are illustrative and written for this sim.

**Rules:** hours since = hours now - last done. hours left = interval - hours since. percent used = 100 x hours since / interval. weeks = hours left / hours per week. An answer is correct when |typed - correct| <= 0.1.

**Learner Activity:**

1. In Explore mode the learner moves the two sliders and watches the hours left, the percent used and the state.
2. The learner switches to the six problems. Problem 1 is shown.
3. The learner types a number and presses Check to commit.
4. The sim shows whether the answer was correct, the working and the Why text, then moves on. After problem 6 it shows the score.

**Feedback:** Six problems, fixed order, one attempt each. Correct: "Correct: <value> <unit>. <Why>". Incorrect: "Not quite. The answer is <value> <unit>. <Why>". The correct value is revealed after each commit. A running count "Correct: n of 6" is shown and the final screen says whether mastery (5 of 6) was reached.

**Starting State:** Explore mode with 42 hours of use now, last done at 30 hours, and an interval of 10 hours, showing 12 hours since and a state of due.

**Chapter Anchors:** The chapter's schedule has intervals of 10, 10, 25, 25, 50 and 100 hours, marks a task soon at 80 percent of its interval, and says the intervals are examples and not a manufacturer's figures. The sim has six problems and mastery is 5 of 6.
</details>

### Project Documentation

**Project documentation** is what lets someone else run your project, and that someone is often you in three months. It is not a long document. A one-page `PROJECT.md` that answers six questions is enough: what it does, what it cost, how to start it, what happened on the last run, what maintenance is due, and how it was tested. The safest way to keep it true is to *generate it from measurements*, which is what the lab's `project_report` function does: the numbers for the last run, the hottest joint, the hours since each maintenance task and the test result all come from the program and not from memory. A document written by hand goes stale; a document written by the program is as new as the last run. Keep a photograph of the build, a wiring diagram, the calibration file and the audit log of a good run next to it.

## Teaching With Arms

### Classroom Use and Lab Schedule

**Classroom use** means sharing a small number of arms among many learners, and the main problem is that an arm can be used by only one group at a time. Three habits make it work. *Work on the fake arm first.* Every lab in this book runs without hardware, so a group can write and test its code at any desk, and book the real arm only for the final runs. *Pair up roles.* One person drives, one watches the table and holds the E-stop, and they swap. *Keep the rules short and on the wall*: the startup list, the stop rule, and who may touch the power switch.

A **lab schedule** turns the book into weeks. The plan below is an example for a class of six teams that shares two arms, and the weeks can be stretched or cut to fit. The parts are ordered and printed first, because they take the longest to arrive.

| Week | Work | Chapters |
|---|---|---|
| 1 | Set up Python, read the vocabulary, and order the parts | 1, 2, 6 |
| 2 | Electricity and safety; print the parts | 3, 7 |
| 3 | Build and calibrate the arms | 8 (or 9) |
| 4 | Talk to the arm in Python; move it | 10, 11 |
| 5 | Kinematics, logging and tests | 12, 13 |
| 6 | Cameras and learning | 14 |
| 7 | Agents, tools and safety layers | 15, 16, 17 |
| 8 | Capstone work and arm time | 18 |
| 9 | Demonstrations and assessment | 18 |

With two arms and six teams, give each team a booked slot (for example 30 minutes) for the real arm, and let the monitor and the maintenance log decide when an arm must rest. The maintenance schedule is also a *teaching* tool: assign the checks to teams in turn, and the hours of use will be logged by people who care.

### Makerspace Use

**Makerspace use** is the case where the arms live in a shared workshop with open hours and visitors, and it adds three concerns to the classroom ones. *Sign in*, so that you know who used the arm last and what state it was left in. *Mark the workspace* with tape and put the E-stop in a place that anyone can reach, because a visitor has not read this book. *Keep the printer and the arm apart*: a makerspace's 3D printers, soldering irons and hand tools are used under the space's own rules, and Chapters 3 and 7 are a minimum and not a replacement for them. If the arm is left powered and unattended in a space with visitors, it is a hazard. The shutdown procedure above, ending in a stopped arm that only a person can restart, is the simplest rule: the arm is stopped when nobody is next to it.

### Group Parts Ordering

**Group parts ordering** is placing one order for the whole class, and it is mostly arithmetic. Use the budget code of Chapter 6. The cost per team is the project's delivered figure of Chapter 6 plus the spare: the kit cost $332.04 delivered, with about $20 or more for printed parts and $13.89 for a spare servo, for a total of about $364. The table shows what that means for a class.

| Teams | Per team | Class total |
|---|---|---|
| 4 | about $364 | about $1,456 |
| 6 | about $364 | about $2,184 |
| 8 | about $364 | about $2,912 |

Three decisions save trouble. *Decide how many spares* before ordering, since a second shipment can take weeks (a spare servo per team, or a shared box of them). *Print once for the whole class*, since a printer can run through the night and a team's parts are small. And *ask the seller about shipping* for a bulk order: the kit's delivered price was 28 percent above its sticker price, and whether a single large order lowers that is not something that the sources used here can say. Whatever you order, keep the invoice, because a receipt is evidence for the next class.

### Assessment Rubric

An **assessment rubric** says in advance what a good project looks like, and how many points each part earns. It is fairest when it grades what the book has taught, and when learners can see it before they start. The rubric below is an example for the capstone, scored out of 20, and a class should change the criteria and the weights to match its goals.

| Criterion | 4 points | 3 points | 2 points | 1 point |
|---|---|---|---|---|
| Works | Meets its success test every time | Meets it most of the time | Meets it once | Does not run |
| Safety | Layers, limits, E-stop and a stated safety story | Layers and limits, but the story is thin | One safety measure | None, or the agent is the only one |
| Testing | pytest tests, an evaluation and a replay | pytest tests | Some checks by hand | Untested |
| Documentation | A `PROJECT.md` that someone else could follow | Mostly complete | Partial | Missing |
| Reflection | Names what failed, what changed, and what is still not known | Names what failed | Lists what was done | None |

The most useful row is the last. A team that writes down honestly what did not work and what it does not know has learned more than a team whose demonstration happened to go well, and the rubric should say so.

## Beyond One Arm

### Bimanual Setup, Mobile Manipulation, and Larger Arms

A **bimanual setup** uses two arms working together, for tasks that a person does with two hands, such as holding a bottle with one and unscrewing its cap with the other. The ACT paper of Chapter 14 was about exactly this: its hardware, ALOHA, was a pair of arms. A second arm doubles the cost and the wiring, and it changes the software, since the two arms need a shared clock, a shared table and a rule for who moves into the middle. The practical path is to master one arm first and add the second only when a task needs it.

**Mobile manipulation** puts the arm on a moving base, so that it can work in more than one place. The SO-ARM100 repository lists, among its optional add-ons, a project called XLeRobot: a mobile robot with two SO101 arms on a LeKiwi base, with a battery and cameras, which the README gives a total cost of $660 and which has its own documentation. That figure is the README's own claim and was not checked here. What changes with a mobile base is the problem of *where the arm is*: the table is no longer at a fixed place, so the calibration of Chapter 14 has to be redone, or replaced with a camera on the arm.

**Larger arms** carry more and reach farther, at a price. Chapter 9's comparison gave the reBot B601-DM a payload of 1.5 kg and a reach of 767 mm, and the B601-RS 2.5 kg and 754 mm, against about 0.5 kg for the SO-ARM101 as sellers list it. Moving up in size is not only a matter of cost: the energy in a heavier, faster arm is higher, the supply is 24 V or 48 V instead of 5 V, and the safety work of Chapter 3 and of this chapter gets more serious, not less. Scale the safety measures to the arm. For a larger arm, expect the E-stop and the supervision to matter more than any software layer.

### Open-Source Contribution

This book stands on open-source projects: the SO-ARM100 and reBot repositories, LeRobot, OpenClaw and others. **Open-source contribution** is giving something back, and it is a fine capstone for a learner who has found a mistake or a missing piece. A contribution need not be code: a fixed typo in the documentation, a corrected part number, a clearer calibration note or a photograph of a build step helps the next builder.

The GitHub flow for a contribution has five steps. Fork the project to make your own copy, clone it, make a branch for your change, commit and push, and open a pull request.

```bash
git clone https://github.com/YOUR-USERNAME/PROJECT
cd PROJECT
git checkout -b fix-calibration-typo
git add .
git commit -m "Fix a typo in the calibration section"
git push
```

Then use the Contribute button on your fork to open the pull request. Each project has its own rules, and you should read them first. LeRobot's contributing guide, for one, asks you to add the main repository as a second remote called `upstream`, to work on a branch and not on `main`, to rebase on `upstream/main`, to run its tests and its pre-commit hooks, and to use the issue and pull-request templates. It also asks you to look at someone else's open pull request before asking for attention to yours. The SO-ARM100 repository is licensed under Apache 2.0, and its README has no contribution guidance, so open an issue first and ask. LeRobot also has an AI policy, which fits this book: it asks you to say when a substantial part of a submission was made by an AI, to stay accountable for what you submit, to edit away filler, and to check AI output yourself. Follow it, and follow the same rule in your own work.

### Responsible Robotics

**Responsible robotics** is the habit of asking, before and after building, who the robot affects and what could go wrong. For a desktop arm the questions are small and real.

- **Safety of the people near it.** Chapters 3 and 17: layers, limits, a reachable E-stop, supervision, and no claim that your arm meets an industrial standard. The standards named in Chapter 17 are context and not a certificate.
- **Privacy.** A camera over a classroom desk sees people. Point it at the table and not at faces, say what it records and where it is stored, and get permission before recording learners or keeping their images in a dataset.
- **Honesty about results.** Report the success rate with the number of trials and the failures, as Chapter 17 did, and not the best run. A demonstration that worked once is not evidence.
- **AI that acts.** Keep a person in the loop for actions with consequences, keep an audit log, and be open about what the agent can do and what it cannot.
- **Waste and repair.** Print only what you need, keep spares so that a failure is a repair and not a replacement, and recycle electronics properly.
- **Who can use it.** Make the controls clear and the instructions short, so that a learner who is new, or who needs a different interface, can take part.

!!! mascot-neutral "Responsible Does Not Mean Perfect"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    Nobody builds a perfect robot. Responsible means that you thought about who it affects, said honestly what it can and cannot do, and made it easy to stop. That is a habit you can start with the first project.

## Lab: A Color-Sorting Capstone

In this lab you will finish the project of the chapter on the fake arm, with every procedure as running code: a startup and a shutdown, a monitor, a maintenance schedule, a color sorter, and a generated `PROJECT.md`. You will extend the `arm-lab` project, and the sorter uses the vision of Chapter 14, the planner of Chapter 16 and the safety layer of Chapter 17. Nothing needs hardware, a key or a network.

**Step 1. Activate the project.**

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
git status
```

**Step 2. Write the project module.** Read it from top to bottom: startup and shutdown, then the monitor, then the maintenance schedule, then the sorter. Three details are worth noticing. `clear_stop` is a plain function and not a tool, so only a person's code can call it. `Monitor` wraps a session or a safety layer and has a `call` method, so anything that works on one works on the other. And `sort_blocks` lowers every plan step's speed to 30 degrees per second, because the safety layer of Chapter 17 asks a person to confirm anything faster than 40. Create `armlab/project.py`:

```python linenums="1"
"""Running a project: startup and shutdown procedures, monitoring, a maintenance schedule, and a color-sorting capstone."""

from dataclasses import dataclass

from armlab.planner import execute_plan, plan_pick_and_place, validate_plan
from armlab.power import power_budget
from armlab.preflight import TEMPERATURE_LIMIT_C, preflight
from armlab.vision import find_blobs, pixel_to_world

# ---------------------------------------------------------------- startup and shutdown

def clear_stop(session):
    """Clear a stop. Only a PERSON calls this: it is not a tool, so no agent can ask for it."""
    session.state["stopped"] = False
    session._save()


def startup(session, send, config, calibrations, ask, log=print):
    """Run the startup procedure in order. Stop at the first step that fails. Returns True when the arm is ready."""
    log("1. Power: does the supply cover the motors?")
    total_a, needed_a, ok = power_budget(config)
    log(f"   motors draw {total_a:.1f} A, with margin {needed_a:.2f} A -> {'ok' if ok else 'TOO SMALL, stop here'}")
    if not ok:
        return False
    log("2. Servos: do they answer, are they cool, are they inside their calibrated range?")
    problems = {name: found for name, found in preflight(send, config, calibrations).items() if found}
    for name, found in problems.items():
        log(f"   {name}: {'; '.join(found)}")
    if problems:
        log("   fix these first. The arm stays off.")
        return False
    log("   all joints ok")
    log("3. A person checks the table and the E-stop")
    if not ask("Is the table clear, and is your hand near the E-stop?"):
        log("   not confirmed. The arm stays stopped.")
        return False
    log("   confirmed by the person")
    log("4. A person clears the stop, then the arm goes to its home pose")
    clear_stop(session)
    result = session.call("go_home")
    log(f"   go_home -> {'ok' if result['ok'] else result['error']}")
    return result["ok"]


def shutdown(session, log=print):
    """Park the arm and cut torque. Refuses to cut torque while the gripper holds something. Returns True when parked."""
    if session.call("get_status").get("holding_something"):
        log("   the gripper is holding something: a person must take it before torque is cut")
        return False
    result = session.call("go_home")
    log(f"   go_home -> {'ok' if result['ok'] else result['error']}")
    log(f"   stop -> {session.call('stop')['message']}")
    return result["ok"]


# ---------------------------------------------------------------- monitoring

HEAT_C_PER_DEGREE = 0.004          # a toy number: each degree that a joint turns warms it by this much
COOL_C_PER_MINUTE = 0.8            # a toy number: the idle cooling rate
AMBIENT_C = 25.0
ARM_JOINTS = ("shoulder_pan", "shoulder_lift", "elbow_flex", "wrist_flex")


class Monitor:
    """Wraps a session or a safety layer. Counts every call and watches for trouble.

    The temperatures come from a toy model. On a real arm they are the Present_Temperature register of each servo.
    """

    def __init__(self, target, warn_c=50.0, stop_c=TEMPERATURE_LIMIT_C, window=10, max_refusal_rate=0.3):
        self.target, self.warn_c, self.stop_c = target, warn_c, stop_c
        self.window, self.max_refusal_rate = window, max_refusal_rate
        self.temps = {joint: AMBIENT_C for joint in ARM_JOINTS}
        self.calls, self.refusals, self.recent, self.alerts = 0, 0, [], []
        self.stopped_by_monitor, self.kinds = False, set()

    def _pose(self):
        session = getattr(self.target, "session", self.target)
        return dict(session.state["pose"])

    def call(self, tool, arguments=None):
        before = self._pose()
        result = self.target.call(tool, arguments)
        after = self._pose()
        self.calls += 1
        self.refusals += 0 if result["ok"] else 1
        self.recent = (self.recent + [result["ok"]])[-self.window:]
        for joint in ARM_JOINTS:
            self.temps[joint] += float(HEAT_C_PER_DEGREE * abs(after[joint] - before[joint]))
        self._check()
        return result

    def idle(self, minutes):
        for joint in ARM_JOINTS:
            self.temps[joint] = max(AMBIENT_C, self.temps[joint] - COOL_C_PER_MINUTE * minutes)

    def hottest(self):
        joint = max(self.temps, key=self.temps.get)
        return joint, self.temps[joint]

    def _alert(self, kind, text):
        """Record an alert once for each kind, so that a long run does not repeat itself."""
        if kind not in self.kinds:
            self.kinds.add(kind)
            self.alerts.append(text)

    def _check(self):
        joint, temp = self.hottest()
        if temp >= self.stop_c and not self.stopped_by_monitor:
            self.stopped_by_monitor = True
            self.target.call("stop")
            self._alert("stop", f"STOP: {joint} reached {temp:.1f} C, at or above {self.stop_c:.0f} C. Let the arm cool.")
        elif temp >= self.warn_c:
            self._alert("warm", f"WARNING: {joint} is at {temp:.1f} C, above {self.warn_c:.0f} C.")
        if len(self.recent) == self.window and self.recent.count(False) / self.window > self.max_refusal_rate:
            self._alert("refused", f"WARNING: more than {self.max_refusal_rate:.0%} of the last {self.window} calls were refused.")


# ---------------------------------------------------------------- maintenance

@dataclass(frozen=True)
class Task:
    name: str
    every_hours: float
    how: str


# Example intervals for a classroom to start from. They are NOT manufacturer figures: change them as you learn the arm.
TASKS = [
    Task("Check screws and connectors", 10, "Look and press: nothing loose, no cable half out."),
    Task("Inspect cables", 10, "Look for chafing and kinks where the cable bends."),
    Task("Check calibration drift", 25, "Hold the arm in the middle pose and run the drift check."),
    Task("Inspect printed parts", 25, "Look for cracks and stretched holes, especially near the servos."),
    Task("Check servo play", 50, "Wiggle each joint with torque off: a gearbox that rattles needs attention."),
    Task("Full recalibration", 100, "Run the calibration routine again and compare with the saved file."),
]


def maintenance_status(hours_now, last_done=None):
    """For each task: (name, hours since last done, state), where state is ok, soon (at 80 percent) or due."""
    last_done = last_done or {}
    rows = []
    for task in TASKS:
        since = round(float(hours_now - last_done.get(task.name, 0.0)), 1)
        state = "due" if since >= task.every_hours else "soon" if since >= 0.8 * task.every_hours else "ok"
        rows.append((task.name, since, state))
    return rows


# ---------------------------------------------------------------- a color-sorting capstone

BINS = {"red": (0.22, 0.09), "green": (0.24, 0.00), "blue": (0.22, -0.09)}
GRASP_TOLERANCE_MM = 10.0          # for this demo, a grasp is good when the gripper is within 10 mm of the block
SCRIPT_POSITIONS = {"red": (0.16, 0.08), "green": (0.19, 0.00), "blue": (0.16, -0.08)}   # where a fixed script expects them


def find_blocks(image, matrix):
    """Look for a red, green and blue block. Returns {color: (x, y) in meters} for the ones that were found."""
    found = {}
    for color in BINS:
        blobs = find_blobs(image, color)
        if blobs:
            x, y = pixel_to_world(matrix, blobs[0][0])
            found[color] = (round(float(x), 4) + 0.0, round(float(y), 4) + 0.0)
    return found


def sort_blocks(session, blocks, log=print):
    """Pick each block and put it in the bin of its color. Returns {color: outcome of the plan}."""
    outcomes = {}
    for color, point in blocks.items():
        plan = plan_pick_and_place(point, BINS[color])
        for step in plan:
            if "speed_dps" in step.args:
                step.args["speed_dps"] = 30                  # the safety layer asks a person to confirm anything faster
        problems = validate_plan(plan)
        outcomes[color] = "refused" if problems else execute_plan(session, plan, log=lambda message: None)
        log(f"   {color:<5} block at ({point[0]:.3f}, {point[1]:+.3f}) -> {outcomes[color]}")
    return outcomes


def miss_mm(aimed, truth):
    """How far, in millimeters, the gripper would land from the center of the block."""
    return 1000 * ((aimed[0] - truth[0]) ** 2 + (aimed[1] - truth[1]) ** 2) ** 0.5


def project_report(title, parts_usd, outcomes, monitor, maintenance, tests):
    """Write the project documentation as Markdown: what it is, what it cost, what it did, what is due, and how it was tested."""
    hot_joint, hot_temp = monitor.hottest()
    lines = [f"# {title}", "", "## What it does", "",
             "A camera finds red, green and blue blocks and the arm puts each in the bin of its color, "
             "through the safety layer.", "", "## Cost", "", f"Parts list, two arms: ${parts_usd:,.2f}, before shipping, tax and printed parts (Chapter 6 has the landed cost).", "", "## Last run", ""]
    lines += [f"- {color}: {outcome}" for color, outcome in outcomes.items()]
    lines += [f"- calls: {monitor.calls}, refused: {monitor.refusals}",
              f"- hottest joint: {hot_joint} at {hot_temp:.1f} C", "", "## Maintenance", ""]
    lines += [f"- {name}: {since} h since last done ({state})" for name, since, state in maintenance]
    lines += ["", "## Tests", "", f"{tests}", ""]
    return "\n".join(lines)
```

**Step 3. Run the whole project.** The script starts the arm, with the stop left in force by the "last session" and a pretend servo bus that is healthy. It looks at the table, sorts the three blocks through the monitor and the safety layer, keeps sorting without a rest until the monitor stops the arm, lets it cool, and shuts down. Create `capstone_demo.py`:

```python linenums="1"
"""A whole project run: startup, color sorting through the safety layer, monitoring, and shutdown."""

from pathlib import Path

from armlab.calibrate import load_calibration
from armlab.config import load_config
from armlab.evaluation import FastSession
from armlab.fakebus import fake_bus, make_servos
from armlab.project import Monitor, clear_stop, find_blocks, shutdown, sort_blocks, startup
from armlab.safety_layer import SafetyLayer
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene

Path("state").mkdir(exist_ok=True)
Path("logs").mkdir(exist_ok=True)
state = Path("state/capstone_state.json")
state.unlink(missing_ok=True)

config = load_config("config/arm.json")
calibrations = load_calibration("calibration/my_follower.json")
servos = make_servos([1, 2, 3, 4, 5, 6])
for memory in servos.values():
    memory[56:58] = (2047).to_bytes(2, "little")             # every joint rests at the middle

session = FastSession(state_file=state, object_percent=20)
session.state["stopped"] = True                              # the arm was left stopped after the last session
layer = SafetyLayer(session, max_calls_per_second=1000, log_path="logs/capstone_audit.jsonl")
monitor = Monitor(layer)

print("STARTUP")
ready = startup(session, lambda packet: fake_bus(servos, packet), config, calibrations, ask=lambda question: True)
print("   ready:", ready)

print("SORT: the camera looks, the arm sorts, and every call goes through the monitor and the safety layer")
image = render_scene([((0, 0, 255), (0.16, 0.08), 0.03), ((0, 200, 0), (0.19, 0.0), 0.03), ((255, 0, 0), (0.16, -0.08), 0.03)])
matrix = pixel_to_world_matrix(detect_markers(image))
blocks = find_blocks(image, matrix)
sort_blocks(monitor, blocks)

print("MONITOR: keep sorting without a rest, and watch the temperature")
rounds = 1
while not monitor.stopped_by_monitor and rounds < 30:
    sort_blocks(monitor, blocks, log=lambda message: None)
    rounds += 1
    if rounds % 4 == 0:
        joint, temp = monitor.hottest()
        print(f"   round {rounds:>2}: hottest is {joint} at {temp:.1f} C, {monitor.calls} calls, {monitor.refusals} refused")
for alert in monitor.alerts:
    print("  ", alert)
print(f"   the monitor stopped the arm during round {rounds}: stopped = {session.state['stopped']}, "
      f"{monitor.calls} calls, {monitor.refusals} refused")

print("COOL DOWN: a person waits, then clears the stop")
monitor.idle(20)
print(f"   after 20 minutes idle the hottest joint is at {monitor.hottest()[1]:.1f} C")

print("SHUTDOWN")
clear_stop(session)
shutdown(session)
```

```bash
python capstone_demo.py
```

```text
STARTUP
1. Power: does the supply cover the motors?
   motors draw 3.6 A, with margin 4.50 A -> ok
2. Servos: do they answer, are they cool, are they inside their calibrated range?
   all joints ok
3. A person checks the table and the E-stop
   confirmed by the person
4. A person clears the stop, then the arm goes to its home pose
   go_home -> ok
   ready: True
SORT: the camera looks, the arm sorts, and every call goes through the monitor and the safety layer
   red   block at (0.160, +0.080) -> done
   green block at (0.190, +0.000) -> done
   blue  block at (0.160, -0.080) -> done
MONITOR: keep sorting without a rest, and watch the temperature
   round  4: hottest is elbow_flex at 35.8 C, 120 calls, 0 refused
   round  8: hottest is elbow_flex at 46.6 C, 240 calls, 0 refused
   round 12: hottest is elbow_flex at 57.5 C, 360 calls, 0 refused
   WARNING: elbow_flex is at 50.2 C, above 50 C.
   STOP: elbow_flex reached 60.2 C, at or above 60 C. Let the arm cool.
   the monitor stopped the arm during round 13: stopped = True, 390 calls, 0 refused
COOL DOWN: a person waits, then clears the stop
   after 20 minutes idle the hottest joint is at 44.2 C
SHUTDOWN
   go_home -> ok
   stop -> stopped: torque is off. Only a person can clear a stop.
```

Read the output as a day in the life of the arm. The startup stopped at nothing, because nothing was wrong, and the program asked its question of the person at step 3. The three blocks were found and sorted. The monitor warned at 50.2 °C and stopped the arm at 60.2 °C in the 13th round, and 20 minutes of rest brought the hottest joint only to 44.2 °C. The shutdown parked the arm and cut torque. The temperatures come from the toy model of this chapter and not from a real servo.

**Step 4. Compare a script with a program that looks.** The script has the three blocks' positions written into it. The second program reads them from the camera. Both are run on the table as expected, and then on a table where a student has nudged the blocks. Create `compare_demo.py`:

```python linenums="1"
"""A fixed script, or a program that looks: where each one puts the gripper when the blocks are not where they were."""

from armlab.project import GRASP_TOLERANCE_MM, SCRIPT_POSITIONS, find_blocks, miss_mm
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene

SCENES = {
    "blocks where the script expects them": {"red": (0.16, 0.08), "green": (0.19, 0.00), "blue": (0.16, -0.08)},
    "a student nudged the blocks by hand": {"red": (0.17, 0.09), "green": (0.18, -0.02), "blue": (0.15, -0.06)},
}
BGR = {"red": (0, 0, 255), "green": (0, 200, 0), "blue": (255, 0, 0)}

for scene, truth in SCENES.items():
    image = render_scene([(BGR[color], point, 0.03) for color, point in truth.items()])
    seen = find_blocks(image, pixel_to_world_matrix(detect_markers(image)))
    print(f"{scene}")
    for color, point in truth.items():
        script_miss, vision_miss = miss_mm(SCRIPT_POSITIONS[color], point), miss_mm(seen[color], point)
        verdict = lambda mm: "grasps" if mm <= GRASP_TOLERANCE_MM else "misses"
        print(f"   {color:<5} script is {script_miss:>5.1f} mm off ({verdict(script_miss)}), "
              f"vision is {vision_miss:>4.1f} mm off ({verdict(vision_miss)})")
```

```bash
python compare_demo.py
```

```text
blocks where the script expects them
   red   script is   0.0 mm off (grasps), vision is  0.1 mm off (grasps)
   green script is   0.0 mm off (grasps), vision is  0.1 mm off (grasps)
   blue  script is   0.0 mm off (grasps), vision is  0.1 mm off (grasps)
a student nudged the blocks by hand
   red   script is  14.1 mm off (misses), vision is  0.2 mm off (grasps)
   green script is  22.4 mm off (misses), vision is  0.4 mm off (grasps)
   blue  script is  22.4 mm off (misses), vision is  0.2 mm off (grasps)
```

On the table as expected, both succeed, and the script is even a little more exact. Once the blocks move, the script misses all three by 14 to 22 millimeters, which is more than the 10-millimeter tolerance that this demo uses for a good grasp (a number chosen for the demonstration), and the camera still lands within half a millimeter. That difference is what a camera is for.

!!! mascot-tip "Pass Fake Data in, Never a Mocked Verdict"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    The comparison above renders a real picture of moved blocks and runs the real detector on it. It does not just say "the script fails". When you test a claim, produce the situation and measure it.

**Step 5. Read the maintenance schedule.** Create `maintenance_demo.py`:

```python linenums="1"
"""A maintenance schedule: which tasks are due after a number of hours of use."""

from armlab.project import TASKS, maintenance_status

print("1. The schedule: example intervals to start from, not manufacturer figures")
for task in TASKS:
    print(f"   every {task.every_hours:>3.0f} h  {task.name}: {task.how}")

print("2. After 42 hours of use, when the screws and cables were last checked at 30 hours")
done = {"Check screws and connectors": 30, "Inspect cables": 30}
for name, since, state in maintenance_status(42, done):
    print(f"   {name:<30} {since:>5.1f} h since the last time   {state.upper()}")
```

```bash
python maintenance_demo.py
```

```text
1. The schedule: example intervals to start from, not manufacturer figures
   every  10 h  Check screws and connectors: Look and press: nothing loose, no cable half out.
   every  10 h  Inspect cables: Look for chafing and kinks where the cable bends.
   every  25 h  Check calibration drift: Hold the arm in the middle pose and run the drift check.
   every  25 h  Inspect printed parts: Look for cracks and stretched holes, especially near the servos.
   every  50 h  Check servo play: Wiggle each joint with torque off: a gearbox that rattles needs attention.
   every 100 h  Full recalibration: Run the calibration routine again and compare with the saved file.
2. After 42 hours of use, when the screws and cables were last checked at 30 hours
   Check screws and connectors     12.0 h since the last time   DUE
   Inspect cables                  12.0 h since the last time   DUE
   Check calibration drift         42.0 h since the last time   DUE
   Inspect printed parts           42.0 h since the last time   DUE
   Check servo play                42.0 h since the last time   SOON
   Full recalibration              42.0 h since the last time   OK
```

At 42 hours, four tasks are due, because the screws and cables were last checked 12 hours ago against a 10-hour interval, and the calibration and the printed parts have never been checked. The servo-play check is at 84 percent of its interval and so it is marked "soon".

**Step 6. Generate the project documentation.** The script sorts once, runs the whole test suite, and writes `PROJECT.md` from what it measured. Create `report_demo.py`:

```python linenums="1"
"""Write the project documentation from facts that the program measured, not from memory."""

import subprocess
import sys
from pathlib import Path

from armlab.budget import load_parts, parts_total
from armlab.evaluation import FastSession
from armlab.project import Monitor, find_blocks, maintenance_status, project_report, sort_blocks
from armlab.safety_layer import SafetyLayer
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene

state = Path("state/report_state.json")
state.unlink(missing_ok=True)
monitor = Monitor(SafetyLayer(FastSession(state_file=state, object_percent=20), max_calls_per_second=1000))
image = render_scene([((0, 0, 255), (0.16, 0.08), 0.03), ((0, 200, 0), (0.19, 0.0), 0.03), ((255, 0, 0), (0.16, -0.08), 0.03)])
outcomes = sort_blocks(monitor, find_blocks(image, pixel_to_world_matrix(detect_markers(image))), log=lambda message: None)

tests = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider"], capture_output=True, text=True)
summary = tests.stdout.strip().splitlines()[-1].split(" in ")[0]                   # for example "42 passed"
parts = parts_total(load_parts("config/so101_two_arms.csv"))
Path("PROJECT.md").write_text(project_report("Color-Sorting Arm", parts, outcomes, monitor,
                                              maintenance_status(12, {"Inspect cables": 5}), summary))
print(Path("PROJECT.md").read_text())
```

```bash
python report_demo.py
```

```text
# Color-Sorting Arm

## What it does

A camera finds red, green and blue blocks and the arm puts each in the bin of its color, through the safety layer.

## Cost

Parts list, two arms: $243.77, before shipping, tax and printed parts (Chapter 6 has the landed cost).

## Last run

- red: done
- green: done
- blue: done
- calls: 30, refused: 0
- hottest joint: elbow_flex at 27.5 C

## Maintenance

- Check screws and connectors: 12.0 h since last done (due)
- Inspect cables: 7.0 h since last done (ok)
- Check calibration drift: 12.0 h since last done (ok)
- Inspect printed parts: 12.0 h since last done (ok)
- Check servo play: 12.0 h since last done (ok)
- Full recalibration: 12.0 h since last done (ok)

## Tests

52 passed
```

Open `PROJECT.md` in an editor. Every number in it came from the program, including the line from pytest. The cost line is the parts list for two arms of Chapter 6, and the note beside it says what it leaves out.

**Step 7. Write the tests.** The suite gets twelve more tests: startup succeeds and clears the stop, a hot servo keeps the arm stopped, no yes from a person keeps it stopped, shutdown parks and cuts torque, shutdown refuses while the gripper holds something, only a person can clear a stop, the monitor warns then stops then cools, the monitor notices a run of refusals, the maintenance states, vision finds the blocks to within a millimeter, the sorter skips blocks it cannot see, and every bin is reachable. Create `tests/test_project.py`:

```python linenums="1"
import pytest

from armlab.calibrate import load_calibration
from armlab.config import load_config
from armlab.evaluation import FastSession
from armlab.fakebus import fake_bus, make_servos
from armlab.project import (BINS, Monitor, clear_stop, find_blocks, maintenance_status, miss_mm, shutdown, sort_blocks,
                            startup)
from armlab.safety_layer import SafetyLayer
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene

BLOCKS = {"red": (0.16, 0.08), "green": (0.19, 0.0), "blue": (0.16, -0.08)}
BGR = {"red": (0, 0, 255), "green": (0, 200, 0), "blue": (255, 0, 0)}


@pytest.fixture
def session(tmp_path):
    return FastSession(state_file=tmp_path / "state.json", object_percent=20)


@pytest.fixture
def bus():
    servos = make_servos([1, 2, 3, 4, 5, 6])
    for memory in servos.values():
        memory[56:58] = (2047).to_bytes(2, "little")
    return servos


def run_startup(session, servos, answer=True):
    log = []
    ready = startup(session, lambda packet: fake_bus(servos, packet), load_config("config/arm.json"),
                    load_calibration("calibration/my_follower.json"), ask=lambda question: answer, log=log.append)
    return ready, log


def test_startup_succeeds_and_clears_the_stop(session, bus):
    session.state["stopped"] = True
    ready, _ = run_startup(session, bus)
    assert ready and not session.state["stopped"]


def test_a_hot_servo_keeps_the_arm_stopped(session, bus):
    session.state["stopped"] = True
    bus[3][63] = 68
    ready, log = run_startup(session, bus)
    assert not ready and session.state["stopped"]
    assert any("temperature" in line for line in log)


def test_without_a_person_the_arm_stays_stopped(session, bus):
    session.state["stopped"] = True
    ready, _ = run_startup(session, bus, answer=False)
    assert not ready and session.state["stopped"]


def test_shutdown_parks_the_arm_and_cuts_torque(session):
    assert shutdown(session, log=lambda message: None)
    assert session.state["stopped"] and session.state["pose"]["shoulder_lift"] == -90


def test_shutdown_refuses_to_cut_torque_while_holding_something(session):
    session.call("close_gripper")
    assert not shutdown(session, log=lambda message: None) and not session.state["stopped"]


def test_a_stop_can_be_cleared_only_by_a_person(session):
    session.call("stop")
    assert session.call("go_home")["ok"] is False
    clear_stop(session)
    assert session.call("go_home")["ok"]


def test_the_monitor_warns_then_stops_and_cools(session):
    layer = SafetyLayer(session, max_calls_per_second=10_000)
    monitor = Monitor(layer, warn_c=26.0, stop_c=28.0)
    for _ in range(20):
        monitor.call("move_to_pose", {"x": 0.2, "y": 0.09, "z": 0.05})
        monitor.call("move_to_pose", {"x": 0.2, "y": -0.09, "z": 0.05})
    assert monitor.stopped_by_monitor and session.state["stopped"]
    assert [alert.split(":")[0] for alert in monitor.alerts[:2]] == ["WARNING", "STOP"]
    assert "refused" in monitor.alerts[-1]                    # once stopped, the rest of the calls were refused
    monitor.idle(60)
    assert monitor.hottest()[1] == 25.0


def test_the_monitor_notices_a_run_of_refusals(session):
    monitor = Monitor(SafetyLayer(session, max_calls_per_second=10_000), window=5)
    for _ in range(5):
        monitor.call("move_to_pose", {"x": 0.27, "y": 0.0, "z": 0.05})            # outside today's workspace
    assert monitor.refusals == 5 and "refused" in monitor.alerts[-1]


def test_maintenance_states_ok_soon_and_due():
    rows = dict((name, state) for name, _, state in maintenance_status(42, {"Inspect cables": 35}))
    assert rows["Inspect cables"] == "ok"
    assert rows["Check calibration drift"] == "due"
    assert rows["Check servo play"] == "soon"
    assert rows["Full recalibration"] == "ok"


def test_vision_finds_each_block_within_a_millimeter():
    image = render_scene([(BGR[color], point, 0.03) for color, point in BLOCKS.items()])
    found = find_blocks(image, pixel_to_world_matrix(detect_markers(image)))
    assert set(found) == set(BLOCKS)
    assert all(miss_mm(found[color], BLOCKS[color]) < 1.0 for color in BLOCKS)


def test_the_sorter_handles_the_blocks_it_can_see_and_skips_the_rest(session):
    image = render_scene([(BGR["red"], BLOCKS["red"], 0.03)])
    found = find_blocks(image, pixel_to_world_matrix(detect_markers(image)))
    outcomes = sort_blocks(SafetyLayer(session, max_calls_per_second=10_000), found, log=lambda message: None)
    assert outcomes == {"red": "done"}


def test_every_bin_is_inside_the_workspace_and_reachable(session):
    layer = SafetyLayer(session, max_calls_per_second=10_000)
    for color, (x, y) in BINS.items():
        assert layer.call("move_to_pose", {"x": x, "y": y, "z": 0.07})["ok"], color
```

```bash
python -m pytest -q
```

```text
....................................................                     [100%]
52 passed
```

**Step 8. Record your work.**

```bash
git add .
git commit -m "Add the capstone: startup, shutdown, monitor, maintenance, color sorter and project report"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python capstone_demo.py` shows `ready: True`, a warning at 50.2 °C, a stop at 60.2 °C in round 13, and a shutdown that ends with `stop`.
- `python compare_demo.py` shows the script missing by 14.1, 22.4 and 22.4 millimeters when the blocks are moved, and the camera program within half a millimeter.
- `python maintenance_demo.py` shows four tasks due, one soon and one ok at 42 hours.
- `python report_demo.py` writes a `PROJECT.md` that ends with `52 passed`.
- `python -m pytest -q` reports `52 passed`.
- Earlier scripts still run.
- `git log --oneline` shows an eighteenth commit.

### Challenge: A Fourth Color

Add a yellow block to the sorter. You need three things: a hue range for yellow in `COLOR_RANGES`, a bin for it in `BINS`, and a test. Place a yellow block in a scene together with a red one, and check that the sorter finds both and puts each in a bin. Why does the red range not pick up the yellow block?

??? note "Click to see one solution"
    Yellow sits at a hue of about 30 on OpenCV's 0 to 179 scale, between red (near 0) and green (near 60). Add a range in `armlab/vision.py` and a bin in `armlab/project.py`, with the bin placed where it does not touch another bin or a block:

    ```python linenums="1"
    # in armlab/vision.py, inside COLOR_RANGES:
    "yellow": [((20, 120, 70), (35, 255, 255))],

    # in armlab/project.py, inside BINS:
    "yellow": (0.22, 0.045),
    ```

    The test builds a scene with a yellow and a red block, with the yellow block drawn in BGR as (0, 255, 255):

    ```python linenums="1"
    def test_the_sorter_handles_a_yellow_block(session):
        image = render_scene([((0, 255, 255), (0.22, -0.03), 0.03), ((0, 0, 255), (0.16, 0.08), 0.03)])
        found = find_blocks(image, pixel_to_world_matrix(detect_markers(image)))
        assert set(found) == {"red", "yellow"}
        outcomes = sort_blocks(SafetyLayer(session, max_calls_per_second=10_000), found, log=lambda message: None)
        assert outcomes == {"red": "done", "yellow": "done"}
    ```

    The red range covers hues 0 to 10 and 170 to 179, and yellow is at 30, so the ranges do not overlap, and the mask for red stays empty on the yellow block. If you choose a hue range that is too wide, the two will start to share blocks, which is why you test with both colors in the same picture.

## Summary and Key Takeaways

You can now plan, run, maintain and share an agent-controlled arm project.

- A **capstone project** is finished end to end and handed over: a goal, a success test, a safety story, a budget and a record of how to run it. Cut it down by removing one dimension at a time. **Script vs policy vs agent** is the choice of who decides each move: use the simplest that works, which is often a script that uses a camera for the facts and an agent only for the words.
- The four project ideas are the **color sorting project**, the **desk assistant project**, the **chat-controlled arm** and the **data collection station**. Each has a different hard part: finding blocks, staying safe near a person, deciding who may send commands, and recording consistent demonstrations.
- The **startup procedure** runs in a fixed order and stops at the first failure: power, servos, a person checks the table and the E-stop, a person clears the stop. The **shutdown procedure** parks the arm and then cuts torque, and never while the gripper holds something. **Monitoring** watches temperature, refusals and counts, and stops the arm when a limit is passed.
- A **maintenance schedule** lists tasks with intervals in hours of use, and marks them soon and due. The intervals in this book are examples and not a maker's figures. **Wear and lubrication**: do not lubricate a servo without its maker's guidance, and watch the printed parts for heat and creep. **Servo replacement** keeps the gear ratio, sets the ID alone on the bus, and recalibrates. **Project documentation** is best generated from measurements.
- **Classroom use** shares arms with fake-arm work first, pairs, and short rules. A **lab schedule** turns the chapters into weeks. **Makerspace use** adds sign-in, marked workspaces and an arm that is stopped when nobody is beside it. **Group parts ordering** is arithmetic and decisions about spares. An **assessment rubric** grades what the book taught, and rewards honest reflection.
- A **bimanual setup**, **mobile manipulation** and **larger arms** each add cost and safety work. **Open-source contribution** follows the GitHub flow and the project's own rules, with AI use disclosed. **Responsible robotics** asks who the robot affects: safety, privacy, honest results, a person in the loop, waste and access.

!!! mascot-celebration "We Built, Ran and Looked After a Whole Project!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You started the arm in a fixed order, sorted blocks through every safety layer, watched me warm up until the monitor stopped me, scheduled my maintenance and wrote my documentation from real measurements. That is a complete project. If you want a taste of the mathematics behind my smooth motions, Chapter 19 has it!
