# Cover Image Prompt

Please generate a professional-quality cover image for this textbook.
This image will be used in social media previews and must follow the
formatting guidelines for an Open Graph image preview.

**Required specifications:**
- Format: PNG
- Wide-landscape format
- Size: 1200x630 pixels (1.91:1 aspect ratio)
- This is the Open Graph standard for social media previews

The image has four layers, back to front: background montage, color
treatment, mascot, and title text.

## Subject & Tone

*Controlling a Robot Arm* is a Python programming book that happens to move a
real robot. Readers source parts, 3D-print and build low-cost desktop robot
arms (the open-source SO-ARM100/SO-ARM101 and the Seeed Studio reBot-DevArm),
calibrate them, program them with Python, teach them by demonstration, and
finally connect them to AI agents. The intended audience is students aged 12
and up, makers, and self-taught roboticists who know basic Python. The visual
tone should be **modern, hands-on, and approachable**: a bright maker-lab
feeling with a touch of technical blueprint, energetic but not intimidating.

## Title

Place **Controlling a Robot Arm** in the center of the image, in a clean,
highly legible sans-serif font. Use a light/white font color with a subtle
drop shadow or dark indigo scrim behind it so it stays readable against the
busy montage background. Keep the title large; do not shrink it to fit —
instead simplify the background directly behind the text. Optionally add the
small subtitle line "Source, Build and Control" beneath it in a smaller
weight.

## Background Montage

Arrange a montage of the following 8 concepts around the title, each rendered
in a consistent flat-vector illustration style (see Style below) so the
composition reads as one image rather than a collage of unrelated styles:

1. **SO-ARM101 follower arm** — a 3D-printed six-joint desktop robot arm in
   white/light-gray plastic with dark servo motors at each joint and a
   two-finger gripper, reaching toward the viewer.
2. **Leader/follower pair** — two matching small arms side by side, the
   leader (with a handle) on the left and the follower on the right,
   mirroring the same pose, connected by a thin glowing line.
3. **Python code on a screen** — a laptop showing a few short, colorful lines
   of Python (`arm.move_to(...)`), with the Python-style blue and yellow
   accents; code lines should be abstract colored bars, not readable text.
4. **Two-link arm workspace diagram** — a top-down blueprint-style sketch of
   a two-link arm with a shaded circular arc showing its reachable workspace
   and angle markings at the joints.
5. **Serial bus servo (STS3215)** — a close-up of a small hobby servo with a
   daisy-chain cable running to the next servo, with tiny data-packet pulses
   traveling along the wire.
6. **Circuit and power path** — a simplified schematic fragment: a battery
   or power supply, a fuse, an emergency-stop button (red mushroom), and an
   H-bridge symbol, drawn as clean glowing traces.
7. **3D printer and printed parts** — a small FDM 3D printer in mid-print
   next to a few finished arm parts (links and joint brackets).
8. **AI agent speech bubble** — a chat bubble ("Pick up the red block")
   with a small circuit-brain icon, a dashed arrow leading to a gripper
   holding a small red cube; a camera/vision frame bracket around the cube.

## Mascot

Place the book's mascot, **Servo the Robot Arm**, in the lower-left corner,
sized so it does not overlap the title text. Servo is a compact, chibi-
proportioned robot with a round warm-orange head (hex #F57C00) and a soft
cream face screen (#FFF8E1) with two big round dark-navy eyes with white
highlights and a gentle, friendly smile. It has a short rounded orange torso
on a round indigo base disc (no legs), small indigo bolts on its joint caps,
and ONE long articulated arm made of two thick orange segments joined by
round indigo (#3F51B5) shoulder, elbow, and wrist caps, ending in a
two-finger parallel gripper that is waving hello or giving a thumbs-up. No
second arm, no legs, no clothing. Modern flat vector style with clean
dark-indigo outlines and soft simple shading. (Use the pose from
`docs/img/mascot/welcome.png` as a reference image if the tool accepts one.)

## Style & Composition

- Illustration style: **flat vector** with clean dark-indigo outlines and
  soft, simple shading — apply it to every montage element for consistency.
- Color palette: **deep indigo and navy** background tones (#3F51B5 family)
  with **warm orange** (#F57C00) accents and small touches of cream and
  Python yellow/blue. Orange should be the pop color, echoing the mascot.
- Lighting/mood: bright, optimistic, energetic; a subtle blueprint grid in
  the far background adds a technical feel.
- Composition: title centered, montage elements arranged in a loose ring
  around it (four across the top and bottom edges, one each at left and
  right of center), mascot in the lower-left, generous negative space
  immediately behind the title so it stays readable. Keep all key content
  at least 40 px from every edge so social-media crops do not cut it off.

## Avoid

- Do not render dense paragraphs of illegible text anywhere in the image.
  The only readable text should be the title (and optional subtitle); code
  and labels in the montage should be abstract bars or very short words.
- Avoid generic stock-photo cliches (handshakes, isolated lightbulbs, people
  pointing at whiteboards) and generic humanoid "terminator" robots. The
  robots here are small desktop arms, not humanoids.
- Avoid photorealistic human faces; if hands or people appear at all, keep
  them minimal and stylized.
- Do not give Servo a second arm, legs, or extra accessories — it must match
  the character description exactly.
- Do not let montage elements visually compete with or overlap the title.
