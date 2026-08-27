import { parseSeeAlsoLinks } from "./parse-data/parse-see-also-links.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseSeeAlsoLinks();
  console.log("==> Data parsing completed successfully.");
}

main();
