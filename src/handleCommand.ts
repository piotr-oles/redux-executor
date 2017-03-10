
import { Action } from 'redux';
import { Executor, NarrowExecutor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Wraps executor to handle only one type of command.
 *
 * @param type Type which our target commands should have.
 * @param executor Wrapped executor
 * @returns Executor that runs wrapped executor only for commands with given type.
 */
export function handleCommand<S, A extends Action>(type: string, executor: NarrowExecutor<S, A>): Executor<S> {
  if (!type || type.length < 3 || ')' !== type[type.length - 1] || '(' !== type[type.length - 2]) {
    throw new Error(`Expected type to be valid command type with '()' ending. Given '${type}' type. Maybe typo?`);
  }

  if (typeof executor !== 'function') {
    throw new Error('Expected the executor to be a function.');
  }

  return function wideExecutor(command: Action, dispatch: ExecutableDispatch<S>, state: S): Promise<void> | void {
    if (command && command.type === type) {
      return executor(command as A, dispatch, state);
    }
  };
}
