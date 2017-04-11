import { ActionLike } from './ActionLike';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Reduce executors to get one that will call wrapped.
 *
 * @param executors Executors to reduce
 * @returns Executor that wraps all given executors
 */
export function reduceExecutors<S>(...executors: Executor<S>[]): Executor<S> {
  // check executors type in runtime
  const invalidExecutorsIndexes: number[] = executors
    .map((executor, index) => executor instanceof Function ? -1 : index)
    .filter(index => index !== -1);

  if (invalidExecutorsIndexes.length) {
    throw new Error(
      `Invalid arguments: ${invalidExecutorsIndexes.join(', ')} in combineExecutors call.\n` +
      `Executors should be a 'function' type, ` +
      `'${invalidExecutorsIndexes.map(index => typeof executors[index]).join(`', '`)}' types passed.`
    );
  }

  return function reducedExecutor(command: ActionLike, dispatch: ExecutableDispatch<S>, state: S): Promise<void> {
    return Promise.all(
      executors
        .map(executor => executor(command, dispatch, state))
        .filter(promise => !!promise)
    ) as Promise<any>;
  };
}
