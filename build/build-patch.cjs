const pathfs = require('path');
const prependFile = require('prepend-file');

const pluginOutputFile = pathfs.join(__dirname, '../', 'encryption.plugin.js');

const main = async () => {
	console.log(`> Patching build`);

	console.log(`> Adding META data to plugin output file`);
	await prependFile(pluginOutputFile, `//META{ "name":"encryption", "website":"https://github.com/hmerritt/discord-encryption" }*//\n`);

	console.log('> Patching complete :)');
};

(async () => {
	await main();
	process.exit();
})();
