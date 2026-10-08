# References: Building the reBot-DevArm and Choosing a Platform

1. [CAN bus](https://en.wikipedia.org/wiki/CAN_bus) - Wikipedia - Covers the two-wire differential bus, arbitration by message identifier, frame layout, and bit rates. It explains why every motor on the reBot-DevArm shares one pair of wires and why termination and bitrate matter during bring-up.

2. [Voltage drop](https://en.wikipedia.org/wiki/Voltage_drop) - Wikipedia - Explains how current flowing through the resistance of wires and connectors lowers the voltage that reaches a load. It supports the chapter's discussion of brown-out and why long or thin power leads starve motors.

3. [Brushless DC electric motor](https://en.wikipedia.org/wiki/Brushless_DC_electric_motor) - Wikipedia - Describes electronic commutation, rotor position sensing, and controller design in place of brushes. Useful background for the Damiao and RobStride actuators in the arm, which combine such a motor with a driver and a CAN interface.

4. The Art of Electronics (3rd Edition) - Paul Horowitz and Winfield Hill - Cambridge University Press - The authors teach through worked circuits with realistic component values and deliberately flawed circuits that show a design failing. This builds intuition for why a supply that looks adequate on paper sags under load, as in brown-out.

5. Robot Modeling and Control (2nd Edition) - Mark W. Spong, Seth Hutchinson, and M. Vidyasagar - Wiley - Its independent-joint-control model shows that a gear ratio makes the motor's inertia appear multiplied by the ratio squared at the joint. This clarifies why the low gearing of quasi-direct-drive actuators keeps an arm backdrivable.

6. [reBot-DevArm repository](https://github.com/Seeed-Projects/reBot-DevArm) - GitHub (Seeed Studio) - The official open-source project for the B601-DM and B601-RS arms, with STEP files, bill of materials, Python SDK, and ROS and LeRobot support. It is the primary reference for the body structure, wiring, and parts used in this chapter.

7. [Getting Started with LeRobot on the reBot Arm B601-RS](https://wiki.seeedstudio.com/rebot_arm_b601_rs_lerobot/) - Seeed Studio Wiki - Walks through bringing up the SocketCAN interface at 1 Mbps, then calibrating the follower and leader arms against a defined zero pose. It matches the chapter's CAN bring-up and zeroing steps for the RS arm.

8. [Getting Started with LeRobot on the reBot Arm B601-DM](https://wiki.seeedstudio.com/rebot_arm_b601_dm_lerobot/) - Seeed Studio Wiki - Covers installing LeRobot, calibrating the Damiao-based follower and leader arms with the gripper closed as zero, and the safety steps after a power or signal loss. It is the DM counterpart for the chapter's lab.

9. [SocketCAN - Controller Area Network](https://docs.kernel.org/networking/can.html) - Linux Kernel Documentation - Explains how Linux exposes CAN controllers as network interfaces, including CAN identifiers, raw sockets, and setting the bit rate with the ip tool. It underpins the chapter's can0 commands for the RS arm.

10. [Proprioceptive Actuator Design in the MIT Cheetah](https://dspace.mit.edu/handle/1721.1/119863) - IEEE Transactions on Robotics (via MIT DSpace) - The paper that popularized low-gear-ratio, high-torque motors with force sensed through the motor current. It is the foundation for the chapter's quasi-direct-drive section and its backdrivability argument.
