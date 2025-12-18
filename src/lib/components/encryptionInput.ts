import $ from "jquery";
import { setIgnoreUpdate, setPassword } from "state/actions";
import { store } from "state/store";

import { fade, inject, select } from "../helpers";
import { checkInputPassword } from "../storage";
import { iconEyePartial, iconEyeSlash, iconEyeSlashPartial } from "./icons";

/**
 * Encryption input
 */

const componentName = "encryptionInput";

const markup = () => {
	const $div = document.createElement("div");
	$div.setAttribute("id", componentName);
	$div.setAttribute(store.state.config.name, componentName);
	$div.setAttribute("class", `${componentName} animated fadeInUp`);

	$div.innerHTML = html`
		${iconEyeSlash}
		<input placeholder="Encryption password" type="password" />
	`;

	// Change password on typing.
	$div.onkeyup = (evt: any) => {
		// set password and save in storage
		checkInputPassword();
		setPassword(evt.target.value);
	};

	// Toggle between **** and text for the password
	$div.querySelector("svg").onclick = (evt: any) => {
		evt.preventDefault();
		if ($("#encryptionInput input").attr("type") === "password") {
			$("#encryptionInput input").attr("type", "text");
			$("#encryptionInput svg path").attr("d", iconEyePartial);
		} else {
			$("#encryptionInput input").attr("type", "password");
			$("#encryptionInput svg path").attr("d", iconEyeSlashPartial);
		}
	};

	return $div;
};

const close = (delay = 0) => {
	setIgnoreUpdate(true);
	fade(`[${store.state.config.name}].${componentName}`, "out", delay);
};

const toggleInput = (action = "") => {
	if (action == "show" || (action == "" && !select(`#encryptionInput`))) {
		encryptionInput().inject();
	} else {
		$("#encryptionInput").removeClass("fadeInUp").addClass("fadeOutDown");
		setTimeout(function () {
			$("#encryptionInput").remove();
		}, 288);
	}
};

export const encryptionInput = () => ({
	html: () => markup(),
	close: (delay = 0) => close(delay),
	inject: () => inject(componentName, "main", "append", markup()),
	//
	toggleInput: (action = "") => toggleInput(action)
});
