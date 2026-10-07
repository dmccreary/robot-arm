#!/usr/bin/env python3
"""Render the protected power path of a robot arm used in Chapter 3.

Prompt:
    A 12 V DC power supply V1 powers a robot arm's motor board through a
    fuse and a hardware emergency-stop switch, all in series on the
    positive wire. Left to right along the top wire: V1 positive terminal,
    fuse F1 labeled "F1  10 A fuse", then switch S1 drawn closed and
    labeled "S1  E-stop (normally closed)", then the positive input (+V) at
    the top of a box labeled "Arm motor board". The ground pin (GND) at the
    bottom of the box connects by a straight bottom return wire back to the
    negative terminal of V1, and a ground symbol hangs from that return
    wire below V1. Wires are horizontal or vertical; the top wire and the
    return wire sit at the same heights as the supply terminals; the
    background is white with no title.

Topology: V1+ - F1 - S1 - board +V; board GND - V1- - ground symbol.
Assumptions: the E-stop is a normally-closed contact that opens when the
    button is pressed, which cuts power to the board.
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

    # Positive wire: fuse, then the emergency-stop contact (closed).
    drawing += elm.Line().right().at(supply.end).length(0.8)
    fuse = drawing.add(elm.Fuse().right().label("F1\n10 A fuse", loc="top"))
    drawing += elm.Line().right().length(0.8)
    estop = drawing.add(elm.Switch(nc=True).right().label("S1  E-stop\n(normally closed)", loc="top"))
    drawing += elm.Line().right().length(0.8)

    # Load: the arm's motor board, power in at the top, ground at the bottom.
    board = drawing.add(
        elm.Ic(
            pins=[
                elm.IcPin(name="+V", side="top", anchorname="vin", lblsize=12),
                elm.IcPin(name="GND", side="bottom", anchorname="gnd", lblsize=12),
            ],
            size=(3.0, 2.0),
            leadlen=0.5,
            pinlblsize=11,
        )
        .right()
        .anchor("vin")
        .at(drawing.here)
        .label("Arm\nmotor board", loc="center", ofst=0)
    )
    # Join the board's top lead to the wire that arrives at the same point.
    assert abs(board.vin[1] - supply.end[1]) < 1e-6, board.vin
    assert abs(board.gnd[1] - supply.start[1]) < 1e-6, board.gnd

    # Return wire.
    drawing += elm.Line().left().at(board.gnd).tox(supply.start)
    drawing += elm.Ground().at(supply.start)
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
