import { parseArticles } from "./parse-data/parse-articles.ts";
import { parseVideos } from "./parse-data/parse-videos.ts";
import { parseConcepts } from "./parse-data/parse-concepts.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseArticles();
  parseVideos();
  parseConcepts();
  console.log("==> Data parsing completed successfully.");
}

main();


