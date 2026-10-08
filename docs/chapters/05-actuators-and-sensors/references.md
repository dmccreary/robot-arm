# References: Actuators and Sensors

1. [Servomotor](https://en.wikipedia.org/wiki/Servomotor) - Wikipedia - Explains how a servomotor combines a motor, gearing, a position sensor and a control loop. It frames the hobby servo versus serial bus servo comparison and the idea of closed-loop positioning used throughout this chapter.

2. [Rotary encoder](https://en.wikipedia.org/wiki/Rotary_encoder) - Wikipedia - Describes absolute and incremental encoders, including magnetic types, and how bit count sets angular resolution. It supports the chapter's discussion of the STS3215's 12-bit magnetic encoder and position feedback.

3. [PID controller](https://en.wikipedia.org/wiki/PID_controller) - Wikipedia - Covers the proportional, integral and derivative terms, tuning, overshoot and integral windup. It backs the chapter's PID step-response ideas and the reason a joint needs limits as well as gains.

4. Feedback Systems: An Introduction for Scientists and Engineers (2nd Edition) - Karl Johan Astrom and Richard M. Murray - Princeton University Press - Builds feedback from block diagrams and recurring examples such as automobile cruise control, then gives PID its own chapter. Its plain explanation of each term and of integral windup suits a joint holding position.

5. The Art of Electronics (3rd Edition) - Paul Horowitz and Winfield Hill - Cambridge University Press - No single originator here; chosen as the book widely praised for clarity in practical electronics. It teaches by working circuits with candid commentary on why alternatives fail, which helps with transistor switching and motor driving.

6. [Motors and Selecting the Right One](https://learn.sparkfun.com/tutorials/motors-and-selecting-the-right-one) - SparkFun - Compares brushed DC, brushless, stepper and linear motors, covering construction, operation and trade-offs. It gives context for why this chapter's arms use geared servos and brushless actuators rather than bare motors.

7. [Pulse Width Modulation](https://learn.sparkfun.com/tutorials/pulse-width-modulation) - SparkFun - Introduces duty cycle and frequency, with an example of the 20 ms pulse used by hobby servos. It explains the chapter's contrast between PWM as average voltage and PWM as a position command.

8. [ST3215 Servo](https://www.waveshare.com/wiki/ST3215_Servo) - Waveshare Wiki - Lists the ST3215 specifications: 12 V torque, a 4096-step magnetic encoder, half-duplex serial protocol, default ID of 1 and readable feedback. It is the reference for the STS3215 servo studied in this chapter.

9. [Dynamixel XL330-M288 e-Manual](https://emanual.robotis.com/docs/en/dxl/x/xl330-m288/) - ROBOTIS - Shows a serial bus servo control table, operating modes, PID gains and the torque enable register. It is a well-documented comparison for how limits, feedback registers and torque control are organized in bus servos.

10. [Motor Selection Guide](https://learn.adafruit.com/adafruit-motor-selection-guide) - Adafruit Learning System - Offers a quick guide to choosing between motor types by size, speed and strength, noting that gearboxes and controllers come separately. It reinforces the chapter's view of an actuator as a motor plus gearing and driver.
