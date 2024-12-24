export const charConnectionMark = "-";
export const lightToneMark = "--";
export const sentencePunctuation = new Set([
  "、",
  "﹑",
  "､",
  "-",
  "—",
  "~",
  "～",
  "·",
  "‧", // 外國人名中間
  "'",
  "＇",
  '"',
  "‘",
  "’",
  "“",
  "”",
  "〝",
  "〞",
  "′",
  "‵",
  "「",
  "」",
  "｢",
  "｣",
  "『",
  "』",
  "【",
  "】",
  "〈",
  "〉",
  "《",
  "》",
  "（",
  "）",
  "＜",
  "＞",
  "(",
  ")",
  "<",
  ">",
  "[",
  "]",
  "{",
  "}",
  "+",
  "*",
  "/",
  "=",
  "^",
  "＋",
  "－",
  "＊",
  "／",
  "＝",
  "$",
  "#",
  "#",
  ":",
  "：",
  "﹕",
  "–",
  "—",
  "―",
  "─",
  "──",
  "｜",
  "︱",
  "•",
]);
export const sentenceSplitPunctuation = new Set([
  "\n",
  "，",
  "。",
  "．",
  "！",
  "？",
  "…",
  "……",
  "...",
  ",",
  ".",
  "!",
  "?",
  "﹐",
  "﹒",
  "﹗",
  "﹖",
  ";",
  "；",
  "﹔",
]);
export const punctuations = sentencePunctuation.union(sentenceSplitPunctuation);
export const nonPrintableChars =
  "[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]";

export const validTones = new Set(["", "ˊ", "ˋ", "ˇ", "+", "^"]);

const NGOO_SIU_LE = {
  "0": "˙",
  "1": "",
  "2": "ˋ",
  "3": "˪",
  "4": "",
  "5": "ˊ",
  "6": "˫",
  "7": "˫",
  "8": "㆐",
  "9": "^",
  "10": "㆐",
};

export const compositionChars = new Set("⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻⿿");
