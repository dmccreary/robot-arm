# Quiz: Agent Planning, Vision, and Interfaces

Test your understanding of the planner-executor split, vision-language models, recovery, and tool interfaces such as HTTP and MCP with these review questions.

---

#### 1. In the planner-executor split, which part is allowed to touch the arm?

<div class="upper-alpha" markdown>
1. The planner, because it decides what to do
2. The executor, which does only what a checked plan says, one step at a time
3. Both, but only one at a time
4. Neither, because only the vision model touches the arm
</div>

??? question "Show Answer"
    The correct answer is **B**. The planner proposes anything and never touches the arm. The executor can touch the arm, but it does only what a checked plan says, in the order it says, and it reads each result before going on. The planner's output is data, a list of steps, so it can be printed, saved, tested, validated, and refused. This is the doorway of Chapter 15 raised one level, from single commands to whole plans.

    **Concept Tested:** Planner-Executor Split

    **See:** [The Planner-Executor Split](index.md#the-planner-executor-split)

---

#### 2. An HTTP response has a status code in the 4xx range. What does the first digit tell the client?

<div class="upper-alpha" markdown>
1. The request worked and the answer is ready
2. The server has a problem, so retry later
3. The client sent something wrong, so fix the request
4. The connection was redirected to another address
</div>

??? question "Show Answer"
    The correct answer is **C**. The first digit of a status code is the useful part: 2xx means success, 4xx means that you sent something wrong, so fix the request, and 5xx means that the server had a problem, so retry later or report it. For example, 400 means a malformed request, 401 a missing or wrong key, 403 a key that is not allowed, and 404 an unknown tool.

    **Concept Tested:** HTTP API

    **See:** [HTTP APIs, JSON Requests, and the Requests Library](index.md#http-apis-json-requests-and-the-requests-library)

---

#### 3. A model proposes a plan that includes a step using a tool called `wave_arm`, which does not exist. What does the lab's `validate_plan` do?

<div class="upper-alpha" markdown>
1. It refuses the plan as a whole before any step runs, and names each fault by its step number
2. It runs the steps that are valid and skips the invented one
3. It replaces `wave_arm` with the closest real tool
4. It asks the model to run the plan anyway and observe the result
</div>

??? question "Show Answer"
    The correct answer is **A**. Because the plan is data, the first thing the program does is check every step against its tool's schema. A plan with an invented tool or a value out of range is refused as a whole, before one motor turns. This is the rule from Chapter 11 for waypoint lists applied again: check the whole list before anything moves. Skipping or substituting steps would let a plan run that nobody approved.

    **Concept Tested:** Task Planning

    **See:** [Task Planning and Task Decomposition](index.md#task-planning-and-task-decomposition)

---

#### 4. How does replanning differ from retrying?

<div class="upper-alpha" markdown>
1. They are the same thing with two names
2. A retry builds a new plan, and a replan repeats the same step
3. A replan is done only by a human
4. A retry repeats the same step, while a replan builds a different list from the present situation because something changed
</div>

??? question "Show Answer"
    The correct answer is **D**. When `move_to_pose` says "x is outside 0.1 to 0.28," repeating the same call is pointless. A new plan with a corrected x is the answer. A retry makes sense when the situation may have changed slightly, such as a block that moved a little after a missed grasp. After a second failed grasp, the right action is neither: stop trying and ask a human.

    **Concept Tested:** Replanning

    **See:** [Replanning and Failed Grasp Recovery](index.md#replanning-and-failed-grasp-recovery)

---

#### 5. Anthropic charges for a picture at about ⌈w/28⌉ × ⌈h/28⌉ tokens. About how many tokens does a 560 × 420 picture cost?

<div class="upper-alpha" markdown>
1. 35 tokens
2. 600 tokens
3. 300 tokens
4. 8,400 tokens
</div>

??? question "Show Answer"
    The correct answer is **C**. Round each dimension up after dividing by 28: ⌈560/28⌉ = 20 and ⌈420/28⌉ = 15, so the cost is 20 × 15 = 300 tokens. The chapter's example is a 640 × 480 picture at 23 × 18 = 414 tokens. A camera frame is almost always bigger than the model needs, so shrinking it cuts both cost and delay. Option A adds the two numbers instead of multiplying.

    **Concept Tested:** Vision-Language Model

    **See:** [Vision-Language Models](index.md#vision-language-models)

---

#### 6. A vision-language model returns boxes for a 640 × 480 picture. Which box should the program's detection check reject?

<div class="upper-alpha" markdown>
1. [100, 100, 160, 160]
2. [620, 400, 700, 470]
3. [300, 200, 360, 260]
4. [20, 30, 80, 90]
</div>

??? question "Show Answer"
    The correct answer is **B**. The box [620, 400, 700, 470] extends to x = 700, beyond the right edge of a picture that is 640 pixels wide, so it cannot be a real object in the picture. The chapter treats every box as a claim to check: the box must lie inside the picture, it must be about the size of a block, and its point must fall inside the area the arm's tools allow. A hallucinated box is rejected before it can become a target.

    **Concept Tested:** Object Localization

    **See:** [Scene Descriptions and Object Localization](index.md#scene-descriptions-and-object-localization)

---

#### 7. A call to the arm's tool server returns status 409. What does this mean, and what should the client do?

<div class="upper-alpha" markdown>
1. The call conflicts with the state of the arm, such as a stopped arm, so the client should wait and ask a person
2. The key is wrong, so the client should fix the key
3. The server failed, so the client should retry immediately
4. The request was fine, so the client should use the answer
</div>

??? question "Show Answer"
    The correct answer is **A**. The lab's server returns 200 for success, 400 for an invalid call, 404 for an unknown tool, and 409 for a stopped arm. The stop is sticky, and only a person can clear it, so the right action is to ask a human and wait. A wrong key would give 401, and a server failure would give a 5xx code. The server adds no new safety logic; it only translates the result into the right status.

    **Concept Tested:** Tool Server

    **See:** [Tool Servers](index.md#tool-servers)

---

#### 8. Why does the chapter say to add `.env` to `.gitignore` before creating the file?

<div class="upper-alpha" markdown>
1. Git cannot read files that start with a dot
2. A `.env` file is faster to load when it is ignored
3. The `python-dotenv` package requires it
4. One `git add .` would otherwise commit the keys, and Git remembers them even after the file is deleted
</div>

??? question "Show Answer"
    The correct answer is **D**. The other order is how keys end up in public repositories. Git keeps the full history, so deleting a secret in a later commit does not remove it. Keep keys in environment variables or in a `.env` file loaded with `load_dotenv()`. Use a separate key per purpose, set spending limits, and treat any key that has ever been in a public place as stolen and replace it.

    **Concept Tested:** API Key Handling

    **See:** [API Key Handling](index.md#api-key-handling)

---

#### 9. A cloud agent makes one model call per step of a ten-step task, and each call takes about 2 seconds. Why does the planner-executor split reduce the delay?

<div class="upper-alpha" markdown>
1. The planner makes the model run on the arm's own processor
2. The executor deletes the pictures after each step
3. The plan is written once and then executed locally, so there is no model call in the loop for each step
4. The split removes the need for validation
</div>

??? question "Show Answer"
    The correct answer is **C**. Every turn of an agent loop is a network round trip, so ten tool calls can mean ten waits of a second or more, and pictures add tokens, time, and money. A planner that writes a whole plan in one go lets the executor run the steps locally with no model call per step. Shrinking pictures and keeping tool answers short also help. Validation still happens, and it is not removed by the split.

    **Concept Tested:** Latency and Cost

    **See:** [Latency, Cost, and Privacy](index.md#latency-cost-and-privacy)

---

#### 10. A class of twelve students works in a room where the camera may capture faces, and the network is unreliable. Which setup is the best fit for the chapter's guidance?

<div class="upper-alpha" markdown>
1. Send every camera frame to a cloud model on each step, so the most capable model always decides
2. A local model for the planner, a strict executor with checks in code, and a cloud model only for an occasional hard question with a picture of the work area
3. Disable all checks to reduce latency, since the model will behave
4. Publish the recorded pictures to a public dataset for convenience
</div>

??? question "Show Answer"
    The correct answer is **B**. The chapter's advice is to pick the smallest setup that works. A local model keeps pictures at home and needs no network, a strict executor keeps safety in code, and the cloud is used only when the extra capability is worth it. It also says to point cameras at the work area and not at people. Sending every frame to the cloud costs money, adds delay, and exposes faces, and a dataset on the Hub is public unless marked private.

    **Concept Tested:** Privacy Considerations

    **See:** [Latency, Cost, and Privacy](index.md#latency-cost-and-privacy)
