import { config } from "./config";

/**
 * Creates a log in the console.
 *
 * @param {string} msg
 * @param {string} type
 */
export const log = (msg, type = "") => {
  const prefix = `[${config.name}]`;

  switch (type) {
    case "error":
      console.error(prefix, msg);
      break;

    case "warning":
      console.warn(prefix, msg);
      break;

    default:
      console.log(prefix, msg);
  }
};
