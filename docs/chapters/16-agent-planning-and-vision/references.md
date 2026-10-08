# References: Agent Planning, Vision, and Interfaces

1. [Automated planning and scheduling](https://en.wikipedia.org/wiki/Automated_planning_and_scheduling) - Wikipedia - Surveys how AI systems produce sequences of actions to reach goals, including problem classes and algorithms. It supports the chapter's task planning, decomposition, and the planner-executor split.

2. [Vision-language model](https://en.wikipedia.org/wiki/Vision-language_model) - Wikipedia - Explains models that jointly interpret images and text, and traces how their architectures and training developed. It provides background for the chapter's scene descriptions and object localization from camera images.

3. [Model Context Protocol](https://en.wikipedia.org/wiki/Model_Context_Protocol) - Wikipedia - Describes the open standard for connecting AI systems to external tools and data, including its architecture and security concerns. It supports the chapter's MCP servers and tool-server safety discussion.

4. Automated Planning: Theory and Practice (1st Edition) - Malik Ghallab, Dana Nau, and Paolo Traverso - Morgan Kaufmann - A standard planning textbook that separates how a problem is represented from how a plan is searched for, and covers hierarchical task decomposition. Nau is known for hierarchical task network planning, which relates to task decomposition.

5. Behavior Trees in Robotics and AI: An Introduction (1st Edition) - Michele Colledanchise and Petter Ogren - CRC Press - Introduces behavior trees, whose sequence and fallback nodes express try-then-recover logic for robot tasks. It offers a clear way to think about the chapter's replanning and failed grasp recovery.

6. [What is the Model Context Protocol (MCP)?](https://modelcontextprotocol.io/docs/getting-started/intro) - Model Context Protocol Documentation - The official introduction to MCP, with its USB-C analogy for connecting AI applications to tools. It gives the reasoning for exposing arm commands through an MCP server.

7. [Requests: Quickstart](https://requests.readthedocs.io/en/latest/user/quickstart/) - Requests Documentation - Official guide to sending HTTP requests from Python, including JSON bodies, headers, status codes, and timeouts. It covers the Requests calls the chapter's HTTP API client and server use.

8. [HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status) - MDN Web Docs - Reference grouping HTTP status codes into informational, success, redirect, client error, and server error classes. It supports the chapter's HTTP status reader and rate-limit challenge, including the meaning of 429.

9. [Do As I Can, Not As I Say (SayCan)](https://say-can.github.io/) - Robotics at Google - Project page for research that pairs a language model's task knowledge with estimates of which robot skills can succeed. It illustrates the planner-executor idea of a model proposing steps that skills must be able to do.

10. [rosbridge_suite](https://github.com/RobotWebTools/rosbridge_suite) - Robot Web Tools - Repository for ROS 2 packages that let clients talk to ROS using JSON over WebSockets and other transports. It illustrates the chapter's ROS 2 bridge, connecting an agent's JSON tool calls to robot topics.
