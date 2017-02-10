import { Store } from 'redux';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

export interface ExecutableStore<S> extends Store<S> {
  dispatch: ExecutableDispatch<S>;
  replaceExecutor(nextExecutor: Executor<S>): void;
}
