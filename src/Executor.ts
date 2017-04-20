import { ActionLike } from './ActionLike';
import { GetState } from './GetState';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Executor is an simple function that executes some side effects on given command.
 * They can return promise if side effect is asynchronous.
 */
export type Executor<S> = (
  command: ActionLike,
  dispatch: ExecutableDispatch<S>,
  getState: GetState<S | undefined>
) => Promise<void> | void;
