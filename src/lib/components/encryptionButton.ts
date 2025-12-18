import $ from "jquery";

import { getChannel, setEnabled } from "../../state/actions";
import { store } from "../../state/store";
import { decryptAllMessages } from "../crypto";
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
	fade(`[${store.state.config.name}].${componentName}`, "out", delay);
};

const toggleState = () => {
	const $el = $(`[${store.state.config.name}].${componentName}`);

	if (isEncryptionOn()) {
		$el.attr("state", "false");
		setEnabled(false);
		encryptionInput().toggleInput("hide"); // Hide input when encryption is disabled
		$(`[role="textbox"]`).trigger("focus"); // Focus on main message input
	} else {
		$el.attr("state", "true");
		setEnabled(true);
		getChannel().enabled && decryptAllMessages();
		if (!getChannel()?.password)
			encryptionInput().toggleInput("show"); // Open input if no password is set
		else $(`[role="textbox"]`).trigger("focus"); // Focus on main message input
	}
};

export const encryptionButton = () => ({
	html: () => markup(),
	close: (delay = 0) => close(delay),
	inject: () => inject(componentName, `[class*=attachWrapper]`, "after", markup()),
	toggleState: () => toggleState()
});
