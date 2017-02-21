import { Action } from 'redux';
import { ExecutableDispatch } from './ExecutableDispatch';

/**
 * Executor is an simple function that executes some side effects on given command.
 * They can return promise if side effect is asynchronous.
 */
export type Executor<S> = <A extends Action>(command: A, dispatch: ExecutableDispatch<S>, state: S) => Promise<void> | void;

/**
 * It's executor limited to given action (command) type.
 */
export type NarrowExecutor<S, A extends Action> = (command: A, dispatch: ExecutableDispatch<S>, state: S) => Promise<void> | void;
