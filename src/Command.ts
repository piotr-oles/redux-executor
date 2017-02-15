import { Action } from 'redux';

export interface Command extends Action {
  command: true;
}
