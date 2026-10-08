# Chapter 12 content generation log

End: 2026-10-07 23:04:19 (start time not captured)

## What was generated

- docs/chapters/12-kinematics/index.md: "Kinematics: Where Is the Hand and How Do I Get There", 27 concepts, 7 mascot admonitions, 3 MicroSim specifications, a hardware-free Python lab: rotations and homogeneous transforms, two-link forward and inverse kinematics, the SO-101 transform chain (checked against a NumPy forward-kinematics of the URDF to 0.007 mm in the plane), a numerical damped-least-squares IK in the plane and in 3D, workspace sampling and collision checks
- MicroSims specified (status `Specified`, none built): transform-chain-calculator, ik-target-classifier, singularity-spotter
- About 12,300 words including the pasted lab code and output; 7 Python fences, all with `linenums="1"`

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
