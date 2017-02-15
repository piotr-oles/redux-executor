
import { Executor, NarrowExecutor } from './Executor';
import { Command } from './Command';
import { ExecutableDispatch } from './ExecutableDispatch';

export function handleCommand<S, C extends Command>(type: C['type'], executor: NarrowExecutor<S, C>): Executor<S> {
  return function wideExecutor(command: Command, dispatch: ExecutableDispatch<S>, state: S): Promise<void> | void {
    if (command && command.type === type) {
      return executor(command as C, dispatch, state);
    }
  };
}
