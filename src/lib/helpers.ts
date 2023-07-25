import $ from "jquery";

import { config } from "./config";

/**
 * Checks if an element exists in the DOM.
 */
export const elementExists = (querySelector) => {
  if ($(querySelector).length === 0) return false;
  return true;
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
 * Inject content into the page. Prevents multiple injections.
 */
export const inject = (name, querySelector, how, content) => {
  //  Check if element has already been injected
  if (!elementExists(`[${config.name}=${name}]`)) {
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

export const removeElements = (querySelector) => {
  $(querySelector).remove();
};
