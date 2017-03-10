import { StoreEnhancerStoreCreator, Store, Reducer, Action } from 'redux';
import { Executor } from './Executor';
import { ExecutableStore } from './ExecutableStore';
import { isCommand } from './isCommand';

export const EXECUTOR_INIT: string = '@@executor/INIT()';

export type StoreExecutableEnhancer<S> = (next: StoreEnhancerStoreCreator<S>) => StoreEnhancerStoreExecutableCreator<S>;
export type StoreEnhancerStoreExecutableCreator<S> = (reducer: Reducer<S>, preloadedState: S) => ExecutableStore<S>;

/**
 * Create enhacer for redux store. This enhancer adds commands and executors support.
 *
 * @param executor Main redux executor
 * @returns Store enhancer
 */
export function createExecutorEnhancer<S>(executor: Executor<S>): StoreExecutableEnhancer<S> {
  if (typeof executor !== 'function') {
    throw new Error('Expected the executor to be a function.');
  }

  return function executorEnhancer(next: StoreEnhancerStoreCreator<S>): StoreEnhancerStoreExecutableCreator<S> {
    return function executableStoreCreator(reducer: Reducer<S>, preloadedState?: S): ExecutableStore<S> {
      // create basic store
      const store: Store<S> = next(reducer, preloadedState);

      // set initial values in this scope
      let prevState: S | undefined = preloadedState;
      let currentExecutor: Executor<S> = executor;

      // executable store adds `replaceExecutor` method to it's interface
      const executableStore: ExecutableStore<S> = {
        ...store as any, // some bug in typescript object spread operator?
        replaceExecutor: function replaceExecutor(nextExecutor: Executor<S>): void {
          if (typeof nextExecutor !== 'function') {
            throw new Error('Expected the nextExecutor to be a function.');
          }

          currentExecutor = nextExecutor;
          executableStore.dispatch({ type: EXECUTOR_INIT });
        }
      };

      // store executable overrides `dispatch` method to implement ExecutableDispatch interface
      executableStore.dispatch = <A extends Action>(action: A): A & { promise?: Promise<void> } => {
        if (isCommand(action)) {
          // run executor instead of default dispatch
          let promise: Promise<void> | void = currentExecutor(
            action as any,
            executableStore.dispatch,
            executableStore.getState()
          );

          // return command with promise field to allow to synchronize dispatches
          return Object.assign({}, action as any, { promise: promise || Promise.resolve() });
        }

        // call original dispatch
        return store.dispatch(action);
      };

      return executableStore;
    };
  };
}
