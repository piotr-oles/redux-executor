import { ActionLike } from './ActionLike';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Executor is an simple function that executes some side effects on given command.
 * They can return promise if side effect is asynchronous.
 */
export type Executor<S> = (command: ActionLike, dispatch: ExecutableDispatch<S>, state: S | undefined) => Promise<void> | void;
