import fs from "fs";
import os from "os";
import path from "path";
import prependFile from "prepend-file";
import { config } from "../src/lib/config.js"; // use .js for ESM

// Convert __dirname for ESM
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.argv?.[2] === "dev";
const pluginOutputFile = path.join(__dirname, "../", "encryption.plugin.js");
const betterDiscordPluginDir = `C:/Users/${os.userInfo().username}/AppData/Roaming/BetterDiscord/plugins`;

const main = async () => {
  console.log(`> Patching build`);

  console.log(`> Adding META data to plugin output file`);
  await prependFile(
    pluginOutputFile,
    `/**
 * @name ${config.nameTitle}
 * @version ${config.version.current}
 * @description ${config.description}
 * @author ${config.author.github_username}
 * @website ${config.link.repository}
 * @source ${config.link.source}
 * @updateUrl ${config.link.source}
 */
`
  );

  if (isDev) {
    console.log(`> Copy output file to BetterDiscord plugin directory`);
    fs.copyFileSync(pluginOutputFile, `${betterDiscordPluginDir}/encryption.plugin.js`);
  }

  console.log("> Patching complete :)");
};

(async () => {
  await main();
  process.exit();
})();
