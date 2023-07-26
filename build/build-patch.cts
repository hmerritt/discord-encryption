const fs = require('fs');
const os = require('os');
const pathfs = require('path');
const prependFile = require('prepend-file');
const { config } = require('../src/lib/config');

const isDev = process.argv?.[2] === 'dev';
const pluginOutputFile = pathfs.join(__dirname, '../', 'encryption.plugin.js');
const betterDiscordPluginDir = `C:/Users/${os.userInfo().username}/AppData/Roaming/BetterDiscord/plugins`;

const main = async () => {
	console.log(`> Patching build`);

	console.log(`> Adding META data to plugin output file`);
	await prependFile(pluginOutputFile, `/**
 * @name ${config.nameTitle}
 * @version ${config.version.current}
 * @description ${config.description}
 * @author ${config.author.github_username}
 * @website ${config.link.repository}
 * @source ${config.link.source}
 * @updateUrl ${config.link.source}
 */
`);

	if (isDev) {
		console.log(`> Copy output file to betterDiscord plugin directory`);
		fs.copyFileSync(pluginOutputFile, `${betterDiscordPluginDir}/encryption.plugin.js`);
	}

	console.log('> Patching complete :)');
};

(async () => {
	await main();
	process.exit();
})();
