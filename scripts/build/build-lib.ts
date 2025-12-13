import dayjs from "dayjs";
import fs from "fs";
import os from "os";
import pathfs from "path";
import prependFile from "prepend-file";

import * as core from "./core";
import { config } from "../../src/lib/config";

const packageJsonPath = pathfs.join(core.__root, "package.json");
const pluginOutputFile = pathfs.join(core.__root, config.outputFile);
const betterDiscordPluginDir = `C:/Users/${os.userInfo().username}/AppData/Roaming/BetterDiscord/plugins`;

export const patchBuild = async (shouldBumpVersion = true, silent = false) => {
	if (shouldBumpVersion) await bumpVersion(false, silent);

	await prependFile(
		pathfs.join(core.__root, config.outputFile),
		`/**
 * @name         ${config.nameTitle}
 * @description  ${config.description}
 * @version      ${config.version.current}
 * @author       ${config.author.github_username}
 * @website      ${config.link.repository}
 * @source       ${config.link.source}
 * @updateUrl    ${config.link.source}
 * @compiledOn   ${dayjs().format("YYYY/MM/DD, HH:mm:ss")}
 */
`
	);

	if (!silent) {
		console.log(
			`\x1b[32m✔\x1b[0m Patch complete [${config.outputFile} v${config.version.current}]`
		);
	}

	// Copy build directly to BetterDiscord plugin directory
	if (fs.existsSync(betterDiscordPluginDir)) {
		fs.copyFileSync(
			pluginOutputFile,
			pathfs.join(betterDiscordPluginDir, config.outputFile)
		);
		console.log(`\x1b[32m✔\x1b[0m Copy build to BetterDiscord plugin directory`);
	}
};

export const bumpVersion = async (useCommitCount = false, silent = false) => {
	try {
		// Get the total commit count
		let commitCount = -1;
		if (useCommitCount) {
			commitCount = (
				await core.run(`git rev-list --count HEAD`, core.__root, "")
			).trim();
		}

		// Read the contents of package.json
		const versionFile = packageJsonPath;
		const versionFileContent = fs.readFileSync(versionFile, "utf8");

		// Extract the version number parts
		const versionMatch = versionFileContent.match(
			/("version": ")(\d+\.\d+\.)(\d+)(")/
		);
		const majorMinor = versionMatch?.[2];
		const patch = Number(versionMatch?.[3]) || -1;
		const newVersion = `${majorMinor}${useCommitCount ? commitCount : patch + 1}`;

		if (!majorMinor) {
			throw new Error("No version number found in package.json");
		}

		// Replace the version patch with the commit count
		const updatedContent = versionFileContent.replace(
			/("version": ")(\d+\.\d+\.)\d+(")/g,
			`$1${newVersion}$3`
		);

		// Write the updated content back to package.json
		fs.writeFileSync(versionFile, updatedContent, "utf8");

		if (!silent) console.log(`\x1b[32m✔\x1b[0m Version updated v${newVersion}`);
	} catch (error) {
		console.error("\x1b[31mError bumping version:", error, `\x1b[0m`);
	}
};
