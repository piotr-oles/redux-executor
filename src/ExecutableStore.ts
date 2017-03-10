import { Store } from 'redux';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Store that can handle commands and executors.
 */
export interface ExecutableStore<S> extends Store<S> {
  dispatch: ExecutableDispatch<S>;
  replaceExecutor(nextExecutor: Executor<S>): void;
}
