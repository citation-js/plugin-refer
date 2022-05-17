/* eslint-env mocha */

import '../src/'

import assert from 'assert'
import { plugins } from '@citation-js/core'

const apiTests = [
  {
    name: 'book',
    input: `%A Julius Caesar
%A Homerus, (eds)
%D 2000 october 10
%I Eigenverlag
%T Sample Text Through the Ages
`,
    data: [{
      editor: [
        { family: 'Caesar', given: 'Julius' },
        { family: 'Homerus' }
      ],
      issued: { 'date-parts': [[2000, 10, 10]] },
      publisher: 'Eigenverlag',
      title: 'Sample Text Through the Ages',
      type: 'book'
    }]
  },
  {
    name: 'journal article',
    input: `%A Lars G. Willighagen
%J PeerJ Computer Science
%E Silvio Peroni
%V 5
%D 2019 august 12
%P e214
%T Citation.js: a format-independent, modular bibliography tool for the browser and command line
`,
    data: [{
      author: [{ family: 'Willighagen', given: 'Lars G.' }],
      editor: [{ family: 'Peroni', given: 'Silvio' }],
      page: 'e214',
      volume: '5',
      'container-title': 'PeerJ Computer Science',
      title: 'Citation.js: a format-independent, modular bibliography tool for the browser and command line',
      issued: { 'date-parts': [[2019, 8, 12]] },
      type: 'article-journal'
    }]
  },
  {
    name: 'chapter',
    input: `%A Julius Caesar
%B Sample Text Through the Ages
%E Homerus
%D 32
%P 2-14
%T Lorem Ipsum
`,
    data: [{
      author: [{ family: 'Caesar', given: 'Julius' }],
      editor: [{ family: 'Homerus' }],
      page: '2-14',
      'container-title': 'Sample Text Through the Ages',
      title: 'Lorem Ipsum',
      issued: { 'date-parts': [[32]] },
      type: 'chapter'
    }]
  },
  {
    name: 'report',
    input: `%A Julius Caesar
%D 32
%R USGOV 214
%T Usage of Trademarked Sample Text
`,
    data: [{
      author: [{ family: 'Caesar', given: 'Julius' }],
      number: 'USGOV 214',
      title: 'Usage of Trademarked Sample Text',
      issued: { 'date-parts': [[32]] },
      type: 'report'
    }]
  },
  {
    name: 'literal name',
    input: `%Q National Aeronautics and Space Administration
%D unknown
`,
    data: [{
      author: [{ literal: 'National Aeronautics and Space Administration' }],
      type: 'book'
    }]
  },
  {
    name: 'single editor',
    input: `%A Julius Caesar, (ed)
%D unknown
`,
    data: [{
      editor: [{ family: 'Caesar', given: 'Julius' }],
      type: 'book'
    }]
  },
  {
    name: 'multiple editors',
    input: `%A Julius Caesar
%A Homerus, (eds)
%D unknown
`,
    data: [{
      editor: [
        { family: 'Caesar', given: 'Julius' },
        { family: 'Homerus' }
      ],
      type: 'book'
    }]
  },
  {
    name: 'missing value',
    input: `%A 
%T Sample Text Through the Ages
`,
    data: [{
      title: 'Sample Text Through the Ages',
      type: 'book'
    }],
    output: `%D unknown
%T Sample Text Through the Ages
`
  },
  {
    name: 'unknown month',
    input: `%D 2022 spring
`,
    data: [{
      issued: { 'date-parts': [[2022]] },
      type: 'book'
    }],
    output: `%D 2022
`
  },
  {
    name: 'no day',
    input: `%D 2022 march
`,
    data: [{
      issued: { 'date-parts': [[2022, 3]] },
      type: 'book'
    }]
  },
  {
    name: 'unknown date',
    input: `%D unknown
`,
    data: [{ type: 'book' }]
  },
  {
    name: 'forthcoming publication',
    input: `%D forthcoming
`,
    data: [{
      status: 'forthcoming',
      type: 'book'
    }]
  },
  {
    name: 'name with title/suffix',
    input: `%A Julius Caesar,Jr.
%D unknown
`,
    data: [{
      author: [{ family: 'Caesar', given: 'Julius', suffix: 'Jr.' }],
      type: 'book'
    }]
  }
]

describe('refer', function () {
  describe('input', function () {
    for (const { name, input, data } of apiTests) {
      it(name, async function () {
        assert.deepStrictEqual(await plugins.input.chainAsync(input, { generateGraph: false }), data)
      })
    }
  })

  describe('output', function () {
    for (const { name, input, data, output = input } of apiTests) {
      it(name, function () {
        assert.deepStrictEqual(plugins.output.format('refer', data), output)
      })
    }
  })

  describe('object output', function () {
    for (const { name, input, data, output = input } of apiTests) {
      it(name, function () {
        const actualOutput = plugins.input.chainLink(output)
        assert.deepStrictEqual(plugins.output.format('refer', data, { format: 'object' }), actualOutput)
      })
    }
  })
})
