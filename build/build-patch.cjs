const fs = require('fs');
const os = require('os');
const pathfs = require('path');
const prependFile = require('prepend-file');

const pluginOutputFile = pathfs.join(__dirname, '../', 'encryption.plugin.js');
const betterDiscordPluginDir = `C:/Users/${os.userInfo().username}/AppData/Roaming/BetterDiscord/plugins`;

const main = async () => {
	console.log(`> Patching build`);

	console.log(`> Adding META data to plugin output file`);
	await prependFile(pluginOutputFile, `//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//\n`);

	// Uncomment when in development
	// console.log(`> Copy output file to betterDiscord plugin directory`);
	// fs.copyFileSync(pluginOutputFile, `${betterDiscordPluginDir}/encryption.plugin.js`);

	console.log('> Patching complete :)');
};

(async () => {
	await main();
	process.exit();
})();
