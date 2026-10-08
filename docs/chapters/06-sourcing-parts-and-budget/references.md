# References: Sourcing Parts and Planning a Budget

1. [Bill of materials](https://en.wikipedia.org/wiki/Bill_of_materials) - Wikipedia - Defines a bill of materials as a structured list of parts, quantities and descriptions. It underpins the chapter's advice to mark required versus optional parts and to keep the list in a form that a program can read.

2. [Lead time](https://en.wikipedia.org/wiki/Lead_time) - Wikipedia - Explains lead time as the delay between placing an order and receiving it, and how it accumulates along a supply chain. It supports the chapter's rule that the slowest part sets the schedule for the whole build.

3. [Incoterms](https://en.wikipedia.org/wiki/Incoterms) - Wikipedia - Describes the standard trade terms that decide who pays shipping, insurance and import charges, and who bears risk in transit. It helps explain why a sticker price differs from the landed cost of an order.

4. Product Design and Development (7th Edition) - Karl T. Ulrich, Steven D. Eppinger and Maria C. Yang - McGraw-Hill Education - Its design-for-manufacturing material estimates product cost from a component-by-component bill of materials plus assembly and overhead. That cost-table method mirrors the chapter's required-parts total and overhead percentage.

5. Factory Physics (3rd Edition) - Wallace J. Hopp and Mark L. Spearman - Waveland Press - Explains lead time through Little's Law and the effect of variability. This is the clearest treatment of why one late part stretches a whole order, which fits the chapter's lead-time and spare-parts planning.

6. [SO-ARM100 and SO-ARM101 repository](https://github.com/TheRobotStudio/SO-ARM100) - The Robot Studio on GitHub - The project's open-source hardware package, with priced bills of materials for a two-arm setup and a single follower, vendor links and a kit-vendor list. It is the source for the parts lists in this chapter.

7. [Getting started with SO-ARM100 and SO-ARM101 with LeRobot](https://wiki.seeedstudio.com/lerobot_so100m_new/) - Seeed Studio Wiki - Explains how to confirm which arm version, motor type, voltage and bill of materials you have before ordering. It warns about mixing supplies and motor voltages, a key compatibility pitfall when sourcing parts.

8. [csv: CSV File Reading and Writing](https://docs.python.org/3/library/csv.html) - Python Documentation - Documents the csv module's reader, DictReader and writers. It is the tool the lab uses to load a parts list from a CSV file and total its cost.

9. [decimal: Decimal fixed-point and floating-point arithmetic](https://docs.python.org/3/library/decimal.html) - Python Documentation - Shows why exact decimal arithmetic suits money, with rounding control and string-built values. It is a useful upgrade for the cost calculator, since float totals can drift by fractions of a cent.

10. [Basic Import and Export](https://www.cbp.gov/trade/basic-import-export) - U.S. Customs and Border Protection - Gives an official overview of the import process, duties, fees and payment, including the de minimis entry rules for small parcels. It grounds the chapter's shipping and customs overhead in primary guidance.
