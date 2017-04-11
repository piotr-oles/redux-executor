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

To enable Redux Executor, use `createExecutorEnhancer` with `createStore`:
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
There are many clever solutions to deal with side-effects in redux application like [redux-thunk](https://github.com/gaearon/redux-thunk)
or [redux-saga](https://github.com/redux-saga/redux-saga). The goal of this library is to be simpler than **redux-saga**
and also easier to test and more pure than **redux-thunk**.

## Concepts ##
### An Executor ###
It may sounds a little bit scary but there is nothing to fear - executor is very pure and simple function.
```
type Executor<S> = (command: ActionLike, dispatch: ExecutableDispatch<S>, state: S | undefined) => Promise<void> | void;
```
Like you see above, executor takes an action (called **command** in executors), enhanced `dispatch` function and state.
It can return a `Promise` to provide custom execution flow.

### A Command ###
Command is an **action** with specific `type` format - `COMMAND_TYPE()` (like function call, instead of `COMMAND_TYPE`). The idea behind
is that it's more clean to split actions to two types: normal actions (we will call it _events_) that tells
what **has happened** and _commands_ that tells what **should happen**. 

Events are declarative like: `{ type: 'USER_CLICKED_FOO' }`, commands are imperative like: `{ type: 'FETCH_FOO()' }`.

The reaction for event is state reduction (by reducer) which is pure, the reaction for command is executor call which is
unpure.

Another thing is that events changes state (by reducer), commands not. Because of that command dispatch doesn't call
store listeners (for example it doesn't re-render React application).

## Composition ##
TODO

## Narrowing ##
TODO

## API ##
#### combineExecutors ####
```
type ExecutorsMap<S> = {
  [K in keyof S]: Executor<S[K]>;
};

function combineExecutors<S>(map: ExecutorsMap<S>): Executor<S>;
```
Binds executors to state branches and combines them to one executor. Executors will be called in 
sequence but promise will be resolved in parallel (by `Promise.all`) Useful for re-usable executors.

#### createExecutorEnchancer ####
```
type StoreExecutableEnhancer<S> = (next: StoreEnhancerStoreCreator<S>) => StoreEnhancerStoreExecutableCreator<S>;
type StoreEnhancerStoreExecutableCreator<S> = (reducer: Reducer<S>, preloadedState: S) => ExecutableStore<S>;

function createExecutorEnhancer<S>(executor: Executor<S>): StoreExecutableEnhancer<S>;
```
Creates new [redux enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer) that extends redux store api (see [ExecutableStore](#executable-store))

#### ExecutableDispatch ####
```
interface ExecutableDispatch<S> extends Dispatch<S> {
  <A extends Action>(action: A): A & { promise?: Promise<void> };
}
```
It's type of enhanced dispatch method that can add `promise` field to returned action if you dispatch command.

#### ExecutableStore ####
```
interface ExecutableStore<S> extends Store<S> {
  dispatch: ExecutableDispatch<S>;
  replaceExecutor(nextExecutor: Executor<S>): void;
}
```
It's type of enhanced store that has enhanced dispatch method (see [ExecutableDispatch](#executable-dispatch)) and 
`replaceExecutor` method (like `replaceReducer`).

#### Executor ####
```
type Executor<S> = (command: ActionLike, dispatch: ExecutableDispatch<S>, state: S | undefined) => Promise<void> | void;
```
See [Concepts / An Executor](#an-executor)

#### handleCommand ####
```
function handleCommand<S>(type: string, executor: Executor<S>): Executor<S>;
```
Limit executor to given command type (inspired by [redux-actions](https://github.com/acdlite/redux-actions)).

#### handleCommands ####
```
type ExecutorPerCommandMap<S> = {
  [type: string]: Executor<S>;
};

function handleCommands<S>(map: ExecutorPerCommandMap<S>): Executor<S>;
```
Similar to `handleCommand` but works for multiple commands at once. 
Map is an object where key is a command type, value is an executor (inspired by [redux-actions](https://github.com/acdlite/redux-actions)).

#### isCommand ####
```
function isCommand(object: any): boolean;
```
Checks if given object is an command (`object.type` ends with `()` string).

#### mountExecutor ####
```
function mountExecutor<S1, S2>(selector: (state: S1 | undefined) => S2, executor: Executor<S2>): Executor<S1>;
```
Mounts executor to some state branch. Useful for re-usable executors.

#### reduceExecutors ####
```
function reduceExecutors<S>(...executors: Executor<S>[]): Executor<S>;
```
Reduces multiple executors to one. Executors will be called in sequence but promise will be resolved in parallel 
(by `Promise.all`). Useful for re-usable executors.


## Code Splitting ##
Redux Executor provides `replaceExecutor` method on `ExecutableStore` interface (store created by Redux Executor). It's similar to
`replaceReducer` - it changes executor and dispatches `{ type: '@@executor/INIT()' }`.

## Typings ##
If you are using [TypeScript](https://www.typescriptlang.org/), you don't have to install typings - they are provided in npm package.

## License ##
MIT
