import { parseArticles } from "./parse-data/parse-articles.ts";
import { parseVideos } from "./parse-data/parse-videos.ts";

function main(): void {
  console.log("==> Running data parsing pipeline...");
  parseArticles();
  parseVideos();
  console.log("==> Data parsing completed successfully.");
}

main();

