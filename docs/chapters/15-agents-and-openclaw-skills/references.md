# References: AI Agents, Tools, and OpenClaw Skills

1. [Large language model](https://en.wikipedia.org/wiki/Large_language_model) - Wikipedia - Covers how large language models are built, trained, and used, along with their capabilities and limitations. It gives students the background for the chapter's idea that a model proposes actions and guarded code decides what happens.

2. [Intelligent agent](https://en.wikipedia.org/wiki/Intelligent_agent) - Wikipedia - Defines agents that perceive an environment and act toward goals, and classifies the kinds of agents. It supports the chapter's agent loop of perceive, plan, act, and observe.

3. [Data validation](https://en.wikipedia.org/wiki/Data_validation) - Wikipedia - Explains checking inputs for type, range, and format before use, and how systems react when checks fail. It underpins the chapter's typed parameters, bounded commands, and validation of tool arguments.

4. Artificial Intelligence: A Modern Approach (4th Edition) - Stuart Russell and Peter Norvig - Pearson - Organizes AI around the rational agent and describes task environments by performance measure, environment, actuators, and sensors, then classifies agent programs. This framing helps students see an arm as actuators and a camera as a sensor.

5. Hands-On Large Language Models (1st Edition) - Jay Alammar and Maarten Grootendorst - O'Reilly - Explains language models through many annotated diagrams; Alammar is also known for the widely read Illustrated Transformer posts. It is chosen as a visually clear book, not as the originator of tool calling.

6. [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) - Anthropic - Argues that reliable agents come from simple, composable patterns, and distinguishes fixed workflows from agents that choose their own steps. It directly supports the chapter's agent-or-workflow sorter and caution about unneeded complexity.

7. [Tool use with Claude](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) - Anthropic Documentation - Documents how a model returns a structured tool call that your code executes, then receives the result. It shows the tool schema and round trip that this chapter's scripted agent loop follows.

8. [Understanding JSON Schema](https://json-schema.org/understanding-json-schema) - JSON Schema Project - Official guide to describing data types, allowed values, and required fields. It explains how the chapter's tool schemas can declare a joint angle as a bounded number and reject anything outside it.

9. [Agent Skills Specification](https://agentskills.io/specification) - Agent Skills Project - Defines the skill folder format built around a SKILL.md file with name and description metadata. It clarifies the structure behind the chapter's robot arm skill file and why descriptions matter.

10. [OpenClaw Documentation](https://docs.openclaw.ai/) - OpenClaw Project - Official docs for the self-hosted assistant that connects chat apps to AI agents. They support the chapter's OpenClaw installation, messaging interface, and safety guidance; always check the current docs before installing.
