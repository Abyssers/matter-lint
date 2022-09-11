const { resolve } = require("node:path");
const { existsSync, rmSync, mkdirSync, writeFileSync, createReadStream, createWriteStream } = require("node:fs");

const sourceDir = resolve(__dirname, "../dist");
const targetDir = resolve(__dirname, "../dist/bin");
const sourcePath = resolve(sourceDir, "index.js");
const targetPath = resolve(targetDir, "index.js");

!existsSync(targetDir) && mkdirSync(targetDir);
if (existsSync(sourcePath)) {
    console.time(`created dist/bin/index.js`);
    rmSync(targetPath, { force: true });
    writeFileSync(targetPath, `#!/usr/bin/env node\n\n`);
    createReadStream(sourcePath)
        .pipe(createWriteStream(targetPath, { flags: "a" }))
        .on("close", () => {
            console.timeEnd(`created dist/bin/index.js`);
        });
}
