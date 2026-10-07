#!/usr/bin/env python3
"""Render the wire voltage-drop circuit used in Chapter 3.

Prompt:
    A 12 V DC supply V1 (positive terminal at the top-left) powers a robot
    arm through two long wires. The positive wire is drawn as a small
    resistor Rw1 of 0.106 ohm and the return wire as a second small resistor
    Rw2 of 0.106 ohm, each labeled as one 2 m run of AWG 22 wire. The arm is
    drawn as a load resistor R(arm) of 3.79 ohm that draws about 3 A. A
    voltmeter V2 across the arm reads 11.36 V. Layout is a rectangular loop:
    V1 on the left, Rw1 along the top, R_arm on the right, Rw2 along the
    bottom. Wires are horizontal or vertical, the voltmeter sits to the
    right of the arm with junction dots at its two connections, and the
    background is white with no title.

Topology: V1+ - Rw1 - node T; node T - R(arm) - node B; node T - V2 - node B;
    node B - Rw2 - V1-.
Assumptions: the arm is modeled as a fixed resistance so that 3 A flows;
    the two wire runs are 2 m of AWG 22 copper each (0.053 ohm per metre).
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import schemdraw
import schemdraw.elements as elm

schemdraw.use("matplotlib")


def build_drawing() -> schemdraw.Drawing:
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=1.8)

    supply = drawing.add(elm.SourceV().up().at((0, 0)))
    drawing += elm.Label().at((-1.0, 1.5)).label("V1\n12 V")

    # Positive wire, drawn as its resistance.
    drawing += elm.Line().right().at(supply.end).length(1.0)
    wire_pos = drawing.add(elm.Resistor().right().label("Rw1  0.106 Ω\n(2 m, AWG 22)", loc="top"))
    drawing += elm.Line().right().length(1.0)
    top_node = drawing.add(elm.Dot())

    # The arm, modeled as a load resistor.
    arm = drawing.add(elm.Resistor().down().at(top_node.end).toy(supply.start))
    drawing += elm.Label().at((top_node.end[0] + 1.1, 1.5)).label("R(arm)\n3.79 Ω\n(about 3 A)")
    bottom_node = drawing.add(elm.Dot().at(arm.end))

    # Voltmeter across the arm.
    drawing += elm.Line().right().at(top_node.end).length(4.0)
    volt = drawing.add(elm.MeterV().down().toy(supply.start))
    drawing += elm.Label().at((volt.start[0] + 1.6, 1.5)).label("V = 11.36 V")
    drawing += elm.Line().left().at(volt.end).tox(bottom_node.end)

    # Return wire, drawn as its resistance.
    drawing += elm.Line().left().at(bottom_node.end).length(1.0)
    drawing += elm.Resistor().left().label("Rw2  0.106 Ω\n(2 m, AWG 22)", loc="bottom")
    drawing += elm.Line().left().tox(supply.start)

    assert abs(arm.end[1] - supply.start[1]) < 1e-6
    return drawing


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output .svg or .png path")
    args = parser.parse_args()
    if args.output.suffix.lower() not in {".svg", ".png"}:
        parser.error("output must end in .svg or .png")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    drawing = build_drawing()
    drawing.save(args.output, transparent=False, dpi=180)


if __name__ == "__main__":
    main()
