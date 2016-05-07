import R from 'ramda';
import Bacon from 'baconjs';

var boldCyan = (text) => (
  `\x1b[1m\x1b[36m${text}\x1b[39m\x1b[22m`
);

const hasNoSkipLog = R.complement(
  R.pathEq(['action', 'skipLog'], true)
);

const mergeParams = (params, addition) => (
  Object.assign({}, params, addition)
);

const mergeConfig = R.ifElse(
  R.nthArg(1),
  mergeParams,
  R.nthArg(0)
);

export const config = (() => {
  let params = {
    collapsed: false,
    predicate: hasNoSkipLog
  };

  return (addition) => (
    params = mergeConfig(params, addition)
  );
})();

const skipDupeAction = (func) => {
  let prev = null;

  return (args) => {
    if (!prev || prev.id !== args.action.id) {
      prev = args.action;
      func(args);
    }
  };
};

const hasConsoleGroup = () => (
  'group' in console
);

const callConsoleGroup = (description) => (
  config().collapsed
    ? console.groupCollapsed(description)
    : console.group(description)
);

const callConsoleGroupLog = (description) => (
  console.log(boldCyan(description.trim()))
);

const consoleLog = (...args) => (
  console.log.apply(console, args)
);

const consoleInfo = (...args) => (
  console.info.apply(console, args)
);

const consoleGroup = R.ifElse(
  hasConsoleGroup,
  callConsoleGroup,
  callConsoleGroupLog
);

const callConsoleGroupEnd = () => (
  console.groupEnd()
);

const consoleGroupEnd = R.partial(
  R.ifElse(
    hasConsoleGroup,
    callConsoleGroupEnd,
    R.always()
  ),
  [null]
);

// log only once for each action.
const logPreReduceToConsole = skipDupeAction(
  ({ action }) => {
    consoleLog('\n');
    consoleGroup('ACTION_' + action.type);
    consoleInfo('dispatch:', action);
    consoleGroupEnd();
  }
);

const logPostReduceToConsole = ({ name, state, nextState }) => {
  consoleGroup(' STORE_' + name);
  consoleLog('from state:', state);
  consoleLog('next state:', nextState);
  consoleGroupEnd();
};

const shouldLog = (...args) => (
  R.apply(config().predicate, args)
);

const logPreReduce = R.when(
  shouldLog,
  logPreReduceToConsole
);

const logPostReduce = R.when(
  shouldLog,
  logPostReduceToConsole
);

export const getPreReduce = () => {
  let preStream = new Bacon.Bus();

  return {
    input: preStream,
    output: preStream
      .doAction(logPreReduce)
  };
};

export const getPostReduce = () => {
  let postStream = new Bacon.Bus();

  return {
    input: postStream,
    output: postStream
      .doAction(logPostReduce)
  };
};
