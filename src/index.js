import { plugins } from '@citation-js/core'

import input from './input.js'
import output from './output.js'

plugins.add('@refer', { input, output })
