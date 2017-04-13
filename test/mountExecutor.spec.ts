
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { expect } from 'chai';
import { mountExecutor } from '../src/index';

chai.use(spies);

describe('mountExecutor', () => {

  it('should export mountExecutor function', () => {
    expect(mountExecutor).to.be.function;
  });

  it('should mount executor using selector', () => {
    const getState = () => ({
      branchA: {
        subBranchB: {
          value: 1
        }
      }
    });
    const dumbDispatch = () => {};

    function executor(command, dispatch, getState) {
      if (getState() && getState().value === 1 && command && command.type === 'COMMAND_THROUGH_MOUNT()') {
        dispatch({type: 'SELECTORS_WORKED'});
      }
    }

    function selector(state) {
      return state.branchA.subBranchB;
    }

    const dumbDispatchSpy = chai.spy(dumbDispatch);
    const mountedExecutor = mountExecutor(selector, executor);

    expect(mountedExecutor).to.be.function;

    mountedExecutor(
      { type: 'COMMAND_THROUGH_MOUNT()' },
      dumbDispatchSpy,
      getState
    );

    expect(dumbDispatchSpy).to.have.been.called.once.with({type: 'SELECTORS_WORKED'});
  });

  it('should throw an exception for call with invalid argument', () => {
    expect(() => { (mountExecutor as any)(() => {}, undefined); }).to.throw(Error);
    expect(() => { (mountExecutor as any)(undefined, () => {}); }).to.throw(Error);
    expect(() => { (mountExecutor as any)({}, () => {}); }).to.throw(Error);
    expect(() => { (mountExecutor as any)('test', 'test'); }).to.throw(Error);
  });
});
