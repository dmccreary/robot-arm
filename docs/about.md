---
title: About This Book
description: Why robotics is growing fast and why students need to learn it now, who this book is for, the author's background, and how to cite the book.
image: img/cover.png
---

# About This Book

*Controlling a Robot Arm* is an interactive intelligent textbook on sourcing
parts, building, and programming low-cost robot arms. It uses two open-source
arms as hands-on case studies: the $350 3D-printed **SO-ARM100** (and its successor,
the SO-ARM101) and the $1,200 **Seeed Studio reBot-DevArm**.

This book is both a book on robot arms and a hands-on guide to learn
how to use Python programming to move a real robot. Every
chapter turns an idea into code that reads a sensor, moves a joint, or makes a
decision, and then shows the result on a physical arm.

!!! mascot-welcome "Welcome, Builder!"
    ![Servo waving welcome](img/mascot/welcome.png){ class="mascot-admonition-img" }
    I'm Servo, your guide through this book. By the end, you'll have a robot arm you built yourself, moving under Python code you wrote. Let's move it!

## Why Teach Robotics Now

Robots are no longer confined to a few car factories. The number of robots at
work is growing every year, the price of building one has collapsed, and the
AI that guides them is improving fast. The students who learn how a robot
senses, plans, and acts today will be the engineers who decide what these
machines do tomorrow.

**Worldwide:**

- Factories worldwide installed more than **600,000 new industrial robots** in
  2025, an 11% jump, and the global stock of working industrial robots reached
  a record **5 million**[^1]
- The average factory had **162 robots for every 10,000 employees** in 2023,
  more than double the 74 measured seven years earlier[^2]
- Goldman Sachs Research projects that the market for humanoid robots could
  reach **$38 billion by 2035**[^3]

**In the United States:**

- American factories had **285 robots per 10,000 employees** in 2022. South
  Korea, the world leader, had **1,012**, more than three times as many[^4]
- Deloitte and The Manufacturing Institute estimate that U.S. manufacturing
  could need as many as **3.8 million new employees** between 2024 and 2033,
  and that **1.9 million of those jobs** could go unfilled if skills and
  applicant gaps are not addressed[^5]
- Only **46% of eighth graders** performed at or above the Proficient level on
  the 2018 National Assessment of Educational Progress in technology and
  engineering literacy[^6]

These numbers describe a gap. Robots are spreading quickly, the jobs around
them are going unfilled, and fewer than half of students are ready for the
technology that will shape their working lives. Waiting until college to
meet a robot is waiting too long. A twelve-year-old who can build and program
an arm for a few hundred dollars gets a head start that earlier generations
could only get in a university lab.

### Why the Timing Is Different

Three changes make this the right moment to teach hands-on robotics:

1. **Cost.** A complete, open-source six-joint arm now costs hundreds of
   dollars, not tens of thousands. A classroom can afford a robot for every
   team.
2. **Software.** Open-source libraries and Python let a student control real
   hardware with short programs. Chapters 10 through 14 build exactly that
   skill.
3. **AI.** Language models and learned policies can now plan and control
   physical machines. That makes it urgent for students to understand safety,
   testing, and limits, the topics of Chapters 15 through 17, before AI-driven
   robots are everywhere.

### What Makes This Book Different

This book is built on a **learning graph of 537 interconnected concepts**
organized into 15 taxonomy categories across 19 chapters, so ideas are
introduced only after their prerequisites. It includes interactive
**MicroSims**, browser-based simulations that let you change a voltage, a
joint angle, or a wire length and watch what happens. Every program runs
against a software "fake arm" before it touches hardware. The entire book is
**open source and free**, with no paywalls and no access codes.

## Who This Book Is For

- **Students aged 12 and up** who have finished a first Python course and want a
  project that uses Python to control a physical machine.
- **Makers, hobbyists, and self-taught roboticists** who can write basic Python
  and want to build and program their first arm.
- **Teachers, makerspace leaders, and club mentors** who need a low-cost lab
  platform and a parts list they can order from.
- **Software developers and AI practitioners** who want to give an AI agent a
  physical body and need to learn the hardware side.

The full list of topics and learning outcomes is in the
[Course Description](course-description.md).

## How to Use This Book

- Read chapters in order. Concepts are introduced in dependency order, so
  prerequisites always come first.
- Try the MicroSims as you meet them. They are the fastest way to build
  intuition for a new concept.
- Simulate first, then power on. Every program runs against a software "fake
  arm" before it touches hardware.
- Use the search bar (top right) to jump to a specific term.
- Check the [Learning Graph](learning-graph/index.md) when you want to see how
  a concept fits into the larger picture.

## Why I Wrote This Book

I have been teaching STEM robotics since 2014. In that time I have watched
the cost of a capable robot arm fall to a few hundred dollars. A student with
a 3D printer, a dozen servos, and some Python can now build a machine
that would have been a research-lab project not long ago.

That change matters beyond the classroom. I believe every engineer, whatever
their specialty, should understand how robots work, because robots are about to
become a much bigger part of the world. The people who understand how a robot
senses, plans, and acts will help decide where those machines go. Everyone else
will just live with the results.

### Why World Models

I am a big fan of **world models**: learned systems that give a machine an
internal picture of how the world behaves, so it can predict what will happen
before it acts. A robot with a good world model can ask "what happens if I move
my gripper here?" and imagine the answer instead of finding out the hard way.
This is where I think robotics and AI are heading, and it is why the later
chapters of this book connect arms to cameras, simulation, and AI agents.

Investors are betting heavily on this idea:

- In March 2026, Yann LeCun's new company, Advanced Machine Intelligence
  (AMI), raised **$1.03 billion** in seed funding at a valuation of about
  **$3.5 billion** to build world models based on his JEPA architecture[^7]
- On September 28, 2026, AMD agreed to acquire World Labs, the company
  founded by Fei-Fei Li, in an all-stock deal valued at about **$8.2 billion**.
  The deal is expected to close by the end of 2026, and Li will become AMD's
  chief scientist[^8]

Funding is not proof that the technology works. But when a chip company pays
billions to shape its future processors around world models, it signals that
the people who fund robots and AI expect these models to matter.

Understanding the pieces under a world model starts with the basics in this
book: joint angles, kinematics, sensors, and feedback loops. You can't judge a
robot's prediction about the world until you know what the robot can measure.

## The Laundry Challenge

I also have a selfish motive for this book: **I hate doing laundry.**

Folding clothes is a surprisingly hard problem for a robot. Shirts and towels
are floppy, they change shape every time you touch them, and no two piles look
alike. That makes laundry a wonderful test of everything this book teaches:
perception, grasping, planning, and learning from demonstration.

!!! mascot-thinking "A Great Capstone Project"
    ![Servo thinking](img/mascot/thinking.png){ class="mascot-admonition-img" }
    Folding a shirt combines nearly every skill in this book: seeing the cloth, choosing where to grab, moving smoothly, and learning from a human demonstration. Could a low-cost arm like the ones you'll build do it?

So here is my open challenge to every student who reads this book:

> **Build a low-cost robot that does my laundry.**

If you build one that works, even one that only folds a pair of socks, please
[contact me](contact.md). I would love to see it, and I will happily be your
first customer.

## About the Author

![Dan McCreary](./img/dan-headshot-small.png){ width="150px" align="right" }

Dan McCreary is a semi-retired AI researcher, solution architect, and educator
who has spent more than three decades helping Fortune 100 organizations reason
over massive datasets. At Optum he founded the Generative AI Center of
Excellence and led the team that built one of the world's largest healthcare
knowledge graphs, spanning over 25 billion vertices, to unify member,
provider, and patient insights. That background in knowledge representation
and systems thinking underpins the learning graphs and intelligent-textbook
workflows used throughout this book.

He is the co-author of *Making Sense of NoSQL* (Manning Publications), the
founding chair of the NoSQL Now! conference, and a frequent keynote speaker on
semantic search, ontology strategy, and AI hardware. You can visit the
[Intelligent Textbooks Case Studies](https://dmccreary.github.io/intelligent-textbooks/case-studies/)
to see over 87 textbooks that Dan has created or co-created with other
authors.

### From Chip Design to Classroom Robots

Dan's career started close to the hardware. He began as a member of technical
staff at AT&T Bell Labs, designing VLSI CMOS integrated circuits, and then
managed a team of 14 software engineers at ETA Systems, a supercomputer
company. At NeXT Computer he worked with Steve Jobs as a systems engineer,
developing sales and training materials. He later founded and grew a software
services company, served as CIO of an accounting firm, and has worked as an
independent technology strategist in metadata, data warehousing, and semantic
technologies. Along the way he wrote over 200 wikibook articles on XML technologies such as
XQuery and XSLT. Teaching technical material to others has been a constant
thread in all of these roles.

### Teaching and Mentoring

Dan has mentored students as a STEM volunteer since 2014, teaching robotics
and microcontroller programming in CoderDojo-style coding clubs. Those clubs
ranged from three students around one table to 150 students supported by 50
mentors. The observations from those years are the raw material for this
book.

**Selected Credentials**

- B.A. in Physics and Computer Science from Carleton College
- M.S.E.E. from the University of Minnesota
- MBA coursework at the University of St. Thomas
- Patent holder in semantic search and ontology management techniques
- Advocate for large-scale Enterprise Knowledge Graph adoption across
  healthcare and education
- Long-time promoter of accessible, low-cost AI-powered learning experiences

You can connect with Dan on [LinkedIn](https://www.linkedin.com/in/danmccreary/)
or through the [Contact](contact.md) page.

## How to Cite This Book

If you reference this textbook in academic work, curriculum proposals, lesson
plans, grant applications, or other publications, please use one of the
following citation formats.

**APA (7th edition)**

McCreary, D. (2026). *Controlling a Robot Arm*.
https://dmccreary.github.io/robot-arm/

**Chicago (17th edition)**

McCreary, Dan. 2026. *Controlling a Robot Arm*.
https://dmccreary.github.io/robot-arm/.

**MLA (9th edition)**

McCreary, Dan. *Controlling a Robot Arm*. 2026,
dmccreary.github.io/robot-arm/.

**BibTeX**

```bibtex
@book{mccreary2026robotarm,
  title     = {Controlling a Robot Arm},
  author    = {McCreary, Dan},
  year      = {2026},
  url       = {https://dmccreary.github.io/robot-arm/},
  note      = {Interactive intelligent textbook}
}
```

To cite a specific chapter, append the chapter number and title. For
example:

McCreary, D. (2026). Chapter 1: Setting Up Python for Robotics. In
*Controlling a Robot Arm*.
https://dmccreary.github.io/robot-arm/chapters/01-python-setup-for-robotics/

To cite a MicroSim, use its lesson page, for example:

McCreary, D. (2026). Two-Link Workspace Explorer [Interactive simulation]. In
*Controlling a Robot Arm*.
https://dmccreary.github.io/robot-arm/sims/two-link-workspace-explorer/

## License and Source

This work is released under the
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
License (CC BY-NC-SA 4.0)](license.md). You are free to share and adapt the
material for non-commercial purposes as long as you give appropriate credit
and share your adaptations under the same license.

The source, including every chapter and MicroSim, is on
[GitHub](https://github.com/dmccreary/robot-arm). Corrections and
contributions are welcome.

## References

[^1]: International Federation of Robotics. (2026, September 24). *Five Million Robots Now Operate in Factories Globally*. https://ifr.org/ifr-press-releases/five-million-robots-now-operate-in-factories-globally
[^2]: International Federation of Robotics. (2024, November). *Global Robot Density in Factories Doubled in Seven Years*. https://ifr.org/ifr-press-releases/global-robot-density-in-factories-doubled-in-seven-years
[^3]: Goldman Sachs Research. (2024, February 27). *The Global Market for Robots Could Reach $38 Billion by 2035*. https://www.goldmansachs.com/insights/articles/the-global-market-for-robots-could-reach-38-billion-by-2035
[^4]: International Federation of Robotics. (2024, January 10). *Global Robotics Race: Korea, Singapore and Germany in the Lead*. https://ifr.org/ifr-press-releases/news/global-robotics-race-korea-singapore-and-germany-in-the-lead
[^5]: Deloitte and The Manufacturing Institute. (2024, April). *Taking Charge: Manufacturers Support Growth with Active Workforce Strategies*. https://themanufacturinginstitute.org/manufacturers-need-as-many-as-3-8-million-new-employees-by-2033/
[^6]: National Center for Education Statistics. (2019). *The Nation's Report Card: 2018 Technology and Engineering Literacy (TEL) Highlights*. https://nationsreportcard.gov/tel_2018_highlights
[^7]: Silicon Republic. (2026, March). *Yann LeCun's AI Start-up AMI Raises $1.03bn in Seed Funding*. https://www.siliconrepublic.com/start-ups/yann-lecun-ai-start-up-ami-raises-seed-funding-world-model
[^8]: AMD. (2026, September 28). *AMD to Acquire World Labs to Advance the Future of AI Compute*. https://newsroom.amd.com/news/amd-acquire-world-labs/
