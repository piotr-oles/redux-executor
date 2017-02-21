
/**
 * Checks if given object is command (action with type that ends with () substring).
 *
 * @param object Object to check
 */
export function isCommand(object: any): boolean {
  return !!(
    object &&
    object.type &&
    object.type.length >= 3 &&
    ')' === object.type[object.type.length - 1] && // last char is )
    '(' === object.type[object.type.length - 2] // and before it there is ( char
  );
}
