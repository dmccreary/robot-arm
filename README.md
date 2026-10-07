# Controlling a Robot Arm: Source, Build and Control

[![MkDocs](https://img.shields.io/badge/Made%20with-MkDocs-526CFE?logo=materialformkdocs)](https://www.mkdocs.org/)
[![Material for MkDocs](https://img.shields.io/badge/Material%20for%20MkDocs-526CFE?logo=materialformkdocs)](https://squidfunk.github.io/mkdocs-material/)
[![GitHub Pages](https://img.shields.io/badge/View%20on-GitHub%20Pages-blue?logo=github)](https://dmccreary.github.io/robot-arm/)
[![Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-DA7857?logo=anthropic)](https://claude.ai/code)
[![Claude Skills](https://img.shields.io/badge/Uses-Claude%20Skills-DA7857?logo=anthropic)](https://github.com/dmccreary/ibook-skills)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

## View the Live Site

Visit the interactive textbook at:
[https://dmccreary.github.io/robot-arm/](https://dmccreary.github.io/robot-arm/)

## Overview

*Controlling a Robot Arm* is an interactive intelligent textbook that teaches
Python by sourcing, building, and programming low-cost robot arms. It is a
**Python programming book that happens to move a real robot**: every chapter
turns an idea into Python code that reads a sensor, moves a joint, or makes a
decision, and then shows the result on a physical arm. The reader starts with a
bill of materials and ends with an AI agent that can safely command a robot arm
through Python code the reader wrote.

The book follows one learning path across two open-source desktop arms at
opposite ends of the hobbyist-to-developer range:

- **SO-ARM100 / SO-ARM101** — a 3D-printed, six-degree-of-freedom arm from The
  Robot Studio and Hugging Face, built in leader/follower pairs around STS3215
  serial bus servos and supported by the open-source LeRobot library. This is
  the low-cost entry point.
- **Seeed Studio reBot-DevArm (B601 series)** — an open-source six-axis arm
  with a parallel gripper, built around CAN-bus actuators, with a higher payload
  and reach and compatibility with ROS, LeRobot, NVIDIA Isaac Sim, and
  Pinocchio. This is the step up.

Comparing the two arms shows which design decisions (actuators, buses, power,
kinematics, software) are essential to any arm and which are specific to one
platform. It also motivates the book's central Python skill: writing a small
hardware abstraction layer so the same program can drive either arm.

### Who It Is For

- **Primary:** students aged 12 and up, and adults, who have completed the
  *Learning Python* course and want a motivating project that uses Python to
  control a physical machine.
- **Secondary:** makers, hobbyists, and self-taught roboticists.
- **Also:** teachers, makerspace leaders, and club mentors planning a parts
  order, and developers who want to give an AI agent a physical body.

Readers under 16 should work with an adult for 3D printing, soldering, and
mains-powered or higher-voltage steps. The book flags every such step.

## Site Status

This book is in an early stage. The course description, procurement notes, and
site scaffolding are in place; the learning graph, chapters, and MicroSims are
still to come. Site metrics will be added to this README once the content has
been generated.

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/dmccreary/robot-arm.git
cd robot-arm
```

### Install Dependencies

This project uses MkDocs with the Material theme:

```bash
pip install mkdocs mkdocs-material
```

### Build and Serve Locally

Build the site (strict mode turns broken links and missing files into errors):

```bash
mkdocs build --strict
```

Serve locally with live reload:

```bash
mkdocs serve
```

Open your browser to `http://localhost:8000`.

### Deploy to GitHub Pages

```bash
mkdocs gh-deploy
```

This builds the site and pushes it to the `gh-pages` branch.

## Repository Structure

```
robot-arm/
├── docs/                          # MkDocs documentation source
│   ├── index.md                   # Home page
│   ├── course-description.md      # Seed for all generated content
│   ├── procurement-notes.md       # Notes on buying the SO-ARM101 kit
│   ├── chapters/                  # Chapter content
│   ├── learning-graph/            # Concept list, taxonomy, dependency graph
│   ├── sims/                      # Interactive MicroSims
│   ├── css/extra.css              # Custom CSS
│   └── img/                       # Cover image, license badge, screenshots
├── plugins/social_override.py     # og:/twitter: meta-tag hook
├── mkdocs.yml                     # Site configuration and navigation
├── AGENTS.md                      # Instructions for AI coding agents
├── CONTENT-GENERATION-GUIDE.md    # Content rules for generated chapters
└── README.md                      # This file
```

## Reporting Issues

Found a bug, typo, or have a suggestion? Please report it on
[GitHub Issues](https://github.com/dmccreary/robot-arm/issues). Include a
description of the problem, steps to reproduce (for bugs), expected versus
actual behavior, and screenshots if applicable.

## License

This work is licensed under the
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

**You are free to:**

- **Share** — copy and redistribute the material
- **Adapt** — remix, transform, and build upon the material

**Under the following terms:**

- **Attribution** — give appropriate credit with a link to the original
- **NonCommercial** — no commercial use without permission
- **ShareAlike** — distribute contributions under the same license

See [docs/license.md](docs/license.md) for details.

## Acknowledgements

- **[MkDocs](https://www.mkdocs.org/)** and
  **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)** — the
  static site generator and theme
- **[The Robot Studio](https://github.com/TheRobotStudio/SO-ARM100)** and
  **[Hugging Face LeRobot](https://github.com/huggingface/lerobot)** — the
  SO-ARM100/101 design and the open-source robotics library
- **[Seeed Studio](https://www.seeedstudio.com/)** — the reBot-DevArm
- **[Python](https://www.python.org/)** — the language of the whole book
- **[Claude](https://claude.ai)** by Anthropic — AI-assisted content generation
- **[GitHub Pages](https://pages.github.com/)** — free hosting

## Contact

**Dan McCreary**

- LinkedIn: [linkedin.com/in/danmccreary](https://www.linkedin.com/in/danmccreary/)
- GitHub: [@dmccreary](https://github.com/dmccreary)

Questions, suggestions, or collaboration ideas? Connect on LinkedIn or open an
issue on GitHub.
