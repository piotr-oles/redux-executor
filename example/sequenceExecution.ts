
import { Action } from 'redux';
import { Executor, handleCommand } from 'redux-executor';

/**
 * SequenceCommand is a command that will execute all commands from payload in given order.
 * As a payload of SequenceCommand is a list of commands, you can put there another
 * SequenceCommand or ParallelCommand and build nested tree of execution.
 */
interface SequenceCommand extends Action {
  type: 'SEQUENCE()';
  payload: Action[];
}

export const sequenceCommandExecutor: Executor<any> = handleCommand<any, SequenceCommand>(
  'SEQUENCE()',
  (command, dispatch) => command.payload.reduce(
    (promise, command) => promise.then(() => dispatch(command).promise || Promise.resolve()),
    Promise.resolve()
  )
);
