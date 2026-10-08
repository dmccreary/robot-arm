# Quiz: Cameras, Perception, and Learning from Demonstration

Test your understanding of camera frames, OpenCV, calibration, pixel-to-world mapping, and imitation learning with these review questions.

---

#### 1. In what order does OpenCV store the color channels of an image frame?

<div class="upper-alpha" markdown>
1. Red, green, blue
2. Blue, green, red
3. Hue, saturation, value
4. Green, red, blue
</div>

??? question "Show Answer"
    The correct answer is **B**. OpenCV orders channels as blue, green, red (BGR), and not RGB. This is a famous source of swapped colors when a picture from OpenCV is shown by another library. A frame is a NumPy array of shape (height, width, 3) with one number from 0 to 255 per channel at each pixel. HSV is a different color space, reached with `cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)`.

    **Concept Tested:** Image Frame

    **See:** [USB Webcams and Frames](index.md#usb-webcams-and-frames)

---

#### 2. In OpenCV's HSV color space, what range does the hue channel take?

<div class="upper-alpha" markdown>
1. 0 to 255
2. 0 to 360
3. 0 to 100
4. 0 to 179
</div>

??? question "Show Answer"
    The correct answer is **D**. OpenCV halves the usual 360-degree hue circle so that it fits in one byte, so hue runs from 0 to 179, while saturation and value run from 0 to 255. With full saturation and value, pure red has a hue of 0, yellow 30, green 60, and blue 120. Separating hue from brightness is what makes the question "is this pixel red?" easy to ask.

    **Concept Tested:** Color Space

    **See:** [Color Spaces and Color Thresholding](index.md#color-spaces-and-color-thresholding)

---

#### 3. A camera has focal length f = 500 pixels and principal point c_x = 320. A point lies 0.20 m to the right of the camera's axis and 0.80 m in front of it. At which horizontal pixel u does it appear?

<div class="upper-alpha" markdown>
1. u = 420
2. u = 345
3. u = 445
4. u = 520
</div>

??? question "Show Answer"
    The correct answer is **C**. The pinhole model gives u = f·X/Z + c_x = 500 × 0.20 / 0.80 + 320 = 125 + 320 = 445. The chapter's example uses 0.10 m to the right and 0.50 m in front, giving u = 420, which is option A. Moving the same point farther away makes it appear closer to the center of the picture, because of the division by Z.

    **Concept Tested:** Camera Intrinsics

    **See:** [Camera Intrinsics and the Pinhole Model](index.md#camera-intrinsics-and-the-pinhole-model)

---

#### 4. A webcam is changed from 640 × 480 to 1280 × 720. By what factor does the number of pixels in each frame grow?

<div class="upper-alpha" markdown>
1. 3 times
2. 2.25 times
3. 6.75 times
4. 1.5 times
</div>

??? question "Show Answer"
    The correct answer is **A**. A 640 × 480 frame has 307,200 pixels, and a 1280 × 720 frame has 921,600, which is exactly 3 times as many. The chapter's example compares 1920 × 1080 (2,073,600 pixels) with 640 × 480, which is 6.75 times as many. Resolution and frame rate set the cost of a camera, because every extra number must be moved and processed at every tick.

    **Concept Tested:** USB Webcam

    **See:** [USB Webcams and Frames](index.md#usb-webcams-and-frames)

---

#### 5. `lerobot-record` allows each episode up to 60 seconds, followed by a 60-second reset period, with 50 episodes by default. What is the longest a full default session can take?

<div class="upper-alpha" markdown>
1. About 50 minutes
2. About 100 minutes
3. About 60 minutes
4. About 200 minutes
</div>

??? question "Show Answer"
    The correct answer is **B**. Each episode and its reset take at most 60 + 60 = 120 seconds, and 50 × 120 = 6,000 seconds, or 100 minutes. The right arrow ends an episode or reset early, which shortens the session. The documentation advises at least 50 episodes for a first dataset, with 10 at each location of the object and a consistent grasp.

    **Concept Tested:** Recording Episodes

    **See:** [Recording Episodes and Datasets](index.md#recording-episodes-and-datasets)

---

#### 6. Why does a mask for the color red need two hue ranges?

<div class="upper-alpha" markdown>
1. The hue circle wraps around at 0, so red sits at both the bottom (0 to 10) and the top (170 to 179) of the scale
2. Red needs both a saturation range and a value range
3. OpenCV stores red twice, once in each half of the frame
4. A single `inRange` call can never return more than one color
</div>

??? question "Show Answer"
    The correct answer is **A**. Because hue is circular, red lies on both sides of the point where the scale wraps from 179 back to 0. A red mask is made from two `cv2.inRange` calls joined with `|`. Forgetting the second range is the most common bug in color code. The minimum saturation and value in each range are what keep gray, white, and dark pixels out of the mask.

    **Concept Tested:** Color Thresholding

    **See:** [Color Spaces and Color Thresholding](index.md#color-spaces-and-color-thresholding)

---

#### 7. You clamp a calibrated camera in a new position on a different stand. Which calibration results are now out of date?

<div class="upper-alpha" markdown>
1. Only the distortion coefficients
2. Both the intrinsics and the lens, which must be remade
3. None, because calibration lasts for the life of the camera
4. The extrinsics, because they describe where the camera is, while the intrinsics belong to the camera and lens
</div>

??? question "Show Answer"
    The correct answer is **D**. The intrinsics (focal lengths, principal point, and distortion) are properties of the camera and its lens, and they stay the same wherever it is put. The extrinsics are a rotation and translation that place the camera in the world, so they change whenever it is moved. After the move, redo the pixel-to-world mapping. A camera that moves between recordings also makes every demonstration out of date.

    **Concept Tested:** Camera Extrinsics

    **See:** [Camera Calibration and Extrinsics](index.md#camera-calibration-and-extrinsics)

---

#### 8. What assumption lets a single homography convert a block's pixel position into a table position?

<div class="upper-alpha" markdown>
1. The block is always red
2. The camera is mounted on the gripper
3. The block sits on the flat plane of the table, so each pixel corresponds to one point on that plane
4. The block is exactly 5 cm tall
</div>

??? question "Show Answer"
    The correct answer is **C**. A homography maps points on a flat surface to pixels, and its inverse maps pixels back. For a block on the table, one picture is enough because the height is already known. The ArUco markers supply the point pairs: four markers with four corners each give 16 pairs, more than the minimum of four, so the fit averages out noise. Hand-eye calibration is a different problem, for a camera on the arm.

    **Concept Tested:** Pixel-to-World Mapping

    **See:** [Pixel-to-World Mapping](index.md#pixel-to-world-mapping)

---

#### 9. In the lab, a flexible policy trained on 12 demonstrations drives its training loss to zero, but places the tip 14.9 mm from new blocks, while a simple policy with a training loss of 20 reaches 11.7 mm. What does this show?

<div class="upper-alpha" markdown>
1. The flexible policy is better, because a lower training loss always means a better policy
2. The flexible policy is overfitting: it copies the jitter in the demonstrations and does worse on new situations
3. The simple policy is broken, because its training loss is too high
4. Training loss is irrelevant to policy quality
</div>

??? question "Show Answer"
    The correct answer is **B**. Overfitting means a policy learns the noise in its demonstrations and not the task. It does very well on examples it has seen and badly on new ones. The cure is more data, with enough variety: with 60 demonstrations the flexible policy gets down to 5.6 mm. A falling training loss shows that learning is happening, but only evaluation on new situations shows whether it generalizes.

    **Concept Tested:** Overfitting

    **See:** [Evaluating a Policy, Overfitting, and Failure Modes](index.md#evaluating-a-policy-overfitting-and-failure-modes)

---

#### 10. A flexible policy gives errors of about 400 mm when the block is placed beyond the region covered by the demonstrations. What is the best explanation and remedy?

<div class="upper-alpha" markdown>
1. A flexible function extrapolates wildly outside what it has seen, and the remedy is more episodes in the weak situations
2. The camera lens is dirty, and the remedy is to clean it
3. The joint limits are wrong, and the remedy is to widen them
4. The GPU ran out of memory, and the remedy is to train for fewer steps
</div>

??? question "Show Answer"
    The correct answer is **A**. A policy runs well inside the situations it was trained on and can fail badly outside them, because a flexible function extrapolates wildly. In each failure mode the remedy is in the data: more episodes in the weak situations, steadier cameras, and consistent recordings. The safety layers still apply to a learned policy, so every action must pass through the same limit checks as a hand-written one.

    **Concept Tested:** Policy Failure Modes

    **See:** [Evaluating a Policy, Overfitting, and Failure Modes](index.md#evaluating-a-policy-overfitting-and-failure-modes)
