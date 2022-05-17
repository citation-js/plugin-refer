import { plugins } from '@citation-js/core'

import input from './input'
import output from './output'

plugins.add('@refer', { input, output })
