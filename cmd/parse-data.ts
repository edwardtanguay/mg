import { parseArticles } from "./parse-data/parse-articles.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseArticles();
  console.log("==> Data parsing completed successfully.");
}

main();

