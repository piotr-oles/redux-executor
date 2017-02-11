
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { assert, expect } from 'chai';
import { mountExecutor } from '../src/index';

chai.use(spies);

describe('mountExecutor', () => {

  it('should export mountExecutor function', () => {
    assert.isFunction(mountExecutor);
  });

  it('should mount executor using selector', () => {
    const state = {
      branchA: {
        subBranchB: {
          value: 1
        }
      }
    };
    function dumbDispatch(action) {
    }
    function executor(state, command, dispatch) {
      if (state && state.value === 1 && command && command.type === 'COMMAND_THROUGH_MOUNT') {
        dispatch({type: 'SELECTORS_WORKED'});
      }
    }
    function selector(state) {
      return state.branchA.subBranchB;
    }

    const dumbDispatchSpy = chai.spy(dumbDispatch);
    const mountedExecutor = mountExecutor(selector, executor);

    assert.isFunction(mountedExecutor);

    mountedExecutor(
      state,
      { type: 'COMMAND_THROUGH_MOUNT', command: true },
      dumbDispatchSpy
    );

    expect(dumbDispatchSpy).to.have.been.called.once.with({type: 'SELECTORS_WORKED'});
  });
});
