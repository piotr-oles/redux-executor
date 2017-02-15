# Redux Executor
[![Npm version](https://img.shields.io/npm/v/redux-executor.svg?style=flat-square)](https://www.npmjs.com/package/redux-executor)
[![Build Status](https://travis-ci.org/piotr-oles/redux-executor.svg?branch=master)](https://travis-ci.org/piotr-oles/redux-executor)
[![Coverage Status](https://coveralls.io/repos/github/piotr-oles/redux-executor/badge.svg?branch=master)](https://coveralls.io/github/piotr-oles/redux-executor?branch=master)

Redux [enhancer](http://redux.js.org/docs/api/createStore.html) for handling side effects.
 
**Warning: API is not stable yet, will be from version 1.0**

## Installation ##
Redux Executor requires **Redux 3.1.0 or later.**
```sh
npm install --save redux-executor
```
This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like 
[Webpack](http://webpack.github.io/) or [Browserify](http://browserify.org/) to consume 
[CommonJS modules](http://webpack.github.io/docs/commonjs.html).

To enable Redux Executor, use `createExecutableStore`:
```js
import { createExecutableStore } from 'redux-executor';
import rootReducer from './reducers/index';
import rootExecutor from './executors/index';

const store = createExecutableStore(
  rootReducer,
  rootExecutor
);
```
 
or if you have more complicated store creation, use `createStore` with `createExecutorEnhancer`:
```js
import { createStore } from 'redux';
import { createExecutorEnhancer } from 'redux-executor';
import rootReducer from './reducers/index';
import rootExecutor from './executors/index';

const store = createStore(
  rootReducer,
  createExecutorEnhancer(rootExecutor)
);
```

## Motivation ##
TODO

## Composition ##
TODO

## Narrowing ##
TODO

## Code Splitting ##
Redux Executor provides `replaceExecutor` method on `ExecutableStore` interface (store created by Redux Executor). It's similar to
`replaceReducer` - it changes executor and dispatches `{ type: '@@executor/INIT', command: true }`.

## Typings ##
If you are using [TypeScript](https://www.typescriptlang.org/), you don't have to install typings - they are provided in npm package.

## License ##
MIT
