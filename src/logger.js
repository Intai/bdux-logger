import R from 'ramda';
import Bacon from 'baconjs';

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

const consoleGroup = (description) => (
  config().collapsed
    ? console.groupCollapsed(description)
    : console.group(description)
);

// log only once for each action.
const logPreReduceToConsole = skipDupeAction(
  ({ action }) => {
    console.log('\n');
    consoleGroup('ACTION_' + action.type);
    console.info('dispatch:', action);
    console.groupEnd();
  }
);

const logPostReduceToConsole = ({ name, state, nextState }) => {
  consoleGroup(' STORE_' + name);
  console.log('from state:', state);
  console.log('next state:', nextState);
  console.groupEnd();
};

const shouldLog = () => (
  config().predicate()
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
