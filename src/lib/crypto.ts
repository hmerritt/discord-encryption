import $ from "jquery";
import crypto from "crypto-js";

import { UserData } from "./config";

export const PREFIX = "#!aes/";

export const encrypt = (msg: string, channelData: UserData["global"]) => {
  if (isMessageEncrypted(msg)) return msg;

  const key = crypto.SHA512(channelData.password);
  const iv = crypto.enc.Hex.parse("00000000000000000000000000000000");

  return crypto.AES.encrypt(msg, key, {
    iv: iv,
    padding: crypto.pad.Iso10126,
  }).toString();
};

export const decrypt = (msg: string, channelData: UserData["global"]) => {
  if (isMessageEncrypted(msg)) msg = msg.substring(6);

  const key = crypto.SHA512(channelData.password);
  const iv = crypto.enc.Hex.parse("00000000000000000000000000000000");

  return crypto.AES.decrypt(msg, key, {
    iv: iv,
    padding: crypto.pad.Iso10126,
  }).toString(crypto.enc.Utf8);
};

export const isMessageEncrypted = (msg: string) => {
  if (msg.substring(0, 6) === PREFIX) return true;
  return false;
};

//--------------------------------------------------------------------
//--------------------------------------------------------------------

export const decryptAllMessages = (channelData: UserData["global"]) => {
  // Loop all messages
  let markup = $(`div[class*="messageContent"]`);
  if (markup.length == 0) markup = $(`div[id*="message-content"]`);

  $(markup).each(function () {
    try {
      const message = $(this).text().trim();
      if (!isMessageEncrypted(message)) return;

      const decrypted = decrypt(message, channelData);
      if (!decrypted) throw "decryption failed";

      $(this).html(decrypted).addClass("decrypted");
    } catch (e) {
      $(this)
        .html("(failed to decrypt. most likely the wrong password)")
        .addClass("not-decrypted");
    }
  });
};
