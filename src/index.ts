const charConnectionMark = "-";
const lightToneMark = "--";

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
