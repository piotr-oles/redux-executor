import { Action } from 'redux';

export interface Command extends Action {
  command: true;
}

export function isCommand(action: any): boolean {
  return action && action.type && action.command;
}
