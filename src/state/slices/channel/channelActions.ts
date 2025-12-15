import { store, updateSlice } from "state/index";

import { getChannelId } from "../../../lib/helpers";
import { defaultChannel } from "./channelStore";

export const getChannel = (channelId = getChannelId()) => {
	return store.state.channel[channelId] ?? defaultChannel;
};

export const setPassword = (password: string, channelId = getChannelId()) => {
	updateSlice("channel", (u) => {
		if (!u[channelId]) u[channelId] = defaultChannel;
		u[channelId].password = password;
	});
};

export const setEnabled = (enabled: boolean, channelId = getChannelId()) => {
	updateSlice("channel", (u) => {
		if (!u[channelId]) u[channelId] = defaultChannel;
		u[channelId].enabled = enabled;
	});
};
