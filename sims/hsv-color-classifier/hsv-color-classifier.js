// HSV Color Classifier - p5.js MicroSim
// CANVAS_HEIGHT: 650
// Learning objective (Understand, classify): classify eight pixels given as OpenCV HSV values as red, green,
// blue, or none of the three, according to the thresholds of the chapter, with at least 7 of 8 correct on the
// first attempt. Evidence: the class committed for each pixel. Explore mode is exploration, not evidence.
// Rule (OpenCV scale: hue 0 to 179, saturation and value 0 to 255): every range needs saturation >= 120 and
// value >= 70. Red is hue 0 to 10 or 170 to 179, green is hue 45 to 75, and blue is hue 100 to 130.
// MicroSim template version 2026.03

let containerWidth;
let canvasWidth = 400;
let drawHeight = 495;
let controlHeight = 155;          // 4 rows x 35 + 10 = 150, rounded up
let canvasHeight = drawHeight + controlHeight;
let containerHeight = canvasHeight;
let defaultTextSize = 16;
let narrow = false;

const TITLE = 'HSV Color Classifier';
const DESCRIPTION = 'A color swatch for one pixel above three strips: a hue strip from 0 to 179 with the red, ' +
  'green and blue ranges marked, a saturation strip with its minimum of 120, and a value strip with its ' +
  'minimum of 70. In Explore mode three sliders set the pixel. In the quiz the learner classifies eight pixels ' +
  'as red, green, blue or none of the three.';
const QUIZ_LABEL = 'Eight pixels';
const NOUN = 'pixel';
const MASTERY = 7;
const WRONG_LEAD = 'This pixel is: ';
const ASK_HINT = 'Check all three numbers against the ranges on the strips: the hue, then the saturation, then the value.';
const CHOICES = ['Red', 'Green', 'Blue', 'None of the three'];

const S_MIN = 120, V_MIN = 70;
// hue ranges on OpenCV's 0 to 179 scale. Red wraps around 0, so it has two ranges.
const HUE_RANGES = [
  { name: 'red', lo: 0, hi: 10, cls: 0 }, { name: 'green', lo: 45, hi: 75, cls: 1 },
  { name: 'blue', lo: 100, hi: 130, cls: 2 }, { name: 'red', lo: 170, hi: 179, cls: 0 }
];

// the eight pixels, in the chapter's fixed order. answer is an index into CHOICES.
const ITEMS = [
  { h: 5, s: 200, v: 200, answer: 0, why: 'Hue 5 is in 0 to 10, and saturation and value are high enough.' },
  { h: 175, s: 180, v: 150, answer: 0, why: 'Hue 175 is in 170 to 179, the part of red that wraps around.' },
  { h: 60, s: 255, v: 255, answer: 1, why: 'Hue 60 is inside 45 to 75.' },
  { h: 120, s: 200, v: 100, answer: 2, why: 'Hue 120 is inside 100 to 130, and value 100 is at least 70.' },
  { h: 30, s: 255, v: 255, answer: 3, why: 'Hue 30 is yellow, which none of the three ranges contains.' },
  { h: 60, s: 40, v: 200, answer: 3, why: 'Saturation 40 is below 120: a pale, grayish pixel with a green hue.' },
  { h: 0, s: 255, v: 30, answer: 3, why: 'Value 30 is below 70: too dark to tell the color.' },
  { h: 110, s: 130, v: 90, answer: 2, why: 'Hue 110 is in range, and saturation 130 and value 90 are above the minimums.' }
];

let hSlider, sSlider, vSlider;

// the hue range that contains h, or null
function hueRange(h) {
  return HUE_RANGES.find(g => h >= g.lo && h <= g.hi) || null;
}

// the class of a pixel: an index into CHOICES
function classify(h, s, v) {
  const g = hueRange(h);
  return (g && s >= S_MIN && v >= V_MIN) ? g.cls : 3;
}

// OpenCV HSV (hue 0 to 179, saturation and value 0 to 255) to red, green and blue (0 to 255)
function hsvToRgb(h, s, v) {
  const sector = (h * 2) / 60;                 // OpenCV stores half of the usual 0 to 360 degrees
  const c = (v / 255) * (s / 255);
  const x = c * (1 - Math.abs(sector % 2 - 1));
  const m = v / 255 - c;
  let rgb;
  if (sector < 1) rgb = [c, x, 0];
  else if (sector < 2) rgb = [x, c, 0];
  else if (sector < 3) rgb = [0, c, x];
  else if (sector < 4) rgb = [0, x, c];
  else if (sector < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map(u => Math.round((u + m) * 255));
}

function promptText(it) {
  return 'A pixel has (H, S, V) = (' + it.h + ', ' + it.s + ', ' + it.v + '). Which class is it?';
}

// ---------------------------------------------------------------------------
// Answer controls: one button for each choice. Pressing a button commits it.
// ---------------------------------------------------------------------------
let choiceBtns = [];

function createAnswerControls() {
  choiceBtns = CHOICES.map((label, i) => {
    const b = createButton(label);
    b.mouseClicked(() => onCommit(i));
    return b;
  });
}

function isRight(it, answer) { return answer === it.answer; }
function answerText(it) { return CHOICES[it.answer]; }
function askNote() { return narrow ? '' : ASK_HINT; }
function feedbackExtra() { return ''; }
function resetAnswerControls() {}
function drawAnswerLabels() {}

function showAnswerControls(show) {
  choiceBtns.forEach(b => (show ? b.show() : b.hide()));
}

function enableAnswerControls(on) {
  choiceBtns.forEach(b => setEnabled(b, on));
}

// the buttons flow from left to right and wrap onto a new row when the canvas is narrow
function layoutAnswerControls() {
  let x = 10, row = 1;
  choiceBtns.forEach(b => {
    const w = widthOf(b);
    if (x > 10 && x + w > canvasWidth - 10) { x = 10; row++; }
    b.position(x, drawHeight + ROW1 + row * ROW_H);
    x += w + 8;
  });
}

// ===========================================================================
// Quiz engine: fixed order, one attempt per item, feedback after every commit
// ===========================================================================
let modeSelect, nextBtn;
let mode = 'explore';          // 'explore' or 'quiz'
let phase = 'ask';             // in the quiz: 'ask', 'feedback' or 'done'
let idx = 0;                   // which item is shown
let correctCount = 0;
let lastRight = false;
let lastAnswer = null;
let missed = [];               // item numbers answered wrongly
let textOverflow = false;      // true when a text block runs past its panel (read by the layout test)

const ROW1 = 8, ROW_H = 35;    // control rows start 8 px below the drawing and are 35 px apart

function setup() {
  updateCanvasSize(); // must be first
  const canvas = createCanvas(containerWidth, containerHeight);
  canvas.parent(document.querySelector('main'));
  textSize(defaultTextSize);

  // every control is created here, before layoutControls() positions any of them
  modeSelect = createSelect();
  modeSelect.option('Explore', 'explore');
  modeSelect.option(QUIZ_LABEL, 'quiz');
  modeSelect.selected('explore');
  modeSelect.attribute('aria-label', 'Mode');
  modeSelect.changed(() => setMode(modeSelect.value()));
  nextBtn = createButton('Next');
  nextBtn.mouseClicked(onNext);
  createAnswerControls();
  createExploreControls();

  setMode('explore');
  describe(DESCRIPTION);
}

function draw() {
  updateCanvasSize();
  fill('aliceblue'); stroke('silver'); strokeWeight(1);
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);
  txt(TITLE, canvasWidth / 2, 8, 'black', CENTER, TOP, narrow ? 20 : 24, true);

  textOverflow = false;
  if (mode === 'explore') drawExplore(); else drawQuiz();
  if (mode === 'explore') drawExploreLabels(); else drawAnswerLabels();
}

function setMode(m) {
  mode = m;
  refreshControls();
}

// the learner commits one answer for the item that is shown
function onCommit(answer) {
  if (mode !== 'quiz' || phase !== 'ask') return;
  lastAnswer = answer;
  lastRight = isRight(ITEMS[idx], answer);
  if (lastRight) correctCount++; else missed.push(idx + 1);
  phase = 'feedback';
  refreshControls();
}

function onNext() {
  if (mode !== 'quiz') return;
  if (phase === 'feedback') {
    if (idx < ITEMS.length - 1) { idx++; phase = 'ask'; } else { phase = 'done'; }
  } else if (phase === 'done') {
    idx = 0; correctCount = 0; missed = []; phase = 'ask';
  }
  resetAnswerControls();
  refreshControls();
}

function refreshControls() {
  const quiz = mode === 'quiz';
  showExploreControls(!quiz);
  showAnswerControls(quiz && phase !== 'done');
  enableAnswerControls(phase === 'ask');
  if (quiz) nextBtn.show(); else nextBtn.hide();
  setEnabled(nextBtn, phase !== 'ask');
  nextBtn.html(phase === 'done' ? 'Try again' : (idx === ITEMS.length - 1 ? 'See score' : 'Next ' + NOUN));
  layoutControls();
}

function layoutControls() {
  modeSelect.position(10, drawHeight + ROW1);
  modeSelect.size(narrow ? 150 : 180);
  nextBtn.position(canvasWidth - widthOf(nextBtn) - 10, drawHeight + ROW1);
  layoutAnswerControls();
  layoutExploreControls();
}

// the width of a control, measured at the left edge so that the edge of the page cannot squeeze it
function widthOf(el) {
  el.position(0, drawHeight + ROW1);
  return el.elt.offsetWidth || 90;
}

function setEnabled(el, on) {
  if (on) el.removeAttribute('disabled'); else el.attribute('disabled', '');
}

function feedbackText(it) {
  const lead = lastRight ? 'Correct: ' + answerText(it) + '. ' : 'Not quite. ' + WRONG_LEAD + answerText(it) + '. ';
  return lead + it.why;
}

// The quiz text: the count, the question, and then a hint or the feedback. r is the panel rectangle.
function drawQuizPanel(r) {
  panelBox(r);
  const x = r.x + 10, w = r.w - 20, n = ITEMS.length;
  let y = r.y + 8;
  if (phase === 'done') {
    const ok = correctCount >= MASTERY;
    y = para('Correct: ' + correctCount + ' of ' + n, x, y, w, 'black', 18, true);
    y = para(ok ? 'Mastery reached.' : 'Mastery is ' + MASTERY + ' of ' + n + '. Press Try again.', x, y + 4, w,
      ok ? 'darkgreen' : 'firebrick', 18, true);
    y = para(missed.length ? 'Missed: ' + NOUN + ' ' + missed.join(', ') + '.' : 'Nothing missed.', x, y + 4, w);
    y = para('Switch to Explore to keep experimenting.', x, y + 4, w);
    fits(y, r);
    return;
  }
  const it = ITEMS[idx];
  const head = NOUN.charAt(0).toUpperCase() + NOUN.slice(1) + ' ' + (idx + 1) + ' of ' + n;
  y = para(head + '     Correct: ' + correctCount + ' of ' + n, x, y, w, 'black', 16, true);
  y = para(promptText(it), x, y + 4, w);
  if (phase === 'ask') {
    const note = askNote();
    if (note) y = para(note, x, y + 4, w, 'dimgray');
  } else {
    y = para(feedbackText(it) + feedbackExtra(), x, y + 4, w, lastRight ? 'darkgreen' : 'firebrick');
  }
  fits(y, r);
}

// ---------------------------------------------------------------------------
// Text helpers and resize
// ---------------------------------------------------------------------------
function panelBox(r) {
  fill(255, 255, 255, 235); stroke(200); strokeWeight(1);
  rect(r.x, r.y, r.w, r.h, 10);
}

function txt(str, x, y, col, hAlign, vAlign, size, bold) {
  noStroke();
  fill(col || 'black');
  textAlign(hAlign || LEFT, vAlign || CENTER);
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  text(str, x, y);
  textStyle(NORMAL);
}

// splits a string into lines no wider than maxW pixels
function wrapLines(str, maxW, size, bold) {
  textSize(size || defaultTextSize);
  textStyle(bold ? BOLD : NORMAL);
  const out = [];
  String(str).split('\n').forEach(part => {
    let line = '';
    part.split(' ').forEach(word => {
      const trial = line ? line + ' ' + word : word;
      if (line && textWidth(trial) > maxW) { out.push(line); line = word; } else { line = trial; }
    });
    out.push(line);
  });
  textStyle(NORMAL);
  return out;
}

// draws a wrapped paragraph with its top at y and returns the y just below it
function para(str, x, y, w, col, size, bold) {
  size = size || defaultTextSize;
  const lineHeight = Math.round(size * 1.3);
  wrapLines(str, w, size, bold).forEach(ln => { txt(ln, x, y, col, LEFT, TOP, size, bold); y += lineHeight; });
  return y;
}

// records a text block that ran past the bottom of its panel
function fits(y, r) {
  if (y > r.y + r.h - 2) textOverflow = true;
}

// the drawing is split into a picture and a text panel: side by side when wide, stacked when narrow
function splitRegions(pictureFraction, narrowPictureHeight) {
  const top = 40, bottom = drawHeight - 8;
  if (narrow) {
    const py = top + narrowPictureHeight + 4;
    return { pic: { x: 0, y: top, w: canvasWidth, h: narrowPictureHeight },
             panel: { x: 8, y: py, w: canvasWidth - 16, h: bottom - py } };
  }
  const pw = Math.floor(canvasWidth * pictureFraction);
  return { pic: { x: 0, y: top, w: pw, h: drawHeight - top },
           panel: { x: pw + 8, y: top + 4, w: canvasWidth - pw - 16, h: bottom - top - 4 } };
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(containerWidth, containerHeight);
  layoutControls();
}

function updateCanvasSize() {
  const container = document.querySelector('main').getBoundingClientRect();
  containerWidth = Math.floor(container.width);
  canvasWidth = containerWidth;
  narrow = canvasWidth < 640;
}

// ---------------------------------------------------------------------------
// Explore controls
// ---------------------------------------------------------------------------
function createExploreControls() {
  hSlider = createSlider(0, 179, 60, 1);
  hSlider.attribute('aria-label', 'Hue, 0 to 179');
  sSlider = createSlider(0, 255, 255, 1);
  sSlider.attribute('aria-label', 'Saturation, 0 to 255');
  vSlider = createSlider(0, 255, 255, 1);
  vSlider.attribute('aria-label', 'Value, 0 to 255');
}

function showExploreControls(show) {
  [hSlider, sSlider, vSlider].forEach(s => (show ? s.show() : s.hide()));
}

function layoutExploreControls() {
  const labelW = 140;
  const w = max(60, canvasWidth - labelW - 25);
  [hSlider, sSlider, vSlider].forEach((s, i) => {
    s.position(labelW, drawHeight + ROW1 + (i + 1) * ROW_H);
    s.size(w);
  });
}

function drawExploreLabels() {
  txt('Hue: ' + hSlider.value(), 10, drawHeight + ROW1 + ROW_H + 11);
  txt('Saturation: ' + sSlider.value(), 10, drawHeight + ROW1 + 2 * ROW_H + 11);
  txt('Value: ' + vSlider.value(), 10, drawHeight + ROW1 + 3 * ROW_H + 11);
}

// ---------------------------------------------------------------------------
// The two views
// ---------------------------------------------------------------------------
function drawExplore() {
  const sp = splitRegions(0.55, 272);
  const h = hSlider.value(), s = sSlider.value(), v = vSlider.value();
  drawPixelPicture(sp.pic, h, s, v, true);

  const r = sp.panel;
  panelBox(r);
  const x = r.x + 10, w = r.w - 20;
  const g = hueRange(h);
  let y = r.y + 8;
  y = para('Class: ' + CHOICES[classify(h, s, v)], x, y, w, 'black', 18, true);
  y = para(g ? 'Hue ' + h + ' is in the ' + g.name + ' range, ' + g.lo + ' to ' + g.hi + '.'
    : 'Hue ' + h + ' is in none of the three ranges.', x, y + 4, w);
  y = para(s >= S_MIN ? 'Saturation ' + s + ' is at least 120: strong enough.'
    : 'Saturation ' + s + ' is below 120: too pale.', x, y + 2, w);
  y = para(v >= V_MIN ? 'Value ' + v + ' is at least 70: bright enough.'
    : 'Value ' + v + ' is below 70: too dark.', x, y + 2, w);
  if (!narrow) {
    y = para('A pixel is red, green or blue only when all three checks pass.', x, y + 8, w);
    y = para('Slide the hue from 5 up to 175. You pass through colors that are not red, and then red comes ' +
      'back: red wraps around. Then lower the saturation and watch every hue turn gray.', x, y + 8, w, 'dimgray');
  }
  fits(y, r);
}

function drawQuiz() {
  const sp = splitRegions(0.55, 272);
  if (phase === 'done') {
    drawPixelPicture(sp.pic, 60, 255, 255, false);
  } else {
    // the markers show where the pixel falls, so they appear only after the learner has committed
    const it = ITEMS[idx];
    drawPixelPicture(sp.pic, it.h, it.s, it.v, phase === 'feedback');
  }
  drawQuizPanel(sp.panel);
}

// ---------------------------------------------------------------------------
// The picture: a swatch of the pixel and the three strips with their ranges
// ---------------------------------------------------------------------------
function drawPixelPicture(r, h, s, v, showMarkers) {
  const x = r.x + 12, w = r.w - 24;
  const roomy = !narrow;
  const sw = roomy ? 150 : 96, sh = roomy ? 96 : 58;
  let y = r.y + (roomy ? 16 : 4);

  // the swatch
  const rgb = hsvToRgb(h, s, v);
  fill(rgb[0], rgb[1], rgb[2]); stroke('#212121'); strokeWeight(2);
  rect(x, y, sw, sh, 6);
  txt('One pixel', x + sw + 14, y + sh / 2 - 22, 'dimgray', LEFT, CENTER);
  txt('H = ' + h + ',  S = ' + s + ',  V = ' + v, x + sw + 14, y + sh / 2, 'black', LEFT, CENTER, 16, true);
  txt('OpenCV HSV', x + sw + 14, y + sh / 2 + 22, 'dimgray', LEFT, CENTER);
  y += sh + (roomy ? 26 : 8);

  // hue: green and blue are labelled above the strip, and the two red ranges below it, one at each end
  const barH = 20, at = (val, top) => x + (val / top) * w;
  txt('Hue', x, y + 10, 'black', LEFT, CENTER, 16, true);
  HUE_RANGES.filter(g => g.cls !== 0).forEach(g => {
    txt(g.name + ' ' + g.lo + '–' + g.hi, (at(g.lo, 179) + at(g.hi, 179)) / 2, y + 10, 'black', CENTER, CENTER);
  });
  y += 26;
  noStroke();
  for (let i = 0; i < 180; i++) {
    const c = hsvToRgb(i, 255, 255);
    fill(c[0], c[1], c[2]);
    rect(x + (i / 180) * w, y, w / 180 + 1, barH);
  }
  HUE_RANGES.forEach(g => rail(at(g.lo, 179), at(g.hi, 179), g.cls === 0 ? y + barH + 4 : y - 4));
  if (showMarkers) marker(at(h, 179), y, barH);
  y += barH + 8;
  txt('red 0–10', x, y + 9, 'black', LEFT, CENTER);
  txt('red 170–179', x + w, y + 9, 'black', RIGHT, CENTER);
  y += roomy ? 42 : 24;

  // saturation and value: the rail above each strip covers the part that is high enough
  [['Saturation', S_MIN, s, i => hsvToRgb(h, i, 255)], ['Value', V_MIN, v, i => hsvToRgb(h, 255, i)]].forEach(row => {
    txt(row[0], x, y + 10, 'black', LEFT, CENTER, 16, true);
    txt(row[1] + ' or more', (at(row[1], 255) + x + w) / 2, y + 10, 'black', CENTER, CENTER);
    y += 26;
    noStroke();
    for (let i = 0; i < 64; i++) {
      const c = row[3](i * 4 + 2);
      fill(c[0], c[1], c[2]);
      rect(x + (i / 64) * w, y, w / 64 + 1, barH);
    }
    noFill(); stroke('#616161'); strokeWeight(1);
    rect(x, y, w, barH);
    rail(at(row[1], 255), x + w, y - 4);
    if (showMarkers) marker(at(row[2], 255), y, barH);
    y += barH + (roomy ? 30 : 10);
  });
  fits(y - 10, r);
}

// a black rail with end ticks that marks a range beside a strip
function rail(x1, x2, y) {
  stroke('black'); strokeWeight(3);
  line(x1, y, x2, y);
  strokeWeight(2);
  line(x1, y - 4, x1, y + 4);
  line(x2, y - 4, x2, y + 4);
}

// a marker across a strip at x: a black bar with a white edge, so it shows on any color
function marker(x, y, barH) {
  stroke('white'); strokeWeight(7);
  line(x, y - 5, x, y + barH + 5);
  stroke('black'); strokeWeight(3);
  line(x, y - 5, x, y + barH + 5);
}
