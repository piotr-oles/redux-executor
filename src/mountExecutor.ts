import { Action } from 'redux';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Mount executor to operate on some substate.
 *
 * @param selector Selector to map state to substate
 * @param executor Executor that runs on substate
 * @returns Executor that runs on state
 */
export function mountExecutor<S1, S2>(selector: (state: S1) => S2, executor: Executor<S2>): Executor<S1> {
  if (typeof selector !== 'function') {
    throw new Error('Expected the selector to be a function.');
  }

  if (typeof executor !== 'function') {
    throw new Error('Expected the executor to be a function.');
  }

  return function mountedExecutor<A extends Action>(command: A, dispatch: ExecutableDispatch<S1>, state: S1): Promise<void> | void {
    return executor(command, dispatch, selector(state));
  };
}
