import $ from "jquery";

import { log } from "./log";
import { config } from "./config";
import { getChannelId } from "./discord";

export const getUserData = () => {
  const defaultUserData = {
    global: {
      password: "",
      state: false,
    },
  };

  if (typeof localStorage === "undefined") return defaultUserData;

  try {
    const getUserData = JSON.parse(localStorage.getItem(config.name) || "");
    if (getUserData?.global) return getUserData;
  } catch (error) {
    log("error", "Error parsing local storage", error);
    return defaultUserData;
  }

  return defaultUserData;
};

export const saveUserData = (userData: any) => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(config.name, JSON.stringify(userData));
    } else {
      log("warn", "localStorage not found, did not save data");
    }
  } catch (error) {
    log("error", "Error saving to local storage", error);
  }
};

export const isEncryptionOn = (
  userData: any,
  channelId = getChannelId() || ""
) => {
  log(userData);
  let globalState = userData?.global?.state;
  let chatState = userData?.[channelId] ? userData?.[channelId]?.state : false;

  if (globalState || chatState) {
    return true;
  }

  return false;
};

export const getEncryptionPassword = (
  userData: any,
  channelId = getChannelId() || ""
): string => {
  return userData?.[channelId]?.password || userData?.global?.password || "";
};

export const checkInputPassword = () => {
  //  if password is less than 3 - turn red
  if ($("#encryptionInput input").val().length < 3) {
    $("#encryptionInput").removeClass("nice-password");
  } else {
    $("#encryptionInput").addClass("nice-password");
  }
};
