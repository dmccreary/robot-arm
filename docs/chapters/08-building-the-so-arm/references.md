# References: Building and Calibrating the SO-ARM100

1. [Robot calibration](https://en.wikipedia.org/wiki/Robot_calibration) - Wikipedia - Introduces robot calibration as the process of making a robot's commanded and actual positions agree. It frames the chapter's offsets, range-of-motion limits and calibration drift.

2. [Teleoperation](https://en.wikipedia.org/wiki/Teleoperation) - Wikipedia - Explains controlling a machine remotely through an operator interface. It gives the background for the leader and follower arm pair, whose matched calibration lets one arm mirror the other.

3. [Daisy chain (electrical engineering)](https://en.wikipedia.org/wiki/Daisy_chain_%28electrical_engineering%29) - Wikipedia - Describes devices linked one to the next along a shared connection. It helps explain why servos share one bus and why each needs a unique ID, and why they are set up one at a time.

4. Modern Robotics: Mechanics, Planning, and Control (1st Edition) - Kevin M. Lynch and Frank C. Park - Cambridge University Press - Defines forward kinematics from a home configuration, where every joint sits at zero. Its clear separation of that zero pose from other poses helps with the chapter's two different zeros.

5. Pro Git (2nd Edition) - Scott Chacon and Ben Straub - Apress - Explains Git by its model of snapshots of a project over time, rather than lists of changes. That view helps you record which repository version and calibration files a working arm was built from.

6. [SO-101 assembly guide](https://huggingface.co/docs/lerobot/so101) - Hugging Face LeRobot Documentation - The official step-by-step guide: finding ports, setting motor IDs and baud rates, assembling each joint with the stated screws, and calibrating. This chapter's build sequence follows it.

7. [SO-ARM100 and SO-ARM101 repository](https://github.com/TheRobotStudio/SO-ARM100) - The Robot Studio on GitHub - The open-source hardware source for printable files, calibration gauges, bills of materials, printing guidance and a motor debugging section. It is the starting point for the build.

8. [Getting started with SO-ARM100 and SO-ARM101 with LeRobot](https://wiki.seeedstudio.com/lerobot_so100m_new/) - Seeed Studio Wiki - A photo-based assembly walkthrough for both arms, with power-supply rules, calibration advice and a mid-position reset procedure. It adds practical detail and warnings that complement the official guide.

9. [Bus Servo Adapter (A)](https://www.waveshare.com/wiki/Bus_Servo_Adapter_%28A%29) - Waveshare Wiki - Documents the servo bus controller board, including the A and B jumper positions for UART or USB, and its separate power input. It supports the chapter's power-on checklist, where the jumpers must be set to B.

10. [Imitation Learning on Real-World Robots](https://huggingface.co/docs/lerobot/il_robots) - Hugging Face LeRobot Documentation - Shows the next step after calibration: teleoperating the follower from the leader, with the robot id used to store the calibration file. It shows why calibration matters for later chapters.
