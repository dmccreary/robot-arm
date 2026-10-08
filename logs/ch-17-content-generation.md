# Chapter 17 content generation log

End: 2026-10-07 23:04:19 (start time not captured)

## What was generated

- docs/chapters/17-agent-safety-and-evaluation/index.md: "Safety Layers and Evaluation for Agent-Controlled Arms", 19 concepts, 7 mascot admonitions, 3 MicroSim specifications, a hardware-free Python lab: a `SafetyLayer` (roles, rate limit, schema, workspace, confirmation, dry run, audit log), an injection demo with a fooled model, an evaluation suite with a misbehaving model, a repeatability test, a replay test, and nine tests (including a 500-call property test); the suite reached 40 passed
- MicroSims specified (status `Specified`, none built): defense-layer-matcher, injection-spotter, evaluation-metrics-calculator
- About 11,500 words including the pasted lab code and output; 6 Python fences, all with `linenums="1"`

## Checks run

- mkdocs build --strict: clean
- validate-chapter-mascots.py: no placement rules violated
- Frontmatter parses and every value that contains a colon is quoted
- Lab code and every pasted output block were produced by `assemble.py` from the scratch `arm-lab` project, which ran the real scripts (template markers `@@FILE@@` and `@@RUN@@`)
- Specification self-check (`speclint.py`): Bloom verbs on the canonical list for their level, Library valid, Status `Specified`, all eleven required fields, no forbidden words
- Every concept in the table appears in bold in the chapter text
- The cumulative `arm-lab` test suite passed at the end of this chapter's lab, and every earlier demo script was re-run after the final changes

## Notes

- Facts that came from a secondary source, or that are the author's own inference, are listed under this chapter in `TODO.md`.
