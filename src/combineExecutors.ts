import { Command } from './Command';
import { Executor } from './Executor';
import { ExecutableDispatch } from './ExecutableDispatch';

export function combineExecutors<S>(...executors: Executor<S>[]): Executor<S> {
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

  return function combinedExecutor<C extends Command>(state: S, command: C, dispatch: ExecutableDispatch<S>): Promise<void> {
    return Promise.all(
      executors
        .map(executor => executor(state, command, dispatch))
        .filter(promise => !!promise)
    ) as Promise<any>;
  };
}
