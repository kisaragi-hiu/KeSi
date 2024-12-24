import {
  charConnectionMark,
  lightToneMark,
  // sentencePunctuation,
} from "./constants";

function normalizeTaibun(text: string) {
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

class Char {
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

class Word {
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
        this._hunsik_tngji_tngsu(hanlo);
      const [bun, khinsiann] = this._tngsu(tngji, tngji_khinsiann, si_bokangsu);
      this.words = this._bun_tsuan_sutin(bun, khinsiann);
    } else {
      // 以羅馬字ê斷字斷詞為主，漢羅文--ê無效
      const [tnghanlo, _ps, _ps] = this._hunsik_tngji_tngsu(hanlo);
      const [tnglomaji, tngji_khinsiann, si_bokangsu] =
        this._hunsik_tngji_tngsu(lomaji);

      if (tnghanlo.length !== tnglomaji.length) {
        throw new TuiBeTse(
          `Kù bô pênn tn̂g: Hanlo tn̂g ${tnghanlo.length} jī, m̄-koh lomaji tn̂g ${tnglomaji.length} jī`
        );
      }
      let [hanlo_tin, _ps] = this._tngsu(
        tnghanlo,
        tngji_khinsiann,
        si_bokangsu
      );
      let [lomaji_tin, khinsiann] = this._tngsu(
        tnglomaji,
        tngji_khinsiann,
        si_bokangsu
      );
      this.words = this._phe_tsuan_sutin(hanlo_tin, lomaji_tin, khinsiann);
    }
  }
}
