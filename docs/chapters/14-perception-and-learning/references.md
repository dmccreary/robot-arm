# References: Cameras, Perception, and Learning from Demonstration

1. [Pinhole camera model](https://en.wikipedia.org/wiki/Pinhole_camera_model) - Wikipedia - Derives how an ideal pinhole camera projects 3D points onto an image plane, including the homogeneous-coordinate form. It underlies the chapter's pinhole projection calculator and the idea of camera intrinsics.

2. [Camera resectioning](https://en.wikipedia.org/wiki/Camera_resectioning) - Wikipedia - Describes estimating a camera's intrinsic and extrinsic parameters so image pixels map to rays in the world. It supports the chapter's camera calibration, extrinsics, and pixel-to-world mapping sections.

3. [Imitation learning](https://en.wikipedia.org/wiki/Imitation_learning) - Wikipedia - Introduces training an agent from recorded expert examples, including behavior cloning and its limits. It gives the theory behind the chapter's demonstrations, policies, and the failure modes of learning from them.

4. Computer Vision: Algorithms and Applications (2nd Edition) - Richard Szeliski - Springer - Builds image formation step by step, from geometric transformations to the camera projection matrix and calibration, and is freely available online from the author. It is widely praised for connecting pixels to geometry, which the chapter's intrinsics and extrinsics need.

5. Robotics, Vision and Control: Fundamental Algorithms in Python (3rd Edition) - Peter Corke - Springer - Treats camera geometry, image features, and robot kinematics in one book, with companion Python toolboxes. This joined-up view mirrors the chapter's goal of expressing what a camera sees in the arm's own coordinates.

6. [Imitation Learning on Real-World Robots](https://huggingface.co/docs/lerobot/il_robots) - Hugging Face LeRobot Documentation - Official walkthrough for teleoperating, recording a dataset, training a policy, and running it on a real arm such as the SO-101. It parallels the chapter's record, train, and evaluate workflow.

7. [Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware](https://arxiv.org/abs/2304.13705) - Zhao, Kumar, Levine, and Finn - The paper that introduced the ALOHA system and Action Chunking with Transformers (ACT). It is the source of the ACT policy students train in this chapter, explaining why predicting action chunks works.

8. [Camera Calibration using OpenCV](https://learnopencv.com/camera-calibration-using-opencv/) - LearnOpenCV - Walks through estimating a camera's internal and external parameters from checkerboard images, with Python code. It gives a hands-on route into the chapter's calibration and intrinsics discussion for a USB webcam.

9. [Augmented Reality using ArUco Markers in OpenCV](https://learnopencv.com/augmented-reality-using-aruco-markers-in-opencv-c-python/) - LearnOpenCV - Shows how to generate and detect ArUco fiducial markers in Python and use their corner positions. It supports the chapter's fiducial markers, which give the arm known points for pixel-to-world mapping.

10. [OpenCV Python Color Detection](https://pyimagesearch.com/2014/08/04/opencv-python-color-detection/) - PyImageSearch - Explains detecting colors by setting lower and upper bounds and masking with cv2.inRange. It reinforces the chapter's color thresholding and object-finding approach, though students should use HSV as the chapter does.
