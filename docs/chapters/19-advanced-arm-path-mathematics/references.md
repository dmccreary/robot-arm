# References: Optional Advanced Chapter: The Mathematics of Arm Paths

1. [Quaternions and spatial rotation](https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation) - Wikipedia - A thorough article on representing 3D rotations with unit quaternions, with links to axis-angle and rotation matrices. It supports the chapter's four rotation forms, quaternion rotation, and SLERP.

2. [Rapidly exploring random tree](https://en.wikipedia.org/wiki/Rapidly-exploring_random_tree) - Wikipedia - Describes the sampling-based search that grows a tree through random samples of a space. It underpins the chapter's configuration-space planner for steering the arm around obstacles.

3. [Jacobian matrix and determinant](https://en.wikipedia.org/wiki/Jacobian_matrix_and_determinant) - Wikipedia - Defines the matrix of first-order partial derivatives and its determinant. It supplies the mathematical foundation for the chapter's velocity kinematics, singularities, and manipulability analysis.

4. Modern Robotics: Mechanics, Planning, and Control (1st Edition) - Kevin M. Lynch and Frank C. Park - Cambridge University Press - Their treatment of trajectories separates the geometric path from a time-scaling function s(t), and handles velocity kinematics with screw theory. This clarifies the chapter's path-versus-trajectory distinction and time scaling.

5. Planning Algorithms (1st Edition) - Steven M. LaValle - Cambridge University Press - LaValle originated the RRT algorithm and gives a clear exposition of configuration space as the place where obstacles become regions to avoid. It clarifies the chapter's sampling-based planning and path smoothing.

6. [Introduction to Inverse Kinematics with Jacobian Transpose, Pseudoinverse and Damped Least Squares methods](https://mathweb.ucsd.edu/~sbuss/ResearchWeb/ikmethods/iksurvey.pdf) - Samuel R. Buss, UC San Diego - A compact report comparing Jacobian-based inverse kinematics methods and showing why damping stabilizes motion near singularities. It matches the chapter's pseudoinverse and damped least squares material.

7. [numpy.linalg.pinv](https://numpy.org/doc/stable/reference/generated/numpy.linalg.pinv.html) - NumPy Documentation - Documents the Moore-Penrose pseudo-inverse computed by singular value decomposition, including the cutoff for tiny singular values. It is the function the chapter's Python checks use to invert a Jacobian.

8. [scipy.interpolate.CubicSpline](https://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.CubicSpline.html) - SciPy Documentation - Describes piecewise cubic interpolation with several boundary conditions and derivative evaluation. It supports the chapter's via-point trajectories and numerical checks of velocity and acceleration.

9. [scipy.spatial.transform.Slerp](https://docs.scipy.org/doc/scipy/reference/generated/scipy.spatial.transform.Slerp.html) - SciPy Documentation - Explains spherical linear interpolation between keyframe rotations along the shortest path. It lets students verify the chapter's SLERP formula and smoothly blend gripper orientations in Python.

10. [OMPL geometric::RRT class reference](https://ompl.kavrakilab.org/core/classompl_1_1geometric_1_1RRT.html) - Open Motion Planning Library - Documents a production RRT planner with goal bias and step range settings. It shows how the chapter's simple random tree maps onto the settings used in real planning software.
