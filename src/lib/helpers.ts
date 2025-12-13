import $ from "jquery";

import { UserData, config } from "./config";

/**
 * Checks if an element exists in the DOM.
 */
export const elementExists = (querySelector: string) => {
	return !!document.querySelector(querySelector);
};

/**
 * Fade an object in/out.
 */
export const fade = (querySelector, fadeType, delay = 0) => {
	setTimeout(function () {
		if (fadeType === "in") {
			$(querySelector).removeClass("fadeOutDown").addClass("fadeInUp");
		} else if (fadeType === "out") {
			$(querySelector).removeClass("fadeInUp").addClass("fadeOutDown");
			setTimeout(function () {
				$(querySelector).remove();
			}, 500);
		}
	}, delay);
};

/**
 * The channel id for current chat.
 */
export const getChannelId = () => {
	return window.location.pathname.split("/").pop();
};

/**
 * Create object if it does not exist.
 */
export const getOrCreateUserData = (userData: UserData, channelId = "global") => {
	if (!userData[channelId]) {
		userData[channelId] = {
			state: userData?.global?.state ?? false,
			password: userData?.global?.password ?? ""
		};
	}

	return userData[channelId];
};

/**
 * Run async task, catching and returning any errors as a variable (similar to Go).
 *
 * @example const [result, error] = await run(myPromise())
 */
export const run = async <T, E = Error>(
	promise: Promise<T> | (() => Promise<T>)
): Promise<[T, null] | [T, E]> => {
	try {
		if (typeof promise === "function") promise = promise();
		const result = await promise;
		return [result, null];
	} catch (error) {
		return [null as T, error as E];
	}
};

/**
 * Run synchronous task, catching and returning any errors as a variable (similar to Go).
 *
 * @example const [result, error] = runSync(() => myFn(...props))
 */
export const runSync = <R, E = Error>(cb: () => R): [R, null] | [R, E] => {
	try {
		const result = cb();
		return [result, null];
	} catch (error) {
		return [null as R, error as E];
	}
};

/**
 * Inject content into the page. Prevents multiple injections.
 */
export const inject = (name, querySelector, how, content) => {
	// Check if element has already been injected
	if (!elementExists(`[${config.name}=${name}]`)) {
		// Decide how to add the content into the page
		switch (how) {
			case "append":
				$(querySelector).append(content);
				break;

			case "prepend":
				$(querySelector).prepend(content);
				break;

			case "after":
				$(querySelector).after(content);
				break;

			case "before":
				$(querySelector).before(content);
				break;
		}
	}
};

export const padChar = (
	str: string | number,
	size = 5,
	char = " ",
	append = false
): string => {
	str = String(str);
	while (str.length < size) str = append ? str + char : char + str;
	return str;
};

/**
 * Remove every element that matches the selector
 */
export const removeAll = (selector: string) => {
	const $el = selectAll(selector);
	if (!$el) return;
	$el.forEach((el) => el.remove());
};

/**
 * Shorthand for querySelector
 */
export const select = <E extends Element>(
	selector: string,
	from: Element | Document = undefined
) => {
	if (from === undefined) from = document;
	else if (from === null) return null;
	return from.querySelector(selector) as E;
};

/**
 * Shorthand for querySelectorAll
 */
export const selectAll = <E extends Element>(
	selector: string,
	from: Element | Document = undefined
) => {
	if (from === undefined) from = document;
	else if (from === null) return null;
	return from.querySelectorAll(selector) as NodeListOf<E>;
};

/**
 * Returns the first `document.querySelectorAll` match from an array of selectors
 */
export const selectAllFirstMatch = <E extends Element>(selectors: string[]) => {
	let markup: any;
	for (const selector of selectors) {
		const $el = document.querySelectorAll(selector);
		if ($el?.length) {
			markup = $el;
			break;
		}
	}
	return markup as NodeListOf<E>;
};

//--------------------------------------------------------------------
//--------------------------------------------------------------------

export class Dummy {
	constructor() {}
	start() {}
	stop() {}
}

export const downloadRequiredLibraryIfMissing = () => {
	if (window.ZeresPluginLibrary) return;

	window.BdApi.UI.showConfirmationModal(
		"Library Missing",
		`The library plugin needed for ${config.nameTitle} is missing. Please click Download Now to install it.`,
		{
			confirmText: "Download Now",
			cancelText: "Cancel",
			onConfirm: () => {
				require("request").get(
					"https://betterdiscord.app/gh-redirect?id=9",
					async (err, resp, body) => {
						if (err)
							return require("electron").shell.openExternal(
								"https://betterdiscord.app/Download?id=9"
							);
						if (resp.statusCode === 302) {
							require("request").get(
								resp.headers.location,
								async (error, response, content) => {
									if (error)
										return require("electron").shell.openExternal(
											"https://betterdiscord.app/Download?id=9"
										);
									await new Promise((r) =>
										require("fs").writeFile(
											require("path").join(
												BdApi.Plugins.folder,
												"0PluginLibrary.plugin.js"
											),
											content,
											r
										)
									);
								}
							);
						} else {
							await new Promise((r) =>
								require("fs").writeFile(
									require("path").join(
										BdApi.Plugins.folder,
										"0PluginLibrary.plugin.js"
									),
									body,
									r
								)
							);
						}
					}
				);
			}
		}
	);
};
