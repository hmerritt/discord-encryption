/**
 * @returns the channel id for current chat.
 */
export const getChannelId = () => {
  return window.location.pathname.split("/").pop();
};
