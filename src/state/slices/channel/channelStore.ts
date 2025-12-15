export const defaultChannel = {
	password: "",
	enabled: false
};

export const channelStore = {} as Record<string, { password: string; enabled: boolean }>;

export type ChannelStore = typeof channelStore;

export default channelStore;
