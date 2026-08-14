import test from "node:test";
import assert from "node:assert/strict";

import {
  hashAngle,
  normalizeWords,
  parseWordText,
  rectanglesOverlap,
  scaleWeight
} from "../src/core.js";

test("normalizeWords merges duplicate words case-insensitively", () => {
  assert.deepEqual(normalizeWords([
    { text: "Cloud", weight: 2 },
    { Text: "cloud", Weight: 3 },
    "JavaScript"
  ]), [
    { key: "cloud", text: "Cloud", weight: 5 },
    { key: "javascript", text: "JavaScript", weight: 1 }
  ]);
});

test("normalizeWords accepts the legacy NavigateUrl shape", () => {
  assert.deepEqual(normalizeWords([
    { Text: "GitHub", Weight: 4, NavigateUrl: "https://github.com" }
  ]), [
    {
      key: "github",
      text: "GitHub",
      weight: 4,
      url: "https://github.com"
    }
  ]);
});

test("parseWordText counts repeated plain-text terms", () => {
  assert.deepEqual(parseWordText("red blue red RED"), [
    { key: "red", text: "red", weight: 3 },
    { key: "blue", text: "blue", weight: 1 }
  ]);
});

test("parseWordText supports explicit words and quoted phrase weights", () => {
  assert.deepEqual(parseWordText('JavaScript:7 "word cloud":12 CSS CSS'), [
    { key: "word cloud", text: "word cloud", weight: 12 },
    { key: "javascript", text: "JavaScript", weight: 7 },
    { key: "css", text: "CSS", weight: 2 }
  ]);
});

test("scaleWeight stays within the requested font range", () => {
  assert.equal(scaleWeight(1, 1, 9, 10, 50), 10);
  assert.equal(scaleWeight(9, 1, 9, 10, 50), 50);
  assert.ok(scaleWeight(4, 1, 9, 10, 50) > 10);
});

test("rectanglesOverlap detects collision and separation", () => {
  const a = { left: 0, top: 0, right: 10, bottom: 10 };
  const b = { left: 9, top: 9, right: 15, bottom: 15 };
  const c = { left: 20, top: 20, right: 30, bottom: 30 };

  assert.equal(rectanglesOverlap(a, b), true);
  assert.equal(rectanglesOverlap(a, c), false);
});

test("hashAngle is deterministic and bounded", () => {
  const first = hashAngle("DylanCloud");
  const second = hashAngle("DylanCloud");

  assert.equal(first, second);
  assert.ok(first >= 0);
  assert.ok(first <= Math.PI * 2);
});
