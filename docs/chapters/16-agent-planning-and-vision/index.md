---
title: "Agent Planning, Vision, and Interfaces"
description: "How to extend an agent with planning and perception: the planner-executor split, task decomposition and replanning, vision-language models and scene descriptions, recovering from a failed grasp and asking a human, web APIs with the requests library and safe API-key handling, tool servers, the Model Context Protocol, ROS 2 bridges, and local versus cloud agents."
generated_by: claude skill chapter-content-generator
date: "2026-10-07 22:20:32"
version: 1.11
---

# Agent Planning, Vision, and Interfaces

## Summary

This chapter extends the agent with planning and perception. It covers task planning and replanning, vision-language models, local and cloud agents, MCP and ROS 2 bridges, and calling web APIs with safe key handling. After this chapter, you will be able to build an agent that sees a scene and plans a multi-step task.

## Concepts Covered

This chapter covers the following 26 concepts from the learning graph:

| Concept | Concept Impact Score |
|---------|-----------------------|
| HTTP API | 31 |
| Tool Server | 24 |
| Agent Architecture | 23 |
| Task Planning | 15 |
| Agent Planner | 10 |
| Vision-Language Model | 7 |
| JSON Requests | 6 |
| Learned Policy Executor | 5 |
| Requests Library | 5 |
| Object Localization | 5 |
| Planner-Executor Split | 4 |
| API Key Handling | 4 |
| Image-to-Arm Coordinates | 4 |
| Task Decomposition | 4 |
| Failed Grasp Recovery | 4 |
| Local Agent | 3 |
| Cloud Agent | 3 |
| Replanning | 3 |
| Model Context Protocol | 2 |
| Asking a Human | 2 |
| Edge AI Computer | 1 |
| Latency and Cost | 1 |
| Privacy Considerations | 1 |
| MCP Server | 1 |
| ROS 2 Bridge | 1 |
| Scene Description | 1 |

## Prerequisites

This chapter builds on concepts from:

- [Chapter 1: Setting Up Python for Robotics](../01-python-setup-for-robotics/index.md)
- [Chapter 11: Moving the Arm: Trajectories, Grippers, and Teleoperation](../11-moving-the-arm/index.md)
- [Chapter 13: Logging, Testing, Simulation, and ROS 2](../13-logging-testing-simulation/index.md)
- [Chapter 14: Cameras, Perception, and Learning from Demonstration](../14-perception-and-learning/index.md)
- [Chapter 15: AI Agents, Tools, and OpenClaw Skills](../15-agents-and-openclaw-skills/index.md)

---

!!! mascot-welcome "Now I Can See and Plan!"
    ![Servo waving welcome](../../img/mascot/welcome.png){ class="mascot-admonition-img" }
    In Chapter 15 an agent could move me through safe tools. In this chapter it learns to look at the table, break "put the block in the bin" into steps, and cope when a grasp fails. You will also wire the tools to the world with web APIs, MCP and ROS 2. Let's move it!

An agent that can only follow a request like "move to x equals 0.2" is a voice-controlled joystick. The agents that people find exciting do more. They look at the scene, work out where the objects are, decide on a *sequence* of steps that reaches a goal, notice when a step fails, and try something else or ask for help. Each of those abilities adds a new way to go wrong, and so each needs the same two things that Chapter 15 built: a clear division of labor, and checks in code.

The chapter has four parts. The first is the *architecture*: how perception, planning, checking and execution fit together, and why the planner and the executor are kept apart. The second is *seeing*: how a vision-language model describes a picture, and how its answer becomes coordinates for the arm, using the camera mapping of Chapter 14. The third is *recovery*: what an agent should do when a grasp fails, or when it cannot tell what is wanted. The fourth is *interfaces*: how tools reach an agent over a network, with a web API, with the Model Context Protocol, and with ROS 2, and where the agent should run. Every piece runs in the lab on your computer, with no network, no key and no arm, using a pretend vision model and the fake arm.

## The Architecture of an Agent System

### Agent Architecture

An **agent architecture** is the way the parts of an agent system are arranged and connected. The arrangement matters more than the choice of model, because it decides what the model can and cannot do. The one in this chapter has six parts, and each does one job.

| Part | Job | Made of |
|---|---|---|
| Perceive | Turn camera pictures into a list of objects with positions | A camera, a vision model, and checks (Chapter 14 and this chapter) |
| Plan | Turn a goal and the scene into a list of steps | A language model, the *agent planner* |
| Check | Reject any plan that breaks a rule, before anything moves | Plain code: the tool schemas of Chapter 15 |
| Execute | Run the steps one at a time and look at each result | Plain code, the *executor* |
| Act | Do one step on the arm | The tools of Chapter 15, or a learned policy |
| Recover | Decide what to do when a step fails | Retry, replan, or ask a person |

Two of the six parts hold a model, and four are ordinary code. That ratio is deliberate. The parts that carry safety, the check, the executor, the tools and the recovery, are programs that you can read and test, and the models sit behind them.

### The Planner-Executor Split

The **planner-executor split** is the central design rule. The *planner* decides *what* to do and in what order. The *executor* does it, one step at a time, and checks what happened. They are different programs with different powers. The planner can propose anything, and it never touches the arm. The executor can touch the arm, and it does only what a checked plan says, in the order that it says, and it reads each result before going on. The planner's output is *data* (a list of steps), and so it can be printed, saved, tested, validated and refused. This is the same idea as Chapter 15's doorway, one level higher: the doorway for single commands is the tool layer, and the doorway for whole plans is the checked plan.

!!! mascot-thinking "A Plan Is Data, and Data Can Be Checked"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    A language model that moves the arm directly is hard to test, because you cannot know what it will do next. A language model that writes a plan is easy to test, because the plan sits there as a list that code can inspect before one motor turns. Whenever you can turn a decision into data, you gain a place to put a safety check.

Research on robots that use language models points the same way. The SayCan system (Ahn and colleagues, 2022) combines what a language model suggests with value functions of the robot's own skills, so that the plan is grounded in what the robot can actually do. Code as Policies (Liang and colleagues, 2022) has a model write Python code that calls the robot's functions. ReAct (Yao and colleagues, 2022) has a model alternate between reasoning and acting so that it can use what it learns from the world. In each, the model's output is a program or a plan over a *fixed set of skills*, which is what the tools of Chapter 15 are.

### Task Planning and Task Decomposition

**Task planning** is working out a sequence of actions that gets from the present state to a goal. **Task decomposition** is its main technique: break a goal into smaller steps, each one small enough to be a single tool call. The goal "put the red block in the bin" decomposes into ten steps. The plan below is exactly what the lab's planner produces for a block at (0.22, 0.089) m.

| Step | Tool | Why |
|---|---|---|
| 1 | `get_status` | Look before moving, as the skill's first rule says |
| 2 | `open_gripper` | Open before approaching, or the fingers hit the block |
| 3 | `move_to_pose` above the block | Approach from above (Chapter 11) |
| 4 | `move_to_pose` down to the block | The fingers surround it |
| 5 | `close_gripper` | Grasp, and read whether anything is held |
| 6 | `move_to_pose` above the block | Lift |
| 7 | `move_to_pose` above the bin | Carry |
| 8 | `move_to_pose` down into the bin | Lower |
| 9 | `open_gripper` | Release |
| 10 | `go_home` | Clear of the table |

The **agent planner** is the part that produces such a list. In the lab it is a short function, `plan_pick_and_place`, so that everything runs offline. In a real system it is a language model that receives the goal and the scene description, and the tool schemas, and answers with the same list as JSON. Because the answer is data, the first thing the program does with it is `validate_plan`: every step is checked against its tool's schema, and a plan with an invented tool or a value out of range is refused *as a whole*, with each fault named by its step number, before any step runs. The rule from Chapter 11 for waypoint lists applies again: check the whole list before anything moves.

#### Diagram: Plan Checker

<details markdown="1">
<summary>Plan Checker</summary>
Type: microsim
**sim-id:** plan-checker<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Analyze<br/>
**Bloom Verb:** examine<br/>
**Learning Objective:** The learner will examine eight pick-and-place plans written as lists of tool calls and name the problem with each, or say that the plan is valid, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** task planning, task decomposition, the planner-executor split, the plan of ten steps, tool schemas and their ranges (all defined in the section "The Architecture of an Agent System" above this block and in Chapter 15).

**Evidence of Mastery:** For each of eight plans the learner chooses one of six outcomes and commits. A choice is correct when it matches the Outcome column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the model plan in Explore mode is exploration, not evidence.

**Misconceptions:** (1) A plan is fine if each step is individually legal. (The order matters: closing the gripper before the approach, or lifting without checking the grasp, are order faults.) (2) A plan that the model wrote needs no checking. (A plan is data that should always be checked as a whole.) (3) The executor can fix a bad plan as it goes. (It should refuse a bad plan before anything moves.)

**Instructional Rationale:** An Analyze-level examine objective asks the learner to break a plan into its steps and test each against rules and against its neighbors. Each plan has at most one fault, so the learner must look for the specific rule that is broken.

**Content:**

The model plan, shown in Explore mode, is the ten-step plan of the chapter. The six outcomes: "Valid plan", "Missing status check", "Gripper closed on approach", "Value out of range", "No grasp check before lifting", "Uses a tool that does not exist". Eight plans in this fixed order, each a short list of steps:

| # | Plan | Outcome | Why (shown as feedback) |
|---|---|---|---|
| 1 | get_status, open_gripper, move above the block, move down, close_gripper, check holding_something, move up, go_home | Valid plan | Every rule is met and the order is safe. |
| 2 | open_gripper, move above the block, move down, close_gripper, check holding_something, move up | Missing status check | The first step should be get_status, so that the plan starts from what the arm really reports. |
| 3 | get_status, move above the block, move down, close_gripper, check holding_something, move up | Gripper closed on approach | The gripper was never opened, so the fingers would hit the block on the way down. |
| 4 | get_status, open_gripper, move above the block with z = 0.01, move down, close_gripper, check holding_something | Value out of range | z = 0.01 is below the minimum of 0.02 m. |
| 5 | get_status, open_gripper, move above the block, move down, close_gripper, move up | No grasp check before lifting | The plan lifts without reading whether the gripper holds something. |
| 6 | get_status, open_gripper, move above the block, wave_hello, move down | Uses a tool that does not exist | There is no tool called wave_hello. |
| 7 | get_status, open_gripper, move above the block, move down, close_gripper, check holding_something, move above the bin, open_gripper, go_home | Valid plan | The grasp is checked and the order is safe. |
| 8 | get_status, open_gripper, move above the block with x = 0.40, move down, close_gripper, check holding_something | Value out of range | x = 0.40 is above the maximum of 0.28 m. |

**Provenance:** The ten-step plan, the tools and the ranges are from the chapter and Chapter 15. The plans are illustrative and written for this sim.

**Rules:** Each plan has at most one fault, and exactly one correct outcome. The checks, in order: every tool exists; every value is inside its range; the first step is get_status; the gripper is opened before the first move down; a close_gripper step is followed by a check of holding_something before any lift.

**Learner Activity:**

1. In Explore mode the learner reads the model plan and the five checks.
2. The learner switches to the eight plans. Plan 1 is shown.
3. The learner chooses an outcome and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After plan 8 it shows the score.

**Feedback:** Eight plans, fixed order, one attempt each. Correct: "Correct: <outcome>. <Why>". Incorrect: "Not quite. This plan is: <outcome>. <Why>". The correct outcome is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the model plan listed and the prompt "What is wrong with this plan, if anything?" ready for the first plan.

**Chapter Anchors:** The chapter's plan has ten steps, starts with get_status, opens the gripper before the approach, and checks the grasp before lifting. The ranges are x 0.10 to 0.28 m and z 0.02 to 0.07 m. The sim has eight plans and mastery is 7 of 8.
</details>

### The Learned Policy Executor

A step of a plan does not have to be a single tool call. A **learned policy executor** is an executor that, for a certain kind of step, hands control to a trained policy (Chapter 14) for a short time. A plan could read "move above the block, then run the grasp policy for up to 10 seconds, then check the grip". The planner works at the level of *goals* ("grasp the block"), the policy does the delicate motion that is hard to program, and the executor puts a time limit around the policy and checks the result when it returns. The same safety rules apply to the policy's actions as to any other (Chapter 14's warning), and the executor's check after the policy is exactly the grasp check of this chapter. Teaming a planner with learned skills in this way is the idea behind SayCan.

## Seeing with a Vision-Language Model

### Vision-Language Models

A **vision-language model** (VLM) is a language model that can also take pictures as input: it interprets and generates information from both images and text. You send it a picture and a question, such as "list the blocks on the table and where they are", and it answers in words, or in JSON if you ask. Through a web API, the picture travels as part of the message. In Anthropic's Messages API an image is a content block of type `image` with a `source` that holds the picture as base64 text and its media type, and the text question comes after it ("images before text" works best). The example below is the shape of such a call. It needs a key and a network, and so it is shown and not run:

```python linenums="1"
import base64
import anthropic

MODEL = "put-a-current-model-name-from-the-provider-here"
client = anthropic.Anthropic()
with open("plots/scene.png", "rb") as f:
    picture = base64.standard_b64encode(f.read()).decode("utf-8")

message = client.messages.create(
    model=MODEL, max_tokens=1024,
    messages=[{"role": "user", "content": [
        {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": picture}},
        {"type": "text", "text": 'Return JSON like {"objects": [{"label": "red block", "box": [x1, y1, x2, y2]}]} '
                                 "with a box in pixels for every block on the table."},
    ]}],
)
print(message.content[0].text)
```

Pictures cost. A provider charges for a picture in *tokens*, and for Anthropic's models the count is about \( \lceil w / 28 \rceil \times \lceil h / 28 \rceil \) for a picture of width \( w \) and height \( h \) pixels, up to a limit that depends on the model. A 640 by 480 picture costs \( 23 \times 18 = 414 \) tokens. A 1920 by 1080 one is shrunk to about 1456 by 819 first and costs about 1560, nearly four times as much, and the provider advises reducing a picture when you do not need the detail. A camera frame is almost always bigger than the model needs. The limits, the formula and the model names change, so read the provider's current documentation.

Open-weights models can run on your own computer. Examples that were current when this was written are SmolVLM-Instruct (about 2 billion numbers, an Apache 2.0 license, and about 5 GB of GPU memory according to its card) and Qwen2.5-VL-3B-Instruct, whose license is not Apache 2.0, so read it before you use the model in a class. The catalog of such models turns over fast.

### Scene Descriptions and Object Localization

A **scene description** is the written summary of what the camera sees, in a fixed form that the planner can use. The simplest useful form is a JSON list of objects, each with a label and a position. It is the *contract* between perception and planning: perception promises to deliver that form, and planning promises to use only that form. **Object localization** is finding where an object is in the picture, and a VLM can return a *bounding box*, the corners \( [x_1, y_1, x_2, y_2] \) of a rectangle around the object in pixels, with the origin at the top left and \( y \) increasing downward. Ask for absolute pixels, since the provider's guidance is that models do not do well with normalized coordinates, and remember that the coordinates refer to the picture *as the model saw it*: if the picture was resized, scale the answer back.

Treat every box as a *claim*. The provider's own documentation says that a model's coordinates are approximate and should be verified before you rely on them, that small objects lose precision, and that counts of objects can be off. So the lab's `check_detection` function tests each box before it is believed: the box must lie inside the picture, it must be about the size of a block, and the point it gives must fall inside the area that the arm's tools allow. A hallucinated box, in the lab a "yellow block" whose box is off the edge of the picture, is rejected before it can become a target.

### Image-to-Arm Coordinates

**Image-to-arm coordinates** is the step that turns a box into a point for the arm, and you built it in Chapter 14. Take the middle of the box, \( ((x_1 + x_2)/2, (y_1 + y_2)/2) \), and convert it with the pixel-to-world homography that the four markers give. The result is \( (x, y) \) in metres in the base frame, which the planner puts into a `move_to_pose` step. In the lab the three blocks come out within 1.4 to 2.5 mm of their true positions, even though the pretend model's boxes are a few pixels off, because a few pixels are a millimetre or two at this camera height. On a real camera the error will be larger, so measure it, as Chapter 14 advised.

!!! mascot-warning "A Model's Coordinates Are a Guess Until You Check Them"
    ![Servo holding up a warning sign](../../img/mascot/warning.png){ class="mascot-admonition-img" }
    A vision model can give a confident box around something that is not there, or put a real object a hand's width from where it is. Always check the box (inside the picture, a believable size, inside the arm's allowed area), and for anything that matters, confirm with a second look or ask a person before the arm moves.

## When Something Goes Wrong

### Replanning and Failed Grasp Recovery

**Replanning** is making a new plan from the *present* situation when the old one stops working. It differs from retrying: a retry repeats the same step, and a replan builds a different list, because something changed. A refused tool call is a good example. When `move_to_pose` says "x is outside 0.1 to 0.28", repeating it is pointless, and a new plan with a corrected x is the answer. **Failed grasp recovery** is the most common recovery on a real arm, and it follows a short routine. The `close_gripper` tool reports whether it holds something (an empty gripper closes fully, and a held object stops it, Chapter 11). If it holds nothing, open the gripper, go back to the approach and try once more, since a block may simply have moved a little. If the second try fails as well, stop trying and ask. The lab's executor does just that.

### Asking a Human

**Asking a human** is a *recovery action*, and often the right one. An agent should ask in three situations. It cannot do what was requested (the tools do not allow it). It cannot tell what was meant (two red blocks, or "put it over there"). Or it has tried the allowed recoveries and failed. A good question is specific and gives the person something to do: "I could not pick the block up after two tries. Please look at the table and tell me what to do" is better than "error". The rules of thumb in the table help to choose.

| Situation | Best next action | Why |
|---|---|---|
| A grasp finds nothing, the first time | Retry the approach once | The block may have moved slightly |
| A grasp finds nothing, the second time | Ask a human | The retry has failed, so something else is wrong |
| A tool refuses a value and states the range | Replan with a value inside the range | The refusal says exactly how to fix it |
| The same refusal happens twice | Ask a human | The agent is not making progress |
| The status says the arm is stopped | Ask a human, and wait | Only a person can clear a stop |
| The scene has two objects that match the request | Ask a human | A guess could move the wrong one |
| The first look finds no objects | Retry the look once | The picture may have been blurred |
| The user says stop | Stop the arm | Nothing is more important |

#### Diagram: Failure Recovery Chooser

<details markdown="1">
<summary>Failure Recovery Chooser</summary>
Type: microsim
**sim-id:** failure-recovery-chooser<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Evaluate<br/>
**Bloom Verb:** recommend<br/>
**Learning Objective:** The learner will recommend the best next action for each of eight situations an agent meets, choosing among retry once, replan, ask a human and stop the arm, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** replanning, failed grasp recovery, asking a human, the stop tool, the table of situations (all defined in the section "When Something Goes Wrong" above this block).

**Evidence of Mastery:** For each of eight situations the learner chooses one of four actions and commits. A choice is correct when it matches the Best action column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the guidance in Explore mode is exploration, not evidence.

**Misconceptions:** (1) The agent should keep retrying until it works. (After one retry, repeated attempts waste time and can cause harm.) (2) Ambiguity should be settled by a best guess. (A wrong guess can move the wrong object, so ask.) (3) A stopped arm can be restarted by the agent. (Only a person can clear a stop.)

**Instructional Rationale:** An Evaluate-level recommend objective asks the learner to choose a course of action against criteria and justify it. The four actions differ in risk and cost, so the learner must weigh them against each situation.

**Content:**

The four actions: "Retry once", "Replan", "Ask a human", "Stop the arm". Eight situations in this fixed order:

| # | Situation | Best action | Why (shown as feedback) |
|---|---|---|---|
| 1 | The grasp check says nothing is held, on the first attempt. | Retry once | The block may have moved a little, so one more try is reasonable. |
| 2 | The grasp check says nothing is held, on the second attempt. | Ask a human | The retry failed, so something else is wrong. |
| 3 | move_to_pose is refused: "x = 0.35 is outside the allowed range 0.1 to 0.28". | Replan | The refusal says how to fix the plan, so build a new one with x inside the range. |
| 4 | get_status says that the arm is stopped. | Ask a human | Only a person can clear a stop, and the agent should wait. |
| 5 | The scene description lists two red blocks, and the request was "pick up the red block". | Ask a human | A guess might move the wrong block. |
| 6 | The first look at the table returns no objects. | Retry once | The picture may have been blurred or dark, so look again. |
| 7 | The same refusal comes back twice in a row for the same step. | Ask a human | The agent is not making progress. |
| 8 | The user types "Stop!" while the arm is moving. | Stop the arm | Stopping is always the priority. |

**Provenance:** The actions and reasons are from the chapter section "When Something Goes Wrong". The situations are illustrative and written for this sim.

**Rules:** Each situation has exactly one correct action. "Retry once" applies to a first failure that may be due to chance. "Replan" applies when an error message says how to change the plan. "Ask a human" applies to repeated failure, ambiguity and a stop. "Stop the arm" applies to a user's request to stop.

**Learner Activity:**

1. In Explore mode the learner reads the table of situations and actions.
2. The learner switches to the eight situations. Situation 1 is shown.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After situation 8 it shows the score.

**Feedback:** Eight situations, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. The best action is: <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the four actions listed and the prompt "What should the agent do next?" ready for the first situation.

**Chapter Anchors:** The chapter's recovery routine retries a missed grasp once and then asks a person, replans after a refusal that states a range, and asks a human for a stop or for two matching objects. The sim has eight situations and mastery is 7 of 8.
</details>

## Interfaces: Web APIs, MCP, and ROS 2

### HTTP APIs, JSON Requests, and the Requests Library

An **HTTP API** is a way for one program to ask another to do something over a network, using the same protocol as the web. A client sends a *request*, a method such as GET or POST, an address, headers and sometimes a body, and the server sends back a *response* with a *status code* and usually a body. **JSON requests** carry their data as JSON in the body, which is the same format as the tool arguments of Chapter 15, so a tool call is naturally a POST. The status code is a number that says how it went, and its first digit is the useful part: 2xx means success, 4xx means that *you* sent something wrong (so fix the request), and 5xx means that the *server* had a problem (so retry later, or report it).

The **requests library** is Python's usual client (`pip install requests`). A call looks like `requests.post(url, json=body, headers=headers, timeout=5)`. The `json=` argument turns a dictionary into a JSON body, `headers` carries things such as the key, `response.json()` turns the answer back into a dictionary, and `response.raise_for_status()` raises an `HTTPError` for any 4xx or 5xx. The `timeout` argument is not optional in practice. The library's own documentation says that nearly all production code should use it, and without one a request to a server that has gone quiet waits forever, which, for a program that moves an arm, is the failure of Chapter 4's lesson again. Also check the status code before you read the body: a failed call can still return JSON, which holds the explanation.

| Status | Meaning | What the client should do |
|---|---|---|
| 200 | It worked | Use the answer |
| 400 | The request was malformed or invalid | Fix the request (the body says how) |
| 401 | The key is missing or wrong | Fix the key |
| 403 | The key is fine but is not allowed to do this | Ask for permission |
| 404 | No such address or tool | Fix the address or the name |
| 409 | A conflict with the state of the thing (the arm is stopped) | Wait; ask a person |
| 429 | Too many requests | Slow down, then retry |
| 500 | The server failed | Retry after a wait, then report it |
| 529 | The service is overloaded (Anthropic's code) | Retry later |

### Tool Servers

A **tool server** puts the arm's tools behind an HTTP API, so that any client on the network, whether an agent, a script or a web page, can use them through the same doorway. The lab's server uses only Python's standard library. It offers `GET /tools` (the schemas) and `POST /call/<tool>` (run a tool with a JSON body). It does not add any new safety logic: every call goes through `call_json` and `RobotSession.call`, so the bounds, the validation and the sticky stop of Chapter 15 apply exactly as before. The server only translates the result into the right status code, 200 for success, 400 for an invalid call, 404 for an unknown tool and 409 for a stopped arm. Keeping the safety in the tool layer, and not in the server, means that the same rules hold whichever way a request arrives, which is the reason to build it in that order.

### API Key Handling

An **API key** is a secret string that proves who is calling, and for a cloud model it also means that someone is paying. **API key handling** is the set of habits that keeps it secret. The server in the lab requires the key in an `X-API-Key` header, compares it in a way that does not leak timing (`hmac.compare_digest`), and answers 401 if it is missing or wrong. The habits for the keys themselves are these, and they follow the guidance that model providers publish:

- Never put a key in your code or in a file that goes into Git. Read it from an *environment variable* with `os.environ["NAME"]`, which is how Anthropic's library finds `ANTHROPIC_API_KEY` by itself.
- For a project, keep keys in a `.env` file, load it with the `python-dotenv` package (`load_dotenv()`), and put `.env` in `.gitignore` *before* you create the file.
- Use a separate key for each purpose, set spending limits, and rotate keys regularly.
- Turn on secret scanning for your repository: GitHub scans for leaked credentials, and LeRobot's own pre-commit checks include a secret scanner called gitleaks.
- If a key has ever been in a public place, even for a minute, treat it as stolen and replace it.

The lab's `check_secrets.py` is a small version of such a scanner. It looks for strings that look like keys, ignores lines that read the environment, and checks that a `.env` file is listed in `.gitignore`.

!!! mascot-tip "Ignore .env Before You Create It"
    ![Servo pointing upward with a tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Add `.env` to `.gitignore` first, then create the file. The other order is how keys end up in public repositories: one `git add .` is all it takes, and Git remembers it even after you delete the file.

#### Diagram: HTTP Status Reader

<details markdown="1">
<summary>HTTP Status Reader</summary>
Type: microsim
**sim-id:** http-status-reader<br/>
**Library:** p5.js<br/>
**Status:** Specified<br/>
**Bloom Level:** Understand<br/>
**Bloom Verb:** interpret<br/>
**Learning Objective:** The learner will interpret eight HTTP status codes returned by the arm's tool server or a model provider by choosing what the client should do, with at least 7 of 8 correct on the first attempt.

**Prerequisites:** HTTP API, status code, requests library, API key (all defined in the sections "HTTP APIs, JSON Requests, and the Requests Library" and "API Key Handling" above this block).

**Evidence of Mastery:** For each of eight responses the learner chooses one of six actions and commits. A choice is correct when it matches the Action column in Content. Mastery is 7 of 8 correct on the first attempt. Reading the status table in Explore mode is exploration, not evidence.

**Misconceptions:** (1) Any error means that the server is broken. (A 4xx means that the request was wrong.) (2) A 401 means the request body is wrong. (It means the key is missing or wrong.) (3) A 429 should be retried at once. (The client should slow down first.)

**Instructional Rationale:** An Understand-level interpret objective asks the learner to explain what a message means. The status code's first digit separates the client's faults from the server's, so the learner must connect each code to the right party and the right remedy.

**Content:**

The six actions: "Use the answer", "Fix the request", "Fix the key or the permission", "Fix the address or the name", "Slow down and retry later", "Server problem: retry after a wait, then report". Eight responses in this fixed order:

| # | Response | Action | Why (shown as feedback) |
|---|---|---|---|
| 1 | 200 from POST /call/get_status | Use the answer | The call worked. |
| 2 | 400 with the message "x = 0.35 is outside the allowed range 0.1 to 0.28" | Fix the request | The request had an invalid value, and the message says how to correct it. |
| 3 | 401 from GET /tools | Fix the key or the permission | The X-API-Key header is missing or wrong. |
| 4 | 403 from a model provider with a valid key | Fix the key or the permission | The key is valid but is not allowed to do this. |
| 5 | 404 from POST /call/wave_hello | Fix the address or the name | There is no tool with that name. |
| 6 | 429 from a model provider | Slow down and retry later | The client sent too many requests. |
| 7 | 500 from a model provider | Server problem: retry after a wait, then report | The failure is on the server's side, and a retry after a wait often works. |
| 8 | 529 from a model provider | Slow down and retry later | The service is overloaded, so retry after a wait. |

**Provenance:** The meanings of the codes are from the chapter's status table, which follows the Anthropic API's documentation of its errors (401 for a problem with the key, 429 for rate limits, 500 for a server error to retry with backoff, 529 for overload) and the lab's tool server (400, 404 and 409). The responses are illustrative and written for this sim.

**Rules:** Each response has exactly one correct action. A 2xx is success. A 4xx is the client's fault, and the action depends on the code. A 5xx is the server's fault. A 429 and a 529 are answered by waiting.

**Learner Activity:**

1. In Explore mode the learner reads the status table.
2. The learner switches to the eight responses. Response 1 is shown.
3. The learner chooses an action and commits.
4. The sim shows whether the choice was correct and the Why text, then moves on. After response 8 it shows the score.

**Feedback:** Eight responses, fixed order, one attempt each. Correct: "Correct: <action>. <Why>". Incorrect: "Not quite. The right action is: <action>. <Why>". The correct action is revealed after each commit. A running count "Correct: n of 8" is shown and the final screen says whether mastery (7 of 8) was reached.

**Starting State:** Explore mode with the status table listed and the prompt "What should the client do?" ready for the first response.

**Chapter Anchors:** The chapter's table lists 200, 400, 401, 403, 404, 409, 429, 500 and 529, and states that 4xx is the client's fault and 5xx the server's. The sim has eight responses and mastery is 7 of 8.
</details>

### The Model Context Protocol and MCP Servers

The **Model Context Protocol** (MCP) is an open standard for connecting AI applications to tools and data, and the tool server above is a homemade version of the same idea. In MCP a *host* (the AI application) starts *clients*, each of which connects to a *server* that offers *tools*, *resources* and *prompts*. The messages are JSON-RPC, and the two usual transports are *stdio* (the client starts the server as a program and talks to it on its standard input and output) and *streamable HTTP*. The specification read for this book was dated 2026-07-28. The point of a standard is that a tool written once works with any client that speaks it.

An **MCP server** for the arm is short with the official Python SDK, because the SDK builds the tool schema from the function's type hints. The SDK's package is `mcp`, and in version 2 its server class is called `MCPServer`. (In version 1 it was `FastMCP`, in `mcp.server.fastmcp`, and old tutorials use that name, which fails on version 2, so check the version that you installed.) The lab's `arm_mcp.py` registers four of the arm's tools, with the bounds written as type hints (`Annotated[float, Field(ge=0.10, le=0.28)]`), and the SDK turns them into the same `minimum` and `maximum` that Chapter 15 wrote by hand. The SDK checks the arguments *before your function runs* and refuses a value out of range with a technical message, so a real design catches that message, or keeps the friendlier validation of Chapter 15 inside the function as well. Two cautions come from the specification itself. Tools "represent arbitrary code execution and must be treated with appropriate caution", so a host should get a person's consent before it runs one. And a server that uses the stdio transport must never print to standard output, because that channel carries the protocol's messages, so write logs to the standard error stream or to a file.

### ROS 2 Bridges

A **ROS 2 bridge** connects the agent's tools to the ROS 2 world of Chapter 13, and it is another doorway, with the same rules. One node wraps the arm's tools: it subscribes to a topic of commands, runs each one through the same `RobotSession.call`, and publishes the result and the arm's state as a `sensor_msgs/JointState` message. In the other direction, an agent running outside ROS can call the tools through the tool server or MCP, and the bridge makes the arm appear to the rest of a ROS system, such as MoveIt or a camera node, as an ordinary participant. The reBot-DevArm's published ROS 2 packages target the Humble release and live in separate repositories. The design rule is the one of the whole chapter: whatever the route in, the call arrives at the same checked tools.

## Where the Agent Runs

### Local and Cloud Agents

A **local agent** runs on a computer that you control, with a model that runs there too, and a **cloud agent** uses a model that runs on a provider's computers and is reached over the internet. Each has a place. A cloud model is usually more capable, needs no special hardware, and costs money for each use, and it needs a network that works. A local model is private and costs nothing per use, and it is limited by the computer's memory and speed. Running a model locally has become simple: Ollama is an open-source program that downloads a model and serves it on your own computer, at `http://localhost:11434` by default, with a command such as `ollama run <model name>` and an HTTP API that takes JSON requests, so the tool-calling loop of this chapter works against it in the same way.

An **edge AI computer** is a small computer built to run models on the robot itself. Examples are NVIDIA's Jetson Orin Nano Super Developer Kit (67 trillion operations per second at 8-bit precision and 8 GB of memory, according to NVIDIA) and a Raspberry Pi 5 with the AI HAT+ accessory (13 or 26 trillion operations per second). Prices of such boards have moved a great deal with the cost of memory: the Jetson was announced at $249 and a trade report in July 2026 said that NVIDIA had raised it to $399, so check a current price before you plan a class set. A model has to fit the board's memory, which means small models, and small models are less reliable at planning than the large ones, which argues for keeping the planner's job simple and the checks strict.

### Latency, Cost, and Privacy

**Latency and cost** are the price of a cloud agent. Every turn of the agent loop is a request over the network, so a task of ten tool calls is ten round trips, each taking a second or more, and a picture adds tokens, which add both time and money (the formula above). Three habits cut both: shrink pictures to what the model needs, keep the tools' answers short (Chapter 15's table), and give the model a *whole plan* to write in one go instead of a call per step. The planner-executor split helps again, since a plan is written once and executed locally, with no model in the loop for each step.

**Privacy considerations** matter because a camera sees whatever is in front of it. A picture sent to a cloud model leaves your computer and is handled under the provider's rules. A dataset pushed to the Hugging Face Hub (Chapter 14) is public unless you mark it private. A camera in a classroom or a bedroom may capture people who did not agree to it. The practical rules are to know where each picture goes, to point cameras at the work area and not at people, to use a local model when the scene is sensitive, and to keep the logs of Chapter 13 free of keys and of pictures that you do not need.

| | Local agent | Cloud agent |
|---|---|---|
| Where the model runs | Your computer or an edge board | The provider's computers |
| Capability | Limited by memory and speed | Usually higher |
| Cost | The hardware, then nothing per use | A charge for each use |
| Network | Not needed | Required |
| Privacy | Pictures stay with you | Pictures go to the provider |
| Delay per turn | Depends on the hardware | A network round trip plus the model's time |

!!! mascot-neutral "Pick the Smallest Setup That Works"
    ![Servo in a neutral pose](../../img/mascot/neutral.png){ class="mascot-admonition-img" }
    A class of twelve does not need a cloud model for every wiggle of the gripper. A local model for the planner, a strict executor, and a cloud model only for the occasional hard question is a sensible shape. Choose by what must stay private and what the network will allow.

## Lab: Perceive, Plan, Check, and Execute

In this lab you will build the parts of the chapter and join them into one run, entirely on your computer: a pretend vision model, a plan checker and executor with recovery, a tool server that you call with `requests`, an MCP server for the arm, and a secret scanner. You need no key, no network and no arm. The new libraries are `requests` and `mcp`. You will extend the `arm-lab` project and reuse the tools, the vision code and the fake arm.

**Step 1. Activate the project and install the libraries.** The pin on `mcp` matters, because the server class was renamed in version 2.

```bash
cd ~/projects/arm-lab
source .venv/bin/activate
python -m pip install requests "mcp>=2"
git status
```

**Step 2. Write the pretend world and the planner.** `WorldSession` is the `RobotSession` of Chapter 15 with an object that `close_gripper` can find or miss. `plan_pick_and_place` is the agent planner, and `Step` is one line of a plan. `validate_plan` checks every step against its tool's schema and names each fault by its step number. `execute_plan` is the executor: it validates first, runs the steps in order, looks at each result, and handles a missed grasp by retrying once and then asking. Create `armlab/world.py` and `armlab/planner.py`:

```python linenums="1"
"""A pretend world for the tools: an object that the gripper can hold, or miss."""

from armlab.tools import RobotSession


class WorldSession(RobotSession):
    """A RobotSession in which close_gripper can find an object of some width, or find nothing."""

    def __init__(self, *args, object_percent=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.object_percent = object_percent          # None means there is no object in the way

    def _tool_close_gripper(self):
        arm = self._arm()
        stop_at = 0.0 if self.object_percent is None else float(self.object_percent)
        with arm:
            self._go(arm, arm.read_pose().with_joint("gripper", stop_at), 200)
        holding = self.object_percent is not None
        self.state["holding"] = holding
        return {"ok": True, "message": "gripper closed", "holding_something": holding,
                "gripper_percent": round(stop_at, 1)}
```

```python linenums="1"
"""Planning and executing: a plan is data, it is checked as a whole, and a separate executor runs it step by step."""

from dataclasses import dataclass, field

from armlab.tools import TOOLS, validate

Z_ABOVE, Z_DOWN = 0.07, 0.03


@dataclass
class Step:
    """One step of a plan: a tool, its arguments, and a note on what it is for."""
    tool: str
    args: dict = field(default_factory=dict)
    note: str = ""


def plan_pick_and_place(pick_xy, bin_xy):
    """Break 'put the block in the bin' into steps (task decomposition). This is the job of the planner."""
    (px, py), (bx, by) = pick_xy, bin_xy
    return [
        Step("get_status", {}, "look before moving"),
        Step("open_gripper", {"percent": 100}, "open before approaching"),
        Step("move_to_pose", {"x": px, "y": py, "z": Z_ABOVE, "speed_dps": 60}, "above the block"),
        Step("move_to_pose", {"x": px, "y": py, "z": Z_DOWN, "speed_dps": 60}, "down to the block"),
        Step("close_gripper", {}, "grasp"),
        Step("move_to_pose", {"x": px, "y": py, "z": Z_ABOVE, "speed_dps": 60}, "lift"),
        Step("move_to_pose", {"x": bx, "y": by, "z": Z_ABOVE, "speed_dps": 60}, "above the bin"),
        Step("move_to_pose", {"x": bx, "y": by, "z": Z_DOWN, "speed_dps": 60}, "down into the bin"),
        Step("open_gripper", {"percent": 100}, "release"),
        Step("go_home", {}, "clear of the table"),
    ]


def validate_plan(plan):
    """Check every step of a plan before anything moves. Returns a list of problems, each naming its step."""
    problems = []
    for number, step in enumerate(plan, start=1):
        if step.tool not in TOOLS:
            problems.append(f"step {number}: there is no tool called {step.tool!r}")
        else:
            problems += [f"step {number} ({step.tool}): {problem}" for problem in validate(step.tool, step.args)]
    return problems


def execute_plan(session, plan, log=print, max_attempts=2, asker=None):
    """Run a plan step by step and look at what each step returns. This is the job of the executor.

    A refusal ends the run. A grasp that holds nothing is retried from the approach, up to max_attempts times,
    and after that the executor asks a person, by calling asker(message), and stops.
    Returns "done", "refused" or "asked a person".
    """
    problems = validate_plan(plan)
    if problems:
        log("   plan rejected before any move: " + " ".join(problems))
        return "refused"
    attempt, number = 1, 0
    while number < len(plan):
        step = plan[number]
        result = session.call(step.tool, step.args)
        log(f"   step {number + 1:>2} {step.tool:<13} {step.note:<22} -> {'ok' if result['ok'] else 'REFUSED: ' + result['error']}")
        if not result["ok"]:
            return "refused"
        if step.tool == "close_gripper" and not result["holding_something"]:
            log(f"   grasp check: nothing is held (attempt {attempt} of {max_attempts})")
            if attempt >= max_attempts:
                message = "I could not pick the block up after two tries. Please look at the table and tell me what to do."
                (asker or log)("   asking a person: " + message)
                return "asked a person"
            attempt += 1
            number = 1                                    # recovery: open the gripper again and re-approach
            continue
        number += 1
    return "done"
```

**Step 3. Write the perception module.** `MockVLM` plays the part of the vision-language model: it finds the real blocks in the synthetic picture of Chapter 14 and returns their boxes as JSON text, a few pixels off, and it can add an invented object. `parse_detections` pulls the JSON out of the answer and checks its structure, and `check_detection` rejects a box that is outside the picture, the wrong size, or pointing outside the arm's allowed area. Create `armlab/perception.py`:

```python linenums="1"
"""Turning a vision-language model's answer into arm coordinates, without trusting it."""

import json

import cv2
import numpy as np

from armlab.vision import HEIGHT, WIDTH, find_blobs, pixel_to_world


class MockVLM:
    """A stand-in for a vision-language model. It answers a question about a picture with JSON boxes in pixels.

    It finds real blocks by color, then does what real models do: it is a few pixels off, and sometimes it invents an object.
    """

    def __init__(self, image, invent=None, seed=0):
        self.image, self.invent, self.rng = image, invent, np.random.default_rng(seed)

    def ask(self, question):
        objects = []
        for color in ("red", "green", "blue"):
            found = find_blobs(self.image, color)
            if found:
                (u, v), area = found[0]
                half = np.sqrt(area) / 2
                jitter = self.rng.normal(0, 3, 4)                     # a few pixels of error, as a real model has
                objects.append({"label": f"{color} block",
                                "box": [round(u - half + jitter[0]), round(v - half + jitter[1]),
                                        round(u + half + jitter[2]), round(v + half + jitter[3])]})
        if self.invent:
            objects.append(self.invent)
        return "Here is what I see: " + json.dumps({"objects": objects})


def parse_detections(text):
    """Pull the JSON out of a model's answer. Returns a list of {"label", "box"}, or raises ValueError."""
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < start:
        raise ValueError("the answer has no JSON in it")
    try:
        objects = json.loads(text[start:end + 1])["objects"]
    except (json.JSONDecodeError, KeyError) as error:
        raise ValueError(f"the JSON is not in the expected form: {error}") from error
    if not isinstance(objects, list):
        raise ValueError("objects must be a list")
    for item in objects:
        box = item.get("box") if isinstance(item, dict) else None
        if not (isinstance(item, dict) and "label" in item and isinstance(box, list) and len(box) == 4
                and all(isinstance(v, (int, float)) for v in box)):
            raise ValueError(f"each object needs a label and a box of four numbers, but got {item!r}")
    return objects


def check_detection(detection, matrix):
    """Return (world (x, y) or None, a list of reasons to reject the detection)."""
    x1, y1, x2, y2 = detection["box"]
    reasons = []
    if not (0 <= x1 < x2 <= WIDTH and 0 <= y1 < y2 <= HEIGHT):
        reasons.append("the box is not inside the picture")
    elif not 10 <= x2 - x1 <= 80 or not 10 <= y2 - y1 <= 80:
        reasons.append("the box is not the size of a block")
    if reasons:
        return None, reasons
    x, y = (float(c) for c in pixel_to_world(matrix, ((x1 + x2) / 2, (y1 + y2) / 2)))
    if not (0.10 <= x <= 0.28 and -0.15 <= y <= 0.15):
        return (x, y), ["the point is outside the area that the arm tools allow"]
    return (x, y), []
```

**Step 4. Run the perception.** Create `perception_demo.py`:

```python linenums="1"
"""A pretend vision-language model finds blocks, and the program decides which of its answers to believe."""

from armlab.perception import MockVLM, check_detection, parse_detections
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene

TRUE = {"red block": (0.22, 0.09), "blue block": (0.15, -0.12), "green block": (0.20, 0.00)}
image = render_scene([((0, 0, 255), TRUE["red block"], 0.03), ((255, 0, 0), TRUE["blue block"], 0.03),
                      ((0, 200, 0), TRUE["green block"], 0.03)])
matrix = pixel_to_world_matrix(detect_markers(image))

invented = {"label": "yellow block", "box": [650, 300, 700, 350]}          # a box that is off the edge of the picture
answer = MockVLM(image, invent=invented).ask("Return the boxes of every block, as JSON, in pixels.")
print("1. The model's answer (text, with JSON inside)")
print("  ", answer)

print("2. Parse it, then check each detection before believing it")
for detection in parse_detections(answer):
    world, reasons = check_detection(detection, matrix)
    if reasons:
        print(f"   {detection['label']:<12} REJECTED: {'; '.join(reasons)}")
    else:
        truth = TRUE[detection["label"]]
        error = 1000 * ((world[0] - truth[0]) ** 2 + (world[1] - truth[1]) ** 2) ** 0.5
        print(f"   {detection['label']:<12} accepted at ({world[0]:.3f}, {world[1]:+.3f}) m, "
              f"{error:.1f} mm from the truth")

print("3. Answers that are not JSON are an error, not a crash")
for text in ("I see three blocks on the table.", '{"objects": "none"}', '{"objects": [{"label": "red block"}]}', "{objects: []}"):
    try:
        print("  ", parse_detections(text))
    except ValueError as error:
        print(f"   ValueError: {error}")
```

```bash
python perception_demo.py
```

```text
1. The model's answer (text, with JSON inside)
   Here is what I see: {"objects": [{"label": "red block", "box": [204, 200, 239, 235]}, {"label": "green block", "box": [301, 224, 341, 260]}, {"label": "blue block", "box": [435, 275, 468, 312]}, {"label": "yellow block", "box": [650, 300, 700, 350]}]}
2. Parse it, then check each detection before believing it
   red block    accepted at (0.220, +0.089) m, 1.4 mm from the truth
   green block  accepted at (0.198, -0.001) m, 2.0 mm from the truth
   blue block   accepted at (0.152, -0.118) m, 2.5 mm from the truth
   yellow block REJECTED: the box is not inside the picture
3. Answers that are not JSON are an error, not a crash
   ValueError: the answer has no JSON in it
   ValueError: objects must be a list
   ValueError: each object needs a label and a box of four numbers, but got {'label': 'red block'}
   ValueError: the JSON is not in the expected form: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```

Three blocks were accepted, each within a few millimetres of the truth, and the invented yellow block was rejected because its box lies outside the picture. The three bad answers in item 3 each raise a `ValueError` with a reason, so a model that answers in the wrong form cannot crash the program or slip through.

**Step 5. Run the whole architecture.** The script perceives the red block, plans, checks the plan, and executes it three ways: a plan with two faults is refused as a whole, a plan with the block present is carried out, and a plan with the block missing fails its grasp check twice and ends by asking a person. Create `architecture_demo.py`:

```python linenums="1"
"""The whole architecture: perceive with a pretend VLM, plan, check the plan, and execute it with recovery."""

from pathlib import Path

from armlab.perception import MockVLM, check_detection, parse_detections
from armlab.planner import Step, execute_plan, plan_pick_and_place, validate_plan
from armlab.vision import detect_markers, pixel_to_world_matrix, render_scene
from armlab.world import WorldSession

BIN = (0.20, -0.10)
image = render_scene([((0, 0, 255), (0.22, 0.09), 0.03)])
matrix = pixel_to_world_matrix(detect_markers(image))
state_file = Path("state/architecture_state.json")

print("1. Perceive: ask the pretend model where the red block is, and check the answer")
detections = parse_detections(MockVLM(image).ask("Where is the red block? Answer in JSON, in pixels."))
red = next(d for d in detections if d["label"] == "red block")
(x, y), problems = check_detection(red, matrix)
print(f"   red block at ({x:.3f}, {y:+.3f}) m, problems: {problems or 'none'}")

print("2. Plan: break 'put the red block in the bin' into steps, and check the whole plan first")
plan = plan_pick_and_place((round(x, 3), round(y, 3)), BIN)
for number, step in enumerate(plan, start=1):
    print(f"   {number:>2}. {step.tool:<13} {step.args}  # {step.note}")
print(f"   problems found before any move: {validate_plan(plan) or 'none'}")

print("3. A bad plan is rejected as a whole")
bad = plan[:3] + [Step("wave_hello", {}, "an invented step"), Step("move_to_pose", {"x": 0.2, "y": 0.1, "z": 0.01}, "too low")]
state_file.unlink(missing_ok=True)
print("   result:", execute_plan(WorldSession(state_file=state_file, object_percent=20), bad))

print("4. Execute: the block is there, and the grasp check passes")
state_file.unlink(missing_ok=True)
print("   result:", execute_plan(WorldSession(state_file=state_file, object_percent=20), plan))

print("5. Execute: the block has gone, so the grasp check fails, the executor retries once and then asks a person")
state_file.unlink(missing_ok=True)
print("   result:", execute_plan(WorldSession(state_file=state_file, object_percent=None), plan))
state_file.unlink(missing_ok=True)
```

```bash
python architecture_demo.py
```

```text
1. Perceive: ask the pretend model where the red block is, and check the answer
   red block at (0.220, +0.089) m, problems: none
2. Plan: break 'put the red block in the bin' into steps, and check the whole plan first
    1. get_status    {}  # look before moving
    2. open_gripper  {'percent': 100}  # open before approaching
    3. move_to_pose  {'x': 0.22, 'y': 0.089, 'z': 0.07, 'speed_dps': 60}  # above the block
    4. move_to_pose  {'x': 0.22, 'y': 0.089, 'z': 0.03, 'speed_dps': 60}  # down to the block
    5. close_gripper {}  # grasp
    6. move_to_pose  {'x': 0.22, 'y': 0.089, 'z': 0.07, 'speed_dps': 60}  # lift
    7. move_to_pose  {'x': 0.2, 'y': -0.1, 'z': 0.07, 'speed_dps': 60}  # above the bin
    8. move_to_pose  {'x': 0.2, 'y': -0.1, 'z': 0.03, 'speed_dps': 60}  # down into the bin
    9. open_gripper  {'percent': 100}  # release
   10. go_home       {}  # clear of the table
   problems found before any move: none
3. A bad plan is rejected as a whole
   plan rejected before any move: step 4: there is no tool called 'wave_hello' step 5 (move_to_pose): z = 0.01 is outside the allowed range 0.02 to 0.07 (height above the table, meters). Choose a value inside the range.
   result: refused
4. Execute: the block is there, and the grasp check passes
   step  1 get_status    look before moving     -> ok
   step  2 open_gripper  open before approaching -> ok
   step  3 move_to_pose  above the block        -> ok
   step  4 move_to_pose  down to the block      -> ok
   step  5 close_gripper grasp                  -> ok
   step  6 move_to_pose  lift                   -> ok
   step  7 move_to_pose  above the bin          -> ok
   step  8 move_to_pose  down into the bin      -> ok
   step  9 open_gripper  release                -> ok
   step 10 go_home       clear of the table     -> ok
   result: done
5. Execute: the block has gone, so the grasp check fails, the executor retries once and then asks a person
   step  1 get_status    look before moving     -> ok
   step  2 open_gripper  open before approaching -> ok
   step  3 move_to_pose  above the block        -> ok
   step  4 move_to_pose  down to the block      -> ok
   step  5 close_gripper grasp                  -> ok
   grasp check: nothing is held (attempt 1 of 2)
   step  2 open_gripper  open before approaching -> ok
   step  3 move_to_pose  above the block        -> ok
   step  4 move_to_pose  down to the block      -> ok
   step  5 close_gripper grasp                  -> ok
   grasp check: nothing is held (attempt 2 of 2)
   asking a person: I could not pick the block up after two tries. Please look at the table and tell me what to do.
   result: asked a person
```

Look at item 3. The bad plan had an invented tool and a value out of range, and the executor named both faults by step number and moved *nothing*: the arm never left home. In item 5 the executor did what it was told to do for a missed grasp, and not one step more. It tried again from the approach, found nothing again, and asked. That is the planner-executor split working: the plan came from one place, the checks and the recovery from another.

!!! mascot-thinking "Two Programs, Two Jobs"
    ![Servo thinking with a hand on chin](../../img/mascot/thinking.png){ class="mascot-admonition-img" }
    The planner only wrote a list, and the executor only ran it and looked at the results. Neither had to be clever about safety, because the doorway under both of them was. When you add a new skill to the agent later, add it as a new tool and a new check, and leave the rest alone.

**Step 6. Put the tools behind a web API.** The tool server uses only the standard library. It requires an `X-API-Key` header, offers `GET /tools` and `POST /call/<tool>`, and turns each result into an honest status code. The script starts it in a background thread on a free port, with a key that comes from the environment (or a random one if the variable is not set), and uses it with `requests`. Create `armlab/toolserver.py` and `server_demo.py`:

```python linenums="1"
"""A tool server: the arm's tools behind a small web API, with an API key and honest HTTP status codes."""

import hmac
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from armlab.tools import TOOLS, call_json


def make_server(session, api_key, host="127.0.0.1", port=0):
    """Build (but do not start) a server for a RobotSession. port 0 lets the system pick a free port."""

    class Handler(BaseHTTPRequestHandler):
        def _reply(self, status, body):
            data = json.dumps(body).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def _authorized(self):
            given = self.headers.get("X-API-Key", "")
            return hmac.compare_digest(given.encode(), api_key.encode())     # compare without leaking timing

        def do_GET(self):
            if not self._authorized():
                return self._reply(401, {"error": "missing or wrong X-API-Key header"})
            if self.path == "/tools":
                return self._reply(200, {"tools": TOOLS})
            self._reply(404, {"error": f"no such address: {self.path}"})

        def do_POST(self):
            if not self._authorized():
                return self._reply(401, {"error": "missing or wrong X-API-Key header"})
            if not self.path.startswith("/call/"):
                return self._reply(404, {"error": f"no such address: {self.path}"})
            tool = self.path[len("/call/"):]
            body = self.rfile.read(int(self.headers.get("Content-Length", 0))).decode()
            result = call_json(session, tool, body)
            if result["ok"]:
                status = 200
            elif "unknown tool" in result["error"]:
                status = 404
            elif "is stopped" in result["error"]:
                status = 409                                # a conflict with the arm's state
            else:
                status = 400                                # a bad request: the caller can fix it
            self._reply(status, result)

        def log_message(self, *args):
            pass                                            # keep the console quiet

    return ThreadingHTTPServer((host, port), Handler)
```

```python linenums="1"
"""Start a tool server in the background and use it with the requests library: keys, status codes, timeouts."""

import os
import secrets
import threading
from pathlib import Path

import requests

from armlab.toolserver import make_server
from armlab.tools import RobotSession

state_file = Path("state/server_state.json")
state_file.unlink(missing_ok=True)
api_key = os.environ.get("ARM_API_KEY") or secrets.token_hex(16)        # from the environment; never typed into code
server = make_server(RobotSession(state_file=state_file), api_key)
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f"http://127.0.0.1:{server.server_address[1]}"
headers = {"X-API-Key": api_key}

print("1. Without a key, with a wrong key, and with the right key")
print("   no key:   ", requests.get(f"{base}/tools", timeout=5).status_code)
print("   wrong key:", requests.get(f"{base}/tools", headers={"X-API-Key": "not-the-key"}, timeout=5).status_code)
response = requests.get(f"{base}/tools", headers=headers, timeout=5)
print("   right key:", response.status_code, "->", sorted(response.json()["tools"]))

print("2. Calls, and the status code that each one gets")
for tool, body in (("get_status", {}), ("open_gripper", {"percent": 50}), ("move_to_pose", {"x": 0.35, "y": 0.1, "z": 0.05}),
                   ("wave_hello", {}), ("stop", {}), ("go_home", {})):
    response = requests.post(f"{base}/call/{tool}", json=body, headers=headers, timeout=5)
    reply = response.json()
    detail = reply.get("error") or reply.get("message") or "status report"
    print(f"   POST /call/{tool:<13} -> {response.status_code} {detail[:78]}")

print("3. raise_for_status turns a 4xx or 5xx into an exception that the program can handle")
try:
    requests.post(f"{base}/call/go_home", json={}, headers=headers, timeout=5).raise_for_status()
except requests.exceptions.HTTPError as error:
    print("   HTTPError:", str(error).split(" for url")[0])

print("4. A timeout stops a program from waiting forever for a server that is not there")
try:
    requests.get("http://10.255.255.1/tools", timeout=0.5)               # an address that does not answer
except requests.exceptions.RequestException as error:
    print("   the call ended with a requests exception instead of hanging:", isinstance(error, requests.exceptions.RequestException))

server.shutdown()
state_file.unlink(missing_ok=True)
```

```bash
python server_demo.py
```

```text
1. Without a key, with a wrong key, and with the right key
   no key:    401
   wrong key: 401
   right key: 200 -> ['close_gripper', 'get_status', 'go_home', 'move_to_pose', 'open_gripper', 'stop']
2. Calls, and the status code that each one gets
   POST /call/get_status    -> 200 status report
   POST /call/open_gripper  -> 200 gripper opened to 50 percent
   POST /call/move_to_pose  -> 400 x = 0.35 is outside the allowed range 0.1 to 0.28 (forward from the base, mete
   POST /call/wave_hello    -> 404 unknown tool 'wave_hello'. The tools are: get_status, move_to_pose, open_gripp
   POST /call/stop          -> 200 stopped: torque is off. Only a person can clear a stop.
   POST /call/go_home       -> 409 the arm is stopped. Only a person can clear a stop, so tell the user and wait.
3. raise_for_status turns a 4xx or 5xx into an exception that the program can handle
   HTTPError: 409 Client Error: Conflict
4. A timeout stops a program from waiting forever for a server that is not there
   the call ended with a requests exception instead of hanging: True
```

The status codes carry the meaning: 401 for a bad key, 400 for a value out of range, 404 for an invented tool, and 409 for a stopped arm, which `raise_for_status` turned into an `HTTPError` that a program can catch. The message for the 400 is the same sentence that the agent read in Chapter 15, because the server only passes it on. The last item shows a `timeout` at work, since without one that call could wait forever.

**Step 7. Offer the tools over MCP.** `arm_mcp.py` registers four tools with the MCP SDK, and the bounds are in the type hints. The script looks at the server from the inside, without starting a transport: it lists the tools, shows the schema that the SDK wrote for `z`, and calls a tool well and badly. Create `armlab/arm_mcp.py` and `mcp_demo.py`:

```python linenums="1"
"""The arm's tools as an MCP server: the same session and safety checks, offered to any MCP client."""

from typing import Annotated

from mcp.server import MCPServer
from pydantic import Field

from armlab.tools import RobotSession

session = RobotSession()
mcp = MCPServer("robot-arm")


def _show(result):
    """The text that goes back to the model: the message on success, the explanation on a refusal."""
    return result.get("message") or result.get("error") or str(result)


@mcp.tool()
def get_status() -> str:
    """Report where the arm is, the gripper opening in percent, and whether it is stopped."""
    return str(session.call("get_status"))


@mcp.tool()
def move_to_pose(x: Annotated[float, Field(ge=0.10, le=0.28, description="forward from the base, meters")],
                 y: Annotated[float, Field(ge=-0.15, le=0.15, description="to the left of the base, meters")],
                 z: Annotated[float, Field(ge=0.02, le=0.07, description="height above the table, meters")],
                 speed_dps: Annotated[float, Field(ge=5, le=60, description="joint speed limit, degrees per second")] = 30.0) -> str:
    """Move the gripper tip to a point on the table, with the gripper pointing down."""
    return _show(session.call("move_to_pose", {"x": x, "y": y, "z": z, "speed_dps": speed_dps}))


@mcp.tool()
def go_home() -> str:
    """Move the arm to its safe home pose."""
    return _show(session.call("go_home"))


@mcp.tool()
def stop() -> str:
    """Stop the arm now and turn its torque off. Only a person can clear a stop."""
    return _show(session.call("stop"))


if __name__ == "__main__":
    mcp.run(transport="stdio")          # an MCP client starts this program and talks to it on stdin and stdout
```

```python linenums="1"
"""Look at the arm's MCP server from the inside: the tools it lists, the schema made from the type hints, and refusals."""

import asyncio
from pathlib import Path

import armlab.arm_mcp as arm_mcp
from armlab.tools import RobotSession

Path("state/mcp_state.json").unlink(missing_ok=True)
arm_mcp.session = RobotSession(state_file="state/mcp_state.json")      # use a throwaway state file for the demo


async def main():
    tools = await arm_mcp.mcp.list_tools()
    print("1. The tools that an MCP client would see:", [tool.name for tool in tools])
    move = next(tool for tool in tools if tool.name == "move_to_pose")
    z = move.input_schema["properties"]["z"]
    print("2. The schema of z, written by the SDK from the type hint:", {k: z[k] for k in ("type", "minimum", "maximum")})
    print("   required parameters:", move.input_schema["required"])
    good = await arm_mcp.mcp.call_tool("move_to_pose", {"x": 0.2, "y": 0.1, "z": 0.05, "speed_dps": 60})
    print("3. A good call:", good.content[0].text)
    try:
        await arm_mcp.mcp.call_tool("move_to_pose", {"x": 0.35, "y": 0.1, "z": 0.05})
    except Exception as error:
        first_line = str(error).splitlines()[0] + " " + str(error).splitlines()[2].strip()
        print("4. A call beyond the limit is refused before the function runs:", first_line)


asyncio.run(main())
Path("state/mcp_state.json").unlink(missing_ok=True)
```

```bash
python mcp_demo.py
```

```text
1. The tools that an MCP client would see: ['get_status', 'move_to_pose', 'go_home', 'stop']
2. The schema of z, written by the SDK from the type hint: {'type': 'number', 'minimum': 0.02, 'maximum': 0.07}
   required parameters: ['x', 'y', 'z']
3. A good call: moved to (0.2, 0.1, 0.05) at up to 60.0 degrees per second
4. A call beyond the limit is refused before the function runs: Error executing tool move_to_pose: 1 validation error for move_to_poseArguments Input should be less than or equal to 0.28 [type=less_than_equal, input_value=0.35, input_type=float]
```

The schema that the SDK wrote from a type hint carries the same minimum and maximum as the one that you wrote by hand in Chapter 15, and the call beyond the limit was refused before the arm's code ran. To connect a real MCP client, you run `python -m armlab.arm_mcp`, which uses the stdio transport, and give the client that command. Check the client's documentation for how it starts a server. Remember that the SDK's refusal is technical, and that the checks in `RobotSession` are the ones that must always hold.

**Step 8. Scan for secrets.** `check_secrets.py` looks for lines that look like keys, and checks that a `.env` file is ignored. The demo builds a temporary project with a deliberate mistake and shows the scanner catching it. Create `check_secrets.py` and `secrets_demo.py`:

```python linenums="1"
"""Look through a project folder for things that look like leaked keys, and check that .env is ignored by Git."""

import re
import sys
from pathlib import Path

PATTERNS = [re.compile(r"sk-[A-Za-z0-9_\-]{20,}"),
            re.compile(r"(api[_-]?key|secret|token|password)\s*[=:]\s*[\"']?[A-Za-z0-9_\-]{16,}", re.IGNORECASE)]
SKIP = {".venv", ".git", "__pycache__", "node_modules", ".pytest_cache"}


def scan(folder):
    """Return a list of (file, line number, a short description) for lines that look like a secret."""
    findings = []
    for path in sorted(Path(folder).rglob("*")):
        if path.is_dir() or SKIP & set(path.parts) or path.suffix in {".png", ".npz", ".csv", ".stl"}:
            continue
        try:
            lines = path.read_text().splitlines()
        except (UnicodeDecodeError, OSError):
            continue
        for number, line in enumerate(lines, start=1):
            if any(pattern.search(line) for pattern in PATTERNS) and "os.environ" not in line:
                findings.append((str(path), number, "looks like a key or password"))
    return findings


def env_is_ignored(folder):
    """True if a .gitignore in the folder lists .env (or there is no .env file to protect)."""
    folder = Path(folder)
    if not (folder / ".env").exists():
        return True
    ignore = folder / ".gitignore"
    return ignore.exists() and ".env" in ignore.read_text().splitlines()


if __name__ == "__main__":
    folder = sys.argv[1] if len(sys.argv) > 1 else "."
    found = scan(folder)
    for file, number, what in found:
        print(f"{file}:{number}: {what}")
    print(f"{len(found)} possible secrets found; .env protected from Git: {env_is_ignored(folder)}")
```

```python linenums="1"
"""Run the secret scanner on a clean folder, and on a folder with a deliberate mistake."""

import tempfile
from pathlib import Path

from check_secrets import env_is_ignored, scan

with tempfile.TemporaryDirectory() as folder:
    project = Path(folder)
    (project / "good.py").write_text('import os\nkey = os.environ["ANTHROPIC_API_KEY"]\n')
    print("1. A project that reads its key from the environment")
    print(f"   findings: {len(scan(project))}")

    (project / "bad.py").write_text('API_KEY = "sk-abcdefghijklmnopqrstuvwxyz123456"\n')
    (project / ".env").write_text("ANTHROPIC_API_KEY=not-a-real-key-just-for-this-demo\n")
    print("2. The same project after someone pastes a key into the code and creates a .env file")
    for file, number, what in scan(project):
        print(f"   {Path(file).name}:{number}: {what}")
    print(f"   .env is ignored by Git: {env_is_ignored(project)}")

    (project / ".gitignore").write_text(".env\n.venv/\n")
    print(f"3. After adding .env to .gitignore: {env_is_ignored(project)}")
```

```bash
python secrets_demo.py
```

```text
1. A project that reads its key from the environment
   findings: 0
2. The same project after someone pastes a key into the code and creates a .env file
   .env:1: looks like a key or password
   bad.py:1: looks like a key or password
   .env is ignored by Git: False
3. After adding .env to .gitignore: True
```

The scanner flagged both the key pasted into the code and the `.env` file, and it reported that `.env` was not protected until a `.gitignore` listed it. A scanner that runs before every commit (as LeRobot's does with gitleaks) catches the mistake while it is still on your computer.

**Step 9. Record your work.**

```bash
git add .
git commit -m "Add planning, a pretend VLM, a tool server, an MCP server, and a secret scanner"
git log --oneline
```

### Check Your Work

Your project is complete when all of these are true:

- `python perception_demo.py` accepts three blocks and rejects the `yellow block` with `the box is not inside the picture`.
- `python architecture_demo.py` shows `plan rejected before any move` for the bad plan, `result: done` for the good one and `result: asked a person` for the missed grasp.
- `python server_demo.py` shows the status codes 401, 200, 400, 404 and 409.
- `python mcp_demo.py` lists four tools and shows the schema of `z` with a minimum of 0.02 and a maximum of 0.07.
- `python secrets_demo.py` finds nothing in the clean project and two findings in the other.
- Earlier scripts and `python -m pytest -q` still pass.
- `git log --oneline` shows a sixteenth commit.

### Challenge: Rate-Limit the Server

A server that anyone with the key can call as fast as they like is at the mercy of a runaway agent. Add a limit to `make_server` that answers `429` if more than 5 calls arrive in any one second, with a message that says how long to wait. Test it by sending 10 quick requests with `requests` and counting the 200s and the 429s.

??? note "Click to see one solution"
    Keep a list of the times of recent calls, drop the ones older than a second, and refuse when the list is full. Add the list and the check to the handler's `do_POST`, before the call is made:

    ```python linenums="1"
    import time
    recent = []                                   # at the top of make_server, so all requests share it


    def too_fast():
        now = time.monotonic()
        recent[:] = [t for t in recent if now - t < 1.0]        # forget calls older than one second
        if len(recent) >= 5:
            return True
        recent.append(now)
        return False
    ```

    In `do_POST`, after the key check, add: `if too_fast(): return self._reply(429, {"error": "more than 5 calls in one second. Wait one second and try again."})`. Ten quick `get_status` requests give five 200s and five 429s. The client's correct answer to a 429 is the one in the status table: slow down, and retry. Chapter 17 treats rate limiting as one of the layers that stops a runaway agent.

## Summary and Key Takeaways

You can now build an agent that sees a scene, plans, checks, and acts, and connect its tools to the world.

- An **agent architecture** has six parts: perceive, plan, check, execute, act and recover, with models only in the first two. The **planner-executor split** keeps the model's plan as data that code can check. **Task planning** by **task decomposition** turns a goal into steps, and the **agent planner** writes the list. A **learned policy executor** can hand a step to a trained policy for a short time.
- A **vision-language model** answers questions about a picture. A **scene description** is the fixed form of that answer, and **object localization** returns boxes in pixels. Every box is a claim to check, and **image-to-arm coordinates** convert a checked box with the homography of Chapter 14.
- **Replanning** builds a new plan from the present situation. **Failed grasp recovery** retries the approach once. **Asking a human** is the right action for repeated failure, for ambiguity and for a stop.
- An **HTTP API** carries **JSON requests**, with status codes that say whose fault a failure is. The **requests library** needs a `timeout` and `raise_for_status`. A **tool server** exposes the tools without changing their safety checks. **API key handling** means environment variables, a `.gitignore` for `.env`, separate keys and secret scanning.
- The **Model Context Protocol** standardizes how clients reach tools, and an **MCP server** can be built from type hints (in version 2 of the SDK it is `MCPServer`). A **ROS 2 bridge** is one more doorway into the same checked tools.
- A **local agent** keeps pictures at home, and a **cloud agent** is more capable and costs money and time. An **edge AI computer** runs small models on the robot. **Latency and cost** grow with every turn and every picture, and **privacy considerations** start with where each picture goes.

!!! mascot-celebration "My Agent Can See, Plan, and Cope!"
    ![Servo celebrating](../../img/mascot/celebration.png){ class="mascot-admonition-img" }
    You just built an agent that checks what its vision model says, plans in data, refuses a bad plan before it moves, recovers from a missed grasp by asking, and reaches its tools over a web API and MCP with keys kept out of the code. Every doorway is a safety layer in the making, and Chapter 17 puts them together. Let's move it on!

### Self-Check Questions

Test yourself before you move on. Click each question to reveal an answer.

??? question "1. Why is a plan written as data safer than a model that calls tools directly?"
    Data can be inspected before anything happens. The whole plan can be validated, each fault can be named by its step, and a bad plan can be refused before one motor turns. A model that calls tools directly leaves no moment to check.

??? question "2. A VLM returns the box [650, 300, 700, 350] for a 640 by 480 picture. What should the program do?"
    Reject it. The box lies beyond the right edge of the picture (x from 650 to 700, in a picture 640 pixels wide), so it cannot be an object in the picture. A model's boxes are claims that must be checked, and this is a hallucination.

??? question "3. How many tokens does a 640 by 480 picture cost on the formula in the chapter, and what does shrinking a 1920 by 1080 picture to that size save?"
    \( \lceil 640/28 \rceil \times \lceil 480/28 \rceil = 23 \times 18 = 414 \) tokens. A 1920 by 1080 picture costs about 1,560, so the smaller picture needs about a quarter of the tokens, which also means a lower cost and a shorter wait.

??? question "4. A request to the tool server returns 401. A second returns 400. What does each tell the client to do?"
    A 401 means that the key is missing or wrong, so fix the key. A 400 means that the request was invalid, so read the message (it names the parameter and the allowed range) and fix the request.

??? question "5. Why does the tool server not check the bounds itself?"
    The bounds are in the tool layer (`RobotSession.call`), and the server passes every call to it. Putting the safety there means that the same rules hold whether a call arrives by command line, web API, MCP or ROS 2, and a new doorway cannot forget a check.

??? question "6. An agent's second attempt to grasp a block also finds nothing held. What should it do and why?"
    Ask a human. One retry covers the chance that the block moved a little. After a second failure, something else is wrong, such as a missing block or a miscalibrated camera, and more attempts waste time and may cause harm.

Chapter 17 collects these doorways into a full safety design for agent-controlled arms, and shows how to test it.
