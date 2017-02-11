
import { assert } from 'chai';
import { createExecutableStore } from '../src/index';

describe('createExecutableStore', () => {

  it('should export createExecutableStore function', () => {
    assert.isFunction(createExecutableStore);
  });

  it('should create new redux store without enhancer', () => {
    function dumbReducer(state) {
      return state;
    }
    function dumbExecutor() {
    }
    const dumbState = {};
    const detectableStore = createExecutableStore(dumbReducer, dumbExecutor, dumbState);

    assert.isObject(detectableStore);
    assert.isFunction(detectableStore.dispatch);
    assert.isFunction(detectableStore.subscribe);
    assert.isFunction(detectableStore.getState);
    assert.isFunction(detectableStore.replaceReducer);
    assert.isFunction(detectableStore.replaceExecutor);
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

    assert.isObject(detectableStore);
    assert.isFunction(detectableStore.dispatch);
    assert.isFunction(detectableStore.subscribe);
    assert.isFunction(detectableStore.getState);
    assert.isFunction(detectableStore.replaceReducer);
    assert.isFunction(detectableStore.replaceExecutor);
  });
});
