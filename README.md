# Redux Executor
[![Npm version](https://img.shields.io/npm/v/redux-executor.svg?style=flat-square)](https://www.npmjs.com/package/redux-executor)
[![Build Status](https://travis-ci.org/piotr-oles/redux-executor.svg?branch=master)](https://travis-ci.org/piotr-oles/redux-executor)
[![Coverage Status](https://coveralls.io/repos/github/piotr-oles/redux-executor/badge.svg?branch=master)](https://coveralls.io/github/piotr-oles/redux-executor?branch=master)

Redux [enhancer](http://redux.js.org/docs/api/createStore.html) for handling side effects.
 
**Warning: API is not stable yet, will be from version 1.0**

## Table of Contents
1. [Installation](#installation)
1. [Motivation](#motivation)
1. [Concepts](#concepts)
1. [Composition](#composition)
1. [Narrowing](#narrowing)
1. [Execution order](#execution-order)
1. [API](#api)
1. [Code Splitting](#code-splitting)
1. [Typings](#typings)
1. [License](#license)

## Installation
Redux Executor requires **Redux 3.1.0 or later.**
```sh
npm install --save redux-executor
```
This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like 
[Webpack](http://webpack.github.io/) or [Browserify](http://browserify.org/) to consume 
[UMD modules](https://github.com/umdjs/umd).

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

#### Redux DevTools
To use Redux Executor with [Redux DevTools](https://github.com/gaearon/redux-devtools), you have to be careful about enhancers order. 
It's because Redux Executor do not pass commands to next enhancers so it has to be placed after DevTools (to see commands).

```js
const devToolsCompose = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const enhancer = compose(
  devToolsCompose(
    // ...some enhancers
    applyMiddleware(/* ...some middlewares */)
  ),
  createExecutorEnhancer(rootExecutor)
);
```

## Motivation
There are many clever solutions to deal with side-effects in redux application like [redux-thunk](https://github.com/gaearon/redux-thunk)
or [redux-saga](https://github.com/redux-saga/redux-saga). The goal of this library is to be simpler than **redux-saga**,
easier to test and more pure than **redux-thunk**.

Typical usage of executor is to fetch some external resource, for example list of posts. It can look like this:
```js
import { handleCommand } from 'redux-executor';
import { postApi } from './api/postApi';
// import action creators
import { postsRequested, postsResolved, postsRejected } from './actions/postActions'; 

// postExecutors.js
function fetchPostsExecutor(command, dispatch, getState) {
  dispatch(postsRequested());
  
  return postApi.list(command.payload.page)
  .then((posts) => dispatch(postsResolved(posts)))
  .catch((error) => dispatch(postsRejected(error)));
}

export default handleCommand('FETCH_POSTS()', fetchPostsExecutor);

// somwhere else in code
dispatch(fetchPosts(this.state.page));
```
So what is the difference between executor and thunk? With executors you have separation between side-effect _request_ and
side-effect _call_. It means that you can omit second phase and not call side-effect (if you not bind executor to the store).
With this design it's very easy to write unit tests. If you use [Redux DevTools](https://github.com/gaearon/redux-devtools)
it will be also easier to debug - all commands will be logged in debugger. 

I recommend to use redux-executor with [redux-detector](https://github.com/piotr-oles/redux-detector) library. 
In this combination you can for example detect if client is on given url and dispatch fetch command. 
All, excluding executors, will be pure.

## Concepts
### An Executor
It may sounds a little bit scary but there is nothing to fear - executor is very pure and simple function.
```typescript
type Executor<S> = (command: Action, dispatch: ExecutableDispatch<S>, getState: GetState<S | undefined>) => Promise<void> | void;
```
Like you see above, executor takes an action (called **command** in executors), enhanced `dispatch` function and state.
It can return a `Promise` to provide custom execution flow.

### A Command
Command is an **action** with specific `type` format - `COMMAND_TYPE()` (like function call, instead of `COMMAND_TYPE`). The idea behind
is that it's more clean to split actions to two types: normal actions (we will call it _events_) that tells
what **has happened** and _commands_ that tells what **should happen**. 

Events are declarative like: `{ type: 'USER_CLICKED_FOO' }`, commands are imperative like: `{ type: 'FETCH_FOO()' }`.

The reaction for event is state reduction (by reducer) which is pure, the reaction for command is executor call which is
unpure.

Another thing is that events changes state (by reducer), commands not. Because of that command dispatch doesn't call
store listeners (for example it doesn't re-render React application).

## Composition
You can pass only one executor to the store, but with `combineExecutors` and `reduceExecutors` you can mix them to
one executor. For example:
```js
import { combineExecutors, reduceExecutors } from 'redux-executor';
import { fooExecutor } from './fooExecutor';
import { barExecutor } from './barExecutor';
import { anotherExecutor } from './anotherExecutor';

// our state has shape:
// {
//   foo: [],
//   bar: 1
// }
//
// We want to bind `fooExecutor` and `anotherExecutor` to `state.foo` branch (they should run in sequence)
// and also `barExecutor` to `state.bar` branch.

export default combineExecutors({
  foo: reduceExecutors(
    fooExecutor,
    anotherExecutor
  ),
  bar: barExecutor
});
```

#### Mounting
To re-use executors we can also mount them to some state branch. To do this, use `mountExecutor` function
with state selector and executor.
```js
import { mountExecutor } from 'redux-executor';

// our state has shape:
// {
//   foo: [1, 3],
// }
//
// We want to bind `fooExecutor` to the length of `state.foo` branch

function fooExecutor(command, dispatch, getState) {
  console.log(getState()); // > 2
}

export default mountExecutor((state) => state.foo.length, fooExecutor);
```

## Narrowing
By default executor runs for every command. To limit executor to given command type, you can write _if_ statement
or use `handleCommand`/`handleCommands` function.

For example to limit `fooExecutor` to command `FOO()`, `barExecutor` to command `BAR()` and mix them into one executor:
```js
import { handleCommand, handleCommands, reduceExecutors } from 'redux-executor';

function fooExecutor(command, dispatch, getState) { 
  // foo executor logic
}

function barExecutor(command, dispatch, getState) {
  // bar executor logic  
}

// OPTION 1: handleExecutor + reduceExecutors
export default reduceExecutors(
  handleCommand('FOO()', fooExecutor),
  handleCommand('BAR()', barExecutor)
);

// OPTION 2: handleCommands
export default handleCommands({
  'FOO()': fooExecutor,
  'BAR()': barExecutor
});
```

## Execution order
Sometimes we want to dispatch actions in proper order. To do this, we have to return promise from executors we want
to include to our execution order. If we dispatch **command**, dispatch method will return action (it's redux behaviour) with
additional `promise` field that contains promise of our side-effects. Keep in mind that this promise is the result of
calling all combined or reduced executors (built-in implementations uses `Promise.all`, see [reduceExecutors](#reduceexecutors), 
[combineExecutors](#combineexecutors)). Because of that you should not rely on promise content - in fact it should 
be undefined.

Lets say that we want to run `firstCommand` and then `secondCommand` and `thirdCommand` in parallel. 
The easiest solution is:
```js
// import action creators
import { firstCommand, secondCommand, thirdCommand } from './commands/exampleCommands';

function firstThenNextExecutor(command, dispatch, getState) {
  return dispatch(firstCommand()).promise
  .then(() => Promise.all([
    dispatch(secondCommand()).promise, 
    dispatch(thirdCommand()).promise
  ]));
}

export default handleCommand('FIRST_THEN_NEXT()', firstThenNextExecutor);
```

To be more declarative and to reduce boilerplate code, you can create generic `sequenceCommandExecutor` and 
`parallelCommandExecutor`.

```js
// executionFlowExecutors.js
import { handleCommand } from 'redux-executor';

export const sequenceCommandExecutor = handleCommand(
  'SEQUENCE()',
  (command, dispatch) => command.payload.reduce(
    (promise, command) => promise.then(() => dispatch(command).promise || Promise.resolve()),
    Promise.resolve()
  )
);

export const parallelCommandExecutor = handleCommand(
  'PARALLEL()',
  (command, dispatch) => Promise.all(
    command.payload.map(command => dispatch(command).promise || Promise.resolve())
  ).then(() => undefined) // we should return Promise<void> because we should not rely on promise result
);
```

With these executors we can create action creator instead of executor for the previous example.
```js
// import action creators
import { firstCommand, secondCommand, thirdCommand } from './commands/exampleCommands';
import { sequenceCommand, parallelCommand } from './commands/executionOrderCommands';

export default function firstThenNext() {
  return sequenceCommand([
    firstCommand(),
    parallelCommand([
      secondCommand(),
      thirdCommand()
    ])
  ]);
}
// it will return
// {
//   type: 'SEQUENCE()',
//   payload: [
//     { type: 'FIRST()' },
//     { 
//       type: 'PARALLEL()',
//       payload: [
//         { type: 'SECOND()' },
//         { type: 'THIRD()' }
//       ]
//     }
//   ]
// }
```

## API
#### combineExecutors
```typescript
type ExecutorsMap<S> = {
  [K in keyof S]: Executor<S[K]>;
};

function combineExecutors<S>(map: ExecutorsMap<S>): Executor<S>;
```
Binds executors to state branches and combines them to one executor. Executors will be called in 
sequence but promise will be resolved in parallel (by `Promise.all`) Useful for re-usable executors.

#### createExecutorEnchancer
```typescript
type StoreExecutableEnhancer<S> = (next: StoreEnhancerStoreCreator<S>) => StoreEnhancerStoreExecutableCreator<S>;
type StoreEnhancerStoreExecutableCreator<S> = (reducer: Reducer<S>, preloadedState: S) => ExecutableStore<S>;

function createExecutorEnhancer<S>(executor: Executor<S>): StoreExecutableEnhancer<S>;
```
Creates new [redux enhancer](http://redux.js.org/docs/Glossary.html#store-enhancer) that extends redux store api (see [ExecutableStore](#executablestore))

#### ExecutableDispatch
```typescript
interface ExecutableDispatch<S> extends Dispatch<S> {
  <A extends Action>(action: A): A & { promise?: Promise<void> };
}
```
It's type of enhanced dispatch method that can add `promise` field to returned action if you dispatch command.

#### ExecutableStore
```typescript
interface ExecutableStore<S> extends Store<S> {
  dispatch: ExecutableDispatch<S>;
  replaceExecutor(nextExecutor: Executor<S>): void;
}
```
It's type of store that has enhanced dispatch method (see [ExecutableDispatch](#executabledispatch)) and 
`replaceExecutor` method (like `replaceReducer`).

#### Executor
```typescript
type Executor<S> = (command: Action, dispatch: ExecutableDispatch<S>, getState: GetState<S | undefined>) => Promise<void> | void;
```
See [Concepts / An Executor](#an-executor)

#### EXECUTOR_INIT
```typescript
const EXECUTOR_INIT: string = '@@executor/INIT()';
```
Command of this type is dispatched on init and `replaceExecutor` call.

#### GetState
```typescript
type GetState<S> = () => S;
```
Simple function to get current state (we don't provide state itself because it can change during async side-effects).

#### handleCommand
```typescript
function handleCommand<S>(type: string, executor: Executor<S>): Executor<S>;
```
Limit executor to given command type (inspired by [redux-actions](https://github.com/acdlite/redux-actions)).

#### handleCommands
```typescript
type ExecutorPerCommandMap<S> = {
  [type: string]: Executor<S>;
};

function handleCommands<S>(map: ExecutorPerCommandMap<S>): Executor<S>;
```
Similar to `handleCommand` but works for multiple commands at once. 
Map is an object where key is a command type, value is an executor (inspired by [redux-actions](https://github.com/acdlite/redux-actions)).

#### isCommand
```typescript
function isCommand(object: any): boolean;
```
Checks if given object is a command (`object.type` ends with `()` string).

#### isCommandType
```typescript
function isCommandType(type: string): boolean;
```
Similar to `isCommand` but checks only `type` string.

#### mountExecutor
```typescript
function mountExecutor<S1, S2>(selector: (state: S1 | undefined) => S2, executor: Executor<S2>): Executor<S1>;
```
Mounts executor to some state branch. Useful for re-usable executors.

#### reduceExecutors
```typescript
function reduceExecutors<S>(...executors: Executor<S>[]): Executor<S>;
```
Reduces multiple executors to one. Executors will be called in sequence but promise will be resolved in parallel 
(by `Promise.all`). Useful for re-usable executors.

## Code Splitting
Redux Executor provides `replaceExecutor` method on `ExecutableStore` interface (store created by Redux Executor). It's similar to
`replaceReducer` - it changes executor and dispatches `{ type: '@@executor/INIT()' }`.

## Typings
If you are using [TypeScript](https://www.typescriptlang.org/), you don't have to install typings - they are provided in npm package.

## License
MIT
