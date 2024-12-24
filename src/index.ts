class Char {
  constructor() {}
  hanlo() {}
  lomaji() {}
  kiphanlo() {}
  isLightTone() {}
  POJ() {}
  KIP() {}
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
      if (ji.isLightTone()) {
        (" Mài thinn liân-jī-hû ");
        wordHasLightTone = true;
      } else if (prevCharIsLomaji && isLomaji(jihanlo[0])) {
        (" L, L -> 'L-L' ");
        buntin.push(LIAN_JI_HU);
      } else if (wordHasLightTone) {
        (" --H, H -> '--H-H' ");
        buntin.push(LIAN_JI_HU);
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
      } else if (prevCharIsLomaji && isLomaji(jilomaji[0])) {
        (" L, L -> 'L-L' ");
        buntin.push(LIAN_JI_HU);
      } else if (wordHasLightTone) {
        (" --H, H -> '--H-H' ");
        buntin.push(LIAN_JI_HU);
      }
      buntin.push(jilomaji);
      prevCharIsLomaji = isLomaji(jilomaji[-1]);
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
      const jihanlo = ji.kiphanlo;
      if (prevCharIsLomaji && isLomaji(jihanlo[0])) {
        // L, L -> 'L-L'
        if (ji.isLightTone) {
          buntin.push(KHIN_SIANN_HU);
        } else {
          buntin.push(LIAN_JI_HU);
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
