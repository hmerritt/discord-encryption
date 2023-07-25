import $ from "jquery";

import { log } from "./log";
import { getChannelId } from "./helpers";
import { UserData, config } from "./config";

export const getUserData = (): UserData => {
  const defaultUserData = {
    global: {
      password: "",
      state: false,
    },
  };

  try {
    if (typeof window?.BdApi?.Data !== "undefined") {
      const getUserData = window?.BdApi?.Data.load(config.name, config.name);
      log("getUserData window?.BdApi?.Data.load", getUserData);
      if (getUserData?.global) return getUserData;
    }

    if (typeof localStorage !== "undefined") {
      const getUserData = JSON.parse(localStorage.getItem(config.name) || "");
      if (getUserData?.global) return getUserData;
    }
  } catch (error) {
    log("error", "Error parsing local storage", error);
  }

  return defaultUserData;
};

export const saveUserData = (userData: any) => {
  try {
    if (typeof window?.BdApi?.Data !== "undefined") {
      return window?.BdApi?.Data.save(
        config.name,
        config.name,
        JSON.stringify(userData)
      );
    }

    if (typeof localStorage !== "undefined") {
      return localStorage.setItem(config.name, JSON.stringify(userData));
    }

    log("warn", "No storage found, did not save data");
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
