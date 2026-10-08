# References: Kinematics: Where Is the Hand and How Do I Get There

1. [Rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix) - Wikipedia - Explains how orthogonal matrices with determinant one rotate vectors in two and three dimensions, including their properties and composition. It supports the chapter's rotation matrices and the way transforms chain together to place each link.

2. [Inverse kinematics](https://en.wikipedia.org/wiki/Inverse_kinematics) - Wikipedia - Describes computing joint parameters from a desired end position, with analytical solutions for specific geometries and numerical methods. It gives the overview for the chapter's geometric and numerical inverse kinematics sections.

3. [Denavit-Hartenberg parameters](https://en.wikipedia.org/wiki/Denavit%E2%80%93Hartenberg_parameters) - Wikipedia - Presents the four-parameter convention for attaching frames to robot links and building the transformation matrix between them. It supports the chapter's treatment of Denavit-Hartenberg parameters and transform chains.

4. Introduction to Robotics: Mechanics and Control (4th Edition) - John J. Craig - Pearson - Craig's link-frame attachment rules, now called the modified DH convention, and his worked PUMA 560 example make frame assignment systematic. His discussion of solvability and multiple solutions clarifies elbow up and elbow down.

5. Robotics, Vision and Control: Fundamental Algorithms in Python (3rd Edition) - Peter Corke - Springer - Corke weaves runnable Python into the text, with pose objects that make transform chains read like the mathematics. The approach matches the chapter's NumPy code and its forward kinematics checks.

6. [NumPy Quickstart](https://numpy.org/doc/stable/user/quickstart.html) - NumPy Documentation - A tour of ndarray creation, shape, indexing, broadcasting, and the at-sign matrix product versus elementwise multiplication. It covers the array skills needed to build rotation matrices, homogeneous transforms, and chains in the chapter.

7. [Introduction to Inverse Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods](https://mathweb.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf) - Samuel R. Buss, UC San Diego - A clear technical note on solving inverse kinematics iteratively with the Jacobian, and on how damping handles singular poses. It supports the chapter's numerical IK and singularity discussion.

8. [Robotics Toolbox for Python](https://github.com/petercorke/robotics-toolbox-python) - GitHub (Peter Corke) - A library for modeling serial arms from DH parameters or URDF files, computing forward kinematics, Jacobians, and numerical inverse kinematics. It offers a reference implementation to check the chapter's own functions against.

9. [IKPy - Inverse Kinematics library](https://github.com/Phylliade/ikpy) - GitHub - A pure-Python library that builds a kinematic chain from a URDF file or DH parameters and solves inverse kinematics for position and orientation. It shows the chapter's chain-of-transforms idea applied to a real arm description.

10. [SO-101 simulation files](https://github.com/TheRobotStudio/SO-ARM100/tree/main/Simulation/SO101) - GitHub (TheRobotStudio SO-ARM100) - Holds the SO-101 URDF and MuJoCo model files with the real link offsets and joint axes. The chapter's lab checks its transform chain against this geometry.
