import { util } from '@citation-js/core'
import { parse as parseName, format as formatName } from '@citation-js/name'

const EDITORS_SUFFIX = /, \(eds?\)$/
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const TYPES = ['other', 'journal-article', 'book', 'article-in-book', 'tech-report']

const TYPE_MAPPING = {
  toTarget: {
    other: 'book',
    'journal-article': 'article-journal',
    book: 'book',
    'article-in-book': 'chapter',
    'tech-report': 'report'
  }
}

const CONVERTERS = {
  TYPE: {
    toTarget (type) { return TYPE_MAPPING.toTarget[type] }
  },
  NAME: {
    toTarget (name) {
      const [main, ...titles] = name.split(',')
      const parsedName = parseName(main)
      if (titles.length) {
        parsedName.suffix = titles.join(',')
      }
      return parsedName
    },
    toSource (name) {
      const formattedName = formatName({ ...name, suffix: undefined })
      if (name.suffix) {
        return formattedName + ',' + name.suffix
      } else {
        return formattedName
      }
    }
  },
  SINGLE_NAME: {
    toTarget (literal) { return [{ literal }] },
    toSource ([{ literal }]) { return literal }
  },
  NAMES: {
    toTarget (names) { return names.map(CONVERTERS.NAME.toTarget) },
    toSource (names) { return names.map(CONVERTERS.NAME.toSource) }
  },
  // Special case for NAMES for the A<->editor mapping, used when there are
  // editors but no authors. It does the same but removes/adds ", (ed[s])"
  // after the last author.
  EDITORS: {
    toTarget (names) {
      names = names.slice()
      names.push(names.pop().replace(EDITORS_SUFFIX, ''))
      names = CONVERTERS.NAMES.toTarget(names)
      return names
    },
    toSource (names) {
      names = CONVERTERS.NAMES.toSource(names)
      if (names.length > 1) {
        names[names.length - 1] += ', (eds)'
      } else {
        names[0] += ', (ed)'
      }
      return names
    }
  },
  DATE: {
    // Approximate port of the original implementation (ref.cpp)
    // https://git.savannah.gnu.org/cgit/groff.git/tree/src/preproc/refer/ref.cpp?h=519c94d0e36c6918fe1b1d0738a9039c698e5132
    // Returns [date, status]
    toTarget (date) {
      // find_year(), line 884
      // Finds the first number between 32-9999 (inclusive)
      const yearMatch = date.match(/(\D|^)([0-9]{4}|[0-9]{3}|[4-9]\d|3[2-9])(\D|$)/)

      if (!yearMatch) {
        return [undefined, date === 'unknown' ? undefined : date]
      }

      const parts = [parseInt(yearMatch[2], 10)]

      // find_month(), line 930
      const monthMatch = date.match(/[a-z]+/gi)
      if (monthMatch) {
        for (const match of monthMatch) {
          const index = MONTHS.findIndex(month => month.startsWith(match))
          if (index !== -1) {
            parts.push(index + 1)
          }
        }
      }

      if (parts.length === 2) {
        // find_day(), line 905
        // Finds the first number between 1-31 (inclusive), allowing
        // for one leading zero for single-digit numbers
        const dayMatch = date.match(/(\D|^)(3[01]|[12][0-9]|0?[1-9])(\D|$)/)
        if (dayMatch) {
          parts.push(parseInt(dayMatch[2], 10))
        }
      }

      return [{ 'date-parts': [parts] }, undefined]
    },
    toSource (date, status) {
      if (date && date['date-parts'] && Array.isArray(date['date-parts'][0])) {
        const parts = date['date-parts'][0].slice()
        if (parts[1]) {
          parts[1] = MONTHS[parts[1] - 1]
        }
        return parts.join(' ')
      }

      /* istanbul ignore else */
      if (status) {
        return status
      }
    }
  }
}

const MAPPING = [
  // type
  { source: 'type', target: 'type', convert: CONVERTERS.TYPE, when: { target: false } },

  // author
  {
    source: 'A',
    target: 'author',
    convert: CONVERTERS.NAMES,
    when: {
      source: { A (names) { return names && !EDITORS_SUFFIX.test(names[names.length - 1]) } },
      target: { author (names) { return names && (names.length > 1 || !names[0].literal) } }
    }
  },
  {
    source: 'Q',
    target: 'author',
    convert: CONVERTERS.SINGLE_NAME,
    when: {
      source: { A: false },
      target: { author (names) { return names && (names.length === 1 && names[0].literal) } }
    }
  },

  // collection-title
  { source: 'S', target: 'collection-title' },

  // container-title
  {
    source: 'J',
    target: 'container-title',
    when: { target: { type: ['article-journal', 'article-magazine', 'article-newspaper'] } }
  },
  {
    source: 'B',
    target: 'container-title',
    when: { source: { J: false }, target: { type: ['chapter', 'paper-conference'] } }
  },

  // editor
  {
    source: 'A',
    target: 'editor',
    convert: CONVERTERS.EDITORS,
    when: {
      source: { A (names) { return names && EDITORS_SUFFIX.test(names[names.length - 1]) } },
      target: { author: false }
    }
  },
  {
    source: 'E',
    target: 'editor',
    convert: CONVERTERS.NAMES,
    when: { target: { author: true } }
  },

  // issue
  { source: 'V', target: 'volume' },
  { source: 'N', target: 'issue' },

  // issued, status
  { source: 'D', target: ['issued', 'status'], convert: CONVERTERS.DATE },
  {
    source: 'D',
    when: {
      source: false,
      target: { issued: false, status: false }
    },
    convert: { toSource () { return 'unknown' } }
  },

  // keyword
  { source: 'K', target: 'keyword' },

  // citation-key, citation-label, id
  { source: 'L', target: 'citation-key' },
  { source: 'L', target: 'id', when: { target: { 'citation-key': false, 'citation-label': false } } },

  // note
  { source: 'X', target: 'note' },

  // number
  { source: 'R', target: 'number' },
  { source: 'G', target: 'number', when: { source: { R: false }, target: false } },

  // page
  { source: 'P', target: 'page' },

  // publisher, publisher-place
  { source: 'I', target: 'publisher' },
  { source: 'C', target: 'publisher-place' },

  // title
  { source: 'T', target: 'title' }
]

export function getRecordType (fields) {
  let typeNumber = 0
  if ('J' in fields) {
    typeNumber = 1
  } else if ('B' in fields) {
    typeNumber = 3
  } else if ('G' in fields || 'R' in fields) {
    typeNumber = 4
  } else if ('I' in fields) {
    typeNumber = 2
  }
  return TYPES[typeNumber]
}
export const translator = new util.Translator(MAPPING)
