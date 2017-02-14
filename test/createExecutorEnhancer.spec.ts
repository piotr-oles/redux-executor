import * as chai from 'chai';
import * as spies from 'chai-spies';
import { assert, expect } from 'chai';
import { createExecutorEnhancer } from '../src/index';

chai.use(spies);

describe('createExecutorEnhancer', () => {

  it('should export createExecutorEnhancer function', () => {
    assert.isFunction(createExecutorEnhancer);
  });

  it('should throw an exception if executor is not a function', () => {
    assert.throws(() => { (createExecutorEnhancer as any)(undefined); }, Error);
    assert.throws(() => { (createExecutorEnhancer as any)(123); }, Error);
    assert.throws(() => { (createExecutorEnhancer as any)({}); }, Error);
    assert.throws(() => { (createExecutorEnhancer as any)([]); }, Error);
  });

  it('should create enhancer that creates store with ExecutableStore interface', () => {
    function dumbReducer(state) {
      return state;
    }
    function dumbExecutor() {
    }
    const dumbState = {};
    function createStore() {
      return {
        dispatch: () => {},
        subscribe: chai.spy(),
        getState: () => dumbState,
        replaceReducer: () => {}
      };
    }
    const createStoreSpy = chai.spy(createStore);
    const executorEnhancer = createExecutorEnhancer(dumbExecutor);

    assert.isFunction(executorEnhancer);

    const createExecutableStore = executorEnhancer(createStoreSpy);

    expect(createStoreSpy).to.not.have.been.called;
    assert.isFunction(createExecutableStore);

    const executableStore = createExecutableStore(dumbReducer, dumbState);

    expect(createStoreSpy).to.have.been.called.once;
    assert.isObject(executableStore);
    assert.isFunction(executableStore.dispatch);
    assert.isFunction(executableStore.subscribe);
    assert.isFunction(executableStore.getState);
    assert.isFunction(executableStore.replaceReducer);
    assert.isFunction(executableStore.replaceExecutor);
    expect(executableStore.subscribe).to.not.have.been.called;
  });

  it('should create enhancer that creates store with valid replaceExecutor function', () => {
    function dumbReducer(state) {
      return state;
    }
    function dumbExecutor() {
    }
    function nextExecutor() {
      return Promise.resolve();
    }
    const dispatchSpy = chai.spy();
    function createStore() {
      return {
        dispatch: dispatchSpy,
        subscribe: chai.spy(),
        getState: () => ({}),
        replaceReducer: chai.spy(),
        replaceExecutor: chai.spy()
      };
    }
    const nextExecutorSpy = chai.spy(nextExecutor);
    const executorEnhancer = createExecutorEnhancer(dumbExecutor);
    const createExecutableStore = executorEnhancer(createStore);
    const executableStore = createExecutableStore(dumbReducer, {});

    assert.throws(() => { (executableStore.replaceExecutor as any)('invalid type'); }, Error);

    expect(dispatchSpy).to.not.have.been.called;

    executableStore.replaceExecutor(nextExecutorSpy);
    expect(dispatchSpy).to.not.have.been.called;

    // run `detectActions` method
    executableStore.dispatch({ type: 'NEXT_DETECTOR_COMMAND', command: true });

    expect(nextExecutorSpy).to.have.been.called.once.with({}, { type: 'NEXT_DETECTOR_COMMAND', command: true }, executableStore.dispatch);
    expect(dispatchSpy).to.not.have.been.called;

    executableStore.dispatch({ type: 'NON_COMMAND' });

    expect(dispatchSpy).to.have.been.called;
  });
});
