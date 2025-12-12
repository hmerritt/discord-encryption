import $ from "jquery";

import { Config, UserData } from "../config";
import { fade, getChannelId, getOrCreateUserData, inject } from "../helpers";
import {
	checkInputPassword,
	getEncryptionPassword,
	isEncryptionOn,
	saveUserData
} from "../storage";
import { encryptionInput } from "./encryptionInput";

/**
 * Encryption button
 */

const componentName = "encryptionButton";

const html = (script: Config, userData: UserData) => {
	const $button = document.createElement("button");
	$button.setAttribute(script.name, componentName);
	$button.setAttribute("state", `${isEncryptionOn(userData) ?? false}`);
	$button.setAttribute("class", componentName);

	$button.innerHTML = `
    <svg viewBox="0 0 24 24">
        <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
    </svg>
  `;

	$button.onclick = (evt: any) => {
		toggleState(script, userData);
		$(`[role="textbox"]`).focus();
	};

	//  bind right click to adding encryption input
	$button.oncontextmenu = (evt: any) => {
		evt.preventDefault();
		encryptionInput(script, userData).toggleInput("");
		$("#encryptionInput input").val(getEncryptionPassword(userData));
		checkInputPassword();
	};

	return $button;
};

const close = (script: Config, userData: UserData, delay = 0) => {
	script.version.ignoreUpdate = true;
	fade(`[${script.name}].${componentName}`, "out", delay);
};

const toggleState = (script: Config, userData: UserData) => {
	const $button = $(`[${script.name}].${componentName}`);
	const channelId = getChannelId() || "global";
	getOrCreateUserData(userData, channelId);

	if (isEncryptionOn(userData, channelId)) {
		$button.attr("state", "false");
		userData[channelId].state = false;
	} else {
		$button.attr("state", "true");
		userData[channelId].state = true;
	}

	saveUserData(userData);
};

export const encryptionButton = (script: Config, userData: UserData) => ({
	html: () => html(script, userData),
	close: (delay = 0) => close(script, userData, delay),
	inject: () =>
		inject(
			componentName,
			`[class^=attachWrapper] > [role="button"]`,
			"after",
			html(script, userData)
		),
	//
	toggleState: () => toggleState(script, userData)
});
