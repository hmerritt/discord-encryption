const fs = require('fs');
const os = require('os');
const pathfs = require('path');
const prependFile = require('prepend-file');

const isDev = process.argv?.[2] === 'dev';
const pluginOutputFile = pathfs.join(__dirname, '../', 'encryption.plugin.js');
const betterDiscordPluginDir = `C:/Users/${os.userInfo().username}/AppData/Roaming/BetterDiscord/plugins`;

const main = async () => {
	console.log(`> Patching build`);

	console.log(`> Adding META data to plugin output file`);
	await prependFile(pluginOutputFile, `/**
 * @name Encryption
 * @description Message encryption using AES-256
 * @author hmerritt
 * @website https://github.com/hmerritt/discord-encryption
 * @source https://raw.githubusercontent.com/hmerritt/discord-encryption/master/encryption.plugin.js
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
