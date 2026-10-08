---
title: "Agent or Workflow Sorter"
description: "The learner will classify eight described systems as an ordinary program, a chatbot, a workflow or an agent, according to who decides the next step and whether tools are used, with at least 7 of 8 correct on the first attempt."
status: scaffold
library: p5.js
bloom_level: Understand
---

# Agent or Workflow Sorter



<iframe src="main.html" width="100%" height="600"></iframe>

[Run MicroSim in Fullscreen](main.html){ .md-button .md-button--primary }

## Specification

The full specification below is extracted from
[Chapter 15: AI Agents, Tools, and OpenClaw Skills](../../chapters/15-agents-and-openclaw-skills/index.md).

```text
Type: microsim
**sim-id:** agent-or-workflow-sorter<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** classify<br/>
**Learning Objective:** The learner will classify eight described systems as an ordinary program, a chatbot, a workflow or an agent, according to who decides the next step and whether tools are used, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** large language model, AI agent, agent loop, tool, workflow (all defined in the section "Language Models and Agents" above this block).

**Evidence of Mastery:** For each of eight systems the learner chooses one of four classes and commits. A choice is correct when it matches the Class column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the table of the four classes in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Any program that uses a language model is an agent. (It is an agent only if the model chooses the steps and tools.) (2) A chatbot with a tool is a workflow. (If the model decides when to use the tool, it is an agent.) (3) A fixed sequence is safer because it uses a model. (The sequence is safe because the code fixes the steps.)

**Instructional Rationale:** An Understand-level classify objective asks the learner to sort examples by a rule. Each description turns on one question, who decides the next step, so the learner must find that sentence in the description.

**Content:**

The four classes and the question that separates them: "Ordinary program" (the code decides and there is no model), "Chatbot" (a model answers and there are no tools), "Workflow" (the code decides the order and a model fills in some steps), "Agent" (the model decides the steps and the tools). Eight systems in this fixed order:

| # | Description | Class | Why (shown as feedback) |
|---|---|---|---|
| 1 | A model answers a student's questions about robot arms from what it learned in training, with no tools. | Chatbot | A model answers in words and there are no tools. |
| 2 | A script always reads the camera, then finds the block, then moves the arm, and only asks a model to write the final report in friendly words. | Workflow | The code fixes the order, and the model fills in one step. |
| 3 | A model is given the arm's tools and a request, and at each step it chooses which tool to call until it says it has finished. | Agent | The model directs its own steps and tool use. |
| 4 | A pipeline summarizes a message, translates it, and then emails it, always in that order, with a model doing each step. | Workflow | The order is fixed by the code, even though a model does the steps. |
| 5 | The pick-and-place state machine of Chapter 11, with no model in it. | Ordinary program | The code decides every step, and there is no model. |
| 6 | A model is told to tidy a desk, plans its own steps, calls tools, checks the results and repeats. | Agent | The model plans, acts and observes in its own loop. |
| 7 | A model labels an incoming message as one of three kinds, and then the code sends it to one of three fixed handlers. | Workflow | The model makes one decision inside a path that the code defined. |
| 8 | A Python function uses if and else rules to sort blocks by color. | Ordinary program | The rules are fixed code, and there is no model. |

**Provenance:** The distinction between workflows and agents follows Anthropic's "Building effective agents" (read on 2026-10-07), as summarized in the chapter section "The AI Agent and the Agent Loop". The descriptions are illustrative and written for this sim.

**Rules:** Each description has exactly one correct class. A system with no model is an Ordinary program. A system with a model and no tools is a Chatbot. A system in which the code fixes the order of steps is a Workflow. A system in which the model chooses the next step and the tool is an Agent.

**Learner Activity:**

1. In Explore mode the learner reads the four classes, each with the question that separates it.
2. The learner switches to the eight systems. System 1 is shown.
3. The learner chooses a class and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After system 8 it shows the score.

**Feedback:** Eight systems, fixed order, one attempt each. Correct: "Correct: <class>. <Why>". Incorrect: "Not quite. This system is: <class>. <Why>". The correct class is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the four classes listed and the prompt "Who decides the next step?" ready for the first system.

**Chapter Anchors:** The chapter defines a workflow as code deciding the order and an agent as the model directing its own steps and tools, and lists four systems: an ordinary program, a chatbot, a workflow and an agent. The sim has eight systems and mastery is 7 of 8.
```

## Related Resources

- [Chapter 15: AI Agents, Tools, and OpenClaw Skills](../../chapters/15-agents-and-openclaw-skills/index.md)
