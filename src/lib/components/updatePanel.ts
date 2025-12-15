import { setIgnoreUpdate } from "state/actions";
import { store } from "state/store";

import { fade, inject } from "../helpers";

/**
 * Update panel. Displays when an update is available.
 */

const componentName = "updatePanel";

const markup = () => {
	const $div = document.createElement("div");
	$div.setAttribute(store.state.config.name, componentName);
	$div.setAttribute("class", `${componentName} animated fadeInUp`);

	$div.innerHTML = html`
		<h2>An update is available for the discord encryption plugin!</h2>
		<span action="close">No Thanks</span>
	`;

	$div.onclick = (evt: any) => {
		// Open link to GitHub if:
		// 1. User didn't click on close button
		// 2. ignoreUpdates is true
		if (
			evt?.target?.localName !== "span" &&
			!store.state.config.version.ignoreUpdate
		) {
			window.open(store.state.config.link.repository, "_blank");
		}

		close(0);
	};

	return $div;
};

const close = (delay = 0) => {
	setIgnoreUpdate(true);
	fade(`[${store.state.config.name}].${componentName}`, "out", delay);
};

export const updatePanel = () => ({
	html: markup,
	close: (delay = 0) => close(delay),
	inject: () => inject(componentName, "form", "after", markup())
});
