
import { assert } from 'chai';
import { isCommand } from '../src/index';

describe('combineExecutors', () => {
  it('should export isCommand function', () => {
    assert.isFunction(isCommand);
  });

  it('should check if action is command', () => {
    assert.isFalse(isCommand(undefined));
    assert.isFalse(isCommand(null));
    assert.isFalse(isCommand(NaN));
    assert.isFalse(isCommand(false));
    assert.isFalse(isCommand(true));
    assert.isFalse(isCommand(() => {}));
    assert.isFalse(isCommand(0));
    assert.isFalse(isCommand({}));
    assert.isFalse(isCommand({ type: 'SOME_TYPE' }));
    assert.isFalse(isCommand({ type: 'SOME_TYPE', payload: { command: true } }));
    assert.isFalse(isCommand({ type: 'SOME_TYPE', meta: { command: true } }));

    assert.isTrue(isCommand({ type: 'SOME_TYPE', command: true }));
  });
});
