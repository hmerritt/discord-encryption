import { Config, UserData } from "../config";
import { fade, inject } from "../helpers";

/**
 * Update panel. Displays when an update is available.
 */

const componentName = "updatePanel";

const html = (script: Config, userData: UserData) => {
  const $div = document.createElement("div");
  $div.setAttribute(script.name, componentName);
  $div.setAttribute("class", `${componentName} animated fadeInUp`);

  $div.innerHTML = `
    <h2>An update is available for the discord encryption plugin!</h2>
    <span action="close">No Thanks</span>
  `;

  $div.onclick = (evt: any) => {
    // Open link to GitHub if:
    // 1. User didn't click on close button
    // 2. ignoreUpdates is true
    if (evt?.target?.localName !== "span" && !script.version.ignoreUpdate) {
      window.open(script.link.repository, "_blank");
    }

    close(script, userData, 0);
  };

  return $div;
};

const close = (script: Config, userData: UserData, delay = 0) => {
  script.version.ignoreUpdate = true;
  fade(`[${script.name}].${componentName}`, "out", delay);
};

export const updatePanel = (script: Config, userData: UserData) => ({
  html: () => html(script, userData),
  close: (delay = 0) => close(script, userData, delay),
  inject: () => inject(componentName, "form", "after", html(script, userData)),
});
