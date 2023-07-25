export const config = {
  name: "encryptionPlugin",
  version: {
    current: "1.0.0",
    latest: "",
    update: false,
    ignoreUpdate: false,
  },
  link: {
    repository: "https://github.com/hmerritt/discord-encryption",
    source:
      "https://raw.githubusercontent.com/hmerritt/discord-encryption/master/encryption.plugin.js",
    sourceConfig:
      "https://raw.githubusercontent.com/hmerritt/discord-encryption/dev/2.0.0/src/lib/config.ts",
  },
};

export type Config = typeof config;
export type UserData = Record<string, { password: string; state: boolean }>;
