# Bdux Logger

A [Bdux](https://github.com/Intai/bdux) middleware to log actions and state changes.

## Installation
To install as an [npm](https://www.npmjs.com/) package:
```
npm install --save-dev bdux-logger
```

## Usage
``` javascript
import * as Logger from 'bdux-logger';
import { applyMiddleware } from 'bdux';

Logger.config({
  collapsed: false,
  predicate: () => true
});

applyMiddleware(
  Logger
);
```

## Options
### collapsed
- type: `boolean`
- default: `false`

Sets to truthy to collapse log groups, falsy otherwise.

### predicate
- type: `function`
- default: `({ action }) => !action.skipLog`

Returns truthy if action should be logged, falsy otherwise.

## License
[The ISC License](./LICENSE.md)
