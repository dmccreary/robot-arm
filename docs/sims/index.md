# MicroSims

MicroSims are small, interactive educational simulations — each one focused on
a single concept. They live under `docs/sims/<sim-name>/` and are embedded
into chapters via iframes.

New MicroSims can be created with the `microsim-generator` skill, which routes
to the appropriate library (p5.js, Chart.js, vis-network, Mermaid, Leaflet,
Plotly, Venn.js).

## Catalog

<div class="grid cards" markdown>

- **[Hobby PWM Servo vs. Serial Bus Servo](pwm-vs-bus-servos/index.md)**

    [![Hobby PWM Servo vs. Serial Bus Servo](pwm-vs-bus-servos/pwm-vs-bus-servos.png)](pwm-vs-bus-servos/index.md)

    Why an MG995 hobby servo cannot replace the STS3215 bus servos in an
    SO-ARM100/101: command and readback, leader/follower, and wiring.
    Used in [Appendix A](../appendices/pwm-servos/index.md).

</div>

<!-- Add new MicroSims to the catalog as they are built. -->

