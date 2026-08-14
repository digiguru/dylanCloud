import {
  hashAngle,
  normalizeWords,
  rectanglesOverlap,
  scaleWeight
} from "./core.js";

const DEFAULTS = {
  animationDuration: 650,
  gap: 3,
  maxFontSize: 72,
  maxWords: 1000,
  minFontSize: 12,
  padding: 18,
  spiralStep: 3.5
};

function measureFactory(container) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const style = getComputedStyle(container);
  const fontFamily = style.fontFamily || "system-ui, sans-serif";
  const fontWeight = style.fontWeight || "600";

  return (text, size) => {
    context.font = `${fontWeight} ${size}px ${fontFamily}`;
    const metrics = context.measureText(text);
    return {
      width: Math.ceil(metrics.width) + 2,
      height: Math.ceil(size * 1.12)
    };
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function layoutWords(words, width, height, options, measure) {
  if (!words.length || width <= 0 || height <= 0) return [];

  const limited = words.slice(0, options.maxWords);
  const maxWeight = limited[0].weight;
  const minWeight = limited[limited.length - 1].weight;
  const densityScale = clamp(1 - Math.max(0, limited.length - 80) / 1800, 0.62, 1);
  const minFont = options.minFontSize * densityScale;
  const maxFont = options.maxFontSize * densityScale;
  const placed = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const usableRadius = Math.hypot(width, height);
  const maxIterations = Math.max(900, Math.round(usableRadius * 5));
  const cellSize = 72;
  const spatialGrid = new Map();

  const cellKeysFor = (rect, gap = 0) => {
    const keys = [];
    const minX = Math.floor((rect.left - gap) / cellSize);
    const maxX = Math.floor((rect.right + gap) / cellSize);
    const minY = Math.floor((rect.top - gap) / cellSize);
    const maxY = Math.floor((rect.bottom + gap) / cellSize);

    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        keys.push(`${x}:${y}`);
      }
    }
    return keys;
  };

  const collides = (rect) => {
    const nearby = new Set();
    for (const key of cellKeysFor(rect, options.gap)) {
      for (const placedRect of spatialGrid.get(key) ?? []) {
        nearby.add(placedRect);
      }
    }
    return [...nearby].some((placedRect) =>
      rectanglesOverlap(rect, placedRect, options.gap)
    );
  };

  const indexRect = (rect) => {
    for (const key of cellKeysFor(rect)) {
      const bucket = spatialGrid.get(key) ?? [];
      bucket.push(rect);
      spatialGrid.set(key, bucket);
    }
  };

  for (const word of limited) {
    const fontSize = scaleWeight(
      word.weight,
      minWeight,
      maxWeight,
      minFont,
      maxFont
    );
    const dimensions = measure(word.text, fontSize);
    const initialAngle = hashAngle(word.key);
    let rect = null;

    for (let step = 0; step < maxIterations; step += 1) {
      const radius = options.spiralStep * Math.sqrt(step);
      const angle = initialAngle + step * 0.36;
      const x = centerX + radius * Math.cos(angle) - dimensions.width / 2;
      const y = centerY + radius * Math.sin(angle) - dimensions.height / 2;

      const candidate = {
        left: x,
        top: y,
        right: x + dimensions.width,
        bottom: y + dimensions.height
      };

      const inside =
        candidate.left >= options.padding &&
        candidate.top >= options.padding &&
        candidate.right <= width - options.padding &&
        candidate.bottom <= height - options.padding;

      if (
        inside &&
        !collides(candidate)
      ) {
        rect = candidate;
        break;
      }
    }

    if (!rect) continue;

    const opacity =
      maxWeight === minWeight
        ? 1
        : 0.48 + 0.52 * ((word.weight - minWeight) / (maxWeight - minWeight));

    indexRect(rect);
    placed.push({
      ...word,
      fontSize,
      opacity,
      x: rect.left,
      y: rect.top,
      rect
    });
  }

  return placed;
}

export class DylanCloud {
  constructor(element, options = {}) {
    if (!(element instanceof Element)) {
      throw new TypeError("DylanCloud requires a DOM element.");
    }

    this.element = element;
    this.options = { ...DEFAULTS, ...options };
    this.words = [];
    this.nodes = new Map();
    this.measure = measureFactory(element);
    this.frame = null;

    this.element.classList.add("dylan-cloud");
    this.element.style.setProperty(
      "--dylan-cloud-duration",
      `${this.options.animationDuration}ms`
    );

    this.resizeObserver = new ResizeObserver(() => this.scheduleLayout());
    this.resizeObserver.observe(this.element);
  }

  setWords(words = []) {
    this.words = normalizeWords(words);
    this.scheduleLayout();
    return this;
  }

  update(words = []) {
    return this.setWords(words);
  }

  scheduleLayout() {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.render());
  }

  render() {
    const bounds = this.element.getBoundingClientRect();
    const layout = layoutWords(
      this.words,
      bounds.width,
      bounds.height,
      this.options,
      this.measure
    );
    const nextKeys = new Set(layout.map((word) => word.key));

    for (const word of layout) {
      let node = this.nodes.get(word.key);
      const isNew = !node;

      if (!node) {
        node = this.createNode(word);
        this.nodes.set(word.key, node);
        this.element.append(node);
      }

      node.dataset.weight = String(word.weight);
      node.title = `${word.text}: ${word.weight}`;
      node.style.setProperty("--x", `${word.x}px`);
      node.style.setProperty("--y", `${word.y}px`);
      node.style.setProperty("--font-size", `${word.fontSize}px`);
      node.style.setProperty("--opacity", String(word.opacity));

      if (isNew) {
        requestAnimationFrame(() => node.classList.add("is-visible"));
      } else {
        node.classList.add("is-visible");
      }
    }

    for (const [key, node] of this.nodes) {
      if (nextKeys.has(key)) continue;

      node.classList.remove("is-visible");
      node.addEventListener(
        "transitionend",
        () => {
          node.remove();
          this.nodes.delete(key);
        },
        { once: true }
      );

      setTimeout(() => {
        if (!node.isConnected) return;
        node.remove();
        this.nodes.delete(key);
      }, this.options.animationDuration + 80);
    }

    this.element.dataset.renderedWords = String(layout.length);
    this.element.dataset.totalWords = String(
      Math.min(this.words.length, this.options.maxWords)
    );

    this.element.dispatchEvent(
      new CustomEvent("dylancloud:render", {
        detail: {
          rendered: layout.length,
          requested: Math.min(this.words.length, this.options.maxWords)
        }
      })
    );
  }

  createNode(word) {
    const node = word.url ? document.createElement("a") : document.createElement("span");
    node.className = "dylan-cloud__word";
    node.textContent = word.text;

    if (word.url) {
      node.href = word.url;
      node.rel = "noopener noreferrer";
    }

    return node;
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    for (const node of this.nodes.values()) node.remove();
    this.nodes.clear();
    this.element.classList.remove("dylan-cloud");
  }
}

export { normalizeWords } from "./core.js";
