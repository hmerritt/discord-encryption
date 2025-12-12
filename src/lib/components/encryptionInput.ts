import $ from "jquery";

import { Config, UserData } from "../config";
import { fade, getChannelId, getOrCreateUserData, inject } from "../helpers";
import { log } from "../log";
import { checkInputPassword, saveUserData } from "../storage";

/**
 * Encryption input
 */

const componentName = "encryptionInput";

const html = (script: Config, userData: UserData) => {
	const $div = document.createElement("div");
	$div.setAttribute("id", componentName);
	$div.setAttribute(script.name, componentName);
	$div.setAttribute("class", `${componentName} animated fadeInUp`);

	$div.innerHTML = `
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="#ddd" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
    </svg>
    <input placeholder="Encryption password" type="password">
  `;

	// Change password on typing.
	$div.onkeyup = (evt: any) => {
		// set password and save in storage
		checkInputPassword();
		const channelId = getChannelId() || "global";
		getOrCreateUserData(userData, channelId);
		userData[channelId].password = evt.target.value;
		saveUserData(userData);
	};

	// Toggle between **** and text for the password
	$div.querySelector("svg").onclick = (evt: any) => {
		evt.preventDefault();
		if ($("#encryptionInput input").attr("type") == "password") {
			$("#encryptionInput input").attr("type", "text");
			$("#encryptionInput svg path").attr(
				"d",
				"M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.08L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.74,7.13 11.35,7 12,7Z"
			);
		} else {
			$("#encryptionInput input").attr("type", "password");
			$("#encryptionInput svg path").attr(
				"d",
				"M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"
			);
		}
	};

	return $div;
};

const close = (script: Config, userData: UserData, delay = 0) => {
	script.version.ignoreUpdate = true;
	fade(`[${script.name}].${componentName}`, "out", delay);
};

const toggleInput = (script: Config, userData: UserData, action = "") => {
	if (action == "show" || (action == "" && $("#encryptionInput").length == 0)) {
		inject(componentName, `form`, "before", html(script, userData));
	} else {
		$("#encryptionInput").removeClass("fadeInUp").addClass("fadeOutDown");
		setTimeout(function () {
			$("#encryptionInput").remove();
		}, 288);
	}
};

export const encryptionInput = (script: Config, userData: UserData) => ({
	html: () => html(script, userData),
	close: (delay = 0) => close(script, userData, delay),
	inject: () => inject(componentName, "form", "before", html(script, userData)),
	//
	toggleInput: (action = "") => toggleInput(script, userData, action)
});
