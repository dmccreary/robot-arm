# References: Logging, Testing, Simulation, and ROS 2

1. [Unit testing](https://en.wikipedia.org/wiki/Unit_testing) - Wikipedia - Explains how small, isolated pieces of code are checked automatically against expected behavior. It supports the chapter's pytest tests for transforms, joint limits, and safety checks that run in a second.

2. [Regression testing](https://en.wikipedia.org/wiki/Regression_testing) - Wikipedia - Describes re-running earlier tests after every change to catch behavior that used to work and broke. It gives the idea behind the chapter's regression tests that protect the arm library as it grows.

3. [Robot Operating System](https://en.wikipedia.org/wiki/Robot_Operating_System) - Wikipedia - Surveys ROS and ROS 2 as middleware for robots, including nodes, topics, and message passing. It prepares students for the chapter's ROS 2 tour and the MoveIt 2 and Isaac Sim discussions.

4. Python Testing with pytest (2nd Edition) - Brian Okken - Pragmatic Bookshelf - Teaches pytest by testing one small, realistic command-line application throughout the book, and gives fixtures a central role. That running example makes fixtures, parametrization, and test organization concrete, matching the chapter's fixtures and safety-limit tests.

5. Programming Robots with ROS: A Practical Introduction to the Robot Operating System (1st Edition) - Morgan Quigley, Brian Gerkey, and William D. Smart - O'Reilly - Written by people closely involved in creating ROS, it introduces nodes, topics, and messages through hands-on examples that start in simulation. It is based on the original ROS, so the concepts transfer while commands differ from ROS 2.

6. [Logging HOWTO](https://docs.python.org/3/howto/logging.html) - Python Documentation - The official tutorial on the logging module: log levels, loggers, handlers, and formatters, with guidance on module-level loggers. It is the reference for the chapter's logging, log levels, and file output.

7. [How to use fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html) - pytest Documentation - Official guide to declaring fixtures, setting their scope, and cleaning up after tests. It backs the chapter's fixtures for a simulated arm and the repeatable safety-limit tests built on them.

8. [MuJoCo Overview](https://mujoco.readthedocs.io/en/stable/overview.html) - MuJoCo Documentation - Introduces the MuJoCo physics engine, its model format, and its conventions for units and coordinates. It helps students understand what a physics simulator needs from a robot model and why the sim-to-real gap exists.

9. [Pinocchio](https://stack-of-tasks.github.io/pinocchio/) - Stack of Tasks Project - Home of the Pinocchio rigid-body kinematics and dynamics library, which has Python bindings. It supports the chapter's guided tour and the check of students' own transform chain and Jacobian against an established library.

10. [MoveIt 2 Documentation](https://moveit.picknik.ai/main/index.html) - MoveIt Project - Central documentation for the ROS 2 manipulation framework covering motion planning, kinematics, and control, with tutorials. It expands the chapter's MoveIt planning tour for students ready to plan arm motions in simulation.
