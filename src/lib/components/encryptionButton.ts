import $ from "jquery";

import { config } from "../config";
import { fade, inject } from "../helpers-dom";
import { encryptionInput } from "./encryptionInput";
import {
  checkInputPassword,
  getEncryptionPassword,
  isEncryptionOn,
} from "../storage";

/**
 * Encryption button
 */

const componentName = "encryptionButton";

const html = (userData: any) => {
  const $button = document.createElement("button");
  $button.setAttribute(config.name, componentName);
  $button.setAttribute("state", `${isEncryptionOn(userData) ?? false}`);
  $button.setAttribute("class", componentName);

  $button.innerHTML = `
    <svg viewBox="0 0 24 24">
        <path fill d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M8.9,6C8.9,4.29 10.29,2.9 12,2.9C13.71,2.9 15.1,4.29 15.1,6V8H8.9V6M16,16H13V19H11V16H8V14H11V11H13V14H16V16Z" />
    </svg>
  `;

  $button.onclick = (evt: any) => {
    toggleState();
    $(`[role="textbox"]`).focus();
  };

  //  bind right click to adding encryption input
  $button.oncontextmenu = (evt: any) => {
    evt.preventDefault();
    encryptionInput.toggleInput(userData, "");
    $("#encryptionInput input").val(getEncryptionPassword(userData));
    checkInputPassword();
  };

  return $button;
};

const close = (delay = 0) => {
  config.version.ignoreUpdate = true;
  fade(`[${config.name}].${componentName}`, "out", delay);
};

const toggleState = () => {
  const $button = $(`[${config.name}].${componentName}`);

  if ($button.attr("state") === "true") {
    $button.attr("state", "false");
  } else {
    $button.attr("state", "true");
  }
};

export const encryptionButton = {
  html,
  close,
  toggleState,
  inject: (userData: any) =>
    inject(
      componentName,
      `button[aria-label="Upload a file or send invites"]`,
      "after",
      html(userData)
    ),
};
