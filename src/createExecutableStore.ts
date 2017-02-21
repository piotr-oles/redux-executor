import { StoreEnhancer, Reducer, compose, createStore } from 'redux';
import { Executor } from './Executor';
import { ExecutableStore } from './ExecutableStore';
import { createExecutorEnhancer } from './createExecutorEnhancer';

/**
 * Create store that will be able to handle executors and commands.
 *
 * @param reducer Main redux reducer
 * @param executor Main redux executor
 * @param preloadedState State that should be initialized
 * @param enhancer Additional enhancer
 * @returns Executable Store that will handle commands and executors
 */
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
