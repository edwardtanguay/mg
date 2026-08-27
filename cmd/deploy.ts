import fs from "node:fs";
import path from "node:path";
import * as ftp from "basic-ftp";
import dotenv from "dotenv";

dotenv.config();

function updateCacheBusters(): void {
  const indexPath = path.resolve("index.html");
  if (!fs.existsSync(indexPath)) {
    console.warn(`[deploy] index.html not found at ${indexPath}`);
    return;
  }

  let indexContent = fs.readFileSync(indexPath, "utf-8");
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 14); // YYYYMMDDHHMMSS

  console.log(`[deploy] Updating cache busters in index.html to v=${timestamp}...`);

  // Update ?v=... across css links and script tags
  indexContent = indexContent.replace(
    /((?:href|src)=["'][^"']+\.(?:css|js))(?:\?v=[^"']*)?(["'])/gi,
    `$1?v=${timestamp}$2`
  );

  fs.writeFileSync(indexPath, indexContent, "utf-8");
  console.log(`[deploy] Cache buster update complete.`);
}

async function uploadToFtp(): Promise<void> {
  const host = process.env.FTP_SERVER;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASSWORD;
  const rawRemoteDir = process.env.FTP_DIRECTORY || "/public_html";

  if (!host || !user || !password || password === "TODO") {
    console.error("[deploy] FTP credentials missing or FTP_PASSWORD is 'TODO' in .env. Skipping upload.");
    return;
  }

  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log(`[deploy] Connecting to FTP server: ${host}...`);
    await client.access({
      host,
      user,
      password,
      secure: false,
    });
    console.log(`[deploy] Connected successfully.`);

    // Target folder structure on remote: FTP_DIRECTORY
    await client.ensureDir(rawRemoteDir);
    console.log(`[deploy] Remote directory ensured: ${rawRemoteDir}`);

    // Files and folders to upload
    const entriesToDeploy = ["index.html", "css", "js", "data", "assets"];

    for (const entry of entriesToDeploy) {
      const localPath = path.resolve(entry);
      if (!fs.existsSync(localPath)) {
        continue;
      }

      const stat = fs.statSync(localPath);
      if (stat.isDirectory()) {
        const remoteDirPath = `${rawRemoteDir}/${entry}`.replace(/\/+/g, "/");
        console.log(`[deploy] Syncing directory ${entry} -> ${remoteDirPath}...`);
        await client.ensureDir(remoteDirPath);
        await client.uploadFromDir(localPath, remoteDirPath);
      } else {
        const remoteFilePath = `${rawRemoteDir}/${entry}`.replace(/\/+/g, "/");
        console.log(`[deploy] Uploading file ${entry} -> ${remoteFilePath}...`);
        await client.uploadFrom(localPath, remoteFilePath);
      }
    }

    console.log("[deploy] Deployment upload finished successfully!");
  } catch (err) {
    console.error("[deploy] Error during FTP deployment:", err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

async function main(): Promise<void> {
  console.log("==> Starting deploy process...");
  updateCacheBusters();
  await uploadToFtp();
  console.log("==> Deploy process finished.");
}

main();
