import {
  complement,
  ifElse,
  mergeRight,
  pathEq,
  when,
} from 'ramda'
import { Bus } from 'baconjs'

var boldCyan = (text) => (
  `\x1b[1m\x1b[36m${text}\x1b[39m\x1b[22m`
)

const hasNoSkipLog = complement(
  pathEq(['action', 'skipLog'], true)
)

export const config = (() => {
  let params = {
    collapsed: false,
    predicate: hasNoSkipLog
  }

  return (addition) => (
    params = mergeRight(params, addition)
  )
})()

const skipDupeAction = (func) => {
  let prev = null

  return (args) => {
    if (!prev || prev.id !== args.action.id) {
      prev = args.action
      func(args)
    }
  }
}

const hasConsoleGroup = () => (
  typeof window !== 'undefined'
    && typeof console.group === 'function'
    && typeof console.groupCollapsed === 'function'
)

const callConsoleGroup = (description) => (
  config().collapsed
    ? console.groupCollapsed(description)
    : console.group(description)
)

const callConsoleGroupLog = (description) => {
  const text = boldCyan(description.trim())
  return config().consoleLog
    ? config().consoleLog(text)
    : console.log(text)
}

const consoleLog = (...args) => (
  config().consoleLog
    ? config().consoleLog.apply(config(), args)
    : console.log.apply(console, args)
)

const consoleInfo = (...args) => (
  config().consoleInfo
    ? config().consoleInfo.apply(config(), args)
    : console.info.apply(console, args)
)

const consoleGroup = ifElse(
  hasConsoleGroup,
  callConsoleGroup,
  callConsoleGroupLog
)

const consoleGroupEnd = () => (
  typeof console.groupEnd === 'function'
    && console.groupEnd()
)

// log only once for each action.
const logPreReduceToConsole = skipDupeAction(
  ({ action }) => {
    consoleLog('\n')
    consoleGroup('ACTION_' + action.type)
    consoleInfo('dispatch:', action)
    consoleGroupEnd()
  }
)

const logPostReduceToConsole = ({ name, state, nextState }) => {
  if (state !== nextState) {
    consoleGroup(' STORE_' + name)
    consoleLog('from state:', state)
    consoleLog('next state:', nextState)
    consoleGroupEnd()
  }
}

const shouldLog = (...args) => (
  config().predicate(...args)
)

const logPreReduce = when(
  shouldLog,
  logPreReduceToConsole
)

const logPostReduce = when(
  shouldLog,
  logPostReduceToConsole
)

export const getPreReduce = () => {
  const preStream = new Bus()

  return {
    input: preStream,
    output: preStream
      .doAction(logPreReduce)
  }
}

export const getPostReduce = () => {
  const postStream = new Bus()

  return {
    input: postStream,
    output: postStream
      .doAction(logPostReduce)
  }
}
