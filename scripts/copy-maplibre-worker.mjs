// MapLibre renders tiles in a web worker. Next's bundler can't resolve the worker's default URL,
// so we serve the worker (and the shared chunk it imports) from /public and point MapLibre at it.
// Runs automatically before `dev` and `build`.
import { copyFileSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/maplibre/", import.meta.url);
mkdirSync(to, { recursive: true });
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(new URL(file, from), new URL(file, to));
}
console.log("Copied MapLibre worker to public/maplibre/");
