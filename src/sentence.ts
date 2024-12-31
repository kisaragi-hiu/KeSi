import {
  charConnectionMark,
  lightToneMark,
  // sentencePunctuation,
  compositionChars,
} from "./constants";
import { Char, Word, normalizeTaibun } from "./index";

const _切組物件分詞 = /(([^ ｜]*[^ ]｜[^ ][^ ｜]*) ?|[^ ]+)/;
const _是空白 = /[^\S\n]+/;
const _是分字符號 = `${charConnectionMark}+`;
const _是數字 = new Set("0123456789");
const _是多字元標點 = /(\.\.\.)|(……)|(──)/;

// _hunsik_tngji_tngsu
function analysisSplitCharSplitWords(text: string) {
  const isWhiteSpace = /^[^\S\n]+$/;
  const state = new AnalysisState();
  if (text.match(isWhiteSpace)) {
    return state.analysisResult();
  }
  let prevChar = undefined;
  let prevIsConnectionMark = false;
  let prevIsWhiteSpace = false;
  let prevIsLightToneMark = false;
  let prevIsBopomofo = false;
  let pos = 0;
  while (pos < text.length) {
    const char = text[pos];
    let thisIsConnectionMark = false;
    let thisIsWhiteSpace = false;
    let thisIsLightToneMark = false;
    let thisIsBopomofo = isBopomofo(char);
    if (state.mode === "compose") {
      state.thisWordAppendChar(char);
      state.composeModelAppendChar(char);
      if (state.composeLengthEnough()) {
        state.thisWordFlush();
        state.toNormalMode();
      }
    } else if (state.mode === "normal") {
    }
  }
}

// _tngsu
function splitWords(
  charArray: string[],
  lightToneArray: boolean[],
  notSameWordAsNextChar: boolean[]
) {
  const nestedWordArray = [];
  const nestedLightToneArray = [];
  let pos = 0;
  while (pos < charArray.length) {
    let end = pos;
    while (
      end < notSameWordAsNextChar.length &&
      !notSameWordAsNextChar.at(end)
    ) {
      end++;
    }
    end++;
    nestedWordArray.push(charArray.slice(pos, end));
    nestedLightToneArray.push(lightToneArray.slice(pos, end));
    pos = end;
  }
  return [nestedWordArray, nestedLightToneArray] as [string[][], boolean[][]];
}

// _bun_tsuan_sutin
function textToWordArray(textDict: string[][], lightToneDict: boolean[][]) {
  const wordArray = [];
  for (let i = 0; i < textDict.length; i++) {
    const wordStr = textDict[i];
    const lightTone = lightToneDict[i];
    const word = new Word();
    for (let j = 0; j < wordStr.length; j++) {
      word.push(new Char(wordStr[i], undefined, lightTone[i]));
    }
    wordArray.push(word);
  }
  return wordArray;
}

// _phe_tsuan_sutin
function pheToTextArray(
  hanloDict: string[][],
  lomajiDict: string[][],
  lightToneDict: boolean[][]
) {
  const wordArray: Word[] = [];
  for (let i = 0; i < hanloDict.length; i++) {
    const word = new Word();
    const hanloArray = hanloDict[i];
    const lomajiArray = lomajiDict[i];
    const lightToneArray = lightToneDict[i];
    for (let j = 0; j < hanloArray.length; j++) {
      word.push(new Char(hanloArray[j], lomajiArray[j], lightToneArray[j]));
    }
    wordArray.push(word);
  }
  return wordArray;
}

class Sentence {
  words: Word[];
  constructor(hanlo?: string, lomaji?: string) {
    if (hanlo !== undefined) {
      hanlo = normalizeTaibun(hanlo);
    }
    if (lomaji !== undefined) {
      lomaji = normalizeTaibun(lomaji);
    }
    if (hanlo === undefined) {
      hanlo = lomaji;
      lomaji = undefined;
    }

    if (hanlo === undefined) {
      this.words = [];
    } else if (lomaji === undefined) {
      const [tngji, tngji_khinsiann, si_bokangsu] =
        analysisSplitCharSplitWords(hanlo);
      const [bun, khinsiann] = splitWords(tngji, tngji_khinsiann, si_bokangsu);
      this.words = textToWordArray(bun, khinsiann);
    } else {
      // 以羅馬字ê斷字斷詞為主，漢羅文--ê無效
      const [tnghanlo] = analysisSplitCharSplitWords(hanlo);
      const [tnglomaji, tngji_khinsiann, si_bokangsu] =
        analysisSplitCharSplitWords(lomaji);

      if (tnghanlo.length !== tnglomaji.length) {
        throw new Error(
          `Sentence length mismatch: Hanlo is ${tnghanlo.length} chars, but lomaji is ${tnglomaji.length} chars`
        );
      }

      let [hanlo_tin] = splitWords(tnghanlo, tngji_khinsiann, si_bokangsu);
      let [lomaji_tin, khinsiann] = splitWords(
        tnglomaji,
        tngji_khinsiann,
        si_bokangsu
      );

      this.words = pheToTextArray(hanlo_tin, lomaji_tin, khinsiann);
    }
  }
}
