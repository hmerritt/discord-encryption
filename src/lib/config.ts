export const config = {
	name: "encryptionPlugin",
	nameTitle: "Encryption",
	description: "Message encryption using AES-256",
	author: {
		name: "Harry Merritt",
		github_username: "hmerritt",
		twitter_username: "hmrrtt"
	},
	version: {
		current: "2.1.0",
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

export type Config = typeof config;
export type UserData = Record<string, { password: string; state: boolean }>;
