#!/usr/bin/env python3
"""Render the H-bridge motor driver used in Chapter 5.

Prompt:
    An H-bridge that drives a DC motor in both directions. A supply rail
    labeled "+V" runs along the top and a ground rail runs along the bottom.
    Two vertical legs connect the rails. The left leg has switch S1 in its
    upper half and switch S3 in its lower half, with a junction dot between
    them. The right leg has switch S2 in its upper half and switch S4 in its
    lower half, with a junction dot between them. A DC motor, labeled "M",
    sits horizontally between the two junction dots, forming the crossbar of
    the H. All four switches are drawn in the same orientation (open) and are
    labeled S1 to S4. Wires are horizontal or vertical and the background is
    white with no title.

Topology: +V - S1 - node A - S3 - GND; +V - S2 - node B - S4 - GND; M between A and B.
Assumptions: the switches stand for transistors, which a real driver uses.
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

    left_x, right_x = 0.0, 5.0
    top_y, bottom_y = 5.0, 0.0
    mid_y = (top_y + bottom_y) / 2

    # Supply rail along the top and ground rail along the bottom.
    drawing += elm.Line().at((left_x, top_y)).tox(right_x)
    drawing += elm.Vdd().at((left_x + (right_x - left_x) / 2, top_y)).label("+V", loc="top")
    drawing += elm.Line().at((left_x, bottom_y)).tox(right_x)
    drawing += elm.Ground().at((left_x + (right_x - left_x) / 2, bottom_y))

    def leg(x: float, upper: str, lower: str, label_dx: float) -> None:
        """Draw one vertical leg: rail - upper switch - node - lower switch - rail."""
        # Upper half: a short lead, the switch, and a lead down to the node.
        drawing.add(elm.Line().down().at((x, top_y)).length(0.5))
        sw_top = drawing.add(elm.Switch().down().length(1.4))
        drawing.add(elm.Line().down().toy(mid_y))
        drawing.add(elm.Dot())
        drawing.add(elm.Label().at((x + label_dx, top_y - 0.5 - 0.7)).label(upper))
        # Lower half, mirrored.
        drawing.add(elm.Line().down().at((x, mid_y)).length(0.5))
        sw_bot = drawing.add(elm.Switch().down().length(1.4))
        drawing.add(elm.Line().down().toy(bottom_y))
        drawing.add(elm.Label().at((x + label_dx, mid_y - 0.5 - 0.7)).label(lower))
        assert abs(sw_top.end[0] - x) < 1e-6 and abs(sw_bot.end[0] - x) < 1e-6

    leg(left_x, "S1", "S3", -0.5)
    leg(right_x, "S2", "S4", 0.5)

    # The motor is the crossbar of the H.
    drawing += elm.Line().right().at((left_x, mid_y)).length(1.2)
    motor = drawing.add(elm.Motor().right().label("M", loc="top"))
    drawing += elm.Line().right().tox(right_x)

    assert abs(motor.end[1] - mid_y) < 1e-6
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
