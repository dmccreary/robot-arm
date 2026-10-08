# TODO

Observations from generating Chapters 3 to 9, written down so they are not lost. The first
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

### Added while writing Chapters 7 to 9

10. **lab-assembler** (chapter template with `@@FILE path@@` and `@@RUN command@@` markers). For
    Chapters 7 to 9 each chapter was written as a template, and a 40-line script filled the
    markers: `FILE` pastes a lab file into a fence (python fences get `linenums="1"`), and `RUN`
    executes a command in the scratch lab project and pastes its real output. This removed
    the hand-copy step that caused mismatches in earlier chapters. It belongs with item 4
    (`chapter-lab-verifier`): the same tool can check an existing chapter by re-running every
    command and diffing the `text` blocks. It also needs a reference copy of the cumulative
    `arm-lab` (today it exists only in session scratch folders, and each chapter's lab begins
    by copying the previous ones).
11. **spec-lint script** (item 3 made concrete). A 30-line check over every `<details>` block
    caught three "such as" phrases in the Chapter 7 and 8 specs on the first run. It checks the
    Bloom verb against the level, `Library`, `Status`, the eleven required fields, and the
    forbidden words. It should be saved as `scripts/spec-lint.py` and run by the skill.
12. **Three sim families, not one.** The new specs fall into three shapes that a generator
    could template: pick-one cases (`tolerance-fit-explorer`, `print-defect-diagnoser`,
    `calibration-range-recorder`, `assembly-fault-finder`, `platform-chooser`), order-the-cards
    (`servo-id-setup-sequencer`, like Chapter 3's `safe-power-up-sequencer`), and type-a-number
    drills (`mit-frame-packer`, like `landed-cost-calculator` and `packet-checksum-calculator`).
    Item 2 (`predict-commit-sim-generator`) should become a family with these three templates.
    `multimeter-practice` is a fourth shape (set several controls, then commit).
13. **upstream-doc-drift-checker** (extends item 8). Between the older docs and the LeRobot
    commit read on 2026-10-07 (`ca69a20`), the SO-101 class moved from `so101_follower/` to
    `so_follower/`, `use_degrees` flipped from False to True, and Python 3.12 and the
    `core_scripts` extra became required. A skill should record, per chapter, the commit that
    each quoted command, class name and default was checked against, and re-run the checks when
    the upstream moves. The Chapter 8 text now names the version it was read against.
14. **fact-sheet-gatherer** (feeds item 5). The three research agents for these chapters each
    returned a fact sheet with every claim tagged primary, secondary, or unverified. That
    format is what produced the lists below, and it took the author out of the loop. It
    should be a skill that writes the same facts to `facts.csv` (claim, value, tag, URL, date)
    instead of prose. Two of the three agents stalled or ran for about 20 minutes, so the skill
    needs a time limit and a "write what you have" step.
15. **stl-and-gcode-inspector** (the Chapter 7 lab as a tool). `armlab/stl.py` and `gcode.py`
    read binary and ASCII STL (size, volume, bounding box, bed fit) and G-code (filament used).
    Used on the repository's four print plates, they found a real hazard: the Prusa-bed plate
    is 243.4 x 204.9 mm and fits a 205 x 250 mm bed by 0.1 mm, and does not fit an Ender bed.
    A classroom tool that checks every plate against a chosen printer would catch that before
    a failed print.
16. **calibration-file-linter** (Chapter 8 follow-on). Read a LeRobot calibration JSON and check
    it: six joints, ids 1 to 6, `range_min` below `range_max`, offsets within the 11-bit
    sign-magnitude limit of 2047, a wrist roll of 0 to 4095, and a "drift" check against a
    live reading at the middle pose. Chapters 10, 11 and 13 will all depend on a good file.
17. **can-frame-codec** (Chapters 4, 9 and 10). Chapter 9 hand-writes the Damiao MIT frame
    packer (`armlab/damiao.py`) and a pretend motor. Chapter 10's hardware library needs the
    same code for the DM motors and a different one for RobStride's 29-bit protocol. One shared
    codec, with a round-trip test (`pack` then `unpack` within one quantization step), should
    serve the labs, the sim `mit-frame-packer`, and Chapter 10.

## Facts to check by a human

- **Chapter 3 states a 5 V supply for the SO-ARM101** (from the SO-ARM100 README's parts list).
  Retail listings of the Waveshare Bus Servo Adapter (A), the likely "Motor Control Board",
  give the supply range as 9 to 12.6 V on one page and 6 to 12 V on another. Check which
  board is in the BOM and what supply it accepts, and fix Chapters 3, 4 and 6 if needed.
- **DM4310 torque.** Chapter 5 uses Seeed's wiki values (rated 3 N·m, peak 7 N·m). One
  reseller listing of the DM-J4310-2EC V1.2 gives 3.5 and 12.5 N·m. Chapter 6 mentions the
  conflict as an example of fact-checking, but the right value for the B601-DM needs a
  primary source.
- **The $247 deal price** came from a deal-site listing, not the project's own page. The listing
  that was purchased shows $258.94. An earlier draft of Chapter 6 said the kit has 13 servos,
  from a retail listing; the purchased listing's photograph and the author's count show 12, and
  Chapter 6 now says there is no spare servo.
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

- **The $350 SO-ARM101 total** is the $332.04 kit plus a $20-or-more allowance for printed parts, as
  the author specified. Replace the allowance with the real filament or print-service cost. The
  Chapter 6 budget also adds one spare servo at the BOM price of $13.89 (about $364 in all), with
  no shipping on the spare.
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

### Chapters 7 to 9: unverified facts

All read on 2026-10-07. Tags follow the research sheets: a claim from a primary document is
not listed. Everything here came from a retailer, a wiki, a search summary, or my own inference.

**Chapter 7**

- **Fastener totals.** "About two dozen M2 x 6 and about forty to fifty M3 x 6 per follower" is
  my own count of the LeRobot assembly text, which gives no totals. The thread type
  (self-tapping or machine) and what each servo bag contains are not stated anywhere I found.
  Count a real kit.
- **Print plates.** The size (243.4 x 204.9 x 87.0 mm), 96,584 triangles and volume of the
  Prusa follower plate were measured from the downloaded file, and the Ender plates are ASCII
  STL. The repository may change them. The per-arm quantity of each part is not published, and
  the README (15 percent) and the print-service instructions (20 percent) disagree on infill.
- **PLA and PETG numbers** (glass transition 60 to 65 and about 80 degrees C, nozzle and bed
  ranges, hot-car temperatures) come from vendor blogs and a search summary of Prusa's
  material table. The chapter tells readers to follow the spool label.
- **FDM tolerance** (about 0.1 to 0.3 mm) and **0.15 to 0.2 mm clearance** come from service
  providers' blogs. Measure the author's own printer with the repository's gauges.
- **Connector name.** Feetech's data sheet says "5264-3P"; one site calls it JST. The chapter
  uses 5264 and 2.54 mm pitch. The **KK-type crimp terminal figures** (22 to 30 AWG, strip about
  3 mm, about 4 A) come from distributor listings, not a Molex drawing.
- **Soldering iron range** (315 to 425 degrees C), the **printer-safety** advice and the
  **multimeter** rules are from university and vendor safety pages, not a standard.
- **Heat-set insert hole** (about 4 mm for an M3 insert) is from a retailer. The SO-101 does
  not use inserts.
- **PLA density** (1.24 g per cm cubed) and the illustrative **$20 per kg** filament price are
  typical values. Use the label and receipt of the real spool.

**Chapter 8**

- **Feetech protections** (torque off above 70 degrees C, overload at 80 percent of stall for 2 s,
  over-current above 2 A for 2 s, voltage outside 4 to 7.4 V) come from a machine-translated
  copy of the data sheet, dated 2020-04-10. The status-register bit meanings and the
  `Max_Temperature_Limit` default were not confirmed.
- **Waveshare board input range.** The Waveshare wiki says "9 to 12.6 V, must match servo
  voltage", the SO-ARM100 README says a 5 V supply for the 7.4 V motors. This is the same open
  question as the first item under Chapter 3, and Chapter 8 tells readers to use exactly the
  BOM's supply. A person must settle it.
- **Calibration file path.** The folder name (`so_follower` in current LeRobot, `so101_follower`
  in older versions) and the file format were derived from the source, not from a run on a
  machine. Run `lerobot-calibrate` once and replace the paragraph with what it prints.
- **Jitter** has no authoritative LeRobot source. The chapter lists the plausible causes and
  says to fix mechanical play first. The 60 degrees C pre-flight limit and the 2 degrees
  drift limit are my choices.
- **Real-fault reports** (the 16 V "12 V" adapter, the burnt gripper) are from LeRobot GitHub
  issues 3394 and 2819, which are single reports.
- **SO-101 release date** is not stated in the repository, so the chapter does not give one.
- **Open pull requests** (auto-calibration, gripper limits, udev rules) are not taught. Check
  them at the next revision.

**Chapter 9**

- **Damiao frame details.** The MIT packing, ranges, `PMAX`, `VMAX` and `TMAX` defaults, the
  feedback layout and the FC (enable) frame come from the Damiao Python library in Seeed's wiki.
  The **status nibble codes** and the **FD (disable) and set-zero** byte strings were not read
  in Damiao's protocol PDF. Chapter 9 does not teach the status codes or a set-zero frame, and
  Chapter 4's FD frame is still from the wiki only.
- **4340P speed limit.** The wiki table says 8 rad/s for the 48 V version and the library says
  10. The chapter tells readers to read the limit from the tool.
- **DM4310 torque.** Still unresolved. The catalogue (V1.1) gives 3 and 7 N m, resellers list
  the newer part at 3.5 and 12.5 N m, and Seeed's BOM says "V4". The chapter says the peak
  is unconfirmed. Chapter 5 still states 3 and 7 without the caveat.
- **RobStride** torque and protocol details were not re-verified. The only new RS facts used are
  from Seeed's wiki and BOM (motor counts, prices, the 48 V supply).
- **Quasi-direct drive** (low ratio, backdrivable, torque from current) is a general definition
  that no fetched source states. The ratios (10:1, 40:1) are from Damiao's catalogue.
- **Zeroing.** The set-zero procedure is only in Seeed's video and the MotorBridge Studio web
  tool, which I could not see. The chapter points readers to it and does not give steps.
- **No fuse, E-stop or reverse-polarity protection** appears in either BOM or wiki. The chapter
  says so and tells readers to add a fuse and an E-stop (Chapter 3 rules). Confirm with
  Seeed whether the production kit has any.
- **Prices.** The $1,387.35 sum is my addition of seven priced BOM lines. The $1,517.58 store
  bundle and the SO-ARM101 payload of about 0.5 kg came from retail pages and a search summary.
  The SO-ARM101's reach and weight were not found in the sources used, and the comparison
  table says so.
- **Voltage standards.** "Below 60 V DC" is from a secondary summary of IEC 62368-1.
- **Windows-only DM_Tools, Ubuntu 24.04, 921,600 baud** are from Seeed's wiki as of
  2026-09-23. A Linux or macOS tool may exist.
- **The decision-matrix scores** in `platform-chooser` are my judgments, labeled as such.

## Labs section: decisions needed

From `docs/labs/list-of-ideas.md` (53 candidate labs, none written yet). The answers decide
which labs get written and which parts go on the station kit.

1. **Which mini arm for Track E?** A laser-cut MG90S arm, a printed arm, or a purchased kit of
   about $25. Labs E1 to E8, H1, H3 and H7 depend on this choice.
2. **Can a Pico drive an STS3215 bus servo reliably?** The servo uses half-duplex TTL serial at
   up to 1 Mbaud. Confirm that a Pico plus an adapter board works before writing F6 and F7. If
   it does not, run those two labs from the laptop with `pyserial` instead.
3. **Keep or cut the CAN labs (F8 and F9)?** The Pico has no CAN controller, so they need two
   MCP2515 modules and terminators. They are the costliest and least reusable labs.
4. **Which Pico?** The list assumes the Pico 2 W. A plain Pico is about $4 cheaper and runs every
   lab except the Wi-Fi ones.
5. **Lab numbering.** Keep track letters (A to H), or number the labs in one global order like a
   course?
6. **Where do answers go?** Instructor guides are a separate section in this book and do not use
   the mascot. Decide whether lab answer keys live there or beside each lab.
7. **Verify the station kit prices.** The roughly $63 core and $170 full-add-on totals in the
   draft kit table are estimates, not quotes.
8. **Mermaid is not enabled** in `mkdocs.yml`, so the dependency map is a table. Turn on
   Mermaid support only if more diagrams will need it.

## Not built yet

- Chapter 3: `power-budget-sizer`, `workcell-hazard-spotter`, `safe-power-up-sequencer`
- Chapter 4: `uart-frame-timeline`, `packet-checksum-calculator`, `status-packet-decoder`,
  `bus-fault-finder`, `can-termination-meter`
- Chapter 5: `gear-ratio-explorer`, `encoder-resolution-reader`, `actuator-type-matcher`,
  `pid-step-response`, `joint-limit-chooser`
- Chapter 6: `landed-cost-calculator`, `sourcing-listing-checker`
- Chapter 7: `tolerance-fit-explorer`, `print-defect-diagnoser`, `multimeter-practice`
- Chapter 8: `servo-id-setup-sequencer`, `calibration-range-recorder`, `assembly-fault-finder`
- Chapter 9: `mit-frame-packer`, `platform-chooser`
- Social-preview PNGs for the five built circuit sims (Chapters 3 and 5), named in each sim's
  `index.md`.
- Chapters 7 to 9 are generated but not committed or deployed. Chapters 4 to 6 were committed
  in `314c316`, and it is not recorded whether they were deployed.
- `docs/labs/` is still untracked (the lab idea list, written before these chapters).
- Chapter 5's torque figures for the DM4310 should get the same caveat that Chapter 9 now has.
