import $ from "jquery";

import { config } from "../config";
import { fade, inject } from "../helpers-dom";

/**
 * Encryption button
 */

const componentName = "encryptionButton";

const html = (state: boolean) => {
  const $button = document.createElement("button");
  $button.setAttribute(config.name, componentName);
  $button.setAttribute("state", `${state}`);
  $button.setAttribute("class", componentName);

  $button.innerHTML = `
    <svg viewBox="0 0 24 24">
        <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
    </svg>
  `;

  $button.onclick = (evt: any) => {
    // Open link to GitHub if:
    // 1. User didn't click on close button
    // 2. ignoreUpdates is true
    if (evt?.target?.localName !== "span" && !config.version.ignoreUpdate) {
      window.open(config.link.repository, "_blank");
    }

    close(0);
  };

  return $button;
};

const close = (delay = 0) => {
  config.version.ignoreUpdate = true;
  fade(`[${config.name}].${componentName}`, "out", delay);
};

const toggleState = () => {
  const $button = $(`[${config.name}].${componentName}`);

  if ($button.attr("state") === "on") {
    $button.attr("state", "off");
  } else {
    $button.attr("state", "on");
  }
};

export const encryptionButton = {
  html,
  close,
  toggleState,
  inject: (state: boolean) =>
    inject(componentName, "button.da-attachButton", "after", html(state)),
};
