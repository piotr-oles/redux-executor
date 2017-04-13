import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import { createExecutorEnhancer, EXECUTOR_INIT } from '../src/index';

chai.use(spies);

describe('createExecutorEnhancer', () => {
  let dumbReducer, dumbDispatch, dumbState, dumbGetState, dumbExecutor;

  beforeEach(() => {
    dumbReducer = (state) => state;
    dumbState = {};
    dumbGetState = () => ({});
    dumbDispatch = dumbExecutor = () => undefined;
  });

  it('should export createExecutorEnhancer function', () => {
    expect(createExecutorEnhancer).to.be.function;
  });

  it('should export EXECUTOR_INIT string', () => {
    expect(EXECUTOR_INIT).to.be.string;
  });

  it('should throw an exception if executor is not a function', () => {
    expect(() => { (createExecutorEnhancer as any)(undefined); }).to.throw(Error);
    expect(() => { (createExecutorEnhancer as any)(123); }).to.throw(Error);
    expect(() => { (createExecutorEnhancer as any)({}); }).to.throw(Error);
    expect(() => { (createExecutorEnhancer as any)([]); }).to.throw(Error);
  });

  it('should create enhancer that creates store with ExecutableStore interface', () => {
    function createStore() {
      return {
        dispatch: dumbDispatch,
        subscribe: chai.spy(),
        getState: dumbGetState,
        replaceReducer: () => {}
      };
    }
    const createStoreSpy = chai.spy(createStore);
    const executorEnhancer = createExecutorEnhancer(dumbExecutor);

    expect(executorEnhancer).to.be.function;

    const createExecutableStore = executorEnhancer(createStoreSpy);

    expect(createStoreSpy).to.not.have.been.called;
    expect(createExecutableStore).to.be.function;

    const executableStore = createExecutableStore(dumbReducer, dumbState);

    expect(createStoreSpy).to.have.been.called.once;
    expect(executableStore).to.be.object;
    expect(executableStore.dispatch).to.be.function;
    expect(executableStore.subscribe).to.be.function;
    expect(executableStore.getState).to.be.function;
    expect(executableStore.replaceReducer).to.be.function;
    expect(executableStore.replaceExecutor).to.be.function;
    expect(executableStore.subscribe).to.not.have.been.called;
  });

  it('should create enhancer that creates store with valid replaceExecutor function', () => {
    function nextExecutor() {
      return Promise.resolve();
    }
    const dispatchSpy = chai.spy();

    function createStore() {
      return {
        dispatch: dispatchSpy,
        subscribe: chai.spy(),
        getState: dumbGetState,
        replaceReducer: chai.spy(),
        replaceExecutor: chai.spy()
      };
    }
    const nextExecutorSpy = chai.spy(nextExecutor);
    const executorEnhancer = createExecutorEnhancer(dumbExecutor);
    const createExecutableStore = executorEnhancer(createStore);
    const executableStore = createExecutableStore(dumbReducer, {});

    expect(() => { (executableStore.replaceExecutor as any)('invalid type'); }).to.throw(Error);

    expect(dispatchSpy).to.not.have.been.called;

    const commandResult = executableStore.dispatch({ type: 'DETECTOR_COMMAND()' });

    expect(dispatchSpy).to.not.have.been.called;
    expect(commandResult).to.exist;
    expect(commandResult.promise).to.exist;
    expect(commandResult.promise.then).to.be.function;

    executableStore.replaceExecutor(nextExecutorSpy);
    expect(dispatchSpy).to.not.have.been.called;
    expect(nextExecutorSpy).to.have.been.called.with(
      { type: EXECUTOR_INIT },
      executableStore.dispatch,
      executableStore.getState
    );

    const nextCommandResult = executableStore.dispatch({ type: 'NEXT_DETECTOR_COMMAND()' });
    expect(dispatchSpy).to.not.have.been.called;
    expect(nextCommandResult).to.exist;
    expect(nextCommandResult.promise).to.exist;
    expect(nextCommandResult.promise.then).to.be.function;

    expect(nextExecutorSpy).to.have.been.called.with(
      { type: 'NEXT_DETECTOR_COMMAND()' },
      executableStore.dispatch,
      executableStore.getState
    );
    expect(dispatchSpy).to.not.have.been.called;

    executableStore.dispatch({ type: 'NON_COMMAND' });

    expect(dispatchSpy).to.have.been.called;
  });
});
