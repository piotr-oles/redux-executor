
import { expect } from 'chai';
import { createExecutableStore } from '../src/index';

describe('createExecutableStore', () => {

  it('should export createExecutableStore function', () => {
    expect(createExecutableStore).to.be.function;
  });

  it('should create new redux store without enhancer', () => {
    function dumbReducer(state) {
      return state;
    }
    function dumbExecutor() {
    }
    const dumbState = {};
    const detectableStore = createExecutableStore(dumbReducer, dumbExecutor, dumbState);

    expect(detectableStore).to.be.object;
    expect(detectableStore.dispatch).to.be.function;
    expect(detectableStore.subscribe).to.be.function;
    expect(detectableStore.getState).to.be.function;
    expect(detectableStore.replaceReducer).to.be.function;
    expect(detectableStore.replaceExecutor).to.be.function;
  });

  it('should create new redux store with enhancer', () => {
    function dumbReducer(state) {
      return state;
    }
    function dumbExecutor() {
    }
    const dumbState = {};
    const dumbEnhancer = function(next) { return next; };
    const detectableStore = createExecutableStore(dumbReducer, dumbExecutor, dumbState, dumbEnhancer);

    expect(detectableStore).to.be.object;
    expect(detectableStore.dispatch).to.be.function;
    expect(detectableStore.subscribe).to.be.function;
    expect(detectableStore.getState).to.be.function;
    expect(detectableStore.replaceReducer).to.be.function;
    expect(detectableStore.replaceExecutor).to.be.function;
  });
});
