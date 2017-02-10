import { Command } from "./Command";
import { ExecutableDispatch } from "./ExecutableDispatch";

export type Executor<S> = <C extends Command>(state: S, command: C, dispatch: ExecutableDispatch<S>) => Promise<void> | void;
