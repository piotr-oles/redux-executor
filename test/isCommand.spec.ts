
import { expect } from 'chai';
import { isCommand } from '../src/index';

describe('combineExecutors', () => {
  it('should export isCommand function', () => {
    expect(isCommand).to.be.function;
  });

  it('should check if action is command', () => {
    expect(isCommand(undefined)).to.be.false;
    expect(isCommand(null)).to.be.false;
    expect(isCommand(NaN)).to.be.false;
    expect(isCommand(false)).to.be.false;
    expect(isCommand(true)).to.be.false;
    expect(isCommand(() => {})).to.be.false;
    expect(isCommand(0)).to.be.false;
    expect(isCommand({})).to.be.false;
    expect(isCommand({ type: 'SOME_TYPE' })).to.be.false;
    expect(isCommand({ type: 'SOME_TYPE', payload: { command: true } })).to.be.false;
    expect(isCommand({ type: 'SOME_TYPE', meta: { command: true } })).to.be.false;

    expect(isCommand({ type: 'SOME_TYPE', command: true })).to.be.true;
  });
});
