import {
  charConnectionMark,
  lightToneMark,
  // sentencePunctuation,
  compositionChars,
} from "./constants";

export function isLomaji(char: string) {
  return isPiannImChar(char) || isDigit(char);
}

/**
 * Return whether `str` contains just digits.
 */
function isDigit(str: string) {
  return !!str.match(/^[0-9]+$/);
}

export function isBopomofo(char: string) {
  return !!char.match(/\p{sc=Bopomofo}/u);
}

// 敢是拼音字元
export function isPiannImChar(char: string) {
  if (!char) {
    return false;
  }
  // Ll: 小寫, Lu: 大寫, Mn: 有調號英文
  return !!char.match(/\p{Ll}|\p{Lu}|\p{Mn}|[ᴺ_'ⁿ]/u);
}

export function normalizeTaibun(text: string) {
  return (
    text
      // Non-printable characters to spaces
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, " ")
      // Apply MOE private characters that have since gotten Unicode encodings
      .replaceAll("\uE701", "\u{0002A736}")
      .replaceAll("\uF5E9", "\u{0002B74F}")
      .replaceAll("\uE35C", "\u{0002B75B}")
      .replaceAll("\uF5EA", "\u{0002B77A}")
      .replaceAll("\uF5EE", "\u{0002B77B}")
      .replaceAll("\uE703", "\u{0002B7BC}")
      .replaceAll("\uF5EF", "\u{0002B7C2}")
      .replaceAll("\uE705", "\u{0002C9B0}")
      .replaceAll("\uF5E7", "\u{000308FB}")
      .normalize("NFC")
  );
}

/**
 * Remove POJ/TL light tone from `text`, but only when `doIt` is truthy.
 * The if check is also in here to simplify variable assignment.
 */
function removeLightTone(doIt: boolean, text: string) {
  return doIt ? text.slice(2) : text;
}
/**
 * Add POJ/TL light tone onto `text`, but only when `doIt` is truthy.
 * The if check is also in here to simplify variable assignment.
 */
function addLightTone(doIt: boolean, text: string) {
  return doIt ? lightToneMark + text : text;
}

export class Char {
  hanlo: string;
  lomaji: string;
  // KeSi implements this as a check on whether hanlo starts with the light tone
  // mark. That is unnecessary, as Ji/Char doesn't expect to be changed and can
  // only be created via the constructor, and the constructor already knows if
  // it's light tone or not.
  isLightTone: boolean;
  constructor(hanlo: string, lomaji?: string, isLightTone = false) {
    this.hanlo = addLightTone(isLightTone, hanlo);
    this.lomaji =
      lomaji === undefined ? this.hanlo : addLightTone(isLightTone, lomaji);

    // Make sure the flag tracks the input correctly, but only once on init (here)
    this.isLightTone = isLightTone || hanlo.startsWith(lightToneMark);
  }
  kiphanlo() {
    return removeLightTone(
      this.isLightTone && !isLomaji(this.hanlo.at(2)),
      this.hanlo
    );
  }
  POJ() {
    const hanlo = removeLightTone(this.isLightTone, this.hanlo);
    const lomaji = removeLightTone(this.isLightTone, this.lomaji);
    // The light tone in the string is removed then added back
    return new Char(tsuanPOJ(hanlo), tsuanPOJ(lomaji), this.isLightTone);
  }
  KIP() {
    const hanlo = removeLightTone(this.isLightTone, this.hanlo);
    const lomaji = removeLightTone(this.isLightTone, this.lomaji);
    // The light tone in the string is removed then added back
    return new Char(tsuanKIP(hanlo), tsuanKIP(lomaji), this.isLightTone);
  }
  TL = this.KIP;
}

export class Word {
  characters: Char[];
  constructor() {
    this.characters = [];
  }
  hanlo() {
    const buntin = [];
    let prevCharIsLomaji = false;
    let wordHasLightTone = false;

    for (const ji of this.characters) {
      const jihanlo = ji.hanlo;
      if (ji.isLightTone) {
        // Mài thinn liân-jī-hû
        wordHasLightTone = true;
      } else if (prevCharIsLomaji && isLomaji(jihanlo[0])) {
        // L, L -> 'L-L'
        buntin.push(charConnectionMark);
      } else if (wordHasLightTone) {
        // --H, H -> '--H-H'
        buntin.push(charConnectionMark);
      }
      buntin.push(jihanlo);
      prevCharIsLomaji = isLomaji(jihanlo.at(-1));
    }
    return buntin.join("");
  }
  /**
   * 會 kā 文本標準化：
   * 判斷愛先添連字符無
   *   H, H -> 'HH'
   *   H, L -> 'HL'
   *   L, H -> 'LH'
   *   L, L -> 'L-L'
   *   L, --L -> 'L--L'
   */
  lomaji() {
    const buntin = [];
    let prevCharIsLomaji = false;
    let wordHasLightTone = false;

    for (const ji of this.characters) {
      const jilomaji = ji.lomaji;
      if (ji.isLightTone) {
        // Mài thinn liân-jī-hû
        wordHasLightTone = true;
      } else if (prevCharIsLomaji && isLomaji(jilomaji.at(0))) {
        // L, L -> 'L-L'
        buntin.push(charConnectionMark);
      } else if (wordHasLightTone) {
        // --H, H -> '--H-H'
        buntin.push(charConnectionMark);
      }
      buntin.push(jilomaji);
      prevCharIsLomaji = isLomaji(jilomaji.at(-1));
    }
    return buntin.join("");
  }
  /**
   * 會 kā 文本標準化：
   * 判斷愛先添連字符無
   *   H, H -> 'HH'
   *   H, L -> 'HL'
   *   L, H -> 'LH'
   *   L, L -> 'L-L'
   *   L, --L -> 'L--L'
   */
  kiphanlo() {
    const buntin = [];
    let prevCharIsLomaji = false;
    for (const ji of this.characters) {
      const jihanlo = ji.kiphanlo();
      if (prevCharIsLomaji && isLomaji(jihanlo.at(0))) {
        // L, L -> 'L-L'
        if (ji.isLightTone) {
          buntin.push(lightToneMark);
        } else {
          buntin.push(charConnectionMark);
        }
      }
    }
  }
  push(char: Char) {
    this.characters.push(char);
  }
  POJ() {
    const newWord = new Word();
    for (const ji of this.characters) {
      newWord.push(ji.POJ());
    }
    return newWord;
  }
  KIP() {
    const newWord = new Word();
    for (const ji of this.characters) {
      newWord.push(ji.KIP());
    }
    return newWord;
  }
  TL = this.KIP;
}

class AnalysisState {
  composeLength: number = 0;
  mode: "normal" | "compose" = "normal";
  wordArray;
  lightToneArray;
  notSameWordAsNextChar;
  thisWord: string;
  thisCharIsLightTone;
  thisWordIsLightToneWord;
  thisWordIsLightToneWordAndPartOfLightToneWord;
  constructor() {
    this.wordArray = [];
    this.lightToneArray = [];
    this.notSameWordAsNextChar = [];
    this.toNormalMode();
    // 組字式抑是數羅會超過一个字元
    this.thisWord = "";
    this.thisCharIsLightTone = false;
    this.thisWordIsLightToneWord = false;
    this.thisWordIsLightToneWordAndPartOfLightToneWord = false;
  }
  analysisResult() {
    return [this.wordArray, this.lightToneArray, this.notSameWordAsNextChar];
  }
  hasAnalysisData() {
    return this.wordArray.length > 0 || this.thisWordHasMoreObjects();
  }
  thisWordHasMoreObjects() {
    return this.thisWord !== "";
  }
  thisWordIsDigit() {
    return isDigit(this.thisWord);
  }
  toNormalMode() {
    this.mode = "normal";
    this.composeLength = 0;
  }
  toComposeMode() {
    this.mode = "compose";
    this.composeLength = -1;
  }
  isNormalMode() {
    this.mode === "normal";
  }
  isComposeMode() {
    this.mode === "compose";
  }
  composeModelAppendChar(char: string) {
    if (compositionChars.has(char)) {
      this.composeLength--;
    } else {
      this.composeLength++;
    }
  }
  composeLengthEnough() {
    return this.composeLength === 1;
  }
  thisWordAppendChar(char: string) {
    this.thisWord += char;
  }
  lastEndsWithO() {
    for (const o of ["o", "ó", "ò", "ô", "ǒ", "ō", "o̍", "ő"]) {
      if (this.thisWord.endsWith(o)) {
        return true;
      }
    }
    return false;
  }
}
