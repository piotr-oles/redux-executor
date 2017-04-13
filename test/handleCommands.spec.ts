
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import { handleCommands } from '../src/index';

chai.use(spies);

describe('handleCommands', () => {
  it('should export handleCommand function', () => {
    expect(handleCommands).to.be.function;
  });

  it('should return executor that runs only for given command types', () => {
    const dumbGetState = () => ({});
    const executorSpyA = chai.spy();
    const executorSpyB = chai.spy();
    const dispatchSpy = chai.spy();

    const targetedExecutor = handleCommands({
      'COMMAND_TYPE_A()': executorSpyA,
      'COMMAND_TYPE_B()': executorSpyB,
    });

    expect(targetedExecutor).to.be.function;
    expect(executorSpyA).to.not.have.been.called;
    expect(executorSpyB).to.not.have.been.called;

    // expect that executor will bypass this command
    targetedExecutor({ type: 'ANOTHER_COMMAND_TYPE()' }, dispatchSpy, dumbGetState);
    expect(executorSpyA).to.not.have.been.called;
    expect(executorSpyB).to.not.have.been.called;
    expect(dispatchSpy).to.not.have.been.called;

    // expect that executor will bypass similar non command
    targetedExecutor({ type: 'COMMAND_TYPE_A' }, dispatchSpy, dumbGetState);
    expect(executorSpyA).to.not.have.been.called;
    expect(executorSpyB).to.not.have.been.called;
    expect(dispatchSpy).to.not.have.been.called;

    // expect that executor will call wrapped executor A
    targetedExecutor({ type: 'COMMAND_TYPE_A()' }, dispatchSpy, dumbGetState);
    expect(executorSpyA).to.have.been.called.with({ type: 'COMMAND_TYPE_A()' }, dispatchSpy, dumbGetState);
    expect(executorSpyB).to.not.have.been.called;
    expect(dispatchSpy).to.have.been.called;

    // expect that executor will call wrapped executor B
    targetedExecutor({ type: 'COMMAND_TYPE_B()' }, dispatchSpy, dumbGetState);
    expect(executorSpyB).to.have.been.called.with({ type: 'COMMAND_TYPE_B()' }, dispatchSpy, dumbGetState);
  });
});
