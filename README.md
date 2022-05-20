# @citation-js/plugin-refer

This plugin adds support for the reference file format used by [refer](https://en.wikipedia.org/wiki/Refer_(software)).

[![NPM version](https://img.shields.io/npm/v/@citation-js/plugin-refer.svg)](https://npmjs.org/package/@citation-js/plugin-refer)
[![Codecov](https://img.shields.io/codecov/c/gh/citation-js/plugin-refer)](https://app.codecov.io/gh/citation-js/plugin-refer)
[![NPM total downloads](https://img.shields.io/npm/dt/@citation-js/plugin-refer.svg)](https://npmcharts.com/compare/@citation-js%2Fplugin-refer?minimal=true)
![License](https://img.shields.io/npm/l/@citation-js/plugin-refer.svg)

## Install

```js
npm install @citation-js/plugin-refer
```

## Use

Install the plugin by `require`-ing it:

```js
require('@citation-js/plugin-refer')
const { Cite } = require('@citation-js/core')

// ...
```

## Formats

### Input

**`@refer/file`**

A text file in the refer format.

```js
const data = Cite(`%A Lars G. Willighagen
%J PeerJ Computer Science
%E Silvio Peroni
%V 5
%D 2019 august 12
%P e214
%T Citation.js: a format-independent, modular bibliography tool for the browser and command line
`)

data.format('data', { format: 'object' }) // returns:
{
  author: [{ family: 'Willighagen', given: 'Lars G.' }],
  editor: [{ family: 'Peroni', given: 'Silvio' }],
  page: 'e214',
  volume: '5',
  'container-title': 'PeerJ Computer Science',
  title: 'Citation.js: a format-independent, modular bibliography tool for the browser and command line',
  issued: { 'date-parts': [[2019, 8, 12]] },
  type: 'article-journal'
}
```

### Output

**`refer`**

```js
data.format('refer', { format: 'text', lineEnding: '\n' })
```

Options:
  - `format` (string): `'text'` (default; for plain text file) or `'object'` (for array of objects)
  - `lineEnding` (string): e.g. `'\n'` (default) or `'\r\n'` (note that refer might not pick up on the latter)
