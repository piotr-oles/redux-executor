
import { isCommandType } from './isCommandType';

/**
 * Checks if given object is command (action with type that ends with () substring).
 *
 * @param object Object to check
 */
export function isCommand(object: any): boolean {
  return !!object && isCommandType(object.type);
}
