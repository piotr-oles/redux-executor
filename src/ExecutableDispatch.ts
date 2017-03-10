import { Dispatch, Action } from 'redux';

/**
 * Dispatch method that adds promise field for commands dispatches results.
 * It allows executors to synchronize dispatches.
 */
export interface ExecutableDispatch<S> extends Dispatch<S> {
  <A extends Action>(action: A): A & { promise?: Promise<void> };
}
