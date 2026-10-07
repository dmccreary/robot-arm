#!/usr/bin/env python3
"""Render the common-ground connection used in Chapter 3.

Prompt:
    Two separate DC supplies power two boxes that talk by one signal wire,
    and their grounds are tied together. On the left, a 5 V logic supply V2
    (positive terminal at the top, labeled "V2 5 V") feeds the +5V pin at the top of a box
    labeled "Controller". On the right, a 12 V motor supply V1 (positive
    terminal at the top, labeled "V1 12 V") feeds the +12V pin at the top of a box labeled
    "Motor driver". A single signal wire runs from the controller's OUT pin
    (right side) straight across to the motor driver's IN pin (left side).
    One continuous ground wire runs along the bottom and connects V2's
    negative terminal, the controller's GND pin, the motor driver's GND pin
    and V1's negative terminal; dots mark each junction on that wire and a
    ground symbol hangs from the middle. Wires are horizontal or vertical
    and the background is white with no title.

Topology: V2+ - controller +5V; V1+ - driver +12V; controller OUT - driver IN;
    V2- - controller GND - driver GND - V1- - ground symbol (one net).
Assumptions: both supplies are isolated from the wall outlet and from each
    other except through the shared ground wire.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import schemdraw
import schemdraw.elements as elm

schemdraw.use("matplotlib")

BOX_SIZE = (4.0, 2.0)
LEAD = 0.5


def logic_box(vin_name: str, in_pin: bool, out_pin: bool) -> elm.Ic:
    """A box with power on top, ground on the bottom and one signal pin."""
    pins = [
        elm.IcPin(name=vin_name, side="top", anchorname="vin", lblsize=12),
        elm.IcPin(name="GND", side="bottom", anchorname="gnd", lblsize=12),
    ]
    if in_pin:
        pins.append(elm.IcPin(name="IN", side="left", anchorname="sig", lblsize=12))
    if out_pin:
        pins.append(elm.IcPin(name="OUT", side="right", anchorname="sig", lblsize=12))
    # .right() pins the box to its true orientation instead of inheriting the last wire direction.
    return elm.Ic(pins=pins, size=BOX_SIZE, leadlen=LEAD, pinlblsize=11).right()


def build_drawing() -> schemdraw.Drawing:
    drawing = schemdraw.Drawing(show=False)
    drawing.config(unit=3.0, fontsize=12, lw=1.8)

    # Logic supply V2 and the controller it powers.
    v2 = drawing.add(elm.SourceV().up().at((0, 0)))
    drawing += elm.Label().at((-1.4, 1.5)).label("V2\n5 V")
    drawing += elm.Line().right().at(v2.end).length(3.6)
    controller = drawing.add(
        logic_box("+5V", in_pin=False, out_pin=True).anchor("vin").at(drawing.here).label("Controller", loc="center", ofst=0)
    )

    # Motor supply V1 and the motor driver it powers.
    v1 = drawing.add(elm.SourceV().up().at((14.2, 0)))
    drawing += elm.Label().at((15.4, 1.5)).label("V1\n12 V")
    drawing += elm.Line().left().at(v1.end).length(3.6)
    driver = drawing.add(
        logic_box("+12V", in_pin=True, out_pin=False).anchor("vin").at(drawing.here).label("Motor\ndriver", loc="center", ofst=0)
    )

    # Signal wire (straight: the two signal pins are at the same height).
    assert abs(controller.sig[1] - driver.sig[1]) < 1e-6, (controller.sig, driver.sig)
    drawing += elm.Line().at(controller.sig).tox(driver.sig).label("signal", loc="top")

    # One continuous ground wire along the bottom.
    ground_y = v2.start[1]
    assert abs(controller.gnd[1] - ground_y) < 1e-6, controller.gnd
    assert abs(driver.gnd[1] - ground_y) < 1e-6, driver.gnd
    drawing += elm.Line().at(v2.start).tox(v1.start)
    for point in (controller.gnd, driver.gnd):
        drawing += elm.Dot().at(point)
    mid_x = (controller.gnd[0] + driver.gnd[0]) / 2
    drawing += elm.Dot().at((mid_x, ground_y))
    drawing += elm.Ground().at((mid_x, ground_y))
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
