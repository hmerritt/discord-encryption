export const padChar = (
  str: string | number,
  size = 5,
  char = " ",
  append = false
): string => {
  str = String(str);
  while (str.length < size) str = append ? str + char : char + str;
  return str;
};
