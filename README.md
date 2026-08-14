# DylanCloud

A dependency-free animated word cloud for modern browsers.

DylanCloud started in 2011 as a jQuery plugin for animating tag-cloud changes. Version 2 keeps the original idea — weighted words that move and resize when the data changes — but removes jQuery, the overlap plugin, and the old jQuery animation pipeline.

## What changed in 2.0

- No jQuery and no runtime dependencies.
- Modern ES modules and DOM APIs.
- CSS transform/opacity/font-size transitions for animation.
- Collision-aware spiral layout.
- Responsive relayout with `ResizeObserver`.
- Paste ordinary text and use duplicate frequency as weight.
- Optional explicit weights: `JavaScript:10` or `"machine learning":20`.
- Up to 1,000 input terms per cloud by default.
- Legacy data objects such as `{ Text, Weight, NavigateUrl }` are still accepted.
- `prefers-reduced-motion` disables transitions automatically.
- Node's built-in test runner, deterministic `npm ci`, CI, and a static build with zero npm dependencies.

## Try the demo

Open `index.html` in a local static server, or run any server you prefer from the repository root.

The demo lets you paste a large body of text, load a 400+ word sample, and trigger a weighted update to see the existing words animate into their new sizes and positions.

## Use as a library

```html
<link rel="stylesheet" href="./src/dylan-cloud.css" />

<div id="cloud" style="height: 500px"></div>

<script type="module">
  import { DylanCloud } from "./src/dylan-cloud.js";

  const cloud = new DylanCloud(document.querySelector("#cloud"));

  cloud.setWords([
    { text: "JavaScript", weight: 20 },
    { text: "CSS", weight: 14 },
    { text: "HTML", weight: 11 }
  ]);

  // Later: the existing words animate to their new layout.
  cloud.update([
    { text: "JavaScript", weight: 8 },
    { text: "CSS", weight: 24 },
    { text: "Accessibility", weight: 16 }
  ]);
</script>
```

The original capitalised object shape is also supported:

```js
cloud.setWords([
  { Text: "DylanCloud", Weight: 25 },
  { Text: "GitHub", Weight: 12, NavigateUrl: "https://github.com/digiguru/dylanCloud" }
]);
```

## Turn pasted text into weighted words

```js
import { parseWordText } from "./src/core.js";

const words = parseWordText(`
  cloud cloud cloud
  animation animation
  JavaScript:10
  "word cloud":18
`);

cloud.setWords(words);
```

Plain repeated words are counted. Explicit `term:number` syntax contributes that exact weight.

## Options

```js
new DylanCloud(element, {
  animationDuration: 650,
  gap: 3,
  maxFontSize: 72,
  maxWords: 1000,
  minFontSize: 12,
  padding: 18,
  spiralStep: 3.5
});
```

Dense clouds are deliberately best-effort: words that cannot fit without collision are omitted from that render rather than being painted on top of one another. The `dylancloud:render` event reports `requested` and `rendered` counts.

## Events

```js
element.addEventListener("dylancloud:render", ({ detail }) => {
  console.log(detail.requested, detail.rendered);
});
```

## Development

Requires Node.js 20 or newer.

```bash
npm ci
npm run lint
npm test
npm run build
```

`npm run build` creates a dependency-free static demo in `dist/`.

## Why no framework or animation package?

The library does not need one. Modern browsers already provide ES modules, `ResizeObserver`, `requestAnimationFrame`, CSS transforms, and media queries for reduced motion. Keeping the runtime dependency-free makes DylanCloud easier to embed, maintain, and keep alive for another fifteen years.

## License

MIT. Copyright Adam Hall.
