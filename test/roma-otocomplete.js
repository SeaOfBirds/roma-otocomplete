/*eslint-disable max-statements*/
import assert from "assert";
import RomaOtocomplete from "../lib/roma-otocomplete";
//const ships = requires("./ships");

describe("Hiragana to Romaji", () => {
  describe("Simple hiragana text", () => {
    it("should be \"konnichiha\".", () => {
      assert.equal(RomaOtocomplete.hiraganaToRomaji("こんにちは"), "konnichiha");
    });
  });

  describe("Complex hiragana text", () => {
    it("should be appropriate romaji text.", () => {
      assert.equal(RomaOtocomplete.hiraganaToRomaji("ふじさん"), "fujisan");
      assert.equal(RomaOtocomplete.hiraganaToRomaji("おちゃ"), "ocha");
      assert.equal(RomaOtocomplete.hiraganaToRomaji("ちじ"), "chiji");
      assert.equal(RomaOtocomplete.hiraganaToRomaji("ちぢむ"), "chijimu");
      assert.equal(RomaOtocomplete.hiraganaToRomaji("つづく"), "tsuzuku");
    });
  });

  describe("Hiragana text with 長音符(ー)", () => {
    it("has choonpu.", () => {
      assert.equal(RomaOtocomplete.hiraganaToRomaji("ぐらーふ"), "gura-fu");
    });
  });

  describe("Hiragana text with 促音(っ)", () => {
    it("has sokuon.", () => {
      assert.equal(RomaOtocomplete.hiraganaToRomaji("つぇっぺりん"), "tsuepperin");
    });
  });
});

describe("Testing queries", () => {
  it("should be qualified.", () => {
    assert.ok(RomaOtocomplete.testQuery("ryuujou", "りゅうじょう"));
    assert.ok(RomaOtocomplete.testQuery("rj", "りゅうじょう"));
    assert.ok(!RomaOtocomplete.testQuery("ryuuhou", "りゅうじょう"));
  });

  it("should be qualified so we can use multiple styles of romanization.", () => {
    assert.ok(RomaOtocomplete.testQuery("choukai", "ちょうかい"), "ちょうかい -> choukai");
    assert.ok(RomaOtocomplete.testQuery("tyokai", "ちょうかい"), "ちょうかい -> tyokai");
    assert.ok(RomaOtocomplete.testQuery("cho-kai", "ちょうかい"), "ちょうかい -> cho-kai");
    assert.ok(RomaOtocomplete.testQuery("tyookai", "ちょうかい"), "ちょうかい -> tyookai");
    assert.ok(!RomaOtocomplete.testQuery("maya", "ちょうかい"), "ちょうかい !-> maya");
  });

  it("should consider the bonus score when every characters in a mora are matched all.", () => {
    assert.equal(RomaOtocomplete.testQuery("siratuyu", "しらつゆ").toString(), "siratuyu");
    assert.equal(RomaOtocomplete.testQuery("shiratsuyu", "しらつゆ").toString(), "shiratsuyu");
    assert.equal(RomaOtocomplete.testQuery("shirauyu", "しらつゆ").toString(), "shiratsuyu");
    assert.equal(RomaOtocomplete.testQuery("srty", "しらつゆ").toString(), "shiratsuyu");
  });

  it("has choonpu.", () => {
    assert.ok(RomaOtocomplete.testQuery("graahu", "ぐらーふ"));
    assert.ok(RomaOtocomplete.testQuery("grafu", "ぐらーふ"));
    assert.ok(!RomaOtocomplete.testQuery("graaaafu", "ぐらーふ"));
  });

  it("has sokuon.", () => {
    assert.ok(RomaOtocomplete.testQuery("tuepp", "つぇっぺりん"));
    assert.ok(RomaOtocomplete.testQuery("tuepperin", "つぇっぺりん"));
    assert.ok(RomaOtocomplete.testQuery("textuein", "つぇっぺりん"));
  });
});

describe("Suggestions", () => {
  const contains = function (suggestions, kanaText) {
    for (const suggestion of suggestions) {
      if (suggestion.obj === kanaText) {
        return true;
      }
    }
    return false;
  };

  it("should contains appropriate suggestions", () => {
    const list = ["おおい", "おおしお", "しおい"];
    const suggestions = RomaOtocomplete.getSuggestions("o-i", list);
    assert.ok(contains(suggestions, "おおい"));
    assert.ok(contains(suggestions, "おおしお"));
    assert.ok(!contains(suggestions, "しおい"));
  });

  it("should contains appropriate suggestions", () => {
    const list = ["りゅうじょう", "りゅうほう", "しょうほう", "しょうかく", "たいほう"];

    let suggestions = RomaOtocomplete.getSuggestions("ryu", list);
    assert.ok(contains(suggestions, "りゅうじょう"));
    assert.ok(contains(suggestions, "りゅうほう"));
    assert.ok(!contains(suggestions, "しょうほう"));
    assert.equal(suggestions.length, 2);

    suggestions = RomaOtocomplete.getSuggestions("rj", list);
    assert.ok(contains(suggestions, "りゅうじょう"));
    assert.ok(!contains(suggestions, "りゅうほう"));
    assert.equal(suggestions.length, 1);

    suggestions = RomaOtocomplete.getSuggestions("sy", list);
    assert.ok(contains(suggestions, "しょうほう"));
    assert.ok(contains(suggestions, "しょうかく"));
    assert.ok(!contains(suggestions, "たいほう"));
    assert.equal(suggestions.length, 2);

    suggestions = RomaOtocomplete.getSuggestions("th", list);
    assert.ok(!contains(suggestions, "しょうほう"));
    assert.ok(!contains(suggestions, "しょうかく"));
    assert.ok(contains(suggestions, "たいほう"));
    assert.equal(suggestions.length, 1);
  });
});

describe("Delimiters", () => {
  it("should have two segments", () => {
    const romajiText = RomaOtocomplete.hiraganaToRomajiText("ぐらーふ・つぇっぺりん");
    assert.ok(romajiText.child);
    assert.equal(romajiText.toString(), "gura-futsuepperin");
    assert.equal(romajiText.child.toString(), "tsuepperin");
  });

  it("should be qualified", () => {
    assert.ok(RomaOtocomplete.testQuery("puri", "ぷりんつ・おいげん"));
    assert.ok(RomaOtocomplete.testQuery("oig", "ぷりんつ・おいげん"));
    assert.equal(RomaOtocomplete.testQuery("oig", "ぷりんつ・おいげん").toString(), "purintsuoigen");
    assert.equal(RomaOtocomplete.testQuery("oignn", "ぷりんつ・おいげん").toString(), "purintsuoigenn");
  });

  it("should be qualified", () => {
    assert.ok(RomaOtocomplete.testQuery("gurapperin", "ぐらーふ つぇっぺりん"));
    assert.ok(RomaOtocomplete.testQuery("tsueppe", "ぐらーふ＝つぇっぺりん"));
  });
});
