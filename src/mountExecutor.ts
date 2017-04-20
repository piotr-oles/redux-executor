import { ActionLike } from './ActionLike';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';
import { GetState } from './GetState';

/**
 * Mount executor to operate on some substate.
 *
 * @param selector Selector to map state to substate
 * @param executor Executor that runs on substate
 * @returns Executor that runs on state
 */
export function mountExecutor<S1, S2>(selector: (state: S1 | undefined) => S2 | undefined, executor: Executor<S2>): Executor<S1> {
  if (typeof selector !== 'function') {
    throw new Error('Expected the selector to be a function.');
  }

  if (typeof executor !== 'function') {
    throw new Error('Expected the executor to be a function.');
  }

  return function mountedExecutor(
    command: ActionLike,
    dispatch: ExecutableDispatch<S1>,
    getState: GetState<S1 | undefined>
  ): Promise<void> | void {
    return executor(command, dispatch, () => selector(getState()));
  };
}
