import { StoreEnhancer, Reducer, compose, createStore } from 'redux';
import { Executor } from './Executor';
import { ExecutableStore } from './ExecutableStore';
import { createExecutorEnhancer } from './createExecutorEnhancer';

export function createExecutableStore<S>(
  reducer: Reducer<S>,
  executor: Executor<S>,
  preloadedState?: S,
  enhancer?: StoreEnhancer<S>
): ExecutableStore<S> {
  if (enhancer) {
    enhancer = compose(createExecutorEnhancer(executor), enhancer);
  } else {
    enhancer = createExecutorEnhancer(executor);
  }

  return createStore(reducer, preloadedState, enhancer) as ExecutableStore<S>;
}
