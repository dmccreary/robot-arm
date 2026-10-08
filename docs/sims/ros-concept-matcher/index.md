---
title: "ROS Concept Matcher"
description: "The learner will identify the ROS 2 or robot-description term that matches each of eight short descriptions, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Remember
---

# ROS Concept Matcher



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md).

```text
Type: microsim
**sim-id:** ros-concept-matcher<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Remember<br/>
**Bloom Verb:** identify<br/>
**Learning Objective:** The learner will identify the ROS 2 or robot-description term that matches each of eight short descriptions, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** ROS 2, ROS node, ROS topic, message, publisher, subscriber, URDF (all defined in the sections "URDF Models" and "ROS 2" above this block).

**Evidence of Mastery:** For each of eight descriptions the learner chooses one of six terms and commits. A choice is correct when it matches the Term column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the term list in Explore mode is exploration, not evidence.

**Misconceptions:** (1) ROS is an operating system. (It is a set of libraries and conventions that runs on one.) (2) A topic is a program. (A node is a program, and a topic is a named channel.) (3) A publisher sends to a particular subscriber. (It sends to a topic, and any number of subscribers receive it.)

**Instructional Rationale:** A Remember-level identify objective asks the learner to recognize a term from its description. A small set of terms with distinct descriptions lets the learner build the vocabulary that the tour introduces, which is enough to read the ROS documentation.

**Content:**

The six terms: "Node", "Topic", "Message", "Publisher", "Subscriber", "URDF". Eight descriptions in this fixed order:

| # | Description | Term | Why (shown as feedback) |
|---|---|---|---|
| 1 | A program in the ROS 2 graph that does one logical job, like reading a camera. | Node | A node is the unit of computation in ROS 2. |
| 2 | A named channel that nodes publish to and subscribe from. | Topic | A topic carries messages of one type between nodes. |
| 3 | The typed data sent on a topic, like sensor_msgs/JointState. | Message | A message has a defined shape, with named fields. |
| 4 | A node that sends messages on a topic. | Publisher | Publishers send, and they do not need to know who receives. |
| 5 | A node that receives messages from a topic. | Subscriber | Subscribers register a callback for the messages that arrive. |
| 6 | The XML file that describes an arm's links and joints. | URDF | URDF stands for Unified Robot Description Format. |
| 7 | What the command ros2 topic list prints. | Topic | The command lists the topics that exist in the system. |
| 8 | What msg.data holds inside a subscriber's callback. | Message | The callback receives a message object, and data is one of its fields. |

**Provenance:** The terms are from the chapter sections "URDF Models" and "ROS 2", which follow the ROS 2 documentation read on 2026-10-07. The descriptions are written for this sim.

**Rules:** Each description has exactly one correct term. The six terms are the only choices.

**Learner Activity:**

1. In Explore mode the learner reads the six terms with a one-line meaning of each and a picture of nodes connected by a topic.
2. The learner switches to the eight descriptions. Description 1 is shown.
3. The learner chooses a term and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After description 8 it shows the score.

**Feedback:** Eight descriptions, fixed order, one attempt each. Correct: "Correct: <term>. <Why>". Incorrect: "Not quite. This describes: <term>. <Why>". The correct term is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the six terms listed and a diagram of two nodes joined by one topic.

**Chapter Anchors:** The chapter states that a node should do one logical thing, that a topic is a named channel with a message type, and that JointState has the fields name, position, velocity and effort. The sim has eight descriptions and mastery is 7 of 8.
```

## Related Resources

- [Chapter 13: Logging, Testing, Simulation, and ROS 2](../../chapters/13-logging-testing-simulation/index.md)
