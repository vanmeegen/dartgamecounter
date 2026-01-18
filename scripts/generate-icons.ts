#!/usr/bin/env bun
/**
 * Generate PNG icons from SVG for PWA
 */

import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const sizes = [192, 512];
const svgPath = path.join(process.cwd(), "src", "logo.svg");
const outputDir = path.join(process.cwd(), "src", "icons");

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

const svgBuffer = readFileSync(svgPath);

for (const size of sizes) {
  const outputPath = path.join(outputDir, `icon-${size}.png`);
  await sharp(svgBuffer).resize(size, size).png().toFile(outputPath);
  console.log(`Generated ${outputPath}`);
}

console.log("Done!");
