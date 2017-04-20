import * as isString from 'lodash.isstring';

/**
 * Checks if given type is a command type (ends with () substring).
 *
 * @param type String to check
 */
export function isCommandType(type: string): boolean {
  return (
    isString(type) &&
    type.length >= 3 &&
    ')' === type[type.length - 1] && // last char is )
    '(' === type[type.length - 2] // and before it there is ( char
  );
}