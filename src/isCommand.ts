
export function isCommand(action: any): boolean {
  return !!(action && action.type && true === action.command);
}
