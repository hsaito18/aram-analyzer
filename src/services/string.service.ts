export const formatLargeInteger = (num: number): string => {
  const stringNum = num.toString();
  if (num < 10000) return stringNum;
  if (num < 100000) return stringNum.slice(0, 2) + "." + stringNum[2] + "k";
  if (num < 1000000) return stringNum.slice(0, 3) + "k";
  if (num < 10000000) return stringNum[0] + "." + stringNum.slice(1, 3) + "M";
  if (num < 100000000) return stringNum.slice(0, 2) + "." + stringNum[2] + "M";
  if (num < 1000000000) return stringNum.slice(0, 3) + "M";
  return "1B+";
};
