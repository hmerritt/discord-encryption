import crypto from "crypto-js";
import $ from "jquery";

import { UserData } from "./config";
import { selectAllFirstMatch } from "./helpers";

export const PREFIX = "#!aes/";

export const encrypt = (msg: string, channelData: UserData["global"]) => {
	if (isMessageEncrypted(msg)) return msg;

	const key = crypto.SHA512(channelData.password);
	const iv = crypto.enc.Hex.parse("00000000000000000000000000000000");

	return crypto.AES.encrypt(msg, key, {
		iv: iv,
		padding: crypto.pad.Iso10126
	}).toString();
};

export const decrypt = (msg: string, channelData: UserData["global"]) => {
	if (isMessageEncrypted(msg)) msg = msg.substring(6);

	const key = crypto.SHA512(channelData.password);
	const iv = crypto.enc.Hex.parse("00000000000000000000000000000000");

	return crypto.AES.decrypt(msg, key, {
		iv: iv,
		padding: crypto.pad.Iso10126
	}).toString(crypto.enc.Utf8);
};

export const isMessageEncrypted = (msg: string) => {
	if (msg.substring(0, 6) === PREFIX) return true;
	return false;
};

//--------------------------------------------------------------------
//--------------------------------------------------------------------

export const decryptAllMessages = (channelData: UserData["global"]) => {
	// Loop all messages
	const markup = selectAllFirstMatch([
		`div[class*="messageContent"]`,
		`div[id*="message-content"]`,
		// Not working, maybe fix later:
		`[id*="message-content"]`,
		`[aria-roledescription="Message"] [class*="messageContent"]`,
		`[data-list-id="chat-messages"]`,
		`[class*="scrollerInner"]`
	]);

	for (const item of Array.from(markup)) {
		try {
			const message = item.textContent?.trim();
			if (!isMessageEncrypted(message)) return;

			const decrypted = decrypt(message, channelData);
			if (!decrypted) throw "decryption failed";

			item.innerHTML = decrypted;
			item.classList.add("decrypted");
		} catch (e) {
			item.innerHTML = "(failed to decrypt. most likely the wrong password)";
			item.classList.add("not-decrypted");
		}
	}
};
