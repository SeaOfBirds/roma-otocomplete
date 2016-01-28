/*eslint-disable strict, max-statements, complexity*/
"use strict";


const _hiraganaToRomaji = {
  "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
  "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
  "さ": "sa", "し": ["shi", "si"], "す": "su", "せ": "se", "そ": "so",
  "た": "ta", "ち": ["chi", "ti"], "つ": ["tsu", "tu"], "て": "te", "と": "to",
  "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
  "は": "ha", "ひ": "hi", "ふ": ["fu", "hu"], "へ": "he", "ほ": "ho",
  "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
  "や": "ya", "ゆ": "yu", "よ": "yo",
  "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
  "わ": "wa", "ゐ": ["i", "wi"], "ゑ": ["e", "we"], "を": ["o", "wo"],
  "ん": ["n", "nn"],
  "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
  "ざ": "za", "じ": ["ji", "zi"], "ず": "zu", "ぜ": "ze", "ぞ": "zo",
  "だ": "da", "ぢ": ["ji", "di", "zi"], "づ": ["zu", "du"], "で": "de", "ど": "do",
  "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
  "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po"
};

const _hiraganaYouonToRomaji = {
  "きゃ": "kya", "きゅ": "kyu", "きょ": "kyo",
  "しゃ": ["sha", "sya"], "しゅ": ["shu", "syu"], "しょ": ["sho", "syo"],
  "ちゃ": ["cha", "tya", "cya"], "ちゅ": ["chu", "tyu", "cyu"], "ちょ": ["cho", "tyo", "cyo"],
  "にゃ": "nya", "にゅ": "nyu", "にょ": "nyo",
  "ひゃ": "hya", "ひゅ": "hyu", "ひょ": "hyo",
  "みゃ": "mya", "みゅ": "myu", "みょ": "myo",
  "りゃ": "rya", "りゅ": "ryu", "りょ": "ryo",
  "ぎゃ": "gya", "ぎゅ": "gyu", "ぎょ": "gyo",
  "じゃ": ["ja", "zya"], "じゅ": ["ju", "zyu"], "じょ": ["jo", "zyo"],
  "ぢゃ": ["ja", "dya", "zya"], "ぢゅ": ["ju", "dyu", "zyu"], "ぢょ": ["jo", "dyo", "zyo"],
  "びゃ": "bya", "びゅ": "byu", "びょ": "byo",
  "ぴゃ": "pya", "ぴゅ": "pyu", "ぴょ": "pyo"
};

const _smallVowelToRomaji = {
  "ぁ": ["xa", "la", "a"],
  "ぃ": ["xi", "li", "i"],
  "ぅ": ["xu", "lu", "u"],
  "ぇ": ["xe", "le", "e"],
  "ぉ": ["xo", "lo", "o"]
};

const _longVowelToRomaji = {
  "aあ": ["a", "-", ""], "aー": ["-", "a", ""],
  "iい": ["i", "-", ""], "iー": ["-", "i", ""],
  "uう": ["u", "-", ""], "uー": ["-", "u", ""],
  "eえ": ["e", "-", ""], "eー": ["-", "e", ""],
  "oお": ["o", "-", ""], "oー": ["-", "o", ""],
  "eい": ["i", "-", "e", ""],
  "oう": ["u", "-", "o", ""]
};


const suteganaRegex = new RegExp(["ゃ", "ゅ", "ょ"].join("|"), "g");
const vowelRegex = new RegExp(["a", "i", "u", "e", "o"].join("|"), "g");
const hiraganaVowelRegex = new RegExp(["あ", "い", "う", "え", "お", "ー"].join("|"), "g");
const delimiterRegex = new RegExp([" ", "・", "＝"].join("|"), "g");


/** Class representing a romaji text romanized in several styles */
class RomajiText {
  /**
   * Create a romaji text
   * @constructor
   * @param {Array.<RomajiMora>} romajiMoras - An array of romaji moras
   * @param {Array.<int>} segmentLengths - An array of segment lengths
   */
  constructor(romajiMoras, segmentLengths) {
    this._romajiMoras = romajiMoras;
    this._styleIndices = Array(romajiMoras.length).fill(0);

    // Create a branch if necessary
    if (segmentLengths.length > 0) {
      const childRomajiMoras = romajiMoras.slice(segmentLengths[0]);
      const childSegmentLengths = segmentLengths.slice(1);

      this._child = new RomajiText(childRomajiMoras, childSegmentLengths);
      this._childStartIndex = segmentLengths[0];
    }
  }

  toString() {
    let text = "";
    for (const mora of this.moras) {
      text += mora.styles[0];
    }
    return text;
  }

  get moras() {
    return this._romajiMoras;
  }

  get child() {
    return this._child;
  }

  get childStartIndex() {
    return this._childStartIndex;
  }
}


/** Class representing a romaji text in specified styles of romanization */
class RomajiTextProxy {
  /**
   * Create a romaji text proxy
   * @constructor
   * @param {RomajiText} romajiText - the romaji text object
   * @param {RomajiTextProxy} [parentProxy] - (internal use) the parent proxy
   */
  constructor(romajiText, parentProxy) {
    this._romajiText = romajiText;
    this._parent = parentProxy;

    if (!parentProxy) {
      this._styleIndices = Array(romajiText.moras.length).fill(0);
      this._offset = 0;
    } else {
      this._styleIndices = parentProxy._styleIndices;    // Make a shallow copy
      this._offset = parentProxy._offset + parentProxy._romajiText.childStartIndex;
    }

    // Create a branch if necessary
    if (romajiText.child) {
      this._child = new RomajiTextProxy(romajiText.child, this);
    }
  }

  toString() {
    let text = "";

    for (const index in this.moras) {
      const mora = this.moras[index];
      const styleIndex = this._styleIndices[Number(index) + this._offset];
      const moraText = mora.styles[styleIndex];
      text += moraText;
    }

    return text;
  }

  setStyleAt(moraIndex, styleIndex) {
    this._styleIndices[Number(moraIndex) + this._offset] = styleIndex;
  }

  get moras() {
    return this._romajiText.moras;
  }

  get child() {
    return this._child;
  }
}


/** Class representing a mora in several styles */
class RomajiMora {
  constructor(styles, isSyllable, hasVowel = true) {
    this._styles = Array.isArray(styles) ? styles : [styles];   // Ensure styles as an array
    this._isSyllable = isSyllable;

    // Find a vowel in the mora
    if (hasVowel) {
      const mora = this._styles[0];
      const lastChar = mora[mora.length - 1];
      this._vowel = lastChar.search(vowelRegex) >= 0 ? lastChar : null;
    }

    // Find first characters in all styles
    {
      const firstCharSet = new Set();
      for (const style of this._styles) {
        if (style.length === 0) {
          continue;
        }
        firstCharSet.add(style[0]);
      }
      this._firstChars = Array.from(firstCharSet);
    }
  }

  get styles() {
    return this._styles;
  }

  set styles(styles) {
    this._styles = styles;
  }

  get isSyllable() {
    return this._isSyllable;
  }

  get vowel() {
    return this._vowel;
  }

  get firstChars() {
    return this._firstChars;
  }
}


const romajiMoraMap = {};

const _registerRomajiMoras = function (romajiMap, isSyllable = true) {
  for (const key of Object.keys(romajiMap)) {
    romajiMoraMap[key] = new RomajiMora(romajiMap[key], isSyllable);
  }
};

_registerRomajiMoras(_hiraganaToRomaji);
_registerRomajiMoras(_hiraganaYouonToRomaji);
_registerRomajiMoras(_smallVowelToRomaji, false);
_registerRomajiMoras(_longVowelToRomaji, false);


/**
 * Generate a romaji text from hiragana string
 * @param {string} kanaText - the hiragana string to be romanized
 * @return {RomajiText} the romaji text translated from the kanaText
 */
const hiraganaToRomajiText = exports.hiraganaToRomajiText = function (kanaText) {

  let kanaIndex = 0;
  const romajiMoras = [];
  const sokuonIndices = [];
  const delimiterIndices = [];

  while (kanaIndex < kanaText.length) {

    let currentKana = kanaText[kanaIndex];

    // Check to see if the current kana is a delimiter
    if (currentKana.search(delimiterRegex) >= 0) {
      delimiterIndices.push(romajiMoras.length);
      kanaIndex++;
      continue;

    // Check to see if the current kana is a youon
    } else if (kanaIndex + 1 < kanaText.length &&
               kanaText[kanaIndex + 1].search(suteganaRegex) >= 0) {
      kanaIndex++;
      currentKana += kanaText[kanaIndex];

    // Check to see if the current kana is a long vowel
    } else if (kanaIndex > 0 && currentKana.search(hiraganaVowelRegex) >= 0) {

      // Grab the vowel of the previous mora
      const lastMora = romajiMoras[romajiMoras.length - 1];
      const lastVowel = lastMora.vowel;

      if (lastVowel) {
        // Find the long vowel for this
        const longVowelKey = lastVowel + currentKana;
        if (_longVowelToRomaji.hasOwnProperty(longVowelKey)) {
          // Can be replaced as a long vowel
          currentKana = longVowelKey;
        }
      }
    }

    // Find its corresponding romaji mora
    let romajiMora;

    // Check to see if the current kana is a sokuon
    if (currentKana === "っ") {
      // Create a new mora so we can modify it later
      romajiMora = new RomajiMora(["xtu", "ltu"], false, false);
      sokuonIndices.push(romajiMoras.length);

    } else {
      romajiMora = romajiMoraMap[currentKana];
    }

    romajiMoras.push(romajiMora);
    kanaIndex++;
  }

  // Process all sokuons
  for (const sokuonIndex of sokuonIndices) {

    if (sokuonIndex + 1 >= romajiMoras.length) {
      // It's the last mora
      continue;
    }

    const sokuonMora = romajiMoras[sokuonIndex];
    const nextMora = romajiMoras[sokuonIndex + 1];

    // Acquire all potential consonants from the next mora
    const sokuonStyles = nextMora.firstChars;
    sokuonMora.styles = sokuonStyles.concat(sokuonMora.styles);
  }

  // Translate delimiter indices into segment lengths
  const segmentLengths = delimiterIndices.map((delimiterIndex, index, arr) => {
    if (index === 0) {
      return delimiterIndex;
    }
    const prevDelimiterIndex = arr[index - 1];
    return delimiterIndex - prevDelimiterIndex;
  });

  return new RomajiText(romajiMoras, segmentLengths);
};


const _defaultRomajiTextFunctor = function (elem) {

  if (elem instanceof RomajiText) {
    return elem;

  } else if (typeof elem === "string") {
    return hiraganaToRomajiText(elem);
  }

  throw new TypeError("For this array, a custom romajiTextFunctor must be implemented.");
};


const romajiTextProxyFunctor = function (elem) {
  if (typeof elem === "string") {
    return romajiTextProxyFunctor(hiraganaToRomajiText(elem));

  } else if (elem instanceof RomajiText) {
    return new RomajiTextProxy(elem);

  } else if (elem instanceof RomajiTextProxy) {
    return elem;
  }

  throw new TypeError("Failed to convert the given text to a RomajiText.");
};


/**
 * @param {string} query - the search string
 * @param {string|RomajiText|RomajiTextProxy} text - the hiragana string or romaji text compare with
 * @return {RomajiTextProxy}
 *    returns RomajiText if all query characters got matches with them, otherwise null
 */
const testQuery = exports.testQuery = function (query, text) {

  const romajiText = romajiTextProxyFunctor(text);

  // Check the first character is accepted
  const initialMora = romajiText.moras[0];
  let isInitialCharMatched = false;

  for (const style of initialMora.styles) {
    if (style[0] === query[0]) {
      isInitialCharMatched = true;
    }
  }

  if (!isInitialCharMatched) {
    // Try it on the next segment
    if (romajiText.child && testQuery(query, romajiText.child)) {
      return romajiText;    // return the root of romaji text
    }

    return false;
  }

  let romajiMoraIndex = 0;
  let queryIndex = 0;

  while (queryIndex < query.length && romajiMoraIndex < romajiText.moras.length) {
    const romajiMoraStyles = romajiText.moras[romajiMoraIndex].styles;

    let bestStyleIndex = 0;
    let bestStyleScore = -Infinity;
    let numCharsConsumedInBestStyle = 0;

    for (const styleIndex in romajiMoraStyles) {
      const mora = romajiMoraStyles[styleIndex];
      let score = 0;
      let queryIndexOffset = 0;
      let moraCharCounter = 0;

      while (queryIndex + queryIndexOffset < query.length && moraCharCounter < mora.length) {
        if (query[queryIndex + queryIndexOffset] === mora[moraCharCounter]) {
          score += 10;
          queryIndexOffset++;
        }
        moraCharCounter++;
      }

      // Full matching bonus
      if (queryIndexOffset === mora.length) {
        score += 5;
      }

      if (score > bestStyleScore) {
        bestStyleIndex = styleIndex;
        bestStyleScore = score;
        numCharsConsumedInBestStyle = queryIndexOffset;
      }
    }

    romajiText.setStyleAt(romajiMoraIndex, bestStyleIndex);
    queryIndex += numCharsConsumedInBestStyle;
    romajiMoraIndex++;
  }

  if (queryIndex < query.length) {
    return null;
  }

  return romajiText;
};


/**
 * Get a romaji text for the given object.
 *
 * @callback romajiTextFunctor
 * @param {object} object
 * @return {RomajiText} the romaji text
 */

/**
 * Get suggested texts for the given query
 * @param {string} query - the search string
 * @param {Array} arr - the array of objects compare with
 * @param {romajiTextFunctor} [romajiTextFunctor] - the functor that feeds corresponding romaji text
 * @return {Array} suggestions
 */
exports.getSuggestions = function (query, arr, romajiTextFunctor) {

  if (!romajiTextFunctor) {
    romajiTextFunctor = _defaultRomajiTextFunctor;
  }

  const results = [];

  for (const index in arr) {
    const elem = arr[index];
    const romajiText = romajiTextFunctor(elem);

    const bestRomajiText = testQuery(query, romajiText);
    if (bestRomajiText) {
      const result = {
        index,
        obj: elem,
        romajiText: bestRomajiText
      };
      results.push(result);
    }
  }

  /*results.sort((a, b) => {
    return a.romajiText.moras.length - b.romajiText.moras.length;
  });*/

  return results;
};


exports.hiraganaToRomaji = function (kanaText) {
  return hiraganaToRomajiText(kanaText).toString();
};
