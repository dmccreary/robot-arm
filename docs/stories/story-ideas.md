---
title: "Story Ideas for Controlling a Robot Arm"
description: "Mini graphic novel ideas about world models, centered on Fei-Fei Li's World Labs and Yann LeCun's AMI Labs, and how they connect to building and programming a low-cost robot arm."
image: img/cover.png
---

# Story Ideas for Controlling a Robot Arm

These mini-graphic novel ideas are designed to inspire young readers by
connecting the subject matter of this textbook to the people and companies
shaping the field. This first set is about **world models**, the idea that a
machine can build an internal picture of how the world behaves and use it to
predict what will happen before it acts. Two newly funded companies are
betting on that idea in different ways:

- **World Labs**, founded by Fei-Fei Li, builds spatial-intelligence models
  that generate, reconstruct, and simulate interactive 3D environments, and
  technology for robotic learning and simulation. On September 28, 2026, AMD
  agreed to acquire it in an all-stock deal valued at about $8.2 billion. The
  deal is expected to close by the end of 2026.[^1]
- **AMI Labs** (Advanced Machine Intelligence), co-founded by Yann LeCun after
  he left Meta, raised $1.03 billion in seed funding at a valuation of about
  $3.5 billion in March 2026. It is building world models based on LeCun's
  Joint Embedding Predictive Architecture (JEPA) for robotics, industrial,
  and healthcare uses.[^2]

Each story can be generated using the book-media-generator story route, with
the suggested panel count or your own override via `--panels N`.

## Selection Criteria

Stories were selected for:

- **Relevance** — direct connection to the textbook's key concepts, such as
  perception, simulation, planning, and safety
- **Contrast** — two different approaches to the same big question
- **Inspiration** — themes that resonate with students who are building their
  first arm
- **Drama** — compelling narrative arcs with conflict and resolution

!!! warning "Fact-check before generating images"
    The companies in these stories are new and the facts are still changing.
    The World Labs deal had not closed as of October 7, 2026. Before you
    generate a story, re-check the details in the
    [facts to verify](#facts-to-verify-before-generating) list at the end of this page.

## World Labs Story Ideas

### 1. Teaching Computers to See: Fei-Fei Li and ImageNet

| | |
|---|---|
| **Subject** | Fei-Fei Li (born 1976), United States |
| **Theme** | A big, unfashionable idea: give machines enough examples to learn from |
| **Connection** | Chapter 14 (cameras, perception, and learning from demonstration); the idea that data, not just clever code, teaches a machine |
| **Panels** | **12** — a full life-and-career arc from early curiosity to the founding of World Labs |

Li helped build ImageNet, a large labeled image collection that changed how
researchers trained computers to recognize objects. The story follows the
doubts she faced, the long slog of labeling, and the moment the approach
paid off. The final panels ask the next question: if machines can learn to
see pictures, can they learn to understand *places*?

*Why this inspires:* A big dataset looks boring until it changes a whole field,
which is a good lesson for any student with a tedious but important project.

---

### 2. A Room That Never Existed

| | |
|---|---|
| **Setting** | A school robotics club, present day (fictional case study) |
| **Theme** | Practice in imagination before you risk the real thing |
| **Connection** | Chapter 13 (simulation and testing); "Simulate first, then power on" |
| **Panels** | **8** — a linear discovery: problem, idea, attempt, test, result |

Maya's team wants their arm to sort objects in a kitchen they have never seen.
They use a model that builds a 3D room from a few photos, and their
program rehearses a hundred pickups in the imagined room before the arm moves
a millimeter. The story shows what a generated 3D environment is good for and
where it still fails, such as a real cup that is slipperier than the
simulated one.

*Why this inspires:* Students see that a simulator is a rehearsal space, not a
replacement for the real world.

---

### 3. The Chip Company That Bought a Dream

| | |
|---|---|
| **Subject** | Fei-Fei Li, Lisa Su, and the AMD–World Labs deal (2026) |
| **Theme** | Why hardware makers care about the *models* that will run on their chips |
| **Connection** | Chapter 6 (budgets and sourcing); the idea that software and hardware co-evolve |
| **Panels** | **8** — a "follow the money" explainer with a human face |

A researcher who spent years teaching machines to see joins a company that
designs the processors those machines run on. The story explains, in plain
language, what an all-stock acquisition is, why a chip company would want to
shape its next processors around world models, and why a deal like this is a
bet and not a guarantee. It ends with a question for the reader: what would
you build if the cost of a robot's "imagination" kept dropping?

*Why this inspires:* Students learn that the robot in front of them sits at
the end of a long chain of research, software, and silicon.

---

## AMI Labs Story Ideas

### 4. The Dissenter: A Different Road to Machine Intelligence

| | |
|---|---|
| **Subject** | Yann LeCun (born 1960), France and United States |
| **Theme** | Courage to question the most popular approach, and the work of proving it |
| **Connection** | Chapter 15 (AI agents and tools); why an agent that only predicts text may not understand a physical task |
| **Panels** | **12** — a full career arc from early neural networks to leaving Meta and starting AMI Labs |

LeCun spent years arguing that systems built only to predict the next word are
not enough for human-level reasoning and autonomy, and that machines need
models of how the physical world works. The story follows the moment he
leaves a large company to test that belief with his own startup. It shows both
the risk and the discipline: a bold claim is only worth something if you build
the thing that proves it.

*Why this inspires:* Disagreeing with the crowd is easier to admire than to do,
and this story shows what comes after the disagreement.

---

### 5. Imagine Before You Move

| | |
|---|---|
| **Setting** | A makerspace with an SO-ARM101 arm (fictional case study) |
| **Theme** | Planning by predicting consequences |
| **Connection** | Chapter 12 (kinematics), Chapter 17 (safety layers); an action-conditioned world model predicts what happens after each possible move |
| **Panels** | **8** — a linear discovery that mirrors a plan-predict-choose loop |

Servo the Robot Arm wants to pour water into a cup without spilling. Instead
of trying moves at random, Servo imagines five different pours, predicts
where the water will go for each one, discards the risky ones, and then
performs the best plan. A final panel shows the safety rule behind it: the
arm only moves if the predicted outcome stays inside safe limits.

*Why this inspires:* "Think first, then move" is a skill every builder can
practice with their own arm.

---

### 6. The Glass of Water Problem (Moravec's Paradox)

| | |
|---|---|
| **Subject** | Hans Moravec (born 1948) and the paradox that carries his name |
| **Theme** | The easy-looking things are the hard things |
| **Connection** | Chapter 5 (actuators and sensors), Chapter 11 (grippers); why grasping a glass is harder than writing an essay |
| **Panels** | **9** — a mystery, a reveal, and a multi-step explanation |

A student asks why an AI can write a poem in seconds but their robot arm
knocks over a glass of water. The story follows the clues: hundreds of
millions of years of evolution behind a toddler's grasp, the gravity and
inertia we never think about, and why video, audio, and touch sensors
together may help a machine learn this "common sense" of physics.

*Why this inspires:* It turns a frustrating failure into a famous, respectable
research question.

---

### 7. JEPA for Twelve-Year-Olds

| | |
|---|---|
| **Subject** | The Joint Embedding Predictive Architecture (JEPA), proposed by Yann LeCun |
| **Theme** | Predict the *idea*, not every pixel |
| **Connection** | Chapter 14 (perception and learning); Chapter 19 (the mathematics of arm paths: vectors and distances) |
| **Panels** | **10** — a concept story that builds the math one step at a time |

A student tries to guess where a friend will be after school. Predicting every
leaf that flutters on the way is hopeless, but predicting "she'll be at the
library" is easy and useful. The story uses that idea to explain JEPA at a
high-school level, in four steps:

1. An **encoder** turns what the machine sees now (picture *x*) into a short
   list of numbers, a vector called an embedding.
2. The same encoder turns what happens next (picture *y*) into another vector.
3. A **predictor** takes the first vector, plus the action taken, and guesses
   the second vector.
4. The **loss** is just the distance between the guess and the real second
   vector. Training shrinks that distance.

The story's twist is a trap the student discovers: if the encoder outputs the
same vector for everything, the distance is always zero and nothing was
learned. The panels show why the training method has to prevent that
collapse. Keep the math to vectors and distances, which students can compute in
short Python functions, matching the book's "math is computed, not memorized"
rule. A good companion MicroSim would let students drag two points in a 2D
"embedding space" and watch the loss change.

*Why this inspires:* Students see that a cutting-edge AI idea is built from
vectors and distances they already know.

---

### 8. The Robot That Asks "What If?"

| | |
|---|---|
| **Setting** | A home, ten years from now (fictional case study) |
| **Theme** | How people will talk to robots that can predict consequences |
| **Connection** | Chapter 16 (agent planning and vision), Chapter 18 (projects and teaching); the human-robot interface |
| **Panels** | **8** — a short day-in-the-life story |

Instead of memorizing buttons or writing code, a family member says "put the
dishes away, but don't stack the glasses." The robot imagines a few ways to do
it, asks one clarifying question ("Should I use the top shelf?"), and shows
the planned motion before it moves. The story is a thought experiment about
trust: a robot that can explain what it expects to happen is easier to
supervise.

*Why this inspires:* It invites students to design the conversation, not just
the motors.

---

## Synthesis Story Ideas

### 9. Two Bets on the Same Problem

| | |
|---|---|
| **Subject** | Fei-Fei Li and Yann LeCun (2026) |
| **Theme** | Different paths to the same goal: a machine that understands the physical world |
| **Connection** | Whole book; compares building a detailed 3D world to simulate in with learning an abstract model to plan with |
| **Panels** | **14** — a two-track narrative with a shared ending |

Two researchers, one startup each, one shared question. One company builds
spatial models that generate and simulate 3D worlds. The other builds
abstract models that predict consequences without drawing every detail. The
story alternates between the two, showing a robot arm using each approach on
the same task, and ends by asking students which approach they would try
first and what experiment would tell them which is better.

*Why this inspires:* It shows that science is a contest of ideas that has to be
settled by experiments.

---

### 10. The Student Who Folded the Laundry (Capstone)

| | |
|---|---|
| **Setting** | A high school robotics club, near future (fictional case study) |
| **Theme** | A hard, ordinary problem as a test of everything in the book |
| **Connection** | The [Laundry Challenge](../about.md#the-laundry-challenge); Chapters 10 through 17 combined |
| **Panels** | **16** — a capstone montage across the book's skills |

A student takes up the author's open challenge: build a low-cost robot that
does the laundry. The story walks through each stage: choose an arm, teleoperate
it to record demonstrations, test in simulation, let a world model predict how
cloth behaves, add safety limits, and fail on a stubborn sock. It ends with a
folded towel and a question about what to try next.

*Why this inspires:* It makes a famously hard problem feel like a project a
student could actually start.

---

## Facts to Verify Before Generating

These details came from a draft note or from secondary coverage and should be
checked against primary sources before they appear in a published story:

- **AMI Labs investors.** NVIDIA and Bezos Expeditions were named in the coverage
  checked. The draft note also lists Samsung and Toyota Ventures, which we have
  not confirmed.
- **"Dead end" quote.** The draft note says LeCun calls large language models a
  "dead end" for physical intelligence. Confirm the exact words and context
  before quoting; the stories above paraphrase his view instead.
- **Open-source claim.** The draft note says AMI Labs positions its technology as
  an open-source foundation layer. We have not confirmed this.
- **World Labs deal status.** The AMD acquisition was announced on September 28,
  2026 and is subject to regulatory approval. Update the wording if it closes
  or changes.
- **Biographical details.** Birth years and career milestones for Fei-Fei Li,
  Yann LeCun, and Hans Moravec should be checked before each story is written.
- **JEPA details.** For Story 7, check the explanation against LeCun's 2022
  position paper, *A Path Towards Autonomous Machine Intelligence*.

## How to Generate a Story

To turn any of these ideas into a full graphic novel with generated images,
use:

> book-media-generator (story route): {Story Title} --panels {N}

Provide the story's title (and optionally `--panels N` to override the
suggested count) and the skill will handle the rest: writing the narrative,
creating image prompts, and optionally generating all panel images via
multiple text-to-image APIs (Google Gemini, OpenAI gpt-image-1, or others).
Current cost for high-quality images with accurate text placement is
approximately **$0.039 per image**, so $0.039 × (N + 1) per story: about
$0.27 for 6 panels and $0.51 for 12 panels.

## References

[^1]: AMD. (2026, September 28). *AMD to Acquire World Labs to Advance the Future of AI Compute*. https://newsroom.amd.com/news/amd-acquire-world-labs/
[^2]: Silicon Republic. (2026, March). *Yann LeCun's AI Start-up AMI Raises $1.03bn in Seed Funding*. https://www.siliconrepublic.com/start-ups/yann-lecun-ai-start-up-ami-raises-seed-funding-world-model
