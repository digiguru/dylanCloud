import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const root = new URL("../", import.meta.url);

await rm(dist, { force: true, recursive: true });
await mkdir(new URL("./src/", dist), { recursive: true });

await cp(new URL("index.html", root), new URL("index.html", dist));
await cp(new URL("src/", root), new URL("src/", dist), { recursive: true });
await cp(new URL("dylanCloud.js", root), new URL("dylanCloud.js", dist));
await cp(new URL("favicon.png", root), new URL("favicon.png", dist));

const html = await readFile(new URL("index.html", dist), "utf8");
if (!html.includes('src="./src/main.js"')) {
  throw new Error("Built demo is missing its module entry point.");
}

if (!html.includes('href="/favicon.png"')) {
  throw new Error("Built demo is missing its favicon link.");
}

await access(new URL("favicon.png", dist));

await writeFile(
  new URL(".nojekyll", dist),
  "Static ES modules; no Jekyll processing required.\n"
);

console.log("Built static demo to dist/");
