import { Executor } from './Executor';
import { ActionLike } from './ActionLike';
import { ExecutableDispatch } from './ExecutableDispatch';

export type ExecutorsMap<S> = {
  [K in keyof S]?: Executor<S[K]>;
};

/**
 * Combine executors to bind them to the local state.
 * It allows to create reusable executors.
 *
 * @param map Map of executors bounded to state.
 * @returns Combined executor
 */
export function combineExecutors<S>(map: ExecutorsMap<S>): Executor<S> {
  return function combinedExecutor(command: ActionLike, dispatch: ExecutableDispatch<S>, state: S | undefined): Promise<void> {
    return Promise.all(
      Object.keys(map).map((key: keyof S) => map[key]!(command, dispatch, state ? state[key] : undefined) || Promise.resolve())
    ).then(
      /* istanbul ignore next */
      () => undefined
    );
  };
}
