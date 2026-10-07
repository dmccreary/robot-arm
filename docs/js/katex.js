// KaTeX auto-render configuration (currency-safe, backslash delimiters only).
// Neither $ nor $$ is a math delimiter, so prices like $20 or $1.99 stay text.
// Inline math: \( ... \)    Display math: \[ ... \]
function renderBookMath() {
  renderMathInElement(document.body, {
    delimiters: [
      {left: "\\[", right: "\\]", display: true},
      {left: "\\(", right: "\\)", display: false}
    ],
    throwOnError: false
  });
}

// document$ fires on every page load, including instant-navigation swaps.
if (typeof document$ !== "undefined") {
  document$.subscribe(renderBookMath);
} else {
  document.addEventListener("DOMContentLoaded", renderBookMath);
}
