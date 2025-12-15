import $ from "jquery";

import { getChannel } from "../state/actions";
import { getChannelId } from "./helpers";

export class BDStorage implements Storage {
	private readonly scope: string;

	constructor(pluginName: string) {
		this.scope = pluginName;
	}

	/**
	 * Returns the number of data items stored.
	 * Note: This incurs a disk read to count keys.
	 */
	get length(): number {
		const data = this.loadAll();
		return data ? Object.keys(data).length : 0;
	}

	/**
	 * Clears all keys associated with this plugin scope.
	 */
	clear(): void {
		// BdApi does not provide a direct 'clear' for a scope,
		// so we delete keys individually to be safe, or save an empty state.
		const data = this.loadAll();
		if (!data) return;

		Object.keys(data).forEach((key) => {
			this.removeItem(key);
		});
	}

	/**
	 * Returns the name of the nth key in storage.
	 */
	key(index: number): string | null {
		const data = this.loadAll();
		if (!data) return null;
		const keys = Object.keys(data);
		return keys[index] || null;
	}

	getItem(key: string): string | null {
		const val = window.BdApi?.Data?.load(this.scope, key);

		if (val === undefined || val === null) return null;

		// The Storage API expects strings. If BdApi returns an object,
		// we must serialize it to maintain contract compliance.
		return typeof val === "string" ? val : JSON.stringify(val);
	}

	setItem(key: string, value: string): void {
		window.BdApi?.Data?.save(this.scope, key, value);
	}

	removeItem(key: string): void {
		window.BdApi?.Data?.delete(this.scope, key);
	}

	/**
	 * Allows array-like access (e.g., storage['key']) which is
	 * required by the strict TypeScript Storage interface.
	 */
	[name: string]: any;

	// Internal Helper
	private loadAll(): Record<string, any> | undefined {
		// Calling load without a key typically returns the full data object
		// in most BdApi implementations.
		return window.BdApi?.Data?.load(this.scope) as Record<string, any> | undefined;
	}
}

export const isEncryptionOn = (channelId = getChannelId() || "") => {
	return getChannel(channelId)?.enabled ?? false;
};

export const checkInputPassword = () => {
	// if password is less than 3 - turn red
	if (String($("#encryptionInput input").val()).length < 3) {
		$("#encryptionInput").removeClass("nice-password");
	} else {
		$("#encryptionInput").addClass("nice-password");
	}
};
