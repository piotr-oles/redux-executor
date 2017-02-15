
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import { handleCommand } from '../src/index';

chai.use(spies);

describe('combineExecutors', () => {
  it('should export handleCommand function', () => {
    expect(handleCommand).to.be.function;
  });

  it('should return executor that runs only for given command type', () => {
    const executorSpy = chai.spy();
    const dispatchSpy = chai.spy();
    const dumbState = {};

    const targetedExecutor = handleCommand('COMMAND_TYPE', executorSpy);

    expect(targetedExecutor).to.be.function;
    expect(executorSpy).to.not.have.been.called;

    // expect that executor will bypass this command
    targetedExecutor(dumbState, { type: 'ANOTHER_COMMAND_TYPE', command: true }, dispatchSpy);
    expect(executorSpy).to.not.have.been.called;
    expect(dispatchSpy).to.not.have.been.called;

    // expect that executor will call wrapped executor
    targetedExecutor(dumbState, { type: 'COMMAND_TYPE', command: true }, dispatchSpy);
    expect(executorSpy).to.have.been.called.with(dumbState, { type: 'COMMAND_TYPE', command: true }, dispatchSpy);
    expect(dispatchSpy).to.have.been.called;
  });
});
