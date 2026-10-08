# References: Anatomy of a Robot Arm

1. [Robotic arm](https://en.wikipedia.org/wiki/Robotic_arm) - Wikipedia - Surveys robot arm types, their links and joints, end effectors, and typical applications. It gives a broad view of the parts and vocabulary the chapter introduces before focusing on the two desktop arms in this book.

2. [Degrees of freedom (mechanics)](https://en.wikipedia.org/wiki/Degrees_of_freedom_(mechanics)) - Wikipedia - Defines degrees of freedom for rigid bodies and mechanisms, including translation and rotation in three dimensions. It backs the chapter's explanation of why a six-axis arm can reach any position and orientation within its workspace.

3. [Teleoperation](https://en.wikipedia.org/wiki/Teleoperation) - Wikipedia - Gives an overview of operating a machine at a distance, including master and slave devices. It places the chapter's leader and follower arm pair within the broader history and purpose of teleoperation.

4. Modern Robotics: Mechanics, Planning, and Control (1st Edition) - Kevin M. Lynch and Frank C. Park - Cambridge University Press - Opens with configuration space and Grubler's formula, which counts degrees of freedom for any mechanism from its joints and links. That one rule explains why joint counts determine an arm's capabilities, as in the chapter's counter.

5. Introduction to Robotics: Mechanics and Control (4th Edition) - John J. Craig - Pearson - Craig popularized assigning a coordinate frame to every link and describing the arm by link parameters, a modified Denavit-Hartenberg convention. This frames-on-links idea clarifies the chapter's base frame and pose discussion.

6. [reBot-DevArm repository](https://github.com/Seeed-Projects/reBot-DevArm) - GitHub (Seeed Studio) - Official open-source repository for the reBot-DevArm B601, with mechanical files, parts lists, and software. Students can compare its six-joint layout, gripper, and specifications with the SO-ARM101 discussed in the chapter.

7. [SO-ARM100 and SO-101 repository](https://github.com/TheRobotStudio/SO-ARM100) - GitHub (The Robot Studio) - Open-hardware project with 3D-printable parts, bills of materials, and assembly guidance for the SO-100 and SO-101 leader and follower arms. It is the primary source for the arm described in this chapter.

8. [SO-101 assembly and calibration](https://huggingface.co/docs/lerobot/so101) - Hugging Face LeRobot Documentation - Walks through motor setup, assembly joint by joint, and calibration of the SO-101 leader and follower. It shows how joint ranges and a middle pose define the home position and limits the chapter explains.

9. [2.1 Degrees of Freedom of a Rigid Body](https://modernrobotics.northwestern.edu/nu-gm-book-resource/2-1-degrees-of-freedom-of-a-rigid-body/) - Modern Robotics, Northwestern University - Video lecture that builds up how many numbers describe a rigid body's position in a plane and in space. It gives an intuitive foundation for the chapter's degrees of freedom and pose ideas.

10. [LeRobot repository](https://github.com/huggingface/lerobot) - GitHub (Hugging Face) - The open-source Python library that controls SO-101 arms and supports leader and follower teleoperation and learning from demonstrations. It shows how the chapter's arm concepts appear as robot, teleoperator, and calibration code.
