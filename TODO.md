# TODO

Observations from generating Chapters 3 to 6, written down so they are not lost. The first
section lists skills that would have saved work, the second lists facts that still need a human
check, and the third lists what is not built yet.

## Skill opportunities

1. **circuit-sim-generator** (Schemdraw schematic plus an animated-current p5.js MicroSim).
   Chapters 3 and 5 now have five sims (`ohms-law-explorer`, `wire-voltage-drop-explorer`,
   `protected-power-path`, `common-ground-loop`, `h-bridge-current-paths`) that share
   `circuit-lib.js` (symbols plus conventional-current dots whose speed follows the current).
   The library is copied into each sim folder, so a fix has to be copied five times. A skill
   would hold one canonical `circuit-lib.js`, a test for it (like
   `robot-arm-lib.test.js`), and the rules learned the hard way: set `.right()` on
   Schemdraw `Ic` boxes, use `elm.Label` for labels, keep dots out of meters with zones, and
   drop secondary info-panel lines on narrow screens.
2. **predict-commit-sim-generator**. Twelve sims in Chapters 3 to 6 follow one pattern:
   a fixed list of items, the learner commits an answer before the reveal, a one-sentence
   "Why" is the feedback, mastery is n of m, and an Explore mode unlocks afterwards. The
   specification blocks already hold the items in tables. A generator that reads those tables
   and emits the p5.js file, `index.md` and `metadata.json` would build most of the 15
   unbuilt sims from their own specs. The `index.md`/`metadata.json` step is currently a
   throwaway Python script in the session; it belongs in `microsim-utils`.
3. **spec-lint**. Every chapter run needs the same check on each `<details>` specification:
   Bloom verb is on the canonical list for its level, `Type` and `Library` are valid, no
   "for example/such as/etc.", no pixel or color words, every count in the prose matches the
   Content table, and the numbers in Chapter Anchors appear in the prose. This was done with
   an ad-hoc script each time. It should be a script in the chapter-content-generator skill.
4. **chapter-lab-verifier**. Each lab was written, then run in a scratch `arm-lab` project to
   capture real output. The labs are cumulative (Chapter 6 edits files from Chapters 4 and 5),
   so a verifier should extract the code fences in order, build the project, run each script,
   and diff the output against the `text` blocks pasted in the chapter. It would also catch
   a later chapter that depends on an edit the reader was never told to make.
5. **fact-registry** (source, date, and value for every spec and price). Specs and prices
   came from several web pages, and some disagree (see below). A small `facts.csv` with
   claim, value, source URL, date checked and chapters that use it, plus a script that lists
   the claims older than N days, would make the "fact-check specifications" habit of Chapter 6
   a practice of the book itself. It could also take the price lines out of
   `docs/procurement-notes.md`.
6. **sim-narrow-screen-tester**. Info-panel text overflowed at 375 px in four of five circuit
   sims and was only found by hand. A skill that drives the built-in browser through each sim
   in Predict and Explore modes at 375 px and 800 px, screenshots the result, and flags canvas
   text that falls outside the panel would catch this. The tester must wait for the mkdocs
   rebuild and bypass the script cache (`fetch(file, {cache: 'reload'})`).
7. **serial-protocol-sims** (packet builder, hex dump, checksum, CAN frame arbitration). Chapter 4
   specifies five protocol sims with the same widgets (a byte row, field labels, a checksum
   walk-through). One shared library would serve them and the Chapter 8 and 9 setup labs.
8. **lerobot-api-snapshot**. The chapters quote LeRobot names (`FeetechMotorsBus`,
   `broadcast_ping`, `enable_torque`, `max_relative_target`, the register tables). A skill
   could fetch a pinned commit, extract those names and tables, and write them to
   `docs/learning-graph/` or a data file, so the chapters can be re-checked when LeRobot
   changes.
9. **procurement-to-csv**. `docs/procurement-notes.md` holds the real order. A script that turns
   its tables into the CSV files used by the Chapter 6 lab would keep the book and the notes
   in step.

## Facts to check by a human

- **Chapter 3 states a 5 V supply for the SO-ARM101** (from the SO-ARM100 README's parts list).
  Retail listings of the Waveshare Bus Servo Adapter (A), the likely "Motor Control Board",
  give the supply range as 9 to 12.6 V on one page and 6 to 12 V on another. Check which
  board is in the BOM and what supply it accepts, and fix Chapters 3, 4 and 6 if needed.
- **DM4310 torque.** Chapter 5 uses Seeed's wiki values (rated 3 N·m, peak 7 N·m). One
  reseller listing of the DM-J4310-2EC V1.2 gives 3.5 and 12.5 N·m. Chapter 6 mentions the
  conflict as an example of fact-checking, but the right value for the B601-DM needs a
  primary source.
- **The 13-servo Pro kit** and the $247 deal price came from retail and deal-site listings, not
  the project's own page. Chapter 6 mentions only the 13 servos. Confirm against the listing
  that was purchased.
- **Chapter 4, step 7 (real servo bus) was not run on hardware.** `find_port.py` and
  `read_servo.py` use the documented protocol, but the adapter echo behavior and the reply sizes
  are unverified. The python-can SocketCAN snippet was also not run on a real adapter.
- **Chapter 5 speed-limit register.** The text says the STS3215's speed value limits motion
  toward a goal in position mode and tells the reader to check the manual and test unloaded.
  Confirm against the Feetech manual.
- **Chapter 5 gear-ratio example** assumes the 0.238 s per 60 degrees figure applies to the
  1/345 version. The text says so, but the datasheet should settle it.
- **Wire-gauge teaching limits** (2 to 15 A) are conservative values chosen to sit at or below
  the 60 °C NEC ampacity column as shown in Wikipedia's AWG article. Verify against the table.

### Also unverified (taken from secondary sources)

Each of these is stated in a chapter as fact but came from a retailer page, a wiki, a search
summary, or my own inference, and not from the maker's primary document. Prices and specs were
all read on 2026-10-07.

**Chapter 3**

- **STS3215 electrical figures** (stall current 2.0 A and no-load current 0.15 A at 6 V, stall
  torque 16.5 kg·cm at 6 V and 19.5 kg·cm at 7.4 V, "operating voltage 6 to 7.4 V") come from a
  seller's data sheet. Confirm against Feetech's own STS3215 datasheet. Chapters 3 and 5 use them.
- **The 12 V motor option** (30 kg·cm, needs a 12 V supply of 5 A or more) is from the
  SO-ARM100 README; the 5 V supply's current rating is not stated anywhere I could find.
- **Connector ratings**: XT30 "about 15 A" and XT60 "much more" are from vendor listings, and
  the 5.5 × 2.1 mm barrel jack's centre-positive convention is stated as a convention only.
- **ISO 13850 description** (red mushroom or palm button on a yellow background, latching) was
  taken from web summaries of the standard, not from the standard.
- **The 40 N gripper-pinch estimate** is an illustrative upper bound that assumes a 4 cm
  finger. Replace it with a measurement or a jaw length from the real SO-ARM101 gripper.

**Chapter 4**

- **8N1 framing** is assumed for the Feetech bus. Confirm the data bits, parity and stop bits in
  the STS manual.
- **Factory defaults**: baud rate 1,000,000 (from LeRobot's `DEFAULT_BAUDRATE`) and ID 1 (from
  the LeRobot setup text). Confirm for the motors that actually ship in the kit.
- **Velocity sign bit**: bit 15 as the sign bit for `Present_Velocity` is inferred from
  LeRobot's "15 bits" sign-magnitude table. Check against a real reading.
- **Waveshare jumpers on channel B** are from the LeRobot documentation. Check the board's own
  manual for the board in the kit.
- **Damiao enable and disable frames** (`FF FF FF FF FF FF FF FC` and `...FD`), the CAN ID and
  Master ID defaults (`0x01` and `0x11`), and the timeout-protection behavior come from Seeed's
  wiki and web summaries. The feedback-frame layout is not given in the chapter; add it from
  the Damiao manual. Confirm the 1 Mbps bit rate and the timeout default.
- **CAN frame length** (about 110 to 135 bits for 8 data bytes) and the resulting 500 to 600
  cycles per second are my own estimate. Verify against the CAN specification, or remove.
- **python-can interface names** (`socketcan`, `virtual`) are right for the library, but which
  interface the reBot's CAN-USB board needs on macOS and Windows is not stated.

**Chapter 5**

- **STS3215 register details**: the `Present_Load` unit and its 10-bit magnitude, the
  `Present_Current` unit of 6.5 mA, the `Torque_Limit` unit of 0.1 percent, and the P, I and D
  registers at addresses 21 to 23 (order Kp, Kd, Ki) come from the Feetech memory-table analysis
  on a third-party wiki and from LeRobot's tables. Confirm against the Feetech manual.
- **The 3 Ω winding resistance** of the STS3215 is inferred from stall current at 6 V (6 V
  divided by 2.0 A), not measured. The chapter calls it an illustration; measure one motor.
- **Damiao supply ranges** (24 V with 15 to 32 V, 48 V with 15 to 52 V) are from Seeed's wiki.
- **RobStride RS00 and RS06 torques** (5 and 14 N·m, 11 and 36 N·m) and "FOC drive, integrated"
  come from a retailer's blog post. Confirm against RobStride's documentation.
- **Dual 16-bit encoders on the Damiao motors** come from a reseller listing.
- **MIT-mode control law** is stated as the standard form; check it against the Damiao manual
  for the DM4310 and DM4340P.
- **Hobby-servo PWM numbers** (50 Hz, 1 to 2 ms) are standard but came from a web search
  summary. Appendix A should already agree; check that the two chapters use the same figures.

**Chapter 6**

- **All prices** are as of 2026-10-07: the SO-ARM100 bill of materials ($13.89 servo, $229.88
  and $121.94 totals), the reBot B601-DM and B601-RS bills of materials, and the ~€1,120
  starting price from a CNX Software article. They will drift. Re-check before publishing.
- **The B601-DM motor, board and supply lines** I read are a summary of a longer bill of
  materials that also lists fasteners and cables without prices. The chapter's "about $1,200 to
  $1,500" range is my sum of the priced lines plus the repository's $50 and $250 estimates.
  Add up the full list.
- **The vendor list** (Seeed Studio, WowRobo, Robonine, PartaBot, ForgeMotion Labs, RoboSEasy,
  Autodiscovery) is from the SO-ARM100 README. Vendors come and go.
- **`Model_Number` at address 3 reading 777 for the STS3215** is from LeRobot's tables. Read it
  from a real servo to confirm, and record what a 12 V STS3215 reports, if you have one.
- **Shipping and tax figures** for the project's own order come from `procurement-notes.md`.
  The explanation of the Minnesota and Colorado retail delivery fee is in those notes and was
  not independently checked.

## Not built yet

- Chapter 3: `power-budget-sizer`, `workcell-hazard-spotter`, `safe-power-up-sequencer`
- Chapter 4: `uart-frame-timeline`, `packet-checksum-calculator`, `status-packet-decoder`,
  `bus-fault-finder`, `can-termination-meter`
- Chapter 5: `gear-ratio-explorer`, `encoder-resolution-reader`, `actuator-type-matcher`,
  `pid-step-response`, `joint-limit-chooser`
- Chapter 6: `landed-cost-calculator`, `sourcing-listing-checker`
- Social-preview PNGs for the five built circuit sims (Chapters 3 and 5), named in each sim's
  `index.md`.
- Chapters 4 to 6 are generated but not committed or deployed.
