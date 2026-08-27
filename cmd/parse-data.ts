import { parseSeeAlsoLinks } from "./parse-data/parse-see-also-links.ts";
import { parseArticles } from "./parse-data/parse-articles.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseSeeAlsoLinks();
  parseArticles();
  console.log("==> Data parsing completed successfully.");
}

main();

