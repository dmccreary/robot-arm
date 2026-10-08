# Chapter 06 content generation log

End: 2026-10-07 19:55:48 (start time not captured)

## What was generated

- docs/chapters/06-sourcing-parts-and-budget/index.md: "Sourcing Parts and Planning a Budget", 32 concepts, 9 mascot admonitions, 2 MicroSim specifications, a hardware-free Python lab
- MicroSims specified: landed-cost-calculator, sourcing-listing-checker

## Checks run

- mkdocs build --strict: clean
- validate-chapter-mascots.py: no placement violations
- Python fences carry linenums="1"; frontmatter parses (strings)
- Lab code was run in a scratch arm-lab project and the output pasted into the chapter is the real output
- Specification self-check: Bloom verbs from the canonical list, Type and Library valid, no forbidden words
