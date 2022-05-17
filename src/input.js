import { getRecordType, translator } from './shared.js'

function parseRecord (record) {
  const fields = {}

  for (const line of record.split(/\n/g)) {
    let [field, ...value] = line.slice(1).split(' ')
    value = value.join(' ')
    field = field.toUpperCase()
    if (value === undefined || value === '') {
      continue
    }

    if (field === 'A' || field === 'E') {
      if (!(field in fields)) { fields[field] = [] }
      fields[field].push(value)
    } else {
      fields[field] = value
    }
  }

  return { scheme: 'refer', type: getRecordType(fields), fields }
}

function parseFile (file) {
  return file.trim().replace(/\r\n?/g, '\n').split(/\n\n+/).map(parseRecord)
}

export default {
  '@refer/file': {
    parse: parseFile,
    parseType: {
      dataType: 'String',
      tokenList: { token: /^(%[A-Za-z] |$)/, split: /\r\n?|\n/g, trim: false }
    }
  },

  '@refer/record': {
    parse (record) {
      return translator.convertToTarget({ type: record.type, ...record.fields })
    },
    parseType: {
      dataType: 'SimpleObject',
      propertyConstraint: {
        props: 'scheme',
        value (value) { return value === 'refer' }
      }
    }
  }
}
