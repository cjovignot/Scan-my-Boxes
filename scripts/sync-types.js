import fs from "fs";
import path from "path";

const src = path.resolve("shared/types");
const targets = ["frontend/src/types", "api/src/types"];

for (const target of targets) {
  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(src, target, { recursive: true });
  // console.log(`✅ Copied shared types → ${target}`);
}
