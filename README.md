# Bdux Logger

A [Bdux](https://github.com/Intai/bdux) middleware to log actions and state changes.

[![Build Status](https://travis-ci.org/Intai/bdux-logger.svg?branch=master)](https://travis-ci.org/Intai/bdux-logger)
[![Coverage Status](https://coveralls.io/repos/github/Intai/bdux-logger/badge.svg?branch=master)](https://coveralls.io/github/Intai/bdux-logger?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/846299ecaf804098870ef64eafff5345)](https://www.codacy.com/app/intai-hg/bdux-logger?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Intai/bdux-logger&amp;utm_campaign=Badge_Grade)

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
