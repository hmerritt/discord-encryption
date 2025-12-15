import { updateSlice } from "state/index";

export const setLatestVersion = (version: string) => {
	updateSlice("config", (c) => {
		c.version.latest = version;
	});
};

export const setUpdateAvailable = (updateAvailable = false) => {
	updateSlice("config", (c) => {
		c.version.update = updateAvailable;
	});
};

export const setIgnoreUpdate = (ignoreUpdate = false) => {
	updateSlice("config", (c) => {
		c.version.ignoreUpdate = ignoreUpdate;
	});
};
