
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as promised from 'chai-as-promised';
import { expect } from 'chai';
import { combineExecutors } from '../src/index';

chai.use(spies);
chai.use(promised);

describe('combineExecutors', () => {
  let executorResolved, executorRejected, executorVoid;
  let dumbDispatch, dumbGetState, getUndefinedState;

  beforeEach(() => {
    executorResolved = () => Promise.resolve();
    executorRejected = () => Promise.reject(new Error());
    executorVoid = () => undefined;

    dumbDispatch = () => undefined;
    dumbGetState = () => ({});
    getUndefinedState = () => undefined;
  });

  it('should export combineExecutors function', () => {
    expect(combineExecutors).to.be.function;
  });

  it('should return valid executor for combination of two executors', () => {
    const executorABC = combineExecutors({
      a: executorResolved,
      b: executorResolved,
      c: executorVoid
    });

    expect(executorABC).to.be.function;
    const promiseABC: Promise<void> = executorABC({ type: 'FOO()' }, dumbDispatch, dumbGetState) as Promise<void>;

    expect(promiseABC).to.exist;
    expect(promiseABC.then).to.be.function;
    expect(promiseABC.catch).to.be.function;

    expect(promiseABC).to.be.fulfilled;
    expect(promiseABC).to.become(undefined);
  });

  it('should return executor that rejects on children reject', () => {
    const executorABC = combineExecutors({
      a: executorResolved,
      b: executorRejected,
      c: executorVoid
    });

    expect(executorABC).to.be.function;
    const promise: Promise<void> = executorABC({ type: 'FOO()' }, dumbDispatch, dumbGetState) as Promise<void>;

    expect(promise).to.exist;
    expect(promise.then).to.be.function;
    expect(promise.catch).to.be.function;

    expect(promise).to.be.rejected;
  });

  it('should pass sub-state to sub-executors', () => {
    const getState = () => ({
      a: 'foo',
      b: 'bar'
    });
    const executorA = (command, dispatch, getState) => {
      expect(getState()).to.be.equals('foo');
    };
    const executorB = (command, dispatch, getState) => {
      expect(getState()).to.be.equals('bar');
    };

    const executorAB = combineExecutors({
      a: executorA,
      b: executorB
    });

    executorAB({ type: 'FOO()' }, dumbDispatch, getState);
  });

  it('should pass sub-state to sub-executors for undefined state', () => {
    function executorA(command, dispatch, getState) {
      expect(getState()).to.be.undefined;
    }
    function executorB(command, dispatch, getState) {
      expect(getState()).to.be.undefined;
    }

    const executorAB = combineExecutors({
      a: executorA,
      b: executorB
    });

    executorAB({ type: 'FOO()' }, dumbDispatch, getUndefinedState);
  });
});
