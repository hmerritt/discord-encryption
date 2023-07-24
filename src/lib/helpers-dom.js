import $ from "jquery";

/**
 * Checks if an element exists in the DOM.
 * 
 * @param {string} querySelector
 * @return {bool}
 */
export const elementExists = (querySelector) => {
	if ($(querySelector).length === 0) return false;
	return true;
}

/**
 * Fade an object in/out.
 * 
 * @param {string} querySelector
 * @param {string} fadeType
 * @param {number} delay
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
}

/**
 * Inject content into the page.
 * 
 * @param {string} name
 * @param {string} querySelector
 * @param {string} how
 * @param {string} content
 */
export const inject = (name, querySelector, how, content) => {
	//  Check if element has already been injected
	if (!this.elementExists(`[${this.script.name}=${name}]`)) {
		//  Decide how to add the content into the page
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
}

/**
 * Remove all elements matching a query.
 * 
 * @param {string} querySelector
 */
export const removeElements = (querySelector) => {
	$(querySelector).remove();
}
