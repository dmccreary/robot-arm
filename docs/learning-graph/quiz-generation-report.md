# Quiz Generation Quality Report

Generated: 2026-10-08
Execution Mode: Serial (1 agent, the main session; no sub-agents)
Wall-clock Time: see `logs/quiz-generator-2026-10-08.md`

## Overall Statistics

- **Total Chapters:** 19
- **Total Questions:** 190
- **Avg Questions per Chapter:** 10.0
- **Overall Automated-Check Score:** 91/100

The score is computed by a script from checks that a program can make: format and structure (25), answer balance (15), Bloom's distribution against the target for the chapter type (25), explanation length of 40 to 115 words (15), valid in-chapter links (10), and concept coverage scaled to a 75 percent goal (10). **It does not score distractor quality, ambiguity, or factual accuracy.** Those were judged by the author while writing each question and should be checked by a human reviewer.

## Per-Chapter Summary

| Chapter | Questions | Score | Bloom's Score | Concepts Tested |
|---------|-----------|-------|---------------|-----------------|
| Ch 1: Setting Up Python for Robotics | 10 | 93/100 | 22.5/25 | 40% |
| Ch 2: Anatomy of a Robot Arm | 10 | 92/100 | 22.5/25 | 32% |
| Ch 3: Electricity, Power, and Safety Basics | 10 | 89/100 | 20.0/25 | 32% |
| Ch 4: Serial and CAN Communication | 10 | 91/100 | 22.5/25 | 29% |
| Ch 5: Actuators and Sensors | 10 | 91/100 | 22.5/25 | 29% |
| Ch 6: Sourcing Parts and Planning a Budget | 10 | 92/100 | 22.5/25 | 31% |
| Ch 7: 3D Printing, Fasteners, and Tools | 10 | 92/100 | 22.5/25 | 31% |
| Ch 8: Building and Calibrating the SO-ARM100 | 10 | 92/100 | 22.5/25 | 33% |
| Ch 9: Building the reBot-DevArm and Choosing a Platform | 10 | 91/100 | 20.0/25 | 43% |
| Ch 10: A Python Hardware Library for Robot Arms | 10 | 93/100 | 22.5/25 | 41% |
| Ch 11: Moving the Arm: Trajectories, Grippers, and Teleoperation | 10 | 92/100 | 22.5/25 | 36% |
| Ch 12: Kinematics: Where Is the Hand and How Do I Get There | 10 | 92/100 | 22.5/25 | 37% |
| Ch 13: Logging, Testing, Simulation, and ROS 2 | 10 | 91/100 | 20.0/25 | 43% |
| Ch 14: Cameras, Perception, and Learning from Demonstration | 10 | 92/100 | 22.5/25 | 32% |
| Ch 15: AI Agents, Tools, and OpenClaw Skills | 10 | 88/100 | 17.5/25 | 43% |
| Ch 16: Agent Planning, Vision, and Interfaces | 10 | 85/100 | 15.0/25 | 38% |
| Ch 17: Safety Layers and Evaluation for Agent-Controlled Arms | 10 | 91/100 | 20.0/25 | 42% |
| Ch 18: Projects, Operation, and Teaching | 10 | 87/100 | 17.5/25 | 35% |
| Ch 19: Optional Advanced Chapter: The Mathematics of Arm Paths | 10 | 87/100 | 20.0/25 | 17% |

**Concepts Tested** is the share of the chapter's learning-graph concepts that appear as a "Concept Tested" label. Ten questions cannot cover 20 to 50 concepts, so this column is below the skill's 75 percent goal for every chapter (see Recommendations). All but a few labels match a learning-graph concept name exactly.

## Bloom's Taxonomy Distribution (Overall)

| Level | Actual | Questions | Target (weighted by chapter type) | Deviation |
|-------|--------|-----------|-----------------------------------|-----------|
| Remember | 27% | 51 | 25% | +2% |
| Understand | 29% | 56 | 29% | +0% |
| Apply | 25% | 48 | 27% | -1% |
| Analyze | 16% | 30 | 16% | +0% |
| Evaluate | 3% | 5 | 2% | +1% |
| Create | 0% | 0 | 1% | -1% |

Chapters 1 to 3 were treated as introductory (40/40/15/5), Chapters 4 to 14 and 18 as intermediate (25/30/30/15), and Chapters 15 to 17 and 19 as advanced (15/20/25/25/10/5). No chapter has a Create question, because a multiple-choice item cannot ask a learner to produce a design. Evaluate questions appear only in Chapters 15 to 19.

## Answer Balance (Overall)

- A: 27% (51/190)
- B: 25% (47/190)
- C: 26% (50/190)
- D: 22% (42/190)

Every chapter has between 2 and 3 correct answers for each letter, which is within the 20 to 30 percent band. The sequences were written by hand, with no run of more than two of the same letter in a row.

## Checks That Passed

- 190 of 190 questions use the `####` header, a four-option `upper-alpha` div, a `??? question "Show Answer"` admonition, a "The correct answer is" statement, a `Concept Tested` line, and a `See` link.
- Every question stem ends with a question mark, every quiz has 10 questions, and every explanation is between 40 and 115 words.
- Every `See` link points to `index.md` in the same chapter folder, and every `#anchor` matched a heading in that chapter when it was checked.
- No question uses "All of the above" or "None of the above".

## Recommendations

1. **Review the distractors.** The author wrote each wrong answer to be a plausible slip (a reversed formula, a missed unit, a confused term), but no tool can verify that each question has exactly one defensible answer. Read the numeric questions in Chapters 3, 4, 6, 7, 9, 10, 11, 14, 16, and 19 with a calculator.
2. **Concept coverage is low by design.** A 10-question quiz tests about a third of a chapter's concepts, and only 17 percent in Chapter 19 (53 concepts). If a 75 percent target matters, generate a second set of questions for the large chapters, or raise the question count for Chapters 5, 6, and 19 to 12.
3. **Some questions overlap the chapters' own Self-Check Questions.** A few stems (for example the virtual environment and port-setting questions in Chapter 1, the `finally` block in Chapter 3, and the integral term in Chapter 5) cover ideas that the end-of-chapter questions also cover, with different wording. Check that this is acceptable.
4. **No Create-level questions.** If the course description requires them, add short design-choice items by hand.
5. **Optional outputs were not generated:** the per-chapter metadata JSON files and `quiz-bank.json`. Ask for them if you plan to export the quizzes to an LMS or a chatbot.
6. **Re-check anchors after edits.** Chapter content is still being revised. The `See` links use heading anchors, so a renamed heading in a chapter breaks a link in its quiz. Run `mkdocs build --strict` after changing headings.
