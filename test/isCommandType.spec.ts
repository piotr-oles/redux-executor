
import { expect } from 'chai';
import { isCommandType } from '../src/index';

describe('isCommandType', () => {
  it('should export isCommandType function', () => {
    expect(isCommandType).to.be.function;
  });

  it('should check if type is command type', () => {
    expect(isCommandType(undefined)).to.be.false;
    expect(isCommandType(null)).to.be.false;
    expect(isCommandType(NaN as any)).to.be.false;
    expect(isCommandType(false as any)).to.be.false;
    expect(isCommandType(true as any)).to.be.false;
    expect(isCommandType((() => {}) as any)).to.be.false;
    expect(isCommandType(0 as any)).to.be.false;
    expect(isCommandType({} as any)).to.be.false;
    expect(isCommandType('SOME_TYPE')).to.be.false;
    expect(isCommandType('SOME_TYPE( )')).to.be.false;
    expect(isCommandType('SOME_TYPE)')).to.be.false;
    expect(isCommandType('SOME_TYPE(' )).to.be.false;
    expect(isCommandType('SOME_TYP(E)')).to.be.false;
    expect(isCommandType('SOME_TYPE()'.split('') as any)).to.be.false;

    expect(isCommandType('SOME_TYPE()')).to.be.true;
  });
});
