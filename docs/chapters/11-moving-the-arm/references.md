# References: Moving the Arm: Trajectories, Grippers, and Teleoperation

1. [Linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation) - Wikipedia - Explains the two-point formula for finding values on a straight line between known points, with error analysis and applications. It is the mathematics behind the chapter's single-joint move, where each tick's target lies between start and goal.

2. [Finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine) - Wikipedia - Introduces states, transitions, and inputs using a turnstile example, and shows how machines are drawn and implemented. It supports the chapter's pick-and-place sequence, where the program is always in exactly one named step.

3. [Teleoperation](https://en.wikipedia.org/wiki/Teleoperation) - Wikipedia - Surveys remote control of machines by a human operator, with history and examples across robotics and vehicles. It gives context for the chapter's leader-follower arrangement, where a person moves one arm and another copies it.

4. Modern Robotics: Mechanics, Planning, and Control (1st Edition) - Kevin M. Lynch and Frank C. Park - Cambridge University Press - The authors split trajectory planning into a geometric path and a separate time scaling function, then derive trapezoidal time scalings. This separation clarifies why the chapter plans a path first and the speed profile second.

5. Robotics: Modelling, Planning and Control (1st Edition) - Bruno Siciliano, Lorenzo Sciavicco, Luigi Villani, and Giuseppe Oriolo - Springer - No single author originated the idea, but this book is widely praised for a clear treatment of point-to-point trajectories with trapezoidal velocity profiles under velocity and acceleration limits, matching the chapter's profile section.

6. [time - Time access and conversions](https://docs.python.org/3/library/time.html) - Python Documentation - Documents perf_counter, monotonic, and sleep, including that sleep may last longer than requested. It supports the chapter's control loop timing, where a scheduled loop avoids drift and jitter.

7. [threading - Thread-based parallelism](https://docs.python.org/3/library/threading.html) - Python Documentation - Describes Thread objects with start and join, and Event objects with an internal flag set by one thread and checked by another. It is the basis of the chapter's stop flag for halting a move safely.

8. [Imitation Learning on Real-World Robots](https://huggingface.co/docs/lerobot/il_robots) - Hugging Face LeRobot - Shows teleoperating an SO-101 follower with a leader arm in a loop that reads the leader and sends the action to the follower at a fixed rate. It is a real-world version of the chapter's teleoperation loop.

9. [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705) - arXiv (Zhao, Kumar, Levine, Finn) - Introduces the ALOHA low-cost bimanual system, whose leader-follower teleoperation collects the demonstrations for learning. It shows why the chapter's leader-follower mapping and steady control rate matter for modern robot learning.

10. [Modern Robotics: Mechanics, Planning, and Control](https://hades.mech.northwestern.edu/index.php/Modern_Robotics) - Northwestern University - The book's home page, offering the free preprint, video lectures, and Python software for trajectory generation and time scaling. It lets learners study the trapezoidal profile derivations behind the chapter's acceleration limit.
