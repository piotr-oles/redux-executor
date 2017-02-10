import { Executor } from './Executor';
import { Command } from './Command';
import { ExecutableDispatch } from './ExecutableDispatch';

export function mountExecutor<S1, S2>(selector: (state: S1) => S2, executor: Executor<S2>): Executor<S1> {
  return function mountedExecutor<C extends Command>(state: S1, command: C, dispatch: ExecutableDispatch<S1>): Promise<void> | void {
    return executor(selector(state), command, dispatch);
  };
}
