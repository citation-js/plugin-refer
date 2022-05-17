import { getRecordType, translator } from './shared.js'

function translateRecord (record) {
  const fields = translator.convertToSource(record)
  return { scheme: 'refer', type: getRecordType(fields), fields }
}

function formatRecord ({ fields }, lineEnding) {
  let record = ''
  for (const field in fields) {
    const values = [].concat(fields[field])
    for (const value of values) {
      record += '%' + field + ' ' + value + lineEnding
    }
  }
  return record
}

export default {
  /**
   * @param {Object} [options]
   * @param {String} [options.format="text"] - 'text' or 'object'
   * @param {String} [options.lineEnding="\n"]
   */
  refer (csl, options = {}) {
    const { format = 'text', lineEnding = '\n' } = options
    const records = csl.map(translateRecord)
    if (format === 'object') {
      return records
    } else {
      return records.map(record => formatRecord(record, lineEnding)).join(lineEnding)
    }
  }
}
