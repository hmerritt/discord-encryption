import pkgStatic from "../../../../package.json";

export const configStore = {
	outputFile: "encryption.plugin.js",
	name: "encryptionPlugin",
	nameTitle: "Encryption",
	description: "Experimental message encryption using AES-GCM",
	author: {
		name: "Harry Merritt",
		github_username: "hmerritt",
		twitter_username: "hmrrtt"
	},
	version: {
		current: pkgStatic.version,
		latest: "",
		update: false,
		ignoreUpdate: false
	},
	link: {
		repository: "https://github.com/hmerritt/discord-encryption",
		source: "https://github.com/hmerritt/discord-encryption/releases/latest/download/encryption.plugin.js",
		sourceConfig:
			"https://raw.githubusercontent.com/hmerritt/discord-encryption/master/src/lib/config.ts"
	}
};

export type ConfigStore = typeof configStore;
export type UserData = Record<string, { password: string; state: boolean }>;

export default configStore;
