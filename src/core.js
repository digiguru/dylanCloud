const LEGACY_TEXT_KEYS = ["text", "Text"];
const LEGACY_WEIGHT_KEYS = ["weight", "Weight"];
const LEGACY_URL_KEYS = ["url", "NavigateUrl"];

function firstDefined(object, keys) {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }
  return undefined;
}

export function slugKey(text) {
  return String(text)
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKC");
}

export function normalizeWords(input = []) {
  const merged = new Map();

  for (const item of input) {
    const source = typeof item === "string" ? { text: item } : item;
    if (!source || typeof source !== "object") continue;

    const rawText = firstDefined(source, LEGACY_TEXT_KEYS);
    const text = String(rawText ?? "").trim();
    if (!text) continue;

    const rawWeight = firstDefined(source, LEGACY_WEIGHT_KEYS);
    const parsedWeight = Number(rawWeight ?? 1);
    const weight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 1;
    const url = firstDefined(source, LEGACY_URL_KEYS);
    const key = slugKey(text);

    const existing = merged.get(key);
    if (existing) {
      existing.weight += weight;
      if (!existing.url && url) existing.url = String(url);
      continue;
    }

    merged.set(key, {
      key,
      text,
      weight,
      ...(url ? { url: String(url) } : {})
    });
  }

  return [...merged.values()].sort(
    (a, b) => b.weight - a.weight || a.text.localeCompare(b.text)
  );
}

export function parseWordText(text = "") {
  const source = String(text).trim();
  if (!source) return [];

  const explicit = [];
  let plain = source;

  // Quoted phrases and individual tokens may carry explicit weights:
  // "machine learning":12  JavaScript:8
  plain = plain.replace(
    /"([^"]+)"\s*:\s*(\d+(?:\.\d+)?)|([\p{L}\p{N}][\p{L}\p{N}'’._+-]*)\s*:\s*(\d+(?:\.\d+)?)/gu,
    (_match, quoted, quotedWeight, token, tokenWeight) => {
      explicit.push({
        text: quoted ?? token,
        weight: Number(quotedWeight ?? tokenWeight)
      });
      return " ";
    }
  );

  const tokens =
    plain.match(/[\p{L}\p{N}][\p{L}\p{N}'’._+-]*/gu) ?? [];

  return normalizeWords([
    ...tokens.map((token) => ({ text: token, weight: 1 })),
    ...explicit
  ]);
}

export function scaleWeight(weight, minWeight, maxWeight, minSize, maxSize) {
  if (maxWeight <= minWeight) return (minSize + maxSize) / 2;

  const normalized = (weight - minWeight) / (maxWeight - minWeight);
  const eased = Math.sqrt(Math.max(0, Math.min(1, normalized)));
  return minSize + eased * (maxSize - minSize);
}

export function rectanglesOverlap(a, b, gap = 0) {
  return !(
    a.right + gap <= b.left ||
    a.left >= b.right + gap ||
    a.bottom + gap <= b.top ||
    a.top >= b.bottom + gap
  );
}

export function hashAngle(text) {
  let hash = 2166136261;
  for (const char of String(text)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) / 4294967295) * Math.PI * 2;
}
