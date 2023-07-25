import $ from "jquery";

import { config } from "../config";
import { fade, inject } from "../helpers-dom";

/**
 * Encryption input
 */

const componentName = "encryptionInput";

const html = () => {
  const $div = document.createElement("div");
  $div.setAttribute("id", componentName);
  $div.setAttribute(config.name, componentName);
  $div.setAttribute("class", `${componentName} animated fadeInUp`);

  $div.innerHTML = `
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <path fill="#ddd" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
    </svg>
    <input placeholder="Encryption password" type="password">
  `;

  // $div.onclick = (evt: any) => {
  //   toggleState();
  // };

  return $div;
};

const close = (delay = 0) => {
  config.version.ignoreUpdate = true;
  fade(`[${config.name}].${componentName}`, "out", delay);
};

const toggleInput = (action = "") => {
  if (action == "show" || (action == "" && $("#encryptionInput").length == 0)) {
    inject(componentName, `form`, "append", html());
  } else {
    $("#encryptionInput").removeClass("fadeInUp").addClass("fadeOutDown");
    setTimeout(function () {
      $("#encryptionInput").remove();
    }, 288);
  }
};

export const encryptionInput = {
  html,
  close,
  toggleInput,
  inject: () => inject(componentName, `form`, "append", html()),
};
