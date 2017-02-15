
import { Command, Executor, handleCommand } from 'redux-executor';

/**
 * ParallelCommand is a command that will execute all commands from payload in parallel.
 * As a payload of ParallelCommand is a list of commands, you can put there another
 * ParallelCommand or SequenceCommand and build nested tree of execution.
 */
interface ParallelCommand extends Command {
  type: 'PARALLEL';
  payload: Command[];
}

export const parallelCommandExecutor: Executor<any> = handleCommand<any, ParallelCommand>(
  'PARALLEL',
  (state, command, dispatch) => Promise.all(
    command.payload.map(command => dispatch(command).promise || Promise.resolve())
  ).then(() => undefined)
);
