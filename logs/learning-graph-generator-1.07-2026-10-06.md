# Learning Graph Generator Session Log

- **Skill:** learning-graph-generator v1.07
- **Date:** 2026-10-06
- **Book:** Controlling a Robot Arm: Source, Build and Control

## Programs used

| Program | Version | Purpose |
|---------|---------|---------|
| `analyze-graph.py` | unversioned (skill v1.07 copy) | Quality metrics report |
| `csv-to-json.py` | v1.04+ per skill changelog (computes `node.cis`) | CSV to `learning-graph.json` |
| `taxonomy-distribution.py` | unversioned (skill v1.07 copy) | Distribution report; run with `taxonomy-names.json` |
| `validate-learning-graph.py` | unversioned (skill v1.07 copy) | Schema validation |

The dependency CSV was produced by a one-off script that converts label-based dependencies to ConceptIDs and checks for unknown labels, self-dependencies, and cycles before writing `learning-graph.csv`.

## Steps

1. **Step 1 skipped.** `course-description.md` had `quality_score: 96`, above the 85 threshold.
2. **Step 2.** 537 concept labels (484 core plus 53 optional advanced chapter), reviewed by the author before continuing. All labels are Title Case, unique, and at most 32 characters.
3. **Step 3.** Dependencies written for every concept. 6 foundational concepts: Learning Python Prerequisites, Robot Arm, Voltage, 3D Printing, Camera, Large Language Model.
4. **Step 4.** Valid DAG, 0 cycles, 0 orphans, 1 connected component, longest chain 22, 159 terminal nodes (29.6%), 908 edges, average 1.71 dependencies per concept.
5. **Steps 5-6.** 15 taxonomy categories. 3D printing and tools were folded into the build category (BUILD) to keep the count near the target of 12 plus or minus 3. The largest category is 12.8%.
6. **Steps 7-9.** `metadata.json`, `taxonomy-names.json`, and `color-config.json` created. `learning-graph.json` passes schema validation (15 groups, 537 nodes, 908 edges). Highest CIS: Robot Arm, Learning Python Prerequisites, Voltage, Python Interpreter, so edge direction is correct.
7. **Step 10.** `taxonomy-distribution.md` generated. The first run omitted the names file and printed raw IDs; re-run with `taxonomy-names.json`.
8. **Step 11.** `index.md` regenerated from the template with 6 entry points and a note about the optional advanced chapter.
9. **Navigation.** Concept Enumeration, Concept Taxonomy, Graph Quality Analysis, Taxonomy Distribution, and Course Description Assessment enabled in `mkdocs.yml`. `mkdocs build --strict` passes.
