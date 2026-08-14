import { DylanCloud } from "./dylan-cloud.js";
import { parseWordText } from "./core.js";

const starterText = `animation animation animation
javascript javascript javascript javascript
modern modern modern modern modern
word cloud word cloud word cloud
CSS CSS CSS CSS CSS CSS
browser browser browser
design design design design
data data data data data
motion motion motion
creative creative
open-source open-source open-source
fast fast fast fast
simple simple simple simple simple
responsive responsive responsive
jQuery legacy
DylanCloud DylanCloud DylanCloud DylanCloud DylanCloud`;

const textarea = document.querySelector("#word-input");
const cloudElement = document.querySelector("#wordcloud");
const stats = document.querySelector("#stats");
const renderButton = document.querySelector("#render");
const sampleButton = document.querySelector("#sample");
const animateButton = document.querySelector("#animate");

const cloud = new DylanCloud(cloudElement, {
  animationDuration: 700,
  minFontSize: 12,
  maxFontSize: 76,
  maxWords: 1000
});

function renderFromInput() {
  const words = parseWordText(textarea.value);
  cloud.setWords(words);
  stats.textContent = `${words.length} unique terms`;
}

function makeBigSample() {
  const themes = [
    "JavaScript", "CSS", "HTML", "animation", "browser", "design", "data",
    "motion", "cloud", "creative", "layout", "modern", "fast", "responsive",
    "accessible", "open-source", "vanilla", "module", "canvas", "DOM",
    "transform", "transition", "resize", "frequency", "weight", "dynamic",
    "interactive", "visual", "typography", "spiral", "collision", "performance"
  ];

  textarea.value = Array.from({ length: 420 }, (_, index) => {
    const word = themes[index % themes.length];
    const repeats = 1 + ((index * 17) % 7);
    return Array.from({ length: repeats }, () => word).join(" ");
  }).join("\n");

  renderFromInput();
}

function animateUpdate() {
  const current = parseWordText(textarea.value);
  const shifted = current.map((word, index) => ({
    ...word,
    weight: Math.max(1, word.weight * (0.45 + ((index * 37) % 100) / 70))
  }));
  cloud.update(shifted);
}

textarea.value = starterText;
renderFromInput();

renderButton.addEventListener("click", renderFromInput);
sampleButton.addEventListener("click", makeBigSample);
animateButton.addEventListener("click", animateUpdate);

textarea.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    renderFromInput();
  }
});

cloudElement.addEventListener("dylancloud:render", (event) => {
  const { rendered, requested } = event.detail;
  const suffix = rendered < requested ? ` · ${requested - rendered} did not fit` : "";
  stats.textContent = `${requested} requested · ${rendered} rendered${suffix}`;
});
