
import { Executor, NarrowExecutor } from './Executor';
import { Command } from './Command';
import { ExecutableDispatch } from './ExecutableDispatch';

export function handleCommand<S, C extends Command>(type: C['type'], executor: NarrowExecutor<S, C>): Executor<S> {
  return function wideExecutor(state: S, command: Command, dispatch: ExecutableDispatch<S>): Promise<void> | void {
    if (command && command.type === type) {
      return executor(state, command as C, dispatch);
    }
  };
}
