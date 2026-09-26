import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function freezeLocalFile(srcPath, destPath) {
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
}
