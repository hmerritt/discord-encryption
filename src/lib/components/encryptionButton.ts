import $ from "jquery";
import { getChannel, setEnabled, setIgnoreUpdate } from "state/actions";
import { store } from "state/store";

import { fade, inject } from "../helpers";
import { checkInputPassword, isEncryptionOn } from "../storage";
import { encryptionInput } from "./encryptionInput";

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
			<div class="${componentName}__buttonWrapper">
				<svg viewBox="0 0 24 24">
					<path
						fill
						d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z"
					/>
				</svg>
			</div>
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
