#!/usr/bin/env python3
"""Render the Ohm's law measurement circuit used in Chapter 3.

Prompt:
    A simple closed DC loop for teaching voltage, current and Ohm's law.
    A 12 V DC supply V1 (positive terminal at the top) feeds, in order along
    the top wire, an ammeter A1 in series and then a 6 ohm load resistor R1
    that drops straight down to the bottom return wire. A voltmeter V2 is
    connected in parallel across R1 (to the right of it), from the top node
    to the bottom node. The return wire runs along the bottom back to the
    negative terminal of V1. The ammeter is labeled "I = 2 A" and the
    voltmeter "V = 12 V". Wires are horizontal or vertical, junction dots
    sit where the voltmeter branch meets the loop, and the drawing has a
    white background with no title.

Topology: V1+ - A1 - node T; node T - R1 - node B; node T - V2 - node B;
    node B - V1-.
Assumptions: the supply and meters are ideal; the load is treated as a plain
    6 ohm resistor so that 12 V / 6 ohm = 2 A.
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

    # Supply: positive terminal at the top.
    supply = drawing.add(elm.SourceV().up().at((0, 0)))
    drawing += elm.Label().at((-1.0, 1.5)).label("V1\n12 V")

    # Top wire: supply -> ammeter (in series) -> top node of the load.
    drawing += elm.Line().right().at(supply.end).length(1.5)
    ammeter = drawing.add(elm.MeterA().right().label("I = 2 A", loc="top"))
    drawing += elm.Line().right().length(1.5)
    top_node = drawing.add(elm.Dot())

    # Load resistor drops straight down from the top node.
    load = drawing.add(elm.Resistor().down().at(top_node.end).toy(supply.start))
    drawing += elm.Label().at((top_node.end[0] + 0.9, 1.5)).label("R1\n6 Ω")
    bottom_node = drawing.add(elm.Dot().at(load.end))

    # Voltmeter in parallel across the load.
    drawing += elm.Line().right().at(top_node.end).length(3.2)
    volt = drawing.add(elm.MeterV().down().toy(supply.start))
    drawing += elm.Label().at((volt.start[0] + 1.4, 1.5)).label("V = 12 V")
    drawing += elm.Line().left().at(volt.end).tox(bottom_node.end)

    # Return wire from the load's bottom node back to the supply.
    drawing += elm.Line().left().at(bottom_node.end).tox(supply.start)

    # Sanity checks on connectivity.
    assert abs(load.end[1] - supply.start[1]) < 1e-6
    assert abs(ammeter.start[1] - supply.end[1]) < 1e-6
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
