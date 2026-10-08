# References: 3D Printing, Fasteners, and Tools

1. [Fused filament fabrication](https://en.wikipedia.org/wiki/Fused_filament_fabrication) - Wikipedia - Covers how an FDM printer extrudes melted filament layer by layer, plus materials such as PLA and PETG. It gives the background for the chapter's printer, filament and layer-height discussion.

2. [G-code](https://en.wikipedia.org/wiki/G-code) - Wikipedia - Explains G-code as the text command language that drives printers and CNC machines. It supports the chapter's pipeline from a design file through a slicer to the instructions the printer actually runs.

3. [STL (file format)](https://en.wikipedia.org/wiki/STL_%28file_format%29) - Wikipedia - Describes the ASCII and binary STL formats, which store a surface as triangles. It explains the byte layout that the lab's Python script reads when it counts triangles and checks a part.

4. Make: Electronics: Learning Through Discovery (3rd Edition) - Charles Platt - Make Community - Platt teaches by having readers run small experiments first and explain the theory afterward, including early work with a meter. That discover-then-explain order suits the chapter's multimeter and soldering practice.

5. 3D Printing Failures: How to Diagnose and Repair All Desktop 3D Printing Issues (2022 Edition) - Sean Aranda - Independently published - Organizes troubleshooting around the visible symptom of a bad print and its likely causes. That symptom-first approach is the one behind this chapter's print quality inspection and defect diagnosis.

6. [Warping](https://help.prusa3d.com/article/warping_2011) - Prusa Knowledge Base - Explains why corners lift from the bed and lists fixes: a clean bed, first-layer height, cooling, drafts, brims and skirts. It is a practical companion to the chapter's section on warping.

7. [G-code Index](https://marlinfw.org/meta/gcode/) - Marlin Firmware - Lists the G-code commands used by common printer firmware, such as linear moves, homing and hotend temperature. It lets you read the sample G-code file that the chapter's lab parses.

8. [struct: Interpret bytes as packed binary data](https://docs.python.org/3/library/struct.html) - Python Documentation - Documents pack, unpack and calcsize, plus byte-order markers. These are the functions used to read a binary STL header and its 50-byte triangle records in the lab.

9. [Adafruit Guide To Excellent Soldering](https://learn.adafruit.com/adafruit-guide-excellent-soldering) - Adafruit Learning System - Covers choosing an iron, solder and supplies, along with ventilation and lead-free safety advice. It supports the chapter's soldering and soldering-safety section for building and repairing servo cables.

10. [How to Use a Multimeter](https://learn.sparkfun.com/tutorials/how-to-use-a-multimeter) - SparkFun - Walks through measuring voltage in parallel, resistance, current in series and continuity, with a warning about the fuse. It matches the chapter's multimeter practice before powering an arm.
