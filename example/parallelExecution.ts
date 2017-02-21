
import { Action } from 'redux';
import { Executor, handleCommand } from 'redux-executor';

/**
 * ParallelCommand is a command that will execute all commands from payload in parallel.
 * As a payload of ParallelCommand is a list of commands, you can put there another
 * ParallelCommand or SequenceCommand and build nested tree of execution.
 */
interface ParallelCommand extends Action {
  type: 'PARALLEL()';
  payload: Action[];
}

export const parallelCommandExecutor: Executor<any> = handleCommand<any, ParallelCommand>(
  'PARALLEL()',
  (command, dispatch) => Promise.all(
    command.payload.map(command => dispatch(command).promise || Promise.resolve())
  ).then(() => undefined)
);
