import { Command } from "./Command";
import { ExecutableDispatch } from "./ExecutableDispatch";

export type Executor<S> = <C extends Command>(command: C, dispatch: ExecutableDispatch<S>, state: S) => Promise<void> | void;
export type NarrowExecutor<S, C extends Command> = (command: C, dispatch: ExecutableDispatch<S>, state: S) => Promise<void> | void;
