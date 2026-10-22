import { build } from "esbuild";
import pkg from "./package.json" with { type: "json" };

// Dependências de runtime ficam fora do bundle e são instaladas no deploy.
// Os pacotes do workspace (@vgm/*) exportam TypeScript cru, então entram no bundle.
const external = Object.keys(pkg.dependencies).filter((name) => !name.startsWith("@vgm/"));

await build({
    entryPoints: ["src/server.ts"],
    outfile: "dist/server.js",
    bundle: true,
    platform: "node",
    target: "node22",
    format: "cjs",
    sourcemap: true,
    external,
});
