# References: Safety Layers and Evaluation for Agent-Controlled Arms

1. [Defense in depth (computing)](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) - Wikipedia - Explains how stacking several independent safeguards keeps a system protected when one layer fails. This is the core idea behind the chapter's safety layers around an agent-controlled arm.

2. [Principle of least privilege](https://en.wikipedia.org/wiki/Principle_of_least_privilege) - Wikipedia - Describes limiting every user, process, or program to only the access its job needs. It supports the chapter's advice to give an agent narrow roles and tools rather than raw servo access.

3. [Prompt injection](https://en.wikipedia.org/wiki/Prompt_injection) - Wikipedia - Covers attacks where crafted text makes a language model ignore its developer's instructions. It frames the chapter's discussion of untrusted input, such as a camera label or web page, steering an arm.

4. Engineering a Safer World: Systems Thinking Applied to Safety (1st Edition) - Nancy G. Leveson - MIT Press - Leveson originated the STAMP model, which treats accidents as failures of control and constraint enforcement rather than component breakage. This clarifies why limits and validators must wrap an agent instead of trusting it.

5. Security Engineering: A Guide to Building Dependable Distributed Systems (3rd Edition) - Ross Anderson - Wiley - Not a single originator of the ideas, but widely praised for clarity. It explains defense in depth, least privilege, and audit logging through real failure case studies, which helps readers reason about attackers and mistakes.

6. [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) - OWASP GenAI Security Project - Describes direct and indirect prompt injection, example attack scenarios, and mitigations such as least privilege and human approval. It maps directly onto the chapter's rules for untrusted input and confirmation steps.

7. [Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection](https://arxiv.org/abs/2302.12173) - Greshake et al., arXiv - The research paper that showed attackers can plant instructions in data an application retrieves. It gives students concrete evidence for why an arm's agent must never treat sensor or web text as commands.

8. [Building Effective Agents](https://www.anthropic.com/engineering/building-effective-agents) - Anthropic Engineering - Separates fixed workflows from autonomous agents and advises on tool design, simplicity, and testing in sandboxes with guardrails. It supports the chapter's view that the agent is never the only safety measure.

9. [Inspect: A Framework for Large Language Model Evaluations](https://inspect.aisi.org.uk/) - UK AI Security Institute - Open-source documentation for writing repeatable evaluation tasks, scorers, and agent evaluations in Python. It shows how to structure the chapter's agent evaluation suite and repeatability tests.

10. [AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) - NIST - Introduces a voluntary framework for governing, mapping, measuring, and managing AI risks. It gives the chapter's audit logs, testing, and evaluation practices a recognized standards context for responsible deployment.
