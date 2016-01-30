# roma-otocomplete [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> An autocomplete provider library for javascript.

## Installation

```sh
$ npm install --save roma-otocomplete
```

## Usage

```js
var romaOtocomplete = require('roma-otocomplete');
```

see [test/roma-otocomplete.js](https://github.com/SeaOfBirds/roma-otocomplete/blob/master/test/roma-otocomplete.js)


## Methods

### romaOtocomplete.hiraganaToRomaji(kanaText)
Returns the romanized string for the given hiragana text.
```js
RomaOtocomplete.hiraganaToRomaji("ふじさん") === "fujisan";  // true
```

### romaOtocomplete.hiraganaToRomajiText(kanaText)
Returns the RomajiText object for the given hiragana text.
```js
var romajiText = RomaOtocomplete.hiraganaToRomajiText("ぐらーふ・つぇっぺりん");

romajiText.toString() === "gura-futsuepperin");  // true
```

### romaOtocomplete.testQuery(query, kanaText)
Returns RomajiText if all query characters got matches with them, otherwise null.
```js
RomaOtocomplete.testQuery("choukai", "ちょうかい");  // RomajiText
RomaOtocomplete.testQuery("tyokai", "ちょうかい");  // RomajiText
RomaOtocomplete.testQuery("cho-kai", "ちょうかい");  // RomajiText
RomaOtocomplete.testQuery("tyookai", "ちょうかい");  // RomajiText
RomaOtocomplete.testQuery("maya", "ちょうかい");  // null
```

### romaOtocomplete.getSuggestions(query, array, [romajiTextFunctor])
Get suggested texts for the given query.
```js
var list = ["りゅうじょう", "りゅうほう", "しょうほう", "しょうかく", "たいほう"];
RomaOtocomplete.getSuggestions("ryu", list);
```


## License

MIT © [Spitice]()


[npm-image]: https://badge.fury.io/js/roma-otocomplete.svg
[npm-url]: https://npmjs.org/package/roma-otocomplete
[travis-image]: https://travis-ci.org/SeaOfBirds/roma-otocomplete.svg?branch=master
[travis-url]: https://travis-ci.org/SeaOfBirds/roma-otocomplete
[daviddm-image]: https://david-dm.org/SeaOfBirds/roma-otocomplete.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/SeaOfBirds/roma-otocomplete
[coveralls-image]: https://coveralls.io/repos/SeaOfBirds/roma-otocomplete/badge.svg
[coveralls-url]: https://coveralls.io/r/SeaOfBirds/roma-otocomplete
