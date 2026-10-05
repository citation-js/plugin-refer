import type { CSL } from '@citation-js/core'

interface ReferRecord {
  scheme: 'refer',
  type: string,
  fields: Record<string, string|string[]>
}

declare module '@citation-js/core' {
  namespace plugins {
    namespace input {
      interface Formats {
        '@refer/file': (input: string) => Array<ReferRecord>
        '@refer/record': (input: ReferRecord) => CSL
      }
    }

    namespace output {
      interface Formats {
        refer:
          | ((options: { format: 'object', lineEnding?: string }) => Array<ReferRecord>)
          | ((options?: { format?: 'text', lineEnding?: string }) => string)
      }
    }
  }
}
