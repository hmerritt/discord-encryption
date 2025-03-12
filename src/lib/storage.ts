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
    if (typeof window?.BdApi?.getData !== "undefined") {
      const getUserData = window?.BdApi?.getData(config.name, config.name);
      return JSON.parse(getUserData);
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

export const saveUserData = (userData: UserData) => {
  try {
    if (typeof window?.BdApi?.setData !== "undefined") {
      return window?.BdApi?.setData(
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
  const globalState = userData?.global?.state;
  const chatState = userData?.[channelId]?.state;
  return globalState || chatState ? true : false;
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
