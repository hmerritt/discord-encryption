import $ from "jquery";
import { getChannel, setEnabled, setIgnoreUpdate } from "state/actions";
import { store } from "state/store";

import { fade, inject } from "../helpers";
import { checkInputPassword, isEncryptionOn } from "../storage";
import { encryptionInput } from "./encryptionInput";
import { iconLockPlus } from "./icons";

/**
 * Encryption button
 */

const componentName = "encryptionButton";

const markup = () => {
	const $el = document.createElement("div");
	$el.setAttribute(store.state.config.name, componentName);
	$el.setAttribute("state", `${isEncryptionOn()}`);
	$el.setAttribute("class", componentName);

	$el.innerHTML = html`
		<div class="${componentName}__button">
			<div class="${componentName}__buttonWrapper">${iconLockPlus}</div>
		</div>
	`;

	$el.onclick = (_: MouseEvent) => {
		toggleState();
		$(`[role="textbox"]`).trigger("focus");
	};

	// Bind right click to adding encryption input
	$el.oncontextmenu = (evt: MouseEvent) => {
		evt.preventDefault();
		encryptionInput().toggleInput("");
		$("#encryptionInput input").val(getChannel()?.password || "");
		checkInputPassword();
	};

	return $el;
};

const close = (delay = 0) => {
	setIgnoreUpdate(true);
	fade(`[${store.state.config.name}].${componentName}`, "out", delay);
};

const toggleState = () => {
	const $el = $(`[${store.state.config.name}].${componentName}`);

	if (isEncryptionOn()) {
		$el.attr("state", "false");
		setEnabled(false);
	} else {
		$el.attr("state", "true");
		setEnabled(true);
	}

	// Show input when encryption is enabled, but no password is set
	// if (
	// 	isEncryptionOn(userData, channelId) &&
	// 	!getEncryptionPassword(userData, channelId)
	// ) {
	// 	encryptionInput(script, userData).toggleInput("show");

	// 	// Hide input when encryption is disabled
	// } else if (!isEncryptionOn(userData, channelId)) {
	// 	encryptionInput(script, userData).toggleInput("");
	// }
};

export const encryptionButton = () => ({
	html: () => markup(),
	close: (delay = 0) => close(delay),
	inject: () => inject(componentName, `[class*=attachWrapper]`, "after", markup()),
	toggleState: () => toggleState()
});
