import { config } from "../config";
import { fade, inject } from "../helpers-dom";

/**
 * Update panel. Displays when an update is available.
 */

const html = () => {
  const $div = document.createElement("div");
  $div.setAttribute(config.name, "updatePanel");
  $div.setAttribute("class", "updatePanel animated fadeInUp");

  $div.innerHTML = `
    <h2>An update is available for the discord encryption plugin!</h2>
    <span action="close">No Thanks</span>
  `;

  $div.onclick = (evt: any) => {
    // Open link to GitHub if:
    // 1. User didn't click on close button
    // 2. ignoreUpdates is true
    if (evt?.target?.localName !== "span" && !config.version.ignoreUpdate) {
      window.open(config.link.repository, "_blank");
    }

    close(0);
  };

  return $div;
};

const close = (delay = 0) => {
  config.version.ignoreUpdate = true;
  fade(`[${config.name}].updatePanel`, "out", delay);
};

export const updatePanel = {
  html,
  close,
  inject: inject("updatePanel", "form", "after", html()),
};
