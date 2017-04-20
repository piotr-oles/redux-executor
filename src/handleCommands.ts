
import { Executor } from './Executor';
import { handleCommand } from './handleCommand';
import { reduceExecutors } from './reduceExecutors';

export type ExecutorPerCommandMap<S> = {
  [type: string]: Executor<S>;
};

export function handleCommands<S>(map: ExecutorPerCommandMap<S>): Executor<S> {
  return reduceExecutors<S>(
    ...Object.keys(map).map(type => handleCommand(type, map[type]))
  );
}
